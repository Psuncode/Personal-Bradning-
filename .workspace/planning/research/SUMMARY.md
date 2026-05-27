# Project Research Summary

**Project:** Philip Sun Personal Website — Photography Booking, CRM, GEO Blog, Subdomains
**Domain:** Personal portfolio + photography booking platform + lightweight CRM + GEO-optimized blog
**Researched:** 2026-03-17
**Confidence:** HIGH (stack, architecture, core pitfalls) / MEDIUM (GEO content strategy)

## Executive Summary

This project adds four capability layers to an existing Next.js 16 / React 19 / Tailwind 4 portfolio: a self-hosted photography booking system with Stripe payments, a lightweight CRM for contact and booking data ownership, subdomain routing to surface photography under `photography.philipsun.com`, and GEO-optimized blog infrastructure to earn AI citations. The stack decisions are clear and well-sourced: Stripe Checkout (hosted redirect, not custom card UI) for PCI-safe payments, Neon serverless Postgres with Drizzle ORM for the data layer, Resend for transactional email, and Next.js middleware rewrites for subdomain routing — all within a single Vercel deployment. Every technology choice is a known, officially-documented pairing with no experimental dependencies.

The recommended build approach groups work into sequential infrastructure phases: subdomain routing first (requires DNS migration done ahead of any code), then the persistence layer, then CRM wiring, then photography content, and finally the payment booking flow. This order is not arbitrary — the booking flow has hard dependencies on both the DB layer and the Stripe webhook infrastructure, and the schema must be designed correctly before any data is written. The most important architectural decision is to model contacts, inquiries, bookings, and payments as separate tables from day one; conflating them is the single highest-recovery-cost pitfall identified.

The main risk cluster is around booking correctness: time slots must be reserved during the Stripe Checkout window to prevent double-booking, webhooks must be idempotent to prevent duplicate records, and booking confirmation must happen server-side via webhook (not client-side redirect). These are not difficult to implement correctly if addressed at schema design time, but they are expensive to retrofit. GEO content strategy carries the only medium-confidence finding: the principles are solid (entity depth over keyword density, consistent JSON-LD across pages, FAQPage and HowTo schema), but citation-lift statistics from vendor sources are unverified. The underlying schema practices are standard and carry no implementation risk.

---

## Key Findings

### Recommended Stack

The existing stack (Next.js 16.1.6, React 19, TypeScript 5, Tailwind 4, Vercel) requires zero framework changes. The new capability layers slot cleanly into it. Stripe Checkout via Server Actions is the correct pattern — create the Checkout Session server-side, redirect to Stripe's hosted page, confirm booking only on `checkout.session.completed` webhook. Neon + Drizzle is the dominant serverless Postgres pairing in the Next.js ecosystem and has first-party Vercel integration with auto-injected env vars. Middleware-based subdomain routing (single deployment, `NextResponse.rewrite()`) is the correct choice over Multi-Zones because the subdomains share the BYU design system, the same DB, and the same component library. Vercel KV (deprecated December 2024) and PlanetScale (free tier removed 2024) are explicitly off the table.

**Core technologies:**
- `stripe` 20.x + `@stripe/stripe-js` 8.x: Server-side Checkout Session creation via Server Actions; hosted payment page eliminates PCI card-capture scope
- `@neondatabase/serverless` 1.0.x + `drizzle-orm` 0.45.x + `drizzle-kit` 0.31.x: Serverless Postgres; auto-suspend on idle = zero cost for personal site traffic; TypeScript-first schema
- `resend` 6.9.x + `react-email` 5.2.x: Transactional booking confirmation emails; React Email 5.0 explicitly supports React 19.2 and Next.js 16
- `zod` 3.x: Server-side input validation for booking form data and webhook payloads (not currently in codebase — add during booking build)
- Next.js Middleware (built-in): Subdomain detection via `host` header, `NextResponse.rewrite()` to route groups; no additional packages

