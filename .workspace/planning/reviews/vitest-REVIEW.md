---
title: Vitest Lens Review
date: 2026-05-19
branch: feat/blog-system-v2
reviewer: claude (vitest skill)
scope:
  - vitest.config.ts
  - src/test/setup.ts
  - src/**/*.test.{ts,tsx} (53 files)
status: advisory — DO NOT EDIT source per task scope
skill: .agents/skills/vitest/SKILL.md (Vitest 3.x, 2026-01-28)
---

# Vitest Lens Review

## Summary

The suite is on Vitest 3 with jsdom + RTL, globals enabled, and a deliberately
small setup file (just `cleanup()`). The newly-added security/validation
modules (`lib/validation/*`, `lib/rate-limit.ts`, `lib/json-ld.ts`,
`lib/session.ts`) are well-covered — every CR/WR code in the review
backlog has an asserting test. The hot spots are not coverage gaps but
**discipline gaps**: env-var handling, fake-timer hygiene, RTL query choice,
mock duplication, and a few non-deterministic patterns that will bite when the
clock crosses certain boundaries.

Top-3 (also returned inline):

1. **Raw `process.env.X = …` mutation in 5 test files** instead of
   `vi.stubEnv` + `vi.unstubAllEnvs`. Works, but leaks across files because
   `cleanup()` is the only `afterEach` in setup; the manual restore dance in
   `session.test.ts` / `admin-auth.test.ts` / `db/index.test.ts` is
   error-prone and inconsistent with `proxy.test.ts` (the one file that
   does it the recommended way).
2. **`vi.useFakeTimers()` in `checkout.test.ts` `beforeEach` with no
   `afterEach(() => vi.useRealTimers())`** — leaks fake timers into any
   subsequent file that runs in the same worker. Same suite mixes
   `vi.setSystemTime` with a hand-rolled `now`-injection pattern used
   elsewhere in `validation/booking.test.ts`, so the codebase has two
   conventions for the same concern.
3. **Heavy reliance on `container.querySelector` + class-name assertions
   (esp. `contact-section.test.tsx`)** — tests verify
   `className.includes('pb-24')` and `.editorial-shell`, which couples
   them to Tailwind/utility-class strings. RTL has roles for everything
   in that file already; class assertions are pure refactor friction.

---

## Configuration & setup

### `vitest.config.ts`

Good:

- `environment: "jsdom"`, `globals: true`, single setup file — matches the
  Vitest 3 recommended baseline.
- Coverage exclude list is correct (test files, setup, node_modules).
- Workspace-noise dirs (`.workspace`, `.claude`, `.claude-flow`,
  `reference/`) are excluded from test discovery — important on this
  repo because `.workspace/` is gitignored but full of fixtures from
  worktrees.

Issues:

- **No `coverage.include`** → V8 instruments the whole repo on demand,
  including `scripts/`, `content/`, `public/`. Add
  `include: ["src/**/*.{ts,tsx}"]` so coverage numbers reflect product
  code only.
- **No coverage thresholds.** Even an aspirational `thresholds: { lines:
  60 }` would block accidental regressions on the newly-added
  validation/session/rate-limit modules.
- **No `setupFiles` reset hooks for fake timers / env stubs.** The
  setup file only registers `cleanup()` from RTL — `vi.unstubAllEnvs()`,
  `vi.unstubAllGlobals()`, and a guard `vi.useRealTimers()` belong
  there to prevent cross-file bleed.
- **Two test files (`src/app/__tests__/{contact,meet}.test.tsx`)** are
  in the carve-out list per `CLAUDE.md`. They are not excluded from
  discovery — they run and pass (TS errors are compile-time only, not
  runtime). Consider an inline comment in `vitest.config.ts` pointing
  to the carve-out so future contributors don't try to "fix" them.

### `src/test/setup.ts`

Minimal:

```ts
afterEach(() => { cleanup(); });
```

Recommended additions (in priority order):

```ts
import { afterEach, vi } from "vitest";
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();   // covers process.env stubs (when migrating off raw =)
  vi.useRealTimers();   // safety net for checkout.test.ts
});
```

