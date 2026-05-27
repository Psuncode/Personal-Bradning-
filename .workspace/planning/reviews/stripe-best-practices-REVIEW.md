# Stripe Best-Practices Review

Reviewer lens: `.agents/skills/stripe-best-practices/SKILL.md` (+ `references/payments.md`, `references/security.md`).
Scope: `src/lib/stripe.ts`, `src/app/(main)/api/checkout/route.ts`, `src/app/(main)/api/webhooks/stripe/route.ts`, `src/app/__tests__/webhook.test.ts`, `src/app/__tests__/checkout.test.ts`.
Status: read-only audit. No source changes proposed inline.
Date: 2026-05-19.

---

## TL;DR

The integration is in very good shape against the skill checklist. It uses the **correct API surface** (Checkout Sessions for an on-session one-time payment — the canonical recommendation in `payments.md`), pins the SDK API version typedly, verifies webhook signatures on a raw body, and has thoughtfully tuned the 2xx-vs-5xx contract so Stripe retries hit only the conditions that benefit from retry. Idempotency is real (DB-keyed by `payment_intent` + `email_sent_at` watermark) and well-tested.

Findings are almost entirely either **(a) advisory / future-leaning** (API version drift, RAK migration) or **(b) minor hardening opportunities** (one webhook-level swallow, two metadata-string limits, no native Stripe `idempotency_key` on session create). Nothing is a release-blocker.

Severity legend: **Critical** (must fix before live), **Major** (fix this milestone), **Minor** (nice-to-have), **Advisory** (future / ops).

---

## Checklist results

### 1. API version pinning — PASS

`src/lib/stripe.ts:7`

```ts
export const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2026-02-25.clover';
```

- Typed via `Stripe.LatestApiVersion` so an SDK upgrade that drops `2026-02-25.clover` becomes a typecheck error rather than a silent runtime drift. This is the **exact pattern the skill recommends** ("flags as a typecheck/upgrade, not a runtime surprise").
- The comment block referencing `CR-04` is a model of intent-preserving documentation — leave it.

**Advisory (A-01): API version is one release behind.** Skill header notes the current latest is **`2026-04-22.dahlia`**. `clover` (Feb 2026) → `dahlia` (Apr 2026) is a normal quarterly bump. There is no urgency, but plan to:
1. Read the changelog between `clover` and `dahlia`.
2. Bump in `src/lib/stripe.ts`, run `npm run build` (typecheck will validate the literal against `Stripe.LatestApiVersion`), and replay webhook fixtures in test mode.
3. Watch for Checkout Session shape changes in `metadata`, `amount_total`, `payment_intent` (none expected in this minor cycle, but worth a CLI `stripe events replay` sanity sweep).

### 2. Webhook signature verification — PASS

`src/app/(main)/api/webhooks/stripe/route.ts:69-84`

- Reads the **raw body** via `request.text()` *before* anything else — required for HMAC verification (would silently fail if anything called `request.json()` first).
- Header presence check returns 400 (`Missing stripe-signature header`).
- `stripe.webhooks.constructEvent` throw → 400 (`Invalid signature`). Skill: "Do not process webhook events without verifying their signatures" — satisfied.
- `STRIPE_WEBHOOK_SECRET` read from env, not committed. Good.

**Advisory (A-02): Defense-in-depth — Stripe IP allowlist.** `references/security.md` recommends additionally allowlisting Stripe's webhook source IPs. This is a Vercel / edge-config concern, not code. Worth a deploy-time runbook entry; not a code change.

### 3. Idempotency — PASS (with one nuance)

The integration uses a **two-layer** idempotency model:

1. **DB-level** (line 134-158): `SELECT … FROM bookings WHERE stripe_payment_intent_id = ?`. If the row exists, branch on `emailSentAt`:
   - `emailSentAt IS NOT NULL` → ack 200 immediately.
   - `emailSentAt IS NULL` → re-attempt the email, then 200.

   This is **better than the naive "row-exists → no-op" pattern**, because it correctly handles the failure mode "DB insert succeeded, email send died, Stripe retried". Excellent.

