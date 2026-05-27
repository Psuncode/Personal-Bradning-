---
status: needs_attention
branch: feat/homepage-redesign-v2
commit: a04babb
audited_at: 2026-05-19
---

# Homepage Redesign v2 — Design Principles Audit

Audited against the 12 design principles enumerated in the user's prompt
(spec lists 10; principles 11 + 12 added by user in the audit brief). Source
of truth: `docs/superpowers/specs/2026-05-19-homepage-redesign-v2-design.md`
plus the inline list in the audit brief.

The 12 principles, restated:

1. Type does the heavy lifting (no decorative images where type would land harder)
2. Two-typeface system: Playfair (display) + Inter (body) + Geist Mono (code) — no third family
3. Cream + warm black palette; accent reserved for interaction states only
4. Whitespace IS the design (hero ~85vh, sections generous, body 50-60ch max)
5. Restraint in voice + restraint in mark (no metric tiles, no decorative SVG)
6. One button style (dark pill), used only in nav + photography contact
7. Editorial rhythm, not template rhythm (each section varies; eyebrows are quiet)
8. Hover is one subtle effect, ≤250ms
9. Honest placeholders ("↳ forthcoming"), never stock, never fake
10. One thing to read, then a quiet shelf
11. Mobile is the same site, smaller (no mobile-only patterns)
12. Footer is a sitemap, not a goodbye

## Per-section scorecard

| Section | Met | Violations | Notes |
|---|---|---|---|
| **Hero** | 11/12 | P4 (hero height) | Type-only, dark-ink, Playfair H1, single text-link CTA — clean. But hero is `pb-24 pt-32 md:pb-32 md:pt-40` (~320–480px), nowhere near the `~85vh` the spec demanded. |
| **HeadlineProject** | 11/12 | P4 (body width) | Honest placeholder ("↳ device render forthcoming"), corner-bracket plate, no metric tiles. Body copy uses `max-w-[65ch]`, slightly above the 50–60ch range in P4 — minor. |
| **SelectedWriting** | 11/12 | P8 (two hover effects on same surface) | Beautiful: Playfair titles, no thumbnails, hairline separators, date · read-time meta. Card uses `group-hover:italic` AND its sibling "All writing →" uses `hover:text-accent` — two distinct hover patterns in one section. Same `max-w-[65ch]` issue as HeadlineProject on the excerpt. |
| **ToolsGrid** | 12/12 | none | 2-up grid, typographic-plate fallback with "↳ screenshot forthcoming", no decorative chrome, hover-color-only links. Lands cleanly. |
| **Elsewhere** | 12/12 | none | Plain-text rows, `→` arrow, italic+accent on hover, no cards. Exact match to spec. |
| **SitemapFooter** | 11/12 | P8 / P2 (inconsistency on email link) | 4-column sitemap nails P12. All links use ink + hover-accent + underline. **But** the email row swaps to Playfair display font while every other link is Inter — that's a third typographic register inside one block (display font used for a body-grade utility). Minor. |
| **Photography hero** (`/photography`) | 4/12 | P3, P5, P6, P10 (catastrophic) | The 90vh night-sky image with `alt=""` is correct (spec ✓). **But the next section (lines 138–184) reinstates a second "hero" with a dark gradient overlay, kicker in `amber-200/85`, H1 + dek + TWO pill buttons** ("Book a Session" white, "View Pricing" outline). This is exactly what the spec said to remove. |

## Specific violations (with file:line)

### V1 — Principle 4: Hero is not ~85vh

**File:** `src/components/sections/hero.tsx:10`
**What's wrong:** The hero `<section>` uses `pb-24 pt-32 md:pb-32 md:pt-40`,
which produces a content block roughly 320–480px tall depending on text wrap.
The spec is explicit: "Hero treatment | Type-only, ~85vh, no photo" (decision
table) and principle 4 calls hero ~85vh out by name.
**Why it violates principle 4:** The hero should command 85% of the first
viewport — a deliberate, generous slab of cream paper with one sentence and
one link. As shipped, the hero ends ~third of the way down the fold and the
next section's typographic plate is immediately visible. The "whitespace IS the
design" promise isn't being kept at the most-load-bearing section of the page.
**Suggested fix:** Apply `min-h-[85vh] flex items-center` to the section, or
replace the top/bottom padding with viewport-relative heights. Keep entrance
motion unchanged.

