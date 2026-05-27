# Tailwind CSS Patterns Review

**Date:** 2026-05-19
**Branch:** `feat/blog-system-v2`
**Lens:** `.agents/skills/tailwind-css-patterns/SKILL.md`
**Scope:** all `*.tsx` and `*.ts` under `src/` + `src/app/globals.css`
**Files surveyed:** 157 TS/TSX files

This review applies the `tailwind-css-patterns` skill's lens to a Tailwind 4
codebase that uses CSS-first `@theme inline` configuration (no
`tailwind.config.ts`). The site has just completed a `byu-*` → editorial-token
migration; no `byu-*` references remain in `src/` (verified).

---

## TL;DR

The editorial token system is **defined correctly** in `globals.css`'s `@theme
inline` block, but **almost no JSX uses the shorthand utilities Tailwind 4
generates from it**. Instead, the codebase consistently reaches for verbose
arbitrary values like `text-[color:var(--color-ink)]` (470+ occurrences)
where `text-ink` would compile identically. This is the single largest pattern
issue. Secondary issues: low `focus-visible` coverage on interactive elements,
three custom utilities defined but never used, and several hex literals that
slipped past the migration.

---

## 1. Token discipline — arbitrary values vs. theme tokens

### Finding (CRITICAL — high count, low risk individually, high cumulative cost)

`@theme inline` (`src/app/globals.css:7-55`) registers every editorial color
as a Tailwind token:

```css
@theme inline {
  --color-paper: #f4efe6;
  --color-paper-elevated: #fbf7f1;
  --color-ink: #201c1a;
  --color-ink-soft: #5f5851;
  --color-rule: #d9cfc1;
  --color-accent: var(--accent); /* line 37, via shadcn bridge */
  ...
}
```

Per Tailwind 4 semantics, this auto-generates `text-ink`, `bg-paper`,
`border-rule`, `text-ink-soft`, `bg-paper-elevated`, `text-accent`,
`ring-accent`, etc. **The codebase uses these shorthand forms 6 times total**
(`grep -rnE "\btext-ink\b|\bbg-paper\b|..."`).

Instead, the codebase uses the explicit arbitrary form:

| Pattern                                       | Count |
|-----------------------------------------------|-------|
| `text-[color:var(--color-ink)]`               | 213   |
| `text-[color:var(--color-accent)]`            | 78    |
| `text-[color:var(--color-ink-soft)]`          | 67    |
| `border-[color:var(--color-rule)]`            | 58    |
| `bg-[color:var(--color-paper-elevated)]`      | 31    |
| `bg-[color:var(--color-paper)]`               | 23    |
| **Total arbitrary-value CSS-var uses**        | **~470** |

These compile to identical CSS as the shorthand but cost ~30 chars per use,
hurt scanability, and obscure intent. Worst offenders:

- `src/app/(ecommerce)/ecommerce/page.tsx` — full page is arbitrary-value
  soup (lines 17, 20, 30, 34, 47, 53, 65–76, 85, 92–138, 151–171, 184–220).
- `src/components/sections/blog-post-view.tsx:27–73` — MDX heading components
  every line of which would shrink ~40%.
- `src/components/layout/navbar.tsx:87, 132, 141–142, 204, 226` — also mixes
  in `bg-[rgba(95,47,42,0.08)]` literal where `bg-accent/10` would carry the
  same intent.

`globals.css` itself does this inside `@apply`:

```css
.editorial-title {
  @apply text-4xl leading-tight text-[color:var(--color-ink)] md:text-6xl;
}
```

…which is the canonical signal that the team didn't realize the shorthand was
available.

### Recommendation

Mechanical refactor across `src/`:

| Replace                                  | With                |
|------------------------------------------|---------------------|
| `text-[color:var(--color-ink)]`          | `text-ink`          |
| `text-[color:var(--color-ink-soft)]`     | `text-ink-soft`     |
| `text-[color:var(--color-accent)]`       | `text-accent`       |
| `text-[color:var(--color-paper)]`        | `text-paper`        |
| `bg-[color:var(--color-paper)]`          | `bg-paper`          |
| `bg-[color:var(--color-paper-elevated)]` | `bg-paper-elevated` |
| `bg-[color:var(--color-ink)]`            | `bg-ink`            |
| `bg-[color:var(--color-accent)]`         | `bg-accent`         |
| `border-[color:var(--color-rule)]`       | `border-rule`       |
| `ring-[color:var(--color-accent)]`       | `ring-accent`       |

This is a safe diff (CSS output is identical) and roughly halves the average
className length on editorial surfaces. Pair with a Vitest snapshot run to
catch any layout shift; there should be none.

---

## 2. Hex/rgba literals that slipped past the migration

`grep -rnE "#[0-9a-fA-F]{3,8}" src/ --include="*.tsx" | grep -v test`:

- `src/app/(ecommerce)/layout.tsx:21` — `bg-[#F8FAFC]` (ecommerce surface,
  off-palette by design? — flag for product decision).
