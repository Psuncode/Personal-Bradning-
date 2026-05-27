# Phase 1: Infrastructure - Research

**Researched:** 2026-03-17
**Domain:** Next.js 16 proxy routing, Neon Postgres, Drizzle ORM
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SUB-01 | Next.js proxy reads the `host` header and routes `photography.philipsun.com` and the ecommerce subdomain to their respective route groups within a single Vercel deployment | Proxy file convention, `NextResponse.rewrite()`, route groups, preview fallback, and Vercel CNAME setup all directly addressed below |
</phase_requirements>

---

## Summary

This phase has two independent pillars: subdomain routing via the Next.js proxy layer, and a Neon + Drizzle persistence foundation. Neither pillar blocks the other; they can be implemented in any order within the phase.

**Critical Next.js 16 breaking change:** `middleware.ts` is deprecated and renamed to `proxy.ts` with the exported function renamed from `middleware` to `proxy`. The runtime changed from Edge to Node.js by default. All code examples and task instructions must use `proxy.ts`. The API (`NextResponse.rewrite`, `NextRequest`, `config.matcher`) is otherwise unchanged.

Route groups in App Router are folder-name-only conventions — `(photography)` and `(ecommerce)` folders do not appear in URLs. The proxy rewrites inbound URLs from `photography.philipsun.com/*` to `/(photography)/*` internally, so the browser URL stays clean while the app routes to the correct segment. Each route group can have its own `layout.tsx`, including its own `<html>` and `<body>` tags (multiple root layouts). The existing root `src/app/layout.tsx` must be moved or reorganized if multiple root layouts are used — this is a structural decision the planner must address.

For the database pillar, `drizzle-orm` + `@neondatabase/serverless` using the `neon-http` driver is the standard pattern for Vercel serverless. App queries use `DATABASE_URL` (pooled via PgBouncer). Migrations must use `DATABASE_URL_UNPOOLED` (direct connection) because PgBouncer's transaction mode blocks DDL features. The migration workflow is `drizzle-kit generate` → commit SQL files → `drizzle-kit migrate` (not `push` in production).

**Primary recommendation:** Write `src/proxy.ts` for subdomain routing and `src/db/` for the Drizzle layer. Run migrations manually with `drizzle-kit migrate` using the unpooled connection string before each deployment that changes schema.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `drizzle-orm` | 0.45.1 | TypeScript ORM, query builder | Type-safe, zero-abstraction, first-class Neon support |
| `@neondatabase/serverless` | 1.0.2 | Neon Postgres driver for serverless/edge | Official Neon driver; HTTP transport avoids TCP cold starts |
| `drizzle-kit` | 0.31.10 | Schema migration CLI | Pairs with drizzle-orm; generates SQL migration files |

Versions verified against npm registry on 2026-03-17.

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `dotenv` | (Node built-in or existing) | Load `.env.local` for drizzle-kit CLI | Only needed when running drizzle-kit outside Next.js |
| `ws` | (if neon-websockets needed) | WebSocket transport for Neon | Only if interactive transactions needed; neon-http suffices for Phase 1 |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `neon-http` driver | `neon-serverless` (websockets) | Websockets support interactive transactions; HTTP is faster for single queries and simpler to configure |
| `drizzle-kit migrate` | `drizzle-kit push` | `push` skips migration files — fine for prototyping, not for production with a schema that must be reproducible |
| Route groups | Multi-Zones (separate Next.js apps) | Multi-Zones require multiple deployments and repos; route groups share a single deployment (already decided) |

**Installation:**
```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── proxy.ts                    # Subdomain routing (NEW — Next.js 16 convention)
├── app/
│   ├── (main)/                 # Route group: main philipsun.com site
│   │   ├── layout.tsx          # Main site layout (move existing layout.tsx here)
│   │   ├── page.tsx            # Homepage
│   │   ├── blog/
│   │   ├── projects/
│   │   ├── contact/
│   │   ├── meet/
│   │   ├── resume/
│   │   └── api/
│   ├── (photography)/          # Route group: photography.philipsun.com
│   │   ├── layout.tsx          # Photography-specific root layout
│   │   └── page.tsx            # Placeholder page (Phase 1)
│   └── (ecommerce)/            # Route group: ecommerce.philipsun.com
│       ├── layout.tsx          # Ecommerce-specific root layout
│       └── page.tsx            # Placeholder page (Phase 1)
├── db/
│   ├── index.ts                # Drizzle db instance (app queries — pooled)
│   └── schema.ts               # All table definitions
└── ...

drizzle/                        # Migration SQL files (generated, committed to git)
drizzle.config.ts               # Drizzle-kit config
```

