---
status: needs_attention
phase: "01"
phase_name: infrastructure
files_reviewed: 11
depth: standard
findings_summary:
  critical: 2
  warning: 8
  info: 6
  total: 16
generated_at: 2026-05-19
---

# Phase 01 — Infrastructure: Code Review

Scope: subdomain proxy (`src/proxy.ts`), Neon/Drizzle persistence layer (`src/db/*`, `drizzle/*`), and the three route-group entry points (`(main)`, `(photography)`, `(ecommerce)`). `src/proxy.ts` is Next 16's renamed `middleware.ts` (verified in the compiled output at `.next/server/chunks/*`), so it does run on every matched request.

---

## Critical Findings

### CR-01 — Admin guard only fires on the main domain; subdomain `/admin` paths slip past
**File:** src/proxy.ts:33-43
**Severity:** Critical
**Issue:** The admin-session check sits **below** the `.vercel.app` and `.localhost` early-returns and is reachable only on production-like hostnames. On `philipsun.com` it works because control flow falls through, but on preview deployments (`*.vercel.app`) and on local dev (`*.localhost`) any visit to `/admin` returns `NextResponse.next()` with no cookie check at all. The same is true for any *unknown* subdomain that doesn't match `SUBDOMAINS` (line 56 also returns `NextResponse.next()` before the admin check — except control never reaches it because line 47 short-circuits the main domain). Combined: preview URLs and localhost are entirely unprotected, which is exactly where pre-prod testing happens with real Neon data.
**Impact:** Anyone with a preview URL can hit `/admin` and any sub-route directly. If the page handler trusts the middleware to gate access (common pattern, and the comment on line 32 says "full session validation happens in the page"), this is an auth bypass on every preview deploy.
**Fix:** Run the admin check **before** the host-based early returns:

```ts
export function proxy(request: NextRequest) {
  // 1. Admin guard runs for every host (preview, localhost, prod)
  if (
    request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login')
  ) {
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession?.value) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Then host-based routing
  const hostname = request.headers.get("host") ?? request.nextUrl.host ?? "";
  // ...
}
```

Also add a test: `/admin` on `*.vercel.app` and `photography.localhost:3000` should redirect.

### CR-02 — `pending_reservations` lacks the uniqueness/index needed to prevent double-booking
**File:** src/db/schema.ts:84-93, drizzle/0000_stale_longshot.sql:66-74
**Severity:** Critical
**Issue:** The comment at line 81 declares this table's purpose is "temporary slot hold during checkout (prevents double-booking)," but the schema has:
- no unique constraint on `(package_id, requested_date)` (or equivalent slot key)
- no index on `expires_at` (every cleanup `DELETE WHERE expires_at < NOW()` will sequential-scan)
- no index on `requested_date` (every availability lookup will sequential-scan)
- no `NOT NULL` on `package_id` despite the FK — orphan holds are insertable

Without a partial-unique constraint like `UNIQUE (package_id, requested_date) WHERE expires_at > NOW()`, two concurrent checkout flows can race and both insert reservations for the same slot. The application-level check-then-insert pattern cannot be made safe without it.
**Impact:** Double-bookings under concurrency — the exact failure mode the table is named after. Also: every availability query degrades to O(n) as the table grows.
**Fix:** In a follow-up migration:

```sql
CREATE UNIQUE INDEX pending_reservations_slot_active_idx
  ON pending_reservations (package_id, requested_date)
  WHERE expires_at > NOW();
CREATE INDEX pending_reservations_expires_at_idx ON pending_reservations (expires_at);
CREATE INDEX pending_reservations_requested_date_idx ON pending_reservations (requested_date);
ALTER TABLE pending_reservations ALTER COLUMN package_id SET NOT NULL;
```

Mirror in `schema.ts` with `index()` / `uniqueIndex()` / `.notNull()`. Note: the partial-unique predicate `WHERE expires_at > NOW()` is non-immutable; Postgres rejects it. Use a workable variant: keep all reservations unique by `(package_id, requested_date)` and have the cleanup job (or per-route delete) hard-delete expired rows before insert, or denormalize with a boolean `is_active` set by a trigger / cron.

---

## Warnings

