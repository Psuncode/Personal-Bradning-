# Neon Postgres lens review — personal-website

**Scope:** `src/db/index.ts`, `src/db/schema.ts`, `drizzle/*.sql`, `drizzle.config.ts`, and every call site of `DATABASE_URL` / `DATABASE_URL_UNPOOLED`.

**Lens:** `.agents/skills/neon-postgres/SKILL.md` — Neon serverless patterns (pooled vs unpooled, `@neondatabase/serverless` HTTP driver, Drizzle integration, branching, scale-to-zero cold starts).

---

## 1. Snapshot

| Surface | What's there |
|---|---|
| Driver | `@neondatabase/serverless` ^1.0.2 via `drizzle-orm/neon-http` (HTTP-fetch transport — correct for Vercel Functions, Edge-compatible) |
| App connection | `neon(process.env.DATABASE_URL)` — pooled (`-pooler` host), single-statement HTTP. |
| Migration connection | `drizzle-kit` reads `DATABASE_URL_UNPOOLED` (falls back to `DATABASE_URL`) in `drizzle.config.ts`. |
| Lazy singleton | `src/db/index.ts` wraps the drizzle client in a `Proxy` so `neon()` is not called at import time. WR-07 (symbol/`then` short-circuit) and WR-08 (clear error on missing env) are covered by `src/db/index.test.ts`. |
| Migrations | 4 SQL files in `drizzle/`, plus snapshots + `_journal.json` checked in. |
| Consumers | 4 call sites: `actions/contact.ts`, `(main)/admin/page.tsx`, `(main)/api/checkout/route.ts`, `(main)/api/webhooks/stripe/route.ts`. |
| Runtime declarations | None of the DB-touching routes declare `runtime`. They default to Node.js — fine for `neon-http`, which works in both Node and Edge. |

---

## 2. What's working well