### V2 — Principle 6 + 3 + 10: Photography "second hero" reinstates everything the spec deleted

**File:** `src/app/(photography)/photography/page.tsx:138-184`
**What's wrong:** Immediately below the correct full-bleed 90vh night-sky
image, the page renders another full-section dark hero with:
- `bg-gray-950` panel + dark-to-darker gradient (off-palette, not cream/ink)
- An amber-tinted kicker (`text-amber-200/85`) — accent on a non-interactive label
- H1 "Utah Couples & Portrait Photographer" overlaid on a faded gallery photo
- TWO pill buttons side-by-side: a white-on-dark "Book a Session" + an
  outlined "View Pricing"
**Why it violates multiple principles:**
- **P3 (palette):** Uses `gray-950`, `gray-900`, `amber-200` — none are token-driven cream/ink colors.
- **P5 (restraint in mark):** Two CTAs side-by-side is the visual grammar this redesign explicitly rejected.
- **P6 (one button style):** Two button styles in one component, both pill-shaped, distinct treatments.
- **P10 (one thing to read):** Competes with the silent night-sky hero directly above it for "what is this page".
- **P11 (mobile is the same site, smaller):** The two-button row collapses to `flex-col` only on mobile — a mobile-specific layout switch.

**Suggested fix:** This section, and the duplicate CTA block at lines 394–422,
both need to be either removed or rewritten to the new editorial language
(eyebrow + Playfair H2 + 65ch dek + single text-link CTA). The night-sky
hero alone should set the page; the buttons belong further down in a
properly-restrained "Book a session" block. There are also 8+ other gray/amber
panels lower on the page that don't match the cream/ink system — those are
out-of-scope for the homepage audit but worth a separate sweep.

### V3 — Principle 8: Two hover idioms used together

**File:** `src/components/sections/selected-writing.tsx:43` and `:65`; also `src/components/sections/elsewhere.tsx:50`
**What's wrong:** SelectedWriting uses `group-hover:italic` on post titles
(no color shift) AND `hover:text-accent` on the "All writing →" footer link.
Elsewhere combines both on the same element (`hover:italic hover:text-accent`).
Tools and Hero only use `hover:text-accent hover:underline`.
**Why it violates principle 8:** "Hover is one subtle effect" implies a single
consistent idiom. As shipped there are three: (a) ink→accent color, (b)
roman→italic transform, (c) accent + italic combined. Each is ≤250ms (`duration-150` or `duration-200`), so the timing is fine — it's the multiplicity of effects that breaks the principle.
**Suggested fix:** Pick one and stick to it. The italic-on-hover is the more
distinctive choice and fits the editorial tone; if it's the canonical hover,
apply it everywhere and drop `hover:text-accent` from non-link contexts.
Alternatively, reserve italic for prose-grade links (post titles, off-site
destinations) and color for utility links — but document that distinction in
CLAUDE.md so it stays consistent.

### V4 — Principle 4: Body copy slightly wider than 50–60ch

**File:** `src/components/sections/headline-project.tsx:79`, `src/components/sections/selected-writing.tsx:51`
**What's wrong:** Both use `max-w-[65ch]` for body/excerpt copy.
**Why it violates principle 4:** Principle 4 specifies "body 50-60ch max" —
65ch is 8–30% wider than the upper bound. At Inter 18px (the body size used
here), 65ch yields ~660px line lengths, which start to fatigue.
**Suggested fix:** Tighten to `max-w-[60ch]` or `max-w-[58ch]` site-wide.
This is a one-line change in each file and improves rhythm noticeably.

### V5 — Principle 2/7: SitemapFooter email link uses Playfair where every other link uses Inter

