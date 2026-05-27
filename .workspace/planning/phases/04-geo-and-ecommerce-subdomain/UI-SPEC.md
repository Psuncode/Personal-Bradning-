# UI-SPEC: Phase 4 — Ecommerce Landing Page
# ecommerce.philipsun.com

**Generated:** 2026-03-24
**Phase:** 04-geo-and-ecommerce-subdomain (SUB-03)
**Status:** Ready for implementation

---

## 1. Page Purpose & Audience

**Goal:** B2B product showcase — visitors learn about Puno Filter and Smart Sync product lines, then contact Philip directly to arrange deals.

**Primary audience:**
- Commercial specifiers (architects, interior designers)
- Wholesale distributors (global buyers)
- Commercial project contractors

**Tone:** Professional supplier/partner — product catalog feel, not consumer storefront. Authoritative, concise, no fluff.

**Anti-pattern:** Do NOT make this feel like an e-commerce store with shopping carts, pricing, or "Buy Now" buttons.

---

## 2. Design System

### Colors (override tool recommendation with project BYU system)

| Token | Hex | Usage |
|-------|-----|-------|
| `byu-navy` | `#002E5D` | Primary text, headers, borders, logo |
| `byu-blue` | `#0057B8` | Links, interactive elements, accent |
| `byu-light-blue` | `#6B9ED2` | Subtle accents, dividers |
| `byu-sky` | `#C9E1F4` | Light section backgrounds, tags |
| Background | `#F8FAFC` | Page background (near-white) |
| Surface | `#FFFFFF` | Card backgrounds |
| Text primary | `#1E293B` | Body copy |
| Text muted | `#64748B` | Captions, metadata |

**CTA override:** Use `byu-navy` as primary CTA background (not orange). Secondary CTA: outlined `byu-blue` border.

### Typography (use existing project fonts, not tool recommendation)

| Role | Font | Weight | Size |
|------|------|--------|------|
| Hero heading | Playfair Display (`--font-playfair`) | 700 | `text-5xl` / `text-4xl` mobile |
| Section headings | Inter (`--font-inter`) | 700 | `text-3xl` / `text-2xl` mobile |
| Sub-headings | Inter | 600 | `text-xl` |
| Body | Inter | 400 | `text-base` (16px) |
| Labels/tags | Inter | 500 | `text-sm` |
| Mono detail | Geist Mono (`--font-mono`) | 400 | `text-sm` |

### Style: Trust & Authority with Bento Card Grid

- **Layout pattern:** Enterprise Gateway + Trust & Authority (navy/grey, trust-first)
- **Component style:** Bento Box Grid for product cards (varied card sizes, clean hierarchy, negative space)
- **Effects:** `rounded-xl` (16px) cards, subtle `shadow-sm` at rest → `shadow-md` on hover, `scale(1.01)` hover transition (150ms ease-out)
- **No decorative animations** — this is a business catalog page, not a marketing splash

---

## 3. Page Structure (Section Order)

```
┌──────────────────────────────────┐
│  1. HEADER / NAV                 │
│     Logo + Contact CTA           │
├──────────────────────────────────┤
│  2. HERO                         │
│     Headline + sub + 2 CTAs      │
├──────────────────────────────────┤
│  3. TRUST BAR                    │
│     3 trust signals (icons+text) │
├──────────────────────────────────┤
│  4. PRODUCTS SECTION             │
│     "Our Product Lines"          │
│     Bento 2-card layout          │
│     [Puno Filter] [Smart Sync]   │
│     Each card → product detail   │
├──────────────────────────────────┤
│  5. ABOUT / WHO WE SERVE         │
│     3-column audience cards      │
├──────────────────────────────────┤
│  6. HOW IT WORKS                 │
│     3 steps: Inquire → Terms → Ship │
├──────────────────────────────────┤
│  7. CONTACT / CTA SECTION        │
│     Full-width, mailto CTA       │
├──────────────────────────────────┤
│  8. FOOTER                       │
│     Minimal — name + copyright   │
└──────────────────────────────────┘
```

---

## 4. Section Specifications

### 4.1 Header / Nav

```
[Logo: "Philip Sun — Global Trading"]    [Contact to Inquire →]
```

- Sticky, white background, `border-b border-slate-200`
- Logo: Inter 600, `text-byu-navy`
- CTA button: `bg-byu-navy text-white px-5 py-2 rounded-lg text-sm`
- No other nav links needed (single page)
- Mobile: logo + hamburger → drawer with "Contact" link

### 4.2 Hero Section

**Layout:** Full-width, `py-24 md:py-32`, white background

**Content:**
```
[Eyebrow tag: "B2B · Global Wholesale"]

Global-Grade Products.
Direct from Manufacturer.

We source and distribute commercial water filtration and smart home
systems to buyers, specifiers, and distributors worldwide.
No retail. Direct deals only.

[Contact to Inquire — primary CTA]  [View Products ↓ — scroll link]
```

