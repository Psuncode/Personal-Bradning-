---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: Ready to execute
stopped_at: "Checkpoint at Task 2: 03-booking-and-payments 03-04-PLAN.md — awaiting human end-to-end verification"
last_updated: "2026-03-24T05:17:16.830Z"
progress:
  total_phases: 4
  completed_phases: 3
  total_plans: 11
  completed_plans: 11
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-17)

**Core value:** A visitor understands who Philip is within 30 seconds and has a clear path to hire or book him.
**Current focus:** Phase 03 — booking-and-payments

## Current Position

Phase: 03 (booking-and-payments) — EXECUTING
Plan: 2 of 5

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**

- Last 5 plans: none yet
- Trend: —

*Updated after each plan completion*
| Phase 01-infrastructure P01 | 8 | 2 tasks | 22 files |
| Phase 01-infrastructure P02 | 3 | 4 tasks | 9 files |
| Phase 03-booking-and-payments P00 | 3 | 2 tasks | 5 files |
| Phase 03-booking-and-payments P01 | 10 | 2 tasks | 8 files |
| Phase 03-booking-and-payments P02 | 8min | 2 tasks | 5 files |
| Phase 03-booking-and-payments P03 | 7 | 2 tasks | 7 files |
| Phase 03-booking-and-payments P04 | 15 | 1 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Pre-roadmap: Use individual CNAME records (not Vercel nameservers) for `photography` and `ecommerce` subdomains — sufficient for fixed subdomains, simpler than nameserver delegation
- Pre-roadmap: Neon + Drizzle for persistence layer (Vercel KV deprecated Dec 2024, PlanetScale free tier removed 2024)
- Pre-roadmap: Stripe Checkout (hosted redirect) for payments — eliminates PCI card-capture scope
- Pre-roadmap: Middleware-based subdomain routing (single Vercel deployment, `NextResponse.rewrite()`) over Multi-Zones
- [Phase 01-infrastructure]: Subdomain proxy rewrites to /photography and /ecommerce URL paths (not /(photography) filesystem paths) — Next.js Turbopack forbids multiple route group root pages resolving to the same URL
- [Phase 01-infrastructure]: Proxy uses nextUrl.host fallback when host header is null (Vitest jsdom environment does not auto-populate host header in NextRequest constructor)
- [Phase 01-infrastructure]: Integer cents for monetary storage, text 'true'/'false' for booleans, pooled URL for app / unpooled for migrations
- [Phase 01-infrastructure]: drizzle-kit generate + migrate pattern (never push) — preserves migration history, avoids silent column drops
- [Phase 03-booking-and-payments]: PhotographyBookingForm placeholder created so test imports resolve before Plan 03-02 builds the real component
- [Phase 03-booking-and-payments]: vi.mock factories use inline literal values (not top-level imports) to avoid Vitest hoisting ReferenceError
- [Phase 03-booking-and-payments]: No hardcoded Stripe apiVersion — let SDK use bundled default
- [Phase 03-booking-and-payments]: toZonedTime applied to both day boundary and event times for correct Mountain Time comparison in serverCalendar.ts
- [Phase 03-booking-and-payments]: Functional Set state update pattern: setLoadedMonths(prev => new Set([...prev, monthKey]))
- [Phase 03-booking-and-payments]: Booking page wraps PhotographyBookingForm in Suspense — required by Next.js App Router when client component uses useSearchParams()
- [Phase 03-booking-and-payments]: Package.slug field added to photography.ts (Plan 03-01 missing dep auto-fixed)
- [Phase 03-booking-and-payments]: Lazy Proxy pattern for Stripe and Resend singletons — prevents build-time constructor failure when env keys not set (mirrors db/index.ts pattern)
- [Phase 03-booking-and-payments]: Mock @/lib/email directly in webhook tests — avoids Resend constructor hoisting issues with vi.mock factories
- [Phase 03-booking-and-payments]: vi.hoisted() required for mock spy variables shared between vi.mock factories and test body
- [Phase 03-booking-and-payments]: Exclude .claude/ worktrees from vitest discovery to prevent agent worktree test files from polluting main suite
- [Phase 03-booking-and-payments]: Navbar test lucide-react mock must include ChevronDown icon added by Business dropdown feature

### Pending Todos

None yet.

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260319-lxr | Restructure navbar: remove standalone Photography link, add Business dropdown (Photography + Ecommerce) | 2026-03-19 | 01c2604 | [260319-lxr-restructure-the-navbar-remove-the-standa](./quick/260319-lxr-restructure-the-navbar-remove-the-standa/) |

### Blockers/Concerns

- DNS propagation (24–48 hours): CNAME records for subdomains must be added before Phase 1 code ships — do this at start of Phase 1
- Photography image storage decision pending: Cloudflare R2 vs. Vercel Blob — resolve before Phase 2 image work
- Cal.com + photography booking UX separation: confirm nav keeps two booking paths distinct before Phase 3

## Session Continuity

Last session: 2026-03-24T05:17:16.827Z
Stopped at: Checkpoint at Task 2: 03-booking-and-payments 03-04-PLAN.md — awaiting human end-to-end verification
Resume file: None
