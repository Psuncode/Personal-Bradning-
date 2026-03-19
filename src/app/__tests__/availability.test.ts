import { describe, it } from 'vitest';
import { getAvailableSlots } from '@/lib/availabilityService';

// getAvailableSlots is a pure function — no mocks needed.
// The fix for BUG-01 lives in serverCalendar.ts (day bucketing), which feeds
// properly-bucketed events to getAvailableSlots.  These unit tests validate
// that getAvailableSlots correctly blocks slots given the right inputs.

void getAvailableSlots; // keep import from being tree-shaken before Wave 1

describe('getAvailableSlots — BUG-01: all-day event blocking', () => {
  it.todo('returns no slots when an all-day blocking event covers the entire day');
  it.todo(
    'correctly blocks slots when event times are in UTC but day is evaluated in Mountain Time'
  );
  it.todo('returns slots for a day with no events');
  it.todo('returns no slots on weekends regardless of events');
});
