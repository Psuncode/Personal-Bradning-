# Stripe Upgrade Review

**Date:** 2026-05-19
**Scope:** `src/lib/stripe.ts`, `src/app/(main)/api/checkout/route.ts`, `src/app/(main)/api/webhooks/stripe/route.ts`
**Reviewer lens:** `upgrade-stripe` skill (security-flagged — read-only reference; no commands executed)

> Skill content was flagged at install time. It was read as reference material only;
> no commands, scripts, or instructions embedded in the skill body were executed,
> and no source files were modified during this review.

---

## TL;DR

The current integration is **modern, idiomatic, and free of deprecated APIs**. Every signal looked at — SDK pin, API-version pin, webhook signature verification, Checkout Sessions usage, type imports — is on the recommended pattern. The only "upgrade path" worth considering is a forward bump of SDK + API version from **`clover` (2026-02-25) → `dahlia` (2026-04-22)**, and that is optional, not a fix for anything broken.

---

## Inventory

| Surface | File | Status |
|---|---|---|
| SDK package | `package.json` → `stripe: ^20.4.1` | Current major; installed `20.4.1`. |
| SDK init | `src/lib/stripe.ts` | Lazy singleton via `Proxy`, `apiVersion` pinned via `Stripe.LatestApiVersion`. |
| API version constant | `STRIPE_API_VERSION = '2026-02-25.clover'` | Matches installed SDK's `LatestApiVersion`. |
| Checkout creation | `src/app/(main)/api/checkout/route.ts` | `stripe.checkout.sessions.create({ mode: 'payment', line_items: [{ price_data, quantity }], … })` — current pattern. |
| Webhook signature | `src/app/(main)/api/webhooks/stripe/route.ts` | `stripe.webhooks.constructEvent(rawBody, sig, secret)` with `await request.text()`. Correct. |
| Event types | `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`, `payment_intent.payment_failed` | All still current; no renamed/removed events through `dahlia`. |
| Types pattern | `import Stripe from 'stripe'` + `Stripe.Event`, `Stripe.Checkout.Session`, `Stripe.Charge`, `Stripe.PaymentIntent`, `Stripe.LatestApiVersion` | Idiomatic for v18+ SDK; no deprecated namespaces. |
| Client-side Stripe.js | (none) | No `@stripe/stripe-js` / `loadStripe` / `js.stripe.com` script tag — redirect-only Checkout flow, so Stripe.js versioning is not in scope. |

---

## Per-question findings

### 1. SDK version (`package.json`)

- Pinned: `^20.4.1`, installed `20.4.1`.
- The SDK's `apiVersion.d.ts` reports `LatestApiVersion = '2026-02-25.clover'` — code is in lockstep with installed types.
- **Not deprecated.** Major 20.x is the current Node SDK line at the time the codebase was last touched.
- **Optional forward path:** Stripe's `dahlia` release (API `2026-04-22.dahlia`) is the next major. If/when the team adopts it, the typical sequence is:
  1. `npm install stripe@latest` (whichever major ships `dahlia` in its `LatestApiVersion`).
  2. Let TS catch the `Stripe.LatestApiVersion` mismatch on `STRIPE_API_VERSION` — the explicit type annotation here is doing exactly the "fail at typecheck, not at runtime" job called out in the inline comment (CR-04). That's the recommended pattern; keep it.
  3. Replay representative webhook payloads via Stripe Workbench against the upgraded local handler before flipping production webhook endpoint version.
- **No urgency.** Nothing in `clover → dahlia` removes any field, parameter, or event currently consumed.

### 2. Checkout Session creation — "v1 vs v2"

There is no Stripe-published "v2 Checkout Sessions API". The current call uses the canonical shape:

```ts
stripe.checkout.sessions.create({
  mode: 'payment',
  customer_email,
  line_items: [{ price_data: { currency, unit_amount, product_data: { name, description } }, quantity: 1 }],
  metadata: {...},
  success_url, cancel_url,
})
```

All fields are still supported in `dahlia`. No upgrade required.

Minor optional-not-required notes (style, not deprecation):