**Root layout concern:** The existing `src/app/layout.tsx` must be relocated into `src/app/(main)/layout.tsx` if using multiple root layouts. This is mandatory if each route group needs its own `<html>`/`<body>` structure. The planner must include this move as an explicit task.

### Pattern 1: Proxy Subdomain Routing

**What:** `src/proxy.ts` reads `request.headers.get('host')`, extracts the subdomain, and rewrites the URL to the matching route group path.

**When to use:** Every request to a known subdomain. Unknown subdomains and the main domain pass through without rewriting.

**Example:**
```typescript
// src/proxy.ts
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const SUBDOMAINS: Record<string, string> = {
  photography: '/(photography)',
  ecommerce: '/(ecommerce)',
}

export function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''

  // Strip port number for local dev (e.g. "photography.localhost:3000" → "photography.localhost")
  const hostWithoutPort = hostname.split(':')[0]

  // Detect preview deployments — vercel.app URLs use path-prefix fallback
  // Preview URLs look like: philipsun-com-git-branch.vercel.app
  const isVercelPreview = hostWithoutPort.endsWith('.vercel.app')

  // Detect localhost (subdomain.localhost)
  const isLocalhost = hostWithoutPort.endsWith('.localhost') || hostWithoutPort === 'localhost'

  if (isVercelPreview || isLocalhost) {
    // Fall through — path-prefix routing handles this (no rewrite needed for Phase 1 placeholder)
    return NextResponse.next()
  }

  // Production: extract subdomain from hostname
  // "photography.philipsun.com" → subdomain = "photography"
  const subdomain = hostWithoutPort.split('.')[0]

  // "philipsun.com" → no subdomain to route
  const isMainDomain = hostWithoutPort === 'philipsun.com' || hostWithoutPort === 'www.philipsun.com'
  if (isMainDomain) return NextResponse.next()

  const routeGroupPath = SUBDOMAINS[subdomain]
  if (!routeGroupPath) return NextResponse.next()

  // Rewrite: photography.philipsun.com/foo → internal /(photography)/foo
  const url = request.nextUrl.clone()
  url.pathname = routeGroupPath + (request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname)
  return NextResponse.rewrite(url)
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
```

**Key note on rewrite URL construction:** `NextResponse.rewrite()` takes the URL as the browser sees it, not the internal route group path. The internal path used in `rewrite()` must match the file system path including the `(group)` folder name — Next.js resolves route groups correctly when the rewritten URL matches.

**Key note on local dev testing:** Add entries to `/etc/hosts`:
```
127.0.0.1 photography.localhost
127.0.0.1 ecommerce.localhost
```
Then visit `http://photography.localhost:3000`. The proxy reads this hostname and rewrites correctly. No ngrok required for basic testing.

### Pattern 2: Drizzle DB Instance

**What:** A singleton `db` export in `src/db/index.ts` using the `neon-http` driver and pooled `DATABASE_URL`. All application code imports `db` from this file.

**When to use:** All application queries (SELECT, INSERT, UPDATE, DELETE). Do not use this connection for migrations.

**Example:**
```typescript
// src/db/index.ts
// Source: https://orm.drizzle.team/docs/connect-neon
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle({ client: sql, schema })
```

### Pattern 3: Schema Definitions

**What:** All six tables defined in `src/db/schema.ts` using `pgTable` from `drizzle-orm/pg-core`.

**When to use:** Single source of truth for schema. `drizzle-kit generate` reads this file.