**New environment variables required:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `DATABASE_URL`, `RESEND_API_KEY`, `NEXT_PUBLIC_SITE_URL`

See `/Users/philipsun/Documents/personal websit/.planning/research/STACK.md` for full rationale, version compatibility matrix, and alternatives considered.

### Expected Features

The photography booking flow is the core new capability. It follows well-documented industry patterns: package selection → date/time from CalDAV availability → client info capture → non-refundable deposit via Stripe Checkout → confirmation email with ICS attachment. The Cal.com embed on `/meet` is for PM/consulting meetings and must remain separate from the photography booking flow — two booking paths for the same purpose will confuse clients. Photography images must not live in the git repo or Vercel deployment; store originals in Cloudflare R2 or Vercel Blob and serve via `next/image` with `remotePatterns`.

**Must have (table stakes for launch — P1):**
- Photography gallery with category organization (portrait, landscape, event, etc.)
- Photography package/pricing page with explicit prices — "contact for pricing" is a conversion killer
- Full booking flow: package select → date/time → client info → Stripe deposit → confirmation email + ICS
- Inquiry capture to DB — every form submission is a lead that must be persisted, not just emailed
- CRM admin view: protected `/admin` route with read-only table of inquiries and bookings

**Should have (add post-launch validation — P2):**
- Photography subdomain (`photography.philipsun.com`) — signals seriousness to photography clients
- Post-booking questionnaire — differentiates the client experience
- Source tracking on inquiry records (UTM/referrer capture in hidden form field)
- GEO blog schema additions: FAQPage and HowTo JSON-LD per post, consistent author entity

**Defer to v2+:**
- E-sign contract integration (HelloSign/DocuSign API) — v1 handles with emailed PDF
- Automated balance payment reminders — manual email first; automate when volume justifies
- Ecommerce subdomain landing page — lower urgency than photography
- Print sales / ecommerce store — scope explosion; link to Printful or SmugMug instead

**Anti-features to avoid:** social feed embeds (load weight, API fragility), real-time chat widget, client login portal, blog comment system, multi-calendar sync before fixing existing CalDAV integration.

See `/Users/philipsun/Documents/personal websit/.planning/research/FEATURES.md` for full UX flow, dependency graph, and competitor analysis.

### Architecture Approach

The entire system runs as a single Next.js app in one Vercel deployment. Next.js App Router route groups — `(main)`, `(photo)`, `(ecomm)` — map to the three domain surfaces via middleware rewrites. Each route group has its own `layout.tsx`, eliminating the anti-pattern of conditional domain checks in root layout. The Drizzle DB client is a module-level singleton in `src/lib/db/index.ts`; Route Handlers import it directly. The booking data flow is: browser POSTs to `/api/bookings` → creates pending booking record in DB → creates Stripe Checkout Session with `metadata.booking_id` → redirects to Stripe → webhook confirms booking, sends email. Booking confirmation never happens client-side.

**Major components:**
1. `middleware.ts` (root): reads `host` header, extracts subdomain, rewrites to route group — runs at edge on every non-static request
2. `src/lib/db/` (schema + Drizzle client): `contacts`, `inquiries`, `bookings`, `payments`, `packages` tables — separate by domain entity
3. `src/app/(photo)/` route group: photography gallery, pricing, multi-step booking UI — served at `photography.philipsun.com`
4. `src/app/api/stripe/webhook/`: receives Stripe events, verifies signature with raw body, confirms bookings idempotently
5. `src/app/(ecomm)/` route group: static company landing page — no DB interaction needed

DNS configuration: use individual CNAME records (`photography.philipsun.com CNAME cname.vercel-dns.com`) for known fixed subdomains. Only switch to Vercel nameservers if wildcard `*.philipsun.com` is needed later.

See `/Users/philipsun/Documents/personal websit/.planning/research/ARCHITECTURE.md` for complete project structure, data flow diagrams, and anti-pattern documentation.

### Critical Pitfalls

