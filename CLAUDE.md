# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build — run this before committing to catch type errors
npm run lint         # ESLint
npm run test         # Vitest (watch mode)
npm run test:ui      # Vitest with browser UI
npm run test:coverage
```

Run a single test file:
```bash
npx vitest src/app/__tests__/home.test.tsx
```

## Architecture

**Next.js 16 App Router** with React 19 and TypeScript 5. All pages live in `src/app/` using file-based routing.

### Data layer

All content is static — no database. Edit these files to update site content:

| File | Controls |
|---|---|
| `src/data/site-config.ts` | Site title, description, URL, social links |
| `src/data/projects.ts` | All projects (home featured + /projects grid + /projects/[slug]) |
| `src/data/resume.ts` | Roles, education, skills for /resume |
| `src/data/current-focus.ts` | Three "What I'm working on" cards on homepage |
| `content/blog/*.mdx` | Blog posts (gray-matter frontmatter: title, date, excerpt, tags, published) |

### Key types

`src/types/index.ts` — `Project` interface (id, title, description, techStack, metrics[], slug, problem, solution, results, lessonsLearned, featured)

`src/types/blog.ts` — `BlogPost` / `BlogPostFrontmatter`

`src/data/resume.ts` — `Role` (company, title, period, location, type, bullets[]) and `Education`

### Styling

**Tailwind CSS 4** — config is in `src/app/globals.css` via `@theme inline` (no separate `tailwind.config.ts`). Custom colors are BYU-branded: `byu-navy` (#002E5D), `byu-blue`, `byu-light-blue`, `byu-sky`. Use `cn()` from `src/lib/utils.ts` for conditional classes.

Three fonts loaded in layout: **Inter** (`--font-inter`, sans-serif default), **Geist Mono** (`--font-mono`), **Playfair Display** (`--font-playfair`, used only on hero H1).

### Component conventions

- `src/components/ui/` — shadcn/ui components (copy-paste, do not modify structure)
- `src/components/sections/` — full-page sections (Hero, CurrentFocus, ProjectsGrid, FAQ, ContactSection, etc.)
- `src/components/layout/` — Navbar, Footer, Container (`max-w-6xl` with responsive padding)
- Animations: Framer Motion `motion.*` with `initial/animate/whileInView` — see hero.tsx for the standard pattern

### Calendar / meeting system

`/meet` embeds Cal.com via `@calcom/embed-react`. The custom availability logic in `src/lib/` is a separate booking flow:
- `availabilityService.ts` — generates 30-min slots (9 AM–5 PM Mountain, weekdays only)
- `icalendarService.ts` — fetches busy times from `/api/calendar`
- `icsService.ts` — generates `.ics` files for download
- `src/app/api/calendar/route.ts` — server route that calls iCloud CalDAV via `tsdav`

### SEO infrastructure

- `src/app/og/route.tsx` — edge-runtime dynamic OG image (1200×630)
- `src/app/layout.tsx` — Person JSON-LD schema, OG + Twitter metadata (all sourced from `siteConfig`)
- `src/app/blog/[slug]/page.tsx` — Article JSON-LD per post
- `src/app/projects/[slug]/page.tsx` — SoftwareApplication JSON-LD per project
- `src/app/sitemap.ts` / `robots.ts` / `feed.xml/route.ts` — auto-generated

### Testing

Vitest + React Testing Library + jsdom. Setup file: `src/test/setup.ts`. Tests live in `src/app/__tests__/`.
