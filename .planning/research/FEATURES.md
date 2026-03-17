# Feature Research

**Domain:** Personal portfolio + photography booking + lightweight CRM + GEO blog
**Researched:** 2026-03-17
**Confidence:** MEDIUM-HIGH (photography booking flow and CRM features are well-documented industry patterns; GEO is emerging but well-sourced from 2025-2026 guides)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or untrustworthy.

#### Portfolio (PM + Photographer + Entrepreneur)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Clear identity headline | Visitors decide within 30 seconds whether to stay — "who this person is" must be instant | LOW | Already exists in hero; needs to carry the PM + photographer + entrepreneur through-line |
| Case studies with problem/solution/metrics | Hiring managers evaluate PMs on outcome evidence, not activity | MEDIUM | Existing project pages cover this; needs photography case studies too |
| Curated project grid (4–8 projects max) | Too many = dilution; too few = lack of evidence. Industry consensus: quality > quantity | LOW | Existing grid works; curation is a content decision |
| Resume / experience page | Professional credibility baseline — every hiring manager expects this | LOW | Already exists |
| Contact path (email or form) | No contact path = zero conversion on interest generated | LOW | Already exists in contact section |
| Mobile-responsive design | 60%+ of portfolio views happen on mobile | LOW | Already handled by Tailwind responsive classes |
| Fast load speed | Photography-heavy sites that load slowly signal unprofessionalism | MEDIUM | Next.js Image optimization required for gallery pages |
| Photography gallery with categories | Clients need to find relevant work fast — 4–6 categories is the sweet spot | MEDIUM | New section; categories: portrait, landscape, event, etc. |
| Booking / inquiry path from photography pages | Visitors who like the photography work need a clear next step to book | LOW | A CTA button; the booking flow itself is the higher-complexity piece |

#### Photography Booking (Client-Facing)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Package listing with explicit pricing | "Contact for pricing" is a conversion killer — clients abandon without price transparency | LOW | Static page listing packages; no dynamic logic needed |
| Package selection in booking flow | Industry standard; clients expect to pick their tier before entering personal details | MEDIUM | State management in multi-step form |
| Date/time selection with real availability | Back-and-forth scheduling email is the pain point this solves | MEDIUM | Already have CalDAV availability service — can extend |
| Non-refundable deposit collection at booking | Industry standard 25–50% retainer secures the date and filters serious clients | HIGH | Stripe integration required; highest complexity item |
| Booking confirmation email | Clients expect immediate confirmation with session details | MEDIUM | Resend or Nodemailer; triggered server-side |
| Balance payment reminder / collection | Remainder due before or day-of session is industry standard | MEDIUM | Can be manual initially (email reminder) or automated |

#### Lightweight CRM (Data Ownership)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Inquiry capture (name, email, session type, message) | Every form submission is a lead — must be persisted, not just emailed | LOW | Replaces or augments existing contact form with DB write |
| Contact record per inquiry | Owning data means being able to follow up, not just receive emails | LOW | Single contacts table; minimal schema |
| Booking status tracking (inquiry → confirmed → completed) | Without status, leads fall through the cracks | LOW | Simple enum field on booking record |
| Admin view of all inquiries/bookings | Owner needs to see pipeline at a glance | MEDIUM | Protected /admin route; server-rendered table |

#### GEO Blog

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Structured headings (H2/H3) with direct answers | AI engines use question-answer pairs for citations — structureless prose is not cited | LOW | Content/writing discipline; no new tech |
| FAQ schema (JSON-LD) per post | Explicit FAQ markup increases retrieval by AI engines | LOW | Already have JSON-LD infrastructure; extend per-post |
| GPTBot / ClaudeBot not blocked in robots.txt | AI crawlers must be able to index content to cite it | LOW | One-line robots.txt change; verify current state |
| Author bio with expertise signals | AI engines favor author authority signals on content | LOW | Add structured author metadata to blog posts |
| Publication and update timestamps visible | Freshness signals matter to both AI and traditional search | LOW | Already in MDX frontmatter; verify display |

