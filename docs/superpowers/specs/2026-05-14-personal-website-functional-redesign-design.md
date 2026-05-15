# Personal Website — Portfolio Beautification + IA Redesign

Date: 2026-05-14
Status: Approved in conversation, pending written-spec review
Scope: Main-site information architecture, inner-page lift to a magazine-editorial system, image + typography + texture + layout beautification, and polish. Sub-brands (photography, ecommerce) out of scope.

## Objective

Reshape the main personal site into a portfolio showcase that is image-forward, slow, and visibly crafted — a quiet magazine, not a sales funnel. Visitors arrive, the work breathes, the typography signals care, and contact exists without being pitched.

## Spine and Primary Stance

The spine is **"let the work be the experience."** The previous direction (route every visitor toward email/LinkedIn outreach) is explicitly rejected. The site is a portfolio artifact optimized for memorability and craft. Contact remains reachable, but never the framing of any page.

## Success Criteria

1. The work is the first thing a visitor sees on any project or post page — image-forward, breathing room above and around.
2. No sales CTA appears on any page. No "let's work together," "open to roles," or "book a call" language outside the `/meet` page body itself.
3. Every remaining inner page uses the editorial design tokens (`--color-ink`, `--color-rule`, `--color-accent`, `--color-cream`, Playfair). No BYU-navy or generic blue remains anywhere in the `(main)` route group.
4. `/resume` is fully removed (page, section component, data file, nav link, JSON-LD references, related tests).
5. Every project detail page opens with a full-bleed cover image and uses an asymmetric editorial layout for the body.
6. Custom typography moments are visible and consistent: drop caps on blog posts, hung punctuation on display headings, oldstyle figures in body copy where the font supports it, refined heading scale.
7. A subtle grain/paper texture sits on cream surfaces. Custom editorial ornaments (numerals, rules, dingbats) carry section transitions.
8. Native view-transitions are wired up for in-site navigation; navigation feels continuous, not disjointed.
9. Lighthouse mobile a11y ≥ 95 on `/`, `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/meet`, `/contact`.
10. Lighthouse mobile perf ≥ 90 on `/`, `/projects`, `/blog` (the texture and motion must not regress this).
11. `.planning/` directory removed from the repo.
12. `npm run build && npm run lint && npm run test` are clean at merge time.

## Non-Goals

- No structural change to the main nav or the Ventures dropdown.
- No redesign of `(photography)` or `(ecommerce)` route groups. Queued for a separate spec.
- No refactor of large section files (`case-studies.tsx`, `current-focus.tsx`, `content-grid.tsx`, `hero.tsx`, `about.tsx`, `faq.tsx`) for refactoring's sake — only touched where this spec requires.
- No new features (no payments, no booking flow changes, no admin work).
- No new design tokens beyond what the existing token set already exposes. The grain texture is a single asset, not a token.
- No custom cursor, no page-transition animation library, no parallax scrolling. Motion remains restrained.

## Audience and Stance

Inherits the editorial-refresh positioning (2026-04-20):

- Primary audience: recruiters, founders, investors — and any visitor who cares to look.
- Brand impression: editorial, refined, selective, made-with-care.
- Core memory: taste and clarity.

Adds a new constraint specific to this spec: the site should feel **like a printed magazine an art director made**, not like a SaaS landing page or a personal-website template.

## Design Principles

**P1 — The work is bigger than the words around it.**
Project covers are full-bleed. Photographs get room. Indexes use generous lockups, not dense card grids.

**P2 — Quiet over loud.**
No sales chrome. No persistent CTAs. The footer becomes a signature, not a closing pitch.

**P3 — Visibly crafted.**
Texture, custom ornaments, drop caps, refined typography, view-transitions. The site should look made — readers should notice details on a second visit.

**P4 — Restraint is the discipline.**
Each beautification move has a defined scope. Texture is subtle, motion fires once per scroll, typography moments use system features (not 20 KB of JS). Lighthouse perf bar (≥ 90 mobile on top pages) anchors restraint.

