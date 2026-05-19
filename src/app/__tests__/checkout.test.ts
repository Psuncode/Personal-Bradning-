import { describe, it, vi, expect, beforeEach } from 'vitest';

// Hoisted mocks so vi.mock factories see them.
const { mockSelect, mockInsert, mockDelete, mockUpdate, mockStripeCreate } = vi.hoisted(
  () => ({
    mockSelect: vi.fn(),
    mockInsert: vi.fn(),
    mockDelete: vi.fn(),
    mockUpdate: vi.fn(),
    mockStripeCreate: vi.fn(),
  })
);

vi.mock('@/lib/stripe', () => ({
  stripe: {
    checkout: {
      sessions: {
        create: mockStripeCreate,
      },
    },
  },
}));

vi.mock('@/db', () => ({
  db: {
    select: () => mockSelect(),
    insert: (table: unknown) => mockInsert(table),
    delete: (table: unknown) => mockDelete(table),
    update: (table: unknown) => mockUpdate(table),
  },
}));

vi.mock('drizzle-orm', () => ({
  and: (...args: unknown[]) => ({ op: 'and', args }),
  eq: (col: unknown, val: unknown) => ({ col, val, op: 'eq' }),
  gt: (col: unknown, val: unknown) => ({ col, val, op: 'gt' }),
  lt: (col: unknown, val: unknown) => ({ col, val, op: 'lt' }),
}));

vi.mock('@/data/photography', () => ({
  photographyPackages: [
    {
      id: 1,
      slug: 'portrait-session',
      name: 'Portrait Session',
      description: 'desc',
      priceInCents: 25000,
      depositInCents: 7500,
      durationMinutes: 60,
      category: 'portrait',
    },
  ],
}));

vi.mock('@/lib/serverCalendar', () => ({
  fetchCalendarEventsForRange: vi.fn().mockResolvedValue([]),
}));

vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

function makeRequest(payload: unknown): Request {
  return {
    json: async () => payload,
  } as unknown as Request;
}

// A near-future Wednesday at 10 AM Mountain (=> 16:00Z in MDT, but we use a
// month that is comfortably weekday + within 90 days of the harness date).
function futureWeekdayISO(): string {
  // Wed 2026-06-10 16:00Z = 10:00 MDT
  return '2026-06-10T16:00:00.000Z';
}

describe('checkout route — CR-02 + CR-03 double-booking + date validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no existing booking, no live pending reservation.
    mockSelect.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
      }),
    });
    // Default insert: returns reservation row.
    mockInsert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 11 }]),
      }),
    });
    mockDelete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    });
    mockUpdate.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    });
    mockStripeCreate.mockResolvedValue({ id: 'cs_test_123', url: 'https://stripe/test' });
    // Make Date.now() deterministic so the 90-day window is stable.
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-19T15:00:00.000Z'));
  });

  it('returns 400 on a malformed body (CR-03)', async () => {
    const { POST } = await import('@/app/(main)/api/checkout/route');
    const res = await POST(makeRequest({ packageId: 'bad' }));
    expect(res.status).toBe(400);
  });

  it('returns 400 when eventDate is a Saturday at 3 AM (CR-03 curl bypass)', async () => {
    const { POST } = await import('@/app/(main)/api/checkout/route');
    const res = await POST(
      makeRequest({
        packageId: 1,
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
        // Saturday 2026-05-23 at 03:00Z = Friday 21:00 MDT — but well outside business hours
        eventDate: '2026-05-23T09:00:00.000Z', // Sat 03:00 MDT
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns 400 when eventDate is in 2099 (CR-03 year-bypass)', async () => {
    const { POST } = await import('@/app/(main)/api/checkout/route');
    const res = await POST(
      makeRequest({
        packageId: 1,
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
        eventDate: '2099-12-31T16:00:00.000Z',
      })
    );
    expect(res.status).toBe(400);
  });

  it('returns 409 when a confirmed booking already exists for the slot (CR-02)', async () => {
    // First .select() call returns an existing booking row.
    mockSelect.mockReturnValueOnce({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 42 }]),
        }),
      }),
    });

    const { POST } = await import('@/app/(main)/api/checkout/route');
    const res = await POST(
      makeRequest({
        packageId: 1,
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
        eventDate: futureWeekdayISO(),
      })
    );
    expect(res.status).toBe(409);
    expect(mockStripeCreate).not.toHaveBeenCalled();
  });

  it('returns 409 when a live pending reservation exists for the slot (CR-02)', async () => {
    // First select (bookings) -> empty.
    // Second select (pending_reservations) -> one row.
    mockSelect
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      })
      .mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([{ id: 99 }]),
          }),
        }),
      });

    const { POST } = await import('@/app/(main)/api/checkout/route');
    const res = await POST(
      makeRequest({
        packageId: 1,
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
        eventDate: futureWeekdayISO(),
      })
    );
    expect(res.status).toBe(409);
    expect(mockStripeCreate).not.toHaveBeenCalled();
  });

  it('creates a pending reservation and Stripe session on the happy path', async () => {
    const { POST } = await import('@/app/(main)/api/checkout/route');
    const res = await POST(
      makeRequest({
        packageId: 1,
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
        eventDate: futureWeekdayISO(),
      })
    );
    expect(res.status).toBe(200);
    expect(mockInsert).toHaveBeenCalled();
    expect(mockStripeCreate).toHaveBeenCalledTimes(1);
  });

  it('translates a Postgres unique-violation on insert into 409 (CR-02 race-loser)', async () => {
    // The unique-violation surface in @neondatabase: shape with code '23505'.
    mockInsert.mockReturnValueOnce({
      values: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockRejectedValue(
            Object.assign(new Error('duplicate key value violates unique constraint'), {
              code: '23505',
            })
          ),
      }),
    });

    const { POST } = await import('@/app/(main)/api/checkout/route');
    const res = await POST(
      makeRequest({
        packageId: 1,
        clientName: 'Jane Doe',
        clientEmail: 'jane@example.com',
        eventDate: futureWeekdayISO(),
      })
    );
    expect(res.status).toBe(409);
    expect(mockStripeCreate).not.toHaveBeenCalled();
  });
});