---

### Differentiators (Competitive Advantage)

Features that set the site apart. Not required, but these are where Philip wins.

#### Portfolio Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Unified PM + photographer + entrepreneur narrative | Multi-hyphenate sites usually feel scattered; a clear through-line ("I ship things and I see them") is rare and memorable | LOW | Copywriting and UX structure, not engineering |
| Photography work as proof of PM skills | Showing photography as a visual execution discipline — not a side hobby — bridges the technical + creative split that PMs struggle to demonstrate | LOW | Framing in case study copy, not a feature per se |
| Subdomain architecture (photography.philipsun.com) | Dedicated photography subdomain signals seriousness to photography clients who won't trust a "tab on a PM site" | HIGH | Architecture decision pending; multi-zone vs middleware |
| GEO-optimized content on specific niches (PM + ecommerce + photography) | Most PM portfolios are invisible to AI queries; first-mover in AI citation within these niches has compounding returns | MEDIUM | Content strategy + technical implementation |
| Original research or proprietary data in blog posts | AI engines strongly favor unique data over rehashed advice — Philip's ecommerce and PM experience gives him firsthand data others lack | MEDIUM | Requires writing discipline; no engineering cost |

#### Photography Booking Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Full booking on-site (no third-party redirect) | Check Cherry, Pixieset, etc. break brand experience and cost $39–$130/month; owning the flow keeps all data and saves fees | HIGH | Stripe + DB + multi-step form; the core new build |
| Package comparison table with what's included | Clients comparing photographers make decisions on specifics (# of edited images, turnaround time) — transparency closes more bookings than vague packages | LOW | Static HTML/Tailwind table |
| Post-booking questionnaire | Capturing session preferences (vibe, location, wardrobe ideas) before the shoot differentiates the client experience from generic booking flows | MEDIUM | Optional follow-up form; can be a separate URL sent post-confirmation |
| Automated ICS calendar invite on booking | Small detail that feels professional and reduces scheduling confusion | LOW | Already have icsService.ts; trigger on booking confirmation |

#### CRM Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Notes per contact | Qualitative context (how they found the site, what they said in inquiry) is lost if not captured — distinguishes a real CRM from a spreadsheet | LOW | Text field on contact record |
| Source tracking (how did they find you?) | Understanding which channels (GEO blog, direct referral, social) drive bookings informs content and marketing decisions | LOW | Hidden field in inquiry form; UTM or referrer capture |
| CSV export | Data portability — if the homebuilt CRM isn't enough later, export to Honeybook or Dubsado without losing history | LOW | One server action; `csv` npm package or manual serialization |

#### GEO Blog Differentiators

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Definitive guides on specific PM/photography/ecommerce intersections | "How a PM thinks about photography workflow" is a topic no one owns — AI engines will cite whoever publishes it first with depth | LOW | Content, not engineering |
| HowTo schema on instructional posts | Structured HowTo markup gives AI engines explicit step-by-step extraction targets | LOW | Add to JSON-LD infrastructure alongside existing Article schema |
| Consistent cross-web brand mentions (earned media) | AI citation favors authors mentioned on authoritative external sites — guest posts, podcast appearances, PR amplify AI visibility | LOW | Off-site effort; zero engineering |

---

