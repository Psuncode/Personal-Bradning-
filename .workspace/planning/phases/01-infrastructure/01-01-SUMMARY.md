---
phase: 01-infrastructure
plan: 01
subsystem: infra
tags: [nextjs, routing, route-groups, proxy, subdomain, vitest]

# Dependency graph
requires: []
provides:
  - Next.js App Router restructured into (main), (photography), (ecommerce) route groups
  - src/proxy.ts with NextResponse.rewrite() subdomain routing
  - Photography subdomain routed to /photography internal path
  - Ecommerce subdomain routed to /ecommerce internal path
  - Preview .vercel.app URLs pass through without rewriting
  - All 68 tests green; npm run build exits 0
affects: [02-photography, 03-ecommerce, all phases using route groups]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Route group pattern: (main)/ for main site, (photography)/ and (ecommerce)/ for subdomains"
    - "Proxy pattern: src/proxy.ts exports proxy() function (Next.js 16 convention, not middleware.ts)"
    - "Subdomain routing: host header with nextUrl.host fallback for test compatibility"
    - "Internal path pattern: subdomains rewrite to /photography and /ecommerce prefixes, not /(group) filesystem paths"

key-files:
  created:
    - src/proxy.ts
    - src/app/(main)/layout.tsx
    - src/app/(main)/page.tsx
    - src/app/(photography)/layout.tsx
    - src/app/(photography)/photography/page.tsx
    - src/app/(ecommerce)/layout.tsx
    - src/app/(ecommerce)/ecommerce/page.tsx
    - src/app/__tests__/proxy.test.ts
  modified:
    - src/app/__tests__/home.test.tsx
    - src/app/__tests__/contact.test.tsx
    - src/app/__tests__/meet.test.tsx
    - src/app/__tests__/projects.test.tsx

key-decisions:
  - "Subdomain rewrite targets /photography and /ecommerce URL paths (not /(photography) filesystem paths) — Next.js Turbopack forbids multiple route group root pages resolving to the same URL path"
  - "Proxy reads host header with nextUrl.host fallback to handle Vitest test environment where NextRequest does not auto-set host header"
  - "Photography and ecommerce placeholder pages placed at (group)/subdomain/page.tsx to avoid URL conflict with (main)/page.tsx at /"

patterns-established:
  - "Route group root pages: (photography)/photography/page.tsx and (ecommerce)/ecommerce/page.tsx (not at route group root to avoid / conflict)"
  - "Proxy test pattern: use next/experimental/testing/server isRewrite/getRewrittenUrl helpers"

requirements-completed: [SUB-01]

# Metrics
duration: 8min
completed: 2026-03-18
---

# Phase 1 Plan 01: Route Group Restructuring + Subdomain Proxy Summary

**Next.js App Router restructured into three route groups with src/proxy.ts routing photography and ecommerce subdomains to dedicated /photography and /ecommerce internal URL paths**

## Performance

- **Duration:** 8 min
- **Started:** 2026-03-18T03:35:06Z
- **Completed:** 2026-03-18T03:43:26Z
- **Tasks:** 2
- **Files modified:** 22

## Accomplishments
- Moved all existing main site files into `src/app/(main)/` route group preserving functionality
- Created `(photography)` and `(ecommerce)` route groups with root layouts and placeholder pages
- Created `src/proxy.ts` with 10-case routing logic for subdomain → internal URL rewriting
- All 68 tests pass (58 original + 10 new proxy tests), `npm run build` exits 0

## Task Commits

Each task was committed atomically:

1. **Task 1: Move routes into (main) group and create subdomain placeholders** - `7b8631e` (feat)
2. **Task 2: Create src/proxy.ts and proxy unit tests** - `66a7d82` (feat)

## Files Created/Modified
- `src/proxy.ts` — Subdomain routing proxy; maps photography/ecommerce subdomains to /photography and /ecommerce internal URL paths
- `src/app/(main)/layout.tsx` — Main site root layout (moved from src/app/layout.tsx, CSS import updated to ../globals.css)
- `src/app/(main)/page.tsx` — Homepage (moved, no changes)
- `src/app/(photography)/layout.tsx` — Photography subdomain root layout with minimal html/body structure
- `src/app/(photography)/photography/page.tsx` — Photography placeholder ("Coming soon")
- `src/app/(ecommerce)/layout.tsx` — Ecommerce subdomain root layout
- `src/app/(ecommerce)/ecommerce/page.tsx` — Ecommerce placeholder ("Coming soon")
- `src/app/__tests__/proxy.test.ts` — 10 proxy routing test cases
- `src/app/__tests__/home.test.tsx` — Updated import + added useReducedMotion to framer-motion mock
- `src/app/__tests__/contact.test.tsx` — Updated import + regex label matching for aria-hidden asterisks
- `src/app/__tests__/meet.test.tsx` — Updated import path
- `src/app/__tests__/projects.test.tsx` — Updated import path

