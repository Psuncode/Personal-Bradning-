# Plan 02-02 — Execution Summary

**Status:** Complete  
**Wave:** 2  
**Completed:** 2026-03-18

## What Was Built

Created saveContact Server Action for CRM data capture, rewired ContactSection to use it (replacing Formspree), added UTM tracking and referrer capture.

## Key Files

### created
- `src/app/actions/contact.ts` — Server Action `saveContact`: validates name/email/message, inserts into contacts table, captures utm_source/medium/campaign from FormData and HTTP Referer from headers

### modified
- `src/components/sections/contact-section.tsx` — Complete rewrite:
  - Removed Formspree fetch and mailto fallback
  - Added `useActionState` (React 19) wired to `saveContact`
  - Added `useEffect` reading UTM params from `window.location.search`
  - Three hidden `<input>` fields pass UTM values via FormData
  - All hardcoded `ps324@byu.edu` replaced with `siteConfig.email`/`siteConfig.links.email`

## Deviations

None.

## Self-Check: PASSED

- contact.test.ts 3/3 GREEN (CRM-01 insert, CRM-03 UTM + referer, validation error)
- No Formspree references in contact-section.tsx
- No hardcoded ps324@byu.edu in contact-section.tsx
- `npm run build` exits 0