1. **Time slot not held during Stripe Checkout** — Create a `pending_reservation` record with 30-minute TTL on Checkout Session creation; filter those slots out of the availability query; release on `checkout.session.expired`. Without this, concurrent bookings double-book the same slot. Must be in the schema before any payment code is written.

2. **Non-idempotent webhook handler** — Store `stripe_event_id` with a UNIQUE constraint in the bookings/payments table. Check for it before processing any webhook. Stripe retries for up to 3 days — duplicate events are guaranteed in production.

3. **CRM schema conflating inquiry with booking** — Model as five separate tables: `contacts`, `inquiries`, `bookings`, `payments`, `packages`. A single table with `is_paid`, `has_deposit`, `status` with 8 values cannot be migrated cleanly. Recovery cost is HIGH after data exists.

4. **Stripe deposit + balance sessions not linked** — Always pass `metadata: { booking_id, payment_type: 'deposit' | 'balance' }` on every Checkout Session creation. The webhook handler reads `session.metadata.booking_id` to find the booking — never customer email alone.

5. **Wildcard subdomain requires Vercel nameservers** — CNAME records work for explicit subdomains but fail for wildcard SSL issuance. Decide on DNS approach (individual CNAMEs vs. nameserver delegation) before writing any middleware code. DNS propagation takes 24–48 hours.

6. **Middleware breaks Vercel preview deployments** — Add an explicit check for `.vercel.app` hostnames and use path-prefix routing as a fallback. Otherwise photography subdomain content is unreachable in all PR previews.

7. **GEO entity inconsistency destroys AI trust** — All verifiable facts (years of experience, job titles, company names) must render from `resume.ts` / `site-config.ts`. Contradictions between pages reduce LLM confidence weights on the entire entity.

See `/Users/philipsun/Documents/personal websit/.planning/research/PITFALLS.md` for recovery strategies, security mistakes, and a "looks done but isn't" verification checklist.

---

## Implications for Roadmap

The research reveals a clear dependency chain that dictates phase order. Payments depend on DB. DB depends on a finalized schema. Schema design depends on understanding the full booking domain model. Subdomain routing is independent of payments but blocks photography content pages. GEO blog work is infrastructure-light and can run in parallel with any other phase.

### Phase 1: Subdomain Routing Infrastructure
**Rationale:** DNS changes take 24–48 hours to propagate. This phase has no code dependencies and unblocks all photography content work. Starting here means DNS is live before the photography UI is ready to ship. Must also handle the Vercel preview deployment routing strategy (PITFALLS Pitfall 4) before writing any middleware code.
**Delivers:** `middleware.ts` with subdomain detection and preview fallback; `(photo)` and `(ecomm)` route groups with placeholder pages; verified DNS configuration; wildcard vs. explicit subdomain decision documented.
**Addresses:** Photography subdomain feature (FEATURES P2); sets up the architecture foundation (ARCHITECTURE Phase 1).
**Avoids:** DNS blocking launch at the end (Pitfall 3); preview deployment breakage shipping to production (Pitfall 4).
**Research flag:** Standard pattern — official Next.js docs and Vercel multi-tenant guide are authoritative. Skip research-phase.

### Phase 2: Persistence Layer (Neon + Drizzle)
**Rationale:** Every downstream phase (CRM, booking, payments) depends on the DB. The schema must be correct before any data is written — migration cost after data exists is HIGH. This phase is purely infrastructure and data modeling with no user-facing output.
**Delivers:** Neon project provisioned and connected to Vercel; `src/lib/db/schema.ts` with all five tables (`contacts`, `inquiries`, `bookings`, `payments`, `packages`); `drizzle.config.ts`; initial migration run; `src/lib/db/index.ts` singleton; `src/types/crm.ts` interfaces.
**Addresses:** Inquiry capture to DB (FEATURES P1 table stakes); correct CRM data model.
**Avoids:** Schema conflation of inquiry/booking (Pitfall 5 — HIGH recovery cost); missing `stripe_event_id` UNIQUE constraint (Pitfall 2 — must be in the migration, not added later); missing `pending_reservations` table (Pitfall 1 — must exist before payment routes).
**Research flag:** Standard pattern — Neon + Drizzle officially documented. Skip research-phase. But schema design warrants a careful internal review before running the initial migration.

