# shadcn/ui Review — personal-website

**Scope:** `src/components/ui/` primitives + every consumer under `src/`.
**Config:** `components.json` — `style: new-york`, `rsc: true`, `baseColor: neutral`, `cssVariables: true`, `iconLibrary: lucide`, `base: radix`, Tailwind v4 (`@theme inline` in `src/app/globals.css`). Installed primitives: `accordion`, `badge`, `button`, `card`, `navigation-menu`, `separator`, `sheet`. Deps: `radix-ui@^1.4.3`, `class-variance-authority@^0.7.1`, `tailwind-merge@^3.5.0`, `lucide-react@^0.574.0`, `shadcn@^3.8.5`, `tailwindcss@^4`.

Note: `CLAUDE.md` explicitly says **don't modify `src/components/ui/` structurally** — so this review treats primitive integrity as a hard gate and focuses fixes on the **consumers**.

---

## Strengths

1. **Primitive integrity is clean.** All seven files in `src/components/ui/` match current shadcn "new-york" templates: `data-slot` attributes present, `cva` + `VariantProps`, `cn()` used everywhere, `asChild` via `Slot.Root` from `radix-ui`. No structural drift from upstream. `button.tsx` even adds extra slots (`data-variant`, `data-size`) — useful for tests and harmless.
2. **Theme tokens are wired correctly for v4.** `globals.css` declares the full semantic palette (`--background`, `--card`, `--primary`, `--muted-foreground`, `--accent`, `--ring`, …) in `:root` + `.dark`, and `@theme inline` maps each to a `--color-*` so Tailwind utilities (`bg-card`, `text-muted-foreground`) work. The editorial `--color-paper / --color-ink / --color-accent` tokens layer cleanly on top — they don't fight the shadcn palette.
3. **Sheet usage in `navbar.tsx` is correct.** Has `SheetTitle` (required by Radix Dialog for a11y), `SheetTrigger asChild`, `Button size="icon"` + `<span className="sr-only">`. Matches the composition rule that Sheet/Dialog/Drawer always need a Title.
4. **Accordion usage in `faq.tsx`** correctly composes `Accordion type="single" collapsible` → `AccordionItem` → `AccordionTrigger` + `AccordionContent`. Proper Radix children nesting.
5. **`asChild` pattern used correctly** for `<Button asChild><Link …></Button>` in `project-card.tsx` and `not-found.tsx` (radix base — `asChild`, not `render`).
6. **Test coverage exists** on `button.tsx` (`button.test.tsx`) — exercises variant/size/disabled/className. Good seed pattern.

---

## Issues

### 🔴 Critical — Accessibility

1. **Booking forms use raw `<input>`/`<label>`/`<textarea>` with no shadcn form primitives.**
   - `src/components/booking/BookingForm.tsx` L370–411 and `PhotographyBookingForm.tsx` (form fields throughout).
   - `src/app/(main)/admin/login/page.tsx` L26–35 (raw `label htmlFor` + `input`).
   - No `Field`/`FieldGroup`/`FieldLabel`/`Input`/`Textarea` primitives are installed. Violates the forms rule: `FieldGroup` + `Field` for layout, controls inside `Field`, `data-invalid` on `Field` + `aria-invalid` on the control for validation states.
   - **Fix:** Install `input`, `textarea`, `field`, `label` via `npx shadcn@latest add input textarea field label`. Replace raw markup. `htmlFor`/`id` pairing is present today (good), so refactor is mechanical.

2. **`<hr className="my-8 border-gray-200" />` in `src/app/(main)/admin/page.tsx:90`.**
   - Should be `<Separator className="my-8" />` (Separator is already installed). Composition rule: "Use `Separator` instead of `<hr>` or `<div className=\"border-t\">`."

### 🟡 Major — Styling rule violations in consumers

