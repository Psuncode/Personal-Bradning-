---
phase: 03-booking-and-payments
plan: 02
subsystem: ui
tags: [react, nextjs, booking-wizard, tailwind, vitest, shadcn]

# Dependency graph
requires:
  - phase: 03-00
    provides: photography layout, data types, serverCalendar service
provides:
  - PhotographyBookingForm 4-step wizard (package → date → time → details → Proceed to Payment)
  - /photography/book Server Component page with SSR availability pre-loading
  - Book Now links on /photography/pricing with ?pkg={slug} URL params
  - Package.slug field in photography data
affects: [03-03-checkout, any phase consuming photographyPackages or booking form]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server Component page pre-loads calendar availability via getServerAvailability(), passes as initialData to client form
    - useSearchParams() requires Suspense boundary wrapper in Next.js App Router page
    - BUG-03 loadedMonths fix: setLoadedMonths((prev) => new Set([...prev, key])) functional update instead of mutation
    - Multi-step wizard: step state (1|2|3|4), each step conditionally rendered, step indicator with aria-current

key-files:
  created:
    - src/components/booking/PhotographyBookingForm.tsx
    - src/app/(photography)/photography/book/page.tsx
  modified:
    - src/app/(photography)/photography/pricing/page.tsx
    - src/data/photography.ts
    - src/app/__tests__/booking.test.tsx

key-decisions:
  - "Booking page wraps PhotographyBookingForm in <Suspense> — required by Next.js App Router when client component uses useSearchParams()"
  - "Package.slug field added to photography.ts data (Plan 03-01 dependency was missing; auto-fixed as Rule 3 blocker)"
  - "Step 2 auto-advances to step 3 on date click (no explicit Continue button) — matches UX spec and BookingForm.tsx pattern"

patterns-established:
  - "Server page + client form split: async page fetches data, wraps client component in Suspense"
  - "TDD: it.todo stubs converted to real passing tests once implementation is complete"

requirements-completed: [PHOTO-03]

# Metrics
duration: 8min
completed: 2026-03-19
---

# Phase 3 Plan 02: Photography Booking Wizard Summary

**4-step PhotographyBookingForm wizard (package, date, time, details) with /photography/book page and Book Now pricing card links using SSR availability pre-loading**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-19T20:11:55Z
- **Completed:** 2026-03-19T20:19:41Z
- **Tasks:** 2
- **Files modified:** 5 (2 created, 3 modified)

## Accomplishments
- Built PhotographyBookingForm with full 4-step wizard: package selection cards, calendar, time slots, client details + Proceed to Payment
- Created /photography/book Server Component page with SSR calendar availability and Suspense boundary
- Added Book Now links to all 3 pricing cards with `?pkg={slug}` URL params pointing to booking form
- Converted 7 PHOTO-03 `it.todo` test stubs to real passing Vitest tests
- Added `slug` field to Package type and photographyPackages data

## Task Commits

Each task was committed atomically:

1. **Task 1: Build PhotographyBookingForm component** - `2f74fe5` (feat + test)
2. **Task 2: Create booking page and add Book Now buttons** - `fadd758` (feat)

## Files Created/Modified
- `src/components/booking/PhotographyBookingForm.tsx` — 4-step booking wizard (336 lines), new component
- `src/app/(photography)/photography/book/page.tsx` — Server Component page, SSR availability, Suspense wrapper
- `src/app/(photography)/photography/pricing/page.tsx` — Added Book Now Link buttons with /photography/book?pkg={slug}
- `src/data/photography.ts` — Added slug field to Package interface and all 3 package entries
- `src/app/__tests__/booking.test.tsx` — Converted 7 it.todo stubs to real passing tests

## Decisions Made
- Used `<Suspense>` wrapper in booking page around `PhotographyBookingForm` — Next.js App Router requires this when a client component calls `useSearchParams()` to prevent prerender bailout
- Added `slug` field inline (not a separate plan) — it was a stated dependency from Plan 03-01 that was missing from the data file; treating as Rule 3 blocking auto-fix
- Step 2 (date) auto-advances to step 3 on date click, matching BookingForm.tsx pattern and UI-SPEC intent

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added slug field to Package interface and photographyPackages**
- **Found during:** Task 1 (building PhotographyBookingForm)
- **Issue:** Plan 03-01 was supposed to add `slug` to `src/data/photography.ts` but the field was missing. The `?pkg={slug}` URL param system and the `useSearchParams` pre-selection logic require slug fields on each package.
- **Fix:** Added `slug: string` to Package interface; added slug values to all 3 packages (portrait-session, event-coverage, landscape-half-day)
- **Files modified:** src/data/photography.ts
- **Verification:** Build passes, tests pass, pricing page renders with correct slugs
- **Committed in:** 2f74fe5 (Task 1 commit)

**2. [Rule 3 - Blocking] Wrapped PhotographyBookingForm in Suspense on booking page**
- **Found during:** Task 2 (build verification)
- **Issue:** `npm run build` failed with "useSearchParams() should be wrapped in a suspense boundary" error
- **Fix:** Added `import { Suspense } from 'react'` and wrapped `<PhotographyBookingForm>` in `<Suspense fallback={...}>` in the booking page
- **Files modified:** src/app/(photography)/photography/book/page.tsx
- **Verification:** npm run build exits 0
- **Committed in:** fadd758 (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (both Rule 3 - blocking)
**Impact on plan:** Both fixes necessary for build to pass. No scope creep.

## Issues Encountered
- React `act(...)` warnings in tests are from async `useEffect` (per-month calendar fetch). These are warnings only, not failures — all 7 tests pass. Wrapping in `act` would require `waitFor` infrastructure; out of scope for this plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- PhotographyBookingForm is ready for Plan 03-03 to wire up the `/api/checkout` Stripe redirect
- The form POSTs to `/api/checkout` with `{ packageId, clientName, clientEmail, phone, notes, eventDate }` — this is the interface Plan 03-03 must implement
- `/photography/book/success` page (referenced in UI-SPEC) is not yet built — needed in Plan 03-03 or 03-04

---
*Phase: 03-booking-and-payments*
*Completed: 2026-03-19*

## Self-Check: PASSED

All created files exist on disk. Both task commits (2f74fe5, fadd758) verified in git log. SUMMARY.md present at expected path.