### Anti-Features (Commonly Requested, Often Problematic)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full ecommerce store on site | "Sell prints directly" is appealing | Print sales require inventory management, fulfillment, customer support — scope explosion for marginal revenue at personal scale | Link to Printful, SmugMug, or a future dedicated store; keep portfolio site conversion-focused |
| Social feed integration (Instagram embed) | Photographers want to show volume of work | Third-party embed scripts add load time, break when APIs change, and shift the visitor's attention off-site | Curate best work into gallery categories manually; update quarterly |
| Real-time chat widget | "Never miss an inquiry" | Adds JS weight, creates support obligation, most visitors don't use it — contact form converts better for considered services | Clear contact form + fast email response SLA |
| Client portal / login system | "Clients can see their booking status" | Auth system is a substantial build; introduces password management, session security, account recovery — high complexity for low frequency use case | Post-booking confirmation email with all details is sufficient at this volume |
| Automated contract e-sign | Honeybook/Dubsado users expect DocuSign-style contracts | Building a legally sound e-signature flow requires careful implementation; liability exposure if done wrong | For v1: PDF contract sent via email post-booking; e-sign can be added in v2 via HelloSign API if volume justifies it |
| Availability sync across multiple calendars | Philip has iCloud CalDAV; adding Google Calendar, Outlook sync seems useful | Multi-calendar sync introduces conflict resolution bugs, OAuth complexity, and is currently a known source of bugs in the existing CalDAV integration | Fix the existing CalDAV integration first; single source of truth is better than multi-source sync |
| Blog comment system | Community engagement on posts | Spam management, moderation overhead; personal portfolios rarely reach comment-worthy traffic levels | Link to LinkedIn post or Twitter thread per article for discussion |
| Portfolio like/save/favorite | "Visitors can save favorite photos" | Requires accounts or local storage hacks; no clear conversion benefit for a booking-conversion-focused portfolio | A well-placed CTA after the gallery does more for conversion than a save feature |

---

## Feature Dependencies

```
[Photography Gallery]
    └──requires──> [Image optimization / Next.js Image setup]
    └──requires──> [Gallery category data structure]

[Photography Booking Flow]
    └──requires──> [Package + pricing data layer]
    └──requires──> [Availability service (already exists, needs extension)]
    └──requires──> [Stripe payment integration]
    └──requires──> [CRM persistence layer (DB)]
    └──requires──> [Booking confirmation email]

[CRM Admin View]
    └──requires──> [CRM persistence layer (DB)]
    └──requires──> [Protected /admin route with auth]

[Deposit Collection]
    └──requires──> [Stripe integration]
    └──requires──> [Booking record in DB]

[Photography Subdomain]
    └──requires──> [Subdomain architecture decision (multi-zone vs middleware)]

[GEO Blog]
    └──requires──> [Existing MDX + JSON-LD infrastructure (already exists)]
    └──enhances──> [Author bio + expertise signals]
    └──enhances──> [FAQ schema per post]

[Booking Confirmation Email]
    └──enhances──> [ICS calendar invite (icsService.ts already exists)]

[Source Tracking]
    └──enhances──> [CRM contact record]

[Stripe Integration] ──conflicts──> [Cal.com booking embed]
    NOTE: Cal.com handles its own payments; if on-site booking with Stripe is built,
    the Cal.com embed on /meet becomes redundant for photography — keep separate or
    consolidate to avoid two booking paths confusing visitors
```

### Dependency Notes

- **Booking Flow requires DB**: The single biggest architectural gate. No CRM data ownership without a persistence layer. Supabase (hosted Postgres) is the recommended choice over SQLite for Vercel deployment — see STACK.md.
- **Photography Gallery is independent**: Can be shipped before booking — static data, no DB dependency.
- **GEO Blog is infrastructure-light**: Mostly content discipline + small JSON-LD additions. No DB dependency.
- **Subdomain architecture blocks photography subdomain**: Must resolve multi-zone vs. middleware decision before building photography.philipsun.com.
- **Cal.com / on-site booking duality**: Two booking paths will confuse clients. Recommendation: keep Cal.com for PM/consulting meetings (/meet), build on-site booking exclusively for photography. Separate use cases, separate flows.

---

## MVP Definition

### Launch With (v1)

Minimum viable product for the "active" requirements in PROJECT.md.

