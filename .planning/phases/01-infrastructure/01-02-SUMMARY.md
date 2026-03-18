---
phase: 01-infrastructure
plan: 02
subsystem: database
tags: [drizzle-orm, neon, postgres, drizzle-kit, schema, migrations]

# Dependency graph
requires: []
provides:
  - Drizzle db singleton (src/db/index.ts) using neon-http + pooled DATABASE_URL
  - Full 6-table schema (contacts, inquiries, packages, bookings, payments, pending_reservations)
  - SQL migration file (drizzle/0000_stale_longshot.sql) for all 6 tables
  - drizzle.config.ts for running migrations with DATABASE_URL_UNPOOLED
  - .env.local.example documenting required DB env vars
affects: [02-crm, 03-booking, 04-payments]

# Tech tracking
tech-stack:
  added: [drizzle-orm@0.45.1, @neondatabase/serverless@1.0.2, drizzle-kit@0.31.10]
  patterns:
    - Integer cents for all monetary values (never numeric/decimal)
    - text 'true'/'false' for booleans (avoids PgBouncer prepared-statement issues)
    - All timestamps use withTimezone: true (UTC storage, app converts for display)
    - expiresAt set by application code not DB default (configurable TTL)
    - Pooled DATABASE_URL for app queries; unpooled DATABASE_URL_UNPOOLED for migrations only

key-files:
  created:
    - src/db/schema.ts
    - src/db/index.ts
    - drizzle.config.ts
    - .env.local.example
    - drizzle/0000_stale_longshot.sql
    - drizzle/meta/_journal.json
    - drizzle/meta/0000_snapshot.json
  modified:
    - package.json (added drizzle-orm, @neondatabase/serverless, drizzle-kit)
    - package-lock.json

key-decisions:
  - "Integer cents for monetary storage (priceInCents, depositInCents, amountInCents) — avoids floating point issues"
  - "text 'true'/'false' for boolean columns — PgBouncer transaction mode has prepared-statement issues with pg bool type"
  - "expiresAt on pending_reservations set by app code not DB default — TTL configurable without migration"
  - "Pooled DATABASE_URL for neon-http app queries; unpooled DATABASE_URL_UNPOOLED for drizzle-kit migrations (DDL blocked by PgBouncer)"
  - ".env.local.example force-added to git (gitignore matches .env* pattern but example file contains no secrets)"

patterns-established:
  - "Pattern 1: All db queries go through src/db/index.ts singleton — never create ad-hoc neon() clients"
  - "Pattern 2: drizzle-kit generate + migrate (never push) — preserves migration history, avoids silent column drops"
  - "Pattern 3: monetary amounts always in cents as integer — display layer handles conversion to dollars"

requirements-completed: [SUB-01]

# Metrics
duration: 3min
completed: 2026-03-18
---

# Phase 1 Plan 02: Neon + Drizzle Database Layer Summary

**Drizzle ORM + Neon Postgres schema with 6 tables (contacts/inquiries/packages/bookings/payments/pending_reservations), db singleton, and SQL migration generated — migration to live Neon DB blocked pending DATABASE_URL_UNPOOLED env var**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-03-18T03:45:58Z
- **Completed:** 2026-03-18T03:49:13Z
- **Tasks:** 4 completed, 1 blocked (task 5 requires live Neon DB)
- **Files modified:** 9

## Accomplishments
- Installed drizzle-orm@0.45.1, @neondatabase/serverless@1.0.2, drizzle-kit@0.31.10 with exact version pins
- Created src/db/schema.ts with all 6 tables using correct type conventions (integer cents, text booleans, withTimezone)
- Created src/db/index.ts as the Drizzle db singleton (neon-http + pooled DATABASE_URL)
- Created drizzle.config.ts pointing to schema and using DATABASE_URL_UNPOOLED for migrations
- Generated SQL migration file via drizzle-kit generate (all 6 CREATE TABLE + FK constraints)
- npm run build passes cleanly with new db files in place

## Task Commits

Each task was committed atomically:

1. **Task 1: Install drizzle packages** - `5e6c9a9` (chore)
2. **Task 2: Create src/db/schema.ts** - `21ddd99` (feat)
3. **Task 3: Create db singleton + drizzle.config.ts** - `2c371a1` (feat)
4. **Task 4: Run drizzle-kit generate** - `73d225a` (feat)
5. **Task 5: Run drizzle-kit migrate** - BLOCKED (see below)

