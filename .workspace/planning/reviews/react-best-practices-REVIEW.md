# React Best Practices Review

**Scope:** `src/components/`, every `page.tsx` / `layout.tsx`
**Lens:** `.agents/skills/react-best-practices/SKILL.md` (Vercel React/Next.js performance rules)
**Branch:** `feat/blog-system-v2`
**Status:** Read-only audit — no source edits

---

## TL;DR — top findings

1. **`"use client"` is over-applied to leaf sections that don't need it.** `Hero`, `About`, `CaseStudies`, `CurrentFocus`, `ContentGrid`, `ProjectCard`, `BlogCover` are marked client only to support Framer Motion entrance animations. Each pulls Framer Motion into the client bundle of the homepage, blog index, and project pages, dragging interactivity into otherwise static content. The shell is RSC but the heavy ink is on the client — exactly the Vercel anti-pattern `bundle-dynamic-imports` is designed to fix.
2. **Booking forms duplicate ~600 lines of nearly-identical state, effect, and calendar logic.** `BookingForm.tsx` (492 lines) and `PhotographyBookingForm.tsx` (744 lines) maintain ~10 `useState` slots each, the same `loadedMonths` set, the same per-month `useEffect` fetch, and the same `busyDates` memo. A single `useReducer` would collapse the wizard state, and the calendar + month-fetch should live in a shared `useCalendarAvailability` hook.
3. **Array indices are used as `key` in mutable-shape lists.** `case-studies.tsx`, `content-grid.tsx`, `project-detail-view.tsx`, `gallery.tsx`, `mdx/gallery.tsx`, the `availableSlots` lists in both booking forms — all use `key={i}` / `key={index}` / `key={idx}`. For lists where ordering or filtering can change (booking time slots, gallery, metrics), this breaks React's reconciliation and the focus/selection bugs that come with it (e.g. selected `selectedSlot` referential equality already depends on object identity, which `key={idx}` makes fragile).

---

## 1. RSC vs client boundary (overuse of `"use client"`)

### Inventory

| File | `"use client"` | Real interactivity? | Notes |
|---|---|---|---|
| `components/cal-embed.tsx` | yes | yes | `useEffect` to init Cal.com SDK |
| `components/motion-wrapper.tsx` | yes | n/a | Re-exports `motion.*` — utility module |
| `components/project-card.tsx` | yes | no | Only `motion.div` wrapping `Card` |
| `components/sections/hero.tsx` | yes | no | `useReducedMotion` + entrance only |
| `components/sections/about.tsx` | yes | no | `motion.div` `whileInView` only |
| `components/sections/case-studies.tsx` | yes | no | Entrance + `whileHover` arrow |
| `components/sections/current-focus.tsx` | yes | no | Single `motion.div` entrance |
| `components/sections/content-grid.tsx` | yes | no | Single `motion.div` entrance |
| `components/sections/blog-list.tsx` | yes | yes | Tag filter `useState` |
| `components/sections/contact-section.tsx` | yes | yes | `useActionState` + UTM read |
| `components/layout/navbar.tsx` | yes | yes | Dropdown, sheet, `usePathname` |
| `components/photography/PhotographyNav.tsx` | yes | yes | Mobile menu, `usePathname` |
| `components/editorial/grain-overlay.tsx` | (n/a check) | – | – |
| `components/ui/{accordion,separator,sheet}.tsx` | yes | yes | Radix needs DOM |
| `components/booking/BookingForm.tsx` | yes | yes | Wizard |
| `components/booking/PhotographyBookingForm.tsx` | yes | yes | Wizard |
| `app/(main)/admin/login/page.tsx` | yes | yes | `useActionState` |

### Findings

