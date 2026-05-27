---
status: complete
phase: 03
phase_name: booking-and-payments
files_reviewed:
  - src/app/__tests__/availability.test.ts
  - src/app/__tests__/booking-form.test.tsx
  - src/app/__tests__/booking.test.tsx
  - src/app/__tests__/webhook.test.ts
  - src/app/(main)/admin/page.tsx
  - src/app/(main)/api/checkout/route.ts
  - src/app/(main)/api/webhooks/stripe/route.ts
  - src/app/(photography)/photography/book/page.tsx
  - src/app/(photography)/photography/book/success/page.tsx
  - src/app/(photography)/photography/pricing/page.tsx
  - src/components/booking/BookingForm.tsx
  - src/components/booking/PhotographyBookingForm.tsx
  - src/components/layout/navbar.test.tsx
  - src/data/photography.ts
  - src/lib/email.ts
  - src/lib/serverCalendar.ts
  - src/lib/stripe.ts
depth: standard
findings_summary:
  critical: 4
  warning: 7
  info: 4
  total: 15
generated_at: 2026-05-19
---

# Phase 03 Code Review — Booking and Payments

Phase 03 delivered a working Stripe-deposit booking funnel with confirmation email, ICS attachment, CalDAV-driven availability, and an admin dashboard. The webhook handler correctly verifies signatures and is idempotent on `payment_intent`. However, several payment-critical issues remain — most importantly an **uncaught error path in the webhook that will cause Stripe to permanently mark bookings as failed while still having charged the customer**, **no enforcement against double-booking**, and **client-supplied event dates / Cal.com-style metadata that are never re-validated server-side**. Several of these are quick fixes.

---

## Critical Findings

### CR-01 — Webhook can fail mid-flight after charging the customer (orphaned charge, lost email)
**File:** src/app/(main)/api/webhooks/stripe/route.ts:26-91
**Severity:** Critical
**Issue:** Inside the `checkout.session.completed` branch, there is no `try/catch` around the DB inserts, pending-reservation delete, or the two `await` email sends. If `sendBookingConfirmationEmail` or `sendPhilipNotificationEmail` (Resend) throws — rate limit, transient 5xx, invalid recipient — the unhandled rejection bubbles out of `POST`. Stripe sees a 5xx, retries up to ~3 days, and on each retry the idempotency check sees the row and returns `200 {received: true}` *without re-sending the email*. The customer was charged but never gets a confirmation. Worse, the inserts above the email calls succeed once; subsequent retries silently skip them.
**Impact:** Customer charged, no confirmation, no ICS, no Philip notification. Looks like fraud to the client. Manual reconciliation required.
**Fix:** Wrap the post-insert side effects (reservation delete, both email sends) in their own `try/catch` so transient failures don't 500 the webhook. Better: enqueue a `notification_pending` flag on the booking row and dispatch emails from a separate worker/queue with retry. At minimum, store a `confirmation_sent_at` column so retries know whether to re-send the email.

### CR-02 — No double-booking enforcement; race window between checkout creation and webhook
**File:** src/app/(main)/api/checkout/route.ts:23-69
**Severity:** Critical
**Issue:** The checkout route creates a `pending_reservations` row for `requestedDate` but never checks whether (a) an existing `bookings` row already has that `event_date`, (b) another pending reservation already holds that timestamp, or (c) the CalDAV calendar has a real conflict. Two clients hitting Step 4 within seconds will both get Stripe sessions for the exact same slot. Whichever webhook fires first wins; the second still charges the customer (CR-01 covers the email side; the booking row will be inserted too because the unique constraint is on `stripePaymentIntentId`, not `eventDate`). No `UNIQUE(event_date)` and no advisory lock.
**Impact:** Two clients pay deposits for the same time slot. Manual cancellation + refund required.
**Fix:** Before creating the Stripe session, run a transactional check: `SELECT 1 FROM bookings WHERE event_date = $1 AND status = 'confirmed'` + `SELECT 1 FROM pending_reservations WHERE requested_date = $1 AND expires_at > NOW()`. If either hits, return 409. Consider a partial unique index on `bookings(event_date) WHERE status='confirmed'`. Re-run the same check inside the webhook before the booking insert to close the window between session creation and `checkout.session.completed`.

