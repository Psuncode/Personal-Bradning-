# Stack Research

**Domain:** Personal portfolio + photography booking + GEO blog + subdomain routing
**Researched:** 2026-03-17
**Confidence:** MEDIUM-HIGH (core Stripe + Neon + middleware patterns verified with official docs; GEO tooling MEDIUM from web sources)

---

## Context

The existing site is Next.js 16.1.6 / React 19.2.3 / TypeScript 5 / Tailwind CSS 4, deployed on Vercel with no database. This research covers the four new capability layers being added:

1. Photography booking with Stripe payments
2. Lightweight CRM/contact data persistence
3. GEO (generative engine optimization) blog infrastructure
4. Subdomain routing (`photography.philipsun.com`, ecommerce subdomain)

---

## Recommended Stack

### Layer 1: Payments — Stripe

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `stripe` (Node SDK) | 20.4.1 | Server-side Stripe API calls, session creation, webhook verification | Official Node SDK; used via Server Actions — no separate API route needed |
| `@stripe/stripe-js` | 8.10.0 | Client-side Stripe.js loader (PCI compliance) | Must load from Stripe CDN; this wrapper handles ES module import cleanly |
| `@stripe/react-stripe-js` | latest | React components (Elements, CardElement) for embedded payment forms | Needed only if building a custom card input; skip if using Stripe Checkout redirect |

**Recommended pattern — Stripe Checkout (hosted page), not custom card UI:**

Use Server Actions to create a Checkout Session, then redirect to Stripe's hosted checkout page. This is the fastest path to PCI compliance, requires zero custom UI for card capture, and handles all payment methods automatically. Custom card embeds (`Elements`) add complexity and should only be used if you need the payment form fully embedded with no redirect.

```typescript
// src/app/book/actions.ts  (Server Action)
'use server';
import Stripe from 'stripe';
import { redirect } from 'next/navigation';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
});

export async function createBookingCheckout(packageId: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: PACKAGE_PRICE_IDS[packageId], quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/book`,
  });
  redirect(session.url!);
}
```

**Webhook handler** — use a standard API route (NOT a Server Action) because webhooks require `req.body` as raw bytes for signature verification:

```typescript
// src/app/api/stripe/webhook/route.ts
import { headers } from 'next/headers';
export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature')!;
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  // handle event.type === 'checkout.session.completed'
}
```

**Confidence:** HIGH — verified against Stripe official docs and Pedro Alonso's 2025 guide, confirmed by Vercel's official Next.js + Stripe KB article.

---

### Layer 2: Data Persistence — Neon + Drizzle ORM

**Decision: Neon (serverless Postgres) + Drizzle ORM**

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `@neondatabase/serverless` | 1.0.2 | Neon's serverless Postgres driver (HTTP/WebSocket, no TCP) | Required for Vercel Edge/serverless; auto-suspends when idle = zero cost for low-traffic personal site |
| `drizzle-orm` | 0.45.1 | TypeScript ORM — schema, queries, migrations | Lightweight, type-safe, schema-as-code; tighter DX than Prisma for this scale; no runtime overhead |
| `drizzle-kit` | 0.31.9 | CLI for migrations and schema push | Required companion to drizzle-orm for schema management |
| `ws` | latest | WebSocket support for Neon driver in non-edge Node.js context | Needed in local dev; Neon driver uses `ws` when `WebSocket` is unavailable |

**Why Neon over alternatives:**

- **vs. Supabase:** Supabase bundles auth, realtime, storage, and edge functions. Valuable if you need all three; overkill for a booking CRM that just needs tables. Supabase free tier pauses after 1 week inactivity — Neon auto-suspends per-request without pausing the project.
- **vs. Vercel KV (now Upstash Redis):** Vercel KV was deprecated December 2024 and migrated to Upstash Redis. Redis is a key-value store — wrong data model for relational booking records and contacts. Do not use it as a CRM layer.
- **vs. Turso (SQLite/libSQL):** Turso's edge SQLite is excellent for read-heavy content (blogs, dashboards) but SQLite's single-writer model is awkward for booking mutations. More importantly, Drizzle + Neon is the dominant pattern in the Next.js ecosystem right now and shares the same ORM; switching to Turso would add a second driver. Turso is worth revisiting if this site ever serves as a multi-tenant SaaS.
- **vs. PlanetScale (MySQL):** Deprecated free tier in 2024. Not recommended.

**Neon free tier (2026):** 0.5 GB storage, 1 compute, auto-suspend. Sufficient for a personal booking CRM with < 1,000 records.

**Minimal schema for booking CRM:**

```typescript
// src/db/schema.ts
import { pgTable, uuid, text, timestamp, integer } from 'drizzle-orm/pg-core';

