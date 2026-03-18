# Phase 2: Content and CRM — Research

**Researched:** 2026-03-17
**Domain:** Next.js App Router — image storage, photography gallery, Drizzle CRM integration, admin auth, bug fix
**Confidence:** HIGH (primary sources: official Next.js 16.1.7 docs, Vercel Blob docs, Cloudflare R2 pricing page, direct codebase inspection)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| SUB-02 | `photography.philipsun.com` has its own layout and surfaces photography gallery, pricing page, and booking flow | Photography route is at `src/app/(photography)/photography/` — proxy rewrites subdomain to `/photography` path prefix. New pages go under this directory. |
| PHOTO-01 | Visitor can browse photography gallery organized by category (portrait, landscape, event) | Image storage decision (Vercel Blob), Next.js Image `remotePatterns` config, client-side category filter pattern documented. |
| PHOTO-02 | Visitor can view pricing page with explicit package prices (no "contact for pricing") | `packages` table already in DB schema; read via Drizzle server component or static seed data. |
| CRM-01 | Every contact form submission saved to database | Server Action pattern + `contacts` table insert via `db` singleton. Contact section currently uses Formspree — wire to Server Action instead. |
| CRM-02 | Philip can view all contacts and bookings at password-protected `/admin` route | Cookie-based auth via `proxy.ts` + `iron-session` 8.0.4 — appropriate for solo operator, no new auth library needed. |
| CRM-03 | Each contact/inquiry record captures traffic source (UTM parameters and HTTP referrer) | `contacts` table already has `utm_source`, `utm_medium`, `utm_campaign`, `referrer` columns. Capture from `URL.searchParams` + `request.headers.get('referer')` in Server Action. |
| BUG-02 | Hardcoded `ps324@byu.edu` removed from BookingForm.tsx, sourced from siteConfig | Exact lines located: 173 and 196 in `src/components/booking/BookingForm.tsx`. `siteConfig.links.email` is `"mailto:ps324@byu.edu"` — strip `mailto:` prefix or add separate `siteConfig.email` field. |
</phase_requirements>

---

## Summary

Phase 2 builds on the Phase 1 infrastructure (route groups at `(photography)/photography/`, Drizzle schema with all 6 tables) to deliver a photography gallery, pricing page, CRM contact capture, and a password-protected admin view.

**Image storage:** The core pending decision is Vercel Blob vs Cloudflare R2. Research concludes Vercel Blob is the correct choice for this project. Both are free for a small gallery (~50 photos), but Vercel Blob requires zero cross-platform configuration, has first-class Next.js Image `remotePatterns` support (single wildcard hostname pattern), and its dashboard upload workflow is simpler than R2's public bucket + Workers setup. R2's zero-egress-fee advantage is irrelevant at photography-portfolio scale.

**CRM:** The `contacts` table is ready. The contact form in `contact-section.tsx` currently submits to Formspree. Phase 2 replaces that with a Next.js Server Action that inserts directly to Neon via the `db` singleton, capturing UTM params and `referer` header. The Formspree path is removed.

**Admin auth:** NextAuth.js is overkill for a solo operator. The cleanest pattern is a cookie set by a login API route, checked in `proxy.ts` before the `/admin` path resolves. `iron-session` 8.0.4 (already verified) provides sealed cookie sessions with no external service dependency. Alternatively, raw `crypto.timingSafeEqual` comparison with a hex-encoded secret is sufficient and adds no packages.

**Primary recommendation:** Use Vercel Blob for image storage; implement CRM capture as a Server Action; protect `/admin` with a cookie checked in `proxy.ts` using `iron-session`.

---

## Standard Stack

### Core (already installed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| drizzle-orm | 0.45.1 | ORM for all DB reads/writes | Already installed Phase 1 |
| @neondatabase/serverless | 1.0.2 | Neon HTTP driver | Already installed Phase 1 |
| next | 16.1.6 | App Router, Server Actions, Image optimization | Core framework |
| tailwindcss | 4 | Gallery/admin styling | Project standard |

