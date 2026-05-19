// src/lib/validation/booking.ts
//
// Server-side checkout request validation — closes the curl bypass flagged in
// .planning/phases/03-booking-and-payments/03-REVIEW.md CR-03.
//
// The client-side gating in PhotographyBookingForm + availabilityService can be
// bypassed by anyone POSTing JSON directly to /api/checkout. This module re-runs
// the same business rules server-side:
//   - eventDate is a real, future Date
//   - eventDate is on a weekday (Mon-Fri), Mountain Time
//   - eventDate is within BOOKING_WINDOW_DAYS (default 90) of now
//   - eventDate is within business hours (09:00 - 17:00 Mountain Time)
//   - eventDate is NOT on a CalDAV-busy day (caller passes busy events in)
//
// Date-validation is split into a pure synchronous core (`validateBookingDate`)
// and an async wrapper (`validateBookingDateAgainstCalendar`) so unit tests can
// run without touching the network. The checkout route uses the async wrapper.

import { z } from 'zod';
import { toZonedTime } from 'date-fns-tz';
import { differenceInCalendarDays, startOfDay, endOfDay } from 'date-fns';
import { getAvailableSlots, type BookedEvent } from '@/lib/availabilityService';
import { CONTROL_CHARS } from '@/lib/validation/common';

const TIMEZONE = 'America/Denver';

export const BOOKING_LIMITS = {
  // Window — must match the client-side calendar window. Bump together.
  bookingWindowDays: 90,
  // Business hours, Mountain Time. Mirror of availabilityService constants.
  workStartHour: 9,
  workEndHour: 17,
  // Field caps (echoing contact.ts conventions)
  name: 200,
  email: 320,
  phone: 50,
  notes: 5000,
} as const;

// Reject ASCII control characters — same signal as contact validation.
// Imported from @/lib/validation/common so booking + contact + future
// validators share one regex source of truth.

// ---------- Zod request schema ----------

// The checkout endpoint accepts these from the client. `eventDate` arrives as
// an ISO string — Zod parses + coerces to Date, but we still run the business
// rule checks below before doing anything irreversible (Stripe session create).
export const checkoutRequestSchema = z.object({
  packageId: z.number().int().positive({ message: 'packageId must be a positive integer' }),

  clientName: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(BOOKING_LIMITS.name, {
      message: `Name must be ${BOOKING_LIMITS.name} characters or fewer.`,
    })
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: 'Name is required.' }),

  clientEmail: z
    .email({ message: 'Please enter a valid email address.' })
    .max(BOOKING_LIMITS.email, {
      message: `Email must be ${BOOKING_LIMITS.email} characters or fewer.`,
    })
    .transform((v) => v.trim()),

  phone: z
    .string()
    .max(BOOKING_LIMITS.phone, {
      message: `Phone must be ${BOOKING_LIMITS.phone} characters or fewer.`,
    })
    .refine((v) => !CONTROL_CHARS.test(v), { message: 'Phone contains invalid characters.' })
    .transform((v) => v.trim())
    .transform((v) => (v.length === 0 ? undefined : v))
    .optional(),

  notes: z
    .string()
    .max(BOOKING_LIMITS.notes, {
      message: `Notes must be ${BOOKING_LIMITS.notes} characters or fewer.`,
    })
    .transform((v) => v.trim())
    .transform((v) => (v.length === 0 ? undefined : v))
    .optional(),

  // Accept ISO string OR Date; reject anything else. We DON'T validate the
  // business rules here — that's `validateBookingDate` because it's
  // intentionally synchronous + independently testable.
  eventDate: z
    .union([z.string(), z.date()])
    .transform((v, ctx) => {
      const d = v instanceof Date ? v : new Date(v);
      if (Number.isNaN(d.getTime())) {
        ctx.addIssue({
          code: 'custom',
          message: 'eventDate is not a valid date.',
        });
        return z.NEVER;
      }
      return d;
    }),
});

export type CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>;

// ---------- Pure synchronous date validator ----------

export type ValidationResult =
  | { ok: true }
  | { ok: false; reason: string };

export interface ValidateBookingDateOptions {
  /** "Now" — overrideable in tests so the 90-day window is deterministic. */
  now?: Date;
  /** CalDAV-busy events to compare against (already deduped by the caller). */
  busyEvents?: BookedEvent[];
  /** Override the booking-window cap in days. Defaults to 90. */
  windowDays?: number;
}

/**
 * Re-runs every client-side gate server-side. Caller MUST have already parsed
 * `date` into a Date (e.g. via `checkoutRequestSchema`).
 *
 * `packageId` is accepted for parity with the function signature requested in
 * the review (and to leave room for per-package duration / window rules in the
 * future) but is currently informational only.
 */
