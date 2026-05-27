---
title: Next.js Best Practices Review
date: 2026-05-19
branch: feat/blog-system-v2
skill: next-best-practices (.agents/skills/next-best-practices/SKILL.md)
scope: src/app/ (all routes), next.config.ts, root layout, src/proxy.ts, env handling
mode: audit-only (no source edits)
verdict: mostly-clean-with-3-medium-findings
---

# Next.js Best Practices Review

This is a lens-application of `.agents/skills/next-best-practices/SKILL.md`
against `src/app/`, `next.config.ts`, the root layout, and the new `src/proxy.ts`
proxy (middleware → proxy rename in Next 16). The codebase is on Next 16.1.6 +
React 19.2.3 and has already absorbed the major Next 15 → 16 shifts
(async `params`/`searchParams`, `middleware → proxy`, `revalidateTag` arity).

The review covers:

1. App Router patterns (RSC vs client boundary, `"use client"` placement, Server Actions usage)
2. Data fetching (fetch caching, dynamic vs static)
3. Metadata API usage
4. `error.tsx` / `loading.tsx` / `not-found.tsx` coverage
5. Proxy / middleware (`src/proxy.ts`)
6. `generateStaticParams` + `dynamicParams`
7. Request/response patterns in API routes
8. Env var handling at module load vs request time (lazy-singleton vs fail-fast)

---

## Verdict

**Mostly clean.** The App Router conventions are well-applied — server pages by
default, narrow `"use client"` islands at exactly three leaves, async
`params`/`searchParams` Promises everywhere, async `generateMetadata`, file-based
metadata for sitemap/robots, JSON-LD safely rendered via `safeJsonLd`. Route
handlers correctly use Node-only runtime for filesystem-touching paths
(`/blog/[slug]/og`) and Edge for the pure-render OG.

Three medium findings that are worth landing in follow-up phases, plus a handful
of minor nits. Nothing is a release blocker.

---

## Findings

### 🟡 Medium-1 — No `error.tsx` boundaries anywhere

**Severity:** Medium
**Locations:** entire `src/app/` tree

`find src/app -name "error.tsx" -o -name "global-error.tsx"` returns **zero
results**. Only `(main)/loading.tsx` and `(main)/not-found.tsx` exist.

Skill rule (`error-handling.md`): every route segment that can throw at render
time should ship an `error.tsx`, and the root needs a `global-error.tsx` to
catch errors in the root layout itself (which is the only thing that can render
when the rest of the tree is dead).

Concretely, several pages do real I/O at render time and can absolutely throw:

- `(main)/admin/page.tsx` — two `db.select()` calls (Postgres via Drizzle).
- `(main)/meet/page.tsx` and `(photography)/photography/book/page.tsx` — call
  `getServerAvailability()` which hits iCloud CalDAV. The function catches
  fetch errors internally and returns `{ error }`, **but** an upstream throw
  (e.g. `unstable_cache` itself, or a `toZonedTime` blow-up) still surfaces as
  a 500 to the user with no fallback UI.
- `(photography)/photography/book/success/page.tsx` — `stripe.checkout.sessions.retrieve`.
  This file already redirects on catch, but other Stripe-touching server pages
  do not.
- `(main)/blog/[slug]/page.tsx` and `(main)/projects/[slug]/page.tsx` — render
  MDX / look up data from in-memory arrays, low risk but free wins.

Recommended fix: add a root `src/app/global-error.tsx` ("use client") and at
least one `(main)/error.tsx` that resets/retries. The booking surfaces would
benefit from a more targeted boundary that explains "calendar unavailable, try
again or reach out via LinkedIn."

---

### 🟡 Medium-2 — `src/proxy.ts` matcher does not exclude API routes or proxy itself

**Severity:** Medium
**Location:** `src/proxy.ts:96-101`

Current matcher:

```ts
matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"]
```

This intentionally runs on **everything else**, including:

- `/api/calendar`, `/api/checkout`, `/api/webhooks/stripe`
- `/blog/<slug>/og`, `/og` (image responses)
- Static metadata files (`/sitemap.xml` is excluded; `/feed.xml` is **not**)

For the admin-cookie guard that's actually desirable — but the host-based
subdomain rewrite logic at the bottom of `proxy()` then runs on every API
request too, and the `/feed.xml` route in particular sits at the apex domain
and could be rewritten under `photography.philipsun.com` (it would 404 because
no `/photography/feed.xml` page exists). Not a live bug today (the SUBDOMAINS
gate filters by host first), but it's defensive in depth that the skill
explicitly calls out.

Also: `/api/webhooks/stripe` is hit by Stripe's egress with no admin cookie and
no host header rewriting needed. Running the proxy on it adds 1 latency hop per
webhook for no behavioral reason.