- `src/app/(ecommerce)/ecommerce/page.tsx:13` — `bg-[#F8FAFC]` (same).
- `src/app/(photography)/photography/book/success/page.tsx:51` — `bg-[#F5F5F5]`.
- `src/components/sections/blog-post-view.tsx:58` — `bg-[#0a0a0a]` on `<pre>`
  blocks. Justified (code blocks need true dark for syntax-highlight
  contrast), but should become a named token `--color-code-bg` for consistency.
- `src/components/sections/content-grid.tsx:121` — `bg-[#faf9f7]` (off-paper
  by 1–2 ticks — almost certainly meant `bg-paper`).
- `src/components/sections/content-grid.tsx:201, 232` — brand colors
  (`#0077B5` LinkedIn, `#002E5D`/`#0057B8` BYU). These are *intentional* brand
  representations; OK to keep arbitrary or hoist into a `--brand-linkedin`
  token if reused.
- `src/components/cal-embed.tsx:17` — `brandColor: "#003DA5"` passed to
  Cal.com config. Off-palette — likely should be `#5f2f2a` (`--color-accent`)
  to match the rest of the site.
- `src/app/(main)/og/route.tsx` + `src/app/(main)/blog/[slug]/og/route.tsx` —
  hex literals (`#f4efe6`, `#5f2f2a`, `#201c1a`, `#5f5851`) inside Edge/Node
  runtime image generation. These are **correct** to leave hardcoded — the
  Edge runtime can't read CSS variables — but a comment pinning them to the
  `@theme` source would prevent drift.

### `rgba(...)` literals for translucent surfaces

`bg-[rgba(251,247,241,0.55–0.86)]` appears 6 times (navbar, hero, page,
current-focus, case-studies) and `bg-[rgba(95,47,42,0.04–0.08)]` 4 times in
navbar hover/active states. These should be:

```diff
- bg-[rgba(251,247,241,0.86)]   → bg-paper-elevated/85
- bg-[rgba(95,47,42,0.08)]      → bg-accent/10
- bg-[rgba(95,47,42,0.04)]      → bg-accent/5
```

The Tailwind 4 `/<opacity>` syntax works on `@theme inline` tokens out of the
box.

---

## 3. Custom utilities — defined but unused

Three `@layer components` classes in `globals.css` are never referenced from
JSX (verified via `grep -rl "\bclass\b" src/`):

- `.editorial-title` (line 154) — **0 uses**
- `.editorial-copy` (line 159) — **0 uses**
- `.editorial-numerals` (line 212) — **0 uses**

Either delete them, or adopt them at call-sites where the matching ad-hoc
combo (`font-[family-name:var(--font-playfair)] text-4xl ... text-[color:...]`)
appears (see e.g. `src/components/sections/hero.tsx:22`,
`src/components/mdx/pull-quote.tsx:11`, `src/components/editorial/project-cover.tsx:75`).
Adopting them collapses 3–5 className tokens per call into one.

The remaining custom utilities are well-used: `editorial-shell` (14 files),
`editorial-kicker` (10), `editorial-card` (5), `editorial-rule` (5),
`editorial-display` (6), `editorial-asym-left/right` (2 each), `grain-overlay`
(layout-level singleton). Healthy.

---

## 4. Responsive prefix discipline

- `sm:` 17, `md:` 113, `lg:` 20, `xl:` 0.
- The 6.6× imbalance between `md:` and `lg:` is consistent with editorial
  layouts (single major breakpoint at tablet) — not a smell, just an
  observation. Mobile-first ordering is respected throughout (no instances of
  `md:flex flex` reversed-order).