**P5 — Inner pages are part of the same magazine.**
Every remaining inner page uses `<EditorialPageHeader>`, editorial tokens, the texture layer, the typography moments. No page reads template-y.

## Information Architecture

The route structure changes in exactly two ways: `/resume` is removed, and the Resume nav link is removed. Everything else stays.

| Page | Job (one sentence) | Above the fold | Tail |
|---|---|---|---|
| `/` | First impression: taste, clarity, a hint of the work. | Editorial hero (kept) with texture layer added; section spacing widened. | Signature footer. |
| `/projects` | A magazine table-of-contents for the work. | `<EditorialPageHeader>`. Asymmetric lockup sequence: each project rendered as a numbered editorial entry (01 / 02 / 03), alternating wide-left and wide-right. | Signature footer. |
| `/projects/[slug]` | A long-form gallery essay for one project. | Full-bleed cover image, project title in Playfair over (or beside) the image, kicker numeral. | Quiet "Next / Previous" project link pair. Then signature footer. |
| `/blog` | A magazine index of writing. | `<EditorialPageHeader>` + tag chips. Asymmetric lockup sequence for posts. | Signature footer. |
| `/blog/[slug]` | One essay, calmly. | Title, date, reading time, kicker numeral, drop cap on the body. | "Related" — two posts with the same tag, no mailto. Then signature footer. |
| `/meet` | Book a 15-minute call (escape hatch for people who actually want one). | Cal.com embed + one paragraph framing. | Signature footer. |
| `/contact` | Form fallback for messages. | `<EditorialPageHeader>` + form (editorial styled inputs). | Signature footer. |

**Nav (final).** Projects · Writing · Meet · Contact · Ventures (dropdown unchanged).

## Visual System Additions

### Imagery upgrade

**Project cover images.**
- Every project in `src/data/projects.ts` gains a `coverImage` field: `{ src: string; alt: string; focalPoint?: 'center' | 'top' | 'bottom' }`. Type updated in `src/types/index.ts`.
- For projects without literal mockups (Inara, LDS, Nursa, Granger, Cocker), the cover is selected from existing photography (`src/data/photography.ts`) chosen for tonal fit, or a sourced editorial image. Specific image selection happens during execution, not in this spec.
- Cover renders full-bleed at the top of `/projects/[slug]`. Title typesets over the image with a backdrop scrim if needed for legibility, or sits beside it in an asymmetric two-column header. Layout choice made per project during execution.

**Photography cross-pollination.**
- Selected photos from `src/data/photography.ts` (likely the landscape category, to avoid mixing personal portraits into a business context) appear as section transitions on the homepage and as decorative breaks on `/projects` and `/blog` index pages. Two to four images total across the main site.
- This pulls the photographer identity into the main site as a visual signature without merging the photography sub-brand.

### Custom typography moments

- **Drop caps** on the first paragraph of blog post bodies. CSS `::first-letter` on the body prose; sized ~4.5× the body line-height, Playfair, deliberate baseline alignment.
- **Hung punctuation** on display headings via `hanging-punctuation: first last;`. Falls back to nothing in unsupported browsers (Firefox); not a load-bearing dependency.
- **Oldstyle figures** in body copy where the loaded font supports them. Configure via `font-variant-numeric: oldstyle-nums;`. Verify support for the chosen Playfair/Inter weights; if unsupported, accept the lining default — no replacement font.
- **Refined heading scale.** Audit the existing Playfair scale across `<h1>` / `<h2>` / `<h3>`. If the steps are template-feeling (1.5×, 2×, 3× ratios), tune to a modular scale (e.g., 1.333 or perfect fourth). One pass, not a rewrite.

### Paper / grain texture + editorial ornaments

