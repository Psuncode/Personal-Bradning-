# Frontend Design Review — Editorial System

**Date:** 2026-05-19
**Lens:** `.agents/skills/frontend-design/SKILL.md` — distinctive, production-grade frontends; refined minimalism executed with precision.
**Scope:** `src/components/editorial/`, `src/components/sections/`, `src/app/globals.css`, layout shells.
**Verdict:** Strong, intentional editorial direction with a few cohesion drifts worth tightening. No source edits made.

---

## 1. Aesthetic Direction & Differentiation

The site commits to a clear, defensible voice: **cream-paper editorial magazine**, image-forward, Playfair display + Inter body, oxblood-rust accent, grain overlay, drop caps, hung punctuation, oldstyle numerals, asymmetric 12-col helpers, view-transitions across cover hand-offs. Per the skill rubric ("refined minimalism … the key is intentionality, not intensity") this passes. The system reads as designed, not assembled.

**Memorable signature elements (keep these):**
- `ProjectCover` typography plate fallback (`src/components/editorial/project-cover.tsx:35-93`) — oversized Playfair initial + corner brackets + "Cover forthcoming" + accent rule. This is the single most distinctive surface on the site. It's better than 90% of the real photos it's a placeholder for. **Do not let it disappear when imagery lands** — consider keeping it as the loading skeleton.
- Global grain overlay at z-9999 with mix-blend-mode multiply (`globals.css:177-187`) — quiet but unifying.
- `.editorial-asym-left`/`-right` 8-col offset on alternating entries (`editorial-entry.tsx:16`) — gives the projects/blog indexes real magazine rhythm.
- The "Intermission · Continued overleaf" interleaf in `projects-grid.tsx:27-36` — print-affectation that pays off.

---

## 2. Visual Hierarchy

**Working well:**
- Kicker → numeral → display title → sub → rule (`EditorialPageHeader`) is consistent across `/projects` and `/blog` indexes. Numeral is set in Playfair accent, not the dominant ink — correct restraint.
- Hero sets a clean H1 (text-7xl Playfair) against a 4-col "Current Positioning" card, asymmetric `md:col-span-8`/`md:col-span-4`. Good.

**Drift to address:**
- **Heading scale inconsistency.** Five distinct H1/H2 display sizes across the system: hero `text-7xl`, `EditorialPageHeader` and `case-studies.tsx:25` `text-6xl`, `about.tsx:33` `text-6xl`, `case-studies.tsx:200` (CTA) `text-5xl`, `current-focus.tsx:21` `text-5xl`. There's no published display scale anywhere in `globals.css` — every section hardcodes its own Tailwind size. Worth promoting a `--text-display-1/2/3` token set or `.editorial-display-{xl,lg,md}` utilities so the rhythm is enforced, not negotiated.
- **`.editorial-title` (`globals.css:154-157`) is defined but unused.** All call sites inline `font-[family-name:var(--font-playfair)] text-Nxl ...` instead. Either delete it or migrate sections onto it. The current state is dead-code drift.

---

## 3. Typographic Rhythm

**Working well:**
- Playfair restricted to display/heading/numeral/initial; Inter doing all body work. The pairing is appropriate for the magazine direction.
- `hanging-punctuation: first last` applied via `.editorial-display` and the drop-cap rule on `.editorial-prose` (`globals.css:194-209`) — both genuinely distinctive details the skill explicitly rewards.
- `.editorial-kicker` at 11px / 0.28em tracking / accent color is doing real work as the system's "label voice."

**Issues:**
- **Verbose font invocation everywhere.** `font-[family-name:var(--font-playfair)]` appears 20+ times across `editorial/` and `sections/`. The `@theme inline` block already declares `--font-display: var(--font-playfair)` (`globals.css:18`), which means Tailwind 4 should expose `font-display`. Components should use `font-display` — the current incantations are syntactically heavy and easy to mis-type. Consider a one-pass replacement when next touching these files.
- **Body sizes are inconsistent.** "Hero copy" appears as `text-lg leading-8` (hero.tsx:31, case-studies.tsx:28, about.tsx:37), but secondary copy varies between `text-base leading-7`, `text-sm leading-7`, and `text-sm leading-6`. The `.editorial-copy` utility exists but is only declared, never used. Same fix as `.editorial-title` — adopt it or remove it.
- **Numerals.** `.editorial-numerals` (oldstyle figures) is declared (`globals.css:212-214`) and never applied. The plate uses `[font-feature-settings:'lnum','ss01']` instead, which actively *disables* oldstyle. Pick one numeral style for body copy and commit.