### CR-03 — Client-supplied `eventDate` is never validated against business rules server-side
**File:** src/app/(main)/api/checkout/route.ts:10-21
**Severity:** Critical
**Issue:** `eventDate` is taken from the JSON body and passed straight into Stripe metadata and the pending reservation row. There is no server-side validation that the date is: in the future, within the 3-month booking window, on a weekday, between 9 AM–5 PM Mountain, not on a busy CalDAV day, and not less than `durationMinutes` from the next event. A malicious or buggy client can `curl` `/api/checkout` with `eventDate: "1970-01-01T00:00:00Z"` or `"2099-12-31T23:00:00Z"` and the webhook will dutifully create a confirmed booking and charge the deposit. The client-side `availabilityService` is the only gatekeeper.
**Impact:** Bookings created for impossible times (Saturdays, 3 AM, past dates). Stripe charge goes through. Also enables CSRF-style abuse since there is no CSRF token on this POST.
**Fix:** On the server, re-run `getAvailableSlots(eventDate)` using a fresh CalDAV fetch (or the cached `getServerAvailability` result) and reject if the slot isn't present. Validate `eventDate` is a valid ISO 8601 string and falls inside `[now, now + 90 days]`. Reject weekends. Round to the half-hour boundary the slot generator emits. Return 409 if a conflict exists.

### CR-04 — Stripe API version is not pinned
**File:** src/lib/stripe.ts:9-13
**Severity:** Critical
**Issue:** `new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true })` omits `apiVersion`. Stripe falls back to the account's "default API version", which Stripe can — and does — bump server-side. When Stripe upgrades the default, response shapes (e.g. `payment_intent`, `metadata`, `amount_total`) can change in subtle ways and break the webhook in production without any code deploy.
**Impact:** Silent breakage on a Stripe-side API rollover. Hard to attribute, hard to roll back (no deploy diff).
**Fix:** Pin explicitly, e.g. `apiVersion: '2025-09-30.acacia'` (or whatever the SDK ships with). Also consider validating the response shape with a zod schema before reading `meta.packageId`/`meta.eventDate`.

---

## Warnings

### WR-01 — `parseInt` on metadata without radix or NaN check can corrupt bookings
**File:** src/app/(main)/api/webhooks/stripe/route.ts:44, 67, 77
**Severity:** Warning
**Issue:** `parseInt(meta.packageId)`, `parseInt(meta.reservationId)`, `parseInt(meta.durationMinutes)` are called without a radix and without checking `Number.isNaN`. If the metadata is missing or malformed (e.g. a Stripe Workbench replay with edited metadata), `parseInt(undefined) === NaN`, and `db.insert(... packageId: NaN)` will produce an invalid integer error from Postgres, 500 the webhook, and trigger the CR-01 retry-without-email scenario. `parseInt("01") === 1` on modern engines is fine but should still use radix 10.
**Impact:** Brittle metadata handling; turns a recoverable edge case into a customer-impacting outage.
**Fix:** Validate the entire `meta` object with a zod schema at the top of the handler, returning 400 if it doesn't match. Use `Number(meta.packageId)` + `Number.isInteger` checks. Default `durationMinutes` to the package row, not metadata.

