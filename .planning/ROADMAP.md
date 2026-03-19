# Roadmap: Philip Sun — Personal Website

## Overview

Four phases transform the existing Next.js portfolio into a complete professional platform. Phase 1 lays the infrastructure foundation (subdomain routing + database) that every downstream phase depends on. Phase 2 delivers photography content and CRM data ownership — the site starts capturing leads and showing a real gallery. Phase 3 completes the photography business with a Stripe-backed booking flow, fixing the known CalDAV bugs in the process. Phase 4 closes out the independent low-complexity work: GEO blog schema optimizations and the ecommerce subdomain landing page.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Infrastructure** - Subdomain middleware routing + Neon/Drizzle persistence layer — foundation for everything (completed 2026-03-18)
- [ ] **Phase 2: Content and CRM** - Photography gallery, pricing page, photography subdomain layout, CRM contact capture and admin view
- [ ] **Phase 3: Booking and Payments** - Full photography booking flow with Stripe deposit, confirmation email+ICS, CalDAV bug fixes
- [ ] **Phase 4: GEO and Ecommerce Subdomain** - GEO blog schema, llms.txt, expanded Person schema, first optimized post, ecommerce landing page

## Phase Details

### Phase 1: Infrastructure
**Goal**: The subdomain routing layer and database are live — every subsequent feature can be wired to them without revisiting architecture
**Depends on**: Nothing (first phase)
**Requirements**: SUB-01
**Success Criteria** (what must be TRUE):
  1. Visiting `photography.philipsun.com` routes to the photography route group (even if only a placeholder page is shown)
  2. Visiting `ecommerce.philipsun.com` routes to the ecommerce route group
  3. Preview deployments on `.vercel.app` fall back to path-prefix routing and do not break
  4. Neon database is provisioned and connected; Drizzle schema migrations run clean with all five tables (`contacts`, `inquiries`, `bookings`, `payments`, `packages`) and the `pending_reservations` table present
**Plans**: 2 plans

### Phase 2: Content and CRM
**Goal**: Visitors on the photography subdomain can browse a real gallery and pricing, and every contact form submission is owned in Philip's database with an admin view to see them
**Depends on**: Phase 1
**Requirements**: SUB-02, PHOTO-01, PHOTO-02, CRM-01, CRM-02, CRM-03, BUG-02
**Success Criteria** (what must be TRUE):
  1. Visitor on `photography.philipsun.com` sees a gallery organized by category (portrait, landscape, event) served from external image storage (not the git repo)
  2. Visitor can view a pricing page on the photography subdomain with explicit package prices — no "contact for pricing"
  3. A contact form submission on the main site is saved to the `contacts` table and captures the traffic source (UTM/referrer)
  4. Philip can view all contacts and bookings at a password-protected `/admin` route
  5. BookingForm sources the organizer email from `siteConfig` (hardcoded `ps324@byu.edu` removed)
**Plans:** 4 plans

Plans:
- [ ] 02-00-PLAN.md — Wave 0 test stubs (TDD RED phase) for all Phase 2 behavioral requirements
- [ ] 02-01-PLAN.md — Photography subdomain content (gallery + pricing + layout nav) and BUG-02 email fix
- [ ] 02-02-PLAN.md — CRM contact capture Server Action and contact form rewrite
- [ ] 02-03-PLAN.md — Admin route with iron-session auth and contacts dashboard

### Phase 3: Booking and Payments
**Goal**: A photography client can complete the full booking flow — package selection, date/time from live CalDAV availability, deposit payment via Stripe — and receive a confirmation email with a calendar invite
**Depends on**: Phase 2
**Requirements**: PHOTO-03, PHOTO-04, BUG-01, BUG-03
**Success Criteria** (what must be TRUE):
  1. Client selects a photography package, picks a date/time (only genuinely available slots shown — no phantom availability from blocking calendar events), and completes a Stripe deposit payment
  2. Booking confirmation is triggered server-side via Stripe webhook, not client redirect, and is idempotent (retried webhooks do not create duplicate bookings)
  3. Client receives a confirmation email with an ICS calendar invite attachment after successful payment
  4. BookingForm uses proper React state management for month navigation — `loadedMonths` Set mutation replaced with immutable state update
**Plans:** 5 plans

Plans:
- [ ] 03-00-PLAN.md — Wave 0 test stubs (TDD RED phase) for all Phase 3 behavioral requirements
- [ ] 03-01-PLAN.md — Bug fixes (BUG-03 Set mutation, BUG-01 CalDAV timezone), Stripe/Resend install, package slug, env vars
- [ ] 03-02-PLAN.md — PhotographyBookingForm 4-step wizard component, booking page, pricing "Book Now" buttons
- [ ] 03-03-PLAN.md — Stripe checkout API, webhook handler, Resend email with ICS, success page, admin bookings
- [ ] 03-04-PLAN.md — Full test suite verification and human end-to-end booking flow check

### Phase 4: GEO and Ecommerce Subdomain
**Goal**: The site's structured data and content are optimized for AI citation, with an expanded Person schema, per-post FAQ/HowTo JSON-LD, at least one answer-first blog post live, and the ecommerce subdomain showing a real landing page
**Depends on**: Phase 1
**Requirements**: GEO-01, GEO-02, GEO-03, GEO-04, SUB-03
**Success Criteria** (what must be TRUE):
  1. Blog post template includes optional `FAQPage` and `HowTo` JSON-LD blocks that a content author can populate per post
  2. `/llms.txt` is accessible at site root and describes the site's content and purpose
  3. Homepage `Person` JSON-LD includes `knowsAbout`, `hasOccupation`, and `alumniOf` fields sourced from `resume.ts` and `site-config.ts`
  4. At least one published blog post is live using answer-first structure with entity depth (PM, photography, or entrepreneurship topic)
  5. Visitor on `ecommerce.philipsun.com` sees the ecommerce company landing page with a CTA
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3
Phase 4 depends only on Phase 1 and can run in parallel with Phases 2-3 if desired.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Infrastructure | 2/2 | Complete    | 2026-03-18 |
| 2. Content and CRM | 0/4 | Not started | - |
| 3. Booking and Payments | 0/5 | Not started | - |
| 4. GEO and Ecommerce Subdomain | 0/TBD | Not started | - |
