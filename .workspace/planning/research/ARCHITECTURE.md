# Architecture Research

**Domain:** Personal portfolio with subdomain routing, lightweight CRM, and photography booking payments
**Researched:** 2026-03-17
**Confidence:** HIGH (subdomain routing, Stripe) / MEDIUM (data schema design)

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                        DNS / Vercel Edge                              │
│  philipsun.com  photography.philipsun.com  ecommerce.philipsun.com   │
│       ↓                    ↓                         ↓               │
│           Single Vercel deployment (one Next.js app)                 │
│               middleware.ts intercepts all requests                   │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ NextResponse.rewrite()
        ┌──────────────┼──────────────────────────────┐
        ↓              ↓                              ↓
┌───────────┐  ┌───────────────────┐        ┌─────────────────────┐
│ src/app/  │  │ src/app/(photo)/  │        │ src/app/(ecomm)/    │
│ (main)    │  │  Root layout,     │        │  Landing page,      │
│  Portfolio│  │  gallery, booking │        │  brand info         │
│  Blog CRM │  │  /pricing         │        │                     │
└─────┬─────┘  └────────┬──────────┘        └──────────┬──────────┘
      │                 │                              │
      └─────────────────┴──────────────────────────────┘
                        │
              ┌─────────▼──────────┐
              │   src/app/api/     │
              │ /contacts  POST    │
              │ /bookings  POST    │
              │ /stripe/webhook    │
              │ /calendar  GET     │
              └─────────┬──────────┘
                        │
              ┌─────────▼──────────┐
              │  Neon Postgres     │
              │  (via Drizzle ORM) │
              │  contacts          │
              │  bookings          │
              │  packages          │
              └────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        ↓               ↓               ↓
   iCloud CalDAV    Stripe API      Resend API
   (availability)   (payments)     (email notifs)
```

### Component Responsibilities

| Component | Responsibility | Implementation |
|-----------|----------------|----------------|
| `middleware.ts` | Extract hostname, identify subdomain, rewrite URL to route group | Next.js middleware, edge runtime |
| `src/app/(main)/` | Main portfolio — homepage, blog, projects, resume, contact | Existing App Router pages |
| `src/app/(photo)/` | Photography subdomain — gallery, booking flow, pricing | New route group under middleware rewrite |
| `src/app/(ecomm)/` | Ecommerce subdomain — company landing page only | Minimal new route group |
| `src/app/api/contacts/` | Receive contact form submissions, persist to DB, trigger email | Server Route Handler |
| `src/app/api/bookings/` | Create booking records, initiate Stripe Checkout session | Server Route Handler |
| `src/app/api/stripe/webhook/` | Receive Stripe events, confirm bookings on payment_intent.succeeded | Server Route Handler |
| `src/lib/db/` | Drizzle ORM schema definitions, db client singleton | Neon HTTP driver |
| Neon Postgres | Durable storage for contacts, bookings, photography packages | Hosted serverless Postgres |
| Stripe | Payment collection, deposit handling for bookings | Checkout Sessions API |
| Resend | Email notifications for new inquiries and confirmed bookings | REST API via SDK |

## Recommended Project Structure

```
src/
├── app/
│   ├── (main)/               # Main site: philipsun.com/*
│   │   ├── layout.tsx        # Main site layout (navbar, footer)
│   │   ├── page.tsx          # Homepage (existing)
│   │   ├── blog/             # Blog (existing)
│   │   ├── projects/         # Projects (existing)
│   │   ├── resume/           # Resume (existing)
│   │   └── contact/          # Contact page — now writes to DB
│   ├── (photo)/              # Photography: photography.philipsun.com/*
│   │   ├── layout.tsx        # Photography layout (different nav/branding)
│   │   ├── page.tsx          # Photography homepage / gallery
│   │   ├── booking/          # Multi-step booking flow
│   │   │   ├── page.tsx      # Package selection
│   │   │   ├── details/      # Contact + shoot details
│   │   │   └── confirm/      # Post-payment confirmation
│   │   └── pricing/          # Package pricing display
│   ├── (ecomm)/              # Ecommerce: ecommerce.philipsun.com/*
│   │   ├── layout.tsx        # Ecommerce layout
│   │   └── page.tsx          # Company landing page
│   ├── api/
│   │   ├── contacts/
│   │   │   └── route.ts      # POST: save contact inquiry
│   │   ├── bookings/
│   │   │   └── route.ts      # POST: create booking + Stripe session
│   │   ├── stripe/
│   │   │   └── webhook/
│   │   │       └── route.ts  # POST: handle Stripe webhook events
│   │   ├── calendar/
│   │   │   └── route.ts      # GET: iCloud CalDAV availability (existing)
│   │   └── og/               # OG image (existing)
│   ├── layout.tsx            # Root layout (minimal — subdomains have own)
│   └── globals.css           # Tailwind config (shared across all zones)
├── lib/
│   ├── db/
│   │   ├── index.ts          # Drizzle client singleton (neon-http driver)
│   │   ├── schema.ts         # All table definitions
│   │   └── migrations/       # Drizzle Kit migration files
│   ├── stripe.ts             # Stripe client singleton
│   ├── resend.ts             # Resend client singleton
│   ├── blog.ts               # Blog I/O (existing)
│   ├── availabilityService.ts # (existing)
│   ├── serverCalendar.ts     # (existing)
│   └── utils.ts              # cn() (existing)
├── data/                     # Static data files (existing, unchanged)
├── types/
│   ├── index.ts              # (existing)
│   ├── blog.ts               # (existing)
│   └── crm.ts                # Contact, Booking, Package interfaces
└── components/
    ├── sections/             # (existing)
    ├── layout/               # (existing)
    ├── ui/                   # (existing)
    └── booking/              # Photography booking UI components
        ├── PackageCard.tsx
        ├── BookingForm.tsx
        └── BookingConfirm.tsx
