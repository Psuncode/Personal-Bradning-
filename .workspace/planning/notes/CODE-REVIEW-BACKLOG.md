# Code Review Backlog — feat/blog-system-v2

**Generated:** 2026-05-19
**Source:** 22 skill-lens reviews in `.planning/reviews/*-REVIEW.md`
**Branch:** `feat/blog-system-v2` @ `c6bd1e6`
**Purpose:** Single index of fixable findings. Each item cites the originating REVIEW(s), severity, file:line where known, and a one-line fix sketch. Organized first by **theme** (so a `/brainstorm` on one area pulls everything coherent), then by **severity** for triage.

---

## 🎯 Brainstorm cluster — Email + Contact + Payment

These three subsystems share data flow (`/contact` form → DB → admin view; `/api/checkout` → Stripe → webhook → Resend email → DB), so fixes should be designed together for coherence. Findings below are from drizzle, neon, stripe-best-practices, nodejs-backend-patterns, zod, vitest, typescript-advanced-types, deploy-to-vercel.

### Critical
1. **Stripe webhook write atomicity is fictional.** `handleCheckoutCompleted` does 3 sequential writes (bookings → payments → delete pending) with no transaction. `drizzle-orm/neon-http` driver **can't** do multi-statement transactions — only `db.batch`. Mid-sequence failure + idempotency check = broken state silently 200-OKs on retry. **Fix options:** switch to `neon-serverless` (WebSocket driver), OR refactor to `db.batch` with client-generated IDs + `ON CONFLICT DO NOTHING` on payments. [drizzle CR-01, neon-postgres]

2. **`NEXT_PUBLIC_PHOTOGRAPHY_URL` localhost fallback in Stripe success URL.** `localhost:3000` if env var is missing in production → Stripe charges, then redirects customer to a dead URL. Silent revenue loss. **Fix:** fail-fast at module load OR validate before constructing Checkout session. [deploy-to-vercel]

3. **`/api/calendar` is unauthenticated, unvalidated, and leaks `error.message`.** DoS surface + info disclosure. **Fix:** validate query, add rate limit, return generic 5xx with structured logging. [nodejs-backend-patterns]

4. **`serverCalendar.ts` logs the iCloud username (PII)** — persists in Vercel logs ~30 days. **Fix:** redact in log statements. [nodejs-backend-patterns]

### High
5. **`eventDate` equality is timezone/precision-fragile.** Double-booking precheck AND `UNIQUE(package_id, event_date)` rely on exact instant equality — millisecond drift between concurrent requests defeats both. **Fix:** app-side normalize to `date_trunc('day', …)` at boundary OR add functional index. [drizzle HI-02]

6. **`payments.bookingId` + `bookings.packageId` still nullable** despite every code path setting them (pendingReservations was tightened in 0002; these were missed). **Fix:** add migration `0004` setting both to NOT NULL. [drizzle CR-02]

7. **Stripe webhook still uses deprecated `z.string().email()` (v3 syntax)** while contact/booking use v4 `z.email()`. Plus `clientName: z.string().min(1)` accepts `"   "` (whitespace) — flows straight into the DB. **Fix:** v4 syntax + `RequiredTrimmedString` from common helper. [zod CRITICAL]

8. **Contact action has no rate-limit.** Rate-limiter exists in `lib/rate-limit.ts` but only wired to login. **Fix:** wire contactRateLimiter with per-IP key + global ceiling. [nodejs-backend-patterns]

9. **`serverCalendar.ts` silently returns `[]` when iCloud creds missing** — indistinguishable from "fully booked" to callers. **Fix:** distinguish "no creds" (config error → bubble up) vs "no busy times" (empty array is valid). [next-best-practices]

10. **Email template `escapeHtml` coverage incomplete** — was added in `bf4951e` for `clientName/clientEmail/packageName`, but not all interpolations audited. **Fix:** sweep `lib/email.ts` for any remaining unescaped `${...}` in HTML strings. [stripe-best-practices advisory]

