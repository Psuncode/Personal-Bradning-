---
status: green
total_tests: 436
pre_wave: 366/16
post_wave: 420/16
new_tests: 54
carve_outs_unchanged: yes
---

## Test totals

| Metric | Pre-Wave-7a baseline | Post-Wave-7a (clean run) | Delta |
|---|---|---|---|
| Total tests | 382 | 436 | +54 |
| Passing | 366 | 420 | +54 |
| Failing | 16 | 16 | 0 |
| Test files | (54) | 58 | +4 |

Per-file deltas (counted by `it(` declarations in `git show c6bd1e6:<file>` vs working tree):

- `src/lib/env.test.ts` — NEW, 12 cases
- `src/lib/validation/common.test.ts` — NEW, 13 cases
- `src/lib/validation/event-date.test.ts` — NEW, 8 cases
- `src/lib/stripe.test.ts` — NEW, 2 cases (smoke + module-load shape)
- `src/app/__tests__/webhook.test.ts` — +5 (16 → 21)
- `src/app/__tests__/checkout.test.ts` — +4 (7 → 11)
- `src/app/actions/contact.test.ts` — +2 (8 → 10)
- `src/lib/rate-limit.test.ts` — +4 (8 → 12)
- `src/lib/session.test.ts` — +1 (11 → 12)
- `src/db/index.test.ts` — +1 (3 → 4)

Sum of countable `it(...)` deltas: 52. Run-time delta: 54. Two-case gap is consistent with `.each` / nested `describe` block-level reporting and is not material — the wave-spec target was "~+50" and the count comfortably clears it.

## Coverage table

### New files

| File | New behavior | Test added | Quality |
|---|---|---|---|
| `src/lib/env.ts` | `requireBuildEnv` — throws naming the var, mentions `.env.local` + Vercel, returns value on hit | ✓ | 4 cases incl. empty-string rejection and message-format pinning |
| `src/lib/env.ts` | `requireRuntimeEnv` — lazy eval, caches first read, clear error, returns value | ✓ | 4 cases; cache verified by mutating env after first read |
| `src/lib/env.ts` | `optionalEnv` — default on unset, default on empty string, value on set | ✓ | 3 cases cover all branches |
| `src/lib/validation/common.ts` | `CONTROL_CHARS` regex matches/rejects | ✓ | Hex literals (`\x00`, `\x07`, `\x1f`, `\x7f`) + Unicode printable negative |
| `src/lib/validation/common.ts` | `Email` schema accepts valid, rejects malformed (`foo@`, `@bar.com`, empty) | ✓ | 4 round-trip cases |
| `src/lib/validation/common.ts` | `requiredTrimmedString` — rejects empty/whitespace with field-named message, accepts + trims | ✓ | Asserts exact error string |
| `src/lib/validation/common.ts` | `optionalTrimmed` — empty / whitespace / undefined → `undefined`; trim on valid | ✓ | All 4 branches |
| `src/lib/validation/common.ts` | `boundedString` (bonus) — over-cap rejection with field name, trim, empty → undefined | ✓ | 3 cases |
| `src/lib/validation/event-date.ts` | DST in March + November | ✓ | Both DST boundaries pinned to UTC midnight |
| `src/lib/validation/event-date.ts` | Cross-timezone (`-08:00`) → UTC calendar day | ✓ | Explicit contract assertion: `2026-08-15T22:00-08` → `2026-08-16Z` |
| `src/lib/validation/event-date.ts` | ISO string + Date object inputs | ✓ | Both type paths covered |
| `src/lib/validation/event-date.ts` | Idempotency (`normalize(normalize(x)) === normalize(x)`) | ✓ | Direct assertion |
| `src/lib/validation/event-date.ts` | Invalid string / invalid Date → `TypeError` | ✓ | 2 negative cases |

### Modified files (NEW behavior in Wave 7a)

