# Pitfalls Research

**Domain:** Personal portfolio + photography booking with payment + GEO blog + subdomain routing
**Researched:** 2026-03-17
**Confidence:** HIGH (subdomain routing, Stripe webhooks), MEDIUM (GEO content strategy), HIGH (CRM schema)

---

## Critical Pitfalls

### Pitfall 1: Time Slot Is Not Held During Stripe Checkout

**What goes wrong:**
A user selects a photography session slot, lands on Stripe Checkout, spends 5 minutes entering card details — and a second user books the same slot via a direct API call or concurrent session. The Stripe `checkout.session.completed` webhook fires for both. The calendar gets double-booked.

**Why it happens:**
Developers treat slot selection and payment as one atomic action. They are not. Stripe Checkout is asynchronous: the session lives for up to 24 hours by default. Without a "slot reservation" mechanism, the slot remains available to others during the entire checkout flow.

**How to avoid:**
1. On Checkout Session creation, write a `pending_reservation` record to the database with the slot datetime, a TTL (e.g. 30 minutes), and the Stripe `checkout_session_id`.
2. When generating available slots, filter out slots with active pending reservations.
3. Listen for `checkout.session.expired` to release the reservation back to available.
4. Only confirm the booking (create the calendar event, send confirmation email) inside the `checkout.session.completed` webhook handler — never before.
5. Set `expires_at` on the Checkout Session to a short window (30 minutes is appropriate for a photography booking).

**Warning signs:**
- Booking confirmation happens client-side on redirect, not via webhook
- No `pending_reservation` concept in the data model
- Available slots are queried directly against the calendar without checking in-flight checkouts

**Phase to address:** CRM/Booking data model phase (before any payment integration work)

---

### Pitfall 2: Webhook Idempotency Not Implemented

**What goes wrong:**
Stripe retries webhooks for up to 3 days on delivery failure. Your handler fires twice for the same `checkout.session.completed` event. The booking is created twice: two calendar events, two confirmation emails, two database rows.

**Why it happens:**
Stripe explicitly does not guarantee exactly-once delivery. Developers test the happy path (single delivery) and never encounter this in development. In production, any transient server error during webhook processing causes Stripe to retry.

**How to avoid:**
Before processing any webhook, check whether the Stripe event ID has already been processed. Store processed event IDs in the database with a unique constraint on `stripe_event_id`. If the event ID already exists, return 200 immediately without re-processing.

```
bookings table:
  stripe_event_id VARCHAR UNIQUE  -- prevents double-processing
  stripe_session_id VARCHAR UNIQUE -- prevents duplicate bookings per session
```

**Warning signs:**
- Webhook handler creates records without checking for duplicates
- No `stripe_event_id` column in the bookings table
- Confirmation emails sent from inside the webhook with no deduplication

**Phase to address:** Stripe payment integration phase (day one of webhook implementation)

---

### Pitfall 3: Wildcard Subdomain Requires Vercel Nameservers — Not A Records

**What goes wrong:**
You add `photography.philipsun.com` and `ecommerce.philipsun.com` to Vercel using A records pointing to Vercel's IP. This works for explicit subdomains. But when you try to add `*.philipsun.com` for wildcard routing, it silently fails SSL certificate issuance. The subdomains either show cert errors or don't route at all.

**Why it happens:**
Vercel's wildcard SSL certificate issuance uses the DNS-01 ACME challenge, which requires Vercel to be able to write DNS TXT records. This is only possible when Vercel controls the nameservers. The A record / CNAME method does not grant Vercel this control.

**How to avoid:**
Before building any subdomain routing code, migrate `philipsun.com` DNS to Vercel's nameservers (via the "Nameservers" method in project settings, not "A Record"). This is a DNS change that takes 24-48 hours to propagate. Do it at the start of the subdomain phase, not at the end.

If DNS is currently managed by a third party (Cloudflare, Route53, Namecheap), you must either:
- Move nameservers fully to Vercel, OR
- Use Cloudflare's "Full" (not "Flexible") proxy mode and proxy the wildcard record — but this adds Cloudflare complexity and potential cert conflicts