## Files Created/Modified
- `src/db/schema.ts` - All 6 table definitions with Drizzle ORM
- `src/db/index.ts` - Drizzle db singleton using neon-http driver
- `drizzle.config.ts` - drizzle-kit config (schema path, dialect, unpooled connection)
- `.env.local.example` - Documents DATABASE_URL and DATABASE_URL_UNPOOLED vars required
- `drizzle/0000_stale_longshot.sql` - Generated SQL migration for all 6 tables
- `drizzle/meta/_journal.json` - drizzle-kit migration journal
- `drizzle/meta/0000_snapshot.json` - drizzle-kit schema snapshot
- `package.json` - Added 3 new packages
- `package-lock.json` - Updated lockfile

## Decisions Made
- Integer cents for all monetary values (priceInCents, depositInCents, amountInCents) — avoids floating-point precision loss
- text 'true'/'false' for boolean columns — PgBouncer transaction mode has prepared-statement issues with the native pg bool type
- expiresAt on pending_reservations is set by application code (not a DB default) so TTL duration is configurable without running a migration
- Pooled DATABASE_URL for neon-http app queries; unpooled DATABASE_URL_UNPOOLED for drizzle-kit migrations (DDL is blocked by PgBouncer transaction mode)
- .env.local.example force-added with `git add -f` because .gitignore matches `.env*` pattern, but this example file contains no real credentials

## Deviations from Plan

None - plan executed exactly as written. Task 1-02-05 is blocked by a missing env var as anticipated by the plan and objective instructions.

## Issues Encountered

**drizzle-kit generate with dummy URL:** The plan description implies generate requires DATABASE_URL_UNPOOLED, but drizzle-kit generate only reads the schema TypeScript file — it does not connect to the database. Running with a dummy URL confirms this (exits 0, produces correct SQL). Task 1-02-04 is fully complete.

**`.gitignore` catches `.env.local.example`:** The project `.gitignore` has `.env*` which matches `.env.local.example`. Force-added the example file since it contains no secrets.

## User Setup Required

**Task 1-02-05 (drizzle-kit migrate) is BLOCKED.** Philip must complete these steps manually:

### Steps to unblock

1. **Provision a Neon database** — either:
   - Via Vercel-Neon integration: vercel.com/dashboard > Storage > Create Database > Neon
   - Directly: neon.tech > New Project

2. **Get connection strings** from the Neon dashboard (or Vercel env vars page):
   - Pooled connection string (contains `-pooler` in hostname)
   - Direct/unpooled connection string (no `-pooler`)

3. **Add to `.env.local`:**
   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST-pooler.REGION.neon.tech/DBNAME?sslmode=require
   DATABASE_URL_UNPOOLED=postgresql://USER:PASSWORD@HOST.REGION.neon.tech/DBNAME?sslmode=require
   ```

4. **Run the migration:**
   ```bash
   npx drizzle-kit migrate
   ```
   Expected output: `[✓] Migrations applied successfully`

5. **Verify tables exist:**
   ```bash
   npx drizzle-kit studio
   # Open browser at localhost:4983 — should show 6 tables
   ```

### What the migration creates
All 6 tables: `contacts`, `inquiries`, `packages`, `bookings`, `payments`, `pending_reservations` plus `__drizzle_migrations` tracking table.

## Next Phase Readiness
- Database schema and db singleton are complete and committed
- SQL migration is generated and ready to run
- Once DATABASE_URL_UNPOOLED is set and `npx drizzle-kit migrate` is run, Phase 2 CRM work can begin
- Phase 2 and Phase 3 can import `db` from `src/db/index.ts` and use schema types from `src/db/schema.ts`

---
*Phase: 01-infrastructure*
*Completed: 2026-03-18*

## Self-Check: PASSED

All files verified present:
- FOUND: src/db/schema.ts
- FOUND: src/db/index.ts
- FOUND: drizzle.config.ts
- FOUND: .env.local.example
- FOUND: drizzle/0000_stale_longshot.sql
- FOUND: drizzle/meta/_journal.json

All commits verified in git log:
- 5e6c9a9 chore(01-02): install drizzle-orm, @neondatabase/serverless, drizzle-kit
- 21ddd99 feat(01-02): create src/db/schema.ts with all 6 table definitions
- 2c371a1 feat(01-02): create db singleton, drizzle config, and env example
- 73d225a feat(01-02): add initial schema migration for 6 tables
