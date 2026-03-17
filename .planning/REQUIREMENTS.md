# Requirements: Philip Sun — Personal Website

**Defined:** 2026-03-17
**Core Value:** A visitor understands who Philip is within 30 seconds and has a clear path to hire or book him.

## v1 Requirements

### Photography

- [ ] **PHOTO-01**: Visitor can browse a photography gallery organized by category (portrait, landscape, event, etc.)
- [ ] **PHOTO-02**: Visitor can view a pricing page showing explicit photography package prices (no "contact for pricing")
- [ ] **PHOTO-03**: Visitor can complete a multi-step photography booking flow: package selection → date/time picker → client info → Stripe deposit payment
- [ ] **PHOTO-04**: Client automatically receives a booking confirmation email with an ICS calendar invite after successful payment

### CRM

- [ ] **CRM-01**: Every contact form submission is saved to a database (not just emailed to Philip)
- [ ] **CRM-02**: Philip can view all contacts and bookings at a password-protected /admin route
- [ ] **CRM-03**: Each contact and inquiry record captures the traffic source (UTM parameters and/or HTTP referrer)

### Subdomains

- [ ] **SUB-01**: Next.js middleware reads the `host` header and routes `photography.philipsun.com` and the ecommerce subdomain to their respective route groups within a single Vercel deployment
- [ ] **SUB-02**: `photography.philipsun.com` has its own layout and surfaces the photography gallery, pricing page, and booking flow
- [ ] **SUB-03**: Ecommerce subdomain (`ecommerce.philipsun.com`) has a static landing page for the ecommerce business with CTA

### GEO / Search

- [ ] **GEO-01**: Blog post template includes `FAQPage` and `HowTo` JSON-LD schema blocks that content authors can populate per post
- [ ] **GEO-02**: `/llms.txt` file at site root describes the site's content and purpose for AI crawler discovery
- [ ] **GEO-03**: Homepage `Person` JSON-LD schema expanded with `knowsAbout`, `hasOccupation`, and `alumniOf` fields that match resume.ts data
- [ ] **GEO-04**: At least one published blog post written with answer-first structure and entity depth optimized for AI citation (PM + photography + entrepreneurship topics)

### Bug Fixes

- [ ] **BUG-01**: CalDAV availability service fixed so slots are not shown as available when the calendar has a blocking event
- [ ] **BUG-02**: Hardcoded `ps324@byu.edu` email removed from `BookingForm.tsx` and sourced from `siteConfig`
- [ ] **BUG-03**: `loadedMonths` Set mutation in `BookingForm.tsx` replaced with proper state management to prevent fragile month navigation

## v2 Requirements

### Photography

- **PHOTO-V2-01**: Post-booking questionnaire sent to client after confirmation (shoot goals, location preferences, style references)
- **PHOTO-V2-02**: E-sign contract integration (HelloSign/DocuSign) for photography service agreements
- **PHOTO-V2-03**: Automated balance payment reminder sent 7 days before shoot date

### CRM

- **CRM-V2-01**: Admin view includes source/attribution analytics summary (which channels drive the most inquiries)
- **CRM-V2-02**: Bulk email to past clients from admin view

### Other

- **GEO-V2-01**: Periodic AI citation testing workflow — check ChatGPT/Perplexity responses for Philip's name in relevant queries and track over time

## Out of Scope

| Feature | Reason |
|---------|--------|
| Full ecommerce platform / online store | Scope explosion; ecommerce subdomain is a landing page only |
| Enterprise CRM features (pipelines, team, reporting) | Personal-scale only; overengineering for a one-person site |
| Social feed or community features | Not a platform |
| Client login portal | Adds auth complexity with minimal v1 value |
| Blog comment system | Moderation overhead not worth it |
| Mobile app | Web-first; mobile comes much later |
| Print sales / photo ecommerce store | Link to Printful/SmugMug instead |
| Multi-calendar sync (beyond iCloud CalDAV) | Fix the existing integration before expanding it |

## Traceability

*Populated during roadmap creation.*

| Requirement | Phase | Status |
|-------------|-------|--------|
| PHOTO-01 | — | Pending |
| PHOTO-02 | — | Pending |
| PHOTO-03 | — | Pending |
| PHOTO-04 | — | Pending |
| CRM-01 | — | Pending |
| CRM-02 | — | Pending |
| CRM-03 | — | Pending |
| SUB-01 | — | Pending |
| SUB-02 | — | Pending |
| SUB-03 | — | Pending |
| GEO-01 | — | Pending |
| GEO-02 | — | Pending |
| GEO-03 | — | Pending |
| GEO-04 | — | Pending |
| BUG-01 | — | Pending |
| BUG-02 | — | Pending |
| BUG-03 | — | Pending |

**Coverage:**
- v1 requirements: 17 total
- Mapped to phases: 0 (pending roadmap)
- Unmapped: 17 ⚠️

---
*Requirements defined: 2026-03-17*
*Last updated: 2026-03-17 after initial definition*