---

## 4. Grid Usage & Spatial Composition

**Working well:**
- `EditorialEntry` alternating `editorial-asym-left`/`-right` produces real left-right swing on the index pages.
- `ProjectCover` "beside" layout (col-span-7 image + col-span-5 title) is genuinely different from "overlay" — two distinct cover modes is the right call.
- `case-studies.tsx` uses sticky left column + scrolling right column at `md:col-span-5` / `md:col-span-7`. This is the boldest single layout move in the codebase.

**Issues:**
- **`max-w-7xl` vs `editorial-shell` (`max-w-6xl`).** `case-studies.tsx:22` and `content-grid.tsx` use `max-w-7xl mx-auto`, while every editorial component uses `.editorial-shell` (max-w-6xl). The homepage therefore widens unpredictably between sections. Standardize on `.editorial-shell` — or, if `case-studies` genuinely needs more width for the sticky-column layout, codify a second shell (`.editorial-shell-wide`) instead of free-form `max-w-7xl`.
- **Asymmetry under-used on long-form pages.** The blog post body, project detail body, and `About` text column all sit in a near-centered single column. The skill rubric calls for "Asymmetry. Overlap. Diagonal flow." — consider giving long-form body copy a 7-col offset with 4-col margin notes (the `<Aside>` MDX shortcode is the right vehicle).
- **Whitespace is generous but uniform.** `py-16/24/32` rhythm is fine but predictable. The Intermission band in `projects-grid.tsx` is the one place the page genuinely breaks pace. Worth experimenting with one more "tympanum" device on the homepage between Hero and CaseStudies.

---

## 5. Color Palette Discipline

**Working well:**
- The cream/ink/rust palette is held disciplined inside `editorial/` and most of `sections/`. CSS variables, no inline hexes.
- Accent is reserved for kickers, focus rings, links, oversized numerals, and one decorative rule per plate. That's correct "dominant + sharp accent" execution per the skill rubric.

**Discipline breaks (worth filing):**
- `src/components/sections/content-grid.tsx` is a palette violator: `bg-[#faf9f7]`, `bg-[#0077B5]` (LinkedIn blue), `from-[#002E5D] to-[#0057B8]`, `bg-white/20`, `bg-gray-100 text-gray-700`, `bg-gray-900`. This file does not belong to the editorial system. If it's still rendered, it breaks the visual contract. Either retire it, or reskin it to tokens. (Out of scope to edit per instructions — flagging only.)
- `src/components/sections/blog-post-view.tsx:58` ships `bg-[#0a0a0a] text-gray-100` for code blocks. Inside a cream-paper editorial site this is jarring. Either lean into a true ink-on-paper code block (`bg-[color:var(--color-ink)] text-[color:var(--color-paper-elevated)]`) or build a soft cream code block with a thin rule border — both are more on-brand than near-black.
- `src/components/cal-embed.tsx:17` hardcodes `brandColor: "#003DA5"` (cobalt blue) into Cal.com — that bleeds the site's color contract into the booking embed. Should be `#5f2f2a` (the rust token).
- `bg-white/50` (`case-studies.tsx:99`) and `bg-white/20` (`content-grid.tsx:168`) — pure-white surfaces against cream paper read as a different system. Prefer `bg-[color:var(--color-paper-elevated)]/N`.

---

## 6. Border Radius / Surface Shapes