- **`hero.tsx`, `about.tsx`, `case-studies.tsx`, `current-focus.tsx`, `content-grid.tsx`, `project-card.tsx` are client-only solely to host Framer Motion.** None of them have local state or event handlers that genuinely need a client component. Recommended pattern: keep the section as an RSC and wrap *only* the animated element in a tiny client wrapper (e.g. `motion-wrapper.tsx` already exports `MotionDiv` — extend with a `<FadeInOnView />` client component and import that inside RSCs). This matches Vercel's `bundle-conditional` / `bundle-dynamic-imports` rules.
- **`content-grid.tsx` mixes a 99-item static `gridItems` array (data) with a client component.** The data has no reason to ship to the browser — the array should live in `src/data/` (or be inlined in an RSC parent) and the only client piece should be the `motion.div` entrance shell.
- **`blog-list.tsx` is correctly a client island** (`useState` for the tag filter), but the tag-pill rendering and `EditorialEntry` cards inside it are pure presentation; consider lifting the *server* render of all posts and passing them as `children` so the client island only owns the filter state. Today React re-renders all `EditorialEntry` instances on every tag-state change.
- **`contact-section.tsx` reads `window.location.search` inside `useState` initializer.** Works (it's lazy-initialized and guarded), but the cleaner Next.js pattern is `useSearchParams()` wrapped in `<Suspense>` — and the surrounding form would then participate in static rendering more naturally.
- **`cal-embed.tsx` `useEffect` returns no cleanup.** Calling `getCalApi({})` repeatedly is idempotent in Cal's SDK, but if `calLink` ever becomes dynamic the effect has no deps and will not re-init. Add `[]` (currently fine) but flag for future-proofing.

### Recommendation

Create `components/motion/fade-in-section.tsx`:

```tsx
"use client";
import { motion, useReducedMotion } from "framer-motion";
export function FadeInSection({ children, ... }) { ... }
```

…then strip `"use client"` from `hero.tsx`, `about.tsx`, `case-studies.tsx`, `current-focus.tsx`, `content-grid.tsx`, `project-card.tsx`, and wrap their motion regions in `<FadeInSection>`. Bundle savings: every page that imports these (homepage, projects index, project detail, blog index) drops the Framer Motion runtime from the *server-rendered* HTML stream and only loads it for the animated boxes themselves.

---

## 2. State management

### Findings

- **`BookingForm.tsx` holds 10 `useState` slots** (`step`, `selectedDate`, `selectedSlot`, `formData`, `availableSlots`, `icsContent`, `monthEvents`, `loadedMonths`, `currentMonth`, `isLoadingMonth`, `calendarError`). State transitions are interdependent (`handleDateSelect` sets 3 of them in sequence, `handleConfirmBooking` sets 2 and conditionally fires a side-effect). This is the canonical `useReducer` case in the React 19 docs.
- **`PhotographyBookingForm.tsx` repeats the same pattern** with 12 `useState` slots and adds a second wizard (`BookingStep = 1 | 2 | 3 | 4`). It also keeps `errors` and `submitError` as separate state which fight each other in the field-error UX.
- **`contact-section.tsx` correctly uses `useActionState`** for the server-action form — good.
- **`admin/login/page.tsx` correctly uses `useActionState`** — good.
- **`navbar.tsx` has *three* boolean `useState`s** (`open`, `businessOpen`, `businessMobileOpen`) plus two refs. They never conflict, but a single `menu: 'closed' | 'desktop-business' | 'mobile' | 'mobile-business'` discriminated union would make the close-on-route-change logic in `useEffect` easier to reason about.

### Recommendation

Replace both booking forms' state with a `useReducer<BookingState, BookingAction>`:

```ts
type BookingState =
  | { step: "date"; selectedDate: null; ... }
  | { step: "time"; selectedDate: Date; availableSlots: TimeSlot[]; ... }
  | { step: "details"; selectedDate: Date; selectedSlot: TimeSlot; ... }
  | { step: "confirmation"; ...; icsContent: string };
```

This eliminates the entire class of "what if `selectedSlot` is null in step `details`" bugs that the current code guards against with runtime checks (e.g. `if (!selectedDate || !selectedSlot) return`).

---

## 3. Effect usage (`useEffect` necessity)

Total `useEffect`s in the audited surface: **5**. Each evaluated:

| File | Effect | Necessary? |
|---|---|---|
| `cal-embed.tsx` | Init Cal SDK on mount | yes — synchronizes with external library |
| `BookingForm.tsx` | Per-month iCloud fetch | yes — external data, depends on `currentMonth` |
| `PhotographyBookingForm.tsx` | URL `pkg` param → `selectedPackage` | **partially** — could derive during render from `searchParams.get('pkg')` instead of setting state |
| `PhotographyBookingForm.tsx` | Per-month iCloud fetch | yes |
| `navbar.tsx` | Outside-click + Escape for dropdown | yes — DOM event |

### Findings

- **`PhotographyBookingForm.tsx` lines 175–183** sets `selectedPackage` from a URL param inside `useEffect`. This is the textbook *"derived state in an effect"* anti-pattern (Vercel rule `rerender-derived-state-no-effect`). Read it during render:
  ```ts
  const pkgSlug = searchParams.get('pkg');
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(() =>
    pkgSlug ? sessionPackages.find(p => p.slug === pkgSlug) ?? null : null
  );
  ```
  …or compute `initialPackage` server-side and pass it as a prop.
- **Both booking forms' per-month fetch effects use `loadedMonths` (a `Set`) as a dependency.** Because they replace the set via `new Set([...prev, monthKey])`, the dep changes on every fetch, then the effect re-runs and short-circuits on the `if (loadedMonths.has(...))` guard. Works, but causes one wasted effect pass per month. Move `loadedMonths` to a `useRef<Set<string>>` since it's only ever read for dedup — never used for rendering. (`rerender-use-ref-transient-values`.)
- **`cal-embed.tsx` effect has empty deps `[]`** but doesn't depend on `calLink`. If `calLink` ever becomes dynamic, the UI config won't re-apply. Low priority.

---

## 4. Key props

### Findings

- **Index-as-key offenders** (lists where shape can change):
  - `case-studies.tsx:67` — `metrics.map((m, idx) => <div key={idx}>)`
  - `case-studies.tsx:99` — `outcomes.map((o, idx) => …)`
  - `case-studies.tsx:153` — `images.map((image, imgIndex) => …)`
  - `content-grid.tsx:140` — `gridItems.map((item, index) => <CardWrapper key={index} …>)` — items have unique `title`/`href`; use those
  - `project-detail-view.tsx:86` — `metrics.map((m, i) => <li key={i}>)` — `metric` strings are unique; use `metric`
  - `mdx/gallery.tsx:27` — `images.map((img, i) => <div key={i}>)` — use `img.src`
  - `sections/faq.tsx:41` — `items.map((item, i) => <AccordionItem key={i}>)`
  - `BookingForm.tsx:330` — `availableSlots.map((slot, idx) => <button key={idx}>)` — `slot.startTime.toISOString()` is unique and stable
  - `PhotographyBookingForm.tsx:562` — same problem with `availableSlots`

### Severity

- **High** for `availableSlots` in both booking forms: `selectedSlot === slot` referential check + index keys means changing the day reuses the DOM button with stale `aria-pressed`-equivalent state.
- **Medium** for `content-grid.tsx`: array won't change at runtime, but `index` keys couple the React tree to the data array's order.
- **Low** for static `metrics`, `outcomes`, `tags`, `gridItems` arrays that come from data files.

### Recommendation

Replace each with a content-derived key:

```tsx
images.map((img) => <div key={img.src} ...>)
availableSlots.map((slot) => <button key={slot.startTime.toISOString()} ...>)
gridItems.map((item) => <CardWrapper key={item.href ?? item.title} ...>)
```

---

## 5. Controlled vs uncontrolled inputs

### Findings

- **`contact-section.tsx`** is fully uncontrolled (no `value`/`onChange`) and uses native `FormData` via `useActionState`. **Correct** — this is the React 19 idiom and matches the Vercel `rerender-defer-reads` spirit (no input-keystroke re-renders).
- **`BookingForm.tsx`** controlled inputs (`value={formData.name}`, `onChange={handleFormChange}`). Required because the data is read before submit. Fine.
- **`PhotographyBookingForm.tsx`** controlled, with per-field `onBlur` validation that mutates `errors` state. The `onChange` handler also clears the field's error. Each keystroke on the name field forces a re-render of every step component (because all four steps live in the same parent). Today this is cheap because of the short field list, but if the form grows the validation logic should be a `useReducer`.
- **`admin/login/page.tsx`** uncontrolled (uses `FormData` via `useActionState`). Good.

### Recommendation

No urgent change. If validation grows, split each field into its own subcomponent that owns its `value`/`error` slice so keystrokes don't re-render the whole wizard. (`rerender-split-combined-hooks`.)

---

## 6. Ref usage

### Findings

- **`navbar.tsx`** uses two refs: `businessButtonRef` (for focus return after Escape) and `businessRef` (for outside-click detection). Both correct uses.
- No other ref usage in the audited surface.
- **Missing ref opportunity:** `loadedMonths` in both booking forms (see effect section above) should be `useRef<Set<string>>` not `useState`, because nothing reads it during render.

---

## 7. Memoization

### Findings

| Site | Hook | Justified? |
|---|---|---|
| `blog-list.tsx:15` | `useMemo` for `allTags` | yes — `flatMap → Set → sort` is O(n log n) over all posts |
| `BookingForm.tsx:85` | `useMemo` for `busyDates` | yes — runs `getAvailableSlots` for every day of the month |
| `PhotographyBookingForm.tsx:119` | `useMemo` for `sessionPackages` (filter) | borderline — runs once per render, trivially cheap, but it's a referential-stability anchor for the URL-param effect dep array, so keep |
| `PhotographyBookingForm.tsx:189` | `useMemo` for `busyDates` | yes |

- **No `React.memo`, `useCallback` anywhere.** This is correct given current sizes — premature memoization is the Vercel `rerender-simple-expression-in-memo` anti-pattern.
- **One missed opportunity:** `EditorialEntry` in `blog-list.tsx` re-renders every post on every tag-state change. Wrapping `EditorialEntry` in `React.memo` (after fixing keys) would let React skip unchanged entries, since the props are primitive strings + a small `cover` object that's stable across renders. Only worth doing once the post count grows past ~30.

---

## 8. Prop drilling

### Findings

- **`BlogPostView` → `buildMdxComponents(slug)`** is a clean partial-application pattern; not prop drilling.
- **`ProjectDetailView` accepts `project`, `allProjects`, `numeral`** — `allProjects` is only used by the nested `ProjectNavLinks` component. Mild drilling, acceptable (only one level).
- **`PhotographyBookingForm` → `StepIndicator`** receives `currentStep`. One level, fine.
- **Booking forms keep `formData`, `errors`, `selectedPackage`, `selectedDate`, `selectedSlot` at the top level and the JSX reads all of them inline.** No drilling because there are no subcomponents — but that's also why the file is 744 lines. Extracting `<DateStep>`, `<TimeStep>`, `<DetailsStep>` would require either context or prop drilling. Context is the right answer here.

### Recommendation

When extracting booking-form subcomponents, use a `BookingContext` (or pass a single `state` + `dispatch` from the `useReducer` refactor) rather than threading 8 props through each step.

---

## 9. Suspense boundaries

### Findings

- **Only one Suspense boundary in the whole app:** `app/(photography)/photography/book/page.tsx:70` wraps `<PhotographyBookingForm>` (which uses `useSearchParams` and therefore must be inside Suspense). Good.
- **`contact-section.tsx` reads `window.location.search` directly** to avoid a Suspense boundary, then is bundled as a client component anyway. Either:
  1. Use `useSearchParams()` and let the parent page wrap it in `<Suspense>`, **or**
  2. Pass UTM params from a server-component parent that reads them from `headers()` / `searchParams` prop.
- **`/blog/[slug]/page.tsx`** uses `<MDXRemote>` synchronously inside the JSX tree without a Suspense fallback. MDXRemote's `rsc` variant streams — wrapping the article in `<Suspense fallback={<ArticleSkeleton />}>` would let the cover + title render immediately and stream the body.
- **`/meet/page.tsx`** awaits `getServerAvailability()` at the top of the page, blocking the entire shell. Move the await into a child `<AvailabilityProvider>` server component and wrap it in `<Suspense>` so the page header renders instantly. (Vercel `async-suspense-boundaries`.)

---

## 10. Error boundaries

### Findings

- **No `error.tsx` exists anywhere in the App Router tree.** A search across `src/app/` returns zero matches.
- **No client-side `ErrorBoundary` component** wraps the booking forms — a thrown error in `fetchICloudEvents` (e.g. malformed response) propagates up to React's default fallback (blank UI in production). The forms already display `calendarError` for thrown errors *inside* the effect, but a render-time crash (e.g. `format(currentMonth, …)` with an invalid date) would white-screen the page.

### Recommendation

Add segment-level error boundaries:
- `src/app/(main)/error.tsx` — top-level fallback with "something went wrong, try refresh"
- `src/app/(main)/blog/[slug]/error.tsx` — post-specific
- `src/app/(photography)/photography/book/error.tsx` — booking-specific
- `src/app/(main)/meet/error.tsx` — booking-specific

Each should be a `"use client"` component with a `reset` button (the Next.js convention).

---

## 11. Other Vercel-rule callouts

- **`bundle-barrel-imports`:** Imports look direct already (`from "lucide-react"`, `from "framer-motion"`) — neither is a barrel issue.
- **`server-hoist-static-io`:** `app/layout.tsx` initializes Inter/Geist Mono/Playfair at module level. Correct.
- **`rendering-conditional-render`:** Several places use `&&` for conditional rendering that returns `null`/falsy on the JSX tree (e.g. `case-studies.tsx:155` `images.length > 0 && (...)`). Low risk because `images.length` is a number — but Vercel recommends ternaries (`condition ? <X /> : null`) for readability.
- **`server-cache-react`:** `getAllPosts()` is called from `app/(main)/page.tsx`, `app/(main)/blog/page.tsx`, `app/(main)/blog/[slug]/page.tsx`. If it reads from the filesystem (which `src/lib/blog.ts` does per CLAUDE.md), wrapping it in `React.cache()` deduplicates per request.
- **`rendering-hoist-jsx`:** `current-focus.tsx`'s `card` JSX fragment is created inside the `.map` callback. Each item rebuilds the fragment. Hoisting it (or extracting `<FocusCard>` as a sibling component) saves allocations.

---

## Priority matrix

| Finding | Impact | Effort | Priority |
|---|---|---|---|
| 1. Strip `"use client"` from animation-only sections; introduce `<FadeInSection>` | Bundle ↓ (~40KB on homepage), TTFB ↓ | M | **P0** |
| 2. Replace booking-form state with `useReducer` + shared `useCalendarAvailability` hook | Maintainability, fewer bugs | L | **P1** |
| 3. Replace index keys with content keys in `availableSlots` and gallery lists | Correctness (focus, ARIA state) | S | **P0** |
| 4. Move URL-param → state out of effect in `PhotographyBookingForm` | Removes 1 render cycle, clearer | S | **P1** |
| 5. Move `loadedMonths` to `useRef` | Removes spurious effect re-run per month | S | **P2** |
| 6. Add `error.tsx` at segment roots | Robustness | S | **P1** |
| 7. Wrap `<MDXRemote>` in `<Suspense>`; defer `getServerAvailability()` into a Suspense child on `/meet` | Streaming, perceived perf | M | **P2** |
| 8. `React.cache(getAllPosts)` if it's not already memoized | Per-request dedup on blog routes | S | **P2** |
| 9. Move `content-grid.tsx` static data out of the client bundle | Bundle ↓ | S | **P2** |
| 10. Use `useSearchParams` in `contact-section` (under `<Suspense>`) | Standard idiom | S | **P3** |

---

## What's already good

- **MDX shortcodes (`Figure`, `FullBleed`, `Gallery`, `PullQuote`, `TwoColumn`, `Aside`)** are all RSC, no `"use client"`, accept `slug` for asset rewriting — clean separation.
- **`ProjectCover`, `BlogCover`, `EditorialEntry`, `ProjectDetailView`** are all RSC. The editorial design-system family is server-rendered by default — exactly right.
- **`contact-section.tsx` uses `useActionState`** with a server action and uncontrolled inputs — the React 19 canonical form pattern.
- **Project/blog detail pages use `generateStaticParams` + `generateMetadata`** correctly with awaited `params` (Next 15+ async params).
- **`app/layout.tsx` is minimal** and only owns `<html>`/`<body>` — nested group layouts don't duplicate chrome (called out in the file's own comment).
- **No `React.memo`, `useCallback`, or `useMemo` over-application.** The codebase resists premature memoization, which is the right default per Vercel guidance.

---

## Files audited

`src/components/` (32 files) · `src/app/layout.tsx` · `src/app/(main)/{layout,page,loading,not-found}.tsx` · `src/app/(main)/blog/{page, [slug]/page, tag/[tag]/page}.tsx` · `src/app/(main)/projects/{page, [slug]/page}.tsx` · `src/app/(main)/contact/page.tsx` · `src/app/(main)/meet/page.tsx` · `src/app/(main)/admin/{page, login/page}.tsx` · `src/app/(photography)/{layout, photography/page, photography/{book,gallery,pricing,couples}/page}.tsx` · `src/app/(ecommerce)/{layout, ecommerce/page}.tsx`.

**No source files were modified.**
