# Next.js Cache Components Review

**Scope:** every `unstable_cache`, `revalidateTag`, `revalidatePath`, and React `cache()` call.
**Lens:** `.agents/skills/next-cache-components/SKILL.md` (Next.js 16 Cache Components: `use cache`, `cacheLife`, `cacheTag`, `updateTag`, `revalidateTag`).
**Codebase context:** Next 16.1.6, React 19.2.3. `cacheComponents` is **not** enabled in `next.config.ts`. No `use cache` directives, no React `cache()` imports anywhere in `src/`. `experimental.ppr` is not set.

---

## Inventory

| Location | API | Purpose |
|---|---|---|
| `src/lib/serverCalendar.ts:210-214` | `unstable_cache(_fetchServerAvailability, [TAG], { revalidate: 120, tags: [TAG] })` | Wrap iCloud CalDAV pull + busy-day pre-compute for 3-month window. TTL recently lowered from 900s to 120s (commit `f04e811`). |
| `src/lib/serverCalendar.ts:198` | `export const SERVER_AVAILABILITY_TAG = 'server-calendar-availability'` | Single broad tag, shared by the cache entry and every invalidator. |
| `src/app/(main)/api/checkout/route.ts:174` | `revalidateTag(SERVER_AVAILABILITY_TAG, 'max')` | Post-Stripe-session-create write-path invalidation. Wrapped in try/catch (best-effort). |
| `src/app/(main)/api/webhooks/stripe/route.ts:272-279` | `safeRevalidateAvailability()` → `revalidateTag(TAG, 'max')` | Called on `checkout.session.completed`, `checkout.session.expired` (only when row was deleted), `charge.refunded`, `payment_intent.payment_failed` (only when session id resolvable). |
| `src/lib/blog.ts` (whole file) | **None** — pure `fs.readFileSync` + `gray-matter` per call. | `getAllPosts` / `getPostBySlug` are uncached; rely on `generateStaticParams` to make the call set finite at build time. |
| `src/app/(main)/feed.xml/route.ts:4` | `export const dynamic = "force-static"` | Pre-Cache-Components knob; should migrate per SKILL §Migration. |
| **`revalidatePath`** | **No call sites.** | – |
| **React `cache()`** | **No call sites.** | `getAllPosts()` runs **6 times per render** of `/blog/[slug]` alone (page.tsx imports it 3×, plus sitemap, feed, homepage). Each call re-walks `content/blog/` and re-reads every MDX file. |

---

## Findings (highest severity first)

### CRITICAL — none

No data-loss, no broken invalidation, no exposed cookies-in-cache. The booking-side cache layer is *functional*: every confirmed write path calls `revalidateTag('max')` and `/api/checkout` additionally bypasses the cache by re-fetching CalDAV directly inside `validateBookingDateAgainstCalendar` (defense in depth — see CR-03 in 03-REVIEW.md). The 120s window can't double-book; the DB UNIQUE constraint is the final backstop.

### HIGH

**H1. `revalidateTag(TAG, 'max')` second-arg semantics — verify behavior matches intent.**
`'max'` per the SKILL is the *built-in cache life profile* meaning "invalidate all profiles". Both call sites use `'max'` defensively, which is fine **today** because `unstable_cache` ignores the second arg in Next 16 (it predates Cache Components). But: if/when `getServerAvailability` is migrated to `'use cache'` and tagged via `cacheTag()` with a specific `cacheLife` profile (e.g. `'minutes'`), `'max'` will still invalidate it — that's the right call. **No bug, but worth a comment** explaining the choice survives migration. The current inline comment ("`'max' = invalidate all profiles`") is correct.

**H2. Race window on revalidate-during-write is wider than the comments imply.**
`/api/checkout` calls `revalidateTag` *after* `pendingReservations` row is inserted **and after Stripe session is created** (line 174). Between the DB insert (line 117) and the `revalidateTag` call there is a ~200–600ms Stripe round-trip. A concurrent page render of `/photography/book` during that window will see:
- the new pending row (DB is consistent), **but**
- a cache entry that was generated *before* the row existed (TTL up to 120s)

Result: that page render keeps showing the slot as bookable until the next miss. This is the bug the 15m→2m TTL drop was meant to mitigate; lowering further wouldn't help because the window is on the **write** side, not the read side. **Fix:** call `revalidateTag` *immediately after* the `pendingReservations` insert (line 117), then again after the Stripe call (idempotent). Cost: one extra invalidation in the unhappy path. Alternative: move to `updateTag()` semantics once migrated to `use cache` — that guarantees same-request freshness.

**H3. `getAllPosts()` is called 5–6× per blog page render, uncached.**
Every call re-reads `content/blog/**/*.mdx` from disk and re-runs `gray-matter` + `reading-time`. For `/blog/[slug]`:
- `generateStaticParams()` — 1 call
- `generateMetadata()` → `getPostBySlug()` — 1 call (re-walks dir)
- page body → `getPostBySlug()` + `getAllPosts()` for `RelatedPosts` — 2 calls
- plus `og/route.tsx` re-renders for the same slug

