# Session Handoff — feat/blog-system-v2

**Date:** 2026-05-19
**PR:** https://github.com/Psuncode/Personal-Bradning-/pull/1
**Commits this session:** 19 (from `1b398f3` → `4e4e51f`)
**Status:** All Critical + Warning findings from the 4-phase code review are closed in code. Migrations and info polish remain.

---

## Status snapshot — what closed, what's left

| Phase | Critical | Warning | Info | Status |
|---|---|---|---|---|
| 01 — Infrastructure | 2 closed (CR-01 admin guard, CR-02 pending_reservations) | 8 closed (WR-01..08) | 6 open (IN-01..06) | warnings done; needs migration apply |
| 02 — Content & CRM | 4 closed (CR-01..04) | 9 closed (WR-01..09) | 7 open (IN-01..07) | warnings done |
| 03 — Booking & Payments | 4 closed (CR-01..04) | 7 closed (WR-01..07) | 4 open (IN-01..04) | warnings done; needs migrations 0001+0002 apply |
| 04 — GEO & Ecommerce | 2 closed (CR-01..02) | 6 closed (WR-01..06) | 5 open (IN-01..05) | warnings done |

**Total open:** 0 critical, 0 warning, 22 info, plus 3 unapplied migrations and a few non-finding followups.

---

## Blocked on external (needs you — credentials, assets, or decisions)

1. **Apply Drizzle migrations 0001 → 0003 against Neon production.** Needs `DATABASE_URL_UNPOOLED` from Neon dashboard. Run the pre-deploy duplicate-row queries below first; if any return rows, resolve before applying. Migrations are staged in `drizzle/0001_*.sql`, `0002_*.sql`, `0003_phase01_warnings.sql`.
2. **Image audit assets (Phase 02 / Phase 04 backlog).** Gallery needs 9+ real photos, project covers still ship as SVG typography plates, ecommerce product shots are placeholders. See `docs/IMAGES_TO_UPLOAD.md` for the prioritized list.
3. **Decide ecommerce canonical surface** (Phase 04 WR-04 was resolved by aligning `llms.txt` to `ecommerce.philipsun.com`, but the actual proxy → route-group mapping for that hostname is not yet deployed). Decision: real subdomain vs. keep `/ecommerce` path?
4. **`BOOKING_NOTIFICATION_EMAIL` env var** — added by commit `f04e811`; falls back to `siteConfig.email` if unset, so non-blocking but worth setting in Vercel.
5. **`ADMIN_PASSWORD_HASH` rotation runbook** — code path supports it (CR-01 close), but the secret + rotation policy is a human decision.

---

## Unblocked code work (auto-executable)

### A. Info-level findings worth doing (have teeth)

| Ref | What | Size | Notes |
|---|---|---|---|
| **P01 IN-01** | Extract shared head-level concerns (font vars, analytics, skip link, GrainOverlay) into a sub-component used by all three route-group layouts. Root layout was added in `83bcd85` — this is the natural follow-on. | ~45 min | Touches all three group layouts. |
| **P01 IN-04** | `(ecommerce)/page.tsx` byu-* sweep — *largely closed* by `550fdfe`/`5a3c504`/`4e4e51f` but ecommerce page itself needs a final pass + verification it renders correctly. | ~20 min | Verify with visual check. |
| **P01 IN-05** | Wrap `getAllPosts()` in `React.cache` so homepage doesn't fs-walk on every render. | ~10 min | Tiny, defensible. |
| **P01 IN-06** | `(photography)/page.tsx` hard-codes `philipsun.com/photography` in JSON-LD x3 — template from `siteConfig`. | ~10 min | Trivial but real. |
| **P02 IN-01** | UTM-capture race condition — move `URLSearchParams` read into `useEffect`. | ~15 min | Add a vitest mock. |
| **P02 IN-05** | `from=` query param in `/admin/login` redirect is dead — either honor it or remove. | ~15 min | Honor it with same-origin validation. |
| **P02 IN-06** | `GalleryGrid` filter not URL-stateful — add `useSearchParams` for shareable `?category=portrait` links. | ~30 min | SEO win. |
| **P02 IN-07** | Admin dashboard: wrap `contact.email` in `mailto:` link + expandable message row. | ~20 min | UX. |
| **P03 IN-02 / IN-03** | `BookingForm.tsx` (the legacy meeting form) is dead-ish — confirm via grep, then either delete or port off `alert()` + `byu-*`. | ~20 min | Code hygiene. |
| **P03 IN-04** | Drop iCloud username from CalDAV `console.log` (PII in Vercel logs). | ~5 min | One-liner. |
| **P04 IN-01** | Add Zod validation in `src/lib/blog.ts` for frontmatter (handles `faq: null` and `howTo: {}` crashes). | ~30 min | Stronger guarantees. |
| **P04 IN-02** | Add optional `HowToStep.name` to JSON-LD. | ~15 min | Schema.org rich-result win. |
| **P04 IN-03** | Move ecommerce `<header>`/`<footer>` out of `<main>` (HTML5 landmark fix). | ~10 min | A11y. |
| **P04 IN-04** | Add `metadata.alternates.canonical` to `/blog/[slug]` and `/ecommerce`. | ~10 min | SEO leak fix. |
| **P04 IN-05** | Extend Article JSON-LD `author` with `email` and `sameAs` (LinkedIn, GitHub). | ~10 min | E-E-A-T. |

