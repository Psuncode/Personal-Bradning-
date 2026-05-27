# Architecture

**Analysis Date:** 2026-03-17

## Pattern Overview

**Overall:** Next.js 16 App Router with static content generation and server-side API integration.

**Key Characteristics:**
- File-based routing via Next.js App Router (`src/app/`)
- Static content sourced from TypeScript data files, not a database
- Client components with React 19 for interactive sections
- Server components for metadata generation and content loading
- Edge runtime for dynamic OG image generation

## Layers

**Presentation Layer:**
- Purpose: Render UI components and handle user interactions
- Location: `src/components/`
- Contains: React components (sections, UI elements, layouts)
- Depends on: Data layer, utility functions, third-party UI libraries (Framer Motion, Radix UI, shadcn/ui)
- Used by: Route handlers in `src/app/`

**Data Layer:**
- Purpose: Store and expose static content for the site
- Location: `src/data/` (TypeScript config files) and `content/blog/` (MDX files)
- Contains: Project definitions, resume data, current focus cards, site metadata, blog posts
- Depends on: Type definitions
- Used by: Pages and sections

**API Layer:**
- Purpose: Handle server-side operations (calendar fetching, metadata generation)
- Location: `src/app/api/`
- Contains: Route handlers for calendar events, OG image generation
- Depends on: Service layer utilities, external services (CalDAV/iCloud)
- Used by: Client-side fetch calls and Next.js metadata generation

**Service Layer:**
- Purpose: Encapsulate business logic for reusable operations
- Location: `src/lib/`
- Contains: Blog loading, calendar availability calculation, iCalendar parsing, ICS generation, server-side calendar fetching
- Depends on: Third-party libraries (gray-matter, date-fns, tsdav)
- Used by: API routes, pages, components

**Type System:**
- Purpose: Define interfaces for type safety across layers
- Location: `src/types/`
- Contains: Project, BlogPost, BlogPostFrontmatter interfaces
- Used by: All other layers

## Data Flow

**Homepage Rendering:**

1. Route handler (`src/app/page.tsx`) requests sections via composition
2. Sections fetch data directly from `src/data/` exports (projects, current focus, resume)
3. Components render with motion animations (Framer Motion)
4. Vercel Analytics captured on client
5. Person schema JSON-LD injected in layout

**Blog Post Page:**

1. Route handler (`src/app/blog/[slug]/page.tsx`) uses `generateStaticParams()` for static generation
2. `getAllPosts()` from `src/lib/blog.ts` reads and parses MDX files with gray-matter
3. `getPostBySlug()` retrieves specific post content
4. MDXRemote renders content with custom components
5. Article schema JSON-LD generated from frontmatter metadata
6. Reading time calculated from content

**Project Detail Page:**

1. Route handler (`src/app/projects/[slug]/page.tsx`) uses `generateStaticParams()`
2. Project found in `src/data/projects.ts` array by slug
3. ProjectDetailView renders with motion animations
4. SoftwareApplication schema JSON-LD generated from project data

**Calendar Availability:**

1. Client calls `/api/calendar` with date range
2. API route calls `fetchCalendarEventsForRange()` from `src/lib/serverCalendar.ts`
3. Service fetches busy times from iCloud CalDAV via `tsdav`
4. Availability slots generated using `availabilityService.ts` (9 AM–5 PM Mountain, weekdays, 30-min slots)
5. Response returned to client for booking interface

**State Management:**
- No global state manager (Redux, Zustand, etc.)
- Component-level state with `useState` for UI interactions (mobile menu, date pickers)
- Data immutable and read-only from data layer
- No mutations — all content updates require code changes

## Key Abstractions

**Project Interface:**
- Purpose: Represents portfolio projects with detailed case study information
- Location: `src/types/index.ts`
- Pattern: Flexible interface with optional fields (`problem`, `solution`, `results`, `metrics`, `lessonsLearned`)
- Used by: Project list views, project detail pages, featured project cards