export const inquiries = pgTable('inquiries', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  package: text('package'),
  message: text('message'),
  stripeSessionId: text('stripe_session_id'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

**Confidence:** HIGH — Neon + Drizzle is officially documented on both Neon and Drizzle docs, with multiple 2025 Next.js 15/16 guides.

---

### Layer 3: Transactional Email — Resend + React Email

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `resend` | 6.9.4 | Transactional email SDK | Best DX for Next.js; free tier 3,000 emails/month; same maintainer as React Email |
| `react-email` | 5.2.9 | React-component email templates | Type-safe HTML emails; supports Tailwind 4 and React 19; 117% download growth in 2025 |
| `@react-email/components` | latest | Pre-built email primitives (Button, Text, Section, etc.) | Required companion for react-email templates |

**Use:** Send booking confirmation to client and Philip on `checkout.session.completed` webhook.

**Confidence:** HIGH — Resend is the current standard for Next.js transactional email. React Email 5.0 (November 2025) explicitly supports React 19.2 and Next.js 16.

---

### Layer 4: Subdomain Routing — Next.js Middleware (single deployment)

**Decision: Middleware-based routing within single Vercel deployment (NOT Multi-Zones)**

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js Middleware | built-in (Next.js 16) | Intercepts requests, reads `Host` header, rewrites to subdomain-specific routes | Zero additional packages; runs on Vercel Edge; single project, single deployment |
| Vercel wildcard domain | platform | Routes `*.philipsun.com` to one project | Configured in Vercel Dashboard → Domains; requires Nameservers DNS method (not A record) |

**Why not Multi-Zones:**
Next.js Multi-Zones (documented at nextjs.org/docs/pages/guides/multi-zones) are micro-frontends: separate Next.js apps, separate deployments, hard navigation between zones. This adds operational overhead (two CI/CD pipelines, two projects) with no benefit for this use case — the subdomains are thin content surfaces, not separate large applications.

**Middleware pattern:**

```typescript
// middleware.ts (project root)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? '';
  const subdomain = host.split('.')[0];

  if (subdomain === 'photography' && !host.startsWith('www')) {
    // Rewrite to /photography/* route group
    const url = req.nextUrl.clone();
    url.pathname = `/photography${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  if (subdomain === 'ecommerce' && !host.startsWith('www')) {
    const url = req.nextUrl.clone();
    url.pathname = `/ecommerce${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

**Corresponding route structure:**
```
src/app/
  (main)/          ← philipsun.com — existing pages
  photography/     ← photography.philipsun.com
    page.tsx
    portfolio/
  ecommerce/       ← ecommerce.philipsun.com
    page.tsx
```

**Vercel domain configuration:**
- Add `*.philipsun.com` as a wildcard domain in Vercel → Project → Settings → Domains
- Must use Nameservers DNS method, not A record method (Vercel requirement for wildcards)
- Add `photography.philipsun.com` and `ecommerce.philipsun.com` explicitly as well

**Confidence:** HIGH — Verified with official Next.js docs, Vercel multi-tenant guide, and Vercel community discussions confirming wildcard support on all account tiers.

---

### Layer 5: GEO Technical Infrastructure

GEO is primarily a content strategy, but it has a concrete technical layer. The existing site already has JSON-LD schemas (Person, Article, SoftwareApplication) — expand these.

| Schema Type | Priority | Why | Where to Add |
|-------------|----------|-----|--------------|
| `FAQPage` | HIGH | 3.2x more likely to appear in Google AI Overviews; directly feeds Perplexity citations | Blog posts and dedicated FAQ page |
| `HowTo` | HIGH | 24% citation lift in studies; AI tools love step-by-step content | Tutorial/guide blog posts |
| `Person` (expanded) | MEDIUM | Already present; add `knowsAbout`, `hasOccupation`, `alumniOf` fields | Root layout |
| `LocalBusiness` | LOW | Useful if photography business has a local presence | Photography subdomain |
| `BreadcrumbList` | MEDIUM | Navigation signal for AI crawlers | All pages |

**GEO content patterns (technical requirements):**

1. **Answer-first paragraph:** Lead every blog section with the direct answer in the first 40–60 words. AI tools extract opening paragraphs.
2. **Fact density:** Include verifiable statistics or data every 150–200 words. AI systems prefer citable facts.
3. **`llms.txt`:** Emerging standard (not yet universal) — a plain-text file at `/llms.txt` listing what the site is about, key facts, and links to authoritative pages. Perplexity and some LLMs check this.
4. **Canonical `sameAs` links in Person schema:** Link to LinkedIn, GitHub, authoritative profiles. AI systems resolve identity via `sameAs`.

**No dedicated GEO SaaS tooling is recommended.** Tools like Relixir, Profound, Frase exist but are overkill for a personal blog. The existing `src/app/og/route.tsx` OG image system, JSON-LD, and sitemap infrastructure are the right foundation — extend them.

**Confidence:** MEDIUM — GEO principles are well-documented by multiple sources (SEOTuners, Directive Consulting, Geneo); specific citation lift statistics come from tool vendors who have incentive to overstate results. The underlying schema practices are standard and verified.

---

## Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `resend` | 6.9.4 | Booking confirmation emails | Required for booking flow |
| `react-email` | 5.2.9 | Type-safe email templates | Required with Resend |
| `@react-email/components` | latest | Pre-built email components | Required with react-email |
| `zod` | 3.x | Schema validation for booking form data and webhook payloads | Required for any server-side input validation |

**Note on `zod`:** The existing codebase does not appear to use Zod. Add it when building the booking form — validate package selection, contact fields, and Stripe webhook payload shapes before writing to the database.

---

## Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Stripe CLI | Local webhook testing | `stripe listen --forward-to localhost:3000/api/stripe/webhook` |
| Neon branching | Database branch per PR | Free on Neon; enables safe schema migrations without touching production |
| `drizzle-kit studio` | Visual database browser | Run `npx drizzle-kit studio` locally |

---

## Installation

```bash
# Payments
npm install stripe @stripe/stripe-js

# Database
npm install drizzle-orm @neondatabase/serverless ws
npm install -D drizzle-kit @types/ws

# Email
npm install resend react-email @react-email/components

# Validation (if not already present)
npm install zod
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Neon (serverless Postgres) | Supabase | If you want built-in auth, realtime subscriptions, and storage; adds ~$25/mo value if you need all three |
| Neon | Turso (SQLite/libSQL) | If the app becomes read-heavy content delivery or needs per-tenant databases at scale |
| Neon | PlanetScale | Do not use — free tier deprecated 2024 |
| Drizzle ORM | Prisma | If team is larger and schema visualization tooling matters more than runtime performance |
| Stripe Checkout (redirect) | Stripe Elements (embedded) | If you need the card form embedded inline with no redirect — adds significant PCI scope consideration |
| Middleware routing | Multi-Zones | Only if photography subdomain needs to be a fully independent Next.js app with separate dependencies and build pipeline |
| Resend | SendGrid / Postmark | If sending > 3,000 emails/month or needing marketing lists — for a personal booking site, Resend free tier is sufficient |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Vercel KV | Deprecated December 2024; migrated to Upstash Redis; key-value model is wrong for relational CRM data | Neon + Drizzle |
| PlanetScale | Free tier removed 2024; MySQL not standard in Next.js ecosystem | Neon (Postgres) |
| Prisma with Neon | Prisma's binary engine has cold start latency problems on serverless; Drizzle is lighter and purpose-built for this stack | Drizzle ORM |
| Multi-Zones for subdomain routing | Overkill for two thin subdomain surfaces; requires separate deployments, two CI/CD pipelines | Next.js middleware rewrites |
| `next-subrouter` package | New (August 2025), immature, single maintainer | Native Next.js middleware — battle-tested, zero dependency |
| Custom card capture UI without PCI audit | Storing or handling raw card data without full PCI DSS compliance is a legal liability | Stripe Checkout hosted page |
| GEO SaaS tools (Relixir, Profound, etc.) | Expensive, primarily useful for large content operations; personal blog gains 90% of the benefit from JSON-LD + answer-first writing alone | Extend existing JSON-LD, add `llms.txt` |

---

## Stack Patterns by Variant

**If photography packages have variable pricing (custom quotes):**
- Use Stripe Payment Links or invoice flow instead of pre-set price IDs
- Create invoice via `stripe.invoices.create()`, send to client email, mark paid on webhook

**If subdomain content needs to be completely isolated (different design system):**
- Consider Multi-Zones — deploy `photography.philipsun.com` as a separate Next.js project
- Share components via a local npm workspace package

**If booking volume grows (> 50 bookings/month):**
- Add a simple admin UI at `/admin` (protected by a simple token or NextAuth) to view and manage inquiries
- Consider Neon branching for safe schema migrations as the schema evolves

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `stripe` 20.x | Next.js 16, React 19 | Server-side only; use Server Actions for checkout creation |
| `@stripe/stripe-js` 8.x | React 19, Next.js 16 | Client-side; `loadStripe()` must be called outside render |
| `drizzle-orm` 0.45.x | `@neondatabase/serverless` 1.0.x | Official pairing; see Neon + Drizzle docs |
| `drizzle-kit` 0.31.x | `drizzle-orm` 0.45.x | Must keep major versions in sync |
| `react-email` 5.2.x | React 19.2, Next.js 16 | React Email 5.0 explicitly targets React 19 and Next.js 16 |
| `resend` 6.9.x | `react-email` 5.x | Co-developed; use together |

---

## New Environment Variables Required

| Variable | Purpose | Secret? |
|----------|---------|---------|
| `STRIPE_SECRET_KEY` | Stripe API server-side calls | Yes |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification | Yes |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Client-side Stripe.js init | No (public) |
| `DATABASE_URL` | Neon Postgres connection string | Yes |
| `RESEND_API_KEY` | Transactional email sending | Yes |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for Stripe redirect URLs | No (public) |

---

## Sources

- [Stripe + Next.js 15 Complete Guide (Pedro Alonso)](https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/) — Stripe Server Actions pattern, MEDIUM confidence (community blog, well-cited)
- [Vercel Knowledge Base: Next.js + TypeScript + Stripe Checkout](https://vercel.com/kb/guide/getting-started-with-nextjs-typescript-stripe) — HIGH confidence (official Vercel)
- [Stripe Webhooks official docs](https://docs.stripe.com/webhooks) — HIGH confidence (official Stripe)
- [Drizzle ORM official tutorial: Neon](https://orm.drizzle.team/docs/tutorials/drizzle-with-neon) — HIGH confidence (official Drizzle docs)
- [Neon Guides: Drizzle local + Vercel](https://neon.com/guides/drizzle-local-vercel) — HIGH confidence (official Neon docs)
- [Next.js Multi-Zones official docs](https://nextjs.org/docs/pages/guides/multi-zones) — HIGH confidence (official Next.js, version 16.1.7, updated 2026-03-16)
- [Vercel multi-tenant guide](https://vercel.com/guides/nextjs-multi-tenant-application) — HIGH confidence (official Vercel)
- [Resend send-with-nextjs docs](https://resend.com/docs/send-with-nextjs) — HIGH confidence (official Resend)
- [React Email 5.0 announcement](https://resend.com/blog/react-email-5) — HIGH confidence (official Resend blog, November 2025)
- [Vercel KV → Upstash migration (community)](https://community.vercel.com/t/switching-from-vercel-kv-to-upstash-kv-questions/2660) — MEDIUM confidence (community, aligns with Vercel docs)
- [GEO schema markup best practices (Geneo)](https://geneo.app/blog/schema-markup-structured-data-best-practices-geo-ai-search-2025/) — MEDIUM confidence (tool vendor, but schema recommendations align with Google documentation)
- [GEO complete playbook (SEOTuners)](https://seotuners.com/blog/seo/generative-engine-optimization-geo-in-2025-the-complete-playbook-to-win-ai-overviews-chatgpt-copilot-perplexity/) — LOW-MEDIUM confidence (industry blog, citation lift statistics unverified independently)
- [Neon vs Supabase comparison (DevTools Academy)](https://www.devtoolsacademy.com/blog/neon-vs-supabase/) — MEDIUM confidence (third-party, verified against official pricing pages)
- [Turso vs Neon serverless database comparison (DevTools Academy)](https://www.devtoolsacademy.com/blog/serverless-sql-databases/) — MEDIUM confidence (third-party)

---

*Stack research for: personal portfolio + photography booking + GEO blog + subdomain routing (Next.js 16 on Vercel)*
*Researched: 2026-03-17*