### Phase 3: CRM and Contact Ownership
**Rationale:** The existing contact form likely emails Philip and discards the data. This phase replaces or augments it with DB writes and notification emails — the minimum viable data ownership. It also wires up Resend for the first time, which the booking confirmation email will reuse.
**Delivers:** `/api/contacts` Route Handler with Zod validation, DB write, Resend notification; contact form on main site writes to `contacts` table; source/referrer capture in hidden field; protected `/admin` route (basic auth or simple token) showing contacts table.
**Addresses:** Inquiry capture to DB (FEATURES P1); source tracking (FEATURES P2); CRM admin view (FEATURES P1).
**Avoids:** Losing leads to email-only flows (FEATURES dependency note); admin routes without authentication (PITFALLS security).
**Research flag:** Standard pattern — Server Actions + Drizzle + Resend. Skip research-phase.

### Phase 4: Photography Content
**Rationale:** Static photography content — gallery and pricing — can ship before the booking flow is ready. It generates organic traffic and lets Philip test the visual design before payment complexity is added. Images must be stored in Cloudflare R2 or Vercel Blob, not the deployment bundle.
**Delivers:** `(photo)/layout.tsx` with photography-specific branding; photography gallery with category organization; `/pricing` page with package comparison table and explicit prices; CTAs linking to booking flow; all images served via `next/image` from external storage origin.
**Addresses:** Photography gallery (FEATURES P1); package/pricing page (FEATURES P1); photography case studies (FEATURES table stakes).
**Avoids:** Photography images in git repo destroying deployment performance (ARCHITECTURE Anti-Pattern 4); "contact for pricing" conversion barrier.
**Research flag:** Image storage strategy (Cloudflare R2 vs. Vercel Blob) may warrant a brief technical spike to confirm `next/image remotePatterns` config. Otherwise standard.

### Phase 5: Photography Booking and Payments
**Rationale:** The core new capability. Can only be built after Phases 1–4 are complete — it requires the route group, the DB schema (including `pending_reservations`), the Resend integration, and the package pricing page. This is the highest-complexity phase.
**Delivers:** Multi-step booking UI (`PackageCard`, `BookingForm`, `BookingConfirm` components); `/api/bookings` Route Handler (create pending booking + Stripe Checkout Session with `metadata.booking_id`); `/api/stripe/webhook` Route Handler (verify signature with raw body, idempotency check on `stripe_event_id`, update booking status, send confirmation email + ICS attachment); success/cancel pages; slot reservation during checkout; deposit model with `payment_type` metadata.
**Addresses:** Full booking flow with Stripe deposit (FEATURES P1 HIGH priority); booking confirmation email + ICS (FEATURES P1).
**Avoids:** Time slot double-booking (Pitfall 1 — `pending_reservations` required); duplicate webhook processing (Pitfall 2 — idempotency check required); deposit/balance sessions not linked (Pitfall 8 — `metadata.booking_id` and `payment_type` required); booking confirmation via redirect (PITFALLS technical debt).
**Research flag:** Stripe Checkout Session + webhook idempotency is well-documented. The slot reservation TTL pattern warrants a focused design review before implementation. Recommend research-phase or at minimum a design doc.