**Example:**
```typescript
// src/db/schema.ts
import {
  pgTable, serial, text, timestamp, integer, numeric, pgEnum
} from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm'

// contacts: main site contact form submissions
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  message: text('message').notNull(),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  referrer: text('referrer'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// inquiries: photography-specific inquiries (pre-booking)
export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  eventType: text('event_type'),
  eventDate: timestamp('event_date', { withTimezone: true }),
  message: text('message'),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  referrer: text('referrer'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// packages: photography service packages (seed data)
export const packages = pgTable('packages', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  priceInCents: integer('price_in_cents').notNull(),
  depositInCents: integer('deposit_in_cents').notNull(),
  durationMinutes: integer('duration_minutes').notNull(),
  active: text('active').default('true').notNull(), // use 'true'/'false' to avoid boolean pgBouncer issues
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// bookings: confirmed photography bookings (after Stripe payment)
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  packageId: integer('package_id').references(() => packages.id),
  clientName: text('client_name').notNull(),
  clientEmail: text('client_email').notNull(),
  clientPhone: text('client_phone'),
  eventDate: timestamp('event_date', { withTimezone: true }).notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id').unique(),
  depositPaidInCents: integer('deposit_paid_in_cents'),
  status: text('status').default('confirmed').notNull(), // 'confirmed' | 'cancelled' | 'completed'
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// payments: Stripe payment records
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').references(() => bookings.id),
  stripePaymentIntentId: text('stripe_payment_intent_id').notNull().unique(),
  amountInCents: integer('amount_in_cents').notNull(),
  currency: text('currency').default('usd').notNull(),
  status: text('status').notNull(), // 'pending' | 'succeeded' | 'failed'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// pending_reservations: temporary hold on a timeslot during checkout
// Records expire after TTL; application-level cleanup (or pg cron) deletes expired rows
export const pendingReservations = pgTable('pending_reservations', {
  id: serial('id').primaryKey(),
  packageId: integer('package_id').references(() => packages.id),
  clientEmail: text('client_email'),
  requestedDate: timestamp('requested_date', { withTimezone: true }).notNull(),
  stripeSessionId: text('stripe_session_id'),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), // app sets this: now() + 30min
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
```

**Schema design notes:**
- Monetary values stored as integers (cents) to avoid floating-point rounding. Never use `numeric` or `decimal` for Stripe amounts — always work in cents.
- `pending_reservations.expires_at` is set by application code (not a DB default) so the TTL duration stays configurable without a migration.
- No Postgres `BOOLEAN` type used — text `'true'`/`'false'` avoids PgBouncer session-mode issues with prepared statements on boolean comparisons (LOW risk for this schema but a known gotcha).
- All timestamps use `{ withTimezone: true }` — Neon stores as UTC; application converts to Mountain Time when displaying.

### Pattern 4: Drizzle-Kit Config

```typescript
// drizzle.config.ts (project root)
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    // Use UNPOOLED for migrations — pgBouncer blocks DDL in transaction mode
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
})
```

### Anti-Patterns to Avoid

- **Using `drizzle-kit push` against production or staging:** `push` has no migration history and can silently drop columns during destructive changes. Always use `generate` + `migrate` for any environment with real data.
- **Using the pooled connection for migrations:** PgBouncer transaction mode blocks `CREATE TABLE`, `ALTER TABLE`, and multi-statement transactions. Pass `DATABASE_URL_UNPOOLED` to drizzle-kit.
- **Importing `db` in proxy.ts:** Proxy runs before the app and in a separated network layer context. Database calls belong in API routes or Server Actions, never in proxy.ts.
- **Keeping the global `src/app/layout.tsx` when using multiple root layouts:** If route groups each have a root `layout.tsx` with `<html>` and `<body>`, the global layout.tsx must be removed. Failing to do so causes build errors about conflicting root layouts.
- **Hard-coding the main domain in proxy.ts:** Derive the domain from an env var (`NEXT_PUBLIC_DOMAIN`) so the same proxy.ts works on staging and production without code changes.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Postgres connection pooling | Custom connection pool | Neon's PgBouncer (built into `DATABASE_URL`) | PgBouncer handles 10k concurrent connections, connection lifecycle, and reconnect |
| SQL migration tracking | Manual migration version table | `drizzle-kit migrate` | Tracks applied migrations in `__drizzle_migrations` table automatically |
| Schema type inference | Manual TypeScript types | `drizzle-orm` `InferSelectModel` / `InferInsertModel` | Zero-drift: types come from schema definition |
| Subdomain detection regex | Custom host parsing library | `request.headers.get('host').split('.')` | Straightforward string split is sufficient for two known subdomains |
| DB singleton management | Module-level connection caching | `drizzle-orm/neon-http` stateless design | neon-http is stateless per call; no explicit connection management needed |