---

## Test organization & naming

### Describe nesting

- Most files use a single top-level `describe` per module + flat `it`s.
  Consistent and readable.
- `proxy.test.ts` is the gold-standard example of nested `describe`s by
  concern ("photography subdomain", "admin route protection — CRM-02 /
  CR-01 / CR-04"). The CR/WR code suffix is repeated everywhere — keep
  doing this; it's grep-able and pairs each test with the review
  finding it covers.
- `webhook.test.ts` puts every test in the same top-level describe but
  the test names are long enough to compensate. Borderline.

### Naming

- Many files prefix test names with the requirement code (`'WR-04:
  rejects an invalid email format'`). Excellent — auditable test → spec
  traceability.
- `contact-section.test.tsx` has multiple essentially-identical tests
  ("renders the contact section" / "renders section heading" / "renders
  Send a Message heading" — all assert the same `getByText("Send a
  Message")`). Three asserts, one fact. Consolidate.

---

## Mocking strategy

### Strengths

- `vi.hoisted` is used correctly in `webhook.test.ts` and
  `checkout.test.ts` for shared mock fns referenced by `vi.mock`
  factories. This is the Vitest 3 idiomatic pattern.
- Module mocks are scoped per-file; no global `vi.mock` calls in
  `setup.ts` — good.
- `next/link`, `next/image`, `framer-motion` get mocked in many React
  component tests. These should be hoisted to a shared helper.

### Issues

- **Duplicate `next/link` mock in ≥12 test files.** Each file repeats
  the same `vi.mock("next/link", () => ({ default: ({ children, href,
  ...props }) => <a href={href} {...props}>{children}</a> }))` block.
  Extract into `src/test/mocks/next-link.tsx` and re-import per file
  (or use `vi.mock` with a shared factory via a module file). Same for
  `next/image` and the framer-motion `motion.*` family.
- **Inline `framer-motion` mocks omit common motion props.** Several
  tests forget to filter `whileInView`, `whileHover`, `whileTap`,
  `transition`, etc. — those get passed straight to the DOM and React
  warns "Unknown DOM property whileInView" in jsdom. The hoisted
  state pattern in `hero.test.tsx` (`motionState.reduceMotion`) is the
  cleanest example and should be the template.
- **`webhook.test.ts` mocks `'date-fns-tz'` to a single fixed string**
  (`'April 15, 2026'`). This is fine for asserting "the email got
  called", but a sibling test that relied on the formatted date would
  silently pass. Prefer `vi.fn().mockImplementation(actualFormat)` or
  `vi.importActual('date-fns-tz')` + spy.
- **`admin-auth.test.ts` does `vi.importActual<typeof
  import('@/lib/session')>('@/lib/session')` then spreads** to keep
  `currentSessionVersion`/`isSessionValid` real and only override
  `getSession`. Good pattern — but `session.test.ts` mutates the same
  module's `process.env.SESSION_VERSION` without `vi.resetModules`
  between cases. If both files happen to run in the same worker shard,
  the singleton state in `sessionOptions.password` (set at module load)
  can be wrong. Acceptable today because the test using `vi.stubEnv`
  also reassigns `sessionOptions.password` explicitly (`proxy.test.ts`
  line 19), but it's load-bearing in a non-obvious way.

---

## Async patterns

- `await expect(loginAction(...)).rejects.toThrow(/__REDIRECT__:.../)`
  in `admin-auth.test.ts` is the correct way to assert on the Next.js
  `redirect()` sentinel throw. Nicely done.
- `validateBookingDateAgainstCalendar` tests in `validation/booking.test.ts`
  use `vi.fn().mockRejectedValue(...)` + `expect(result.ok).toBe(true)`
  to verify graceful degradation. Good. They also `spyOn(console,
  'warn')` and restore — even better.
- No misuse of `done()`-style callbacks (jest legacy). All async tests
  are `async/await`.
- One pattern to watch: `webhook.test.ts` does
  `await import('@/app/(main)/api/webhooks/stripe/route')` inside every
  `it`. This forces re-resolution but does NOT reset the mocks (those
  are reset by `vi.clearAllMocks` in `beforeEach`). It works, but
  `vi.resetModules()` would be more honest if the goal is a clean
  module graph.

---

## Snapshots

- **Zero snapshot usage** across the suite. `grep
  toMatchSnapshot|toMatchInlineSnapshot` returns nothing. For an
  editorial / content-heavy site this is arguably a strength — JSON-LD
  output, OG card structure, MDX render trees are exactly the kind of
  things people sometimes snapshot, then never review. Keep avoiding
  it.

---

## Setup / teardown discipline

| File | beforeEach | afterEach | Verdict |
|------|------------|-----------|---------|
| `admin-auth.test.ts` | resets mocks, rate limiter, env, headers | (none) | OK — env restored in `beforeEach` reassign |
| `checkout.test.ts` | resets mocks + `vi.useFakeTimers` + `setSystemTime` | **none** ⚠ | leaks fake timers across files |
| `webhook.test.ts` | `vi.clearAllMocks` + mock-chain re-init | (none) | OK |
| `session.test.ts` | env stubbing per describe | restores original env per describe | Verbose but correct |
| `db/index.test.ts` | `vi.resetModules`, env delete | env restore | OK |
| `proxy.test.ts` | `vi.stubEnv` (+ password reassign) | (none, relies on `vi.unstubAllEnvs` not being called…) | **inconsistent with rest** |
| `contact.test.ts` (action) | `vi.clearAllMocks`, mockReturnValue reset | (none) | OK |
| `hero.test.tsx` | (none) | resets `motionState.reduceMotion` | ✅ |

The recommended global fix:

```ts
// src/test/setup.ts
afterEach(() => {
  cleanup();
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
```

Then the per-file env restore dances can be deleted.

---

## Env-var handling

This is the single biggest cross-file inconsistency.

Two conventions coexist:

1. **Raw `process.env.X = …` + manual restore** —
   `session.test.ts`, `admin-auth.test.ts`, `db/index.test.ts`.
2. **`vi.stubEnv` (Vitest-recommended for Vitest 3)** —
   `proxy.test.ts` only.

Why pattern 2 wins:

- Vitest tracks stubs and `vi.unstubAllEnvs()` rolls every one back.
- `vi.stubEnv` synchronously updates `process.env.X` AND
  `import.meta.env.X` (relevant for any future Vite-native code paths).
- A single `afterEach` in `setup.ts` covers all files; today's manual
  restore can fail silently if a test throws between the assignment and
  the `afterEach`.

**Recommendation:** migrate the three files in pattern 1 to
`vi.stubEnv`, then add the global `afterEach` cleanup.

Specific concern in `session.test.ts`:

```ts
delete process.env.SESSION_VERSION;     // line 12
process.env.SESSION_VERSION = '42';     // line 17
// then in describe('isSessionValid'):
beforeEach(() => { process.env.SESSION_VERSION = '3'; });
```

The `currentSessionVersion` describe block's `afterEach` restores
`SESSION_VERSION` but `isSessionValid`'s describe block does NOT, even
though `beforeEach` mutates it. Line 45 (`process.env.SESSION_VERSION
= '4'`) leaks into any later test that reads the env in the same file
(none today, but a latent footgun).

---

## Coverage gaps in newly-added modules

Audited against the source line by line:

### `src/lib/validation/booking.ts` (248 LOC)

✅ Covered:

- `checkoutRequestSchema` happy/sad paths (5 tests)
- Empty phone/notes → undefined
- All branches of `validateBookingDate`: past date, weekend, 90-day
  window, before/after business hours, last valid half-hour, CalDAV
  collision, empty calendar, invalid Date
- `validateBookingDateAgainstCalendar`: fetcher invoked, CalDAV throws
  graceful degrade, out-of-window still rejected

❌ Gaps:

- **No test for the `slotMatch` branch** at lines 200-208 (line `if
  (!slotMatch)` — "eventDate conflicts with an existing event"). The
  CalDAV-busy test exercises the `slots.length === 0` branch
  (lines 191-196) but not the case where slots exist yet the requested
  start time isn't one of them.
- **`windowDays` override option** is not tested — easy 3-line test.
- **`packageId` plumbing** is currently `void`'d; if the comment
  implies future per-package rules, a regression test (e.g. "packageId
  is unused today") would document intent.
- **Email/name/phone field caps** are asserted in `contact.test.ts` but
  not in `booking.test.ts`. Same Zod patterns, but `BOOKING_LIMITS.email
  = 320` vs `CONTACT_LIMITS.email = 320` is a coincidence — drift
  would go unnoticed.

### `src/lib/rate-limit.ts` (106 LOC)

✅ Covered: all 7 behavior branches (new key, burst-allowed,
burst-blocked, cooldown-blocked-then-allowed, window-reset,
per-key-independence, `retryAfterMs` shrinks, `reset()`).

❌ Gaps:

- **The default singleton (`loginRateLimiter`)** is touched indirectly
  via `admin-auth.test.ts` but the `DEFAULTS` constants (5/15min/1min)
  aren't asserted anywhere. A single test like
  `expect(new RateLimiter().check('k').allowed).toBe(true)` followed by
  6 immediate calls would lock the defaults down.
- **Concurrency / monotonic-time edge case** — `now: () => t` makes
  every test deterministic but real `Date.now()` can go backward across
  servers. Not a test bug, but a fake-timer integration test
  (`vi.useFakeTimers(); vi.setSystemTime(...); vi.advanceTimersByTime(...)`)
  would be more representative.

### `src/lib/json-ld.ts` (25 LOC)

✅ Covered: `</script>` escape, ampersand, U+2028/U+2029, nested
structures, plain object round-trip. **Coverage is essentially 100% for
the tiny surface area.** Nothing to add.

### `src/lib/session.ts` (72 LOC)

✅ Covered:

- `currentSessionVersion()` default + override
- `isSessionValid()`: false on isLoggedIn=false, missing version,
  stale version, true on match, env-bump invalidation
- `resolveSessionSecret()`: throws on missing in production, throws
  on <32 chars, accepts ≥32, skips strict check in test env

❌ Gaps:

- **`getSession()` is not tested.** It's a thin wrapper over
  `getIronSession(cookies(), sessionOptions)` but the integration is
  exactly the seam where the `sessionOptions.password` reassignment in
  `proxy.test.ts` matters. A test that uses `vi.stubEnv` +
  `vi.resetModules` + a mock `cookies()` would close the loop.
- **`sessionOptions.cookieOptions`** — the `secure: production-only`
  flag and `maxAge: 7 days` aren't asserted. Easy to break by accident.

---

## React Testing Library queries

The suite tilts the right way (roles + labels) in most files. Specific
flags:

### Where roles are used (good)

- `home.test.tsx`: `getByRole("heading", { name: /Latest Writing/i })`,
  `getByRole("link", { name: /All posts/i })` — exactly right.
- `related-posts.test.tsx`: `getByRole("link", { name: /b/i })`.
- `projects-grid.test.tsx`: iterates `projects` and asserts each via
  `getByRole("heading", { name: p.title })`. Beautiful.
- `case-studies.test.tsx`: `getAllByRole("link", { name: /View Full
  Case Study/i })`.

### Where testids are arguably justified

- `meet.test.tsx`, `photography/book/page.test.tsx`: testid is used as
  a *boundary marker* on a mocked component (`<div
  data-testid="booking-form" />`). Fine — there's no real component to
  query by role.
- `project-card.test.tsx` mocks `lucide-react` icons as `<div
  data-testid="github-icon" />`. Same justification.
- `project-cover.test.tsx`: `getByTestId("project-cover-plate")`. This
  one is checking that the *typography plate fallback* renders instead
  of the real `<img>`. A `role="img"` with an `aria-label` or a more
  semantic marker would be cleaner, but the testid is at least
  *intentional*.

### Where queries lean on the DOM instead of RTL

- `contact-section.test.tsx`:
  - `container.querySelector(".editorial-shell")` — should be
    `getByRole("region")` or similar
  - `container.querySelector(".grid")?.className.toContain("md:grid-cols-2")`
    — pure CSS assertion; deletes itself the moment the layout
    refactors
  - 6 `querySelector` calls in one file
- `case-studies.test.tsx` (carve-out):
  `container.querySelectorAll('[data-alt=""]').length` is fine because
  the test is asserting accessibility (decorative images have empty
  alt) — that's exactly when querySelector is appropriate.
- `hero.test.tsx`:
  `container.querySelectorAll("[data-initial='false']").length` — same
  carve-out reasoning (asserting on the data-* hook that the mock adds
  to verify reduced-motion).
- `project-card.test.tsx`, `editorial-entry.test.tsx`,
  `editorial-page-header.test.tsx`, `blog-cover.test.tsx`,
  `footer.test.tsx`, `navbar.test.tsx`: spot-checked — mostly
  legitimate uses (data-* attrs, view-transition-name style probe).

**Action item (if these files weren't in scope for fixes):**
`contact-section.test.tsx` should be migrated to roles/labels — at
least 8 of its asserts are class-name leakage.

---

## Carve-out files (per CLAUDE.md, do NOT fix)

Noting only, per task:

- `src/app/__tests__/home.test.tsx` — pre-existing TS+runtime
  mismatches against refactored chrome. Tests still useful as a
  smoke; don't extend.
- `src/app/__tests__/contact.test.tsx`, `meet.test.tsx` — the
  `Property 'className' does not exist on type 'ChildNode'`
  carve-out. Confirmed: these files do NOT have visible TS errors at
  read time, but `CLAUDE.md` flags them; trust the doc.
- `src/components/sections/about.test.tsx`,
  `case-studies.test.tsx`, `current-focus.test.tsx`,
  `home.test.tsx` — assert against old chrome that's since
  refactored. ~16 pre-existing failures expected per `CLAUDE.md`.
  None of the recommendations above apply to these files.

---

## Concrete recommendations (priority order)

1. **Centralize teardown** — update `src/test/setup.ts` to call
   `vi.unstubAllEnvs()` and `vi.useRealTimers()` in `afterEach`.
   *Single 5-line change unblocks 4 cleanups below.*
2. **Migrate raw `process.env.X = …` → `vi.stubEnv`** in
   `session.test.ts`, `admin-auth.test.ts`, `db/index.test.ts`.
3. **Fix fake-timer leak** in `checkout.test.ts` — add
   `afterEach(() => vi.useRealTimers())` (or rely on global hook
   after #1).
4. **Add coverage thresholds + include glob** to `vitest.config.ts`:
   ```ts
   coverage: {
     provider: "v8",
     include: ["src/**/*.{ts,tsx}"],
     exclude: [...existing],
     thresholds: { lines: 70, branches: 65, functions: 70, statements: 70 },
   }
   ```
5. **Extract shared mocks** for `next/link`, `next/image`,
   `framer-motion` into `src/test/mocks/`. Cuts ~150 LOC of
   duplication across 18+ files.
6. **Close `validateBookingDate` gap** — add the missing test for
   "requested slot start time not in `slots`" branch.
7. **Lock `RateLimiter` defaults** with one assertion.
8. **Test `sessionOptions.cookieOptions`** to prevent silent
   downgrade of `secure` / `httpOnly`.

---

## What's already great (don't lose)

- CR/WR code prefix in test names — auditable spec-trace.
- `vi.hoisted` discipline in mock setup (`webhook.test.ts`,
  `checkout.test.ts`).
- Zero flakiness from `setTimeout`/`Date.now` — pure `now: () => 0`
  injection in `rate-limit.test.ts` is textbook.
- Real iron-session `sealData` round-trip in `proxy.test.ts` — that's
  the right level of fidelity for an auth boundary.
- TDD discipline visible in editorial+mdx component tests (one
  failing-test-first commit per shortcode per CLAUDE.md).