### Phase 6: GEO Blog Infrastructure
**Rationale:** Independent of all booking phases — can run in parallel or after. Low engineering cost; primarily content discipline. The existing JSON-LD infrastructure (Article, Person schemas) is the right foundation.
**Delivers:** FAQPage and HowTo JSON-LD added to blog post template; `llms.txt` at site root; expanded Person schema with `knowsAbout`, `hasOccupation`, `alumniOf`; BreadcrumbList on all pages; author entity in blog posts matching homepage Person schema; fact audit ensuring all verifiable data traces to `resume.ts` / `site-config.ts`; first GEO-optimized blog post following answer-first structure.
**Addresses:** GEO blog schema additions (FEATURES P1); consistent author entity (PITFALLS Pitfall 7).
**Avoids:** GEO content written for keywords not entity depth (Pitfall 6); factual inconsistency across pages (Pitfall 7); AI crawlers blocked in robots.txt.
**Research flag:** GEO schema implementation is standard and well-documented. Content strategy (what to write, how to structure entity depth) benefits from a periodic review against citation testing in ChatGPT/Perplexity. No formal research-phase needed, but build in a content review checkpoint.

### Phase 7: Ecommerce Subdomain Landing
**Rationale:** Lowest urgency; static content only; no DB interaction. After Phase 1 establishes the route group, this can be filled in any time.
**Delivers:** `(ecomm)/layout.tsx` and `(ecomm)/page.tsx` — static company landing page using shared BYU design tokens.
**Addresses:** Ecommerce subdomain (FEATURES P3 / future consideration).
**Research flag:** Static page in existing design system. No research needed.

### Phase Ordering Rationale

- Phases 1 and 2 must come first because they are pure infrastructure with no user-facing deliverable. All other phases block on them.
- Phase 3 (CRM wiring) ships before Phase 5 (payments) because Resend and the DB write pattern are simpler to validate independently before Stripe complexity is added.
- Phase 4 (photography content) can overlap with Phase 3 in parallel since it is static — no DB dependency beyond what Phase 2 provides.
- Phase 5 (booking + payments) comes last among the core phases because it has the most dependencies and the highest implementation risk. Attempting it before the data layer and email infrastructure are verified would compound debugging complexity.
- Phase 6 (GEO) is fully independent and can be threaded through any phase — ideally the first GEO post ships alongside Phase 4 when photography content goes live.
- Phase 7 (ecommerce landing) is the lowest priority and can be deferred indefinitely without blocking any other feature.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 5 (Booking + Payments):** Slot reservation TTL pattern and its interaction with CalDAV availability queries is the novel integration point. Warrants a focused design session or research-phase before implementation to nail the race condition prevention strategy.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Subdomain Routing):** Official Next.js and Vercel docs are authoritative and complete.
- **Phase 2 (Neon + Drizzle):** Official Neon + Drizzle docs cover this exactly. Schema design is a judgment call, not a research question.
- **Phase 3 (CRM):** Server Actions + Drizzle + Resend is a canonical Next.js pattern.
- **Phase 6 (GEO):** Schema implementation is standard; content strategy is editorial, not engineering.
- **Phase 7 (Ecommerce landing):** Static page.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core technologies verified against official Stripe, Neon, Drizzle, Resend, and Next.js docs. Neon free tier pricing confirmed 2026. Vercel KV deprecation confirmed. |
| Features | MEDIUM-HIGH | Photography booking flow patterns well-sourced from Check Cherry, Pixieset, Zenfolio, and photographer business guides. GEO content patterns sourced from industry blogs — principles solid, citation-lift statistics from vendor sources unverified. |
| Architecture | HIGH | Subdomain routing, Stripe webhook pattern, and DB connection strategy verified with official docs. CNAME vs. nameservers DNS decision has one nuance: ARCHITECTURE.md recommends individual CNAMEs while STACK.md mentions nameservers for wildcard — this must be resolved before Phase 1 (individual CNAMEs are sufficient if wildcard is not needed). |
| Pitfalls | HIGH | Stripe idempotency, slot reservation, and schema conflation risks are verified against Stripe docs and real-world photography booking failure patterns. GEO entity consistency pitfalls are MEDIUM (LLM citation behavior is probabilistic and not formally specified). |

**Overall confidence:** HIGH

### Gaps to Address