`editorial-card` is used with five different radii: `rounded-[1.35rem]`, `rounded-[1.5rem]`, `rounded-[1.75rem]`, `rounded-2xl`, `rounded-[2rem]`, `rounded-[2.5rem]`. The `ProjectCover` and `BlogCover` use no radius (full-bleed sharp edges, correct). `EditorialEntry` covers use `rounded-sm`. There's a tension here — print magazines don't round things; this site rounds cards heavily and leaves heroes sharp. That's a legitimate hybrid, but the *card* radii should at least collapse to two tokens (e.g. `--radius-card` = 1.5rem and `--radius-card-lg` = 2.5rem for the dark CTA panel). Right now every card chooses its own.

---

## 7. Responsive Design

**Working well:**
- Asym helpers degrade to full-width at `<768px` (`globals.css:219-222`). Correct.
- `ProjectCover` "beside" stacks correctly at `md:`. Plate initial sizing scales per breakpoint (`text-[14rem] md:text-[22rem] lg:text-[26rem]`).
- Hero CTA card is sensibly placed below H1 on mobile via the implicit `grid` stacking.

**Issues:**
- **Sticky left column on `case-studies.tsx`** (`md:sticky md:top-32`) — on viewports where the left column content is taller than the right column "plates," sticky becomes meaningless and the layout reads broken. Confirm with the longest project's content.
- **`text-[14rem]` initial on the plate at exactly 768px+** can overflow narrow tablet portrait if a project title's first character happens to be a wide glyph (W, M). The `aspect-[16/9]` container clips it, which is the intended behavior, but it would be worth a visual QA pass.
- **Photography route group** is not in scope here, but if it ships with similar tokens it should reuse `.editorial-shell` — flagging for the next pass.

---

## 8. Motion (Framer Motion + reduced-motion)

**Working well:**
- `hero.tsx` is the canonical pattern: `useReducedMotion()` gates `initial`, and the three staggered entries (0.10s / 0.18s / 0.28s / 0.34s delay) execute exactly the "one well-orchestrated page load with staggered reveals" the skill calls out.
- `editorial-rule mt-12 pt-8` and `whileInView` patterns on `case-studies` / `about` / `current-focus` use `viewport={{ once: true, margin: "-100px" }}` — good restraint, no scroll-jank loops.
- Global view-transition reduced-motion fallback (`globals.css:225-230`) is correct.
- `group-hover:scale-[1.02]` / `[1.03]` on cover images is the right subtle scale — not the cliched `1.05`.

**Issues:**
- **`useReducedMotion()` is only honored in `hero.tsx`.** `about.tsx`, `current-focus.tsx`, `case-studies.tsx`, and the case-study `motion.article`s all use `initial={{ opacity: 0, y: 30 }}` unconditionally. A user with `prefers-reduced-motion` will still see them fade-up. This is a real accessibility regression vs. the hero's pattern. Each `whileInView` block should be `initial={shouldReduceMotion ? false : { ... }}`.
- **Motion duration drift.** Hero entrances are `0.45s`, case-studies are `0.6s`, `current-focus` is `0.6s`. None of these are wrong, but consider a `--motion-fast`/`--motion-base` CSS variable so the rhythm is composed, not negotiated.
- **The cover hand-off view-transition** (`cover-<slug>` and `blog-cover-<slug>`) is the most distinctive motion on the site and is correctly gated by `prefers-reduced-motion`. Keep it. Consider documenting it in `CLAUDE.md` so future work doesn't accidentally break the shared `viewTransitionName`.

---

## 9. Magazine-Style Image-Forward Design

- The plate fallback (`ProjectCover` + the `case-studies.tsx:166-183` plate variant) genuinely substitutes typography for missing imagery in a way that reads designed rather than placeholder. Strong.
- `<FullBleed>`, `<Gallery>`, `<Figure>` MDX shortcodes exist (per `CLAUDE.md`). Worth verifying that authored posts are actually using `<FullBleed>` to break the column — if every post is wall-to-wall `<Figure>` cards, the magazine-feel deflates. (Not auditable from code alone.)
- The 16:9 `BlogCover` with `from-black/55 to-transparent` gradient is conventional. Consider mirroring `ProjectCover`'s "beside" option for blog so not every post leads with the same overlay treatment — variety is the magazine move.
- Drop caps via `.editorial-prose > p:first-of-type::first-letter` are an unusually high-confidence detail. Keep.