**BlogPost Interface:**
- Purpose: Encapsulates blog content with metadata
- Location: `src/types/blog.ts`
- Pattern: Frontmatter (YAML metadata) + content (MDX body) separation via gray-matter
- Used by: Blog list, blog post pages, reading time calculation

**Service Functions:**
- `getAllPosts()` / `getPostBySlug()` - Blog file I/O and parsing (`src/lib/blog.ts`)
- `fetchCalendarEventsForRange()` - CalDAV integration (`src/lib/serverCalendar.ts`)
- `generateAvailableSlots()` - Business logic for meeting availability (`src/lib/availabilityService.ts`)

**Section Components:**
- Purpose: Full-page composable sections (Hero, About, CaseStudies, ContentGrid, etc.)
- Location: `src/components/sections/`
- Pattern: Each section is a standalone React component with data fetching
- Example: `src/components/sections/hero.tsx` uses Framer Motion for entrance animations

## Entry Points

**Homepage:**
- Location: `src/app/page.tsx`
- Triggers: User navigates to `/`
- Responsibilities: Compose homepage sections (Hero, About, CaseStudies, ContentGrid)

**Blog List:**
- Location: `src/app/blog/page.tsx`
- Triggers: User navigates to `/blog`
- Responsibilities: Fetch all published posts, render list with filters/sorting

**Project Detail:**
- Location: `src/app/projects/[slug]/page.tsx`
- Triggers: User navigates to `/projects/{slug}`
- Responsibilities: Load specific project, generate static params, render detail view with schema

**Blog Post:**
- Location: `src/app/blog/[slug]/page.tsx`
- Triggers: User navigates to `/blog/{slug}`
- Responsibilities: Load MDX, parse frontmatter, render with custom components, generate Article schema

**Contact Form:**
- Location: `src/app/contact/page.tsx`
- Triggers: User navigates to `/contact`
- Responsibilities: Render contact form interface

**Calendar/Meeting:**
- Location: `src/app/meet/page.tsx`
- Triggers: User navigates to `/meet`
- Responsibilities: Embed Cal.com booking widget, optionally show custom availability interface

**Calendar API:**
- Location: `src/app/api/calendar/route.ts`
- Triggers: POST request with `{ startDate, endDate }`
- Responsibilities: Fetch busy times from iCloud CalDAV, return events in date range

**OG Image:**
- Location: `src/app/og/route.tsx`
- Triggers: Meta tag requests for Open Graph image
- Responsibilities: Generate dynamic 1200×630 OG image at edge runtime

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: All page navigation
- Responsibilities: Initialize fonts, inject Person schema JSON-LD, mount Navbar/Footer, attach Analytics

## Error Handling

**Strategy:** Try-catch with environment-aware error responses

**Patterns:**
- API routes: `try-catch` with JSON error responses; development mode includes full error details (`src/app/api/calendar/route.ts`)
- Page routes: `notFound()` navigation helper for missing content (`src/app/blog/[slug]/page.tsx`, `src/app/projects/[slug]/page.tsx`)
- Blog file I/O: Graceful fallback to empty array if blog directory missing (`src/lib/blog.ts`)

## Cross-Cutting Concerns

**Logging:**
- `console.error()` for API errors (e.g., calendar fetch failures)
- No centralized logging infrastructure

**Validation:**
- TypeScript strict mode (`strict: true` in tsconfig)
- Type-safe frontmatter parsing via `matter()` with type assertion
- Date validation in API routes (checks for `startDate`, `endDate`)

**Authentication:**
- No authentication system
- Calendar API publicly accessible (rate limiting depends on CalDAV provider)
- Contact form submission handled by external service (formspree or similar)

**SEO:**
- Metadata generation via Next.js `generateMetadata()` in page routes
- JSON-LD schemas injected in `<head>`:
  - `Person` schema in root layout
  - `Article` schema per blog post
  - `SoftwareApplication` schema per project
- OG image auto-generated at `/og`
- Robots and sitemap auto-generated (`src/app/robots.ts`, `src/app/sitemap.ts`)
- RSS feed generation at `/feed.xml/route.ts`
