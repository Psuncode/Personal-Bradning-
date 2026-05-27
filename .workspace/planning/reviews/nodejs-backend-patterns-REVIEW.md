# Node.js Backend Patterns — Review

**Scope:** `src/app/(main)/api/*/route.ts`, `src/app/actions/*.ts`, `src/lib/*` (server-only), `src/db/index.ts`.
**Lens:** `.agents/skills/nodejs-backend-patterns/SKILL.md` — error handling, validation pipelines, idempotency, signature verification, rate-limit patterns, logging discipline, structured errors, async/await, resource cleanup, secrets, lazy singletons.
**Read-only.** No source edits.

---

## TL;DR

The backend surface is small (3 route handlers, 2 actions, ~8 server `lib/*` files) but punches well above its weight for a portfolio project: Zod-validated request pipelines, idempotent Stripe webhooks with documented failure-mode trade-offs, signature verification with raw bodies, constant-time auth compare, lazy singletons for every external client (Stripe, Resend, Neon), and an explicit kill-switch via `SESSION_VERSION`. The code is reviewed-against-itself (numerous `CR-XX` / `WR-XX` cross-refs to `.planning/phases/03-…`). What's missing maps cleanly to scale, not correctness:

- **In-process state that doesn't survive horizontal scale**: `lib/rate-limit.ts` Map and the lazy singletons.
- **Console-based logging** everywhere; no structured logger, no correlation IDs, leaks credentials-shaped info (`username`) into logs.
- **Inconsistent error model**: handlers return `{ error: string }` ad-hoc; no shared `AppError` / discriminated `Result` type as the skill recommends.
- A couple of small **input-validation gaps** in `/api/calendar` and `getNotificationRecipient` env trust.

Severity legend: **[H]** high (security/correctness/data integrity), **[M]** medium (operational/scale), **[L]** low (code-quality/consistency).

---

## Findings

### 1. `/api/webhooks/stripe/route.ts` (419 lines)

**Strong** overall — this is the most carefully written file in scope.

- **[H][OK] Signature verification** uses raw `await request.text()` body before any JSON parse, then `stripe.webhooks.constructEvent(body, sig, secret)`. Correct. Failure path returns 400 (`'Invalid signature'`), never 500 — so Stripe doesn't retry forever on a misconfigured `STRIPE_WEBHOOK_SECRET`. (lines 71–84)
- **[H][OK] Idempotency** on `checkout.session.completed` keyed by `stripePaymentIntentId` with a UNIQUE column. The two-phase model (insert booking → send email → mark `emailSentAt`) is reasoned about in detail in the docstring on lines 53–67, including the deliberate decision to *swallow* email errors so Stripe retries don't double-insert via the DB short-circuit, with a `MANUAL_FOLLOWUP_REQUIRED` log marker (lines 254–263). This is exactly the pattern the skill calls "structured failure-mode mapping" and it's better than most production systems.
- **[H][OK] Metadata revalidation** via Zod (`checkoutCompletedMetadataSchema`, lines 25–51) — `packageId` / `reservationId` / `durationMinutes` are coerced from strings with NaN-rejection refinements, closing the "Workbench-replayed event with edited metadata → `db.insert({ packageId: NaN })`" hole the comment calls out.
- **[H][OK] Refund handler** (`handleChargeRefunded`, lines 334–380) is idempotent (early-return when `status === 'cancelled'`) and looks up by `paymentIntentId` not by an event id.
- **[M] Unknown event types silently 200 (line 109).** Reasonable for noise control, but log a warn-level marker with the event type so the operator notices when Stripe adds a relevant event that should be wired up. Today an event-type rename ships without a tripwire.
- **[M] No replay-window check.** Stripe `constructEvent` already enforces `tolerance` (default 5 min) on `t=` timestamp, so this is OK by default — worth a code comment recording the assumption so a future "let me bump tolerance" doesn't open a long-replay window.
- **[L] Logging discipline.** Mixes `console.log/warn/error` with structured-ish prefixes (`[webhook]`, `[webhook][MANUAL_FOLLOWUP_REQUIRED]`). No `pino`/`winston`. Operationally fine at one process, but you'll lose correlation when you add a second one. Same observation applies to every other file in scope.

### 2. `/api/checkout/route.ts` (215 lines)