---

## 10. `ProjectCover` Typography Plate Fallback — Specific Notes

(File: `src/components/editorial/project-cover.tsx`.)

**Strong:**
- Dual-variant sizing (`overlay` vs `beside`) for the initial — recognizes that 16:9 and 4:3 need different proportions. Mature.
- Corner brackets (`inset-3 md:inset-5`) are a print-mark detail almost nobody adds. Excellent.
- "Cover forthcoming" / "Plate NN" kicker pair grounds the plate as intentional, not broken.
- `<h1 class="sr-only">` (line 155) preserves the document outline even though the visible H1 is decorative. Correct.
- `font-feature-settings:'lnum','ss01'` on the initial — tasteful OpenType use.

**Tighten:**
- The `radial-gradient` dotted texture (`backgroundSize: 18px 18px`) is so subtle at `opacity: 0.6` on `--color-rule` at 65% mix that on a non-Retina screen it can disappear entirely. Consider doubling the alpha or rotating the pattern to a 24px diagonal — give it enough presence to register without overpowering.
- `displayInitial` falls back to `"•"` for titles starting with non-alphanumerics. A bullet at 22rem is unfortunate. Consider falling back to the first two letters' kerned ligature, or to a Playfair `§` / `¶`.
- The "beside" variant uses `pt-24` (line 105) at the outer header level — should that respect `editorial-shell` padding? On wide viewports it currently goes edge-to-edge for the image, which is intentional (image-forward) but the title side has no left padding either. Confirm against the live page.
- Plate currently has no link affordance. When the same component renders on `/projects` index vs `/projects/[slug]`, only the index version is wrapped in `<Link>`. Make sure that holds.

---

## Priorities (P0 → P3)

**P0 (real bugs / palette breaks):**
1. `useReducedMotion` is not honored in `about.tsx`, `current-focus.tsx`, `case-studies.tsx`. Match the hero pattern.
2. `cal-embed.tsx:17` brandColor `#003DA5` violates the palette. Swap to `#5f2f2a`.
3. `content-grid.tsx` palette (LinkedIn blue, gray-900, white, navy) is incompatible with the editorial system. Retire or reskin.
4. `blog-post-view.tsx:58` `bg-[#0a0a0a]` code block needs editorial treatment.

**P1 (system cohesion):**
5. Adopt a published display scale; consolidate the 5 distinct heading sizes into 3 tokens. Use `.editorial-title` / `.editorial-copy` (or delete them).
6. Standardize on `.editorial-shell` width across `case-studies.tsx` and any other `max-w-7xl` holdouts.
7. Collapse the 6 distinct card radii into 2 tokens.
8. Replace 20+ `font-[family-name:var(--font-playfair)]` invocations with `font-display`.

**P2 (taste):**
9. Apply `.editorial-numerals` to body copy where supported (and remove the `lnum` override on the plate, *or* keep it intentionally on display-only surfaces).
10. Introduce a second "tympanum" device on the homepage between Hero and CaseStudies — the projects-grid Intermission proves this works.
11. Strengthen the plate's dotted texture so it registers on non-Retina.

**P3 (future-facing):**
12. Add an `<Aside>`-driven 7+4 column option for blog body to use the asymmetric helpers in long-form.
13. Mirror `ProjectCover`'s "beside" variant for `BlogCover` so blog leads have visual variety.
14. Document the `cover-<slug>` / `blog-cover-<slug>` view-transition contract in `CLAUDE.md`.

---

## Bottom line

This is a confidently designed site that earns the magazine label. The biggest risk is *drift away from its own system*: declared utilities (`.editorial-title`, `.editorial-copy`, `.editorial-numerals`) sit unused while components inline ad-hoc Tailwind. A one-pass consolidation onto tokens — plus fixing the four palette breaches and the missing `useReducedMotion` calls — would lift the whole codebase from "looks designed" to "is designed."
