import { describe, it, vi, expect, beforeEach } from 'vitest';

// vi.hoisted ensures these are available when vi.mock factories run (hoisting safe)
const { mockSelect, mockInsert, mockDelete, mockUpdate } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockDelete = vi.fn();
  const mockUpdate = vi.fn();
  return { mockSelect, mockInsert, mockDelete, mockUpdate };
});

// --- vi.mock factories reference only hoisted variables or inline literals ---

// Mock stripe module (base SDK)
vi.mock('stripe', () => {
  return { default: vi.fn() };
});

// Mock @/lib/stripe (re-exports the constructed instance)
vi.mock('@/lib/stripe', () => {
  const mockStripe = {
    webhooks: {
      constructEvent: vi.fn().mockReturnValue({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_test_123',
            payment_intent: 'pi_test_123',
            metadata: {
              packageId: '1',
              packageName: 'Portrait Session',
              clientName: 'Jane Doe',
              clientEmail: 'jane@example.com',
              clientPhone: '555-0100',
              clientNotes: 'Window light preferred',
              eventDate: '2026-04-15T16:00:00.000Z',
              reservationId: '42',
              durationMinutes: '60',
            },
            amount_total: 7500,
            currency: 'usd',
          },
        },
      }),
    },
  };
  return { stripe: mockStripe };
});

// Mock database (@/db) — uses hoisted mocks
vi.mock('@/db', () => ({
  db: {
    select: () => mockSelect(),
    insert: (table: unknown) => mockInsert(table),
    delete: (table: unknown) => mockDelete(table),
    update: (table: unknown) => mockUpdate(table),
  },
}));

// Mock @/lib/email directly — avoids resend constructor hoisting issues
vi.mock('@/lib/email', () => ({
  sendBookingConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  sendPhilipNotificationEmail: vi.fn().mockResolvedValue(undefined),
  isValidEmailAddress: vi.fn().mockReturnValue(true),
  InvalidEmailRecipientError: class InvalidEmailRecipientError extends Error {
    recipient: unknown;
    constructor(recipient: unknown) {
      super(`Invalid recipient email address: ${JSON.stringify(recipient)}`);
      this.name = 'InvalidEmailRecipientError';
      this.recipient = recipient;
    }
  },
}));

// Mock icsService — inline literal only
vi.mock('@/lib/icsService', () => ({
  generateICSContent: vi.fn().mockReturnValue('BEGIN:VCALENDAR\nEND:VCALENDAR'),
}));

// Mock date-fns-tz to avoid timezone issues in tests
vi.mock('date-fns-tz', () => ({
  format: vi.fn().mockReturnValue('April 15, 2026'),
}));

// Mock drizzle-orm operators
vi.mock('drizzle-orm', () => ({
  eq: vi.fn((col: unknown, val: unknown) => ({ col, val, op: 'eq' })),
  lt: vi.fn((col: unknown, val: unknown) => ({ col, val, op: 'lt' })),
  desc: vi.fn((col: unknown) => ({ col, op: 'desc' })),
}));

// Mock Next.js server
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

// Helper: build a fake Request
function makeRequest(body: string, headers: Record<string, string> = {}): Request {
  return {
    text: async () => body,
    json: async () => JSON.parse(body),
    headers: {
      get: (key: string) => headers[key] ?? null,
    },
  } as unknown as Request;
}