### New Additions

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vercel/blob | 2.3.1 | Image upload + CDN delivery | Upload photography images; serve via CDN-cached public blob URL |
| iron-session | 8.0.4 | Sealed cookie sessions | Admin route protection — seals session data client-side, no DB session table needed |

**Installation:**
```bash
npm install @vercel/blob@2.3.1 iron-session@8.0.4
```

**Version verification (confirmed 2026-03-17):**
- `@vercel/blob`: 2.3.1 (npm view)
- `iron-session`: 8.0.4 (npm view)

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @vercel/blob | Cloudflare R2 | R2 is free egress (better at high scale), but requires separate Cloudflare account, Workers for public access, and manual R2 CORS config. No Next.js Image native integration. Wrong for this scale. |
| @vercel/blob | AWS S3 | Same overhead as R2 without R2's egress advantage. |
| iron-session | NextAuth.js | NextAuth adds OAuth providers, sessions table, adapters — overkill for single-user admin. |
| iron-session | Raw cookie + crypto.timingSafeEqual | Viable (no new packages), but iron-session handles seal/unseal, expiry, and TypeScript types cleanly. Marginal cost for clear benefit. |
| Server Action | API route (/api/contacts) | Both work. Server Action is idiomatic Next.js 16 App Router, co-locates form logic with the component tree, avoids extra file. Use Server Action. |

---

## Architecture Patterns

### Confirmed Route Structure (from Phase 1)

```
src/
├── app/
│   ├── (photography)/
│   │   ├── layout.tsx                    # Photography root layout (exists)
│   │   └── photography/
│   │       ├── page.tsx                  # /photography → photography.philipsun.com/ (exists, placeholder)
│   │       ├── gallery/
│   │       │   └── page.tsx              # photography.philipsun.com/gallery — PHOTO-01
│   │       └── pricing/
│   │           └── page.tsx              # photography.philipsun.com/pricing — PHOTO-02
│   ├── (main)/
│   │   ├── admin/
│   │   │   ├── page.tsx                  # Admin contacts/bookings view — CRM-02
│   │   │   └── login/
│   │   │       └── page.tsx              # Login form
│   │   ├── api/
│   │   │   └── admin-auth/
│   │   │       └── route.ts              # POST /api/admin-auth — sets iron-session cookie
│   │   └── contact/
│   │       └── page.tsx                  # Contact page (hosts ContactSection)
│   └── actions/
│       └── contact.ts                    # Server Action: saveContact() — CRM-01, CRM-03
├── db/
│   ├── index.ts                          # db singleton (exists)
│   └── schema.ts                         # contacts, packages tables (exists)
└── data/
    └── photography.ts                    # Static gallery metadata + seed packages
```

**Key constraint from Phase 1 decision log:** The proxy maps `photography.philipsun.com` to the URL path `/photography`, NOT to the filesystem route group path `/(photography)`. New photography pages must go under `src/app/(photography)/photography/`, not directly in `src/app/(photography)/`.

### Pattern 1: Server Action for CRM Contact Capture

**What:** A `'use server'` function called directly from the contact form's `onSubmit` handler. Reads UTM params from the URL and `referer` from the request headers. Inserts into `contacts` table.

**When to use:** Any form that writes to the DB without needing to return structured error responses to JS — Server Actions are the idiomatic Next.js 16 pattern.

```typescript
// Source: Next.js 16 Server Actions (official docs)
// src/app/actions/contact.ts
'use server';

import { db } from '@/db';
import { contacts } from '@/db/schema';
import { headers } from 'next/headers';

export async function saveContact(formData: FormData) {
  const headersList = await headers();
  const referer = headersList.get('referer') ?? null;

  // UTM params come from the form (client passes them as hidden inputs
  // populated from window.location.search on mount)
  await db.insert(contacts).values({
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
    utmSource: formData.get('utm_source') as string | null,
    utmMedium: formData.get('utm_medium') as string | null,
    utmCampaign: formData.get('utm_campaign') as string | null,
    referrer: referer,
  });
}
```

**UTM capture strategy:** `contact-section.tsx` is a Client Component (`'use client'`). On mount, read `window.location.search`, parse UTM params, store in component state, and pass as hidden `<input>` fields. The Server Action reads them from `formData`. This is the standard approach — server actions cannot access `window.location`.

