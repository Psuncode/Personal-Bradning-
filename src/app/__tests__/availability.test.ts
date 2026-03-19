import { describe, it, expect } from 'vitest';
import { getAvailableSlots } from '@/lib/availabilityService';
import { fromZonedTime } from 'date-fns-tz';

const TIMEZONE = 'America/Denver';

// Helper: create a UTC Date from Mountain Time local values
function mtDate(year: number, month: number, day: number, hour = 0, minute = 0): Date {
  return fromZonedTime(new Date(year, month - 1, day, hour, minute, 0), TIMEZONE);
}

// getAvailableSlots is a pure function — no mocks needed.
// The fix for BUG-01 lives in serverCalendar.ts (day bucketing), which feeds
// properly-bucketed events to getAvailableSlots.  These unit tests validate
// that getAvailableSlots correctly blocks slots given the right inputs.

describe('getAvailableSlots — BUG-01: all-day event blocking', () => {
  it('returns no slots when an all-day blocking event covers the entire day', () => {
    // Wednesday 2026-03-18 — a regular weekday in Mountain Time
    const date = mtDate(2026, 3, 18);
    const fullDayBlock = {
      startTime: mtDate(2026, 3, 18, 9, 0),  // 9 AM Mountain
      endTime: mtDate(2026, 3, 18, 17, 0),   // 5 PM Mountain
    };
    const slots = getAvailableSlots(date, [fullDayBlock]);
    expect(slots).toHaveLength(0);
  });

  it('correctly blocks slots when event times are in UTC but day is evaluated in Mountain Time', () => {
    // Friday 2026-03-20 in Mountain Time (MDT = UTC-6)
    const date = mtDate(2026, 3, 20);
    // An event from 9am to 5pm Mountain Time, expressed as UTC
    const eventInUTC = {
      startTime: new Date('2026-03-20T15:00:00Z'), // 9 AM MDT
      endTime: new Date('2026-03-20T23:00:00Z'),   // 5 PM MDT
    };
    const slots = getAvailableSlots(date, [eventInUTC]);
    expect(slots).toHaveLength(0);
  });

  it('returns slots for a day with no events', () => {
    // Wednesday 2026-03-18 — a regular weekday with no events
    const date = mtDate(2026, 3, 18);
    const slots = getAvailableSlots(date, []);
    // 9am-5pm = 8 hours = 16 half-hour slots
    expect(slots.length).toBe(16);
  });

  it('returns no slots on weekends regardless of events', () => {
    // Saturday 2026-03-21
    const saturday = mtDate(2026, 3, 21);
    const slots = getAvailableSlots(saturday, []);
    expect(slots).toHaveLength(0);

    // Sunday 2026-03-22
    const sunday = mtDate(2026, 3, 22);
    const sundaySlots = getAvailableSlots(sunday, []);
    expect(sundaySlots).toHaveLength(0);
  });
});