**Key insight:** Neon's HTTP driver (`neon-http`) is intentionally stateless — each query opens/closes a connection over HTTP. There is no persistent TCP connection to manage. Do not attempt to cache or reuse the `sql` client object as if it were a pg `Pool`.

---

## Common Pitfalls

### Pitfall 1: Using `middleware.ts` instead of `proxy.ts`

**What goes wrong:** Next.js 16 treats `middleware.ts` as deprecated. It will emit a deprecation warning during build and the file may stop working in a future minor. The exported function name must be `proxy`, not `middleware`.
**Why it happens:** All existing community tutorials, Stack Overflow answers, and most blog posts through mid-2025 show `middleware.ts`. Training data strongly biases toward the old convention.
**How to avoid:** File is `src/proxy.ts`. Export is `export function proxy(request: NextRequest)`. Run `npx @next/codemod@canary middleware-to-proxy .` if migrating existing code.
**Warning signs:** Build output mentions "middleware deprecated" or "rename to proxy".

### Pitfall 2: `NextResponse.rewrite()` to route group path is malformed

**What goes wrong:** The rewritten path must resolve to a real file in the filesystem. `/(photography)/` works because it maps to `src/app/(photography)/page.tsx`. If the route group folder does not exist yet, the rewrite silently returns a 404 — Next.js does not throw a build error for a proxy rewriting to a non-existent route.
**Why it happens:** Route group folders with parentheses are invisible in URLs but present in the filesystem. The rewrite target path must include the parentheses.
**How to avoid:** Create the placeholder page files (`src/app/(photography)/page.tsx`, `src/app/(ecommerce)/page.tsx`) before testing the proxy rewrite.
**Warning signs:** Subdomain requests return 404 but the proxy appears to fire correctly.

### Pitfall 3: Route group layout conflict with existing root layout

**What goes wrong:** If `src/app/layout.tsx` exists at the top level AND each route group has its own `layout.tsx` with `<html>` tags, Next.js throws a build error about multiple root layouts.
**Why it happens:** Next.js App Router requires exactly one `<html>` element per page. Multiple root layouts are allowed only when the top-level `layout.tsx` is removed.
**How to avoid:** When introducing multiple root layouts, move the existing `src/app/layout.tsx` into `src/app/(main)/layout.tsx`. All existing routes under `src/app/` must also be moved into `src/app/(main)/`.
**Warning signs:** Build error: "Multiple root layouts detected" or "html element must be in root layout".

### Pitfall 4: Using `DATABASE_URL` (pooled) for migrations

**What goes wrong:** `drizzle-kit migrate` fails or hangs when connecting through PgBouncer in transaction mode. PgBouncer does not support session-level features that DDL migrations rely on.
**Why it happens:** The Vercel-Neon integration sets `DATABASE_URL` to the pooled connection by default (includes `-pooler` in hostname). Running drizzle-kit with this URL routes through PgBouncer.
**How to avoid:** Always run `drizzle-kit migrate` with `DATABASE_URL_UNPOOLED`. Set this in `drizzle.config.ts` or explicitly: `DATABASE_URL_UNPOOLED=... npx drizzle-kit migrate`.
**Warning signs:** Migration hangs without completing, or errors like "prepared statement already exists".

### Pitfall 5: Preview deployment subdomain detection false positive