### WR-01 — Subdomain extraction is naïve and treats `www` like a real subdomain
**File:** src/proxy.ts:46-56
**Severity:** Warning
**Issue:** `hostWithoutPort.split(".")[0]` returns `"www"` for `www.photography.philipsun.com` (theoretical) and would happily look it up in `SUBDOMAINS`. More practically: any deep subdomain like `staging.photography.philipsun.com` is parsed as `"staging"` (unknown → pass-through) when it should arguably 404 or route to photography. Also, the early-return on line 22 (`.vercel.app`) only matches the apex; a custom production domain ending in something other than `philipsun.com` would silently 404 because subdomain lookup misses.
**Impact:** Quiet routing bugs once you add staging/preview hostnames or deep subdomains.
**Fix:** Compute the subdomain by stripping the main domain suffix explicitly:

```ts
const main = process.env.NEXT_PUBLIC_DOMAIN ?? "philipsun.com";
const sub = hostWithoutPort.endsWith(`.${main}`)
  ? hostWithoutPort.slice(0, -(main.length + 1))
  : null;
if (!sub || sub.includes(".")) return NextResponse.next(); // deep subdomain or no match
const routeGroupPath = SUBDOMAINS[sub];
```

### WR-02 — Admin-session cookie is checked, not verified — any cookie value passes the guard
**File:** src/proxy.ts:37-43
**Severity:** Warning
**Issue:** The middleware only checks `adminSession?.value` is truthy. The accompanying test (proxy.test.ts:108-118) confirms this by passing the literal string `"some-sealed-value"` and asserting pass-through. Comment on line 32 says "full session validation happens in the page," which is fine *if* every admin page does that — but there's no compile-time enforcement, and Next.js layouts often render server components that fetch data before the page's own validation runs. A forged cookie (just set `admin_session=anything` in DevTools) gets the attacker past the middleware and into any data-fetching layout/route handler.
**Impact:** Defense-in-depth gap. Whether it's exploitable depends entirely on every admin layout/page/route doing its own validation — easy to miss when adding a new admin route later.
**Fix:** Either (a) verify a signed/sealed cookie in the middleware (iron-session, `jose`, or HMAC), or (b) ensure every admin page+layout+route-handler runs `requireAdmin()` and add a test that proves it. Document the chosen invariant.

### WR-03 — `active` column on `packages` is `text` ('true'/'false') instead of `boolean`
**File:** src/db/schema.ts:47-48, drizzle/0000_stale_longshot.sql:51
**Severity:** Warning
**Issue:** The comment justifies this as "avoid PgBouncer prepared-statement issues," but Neon's HTTP driver (`@neondatabase/serverless` via `neon-http`) does **not** use prepared statements and does **not** sit behind PgBouncer for HTTP queries — that constraint applies to the `pg`/WebSocket driver. The text-boolean kludge therefore costs you type-safety (no compiler-checked `true|false`, just any string), index cardinality clarity, and `WHERE active` ergonomics — for a problem you don't have.
**Impact:** Foot-guns: `WHERE active = true` silently returns zero rows; `active = 'TRUE'` (uppercase) and `active = '1'` are accepted at insert time and break filters; queries against `eq(packages.active, true)` would be a type error if it were a real boolean but compile fine today.
**Fix:** In a follow-up migration, convert to `boolean`:
```sql
ALTER TABLE packages
  ALTER COLUMN active DROP DEFAULT,
  ALTER COLUMN active TYPE boolean USING (active = 'true'),
  ALTER COLUMN active SET DEFAULT true;
```
Schema: `active: boolean("active").default(true).notNull()`.

### WR-04 — `bookings.status` and `payments.status` are unconstrained text
**File:** src/db/schema.ts:62-63, 76-77
**Severity:** Warning
**Issue:** The comments enumerate the legal values (`'confirmed' | 'cancelled' | 'completed'` for bookings; `'pending' | 'succeeded' | 'failed'` for payments) but the database accepts any string. A typo in a route handler (e.g. `"confimed"`) inserts silently and breaks every downstream filter.
**Impact:** Data integrity drift over time. Reports lie. Stripe webhook handlers writing the wrong literal go undetected.
**Fix:** Either a `CHECK` constraint (`status IN ('confirmed', ...)`) or, better, a `pgEnum`:
```ts
export const bookingStatus = pgEnum("booking_status", ["confirmed", "cancelled", "completed"]);
// status: bookingStatus("status").default("confirmed").notNull(),
```