- **Grain layer.** A single 200×200 SVG noise asset, tiled, mixed at ~3–6% opacity over cream surfaces. Implemented as a fixed `<div>` with `pointer-events: none;` and `mix-blend-mode: multiply;`. One layer site-wide; CSS-only, no JS.
- **Editorial numerals.** Each section on `/projects` and `/blog` index is preceded by a kicker numeral in Playfair (01 / 02 / 03), styled as a hanging marker.
- **Editorial rules.** Existing `editorial-rule` class stays. Add an ornamental rule variant for major page breaks (e.g., a thin rule with a centered dingbat — `·`, `§`, or a small SVG mark — picked once and reused).

### Asymmetric layouts + view-transitions

- **`/projects` index.** Asymmetric vertical sequence. Odd-numbered entries lean wide-left; even-numbered entries lean wide-right. Each entry: numeral, cover image (smaller than the detail-page version), Playfair title, single-line description, link.
- **`/blog` index.** Same asymmetric pattern. First post may render as a feature lockup (full width or near-full), subsequent posts in the alternating offset rhythm.
- **`/projects/[slug]` body.** Asymmetric two-column rhythm — narrative copy in one column (~7/12), pull quotes or metric callouts in the other (~5/12), shifting per section. The "Lessons Learned" paragraph becomes a pull-quote moment in display Playfair.
- **View transitions.** Implemented via the `view-transition-name` CSS property and the View Transitions API. Wraps Next.js navigation between `/projects` ↔ `/projects/[slug]` and `/blog` ↔ `/blog/[slug]`. Project cover image and post title get matching `view-transition-name` on both surfaces to morph between them. Browsers without support get the default instant nav — explicit fallback path.

## Components

### New components

**`<EditorialPageHeader>`** — shared header used by every inner page except `/projects/[slug]` (which has its own cover-image header).
- Props: `kicker?`, `title`, `sub?`, `numeral?`.
- Renders kicker uppercase tracking, Playfair display title, optional sub-line, editorial rule, optional kicker numeral.
- Pure presentation, no internal state.

**`<ProjectCover>`** — full-bleed cover used at the top of `/projects/[slug]`.
- Props: `project` (full `Project` object including `coverImage`).
- Renders the cover image with the project title and kicker numeral, applies `view-transition-name` for morph from `/projects` index.

**`<GrainOverlay>`** — site-wide fixed grain texture layer.
- No props. Rendered once in `src/app/(main)/layout.tsx`.
- Implements the fixed `<div>` with the SVG background, low opacity, mix-blend.

**`<EditorialEntry>`** — used by `/projects` and `/blog` index pages.
- Props: `index`, `title`, `cover?`, `kicker?`, `description`, `href`.
- Renders the asymmetric lockup; CSS chooses orientation based on `index` parity.

**`<RelatedPosts>`** — quieter replacement for the previously-planned `<TailCTA>` on blog posts.
- Props: `currentSlug`, `allPosts`.
- Renders up to 2 posts that share a tag with the current post, ordered by date desc.
- Visual: small kicker "Related," two minimal lockups. No mailto, no CTA copy.

**`<ProjectNavLinks>`** — quieter version of case-study TailCTA, with no email language.
- Props: `current`, `all`.
- Renders Prev / Next project name and number. Plain text links, editorial styling, no calls to action.

### Refined components

**`<Footer>`** — black `#0a0a0a` palette kept as a deliberate gallery finale. Content reframed as **signature/colophon**:
- Name and one line of context (e.g., "Portfolio · 2025").
- Email (single line, no `mailto:` headline phrasing like "Let's work together").
- LinkedIn · GitHub on a single line.
- Small "Colophon" line: built with Next.js / Tailwind, photography by Philip.
- Drop the "Book a Call" and "View Resume" buttons entirely.
- Drop the "Open to PM roles in healthcare tech and high-growth companies..." paragraph.

**`<Navbar>`** — no structural change. The Resume link is removed. Contact remains as a small link.

### Inner-page parity work