### Pattern 2: Cookie-Based Admin Auth in proxy.ts

**What:** Check for a signed session cookie in `proxy.ts` before the `/admin` path resolves. If missing or invalid, redirect to `/admin/login`. A login API route (`/api/admin-auth`) verifies the password against an env var and sets the `iron-session` cookie on success.

**When to use:** Single-user admin with no OAuth requirement. No DB session table. Cookie sealed server-side, cannot be forged.

```typescript
// In proxy.ts — add to existing proxy function
// Source: Next.js 16 proxy docs (cookie API on NextRequest)
import { getIronSession } from 'iron-session';

// Admin guard: redirect to login if no valid session
if (request.nextUrl.pathname.startsWith('/admin') &&
    !request.nextUrl.pathname.startsWith('/admin/login')) {
  const session = request.cookies.get('admin_session');
  if (!session?.value) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  // iron-session validation happens in the page/route handler (edge-safe check is just cookie presence)
  // Full seal validation in the page server component
}
```

**IMPORTANT:** `iron-session` full validation (unsealing) requires Node.js runtime, not edge. Do cookie presence check in `proxy.ts` (lightweight), then unseal and validate in the Server Component for the `/admin` page. This two-stage pattern is the documented approach for iron-session with Next.js App Router.

### Pattern 3: Gallery with Category Filter

**What:** Server Component fetches images (metadata from a static data file keyed to Vercel Blob URLs). Client Component handles the active category tab. No server round-trip for filtering — all categories loaded on initial render.

**When to use:** Small fixed gallery (< 200 images). No need for pagination or DB-driven image metadata at Phase 2 scale.

```typescript
// src/data/photography.ts — static gallery manifest
export type PhotoCategory = 'portrait' | 'landscape' | 'event';

export interface GalleryPhoto {
  id: string;
  src: string;       // Full Vercel Blob URL
  alt: string;
  category: PhotoCategory;
  width: number;
  height: number;
}

export const galleryPhotos: GalleryPhoto[] = [
  {
    id: 'p1',
    src: 'https://[store-id].public.blob.vercel-storage.com/portrait/photo1.jpg',
    alt: 'Portrait of ...',
    category: 'portrait',
    width: 1200,
    height: 800,
  },
  // ...
];
```

### Pattern 4: Pricing Page from Static Seed Data (Phase 2) vs DB (Phase 3+)

**What:** Phase 2 can render the pricing page from a static TypeScript data file that mirrors the DB schema. This is simpler than a DB query and does not require the `packages` table to be seeded yet. The `packages` table IS the source of truth for Phase 3 bookings — Phase 2 just needs to display prices.

**When to use:** Phase 2 only. Phase 3 will query the DB `packages` table for the booking flow, at which point the static data file can be retired or kept as the seed source.

```typescript
// src/data/photography.ts — also contains package definitions
export interface Package {
  id: number;
  name: string;
  description: string;
  priceInCents: number;     // integer cents (schema rule from Phase 1)
  depositInCents: number;
  durationMinutes: number;
}

export const photographyPackages: Package[] = [
  { id: 1, name: 'Portrait Session', description: '1-hour studio or outdoor portrait session', priceInCents: 25000, depositInCents: 7500, durationMinutes: 60 },
  { id: 2, name: 'Event Coverage', description: '3-hour event photography', priceInCents: 60000, depositInCents: 20000, durationMinutes: 180 },
  { id: 3, name: 'Landscape Half-Day', description: '4-hour golden-hour landscape session', priceInCents: 40000, depositInCents: 15000, durationMinutes: 240 },
];
```

### Anti-Patterns to Avoid

