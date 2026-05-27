---
phase: 3
slug: booking-and-payments
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-19
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.0.18 + React Testing Library 16.3.2 |
| **Config file** | `vitest.config.ts` (project root) |
| **Quick run command** | `npx vitest run src/app/__tests__/` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/app/__tests__/`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-W0-01 | Wave 0 | 0 | BUG-03 | unit | `npx vitest run src/app/__tests__/booking-form.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 3-W0-02 | Wave 0 | 0 | BUG-01 | unit | `npx vitest run src/app/__tests__/availability.test.ts` | ❌ Wave 0 | ⬜ pending |
| 3-W0-03 | Wave 0 | 0 | PHOTO-03 | unit | `npx vitest run src/app/__tests__/booking.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 3-W0-04 | Wave 0 | 0 | PHOTO-04 | unit | `npx vitest run src/app/__tests__/webhook.test.ts` | ❌ Wave 0 | ⬜ pending |
| 3-01-01 | 01 | 1 | BUG-03 | unit | `npx vitest run src/app/__tests__/booking-form.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 3-01-02 | 01 | 1 | BUG-01 | unit | `npx vitest run src/app/__tests__/availability.test.ts` | ❌ Wave 0 | ⬜ pending |
| 3-02-01 | 02 | 1 | PHOTO-03 | unit | `npx vitest run src/app/__tests__/booking.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 3-03-01 | 03 | 2 | PHOTO-03 | unit | `npx vitest run src/app/__tests__/booking.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 3-04-01 | 04 | 2 | PHOTO-04 | unit | `npx vitest run src/app/__tests__/webhook.test.ts` | ❌ Wave 0 | ⬜ pending |
| 3-04-02 | 04 | 2 | PHOTO-04 | unit | `npx vitest run src/app/__tests__/webhook.test.ts` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/app/__tests__/booking-form.test.tsx` — stubs for BUG-03: Set immutability in `BookingForm` month navigation
- [ ] `src/app/__tests__/availability.test.ts` — stubs for BUG-01: all-day event slot blocking + Mountain Time day bucketing
- [ ] `src/app/__tests__/booking.test.tsx` — stubs for PHOTO-03: `PhotographyBookingForm` step render + navigation + `?pkg=` pre-selection
- [ ] `src/app/__tests__/webhook.test.ts` — stubs for PHOTO-04: webhook handler idempotency + email trigger

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Stripe Checkout redirect completes end-to-end with test card | PHOTO-03 | Requires live Stripe test environment | Use card `4242 4242 4242 4242`, verify redirect to `/photography/book/success` |
| Resend email delivers with ICS attachment visible in Gmail | PHOTO-04 | Requires live email delivery | Trigger webhook with test event, check `bookings@photography.psunproduction.com` inbox |
| ICS attachment opens in Apple Calendar | PHOTO-04 | Calendar app UI, can't automate | Download ICS from email, verify opens with correct date/time/organizer |
| Webhook idempotency with duplicate Stripe test event | PHOTO-04 | Requires Stripe CLI test event resend | `stripe trigger checkout.session.completed --override ...` twice, verify single DB row |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
