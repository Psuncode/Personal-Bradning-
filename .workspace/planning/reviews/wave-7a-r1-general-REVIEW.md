---
status: needs_attention
diff_range: c6bd1e6..329dcf0
commits_reviewed: 7
findings: { critical: 0, warning: 4, info: 6, total: 10 }
generated_at: 2026-05-19
---

## Foundation cohesion

- `src/lib/env.ts` cleanly delivers `requireBuildEnv` / `requireRuntimeEnv` / `optionalEnv` with a private `runtimeCache` + a `__resetEnvCache()` test hook. Public surface matches every downstream consumer:
  - `src/lib/session.ts:4,55` (`requireBuildEnv` + `optionalEnv`)
  - `src/lib/stripe.ts:2,16` (`requireRuntimeEnv`)
  - `src/lib/email.ts:6,15` (`requireRuntimeEnv`)
  - `src/db/index.ts:6,21` (`requireRuntimeEnv`)
  - `src/app/(main)/api/checkout/route.ts:15,160` (`requireBuildEnv`)
- `KNOWN_ENV_VARS` is documentation-only (no runtime consult), which matches the spec but means drift is undetected. **[INFO]** registry lists `STRIPE_WEBHOOK_SECRET`, `ADMIN_PASSWORD`, `BOOKING_NOTIFICATION_EMAIL`, `NODE_ENV`, `ICAL_*` as known but the codebase still reads several through bare `process.env` (see Backlog #17 row below).
- `src/lib/validation/common.ts` exports `CONTROL_CHARS`, `Email`, `requiredTrimmedString`, `optionalTrimmed`, `boundedString`. **[WARNING]** Only `CONTROL_CHARS` and `requiredTrimmedString` are actually imported by consumers in this diff. `Email`, `optionalTrimmed`, and `boundedString` are dead exports — the spec promised consumers (contact/booking) would migrate to them but `src/lib/validation/contact.ts` was not touched and still defines its own private `optionalTrimmed` + `CONTROL_CHARS` (lines 15–24). Booking pulls `CONTROL_CHARS` only.
- `src/lib/validation/event-date.ts` exposes the single `normalizeEventDate(input)` API the spec promised; consumers (`checkout/route.ts:13,67`, `webhooks/stripe/route.ts:16,58`) import correctly. UTC-midnight semantics match the docstring + tests.

## Cross-commit integration

- **Webhook still bypasses the env registry.** `src/app/(main)/api/webhooks/stripe/route.ts:127` uses `process.env.STRIPE_WEBHOOK_SECRET!`. The env registry lists `STRIPE_WEBHOOK_SECRET` under `RUNTIME_REQUIRED` and `src/lib/env.ts:26` explicitly says “never `process.env.X!`” — the parallel webhook commit (329dcf0) did not pick this up even though commits 235ad64/d83dba0 migrated every other secret. **[WARNING]** This is a direct violation of the spec's "Apply `requireRuntimeEnv` for ... webhook secrets" line and partially fails Backlog #17.
- **`db.batch` type cast.** `webhooks/stripe/route.ts:268-270` casts `db` to `{ batch: (statements: readonly unknown[]) => Promise<ReadonlyArray<ReadonlyArray<{id:number}>>> }`. Drizzle's actual `batch` signature is `BatchItem<'pg'>` with mapped result types. The cast erases Drizzle's typed return values and the `[bookingInsert, paymentInsert, ...]` tuple type — any future caller adding a SELECT statement would lose its typed result with no compile-time warning. The cast was needed because `batchStatements` is typed as a tuple-with-`unknown[]`-rest (line 256). A cleaner approach is `db.batch([bookingInsert, paymentInsert] as const)` followed by a conditional spread, but that's a refactor, not a bug. **[INFO]**
- **`assertNever` exhaustiveness sink is fictional.** Lines 136-162: `handledType` is widened to `HandledEventType | (string & {})` (i.e. `string`), so the switch's default arm always matches at compile time and the `assertNever` call is only reached at runtime via an `if` chain of literal string equality. If a new variant is added to `HandledEventType` and no case is added to the switch, **the TypeScript compiler will not complain** — the new variant just falls through to the `if` chain, fails every equality check, and returns 200. Backlog #16 was supposed to "fail to compile if a variant is added without a case"; the current implementation does not deliver that. **[WARNING]**
- **Build-tier env-var resolved at module load only in checkout's POST handler.** `src/app/(main)/api/checkout/route.ts:160` calls `requireBuildEnv('NEXT_PUBLIC_PHOTOGRAPHY_URL')` inside the request handler, not at module top-level. The spec line ("`requireBuildEnv` ... to fail at build, not silently fall back to `localhost:3000`") suggested top-level fail-fast. As written, the build will succeed even if the env var is missing, and the first checkout request will 500. Effect is still safer than the old localhost fallback (no silent revenue loss), but not "fail at build" as written. **[WARNING]**
- **`Email`, `optionalTrimmed`, `boundedString` from `common.ts` are unused.** Wave 7a's spec said these are the shared replacements for the duplicates in contact/booking. Booking only adopted `CONTROL_CHARS`; webhook adopted `requiredTrimmedString`. Contact was not touched. **[WARNING]** Dead code now, partial Backlog #14 closure.
- No missed imports or type mismatches detected between commits. Foundation commits (env → common → event-date) imported cleanly into the four downstream surfaces.

## Backlog coverage

| Item | Status | Evidence |
|---|---|---|
| #1 webhook atomicity | Closed | `webhooks/stripe/route.ts:229-270` uses `db.batch([bookingInsert, paymentInsert, ...delete])`; tests `__tests__/webhook.test.ts:380-395` cover mid-batch rejection → 500. Verified `drizzle-orm/neon-http/session.js:117-132` wraps in `client.transaction`. |
| #2 PHOTOGRAPHY_URL fallback | Closed | `checkout/route.ts:160` `requireBuildEnv('NEXT_PUBLIC_PHOTOGRAPHY_URL')`. No localhost fallback remains. Caveat: resolved per-request, not at module load (see Cross-commit). |
| #5 eventDate precision | Closed | `event-date.ts` normalizes to UTC midnight; `checkout/route.ts:67`, webhook schema line 58 both pipe through. |
| #6 NOT NULL | Closed | `drizzle/0004_spooky_strong_guy.sql` + `schema.ts:99,141` add `.notNull()` to `bookings.packageId` and `payments.bookingId`. Pre-deploy SELECT queries are documented in 4822e7c commit message per spec rollout step 4. |
| #7 Zod v3→v4 + whitespace | Closed | `webhooks/stripe/route.ts:52` uses `z.email()`; lines 50-51 use `requiredTrimmedString` so `"   "` rejects. Test at `webhook.test.ts:413`. |
| #8 contact rate-limit | Closed | `actions/contact.ts:66-74` wires `contactRateLimiter.check(clientKey)` **before** Zod parse. Test `contact.test.ts:194-226` exercises burst+denial. |
| #10 escapeHtml sweep | Closed | `lib/email.ts:108-114,192-196` escapes every user-controlled `${...}` (including `siteConfig` interpolations and `formattedDate/Time/Deposit`). |
| #11 native idempotency_key | Closed | `checkout/route.ts:168-207` derives sha256 from `(pkg.id, eventDate.iso, email.lower)` and passes `{ idempotencyKey }` as the Stripe options arg. |
| #14 common helpers | Partial | `common.ts` exists; `requiredTrimmedString` adopted in webhook; `CONTROL_CHARS` adopted in booking. `contact.ts` retained its private duplicates of `optionalTrimmed` + `CONTROL_CHARS`. `Email`/`optionalTrimmed`/`boundedString` exports are unused. |
| #15 eventDate transform | Closed | `webhooks/stripe/route.ts:55-58` `.transform((s) => normalizeEventDate(s))`. |
| #16 assertNever | Not closed | The exhaustiveness sink does not actually fail to compile when a new `HandledEventType` variant is added (see Cross-commit). The runtime if-chain mimics it but offers no compile-time guarantee. |
| #17 process.env.X! sweep | Partial | `STRIPE_SECRET_KEY` (stripe.ts), `RESEND_API_KEY` (email.ts), `DATABASE_URL` (db/index.ts), `SESSION_SECRET` (session.ts) — all migrated. **`STRIPE_WEBHOOK_SECRET!` still bare** at `webhooks/stripe/route.ts:127`. `BOOKING_NOTIFICATION_EMAIL` still uses raw `process.env.X?.trim()` at `email.ts:66,184` (registered as `OPTIONAL_WITH_DEFAULT` so `optionalEnv` would be appropriate). |
| #18 ContactFormFieldErrors mapped type | Closed | `actions/contact.ts:16-18` is `Partial<Record<keyof z.infer<typeof contactFormSchema>, string[]>>`. Test `contact.test.ts:230-246`. |
| #19 race window | Closed | `checkout/route.ts:118-130` calls `revalidateTag(...)` BEFORE the `db.insert(pendingReservations)`. Comment explains the reasoning. |

## Regressions / risks

- **No production regressions detected.** Test suite: 420/436 pass; 16 failing tests are CLAUDE.md-flagged pre-existing carve-outs (home/about/case-studies/current-focus). New tests (env, common, event-date, rate-limit, webhook, checkout, contact) all pass. Lint: 0 errors, 3 unused-var warnings (`_` in `assertNever`, `_strings`/`_values` in test sql stub).
- **New TS errors in `src/lib/session.test.ts`** (lines 56, 57, 64, 71, 78, 86, 100, 103) — assignments to `process.env.NODE_ENV` and `delete process.env.NODE_ENV` violate the read-only `NODE_ENV` type Next 16 ships. Vitest still runs these (it transpiles, doesn't typecheck), but `npx tsc --noEmit` now flags them. The spec's testing line (per Backlog #59) said to centralize via `vi.stubEnv`; this file uses raw mutation. **[INFO]** Not in the CLAUDE.md carve-out list, so this is a new typecheck regression from this wave.
- **`db.batch` semantics.** Confirmed atomic via `node_modules/drizzle-orm/neon-http/session.js:117-132` (`this.client.transaction(builtQueries)`). Neon HTTP `client.transaction` is a single round-trip Postgres transaction — the spec's claim holds. Sql-subquery FK pattern at line 249 (`SELECT id FROM bookings WHERE stripe_payment_intent_id = X` inside the payments insert) relies on the booking insert being visible to subsequent statements in the same batch; Neon's transaction wrapper makes this safe.
- **Whitespace-only metadata path.** Verified: webhook now rejects with 400 + structured `Invalid session metadata` log before Stripe is acked. Stripe will retry — operator can then fix metadata in Workbench. **[INFO]** Should monitor logs on first prod deploy.

## Code quality

- `webhooks/stripe/route.ts:268-270` — the `db as unknown as { batch: ... }` cast erases Drizzle's typed batch results. **[INFO]** Could be replaced with a typed const-tuple + conditional spread, but not a bug.
- `webhooks/stripe/route.ts:136` — `as HandledEventType | (string & {})` — the trailing `(string & {})` defeats TypeScript's literal narrowing; the subsequent switch effectively types `handledType` as `string`. **[INFO]** Combined with the broken assertNever (above), the "compile-time exhaustiveness" claim is a comment, not a contract.
- `contact.ts:81` — assignment `const fieldErrors: ContactFormFieldErrors = parsed.error.flatten().fieldErrors` — Zod's `flatten()` returns `Record<string, string[]>` not the mapped type. The implicit widen-then-assign works because the mapped type is a `Partial<Record<...>>`; safe in practice but the line would benefit from an explicit narrow or `satisfies` to catch a future schema field rename. **[INFO]**
- `event-date.ts` — implementation is correct + idempotent. No timezone gotchas (uses `getUTC*` exclusively).
- `email.ts:66,184` — `process.env.BOOKING_NOTIFICATION_EMAIL` still bare. Registry lists it as `OPTIONAL_WITH_DEFAULT: { BOOKING_NOTIFICATION_EMAIL: null }`. **[INFO]** Could be `optionalEnv('BOOKING_NOTIFICATION_EMAIL', '')` for consistency; current behavior is identical.
- `webhook.test.ts:88-99` — the `sql` mock returns `{ kind: 'sql' }`. Works because tests use `mockBatch.mockResolvedValue([[{id: 99}], ...])`, but means the test never exercises the actual SQL subquery shape. **[INFO]** Acceptable for unit tests; integration test would catch the SQL.

## Verdict

INVESTIGATE: 4 partial-closures (#14, #16, #17 webhook secret, build-tier resolution timing) plus a new typecheck regression in `session.test.ts`. The atomicity (#1), idempotency_key (#11), eventDate precision (#5), and NOT NULL (#6) wins are solid and tested. Wave is **safe to push** in the sense that no functional regression exists and the security/atomicity goals are met — but four spec promises landed short of the design contract, and a follow-up commit before merge to `main` is the cleaner path. Recommended fix list for a Wave 7a.1 follow-up:
1. Migrate `STRIPE_WEBHOOK_SECRET` to `requireRuntimeEnv` (closes #17 fully).
2. Hoist `requireBuildEnv('NEXT_PUBLIC_PHOTOGRAPHY_URL')` to module load in checkout/route.ts.
3. Either remove the now-dead `Email`/`optionalTrimmed`/`boundedString` exports from `common.ts` OR migrate `contact.ts` to use them (closes #14 fully).
4. Replace the fictional `assertNever` sink with a real never-narrowing switch (drop the `(string & {})` widen; type `event.type as HandledEventType` and use a fall-through `default` that genuinely receives `never`).
5. Switch `session.test.ts` to `vi.stubEnv('NODE_ENV', ...)` to clear the new `npx tsc --noEmit` errors.

Path: `/Users/philipsun/Documents/personal websit/.planning/reviews/wave-7a-r1-general-REVIEW.md`
