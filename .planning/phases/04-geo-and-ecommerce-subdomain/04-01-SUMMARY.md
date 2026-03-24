---
phase: 04-geo-and-ecommerce-subdomain
plan: "01"
subsystem: seo
tags: [json-ld, schema-org, geo, llms-txt, blog, person-schema]

# Dependency graph
requires:
  - phase: 01-infrastructure
    provides: "Next.js App Router with (main) route group, layout.tsx, blog post page"
provides:
  - "FAQPage and HowTo JSON-LD conditionally injected on blog post pages via faq/howTo frontmatter"
  - "public/llms.txt static file for AI-crawler discovery"
  - "Person JSON-LD expanded with hasOccupation (4 entries) and extended knowsAbout (8 items)"
affects:
  - "04-geo-and-ecommerce-subdomain (GEO-04 blog post will exercise faq frontmatter fields)"

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Conditional JSON-LD script tags rendered in JSX only when frontmatter fields are present"
    - "personJsonLd constructed in component body before JSX return for readability"
    - "Resume data (roles, education) imported directly into layout for schema derivation"

key-files:
  created:
    - "public/llms.txt"
  modified:
    - "src/types/blog.ts"
    - "src/app/(main)/blog/[slug]/page.tsx"
    - "src/app/(main)/layout.tsx"

key-decisions:
  - "Build hasOccupation as static array in layout (not dynamic filter) — four canonical roles are known; avoids fragile string-matching"
  - "Photographer and Entrepreneur occupation entries hardcoded (not in roles array) while PM/Founder titles sourced from roles.find()"
  - "email field added to Person schema from siteConfig.email — contact-forward schema improvement"
  - "alumniOf.name now uses education[0].school from resume.ts instead of hardcoded string"

patterns-established:
  - "Conditional schema injection pattern: compute nullable JSON-LD object, render <script> only when non-null"
  - "JSON-LD objects extracted to named consts before JSX return (not inline in dangerouslySetInnerHTML)"

requirements-completed: [GEO-01, GEO-02, GEO-03]

# Metrics
duration: 10min
completed: 2026-03-24
---

# Phase 4 Plan 01: GEO Infrastructure (FAQ/HowTo JSON-LD, llms.txt, Person Schema) Summary

**FAQPage/HowTo JSON-LD conditionally injected on blog posts via frontmatter fields, /llms.txt AI-crawler file created, and Person schema expanded with 4 hasOccupation entries and 8 knowsAbout items sourced from resume.ts**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-03-24T09:14:26Z
- **Completed:** 2026-03-24T09:16:20Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments

- Extended BlogPostFrontmatter with optional faq and howTo fields — enabling GEO-04 blog post to exercise structured data markup
- Added conditional FAQPage and HowTo JSON-LD script tags to blog post page (rendered only when frontmatter fields are present; existing Article schema unchanged)
- Created public/llms.txt describing Philip's identity, roles, key topics, site structure, and contact — discoverable at /llms.txt by AI crawlers
- Expanded Person JSON-LD in main layout: hasOccupation (4 Occupation entries: Product Manager, Founder & CEO, Photographer, Entrepreneur), knowsAbout expanded from 4 to 8 items, email and full BYU school name added

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend BlogPostFrontmatter + inject conditional JSON-LD (GEO-01)** - `5926937` (feat)
2. **Task 2: Create public/llms.txt (GEO-02) and expand Person JSON-LD (GEO-03)** - `1a3659f` (feat)

**Plan metadata:** (docs commit — see below)

## Files Created/Modified

- `src/types/blog.ts` - Added `faq?: Array<{ question, answer }>` and `howTo?: { name, description, steps[] }` optional fields to BlogPostFrontmatter
- `src/app/(main)/blog/[slug]/page.tsx` - Added faqJsonLd and howToJsonLd consts with conditional script tag rendering after existing Article JSON-LD
- `public/llms.txt` - New static file for AI-crawler discovery with Philip's full identity profile
- `src/app/(main)/layout.tsx` - Imported roles/education from resume.ts, extracted personJsonLd to component body, added hasOccupation array (4 entries), expanded knowsAbout to 8 items, added email field, updated alumniOf to use education[0].school

## Decisions Made

- Built hasOccupation as a static array in layout (not dynamic mapping from roles array) — the four canonical occupations are well-known and hardcoded clarity beats fragile string-filter logic
- Photographer and Entrepreneur hardcoded (not in roles array); PM and Founder titles sourced via roles.find() to stay DRY with resume data
- email field added to Person schema from siteConfig.email — improves contact discoverability in structured data
- alumniOf.name updated to use education[0].school (full name "Brigham Young University — Marriott School of Business") rather than abbreviated hardcoded string

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None — both tasks completed on first build attempt with no TypeScript errors.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- GEO-01 types are shipped — GEO-04 (Wave 2 blog post plan) can now add faq/howTo frontmatter to a post and the infrastructure will emit the correct structured data
- /llms.txt is live on next deploy — no further configuration needed
- Person JSON-LD improvements are live — crawlers will pick up hasOccupation and expanded knowsAbout on next crawl

---
*Phase: 04-geo-and-ecommerce-subdomain*
*Completed: 2026-03-24*

## Self-Check: PASSED

- FOUND: src/types/blog.ts
- FOUND: src/app/(main)/blog/[slug]/page.tsx
- FOUND: src/app/(main)/layout.tsx
- FOUND: public/llms.txt
- FOUND: .planning/phases/04-geo-and-ecommerce-subdomain/04-01-SUMMARY.md
- FOUND commit: 5926937 (Task 1)
- FOUND commit: 1a3659f (Task 2)