**Warning signs:**
- Subdomains are configured with CNAME records pointing to `cname.vercel-dns.com`
- SSL cert issuance is pending or failing for `*.philipsun.com`
- Wildcard domain added to Vercel project but shows "Invalid Configuration" badge

**Phase to address:** Subdomain architecture phase (before writing any middleware code — this is infrastructure, not code)

---

### Pitfall 4: Subdomain Middleware Breaks Vercel Preview Deployments

**What goes wrong:**
Your middleware reads `request.nextUrl.hostname` to detect `photography.philipsun.com` vs `philipsun.com`. In production this works. On Vercel preview deployments, the hostname is `your-app-git-branch-name.vercel.app` — a flat URL with no subdomain structure. Middleware routes everything to the root app, photography subdomain content is unreachable in preview, and PRs cannot be reviewed against the actual subdomain experience.

**Why it happens:**
Middleware is written for production domain structure. Preview deployments have a fundamentally different URL pattern (`[project]--[branch]-[team].vercel.app`) that has no analog to `photography.philipsun.com`.

**How to avoid:**
In middleware, add an explicit check for Vercel preview URLs and route by path prefix instead of hostname when in preview mode:

```typescript
const isPreview = hostname.includes('.vercel.app');
const subdomain = isPreview
  ? pathname.startsWith('/photography') ? 'photography' : 'root'
  : hostname.split('.')[0];
```

Alternatively, use environment variables (`VERCEL_ENV === 'preview'`) to switch routing strategy entirely.