- Eyebrow: `text-sm font-mono text-byu-blue uppercase tracking-widest`
- H1: Playfair Display, `text-5xl font-bold text-byu-navy` — 2 lines max
- Sub: Inter 400, `text-xl text-slate-600`, max 2 sentences
- Primary CTA: `bg-byu-navy text-white px-8 py-4 rounded-lg text-base font-medium hover:bg-byu-navy/90 transition-colors`
- Secondary CTA: `text-byu-blue underline-offset-2 hover:underline`
- No hero image — let typography carry it (clean, supplier feel)

### 4.3 Trust Bar

3 horizontal signals, `py-10 border-y border-slate-100 bg-slate-50`

| Icon | Heading | Sub |
|------|---------|-----|
| Globe (Lucide) | Global Distribution | Shipping to buyers in North America, Europe, and Asia-Pacific |
| Factory | Direct Sourcing | Chinese manufacturers with verified quality standards |
| Handshake | Deal-Based Pricing | All pricing negotiated directly — no hidden markups |

- Each item: icon (24px, `text-byu-blue`) + heading (`font-semibold text-byu-navy`) + sub (`text-sm text-slate-500`)
- Responsive: 3-col desktop → 1-col stacked mobile

### 4.4 Products Section

**Section header:**
```
Our Product Lines

Two complementary businesses serving B2B buyers in filtration and smart home markets.
```
- H2: `text-3xl font-bold text-byu-navy`
- Sub: `text-lg text-slate-600`

**Bento product card layout (2 cards, equal size on desktop, stacked mobile):**

```
┌───────────────────────┐  ┌───────────────────────┐
│  [Accent bar: navy]   │  │  [Accent bar: blue]   │
│                       │  │                       │
│  PUNO FILTER          │  │  SMART SYNC           │
│  Commercial Water     │  │  Smart Home Systems   │
│  Filtration Systems   │  │  & Automation         │
│                       │  │                       │
│  Commercial-grade     │  │  Smart home cameras,  │
│  water filtration     │  │  automation features, │
│  systems sourced from │  │  sourced for designers│
│  verified Chinese     │  │  architects, and home │
│  manufacturers.       │  │  specifiers.          │
│  Sold globally to B2B │  │                       │
│  buyers.              │  │                       │
│                       │  │                       │
│  [Category tags]      │  │  [Category tags]      │
│  Commercial · Filtration  │  Residential · Smart Home│
│  Global Distribution  │  │  Designer Spec        │
│                       │  │                       │
│  [Inquire about       │  │  [Inquire about       │
│   Puno Filter →]      │  │   Smart Sync →]       │
└───────────────────────┘  └───────────────────────┘
```

**Card spec:**
- `rounded-xl bg-white shadow-sm border border-slate-200`
- `hover:shadow-md hover:scale-[1.01] transition-all duration-150`
- Top accent: `h-1.5 bg-byu-navy rounded-t-xl` (Puno) / `h-1.5 bg-byu-blue rounded-t-xl` (Smart Sync)
- Product name: `text-2xl font-bold text-byu-navy`
- Sub-title: `text-base font-medium text-slate-500`
- Body: `text-base text-slate-700 leading-relaxed`
- Tags: `inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-byu-sky text-byu-navy`
- CTA link: `text-byu-blue font-medium hover:underline inline-flex items-center gap-1`
- Padding: `p-8`
- Min height: `min-h-[420px]` — cards equal height via CSS grid `grid-rows: 1fr`

**Puno Filter content:**
- Name: "Puno Filter"
- Sub: "Commercial Water Filtration Systems"
- Body: "Industrial and commercial-grade water filtration systems sourced from verified Chinese manufacturers. We supply large-scale filtration solutions to buyers across North America, Europe, and Asia-Pacific — distributed globally on a B2B wholesale basis."
- Tags: "Commercial Grade" / "B2B Wholesale" / "Global Distribution"

**Smart Sync content:**
- Name: "Smart Sync"
- Sub: "Smart Home Systems & Automation"
- Body: "Smart home technology — cameras, automation controllers, and home integration systems — sourced from Chinese manufacturers and positioned for the professional specification market. Ideal for interior designers, architects, and specifiers equipping residential and commercial projects."
- Tags: "Smart Home" / "Designer Spec" / "Professional Grade"

### 4.5 Who We Serve

**Section header:** "Who We Work With"

3 audience cards in a row (stacked mobile):

| Icon | Title | Description |
|------|-------|-------------|
| Ruler (Lucide) | Architects & Designers | Specifying smart home systems for residential and commercial projects. Get product specs and pricing direct. |
| Package | Distributors & Wholesalers | Looking to carry filtration or smart home products in your market. Let's discuss volume terms. |
| Building2 | Commercial Buyers | Procurement for large-scale facilities and commercial properties. Custom arrangement available. |