- **Do NOT add a route group root page at `src/app/(photography)/page.tsx`**: The proxy rewrites to `/photography` path, not the route group root. A page at `(photography)/page.tsx` would try to own `/` and conflict with `(main)/page.tsx`. The Phase 1 decision log explicitly records this constraint.
- **Do NOT use API routes for the contact form write**: Server Actions are idiomatic and simpler. API routes are for external consumers.
- **Do NOT store photos in the git repo**: Binary files balloon repo size and cannot be CDN-cached. Always upload to Vercel Blob first.
- **Do NOT use `boolean` type in Drizzle schema**: Phase 1 established that all booleans are stored as `text('true'/'false')`. The `packages.active` field already follows this.
- **Do NOT call `iron-session` unseal in `proxy.ts`**: Unseal requires async crypto not available in edge-lite proxy context. Presence check only in proxy; full validation in the route handler.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Image CDN delivery | Custom S3 proxy route | @vercel/blob public store | CDN caching, signed URLs, global edge, Next.js Image integration built-in |
| Cookie session security | Custom HMAC cookie | iron-session | Handles sealing, expiry, TypeScript types — single function call |
| Image optimization/resizing | Custom resize endpoint | next/image with remotePatterns | Automatic WebP/AVIF conversion, srcset, lazy loading |
| UTM parsing | Custom regex | `new URL(window.location.href).searchParams.get(...)` | URL.searchParams is standard Web API, fully supported |
| Duplicate contact prevention | Complex unique constraints + error handling | `createdAt` timestamp + natural deduplication | At personal site volume, duplicate submissions are a non-issue; don't over-engineer |

**Key insight:** Image optimization and CDN caching are solved problems in the Next.js + Vercel stack. Custom solutions for either would be significantly worse than the built-in path.

---

## Image Storage Decision: Vercel Blob (RECOMMENDED)

### Recommendation

**Use Vercel Blob.** Create a public blob store in the Vercel dashboard. Upload photos manually via the dashboard or `@vercel/blob` SDK. Serve via Next.js Image component with `remotePatterns` configured.

### Comparison