- [ ] Photography gallery section on main site — validates photography as a serious service offering; no DB needed
- [ ] Photography package/pricing page — static, eliminates "contact for pricing" barrier, required before booking flow
- [ ] Inquiry capture to DB — even a simple form that writes to Supabase is enough to own lead data; don't lose leads to email-only flows
- [ ] Basic booking flow: package select → date/time → client info → Stripe deposit → confirmation email — the full loop, even without admin UI
- [ ] CRM admin view (read-only table of inquiries) — Philip needs to see what's coming in; can be a simple /admin page

### Add After Validation (v1.x)

Features to add once core booking loop is proven working.

- [ ] Post-booking questionnaire — add once first few bookings confirm the base flow works
- [ ] Balance payment collection / reminder — manual email first; automate when volume justifies
- [ ] GEO blog content + schema additions — can start immediately in parallel with booking build (different track)
- [ ] Photography subdomain — add once architecture decision is made; blocks on multi-zone vs. middleware

### Future Consideration (v2+)

Defer until v1 is validated and volume justifies complexity.

- [ ] E-sign contract integration (HelloSign / Docusign API) — v1 handles with email PDF; add when volume > 10 bookings/month
- [ ] Automated payment reminders — worth building when repeated manual reminders become a time sink
- [ ] Ecommerce company landing page on subdomain — lower urgency than photography; add after photography subdomain is working
- [ ] Analytics on booking funnel (drop-off per step) — add once there's enough traffic to read signal

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Photography gallery | HIGH | LOW | P1 |
| Package + pricing page | HIGH | LOW | P1 |
| Inquiry capture to DB | HIGH | LOW | P1 |
| Full booking flow with Stripe deposit | HIGH | HIGH | P1 |
| Booking confirmation email + ICS | HIGH | MEDIUM | P1 |
| CRM admin view | MEDIUM | MEDIUM | P1 |
| GEO blog schema additions (FAQ, HowTo JSON-LD) | MEDIUM | LOW | P1 |
| GEO blog content strategy | HIGH | LOW (content work) | P1 |
| Photography subdomain | MEDIUM | HIGH | P2 |
| Post-booking questionnaire | MEDIUM | LOW | P2 |
| Source tracking on inquiries | MEDIUM | LOW | P2 |
| Notes per contact in CRM | MEDIUM | LOW | P2 |
| CSV export from CRM | LOW | LOW | P2 |
| Package comparison table (visual) | MEDIUM | LOW | P2 |
| Automated balance payment reminder | LOW | MEDIUM | P3 |
| E-sign contract integration | MEDIUM | HIGH | P3 |
| Ecommerce subdomain landing | LOW | HIGH | P3 |
| Print sales / ecommerce store | LOW | HIGH | P3 (anti-feature at this stage) |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Photography Booking Flow (Concrete Description)

This is the specific UX flow a client experiences booking a photography shoot.

### Step 1: Discovery (photography gallery or pricing page)
Client views gallery, sees package pricing. CTA: "Book a Session" links to booking flow.

### Step 2: Package Selection
- Display 2–4 packages (e.g., Mini Session 30min, Standard 60min, Extended 90min)
- Each package shows: duration, # of edited images, turnaround time, price
- Client selects one package → "Continue"

### Step 3: Date and Time Selection
- Calendar view of available dates (pulls from existing CalDAV availability service)
- Available time slots for selected date (30-min or 60-min slots, 9AM–5PM Mountain)
- Client selects date + time → "Continue"

### Step 4: Client Information
- Name, email, phone (optional), session location preference, special requests
- Hidden fields: source/referrer capture

### Step 5: Review + Deposit
- Summary: package, date/time, location, total price
- Deposit amount displayed (25–50% of package total, non-refundable)
- Balance due: date and amount
- Stripe payment element (card, Apple Pay, Google Pay)
- Checkbox: "I agree to the cancellation policy" (links to policy text)
- CTA: "Confirm and Pay Deposit"

### Step 6: Confirmation
- Success screen with booking summary
- Confirmation email sent immediately (with ICS calendar invite attachment)
- Balance payment reminder email scheduled for 48h before session (v1: manual; v2: automated)