### Medium
11. **No native Stripe `idempotency_key` on `checkout.sessions.create`.** App-side idempotency works but native one adds defense-in-depth. [stripe-best-practices]
12. **Missing positive-path tests for `charge.refunded` + `payment_intent.payment_failed`.** Handlers exist but only error paths tested. [stripe-best-practices]
13. **Migrate to Stripe Restricted API Key scoped to Checkout** instead of full secret key. [stripe-best-practices]
14. **`optionalTrimmed` helper duplicated** across `contact.ts`, `booking.ts`, drifted version in webhook. **Fix:** extract to `src/lib/validation/common.ts` with shared `Email`, `RequiredTrimmedString`, `CONTROL_CHARS`. [zod HIGH]
15. **`eventDate` returned as string** from webhook metadata schema forces 3× `new Date(meta.eventDate)` downstream. **Fix:** add `.transform(s => new Date(s))`. [zod MEDIUM]
16. **Stripe-event handler lacks `assertNever` exhaustiveness sink** — new event variants compile silently. [typescript-advanced-types]
17. **`process.env.X!` non-null assertions** on Stripe/Resend/webhook secrets — `session.ts` shows correct fail-fast pattern; copy it. [typescript-advanced-types]
18. **`as ContactFormFieldErrors` cast** in `actions/contact.ts` discards Zod's inferred error shape. **Fix:** derive via mapped type. [typescript-advanced-types]
19. **Pre-checkout race window (~500ms)** — pending-reservation insert happens BEFORE post-Stripe `revalidateTag`. Move revalidate earlier. [next-cache-components]
20. **In-memory `RateLimiter` won't survive horizontal scale** (already noted in code). Future: Vercel KV or Upstash. [nodejs-backend-patterns]

---

## 🔐 Auth + Security

### Critical
21. **`PhotographyBookingForm` uses `<div role="button" tabIndex={0}>` for package cards** with manual Enter/Space handler and no visible focus ring. **Fix:** native `<button>` + `aria-pressed` + `focus-visible`. [accessibility C2]

### Medium
22. **`src/proxy.ts` matcher is too broad** — runs on `/api/*` (incl. Stripe webhook), `/feed.xml`, OG routes. Not a live bug today but future foot-gun. **Fix:** tighten to `/admin/:path*` allowlist + non-API surfaces. [next-best-practices]

---

## 🎨 Accessibility + SEO

### Critical
23. **No `viewport` meta tag** — Next 16 no longer auto-injects; every page fails Lighthouse mobile-friendliness + Google mobile-first index signal. **Fix:** `export const viewport` in `src/app/layout.tsx`. [seo CRITICAL]
24. **`BookingForm` /meet step has unlabeled inputs** — 3 `<label>` without `htmlFor`, inputs without `id`. Screen readers can't announce. **Fix:** copy pattern from sibling `PhotographyBookingForm`. [accessibility C1]
25. **Sticky-header focus-not-obscured violation (WCAG 2.4.11)** — 64px sticky navbar has no `scroll-margin-top`. Keyboard focus lands behind. **Fix:** one-rule CSS. [accessibility C3]

### High
26. **Article JSON-LD `image` points at synthetic OG card** instead of `post.cover.src` (the real photo). `publisher` typed `Person` instead of `Organization` with `logo` ImageObject. Silently disqualifies posts from Google rich results. [seo HIGH]
27. **No canonical URLs anywhere.** No `alternates.canonical` in any `generateMetadata`. Duplicate-content risk on tag pages, photography sub-paths, trailing-slash variants. [seo HIGH]
28. **20 components use `hover:` without `focus-visible:`** — WCAG 2.4.7. Keyboard users can't see what's focused. [tailwind-css-patterns]
29. **`useReducedMotion` honored only in Hero** — `about`/`current-focus`/`case-studies` ignore it. Accessibility regression. [frontend-design]

---

## 🏗️ Schema + DB Migrations

### High
30. **No Vercel-Neon preview-branch wiring** — PR previews mutate prod-shaped data. **Fix:** Neon Postgres app on Vercel project → auto-create branch per preview. [neon-postgres]

