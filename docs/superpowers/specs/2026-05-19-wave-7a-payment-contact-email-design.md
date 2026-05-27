# Wave 7a — Payment + Contact + Email Hardening (Design)

**Date:** 2026-05-19
**Branch:** `feat/blog-system-v2` @ `c6bd1e6`
**Backlog source:** `.planning/notes/CODE-REVIEW-BACKLOG.md`
**Sequencing:** Wave 7b (Cal.com pivot, delete calendar plumbing) is a separate future cycle.

## Decisions ratified during brainstorming

| Choice | Decision |
|---|---|
| Scope | Coherent overhaul (not minimal-criticals patch) |
| Drizzle driver | Stay on `neon-http`; use `db.batch([…])` for atomic multi-writes |
| Env-var discipline | Tiered registry: `requireBuildEnv` / `requireRuntimeEnv` / `optionalEnv` in `src/lib/env.ts` |
| Calendar plumbing | Untouched in 7a; replaced with Cal.com embed in future Wave 7b |
| Sequencing | Wave 7a payments-first; Wave 7b Cal.com pivot |

## Architecture

### New files
- `src/lib/env.ts` — tiered env registry; exported helpers `requireBuildEnv(name)`, `requireRuntimeEnv(name)`, `optionalEnv(name, default)`. Declares each known env's tier so future agents/devs can grep one place.
- `src/lib/validation/common.ts` — shared Zod helpers: `RequiredTrimmedString`, `optionalTrimmed`, `Email` (v4 `z.email()`), `CONTROL_CHARS`.
- `src/lib/validation/event-date.ts` — `normalizeEventDate(input: Date | string): Date` that truncates to day-precision UTC. Single boundary for all eventDate I/O.
- `drizzle/0004_*.sql` + snapshot + journal — migration: `ALTER TABLE bookings ALTER COLUMN package_id SET NOT NULL` and `ALTER TABLE payments ALTER COLUMN booking_id SET NOT NULL`. Pre-deploy queries documented in commit message.

### Modified files (10)

**Foundation (used by everything below):**
- `src/lib/session.ts` — replace inline fail-fast with `requireBuildEnv('SESSION_SECRET')`; semantics preserved (still throws at build time).
- `src/lib/stripe.ts` — replace `process.env.STRIPE_SECRET_KEY!` with `requireRuntimeEnv('STRIPE_SECRET_KEY')`.
- `src/lib/email.ts` — replace `process.env.RESEND_API_KEY!` with `requireRuntimeEnv('RESEND_API_KEY')`; audit and apply `escapeHtml` to every remaining user-controlled `${...}` interpolation in HTML email bodies.
- `src/db/index.ts` — already lazy; align the `DATABASE_URL` access through `requireRuntimeEnv` for consistency.
- `src/lib/rate-limit.ts` — add `contactRateLimiter` singleton (5/15min then 1/min, same shape as `loginRateLimiter`); KV/Upstash note in header comment.

**Stripe webhook (`src/app/(main)/api/webhooks/stripe/route.ts`):**
- Refactor `handleCheckoutCompleted` to use `db.batch([insertBooking, insertPayment, deletePending])` for atomic multi-write at the Postgres level.
- Migrate Zod schema from v3 to v4 (`z.string().email()` → `z.email()`).
- Replace `z.string().min(1)` for `clientName` with `RequiredTrimmedString` from `common.ts` (rejects whitespace-only).
- Add `.transform(s => new Date(s))` for `eventDate` field; pipe through `normalizeEventDate` from `event-date.ts`.
- Add `assertNever` exhaustiveness check on event-type switch.
- Replace bespoke `parseMetadataInt` with `checkoutCompletedMetadataSchema.pick({...}).partial()` for refund/failed/expired handlers.
- Sweep email-template interpolations through `escapeHtml`.