- Card: `p-6 rounded-xl border border-slate-200 bg-white`
- Icon: `w-10 h-10 text-byu-blue mb-4`
- Title: `text-lg font-semibold text-byu-navy`
- Body: `text-sm text-slate-600 leading-relaxed mt-2`

### 4.6 How It Works

**Section header:** "Simple Process. Direct Deals."

3 steps, horizontal on desktop, vertical mobile:

| Step | Title | Detail |
|------|-------|--------|
| 01 | Send an inquiry | Email Philip directly with your product interest and quantity requirements. |
| 02 | Discuss terms | Pricing, MOQ, shipping, and timeline are negotiated directly — no middlemen. |
| 03 | Ship globally | Products ship from manufacturer to your destination. All logistics coordinated. |

- Step number: `text-5xl font-bold text-byu-sky` (light navy — decorative)
- Step title: `text-xl font-semibold text-byu-navy`
- Step body: `text-sm text-slate-600`
- Connector: dashed border line between steps on desktop

### 4.7 Contact / CTA Section

Full-width section, `bg-byu-navy text-white py-20`

```
Ready to source at scale?

Get in touch and Philip will respond within 24 hours
to discuss your requirements.

[Contact Philip →]   (mailto: link)
```

- H2: `text-4xl font-bold text-white`
- Sub: `text-lg text-byu-sky mt-4`
- CTA button: `bg-white text-byu-navy px-8 py-4 rounded-lg font-semibold hover:bg-byu-sky transition-colors mt-8`
- Mailto href: `siteConfig.email` (from site-config.ts)

### 4.8 Footer

Minimal — `py-8 border-t border-slate-200`

```
Philip Sun  ·  Global Trading   |   © 2025   |   ecommerce.philipsun.com
```

- `text-sm text-slate-500 text-center`

---

## 5. Responsive Behavior

| Breakpoint | Layout |
|------------|--------|
| Mobile (< 768px) | Single column, all sections stack, `px-4` gutters |
| Tablet (768–1024px) | 2-col products, 2-col audience (3rd wraps), `px-8` |
| Desktop (≥ 1024px) | Max-width `max-w-6xl mx-auto`, all sections full, `px-6` |

- No horizontal scroll at any breakpoint
- Hero H1: clamps from `text-3xl` (mobile) → `text-5xl` (desktop)
- Product cards: `grid-cols-1 md:grid-cols-2` with `gap-6`
- Audience cards: `grid-cols-1 sm:grid-cols-3` with `gap-4`

---

## 6. Accessibility

- All CTAs have descriptive text (no "Click here")
- All Lucide icons paired with visible text labels (no icon-only buttons)
- Heading hierarchy: H1 (hero) → H2 (sections) → H3 (card titles)
- Color contrast: white text on `#002E5D` passes WCAG AA (12:1)
- Focus rings: `focus-visible:ring-2 focus-visible:ring-byu-blue`
- `prefers-reduced-motion`: disable hover scale/shadow transitions

---

## 7. Data Sources

| Data | Source |
|------|--------|
| Email for CTA | `siteConfig.email` from `src/data/site-config.ts` |
| Site name | `siteConfig.name` |
| All product copy | Hardcoded in component (no CMS needed) |

---

## 8. Implementation Notes

- **File to replace:** `src/app/(ecommerce)/ecommerce/page.tsx` — current placeholder
- **Layout file:** `src/app/(ecommerce)/layout.tsx` — update metadata title/description
- **No new dependencies** needed — Lucide icons already installed, shadcn/ui Card available
- **No Framer Motion** — keep static for performance (no animation needed on supplier page)
- **No server components needed** — pure static RSC (no `use client` required)
- Import `siteConfig` from `@/data/site-config` for email address
- Use Tailwind classes with existing `byu-navy`, `byu-blue`, `byu-sky`, `byu-light-blue` tokens

---

## 9. Pixel Handoff Quick Reference

```
Page background:    bg-[#F8FAFC]
Navy:               bg-byu-navy / text-byu-navy = #002E5D
Blue:               text-byu-blue = #0057B8
Sky:                bg-byu-sky = #C9E1F4
Card radius:        rounded-xl = 16px
Card shadow rest:   shadow-sm
Card shadow hover:  shadow-md
Card hover scale:   scale-[1.01]
Transition:         duration-150 ease-out
Body font size:     16px (text-base)
Section padding:    py-20 (desktop) / py-12 (mobile)
Max content width:  max-w-6xl (1152px)
Gutter:             px-6 (desktop) / px-4 (mobile)
```

---

*Phase: 04-geo-and-ecommerce-subdomain*
*Design contract generated: 2026-03-24*
*Implements: D-16 through D-22 from 04-CONTEXT.md*
