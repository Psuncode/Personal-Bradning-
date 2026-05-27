# Next.js Upgrade Review

**Date:** 2026-05-19
**Branch:** `feat/blog-system-v2`
**Skill:** `next-upgrade` (`.agents/skills/next-upgrade/SKILL.md`)
**Scope:** Audit only — no source edits. Surface Next 13/14/15 patterns that should migrate to Next 16.

---

## Current Versions

| Package | Installed | Latest 16.x line |
|---|---|---|
| `next` | **16.1.6** | 16.x |
| `react` | **19.2.3** | 19.x |
| `react-dom` | **19.2.3** | 19.x |

The project is already on Next 16 and React 19. This review is therefore an **audit for residual pre-16 patterns**, not a version bump.

---

## Verdict

**Overall: clean.** The codebase has already absorbed the two largest Next 15 → 16 migrations:

1. **`middleware.ts` → `src/proxy.ts`** — done. Exports `proxy()` (not `middleware()`) and the `config.matcher`. Next 16 renamed the file/function; this project already uses the new name.
2. **Async Request APIs (`params` / `searchParams` / `cookies()` / `headers()` / `draftMode()`)** — done. Every `params`/`searchParams` is typed as `Promise<…>` and `await`-ed; `cookies()` and `headers()` are awaited in `src/lib/session.ts:70`, `src/app/actions/contact.ts:51`, `src/app/actions/admin-auth.ts:53`.

No use of `next/proxy` (that's not a public module) or any other speculative Next 16 imports was needed — `next/server` is still the correct import path for `NextRequest` / `NextResponse` in route handlers and `proxy.ts`.

---

## Findings

### 1. `unstable_cache` is now stable / deprecated in Next 16 — INFO (low priority)

**File:** `src/lib/serverCalendar.ts:3,210`

```ts
import { unstable_cache } from 'next/cache';
export const getServerAvailability = unstable_cache(_fetchServerAvailability, [TAG], { revalidate: 120, tags: [TAG] });
```

Next 15.3+ introduced the **`'use cache'` directive** and the stable `cacheTag()` / `cacheLife()` APIs (`next/cache`) as the long-term replacement for `unstable_cache`. `unstable_cache` continues to work in Next 16 but is on the deprecation path.

**Recommendation:** Defer until `'use cache'` is GA-stable in this project's risk tolerance. When migrating, replace the wrapper with a top-of-function `'use cache'` directive plus `cacheTag(SERVER_AVAILABILITY_TAG); cacheLife({ revalidate: 120 })`. Requires `experimental.useCache` (or `cacheComponents`) in `next.config.ts`.

**Severity:** Low / advisory — not a regression, no functional issue.

### 2. No `experimental` block configured — INFO

**File:** `next.config.ts`

The config has `headers()` and `images.remotePatterns` but no `experimental` block. Several Next 16 opt-ins (`cacheComponents`, `useCache`, `ppr` partial-prerendering) are not enabled. This is **intentional and safe** for a portfolio site, but worth noting if `unstable_cache` migration (item 1) is ever pursued — `useCache` becomes a prerequisite.

**Severity:** Informational.

### 3. `feed.xml` route uses sync `GET()` — OK, but worth a sanity note

**File:** `src/app/(main)/feed.xml/route.ts:6`

```ts
export const dynamic = "force-static";
export function GET() { … }
```

Sync handlers are still legal in Next 16 when no async request APIs are touched. No action required. Flagging only because Next 16's lint will sometimes prompt to await — this one is fine because it reads filesystem synchronously via `getAllPosts()`.

**Severity:** None.

### 4. `next/font/google` usage — current and correct

**Files:** `src/app/(main)/layout.tsx:2`, `src/app/(ecommerce)/layout.tsx:2`

Modern `next/font/google` import pattern (Inter, Geist_Mono, Playfair_Display) — matches Next 16 conventions. No `@next/font` legacy import anywhere.

### 5. Route segment config — current

`export const runtime = "edge"` (`/og`) and `runtime = "nodejs"` (`/blog/[slug]/og`) are valid in Next 16. No `export const dynamic = "force-dynamic"` smell where unintended. `force-static` on `feed.xml` is appropriate.

### 6. `generateStaticParams` / `generateMetadata` — current

Both functions follow the Next 15+ async-params signature. `generateMetadata({ params }: { params: Promise<{ slug: string }> })` shape is correct in:

- `src/app/(main)/projects/[slug]/page.tsx`
- `src/app/(main)/blog/[slug]/page.tsx`
- `src/app/(main)/blog/[slug]/og/route.tsx`
- `src/app/(main)/blog/tag/[tag]/page.tsx`
- `src/app/(photography)/photography/book/success/page.tsx`

### 7. `fetch` caching defaults — not relevant

Application-level `fetch()` calls in the audited source live only in **client components** (`src/components/booking/PhotographyBookingForm.tsx:311`, `src/lib/icalendarService.ts:35`) hitting first-party `/api/*` routes. Next 16's RSC `fetch` cache default change (uncached by default since 15) doesn't apply here.

### 8. `NextRequest` / `NextResponse` from `next/server` — still correct

Five files import from `next/server`:

- `src/proxy.ts` (canonical for `proxy.ts`)
- `src/app/(main)/api/calendar/route.ts`
- `src/app/(main)/api/checkout/route.ts`
- `src/app/(main)/api/webhooks/stripe/route.ts`
- (plus test mocks)

These are correct in Next 16. There is no `next/proxy` module — only the file `src/proxy.ts` was renamed. Imports stay on `next/server`.

---

## Recommended Actions

| Priority | Action | Effort |
|---|---|---|
| Low | Plan a future migration of `src/lib/serverCalendar.ts:getServerAvailability` from `unstable_cache` → `'use cache'` + `cacheTag`/`cacheLife`. Requires enabling `experimental.useCache` (or `cacheComponents`) in `next.config.ts` and `revalidateTag()` callers continue to work. | ~30 min, behind feature flag |
| None | Everything else | — |

## No Action Needed

- Async params/searchParams migration: complete.
- Async `cookies()`/`headers()` migration: complete.
- `middleware.ts` → `proxy.ts` rename: complete.
- `next/font` modernization: complete.
- `NextRequest`/`NextResponse` imports: correct.

---

## Suggested Codemod (if/when pursuing item 1)

```bash
# Audit only — do not run as part of this review
npx @next/codemod@latest next-async-request-api .   # would be a no-op here
# No official codemod exists yet for unstable_cache → 'use cache'; manual migration.
```