### B. Non-finding followups surfaced this session

| What | Size | Why |
|---|---|---|
| **CI workflow** (`.github/workflows/ci.yml`) running `npm run lint && npm run test -- --run && npm run build` on PR + push to `feat/blog-system-v2`/`main`. | ~20 min | No `.github/workflows/` directory exists. PR #1 is open with zero automated regression gating — the 19 commits are guarded only by local checks. **Highest leverage of any unblocked item.** |
| **`pending_reservations` orphan-cleanup cron** (Phase 03 WR-02 deferred to Wave 4). | ~45 min | Cron route + `revalidateTag` integration. |
| **`PhotographyBookingForm` integration test** mentioned in summaries — verify it exists or stub it out. | ~30 min | Coverage gap on the booking happy path. |
| **JSON-LD `image` / `dateModified` rendering test** for `/blog/[slug]` (added by `83bcd85` but tests not updated to assert). | ~20 min | Lock the WR-05 fix in tests. |
| **`safeStringify` helper test** — Phase 04 CR-02 fix (`38d0ff6`) added JSON-LD escaping; needs a test that asserts `</script>` and U+2028 are escaped. | ~15 min | Lock the critical fix. |

### C. Migration-deferred (apply once `DATABASE_URL_UNPOOLED` is available)

- Migration `0001_clear_betty_ross.sql` adds `email_sent_at` to `bookings`.
- Migration `0002_dusty_fat_cobra.sql` adds `UNIQUE(package_id, event_date)` on `bookings`, indexes + `NOT NULL package_id` on `pending_reservations`.
- Migration `0003_phase01_warnings.sql` converts `packages.active` to boolean, adds `pgEnum` constraints on `bookings.status` / `payments.status`, and adds 8 hot-lookup indexes.

---

## Carve-outs (intentionally deferred — per CLAUDE.md)

- **TS errors in `src/app/__tests__/{contact,meet}.test.tsx`** (`Property 'className' does not exist on type 'ChildNode'`). Pre-existing.
- **~16 pre-existing test failures** in `home.test.tsx`, `about.test.tsx`, `case-studies.test.tsx`, `current-focus.test.tsx`. These assert against old chrome since refactored. CLAUDE.md flags as "Not in scope."
- **`/resume` route reintroduction** — explicitly forbidden by CLAUDE.md.
- **Real images for gallery / project covers / ecommerce** — needs human asset upload.

---

## Suggested pre-deploy queries (run before applying migrations)

These come verbatim from the migration commit messages (`234add0`, `bf4951e`, `20e8b3e`). Run on the live DB **before** applying 0001/0002/0003 — if any return rows, resolve first or the migration will fail.

```sql
-- Before 0002: check for existing duplicate (package_id, event_date) bookings
SELECT package_id, event_date, COUNT(*) AS dupe_count
FROM bookings
GROUP BY package_id, event_date
HAVING COUNT(*) > 1;

-- Before 0002: check for pending_reservations with NULL package_id
SELECT id, stripe_session_id, expires_at
FROM pending_reservations
WHERE package_id IS NULL;

-- Before 0003: check for non-canonical packages.active values
-- (the USING cast assumes only 'true'/'false'; 'TRUE' or '1' will fail)
SELECT DISTINCT active
FROM packages
WHERE active NOT IN ('true', 'false');

-- Before 0003: check for booking statuses not in the new enum
SELECT DISTINCT status
FROM bookings
WHERE status NOT IN ('confirmed', 'cancelled', 'completed');

-- Before 0003: check for payment statuses not in the new enum
SELECT DISTINCT status
FROM payments
WHERE status NOT IN ('pending', 'succeeded', 'failed', 'refunded');
```

After applying, smoke-check:

```sql
-- Verify 0001
SELECT column_name FROM information_schema.columns
WHERE table_name='bookings' AND column_name='email_sent_at';

-- Verify 0002
SELECT indexname FROM pg_indexes WHERE tablename='bookings'
  AND indexname LIKE '%event_date%';

-- Verify 0003 enums
SELECT typname FROM pg_type WHERE typname IN ('booking_status','payment_status');
```

---

## Recommended next step

See parent message — recommendation is to land a CI workflow so the 19 closed findings can't silently regress while the rest of this work proceeds.
