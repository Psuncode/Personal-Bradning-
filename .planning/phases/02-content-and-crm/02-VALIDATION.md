---
phase: 2
slug: content-and-crm
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 + React Testing Library 16.3.2 |
| **Config file** | `vitest.config.ts` (exists) |
| **Quick run command** | `npx vitest run src/app/__tests__/ --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/app/__tests__/ --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green + `npm run build` exits 0
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 0 | BUG-02 | unit | `npx vitest run src/components/booking/BookingForm.test.tsx -x` | ❌ W0 | ⬜ pending |
| 2-02-01 | 02 | 0 | CRM-01, CRM-03 | unit | `npx vitest run src/app/actions/contact.test.ts -x` | ❌ W0 | ⬜ pending |
| 2-03-01 | 03 | 0 | PHOTO-01 | unit | `npx vitest run src/app/__tests__/proxy.test.ts -x` | ✅ extend | ⬜ pending |
| 2-03-02 | 03 | 0 | PHOTO-02 | unit | `npx vitest run src/app/(photography)/photography/pricing/page.test.tsx -x` | ❌ W0 | ⬜ pending |
| 2-03-03 | 03 | 1 | PHOTO-01 | unit | `npx vitest run src/app/(photography)/photography/gallery/GalleryGrid.test.tsx -x` | ❌ W0 | ⬜ pending |
| 2-02-02 | 02 | 1 | CRM-02 | unit | `npx vitest run src/app/__tests__/proxy.test.ts -x` | ✅ extend | ⬜ pending |
| 2-02-03 | 02 | 1 | SUB-02 | unit | `npx vitest run src/app/__tests__/proxy.test.ts -x` | ✅ extend | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/booking/BookingForm.test.tsx` — covers BUG-02 (organizer email sourced from siteConfig, not hardcoded)
- [ ] `src/app/actions/contact.test.ts` — covers CRM-01 (db insert), CRM-03 (UTM + referer capture); mock `@/db` and `next/headers`
- [ ] `src/app/(photography)/photography/gallery/GalleryGrid.test.tsx` — covers PHOTO-01 (category filter renders correct photos)
- [ ] `src/app/(photography)/photography/pricing/page.test.tsx` — covers PHOTO-02 (packages render with non-zero prices)
- [ ] `src/app/__tests__/proxy.test.ts` — extend with: admin redirect test (CRM-02), SUB-02 gallery/pricing path rewrite tests
- [ ] `src/test/setup.ts` already exists — no changes needed
- [ ] Vercel Blob: `BLOB_READ_WRITE_TOKEN` env var in `.env.local` and Vercel project settings
- [ ] `next.config.ts`: add `remotePatterns` for `**.public.blob.vercel-storage.com`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Gallery displays real photos by category on photography subdomain | PHOTO-01 | Requires live Vercel Blob URLs and DNS | Visit photography.philipsun.com/gallery — filter by Portrait, Landscape, Event |
| Pricing page shows real package prices | PHOTO-02 | Visual + live subdomain | Visit photography.philipsun.com/pricing — verify no "contact for pricing" text |
| Admin login + dashboard shows contacts | CRM-02 | Auth flow + live DB data | Visit philipsun.com/admin — redirect to login, enter password, see contacts table |
| Contact form submission appears in admin | CRM-01, CRM-02 | Full round-trip with live DB | Submit contact form → check /admin — submission with UTM params visible |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