**What goes wrong:** Vercel preview URLs look like `philipsun-com-git-branch.vercel.app`. If the proxy extracts the first segment (`philipsun-com-git-branch`) and tries to match it against `SUBDOMAINS`, it finds no match and falls through — which is correct behavior. But if the logic is wrong, it could rewrite the preview URL to the wrong route group.
**Why it happens:** Developers check `hostname.includes('photography')` as a shortcut. The preview URL `philipsun-com-photography-feature.vercel.app` would incorrectly match this check.
**How to avoid:** Use an explicit allowlist (`SUBDOMAINS` object) rather than substring matching. Check for `.vercel.app` suffix first and return `NextResponse.next()` immediately.
**Warning signs:** Preview deployments show photography pages instead of the main site.

### Pitfall 6: `pending_reservations` rows never cleaned up

**What goes wrong:** Expired rows accumulate indefinitely. `expires_at` is only useful if something deletes expired rows.
**Why it happens:** Postgres does not have built-in TTL row expiry (unlike Redis). Setting `expires_at` is application metadata only.
**How to avoid:** Add a cleanup step in any route that reads `pending_reservations`: `DELETE FROM pending_reservations WHERE expires_at < NOW()`. For Phase 1 (no booking flow yet), this is informational — the schema just needs the column. Phase 3 implements the actual cleanup logic.
**Warning signs:** `pending_reservations` table grows unbounded; queries slow down over months.

### Pitfall 7: Local dev subdomain testing requires `/etc/hosts`

**What goes wrong:** `http://localhost:3000` does not exercise subdomain routing. Visiting `http://photography.localhost:3000` fails by default because `photography.localhost` does not resolve.
**Why it happens:** The OS does not route `*.localhost` subdomains by default on all platforms.
**How to avoid:** Add to `/etc/hosts`:
```
127.0.0.1 photography.localhost
127.0.0.1 ecommerce.localhost
```
macOS and Linux support this natively. Windows requires Acrylic DNS or similar.
**Warning signs:** Subdomain routing tests pass in CI but cannot be verified locally.

### Pitfall 8: Vercel wildcard domain must be configured

**What goes wrong:** Vercel deployment will not receive requests for `photography.philipsun.com` unless that CNAME is added in the Vercel project domain settings AND the DNS CNAME record is created pointing to `cname.vercel-dns.com`.
**Why it happens:** Vercel's edge network only routes traffic for domains explicitly configured in the project.
**How to avoid:** In Vercel project settings → Domains, add both `photography.philipsun.com` and `ecommerce.philipsun.com`. Then add corresponding CNAME records at the DNS provider. DNS propagation takes 24–48 hours — do this first, before writing any code.
**Warning signs:** Production returns "404 from Vercel" or "This domain is not assigned to any project" for the subdomains.

---

## Code Examples

Verified patterns from official sources:

### Proxy File Location and Export (Next.js 16)
```typescript
// src/proxy.ts
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy (version 16.1.7, 2026-03-16)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  // Named export 'proxy' — NOT 'middleware'
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}
```

### neon-http Drizzle Connection
```typescript
// src/db/index.ts
// Source: https://orm.drizzle.team/docs/connect-neon
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle({ client: sql, schema })
```

### drizzle.config.ts (with unpooled for migrations)
```typescript
// drizzle.config.ts
// Source: https://orm.drizzle.team/docs/connect-neon + Neon connection pooling docs
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL!,
  },
})
```

### Migration Workflow
```bash
# 1. Generate SQL migration files from schema changes
npx drizzle-kit generate

# 2. Apply migrations (use unpooled connection)
DATABASE_URL_UNPOOLED="postgresql://..." npx drizzle-kit migrate

# Or, if DATABASE_URL_UNPOOLED is already set in .env.local:
npx drizzle-kit migrate
```

### Route Group Folder Structure
```
src/app/
├── (main)/
│   ├── layout.tsx      # Must include <html> and <body> tags
│   └── page.tsx        # Main homepage
├── (photography)/
│   ├── layout.tsx      # Separate root layout for photography subdomain
│   └── page.tsx        # Phase 1: placeholder
└── (ecommerce)/
    ├── layout.tsx      # Separate root layout for ecommerce subdomain
    └── page.tsx        # Phase 1: placeholder
```

