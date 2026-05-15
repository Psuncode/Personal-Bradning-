# Personal Website — Functional Redesign + Polish Design

Date: 2026-05-14
Status: Approved in conversation, pending written-spec review
Scope: Main-site IA + inner-page parity + polish. Sub-brands (photography, ecommerce) out of scope.

## Objective

Take the main personal site from "polished homepage, inconsistent everywhere else" to "every page has a single primary path: convince a visitor that Philip Sun is worth contacting, then make that contact frictionless." Lift inner pages to editorial parity with the homepage and close the loose ends (copy, mobile, a11y, repo).

## Spine and Primary Action

The spine is **"reach out via email or LinkedIn."** Not booking a meeting, not reading deeper, not memorability — direct contact is the conversion. Every design decision in this spec follows from that choice.

## Success Criteria

1. A visitor landing on any page can reach Philip's email or LinkedIn in ≤ 1 scroll, without opening the nav menu.
2. Every inner page uses the editorial design tokens (`--color-ink`, `--color-rule`, `--color-accent`, `--color-cream`, Playfair headings, kicker pattern). No remaining BYU‑navy or generic blue.
3. Lighthouse mobile a11y ≥ 95 on `/`, `/projects`, `/projects/[slug]`, `/blog`, `/blog/[slug]`, `/resume`, `/meet`, `/contact`.
4. Lighthouse mobile perf ≥ 90 on `/`, `/projects`, `/blog`.
5. `.planning/` directory removed from the repo.
6. The page rhythm reads like one site, not a homepage plus six different inner pages.
7. `npm run build && npm run lint && npm run test` are clean at merge time.

## Non-Goals

- No restructuring of the main nav or the Ventures dropdown — that was just stabilized.
- No redesign of `(photography)` or `(ecommerce)` route groups. Queued for a separate spec.
- No refactor of large section components (`case-studies.tsx`, `current-focus.tsx`, `content-grid.tsx`, `hero.tsx`, `about.tsx`, `faq.tsx`) for refactoring's sake — only touched where this spec's work requires.
- No cutting of destinations. `/resume`, `/blog`, project detail pages stay.
- No new features.
- No new design tokens.

## Audience and Brand Positioning

Same as the editorial-refresh spec (2026-04-20):

- Primary audience: recruiters, founders, investors.
- Brand impression: editorial, refined, selective, high-judgment.
- Core memory: taste and clarity.

This spec inherits that positioning and adds the conversion target: **direct outreach via email or LinkedIn**.

## Design Principles

**P1 — Contact in ≤ 1 scroll, on every page.**
Today only the footer holds contact, which is 4+ scrolls on most inner pages. A slim, persistent top strip carries email and LinkedIn site-wide.

**P2 — Every page ends on the same contact moment.**
The footer is the canonical tail. It keeps its `#0a0a0a` black palette as a deliberate contrast finale but gets tightened typography and spacing.

**P3 — Each inner page has one job.**
No "five sections that could've been one." The job and the tail CTA are defined per page in the IA table below.

## Information Architecture

The nav and route structure stay as they are today. What changes is what each page is *for* and where contact lives.

| Page | Job (one sentence) | Above-the-fold spine | Tail CTA |
|---|---|---|---|
| `/` | Convince a recruiter/founder Philip is worth a 15-min intro. | Editorial hero (kept as-is). Top strip provides persistent email + LinkedIn. | Tightened black footer with email + LinkedIn primary, `/meet` secondary. |
| `/projects` | Quick scan of all case studies. | `<EditorialPageHeader>` (kicker, title, sub-line). Grid below. | Tightened black footer. |
| `/projects/[slug]` | One case study deep-read — problem, solution, results, lessons. | `<EditorialPageHeader>` with title, kicker, metric row. | `<TailCTA variant="case-study">`: "Want to talk about [topic]? → email" + prev/next case study. Footer follows. |
| `/blog` | Index of writing, scannable. | `<EditorialPageHeader>` + tag chips. | Tightened black footer. |
| `/blog/[slug]` | Read one post. | Title, date, reading time, editorial rule. | `<TailCTA variant="blog">`: "Reach out about this post" mailto with prefilled subject + 2 related posts (same tag). Footer follows. |
| `/resume` | Long-form CV for people who want it. | `<EditorialPageHeader>`. "Download PDF / View on LinkedIn" buttons surfaced early in the page body. | Footer. |
| `/meet` | Book a 15-min call. | Cal.com embed + one paragraph framing. | Footer. |
| `/contact` | Form fallback for people who don't email directly. | `<EditorialPageHeader>` + form. | Footer. |