- **[H][OK] Server-side re-validation** via `checkoutRequestSchema.safeParse(rawBody)` + `validateBookingDateAgainstCalendar` reproduces the client gates server-side — the CR-03 curl-bypass note is correct and the implementation matches.
- **[H][OK] Race-free slot reservation.** Three-layer defense: (1) live confirmed-booking pre-check, (2) live pending-reservation pre-check, (3) DB `UNIQUE(package_id, event_date)` translated to a clean 409 via `isUniqueViolation()` (lines 203–215). The `isUniqueViolation` recursion through `.cause` is the right way to catch Drizzle/Neon's nested driver errors.
- **[M] Try/catch envelopes the entire body.** The single outer `try` (line 15) catches everything including Stripe API failures, DB read failures, and validation failures (already handled inline). Skill recommends per-step `try` with typed errors and an `asyncHandler` wrapper. Practically this means a Stripe outage today returns a generic `'Failed to create checkout session'` — fine for users, but the logged error (`console.error('[checkout] Error creating session:', error)`) is the only signal you'll have when Stripe is degraded vs. the DB is degraded vs. CalDAV is degraded.
- **[L] `revalidateTag` swallowing is correct but inconsistent.** The webhook has the same try/catch around `revalidateTag` factored into `safeRevalidateAvailability`. Here it's inline (lines 172–177). Worth extracting for symmetry.
- **[M] No request size cap.** `request.json()` will happily parse a multi-MB body even though the schema would later reject most of it. Next 16 has a default 1MB limit on the App Router so this is mostly defensive — note for future when bumping `bodySizeLimit`.
- **[L] Cleanup query runs unconditionally on every checkout** (line 57: `delete pendingReservations where expiresAt < NOW()`). That's fine traffic-wise today but the skill's pattern is a background job / cron-style sweep, not "amortize cleanup over the hot path." Acceptable trade-off given there is no scheduler — call this out in a comment.

### 3. `/api/calendar/route.ts` (37 lines) — **[H] needs hardening**

- **[H] No input validation.** `const { startDate, endDate } = await request.json()` then directly passes both into `new Date(...)`. A non-string field or a missing field gives `Invalid Date` which `fetchCalendarEventsForRange` then sends to CalDAV. The route does check truthy presence (lines 8–13) but not type, not range, not "is `endDate > startDate`", not "is the range bounded" — a curl with `{ startDate: "2000-01-01", endDate: "2099-01-01" }` will issue a 100-year CalDAV query.
- **[H] Error response leaks internals.** Line 31: `message: error instanceof Error ? error.message : String(error)` is unconditional, not gated on `NODE_ENV`. The `details` field on line 32 is gated, but `message` is not — a CalDAV auth failure could surface `Basic auth failed for user philip@...` to any caller. Skill: "Don't leak error details in production."
- **[H] No authentication.** This route reads from iCloud and returns the photographer's full calendar (titles, times, durations). It's called from server components today but the route is HTTP-reachable. Anyone with the URL gets event titles. Either (a) drop this route and call `fetchCalendarEventsForRange` directly server-side, or (b) require an auth cookie / shared secret.
- **[M] No rate limit.** Combined with the previous: an anonymous attacker can hammer CalDAV through this route at zero cost to themselves, getting you rate-limited by iCloud.
- **[L] Zod schema would fix all three input issues** in 6 lines — same shape as `checkoutRequestSchema`.

### 4. `src/app/actions/contact.ts`

- **[H][OK] Zod-validated payload** via `contactFormSchema`, structured field errors returned to the form. Clean.
- **[L] Catch on line 82 logs `err` directly** (`console.error('saveContact error:', err)`). For a DB error that includes the SQL `err.message` may include user-supplied content reflected back into the log. Low risk because this is a server log, but the skill recommends `logger.error({...})` with a curated shape, not the whole error object.
- **[L] No rate-limit on the contact form.** The login action gets `loginRateLimiter`; the contact form is wide open. Mass-submission DoS / spam vector — at minimum reuse `RateLimiter` keyed on IP from the headers list.

### 5. `src/app/actions/admin-auth.ts`

