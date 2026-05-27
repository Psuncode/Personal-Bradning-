---
title: Drizzle ORM + Migrations Review
scope:
  - src/db/schema.ts
  - src/db/index.ts
  - drizzle/0000_stale_longshot.sql
  - drizzle/0001_clear_betty_ross.sql
  - drizzle/0002_dusty_fat_cobra.sql
  - drizzle/0003_phase01_warnings.sql
  - src/app/actions/contact.ts
  - src/app/(main)/admin/page.tsx
  - src/app/(main)/api/checkout/route.ts
  - src/app/(main)/api/webhooks/stripe/route.ts
reviewer: drizzle-skill lens
date: 2026-05-19
driver: drizzle-orm/neon-http (@neondatabase/serverless)
verdict: solid foundation with two architectural gaps (no transactions, HTTP driver tx limitation) and a handful of correctness/durability nits
---

# Drizzle ORM Review

The schema is well-thought-out for the booking domain: enums replace stringly-typed status columns (WR-04), a real boolean replaced the `text("true"/"false")` workaround (WR-03), and the `UNIQUE(package_id, event_date)` on `bookings` is the right durable backstop for double-booking. Indexes cover the obvious hot paths (FKs, `created_at`, `status`, `expires_at`). The lazy-init Proxy in `src/db/index.ts` is genuinely clever and well-tested.

That said, this is a payment-processing surface with multi-statement writes that need atomicity, and the driver choice (`neon-http`) materially constrains what's possible. The findings below are ranked by impact.

## Critical (CR)

### CR-01 — Stripe webhook writes are non-atomic, and the chosen driver can't fix it

**File:** `src/app/(main)/api/webhooks/stripe/route.ts`, lines 162–203 (`handleCheckoutCompleted`) and 367–375 (`handleChargeRefunded`).

`handleCheckoutCompleted` issues three writes against three different tables in sequence with no transaction:

```ts
const [booking] = await db.insert(bookings).values({ ... }).returning();   // 1
await db.insert(payments).values({ bookingId: booking.id, ... });          // 2
if (meta.reservationId !== undefined) {
  await db.delete(pendingReservations).where(...);                         // 3
}
```

If step 2 fails (transient Neon hiccup, unique-violation on `payments_stripe_payment_intent_id_unique` from a partially-completed earlier retry, etc.), you end up with a `bookings` row but no `payments` row and a still-live `pending_reservations` row. The webhook returns 500, Stripe retries, the idempotency check at lines 134–158 finds the booking and short-circuits, but `payments` never gets written and the pending reservation is never cleaned up.

Same shape in `handleChargeRefunded` (bookings.status → cancelled, then payments.status → refunded — two separate writes).

The fix in a normal Drizzle stack is `await db.transaction(async (tx) => { ... })`. **But:** `drizzle-orm/neon-http` (the driver picked in `src/db/index.ts`) does **not support multi-statement transactions** because the underlying `@neondatabase/serverless` HTTP shim is one-statement-per-request. It only supports `db.batch([...])` (atomic but no read-then-write inside the same tx) or the `neon` WebSocket pool (`neon-serverless`) which does support real transactions.

Two viable fixes, pick one:

1. **Switch the runtime driver to `neon-serverless` (WebSocket pool)** and wrap all multi-step writes in `db.transaction`. Keep `neon-http` only for read-mostly Server Components if cold-start matters.
2. **Use `db.batch([insertBooking, insertPayment, deletePending])`** for the payload that doesn't need a read-then-write dependency. Note: step 2 currently reads `booking.id` from `step 1`'s `.returning()`, so batch alone doesn't cover it — you'd need to generate the booking id client-side (uuid PK instead of serial) or accept a logical split.

Severity: **CRITICAL** — payment-handler invariants leak into observability/billing reconciliation, and the current code path masks the failure mode because the idempotency check makes the second retry look like success.

### CR-02 — `payments.bookingId` FK should be `NOT NULL`

**File:** `src/db/schema.ts:141`, `drizzle/0000_stale_longshot.sql:57`.

```ts
bookingId: integer("booking_id").references(() => bookings.id),
```

A `payments` row without a `bookingId` is nonsensical in this domain (every payment is a deposit for a booking; refunds reuse the same `stripe_payment_intent_id`). The only call site (`webhooks/stripe/route.ts:177`) always sets `bookingId: booking.id`, so adding `.notNull()` is a no-op for current writes and prevents future regressions.

Also worth considering: `ON DELETE RESTRICT` (current is `no action`, which behaves the same here but is less explicit). You almost certainly never want a `bookings` row deleted while its `payments` rows live on as orphans.

Severity: **CRITICAL** for data-integrity invariants; easy fix (`ALTER TABLE "payments" ALTER COLUMN "booking_id" SET NOT NULL;` after backfilling — currently no orphans exist).

## High (HI)