## Components

### New components

**`<TopStrip>`** — slim row above `<Navbar>`. Renders editorial ink on cream, ~36 px tall, no shadow.
- Copy: "Open to PM roles in healthcare & high-growth · [Email](mailto:) · [LinkedIn]"
- Behavior: auto-hides on scroll down past ~80 px, reappears on scroll up. Implemented via a `useScrollDirection` hook and a CSS transform. No JS animation library required.
- Accessibility: links keyboard-reachable, focus-visible style preserved, hidden state uses `aria-hidden` so screen readers skip it cleanly.

**`<TailCTA variant="case-study" | "blog" | "default">`** — single component, three variants. Placed between page content and `<Footer>`.
- `case-study`: "Want to talk about [topic derived from project]? → mailto:" plus prev/next case study links. Mailto includes `?subject=` prefilled with the project title.
- `blog`: "Reach out about this post" mailto with `?subject=` prefilled with the post title, plus up to 2 related posts (same tag, excluding current).
- `default`: renders nothing. Used on `/`, `/projects`, `/blog`, `/resume`, `/meet`, `/contact` where the footer alone is the tail.

**`<EditorialPageHeader>`** — shared header for inner pages. Renders an optional kicker (uppercase tracking), a Playfair H1, an optional sub-line, and the editorial rule below.
- Replaces five one-off page intros across `resume-view`, `projects-grid`, `blog-list`, `project-detail-view`, `blog-post-view`.
- No internal state. Pure presentational.

### Refined components

**`<Footer>`** — keep `#0a0a0a` background as a deliberate contrast finale.
- Drop the "View Resume" button (redundant with nav).
- Tighten typography hierarchy (Playfair headline, tightened paragraph leading, smaller secondary link cluster).
- Audit and fix mobile stacking.
- Email and LinkedIn remain prominent; `/meet` and GitHub remain as secondary affordances.

**`<Navbar>`** — no structural change. Adjust top spacing to sit cleanly below `<TopStrip>` when the strip is visible.

### Inner-page parity work

| File | Lines (current) | Changes |
|---|---|---|
| `src/components/sections/resume-view.tsx` | 153 | Apply editorial tokens; replace any BYU-navy or generic-blue classes; insert `<EditorialPageHeader>`; surface "Download PDF / LinkedIn" buttons early in the body. |
| `src/components/sections/project-detail-view.tsx` | 179 | Editorial tokens; replace existing header with `<EditorialPageHeader>`; append `<TailCTA variant="case-study">` at end of content. |
| `src/components/sections/blog-list.tsx` | 121 | Editorial tokens; `<EditorialPageHeader>`; reskin tag chips in the editorial pattern. |
| `src/components/sections/blog-post-view.tsx` | 120 | Editorial tokens for prose styles; append `<TailCTA variant="blog">`. |
| `src/components/sections/contact-section.tsx` | 210 | Editorial tokens; form input styles matching cream/ink palette; `<EditorialPageHeader>`. |
| `src/components/sections/projects-grid.tsx` | 85 | Likely already conforming; verify during execution and adjust only if needed. |

### Files explicitly *not* touched

`case-studies.tsx`, `current-focus.tsx`, `content-grid.tsx`, `hero.tsx`, `about.tsx`, `faq.tsx` — unless polish or copy work intersects them.

## Data Flow

- `<TailCTA variant="case-study">` takes the current `Project` (already passed to `project-detail-view`) and derives the prev/next via the order in `src/data/projects.ts`. The "topic" string is sourced from `project.techStack[0]` or `project.title` — chosen during implementation.
- `<TailCTA variant="blog">` takes the current `BlogPost` plus the result of `getAllPosts()` and filters by overlapping tags. Two-post cap; ordered by date desc.
- `<TopStrip>` is fully static. No props beyond copy constants. Email and LinkedIn URLs read from `siteConfig`.
- `<EditorialPageHeader>` is a pure component: `kicker?`, `title`, `sub?`. No data dependencies.

## Polish, Copy, A11y, Perf, Repo Cleanup

