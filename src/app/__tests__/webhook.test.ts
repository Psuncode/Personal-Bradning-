import { describe, it, vi } from 'vitest';

// Mock stripe module
vi.mock('stripe', () => {
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
              clientName: 'Jane Doe',
              clientEmail: 'jane@example.com',
              clientPhone: '555-0100',
              eventDate: '2026-04-15T16:00:00.000Z',
            },
            amount_total: 7500,
          },
        },
      }),
    },
  };
  return { default: vi.fn(() => mockStripe) };
});

// Mock database (@/db)
vi.mock('@/db', () => ({
  db: {
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

// Mock resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'email_test_123' }),
    },
  })),
}));

// Mock icsService
vi.mock('@/lib/icsService', () => ({
  generateICSContent: vi.fn().mockReturnValue('BEGIN:VCALENDAR\nEND:VCALENDAR'),
}));

// The route handler does not exist yet — will be built in Plan 03-04.
// Import it here so missing-module errors surface during Wave 1 GREEN phase.
// import { POST } from '@/app/api/webhooks/stripe/route';

describe('Stripe webhook handler — PHOTO-04: booking confirmation', () => {
  it.todo('returns 400 when stripe-signature header is missing');
  it.todo('returns 400 when signature verification fails');
  it.todo('creates booking row on checkout.session.completed event');
  it.todo('creates payment row alongside booking');
  it.todo(
    'sends confirmation email with ICS attachment after successful booking'
  );
  it.todo(
    'does NOT create duplicate booking when webhook is retried (idempotency)'
  );
  it.todo('deletes pending reservation after booking is confirmed');
  it.todo('sends notification email to siteConfig.email');
});
