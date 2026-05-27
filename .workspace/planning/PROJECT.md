# Philip Sun — Personal Website

## What This Is

A personal website and portfolio for Philip Sun — product manager, photographer, and entrepreneur. The site serves as his primary professional presence: showcasing work that proves he's both technical and can deliver, providing clear paths to hire or book him, and building discoverability through SEO and AI-citation-optimized blog content. It will also serve as the root for subdomain properties (photography, ecommerce, others) as his businesses grow.

## Core Value

A visitor understands who Philip is within 30 seconds and has a clear path to hire or book him.

## Requirements

### Validated

<!-- Already built and working in the codebase. -->

- ✓ Homepage with hero, current focus cards, projects preview, and FAQ — existing
- ✓ Projects page with grid + individual project detail pages (/projects/[slug]) — existing
- ✓ Resume page (/resume) with roles, education, skills — existing
- ✓ Blog with MDX support, frontmatter, tags (/blog, /blog/[slug]) — existing
- ✓ Contact section on homepage — existing
- ✓ /meet page with Cal.com booking embed — existing
- ✓ Custom booking flow with iCloud CalDAV availability (BookingForm) — existing
- ✓ SEO infrastructure: OG images, JSON-LD schemas, sitemap, robots.txt, RSS feed — existing
- ✓ Vercel Analytics — existing
- ✓ BYU-branded design system (navy/blue palette, Tailwind CSS 4) — existing
- ✓ Vitest test suite — existing

### Active

<!-- What we're building next. These are hypotheses until shipped. -->

- [ ] Photography portfolio section — dedicated gallery/portfolio showcasing Philip's photography work
- [ ] GEO-optimized blog strategy — content and technical optimizations to get cited by ChatGPT, Perplexity, Gemini alongside traditional SEO
- [ ] Custom booking/CRM — own contact + inquiry data, photography packages with pricing, payment collection, full booking flow on-site without third-party dependency
- [ ] Subdomain architecture — Next.js routing and infrastructure to serve photography.philipsun.com and ecommerce subdomain from the monorepo
- [ ] Photography subdomain — standalone photography profile/portfolio at its own subdomain
- [ ] Ecommerce company landing — landing/about page for the ecommerce business on its subdomain
- [ ] "Hire me" narrative — site-wide copywriting and UX that clearly communicates the PM + technical + photography + entrepreneurial story and converts visitors to inquiries
- [ ] Booking with payment — photography shoot booking with package selection, pricing, and Stripe/payment integration

### Out of Scope

- Full ecommerce platform build — just a landing/redirect, not running an online store
- Enterprise CRM features (pipelines, team access, reporting) — keep it personal-scale
- Mobile app — web-first
- Social feed or community features — not a platform

## Context

Philip is a product manager, photographer, and entrepreneur. The core message the site must convey: "I'm both technical and I can deliver." He works with an ecommerce company (may be used as a subdomain), does photography work (needs a dedicated portfolio and bookable service), and runs/advises other ventures.

The codebase is a Next.js 16 App Router app deployed on Vercel. All content is static (TypeScript data files + MDX blog posts) — no database yet. The booking system connects to iCloud CalDAV for availability. Known issues: BookingForm has a state mutation bug with `loadedMonths`, hardcoded organizer email, and the calendar API lacks date range validation.

The subdomain strategy requires deciding between: multi-zone Next.js (separate deployments), middleware-based routing within one app, or separate repos. This is an architecture decision that needs to be made before building subdomain features.

## Constraints

- **Tech stack**: Next.js 16 App Router, React 19, TypeScript 5, Tailwind CSS 4 — no framework changes
- **Hosting**: Vercel — subdomain routing must work within Vercel's deployment model
- **No database (yet)**: Static data files for content; CRM/booking data will need a persistence layer (TBD: SQLite, Supabase, or Vercel KV)
- **Design**: BYU-branded palette is established — maintain visual consistency

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Subdomain architecture approach | Multi-zone vs. middleware routing vs. separate repos — affects deployment complexity and code sharing | — Pending |
| CRM persistence layer | SQLite (simple, local) vs. Supabase (hosted Postgres) vs. Vercel KV (key-value) — affects booking data storage | — Pending |
| Payment provider for photography bookings | Stripe is standard; alternatives exist | — Pending |
| GEO content strategy | What topics/formats get cited by AI tools in PM/photography/entrepreneurship space | — Pending |

---
*Last updated: 2026-03-17 after initialization*