### Medium
31. **No `db:migrate` npm scripts.** `DATABASE_URL_UNPOOLED ?? DATABASE_URL` fallback in `drizzle.config.ts` masks misconfig. [neon-postgres]
32. **No `fetchOptions`/AbortController/retry around cold-start fetches.** [neon-postgres]
33. **Migrations 0001 + 0002 + 0003 still unapplied** — pre-deploy duplicate-row queries flagged in earlier commits. [Wave 2-4 handoff]

---

## ⚛️ React + Next + Caching

### High
34. **No `error.tsx` / `global-error.tsx` anywhere.** Tree has `loading.tsx` + `not-found.tsx` but zero error boundaries. DB throws / CalDAV failures / Stripe lookups fall through to Next's default error page. **Fix:** add root `global-error.tsx` + `(main)/error.tsx`. [next-best-practices, react-best-practices]
35. **Over-applied `"use client"`** — `hero/about/case-studies/current-focus/content-grid/project-card.tsx` are client purely to host Framer Motion entrances. No state or handlers. **Fix:** extract `<FadeInSection>` client wrapper, keep sections as RSC. [react-best-practices]
36. **Duplicated booking-form state machines** — `BookingForm` (492 lines) + `PhotographyBookingForm` (744 lines) maintain ~10 `useState` slots with identical calendar logic. **Fix:** collapse with `useReducer` + shared `useCalendarAvailability` hook OR a `BookingFlow.*` compound component with context. [react-best-practices, composition-patterns]

### Medium
37. **`getAllPosts`/`getPostBySlug` re-walk blog filesystem 5–6× per render.** Wrap in React `cache()`. [next-cache-components]
38. **`unstable_cache` on deprecation path.** Future migration to `'use cache'` + `cacheTag`/`cacheLife` directives. [next-upgrade, next-cache-components]
39. **Index-as-key in mutable lists** — `availableSlots`, gallery, content-grid, case-studies. Use content-derived keys. [react-best-practices]
40. **`ProjectCover` uses boolean+layout flags driving 3 branchy returns + inner `variant` prop.** Should split into 4 explicit variant components. [composition-patterns]

---

## 🛠️ Build + CI + Deploy

### High
41. **23 npm audit vulns (10 mod / 13 high)** — mostly resolved by `npm install next@16.2.6 && npm audit fix`. postcss XSS via `next@16.1.6` + stale `drizzle-kit@0.31` are the only direct-dep culprits. [nodejs-best-practices]
42. **Prebuild script does unscoped `rmSync` of `_blog-assets`** with no path-containment check; no symlink/path-traversal guard when mirroring; silently wipes assets if `content/blog/` is missing. [bash-defensive-patterns]

### Medium
43. **CI workflow has unpinned actions, floating Node major, no `timeout-minutes`, brace-expansion in vitest `--exclude`** (bash-only). [bash-defensive-patterns]
44. **`DEPLOY_TO_VERCEL.sh` only `set -e`** — needs `set -Eeuo pipefail` + error traps + `: "${GITHUB_USER:?}"` guards. [bash-defensive-patterns]
45. **No `engines` field in package.json + no `.nvmrc`** — Node version drift between CI (20) and Vercel (22). [nodejs-best-practices, deploy-to-vercel]
46. **`.env.local.example` omits `SESSION_VERSION`, `BOOKING_NOTIFICATION_EMAIL`, all `ICAL_*`.** New dev clones miss them. [deploy-to-vercel]
47. **`/api/webhooks/stripe` and `/api/calendar` lack explicit `runtime`/`maxDuration`.** [deploy-to-vercel]
48. **`@testing-library/dom` in `dependencies`** (should be dev). `ws` is a direct dep with a CVE for unclear reason. [nodejs-best-practices]

---

## 🎨 Design System Drift