**Checkout (`src/app/(main)/api/checkout/route.ts`):**
- `requireBuildEnv('NEXT_PUBLIC_PHOTOGRAPHY_URL')` to fail at build, not silently fall back to `localhost:3000`.
- Move `revalidateTag(SERVER_AVAILABILITY_TAG, 'max')` to BEFORE the pending-reservation insert (closes the ~500ms write-race window).
- Use Stripe native `idempotency_key` param on `stripe.checkout.sessions.create` (defense-in-depth on top of the existing app-side check).
- Pipe `eventDate` through `normalizeEventDate`.

**Contact (`src/app/actions/contact.ts`):**
- Wire `contactRateLimiter` (per-IP, with `x-forwarded-for` key + `unknown-client` fallback); return structured error on limit.
- Replace `as ContactFormFieldErrors` cast with mapped type: `type ContactFormFieldErrors = { [K in keyof z.infer<typeof contactSchema>]?: string[] }`.

**Validation cleanup:**
- `src/lib/validation/booking.ts` — replace inline `optionalTrimmed` with import from `common.ts`.

**Schema:**
- `src/db/schema.ts` — add `.notNull()` to `bookings.packageId` and `payments.bookingId`. Generate migration via `npx drizzle-kit generate`.

### Files explicitly NOT touched (Wave 7b)
- `src/proxy.ts`, `src/lib/serverCalendar.ts`, `src/lib/availabilityService.ts`, `src/lib/icalendarService.ts`, `src/lib/icsService.ts`
- `src/app/(main)/api/calendar/route.ts`
- `BookingForm.tsx`, `PhotographyBookingForm.tsx`

## Backlog items closed

#1 webhook atomicity · #2 PHOTOGRAPHY_URL fallback · #5 eventDate precision · #6 NOT NULL · #7 v3/v4 Zod drift · #8 contact rate-limit · #10 escapeHtml sweep · #11 native idempotency_key · #14 common helpers · #15 eventDate transform · #16 assertNever · #17 process.env.X! sweep · #18 ContactFormFieldErrors mapped type · #19 race window

**Deferred:** #3, #4, #9 (calendar — Wave 7b) · #12, #13, #20 (test scaffolding, restricted key, KV migration — explicit follow-ups)

## Testing

Each touched file gets test coverage:
- `lib/env.test.ts` — new; cover all three tiers + missing-var error shape
- `lib/validation/common.test.ts` — new; round-trip cases for each helper
- `lib/validation/event-date.test.ts` — new; DST, ISO strings, Date objects, normalization across timezones
- `lib/rate-limit.test.ts` — extend; add contactRateLimiter cases
- `__tests__/webhook.test.ts` — extend; `db.batch` atomicity (mock batch rejection mid-array), Zod v4 acceptance, whitespace-name rejection
- `__tests__/checkout.test.ts` — extend; `idempotency_key` set, revalidate-before-insert order, PHOTOGRAPHY_URL fail-fast
- `actions/contact.test.ts` — extend; rate-limit triggered, field-errors typed correctly

`npm run test -- --run` must show no new failures beyond the CLAUDE.md-flagged carve-outs.

## Rollout

1. Foundation commits (sequential): env.ts → common.ts → event-date.ts
2. Parallel build commits: stripe-clients migration, webhook refactor, checkout updates, contact rate-limit, schema 0004
3. Verification commits: tests green, lint clean, build green
4. Post-merge: pre-deploy queries on Neon before applying 0004 (`SELECT count(*) FROM bookings WHERE package_id IS NULL`, etc.)

## Risks + mitigations

| Risk | Mitigation |
|---|---|
| `db.batch` semantics differ from a transaction (no read-then-decide) | Webhook's writes are fire-and-forget given metadata; no conditional logic needed |
| Migration 0004 fails if historical data has NULLs in flagged columns | Pre-deploy SELECT queries gate the apply |
| Build agents step on each other if dispatched too eagerly | Foundation is sequential; build phase parallelizes only across non-overlapping file sets |
| Lazy env-resolve breaks hot-reload semantics in `next dev` | Helper caches result per-process; `requireBuildEnv` still throws at module load so dev parity is preserved |

## Approval

Brainstorming session ratified this design verbally on 2026-05-19. Build team dispatched immediately per user direction.
