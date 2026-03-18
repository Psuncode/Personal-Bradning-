---
plan: 02
phase: 01-infrastructure
type: execute
wave: 1
depends_on: []
files_modified:
  - src/db/index.ts
  - src/db/schema.ts
  - drizzle.config.ts
  - package.json
  - .env.local.example
autonomous: true
requirements:
  - SUB-01

must_haves:
  truths:
    - "src/db/schema.ts defines all 6 tables: contacts, inquiries, bookings, payments, packages, pending_reservations"
    - "src/db/index.ts exports a drizzle db instance using neon-http driver and pooled DATABASE_URL"
    - "drizzle.config.ts uses DATABASE_URL_UNPOOLED for migrations"
    - "npm run build succeeds with new db files in place"
    - "drizzle-kit generate produces valid SQL migration files"
  artifacts:
    - path: "src/db/index.ts"
      provides: "Drizzle db singleton for app queries"
      exports: ["db"]
    - path: "src/db/schema.ts"
      provides: "All 6 table definitions as TypeScript"
      contains: "pendingReservations"
    - path: "drizzle.config.ts"
      provides: "Drizzle-kit config pointing to schema and unpooled connection"
      contains: "DATABASE_URL_UNPOOLED"
    - path: "drizzle/"
      provides: "Generated SQL migration files"
      contains: "0000_"
---

# Plan 02: Neon + Drizzle Database Layer

## Objective

Install and configure the Neon + Drizzle persistence layer. This plan creates the database schema (`src/db/schema.ts`) with all 6 tables, the Drizzle db singleton (`src/db/index.ts`), and the Drizzle-kit config for running migrations. No application code writes to the database yet — this plan establishes the foundation that Phase 2 CRM and Phase 3 booking features will build on. The migration must run clean against a live Neon database before this plan is complete.

## Tasks

<task id="1-02-01">
<title>Install drizzle-orm, @neondatabase/serverless, and drizzle-kit packages</title>
<wave>1</wave>
<read_first>
- package.json — current dependencies to verify these packages are not already installed
- .planning/phases/01-infrastructure/01-RESEARCH.md lines 36-65 — exact package versions verified against npm registry on 2026-03-17
</read_first>
<action>
Run the following commands from the project root:

```bash
npm install drizzle-orm@0.45.1 @neondatabase/serverless@1.0.2
npm install -D drizzle-kit@0.31.10
```

These are the exact versions verified against npm registry on 2026-03-17. Do not install without version pins.

After install, verify in package.json:
- `"drizzle-orm"`: appears in `dependencies`
- `"@neondatabase/serverless"`: appears in `dependencies`
- `"drizzle-kit"`: appears in `devDependencies`
</action>
<acceptance_criteria>
- `package.json` contains `"drizzle-orm"` in `dependencies`
- `package.json` contains `"@neondatabase/serverless"` in `dependencies`
- `package.json` contains `"drizzle-kit"` in `devDependencies`
- `npm run build` does not fail due to missing modules
</acceptance_criteria>
</task>

<task id="1-02-02">
<title>Create src/db/schema.ts with all 6 table definitions</title>
<wave>1</wave>
<read_first>
- .planning/phases/01-infrastructure/01-RESEARCH.md lines 196-289 — complete schema definitions with field names, types, and design notes
- .planning/REQUIREMENTS.md — SUB-01 requires all five business tables plus pending_reservations
</read_first>
<action>
Create `src/db/schema.ts` with the following exact content. Do not deviate from the field names, types, or design notes below.

**Design rules (mandatory):**
- Monetary values: use `integer` storing cents (e.g. 5000 = $50.00). NEVER use `numeric` or `decimal`.
- Boolean fields: use `text` with `'true'`/`'false'` values — avoids PgBouncer prepared-statement issues with boolean types.
- All timestamps: `{ withTimezone: true }` — Neon stores UTC; app converts to display timezone when needed.
- `pending_reservations.expiresAt`: set by application code (NOT a DB default) — TTL duration stays configurable without a migration.

