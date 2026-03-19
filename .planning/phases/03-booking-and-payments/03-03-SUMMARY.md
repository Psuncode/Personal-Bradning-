---
phase: 03-booking-and-payments
plan: 03
subsystem: payments
tags: [stripe, resend, ics, webhook, email, admin, nextjs]

# Dependency graph
requires:
  - phase: 03-01
    provides: Stripe singleton, photography packages, DB schema (bookings/payments/pendingReservations)
  - phase: 03-02
    provides: PhotographyBookingForm — calls /api/checkout on payment step
provides:
  - POST /api/checkout — creates Stripe Checkout session with price_data and booking metadata
  - POST /api/webhooks/stripe — idempotent booking creation + email trigger on checkout.session.completed
  - src/lib/email.ts — sendBookingConfirmationEmail (ICS attach) + sendPhilipNotificationEmail via Resend
  - /photography/book/success — server page shows package/date/deposit from Stripe session
  - Admin dashboard (/admin) extended with bookings table (status badges, deposit, payment intent IDs)
affects: [phase-04, any future reporting or booking management work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Lazy Proxy singleton for Stripe (mirrors db/index.ts pattern — avoids build-time constructor failure)
    - Lazy singleton for Resend client (avoids build-time missing API key error)
    - vi.hoisted() for shared mock variables referenced both in vi.mock factories and test body
    - Mock @/lib/email directly in webhook tests (avoid Resend constructor hoisting issues)

key-files:
  created:
    - src/app/(main)/api/checkout/route.ts
    - src/app/(main)/api/webhooks/stripe/route.ts
    - src/lib/email.ts
    - src/app/(photography)/photography/book/success/page.tsx
  modified:
    - src/app/(main)/admin/page.tsx
    - src/lib/stripe.ts
    - src/app/__tests__/webhook.test.ts

key-decisions:
  - "Lazy Proxy pattern applied to Stripe singleton — same pattern as db/index.ts — prevents build-time constructor failure when STRIPE_SECRET_KEY not set"
  - "Lazy singleton pattern applied to Resend client — prevents build-time missing API key error"
  - "Resend Attachment field is contentType (camelCase), not content_type (snake_case) — TypeScript enforces this"
  - "Mock @/lib/email directly in webhook tests rather than mocking resend — avoids Resend constructor hoisting issue with vi.mock factories"
  - "vi.hoisted() used for shared mock variables (mockSelect, mockInsert, mockDelete, mockUpdate) referenced in both vi.mock factories and test body"
  - "Webhook tests import from @/app/(main)/api/webhooks/stripe/route (not @/app/api/...) — route group (main) is part of the filesystem path even though it is transparent to URLs"

patterns-established:
  - "Lazy singleton pattern: use Proxy wrapper for any SDK that validates config at constructor time (Stripe, Resend, etc.)"
  - "TDD for webhook handlers: mock @/lib/email directly, use vi.hoisted() for spy variables, make assertions on calls not internal sends"

requirements-completed: [PHOTO-03, PHOTO-04]

# Metrics
duration: 7min
completed: 2026-03-19
---

# Phase 3 Plan 03: Payment Flow, Webhook Handler, and Email Confirmation Summary

**Stripe Checkout session creation, idempotent webhook handler with booking DB writes, Resend email with ICS calendar attachment, post-payment success page, and admin bookings table**

## Performance

- **Duration:** 7 min
- **Started:** 2026-03-19T20:22:43Z
- **Completed:** 2026-03-19T20:30:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- POST /api/checkout creates Stripe Checkout sessions with inline price_data and full booking metadata in session
- POST /api/webhooks/stripe idempotently creates booking + payment rows from checkout.session.completed, then sends two emails
- Confirmation email includes ICS calendar attachment (base64 encoded) with session details and a warm photographer voice
- Success page retrieves Stripe session server-side and shows package, date/time, and deposit — no client-side state needed
- Admin dashboard extended with bookings table: status color badges, truncated payment intent IDs, deposit formatting

## Task Commits

Each task was committed atomically:

1. **Task 1: Stripe checkout route, webhook handler, and email service** - `95a8bf2` (feat)
2. **Task 2: Success page, admin bookings table, lazy singleton fixes** - `0956611` (feat)

**Plan metadata:** (docs commit — see below)

_Note: Task 1 used TDD — tests written before implementation._

## Files Created/Modified

- `src/app/(main)/api/checkout/route.ts` — POST endpoint: validates package, creates pending reservation, creates Stripe Checkout session with price_data
- `src/app/(main)/api/webhooks/stripe/route.ts` — POST endpoint: verifies signature, idempotency check, inserts booking + payment, triggers emails
- `src/lib/email.ts` — sendBookingConfirmationEmail (with ICS attachment) + sendPhilipNotificationEmail via Resend lazy singleton
- `src/app/(photography)/photography/book/success/page.tsx` — Server Component: retrieves Stripe session, shows You're booked summary
- `src/app/(main)/admin/page.tsx` — Extended with bookings query and table (status badges, deposit, payment intent)
- `src/lib/stripe.ts` — Converted to lazy Proxy singleton to prevent build-time failure
- `src/app/__tests__/webhook.test.ts` — Converted all 8 it.todo stubs to real passing tests (9 total)

## Decisions Made

- Lazy Proxy pattern for Stripe singleton (mirrors db/index.ts) — prevents build-time failure when STRIPE_SECRET_KEY not set in build environment
- Lazy singleton for Resend client — same reason: Resend validates key at constructor time
- Mock `@/lib/email` directly in webhook tests rather than mocking `resend` — avoids Resend constructor hoisting issue
- Used `vi.hoisted()` for shared mock variables to guarantee availability when `vi.mock` factories run

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Resend Attachment field is `contentType` not `content_type`**
- **Found during:** Task 2 (build verification)
- **Issue:** Plan specified `content_type: 'text/calendar; method=REQUEST'` but Resend SDK types the field as `contentType` (camelCase)
- **Fix:** Changed `content_type` to `contentType` in `src/lib/email.ts`
- **Files modified:** src/lib/email.ts
- **Verification:** TypeScript build passes
- **Committed in:** `0956611` (Task 2 commit)

**2. [Rule 3 - Blocking] Stripe singleton threw at build time due to missing STRIPE_SECRET_KEY**
- **Found during:** Task 2 (build verification after creating checkout route)
- **Issue:** `new Stripe(process.env.STRIPE_SECRET_KEY!, {...})` at module level caused Next.js page data collection to fail — key not set at build time
- **Fix:** Converted `src/lib/stripe.ts` to lazy Proxy singleton (same pattern as `src/db/index.ts`)
- **Files modified:** src/lib/stripe.ts
- **Verification:** Build passes; Stripe instance is created on first request
- **Committed in:** `0956611` (Task 2 commit)

**3. [Rule 3 - Blocking] Resend client threw at build time due to missing RESEND_API_KEY**
- **Found during:** Task 2 (build verification after Stripe fix)
- **Issue:** `new Resend(process.env.RESEND_API_KEY!)` at module level in `email.ts` — Resend validates key at construction time
- **Fix:** Added lazy `getResend()` function with cached singleton; both `resend.emails.send` call sites updated to `getResend().emails.send`
- **Files modified:** src/lib/email.ts
- **Verification:** Build passes
- **Committed in:** `0956611` (Task 2 commit)

**4. [Rule 3 - Blocking] Test import path for webhook route used wrong path (without route group)**
- **Found during:** Task 1 (TDD RED phase)
- **Issue:** Pre-written test stub used `@/app/api/webhooks/stripe/route` but file lives at `@/app/(main)/api/webhooks/stripe/route`
- **Fix:** Updated all dynamic import calls in webhook.test.ts to use the `(main)` route group path
- **Files modified:** src/app/__tests__/webhook.test.ts
- **Verification:** Tests import successfully and pass
- **Committed in:** `95a8bf2` (Task 1 commit)

---

**Total deviations:** 4 auto-fixed (1 bug, 3 blocking)
**Impact on plan:** All fixes essential for correctness and build success. No scope creep.

## Issues Encountered

- `vi.mock('resend', ...)` with inline `mockEmailSend` reference failed even with `vi.hoisted()` — solved by mocking `@/lib/email` directly instead of mocking `resend`, which is cleaner and avoids the Resend constructor entirely in tests.

## User Setup Required

None — no new external service configuration required in this plan. STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, and RESEND_API_KEY were already identified as required env vars in Plan 03-01.

## Next Phase Readiness

- Complete Stripe Checkout flow is wired: form → /api/checkout → Stripe hosted page → webhook → booking row → confirmation email
- Admin dashboard shows bookings alongside contacts
- Ready for Phase 4 (if any) or production deployment once env vars are set and Stripe webhook endpoint is registered

---
*Phase: 03-booking-and-payments*
*Completed: 2026-03-19*