### Data Written (CRM)
- Contact: name, email, phone, source
- Booking: package, date/time, location, deposit amount, balance amount, Stripe payment intent ID, status = "confirmed"

### Industry Standards Applied
- Deposit: 25–50% (non-refundable retainer, not a deposit — important legal distinction)
- Balance: due at or before session day
- No refund on retainer; rescheduling allowed with 72h notice (policy text only, not enforced by code in v1)
- Contract: PDF linked in confirmation email (v1); e-sign in v2

---

## Competitor / Comparator Feature Analysis

| Feature | Honeybook / Dubsado (SaaS CRM) | Pixieset / Zenfolio (Photo Platform) | Philip's On-Site Build |
|---------|-------------------------------|---------------------------------------|------------------------|
| Package booking | Yes, full-featured | Yes, integrated | Build — full control |
| Stripe payments | Yes | Yes (Pixieset Payments via Stripe) | Build — direct Stripe |
| Contract e-sign | Yes, core feature | Limited | Defer to v2; email PDF for v1 |
| CRM / contact records | Yes, primary value | Limited | Build — lightweight |
| Monthly cost | $39–$400/mo | $15–$50/mo | $0 (Supabase free tier + Stripe fees) |
| Data portability | Limited (locked in) | Limited | Full — it's your DB |
| Brand consistency | Breaks out to their domain | Breaks out to their domain | Full — stays on philipsun.com |
| Custom UI/UX | No | No | Full — matches BYU design system |
| Photography gallery | No | Yes, core feature | Build — integrated with portfolio |

**Conclusion:** SaaS tools cost $40–150/month and break brand continuity. At personal scale (< 50 bookings/year), a custom build pays back within 3 months of avoiding fees and gives Philip full data ownership and brand control — the primary differentiators for a site whose goal is "hire me."

---

## Sources

- [Product Manager Portfolios: 20+ Well-Designed Examples (2026)](https://www.sitebuilderreport.com/inspiration/product-manager-portfolios)
- [The Ultimate Guide to Product Manager Portfolios | Leland](https://www.joinleland.com/library/a/product-manager-portfolio)
- [Photographer Booking Software | Check Cherry](https://www.checkcherry.com/photography-crm)
- [Pixieset Studio Manager | Booking & CRM for Photographers](https://pixieset.com/studio-manager/)
- [Booking & Scheduling | Zenfolio](https://zenfolio.com/features/online-scheduling/)
- [Streamlining photography client booking and scheduling | Zenfolio](https://zenfolio.com/blog/photography-scheduling-booking/)
- [What is the Process? From Inquiry to Booking to Delivery | J + Six Photography](https://www.jandsixphotography.com/blog/the-process)
- [Photography Payment Norms: Methods, Deposits | Belinda Jiao Photography](https://www.belindajiao.com/blog/photography-payment-norms-method-deposits)
- [7 Best CRMs for Photographers in 2025 | Adventure Instead](https://adventureinstead.com/academy/blog/best-crms-for-photographers/)
- [The 15 Best CRMs for Photographers | Bloom](https://blog.bloom.io/best-crm-photographers/)
- [Mastering Generative Engine Optimization in 2026 | Search Engine Land](https://searchengineland.com/mastering-generative-engine-optimization-in-2026-full-guide-469142)
- [GEO Best Practices for 2026 | Firebrand](https://www.firebrand.marketing/2025/12/geo-best-practices-2026/)
- [15 Portfolio Mistakes to Avoid in 2025 | Fueler](https://fueler.io/blog/portfolio-mistakes-to-avoid)
- [25+ Best Photography Portfolio Website Examples in 2025 | Pixpa](https://www.pixpa.com/blog/photography-portfolio-websites)
- [Holistic Branding for Multi-hyphenate Creatives | Stuudios](https://www.quincreativ.com/blog/holistic-branding)

---

*Feature research for: Philip Sun personal portfolio + photography booking + CRM + GEO blog*
*Researched: 2026-03-17*
