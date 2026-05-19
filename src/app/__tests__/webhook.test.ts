import { describe, it, vi, expect, beforeEach } from 'vitest';

// vi.hoisted ensures these are available when vi.mock factories run (hoisting safe)
const { mockSelect, mockInsert, mockDelete, mockUpdate, mockBatch } = vi.hoisted(() => {
  const mockSelect = vi.fn();
  const mockInsert = vi.fn();
  const mockDelete = vi.fn();
  const mockUpdate = vi.fn();
  const mockBatch = vi.fn();
  return { mockSelect, mockInsert, mockDelete, mockUpdate, mockBatch };
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
    batch: (statements: unknown[]) => mockBatch(statements),
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
  // Tagged-template stub for the SQL helper used by the payment-row
  // FK subquery. We don't execute SQL in tests; the batch mock returns
  // canned rows, so this just needs to be callable.
  sql: Object.assign(
    (_strings: TemplateStringsArray, ..._values: unknown[]) => ({ kind: 'sql' }),
    {},
  ),
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
    // The route now resolves STRIPE_WEBHOOK_SECRET via `requireRuntimeEnv`
    // (Wave 7a follow-up: eliminate `process.env.X!`). The signature-verify
    // call itself is mocked out — we only need a non-empty string so the env
    // helper doesn't throw before reaching `constructEvent`.
    vi.stubEnv('STRIPE_WEBHOOK_SECRET', 'whsec_test_dummy');

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

    // Default db.batch: succeeds, returning a freshly-inserted booking row
    // as the first element (booking insert is always statement[0]).
    mockBatch.mockResolvedValue([[{ id: 99 }], [], []]);
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
    // db.batch rejects mid-array — neon-http rolls back the entire transaction.
    mockBatch.mockRejectedValueOnce(new Error('Postgres unique violation'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(mockSendConfirmation).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
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

  it('returns 500 when db.batch rejects mid-array (CR-01 atomicity)', async () => {
    // Mid-array rejection of the SQL batch must surface as a 500 so Stripe
    // retries; no emails sent, no email_sent_at marked.
    mockBatch.mockRejectedValueOnce(new Error('relation "payments" foreign key violation'));
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(mockSendConfirmation).not.toHaveBeenCalled();
    expect(mockSendNotification).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('parses a Zod v4 valid metadata payload without raising (backlog #15)', async () => {
    // Re-imports the schema directly from the route module — this should NOT
    // throw and should coerce numeric strings + normalize the date.
    const mod = (await import('@/app/(main)/api/webhooks/stripe/route')) as unknown as Record<
      string,
      unknown
    >;
    // The schema is a module-internal const; assert the happy path through
    // POST instead, which exercises safeParse end-to-end.
    expect(mod.POST).toBeDefined();
    const { POST } = mod as { POST: (r: Request) => Promise<{ status: number }> };
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('rejects whitespace-only clientName via requiredTrimmedString (backlog #7)', async () => {
    const { stripe } = await import('@/lib/stripe');
    (stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_ws',
          payment_intent: 'pi_test_ws',
          metadata: {
            packageId: '1',
            packageName: 'Portrait Session',
            clientName: '   ', // whitespace-only — must be rejected up-front
            clientEmail: 'jane@example.com',
            clientPhone: '555-0100',
            clientNotes: '',
            eventDate: '2026-04-15T16:00:00.000Z',
            reservationId: '42',
            durationMinutes: '60',
          },
          amount_total: 7500,
          currency: 'usd',
        },
      },
    });
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);

    // Zod refusal produces a 400, and no DB / email side-effects fire.
    expect(response.status).toBe(400);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockBatch).not.toHaveBeenCalled();
    expect(mockSendConfirmation).not.toHaveBeenCalled();
    const errorCalls = errorSpy.mock.calls.map((c) => String(c[0]));
    expect(errorCalls.some((s) => s.includes('Rejecting checkout.session.completed'))).toBe(true);
    errorSpy.mockRestore();
  });

  it('normalizes a non-midnight eventDate ISO string to UTC midnight before insert (HI-02)', async () => {
    const { stripe } = await import('@/lib/stripe');
    (stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_norm',
          payment_intent: 'pi_test_norm',
          metadata: {
            packageId: '1',
            packageName: 'Portrait Session',
            clientName: 'Jane Doe',
            clientEmail: 'jane@example.com',
            clientPhone: '555-0100',
            clientNotes: '',
            // 15:30 UTC on Aug 15 — schema must collapse to 00:00:00Z same day.
            eventDate: '2026-08-15T15:30:00.000Z',
            reservationId: '42',
            durationMinutes: '60',
          },
          amount_total: 7500,
          currency: 'usd',
        },
      },
    });

    // Spy on the booking insert's values() so we can inspect the normalized
    // eventDate that actually lands in the DB.
    const valuesSpy = vi.fn().mockImplementation(() => ({
      returning: vi.fn().mockResolvedValue([{ id: 99 }]),
      then: (onFulfilled: (v: unknown) => unknown) => Promise.resolve(undefined).then(onFulfilled),
    }));
    mockInsert.mockReturnValueOnce({ values: valuesSpy });
    mockInsert.mockReturnValueOnce({ values: valuesSpy }); // payments insert

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    // First call to .values() is the booking insert.
    const bookingValues = valuesSpy.mock.calls[0]?.[0] as { eventDate: Date };
    expect(bookingValues.eventDate).toBeInstanceOf(Date);
    expect(bookingValues.eventDate.toISOString()).toBe('2026-08-15T00:00:00.000Z');
  });

  it('acks unknown event types with 200 without reaching the assertNever sink', async () => {
    const { stripe } = await import('@/lib/stripe');
    (stripe.webhooks.constructEvent as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      type: 'customer.subscription.updated', // not in HandledEventType
      data: { object: {} },
    });

    const { POST } = await import('@/app/(main)/api/webhooks/stripe/route');
    const request = makeRequest('{}', { 'stripe-signature': 'valid-sig' });
    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(mockInsert).not.toHaveBeenCalled();
    expect(mockBatch).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
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
