---
phase: 03-booking-and-payments
plan: "01"
subsystem: booking-infrastructure
tags: [bug-fix, stripe, resend, calendar, timezone]
dependency_graph:
  requires: ["03-00"]
  provides: ["stripe-singleton", "slug-field", "bug-03-fix", "bug-01-fix"]
  affects: ["03-02", "03-03"]
tech_stack:
  added: ["stripe@^20.4.1", "resend@^6.9.4"]
  patterns: ["Mountain Time day bucketing with toZonedTime", "functional Set state updates"]
key_files:
  created:
    - src/lib/stripe.ts
  modified:
    - src/components/booking/BookingForm.tsx
    - src/lib/serverCalendar.ts
    - src/data/photography.ts
    - .env.local.example
    - src/app/__tests__/availability.test.ts
    - src/app/__tests__/booking-form.test.tsx
    - package.json
    - package-lock.json
decisions:
  - "Do not hardcode Stripe apiVersion — let SDK use bundled default"
  - "toZonedTime applied to both day boundary AND event times for correct Mountain Time comparison"
  - "Functional Set state update: setLoadedMonths(prev => new Set([...prev, monthKey]))"
metrics:
  duration: "~10 minutes"
  completed: "2026-03-19"
  tasks_completed: 2
  files_modified: 8
---

# Phase 03 Plan 01: Bug Fixes and Booking Infrastructure Summary

**One-liner:** Fixed React Set mutation (BUG-03) and CalDAV timezone bucketing (BUG-01), installed Stripe + Resend, created Stripe singleton, and added slug field to photography packages.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Fix BUG-03 (Set mutation) and BUG-01 (CalDAV timezone bucketing) | 29199de | BookingForm.tsx, serverCalendar.ts, availability.test.ts, booking-form.test.tsx |
| 2 | Install Stripe + Resend, create Stripe singleton, add slug to packages, document env vars | 8958bbf | stripe.ts (new), photography.ts, .env.local.example, package.json |

## What Was Built

### BUG-03 Fix — Immutable Set State Update (BookingForm.tsx)

The `loadedMonths` state was declared without a setter: `const [loadedMonths] = useState<Set<string>>(...)`, then directly mutated via `loadedMonths.add(monthKey)`. This is a React anti-pattern — direct mutation bypasses React's diffing and can cause stale render bugs in concurrent mode.

**Fix:** Added `setLoadedMonths` to the destructuring, changed mutation to functional update:
```typescript
setLoadedMonths(prev => new Set([...prev, monthKey]));
```

### BUG-01 Fix — Mountain Time Day Bucketing (serverCalendar.ts)

The `_fetchServerAvailability` day bucketing loop used `startOfDay(day)` and `endOfDay(day)` without timezone awareness. On Vercel (UTC server), all-day CalDAV events with UTC midnight boundaries (`2026-03-20T00:00:00Z` to `2026-03-21T00:00:00Z`) could be incorrectly assigned to the wrong Mountain Time day.

**Fix:** Import `toZonedTime` from `date-fns-tz` and convert both day boundaries and event times to Mountain Time before comparing:
```typescript
const TIMEZONE = 'America/Denver';
const dayInMT = toZonedTime(day, TIMEZONE);
const dayStartMT = startOfDay(dayInMT);
const dayEndMT = endOfDay(dayInMT);
const dayEvents = events.filter((e) => {
  const eventStartMT = toZonedTime(new Date(e.startTime), TIMEZONE);
  const eventEndMT = toZonedTime(new Date(e.endTime), TIMEZONE);
  return eventEndMT > dayStartMT && eventStartMT < dayEndMT;
});
```

### Stripe Singleton (src/lib/stripe.ts)

Simple singleton following the same pattern as session.ts:
```typescript
import Stripe from 'stripe';
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true });
```

No hardcoded `apiVersion` — SDK bundled default used.

### Package Slug Field (src/data/photography.ts)

Added `slug: string` to the `Package` interface and slug values to all 3 packages:
- `portrait-session`
- `event-coverage`
- `landscape-half-day`

### Environment Variables (.env.local.example)

Documented: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_PHOTOGRAPHY_URL`, `RESEND_API_KEY`.

## Tests

Converted `it.todo` stubs from Wave 0 to real passing tests:

**availability.test.ts (4 tests):**
- All-day event blocking coverage of workday slots
- UTC event times correctly block Mountain Time slots
- No events = 16 slots returned (9am-5pm, 30-min intervals)
- Weekends return zero slots

**booking-form.test.tsx (2 tests):**
- Navigating back to a previously-loaded month does not re-trigger fetchICloudEvents
- Component renders date selection step by default

All 6 tests pass.

## Deviations from Plan

None — plan executed exactly as written.

## Success Criteria Verification

- [x] BUG-03 fixed: `setLoadedMonths` appears twice in BookingForm.tsx, `loadedMonths.add` count is 0
- [x] BUG-01 fixed: `toZonedTime` appears 4 times in serverCalendar.ts, `TIMEZONE = 'America/Denver'` defined
- [x] Stripe and Resend packages installed (`stripe@^20.4.1`, `resend@^6.9.4`)
- [x] Stripe singleton at `src/lib/stripe.ts` exports `stripe`
- [x] `Package` interface has `slug: string`, all 3 packages have slug values
- [x] `.env.local.example` documents all 4 required env vars
- [x] `npm run build` exits 0
- [x] All tests pass (6/6)

## Self-Check: PASSED

All created files verified present. Both task commits (29199de, 8958bbf) verified in git log.