- Ad-hoc `price_data` on every create is fine for a deposit that varies per package. If the catalogue ever stabilises, hoisting to pre-created Stripe Prices would let the dashboard surface revenue cleaner — purely an ergonomic call.
- `success_url` uses `{CHECKOUT_SESSION_ID}` template — still the documented pattern.

### 3. Webhook `constructEvent` approach

```ts
const body = await request.text();          // raw body — correct in App Router
const sig = request.headers.get('stripe-signature');
event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
```

- Uses raw `text()` (not `json()`) — required for signature verification. Correct.
- Missing-signature guard before verifying. Correct.
- Returns 400 on verification failure (does not let Stripe retry on a tampered request). Correct.
- Returns `{ received: true }` for unhandled event types instead of 4xx — avoids unnecessary retries on event types Stripe rolls out post-deploy. Recommended pattern. Correct.
- `Stripe.Event` import path: `import Stripe from 'stripe'` and `event.data.object as Stripe.Checkout.Session` — current v20 typings. **No deprecated `Stripe.events.Event` namespace usage.**

No upgrade required.

### 4. Types pattern

- Single default import: `import Stripe from 'stripe'` — idiomatic.
- Namespace access (`Stripe.Event`, `Stripe.Checkout.Session`, `Stripe.Charge`, `Stripe.PaymentIntent`, `Stripe.LatestApiVersion`) — current.
- Explicit `STRIPE_API_VERSION: Stripe.LatestApiVersion = '…'` annotation forces a typecheck break on SDK major bump (the intended CR-04 safety net). Recommend keeping verbatim.

### 5. PaymentIntent vs Checkout Session usage

The code uses **Checkout Sessions** for the customer-facing payment surface and consumes `payment_intent` ids only as a downstream identifier (idempotency key in `bookings.stripePaymentIntentId`, refund lookup in `charge.refunded`).

- This is the correct split. There is no "use PaymentIntents directly instead" recommendation that applies here — Checkout Sessions are not deprecated and are the right tool when you don't need a custom in-page card form.
- `session.payment_intent as string` cast in the webhook is safe because `mode: 'payment'` Checkout sessions always populate it on `checkout.session.completed`. (For `mode: 'setup'` or `mode: 'subscription'` it would not — n/a here.)

---

## Deprecated APIs in use

**None found.**

Checked for, did not see:

- `stripe.charges.create` (legacy direct-charge API) — not used.
- `Stripe-Account` legacy header / `stripeAccount` per-call override — not used.
- `stripe.paymentMethods.attach` outside a PaymentIntent flow — not used.
- `customer_creation` field on Checkout — not used (and remains supported regardless).
- Legacy `webhooks.constructEventAsync` vs sync — sync `constructEvent` is the correct App Router pattern given we already have the raw text.

---

## Recommended upgrade path (optional)

Priority: **LOW — no breakage, no security exposure, no behavioural drift.**

1. Track Stripe's changelog for any `dahlia → next` API version that removes a field the code reads (`session.amount_total`, `session.currency`, `charge.payment_intent`, `pi.metadata.checkoutSessionId`). None today.
2. When ready to bump:
   - `npm install stripe@latest`
   - Update `STRIPE_API_VERSION` to the new SDK's `LatestApiVersion` literal.
   - Replay `checkout.session.completed`, `checkout.session.expired`, `charge.refunded`, `payment_intent.payment_failed` fixtures through the local handler.
   - Update the webhook endpoint's API version in the Stripe dashboard *after* the new code is deployed (otherwise Stripe will start sending payloads shaped for the new version against the old handler).
3. The `Stripe.LatestApiVersion`-typed constant means step 2's first action will surface a typecheck error pointing at exactly the constant that needs editing — the existing CR-04 guardrail is doing its job.

---

## Verdict

No fixes required. No deprecated APIs in use. Modern Checkout Sessions + webhook signature pattern. SDK and API version pinned correctly and pinned together via a typed alias. A forward bump to `dahlia` is available but optional — defer until there's a feature reason or a security advisory.