### HI-01 — `bookings.packageId` FK is nullable

**File:** `src/db/schema.ts:99`. `pendingReservations.packageId` was correctly tightened to `NOT NULL` in migration 0002 with the comment "orphan holds are not insertable". The exact same rationale applies to `bookings.packageId` — a confirmed booking without a package is meaningless. The webhook inserts always provide `packageId: meta.packageId` (validated to integer > 0 by the Zod schema at line 30), so this is safe to tighten.

### HI-02 — `eventDate` equality match is timezone/precision-fragile

**File:** `src/app/(main)/api/checkout/route.ts:67–73` and `:87–93`.

```ts
.where(and(eq(bookings.packageId, pkg.id), eq(bookings.eventDate, eventDate)))
```

`eventDate` is a `timestamp with time zone` (good), but the equality match assumes the client always submits the exact same instant. Validation in `validateBookingDateAgainstCalendar` likely snaps to a fixed grid (9:00, 9:30, ...), but I didn't see a `date_trunc` or normalize step in this route. If a client submits `2026-06-01T15:00:00.123Z` vs `2026-06-01T15:00:00.000Z`, the precheck misses and the `UNIQUE(package_id, event_date)` constraint also misses (timestamps with different millis are different rows). Recommend either:
- Normalize `eventDate` to a known grid (`date_trunc('minute', ...)` or app-side `setSeconds(0,0)`) before any of these three writes (precheck SELECT, pending insert, booking insert), or
- Use a generated column / functional unique index on `date_trunc('minute', event_date)`.

Severity: **HIGH** because this is the entire point of the unique constraint.

### HI-03 — No index on `bookings.stripe_payment_intent_id` *lookup* path

The column is `UNIQUE` (auto-creates a btree), so the webhook idempotency SELECT (line 134) is fast — **not a finding**, scrub that. Leaving this anchor here for traceability since I considered it.

### HI-04 — `payments` table has no unique index on `(bookingId, status)` or similar

Refunds (`handleChargeRefunded:367`) do `UPDATE payments SET status='refunded' WHERE stripe_payment_intent_id = ?`. That's fine because that column is unique. But there's no protection against multiple `payments` rows for the same booking (the schema allows it). The webhook only inserts one per booking today, but the model would benefit from `UNIQUE(booking_id)` or accepting multiple payments per booking explicitly (refund + new deposit?). Document the chosen interpretation.

## Medium (MD)

### MD-01 — `$onUpdate(() => new Date())` is silent for non-Drizzle writes

**File:** `src/db/schema.ts:120–123`. The comment is correct that raw SQL writes won't trigger this. There are currently no raw SQL writes (good), but the `webhooks/stripe/route.ts:369` does `set({ status: 'cancelled', updatedAt: new Date() })` — manually setting `updatedAt`, which is redundant with `$onUpdate` and could mask a bug if `$onUpdate` ever stopped firing. Pick one: rely on `$onUpdate` and drop the manual assignment, or add a DB-side trigger (`BEFORE UPDATE` row trigger setting `NEW.updated_at = now()`) and drop `$onUpdate`. The DB trigger is the more durable choice for a payment domain — surveys of "let the ORM handle it" have a way of breaking when ops runs a one-off SQL fix.

### MD-02 — Migration 0003 mixes destructive type changes with index creation

**File:** `drizzle/0003_phase01_warnings.sql`. Lines 9–10:

```sql
ALTER TABLE "packages" ALTER COLUMN "active" DROP DEFAULT;
ALTER TABLE "packages" ALTER COLUMN "active" SET DATA TYPE boolean USING ("active" = 'true');
```

This is correct *if* every existing row has `active = 'true'` or `'false'` (the embedded comment acknowledges this). The migration has **no guard**: no `CHECK` validation pre-cast, no rollback. On a production DB with even one row like `'TRUE'` or `'1'`, the migration fails halfway, leaving `active` defaultless and partially typed. Acceptable for the current state (only seed data, all `'true'`) but flag for future similar migrations: bake the validation in as a separate idempotent step, or wrap in a transaction (drizzle-kit emits separate statements but you can manually wrap).

