# Phase 4: GEO and Ecommerce Subdomain - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Three independent workstreams:
1. **GEO structured data** — Expand homepage `Person` JSON-LD and add optional `FAQPage`/`HowTo` blocks to blog post template
2. **llms.txt** — Add `/llms.txt` at site root for AI crawler discovery
3. **Blog post** — Publish one answer-first, entity-depth blog post on a photography business topic
4. **Ecommerce subdomain landing** — Replace "Coming soon" placeholder at `ecommerce.philipsun.com` with a real B2B product showcase page

All work depends on Phase 1 (subdomain routing already live). No booking system or CRM needed for this phase.

</domain>

<decisions>
## Implementation Decisions

### Person JSON-LD Schema (GEO-03)
- **D-01:** Add `hasOccupation` field with four roles: Product Manager, Founder/CEO, Photographer, Entrepreneur
- **D-02:** Expand `knowsAbout` with: Photography, Entrepreneurship, Ecommerce, BYU/Marriott School (in addition to existing PM, Healthcare Operations, Hardware Product Development, Founding)
- **D-03:** Source occupation and education data from `src/data/resume.ts` and `src/data/site-config.ts` — no hardcoding
- **D-04:** Existing `alumniOf` (BYU) is correct — keep it, just ensure it's sourced dynamically

### Blog Post FAQPage/HowTo JSON-LD (GEO-01)
- **D-05:** Add optional `faq` and `howTo` frontmatter fields to MDX blog posts — if absent, schema is omitted (no breaking change to existing posts)
- **D-06:** `faq` frontmatter: array of `{question, answer}` objects → renders as `FAQPage` schema
- **D-07:** `howTo` frontmatter: `{name, description, steps[]}` → renders as `HowTo` schema
- **D-08:** Schema blocks are injected alongside existing `Article` JSON-LD in `src/app/(main)/blog/[slug]/page.tsx`

### llms.txt (GEO-02)
- **D-09:** Philip's identity: PM + Founder (Inara Health, medical device startup) + Photographer + Entrepreneur (B2B ecommerce)
- **D-10:** Key topics to surface: product management, healthcare/medtech founding, photography business, ecommerce/B2B operations
- **D-11:** Route as `/llms.txt` at root — static file in `public/` is simplest

### Blog Post Content (GEO-04)
- **D-12:** Topic: Photography business — answer-first structure optimized for AI citation
- **D-13:** Suggested angle: something a prospective photography client or aspiring photographer would search (e.g., "what to expect from a portrait session", "how photography packages are priced", "what's included in event photography")
- **D-14:** Post must have real entity depth — include specific package details, pricing rationale, what happens at a session — not generic advice
- **D-15:** Use `faq` frontmatter to add FAQPage schema to this post (demonstrates the new infrastructure)

### Ecommerce Landing Page (SUB-03)
- **D-16:** Company has two product lines:
  - **Puno Filter** — Commercial-grade water filtration systems, sourced from Chinese manufacturers, sold globally to B2B buyers
  - **Smart Sync** — Smart home technology (cameras, home automation features), sourced from Chinese manufacturers, targeting interior designers, architects, and specifiers
- **D-17:** Page purpose: B2B product showcase — visitors learn about the products and contact Philip directly to arrange deals
- **D-18:** CTA: "Contact to inquire" — links to Philip's email or a contact form (reuse existing contact infrastructure)
- **D-19:** Audience: B2B buyers — designers, architects, commercial specifiers, and global distributors
- **D-20:** Tone: Professional, product-focused, not salesy — think "product catalog landing" not "consumer marketing"
- **D-21:** No pricing on the page — deals are negotiated directly
- **D-22:** Design: Consistent with BYU navy design system already established

### Claude's Discretion
- Exact `hasOccupation` schema structure (`Occupation` type vs plain string array)
- llms.txt format and length
- Ecommerce page layout (hero, product cards, contact section — structure is flexible)
- Blog post title (find the angle with highest AI citation potential for photography topics)
- Loading skeleton / animation for ecommerce page

</decisions>

<specifics>
## Specific Ideas

- The ecommerce business is B2B wholesale/manufacturing — NOT retail. The landing page should feel like a supplier/partner page, not a consumer storefront.
- Smart Sync targets the designer/specifier market specifically — these are the gatekeepers to installation projects
- Photography blog post should include specifics that only someone who runs the business would know (pricing rationale, what happens day-of, how packages are structured)
- Use existing `siteConfig.email` for the ecommerce CTA — no new contact infrastructure needed

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Existing JSON-LD patterns
- `src/app/(main)/layout.tsx` — Current `Person` JSON-LD (what `knowsAbout`, `alumniOf`, `jobTitle` are already set; D-01 through D-04 extend this)
- `src/app/(main)/blog/[slug]/page.tsx` — Current `Article` JSON-LD on blog posts (D-05 through D-08 add alongside this)

### Data sources
- `src/data/resume.ts` — Roles and education to source `hasOccupation` and `alumniOf` from
- `src/data/site-config.ts` — Site config (name, email, URL) — `knowsAbout` and occupation data should align

### Blog infrastructure
- `src/types/blog.ts` — `BlogPostFrontmatter` interface (D-05 through D-07 extend this type with optional `faq` and `howTo` fields)
- `content/blog/` — Existing blog posts (new post goes here as an MDX file)

### Ecommerce subdomain
- `src/app/(ecommerce)/ecommerce/page.tsx` — Current "Coming soon" placeholder (D-16 through D-22 replace this)
- `src/app/(ecommerce)/layout.tsx` — Ecommerce route group layout (understand existing structure before adding)

### Requirements
- `.planning/REQUIREMENTS.md` §GEO, §SUB-03 — Acceptance criteria for GEO-01 through GEO-04, SUB-03

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Person` JSON-LD in `(main)/layout.tsx` — Already has `alumniOf`, `knowsAbout`, `jobTitle`, `sameAs`; extend in place
- `Article` JSON-LD in `blog/[slug]/page.tsx` — Add sibling schema blocks for FAQPage/HowTo
- `siteConfig.email` — Use for ecommerce CTA contact link (no new infra needed)
- BYU navy design tokens (`byu-navy`, `byu-blue`) — Apply to ecommerce page for brand consistency
- shadcn/ui Card component — Available for ecommerce product cards

### Established Patterns
- JSON-LD: `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />` — use this exact pattern for new schema blocks
- MDX frontmatter: `title`, `date`, `excerpt`, `tags`, `published` are current fields — add `faq[]` and `howTo{}` as optional
- Static routes in `(ecommerce)` route group already working (Phase 1 infrastructure complete)

### Integration Points
- `BlogPostFrontmatter` type (`src/types/blog.ts`) needs `faq?` and `howTo?` optional fields
- `public/llms.txt` is a new static file — no route needed, served directly
- Ecommerce page replaces existing placeholder at `src/app/(ecommerce)/ecommerce/page.tsx`

</code_context>

<deferred>
## Deferred Ideas

- Periodic AI citation testing workflow (GEO-V2-01 from REQUIREMENTS.md) — backlog
- Additional blog posts — this phase delivers one; strategy for ongoing GEO content is out of scope
- Full ecommerce storefront or product catalog — out of scope (just a landing page)
- Contact form specifically for ecommerce inquiries — reuse existing email CTA for now

</deferred>

---

*Phase: 04-geo-and-ecommerce-subdomain*
*Context gathered: 2026-03-24*