middleware.ts                 # Subdomain detection + URL rewriting (new root file)
drizzle.config.ts             # Drizzle Kit config (new root file)
```

### Structure Rationale

- **Route groups `(main)`, `(photo)`, `(ecomm)`:** Next.js App Router route groups with parenthetical names do not affect the URL path. Combined with middleware rewrites, each subdomain maps cleanly to its own layout and pages without URL pollution. Navigation between subdomains uses `<a>` tags (hard nav), not `<Link>` (soft nav would break across layout boundaries).
- **`middleware.ts` at root:** Next.js requires middleware at the project root (or `src/` root if using `src/` layout). It runs on every request before page rendering, at the edge, with zero cold-start cost.
- **`src/lib/db/`:** Database logic isolated from routes. The Drizzle client is a module-level singleton — safe because serverless functions share no memory between invocations but don't need multiple connections per invocation.
- **Route groups share `globals.css`:** All three subdomain experiences share the same Tailwind config and BYU color tokens. Individual layouts control which fonts, navbars, and footers appear.

## Architectural Patterns

### Pattern 1: Middleware-Based Subdomain Routing (recommended)

**What:** A single `middleware.ts` reads the `host` header on every incoming request, extracts the subdomain, and uses `NextResponse.rewrite()` to transparently map the request to a different path in the same app.

**When to use:** When you have a small, known set of subdomains that share code (components, data layer, types, styles). This project has exactly two new subdomains with heavy code-sharing potential.

**Trade-offs:**
- Pro: One repo, one deployment, one build pipeline, shared Tailwind config, shared component library, shared DB client
- Pro: No `assetPrefix` configuration needed, no cross-zone hard-navigation issues
- Pro: Simpler local dev (just add entries to `/etc/hosts`)
- Con: Subdomains cannot independently deploy — any change to photography requires a full redeploy of all subdomains
- Con: Route group folders must not collide on path segments (enforced by Next.js)
- Con: If one subdomain needs a radically different framework in future, migration is harder than multi-zone

**Example:**
```typescript
// middleware.ts (project root)
import { NextRequest, NextResponse } from 'next/server'