- **CNAME vs. nameservers DNS decision:** STACK.md and ARCHITECTURE.md give slightly different guidance (nameservers for wildcard vs. individual CNAMEs for fixed subdomains). Resolve before Phase 1: if wildcard `*.philipsun.com` is ever needed (e.g., user-generated subdomains), migrate nameservers now. If only `photography` and `ecommerce` are needed, individual CNAMEs are simpler and sufficient.

- **Photography image storage:** Architecture recommends Cloudflare R2 (free: 10 GB, 10M reads/month) but Vercel Blob is also valid. Choose before Phase 4 based on whether Cloudflare is already in the DNS path. If DNS moves to Vercel nameservers, Vercel Blob is the simpler choice.

- **Cal.com / on-site booking coexistence:** Cal.com currently lives at `/meet` for PM/consulting. The custom photography booking form must not replace this — they serve different use cases. Confirm the UX separation in navigation and ensure no booking path ambiguity before Phase 5.

- **CalDAV integration reliability:** PITFALLS.md references a known bug in the existing CalDAV integration (date selection allowed even when calendar is unavailable). This must be fixed before the photography booking flow reuses the availability service, or the booking form can show phantom availability.

- **Admin route authentication strategy:** The admin view needs auth from day one (PITFALLS security). The simplest valid approach is a hardcoded environment-variable token checked in middleware. This is adequate at personal-site scale and avoids pulling in NextAuth or Clerk. Confirm this is acceptable before Phase 3.

---

## Sources

### Primary (HIGH confidence)
- Stripe official docs (webhooks, Checkout Sessions, idempotency): https://docs.stripe.com/webhooks, https://docs.stripe.com/payments/checkout
- Vercel Knowledge Base: Next.js + TypeScript + Stripe Checkout: https://vercel.com/kb/guide/getting-started-with-nextjs-typescript-stripe
- Drizzle ORM official tutorial — Neon: https://orm.drizzle.team/docs/tutorials/drizzle-with-neon
- Neon official guides — Drizzle + Vercel: https://neon.com/guides/drizzle-local-vercel
- Next.js Multi-Zones official docs (2026-03-16): https://nextjs.org/docs/app/guides/multi-zones
- Vercel multi-tenant guide: https://vercel.com/guides/nextjs-multi-tenant-application
- Resend official docs — send with Next.js: https://resend.com/docs/send-with-nextjs
- React Email 5.0 announcement (React 19 / Next.js 16 support): https://resend.com/blog/react-email-5

### Secondary (MEDIUM confidence)
- Stripe + Next.js 15 complete guide (Pedro Alonso, 2025): https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/
- Neon vs. Supabase comparison (DevTools Academy): https://www.devtoolsacademy.com/blog/neon-vs-supabase/
- Check Cherry photographer CRM / booking patterns: https://www.checkcherry.com/photography-crm
- Pixieset Studio Manager booking flow: https://pixieset.com/studio-manager/
- Photography payment norms and deposit standards: https://www.belindajiao.com/blog/photography-payment-norms-method-deposits
- GEO best practices 2026 (Firebrand): https://www.firebrand.marketing/2025/12/geo-best-practices-2026/
- GEO complete playbook (Search Engine Land): https://searchengineland.com/mastering-generative-engine-optimization-in-2026-full-guide-469142
- Vercel subdomain preview deployment URL mismatch: https://francoisbest.com/posts/2023/displaying-the-right-vercel-deployment-urls-in-nextjs
- GEO mistakes and schema best practices (Geneo): https://geneo.app/blog/schema-markup-structured-data-best-practices-geo-ai-search-2025/

### Tertiary (LOW-MEDIUM confidence)
- GEO citation-lift statistics — vendor sources (Directive Consulting, SEOTuners): numbers unverified; schema practices are sound regardless
- Subdomain routing in Next.js 14 (community): https://trillionclues.medium.com/subdomains-in-next-js-14-how-to-structure-a-scalable-multitenant-frontend-application-f68edc526a60

---
*Research completed: 2026-03-17*
*Ready for roadmap: yes*