- One concern: `xl:` is completely unused but `editorial-shell` caps at
  `max-w-6xl` (1152 px). Hero, blog-list and case-studies could benefit from
  an `xl:max-w-7xl` rung on the largest desktop displays. Low priority.

---

## 5. Hover / focus / focus-visible coverage

`hover:` 134 occurrences, `focus-visible:` 14 occurrences across all of
`src/`. **20 components use `hover:` without any focus state.** Among them
several are user-facing CTAs:

- `src/components/social-links.tsx`
- `src/components/project-card.tsx`
- `src/components/sections/hero.tsx`
- `src/components/sections/blog-list.tsx`
- `src/components/sections/blog-post-view.tsx`
- `src/components/sections/case-studies.tsx`
- `src/components/sections/content-grid.tsx`
- `src/components/sections/faq.tsx`
- `src/components/editorial/editorial-entry.tsx`
- `src/components/editorial/series-header.tsx`
- `src/app/(main)/page.tsx`, `not-found.tsx`, `meet/page.tsx`, `admin/page.tsx`
- `src/app/(photography)/photography/page.tsx`, `couples/page.tsx`,
  `gallery/GalleryGrid.tsx`

The ecommerce page (`(ecommerce)/ecommerce/page.tsx`) is the
counter-example — every interactive element pairs `hover:` with
`focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]
focus-visible:outline-none`. That pattern should be extracted as a `.cta-ring`
utility or applied site-wide on all `<Link>`, `<button>`, and `<a>`.

WCAG 2.1 SC 2.4.7 requires visible keyboard focus. This is an
**accessibility-grade** finding, not a stylistic one.

### Recommendation

Add a global focus utility in `@layer components`:

```css
.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2
         focus-visible:ring-accent focus-visible:ring-offset-2
         focus-visible:ring-offset-paper;
}
```

…then apply on every `<Link>`, `<button>`, and `[role="button"]` not already
covered by shadcn primitives (which carry their own focus styles via the
`button.tsx` cva variants — those are correctly handled).

---

## 6. Dark-mode handling

The project explicitly **does not ship dark mode** (cream paper aesthetic).
Current state:

- `@custom-variant dark (&:is(.dark *));` is declared in `globals.css:5`.
- A `.dark` selector at `globals.css:92–124` overrides shadcn primitives'
  colors but is never activated (no `dark` class toggle anywhere in `src/`).
- shadcn's `button.tsx`, `badge.tsx`, `navigation-menu.tsx` carry inherited
  `dark:` prefixes inside their cva variants (`dark:bg-input/30`,
  `dark:hover:bg-accent/50`, etc.) — 6 occurrences total. Dead code but
  harmless; ship-cost is purged-CSS bytes only.

### Recommendation

Either:

- (a) Decide officially that dark mode is out of scope and remove the
  `@custom-variant dark`, the `.dark` block, and the `dark:` prefixes inside
  `components/ui/`. This deletes ~125 lines of CSS and ~6 className tokens.
- (b) Decide it's on the roadmap and *finish* the surface: there's currently
  no toggle, and the cream-paper editorial palette is not visually compatible
  with the inherited shadcn dark palette. Half-finished is the worst state.

I'd lean (a) given the brand direction.

---

## 7. Photography sub-site palette divergence

`src/app/(photography)/photography/page.tsx` and `couples/page.tsx` use a
completely different palette (`bg-white`, `text-gray-900`, `bg-gray-950`,
`text-amber-200/85`, `text-white`, `bg-gray-50`) — 15 hits of `bg-white |
bg-gray-950 | bg-black` in `(photography)/`.

This is **plausibly intentional** — photography is a sub-brand with its own
visual identity (luxe/dark vs. editorial cream). If so, three asks:

1. Document the divergence in CLAUDE.md so future-self doesn't migrate it
   away by accident.
2. Hoist the photography palette into its own token set
   (`--color-photo-bg`, `--color-photo-ink`, `--color-photo-accent` =
   amber-200) under a `.photography` parent selector, so it's not
   Tailwind-default greys forever.
3. The hero amber chip uses `text-amber-200/85` (Tailwind default) — fine,
   but `--color-photo-accent` would make the relationship explicit.

If it's *not* intentional, this should be migrated to editorial tokens.

---

## 8. `cn()` discipline

`cn()` is imported in 18 files and called 51 times. Hand-rolled template
literal `className={\`...${cond}...\`}` patterns appear 9 times:

- `src/app/(ecommerce)/layout.tsx:21` — joining `inter.variable` with static
  classes. Acceptable (Next.js font-variable convention).
- `src/app/(main)/layout.tsx:98` — same pattern, acceptable.
- `src/components/mdx/gallery.tsx:19` — `${gridCols}` is computed at runtime.
  Should be `cn("my-10 grid grid-cols-1 gap-4", gridCols)`.
- `src/components/sections/contact-section.tsx:208` — `${inputClass} resize-none`.
  Should be `cn(inputClass, "resize-none")`.
- `src/components/sections/blog-list.tsx:37, 50` — conditional pill styling.
  Should be `cn(base, isActive ? activeClasses : inactiveClasses)`.
- `src/components/booking/BookingForm.tsx:332` — same pattern.
- `src/components/editorial/project-cover.tsx:47, 75` — variable padding/size.

`cn()` from `clsx`+`tailwind-merge` resolves class collisions (important when
later classes override earlier `px-`/`py-`/`text-` tokens). Template literals
do not — they just concatenate, so `cn(base, override)` is strictly safer.

---

## 9. Class grouping / scanability

Most JSX classes are long single strings without semantic grouping. Example
from `src/app/(ecommerce)/ecommerce/page.tsx:20`:

```jsx
className="bg-[color:var(--color-ink)] text-[color:var(--color-paper)] px-5
py-2 rounded-lg text-sm font-medium hover:bg-[color:var(--color-accent)]
transition-colors focus-visible:ring-2
focus-visible:ring-[color:var(--color-accent)] focus-visible:outline-none"
```

After the token cleanup in (1), this becomes:

```jsx
className="bg-ink text-paper px-5 py-2 rounded-lg text-sm font-medium
hover:bg-accent transition-colors focus-ring"
```

…which scans in a single glance. The most valuable single thing this codebase
could do for readability is the token-shorthand migration.

---

## 10. Purging compatibility

Tailwind 4 auto-detects sources from `package.json` and the framework
integration; there is no `content: []` to misconfigure. No risks observed. No
dynamic className construction with template-interpolated Tailwind tokens
(the kind that would survive lint but be purged in prod) was found.

---

## Priority-ordered action list

| # | Action | Effort | Impact |
|---|--------|--------|--------|
| 1 | Codemod replace `[color:var(--color-X)]` with token shorthands across `src/` | M (mechanical, ~470 sites) | High readability, –10 kB of source |
| 2 | Add `.focus-ring` utility, apply to all bare `<Link>`/`<button>`/CTAs flagged in §5 | M | A11y compliance (WCAG 2.4.7) |
| 3 | Decide dark-mode policy; remove the `.dark` block and `dark:` prefixes in `components/ui/` if (a) | S | –125 LOC CSS, mental load |
| 4 | Replace `bg-[rgba(...)]` literals with `bg-token/<opacity>` syntax (§2) | S | Consistency |
| 5 | Delete unused `.editorial-title`, `.editorial-copy`, `.editorial-numerals` OR adopt at call-sites | S | Clarity |
| 6 | Convert remaining template-literal classNames to `cn()` (§8) | S | tailwind-merge safety on overrides |
| 7 | Document or hoist photography sub-palette (§7) | S | Future-proofing |
| 8 | Replace `#faf9f7` (`content-grid.tsx:121`) with `bg-paper` — almost certainly a bug | XS | Bugfix |
| 9 | Audit `cal-embed.tsx` `brandColor: "#003DA5"` against intended accent (§2) | XS | Brand consistency |

---

## What's already healthy

- Token system is well-designed and complete in `@theme inline`.
- Custom component utilities (`editorial-shell`, `editorial-kicker`,
  `editorial-card`, `editorial-rule`, `editorial-display`, `editorial-prose`,
  `editorial-asym-*`, `grain-overlay`) are consistently adopted.
- Mobile-first ordering across `sm:`/`md:`/`lg:` is correct everywhere.
- The `byu-*` migration is genuinely complete in `src/`.
- shadcn primitives in `src/components/ui/` are not modified — convention
  respected.
- OG route hex literals are correctly inline (Edge runtime can't read CSS
  vars).
- `useReducedMotion()` gating + `prefers-reduced-motion` view-transition
  fallback in `globals.css:225` show good a11y-motion hygiene.