### Medium
49. **4 real palette breaches** outside editorial tokens: `#003DA5` Cal brand, `#0a0a0a` code blocks, `content-grid.tsx` LinkedIn-blue/gray, `bg-white/N` cards. [frontend-design]
50. **~470 occurrences of verbose arbitrary syntax** (`text-[color:var(--color-ink)]`) instead of auto-generated shorthand (`text-ink`). Even `globals.css` does this inside `@apply`. **Fix:** sweep + replace via codemod. [tailwind-css-patterns]
51. **9 template-literal classNames missing `cn()`** (loses tailwind-merge safety); 3 unused custom utilities (`editorial-title`, `editorial-copy`, `editorial-numerals`); partially-wired dark mode; ~10 lingering hex/rgba. [tailwind-css-patterns]
52. **Booking forms + admin login use raw `<input>`/`<label>`** instead of shadcn `Field`/`Input` primitives. `admin/page.tsx` uses `<hr>` instead of `<Separator>`. [shadcn]
53. **Color leaks in consumers** — `bg-gray-*`/`text-gray-*` in `content-grid.tsx` + booking forms. `<Button>`/`<Badge>` callsites override colors. [shadcn]
54. **Navbar reinvents `DropdownMenu`** — should use shadcn primitive. Icons inside Buttons use `size-4` instead of `data-icon`. [shadcn]
55. **Editorial tokens declared as `@theme` constants instead of `:root` variables** — parallel-definition drift with shadcn tokens. [tailwind-v4-shadcn]
56. **Card radii sprawl across 6 values; 5 distinct heading scales; 20+ inline `font-[family-name:...]` invocations** while declared utilities sit unused. [frontend-design]

---

## ✅ TypeScript Polish

### Medium
57. **`CoverImage` should be discriminated union on `layout`** — `focalPoint` only applies to `"overlay"`. [typescript-advanced-types]

### Low
58. Brandable IDs (slug, packageId); duplicate `TimeSlot`; redundant `as TimeSlot[]`; loose `Record<string, string>` for SUBDOMAINS; non-`readonly` data tables; `Content as React.ComponentType` cast; `Object.entries` cast in contact-section. [typescript-advanced-types]

---

## 🧪 Testing Quality

### Medium
59. **Env-var handling inconsistent in tests** — 5 files mutate `process.env.X` raw with hand-rolled restore; only `proxy.test.ts` uses Vitest 3's `vi.stubEnv`. Manual restore can silently fail. **Fix:** centralize via `vi.unstubAllEnvs()` in `src/test/setup.ts`. [vitest]
60. **Fake-timer leak in `checkout.test.ts`** — `vi.useFakeTimers()` in `beforeEach` without matching `afterEach(() => vi.useRealTimers())`. Leaks into subsequent files in same worker. [vitest]
61. **`contact-section.test.tsx` asserts on Tailwind class names** — 8 asserts will break on layout refactors. Migrate to roles/labels. [vitest]

---

## Summary counts

| Theme | Count |
|---|---|
| Email + Contact + Payment | 20 |
| Auth + Security | 2 |
| Accessibility + SEO | 7 |
| Schema + DB Migrations | 4 |
| React + Next + Caching | 7 |
| Build + CI + Deploy | 8 |
| Design System Drift | 8 |
| TypeScript Polish | 2 |
| Testing Quality | 3 |
| **Total** | **61** |

| Severity | Count |
|---|---|
| Critical (P0) | 8 |
| High (P1) | 14 |
| Medium (P2) | 31 |
| Low (P3) | 8 |

## Next moves

1. **`/brainstorm`** on the Email + Contact + Payment cluster (#1–20) — the user's flagged area. Use this file as context. The brainstorm should produce a coherent design that picks a driver (neon-http batch vs neon-serverless transactions), unifies validation helpers, and decides the rate-limiting story end-to-end.

2. After brainstorm: write a `gsd-phase` plan for the email/contact/payment work that covers all 20 items in a coherent sequence.

3. Side-quest items that don't need brainstorm (can ship independently):
   - SEO #23 viewport meta tag — 5 min
   - Accessibility #24, #25 — 30 min
   - Build #41 `next@16.2.6` upgrade + `npm audit fix` — 15 min
   - `error.tsx` boundaries #34 — 1 hr