2. **DB-level race protection** at checkout via `UNIQUE(package_id, event_date)` (per the `CR-02` comments at `route.ts:62-79`) + Postgres `23505` → 409 translation.

**Minor (M-01): No `idempotency_key` on `stripe.checkout.sessions.create`.** The Stripe API supports an idempotency key header per request. With it, a transient network error that causes the client to retry the **same** `/api/checkout` POST would not create a second Stripe session. Today the DB-side `pendingReservations` insert + 30-min TTL absorbs most of this, but a true idempotency key would also prevent **two distinct sessions** from being created for the same reservation hand-off if the upstream caller retries while the DB write succeeded but the Stripe call hung. Suggested:

```ts
// pseudo — not a patch
const session = await stripe.checkout.sessions.create(
  { /* ... */ },
  { idempotencyKey: `reservation-${reservation.id}` }
);
```

Low priority — the current architecture makes this rare.

### 4. Checkout Session metadata pattern — PASS

`checkout/route.ts:148-158` packs everything the webhook needs (`packageId`, `clientName`, `clientEmail`, `clientPhone`, `clientNotes`, `eventDate`, `reservationId`, `durationMinutes`) into `metadata`. Re-validated **strictly** on the webhook side with `checkoutCompletedMetadataSchema` (`webhooks/stripe/route.ts:25-51`). The schema correctly:

- coerces stringified ints (`packageId`, `reservationId`, `durationMinutes`),
- rejects NaN / non-positive values,
- validates `eventDate` parses as an ISO date,
- bounds `durationMinutes` to `(0, 1440]`.

**Minor (M-02): 500-char metadata-value limit not enforced at write time.** Stripe enforces ≤500 chars per metadata value and ≤50 keys. `clientNotes` is user-supplied free text. The `checkoutRequestSchema` (presumably in `@/lib/validation/booking`, not in scope) should cap notes — if it doesn't, a 600-char note would 400 at `stripe.checkout.sessions.create`. Verify there.

**Minor (M-03): PII in metadata.** `clientEmail`, `clientName`, `clientPhone`, `clientNotes` are stored in Stripe metadata, which is visible to anyone with Dashboard read access (and to whoever holds the secret key). This is a common pattern and not strictly wrong, but `references/security.md` advises minimizing exposed PII surface. Two mitigations to consider down the road:
- Store only `reservationId` in metadata and rehydrate the rest from the `pendingReservations` row on webhook receipt.
- Or accept the trade-off (current code is simpler and audit-friendly).

### 5. Error handling — 200 vs 5xx for retry semantics — PASS

The contract is explicitly documented in `webhooks/stripe/route.ts:53-67` and matches Stripe's retry model:

| Scenario | Status | Stripe retries? | Correct? |
|---|---|---|---|
| Missing/invalid signature | 400 | No | Yes — signature is not retried, log+drop |
| Invalid metadata shape (Zod fail) | 400 | No | Yes — a replay won't fix bad metadata; manual intervention required |
| DB insert fails | 500 | Yes | Yes — retry produces no orphan because the unique key is `payment_intent` |
| DB insert succeeds, email fails | 200 | No | Yes — the booking row's `email_sent_at IS NULL` is the work-queue; logged as `MANUAL_FOLLOWUP_REQUIRED` |
| Unhandled event type | 200 | No | Yes — silently ack to avoid retry storms |
| Handler throws (uncaught) | 500 | Yes | Yes — outer try/catch on line 102-106 |

The `MANUAL_FOLLOWUP_REQUIRED` structured log marker (line 254-263) is a good ops hook. Confirm it triggers a log alert in production.