**File:** `src/components/layout/sitemap-footer.tsx:142`
**What's wrong:** The email row in the Contact column is rendered as
`font-[family-name:var(--font-playfair)] text-base` — Playfair at body size.
Every other footer link uses Inter via the `columnLink` class.
**Why it violates principle 2/7:** P2 says Playfair is the **display** face;
applying it to an `<a>` body element makes Playfair do double duty as both
display and body. P7 ("editorial rhythm, not template rhythm") still expects
internal consistency within a single block — mixing fonts inside one
4-column footer reads as decoration rather than rhythm.
**Suggested fix:** Either match the other links (Inter `text-sm`) or commit
to the email-as-display treatment by giving it its own row treatment (e.g.,
larger size, span the column header position) so it reads as deliberate.

### V6 — Latent risk: `.editorial-kicker` paints accent on non-interactive labels

**File:** `src/app/globals.css:161-164`
**What's wrong:** The `.editorial-kicker` utility sets `color: var(--color-accent)`. The redesigned homepage sections correctly avoid this class (they hand-roll eyebrow styles in ink-soft), so there's no rendered violation. But the class is still exported and any future section that uses `.editorial-kicker` will paint the accent on a decorative label — directly contradicting the locked decision: "Accent unchanged... never on eyebrows".
**Why it violates principle 3:** It's a footgun that codifies the wrong default in the design system.
**Suggested fix:** Either delete the `.editorial-kicker` class outright (no homepage section uses it) or recolor it to `var(--color-ink-soft)` so the design system can't accidentally regress.

### V7 — Minor: Source casing of eyebrow labels is inconsistent

**File:** `src/components/sections/headline-project.tsx:70`, `tools-grid.tsx:98` (UPPERCASE in source) vs `selected-writing.tsx:32`, `elsewhere.tsx:38` (Title Case in source, uppercased via Tailwind)
**What's wrong:** All four render uppercase via `uppercase` Tailwind utility, so the visible page is correct. But two are SHOUTED in source and two are Title-Cased. Not a principle violation per se — a maintainability sneeze worth flagging because it suggests the team didn't settle on a convention.
**Suggested fix:** Pick one (recommendation: Title Case in source, `uppercase` in CSS — more readable in code review and matches the existing pattern in Elsewhere + SelectedWriting).

## What's working well

- **Type-only hero, headline plate, selected writing, tools, elsewhere, footer** form a clean editorial sequence. The corner-bracket typographic plates are the kind of restrained editorial mark the spec called for, and they're consistent between HeadlineProject and ToolsGrid.
- **Honest placeholders** are everywhere they should be — "↳ device render forthcoming", "↳ screenshot forthcoming", "milestone forthcoming", "timing forthcoming". P9 is fully respected.
- **No metric tiles, no decorative SVG, no gradient panels** anywhere in the 5 homepage sections. P5 lands.
- **Color tokens** are correctly scoped to interaction (focus rings via `--ring`, hover-accent on links). Body of the homepage uses ink + ink-soft + rule + paper — no off-palette colors leak through except the `focus:bg-gray-900` on the skip link (a11y carve-out, fine).
- **One canonical CTA pattern** (text link with `→` arrow + hover-underline) used in Hero, HeadlineProject, ToolsGrid, and SelectedWriting footer. P6 is upheld on the homepage proper; only Photography page violates it.
- **SitemapFooter** is a real sitemap with WORK / WRITING / ELSEWHERE / CONTACT columns and a `© year` meta row. P12 lands.
- **Mobile** uses the same component tree, just smaller (single-column grids, responsive Playfair sizes). P11 is solid on the homepage.

## Verdict

The 5 homepage sections + sitemap footer largely deliver on the design
principles — the editorial restraint, honest placeholders, and typographic
hierarchy are real. **Two things hold the audit back from "approved":** the
hero never reaches its promised ~85vh slab, and the `/photography` page still
ships an old-school dark-hero-with-two-buttons stack that contradicts the new
language right next to the night-sky image that was supposed to replace it.
Fix V1 (hero height) and V2 (photography second hero + duplicate CTA block)
and this branch is shippable as the new design baseline.