At build time this is **N posts × ~5 walks**. With folder-based posts and co-located images, each walk is `O(folders × fs.readFileSync)`. Today this is fine (small corpus) but it's the single biggest quick win: wrap `getAllPosts` and `getPostBySlug` in React's `cache()` so they dedupe **within a request**. Two-line change, zero invalidation surface (filesystem is the source of truth and rebuilds run `prebuild`).

### MEDIUM

**M1. Single broad tag = "all or nothing" invalidation.**
`SERVER_AVAILABILITY_TAG` covers the full 3-month window. A refund 8 weeks out invalidates the cache for someone browsing next week's slots. With a 120s TTL and a low-traffic site this is acceptable, but the SKILL §Cache Invalidation example shows the granular pattern: `cacheTag('availability', ${'month-' + YYYYMM})`. Worth doing when migrating to `use cache` — partitions cache misses by month.

**M2. `_fetchServerAvailability` fetches a 3-month window every miss.**
The cache key has no arguments (the function takes none). On miss, CalDAV pulls **all events from month start through `endOfMonth(now+2)`** — typically 60–90 days. A page render that needs only "today + next 14 days" pays for the full 3-month CalDAV round-trip plus the day-by-day `getAvailableSlots` loop. Acceptable today; if/when slot density grows, parameterize by date range and let the per-arg cache key partition naturally.

**M3. `feed.xml` uses legacy `export const dynamic = "force-static"`.**
Per SKILL §Migration, this should become `'use cache' + cacheLife('max')` once `cacheComponents: true` is flipped. Same applies to `sitemap.ts` and `robots.ts` if/when added. Not urgent — pure migration hygiene.

**M4. No documented invalidation contract for `'charge.refunded'` partial refunds.**
The webhook treats *any* refund as "release the slot" (line 367 — `status: 'cancelled'`, unconditional). If Stripe ever issues a partial refund (e.g. you refund 50% as a goodwill credit but keep the booking), the cache will (correctly) drop the slot from availability **and** the booking will be cancelled in the DB. That's a domain bug, not a cache bug, but the cache invalidation here is downstream of it — flagging because the cache change masks the underlying status-machine gap.

### LOW

**L1.** The `unstable_cache` keyParts `[SERVER_AVAILABILITY_TAG]` doubles as the tag (line 212). When migrating to `use cache`, keyParts disappears (per SKILL §Migrating); only `cacheTag()` remains. Will simplify ~3 lines.

**L2.** `getServerAvailability` is called from both `/meet` (free 30-min calls, all weekdays) and `/photography/book` (paid photography sessions, same calendar). Both share the same cache entry. That's correct (same iCloud calendar = same busy windows), but the docstring on line 201 only mentions `/api/checkout` as a mutator. Add `/api/webhooks/stripe/*` to that list — it's the more frequent mutator path in production.

**L3.** No `Suspense` boundary around `<BookingForm initialData={availability} />` on `/meet` (page.tsx:26) or `<PhotographyBookingForm>` on `/photography/book`. Once `cacheComponents` is on, the SKILL pattern (§Three Content Types) calls for a `Suspense` wrapper around any dynamic-shaped component that takes cached data, so the static shell can prerender independently. Today's full-page render-on-await blocks TTFB on the CalDAV pull on every cache miss.

**L4.** `safeRevalidateAvailability('payment_intent.payment_failed')` only fires when `metadata.checkoutSessionId` is set on the PaymentIntent (route.ts:402) — and the comment notes we don't currently set it. That branch is effectively dead. Cache will stay stale until the 30-min DB sweep + the 120s TTL elapse, but since no row was inserted on payment-failed paths, "stale" here just means "the slot still looks pending-held" which is the truthful state.

---

## Recommendations (priority-ordered)

1. **(H3) Wrap `getAllPosts` and `getPostBySlug` in React `cache()`** — pure win, ~3 lines in `src/lib/blog.ts`, no invalidation surface to manage. Pays off most at build time.
2. **(H2) Move `revalidateTag` in `/api/checkout` to fire immediately after `pendingReservations` insert** (line 117), keep the post-Stripe call too. Closes the ~500ms write-race window cleanly.
3. **(M3 + roadmap)** Enable `cacheComponents: true` in `next.config.ts`. Migrate `getServerAvailability` to `'use cache' + cacheTag(...) + cacheLife({revalidate: 120})`. Drop the `force-static` on `feed.xml`. This is a one-PR sweep — file paths above are the full surface area.
4. **(M1)** When migrating, partition availability by month: `cacheTag('availability', \`availability-\${YYYYMM}\`)`. Invalidators upgrade to `revalidateTag('availability', 'max')` (broad) for safety, with a future option to target a single month.
5. **(L3)** Once on `cacheComponents`, wrap both booking forms in `<Suspense>` so the static page shell streams before CalDAV resolves. Big TTFB win on cold cache.
6. **(L2)** Update the `getServerAvailability` docstring to list the Stripe webhook routes as mutators.

No source files were edited.
