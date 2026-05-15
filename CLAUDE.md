# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build — runs `prebuild` first (blog asset pipeline)
npm run lint         # ESLint
npm run test         # Vitest (watch mode)
npm run test -- --run         # Vitest run-once (use this in scripts/CI)
npm run test:ui
npm run test:coverage
```

Single test file:
```bash
npx vitest run src/lib/blog.test.ts
```

## Known carve-outs (don't try to fix these)

- **TS errors in test files only:** `src/app/__tests__/{contact,meet}.test.tsx` have pre-existing `Property 'className' does not exist on type 'ChildNode'` errors. These are not in scope for current branches.
- **Pre-existing test failures (~16 tests):** `home.test.tsx`, `about.test.tsx`, `case-studies.test.tsx`, `current-focus.test.tsx` assert against old chrome that's since been refactored. Not regressions from new work — verify by stashing and re-running before claiming new breakage.
- **`/resume` route removed** during the portfolio beautification refactor (commit `8dcb863` on `feat/portfolio-beautification`). Don't reintroduce.

## Architecture

**Next.js 16 App Router** with React 19 and TypeScript 5. All pages live in `src/app/`. Routes are grouped: `(main)` for the portfolio surfaces, `(photography)` for the photography sub-site, `(ecommerce)` placeholder.

### Editorial design system (the "look")

The site is intentionally **image-forward, magazine-style**. Tokens live in `src/app/globals.css` via Tailwind 4's `@theme inline` (no `tailwind.config.ts`).

**Color tokens** — cream paper, ink text, accent rust. Always reference via CSS variables, not hex literals:
- `--color-paper` `#f4efe6` (page background)
- `--color-paper-elevated` `#fbf7f1` (cards, forms)
- `--color-ink` `#201c1a` (primary text)
- `--color-ink-soft` `#5f5851` (secondary text)
- `--color-accent` `#5f2f2a` (kickers, focus rings, links)
- `--color-rule` `#d9cfc1` (borders, dividers)

The old `byu-*` color names are deprecated — if you see them in legacy code, replace with editorial tokens when touching the file.

**Fonts:** Inter (`--font-inter`, sans default), Playfair Display (`--font-playfair`, all display/heading type), Geist Mono (`--font-mono`).

**Utility classes** (defined in `globals.css`):
- `.editorial-shell` — `max-w-6xl px-6 md:px-12` page container
- `.editorial-kicker` — uppercase tracked accent-color label
- `.editorial-display` — `hanging-punctuation: first last` for big Playfair headings
- `.editorial-prose > p:first-of-type::first-letter` — auto drop cap on blog posts
- `.editorial-asym-left` / `.editorial-asym-right` — 12-col asymmetric grid helpers
- `.editorial-card` — cream-elevated surface with rule border
- `.grain-overlay` — fixed overlay applied once at the layout level

**Component family** in `src/components/editorial/`:
- `EditorialPageHeader`, `EditorialEntry`, `ProjectCover`, `ProjectNavLinks`, `RelatedPosts`, `BlogCover`, `SeriesHeader`, `GrainOverlay`

Use `cn()` from `src/lib/utils.ts` for conditional classes.

### Data layer (static, file-based)

| File | Controls |
|---|---|
| `src/data/site-config.ts` | Site title, description, URL, social links |
| `src/data/projects.ts` | All projects (every project has a required `coverImage: { src, alt, focalPoint?, layout: "overlay"\|"beside" }`) |
| `src/data/current-focus.ts` | Homepage "What I'm working on" cards |
| `src/data/photography.ts` | Photography gallery + packages + testimonials |
| `content/blog/<slug>/index.mdx` | Folder-based blog posts (see below) |
| `content/blog/AUTHORING.md` | Authoring guide for future-self / contributors |

### Blog system v2 (folder-based, see `content/blog/AUTHORING.md`)

Every post is a folder: `content/blog/<slug>/index.mdx` + co-located `cover.{jpg,png,webp}` (auto-detected hero) + any other images referenced as `./image.png` in MDX.

**Discovery:** `src/lib/blog.ts` walks `content/blog/`. Folders containing `index.mdx` are posts; loose `.mdx` files at the root still work (legacy). Folder beats `.mdx` of the same slug.

**Frontmatter:** standard `title, date, excerpt, tags, published, featured` plus optional `series, seriesOrder` (groups posts), `coverAlt` (alt text for cover), `faq, howTo` (generate JSON-LD).

**Six MDX shortcodes** registered globally — no imports needed in MDX:
- `<Figure src="./..." caption="..." alt="..." />`
- `<FullBleed src="./..." alt="..." />`
- `<Gallery columns={3} images={[{src, alt}, ...]} />`
- `<PullQuote attribution="...">quote</PullQuote>`
- `<TwoColumn>{left}{right}</TwoColumn>`
- `<Aside>margin note</Aside>`

Implementations live under `src/components/mdx/`. Each has its own TDD test. Slug is bound per-render via `buildMdxComponents(slug)` exported from `src/components/sections/blog-post-view.tsx`.

