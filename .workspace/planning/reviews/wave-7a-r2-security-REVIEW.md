# Wave 7a R2 — Security Re-Audit

**Scope:** `feat/blog-system-v2` @ `c6bd1e6..329dcf0`
**Auditor:** security-auditor (read-only)
**Spec:** `docs/superpowers/specs/2026-05-19-wave-7a-payment-contact-email-design.md`
**Date:** 2026-05-19

## Verdict

**APPROVE WITH ONE BLOCKER + ONE HIGH.** The CR-01 atomicity fix is real — `db.batch` on
neon-http maps to `client.transaction([...])` which the Neon serverless docs document as a
single non-interactive Postgres transaction. The rest of the original critical findings are
genuinely closed. Two outstanding issues block a clean signoff, both pre-existing in the
webhook route and acknowledged as "partial" in the commit message.

---

## BLOCKER

### B1 — Webhook secret still resolved via `process.env.X!`
**File:** `src/app/(main)/api/webhooks/stripe/route.ts:127`
**Severity:** BLOCKER (against the spec's stated criterion #5)

```ts
event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
```

The spec's stated bar: "every previous `process.env.X!` in the listed files is now
`requireRuntimeEnv` or `requireBuildEnv`. Grep for `process.env.*!` in the touched files;
should return zero." Grep returns **one hit** in `src/app/(main)/api/webhooks/stripe/route.ts:127`.
The commit message for 329dcf0 explicitly notes "partial #17" so this is a known unfinished
edge — but it's the highest-value remaining one because:

1. If `STRIPE_WEBHOOK_SECRET` is unset, `constructEvent` is called with `undefined` →
   thrown error inside the verification try/catch → caller sees `Invalid signature` with
   no log breadcrumb identifying the misconfig as the root cause.
2. The webhook is the trust boundary for confirmed bookings; silent misconfig here means
   every Stripe-originated webhook silently 400s and the operator only finds out from
   Stripe's "delivery failing" email.

**Fix:** replace with `requireRuntimeEnv('STRIPE_WEBHOOK_SECRET')`, declared at the top of
the file once (so the cache hit is a no-op on hot paths). The variable is already declared
in `KNOWN_ENV_VARS.RUNTIME_REQUIRED` in `src/lib/env.ts:36`.

Minimal repro of the surface:
```bash
unset STRIPE_WEBHOOK_SECRET
curl -X POST localhost:3000/api/webhooks/stripe -d '...' -H 'stripe-signature: t=…'
# Returns: { error: 'Invalid signature' }   ← misleading; secret is actually missing
```

---

## HIGH

### H1 — `assertNever` is NOT a compile-time exhaustiveness check
**File:** `src/app/(main)/api/webhooks/stripe/route.ts:24-26, 148-162`
**Severity:** HIGH (against stated criterion #9)

The spec requires that `assertNever` actually triggers a compile error if a new variant is
added to `HandledEventType` without a case. As implemented, it does **not**:

```ts
const handledType = event.type as HandledEventType | (string & {});   // line 136
// ... switch on handledType ...
default: {
  if (handledType === ('checkout.session.completed' satisfies HandledEventType) || ...) {
    return assertNever(handledType as never);   // ← `as never` defeats the check
  }
  return NextResponse.json({ received: true });
}
```

Three reasons this is runtime-only:
1. `event.type` is widened to `HandledEventType | (string & {})` at line 136, so the switch
   default arm always retains a `string` type — TS won't narrow it to `never`.
2. The `if`-chain that simulates exhaustiveness lists the 4 current variants as literal
   strings; adding `'invoice.paid'` to `HandledEventType` doesn't force a new branch (the
   chain still compiles).
3. The final `handledType as never` cast at the call site **erases** any compile-time
   narrowing. TypeScript trusts the cast and reports no error.

The runtime guard does work: a new `HandledEventType` variant that someone forgot to add to
the switch *would* throw at runtime if Stripe ever sends that event type. But the spec
specifically asked for compile-time. As-is, drift goes unnoticed during PR review and is
only caught when a real event arrives.

**Fix sketch:**
- Drop the `(string & {})` widening at line 136. Switch on `event.type` directly. Add cases
  for the 4 handled variants, plus a `default: assertNever(event.type)` (no cast). For unknown
  types, narrow with a separate `if`-guard *before* the switch: `if (!isHandledEventType(event.type)) return 200`.
- Or: cast-once into a `Set<HandledEventType>` guard at the top of POST, then switch over the
  exhausted union.

### H2 — Email subject lines allow CR/LF injection via user-supplied name
**File:** `src/lib/email.ts:155, 211`
**Severity:** HIGH (newly surfaced — not in the original spec)

```ts
subject: `Your session is confirmed — ${packageName}`,   // line 155
subject: `New booking: ${clientName} — ${packageName}`,  // line 211
```

`clientName` and `packageName` arrive from Stripe metadata. The webhook's
`requiredTrimmedString` rejects whitespace-only but does **not** strip control characters.
A metadata edit in the Stripe Workbench (or a future bug that lets users influence metadata
upstream) with `clientName = "Jane\r\nBCC: attacker@…"` could inject a header into the
SMTP exchange Resend constructs.

Resend's API likely sanitizes — but defense-in-depth says scrub `\r\n\t` from values that
land in headers. The `escapeHtml` sweep covered HTML bodies but not subjects.

**Fix:** add an `escapeHeader(v: string) = v.replace(/[\r\n\t]+/g, ' ').slice(0, 200)` and
route both subject interpolations through it. Or apply `CONTROL_CHARS` rejection in
`requiredTrimmedString` (broader fix; touches `common.ts`).

---

## MEDIUM

### M1 — Idempotency key uses `eventDate.toISOString()` without re-asserting normalization
**File:** `src/app/(main)/api/checkout/route.ts:170`
**Severity:** MEDIUM

The key is `sha256(\`${pkg.id}|${eventDate.toISOString()}|${clientEmail.toLowerCase()}\`)`.
`eventDate` is `normalizeEventDate(requestedEventDate)` from line 67, so this is
fine *today*. But the dependency is implicit — a future refactor that moves the
`normalizeEventDate` call up/down a few lines or replaces the local variable name will
silently break the per-customer collapse property. Add an inline assertion or a comment
binding the two.

No cross-customer collision is possible (email is in the tuple, two customers cannot share
an email by construction). ✓

### M2 — `safeRevalidateAvailability` runs before `email_sent_at` is set
**File:** `src/app/(main)/api/webhooks/stripe/route.ts:279`
**Severity:** LOW-MEDIUM

The revalidate fires immediately after the `db.batch` commits but before the email send.
If the email fails (and the booking row stays `email_sent_at = NULL`), the cached
availability is already invalidated. Not a security issue — at worst a calendar slot
disappears from the picker for the (now 2-minute) TTL. Documented as the intended trade-off
in the file header comment; flagged here for completeness only.

---

## LOW

### L1 — `getClientKey` fallback collapses to a single bucket
**File:** `src/app/actions/contact.ts:51-55`

When `x-forwarded-for` is missing, every caller falls into the `"unknown-client"` bucket
and a single attacker can lock out everyone-else-via-the-same-fallback for 1 min sustained.
This is documented in `rate-limit.ts` ("better to throttle everyone collectively than to
leave the action unbounded") and is acceptable for the current scale — but on Vercel,
`x-forwarded-for` should always be present, so a missing header in production is itself a
signal worth logging.

### L2 — Webhook signature failure logs the error object
**File:** `src/app/(main)/api/webhooks/stripe/route.ts:129`

`console.error('[webhook] Signature verification failed:', err)` — Stripe SDK errors
typically don't carry secrets, but in case future versions do, prefer `err.message` only.
Trivial.

### L3 — Schema migration safety
**File:** `drizzle/0004_spooky_strong_guy.sql`

Verified: only two `ALTER COLUMN … SET NOT NULL` statements. No drops, no type changes, no
default redefines. Pre-deploy queries are documented in commit `4822e7c`'s message:
```
SELECT count(*) FROM bookings WHERE package_id IS NULL;
SELECT count(*) FROM payments  WHERE booking_id IS NULL;
```
Both must return 0 before applying. ✓

---

## PASSED CHECKS

| # | Check | Status |
|---|---|---|
| 1 | Webhook atomicity via `db.batch` | **PASS** — `db.batch` on neon-http maps to `NeonHttpSession.batch` (`node_modules/drizzle-orm/neon-http/session.js:117-133`) which invokes `client.transaction([...])`. Neon's serverless `transaction()` is documented as "a single, non-interactive Postgres transaction" (`node_modules/@neondatabase/serverless/index.d.ts:704-705`). All three statements (booking insert + payment insert + pending delete) commit together or roll back together. The subquery `(SELECT id FROM bookings WHERE stripe_payment_intent_id = $X)` inside the payments insert is visible because Postgres executes batch statements sequentially within the same transaction. |
| 2 | Stripe signature verification — raw body | **PASS** — `request.text()` at line 118 runs before `constructEvent` at line 127. No JSON parse interposed. (Caveat: see B1 above.) |
| 3 | `idempotency_key` deterministic, no cross-customer collision | **PASS** — `sha256(packageId | eventDate.toISOString() | clientEmail.toLowerCase())`. Email is trimmed by `checkoutRequestSchema` (`src/lib/validation/booking.ts:66`), so leading whitespace doesn't shift the hash. Two different customers cannot share an email → no cross-customer collapse. |
| 4 | Contact rate-limit ordering | **PASS** — `src/app/actions/contact.ts:66-74`. The check runs after `headers()` (necessary for the IP key) but before `extractContactPayload`, before Zod parse (`contactFormSchema.safeParse`), and before any DB call. |
| 5 | Env-var coverage in scoped files | **FAIL** — One remaining `process.env.STRIPE_WEBHOOK_SECRET!` in webhook route line 127. See B1. |
| 6 | Whitespace-name rejection in `requiredTrimmedString` | **PASS** — `src/lib/validation/common.ts:38-45`. `"   "` passes `.min(1)`, trims to `""`, fails `.refine(v => v.length > 0)`. |
| 7 | NOT NULL migration safety | **PASS** — see L3. |
| 8 | `escapeHtml` coverage in email HTML bodies | **PASS** — every user-controlled interpolation in `sendBookingConfirmationEmail` (`src/lib/email.ts:108-114, 124-147`) and `sendPhilipNotificationEmail` (`src/lib/email.ts:192-204`) flows through `escapeHtml`. Subject lines are **not** escaped — see H2 (separate issue). |
| 9 | Webhook event exhaustiveness via `assertNever` | **FAIL** — runtime-only, not compile-time. See H1. |

---

## Notes on out-of-scope surfaces (Wave 7b)

Not audited: `src/proxy.ts`, `src/lib/serverCalendar.ts`, `src/app/(main)/api/calendar/route.ts`,
`BookingForm.tsx`, `PhotographyBookingForm.tsx`, CalDAV plumbing. Will be revisited when Wave
7b lands (Cal.com pivot).

## Summary

The Wave 7a refactor delivered the architectural wins it promised — atomic webhook writes
are real, the env registry is sound, the rate-limiter is correctly ordered, the schema
migration is safe, and the HTML email sweep is thorough. The two outstanding issues are
narrow and fixable in a single short commit: replace one `process.env.X!`, tighten one
`assertNever` site, and (defense-in-depth) sanitize email subject lines.

Recommend B1 + H1 + H2 land as a follow-up commit before merge; M1/L1/L2 can defer.
