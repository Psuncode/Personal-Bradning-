---
phase: 03-booking-and-payments
plan: "00"
subsystem: testing
tags: [vitest, react-testing-library, tdd, wave-0, red-phase]

requires: []
provides:
  - "BUG-03 test stubs: BookingForm loadedMonths Set immutability"
  - "BUG-01 test stubs: getAvailableSlots all-day event blocking and Mountain Time bucketing"
  - "PHOTO-03 test stubs: PhotographyBookingForm multi-step booking form"
  - "PHOTO-04 test stubs: Stripe webhook handler idempotency and ICS email"
  - "PhotographyBookingForm placeholder component (stub for Plan 03-02)"
affects: [03-01, 03-02, 03-04]

tech-stack:
  added: []
  patterns:
    - "Wave 0 RED stubs: it.todo() stubs define behavior contracts before implementation"
    - "Mock pattern: vi.mock factories use inline values (no top-level variable references) to avoid Vitest hoisting errors"

key-files:
  created:
    - src/app/__tests__/booking-form.test.tsx
    - src/app/__tests__/availability.test.ts
    - src/app/__tests__/booking.test.tsx
    - src/app/__tests__/webhook.test.ts
    - src/components/booking/PhotographyBookingForm.tsx
  modified: []

key-decisions:
  - "PhotographyBookingForm placeholder created in src/components/booking/ so test imports resolve before Plan 03-02 builds the real component"
  - "vi.mock factories use inline mock data (not top-level imports) to avoid Vitest hoisting ReferenceError"
  - "contact.test.tsx failure deferred — pre-existing issue from working-tree changes to contact-section.tsx that are out of Plan 03-00 scope"

patterns-established:
  - "Wave 0 stub pattern: import module + void reference + it.todo() stubs — ensures module resolution works before implementation"

requirements-completed: [BUG-03, BUG-01, PHOTO-03, PHOTO-04]

duration: 3min
completed: 2026-03-19
---

# Phase 3 Plan 00: Wave 0 Test Stubs Summary

**Four TDD RED-phase test stub files covering all Phase 3 requirements (BUG-03, BUG-01, PHOTO-03, PHOTO-04) plus a PhotographyBookingForm placeholder component**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-19T20:11:20Z
- **Completed:** 2026-03-19T20:14:15Z
- **Tasks:** 2 of 2
- **Files modified:** 5 created

## Accomplishments

- Created `booking-form.test.tsx` with BUG-03 stubs for `BookingForm` Set immutability (loadedMonths mutation bug)
- Created `availability.test.ts` with BUG-01 stubs for `getAvailableSlots` all-day event blocking and Mountain Time day bucketing
- Created `booking.test.tsx` with 7 PHOTO-03 stubs covering PhotographyBookingForm step render, navigation, and `?pkg=` URL pre-selection
- Created `webhook.test.ts` with 8 PHOTO-04 stubs covering Stripe webhook idempotency, ICS email, and notification email
- Created `PhotographyBookingForm.tsx` placeholder so test imports resolve before Plan 03-02 builds the real component
- All four files verified via `npx vitest run` — zero crashes, all stubs are todo/skipped (RED phase)

## Task Commits

Each task was committed atomically:

1. **Task 1: BUG-03 and BUG-01 test stubs** - `0c3c932` (test)
2. **Task 2: PHOTO-03 and PHOTO-04 test stubs** - `139574c` (test)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `src/app/__tests__/booking-form.test.tsx` — BUG-03 stubs: Set immutability in BookingForm month navigation
- `src/app/__tests__/availability.test.ts` — BUG-01 stubs: all-day event blocking and UTC-to-Mountain timezone bucketing
- `src/app/__tests__/booking.test.tsx` — PHOTO-03 stubs: PhotographyBookingForm step render, navigation, pkg pre-selection
- `src/app/__tests__/webhook.test.ts` — PHOTO-04 stubs: Stripe webhook idempotency, ICS attachment, email notification
- `src/components/booking/PhotographyBookingForm.tsx` — placeholder stub returning null; real component built in Plan 03-02

## Decisions Made

- **PhotographyBookingForm placeholder:** Created minimal `function PhotographyBookingForm(): null { return null; }` in the booking components directory so `booking.test.tsx` imports resolve immediately. Real implementation arrives in Plan 03-02.
- **Inline mock data in vi.mock factories:** Vitest hoists `vi.mock()` calls above imports, so top-level import references inside mock factories cause ReferenceErrors. All mock factories use inline literal values.

## Deviations from Plan

### Auto-fixed Issues

None.

### Deferred Items

**1. contact.test.tsx fails when test suite runs together**
- **Found during:** Task 2 verification
- **Root cause:** `src/components/sections/contact-section.tsx` was modified in the working tree (pre-existing, before Plan 03 began) to import `useReducedMotion` from framer-motion. The contact.test.tsx mock does not export `useReducedMotion`, causing Vitest to throw when the full suite runs together.
- **Scope:** Pre-existing, not caused by Phase 3 changes
- **Logged to:** `.planning/phases/03-booking-and-payments/deferred-items.md`
- **Individual file run:** All four new test files pass individually and in combination with each other

---

**Total deviations:** 0 auto-fixed
**Impact on plan:** Plan executed as specified. One pre-existing out-of-scope issue deferred.

## Issues Encountered

- **Vitest vi.mock hoisting:** `booking.test.tsx` initially imported `photographyPackages` at top-level and referenced it in a `vi.mock()` factory, causing a `ReferenceError: Cannot access before initialization`. Fixed by inlining mock data directly inside the factory — standard Vitest pattern.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- All four Wave 0 test files exist and run without crashing
- RED phase established: all stubs are todo (none pass yet)
- Plan 03-01 can now implement BUG-03 and BUG-01 fixes to turn stubs GREEN
- Plan 03-02 can build PhotographyBookingForm replacing the placeholder
- Plan 03-04 can build the webhook handler to turn PHOTO-04 stubs GREEN

---
*Phase: 03-booking-and-payments*
*Completed: 2026-03-19*
