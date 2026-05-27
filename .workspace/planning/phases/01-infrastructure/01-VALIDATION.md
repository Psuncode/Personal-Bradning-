---
phase: 1
slug: infrastructure
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-17
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run src/__tests__/proxy.test.ts` |
| **Full suite command** | `npm run test:coverage` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/__tests__/proxy.test.ts`
- **After every plan wave:** Run `npm run test:coverage`
- **Before `/gsd:verify-work`:** Full suite must be green + `npx drizzle-kit migrate` clean
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | SUB-01 | unit | `npx vitest run src/__tests__/proxy.test.ts` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 0 | SUB-01 | unit | `npx vitest run src/__tests__/proxy.test.ts` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 1 | SUB-01 | unit | `npx vitest run src/__tests__/proxy.test.ts` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 1 | SUB-01 | manual | `npx drizzle-kit migrate && echo "OK"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/__tests__/proxy.test.ts` — unit tests for proxy routing (SUB-01: photography rewrite, preview fallback, main domain pass-through)
- [ ] `src/app/(main)/layout.tsx` — moved from `src/app/layout.tsx` (existing routes restructured)
- [ ] `src/app/(photography)/layout.tsx` and `src/app/(photography)/page.tsx` — route group placeholder
- [ ] `src/app/(ecommerce)/layout.tsx` and `src/app/(ecommerce)/page.tsx` — route group placeholder
- [ ] `src/db/schema.ts` — all 6 table definitions (contacts, inquiries, bookings, payments, packages, pending_reservations)
- [ ] `src/db/index.ts` — Drizzle db instance (neon-http, pooled DATABASE_URL)
- [ ] `drizzle.config.ts` — at project root, uses DATABASE_URL_UNPOOLED for migrations
- [ ] `drizzle/` directory — created by `drizzle-kit generate`
- [ ] Package installs: `drizzle-orm`, `@neondatabase/serverless`, `drizzle-kit`
- [ ] Env vars: `DATABASE_URL` and `DATABASE_URL_UNPOOLED` in `.env.local` and Vercel project settings

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `photography.philipsun.com` routes to photography page in production | SUB-01 | Requires DNS propagation (24-48h) and Vercel CNAME config | Visit photography.philipsun.com after DNS propagation — should see photography placeholder page |
| `ecommerce.philipsun.com` routes to ecommerce page in production | SUB-01 | Requires DNS propagation and Vercel CNAME config | Visit ecommerce.philipsun.com after DNS propagation — should see ecommerce placeholder page |
| `drizzle-kit migrate` completes without errors | SUB-01 | Requires live Neon DB with DATABASE_URL_UNPOOLED | Run `npx drizzle-kit migrate` — output should show 6 tables created with no errors |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