const SUBDOMAINS: Record<string, string> = {
  photography: '/(photo)',
  ecommerce: '/(ecomm)',
}

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  // Handles: photography.philipsun.com, photography.localhost:3000
  const subdomain = host.split('.')[0]

  const routeGroup = SUBDOMAINS[subdomain]
  if (routeGroup) {
    const url = req.nextUrl.clone()
    // Rewrite /anything → /(photo)/anything (transparent to browser)
    url.pathname = `${routeGroup}${req.nextUrl.pathname}`
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Skip _next/static, _next/image, favicon, api routes
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
}
```

### Pattern 2: Multi-Zone Next.js (rejected for this project)

**What:** Each subdomain is a separate Next.js deployment. The root domain app uses `rewrites` in `next.config.ts` to proxy paths to the other deployed apps.

**When to use:** When teams are independent (different deploy cadences, different Next.js versions possible, true code isolation needed) or when subdomain apps are fundamentally large (a full ecommerce store, not a landing page).

**Trade-offs:**
- Pro: True isolation — each zone can use different Next.js versions, frameworks
- Pro: Independent deploys
- Con: Multiple Vercel projects to manage — separate env vars, domains, build configs
- Con: Shared components must be published as a private npm package or turborepo package
- Con: Cross-zone links break `<Link>` prefetching and soft navigation
- Con: Overkill for this project where ecommerce is just a landing page and photography is closely related content

**Verdict for this project:** Multi-zone is not the right fit. The subdomains share the BYU design system, the same DB, the same calendar integration, and likely many UI components. Middleware routing is correct.

### Pattern 3: Separate Repos (rejected)

**What:** Each subdomain lives in its own Git repo and Vercel project.

**When to use:** Completely different products with no shared code, maintained by different teams.

**Verdict for this project:** Rejected. Maintenance cost far exceeds benefit. Changes to the shared design system would require three separate PRs.

### Pattern 4: CRM as Server Actions + DB (recommended)

**What:** Contact form submissions and booking requests go through Next.js Server Actions (or Route Handlers) that validate input with Zod, persist to Postgres via Drizzle ORM, and fire a Resend notification email — all in a single server-side function.

**When to use:** Always preferred over external form services (Formspree, Typeform) when you want to own your data. Server Actions make this clean with App Router.

**Trade-offs:**
- Pro: Own all contact and booking data in your DB
- Pro: No third-party dependency on form submission services
- Pro: Can query, filter, and export your CRM data anytime
- Con: You manage spam filtering (add honeypot field or Turnstile)
- Con: Need to handle email deliverability (Resend's free tier: 3k emails/month is more than sufficient)

## Data Flow

### Contact Form Submission

```
User fills form on /contact
    ↓
Server Action (validateWith Zod)
    ↓
INSERT INTO contacts (name, email, message, source, created_at)
    ↓
Resend.send({ to: philip@..., subject: "New inquiry from [name]" })
    ↓
Return success → show toast notification
```

### Photography Booking Flow

```
User selects package on photography.philipsun.com/booking
    ↓
POST /api/bookings
  → INSERT INTO bookings (status: 'pending', package_id, contact_info, date)
  → stripe.checkout.sessions.create({ metadata: { booking_id } })
    ↓
Redirect to Stripe Checkout (hosted page, no PCI scope)
    ↓
Stripe fires webhook to /api/stripe/webhook
  → Verify signature with stripe.webhooks.constructEvent()
  → On payment_intent.succeeded: UPDATE bookings SET status='confirmed'
  → Resend notification email to Philip + confirmation email to client
    ↓
User lands on /booking/confirm?session_id=...
```

### Subdomain Request Routing

```
GET photography.philipsun.com/booking
    ↓
Vercel edge resolves *.philipsun.com → same deployment
    ↓
middleware.ts runs: host = "photography.philipsun.com"
    subdomain = "photography" → routeGroup = "/(photo)"
    rewrite: /booking → /(photo)/booking
    ↓
src/app/(photo)/booking/page.tsx renders
    ↓