**Minor (M-04): `handleChargeRefunded` swallows the "unknown payment_intent" case as a no-op 200** (`route.ts:352-358`). That's correct for refunds against payments made by other systems pointing at the same Stripe account, **but** if the booking really should exist (e.g. someone refunded a `pi` that we lost via a DB restore), we'd silently lose the cancellation signal. Consider an additional ops-loud `console.warn` with `[REFUND_WITHOUT_BOOKING]` so this is at least monitorable. Currently it logs at `warn` level but without a grep-friendly marker.

### 6. Event handler coverage — PASS

Covered: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`, `payment_intent.payment_failed`.

This is the minimum-viable set for a Checkout-Session-based deposit flow. Spot checks:

- `checkout.session.completed` → creates `bookings` + `payments` rows, deletes `pendingReservations`, sends emails, busts availability cache. ✓
- `checkout.session.expired` → drops the pending hold so the slot frees up before the 24h Stripe TTL or the local 30-min sweep. Falls back to deleting by `stripe_session_id` if `metadata.reservationId` is absent. ✓
- `charge.refunded` → marks booking `cancelled`, marks payment `refunded`, busts cache. Idempotent (no-op if already cancelled). ✓
- `payment_intent.payment_failed` → drops pending reservation by session id if available; otherwise relies on TTL sweep. ✓ (and honestly noted as best-effort in the comment).

**Advisory (A-03): Consider adding `checkout.session.async_payment_failed` / `async_payment_succeeded`.** Today only card payments are likely enabled, so async methods (ACH, SEPA, BACS) aren't in play. If you ever turn on dynamic payment methods in the Dashboard (per `payments.md`), these events become relevant. Add when needed, not before — premature wiring is its own bug surface.

**Advisory (A-04): No `charge.dispute.created`.** Disputes / chargebacks won't auto-cancel a booking today. For a photography deposit business this is probably an acceptable manual-review case, but worth a one-line in the ops runbook.

### 7. Test mode vs live mode patterns — PASS

- Keys are read from `process.env.STRIPE_SECRET_KEY` and `process.env.STRIPE_WEBHOOK_SECRET`. No hard-coded keys anywhere in the scoped files (✓ per `security.md` "API keys" section).
- No conditional `if (env === 'production')` switches that could create test/live drift.
- The `Stripe-CLI`-driven local replay path is supported because `constructEvent` accepts the CLI's signing secret (set the env var to the CLI-printed `whsec_...`).

**Advisory (A-05): Migrate from `sk_` to a Restricted API Key (`rk_`).** `security.md` is emphatic: "Do not default to recommending secret keys." For this app, the live secret key only needs:
- `checkout_sessions: write` (POST `/v1/checkout/sessions`)
- `webhook_endpoints: read` (for SDK internal validation; arguably unnecessary)
- nothing else — no customers list, no payment_methods list, no products write, etc.

A `rk_` scoped to those permissions would dramatically reduce blast radius if `STRIPE_SECRET_KEY` ever leaked via a process-dump, env-leak page, or rogue dependency. Migration steps in `references/security.md` §RAKs.

**Advisory (A-06): IP allowlist on the live key.** `security.md` §"IP restrictions". Vercel egress IPs are stable per region; pin them on the live `rk_` once issued.

### 8. SDK lazy initialization — PASS

`src/lib/stripe.ts:11-27` implements a `Proxy`-wrapped lazy singleton. This solves the genuine build-time pain that `new Stripe(undefined!)` would otherwise cause when the env var is unset during `next build` on a fresh CI box. The Proxy adds a tiny per-call indirection cost; in practice it's noise.

**Minor (M-05): The `Proxy` swallows the missing-key failure mode until first use.** If `STRIPE_SECRET_KEY` is unset at runtime, the failure surfaces as `TypeError: Cannot read properties of undefined (reading 'apiKey')` from deep inside the SDK on the first call. A clearer message would help on-call. Suggested (advisory, not a required change):

```ts
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, { apiVersion: STRIPE_API_VERSION, typescript: true });
  }
  return _stripe;
}
```

(Drops the `!` non-null assertion in favor of an explicit, greppable error.)

---

## Test coverage assessment

`webhook.test.ts` and `checkout.test.ts` together cover the high-value paths:

- ✓ Missing signature → 400
- ✓ Bad signature → 400
- ✓ Happy path: `bookings` + `payments` insert, emails sent, `pendingReservations` deleted
- ✓ Idempotent retry: existing booking + `emailSentAt` set → 200, no inserts, no email
- ✓ Idempotent retry: existing booking + `emailSentAt` null → 200, no insert, email re-sent, `email_sent_at` marked
- ✓ DB insert failure → 500 (so Stripe retries)
- ✓ Email failure post-insert → 200 + `MANUAL_FOLLOWUP_REQUIRED` log
- ✓ `checkout.session.expired` → reservation deleted
- ✓ Unhandled event (`charge.refunded` mock with empty object) → 200
- ✓ Checkout: malformed body, weekend, far-future date → 400
- ✓ Checkout: confirmed-booking exists → 409
- ✓ Checkout: live pending reservation → 409
- ✓ Checkout: Postgres unique-violation → 409

**Gap (Minor M-06): No explicit test for `charge.refunded`'s booking-cancellation path** (the mock at `webhook.test.ts:357` only tests the no-op shape for an empty `charge` object — it doesn't assert the `cancelled`/`refunded` status transitions). Adding one test that supplies a `charge` with `payment_intent: 'pi_test_123'` and asserts `mockUpdate` was called twice (booking + payment) would close the loop on `WR-03`.

**Gap (Minor M-07): No test for `payment_intent.payment_failed`** at all. The current handler is best-effort and short, but a basic "delete-by-session-id when metadata has it, no-op otherwise, return 200" pair would prevent regression.

**Gap (Minor M-08): No test asserting `apiVersion` is passed to the Stripe constructor.** Trivial to add — instantiate the real `getStripe()` with a stub `STRIPE_SECRET_KEY`, assert the mocked `Stripe` constructor was called with `{ apiVersion: STRIPE_API_VERSION, typescript: true }`. Guards against an accidental delete of `apiVersion` causing silent drift.

---

## Summary table

| # | Severity | Area | Finding |
|---|---|---|---|
| A-01 | Advisory | API version | One release behind latest (`clover` vs `dahlia`); plan a bump |
| A-02 | Advisory | Webhook | Add Stripe IP allowlist as defense-in-depth |
| M-01 | Minor | Idempotency | Pass `idempotencyKey` to `checkout.sessions.create` |
| M-02 | Minor | Metadata | Confirm `clientNotes` is capped ≤500 chars in `@/lib/validation/booking` |
| M-03 | Minor | PII | Consider storing only `reservationId` in Stripe metadata |
| M-04 | Minor | Refund | Add greppable marker on `charge.refunded` with unknown `payment_intent` |
| A-03 | Advisory | Coverage | Add `async_payment_failed/succeeded` when enabling non-card methods |
| A-04 | Advisory | Coverage | Add `charge.dispute.created` to ops runbook |
| A-05 | Advisory | Security | Migrate `sk_` → `rk_` with checkout-only scope |
| A-06 | Advisory | Security | IP-allowlist the live key |
| M-05 | Minor | SDK init | Replace `!` with explicit `STRIPE_SECRET_KEY` check in `getStripe` |
| M-06 | Minor | Tests | Add positive-path test for `charge.refunded` |
| M-07 | Minor | Tests | Add test for `payment_intent.payment_failed` |
| M-08 | Minor | Tests | Assert `apiVersion` is passed to `Stripe` constructor |

No **Critical** findings. No **Major** findings.

---

## Bottom line

Integration is production-shape. The two highest-leverage follow-ups, in priority order, are:

1. **A-05 (RAK migration)** — single biggest blast-radius reduction available; pure dashboard work.
2. **A-01 (API version bump to `2026-04-22.dahlia`)** — quarterly hygiene; the typed pin makes this safe.

Everything else is incremental hardening.