- **[H][OK] Constant-time compare** via `node:crypto.timingSafeEqual` with explicit length-mismatch short-circuit (lines 39–44). This is the textbook implementation.
- **[H][OK] Zod-validated input** (lines 21–23) prevents the `formData.get('password') as string` foot-gun called out in the docstring.
- **[H][OK] Rate-limit before validation.** Order matters — checking the limiter before parsing means an attacker can't burn validation cost. Correctly implemented (lines 53–61).
- **[M] `getClientKey` falls back to `'unknown-client'`** for any request missing `x-forwarded-for`. That means *every* such request shares a single bucket — fine on Vercel (always sets the header) but a self-host or proxy misconfig collapses all attackers into one limit bucket, which is *less* secure (5 attempts/15min across all attackers). Consider extracting from `cf-connecting-ip`, `x-real-ip` as fallbacks before the catch-all.
- **[L] `process.env.ADMIN_PASSWORD` read on every request** (line 72). Cheap, but inconsistent with the eager-resolve pattern in `session.ts:resolveSessionSecret`. Either eager-validate at module load (preferred — fail-fast on deploy) or accept the consistency hit.

### 6. `src/lib/rate-limit.ts` — **[M] scale concern, correct semantics**

- **[OK] Burst + cooldown semantics** are well-specified in the docstring and the tests (`rate-limit.test.ts`, 154 lines).
- **[M] In-memory `Map`** — `loginRateLimiter` is a process-local singleton. The docstring (lines 12–15) calls this out explicitly: "Vercel serverless can spin up multiple isolated lambdas, so this is best-effort throttling." Correct identification of the limit; the fix isn't in this file. Path forward documented (Vercel KV / Upstash).
- **[M] No TTL eviction.** The `Map` grows unbounded — every unique client key (or every `'unknown-client'` hit if the header is missing) stays forever. For login, the attack surface is bounded by how many unique IPs you see; still, a janitor that drops entries with `windowStart < now - burstWindowMs - cooldownMs` would prevent slow memory growth in long-lived processes. Not a problem on Vercel (cold starts reclaim), is one if you ever move to a Node server.
- **[L] No test for the unbounded-Map growth** — would be a 3-line test asserting `store.size` after N stale keys, paired with a `sweep()` method.

### 7. `src/lib/stripe.ts`, `src/lib/email.ts`, `src/db/index.ts` — lazy singleton pattern

- **[OK] All three** correctly defer external-client construction so a missing env var doesn't crash at module-load (and so the test suite can run without a key). `stripe.ts` and `email.ts` use plain `_resend ??= new Resend(...)` / `_stripe ??= new Stripe(...)`; `db/index.ts` adds a Proxy with explicit symbol short-circuits — the docstring (lines 30–40 of `db/index.ts`) calls out the "accidental `await db` treats it as a thenable" foot-gun, which is exactly right.
- **[L] `stripe.ts` Proxy is a thinner version of the same idea** but doesn't short-circuit `Symbol.iterator` / `then` / `Symbol.toPrimitive`. Today nothing tries to `await stripe` or `JSON.stringify(stripe)`, so it's latent. Adopting the same `has`/`get` shape as `db/index.ts` would make them symmetric and future-proof.
- **[H][OK] API version pinning** (`stripe.ts:7`) is the right move — `Stripe.LatestApiVersion` typing means an SDK bump surfaces as a type error.
- **[L] `email.ts:11` `process.env.RESEND_API_KEY!`** non-null assertion — silently constructs a `Resend('')` if unset and fails at `.send()` time. Mirror `db/index.ts`'s explicit `if (!url) throw new Error(...)` pattern for consistency.
- **[M] `getNotificationRecipient` (email.ts:61–66)** trusts `BOOKING_NOTIFICATION_EMAIL` after only a basic regex check. A misconfigured env var like `BOOKING_NOTIFICATION_EMAIL=attacker@evil.com` would silently redirect operator emails. The constraint is operational (who can set the env var) but worth documenting: changes to that env var should be audited.

### 8. `src/lib/serverCalendar.ts` — **[M] logging hygiene**