### WR-02 — Pending reservations are only cleaned up on the next checkout call (orphan accumulation)
**File:** src/app/(main)/api/checkout/route.ts:23-25
**Severity:** Warning
**Issue:** Expired pending reservations are cleaned only as a side effect of a new checkout POST. If Stripe webhook never fires (user closes tab, Stripe outage, dev mode without webhook listener), the reservation row sits with `stripeSessionId` set forever until someone else books. There's no cron, no background job, no TTL enforced at the DB level. The cleanup is also non-transactional with the insert — two parallel checkouts both run the `lt(expiresAt, NOW())` delete then both insert, fine, but neither holds a lock against the other.
**Impact:** Orphaned reservations bloat the table. If you ever add a "does any pending reservation overlap?" check (recommended in CR-02), stale rows will block legitimate bookings.
**Fix:** Run cleanup in the webhook handler too (for failed-checkout cases via `checkout.session.expired`). Add a small Vercel Cron route or use `pg_cron` to purge nightly. Listen for `checkout.session.expired` and delete the matching pending reservation by `stripeSessionId`.

### WR-03 — `checkout.session.expired` and refund events are ignored
**File:** src/app/(main)/api/webhooks/stripe/route.ts:26
**Severity:** Warning
**Issue:** The handler only reacts to `checkout.session.completed`. There's no handler for `checkout.session.expired` (clean up pending reservation), `charge.refunded` (mark booking cancelled, free the slot), or `payment_intent.payment_failed` (clean up). Refunds processed in the Stripe dashboard will silently leave a "confirmed" booking holding a slot the client no longer paid for.
**Impact:** Stale "confirmed" rows after refunds; the slot stays blocked.
**Fix:** Add explicit cases for `checkout.session.expired`, `charge.refunded`, `payment_intent.payment_failed`. Set `bookings.status = 'cancelled'` and delete any matching reservation.

### WR-04 — Client metadata (`clientName`, `clientNotes`) is interpolated raw into HTML emails
**File:** src/lib/email.ts:49-82, 112-120
**Severity:** Warning
**Issue:** `clientName`, `packageName`, and `formattedDate` are interpolated directly into the email HTML via template literals with no escaping. If a client submits `clientName: "<script>...</script>"` or `clientName: 'Jane" onclick="..."`, the email body will contain that markup. Gmail/Apple Mail will strip `<script>` but link injection, image injection, and CSS exfiltration (background-image URLs) are still viable in some clients. Also, `clientNotes` is in `meta.clientNotes` and isn't rendered in either email — but if it ever is, same problem.
**Impact:** HTML email injection / phishing vector inside the legitimate confirmation email. Lower severity than web XSS but still a real exposure.
**Fix:** HTML-escape every interpolated value (small helper: replace `<`, `>`, `&`, `"`, `'`). Better, use a templating library that escapes by default (e.g. `react-email`).

