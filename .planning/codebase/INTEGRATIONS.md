# External Integrations

**Analysis Date:** 2026-03-17

## APIs & External Services

**Calendar & Booking:**
- Cal.com - Professional meeting scheduler
  - SDK/Client: `@calcom/embed-react` 1.5.3
  - Implementation: React component embed in `/meet` page
  - Usage: Fallback/alternative to custom iCloud booking flow
  - Location: `src/components/booking/` uses both custom and Cal.com

**Email Forms:**
- Formspree - Form submission service
  - SDK/Client: Browser `fetch()` to `https://formspree.io/f/{id}`
  - Auth: Form ID via `NEXT_PUBLIC_FORMSPREE_ID` env var (public)
  - Implementation: `src/components/sections/contact-section.tsx`
  - Fallback: If form ID not set, uses `mailto:ps324@byu.edu`

## Data Storage

**Databases:**
- None - Static site only
- All content stored in source files:
  - `src/data/site-config.ts` - Site metadata, social links
  - `src/data/projects.ts` - Projects data (home featured + grid + detail pages)
  - `src/data/resume.ts` - Resume roles and education
  - `src/data/current-focus.ts` - Homepage "What I'm working on" cards
  - `content/blog/*.mdx` - Blog posts (gray-matter frontmatter)

**File Storage:**
- Local filesystem only - Static assets in `public/` directory
- No cloud storage integration

**Caching:**
- Next.js built-in caching:
  - `unstable_cache()` in `src/lib/serverCalendar.ts` - Caches server availability for 15 minutes
  - ISR (Incremental Static Regeneration) - Blog and project pages rebuild on demand

## Authentication & Identity

**Auth Provider:**
- Custom iCloud CalDAV authentication
  - Approach: Basic auth (username + password) to iCloud CalDAV endpoint
  - Credentials: Stored in `.env.local`
  - Location: `src/lib/serverCalendar.ts` - DAV client initialization
  - Protocol: WebDAV/CalDAV over HTTPS
  - Server: `https://caldav.icloud.com` (configurable via `ICAL_SERVER`)

**No OAuth/Social Auth:**
- No user login system
- No social authentication providers

## Monitoring & Observability

**Error Tracking:**
- Vercel Analytics (performance, Web Vitals only)
- No dedicated error tracking service (Sentry, etc.)
- Console logging for development/debugging

**Logs:**
- Server-side: Node.js `console.error()` / `console.log()` in:
  - `src/app/api/calendar/route.ts` - Calendar API errors
  - `src/lib/serverCalendar.ts` - iCloud sync logging (verbose in dev)
  - `src/lib/icalendarService.ts` - Client-side fetch errors
- Client-side: Browser console (React/Framer Motion warnings)
- No log aggregation service

## Monitoring & Analytics

**Analytics:**
- Vercel Web Analytics
  - Package: `@vercel/analytics` 1.6.1
  - Implementation: `<Analytics />` component in `src/app/layout.tsx`
  - Data: Core Web Vitals, page views, user interactions
  - No PII collected (privacy-friendly)

**SEO:**
- JSON-LD schema markup:
  - Person schema in root layout (`src/app/layout.tsx`)
  - Article schema per blog post (`src/app/blog/[slug]/page.tsx`)
  - SoftwareApplication schema per project (`src/app/projects/[slug]/page.tsx`)
- Dynamic OG images: `src/app/og/route.tsx` (Edge Function)
- Sitemap: `src/app/sitemap.ts` (auto-generated)
- Robots.txt: `src/app/robots.ts`
- RSS feed: `src/app/feed.xml/route.ts`

## CI/CD & Deployment

**Hosting:**
- Vercel (recommended, native Next.js support)
- Alternative: Any Node.js host (AWS, GCP, self-hosted)

**CI Pipeline:**
- None detected in source
- Recommended: Vercel's built-in CI/CD on git push
- Build command: `npm run build`
- Health check: `npm run lint` + `npm run test`

## Environment Configuration

**Required env vars:**

| Variable | Purpose | Location | Required |
|----------|---------|----------|----------|
| `ICAL_USERNAME` | iCloud email for CalDAV | `src/lib/serverCalendar.ts` | Yes (calendar feature) |
| `ICAL_PASSWORD` | iCloud app-specific password | `src/lib/serverCalendar.ts` | Yes (calendar feature) |
| `ICAL_SERVER` | CalDAV server endpoint | `src/lib/serverCalendar.ts` | No (defaults to iCloud) |
| `ICAL_CALENDAR_ID` | Which calendar to sync | `src/lib/serverCalendar.ts` | Yes (calendar feature) |
| `NEXT_PUBLIC_FORMSPREE_ID` | Formspree form ID | `src/components/sections/contact-section.tsx` | No (falls back to mailto) |

**Secrets location:**
- `.env.local` - Local development (gitignored)
- Vercel: Environment variables in project settings → Settings → Environment Variables
- Never commit `.env.local` or any file with iCloud credentials

## Webhooks & Callbacks

**Incoming:**
- Formspree webhook: Optional (not implemented in this codebase)
  - Could be configured in Formspree dashboard to notify on new submissions
  - Current: Email notifications only from Formspree

**Outgoing:**
- `/api/calendar` POST endpoint
  - Called by: `src/lib/icalendarService.ts` (client-side)
  - Request body: `{ startDate: string, endDate: string }`
  - Response: `{ success: boolean, events: SerializedEvent[], eventCount: number, dateRange: {...} }`
  - Purpose: Proxy for iCloud CalDAV queries with timezone handling

## Data Flow

**Calendar Booking Flow:**
1. User visits `/meet`
2. Server-side: `getServerAvailability()` called (cached for 15 min)
3. Fetches 3-month availability from iCloud via CalDAV (tsdav)
4. Returns `{ events, busyDates }` to page
5. Client renders booking form with available slots (Framer Motion animations)
6. User selects slot → either:
   - Cal.com embed handles booking, OR
   - Custom booking flow via custom availability service
7. Calendar persisted in iCloud (no local storage)

**Blog Posts:**
1. MDX files in `content/blog/*.mdx` with gray-matter frontmatter
2. Build time: `next-mdx-remote` parses and renders
3. Blog index: `src/app/blog/page.tsx` (lists all posts)
4. Blog post: `src/app/blog/[slug]/page.tsx` (server-rendered with Article schema)
5. RSS feed: `src/app/feed.xml/route.ts` (auto-generated from parsed posts)

**Contact Form:**
1. User fills form in `src/components/sections/contact-section.tsx`
2. Form POST to `https://formspree.io/f/{NEXT_PUBLIC_FORMSPREE_ID}`
3. Formspree emails submission to configured inbox
4. Fallback: If no Formspree ID, opens `mailto:` link

---

*Integration audit: 2026-03-17*
