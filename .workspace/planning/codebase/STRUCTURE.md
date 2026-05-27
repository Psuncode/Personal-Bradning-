# Codebase Structure

**Analysis Date:** 2026-03-17

## Directory Layout

```
/Users/philipsun/Documents/personal websit/
├── src/                           # Application source code
│   ├── app/                       # Next.js App Router pages and routes
│   │   ├── (routes)               # Page files for file-based routing
│   │   ├── api/                   # API route handlers
│   │   ├── __tests__/             # Component tests
│   │   ├── layout.tsx             # Root layout (fonts, navbar, footer, schema)
│   │   ├── page.tsx               # Homepage (/)
│   │   ├── globals.css            # Tailwind CSS configuration
│   │   ├── robots.ts              # robots.txt generation
│   │   └── sitemap.ts             # sitemap.xml generation
│   ├── components/                # React components
│   │   ├── sections/              # Full-page sections (Hero, About, etc.)
│   │   ├── layout/                # Layout components (Navbar, Footer, Container)
│   │   ├── ui/                    # shadcn/ui base components
│   │   ├── booking/               # Calendar/availability UI
│   │   ├── project-card.tsx       # Project card component
│   │   └── motion-wrapper.tsx     # Framer Motion wrapper utility
│   ├── lib/                       # Utility functions and business logic
│   │   ├── blog.ts                # Blog file I/O and MDX parsing
│   │   ├── serverCalendar.ts      # CalDAV integration (iCloud)
│   │   ├── availabilityService.ts # Meeting slot generation logic
│   │   ├── icalendarService.ts    # iCalendar parsing
│   │   ├── icsService.ts          # ICS file generation
│   │   └── utils.ts               # Helpers (cn() for Tailwind merging)
│   ├── data/                      # Static content (TypeScript data sources)
│   │   ├── site-config.ts         # Site title, URL, social links
│   │   ├── projects.ts            # Project portfolio data
│   │   ├── resume.ts              # Resume/experience data
│   │   ├── current-focus.ts       # "What I'm working on" cards
│   │   └── social-links.ts        # Social media links
│   ├── types/                     # TypeScript interfaces
│   │   ├── index.ts               # Project, SocialLink interfaces
│   │   └── blog.ts                # BlogPost, BlogPostFrontmatter
│   └── test/                      # Test configuration
│       └── setup.ts               # Vitest setup with React Testing Library
├── content/                       # Static content files
│   └── blog/                      # MDX blog posts
│       ├── hello-world.mdx
│       └── lessons-from-building.mdx
├── public/                        # Static assets
│   ├── images/
│   └── favicon.ico
├── .planning/                     # GSD planning documents
│   └── codebase/                  # Architecture analysis
├── package.json                   # Dependencies and npm scripts
├── tsconfig.json                  # TypeScript configuration
├── next.config.js                 # Next.js configuration
└── CLAUDE.md                      # Project instructions
```

## Directory Purposes

**`src/app/`:**
- Purpose: Page routing and API endpoints (Next.js App Router)
- Contains: Pages (`.tsx`), API routes, layout files, configuration files
- Key files: `page.tsx` (homepage), `layout.tsx` (root layout), routes in subdirectories

**`src/components/sections/`:**
- Purpose: Full-page composable sections
- Contains: Hero, About, CaseStudies, ProjectsGrid, BlogList, ContactSection, FAQSection, etc.
- Each file is a single React component exported as default

**`src/components/layout/`:**
- Purpose: Reusable layout structure components
- Contains: Navbar, Footer, Container (max-width wrapper)
- Key files: `navbar.tsx` (sticky header with responsive mobile menu), `footer.tsx`

**`src/components/ui/`:**
- Purpose: Base UI components from shadcn/ui
- Contains: Button, Sheet, Card, Dialog, etc. (copy-paste from shadcn)
- Note: Do not modify structure; regenerate with `npx shadcn`

**`src/lib/`:**
- Purpose: Business logic and utility functions
- Contains: File I/O (blog), external service integration (calendar), calculations
- Key files: `blog.ts` (post loading), `serverCalendar.ts` (CalDAV), `availabilityService.ts` (meeting slots)

**`src/data/`:**
- Purpose: Static data exports (replaces database)
- Contains: Project list, resume, site config, current focus
- Key files: `projects.ts` (portfolio array), `resume.ts` (roles/education), `site-config.ts`

**`src/types/`:**
- Purpose: TypeScript interface definitions
- Contains: Interfaces for Project, BlogPost, BlogPostFrontmatter
- Key files: `index.ts` (domain types), `blog.ts` (blog-specific types)

**`content/blog/`:**
- Purpose: Blog post source files
- Contains: MDX files with YAML frontmatter (title, date, excerpt, tags, published)
- Naming: `{slug}.mdx` (e.g., `hello-world.mdx`)

