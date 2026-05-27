---
review: zod
date: 2026-05-19
reviewer: code-review-agent
zod_version: ^4.4.3
scope:
  - src/lib/validation/contact.ts
  - src/lib/validation/booking.ts
  - src/app/actions/admin-auth.ts
  - src/app/(main)/api/webhooks/stripe/route.ts
  - src/app/actions/contact.ts (consumer)
  - src/app/(main)/api/checkout/route.ts (consumer)
status: source-only review, no edits made
---

# Zod schema review

## Summary

The validation layer is in good shape overall: every Server Action / API boundary uses `safeParse`, `z.infer` is used everywhere a type is exported, and shared limits are pulled into module-level constants (`CONTACT_LIMITS`, `BOOKING_LIMITS`). The biggest correctness/consistency issue is a **v3-vs-v4 syntax mismatch in the Stripe webhook**, which still uses the deprecated `z.string().email()` form (and a `clientName: z.string().min(1)` that silently accepts whitespace-only metadata). Everything else is polish: a couple of refinements after `.transform` that can never fire, two near-duplicate "optional trimmed string" snippets that should collapse into the `optionalTrimmed` helper already living in `contact.ts`, and one shared `Email` / `Name` / `OptionalTrimmedString` schema worth extracting into `src/lib/validation/common.ts`.

---

## Top findings (prioritized)

### 1. CRITICAL — v3/v4 syntax inconsistency in `webhooks/stripe/route.ts`

**File:** `src/app/(main)/api/webhooks/stripe/route.ts:25-51`

The webhook metadata schema is the only place still using the **v3** top-level email validator and the v3 `min`-arity error message form:

```ts
clientEmail: z.string().email(),
packageName: z.string().min(1),
clientName: z.string().min(1),
```

`contact.ts` and `booking.ts` correctly use the **v4** form (`z.email({ message: ... })`). With zod `^4.4.3`, `z.string().email()` still works but is deprecated and will be removed; it also produces a less-helpful default error message than `z.email()`. Worse, `clientName: z.string().min(1)` admits `"   "` (a single space passes `min(1)`), which then flows straight into `db.insert({ clientName: "   " })`. The contact/booking schemas defend against this with `.transform((v) => v.trim()).refine((v) => v.length > 0, ...)`.

Recommendation (do not edit per scope):
- `z.string().email()` → `z.email({ message: 'clientEmail must be a valid email.' })`
- Add `.transform((v) => v.trim()).refine((v) => v.length > 0, ...)` to the three name/string-min fields, or — better — pull them through the shared `Name` schema proposed in finding (3).
- `clientPhone: z.string().optional().default('')` and `clientNotes: z.string().optional().default('')` also drift from the `optionalTrimmed` pattern used in `contact.ts`/`booking.ts` — see finding (3).

**Rules invoked:** `schema-string-validations`, `error-custom-messages`, `compose-shared-schemas`.

---

### 2. HIGH — dead refinements after `.transform` in `contact.ts` and `booking.ts`

**Files:**
- `src/lib/validation/contact.ts:37-45` (name), `56-63` (message)
- `src/lib/validation/booking.ts:50-57` (clientName)

Pattern, in all three places:

```ts
z.string()
  .min(1, { message: 'Name is required.' })   // (A) reject empty pre-trim
  .max(...)
  .transform((v) => v.trim())                  // (B) trim
  .refine((v) => v.length > 0, { message: 'Name is required.' });  // (C) reject whitespace-only post-trim
```

Step (A) and step (C) overlap but do not cover each other:
- (A) rejects `""` but accepts `"   "` (passes `min(1)`).
- (C) rejects `"   "` after trim. This is the one doing the real work.
- So (A) is actually redundant *for correctness* (any string that fails A also fails C), but it's not dead — it's there to produce the same error message earlier. That's fine.

However, the order produces a subtle UX bug: `"   "` reaches (B) and (C), gets the same "Name is required." message, but with a different `path` history through the issues array. More importantly, the comment intent is clearer if we move to a single `.transform(...).pipe(z.string().min(1))` or `.transform(...)` then `.refine(...)`. The current "min → transform → refine same condition" reads as a defensive triple-check; consider documenting it inline or extracting:

```ts
const RequiredTrimmedString = (max: number, label: string) =>
  z.string()
    .max(max, { message: `${label} must be ${max} characters or fewer.` })
    .transform((v) => v.trim())
    .refine((v) => v.length > 0, { message: `${label} is required.` });
```

This eliminates three near-identical 8-line blocks across two files.

**Rules invoked:** `compose-shared-schemas`, `refine-transform-coerce`, `compose-pipe`.

---