### WR-05 — No `updated_at` auto-update trigger; `bookings.updatedAt` will drift
**File:** src/db/schema.ts:66, drizzle/0000_stale_longshot.sql:13
**Severity:** Warning
**Issue:** `updatedAt` defaults to `now()` at insert but is never refreshed on UPDATE. Application code must remember to set `updatedAt: new Date()` on every mutation — easy to forget, and there's no DB-side safety net.
**Impact:** `updatedAt` becomes meaningless as soon as one route forgets to set it; audit/observability queries get false readings.
**Fix:** Add a Postgres trigger in a follow-up migration:
```sql
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```
Or use Drizzle's `.$onUpdate(() => new Date())` so at least the ORM path is covered.

### WR-06 — No indexes on hot lookup columns (`email`, `created_at`, `event_date`, `stripe_payment_intent_id` FKs)
**File:** src/db/schema.ts (all tables), drizzle/0000_stale_longshot.sql
**Severity:** Warning
**Issue:** The only indexes the migration creates are the implicit PK indexes and the two unique constraints on `stripe_payment_intent_id`. Common access patterns will sequential-scan:
- `contacts.created_at DESC` for admin list view
- `inquiries.email` for de-dup / client lookup
- `bookings.event_date` for calendar view
- `bookings.client_email` for "my bookings" lookups
- `payments.booking_id` (FK without an index — Postgres does not auto-index FKs)
- `pending_reservations.package_id` (same — FK, no index)
**Impact:** Initial volume is tiny so it won't show up locally, but degrades silently in production over months.
**Fix:** Add indexes in the schema (`.index()`) for the columns above; ship a follow-up migration.

### WR-07 — `db` Proxy returns the wrong shape for non-string property access and breaks reflection
**File:** src/db/index.ts:20-24
**Severity:** Warning
**Issue:** The Proxy `get` trap types `prop` as `string`, but JS engines query non-string keys too — most importantly `Symbol.iterator`, `Symbol.toPrimitive`, `then` (for await on `db`), and `inspect.custom`. Returning `getDb()[symbol]` for `then` is particularly dangerous: anything that does `await db` (e.g. accidentally) will see `db.then` as a function and treat `db` as a thenable. Also there's no `has` trap, so `"select" in db` returns `false` while `db.select` works.
**Impact:** Subtle, hard-to-debug bugs once someone awaits `db` or destructures it. Logging `db` in a debugger may also trigger DB connection on first inspection.
**Fix:** Use a getter-based singleton instead of a Proxy:
```ts
let _db: DrizzleClient | undefined;
export function db(): DrizzleClient {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzle({ client: sql, schema });
  }
  return _db;
}
```
Callers do `db().select(...)`. Slightly noisier but correct, type-safe, and side-effect free.

### WR-08 — `DATABASE_URL!` non-null assertion will surface as a confusing runtime error
**File:** src/db/index.ts:14
**Severity:** Warning
**Issue:** If `DATABASE_URL` is missing in an environment, `neon(undefined!)` throws an opaque message from inside `@neondatabase/serverless` rather than a clear "env var missing." The whole point of the lazy proxy is "don't throw at build time," but it does throw at *first query time* with bad diagnostics.
**Impact:** Painful on-call debugging the first time a deploy ships without the env var.
**Fix:**
```ts
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
const sql = neon(url);
```

---

## Info / Improvements

### IN-01 — Three route groups each render their own `<html>` / `<body>` — duplicated head infrastructure, divergent design tokens
**File:** src/app/(main)/layout.tsx:97, src/app/(ecommerce)/layout.tsx:22, src/app/(photography)/layout.tsx:16
**Severity:** Info
**Issue:** Each layout is a full root layout (`<html><body>`). That's necessary in App Router when route groups need different shells, but it means: (a) the editorial color tokens (`--color-paper`, etc.) loaded via `globals.css` apply everywhere, yet `(ecommerce)` uses hard-coded `bg-[#F8FAFC]` and the deprecated `byu-navy` / `byu-blue` / `byu-sky` palette that CLAUDE.md says is deprecated; (b) `(photography)` ships zero font variables, so its Playfair references via `var(--font-playfair)` fall back to serif until the user navigates to `(main)`; (c) skip-to-content, JSON-LD, GrainOverlay, and Analytics are only on `(main)`.
**Impact:** Visual inconsistency, missing accessibility affordance on subdomain home pages, missing analytics on subdomains, drop in performance/SEO observability for subdomains.
**Fix:** Extract shared `<head>`-level concerns (analytics, skip link, font variable declarations) into a shared sub-component, and migrate `(ecommerce)/ecommerce/page.tsx` off `byu-*` tokens onto the editorial palette per CLAUDE.md.