### 2.1 Driver / transport choice — correct for the workload
- `neon-http` is the right pick: short, stateless HTTP calls per query, no persistent connection, no PgBouncer-statement-pin gotchas, and survives Vercel Function freeze/thaw without the prepared-statement landmines that bite `postgres-js`/`pg` on pooled endpoints. ([Neon — Connection methods](https://neon.com/docs/ai/skills/neon-postgres/references/connection-methods.md))
- The pooled host (`-pooler`) is also correct for HTTP-driver app traffic and any future serverless concurrency spikes. ([Neon — Connection pooling](https://neon.com/docs/connect/connection-pooling.md))

### 2.2 Pooled-vs-unpooled split is right
- App = pooled (`DATABASE_URL`). drizzle-kit = unpooled (`DATABASE_URL_UNPOOLED`). The comment in `drizzle.config.ts` explicitly captures the reason (PgBouncer transaction mode blocks DDL). This is exactly what the Neon docs prescribe.
- `.env.local.example` documents both vars with `-pooler` vs direct hostnames, and the Vercel-Neon integration sets both automatically — minimal foot-gun surface in deploys.

### 2.3 Lazy connection pattern is genuinely clever
- The Proxy + `getDb()` lazy singleton solves two real Neon-specific problems:
  1. `neon(undefined)` throws *opaquely* deep in the driver. WR-08's friendly `DATABASE_URL is required…` message will save real on-call time when someone forgets a Vercel env var.
  2. Symbol/`then` short-circuit (WR-07) prevents accidental `await db` / `util.inspect(db)` from opening a connection mid-build (a classic Next.js prerender footgun where `neon-http` calls happen during static analysis).
- Regression tests pin this behavior. Good defensive engineering — keep it.

### 2.4 Connection caching across invocations
- Drizzle client is held in a module-level `let _db` and reused across invocations within the same warm Lambda. For `neon-http` this matters less than for WebSocket/TCP drivers (HTTP is stateless), but caching the drizzle wrapper avoids per-call schema re-binding cost. Correct shape.

### 2.5 Schema hygiene
- Real `pgEnum` for `booking_status` / `payment_status` (WR-04) — Postgres-side validation, not just Zod.
- Real `boolean` on `packages.active` (WR-03), with a defensive `USING (active = 'true')` cast in migration 0003 — and a code comment flagging the cast-failure mode for ops.
- Indexes match observed access patterns: `(package_id, event_date)` UNIQUE on bookings is the durable race backstop; `expires_at` and `stripe_session_id` on pending_reservations cover the cleanup-sweep and webhook-resolution paths.
- `$onUpdate(() => new Date())` on `bookings.updatedAt` with an explicit comment that it only covers ORM writes — honest, no overclaiming.

### 2.6 Webhook idempotency
- `handleCheckoutCompleted` checks `stripePaymentIntentId` before inserting; `emailSentAt` distinguishes "row exists, email already sent" from "row exists, email failed earlier — retry email only". Email failures are explicitly swallowed (not re-thrown) to avoid Stripe-retry → idempotent-no-op loops that would never resend the email. The reasoning is documented inline. This is exactly the right shape for at-least-once webhook delivery against a single-row UNIQUE constraint.
- `isUniqueViolation()` in `/api/checkout` sniffs `code === '23505'` and walks `.cause` chains — robust against Drizzle's wrapping of driver errors.

---

## 3. Issues found

> Severity legend: 🔴 fix before next prod deploy · 🟡 fix soon · 🟢 nice-to-have

### 🟡 N-01: No `db:migrate` / `db:generate` npm scripts
`package.json` exposes neither `db:generate` nor `db:migrate`. Today the workflow is implicit (`npx drizzle-kit generate`, `npx drizzle-kit migrate`) and `SESSION-HANDOFF.md` shows operators running these by memory. Risk:

- A future dev runs `drizzle-kit push` (no migration file, no journal entry) and silently drifts prod schema from `drizzle/` history.
- CI cannot enforce "migrations applied" without a canonical entry point.

**Fix:** add to `package.json`:
```json
"db:generate": "drizzle-kit generate",
"db:migrate":  "drizzle-kit migrate",
"db:studio":   "drizzle-kit studio"
```
Document in CLAUDE.md that `push` is forbidden — always `generate` + commit + `migrate`. Optional: a CI guard that fails when `drizzle/_journal.json` has more entries than the deployed branch's `__drizzle_migrations` table.

### 🟡 N-02: No Neon preview-branch wiring for Vercel previews
The repo assumes one Neon project / one database for all Vercel environments. There is no evidence of the Vercel-Neon "branch per preview" integration — `.env.local.example` only lists one `DATABASE_URL`, no `VERCEL_ENV`-conditional logic anywhere, no `neonctl branches create` step in PR CI.

This is the single biggest gap vs. the Neon skill's `branching.md` recommendation, and it matters here because:

- The booking-flow routes write real rows on every preview deploy. A teammate testing a checkout flow on a PR preview will mutate production-shaped data, including writing Stripe-session-linked `pending_reservations` and `bookings` rows.
- The UNIQUE(package_id, event_date) constraint means a single PR preview that books "2026-06-01 10:00" silently blocks that same slot in prod.
- Migration regressions cannot be tested in isolation: applying 0004 against prod is the first time it runs against real data.

**Fix:** enable the Vercel-Neon native integration ([Neon — Managed Vercel integration](https://neon.com/docs/guides/neon-managed-vercel-integration)) so each preview deploy gets a branch and Vercel injects per-preview `DATABASE_URL` / `DATABASE_URL_UNPOOLED`. The application code needs zero changes (env vars resolve naturally). Add a CI step or `vercel-build` hook that runs `drizzle-kit migrate` against the preview branch before the build.

### 🟡 N-03: No retry / no AbortSignal on `neon-http` calls — cold-start exposure
Neon scale-to-zero parks idle computes after ~5 min; the first query after suspend takes hundreds of ms and can occasionally exceed Vercel's default fetch timeout under load. ([Neon — Scale to zero](https://neon.com/docs/introduction/scale-to-zero.md))

- All consumers call `db.select / insert / update` directly with no `AbortSignal`, no retry, and no fetch-options override. A single cold-start fetch-rejection turns into a 500 to the user (visible in `actions/contact.ts` and `/api/checkout`).
- The Stripe webhook path is partially protected — Stripe retries — but a cold-start 500 there causes a redelivery 5 minutes later, by which point `pending_reservations.expires_at` may have lapsed and the slot was freed and re-booked.

**Fix:** wrap `neon(url, { fetchOptions: { ... } })` with an explicit AbortController (e.g. 8 s) and add a one-shot retry on the first DB call per request for transient `fetch` errors. The Neon HTTP driver supports `fetchOptions` and a custom `fetchEndpoint`. ([Neon — Serverless driver](https://neon.com/docs/ai/skills/neon-postgres/references/neon-serverless.md))

### 🟡 N-04: Multi-statement booking writes are not transactional
`handleCheckoutCompleted` does three sequential statements:
```ts
insert into bookings        // 1
insert into payments        // 2
delete from pending_reservations  // 3
```
on `drizzle-orm/neon-http`, which **cannot run transactions** (HTTP is single-statement). If step 1 succeeds but step 2 fails (cold-start, network glitch), Stripe retries the webhook → idempotency check matches the existing booking → control flow falls into the "row exists, email path" branch → step 2 **never re-runs**, leaving a confirmed booking with no `payments` row.

The risk is small (steps 2 + 3 are simple inserts/deletes, unlikely to fail mid-sequence) but real, and the schema reviewer mentions transactions only in passing.

**Fix options:**
1. Use `@neondatabase/serverless`'s `Pool` / WebSocket transport for *just this handler* (`drizzle-orm/neon-serverless` instead of `neon-http`) so a real `db.transaction(async (tx) => …)` is available. Trade-off: WebSocket needs a slightly different connection lifecycle. ([Neon — Connection methods](https://neon.com/docs/ai/skills/neon-postgres/references/connection-methods.md))
2. Or move step 2 and step 3 into the "row exists" idempotency branch — i.e. `INSERT ... ON CONFLICT DO NOTHING` on payments by `stripePaymentIntentId` (it already has a UNIQUE index), and keep the reservation delete in both paths. Simpler, no driver swap.

I'd recommend option 2.

### 🟢 N-05: `DATABASE_URL_UNPOOLED` fallback in `drizzle.config.ts` is a footgun
```ts
url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!
```
If `DATABASE_URL_UNPOOLED` is unset (e.g. a misconfigured CI runner that only has the pooled var), drizzle-kit silently runs migrations through PgBouncer, hangs on the first DDL statement, and produces the very "hung migration" mode `SESSION-HANDOFF.md` warns about. The fallback hides the misconfiguration.

**Fix:** make it strict:
```ts
url: process.env.DATABASE_URL_UNPOOLED
  ?? (() => { throw new Error('DATABASE_URL_UNPOOLED is required for migrations'); })()
```
or check at the top of the file and `process.exit(1)` with a clear message.

### 🟢 N-06: No IP allow-list, no read-replica routing
Lower-priority because traffic is small, but worth noting on the lens:
- The Neon project (assumed) does not gate access by IP — fine for Vercel Functions (variable egress IPs) but means a leaked `DATABASE_URL` is fully exploitable. ([Neon — IP allow](https://neon.com/docs/introduction/ip-allow.md))
- The admin page does `SELECT … ORDER BY created_at DESC` from both `contacts` and `bookings` on every render. At scale this would benefit from a read-replica endpoint ([Neon — Read replicas](https://neon.com/docs/introduction/read-replicas.md)), but right now the table sizes don't justify the operational cost.

### 🟢 N-07: Migration 0003 is a multi-statement "kitchen sink"
`0003_phase01_warnings.sql` mixes (a) enum creation + USING-cast on `bookings.status` and `payments.status`, (b) the `text → boolean` cast on `packages.active`, and (c) eight new indexes. Each is correct, but bundling them means a partial failure on the cast step leaves the DB in a half-migrated state that's awkward to inspect (drizzle's `__drizzle_migrations` table will not yet have the 0003 row, so `drizzle-kit migrate` will re-run the whole file — and the USING cast is idempotent only if 0003a-c all succeeded the first time).

**Fix (for next time, not this one):** prefer one migration file per *logical* change. Don't rewrite history now — 0003 has presumably already been applied to prod.

---

## 4. Verified-correct claims

To save the reader re-deriving them:

| Claim in source | Verdict |
|---|---|
| "`@neondatabase/serverless` is WebSocket-only and doesn't work in drizzle-kit" (`drizzle.config.ts` line 3) | **Half-right.** The HTTP transport is fine for queries but drizzle-kit's migrator needs multi-statement transactions, which the HTTP driver does not support. The right driver for drizzle-kit is the standard TCP `postgres` / `pg` driver, hence the unpooled URL. Phrasing is misleading but the operational conclusion (use unpooled + TCP) is correct. |
| "WR-03: Neon HTTP driver doesn't use prepared statements or sit behind PgBouncer" (`schema.ts` line 87) | **Correct.** `neon-http` is parameterized but not server-side-prepared; pooled HTTP traffic goes through Neon's HTTP proxy, not PgBouncer transaction mode. The original `text("true"/"false")` workaround was cargo-culted from `postgres-js` advice. |
| Stripe Workbench replay can mutate metadata → 500 storm without WR-01 validation | **Correct and well-mitigated.** The Zod gate on metadata closes the door. |
| `getDb()` Proxy avoids opening a connection on `await db` / `util.inspect(db)` | **Correct**, and the regression test (`src/db/index.test.ts`) exercises both the symbol path and the `then` path. |

---

## 5. Recommended next actions, ranked

1. 🟡 **N-04** — make `handleCheckoutCompleted` recoverable across partial failure (one-line `ON CONFLICT DO NOTHING` on the `payments` insert).
2. 🟡 **N-02** — turn on the Vercel-Neon integration so PR previews get isolated branches. Biggest leverage for the next 10 PRs.
3. 🟡 **N-03** — add `fetchOptions` + AbortController + one-shot retry in `src/db/index.ts:getDb()`.
4. 🟡 **N-01** — add `db:generate` / `db:migrate` scripts and document in CLAUDE.md.
5. 🟢 **N-05** — make the migration URL strict, no fallback.

None of these are blocking. The codebase is unusually well-thought-out for a personal site: the lazy-Proxy + WR-07/08 tests, the enum + UNIQUE backstop, and the email-idempotency design are above the bar for solo-developer projects.

---

## 6. Files reviewed

- `/Users/philipsun/Documents/personal websit/src/db/index.ts`
- `/Users/philipsun/Documents/personal websit/src/db/index.test.ts`
- `/Users/philipsun/Documents/personal websit/src/db/schema.ts`
- `/Users/philipsun/Documents/personal websit/drizzle.config.ts`
- `/Users/philipsun/Documents/personal websit/drizzle/0000_stale_longshot.sql`
- `/Users/philipsun/Documents/personal websit/drizzle/0001_clear_betty_ross.sql`
- `/Users/philipsun/Documents/personal websit/drizzle/0002_dusty_fat_cobra.sql`
- `/Users/philipsun/Documents/personal websit/drizzle/0003_phase01_warnings.sql`
- `/Users/philipsun/Documents/personal websit/drizzle/meta/_journal.json`
- `/Users/philipsun/Documents/personal websit/.env.local.example`
- `/Users/philipsun/Documents/personal websit/package.json`
- `/Users/philipsun/Documents/personal websit/vercel.json`
- `/Users/philipsun/Documents/personal websit/src/app/actions/contact.ts`
- `/Users/philipsun/Documents/personal websit/src/app/(main)/admin/page.tsx`
- `/Users/philipsun/Documents/personal websit/src/app/(main)/api/checkout/route.ts`
- `/Users/philipsun/Documents/personal websit/src/app/(main)/api/webhooks/stripe/route.ts`