| File | Current lines | Changes |
|---|---|---|
| `src/components/sections/projects-grid.tsx` | 85 | Replace card grid with `<EditorialEntry>` sequence; pass `coverImage` from data. |
| `src/components/sections/project-detail-view.tsx` | 179 | Replace existing header with `<ProjectCover>`; convert body to asymmetric two-column rhythm; lift "Lessons Learned" into a pull-quote; append `<ProjectNavLinks>`. |
| `src/components/sections/blog-list.tsx` | 121 | Replace card grid with `<EditorialEntry>` sequence; add `<EditorialPageHeader>`; editorial tag chips. |
| `src/components/sections/blog-post-view.tsx` | 120 | Editorial token pass on prose; drop cap on first paragraph; append `<RelatedPosts>`. |
| `src/components/sections/contact-section.tsx` | 210 | Editorial tokens; cream/ink input styles; `<EditorialPageHeader>`. |

### Files removed

- `src/app/(main)/resume/page.tsx`
- `src/components/sections/resume-view.tsx`
- `src/data/resume.ts`
- Any tests referencing the above.
- Resume link removed from `src/components/layout/navbar.tsx` (`navLinks` array).
- Resume-related entries removed from `src/app/(main)/layout.tsx` JSON-LD (currently imports `roles, education` from `@/data/resume`).

### Files explicitly *not* touched

`case-studies.tsx`, `current-focus.tsx`, `content-grid.tsx`, `hero.tsx`, `about.tsx`, `faq.tsx` — unless polish or copy work intersects them. The grain overlay and view-transitions affect them visually but not their source code.

## Data Flow

- `Project` type in `src/types/index.ts` gains `coverImage: { src: string; alt: string; focalPoint?: 'center' | 'top' | 'bottom' }`. Every project in `src/data/projects.ts` updated with a value.
- `<ProjectCover>` reads `project.coverImage`. `<EditorialEntry>` on `/projects` reads `project.coverImage` with a smaller render.
- `<RelatedPosts>` takes the current `BlogPost` plus `getAllPosts()`, filters by overlapping tags, returns up to 2 ordered by date desc.
- `<ProjectNavLinks>` derives prev/next via the order in `src/data/projects.ts`.
- `<GrainOverlay>` is fully static — no props, no data.
- `<EditorialEntry>` and `<EditorialPageHeader>` are pure components.

## Polish, Copy, Accessibility, Performance, Repo

This is a sweep alongside the redesign work, not a separate phase. The bar is defined; per-fix list is generated during execution.

**Copy.**
- Read every visible string on the 7 main-route pages. Flag and rewrite anything template-y, weak, sales-y, or duplicative.
- Footer copy fully rewritten per the signature/colophon spec above.
- `siteConfig.title` updated from `"Philip Sun | PM · Founder · Photographer"` to `"Philip Sun — Selected Work"` (or a close variant). No role-stacking.
- `siteConfig.description` audited and tightened in the same pass.

**Accessibility.**
- Visual + screen-reader check at 375 / 768 / 1024 / 1440 px on every main-route page.
- Run axe and Lighthouse accessibility on each page. Target ≥ 95.
- Fix any anchor missing `:focus-visible`, image missing `alt`, external link missing `rel="noopener noreferrer"`, color combination failing 4.5:1, tap target < 44 × 44 px.
- Grain overlay must not be focusable or hit-tested (`pointer-events: none;` + `aria-hidden="true"`).
- Drop cap must remain selectable and screen-reader-readable as part of the paragraph (no `::before` hack that fragments the word).
- View transitions respect `prefers-reduced-motion: reduce;` — fall back to instant nav.

**Performance.**
- All `<img>` → `<Image>` with explicit `width`, `height`, `sizes`.
- Cover images served at appropriately sized variants (Next/Image handles).
- Grain SVG must be small (< 5 KB), cached, and used as a CSS background, not an `<img>`.
- Verify `font-display: swap` on Playfair (already configured via `next/font`).
- Lighthouse mobile perf ≥ 90 on `/`, `/projects`, `/blog`. Capture and paste numbers into the PR.

