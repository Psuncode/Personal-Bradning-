---
status: complete
standard: WCAG 2.2 AA
date: 2026-05-19
reviewer: accessibility-skill (.agents/skills/accessibility/SKILL.md)
files_reviewed: 35
findings:
  critical: 4
  warning: 13
  info: 4
  total: 21
scope:
  - src/components/**/*.tsx
  - src/app/(main)/**/*.tsx
  - src/app/(photography)/**/*.tsx
  - src/app/(ecommerce)/**/*.tsx
  - src/app/layout.tsx
palette_context:
  - --color-paper #f4efe6
  - --color-paper-elevated #fbf7f1
  - --color-ink #201c1a
  - --color-ink-soft #5f5851
  - --color-accent #5f2f2a
  - --color-rule #d9cfc1
do_not_edit: true
---

# Accessibility Review — Editorial Portfolio

Audit of every JSX/TSX component under `src/components/` and every `page.tsx`/`layout.tsx` in the route groups. Standards from `.agents/skills/accessibility/SKILL.md` (WCAG 2.2, POUR, AA targets). No source files were modified.

Color-contrast figures below are computed against the documented editorial palette. Where Tailwind gray utilities appear, the literal hex of that utility is used (`text-gray-500` = `#6b7280`, `text-gray-400` = `#9ca3af`, `text-gray-300` = `#d1d5db`, `bg-gray-50` = `#f9fafb`).

---

## Critical

### C1. Form labels not programmatically associated in `BookingForm`
**File:** `src/components/booking/BookingForm.tsx:371–411`
**Severity:** Critical (WCAG 3.3.2 Labels, 1.3.1 Info & Relationships, 4.1.2 Name Role Value)
**Issue:** In step `details`, three `<label>` elements have neither an `htmlFor` attribute nor wrap their input. They are pure sibling text. The matched inputs (`name="name"`, `name="email"`, `name="description"`) have no `id` either. Screen readers will not announce the field name when focus lands on the input, and clicking the label text will not focus the field.
```tsx
<label className="block text-sm font-medium ...">Name *</label>
<input type="text" name="name" ... />   // no id, no aria-labelledby
```
Compare with the *PhotographyBookingForm* sibling component (lines 633–704) which does this correctly with `htmlFor="booking-name"` / `id="booking-name"`.
**Fix:** Add `id` to each input and `htmlFor` to each label (or wrap the input inside the label). Also surface the required state to AT — append a `<span className="sr-only">required</span>` next to the visible `*` and add `aria-required="true"` to each required input.

### C2. Non-button used as button in `PhotographyBookingForm` package card
**File:** `src/components/booking/PhotographyBookingForm.tsx:462–501`
**Severity:** Critical (WCAG 4.1.2; SKILL.md "Prefer native elements")
**Issue:** Each photography-package card is a `<div role="button" tabIndex={0}>` with manual keyboard handling. The skill explicitly says *"Prefer native elements: ✅ Native button"*. Side effects observed: no implicit form semantics, no default focus ring (focus styling is hidden — the card only changes `border` color on selection, not on focus), no implicit disabled support, and the `role="button"` div is also missing an accessible name binding to the visible `<h3>`.
**Fix:** Replace with `<button type="button">` (style with `text-left bg-transparent`). Remove `role`, `tabIndex`, and the manual `onKeyDown` Enter/Space shim. Add `aria-pressed={selectedPackage?.id === pkg.id}` so the toggle state is announced. Add a `focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]` style so keyboard users see focus.

### C3. Sticky-header obscures focus on in-page anchors
**File:** `src/app/globals.css:126–142` (and the navbar in `src/components/layout/navbar.tsx:87`)
**Severity:** Critical (WCAG 2.2 — 2.4.11 Focus Not Obscured, new in 2.2)
**Issue:** The navbar is `sticky top-0 z-50` and 64 px tall (`h-16`). `globals.css` declares no `scroll-margin-top` on `:focus`, `:target`, or headings. When a keyboard user Tab-focuses an interactive element near the top of the viewport — for example after activating the skip link in `src/app/(main)/layout.tsx:100–105`, or returning from "← Back" buttons — the focused control will sit *behind* the sticky header.
**Fix:** Add to `globals.css`:
```css
:target,
:focus { scroll-margin-top: 80px; }
```
Apply to focusable interactive elements as well via `*:focus-visible { scroll-margin-top: 80px; }`. The skill calls this pattern out explicitly under 2.4.11.