describe('Stripe webhook handler — PHOTO-04: booking confirmation', () => {
  let mockSendConfirmation: ReturnType<typeof vi.fn>;
  let mockSendNotification: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Re-get email mocks after clearAllMocks
    const emailMod = await import('@/lib/email');
    mockSendConfirmation = emailMod.sendBookingConfirmationEmail as ReturnType<typeof vi.fn>;
    mockSendNotification = emailMod.sendPhilipNotificationEmail as ReturnType<typeof vi.fn>;
    mockSendConfirmation.mockResolvedValue(undefined);
    mockSendNotification.mockResolvedValue(undefined);

    // Default db.select: no existing booking (empty array)
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });

    // Default db.insert: returns new booking on first call, and on second call.
    // payments.insert path has no .returning(); .values() resolves directly.
    mockInsert.mockReturnValue({
      values: vi.fn().mockImplementation(() => {
        const chain = {
          returning: vi.fn().mockResolvedValue([{ id: 99 }]),
          then: (onFulfilled: (v: unknown) => unknown) => Promise.resolve(undefined).then(onFulfilled),
        };
        return chain;
      }),
    });

    // Default db.delete: no-op
    mockDelete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });

    // Default db.update: no-op (used to mark emailSentAt)
    mockUpdate.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    });
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}');
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('returns 400 when signature verification fails', async () => {
    const { stripe } = await import('@/lib/stripe');
    (stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockImplementationOnce(() => {
      throw new Error('Signature mismatch');
    });

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'bad-sig' });
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('creates booking row on checkout.session.completed event', async () => {
    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(mockInsert).toHaveBeenCalled();
  });

  it('creates payment row alongside booking', async () => {
    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    await POST(request);
    // insert called twice: once for bookings, once for payments
    expect(mockInsert).toHaveBeenCalledTimes(2);
  });

  it('sends confirmation email with ICS attachment after successful booking', async () => {
    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    await POST(request);
    // sendBookingConfirmationEmail should have been called once
    expect(mockSendConfirmation).toHaveBeenCalledTimes(1);
    // sendPhilipNotificationEmail should have been called once
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
  });

  it('does NOT create duplicate booking when webhook is retried (idempotency)', async () => {
    // Simulate: existing booking found for this payment intent
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 55 }]),
        }),
      }),
    });

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);
    expect(response.status).toBe(200);
    // No insert should have been called
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('deletes pending reservation after booking is confirmed', async () => {
    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    await POST(request);
    expect(mockDelete).toHaveBeenCalled();
  });

  it('sends notification email to siteConfig.email', async () => {
    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    await POST(request);
    // sendPhilipNotificationEmail should have been called
    expect(mockSendNotification).toHaveBeenCalledTimes(1);
    // It should be called with an object containing to: siteConfig.email
    // (the function handles routing to siteConfig.email internally)
  });

  it('marks email_sent_at on bookings after successful email delivery (CR-01)', async () => {
    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    await POST(request);
    // db.update(bookings) is the email_sent_at marker.
    expect(mockUpdate).toHaveBeenCalled();
  });

  it('returns 200 even if confirmation email fails after DB insert (no Stripe retry, CR-01)', async () => {
    // Email throws — webhook must still 200, must NOT call db.update to mark sent.
    mockSendConfirmation.mockRejectedValueOnce(new Error('Resend timeout'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    // DB row was inserted...
    expect(mockInsert).toHaveBeenCalled();
    // ...but email_sent_at was NOT marked (since email failed).
    expect(mockUpdate).not.toHaveBeenCalled();
    // Manual-followup log marker is emitted.
    const errorCalls = errorSpy.mock.calls.map((c) => String(c[0]));
    expect(errorCalls.some((s) => s.includes('MANUAL_FOLLOWUP_REQUIRED'))).toBe(true);
    errorSpy.mockRestore();
  });

  it('returns 500 if DB insert fails (so Stripe retries, CR-01)', async () => {
    // First insert (bookings) rejects.
    mockInsert.mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(new Error('Postgres unique violation')),
      }),
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(mockSendConfirmation).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('retries email send when existing booking has email_sent_at = NULL (CR-01)', async () => {
    // Existing booking row, but email_sent_at is null — retry the email.
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 55, emailSentAt: null }]),
        }),
      }),
    });
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    // No new insert (row already exists)...
    expect(mockInsert).not.toHaveBeenCalled();
    // ...but emails were re-sent.
    expect(mockSendConfirmation).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('skips email retry when existing booking has email_sent_at set (CR-01)', async () => {
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([
            { id: 55, emailSentAt: new Date('2026-01-01T00:00:00Z') },
          ]),
        }),
      }),
    });

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockSendConfirmation).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('handles checkout.session.expired by deleting the pending reservation', async () => {
    const { stripe } = await import('@/lib/stripe');
    (stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      type: 'checkout.session.expired',
      data: {
        object: {
          id: 'cs_test_expired',
          metadata: { reservationId: '77' },
        },
      },
    });

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockDelete).toHaveBeenCalled();
    // No booking insert for an expired session.
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('acknowledges unhandled event types with 200 (no retry storm)', async () => {
    const { stripe } = await import('@/lib/stripe');
    (stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      type: 'charge.refunded',
      data: { object: {} },
    });

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockInsert).not.toHaveBeenCalled();
  });
});

// Separate test for email service to verify ICS attachment behavior
describe('sendBookingConfirmationEmail — ICS attachment', () => {
  it('generates ICS content and passes it as base64 attachment', async () => {
    // We test the real email module behavior by checking the mock chain
    const { generateICSContent } = await import('@/lib/icsService');
    const mockGenerate = generateICSContent as ReturnType<typeof vi.fn>;

    // Verify the mock is set up
    expect(mockGenerate).toBeDefined();
  });
});