### Proxy Rewrite to Route Group
```typescript
// Rewrite photography.philipsun.com/foo → internal /(photography)/foo
// Source: https://nextjs.org/docs/app/api-reference/file-conventions/proxy
const url = request.nextUrl.clone()
url.pathname = '/(photography)' + (request.nextUrl.pathname === '/' ? '' : request.nextUrl.pathname)
return NextResponse.rewrite(url)
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` with `export function middleware()` | `proxy.ts` with `export function proxy()` | Next.js 16.0.0 (Oct 2025) | Must rename file and function; old name deprecated with warning |
| Edge runtime (default for middleware) | Node.js runtime (default for proxy) | Next.js 15.5.0 (stable), 16.0.0 (default) | Can use Node.js APIs in proxy.ts now; no `npm:` import restrictions |
| `POSTGRES_URL` (legacy Vercel Postgres) | `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | After Vercel KV deprecation Dec 2024 | Use modern variable names; Neon integration auto-sets them |
| PlanetScale free tier | Neon free tier | 2024 (PlanetScale removed free tier) | Neon is the standard serverless Postgres for Vercel projects |

**Deprecated/outdated:**
- `middleware.ts` / `export function middleware()`: Deprecated in Next.js 16, will be removed in a future version
- `export const runtime = 'edge'` in middleware: Not available in proxy.ts (proxy always runs on Node.js)
- `POSTGRES_URL` env var name: Legacy from Vercel Postgres; Neon integration uses `DATABASE_URL`

---

## Open Questions

1. **Root layout migration scope**
   - What we know: Adding route groups with individual root layouts requires removing `src/app/layout.tsx`. All existing routes (`/blog`, `/projects`, `/contact`, `/meet`, `/resume`, `/api`) must move into `src/app/(main)/`.
   - What's unclear: How many existing tests reference `src/app/layout.tsx` directly vs. testing through page routes. Moving files will break any imports using the old paths.
   - Recommendation: Planner should include "audit test file imports before moving layout" as a verification step.

2. **CNAME propagation timing**
   - What we know: DNS propagation for CNAME records takes 24–48 hours. The proxy code can be shipped before DNS is live.
   - What's unclear: Whether Philip has already added the CNAME records (STATE.md flags this as a concern).
   - Recommendation: Wave 0 task should be "add CNAME records to DNS provider immediately" — this is a blocker for end-to-end testing but not for code development.

3. **Neon project provisioning**
   - What we know: Neon offers a Vercel-native integration (marketplace) or manual setup. The native integration auto-creates `DATABASE_URL` and `DATABASE_URL_UNPOOLED` in all Vercel environments and creates branch-per-preview.
   - What's unclear: Whether the Neon project should be provisioned via the Vercel marketplace integration or manually.
   - Recommendation: Use Vercel marketplace Neon integration (free tier available). It handles env var injection for preview/production automatically.

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run src/` |
| Full suite command | `npm run test:coverage` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SUB-01 (proxy routing) | `photography.philipsun.com` rewrites to `/(photography)` route group | Unit (proxy logic) | `npx vitest run src/__tests__/proxy.test.ts` | ❌ Wave 0 |
| SUB-01 (preview fallback) | `.vercel.app` hostname returns `NextResponse.next()` without rewriting | Unit (proxy logic) | `npx vitest run src/__tests__/proxy.test.ts` | ❌ Wave 0 |
| SUB-01 (main domain pass-through) | `philipsun.com` hostname returns `NextResponse.next()` | Unit (proxy logic) | `npx vitest run src/__tests__/proxy.test.ts` | ❌ Wave 0 |
| SUB-01 (DB schema) | All 6 tables present and migrations run without errors | Manual / migration smoke | `npx drizzle-kit migrate && echo "OK"` | ❌ Wave 0 |

**Note on proxy testing:** Next.js 15.1+ ships `next/experimental/testing/server` with `unstable_doesProxyMatch`, `isRewrite`, and `getRewrittenUrl` utilities for unit testing proxy files. These work with Vitest. Use them instead of mocking `NextRequest` manually.