```typescript
// src/db/schema.ts
import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

// contacts: main site contact form submissions
export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// inquiries: photography-specific inquiries (pre-booking interest)
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  eventType: text("event_type"),
  eventDate: timestamp("event_date", { withTimezone: true }),
  message: text("message"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  referrer: text("referrer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// packages: photography service packages (seed data lives here)
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priceInCents: integer("price_in_cents").notNull(),
  depositInCents: integer("deposit_in_cents").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  // text 'true'/'false' instead of boolean to avoid PgBouncer prepared-statement issues
  active: text("active").default("true").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// bookings: confirmed photography bookings (created after successful Stripe payment)
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id").references(() => packages.id),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  clientPhone: text("client_phone"),
  eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  depositPaidInCents: integer("deposit_paid_in_cents"),
  // 'confirmed' | 'cancelled' | 'completed'
  status: text("status").default("confirmed").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// payments: Stripe payment records (one per Stripe payment intent)
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id),
  stripePaymentIntentId: text("stripe_payment_intent_id").notNull().unique(),
  amountInCents: integer("amount_in_cents").notNull(),
  currency: text("currency").default("usd").notNull(),
  // 'pending' | 'succeeded' | 'failed'
  status: text("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// pending_reservations: temporary slot hold during checkout (prevents double-booking)
// Application code sets expiresAt = now() + 30 minutes when creating a reservation.
// Cleanup: delete WHERE expires_at < NOW() in any route that reads this table.
export const pendingReservations = pgTable("pending_reservations", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id").references(() => packages.id),
  clientEmail: text("client_email"),
  requestedDate: timestamp("requested_date", { withTimezone: true }).notNull(),
  stripeSessionId: text("stripe_session_id"),
  // Set by app: new Date(Date.now() + 30 * 60 * 1000)
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
```
</action>
<acceptance_criteria>
- `src/db/schema.ts` exists
- `src/db/schema.ts` contains `export const contacts = pgTable(`
- `src/db/schema.ts` contains `export const inquiries = pgTable(`
- `src/db/schema.ts` contains `export const packages = pgTable(`
- `src/db/schema.ts` contains `export const bookings = pgTable(`
- `src/db/schema.ts` contains `export const payments = pgTable(`
- `src/db/schema.ts` contains `export const pendingReservations = pgTable(`
- `src/db/schema.ts` does NOT contain `numeric(` or `decimal(` (monetary values must use integer)
- `src/db/schema.ts` does NOT import `boolean` from `drizzle-orm/pg-core`
- `src/db/schema.ts` contains `withTimezone: true` (all timestamps use timezone)
- `src/db/schema.ts` contains `expiresAt` column on `pendingReservations` table
- TypeScript compile check: `npx tsc --noEmit` passes without errors in `src/db/schema.ts`
</acceptance_criteria>
</task>

<task id="1-02-03">
<title>Create src/db/index.ts Drizzle db singleton and drizzle.config.ts</title>
<wave>1</wave>
<read_first>
- src/db/schema.ts — must exist (task 1-02-02) before creating the db instance
- .planning/phases/01-infrastructure/01-RESEARCH.md lines 172-189 and 291-305 — neon-http driver pattern and drizzle.config.ts with unpooled URL
</read_first>
<action>
**Step 1: Create `src/db/index.ts`.**

This is the singleton Drizzle db instance used by ALL application queries (API routes, Server Actions). It uses the pooled `DATABASE_URL` (via PgBouncer) for efficient connection handling in serverless.

```typescript
// src/db/index.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle({ client: sql, schema });
```

**CRITICAL:** Do NOT import `db` from this file in `src/proxy.ts`. The proxy runs before the app and must not make database calls. `db` is only for API routes and Server Actions.

**Step 2: Create `drizzle.config.ts` at the project root.**

This config tells drizzle-kit where the schema is and which connection to use for migrations. Migrations MUST use the unpooled connection (`DATABASE_URL_UNPOOLED`) because PgBouncer's transaction mode blocks DDL statements.

```typescript
// drizzle.config.ts (project root)
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // ALWAYS use UNPOOLED for migrations — PgBouncer transaction mode blocks DDL
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
});
```

**Step 3: Create `.env.local.example` documenting required environment variables.**

Create or update `.env.local.example` to include the database variables:
```
# Neon Postgres — provided by Vercel-Neon integration
# Pooled connection (for app queries)
DATABASE_URL=postgresql://USER:PASSWORD@HOST-pooler.REGION.neon.tech/DBNAME?sslmode=require

# Unpooled connection (for drizzle-kit migrations ONLY)
DATABASE_URL_UNPOOLED=postgresql://USER:PASSWORD@HOST.REGION.neon.tech/DBNAME?sslmode=require

# Main domain for proxy subdomain detection
NEXT_PUBLIC_DOMAIN=philipsun.com
```
</action>
<acceptance_criteria>
- `src/db/index.ts` exists
- `src/db/index.ts` contains `import { neon } from "@neondatabase/serverless"`
- `src/db/index.ts` contains `import { drizzle } from "drizzle-orm/neon-http"`
- `src/db/index.ts` contains `export const db = drizzle(`
- `src/db/index.ts` contains `process.env.DATABASE_URL!`
- `drizzle.config.ts` exists at project root
- `drizzle.config.ts` contains `DATABASE_URL_UNPOOLED`
- `drizzle.config.ts` contains `schema: "./src/db/schema.ts"`
- `drizzle.config.ts` contains `out: "./drizzle"`
- `drizzle.config.ts` contains `dialect: "postgresql"`
- `.env.local.example` contains `DATABASE_URL=` and `DATABASE_URL_UNPOOLED=`
- `npm run build` completes without errors
- `npx tsc --noEmit` passes without errors on `src/db/index.ts`
</acceptance_criteria>
</task>