**Warning signs:**
- Middleware only handles production domain pattern
- No local development workaround (subdomains don't work on `localhost` without `/etc/hosts` edits)
- Preview deployments always show root app regardless of intended subdomain

**Phase to address:** Subdomain architecture phase (define the preview strategy before any routing code is written)

---

### Pitfall 5: CRM Booking Schema That Conflates Inquiry with Booking

**What goes wrong:**
The first version of the schema has a single `bookings` table that stores both "someone submitted a contact form" and "someone paid for a session." Six months later, you need to build a pipeline view, differentiate between leads and confirmed clients, track deposit vs. balance due, and add package versioning. The schema has to be rewritten. All existing data requires a migration.

**Why it happens:**
At MVP scale, an inquiry and a booking feel like the same thing. They are not: an inquiry has no payment, no confirmed slot, no contract. A booking does. Mixing them creates a status field with 8 values and boolean columns like `is_paid`, `has_deposit`, `is_confirmed` that can reach contradictory states.

**How to avoid:**
Model the domain correctly from the start:

```
contacts            -- who (name, email, phone, source)
inquiries           -- what they want (package, preferred_dates[], notes, status: new/responded/converted/lost)
bookings            -- confirmed sessions (contact_id, inquiry_id, slot_datetime, package_id, status: pending_payment/deposit_paid/paid_in_full/completed/cancelled)
payments            -- payment events (booking_id, stripe_session_id, stripe_event_id, amount_cents, type: deposit/balance, status)
packages            -- photography package definitions (name, price_cents, deposit_cents, duration_minutes, description)
```

Never store package price inside a booking row — store `package_id` and snapshot the price into the `payments` record at payment time. Package prices change; historical payment amounts must not.

**Warning signs:**
- Single table with a `status` column that has more than 4 values
- `is_paid` and `payment_amount` columns on the same table as `message` and `preferred_date`
- Package price stored directly in bookings without a snapshot

**Phase to address:** CRM data model phase (schema must be finalized before any API routes or UI are built — migration cost is HIGH after data exists)

---

### Pitfall 6: GEO Content Written for SEO Keywords Instead of Entity Depth

**What goes wrong:**
Blog posts are optimized for search keywords ("product manager photography portfolio") but AI tools like ChatGPT and Perplexity do not cite them. The site appears in Google but has zero "Share of Model" — when someone asks an AI "who are good PM/photographer hybrids to follow," Philip's site is invisible.

**Why it happens:**
Traditional SEO rewards keyword density and backlinks. GEO rewards entity authority and semantic depth. LLMs treat content as a concept graph, not a keyword index. A post that defines "what I do" and provides verifiable specifics (named projects, measurable outcomes, cited sources) is a node in an AI's reasoning graph. A post that repeats "product manager photographer" fourteen times is noise that gets deduplicated.

**How to avoid:**
- Every post must answer a specific question completely, then pre-answer the obvious follow-up questions within the same post
- Include verifiable specifics: company names, project names, metrics with context, dates
- Cite external authoritative sources (outbound links to primary sources signal verifiability to LLMs)
- Use consistent entity naming across all pages: if Philip is "Philip Sun, product manager and photographer," that exact phrasing must be consistent in JSON-LD, bio copy, and post author fields — contradictions reduce confidence weights
- Update posts when terminology shifts (e.g., "AI-assisted product management" vs. "ML-powered product decisions" — models weight current phrasing over stale phrasing)

**Warning signs:**
- Posts have high organic traffic but zero AI citations when testing manually in ChatGPT/Perplexity
- FAQ schema exists but the answers are vague ("I work on many kinds of projects")
- Author JSON-LD on blog posts is missing or doesn't match the Person schema on the homepage
- No outbound citations in any post

**Phase to address:** GEO content strategy phase (before writing any new posts — retrofitting is 3x the work)

---

### Pitfall 7: Factual Inconsistency Across Pages Destroys AI Trust

**What goes wrong:**
The homepage says Philip has "5+ years of PM experience." The resume page says "since 2020." A blog post says "I've been doing this for 4 years." These are close enough that a human ignores it. An LLM cross-references facts and when they contradict, it reduces the confidence weight for the entire entity — sometimes dropping Philip from citation candidates entirely.

**Why it happens:**
Content is written at different times by the same person who knows the facts intuitively. Small inconsistencies accumulate. No one audits cross-page consistency because it doesn't affect Google rankings.

**How to avoid:**
All verifiable facts (years of experience, company names, project names, education, locations) must be sourced from a single data file (`site-config.ts` or `resume.ts`) and rendered from that source. Prose copy that restates facts should be audited against the data files before publishing.

Specifically: `resume.ts` is the single source of truth for dates and roles. Any homepage or blog copy that references those facts must match exactly.

**Warning signs:**
- Dates or years stated differently on different pages
- Job titles that vary ("Senior PM" on one page, "Product Lead" on another) without explanation
- Blog author field not pulling from `siteConfig`

**Phase to address:** GEO content strategy phase (audit before first GEO-optimized post is published)

---

### Pitfall 8: Stripe Deposit + Balance Payments Handled as Two Separate Checkout Sessions Without Linking

**What goes wrong:**
Photography bookings commonly use a deposit-then-balance model (e.g., 50% at booking, 50% before the shoot). Without explicit linking, when the balance payment webhook fires, there is no reliable way to identify which booking it belongs to. The database has an orphaned payment record. Manual reconciliation required.

**Why it happens:**
Each Stripe Checkout Session is independent by default. Developers create the balance session later without embedding the booking reference, then rely on customer email or metadata that can change between sessions.

**How to avoid:**
Always pass `metadata: { booking_id: "...", payment_type: "deposit" | "balance" }` on every Checkout Session. The webhook handler reads `session.metadata.booking_id` to find the booking — never the customer email or customer ID alone. This metadata is stored with the payment record and survives customer email changes.

**Warning signs:**
- Balance payment session created without metadata linking back to original booking
- Webhook handler uses `customer.email` as the primary key to find the booking
- No `payment_type` field distinguishing deposit from balance in the payments table

**Phase to address:** Stripe payment integration phase (metadata must be defined in the schema before any Checkout Session code is written)

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Store booking data in Vercel KV (key-value) instead of relational DB | Fast setup, no schema design | Cannot query "all bookings in March," no joins, manual index management | Never for booking data — use Supabase (Postgres) from day one |
| Hard-code package prices in booking records | Simple | Price changes require data migration; historical bookings show wrong prices | Never — always snapshot price at payment time via payments table |
| Use `checkout.session.completed` redirect URL to confirm booking | No webhook needed | Client-side redirect is unreliable (user closes tab, network drop) | Never — webhook is the only reliable confirmation signal |
| Single `bookings` table for both inquiries and confirmed sessions | Fast MVP | Status field bloat, impossible to report on conversion rates, schema rewrite required | Only if booking volume is expected to stay under 20 total forever |
| Skip slot reservation during Stripe Checkout | Simpler code | Double-booking in production | Never — reservation is mandatory for any real booking system |
| VERCEL_URL for constructing absolute URLs in API routes | Works locally | Breaks on production — VERCEL_URL is the `.vercel.app` preview URL, not the custom domain | Never in production code — use NEXT_PUBLIC_SITE_URL from siteConfig |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Stripe Webhooks | Verify signature with raw body but parse with `req.json()` first | Use `req.text()` to get raw body, then `stripe.webhooks.constructEvent(rawBody, sig, secret)` — parsing with json() destroys the raw body needed for signature verification |
| Stripe Checkout | Assume `checkout.session.completed` means payment succeeded | Check `session.payment_status === 'paid'` — for certain payment methods, session can complete before payment clears |
| Vercel wildcard domains | Add wildcard after adding individual subdomains with A records | Set up nameservers method first, then add wildcard — cannot mix A record method with wildcard SSL |
| iCloud CalDAV (existing) | Assume calendar errors silently fail closed | Current code (CONCERNS.md line 104) allows date selection even when calendar is unavailable — fix: disable picker entirely on calendar error |
| Supabase Row Level Security | Skip RLS because "it's just a personal site" | Even personal CRM data benefits from RLS — prevents accidental exposure via direct API calls if a key leaks; enable on bookings/contacts tables from day one |
| Cal.com embed + custom booking form | Two booking paths exist simultaneously | Cal.com embed on /meet and the custom BookingForm are redundant; custom system with Stripe requires the custom flow — remove or demote Cal.com embed when payment booking ships |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Existing: monthEvents array accumulates indefinitely in BookingForm | Memory grows during long calendar browsing sessions; re-renders slow | Implement sliding window — keep only current month ± 1; discard older | At ~200+ events in memory (currently fine, becomes noticeable if booking volume grows) |
| Photography gallery: loading full-resolution images | LCP score tanks; mobile users abandon | Use Next.js Image component with `sizes` prop and Vercel Image Optimization; store originals in Supabase Storage, serve optimized via CDN | From day one — unoptimized images are immediately painful |
| GEO: static MDX posts never revalidated | AI models see stale snapshots; content drifts from current phrasing | Add `revalidate` or use ISR with periodic revalidation; set a quarterly "refresh" reminder on GEO-critical posts | Not a performance trap in the traditional sense — breaks AI citation over 6-12 months as embedding clusters shift |
| Supabase free tier connection limits | Serverless functions exhaust connection pool under concurrent load | Use Supabase's connection pooling (PgBouncer/Supavisor) via the pooling connection string, not the direct connection string | At ~10 concurrent users hitting booking API routes simultaneously |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Stripe webhook endpoint without signature verification | Any HTTP client can fake payment confirmations, triggering free bookings | Always verify `stripe-signature` header using `stripe.webhooks.constructEvent()` before processing |
| Booking API routes without rate limiting | Slot reservation endpoint can be spammed to lock out all slots | Add Vercel Edge rate limiting or `upstash/ratelimit` on `/api/bookings` and `/api/checkout` routes |
| CRM admin routes without authentication | Bookings, contact details, and client data exposed publicly | Admin API routes must be behind auth from day one — even a simple shared secret or Supabase Auth is better than nothing |
| Calendar API date range not validated (existing) | Arbitrary date ranges can be queried, potentially exposing busy/free data indefinitely | Fix existing bug: validate `startDate`/`endDate` to a 6-month window; return 400 for out-of-range requests (CONCERNS.md line 50) |
| ICS description field not sanitized (existing) | User-provided description passed directly into `.ics` file | Sanitize/truncate description field before ICS generation (CONCERNS.md line 70) |
| Photography images stored with public predictable URLs | Client photos accessible without authorization if URL is guessed | Use Supabase Storage with signed URLs for any client deliverable photos; public storage only for portfolio/marketing images |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Booking confirmation depends on Stripe redirect completing | User closes tab after payment, never sees confirmation, emails photographer in panic | Send confirmation email from webhook (not redirect); show "check your email" on the post-payment page regardless of whether redirect completed |
| Photography packages presented without clear deliverables | Visitors don't understand what they're paying for; inquiry conversion drops | Each package must show: session duration, number of edited photos, turnaround time, usage rights — not just a price |
| "Book now" CTA before visitor has seen work | High bounce on booking page | Photography portfolio must be visible before or during the booking flow — at minimum, link to portfolio from each package card |
| No cancellation/reschedule policy shown before payment | Post-payment disputes and chargebacks from surprised clients | Display cancellation policy on the booking page, before the payment step — required by Stripe's best practices for dispute prevention |
| Subdomain content feels disconnected from main brand | Visitors don't associate `photography.philipsun.com` with Philip Sun | Shared header with "Philip Sun" branding, shared font/color system — subdomains should feel like pages of one brand, not separate sites |

---

## "Looks Done But Isn't" Checklist

- [ ] **Stripe integration:** Payment UI works in test mode — verify webhook is receiving events in Stripe Dashboard, not just the client redirect completing
- [ ] **Booking confirmation:** Email sent — verify it arrives via actual mail service (Resend/SendGrid), not just a `mailto:` link that requires local email client
- [ ] **Slot reservation:** Calendar shows slot as booked after payment — verify it also blocks the slot during Checkout (before payment) to prevent concurrent double-booking
- [ ] **Subdomain routing:** `photography.philipsun.com` loads — verify it also works in Vercel preview deployments and that middleware doesn't 404 on unknown subdomains
- [ ] **GEO content:** Post has FAQ schema — verify JSON-LD is valid using Google Rich Results Test and that author entity matches Person schema on homepage
- [ ] **CRM data:** Booking appears in database — verify the record includes `stripe_event_id` for idempotency and `stripe_session_id` for linking to payment
- [ ] **Photography gallery:** Images display — verify LCP score on mobile using PageSpeed Insights (full-res images are the most common cause of failing Core Web Vitals)
- [ ] **Deposit model:** Deposit payment confirmed — verify balance payment can be created and linked back to the same booking record without manual intervention

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Double-booking due to no slot reservation | MEDIUM | Audit `checkout.session.completed` events in Stripe Dashboard; identify duplicate sessions for same slot; contact affected clients; add reservation logic before re-opening bookings |
| Non-idempotent webhook created duplicate bookings | MEDIUM | Query for duplicate `stripe_session_id` in bookings table; manually delete duplicates; add unique constraint and event ID tracking before next booking |
| CRM schema conflates inquiries/bookings (needs rewrite) | HIGH | Write migration scripts to split existing records; freeze new bookings during migration window; this is a 1-2 day outage risk if data volume is significant |
| Wildcard subdomain SSL failed due to A record method | LOW | Switch to nameservers method in Vercel; wait 24-48 hours for DNS propagation; no code changes required |
| GEO content has entity inconsistencies | LOW | Audit all fact statements against `resume.ts`; update prose copy; republish — search engines and AI crawlers will pick up changes within days to weeks |
| Photography images not optimized, LCP failing | LOW | Convert to Next.js Image component with proper `sizes`; images are re-optimized at build time via Vercel Image Optimization |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Time slot not held during Stripe Checkout | CRM/Booking data model phase | Schema has `pending_reservations` table with TTL before payment routes are written |
| Non-idempotent webhook | Stripe payment integration phase | Unique constraint on `stripe_event_id` exists in migration file; handler tested with duplicate event replay |
| Wildcard subdomain requires nameservers | Subdomain architecture phase (first task) | `*.philipsun.com` shows valid SSL cert in browser before any middleware code is written |
| Middleware breaks Vercel preview deployments | Subdomain architecture phase | Middleware has explicit `VERCEL_ENV === 'preview'` branch; preview deployment tested manually |
| CRM schema conflates inquiry/booking | CRM/Booking data model phase | Schema review: `contacts`, `inquiries`, `bookings`, `payments`, `packages` are separate tables before any API routes |
| GEO entity inconsistency | GEO content strategy phase | Audit checklist: every verifiable fact on every page traces to `resume.ts` or `site-config.ts` |
| GEO content written for keywords not entity depth | GEO content strategy phase | First GEO post reviewed against citation criteria: specific names, metrics, citations, FAQ schema, consistent author entity |
| Stripe deposit/balance sessions not linked | Stripe payment integration phase | Every Checkout Session creation includes `metadata.booking_id` and `metadata.payment_type` |
| Calendar API unvalidated date ranges (existing bug) | Booking bug fixes phase | `/api/calendar` returns 400 for ranges exceeding 6 months or where startDate > endDate |
| Booking confirmation via redirect not webhook | Stripe payment integration phase | Confirmation email triggered from webhook handler, not from `/success` page component |

---

## Sources

- Stripe Checkout Session expiration and limited inventory: https://docs.stripe.com/payments/checkout/managing-limited-inventory
- Stripe webhook idempotency and race conditions: https://www.pedroalonso.net/blog/stripe-webhooks-deep-dive/
- Stripe webhook handling best practices: https://docs.stripe.com/webhooks/handling-payment-events
- Stripe checkout fulfillment: https://docs.stripe.com/checkout/fulfillment
- Stripe payment status verification: https://docs.stripe.com/payments/payment-intents/verifying-status
- Vercel wildcard domain + nameservers requirement: https://vercel.com/docs/domains/working-with-nameservers
- Vercel multi-tenant platform docs: https://vercel.com/docs/multi-tenant
- Vercel subdomain preview deployment URL mismatch: https://francoisbest.com/posts/2023/displaying-the-right-vercel-deployment-urls-in-nextjs
- Next.js subdomain routing discussion (cookie scoping): https://github.com/vercel/next.js/discussions/62799
- GEO mistakes (keyword vs. meaning, schema, citations): https://georeport.ai/learn/top-10-generative-engine-optimization-mistakes/
- GEO common mistakes and best practices: https://racklify.com/encyclopedia/common-mistakes-and-best-practices-for-generative-engine-optimization-geo/
- GEO personal brand and Share of Model: https://almcorp.com/blog/linkedin-ai-search-citations-2026/
- GEO strategy and platform-specific citation patterns: https://www.getpassionfruit.com/blog/generative-engine-optimization-guide-for-chatgpt-perplexity-gemini-claude-copilot
- Photography deposit vs. retainer legal distinctions: https://hunterandsarah.com/deposit-vs-retainer/
- Photography booking cancellation edge cases: https://www.checkcherry.com/articles/46-photography-contracts-signatures-and-deposits-general-guide
- CRM schema design pitfalls: https://medium.com/@bigbark.studio/crafting-a-robust-crm-database-schema-a-guide-for-data-architects-3b9e77cc0bf
- Database normalization and booking schema: https://chartdb.io/blog/common-database-design-mistakes
- Existing codebase known bugs and fragile areas: `.planning/codebase/CONCERNS.md` (2026-03-17 audit)

---
*Pitfalls research for: personal portfolio + photography booking + GEO blog + subdomain routing*
*Researched: 2026-03-17*