```typescript
// src/__tests__/proxy.test.ts example
import { isRewrite, getRewrittenUrl } from 'next/experimental/testing/server'
import { proxy } from '../proxy'

test('photography subdomain rewrites to route group', async () => {
  const request = new NextRequest('https://photography.philipsun.com/about')
  const response = await proxy(request)
  expect(isRewrite(response)).toBe(true)
  expect(getRewrittenUrl(response)).toContain('/(photography)/about')
})

test('vercel.app preview passes through', async () => {
  const request = new NextRequest('https://philipsun-com-git-main.vercel.app/')
  const response = await proxy(request)
  expect(isRewrite(response)).toBe(false)
})
```

### Sampling Rate

- **Per task commit:** `npx vitest run src/__tests__/proxy.test.ts`
- **Per wave merge:** `npx vitest run src/`
- **Phase gate:** Full suite green + `npx drizzle-kit migrate` clean before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/__tests__/proxy.test.ts` — covers SUB-01 routing, preview fallback, main domain pass-through
- [ ] `src/app/(main)/layout.tsx` — moved from `src/app/layout.tsx`
- [ ] `src/app/(photography)/layout.tsx` and `src/app/(photography)/page.tsx` — route group placeholders
- [ ] `src/app/(ecommerce)/layout.tsx` and `src/app/(ecommerce)/page.tsx` — route group placeholders
- [ ] `src/db/schema.ts` — table definitions (must exist before `drizzle-kit generate`)
- [ ] `src/db/index.ts` — Drizzle db instance
- [ ] `drizzle.config.ts` — at project root
- [ ] `drizzle/` directory — created by `drizzle-kit generate`
- [ ] Framework install: `npm install drizzle-orm @neondatabase/serverless && npm install -D drizzle-kit`
- [ ] Env vars: `DATABASE_URL` and `DATABASE_URL_UNPOOLED` in `.env.local` and Vercel project settings

---

## Sources

### Primary (HIGH confidence)

- `https://nextjs.org/docs/app/api-reference/file-conventions/proxy` (version 16.1.7, lastUpdated 2026-03-16) — proxy.ts file convention, function export, matcher, runtime, migration from middleware
- `https://nextjs.org/blog/next-16` (published Oct 2025) — middleware→proxy rename rationale, Node.js runtime change, breaking changes table
- `https://nextjs.org/docs/app/api-reference/file-conventions/route-groups` (version 16.1.7, lastUpdated 2026-03-16) — route group folder convention, multiple root layouts, caveats
- `https://orm.drizzle.team/docs/connect-neon` — neon-http driver setup, db connection pattern
- `https://orm.drizzle.team/docs/migrations` — generate vs push vs migrate workflow
- `https://neon.com/docs/connect/connection-pooling` — PgBouncer transaction mode, pooled vs unpooled, DDL limitations

### Secondary (MEDIUM confidence)

- `https://neon.com/guides/drizzle-local-vercel` — drizzle.config.ts example with `POSTGRES_URL` (uses legacy var name; pattern is still valid with `DATABASE_URL`)
- `https://orm.drizzle.team/docs/tutorials/drizzle-nextjs-neon` — complete tutorial with schema, migration, and server action patterns
- npm registry (`npm view`) — verified @neondatabase/serverless@1.0.2, drizzle-orm@0.45.1, drizzle-kit@0.31.10 on 2026-03-17
- `https://neon.com/docs/guides/neon-managed-vercel-integration` — `DATABASE_URL` / `DATABASE_URL_UNPOOLED` env var names set by integration

### Tertiary (LOW confidence)

- GitHub discussion `https://github.com/vercel/next.js/discussions/24263` — `/etc/hosts` approach for local subdomain dev (community, not official)
- GitHub discussion `https://github.com/vercel/next.js/discussions/32294` — subdomain routing middleware patterns (community examples, pre-proxy rename)

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — package versions verified against npm registry; Neon and Drizzle are official Vercel/Next.js recommendations
- Architecture patterns: HIGH — proxy.ts API verified against official Next.js 16.1.7 docs (lastUpdated 2026-03-16)
- Pitfalls: HIGH for proxy rename and pooled/unpooled split (both verified against official docs); MEDIUM for `/etc/hosts` local dev approach (community-sourced but widely confirmed)

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (Drizzle and Next.js release frequently; re-verify package versions before installing)