3. **`space-y-*` and `space-x-*` widespread.** The styling rule says use `flex flex-col gap-*`. Hits (non-exhaustive):
   - `sections/contact-section.tsx` L60, L135, L153
   - `sections/hero.tsx` L46
   - `sections/about.tsx` L37, L63
   - `sections/project-detail-view.tsx` L20, L79, L83
   - `sections/blog-post-view.tsx` L68, L73 (these are `<ul>` lists — acceptable since `gap-*` doesn't apply between list-items without flex)
   - `sections/case-studies.tsx` L33, L53, L76, L151
   - `layout/footer.tsx` L18
   - `booking/BookingForm.tsx` L368, L370, L432, L437; `PhotographyBookingForm.tsx` similar
   - Most should become `flex flex-col gap-*`. Lists (`<ul>`) are a defensible exception.

4. **Raw Tailwind colors instead of semantic tokens.** Violates "no raw values like `bg-blue-500`" and the project's own editorial-token rule. Hits:
   - `sections/faq.tsx` L34 `bg-gray-50`, L45 `text-gray-600`.
   - `sections/content-grid.tsx` — heavy: L130 `text-gray-900`, L133 `text-gray-600`, L146 `bg-white/20`, L154 `text-gray-300`, L160 `text-gray-400`, L180 `bg-gray-900`, L185 `text-gray-500`, L189 `text-gray-900`, L194 `bg-gray-100 text-gray-700`.
   - `booking/BookingForm.tsx` and `booking/PhotographyBookingForm.tsx` — many `text-gray-300/400/500/600`, `bg-gray-50/200`.
   - `booking/BookingForm.tsx` L433 `bg-green-50 border-green-200`, L434 `text-green-700` — should be `Alert` with appropriate variant.
   - `app/(main)/admin/login/page.tsx` L26 `text-gray-700`.
   - **Fix direction:** Either use semantic tokens (`bg-muted`, `text-muted-foreground`, `bg-card`, `border-border`) or the editorial CSS vars (`--color-ink-soft`, `--color-rule`). Don't mix raw `gray-*` with the cream palette — it visibly clashes.

5. **`w-N h-N` instead of `size-N`.** Hits in `sections/content-grid.tsx`: L146 `w-10 h-10`, L180 `w-8 h-8`. Use `size-10` / `size-8`.

6. **Status / banner styled `<div>` instead of `Alert`.** `BookingForm.tsx` L431–457 builds a custom "✓ Booking Confirmed" success card with `bg-green-50 border-green-200 text-green-700`. Same idea for the photo form's confirmation step. Should be `Alert` (not installed yet — `npx shadcn@latest add alert`). Composition rule: callouts use `Alert`, not styled divs.

7. **Custom date-cell grid in `BookingForm`/`PhotographyBookingForm` carries inline color logic.** Lines like `BookingForm.tsx:234-236` (`text-gray-400 bg-gray-50 cursor-not-allowed`) mix disabled state with raw colors. Use `data-disabled` + `disabled:*` variants on `Button` (or a `ToggleGroup` for slot selection — 5–10 visible slots per day fits the "2–7 choices" rule reasonably; for ranges of 20+ slots keep buttons but use `variant="outline"` + `aria-pressed`/`data-state=on`).

8. **`Button` composition in `not-found.tsx` overrides color tokens.**
   - L11: `<Button asChild className="mt-8 bg-[color:var(--color-ink)] hover:bg-[color:var(--color-accent)]">` — the styling rule says `className` is for **layout, not styling**; never override component colors. The editorial palette already maps `--primary: #201c1a` (ink) and you have an `accent` token, so the `default` variant already renders ink-on-cream. Drop the inline color overrides and just use `<Button asChild>`. Same anti-pattern in `project-card.tsx:74` and `booking/BookingForm.tsx` L352, L359, L417, L423, L462, L469, L483.
   - Cleanest fix: add a CVA `editorial` variant in `button.tsx`… but that violates the "don't modify primitive structure" carve-out. Alternative: since the default variant already uses `--primary` (ink), most of these overrides are redundant — verify visually and remove.

### 🟢 Minor

9. **`<AccordionItem key={i} value={item-${i}}>` in `faq.tsx`.** Index keys are fine here since the list is static, but a slugified `q` would be more stable.

10. **`sections/blog-post-view.tsx:58`** uses `bg-[#0a0a0a] text-gray-100` for `<pre>`. Hard-coded hex literal — push to a semantic token (`--code-bg` / `--code-fg`) or a `<CodeBlock>` wrapper. Outside the shadcn primitive layer, so lower priority, but it's the same family of issue.

11. **Custom dropdown in `navbar.tsx` L113–169 (the "Ventures" menu).** Reinvents a portion of `DropdownMenu` / `NavigationMenu` (manual `useState`, `useEffect` for outside-click + Escape, custom roving). `NavigationMenu` is already installed but unused. Either:
    - Replace the desktop dropdown with `NavigationMenu` + `NavigationMenuTrigger`/`NavigationMenuContent`, or
    - Install `DropdownMenu` (`npx shadcn@latest add dropdown-menu`) and use it — gets keyboard nav, focus trap, and ARIA for free.

12. **Photography "stepper" in `PhotographyBookingForm.tsx` L88–105** is hand-rolled with `bg-gray-200 text-gray-500` etc. There's no shadcn Stepper, so this is OK to keep, but at minimum swap raw `gray-*` for `muted` / `muted-foreground` to stay on-token.

13. **Icon sizing on icons inside `Button`.** `project-card.tsx:66` `<Github className="mr-1 size-4" />`, L77 `<ExternalLink className="mr-1 size-4" />`. The icons rule says: inside `Button`, no sizing classes — the button CSS already targets `[&_svg:not([class*='size-'])]:size-4`. Use `data-icon="inline-start"` and drop `size-4 mr-1`:
    ```tsx
    <Button asChild variant="outline" size="sm">
      <Link href={project.githubUrl} target="_blank" rel="noopener noreferrer">
        <Github data-icon="inline-start" /> Code
      </Link>
    </Button>
    ```
    Same in `navbar.tsx:206` (`<Menu className="size-5" />` inside an icon Button) — the `size="icon"` variant's `size-9` ⊨ button-internal sizing already; the explicit `size-5` is fine because the button is icon-only (no caption) and you actually want the icon larger than the default `size-4`. Keep it but consider documenting why.

14. **Version consistency.** `shadcn` CLI is `^3.8.5` and primitives use `radix-ui@1.4.3` (the new aggregated package — correct for the current shadcn "new-york" template). No drift. `lucide-react@0.574.0` matches the configured `iconLibrary: lucide`. ✅

15. **No `dark:` overrides in consumers** — good; `.dark` is wired in `globals.css` but nothing toggles it, so dark mode is effectively unreachable. If dark mode is **not** a goal for this site, consider stripping the `.dark` block to reduce dead CSS. If it **is**, add a theme toggle.

16. **`Badge` color overrides in `project-card.tsx`** L41–46, L52–58 override `bg`/`text`/`border` via className. Same anti-pattern as #8. The default and `secondary` variants already give you the look you want against cream — try `<Badge variant="secondary">` first and only add `className` if the visual genuinely doesn't fit.

---

## Action Items (prioritized)

- [ ] **P0 (a11y):** Replace `<hr>` in `admin/page.tsx:90` with `<Separator />`.
- [ ] **P0 (a11y):** Install + adopt `input`, `textarea`, `field`, `label`; refactor `BookingForm`, `PhotographyBookingForm`, `admin/login/page.tsx`, and `contact-section.tsx`'s form into `FieldGroup` + `Field`.
- [ ] **P1 (styling):** Install `alert` and replace the green success-confirmation `<div>` in both booking forms.
- [ ] **P1 (styling):** Sweep raw `bg-gray-*`/`text-gray-*`/`bg-green-*` → semantic tokens or editorial vars across `content-grid.tsx`, both `booking/*Form.tsx`, `faq.tsx`, `admin/login/page.tsx`. Hottest file: `sections/content-grid.tsx`.
- [ ] **P1 (styling):** Convert `w-10 h-10` / `w-8 h-8` → `size-10` / `size-8` in `content-grid.tsx`.
- [ ] **P2 (styling):** Migrate `space-y-*` / `space-x-*` → `flex flex-col gap-*` in `sections/*`, `booking/*`, `layout/footer.tsx`. Leave `<ul>` lists alone.
- [ ] **P2 (composition):** Drop redundant `bg-[color:var(--color-ink)] hover:bg-[color:var(--color-accent)]` from `<Button>` usages (they duplicate `default` variant) — `not-found.tsx`, `project-card.tsx`, both booking forms. Same for `<Badge>` overrides in `project-card.tsx`.
- [ ] **P2 (icons):** Switch icons inside Buttons to `data-icon="inline-start"` and drop `size-4`/`mr-1` — `project-card.tsx`.
- [ ] **P3 (composition):** Replace Navbar's hand-rolled "Ventures" dropdown with `DropdownMenu` (new install) or `NavigationMenu` (already installed).
- [ ] **P3 (token hygiene):** Hard-coded `#0a0a0a` / `text-gray-100` in `blog-post-view.tsx:58` `<pre>` → CSS variable.
- [ ] **P3 (dead CSS):** Decide on dark mode — either ship a toggle or strip `.dark` block from `globals.css`.

## Files Touched

Primitives (read-only per CLAUDE.md):
- `src/components/ui/{accordion,badge,button,card,navigation-menu,separator,sheet}.tsx`

Consumers (review targets):
- `src/components/project-card.tsx`
- `src/components/layout/navbar.tsx`, `src/components/layout/footer.tsx`
- `src/components/sections/{faq,content-grid,blog-post-view,contact-section,hero,about,case-studies,project-detail-view}.tsx`
- `src/components/booking/{BookingForm,PhotographyBookingForm}.tsx`
- `src/app/(main)/not-found.tsx`
- `src/app/(main)/admin/page.tsx`, `src/app/(main)/admin/login/page.tsx`

Config:
- `components.json`, `src/app/globals.css`
