# Technology Stack

**Analysis Date:** 2026-03-17

## Languages

**Primary:**
- TypeScript 5 - All source code and configuration
- JSX/TSX - React components with embedded markup

**Secondary:**
- JavaScript - Node.js runtime scripts and utilities
- CSS - Tailwind directives in `src/app/globals.css`

## Runtime

**Environment:**
- Node.js - Server runtime (no specific version pinned; check `.npmrc` or package manager defaults)

**Package Manager:**
- npm - Dependency management
- Lockfile: `package-lock.json` (committed)

## Frameworks

**Core:**
- Next.js 16.1.6 - React meta-framework with App Router (file-based routing)
- React 19.2.3 - UI library with hooks
- React DOM 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework
- @tailwindcss/postcss 4 - PostCSS plugin for Tailwind
- class-variance-authority 0.7.1 - Component variant utilities
- clsx 2.1.1 - Conditional className merging
- tailwind-merge 3.5.0 - Merge Tailwind classes without conflicts

**UI Components:**
- shadcn/ui - Copy-paste component library (via `shadcn` 3.8.5 CLI)
- radix-ui 1.4.3 - Headless UI primitive components
- lucide-react 0.574.0 - Icon library
- react-day-picker 9.13.2 - Date picker component

**Animations:**
- Framer Motion 12.34.2 - React animation library
- tw-animate-css 1.4.0 - Tailwind animation utilities

**Content Management:**
- next-mdx-remote 6.0.0 - MDX rendering on the server
- gray-matter 4.0.3 - YAML frontmatter parsing for blog posts

**Date/Time:**
- date-fns 4.1.0 - Date utility library
- date-fns-tz 3.2.0 - Timezone support for date-fns
- ical.js 2.2.1 - iCalendar parsing and manipulation
- ics 3.8.1 - ICS file generation
- reading-time 1.5.0 - Estimate reading time for blog posts

**Calendar Integration:**
- tsdav 2.1.8 - TypeScript DAV client for CalDAV protocol (iCloud calendars)
- @calcom/embed-react 1.5.3 - Cal.com booking widget embed

**Analytics:**
- @vercel/analytics 1.6.1 - Vercel Web Analytics

## Build & Development Tools

**Testing:**
- Vitest 4.0.18 - Unit test runner (Vite-native, ESM-first)
- @vitest/ui 4.0.18 - Browser UI for test results
- React Testing Library 16.3.2 - React component testing utilities
- @testing-library/jest-dom 6.9.1 - Custom matchers for DOM testing
- @testing-library/user-event 14.6.1 - User interaction simulation
- jsdom 28.1.0 - DOM implementation for Node.js

**Linting & Code Quality:**
- ESLint 9 - JavaScript linter
- eslint-config-next 16.1.6 - Next.js ESLint configuration preset

**Build Tools:**
- @vitejs/plugin-react 5.1.4 - Vite React plugin (used by Vitest)
- PostCSS 4 - CSS transformation tool (configured in `postcss.config.mjs`)

**Type Checking:**
- TypeScript 5 - Static type checker (built-in to Next.js)

## Key Dependencies

**Critical:**
- next 16.1.6 - Core framework; enables App Router, file-based routing, API routes, edge functions
- react 19.2.3 - Core rendering engine; provides hooks and component model
- tailwindcss 4 - Styling foundation for entire UI
- framer-motion 12.34.2 - Animation system for interactive sections (hero, fade-ins, scroll effects)

**Infrastructure:**
- tsdav 2.1.8 - Required for iCloud CalDAV integration in `/meet` booking flow
- @calcom/embed-react 1.5.3 - Fallback booking system; embeds Cal.com widget
- @vercel/analytics 1.6.1 - Analytics data collection; imported in root layout
- next-mdx-remote 6.0.0 - Blog post rendering; parses MDX with gray-matter frontmatter

## Configuration Files

**TypeScript:**
- `tsconfig.json` - Compiler options: ES2017 target, strict mode enabled, path alias `@/*` → `src/*`

**Next.js:**
- `next.config.ts` - Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)

**Testing:**
- `vitest.config.ts` - jsdom environment, setupFiles: `src/test/setup.ts`, v8 coverage provider

**Linting:**
- `eslint.config.mjs` - Flat config format; extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`

**CSS:**
- `postcss.config.mjs` - Single plugin: `@tailwindcss/postcss`
- `src/app/globals.css` - Tailwind directives, custom theme variables (`--color-byu-navy`, etc.), font definitions

**Fonts:**
- Loaded from Google Fonts in `src/app/layout.tsx`:
  - **Inter** - `--font-inter` (default sans-serif)
  - **Geist Mono** - `--font-mono`
  - **Playfair Display** - `--font-playfair` (serif, used only on hero H1)

## Environment Configuration

**Location:** `.env.local` (gitignored)

**Required Variables for Calendar Integration:**
- `ICAL_USERNAME` - iCloud email for CalDAV
- `ICAL_PASSWORD` - iCloud app-specific password
- `ICAL_SERVER` - CalDAV server URL (defaults to `https://caldav.icloud.com`)
- `ICAL_CALENDAR_ID` - Calendar ID to sync

**Required Variables for Contact Form:**
- `NEXT_PUBLIC_FORMSPREE_ID` - Formspree form ID (public; browser-safe)
- If not set, contact form falls back to `mailto:` link

**Optional Variables:**
- `NODE_ENV` - Set by Next.js automatically (used in `src/app/api/calendar/route.ts` for error verbosity)

## Platform Requirements

**Development:**
- Node.js (compatible with npm)
- npm or similar package manager
- Modern browser for hot reload development server

**Production:**
- Node.js runtime (for server functions and API routes)
- Deployment platform: Vercel (native Next.js support; analytics integration)
- Alternatively: Any Node.js-compatible hosting (self-hosted, AWS, GCP, etc.)

---

*Stack analysis: 2026-03-17*
