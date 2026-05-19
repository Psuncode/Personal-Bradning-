import { describe, it, expect, vi } from 'vitest';
import { fromZonedTime } from 'date-fns-tz';
import {
  checkoutRequestSchema,
  validateBookingDate,
  validateBookingDateAgainstCalendar,
} from './booking';

const TIMEZONE = 'America/Denver';

// Build a Date that represents a Mountain-Time wall-clock instant.
function mtDate(
  year: number,
  month: number,
  day: number,
  hour = 10,
  minute = 0
): Date {
  return fromZonedTime(new Date(year, month - 1, day, hour, minute, 0), TIMEZONE);
}

describe('checkoutRequestSchema', () => {
  it('accepts a well-formed checkout body', () => {
    const result = checkoutRequestSchema.safeParse({
      packageId: 1,
      clientName: 'Jane Doe',
      clientEmail: 'jane@example.com',
      phone: '555-0100',
      notes: 'Window light preferred',
      eventDate: '2026-08-12T16:00:00.000Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.packageId).toBe(1);
      expect(result.data.clientEmail).toBe('jane@example.com');
      expect(result.data.eventDate).toBeInstanceOf(Date);
    }
  });

  it('rejects a non-integer packageId', () => {
    const result = checkoutRequestSchema.safeParse({
      packageId: 'one',
      clientName: 'Jane Doe',
      clientEmail: 'jane@example.com',
      eventDate: '2026-08-12T16:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing email', () => {
    const result = checkoutRequestSchema.safeParse({
      packageId: 1,
      clientName: 'Jane Doe',
      eventDate: '2026-08-12T16:00:00.000Z',
    });
    expect(result.success).toBe(false);
  });

  it('rejects an unparseable eventDate string', () => {
    const result = checkoutRequestSchema.safeParse({
      packageId: 1,
      clientName: 'Jane Doe',
      clientEmail: 'jane@example.com',
      eventDate: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('treats empty phone/notes as undefined', () => {
    const result = checkoutRequestSchema.safeParse({
      packageId: 1,
      clientName: 'Jane Doe',
      clientEmail: 'jane@example.com',
      phone: '',
      notes: '   ',
      eventDate: '2026-08-12T16:00:00.000Z',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeUndefined();
      expect(result.data.notes).toBeUndefined();
    }
  });
});

describe('validateBookingDate — CR-03 server-side gates', () => {
  // Anchor "now" to a Tuesday 9 AM Mountain so window math is deterministic.
  const now = mtDate(2026, 5, 19, 9, 0); // Tue 2026-05-19 09:00 MT

  it('accepts a valid weekday slot within window during business hours', () => {
    // Wednesday 2026-05-20 at 10:00 MT
    const date = mtDate(2026, 5, 20, 10, 0);
    const result = validateBookingDate(date, 1, { now });
    expect(result.ok).toBe(true);
  });

  it('rejects a past date', () => {
    // Yesterday 10:00 MT
    const date = mtDate(2026, 5, 18, 10, 0);
    const result = validateBookingDate(date, 1, { now });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/future/i);
  });

  it('rejects a Saturday (weekend) — closes the curl-Saturday bypass', () => {
    // Saturday 2026-05-23 at 15:00 MT (the 3 AM Saturday bypass mentioned in the review)
    const date = mtDate(2026, 5, 23, 15, 0);
    const result = validateBookingDate(date, 1, { now });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/weekend/i);
  });

  it('rejects a Sunday', () => {
    const date = mtDate(2026, 5, 24, 11, 0);
    const result = validateBookingDate(date, 1, { now });
    expect(result.ok).toBe(false);
  });

  it('rejects a date past the 90-day window — closes the year-2099 bypass', () => {
    // The malicious "2099-12-31" case from the review summary
    const date = new Date('2099-12-31T16:00:00.000Z');
    const result = validateBookingDate(date, 1, { now });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/90|days/i);
  });

  it('rejects a 3 AM Mountain Time slot (before business hours)', () => {
    // Wednesday 2026-05-20 at 03:00 MT — the literal scenario from the review
    const date = mtDate(2026, 5, 20, 3, 0);
    const result = validateBookingDate(date, 1, { now });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/business hours/i);
  });

  it('rejects a 6 PM slot (after business hours)', () => {
    const date = mtDate(2026, 5, 20, 18, 0);
    const result = validateBookingDate(date, 1, { now });
    expect(result.ok).toBe(false);
  });

  it('accepts a 4:30 PM slot (last valid half-hour)', () => {
    const date = mtDate(2026, 5, 20, 16, 30);
    const result = validateBookingDate(date, 1, { now });
    expect(result.ok).toBe(true);
  });

  it('rejects when the requested slot overlaps a CalDAV-busy event', () => {
    const date = mtDate(2026, 5, 20, 10, 0);
    const busyEvents = [
      {
        startTime: mtDate(2026, 5, 20, 9, 0),
        endTime: mtDate(2026, 5, 20, 17, 0), // all-day block
      },
    ];
    const result = validateBookingDate(date, 1, { now, busyEvents });
    expect(result.ok).toBe(false);
    if (!result.ok)
      expect(result.reason).toMatch(/booked|conflict/i);
  });

  it('passes when CalDAV is empty', () => {
    const date = mtDate(2026, 5, 20, 10, 0);
    const result = validateBookingDate(date, 1, { now, busyEvents: [] });
    expect(result.ok).toBe(true);
  });

  it('rejects an invalid Date object', () => {
    const result = validateBookingDate(new Date('not-a-date'), 1, { now });
    expect(result.ok).toBe(false);
  });
});

describe('validateBookingDateAgainstCalendar', () => {
  const now = mtDate(2026, 5, 19, 9, 0);

  it('uses the calendar fetcher to determine busy events', async () => {
    const date = mtDate(2026, 5, 20, 10, 0);
    const fetcher = vi.fn().mockResolvedValue([
      {
        startTime: mtDate(2026, 5, 20, 9, 0),
        endTime: mtDate(2026, 5, 20, 17, 0),
      },
    ]);
    const result = await validateBookingDateAgainstCalendar(date, 1, fetcher, { now });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);
  });

  it('falls back to passing validation if CalDAV throws (graceful degrade)', async () => {
    const date = mtDate(2026, 5, 20, 10, 0);
    const fetcher = vi.fn().mockRejectedValue(new Error('CalDAV timeout'));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const result = await validateBookingDateAgainstCalendar(date, 1, fetcher, { now });
    expect(result.ok).toBe(true);
    warnSpy.mockRestore();
  });

  it('still rejects an out-of-window date even if CalDAV is empty', async () => {
    const date = new Date('2099-12-31T16:00:00.000Z');
    const fetcher = vi.fn().mockResolvedValue([]);
    const result = await validateBookingDateAgainstCalendar(date, 1, fetcher, { now });
    expect(result.ok).toBe(false);
  });
});