Recommended fix: tighten the matcher to skip `/api`, `/_next`, `/feed.xml`,
`/og`, and all per-route `/og` paths — or invert it to an allowlist of
`["/admin/:path*", "/((?!api|_next|.*\\.).*)"]`. The admin guard would then
need to move into a per-route check (which `(main)/admin/page.tsx` already
performs via `isSessionValid` anyway — the proxy guard is currently
belt-and-suspenders, which is fine, but the trade-off becomes intentional
rather than incidental).

---

### 🟡 Medium-3 — Lazy-singleton vs fail-fast inconsistency for env vars

**Severity:** Medium
**Locations:** `src/lib/stripe.ts:11-26`, `src/lib/email.ts:11`, `src/lib/serverCalendar.ts:44-51` vs `src/lib/session.ts:28-39`

The codebase has **two incompatible patterns** for env-driven external clients:

1. **Fail-fast at module load** — `src/lib/session.ts:28-39` validates
   `SESSION_SECRET` length up front, throws on misconfig, allows a test-mode
   escape. The comment explicitly justifies this as turning latent 500s into
   loud deploy-time errors.

2. **Lazy proxy singleton** — `src/lib/stripe.ts:14-26` wraps the Stripe SDK in
   a `Proxy` so the constructor isn't called until the first method access.
   The comment says "avoids Stripe constructor throwing at build time when
   `STRIPE_SECRET_KEY` is not set." Email (`Resend`) uses the same lazy pattern.
   `serverCalendar.ts` doesn't validate at all — it returns `[]` and logs a
   warning when iCloud creds are missing, which is arguably *too quiet*.

The skill's `bundling.md` and the general best-practices stance is: **read env
vars at request time, not module load**, but **validate them eagerly when they
are required for the route to function**. The current split is fine but
inconsistent — `session.ts` is strict, `stripe.ts` is lenient, and
`serverCalendar.ts` is silent.

Two recommendations, in order of impact:

1. **Make `stripe.ts` mirror `session.ts`** — fail fast when
   `STRIPE_SECRET_KEY` is missing *at first request* (not module load, since
   `next build` doesn't have prod secrets). The lazy-proxy is doing this
   already by accident, but the `!` non-null assertion at `stripe.ts:15`
   produces a confusing `[stripe] string did not match expected pattern` instead
   of a clean "STRIPE_SECRET_KEY is not set." Wrap it in a
   `resolveStripeKey()` helper symmetric to `resolveSessionSecret()`.

2. **Make `serverCalendar.ts` loud** — currently a missing
   `ICAL_USERNAME`/`PASSWORD`/`CALENDAR_ID` returns `[]` events and lets
   `/meet` render as "no availability anywhere," indistinguishable from a real
   "everything booked" state. Either throw or surface an explicit
   `{ events: [], busyDates: [], error: 'calendar-not-configured' }` so the UI
   can show a degraded state.

The skill calls this out under both `route-handlers.md` (env at request time)
and the broader "fail-fast" guidance from `runtime-selection.md` /
`bundling.md`.

---

## Smaller nits (low priority, drive-by fixes)

### N1 — `redirect()` in catch blocks needs `unstable_rethrow`

`src/app/(photography)/photography/book/success/page.tsx:29-31`:

```ts
try { session = await stripe.checkout.sessions.retrieve(sessionId); }
catch { redirect('/photography/book'); }
```

`redirect()` works by throwing a `NEXT_REDIRECT` error. A future maintainer
wrapping this in a broader `try/catch` would swallow the redirect. Skill rule
(`error-handling.md`): use `unstable_rethrow(err)` inside catch blocks that
might see framework errors. Today this file is safe because the catch is
bare, but it's a foot-gun if anyone refactors.

### N2 — Server Action error swallowing in `saveContact`

`src/app/actions/contact.ts:82-85` catches all DB errors and returns
`{ success: false, error: 'Something went wrong...' }`. That's correct for
user-facing copy, but `console.error('saveContact error:', err)` should
include enough structure (the way `webhook.ts` does with
`MANUAL_FOLLOWUP_REQUIRED`) so log scrapers can alert. Not a Next-specific
issue — flagging because the action otherwise looks textbook.

### N3 — `(main)/loading.tsx` exists but no sibling `error.tsx`

The presence of `loading.tsx` makes the missing `error.tsx` (Medium-1) more
visible: users get a spinner during streaming, then a Next.js default error
page if the render throws. A matched pair is the typical pattern.

### N4 — `feed.xml/route.ts` uses `export const dynamic = "force-static"` — good — but no `Cache-Control: s-maxage`

`Cache-Control: public, max-age=3600` is set, which covers the browser and CDN
freshness for an hour but is a missed opportunity for `s-maxage=3600,
stale-while-revalidate=86400` to keep edges warm. Minor SEO/perf win.

### N5 — `(main)/og/route.tsx` runtime mismatch with blog OG

Main `/og` uses `export const runtime = "edge"`, blog `/blog/<slug>/og` uses
`runtime = "nodejs"` (correctly, since it needs `getPostBySlug` filesystem
access). Worth a one-line comment in the main `/og` route explaining the
divergence so a future maintainer doesn't "harmonize" them.

### N6 — `generateStaticParams` returns no `dynamicParams = false` in `[slug]` routes

`(main)/projects/[slug]/page.tsx` and `(main)/blog/[slug]/page.tsx` both ship a
`generateStaticParams` but allow unknown slugs to fall through to runtime
rendering (which then `notFound()`s). For these closed sets, declaring
`export const dynamicParams = false` would short-circuit unknown slugs to a
static 404 instead of running the page handler. Trade-off: hot-fixing a
typo'd blog folder requires a redeploy. Defer until traffic justifies it.

### N7 — `(main)/admin/page.tsx` is rendered by an async RSC but DB calls aren't `Promise.all`'d

```ts
const allContacts = await db.select()...
const allBookings = await db.select()...
```

Two sequential awaits where `Promise.all` would parallelize. The skill's
`data-patterns.md` flags this as the canonical waterfall. Both queries hit the
same DB, so the absolute win is small, but it's free.

---

## What's already good

For balance:

- **Async params/searchParams everywhere.** Every dynamic route correctly
  types `params: Promise<...>` and awaits it. No legacy sync access remains.
- **`"use client"` discipline.** Only three files in `src/app/` carry the
  directive: `admin/LogoutButton.tsx`, `admin/login/page.tsx`,
  `photography/gallery/GalleryGrid.tsx`. Each is a true client island
  (form state, interactive filter). No top-level page is needlessly client.
- **Server Actions over API routes** where it counts — `actions/contact.ts`
  and `actions/admin-auth.ts` are correctly `'use server'` and use
  `useActionState` on the client side. CSRF is delegated to Next's encrypted
  action IDs (called out explicitly in the admin-auth comment).
- **Image optimization.** Every `<Image>` ships explicit `sizes`; the hero on
  `/photography` uses `priority`. `next.config.ts` has the `remotePatterns`
  allowlist locked to two specific hosts (no wildcard).
- **Metadata API usage is exemplary.** `metadataBase` on the root layout, a
  `title.template`, full OG + Twitter cards, per-route `generateMetadata` that
  awaits `params`, `alternates.types['application/rss+xml']` on `/blog`.
- **Fonts via `next/font/google`** — Inter, Geist Mono, Playfair Display all
  loaded through the official Next mechanism with `subsets: ["latin"]` and
  `variable: "--font-..."` for Tailwind 4 integration. No CSS `@import`.
- **Route handler patterns.** `/api/webhooks/stripe` reads the **raw body**
  (`request.text()`) before signature verification — the #1 webhook footgun.
  Returns clean 4xx for missing signatures, 5xx for handler errors so Stripe
  retries.
- **Cache invalidation.** `revalidateTag(SERVER_AVAILABILITY_TAG, 'max')` is
  called from `/api/checkout` and webhook handlers after mutations. The
  `'max'` second arg is the Next 16 required form.
- **`generateStaticParams`** is correctly used for blog tags and post slugs.
  The tag page even handles URL-encoded inputs (`decodeURIComponent(tag)`),
  closing a real bug from the recent commit history.
- **JSON-LD safety.** All structured data goes through `safeJsonLd()` (not
  inline `JSON.stringify`), which prevents XSS via crafted content.

---

## Out of scope (not reviewed)

- `(ecommerce)` route group — placeholder per `CLAUDE.md`, only one page.
- Test files — `CLAUDE.md` documents a list of pre-existing TS errors in
  `src/app/__tests__/` that are explicitly out of scope.
- `next.config.ts` — verified during the `next-upgrade` review (referenced in
  `.planning/reviews/next-upgrade-REVIEW.md`).
- React 19 / Compiler — not a Next.js concern strictly; flagged in the
  next-upgrade review as deferred until ecosystem stabilizes.

---

## Suggested follow-up phases (in priority order)

1. **`add-error-boundaries`** — root `global-error.tsx` + `(main)/error.tsx` +
   targeted boundary on booking surfaces. (Medium-1)
2. **`tighten-proxy-matcher`** — exclude `/api`, `/feed.xml`, OG routes; add
   tests for the rewrites that *should* fire and the paths that should fall
   through. (Medium-2)
3. **`standardize-env-validation`** — promote the `session.ts`
   `resolveSessionSecret()` pattern to `stripe.ts`, `email.ts`, and
   `serverCalendar.ts`. Surface "calendar-not-configured" as a distinct UI
   state. (Medium-3)
4. Nit cleanup pass: N1 (`unstable_rethrow`), N6 (`dynamicParams = false`),
   N7 (`Promise.all` in admin page).