## Decisions Made
- Subdomain proxy rewrites to `/photography` and `/ecommerce` URL paths rather than `/(photography)` filesystem paths. Next.js Turbopack (and webpack) raise a build error when multiple route groups have pages resolving to the same URL (`/`). Using dedicated URL prefixes eliminates the conflict.
- Added `nextUrl.host` as fallback in proxy when `host` header is null. `NextRequest` in Vitest's jsdom environment does not auto-populate the `host` header from the URL constructor; `nextUrl.host` is always set correctly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added useReducedMotion to framer-motion mock in home.test.tsx**
- **Found during:** Task 1 (test verification)
- **Issue:** hero.tsx imports `useReducedMotion` from framer-motion; the mock only defined `motion.*` and `animate`, causing all home tests to throw "No useReducedMotion export is defined on the mock"
- **Fix:** Added `useReducedMotion: () => false` to the vi.mock return value
- **Files modified:** src/app/__tests__/home.test.tsx
- **Verification:** All 11 home tests pass
- **Committed in:** 7b8631e (Task 1 commit)

**2. [Rule 1 - Bug] Updated contact test label matcher to regex**
- **Found during:** Task 1 (test verification)
- **Issue:** contact-section.tsx was modified (working directory change from previous session) to add `Name <span aria-hidden="true">*</span>` to form labels; getByLabelText("Name") failed due to trailing whitespace in the label text node
- **Fix:** Changed getByLabelText("Name") to getByLabelText(/^Name/i) for all four form fields
- **Files modified:** src/app/__tests__/contact.test.tsx
- **Verification:** All 16 contact tests pass
- **Committed in:** 7b8631e (Task 1 commit)

**3. [Rule 1 - Bug] Fixed route group page URL conflict (Turbopack build error)**
- **Found during:** Task 2 (build verification)
- **Issue:** `(photography)/page.tsx` and `(ecommerce)/page.tsx` at route group root both resolve to URL `/`, conflicting with `(main)/page.tsx`. Turbopack build error: "You cannot have two parallel pages that resolve to the same path"
- **Fix:** Moved `(photography)/page.tsx` → `(photography)/photography/page.tsx` and `(ecommerce)/page.tsx` → `(ecommerce)/ecommerce/page.tsx`. Updated proxy SUBDOMAINS map to use `/photography` and `/ecommerce` as rewrite targets instead of `/(photography)` and `/(ecommerce)`. Updated proxy tests accordingly.
- **Files modified:** src/proxy.ts, src/app/(photography)/photography/page.tsx (moved), src/app/(ecommerce)/ecommerce/page.tsx (moved), src/app/__tests__/proxy.test.ts
- **Verification:** `npm run build` exits 0, all 68 tests pass
- **Committed in:** 66a7d82 (Task 2 commit)

**4. [Rule 1 - Bug] Added nextUrl.host fallback in proxy for test environment**
- **Found during:** Task 2 (proxy test verification)
- **Issue:** `request.headers.get("host")` returns null in Vitest's jsdom environment when constructing NextRequest with URL string; proxy function fell through to pass-through behavior on all requests
- **Fix:** Changed `request.headers.get("host") ?? ""` to `request.headers.get("host") ?? request.nextUrl.host ?? ""` — production always has the header; test environment uses nextUrl.host
- **Files modified:** src/proxy.ts
- **Verification:** All 10 proxy tests pass
- **Committed in:** 66a7d82 (Task 2 commit)

---

**Total deviations:** 4 auto-fixed (4 Rule 1 bugs)
**Impact on plan:** All fixes required for correctness. Most significant was the Turbopack parallel pages constraint, which required a URL path design change (/(photography) → /photography). This changes the internal routing convention but does not affect external behavior or the proxy's purpose.

## Issues Encountered
- Next.js 16 Turbopack enforces the "no parallel pages at same path" constraint that Next.js docs describe in route group documentation; the research's statement that "rewrite() with /(photography) path resolves route groups correctly" was incorrect for this constraint — the path prefix approach (using /photography instead of /(photography)) resolves it cleanly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Route group infrastructure is in place for Phase 2 photography work
- Proxy is ready; `photography.philipsun.com/*` will rewrite to `/photography/*` once DNS CNAME records are configured
- DNS CNAME records for `photography` and `ecommerce` subdomains still need to be added to Vercel (pre-existing blocker noted in STATE.md)
- All existing tests pass without regression

## Self-Check: PASSED

- src/proxy.ts: FOUND
- src/app/(main)/layout.tsx: FOUND
- src/app/(photography)/photography/page.tsx: FOUND
- src/app/(ecommerce)/ecommerce/page.tsx: FOUND
- src/app/__tests__/proxy.test.ts: FOUND
- src/app/layout.tsx: CONFIRMED ABSENT (correct)
- Commit 7b8631e: FOUND
- Commit 66a7d82: FOUND

---
*Phase: 01-infrastructure*
*Completed: 2026-03-18*