### C4. Gallery photo metadata only available on mouse-hover
**File:** `src/app/(photography)/photography/gallery/GalleryGrid.tsx:46–67`
**Severity:** Critical (WCAG 1.4.13 Content on Hover or Focus, 2.1.1 Keyboard)
**Issue:** The masonry grid wraps each photo in a `<div>` (not a button or link). The overlay containing the photo's caption + category is `opacity-0 group-hover:opacity-100`. Keyboard users (and SR users) cannot reveal the caption, since the wrapper is not focusable and there is no `group-focus-within:opacity-100`. The `alt` text covers basic identification, but the displayed category metadata is inaccessible without a mouse.
**Fix:** Either (a) make each tile a `<button>` or `<Link>` (it's already `cursor-zoom-in`, implying a lightbox is planned) with `group-focus-visible:opacity-100` added to the overlay, or (b) render the caption + category inline below the image so it is always exposed. Today the category is also visible to *no one* without hover, so the data may as well be SR-visible.

---

## Warning

### W1. Calendar disabled state relies on color alone
**File:** `src/components/booking/BookingForm.tsx:227–244` and `src/components/booking/PhotographyBookingForm.tsx:362–378`
**Severity:** Warning (WCAG 1.4.1 Use of Color, 1.3.3 Sensory Characteristics)
**Issue:** Past, weekend, and busy days are all communicated as gray text. Past days use `text-gray-300` (#d1d5db) on `bg-paper` (#f4efe6) — contrast 1.33:1, fails 3:1 for UI components (the cell *is* a button). Busy days use `text-gray-400 bg-gray-50` — distinguishable from past only by background, and only to sighted users. Screen-reader users hear "Button, 5, dimmed" with no reason given.
**Fix:** Add `aria-label` per cell: `aria-label="May 5 — past date, unavailable"`, `aria-label="May 9 — weekend, unavailable"`, `aria-label="May 13 — fully booked"`. Optionally add a visual treatment beyond color (a small "·" or strike-through) so the three states are visually distinguishable too.

### W2. Step-indicator pending state fails AA contrast
**File:** `src/components/booking/PhotographyBookingForm.tsx:91`
**Severity:** Warning (WCAG 1.4.3 Contrast (Minimum))
**Issue:** Future steps render as `bg-gray-200 text-gray-500` (#e5e7eb on #6b7280 inside the circle, but the visible numeral is on the gray fill: foreground #6b7280 on #e5e7eb = 3.61:1). For 14 px non-bold numerals this fails the 4.5:1 normal-text AA threshold. The "current" and "complete" states pass.
**Fix:** Use `text-gray-700` (`#374151`) on `bg-gray-200` — 8.6:1. Or use editorial tokens: `bg-[color:var(--color-rule)] text-[color:var(--color-ink-soft)]` (≈4.95:1, just over AA).

### W3. Navbar Ventures dropdown missing menu semantics
**File:** `src/components/layout/navbar.tsx:114–168` (desktop) and `:235–292` (mobile)
**Severity:** Warning (WCAG 4.1.2, WAI-ARIA APG menu/button)
**Issue:** The "Ventures" trigger correctly toggles `aria-expanded` but is missing `aria-haspopup="menu"` and `aria-controls`. The dropdown panel has no `role="menu"` and its items no `role="menuitem"`. Tabbing into the open dropdown lands on the first `<a>` only because of DOM order; arrow-key navigation (Up/Down/Home/End) is not wired. ESC-to-close *is* implemented (good).
**Fix:** Either commit to the menu pattern (add `aria-haspopup="menu"`, `aria-controls="ventures-menu"`, `role="menu"`/`role="menuitem"`, and Up/Down arrow handlers), or treat it as a disclosure widget by simply leaving `aria-expanded` and adding `aria-controls="ventures-panel"`. The disclosure approach matches the current UX and is simpler.

### W4. `ProjectCover` typography plate exposes decorative chrome to AT
**File:** `src/components/editorial/project-cover.tsx:62–69`
**Severity:** Warning (WCAG 1.3.1, SKILL.md "Decorative image (empty alt)")
**Issue:** The placeholder plate hides the big decorative initial and the corner brackets with `aria-hidden`, and adds a `sr-only` `<h1>` (good). But the kicker (`Plate 01` / `Plate`) and the "Cover forthcoming" status string are *not* `aria-hidden`. Screen-reader users will hear "Plate 01, Cover forthcoming, [project title]" before any content. The `kickerLabel` is purely a decorative editorial flourish; "Cover forthcoming" is internal status, not visitor-facing copy.
**Fix:** Wrap both header spans in an `aria-hidden="true"` container, or move the placeholder note behind `data-` only. The visible plate footer `<span>` containing the project title is also a decorative duplicate of the `sr-only` h1 — mark it `aria-hidden` too.

### W5. Email/social icons in `ContactSection` are not announced
**File:** `src/components/sections/contact-section.tsx:61–101`
**Severity:** Warning (WCAG 1.1.1, SKILL.md "Icon buttons need accessible names")
**Issue:** Each contact tile pairs a Lucide icon with visible text. Lucide renders an `<svg>` *without* `aria-hidden`, so SR users hear "image, [text]" — minor double-announce. Worse, the MapPin tile (line 71–76) is wrapped in a `<div>` with no `role` — fine — but the icon SVG itself is announced as "image" with no role.
**Fix:** Add `aria-hidden="true"` to each Lucide icon (or pass `aria-hidden` through the lucide component). Apply globally where icons sit next to text.

### W6. `BlogPostView` cover-present branch demotes h1 to `<p aria-hidden>`
**File:** `src/components/sections/blog-post-view.tsx:110–121`
**Severity:** Warning (WCAG 2.4.6 Headings and Labels, 1.3.1)
**Issue:** When `post.cover` is set, the inline title is rendered as `<p aria-hidden="true">` and the canonical `<h1>` lives inside `BlogCover` (line 30 of `blog-cover.tsx`) over the photograph. That is correct *structurally*, but the visible duplicated paragraph below the cover is the title users actually scan to. Marking it `aria-hidden` means SR users skip what sighted users perceive as the title. It is rendered redundantly because the cover-bound h1 is white-on-image and not in document flow.
**Fix:** Either (a) drop the second visible-but-hidden title entirely (the cover already carries it), or (b) keep the in-flow heading as the `<h1>` and demote `BlogCover` to a non-heading title overlay. Today the duplication wastes assistive-tech time and risks duplicate-h1 audit flags.

### W7. PhotographyNav mobile toggle missing `aria-expanded`/`aria-controls`
**File:** `src/components/photography/PhotographyNav.tsx:70–77`
**Severity:** Warning (WCAG 4.1.2)
**Issue:** Toggle button only has `aria-label`. Compare with the main navbar (`src/components/layout/navbar.tsx:200–208`) which uses the Radix Sheet (handles ARIA for free). The photography nav rolls its own disclosure with no `aria-expanded={open}` and no `aria-controls` pointing at the panel.
**Fix:** Add `aria-expanded={open}` and `aria-controls="photography-mobile-menu"` to the button; add `id="photography-mobile-menu"` to the panel `<div>`.

### W8. Calendar prev/next "←" "→" buttons are arrow glyphs only
**File:** `src/components/booking/BookingForm.tsx:262–280` and `src/components/booking/PhotographyBookingForm.tsx:396–414`
**Severity:** Warning (WCAG 1.1.1, 2.5.8 Target Size — 2.2)
**Issue:** The arrow buttons have `aria-label="Previous month"` / `"Next month"` (good). But the visible content is a Unicode arrow which some screen readers also announce as "left arrow" — leading to "Previous month, left arrow" double-read. The hit-area is `p-2` only — a 24 px circle around a single-character glyph is borderline against the new 2.2 AA target of 24 × 24 CSS pixels. Disabled state uses `text-gray-300` (#d1d5db) on cream (#f4efe6) — 1.33:1; fails the 3:1 UI-component minimum, but disabled controls are exempt under 1.4.11.
**Fix:** Wrap the arrow in `aria-hidden="true"` and let the `aria-label` carry the meaning. Increase padding to `p-3` or set `min-w-[2.75rem] min-h-[2.75rem]` for comfortable touch.

### W9. Footer external links missing visited-state and noopener
**File:** `src/components/layout/footer.tsx:27–41`
**Severity:** Warning (Robustness; 2.4.4 Link Purpose)
**Issue:** `LinkedIn` and `GitHub` are correct (target=_blank, rel="noopener noreferrer"), but they read as bare nouns to screen readers — "LinkedIn, link" gives no context that opens externally. The skill recommends "indicate when links open in a new tab".
**Fix:** Add a visually-hidden span: `<span className="sr-only">opens in new tab</span>`, or add `aria-label="LinkedIn (opens in new tab)"`. Same for the GitHub link.

### W10. `pre`/`code` block contrast in MDX styling
**File:** `src/components/sections/blog-post-view.tsx:57–61`
**Severity:** Warning (WCAG 1.4.3)
**Issue:** Code blocks render `text-gray-100` (#f3f4f6) on `bg-[#0a0a0a]` — 18.6:1, passes. But the inline `code` element uses `text-[color:var(--color-ink)]` on `bg-[color:var(--color-paper-elevated)]` (#201c1a on #fbf7f1) — 15:1, passes. Both fine. Flag-only for the embedded `text-gray-100` literal: prefer a CSS-token-based palette for the night mode of the codebase later; out of scope here but worth noting.
**Fix:** No change required. Track for future tokenization.

### W11. Page heading hierarchy on `/projects/<slug>`
**File:** `src/components/sections/project-detail-view.tsx:20–104`
**Severity:** Warning (WCAG 1.3.1, 2.4.6)
**Issue:** `ProjectCover` already emits the `<h1>` (visible or sr-only). The body then opens with `<p className="editorial-kicker">Problem</p>`, `<p ...>Approach</p>`, `<p ...>Results</p>`, `<p ...>Tech Stack</p>` instead of `<h2>`. The skill flags this under "Missing heading structure" as a *Serious* issue. Skipping to landmarks works (the `<section>` wrappers help), but SR users navigating by heading get only one level.
**Fix:** Convert each section's kicker to `<h2 className="editorial-kicker">…</h2>`. Visual styling is unchanged because the editorial-kicker class is the same.

### W12. `EditorialEntry` cover image alt is taken from `description` fallback chain
**File:** `src/components/editorial/editorial-entry.tsx:27–37` (callsite: `src/components/sections/blog-list.tsx:79–81`)
**Severity:** Warning (WCAG 1.1.1)
**Issue:** When a blog post has a cover but no `coverAlt`, BlogList passes `alt: post.cover.alt ?? post.frontmatter.title`. That is plausible, but the cover may be a decorative photograph whose semantic content is not the title (e.g., an abstract photo). Repeating the title as alt also creates SR duplication since the title is rendered immediately below as `<h2>`.
**Fix:** When no `coverAlt` is supplied, treat the image as decorative — pass `alt=""` so the title (the next `<h2>`) is the only label. Document in `content/blog/AUTHORING.md` that `coverAlt` is required for non-decorative covers.

### W13. `siteConfig.email` mailto link in ContactSection has no descriptive label
**File:** `src/components/sections/contact-section.tsx:61–69`
**Severity:** Warning (WCAG 2.4.4 Link Purpose)
**Issue:** The visible label is the email string. SR users hear "h-i-@-d-o-t…" letter-by-letter. Acceptable, but not great.
**Fix:** Add `aria-label="Email Philip Sun"` or wrap email in something like `<span className="sr-only">Email </span>{email}`.

---

## Info

### I1. Skip link is present and works
**File:** `src/app/(main)/layout.tsx:100–105`
**Severity:** Info
The skip link is the correct sr-only-until-focus pattern, lands on `#main-content`, and uses high-contrast `bg-gray-900 text-white`. Good. Pair with C3 (scroll-margin fix) for full conformance.

### I2. Reduced-motion handling is correct in `hero.tsx`, `contact-section.tsx`, and `globals.css`
**Severity:** Info
`useReducedMotion()` is used to short-circuit `initial` props. The `@media (prefers-reduced-motion: reduce)` block in `globals.css:225–231` also kills the view-transition animations. `CaseStudies` and `About` use Framer's `whileInView` without gating — Framer respects the user preference internally by default, so this is acceptable; consider an explicit gate for consistency.

### I3. Form errors use `role="alert"` correctly
**File:** `src/components/sections/contact-section.tsx:126–151`, `src/components/booking/PhotographyBookingForm.tsx:652–656`
**Severity:** Info
Inline error messages use `role="alert" aria-live="polite"` and the field-error pattern matches the skill's recommended markup.

### I4. Radix Accordion/Sheet primitives carry their own ARIA
**File:** `src/components/ui/accordion.tsx`, `src/components/ui/sheet.tsx`
**Severity:** Info
Both wrap `radix-ui` primitives which handle focus trap, focus restore, ESC-to-close, `aria-controls`, and `aria-expanded` for free. No issues. Stay on the wrappers.

---

## Suggested remediation order

1. **C1** — wire up form labels in `BookingForm` (trivial fix, blocks legal AA conformance).
2. **C2** — swap the photography package `div role=button` to native `<button>` (5 minutes, removes a duplicate keyboard handler).
3. **C3** — single CSS rule for `scroll-margin-top`. Covers the entire sticky-header surface.
4. **C4** — decide if gallery tiles should be lightbox triggers or `<Link>`s, then make them focusable.
5. **W1, W2** — calendar SR labels + step-indicator contrast bump.
6. **W4** — `ProjectCover` aria-hidden cleanup on the decorative chrome (the audit task's specific call-out).
7. **W3, W7** — disclosure semantics on both navbars.
8. **W6, W11** — heading hierarchy in `BlogPostView` and `ProjectDetailView`.

---

## Top three by impact

1. **C1 — unlabeled inputs in `BookingForm`** — full booking flow in the /meet page is unusable to screen-reader users on step 3.
2. **C2 — non-button package card in `PhotographyBookingForm`** — the most visible primary action in the photography booking flow is a `div role="button"` that hides keyboard focus.
3. **C3 — focus-not-obscured violation** — every keyboard nav after the skip link or after returning from an in-page anchor lands focus behind the sticky header.