| Criterion | Vercel Blob | Cloudflare R2 |
|-----------|------------|---------------|
| Free tier storage | Hobby plan included | 10 GB/month free |
| Egress cost | Blob Data Transfer (low cost) | Free (R2's main advantage) |
| Next.js Image integration | Native — hostname wildcard in `remotePatterns` | Manual — requires public bucket or Worker |
| Upload workflow | Dashboard UI or `put()` SDK call | Wrangler CLI or dashboard (separate account) |
| Setup complexity | ~2 minutes in Vercel dashboard | Cloudflare account + bucket + CORS + public domain |
| CDN caching | Vercel CDN, 20 regional hubs, up to 1 month | Cloudflare CDN (excellent, but requires public bucket config) |
| Solo portfolio scale | Free tier more than sufficient | Free tier more than sufficient |
| Env var wiring | `BLOB_READ_WRITE_TOKEN` auto-injected by Vercel | `CLOUDFLARE_R2_*` manual configuration |

**Why Vercel Blob wins at this scale:** For ~50 photography images, R2's zero-egress advantage is worth $0/month of savings versus Vercel Blob. The development experience difference is significant: Vercel Blob is wired into the same deployment platform with automatic token injection and a native `remotePatterns` hostname pattern (`**.public.blob.vercel-storage.com`). R2 requires an entirely separate account, bucket policy, and CORS configuration.

### Vercel Blob Integration

**next.config.ts addition required:**
```typescript
// Source: Next.js 16.1.7 official docs (remotePatterns)
const nextConfig: NextConfig = {
  // ...existing headers config...
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
};
```

**Upload pattern (server-side, from admin or one-off script):**
```typescript
// Source: Vercel Blob official docs
import { put } from '@vercel/blob';

const blob = await put('photography/portrait/photo1.jpg', fileBuffer, {
  access: 'public',
  addRandomSuffix: false, // Use stable URLs for gallery manifest
});
// blob.url = 'https://[store-id].public.blob.vercel-storage.com/photography/portrait/photo1.jpg'
```

**Environment variable:** `BLOB_READ_WRITE_TOKEN` — auto-injected by Vercel when blob store is connected to the project. Add to `.env.local.example`.

---

## Common Pitfalls

### Pitfall 1: Photography Pages at the Wrong Path

**What goes wrong:** Creating `src/app/(photography)/page.tsx` instead of `src/app/(photography)/photography/page.tsx`. The gallery and pricing pages also need to be at `src/app/(photography)/photography/gallery/page.tsx` and `src/app/(photography)/photography/pricing/page.tsx`.

**Why it happens:** The Phase 1 PLAN.md originally described rewrites to `/(photography)` filesystem paths, but the actual `proxy.ts` implementation rewrites to `/photography` URL path prefix (not the route group path). The Phase 1 STATE.md decision log records this change.

**How to avoid:** Always check `proxy.ts` SUBDOMAINS map. The value `"/photography"` means Next.js URL path, not filesystem. The `(photography)` route group is transparent to URL routing — it's the `photography/` subdirectory inside that group that maps to the `/photography` URL prefix.

**Warning signs:** `404` on `photography.philipsun.com/` after adding content, or the placeholder page disappearing.

### Pitfall 2: UTM Params Not Captured (Client Component + Server Action)

**What goes wrong:** Server Action tries to read `request.headers` for UTM params, but UTMs are in the URL query string, not headers. `headers()` in a Server Action gives request headers (including `referer`), but NOT the URL query string.

**Why it happens:** Conflating HTTP headers with URL search params.

**How to avoid:** UTM params (`utm_source`, `utm_medium`, `utm_campaign`) live in `window.location.search` on the client. In the Client Component, parse them on mount with `useEffect` and store in state. Pass as hidden `<input name="utm_source">` fields in the form. The Server Action reads from `formData`. The HTTP `Referer` header (previous page URL) is captured via `headers().get('referer')` — this is different from UTMs.

**Warning signs:** UTM columns always `null` in the database despite UTMs in the URL.

### Pitfall 3: iron-session Unseal in Edge Runtime

**What goes wrong:** Calling `getIronSession()` inside `proxy.ts` throws a runtime error because `crypto.subtle` operations required for unsealing are not reliably available in the edge-lite proxy context.

**Why it happens:** `iron-session` v8 uses Web Crypto API for sealing/unsealing, which requires async operations. `proxy.ts` is synchronous in the simple case.

**How to avoid:** In `proxy.ts`, only check for cookie *presence*: `request.cookies.get('admin_session')`. Full unseal validation goes in the `/admin` page's Server Component using `getIronSession(cookies(), sessionOptions)`. Two-stage approach: proxy rejects obviously unauthenticated requests; page validates the seal.

**Warning signs:** `crypto is not defined` or `TextDecoder is not defined` errors in proxy logs.

### Pitfall 4: next/image 400 Error with Vercel Blob

**What goes wrong:** `<Image src="https://[store].public.blob.vercel-storage.com/..." />` throws `400 Bad Request` or falls back to unoptimized.

**Why it happens:** `next.config.ts` is missing the `remotePatterns` entry for `*.public.blob.vercel-storage.com`.

**How to avoid:** Add the `remotePatterns` config before writing any gallery `<Image>` components. The wildcard hostname pattern `**.public.blob.vercel-storage.com` covers all blob store IDs.

**Warning signs:** Console error `Invalid src prop ... hostname not configured under images.remotePatterns`.

### Pitfall 5: Contact Section Has Multiple Hardcoded Emails

**What goes wrong:** BUG-02 fix only updates `BookingForm.tsx` but misses other occurrences.

**Why it happens:** `ps324@byu.edu` appears in 6 files (found by codebase search). The REQUIREMENTS.md bug definition specifically targets `BookingForm.tsx`, but `contact-section.tsx` line 76, line 146, and the `mailto:` fallback (line 27) also have hardcoded email.

**How to avoid:** BUG-02 scope is `BookingForm.tsx` only (per requirements). However, when wiring CRM-01 (Server Action replaces Formspree), the `contact-section.tsx` email references should also be updated to use `siteConfig.links.email`. Note that `siteConfig.links.email` is `"mailto:ps324@byu.edu"` — the display text at line 76 should use a helper that strips the `mailto:` prefix, or add a separate `siteConfig.email` field for the raw email string.

---

## Code Examples

### CRM-01: Server Action Insert with UTM Capture

```typescript
// Source: Next.js 16 Server Actions + Drizzle ORM docs
// src/app/actions/contact.ts
'use server';

import { db } from '@/db';
import { contacts } from '@/db/schema';
import { headers } from 'next/headers';

export type ContactFormState = { success: boolean; error?: string };

export async function saveContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get('name') as string)?.trim();
  const email = (formData.get('email') as string)?.trim();
  const subject = (formData.get('subject') as string)?.trim();
  const message = (formData.get('message') as string)?.trim();

  if (!name || !email || !message) {
    return { success: false, error: 'Missing required fields' };
  }

  const headersList = await headers();
  const referer = headersList.get('referer') ?? null;

  try {
    await db.insert(contacts).values({
      name,
      email,
      subject: subject || null,
      message,
      utmSource: (formData.get('utm_source') as string) || null,
      utmMedium: (formData.get('utm_medium') as string) || null,
      utmCampaign: (formData.get('utm_campaign') as string) || null,
      referrer: referer,
    });
    return { success: true };
  } catch (err) {
    console.error('saveContact error:', err);
    return { success: false, error: 'Database error' };
  }
}
```

### CRM-02: Admin Route Cookie Check in proxy.ts

```typescript
// Addition to existing proxy() function in src/proxy.ts
// Check admin path before the main routing logic
if (
  request.nextUrl.pathname.startsWith('/admin') &&
  !request.nextUrl.pathname.startsWith('/admin/login')
) {
  const adminSession = request.cookies.get('admin_session');
  if (!adminSession?.value) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  // Full session unseal happens in the /admin Server Component
}
```

### BUG-02: BookingForm.tsx Email Fix

**File:** `src/components/booking/BookingForm.tsx`

**Current code (line 173):**
```typescript
organizer: { name: 'Philip Sun', email: 'ps324@byu.edu' },
```

**Fixed code:**
```typescript
import { siteConfig } from '@/data/site-config';
// At top of file. Then:
const organizerEmail = siteConfig.links.email.replace('mailto:', '');
// ...
organizer: { name: 'Philip Sun', email: organizerEmail },
```

**Current code (line 196):**
```typescript
`...With: Philip Sun (ps324@byu.edu)\n\n...`
```

**Fixed code:**
```typescript
`...With: Philip Sun (${organizerEmail})\n\n...`
```

**Note:** `siteConfig.links.email` is currently `"mailto:ps324@byu.edu"`. Strip the `mailto:` prefix. Alternatively, add `email: 'ps324@byu.edu'` as a separate field on `siteConfig` to avoid the string manipulation. Adding a raw `email` field to `siteConfig` is the cleaner approach and enables the `contact-section.tsx` display text to also use it.

### Gallery: Next.js Image with Vercel Blob

```typescript
// Source: Next.js 16.1.7 official docs
import Image from 'next/image';
import type { GalleryPhoto } from '@/data/photography';

export function GalleryGrid({ photos }: { photos: GalleryPhoto[] }) {
  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="relative mb-4 break-inside-avoid">
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="w-full h-auto rounded-lg"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
```

**`priority`/`preload` note:** In Next.js 16, `priority` is deprecated in favor of `preload`. Use `preload` on the first hero image only; `loading="lazy"` on all gallery images.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` + `export function middleware()` | `proxy.ts` + `export function proxy()` | Next.js v16.0.0 | Project already uses `proxy.ts` correctly |
| `priority` prop on next/image | `preload` prop | Next.js 16 | Use `preload` not `priority`; `priority` still works but deprecated |
| Formspree for contact forms | Server Actions + DB insert | Next.js 13+ App Router | Phase 2 replaces Formspree with Server Action to own the data |
| `boolean` columns in Drizzle + Neon | `text('true'/'false')` | Phase 1 decision | Avoids PgBouncer prepared-statement issues |

**Deprecated/outdated:**
- `images.domains` array in next.config: replaced by `images.remotePatterns` (object array) since Next.js 12.3. Use `remotePatterns` only.
- `middleware.ts` file convention: renamed to `proxy.ts` in Next.js 16. Project is already on `proxy.ts`.
- `NEXT_PUBLIC_FORMSPREE_ID` env var: can be removed after Phase 2 CRM Server Action is wired.

---

## BUG-02 Detailed Fix Map

**Requirement:** Remove hardcoded `ps324@byu.edu` from `BookingForm.tsx` and source from `siteConfig`.

**Current occurrences in BookingForm.tsx (verified by grep):**
- Line 173: `organizer: { name: 'Philip Sun', email: 'ps324@byu.edu' }`
- Line 196: `...With: Philip Sun (ps324@byu.edu)\n\n...`

**Current `siteConfig.links.email`:** `"mailto:ps324@byu.edu"` — has `mailto:` prefix.

**Recommended fix approach — add `siteConfig.email` field:**
```typescript
// src/data/site-config.ts
export const siteConfig = {
  name: "Philip Sun",
  // ...existing fields...
  email: "ps324@byu.edu",           // NEW: raw email for programmatic use
  links: {
    // ...existing links...
    email: "mailto:ps324@byu.edu",  // Keep for <a href> usage
  },
};
```

Then in `BookingForm.tsx`:
```typescript
import { siteConfig } from '@/data/site-config';
// Use siteConfig.email directly — no string manipulation needed
organizer: { name: siteConfig.name, email: siteConfig.email },
// Line 196:
`...With: ${siteConfig.name} (${siteConfig.email})\n\n...`
```

**Other hardcoded email occurrences (outside BUG-02 scope but should be updated in same pass):**
- `src/data/social-links.ts` line 10 — can use `siteConfig.links.email`
- `src/components/layout/footer.tsx` line 37 — display text, use `siteConfig.email`
- `src/components/sections/contact-section.tsx` line 27, 76, 146 — CRM-01 work will replace the Formspree path; line 76 display text should use `siteConfig.email`

---

## Validation Architecture

`nyquist_validation` is enabled (per `.planning/config.json`).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.0.18 + React Testing Library 16.3.2 |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `npx vitest run src/app/__tests__/ --reporter=verbose` |
| Full suite command | `npx vitest run --reporter=verbose` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BUG-02 | `BookingForm` organizer email sourced from siteConfig, not hardcoded | unit | `npx vitest run src/components/booking/BookingForm.test.tsx -x` | ❌ Wave 0 |
| CRM-01 | `saveContact()` Server Action inserts name/email/message into contacts | unit | `npx vitest run src/app/actions/contact.test.ts -x` | ❌ Wave 0 |
| CRM-03 | `saveContact()` captures utm_source, utm_medium, utm_campaign, referrer | unit | `npx vitest run src/app/actions/contact.test.ts -x` | ❌ Wave 0 (same file) |
| PHOTO-01 | GalleryGrid renders photos filtered by category | unit | `npx vitest run src/app/(photography)/photography/gallery/GalleryGrid.test.tsx -x` | ❌ Wave 0 |
| PHOTO-02 | Pricing page renders package prices as non-zero integers in cents | unit | `npx vitest run src/app/(photography)/photography/pricing/page.test.tsx -x` | ❌ Wave 0 |
| SUB-02 | photography.philipsun.com/gallery proxy rewrite resolves correctly | unit | `npx vitest run src/app/__tests__/proxy.test.ts -x` | ✅ extend existing |
| CRM-02 | Admin redirect: proxy sends unauthenticated /admin to /admin/login | unit | `npx vitest run src/app/__tests__/proxy.test.ts -x` | ✅ extend existing |

**Note on Server Actions in Vitest:** Server Actions (`'use server'`) run in Node.js. In Vitest (jsdom environment), mock `next/headers` to return a test Headers object. Mock `@/db` to capture insert arguments without a real DB connection.

### Sampling Rate

- **Per task commit:** `npx vitest run src/app/__tests__/ --reporter=verbose`
- **Per wave merge:** `npx vitest run --reporter=verbose && npm run build`
- **Phase gate:** Full suite green + `npm run build` exits 0 before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `src/components/booking/BookingForm.test.tsx` — covers BUG-02 (organizer email assertion)
- [ ] `src/app/actions/contact.test.ts` — covers CRM-01, CRM-03 (mock db insert, assert UTM + referer)
- [ ] `src/app/(photography)/photography/gallery/GalleryGrid.test.tsx` — covers PHOTO-01 (category filter renders correct photos)
- [ ] `src/app/(photography)/photography/pricing/page.test.tsx` — covers PHOTO-02 (packages rendered with non-zero prices)
- [ ] `src/test/setup.ts` already exists with jsdom + jest-dom; no changes needed

---

## Open Questions

1. **Package prices: static data or DB seed?**
   - What we know: `packages` table exists in Neon DB, but may or may not be seeded yet (migration ran but no seed script existed in Phase 1).
   - What's unclear: Whether prices are decided/known (Philip has actual pricing) or still TBD.
   - Recommendation: Use static TypeScript data (`src/data/photography.ts`) for Phase 2. This is simpler, immediately deployable, and can be the input for a DB seed script in Phase 3 when the booking flow needs live package records.

2. **Gallery image count and initial upload workflow**
   - What we know: Images must come from external storage (not git repo).
   - What's unclear: How many photos Philip wants in the initial gallery and whether he has an existing workflow preference (drag-drop dashboard upload vs SDK-based upload script).
   - Recommendation: Start with Vercel Blob dashboard drag-drop upload. Record blob URLs in `src/data/photography.ts` as a manifest. No upload API route needed in Phase 2.

3. **Contact form: keep Formspree as fallback or remove entirely?**
   - What we know: Phase 2 CRM-01 requires DB persistence. The Formspree path still emails Philip.
   - What's unclear: Whether email notification on contact is still desired alongside DB storage.
   - Recommendation: Remove the Formspree path entirely in Phase 2. DB persistence is the new source of truth. Email notification is a Phase 3 concern (Resend or similar). Formspree as a fallback creates confusing dual-path code.

4. **Admin route: main domain only or both subdomains?**
   - What we know: Phase 2 spec says `/admin` on main domain (`philipsun.com/admin`).
   - What's unclear: Nothing — this is specified. The proxy already passes main domain through without rewrite.
   - Recommendation: Confirm admin stays on main domain. The photography subdomain admin would be future scope.

---

## Sources

### Primary (HIGH confidence)
- Next.js 16.1.7 official docs (nextjs.org/docs) — proxy.ts API, Server Actions, next/image remotePatterns, Image component props including `preload` deprecation of `priority`
- Vercel Blob official docs (vercel.com/docs/storage/vercel-blob) — pricing model, upload SDK, public store CDN caching, `put()` API
- Cloudflare R2 pricing page (developers.cloudflare.com/r2/pricing/) — free tier (10 GB, 1M class A ops), zero egress fee
- Direct codebase read — `src/proxy.ts`, `src/db/schema.ts`, `src/components/booking/BookingForm.tsx`, `src/data/site-config.ts`, `src/components/sections/contact-section.tsx`, `src/app/(photography)/` directory structure

### Secondary (MEDIUM confidence)
- npm registry (npm view) — `@vercel/blob` 2.3.1, `iron-session` 8.0.4 confirmed as latest on 2026-03-17
- STACK.md, CONCERNS.md, Phase 1 PLAN.md — internal planning docs for confirmed architectural decisions

### Tertiary (LOW confidence — flag for validation)
- iron-session App Router pattern (two-stage: proxy presence check + Server Component unseal) — based on documented iron-session v8 API and Next.js proxy docs, but exact integration pattern for `proxy.ts` + Server Component should be validated against iron-session v8 README before implementation.

---

## Metadata

**Confidence breakdown:**
- Image storage decision (Vercel Blob): HIGH — official docs read, pricing verified, Next.js integration confirmed
- Route structure: HIGH — read from actual proxy.ts and filesystem
- CRM Server Action pattern: HIGH — Next.js 16 Server Actions are stable and documented
- Admin auth (iron-session in proxy.ts): MEDIUM — API verified, two-stage proxy pattern is standard but exact iron-session v8 + proxy integration should be validated against iron-session README
- Gallery/pricing patterns: HIGH — standard Next.js patterns with verified Image component API
- BUG-02 fix: HIGH — exact file and line numbers verified by grep

**Research date:** 2026-03-17
**Valid until:** 2026-04-17 (stable libraries; Next.js Image API unlikely to change in 30 days)