**`src/test/`:**
- Purpose: Test configuration and setup
- Contains: Vitest setup, test utilities
- Key files: `setup.ts` (beforeAll hooks, cleanup)

**`public/`:**
- Purpose: Static assets served directly (not processed by Webpack)
- Contains: Images, favicon, any downloadable files
- Key files: `images/projects/` (project images), `favicon.ico`

## Key File Locations

**Entry Points:**
- `src/app/page.tsx` - Homepage route (/)
- `src/app/layout.tsx` - Root layout (wraps all pages)
- `src/app/blog/page.tsx` - Blog list page (/blog)
- `src/app/projects/page.tsx` - Project grid page (/projects)
- `src/app/resume/page.tsx` - Resume page (/resume)
- `src/app/contact/page.tsx` - Contact page (/contact)
- `src/app/meet/page.tsx` - Meeting/calendar page (/meet)

**Configuration:**
- `tsconfig.json` - TypeScript configuration (alias `@/*` → `./src/*`)
- `package.json` - Dependencies and scripts
- `src/app/globals.css` - Tailwind CSS config via `@theme inline`
- `next.config.js` - Next.js configuration

**Core Logic:**
- `src/lib/blog.ts` - Blog post I/O and parsing (getAllPosts, getPostBySlug)
- `src/lib/serverCalendar.ts` - Calendar event fetching from iCloud CalDAV
- `src/lib/availabilityService.ts` - Business logic for meeting availability generation
- `src/data/projects.ts` - Portfolio project definitions
- `src/data/resume.ts` - Work experience and education data

**Testing:**
- `src/app/__tests__/` - Component and integration tests
- `src/test/setup.ts` - Vitest configuration
- Test files: `*.test.tsx` or `*.spec.tsx`

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `Hero.tsx`, `ProjectCard.tsx`)
- Utilities/services: camelCase (e.g., `availabilityService.ts`, `blog.ts`)
- Pages: lowercase or PascalCase depending on route (e.g., `page.tsx`, `layout.tsx`)
- Test files: `{ComponentName}.test.tsx` or `{fileName}.spec.ts`

**Directories:**
- Feature/section directories: lowercase (e.g., `components/sections/`, `src/app/blog/`)
- Route segments with params: square brackets (e.g., `[slug]`, `[id]`)

**Variables & Functions:**
- camelCase for variables, functions, constants
- PascalCase for React components, interfaces, types
- UPPERCASE for constants (rare usage)

**Interfaces:**
- Prefixed with capital letter (e.g., `Project`, `BlogPost`, `BlogPostFrontmatter`)
- Export type aliases if shared across modules

## Where to Add New Code

**New Feature (e.g., newsletter signup):**
- Primary code: `src/components/sections/` (new section component)
- Logic: `src/lib/` (if requires API integration or calculation)
- Data: `src/data/` (if static configuration needed)
- Tests: `src/app/__tests__/` (unit/integration tests)
- API: `src/app/api/` (if backend logic required)

**New Component/Module:**
- UI component: `src/components/ui/` (if shadcn-style) or `src/components/` (if custom)
- Section component: `src/components/sections/`
- Layout component: `src/components/layout/`

**New Page:**
- Location: `src/app/{page-name}/page.tsx`
- Metadata: Add `generateMetadata()` function if SEO needed
- Static params: Add `generateStaticParams()` for dynamic routes (e.g., `/blog/[slug]`)

**New Utility Function:**
- Location: `src/lib/{domain}.ts` (grouped by domain: blog, calendar, etc.)
- Naming: `camelCase` (e.g., `generateAvailableSlots()`)

**New Data Source:**
- Location: `src/data/{entity}.ts`
- Export pattern: Named export (e.g., `export const projects: Project[]`)

**New Type Definition:**
- Location: `src/types/index.ts` (shared) or `src/types/{domain}.ts` (domain-specific)
- Naming: PascalCase interface (e.g., `interface BlogPost`)

## Special Directories

**`src/components/ui/`:**
- Purpose: shadcn/ui base components
- Generated: Yes (copy-pasted from shadcn templates)
- Committed: Yes
- Notes: Do not modify structure manually; regenerate with `npx shadcn-cli@latest add {component}`

**`.next/`:**
- Purpose: Next.js build output cache
- Generated: Yes (during `npm run build`)
- Committed: No (.gitignore)

**`node_modules/`:**
- Purpose: Installed dependencies
- Generated: Yes (from package-lock.json)
- Committed: No (.gitignore)

**`.planning/codebase/`:**
- Purpose: GSD analysis documents (ARCHITECTURE.md, STRUCTURE.md, etc.)
- Generated: Manual (GSD agent)
- Committed: Yes (for codebase reference)