**Repo.**
- Commit the staged `.planning/*` deletions as a single chore commit.
- Delete the staged-deleted `.claude/CONTENT_TEMPLATE.md`.
- Audit `docs/` outside of `docs/superpowers/specs/` (e.g., `AUDIT_REPORT.md`, `AUDIT_QUICK_REFERENCE.md`, `VITEST_SETUP_SUMMARY.md`, `audits/`, `operations/`). For each, keep with explicit intent or remove.

## Testing

**New component tests (Vitest + React Testing Library).**
- `EditorialPageHeader`: renders kicker / title / sub-line / numeral / rule when each is provided; omits cleanly when not.
- `ProjectCover`: renders cover image with correct alt; applies `view-transition-name` attribute.
- `GrainOverlay`: renders fixed div with `aria-hidden` and `pointer-events: none` style.
- `EditorialEntry`: orientation alternates by `index` parity; renders cover when provided; omits gracefully when not.
- `RelatedPosts`: returns up to 2 posts sharing at least one tag with the current post; returns empty render when no matches exist.
- `ProjectNavLinks`: renders prev and next based on ordering in data; handles first and last project edges (wraps or omits — choice recorded during implementation).

**Existing tests.** Most stay green. Tests that touch `resume-view`, the `/resume` route, or the resume nav link are deleted as part of removal. Section-level tests that touch `projects-grid`, `project-card`, `blog-list`, `blog-post-view`, `contact-section`, `hero`, `about`, `current-focus`, `case-studies`, `section-heading` are updated or replaced where the inner-page parity work requires.

**Manual verification before merge.**
- 7 pages × 4 viewports — screenshot each.
- Lighthouse mobile (a11y + perf) per page, numbers captured in the PR.
- Real-device check: scroll motion is gentle, view transitions feel right (or are correctly absent in unsupported browsers / reduced-motion).
- Keyboard tab through home and one project detail page — focus order sensible, focus rings visible, drop cap doesn't break selection.
- `npm run build && npm run lint && npm run test` clean.

## Rollout

- Single feature branch off `main`.
- Sequence of small commits aligned with this spec's sections — one commit per shipped unit, not per file. Suggested order: repo cleanup → token + grain layer → `EditorialPageHeader` → `/resume` removal → projects index + cover field + `EditorialEntry` → project detail + `ProjectCover` + asymmetric body → blog index + posts + drop cap + `RelatedPosts` → contact + footer + nav + typography polish → view-transitions → final QA pass.
- One PR opened when the full scope is done. No partial merges; this is a coherence change.
- No feature flag. Fully reversible via revert. No external API change, no auth gate.

## Definition of Done

1. All twelve success criteria from this spec met.
2. `<EditorialPageHeader>`, `<ProjectCover>`, `<GrainOverlay>`, `<EditorialEntry>`, `<RelatedPosts>`, `<ProjectNavLinks>` shipped.
3. The five inner-page section files in §Components updated.
4. `/resume`, `resume-view.tsx`, `resume.ts`, the Resume nav link, and resume-related JSON-LD all removed.
5. Grain texture, view-transitions, drop caps, hung punctuation, oldstyle figures visible site-wide.
6. Asymmetric lockup pattern present on `/projects` and `/blog` indexes; asymmetric body present on `/projects/[slug]`.
7. Footer is signature-style; nav has 5 items; no sales CTAs anywhere.
8. Accessibility, performance, copy, repo bars met.
9. PR description includes Lighthouse numbers and per-viewport screenshots.

## Out of Scope (Queued for Separate Specs)

- Visual unification of `(photography)` and `(ecommerce)` sub-brands with the main site's new visual system.
- Refactor of large section components beyond what this spec requires.
- Any new pages or features.
- Restructuring the nav or Ventures dropdown.
- Cutting `/blog`, `/projects`, project detail pages.
- Adding new design tokens.