- **[H] Credentials-adjacent info in logs.** Line 54: `console.log(\`[calendar] Connecting to ${server} as ${username}\`)`. The username here is the iCloud account email — PII. It will land in Vercel logs. Drop it, or hash it.
- **[L] 11 `console.log` calls** in normal-path code paths (lines 50, 54, 64, 67, 75, 86, 96, 142). At one CalDAV fetch per page render this is heavy. Promote to `info` level on a structured logger gated by `LOG_LEVEL`, or drop the per-calendar enumeration (line 75) which is dev-debug noise.
- **[OK] Error handling on individual VEVENT parse** (lines 133–139) is correct — one bad event doesn't poison the whole result.
- **[L] No timeout on `client.fetchCalendars()` / `client.fetchCalendarObjects()`.** If iCloud hangs, the request hangs (server route eventually 504s on Vercel's 10s/60s edge). Wrap in `Promise.race` against an `AbortSignal.timeout(5000)` and treat timeout as "calendar unavailable" — `validateBookingDateAgainstCalendar` already has the right "best-effort, log and continue" semantics for this (lines 240–246 of `validation/booking.ts`).

### 9. `src/lib/session.ts`

- **[H][OK] Eager secret validation** with `≥32` char check, with a deliberate test-environment escape hatch documented in the docstring (lines 27–32). Correct.
- **[H][OK] `SESSION_VERSION` kill-switch** (`isSessionValid`, lines 65–67) — bumping the env invalidates all live sessions without DB writes. Elegant.
- **[OK] Cookie options:** `httpOnly: true`, `sameSite: 'lax'`, `secure` gated on prod, 7-day max. Standard.

### 10. Cross-cutting

- **[M] No shared error model.** Every handler hand-rolls `NextResponse.json({ error: '...' }, { status: N })`. The skill's `AppError` / `ValidationError` / `NotFoundError` hierarchy + a single `errorHandler` middleware would centralize the "don't leak in prod" decision currently duplicated in `/api/calendar` (and arguably violated there). Next.js route handlers don't get Express middleware for free, but a `withErrors(handler)` wrapper that catches typed errors and maps to status codes would be a 30-line improvement.
- **[M] No `Result<T, E>` discriminated union.** `validateBookingDate` does use one (`{ ok: true } | { ok: false; reason: string }`) — well done. That pattern should propagate to `saveContact`, `loginAction`, and the route handlers' helpers.
- **[L] No structured logger.** Every file uses `console.*` with `[prefix]` strings. `pino` is mentioned in the skill; even just a `lib/logger.ts` wrapping `console` with `{ level, msg, ...fields }` JSON output would make Vercel log search 10× more useful.
- **[L] No correlation ID propagation.** A Stripe webhook for a checkout that was racing CalDAV that was racing the rate limiter has no shared id across log lines. `request.headers.get('x-request-id') ?? randomUUID()` threaded into every log call closes this.
- **[L] No `aborted` / `req.signal` honoring.** Long CalDAV fetches don't cancel when the client closes the connection. Low-impact on Vercel (forced 10–60s timeout) but the skill calls "resource cleanup" out by name.

---

## Prioritized action list

| # | Sev | File | Action |
|---|---|---|---|
| 1 | H | `api/calendar/route.ts` | Add auth (or remove HTTP exposure), Zod input schema, gate `error.message` behind `NODE_ENV !== 'production'`. |
| 2 | H | `lib/serverCalendar.ts:54` | Stop logging the iCloud username. |
| 3 | M | `actions/contact.ts` | Add IP-keyed rate limit reusing `RateLimiter`. |
| 4 | M | `lib/rate-limit.ts` | Document the migration path inline (already in docstring) and add a `sweep()` method for long-lived processes. |
| 5 | M | `lib/serverCalendar.ts` | Wrap CalDAV calls in `AbortSignal.timeout(5000)`. |
| 6 | M | cross-cutting | Add `lib/errors.ts` (`AppError` hierarchy) + `withErrors(handler)` wrapper; thread through all 3 routes. |
| 7 | L | `lib/email.ts:11` | Replace `process.env.RESEND_API_KEY!` with explicit `if (!key) throw`. Mirror `db/index.ts`. |
| 8 | L | `lib/stripe.ts` Proxy | Add symbol / `then` short-circuit to match `db/index.ts`. |
| 9 | L | cross-cutting | Introduce `lib/logger.ts` (pino or hand-rolled JSON); migrate `console.*` calls behind it. |
| 10 | L | `api/webhooks/stripe/route.ts:109` | `console.warn` unhandled event types with the event type string. |

## Files referenced

- `/Users/philipsun/Documents/personal websit/src/app/(main)/api/webhooks/stripe/route.ts`
- `/Users/philipsun/Documents/personal websit/src/app/(main)/api/checkout/route.ts`
- `/Users/philipsun/Documents/personal websit/src/app/(main)/api/calendar/route.ts`
- `/Users/philipsun/Documents/personal websit/src/app/actions/contact.ts`
- `/Users/philipsun/Documents/personal websit/src/app/actions/admin-auth.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/rate-limit.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/stripe.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/email.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/session.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/serverCalendar.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/validation/booking.ts`
- `/Users/philipsun/Documents/personal websit/src/lib/validation/contact.ts`
- `/Users/philipsun/Documents/personal websit/src/db/index.ts`