Browser URL remains: photography.philipsun.com/booking (unchanged)
```

### State Management

The CRM data layer introduces server-state alongside existing static state:

```
Static content (read-only)          Server state (mutable)
──────────────────────               ──────────────────────
src/data/*.ts (TypeScript)      →   Neon Postgres (Drizzle)
  - projects                          - contacts
  - resume                            - bookings
  - current-focus                     - packages (photography)

Component-level UI state (unchanged)
  - useState for date pickers, menus
  - No global state manager needed
```

## Recommended Data Schema (Drizzle)

```typescript
// src/lib/db/schema.ts

// Contacts from any inquiry (main site or photography)
contacts: {
  id: uuid primary key
  name: text not null
  email: text not null
  message: text
  source: text  // 'main_contact' | 'photography_inquiry'
  status: text  // 'new' | 'replied' | 'archived'
  created_at: timestamp
}

// Photography booking sessions
bookings: {
  id: uuid primary key
  contact_id: uuid → contacts.id
  package_id: uuid → packages.id
  shoot_date: date
  shoot_location: text
  notes: text
  status: text  // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  stripe_session_id: text
  stripe_payment_intent_id: text
  amount_cents: integer
  created_at: timestamp
}

// Photography packages (could also be static, but DB allows runtime updates)
packages: {
  id: uuid primary key
  name: text          // 'Mini Session' | 'Full Session' | 'Event'
  description: text
  price_cents: integer
  duration_minutes: integer
  active: boolean
}
```

## Data Persistence Decision: Neon Postgres (recommended)

### Options Compared

| Option | Free Tier | Scaling | DX | Verdict |
|--------|-----------|---------|-----|---------|
| **Neon Postgres** | 0.5 GB, 100 CU-hours/month, auto-suspends | Serverless, scale-to-zero | Drizzle ORM, native Vercel integration | **Recommended** |
| Supabase | 500 MB, 2 projects free, always-on | BaaS with auth/realtime/storage | Supabase client or Drizzle | Overkill — extras not needed |
| Vercel KV (Upstash Redis) | 256 MB, 30k requests/day | Key-value only | Simple SDK | Wrong fit — not relational, no joins |
| SQLite (local/Turso) | Free | Limited without Turso | Drizzle | Cold-start risk, edge deploy complexity |

**Recommendation: Neon Postgres with Drizzle ORM.**

Rationale:
- Neon is serverless-native — compute auto-suspends after 5 minutes of idle, preventing charges for a low-traffic personal site
- Neon has a first-party Vercel integration (one-click connection, env vars auto-injected)
- Drizzle ORM is TypeScript-first, lightweight, and has official Neon support via `@neondatabase/serverless` HTTP driver — no connection pooler needed for serverless
- Relational schema is appropriate: bookings need foreign keys to contacts and packages
- Free tier (0.5 GB storage, 100 CU-hours/month) is sufficient for a personal CRM with hundreds of bookings
- Supabase brings auth, realtime, and storage that are not needed here; Neon is the right-sized tool

**Connection pattern (Drizzle + Neon HTTP driver):**
```typescript
// src/lib/db/index.ts
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle({ client: sql, schema })
```

This is a module-level singleton. Safe in serverless — each invocation gets a fresh module context.

## DNS and Vercel Configuration

### For two known fixed subdomains (photography, ecommerce)

Because the subdomain names are known in advance (not user-generated like `{tenant}.example.com`), you do NOT need to switch nameservers to Vercel. Use individual CNAME records:

```
photography.philipsun.com  CNAME  cname.vercel-dns.com
ecommerce.philipsun.com    CNAME  cname.vercel-dns.com
```

Then in the Vercel project settings, add each subdomain as a custom domain. Vercel handles TLS certificate issuance automatically per subdomain via HTTP-01 challenge.

Only use the nameservers method if you later need `*.philipsun.com` (dynamic tenant subdomains). Not required for this project.

### Local Development

Add entries to `/etc/hosts` for local subdomain testing:
```
127.0.0.1  photography.localhost
127.0.0.1  ecommerce.localhost
```

The middleware `host` extraction works on `photography.localhost:3000` the same as production, since it splits on `.` to get the first segment.

## Build Order (Phase Dependencies)

The component dependencies create a natural build sequence. Each phase unblocks the next.

```
Phase 1: Subdomain Routing Infrastructure
  - middleware.ts
  - Route groups (photo), (ecomm) with placeholder pages
  - DNS configuration
  - Vercel domain setup
  ↓ (unblocks photography pages and ecomm landing)

Phase 2: Persistence Layer (Neon + Drizzle)
  - Neon project setup
  - schema.ts (contacts, bookings, packages tables)
  - drizzle.config.ts, initial migration
  - db client singleton
  ↓ (unblocks CRM API routes)

Phase 3: CRM + Contact Ownership
  - /api/contacts route (replaces Formspree or equivalent)
  - Resend integration for notifications
  - Contact form on main site writes to DB
  ↓ (unblocks photography inquiry capture)

Phase 4: Photography Subdomain Content
  - Gallery/portfolio pages under (photo)/
  - Pricing page with package display
  - Photography-specific layout and navigation
  ↓ (unblocks booking flow — needs packages defined)

Phase 5: Photography Booking + Payments
  - Stripe integration (Checkout Sessions)
  - /api/bookings route
  - /api/stripe/webhook route
  - Booking UI components (package selection, details form, confirmation)
  - Webhook → booking status update → confirmation email

Phase 6: Ecommerce Landing
  - (ecomm)/ layout and page (simple, minimal)
  - No DB interaction needed — static content
  (can be built anytime after Phase 1)
```

**Critical dependency:** Payments (Phase 5) depend on the DB layer (Phase 2) existing, because a booking record must be created before redirecting to Stripe — you need the `booking_id` in the Stripe session metadata to match on webhook return.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–100 bookings/year | Current plan is sufficient. Neon free tier, Stripe Checkout, no admin UI needed — check email for new bookings. |
| 100–1,000 bookings/year | Add a simple `/admin` route protected by NextAuth or Clerk for viewing and managing bookings. Still single deployment. |
| 1,000+ bookings/year | Extract booking system to a separate Next.js service (multi-zone), add proper auth, admin dashboard. This is a business at that point. |

### Scaling Priorities

1. **First bottleneck:** Neon free tier compute (100 CU-hours/month). At scale-to-zero with 0.25 CU, this is enough for ~400 hours of active query time per month. Personal site traffic will not hit this. Upgrade to Neon $19/month plan if needed.
2. **Second bottleneck:** Manual booking management via email. Build an `/admin` panel before calendar becomes unmanageable (roughly 50+ active bookings).

## Anti-Patterns

### Anti-Pattern 1: Using `<Link>` for Cross-Subdomain Navigation

**What people do:** Use Next.js `<Link href="https://photography.philipsun.com/booking">` or `<Link href="/booking">` from the main site expecting to land on the photography subdomain.

**Why it's wrong:** Next.js `<Link>` triggers client-side soft navigation and prefetching. Relative paths will route within the current subdomain's route group. Absolute URLs in `<Link>` may work but skip the client-side router entirely — behavior is inconsistent.

**Do this instead:** Use a plain `<a href="https://photography.philipsun.com/booking">` for all cross-subdomain links. This is documented in Next.js multi-zone docs.

### Anti-Pattern 2: Skipping Stripe Webhook Verification

**What people do:** Accept the Stripe webhook payload and update the booking to "confirmed" without verifying the signature.

**Why it's wrong:** Any request to `/api/stripe/webhook` could fake a `payment_intent.succeeded` event and mark a booking as confirmed without payment.

**Do this instead:** Always call `stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)`. The raw body must be read before any JSON parsing — use `await req.text()` not `await req.json()` in the Route Handler.

### Anti-Pattern 3: Creating a New DB Connection Per Request

**What people do:** Instantiate `neon()` and `drizzle()` inside the Route Handler function body.

**Why it's wrong:** In serverless, each request may reuse a warm function instance. A module-level singleton reuses the same Neon HTTP client. More importantly, creating connections inside request handlers obscures that these are HTTP calls (neon-http is stateless per request anyway, but the pattern establishes bad habits for when you switch to WebSocket-based connections).

**Do this instead:** Export `db` from `src/lib/db/index.ts` as a module-level singleton. Import it directly in Route Handlers.

### Anti-Pattern 4: Hosting Photography Images in the Git Repo or Vercel Deployment

**What people do:** Place `.jpg` and `.webp` files in `public/images/` for the photography gallery.

**Why it's wrong:** Photography portfolios have dozens to hundreds of high-resolution images. Vercel deployments have a 4.5 GB compressed size limit. Git repos with large binaries become slow. Redeployments for image updates are unnecessary.

**Do this instead:** Store photography images in Cloudflare R2 (free tier: 10 GB storage, 10M reads/month) or Vercel Blob. Serve them via `next/image` with `remotePatterns` configured for the storage origin. Images never enter the deployment bundle.

### Anti-Pattern 5: Putting the Subdomain Layout in Root `layout.tsx`

**What people do:** Add subdomain-specific nav/footer logic to `src/app/layout.tsx` with conditional rendering based on a domain check.

**Why it's wrong:** Root layout wraps every page. Conditional domain detection in the root layout is fragile and mixes concerns. Route groups exist exactly to solve this.

**Do this instead:** Each route group has its own `layout.tsx`. The root `layout.tsx` provides only truly global concerns (HTML/body, font variables, Person schema JSON-LD). Photography gets `(photo)/layout.tsx` with a photography-branded header.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Neon Postgres | Module-level Drizzle client, neon-http driver | Set `DATABASE_URL` env var in Vercel project |
| Stripe | `stripe` SDK server-only, Checkout Sessions redirect | Set `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Resend | `resend` SDK in Server Actions / Route Handlers | Set `RESEND_API_KEY`; free tier = 3k emails/month |
| iCloud CalDAV | Existing `tsdav` integration in `serverCalendar.ts` | Reuse for photography availability if booking dates matter |
| Cloudflare R2 | `next/image` `remotePatterns` pointing to R2 public URL | No SDK needed for read-only image serving |
| Vercel Analytics | Existing — no changes needed | Auto-tracks all subdomains under same deployment |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `middleware.ts` → route groups | `NextResponse.rewrite()` URL transformation | Stateless, runs on every non-static request |
| Route Handlers → DB | Direct Drizzle `db` import (no HTTP layer) | Co-located in same deployment |
| Booking form → Stripe | Server-side session creation, client redirects to hosted Checkout URL | Never expose `STRIPE_SECRET_KEY` to browser |
| Stripe → `/api/stripe/webhook` | HTTPS POST from Stripe servers | Verify signature every time |
| Route Handlers → Resend | Server-side only via SDK | Never call Resend from client |
| `(photo)` pages → iCloud CalDAV | Existing `/api/calendar` route | No changes needed to reuse for photography scheduling |

## Sources

- Next.js Multi-Zones documentation (official, 2026-03-16): https://nextjs.org/docs/app/guides/multi-zones
- Vercel wildcard domains and nameservers: https://vercel.com/kb/guide/why-use-domain-nameservers-method-wildcard-domains
- Vercel domain management for multi-tenant: https://vercel.com/docs/multi-tenant/domain-management
- Neon Postgres free tier pricing 2025: https://neon.com/pricing
- Drizzle ORM + Neon guide (official): https://orm.drizzle.team/docs/connect-neon
- Drizzle with local and serverless Postgres — Neon guide: https://neon.com/guides/drizzle-local-vercel
- Stripe + Next.js 15 complete guide (2025): https://www.pedroalonso.net/blog/stripe-nextjs-complete-guide-2025/
- Stripe Checkout + Webhook in Next.js 15 (2025): https://medium.com/@gragson.john/stripe-checkout-and-webhook-in-a-next-js-15-2025-925d7529855e
- Resend with Next.js (official): https://resend.com/docs/send-with-nextjs
- Subdomain routing in Next.js 14 — multi-tenant structure: https://trillionclues.medium.com/subdomains-in-next-js-14-how-to-structure-a-scalable-multitenant-frontend-application-f68edc526a60
- Neon vs Supabase comparison: https://www.bytebase.com/blog/neon-vs-supabase/

---
*Architecture research for: Personal portfolio with subdomain routing, CRM, and photography booking*
*Researched: 2026-03-17*