<task id="1-02-04">
<title>Run drizzle-kit generate to create SQL migration files</title>
<wave>2</wave>
<read_first>
- src/db/schema.ts — must be complete (task 1-02-02)
- drizzle.config.ts — must exist at project root (task 1-02-03)
- .env.local — must have DATABASE_URL_UNPOOLED set (manually provided by Philip)
</read_first>
<action>
**Prerequisites:** Philip must have set `DATABASE_URL_UNPOOLED` in `.env.local` (from the Neon dashboard or Vercel-Neon integration). If not set, this task will fail with a connection error — resolve the env var before running.

Run:
```bash
npx drizzle-kit generate
```

This reads `src/db/schema.ts` and generates SQL migration files in `./drizzle/`. The first migration will be named `0000_*.sql` and should contain `CREATE TABLE` statements for all 6 tables.

After generation, verify:
```bash
ls drizzle/
cat drizzle/0000_*.sql | head -60
```

The output should show `CREATE TABLE "contacts"`, `CREATE TABLE "inquiries"`, etc.

**Do NOT run `drizzle-kit push`** — `push` skips migration history and can silently drop columns. Always use `generate` + `migrate`.

**Step 2: Commit the generated migration files.**

```bash
git add drizzle/
git commit -m "feat(db): add initial schema migration for 6 tables"
```
</action>
<acceptance_criteria>
- `drizzle/` directory exists at project root
- At least one file matching `drizzle/0000_*.sql` exists
- `drizzle/0000_*.sql` contains `CREATE TABLE "contacts"`
- `drizzle/0000_*.sql` contains `CREATE TABLE "inquiries"`
- `drizzle/0000_*.sql` contains `CREATE TABLE "packages"`
- `drizzle/0000_*.sql` contains `CREATE TABLE "bookings"`
- `drizzle/0000_*.sql` contains `CREATE TABLE "payments"`
- `drizzle/0000_*.sql` contains `CREATE TABLE "pending_reservations"`
- `drizzle/meta/` directory exists (drizzle-kit metadata)
- `npx drizzle-kit generate` exits 0 with no errors
</acceptance_criteria>
</task>

<task id="1-02-05">
<title>Run drizzle-kit migrate against Neon database</title>
<wave>2</wave>
<read_first>
- drizzle/0000_*.sql — migration file created by task 1-02-04
- drizzle.config.ts — verifies it uses DATABASE_URL_UNPOOLED
- .planning/phases/01-infrastructure/01-RESEARCH.md lines 354-359 — Pitfall 4: using pooled connection for migrations causes hangs
</read_first>
<action>
**Prerequisites:**
- `DATABASE_URL_UNPOOLED` must be set in `.env.local` (direct connection, NOT pooled).
- The Neon database must be provisioned (via Vercel-Neon integration or manually at neon.tech).

Run the migration:
```bash
npx drizzle-kit migrate
```

If `DATABASE_URL_UNPOOLED` is set correctly in `.env.local`, drizzle-kit will pick it up automatically via `drizzle.config.ts`.

Expected output:
```
[✓] Migrations applied successfully
```

After migration, verify tables exist in Neon:
```bash
# Option 1: via drizzle-kit studio
npx drizzle-kit studio

# Option 2: via psql if available
psql $DATABASE_URL_UNPOOLED -c "\dt"
```

The output should show all 6 tables: `contacts`, `inquiries`, `packages`, `bookings`, `payments`, `pending_reservations` plus the `__drizzle_migrations` table (drizzle-kit tracking table).

**If migration hangs:** The connection is routing through PgBouncer (pooled). Double-check that `DATABASE_URL_UNPOOLED` in `.env.local` does NOT contain `-pooler` in the hostname.
</action>
<acceptance_criteria>
- `npx drizzle-kit migrate` exits 0 without errors or hangs
- Neon database contains table `contacts` (verify via drizzle-kit studio or psql)
- Neon database contains table `inquiries`
- Neon database contains table `packages`
- Neon database contains table `bookings`
- Neon database contains table `payments`
- Neon database contains table `pending_reservations`
- Neon database contains table `__drizzle_migrations` (drizzle tracking table)
- `drizzle/meta/_journal.json` exists and contains the migration entry
</acceptance_criteria>
</task>

## Verification

### Automated
```bash
# TypeScript types compile without errors
npx tsc --noEmit

# Production build succeeds with db files
npm run build

# Drizzle generates migration without errors (use test DB or check diff only)
npx drizzle-kit generate
```

### Manual
- Set `DATABASE_URL_UNPOOLED` in `.env.local` from Neon dashboard
- Run `npx drizzle-kit migrate` — should output "Migrations applied successfully"
- Run `npx drizzle-kit studio` — open browser, verify 6 tables visible

## Success Criteria
- All 6 tables defined in `src/db/schema.ts` with correct types (integer cents, text booleans, withTimezone timestamps)
- `src/db/index.ts` exports singleton `db` using neon-http + pooled DATABASE_URL
- `drizzle.config.ts` uses DATABASE_URL_UNPOOLED for migrations
- SQL migration files committed to git
- Live Neon DB has all 6 tables + `__drizzle_migrations` after running `drizzle-kit migrate`
- `npm run build` exits 0
