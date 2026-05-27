# Plan 02-01 — Execution Summary

**Status:** Complete  
**Wave:** 1  
**Completed:** 2026-03-18

## What Was Built

Built the full photography subdomain experience (gallery + pricing + home + nav), fixed BUG-02 hardcoded email, configured Vercel Blob remote image patterns.

## Key Files

### created
- `src/data/photography.ts` — GalleryPhoto/Package types, 9 galleryPhotos (3 per category), 3 photographyPackages with cent prices, photoCategories
- `src/app/(photography)/photography/gallery/GalleryGrid.tsx` — Client component with portrait/landscape/event filter tabs, masonry grid
- `src/app/(photography)/photography/gallery/page.tsx` — Server page importing GalleryGrid
- `src/app/(photography)/photography/pricing/page.tsx` — Pricing page, 3 packages, explicit dollar amounts, no "contact for pricing"

### modified
- `src/data/site-config.ts` — Added `email: "ps324@byu.edu"` raw field (without mailto: prefix)
- `src/components/booking/BookingForm.tsx` — Replaced hardcoded `ps324@byu.edu` with `siteConfig.name`/`siteConfig.email` (BUG-02 fixed)
- `next.config.ts` — Added `images.remotePatterns` for `**.public.blob.vercel-storage.com`
- `src/app/(photography)/photography/page.tsx` — Replaced placeholder with landing page linking to /gallery and /pricing
- `src/app/(photography)/layout.tsx` — Added nav bar with /gallery and /pricing links (subdomain-relative)

## Deviations

- `src/components/sections/hero.tsx` and `src/components/sections/contact-section.tsx` received minor accessibility improvements (useReducedMotion, whileInView animations) during execution.

## Self-Check: PASSED

- `npm run build` exits 0
- BUG-02 and PHOTO-01 and PHOTO-02 Wave 0 tests GREEN
- No hardcoded ps324@byu.edu in BookingForm.tsx
- Nav links use /gallery and /pricing (not /photography/gallery)