### WR-05 — `clientEmail` is never validated server-side; lands directly in Stripe and DB
**File:** src/app/(main)/api/checkout/route.ts:10-21, 39
**Severity:** Warning
**Issue:** The route checks only `!clientEmail`. There's no regex/RFC check, no length limit, no normalization (trim, lowercase). Stripe will accept anything as `customer_email`, the DB will store anything. A typo'd email means the confirmation never arrives — and because we silently store it on the booking, support will struggle to find the right client.
**Impact:** Mis-delivered confirmations; harder support recovery; possible header injection if `clientEmail` is ever used as an SMTP recipient (Resend's API masks this but worth defense-in-depth).
**Fix:** Validate with a zod email schema or a strict regex; trim+lowercase; cap length at 254. Reject and return 400 with a friendly message.

### WR-06 — `getServerAvailability` cache (15 min) is shared across the whole process — stale availability across users
**File:** src/lib/serverCalendar.ts:195-199
**Severity:** Warning
**Issue:** `unstable_cache` with a 15-minute revalidate is process-wide. If Philip adds a new event in iCloud, the booking page can show that slot as available for up to 15 minutes — collides with CR-02. Also, the cache key has no user/date scoping, so all visitors see the same view. Combined with no server-side validation in checkout (CR-03), the cache window is a real double-book window.
**Impact:** Up to 15 minutes of "available" UI for a slot that's actually busy.
**Fix:** Lower revalidate to 60–120s. On the server side of `/api/checkout`, bypass the cache and fetch a fresh CalDAV slice for the requested date before creating the Stripe session.

### WR-07 — `sendPhilipNotificationEmail` recipient comes from `siteConfig.email`, which is build-time
**File:** src/lib/email.ts:124
**Severity:** Warning
**Issue:** `siteConfig.email` is imported at module load and never re-read. If Philip ever rotates that email, you need a redeploy to reroute notifications. Also, there's no fallback if `siteConfig.email` is empty — Resend would 400, the unhandled rejection bubbles into CR-01.
**Impact:** Notification mail brittleness; possible silent webhook failure.
**Fix:** Source the notification recipient from `process.env.BOOKING_NOTIFICATION_EMAIL` with a fallback. Wrap the Resend call with try/catch and log failures instead of throwing.

---

## Info

### IN-01 — Stripe Checkout success page silently leaks `metadata` to anyone with the `session_id`
**File:** src/app/(photography)/photography/book/success/page.tsx:27-35
**Severity:** Info
**Issue:** The success page reads `session_id` from URL and calls `stripe.checkout.sessions.retrieve(sessionId)`, then renders `meta.packageName`, `meta.eventDate`, and `session.amount_total`. Anyone with the session ID (e.g. from browser history shared in screenshots, or referrer leakage) can fetch the same data. Stripe session IDs are long enough to resist brute force, but you might consider verifying that `session.customer_email` matches a server-set cookie before rendering, or just trust that the URL is single-use and short-lived.
**Impact:** Minor info disclosure if URL leaks. Stripe session IDs aren't secrets per se.
**Fix:** Acceptable as-is for this risk profile; document the assumption.

### IN-02 — `BookingForm.tsx` (the older "meeting" form) is now dead code or near-duplicate of PhotographyBookingForm
**File:** src/components/booking/BookingForm.tsx
**Severity:** Info
**Issue:** This component appears to be the pre-Phase-03 meeting-booker. It still uses the `byu-*` color tokens that CLAUDE.md flags as deprecated and uses `alert()` for validation (UX issue, not security). If it's still rendered somewhere, it inherits no Stripe path — just generates an ICS locally. If it's not rendered, delete it.
**Impact:** Maintenance burden; two diverging copies of similar logic.
**Fix:** If `/meet` no longer uses this form, remove the file. If it does, port to editorial tokens and `setError` state instead of `alert()`.

### IN-03 — `BookingForm.tsx` uses `alert()` for validation, blocks the event loop
**File:** src/components/booking/BookingForm.tsx:165
**Severity:** Info
**Issue:** `alert('Please fill in all required fields')` is a UX antipattern and is unreachable for screen readers in some browsers.
**Fix:** Replace with inline error state like `PhotographyBookingForm` does.

### IN-04 — `console.log` of CalDAV username at runtime
**File:** src/lib/serverCalendar.ts:54
**Severity:** Info
**Issue:** `console.log(`[calendar] Connecting to ${server} as ${username}`)` writes the iCloud account email to server logs on every fetch. Not a credential leak (password is separate), but Vercel logs are accessible to anyone with project access, and the email is PII.
**Fix:** Drop the username from the log line, or only log it in dev (`if (process.env.NODE_ENV !== 'production')`).

---

## Summary of action items, by priority

1. **Wrap webhook side effects in try/catch + persist a `confirmation_sent_at` flag** (CR-01) — highest customer-impact item.
2. **Server-side validate `eventDate` + check for double-booking inside `/api/checkout` and again in the webhook before insert** (CR-02, CR-03).
3. **Pin Stripe `apiVersion`** (CR-04) — one-line fix, prevents silent breakage.
4. **Zod-validate webhook metadata + checkout body** (WR-01, WR-05).
5. **Handle `checkout.session.expired` and refund/failure events** (WR-03).
6. **HTML-escape email template interpolation** (WR-04).
7. **Lower availability cache TTL and re-fetch in `/api/checkout`** (WR-06).
8. **Add a cleanup cron for orphaned pending reservations** (WR-02).
9. **Defensive logging cleanups + dead-code removal** (IN-02, IN-03, IN-04).