### IN-02 — Test for admin-cookie pass-through asserts a no-op header but doesn't verify the response type
**File:** src/app/__tests__/proxy.test.ts:108-118
**Severity:** Info
**Issue:** The test only checks `response.headers.get("location") === null` — but `NextResponse.next()` and `NextResponse.rewrite(...)` both lack a Location header. The test will pass even if the proxy silently rewrites `/admin` to `/photography/admin` (which it won't, but the test doesn't *prove* that). Use `isRewrite()` / `getRewrittenUrl()` like the other suites.
**Impact:** Missed regression coverage.
**Fix:** Add `expect(isRewrite(response)).toBe(false)` and `expect(response.status).toBeLessThan(300)`.

### IN-03 — Tests don't cover the WR-01 / CR-01 cases
**File:** src/app/__tests__/proxy.test.ts
**Severity:** Info
**Issue:** No test for: (1) deep subdomain like `staging.photography.philipsun.com` (which today silently passes through); (2) admin path on `*.vercel.app` or `*.localhost` (today bypasses the cookie check); (3) `/admin/login` itself — there's a test asserting "no redirect" but it doesn't assert the matcher *runs* (it could be excluded). Add coverage when fixing CR-01/WR-01.
**Impact:** Regressions on routing/auth fixes go undetected.
**Fix:** Add the missing test cases as part of the CR-01 fix.

### IN-04 — `(ecommerce)/ecommerce/page.tsx` uses deprecated `byu-*` color tokens
**File:** src/app/(ecommerce)/ecommerce/page.tsx:16,19,29,33,46,64,69,74,84,91,102,118,130,154,161,170,186,193,200,211,214,219,222
**Severity:** Info
**Issue:** Per CLAUDE.md: "The old `byu-*` color names are deprecated — if you see them in legacy code, replace with editorial tokens when touching the file." This entire page is built on `byu-navy`, `byu-blue`, `byu-sky`. Since `(ecommerce)/layout.tsx` doesn't load the editorial theme, those classes may not even resolve to the intended swatches — they likely render as raw Tailwind defaults.
**Impact:** Brand drift; possibly broken styling depending on whether the Tailwind 4 `@theme` block defines `byu-*` tokens.
**Fix:** Replace with `--color-paper / --color-ink / --color-accent` per the editorial system documented in CLAUDE.md, the next time the file is touched.

### IN-05 — `getAllPosts()` is called synchronously in a server component without explicit cache
**File:** src/app/(main)/page.tsx:47
**Severity:** Info
**Issue:** Not strictly an infrastructure-phase concern, but worth flagging: every render of the homepage walks `content/blog/` from disk. In dev this is fine; in production the static prerender bakes it once. If incremental revalidation is ever turned on, this becomes an unguarded fs walk on every revalidation.
**Impact:** Latent perf issue if the rendering strategy changes.
**Fix:** Wrap `getAllPosts` in `React.cache` (per-request memoization) or `unstable_cache` once SSR/ISR is in scope.

### IN-06 — `(photography)/photography/page.tsx` hard-codes the site URL in JSON-LD
**File:** src/app/(photography)/photography/page.tsx:69-73,95
**Severity:** Info
**Issue:** Literal `"https://philipsun.com/photography"` is embedded in three places. CLAUDE.md says `src/data/site-config.ts` is the source of truth for site URL. Once subdomain routing is fully live, this URL should also reflect the canonical (subdomain vs. path) — and changes to the production domain require touching this file.
**Impact:** Stale URLs in structured data when the canonical surface moves to `photography.philipsun.com`.
**Fix:** Import `siteConfig` and template the URL; revisit canonical-URL strategy when the subdomain goes live.

---

## Summary

Two critical items dominate: (1) the admin guard fails open on preview/local hosts (CR-01) and (2) `pending_reservations` is missing the constraint/indexes it needs to actually prevent double-booking (CR-02). The schema as shipped will work for happy-path booking but will struggle under concurrency and once table volume grows. Subdomain routing logic in `proxy.ts` is correct for the happy path but brittle on edge cases (deep subdomains, alternate hosts) and the admin cookie is treated as a presence check rather than a verified token (WR-02). The `db` proxy pattern in `src/db/index.ts` is clever but has known footguns around `then`/symbols (WR-07).