| File | New behavior | Test added | Quality |
|---|---|---|---|
| `webhook.test.ts` | `db.batch` mid-array rejection → 500, no emails, no `email_sent_at` mark | ✓ | "returns 500 when db.batch rejects mid-array (CR-01 atomicity)" |
| `webhook.test.ts` | Zod v4 happy-path metadata parse (backlog #15) | ✓ | End-to-end 200 through `POST` |
| `webhook.test.ts` | Whitespace-only `clientName` rejected up-front (backlog #7) | ✓ | Asserts 400 + no DB/email side-effects + log marker |
| `webhook.test.ts` | `eventDate` normalized to UTC midnight before insert (HI-02) | ✓ | Inspects `valuesSpy.mock.calls[0][0].eventDate.toISOString()` |
| `webhook.test.ts` | `assertNever` / unknown event ack with 200 | ✓ | `customer.subscription.updated` 200s without DB writes |
| `checkout.test.ts` | `requireBuildEnv` error path when `NEXT_PUBLIC_PHOTOGRAPHY_URL` unset | ✓ | Asserts 500 + `stripe.create` never called |
| `checkout.test.ts` | `revalidateTag` BEFORE pending-reservation insert (#19) | ✓ | Ordered `callOrder` log proves precedence |
| `checkout.test.ts` | Deterministic `idempotencyKey` passed to Stripe (#11) | ✓ | Asserts length ≥ 32 and stability across two equal calls |
| `checkout.test.ts` | `normalizeEventDate` at the boundary — metadata carries midnight ISO (#5, #15) | ✓ | Inspects `stripe.create` params metadata |
| `contact.test.ts` | Rate-limit denial short-circuits before Zod + DB (CRM #8) | ✓ | 5 successes + 6th denied + no DB call on denial |
| `contact.test.ts` | Mapped-type field errors keyed by schema field names (CRM #18) | ✓ | Asserts `fieldErrors.name`, `.email`, `.message` shape |
| `rate-limit.test.ts` | `contactRateLimiter` singleton — under, at, after burst, isolation | ✓ | 4 new cases on the singleton specifically |
| `session.test.ts` | Tiered-env-registry diagnostic on missing `SESSION_SECRET` | ✓ | Pins exact regex `/\.env\.local.*Vercel project settings/s` |
| `db/index.test.ts` | Tiered-env-registry diagnostic on missing `DATABASE_URL` | ✓ | Same pinned phrasing — keeps registry contract uniform |

## Gaps

None against the brief. Minor enhancement opportunities (NOT regressions, NOT blockers):

- `src/lib/stripe.test.ts` is a thin smoke test (2 cases). Acceptable given `stripe.ts` is mostly a registry wrapper, but future hardening could assert the error message format directly.
- `optionalEnv` does not have an explicit "value containing only whitespace → returned as-is" case. The current empty-string semantics suggest whitespace would be returned verbatim, but no test pins that.
- `event-date.test.ts` covers DST boundaries at UTC offsets but no test exercises a local-time input parsed in a non-UTC `Intl` environment. Low risk given normalizer operates purely in UTC.

## Regressions

**None introduced by Wave 7a.**

The clean-run failure set is exactly the 16 pre-existing carve-outs documented in `CLAUDE.md`:

- `src/components/sections/about.test.tsx` — 4 failures
- `src/components/sections/case-studies.test.tsx` — 3 failures
- `src/components/sections/current-focus.test.tsx` — 3 failures
- `src/app/__tests__/home.test.tsx` — 6 failures

Total: 16 — unchanged.

Observation worth flagging (not a regression): on the first cold-cache run of the full suite, `checkout.test.ts > returns 400 on a malformed body (CR-03)` failed once with a 5022 ms timeout. Running `checkout.test.ts` in isolation passes all 11 cases (~2.5 s total), and the second full-suite run also passed it cleanly. This looks like a slow first-run dynamic-import warmup against the heavily-mocked checkout route — worth watching in CI but not a Wave 7a regression. Recommendation: bump the per-test timeout for `checkout.test.ts` from 5 s to 10 s if it flakes in GitHub Actions.

## CI workflow check

`.github/workflows/ci.yml` runs:

```
npm run test -- --run --exclude '**/{home,about,case-studies,current-focus}.test.tsx'
```

Excluded files (counted from working tree):

- `home.test.tsx` — 7 tests (6 fail + 1 pass)
- `about.test.tsx` — 4 tests (all fail)
- `case-studies.test.tsx` — 4 tests (3 fail + 1 pass)
- `current-focus.test.tsx` — 3 tests (all fail)

Total excluded: 18 tests, of which 16 fail. Expected CI count: 436 − 18 = **418 passing / 0 failing**. This matches the wave's stated goal: a clean green CI run while the carve-outs remain quarantined.

## Verdict

Wave 7a ships all required test coverage cleanly — every helper in the new env/validation registry is round-trip tested, every modified route asserts its new behavior, the carve-out failure set is byte-identical to the pre-wave baseline, and the CI workflow's exclude list aligns with a fully-green run.
