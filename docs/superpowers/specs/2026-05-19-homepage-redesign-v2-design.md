# Homepage Redesign v2 (Portfolio of Active Projects)

**Date:** 2026-05-19
**Branch:** off `main` @ `bd740b1`
**Brainstorm transcript:** user's "Plan v2 + Design Principles 2026" message, this date
**Sequel to:** Wave 7a (payment/contact/email hardening) — already merged

## Mission

Recast the homepage from "resume showcase" to **portfolio of active projects.** Visitor lands and immediately understands what Philip is building right now (Inara as marquee, Tools as supporting evidence, Photography + Freely Sweet as adjacent). Past employment exists at `/projects/<slug>` for recruiters but isn't featured on the homepage.

## Locked decisions (from brainstorm)

| Choice | Decision |
|---|---|
| Homepage intent | Portfolio of active projects |
| Hierarchy | One headline (Inara) + tools shelf below |
| Past employment | Stays at `/projects/<slug>`, removed from homepage |
| Hero treatment | **Type-only, ~85vh, no photo**, single text-link CTA |
| Hero CTA | "See Inara →" (not "Book a Call") |
| Drop from hero | "Current Positioning" card |
| Drop from homepage | `<ContentGrid>`, `<CurrentFocus>` (whole sections) |
| Headline project image | Real placeholder (typographic plate) — **NOT** the Utah night-sky |
| Utah night-sky photo | Goes to `/photography` hero, full-bleed 90vh, no overlay text |
| Grid | "Tools" — RVU Calculator + Stock Scanner (2-up). Both fully live. |
| Photography + Freely Sweet | Move to "Elsewhere" one-line strip |
| Selected Writing | Promoted to designed section (2-3 posts, big title + dek, no thumbnails) |
| Footer | Real 4-col sitemap (Work / Writing / Elsewhere / Contact) |
| New page | `/work-history` lists past employment |
| `featured` field in projects.ts | Remove (vestigial). Tools list lives in new `src/data/featured-projects.ts` |
| Display serif | **Keep Playfair Display** (no font swap) |
| Accent color | **Pragmatic** — kept for interaction states only (focus rings + hover-link). Never decorative, never on eyebrows |
| Color tokens | **Swap to** `--color-paper: #f3efe6` / `--color-ink: #1a1612` / `--color-ink-soft: #7a6f60` / `--color-rule: #d9d0bd`. Accent unchanged (`#5f2f2a`) |
| Inara metrics | Outcome-type placeholders labeled "↳ outcome metric forthcoming" per design principle #9 (honest placeholders) |
| Photography nav | Footer link + quiet top-nav item |

## Homepage section sequence (after build)

1. **Hero** — type-only, ~85vh. H1 (Playfair ~96px on desktop) + sub-copy + "See Inara →" text link. No image, no card.
2. **Headline: Inara** — full-width editorial block. Typographic-plate cover image OR neutral isometric render (TBD per asset availability). 2-3 sentences of context. 2 outcome metrics inline ("forthcoming" labeled). "Read the case study →" link.
3. **Selected Writing** — small-caps eyebrow. 2-3 posts each as a row: big Playfair title, date · read-time muted, 1-line dek. "All writing →" footer link.
4. **Tools** — small-caps eyebrow. 2-up grid: RVU Calculator + Stock Scanner. Each card: real screenshot thumbnail + title + 1-line description + "Open →".
5. **Elsewhere** — small-caps eyebrow. Plain-text one-line strip:
   - Photography → photography.philipsun.com
   - Freely Sweet → freelysweet.com
   - GitHub → @Psuncode
   - LinkedIn → /in/philip-sun
6. **Sitemap footer** — 4 columns (WORK · WRITING · ELSEWHERE · CONTACT), small-caps headers, generous spacing.

## File changes

### New
- `src/components/sections/headline-project.tsx` — Inara block
- `src/components/sections/tools-grid.tsx` — 2-up tools
- `src/components/sections/elsewhere.tsx` — one-line strip
- `src/components/sections/selected-writing.tsx` — promoted blog section
- `src/components/layout/sitemap-footer.tsx` — replaces existing footer
- `src/data/featured-projects.ts` — curated tools list
- `src/app/(main)/work-history/page.tsx` — past employment list
- `src/app/(photography)/photography/page.tsx` — update hero to use night-sky full-bleed 90vh (file exists, just update)

### Modified
- `src/components/sections/hero.tsx` — rewrite to type-only, drop motion delays beyond minimal entrance, drop Positioning card
- `src/app/(main)/page.tsx` — new section sequence, remove ContentGrid + CurrentFocus imports
- `src/data/projects.ts` — remove `featured` field
- `src/components/layout/navbar.tsx` — add quiet "Photography" top-nav item (between Writing + Meet)
- `src/app/globals.css` — swap 4 color token hex values; ensure focus-visible outlines use `--color-accent`
- `src/data/site-config.ts` — confirm `cal` block stays; add `social: { github, linkedin }` if not present
- `CLAUDE.md` — refresh editorial design system section to reflect new principles

### Removed (deleted, not commented out)
- `src/components/sections/content-grid.tsx` (and its test)
- `src/components/sections/current-focus.tsx` (and its test)
- `src/data/current-focus.ts` (deprecated by removal of CurrentFocus section)
- `src/components/layout/footer.tsx` (replaced by sitemap-footer)

## Design principles (canonical — see brainstorm transcript for full text)

1. Type does the heavy lifting
2. Two-typeface system: Playfair (display) + Inter (body) + Geist Mono (code)
3. Cream + warm black palette; accent reserved for interaction states only
4. Whitespace IS the design (hero ~85vh, sections generous, body 50-60ch max)
5. Restraint in voice + restraint in mark
6. One button style (dark pill), reserved for nav "Book a Call" + photography contact
7. Editorial rhythm, not template rhythm
8. Hover is one subtle effect, ≤250ms
9. Honest placeholders ("↳ forthcoming"), never stock, never fake
10. One thing to read, then a quiet shelf

## Build sequencing

### Wave A — Foundation (sequential, ~30 min, single agent)
- Color token swap in globals.css
- Audit accent usage; restrict to focus rings + hover-link only
- Update CLAUDE.md design-system section to reflect new principles
- Single commit

### Wave B — New components (parallel, 4 agents)
- B1: `<Hero>` rewrite (type-only)
- B2: `<HeadlineProject>` + `<ToolsGrid>` + `src/data/featured-projects.ts`
- B3: `<SelectedWriting>` + `<Elsewhere>` + nav photography link
- B4: `<SitemapFooter>` + `/work-history` page

### Wave C — Integration (sequential, single agent)
- Rewrite `src/app/(main)/page.tsx` to new section sequence
- Remove ContentGrid + CurrentFocus imports + component files + tests
- Remove `featured` field from projects.ts + audit any remaining consumers
- Update `/photography` page hero to full-bleed Utah night-sky
- Final commit

### Wave D — Review (parallel, 3 agents) — only after C
- Visual / design review (does it match principles?)
- Test coverage (all touched files have tests; carve-outs unchanged)
- Build + push verification

## Out of scope (Wave E follow-up if user wants)

- Real Inara device render (need design asset)
- Real screenshots for Tools cards (need to capture from live URLs)
- `/work-history` design polish beyond list
- Domain split question (philipsun.com vs psunproduction.com) — deferred per brainstorm