**Asset pipeline (the `prebuild` hook):** `scripts/build-blog-assets.ts` runs before every `next build` and `next dev` start. It:
1. Mirrors every non-MDX file from `content/blog/<slug>/` into `public/_blog-assets/<slug>/`.
2. Generates LQIP blur placeholders (base64) into `public/_blog-assets/<slug>/__blur.json` via `plaiceholder`.

`public/_blog-assets/` is **gitignored** — it's a build artifact. Source images live in `content/blog/<slug>/`. The helper `src/lib/blog-assets.ts:resolveBlogAsset(slug, "./img.jpg")` rewrites paths and attaches blur data.

**Routes:**
- `/blog` index, `/blog/<slug>` post, `/blog/tag/<tag>` static-params per unique tag, `/blog/<slug>/og` per-post 1200×630 OG card (nodejs runtime — needs `getPostBySlug` filesystem access).

### Project covers + view-transitions

Every project carries a `coverImage` with `layout: "overlay"` (full-bleed 16:9 with title overlaid) or `"beside"` (4:3 image + title in adjacent column). `<ProjectCover>` and the homepage `<EditorialEntry>` share a `viewTransitionName` of `cover-<slug>` so navigation between `/projects` and `/projects/<slug>` morphs in supported browsers. Same pattern for blog: `blog-cover-<slug>`.

The pre-portfolio images are still SVG placeholders with literal text labels — `<ProjectCover>` detects SVG paths and falls back to typography plates instead of letting the placeholder text show through. See `docs/IMAGES_TO_UPLOAD.md` for the prioritized list of real images that still need to be uploaded.

### Component conventions

- `src/components/ui/` — shadcn/ui copy-paste primitives; don't modify their structure
- `src/components/sections/` — homepage / page-level sections (Hero, CaseStudies, About, CurrentFocus, etc.)
- `src/components/editorial/` — the editorial design-system family (see above)
- `src/components/mdx/` — the six blog shortcodes
- `src/components/layout/` — Navbar, Footer, Container

Animations: Framer Motion `motion.*` with `initial/animate/whileInView`. `useReducedMotion()` gates entrance animations — see `hero.tsx` for the canonical pattern.

### Calendar / meeting system

`/meet` embeds Cal.com via `@calcom/embed-react`. Custom availability logic in `src/lib/`:
- `availabilityService.ts` generates 30-min slots, 9 AM–5 PM Mountain, weekdays
- `icalendarService.ts` fetches busy times from `/api/calendar`
- `icsService.ts` generates `.ics` files
- `src/app/api/calendar/route.ts` server route calling iCloud CalDAV via `tsdav`

### SEO infrastructure

- `src/app/(main)/og/route.tsx` — main edge-runtime OG card, cream/ink editorial palette
- `src/app/(main)/blog/[slug]/og/route.tsx` — per-post OG (nodejs runtime — reads fs)
- `src/app/layout.tsx` — Person JSON-LD, OG + Twitter metadata sourced from `siteConfig`
- `src/app/(main)/blog/[slug]/page.tsx` — Article + optional FAQ/HowTo JSON-LD per post
- `src/app/(main)/projects/[slug]/page.tsx` — SoftwareApplication JSON-LD per project
- `src/app/sitemap.ts` / `robots.ts` / `feed.xml/route.ts` — auto-generated

### Testing

Vitest + React Testing Library + jsdom. Setup file: `src/test/setup.ts`. Tests are co-located (`foo.tsx` + `foo.test.tsx`) and a few page-level tests live in `src/app/__tests__/`.

TDD is the norm for new components — every editorial component and MDX shortcode in `src/components/{editorial,mdx}/` ships with a failing-test-first commit, see `git log --oneline --grep="^feat(editorial)\|^feat(mdx)"`.

## Workflow conventions

### Branches + specs/plans

Active work uses long-lived feature branches (`feat/portfolio-beautification`, `feat/blog-system-v2`). Each major feature has a paired:

- **Spec** at `docs/superpowers/specs/YYYY-MM-DD-<topic>-design.md`
- **Plan** at `docs/superpowers/plans/YYYY-MM-DD-<topic>.md` (numbered atomic tasks, each ending in a literal commit message)

Plans are designed to be executable by `/ralph-loop` overnight — every task ends in a commit with the exact message shown.

### Skills

Project-scoped skills live under `skills/<name>/SKILL.md` (source of truth, tracked in git). The Claude harness picks them up via a `.claude/skills/` symlink — on fresh clones, see `skills/<name>/README.md` for activation. Currently shipped: `write-blog-post` (drafts a post via short interview → `/storyteller-writing-assistant` handoff → MDX on disk).

### What goes in `.gitignore` (don't accidentally commit)

`public/_blog-assets/`, `.next/`, `.workspace/`, `memory/`, `.claude/` (symlink), `.planning/`, `.claude-flow/`, `.agents/`, `.vscode/`, `skills-lock.json`. Stage explicitly (`git add <path>`) instead of `git add -A` — the workspace and worktree dirs above should never enter commits.