### 3. HIGH — `optionalTrimmed` helper lives in `contact.ts` but the exact pattern is re-inlined in `booking.ts` (phone, notes) and in the webhook (clientPhone, clientNotes)

**Files:**
- Helper defined: `src/lib/validation/contact.ts:18-24`
- Re-inlined: `src/lib/validation/booking.ts:66-83` (phone, notes — 18 lines that match the helper modulo the control-char check on phone)
- Drifted v3 form: `src/app/(main)/api/webhooks/stripe/route.ts:34-35` (`clientPhone`, `clientNotes` use `z.string().optional().default('')` which has *different* semantics: empty string ≠ undefined, default `''` on missing key)

There is no `src/lib/validation/common.ts`. Extracting one would let all three consumers share:

```ts
// src/lib/validation/common.ts (proposed — do not create per scope)
export const CONTROL_CHARS = /[\x00-\x1f\x7f]/;
export const optionalTrimmed = (max: number, opts?: { rejectControlChars?: boolean }) => { ... };
export const Email = (max = 320) => z.email({...}).max(max, ...).transform(v => v.trim());
export const RequiredTrimmedString = (max: number, label: string) => { ... };
```

The webhook is the most divergent: its `clientPhone: z.string().optional().default('')` will produce `''` (not `undefined`) on a missing metadata key, then `meta.clientPhone || null` at line 168 papers over it. That's a smell — the schema should hand the consumer the right shape directly.

**Rules invoked:** `compose-shared-schemas`, `object-optional-vs-nullable`, `refine-defaults`.

---

### 4. MEDIUM — `eventDate` is validated twice with subtly different rules

`checkoutRequestSchema.eventDate` (booking.ts:88-100) parses ISO/Date into a `Date` and rejects NaN. Good. Then `validateBookingDate` re-runs `!(date instanceof Date) || Number.isNaN(...)` at booking.ts:135. After `safeParse` succeeds, `parsed.data.eventDate` is guaranteed to be a valid Date, so the re-check is dead in the API path. It is *not* dead when callers use `validateBookingDate` directly (tests), so it's defensible — but worth a comment, or better, swap to a branded `ValidDate` type so the second check is a no-op via the type system. Rule: `parse-avoid-double-validation` (mild).

Separately, the webhook parses `eventDate` as a string only (`route.ts:36-38`) and then does `new Date(meta.eventDate)` at the consumer (line 169, 229, 238). The schema knows the value is a parseable ISO string, but does not deliver a `Date`. Consider `.transform((s) => new Date(s))` so consumers don't repeat `new Date(...)` three times. Rules: `refine-transform-coerce`, `type-input-vs-output`.

---

### 5. MEDIUM — `admin-auth.ts` `LoginSchema` lacks custom error messages and a `password` trim policy

`src/app/actions/admin-auth.ts:21-23`:

```ts
const LoginSchema = z.object({ password: z.string().min(1).max(1024) });
```

- No `{ message: ... }` on `min(1)` / `max(1024)`. The caller throws away the message anyway (`return { error: 'Password is required.' }`), but the default zod message would leak through if anyone consumed `parsed.error.flatten()` later. Low impact.
- A leading/trailing space in `ADMIN_PASSWORD` env vs submitted password is currently a hard mismatch (intended for constant-time security). Document that intent in a comment.
- The schema is single-use and not exported — fine, but if a second admin Server Action is ever added (`changePassword`, `rotateSecret`), the `Password` field should live in a shared module to keep the `max(1024)` cap consistent.

**Rules invoked:** `error-custom-messages`, `compose-shared-schemas`.

---

### 6. LOW — `coercion-for-form-data` not used; manual `extractContactPayload` instead

`contact.ts:97-115` hand-builds the payload from `FormData` before calling `safeParse`. That's defensible (it lets the function be unit-tested) but it duplicates work zod can do via `z.coerce.string()` / a `FormData`-aware schema. Not a bug — calling out as a v4 idiom that could simplify the action.

Booking's `route.ts:16` uses `await request.json()` instead of FormData, so no coercion is needed there.

**Rules invoked:** `schema-coercion-for-form-data` (informational).

---

## Missing schemas for other Server Actions / boundaries

A grep of `'use server'` + API routes covers:

| Boundary | Validation today | Verdict |
| --- | --- | --- |
| `actions/contact.ts` → `contactFormSchema` | safeParse + flatten | OK |
| `actions/admin-auth.ts` → `LoginSchema` | safeParse | OK, minor polish (finding 5) |
| `api/checkout/route.ts` → `checkoutRequestSchema` | safeParse | OK |
| `api/webhooks/stripe/route.ts` → `checkoutCompletedMetadataSchema` | safeParse | needs v4 cleanup (finding 1) |
| `api/webhooks/stripe/route.ts` → other event types (`checkout.session.expired`, `charge.refunded`, `payment_intent.payment_failed`) | manual `parseMetadataInt`, type assertions | **gap** — see below |
| `lib/serverCalendar.ts` (CalDAV fetch) | none | response is internal-origin; arguably fine, but a zod schema on the external CalDAV payload would catch upstream regressions cheaply |
| `api/calendar/route.ts` (referenced in CLAUDE.md) | not opened in this review — recommend a follow-up scan |