export function validateBookingDate(
  date: Date,
  packageId: number,
  options: ValidateBookingDateOptions = {}
): ValidationResult {
  void packageId; // currently unused — see docstring

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return { ok: false, reason: 'eventDate is not a valid date.' };
  }

  const now = options.now ?? new Date();
  const windowDays = options.windowDays ?? BOOKING_LIMITS.bookingWindowDays;

  // 1. Must be in the future. We allow same-day in case the time slot is later,
  //    so compare on the timestamp itself.
  if (date.getTime() <= now.getTime()) {
    return { ok: false, reason: 'eventDate must be in the future.' };
  }

  // 2. Must be within the booking window (compare in Mountain Time so a 12am UTC
  //    request on day 91 doesn't slip in around DST).
  const nowInMT = toZonedTime(now, TIMEZONE);
  const dateInMT = toZonedTime(date, TIMEZONE);
  const days = differenceInCalendarDays(dateInMT, nowInMT);
  if (days > windowDays) {
    return {
      ok: false,
      reason: `eventDate is more than ${windowDays} days from now.`,
    };
  }

  // 3. Must be a weekday in Mountain Time (Sun=0, Sat=6).
  const dow = dateInMT.getDay();
  if (dow === 0 || dow === 6) {
    return { ok: false, reason: 'Bookings are not available on weekends.' };
  }

  // 4. Must be within business hours, Mountain Time.
  const hour = dateInMT.getHours();
  const minute = dateInMT.getMinutes();
  const tooEarly = hour < BOOKING_LIMITS.workStartHour;
  const tooLate =
    hour > BOOKING_LIMITS.workEndHour ||
    (hour === BOOKING_LIMITS.workEndHour && minute > 0);
  if (tooEarly || tooLate) {
    return {
      ok: false,
      reason: `eventDate is outside business hours (${BOOKING_LIMITS.workStartHour}:00–${BOOKING_LIMITS.workEndHour}:00 Mountain).`,
    };
  }

  // 5. Must not collide with a CalDAV-busy slot, if events were supplied. We
  //    re-use availabilityService.getAvailableSlots — same logic the client and
  //    the server's busy-day pre-compute use, so they agree by construction.
  if (options.busyEvents && options.busyEvents.length > 0) {
    // Constrain events to the requested day so getAvailableSlots filters fast.
    const dayStart = startOfDay(dateInMT);
    const dayEnd = endOfDay(dateInMT);
    const sameDayEvents = options.busyEvents.filter((e) => {
      return e.endTime > dayStart && e.startTime < dayEnd;
    });
    const slots = getAvailableSlots(date, sameDayEvents);
    if (slots.length === 0) {
      return {
        ok: false,
        reason: 'eventDate is fully booked on the calendar.',
      };
    }

    // Check the specific requested slot — if the start time isn't in the list
    // of free slots, the request collides with an existing event.
    const requestedTs = date.getTime();
    const slotMatch = slots.some((s) => s.startTime.getTime() === requestedTs);
    if (!slotMatch) {
      return {
        ok: false,
        reason: 'eventDate conflicts with an existing event on the calendar.',
      };
    }
  }

  return { ok: true };
}

// ---------- Async wrapper that pulls busy events from CalDAV ----------

export interface FetchBusyEventsFn {
  (start: Date, end: Date): Promise<BookedEvent[]>;
}

/**
 * Calls `validateBookingDate` after fetching CalDAV events for the requested
 * day. Pulled out into its own helper so the route handler stays small and so
 * `validateBookingDate` itself remains synchronous + trivially unit-testable.
 *
 * Note: if `fetchBusyEvents` throws, we treat that as "calendar unavailable"
 * and run validation WITHOUT busy-day enforcement. We never want a CalDAV
 * outage to take down checkout — better to let a borderline booking through
 * and reconcile post-hoc than to lose the customer.
 */
export async function validateBookingDateAgainstCalendar(
  date: Date,
  packageId: number,
  fetchBusyEvents: FetchBusyEventsFn,
  options: Omit<ValidateBookingDateOptions, 'busyEvents'> = {}
): Promise<ValidationResult> {
  let busyEvents: BookedEvent[] = [];
  try {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    busyEvents = await fetchBusyEvents(dayStart, dayEnd);
  } catch (err) {
    // Best-effort — log and fall through to the rest of validation.
    console.warn(
      '[booking-validation] CalDAV fetch failed, skipping busy-day check:',
      err instanceof Error ? err.message : String(err)
    );
  }
  return validateBookingDate(date, packageId, { ...options, busyEvents });
}
