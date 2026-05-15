# Images to upload

The portfolio is image-forward but currently uses flat SVG placeholders with literal text labels ("Utah Mountain Sunset", etc.). Until real imagery lands, the editorial promise is undermined on every page. Below is the prioritized shopping list, with target paths so a swap is a one-line code change (or in some cases, no code change at all).

> Format: JPG for photographs (smaller than PNG), 2400×1350 (16:9) for full-bleed covers, 1600×2000 (4:5) for portraits, 2400×900 (~21:9) for skinny breaks. Optimize to ≤350 KB each. Decorative photos can use empty `alt=""`; content photos need real alt text.

---

## P0 — covers the user sees first (5 images)

These are the **project covers** on `/projects` and `/projects/<slug>`. The detail page is full-bleed; the placeholder SVG text ("Utah Mountain Sunset") will be visible at 100vw. Today two projects share the same SVG (Inara+Granger, LDS+Cocker) — they need to be different.

| # | Save as | Project | Layout | Suggested subject |
|---|---|---|---|---|
| 1 | `public/images/projects/inara-cover.jpg` | Inara Health Diagnostic | overlay (16:9, full-bleed) | hands-on hardware shot, lab macro, or a moody product still — anything that signals medtech / craft |
| 2 | `public/images/projects/lds-church-cover.jpg` | LDS Church Enterprise PM | beside (4:3) | architecture / systems / scale — abstract diagram photo, sky lattice, anything that reads "enterprise" without being literal |
| 3 | `public/images/projects/nursa-cover.jpg` | Nursa AI TB | overlay (16:9) | clean clinical detail, AI/ML neutral imagery, or a microscope/diagnostic frame |
| 4 | `public/images/projects/granger-cover.jpg` | Granger Medical RVU Analytics | overlay (16:9) | data-feeling — typography on paper, ledger, spreadsheet macro, or a quieter editorial frame |
| 5 | `public/images/projects/cocker-cover.jpg` | Cocker Innovation Fellowship | beside (4:3) | research / biology / glassware — fellowship + synthetic-biology vibe |

**Code change after upload:** update `src/data/projects.ts` — replace each project's `coverImage.src` with the new path. (Alt text already exists per project.)

---

## P1 — case-study photo collages on the homepage (6 images)

`src/components/sections/case-studies.tsx` lines 9–22 expect these exact paths. They're referenced but the files don't exist, so on the homepage the case-study side-by-side image cards are broken right now.

| # | Save as | Caption / role |
|---|---|---|
| 6 | `public/images/projects/inara/product-ui-1.jpg` | Inara UI screen — device pairing, dashboard, or app frame |
| 7 | `public/images/projects/inara/product-ui-2.jpg` | Inara secondary — hardware photo, clinic shot |
| 8 | `public/images/projects/lds/dashboard-1.jpg` | LDS dashboard screenshot — sanitized, no PII |
| 9 | `public/images/projects/lds/migration-architecture.jpg` | LDS architecture diagram or whiteboard |
| 10 | `public/images/projects/nursa/test-builder-1.jpg` | Nursa test-builder UI screenshot |
| 11 | `public/images/projects/nursa/data-schema.jpg` | Nursa schema / ML pipeline visual |

**Code change after upload:** none — paths already wired.

---

## P2 — editorial photo breaks on `/` and `/projects` (3 images)

The home page has two photo breaks between sections; `/projects` has one between the third and fourth project. Today they all point at the labeled SVG placeholders.

| # | Save as | Where | Aspect |
|---|---|---|---|
| 12 | `public/images/breaks/home-break-1.jpg` | home page, between Case Studies and About | 21:9 wide |
| 13 | `public/images/breaks/home-break-2.jpg` | home page, between Current Focus and Writing | 21:9 wide |
| 14 | `public/images/breaks/projects-break.jpg` | `/projects`, midway through the list | 21:9 wide |

Suggested character: landscape or environmental — they're palate-cleansers, not subjects. Don't pick portraits here.

**Code change after upload:**
- `src/app/(main)/page.tsx` — change the two `<PhotoBreak src=... />` paths
- `src/components/sections/projects-grid.tsx` — change the inner `<Image src=... />` near `midpoint - 1`

---

## P3 — about-section editorial portrait (1 image)

`src/components/sections/about.tsx:86` currently uses an Unsplash stock photo. It should be Philip — or a workspace shot — not a stranger.

| # | Save as | Aspect | Note |
|---|---|---|---|
| 15 | `public/images/about/portrait.jpg` | 4:5 (vertical, 1600×2000) | Editorial portrait or workspace still — the column is sticky and tall, so a vertical frame reads best |

**Code change after upload:** replace the Unsplash URL with `/images/about/portrait.jpg`. Also fine to remove the `images.unsplash.com` entry from `next.config.ts` once nothing else needs it.

---

## P4 — Open Graph / social share card (1 image)

`src/data/site-config.ts` advertises `ogImage: "/og-image.png"` but the file doesn't exist (only the dynamic `/og` route does). Social previews currently fall back unpredictably.

| # | Save as | Aspect | Note |
|---|---|---|---|
| 16 | `public/og-image.png` | 1200×630 | A static cover for LinkedIn / Twitter / iMessage previews. Could be a strong photo with the site title set in Playfair Display |

(Optional: instead of a PNG, point `siteConfig.ogImage` at the dynamic `/og` route and skip this one — but a static PNG is more reliable.)

---

## P5 — photography gallery (nice-to-have)

The `/photography` flow still uses SVG placeholders (`couples-session-*.svg`, `event-*.svg`, `portrait-session-*.svg`, `landscape-*.svg`). These aren't on the main editorial spine, but if real couples / event / portrait galleries exist, dropping them in at the same paths will quietly upgrade the whole photography sub-site without code changes.

---

## Quick sweep summary

| Priority | Count | Where they show |
|---|---|---|
| P0 covers | 5 | every project card + every detail page |
| P1 case studies | 6 | homepage Case Studies section |
| P2 photo breaks | 3 | homepage + /projects rhythm |
| P3 about | 1 | homepage About section |
| P4 OG | 1 | every social share |
| **Total essential** | **16** | |
| P5 photography | 9 | `/photography/*` only |

Sixteen real images and the placeholder feeling disappears.
