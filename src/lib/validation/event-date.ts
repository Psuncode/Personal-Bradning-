// src/lib/validation/event-date.ts
//
// Single source of truth for event-date normalization. Closes drizzle review
// finding HI-02 (timezone / millisecond-precision fragile equality).
//
// The bookings table has UNIQUE(package_id, event_date) and the double-booking
// precheck both rely on *exact* equality of the stored value. Without
// normalization, two equivalent inputs ("Aug 15 at any time" vs "Aug 15 noon")
// would compare unequal, the unique index wouldn't catch them, and the
// precheck would silently let a duplicate through.
//
// Day-precision normalization at every boundary (input parse, DB write,
// equality check) makes that bullet-proof: any reference to a calendar day
// collapses to that day's 00:00:00.000Z, regardless of submitted timezone or
// time-of-day.
//
// Native Date only — no date-fns import for one operation.

/**
 * Normalize an input date to UTC midnight of its calendar day in UTC.
 *
 * Accepts a `Date` or any ISO-8601 string parseable by the `Date` constructor.
 * Returns a fresh `Date` at 00:00:00.000Z on the same UTC calendar day as the
 * input. Idempotent — feeding the output back in returns an equal Date.
 *
 * Throws `TypeError` if the input cannot be parsed.
 *
 * Examples:
 *   normalizeEventDate('2026-08-15T15:30:00Z')         → 2026-08-15T00:00:00Z
 *   normalizeEventDate('2026-08-15T22:00:00-08:00')    → 2026-08-16T00:00:00Z
 *     (the input is Aug 16 06:00 UTC, so the UTC calendar day is Aug 16)
 *   normalizeEventDate(new Date('2026-08-15T12:00Z'))  → 2026-08-15T00:00:00Z
 */
export function normalizeEventDate(input: Date | string): Date {
  let parsed: Date;

  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) {
      throw new TypeError('normalizeEventDate received an invalid Date.');
    }
    parsed = input;
  } else if (typeof input === 'string') {
    parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
      throw new TypeError(
        `normalizeEventDate could not parse string: ${JSON.stringify(input)}`
      );
    }
  } else {
    throw new TypeError(
      'normalizeEventDate expects a Date or ISO string.'
    );
  }

  // Pull the UTC calendar day off the parsed instant and reconstruct a new
  // Date at exactly that day's UTC midnight. `Date.UTC(...)` returns ms since
  // epoch interpreted as UTC, which is what we want.
  const year = parsed.getUTCFullYear();
  const month = parsed.getUTCMonth();
  const day = parsed.getUTCDate();
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}