This is a sweep, not a redesign surface. The bar is defined here; the per-fix list is generated during execution.

**Copy audit.**
- Read every visible string on the 8 main-route pages. Flag and fix anything template-y, weak, or duplicative.
- Known weak surfaces:
  - Footer headline ("Let's work together") + paragraph mentioning "photography sessions and B2B product inquiries" — contradicts the executive-first framing of the editorial refresh. Tighten.
  - `siteConfig.title` is `"Philip Sun | PM · Founder · Photographer"`. Re-evaluate whether "Photographer" belongs in the title given executive-first positioning.

**Mobile + accessibility.**
- Visual check at 375 / 768 / 1024 / 1440 px on every main-route page.
- Run axe and Lighthouse accessibility on each page. Target ≥ 95.
- Fix any anchor lacking `:focus-visible`, any image missing `alt`, any external link missing `rel="noopener noreferrer"`, any color combination failing 4.5:1, any tap target smaller than 44 × 44 px.
- Verify the mobile nav sheet and Ventures dropdown work cleanly after `<TopStrip>` is added.

**Performance.**
- All `<img>` → `<Image>` with explicit `width`, `height`, and `sizes`.
- Confirm Playfair Display uses `font-display: swap` (already configured via `next/font`).
- Lighthouse mobile perf ≥ 90 on `/`, `/projects`, `/blog`.

**Repo cleanup.**
- Commit the already-staged `.planning/*` deletions as a single chore commit (`chore: remove abandoned planning scaffolding`).
- Delete the staged-deleted `.claude/CONTENT_TEMPLATE.md`.
- Audit `docs/` outside of `docs/superpowers/specs/`. For each of `AUDIT_REPORT.md`, `AUDIT_QUICK_REFERENCE.md`, `VITEST_SETUP_SUMMARY.md`, `audits/`, `operations/`: keep with explicit intent or remove.

## Testing

**New component tests (Vitest + React Testing Library).**
- `TopStrip`: renders email + LinkedIn links; hides on scroll-down past threshold; reappears on scroll-up; `aria-hidden` flips appropriately.
- `TailCTA`: `case-study` variant renders prev/next + mailto with prefilled subject; `blog` variant renders related posts + mailto; `default` variant renders nothing.
- `EditorialPageHeader`: renders kicker / title / sub-line / rule when each is provided; omits cleanly when not.

**Existing tests stay green.** `hero.test.tsx`, `about.test.tsx`, `case-studies.test.tsx`, `current-focus.test.tsx`, `contact-section.test.tsx`, `projects-grid.test.tsx`, `section-heading.test.tsx`, `project-card.test.tsx`, and the `src/app/__tests__/` page tests. Any failure caused by inner-page parity work is fixed in the same commit that introduces the change.

**Manual verification before merge.**
- 8 pages × 4 viewports — screenshot each.
- Lighthouse mobile numbers (a11y + perf) captured and pasted into the PR description.
- Real-device check of `<TopStrip>` scroll behavior on a phone, not just the emulator.
- Keyboard tab through home and one inner page — focus rings visible, focus order sensible.
- `npm run build && npm run lint && npm run test` clean.

## Rollout

- Single feature branch off `main`.
- Sequence of small commits aligned with this spec's sections — one commit per shipped unit, not per file.
- One PR opened when the full scope is done. No partial merges; this is a coherence change, and shipping half breaks the spine.
- No feature flag. The work is fully reversible via revert. No DB migration, no auth gate, no external API surface change.

## Definition of Done

1. All seven success criteria from this spec are met.
2. `<TopStrip>` + tightened `<Footer>` + `<TailCTA>` + `<EditorialPageHeader>` shipped.
3. The five inner-page section files listed in §Components lifted to editorial parity.
4. Polish, a11y, and perf bars met on all 8 main-route pages.
5. `.planning/` removed; `npm run build && npm run lint && npm run test` green.
6. PR description includes Lighthouse numbers and per-viewport screenshots.

## Out of Scope (Queued for Separate Specs)

- Visual unification of `(photography)` and `(ecommerce)` sub-brands.
- Refactor of large section components beyond what this spec's work requires.
- Any new pages or features.
- Restructuring nav or Ventures dropdown.
- Cutting destinations (`/resume`, `/blog`, project detail pages).