Also: the migration creates 11 indexes back-to-back without `CONCURRENTLY`. Fine for current row counts (~zero); will lock writes on a populated table. For future bulk index migrations in production, use `CREATE INDEX CONCURRENTLY` (drizzle-kit doesn't emit this by default — needs manual edit).

### MD-03 — Pooled vs unpooled is right in `drizzle.config.ts` but documented nowhere else

`drizzle.config.ts` correctly uses `DATABASE_URL_UNPOOLED` for migrations. `src/db/index.ts` uses `DATABASE_URL` (pooled). This is the right split, but it's invisible from inside the app code. Suggest: a one-line comment in `src/db/index.ts` saying "pooled — for runtime queries; see drizzle.config.ts for migration driver."

### MD-04 — Admin page does two unbounded `SELECT *` queries

**File:** `src/app/(main)/admin/page.tsx:21–29`.

```ts
const allContacts = await db.select().from(contacts).orderBy(desc(contacts.createdAt));
const allBookings = await db.select().from(bookings).orderBy(desc(bookings.createdAt));
```

No `LIMIT`. With current volume this is fine; this is also the SKILL.md "Red Flag: fetching all rows without pagination in production queries." Add `.limit(200)` plus a "showing latest 200" UI line. Also: two sequential queries that could run in `await Promise.all([...])`.

### MD-05 — `contacts.email` should be indexed or have a unique constraint policy

There's an index on `inquiries.email` but not on `contacts.email`. If admin ever needs to "find all messages from this person," this becomes a seq scan. Low priority given current volume.

## Low (LO) / Nits

- **LO-01** — `currency` on `payments` defaults to `'usd'` as `text`. Consider a CHECK constraint or enum if you ever expand. Currently fine.
- **LO-02** — `pendingReservations.clientEmail` is nullable but every code path sets it (checkout route line 113). Tightening to `NOT NULL` matches reality.
- **LO-03** — `pendingReservations.stripeSessionId` should probably be `UNIQUE` — the webhook deletes by it on `payment_failed` and `checkout.expired`, and you never want two pending rows pointing at the same Stripe session.
- **LO-04** — The Proxy in `src/db/index.ts` is excellent and well-tested. Minor: `has` trap calls `getDb()` which *does* open a connection on `"select" in db`. Probably fine but worth a note in the comment.
- **LO-05** — `isUniqueViolation` (checkout route line 203) walks `.cause` chains — robust. No change needed.
- **LO-06** — Migration `0001` adds `email_sent_at` as nullable timestamp with no default. Correct (existing rows should be NULL = "not sent"). Good additive migration.
- **LO-07** — Drizzle's `relations()` API isn't used anywhere. With four tables and joins handled manually, this is fine, but if join-heavy reads grow, `db.query.bookings.findMany({ with: { payments: true } })` is more ergonomic than hand-rolling `innerJoin`.

## Migration safety summary

| # | File | Destructive? | Idempotent on re-run? | Notes |
|---|------|---|---|---|
| 0000 | `0000_stale_longshot.sql` | No (CREATE TABLE) | No (`CREATE TABLE` not `IF NOT EXISTS`) | Fine for initial migration. |
| 0001 | `0001_clear_betty_ross.sql` | No (ADD COLUMN nullable, no default) | No | Safest possible additive migration. |
| 0002 | `0002_dusty_fat_cobra.sql` | Mildly (`SET NOT NULL`, `ADD UNIQUE`) | No | OK because table was empty at the time. On a populated table, `SET NOT NULL` would fail; `ADD UNIQUE` would fail on dupes. |
| 0003 | `0003_phase01_warnings.sql` | Yes (type changes, default drops) | No | See MD-02. Risky pattern in general, safe here because data is seeded/trivial. |

None of the migrations are wrapped in explicit transactions — drizzle-kit relies on Postgres' implicit per-statement transactions. For multi-statement migrations like 0003, a single failure mid-way leaves the schema partially migrated. Consider manual `BEGIN; ... COMMIT;` wrappers on the destructive ones.

## Query patterns summary

- **Parameterization:** All queries use Drizzle builders (`eq`, `and`, `gt`, `lt`) — fully parameterized. No `sql\`...\`` raw template strings. No SQL injection surface.
- **Transactions:** Zero usage of `db.transaction`. See CR-01 — the driver choice prevents real transactions; either change driver or use `db.batch`.
- **N+1:** None visible. The admin page is two flat selects; webhook handlers are linear.
- **Prepared statements:** `neon-http` doesn't use prepared statements (each query is a fresh HTTP request). For a low-QPS payment surface this is fine; if you ever scale up read volume, `neon-serverless` (WebSocket pool) gets you prepared statements + transactions.
- **Pooled vs unpooled:** Correctly separated between runtime (`DATABASE_URL`, pooled) and migrations (`DATABASE_URL_UNPOOLED`, direct). Good.

## Top recommended actions (in order)

1. **CR-01** — Decide on transaction strategy for `handleCheckoutCompleted`. Either swap to `neon-serverless` or refactor to `db.batch` + client-side IDs.
2. **CR-02 + HI-01** — Tighten `payments.bookingId` and `bookings.packageId` to `NOT NULL` in a 0004 migration.
3. **HI-02** — Normalize `eventDate` to a known grid before any of the three reservation writes; document the contract.
4. **MD-01** — Replace `$onUpdate` on `bookings.updatedAt` with a DB-side `BEFORE UPDATE` trigger (one-line plpgsql function reused across tables if you add more).
5. **MD-04** — Cap admin queries with `LIMIT` and parallelize with `Promise.all`.