**Gap detail:** `handleCheckoutExpired` (route.ts:292), `handleChargeRefunded` (route.ts:334), `handlePaymentFailed` (route.ts:392) all read `session.metadata?.X` or `pi.metadata?.X` via raw type-narrowing and `parseMetadataInt` (route.ts:286-290). The `checkoutCompletedMetadataSchema` could be `.partial()`-ed or `.pick({ reservationId: true })`-ed and reused here:

```ts
const ExpiredMetadataSchema = checkoutCompletedMetadataSchema.pick({ reservationId: true }).partial();
const FailedPaymentMetadataSchema = z.object({ checkoutSessionId: z.string().min(1).optional() });
```

That eliminates the bespoke `parseMetadataInt` helper. **Rules invoked:** `object-pick-omit`, `object-partial-for-updates`, `compose-shared-schemas`.

---

## Inference patterns — clean

- `ContactFormInput = z.infer<typeof contactFormSchema>` (contact.ts:79)
- `CheckoutRequestInput = z.infer<typeof checkoutRequestSchema>` (booking.ts:103)
- `CheckoutCompletedMetadata = z.infer<typeof checkoutCompletedMetadataSchema>` (webhook route.ts:207)

All three correctly use `z.infer` (the output type, which is what consumers want — these schemas all have `.transform`s). None of them currently need `z.input`, which would matter only if a caller built the unparsed shape (e.g. for a form library); the current call sites all hand raw `Record<string, unknown>` to `safeParse`, so `z.infer` is the right pick. **Rule:** `type-input-vs-output` — satisfied.

One nit: the inferred type for `contactFormSchema` produces `referer: string | undefined` because of the transform chain, which the action correctly handles via `data.referer ?? null` (actions/contact.ts:79). The webhook's `clientPhone: z.string().optional().default('')` produces `string` (because of `.default('')`), which then needs `meta.clientPhone || null` (route.ts:168) — inconsistent with the contact pattern. Pick one (recommendation: `undefined`-on-empty, like `optionalTrimmed`).

---

## Error handling — mostly correct

- `actions/contact.ts:58` uses `parsed.error.flatten().fieldErrors` — correct (`error-use-flatten`).
- `api/checkout/route.ts:22` joins `parsed.error.issues.map(i => i.message)` — fine for a JSON API but loses `path`; consider `${i.path.join('.')}: ${i.message}` like the webhook does at route.ts:120. **Rule:** `error-path-for-nested`.
- `actions/admin-auth.ts:68` discards the error entirely — intentional for a login endpoint to avoid leaking validation hints. Good.

---

## Refinements & transforms — small issues

- `booking.ts:90-100` uses `ctx.addIssue({ code: 'custom', ... }); return z.NEVER` correctly. Tightening: the `code: 'custom'` literal works in v4 but `z.ZodIssueCode.custom` is the typed form; either is fine. **Rule:** `refine-vs-superrefine` — passes.
- `contact.ts:30-34` `.refine((v) => !CONTROL_CHARS.test(v), ...)` runs *before* `.transform(v => v.trim())`. That's correct (you want to reject control chars in the raw input), but worth a comment.
- No `.refine((v) => true, ...)` patterns / no thrown errors inside refinements. **Rule:** `error-avoid-throwing-in-refine` — passes.

---

## Performance & bundle — no issues

Schemas are defined at module top-level (cached). No dynamic schema creation in hot paths. **Rule:** `perf-cache-schemas` — passes. Zod Mini not warranted at this site size.

---

## Action items (suggested, do not apply now)

1. **[Top priority]** Migrate `checkoutCompletedMetadataSchema` to v4 (`z.email`, trim-and-refine for name strings, `.transform(new Date)` for `eventDate`).
2. Create `src/lib/validation/common.ts` exporting `optionalTrimmed`, `Email`, `RequiredTrimmedString`, `CONTROL_CHARS`. Refactor contact/booking/webhook to consume it.
3. Reuse `checkoutCompletedMetadataSchema.pick(...)/.partial()` in the three secondary webhook handlers; delete `parseMetadataInt`.
4. Add custom messages to `LoginSchema`; document the no-trim policy for passwords.
5. Audit `src/app/api/calendar/route.ts` (out of scope here) for a missing zod schema on the request side.
