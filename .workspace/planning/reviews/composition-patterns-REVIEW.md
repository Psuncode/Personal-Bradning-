# Composition Patterns Review

Lens: `.agents/skills/composition-patterns/SKILL.md` (Vercel composition rules).
Scope: `src/components/{editorial,booking,sections,mdx,layout}`, `src/app/layout.tsx`.
Mode: read-only assessment, no source edits.

---

## Headline

This is a small portfolio codebase. Almost every component is presentation-only
with prop inputs — no shared mutable state, no cross-component coordination, no
deep render trees that would normally pull a team into compound-component
territory. Against that backdrop, the codebase already follows the **dominant**
recommendation of the skill (composition over boolean props, children over
render props) at the editorial layer. The painful exceptions are concentrated
in **two large step-form components** (`BookingForm`, `PhotographyBookingForm`)
and **one mode-switching presentation component** (`ProjectCover`). React 19's
`use()` / no-`forwardRef` rules are trivially satisfied because there is no
context and no ref forwarding in user code (only inside shadcn primitives,
which the skill says not to modify).

What follows is a rule-by-rule audit.

---

## 1. `architecture-avoid-boolean-props` (CRITICAL)

### Verdict: Mostly compliant, with one notable variant-by-prop offender.

### Where it works

- The editorial family (`EditorialEntry`, `EditorialPageHeader`, `BlogCover`,
  `ProjectNavLinks`, `SeriesHeader`, `RelatedPosts`, `GrainOverlay`) takes
  **data props, not behavior booleans**. There is no `isFeatured`,
  `showKicker`, `compact`, `variant`, etc.
- Optional rendering is done by **nullable data props**, which is the
  composition-friendly equivalent of "omit the child":
  - `EditorialEntry`: `kicker?`, `cover?`, `transitionName?` — each renders iff
    present (lines 22–38 of `editorial-entry.tsx`).
  - `EditorialPageHeader`: same pattern with `kicker`, `sub`, `numeral`.
  - `PullQuote`: `attribution?` — appears only when supplied.
  - `SeriesHeader`: returns `null` when there is no series, so callers can
    drop it in unconditionally.
- The MDX shortcodes (`Figure`, `FullBleed`, `Gallery`, `TwoColumn`, `Aside`,
  `PullQuote`) take **typed data + children**, never behavior flags. `Gallery`
  uses a numeric `columns?: 2 | 3` discriminator — a finite literal union, not
  a boolean — which is the recommended pattern when an enumerable variant is
  genuinely needed.

### Where it fails — `ProjectCover` (`editorial/project-cover.tsx`)

This is the textbook anti-pattern the rule warns against. Three orthogonal
behaviors are bolted onto one component via flags derived inside the body:

1. `coverImage.layout: "overlay" | "beside"` (string union, OK in isolation).
2. `placeholder` boolean computed from `isPlaceholder(coverImage.src)`.
3. Whether to use a `<TypographyPlate>` or `<Image>`.

The result is **three early-return branches** (lines 103, 140, 160), each
duplicating header chrome, with the inner `TypographyPlate` then taking
*another* `variant: "overlay" | "beside"` to flip sizing. That's exactly the
"each boolean doubles possible states" failure mode.

Recommended (consistent with `patterns-explicit-variants`):

```tsx
export function ProjectCover(props) {
  const placeholder = isPlaceholder(props.project.coverImage.src);
  if (placeholder && props.project.coverImage.layout === "beside")
    return <ProjectCoverBesidePlate {...props} />;
  if (placeholder)
    return <ProjectCoverOverlayPlate {...props} />;
  if (props.project.coverImage.layout === "beside")
    return <ProjectCoverBesideImage {...props} />;
  return <ProjectCoverOverlayImage {...props} />;
}
```

Four named components, each visibly composing the same primitives
(`<header>`, `<TypographyPlate>`, `<Image>`, title block). The `variant` prop
on `TypographyPlate` would then dissolve into two explicit subcomponents that
choose their own sizing classes — no more `variant === "overlay" ? "p-8" : "p-6"`
ternaries. The current code reads as one ~190-line module doing four things;
the split would be ~4 ×40 lines each, with `TypographyPlate` as a stateless
helper that both plate variants compose.

Severity: **Medium**. Logic is correct, but every future change ("we want a
third layout for landscape video covers", "the kicker should hide on
placeholder beside") will multiply the branches.

### A second, milder offender — `ContentGrid` (`sections/content-grid.tsx`)

The `GridItem.type` field is a string union of **six** values
(`"ai-project-hero" | "ai-project" | "healthcare" | "linkedin" | "photography"
| "photography-cta"`), each routed to a different conditional JSX block inside
one giant `.map()` (lines 141–251). This *is* an explicit-variant story, but
the variants are encoded as data discriminators rather than as components.

Each branch is a self-contained ~25-line card. The Vercel rule favors:

```tsx
const CARD_VARIANTS = {
  "ai-project-hero": AIProjectHeroCard,
  "ai-project":      AIProjectCard,
  // ...
} as const;

<CardWrapper item={item}>
  {React.createElement(CARD_VARIANTS[item.type], { item })}
</CardWrapper>
```

Or, more idiomatic to the existing site, write the grid items as a
**heterogeneous array of JSX nodes** (since this is editorial content, not
runtime-dynamic data) and skip the discriminator entirely. The data file is
hand-maintained anyway — there's no benefit to keeping `type` as a string when
you could keep the JSX node directly.

Severity: **Low**. The branches are mutually exclusive and stable, but the
file is hard to scan because the visual schema is fused to the data schema.

### Non-offenders worth noting

- `BlogPostView` uses a clean `post.cover ? <p> : <h1>` ternary for the title
  region (line 110). This is one binary choice in a sea of static markup — not
  worth refactoring into a variant.
- `Navbar` has many local booleans (`open`, `businessOpen`, `businessMobileOpen`,
  `isVenturesActive`) but they are **state**, not API surface. The rule is
  about external props, not internal state machines.

---

## 2. `architecture-compound-components` (HIGH)

### Verdict: Not applied — and not really needed at current scale.

There is **no** `createContext` anywhere in `src/` (verified with grep). No
component currently exposes a Provider/Frame/Input/Submit-style namespace.

Two places where the rule *might* pay off:

### 2a. The booking forms (`booking/BookingForm.tsx`, `booking/PhotographyBookingForm.tsx`)

These are ~490 and ~745 lines respectively, with **almost identical**:

- per-month iCloud fetch effect (lines 106–137 / 209–240),
- `busyDates` `useMemo` (lines 85–102 / 189–206),
- `renderCalendar` inline function (lines 203–300 / 341–433) — a render-prop
  pattern in everything but signature,
- `handleDateSelect` body,
- step-flow state machine and step-shaped JSX,
- yellow-banner availability warning block,
- Back/Continue button pair styling.

This is the **most expensive composition gap in the codebase**. Today each
form is a 500-line god component that re-implements the same calendar
control, mounted state machine, and styling. A compound-component refactor
would look like:

```tsx
<BookingFlow.Provider initialData={initialData} onComplete={onBooking}>
  <BookingFlow.StepIndicator />            {/* lifted from Photography form */}
  <BookingFlow.Step value="date">
    <BookingFlow.CalendarHeader />
    <BookingFlow.CalendarGrid />           {/* the renderCalendar() body */}
    <BookingFlow.AvailabilityWarning />
  </BookingFlow.Step>
  <BookingFlow.Step value="time">
    <BookingFlow.SlotGrid />
    <BookingFlow.StepNav backTo="date" continueTo="details" />
  </BookingFlow.Step>
  <BookingFlow.Step value="details">
    <ClientDetailsFields />                {/* form-specific */}
    <BookingFlow.StepNav backTo="time">
      <ProceedToCheckoutButton />          {/* form-specific */}
    </BookingFlow.StepNav>
  </BookingFlow.Step>
</BookingFlow.Provider>
```

This matches the rule's `state-context-interface` exactly: a generic
`{ state, actions, meta }` interface (`state.currentStep`,
`state.selectedDate`, `state.selectedSlot`; `actions.selectDate`,
`actions.advance`, `actions.back`; `meta.monthEvents`,
`meta.calendarError`) implemented by two providers — `MeetingBookingProvider`
(calls `onBooking`, downloads ICS) and `PhotographyBookingProvider` (carries
`selectedPackage`, POSTs to `/api/checkout`). The shared UI pieces stop being
duplicated; the difference between meeting-booking and photography-booking
collapses to the bespoke step JSX (package picker, ICS download, payment
button).

Severity: **High** — this is the only place in the codebase where
compound-components would meaningfully reduce duplication, fix a real
maintenance hazard (drift between the two forms is already visible — the
photography form has field-level validation/aria, the meeting form has
`alert()`), and enable testing the calendar logic once instead of twice.

### 2b. Navbar dropdown

`Navbar`'s `Ventures` dropdown is essentially a Radix Menu by hand: ref-based
outside-click, `Escape` keydown, `aria-expanded`. The shadcn primitives already
imported in this file (`Sheet`, `SheetContent`, `SheetTrigger`) come from the
same family that has `DropdownMenu`. The rule doesn't require it, but
swapping in shadcn's `DropdownMenu` would give you a compound-component
namespace (`<DropdownMenu><DropdownMenuTrigger/><DropdownMenuContent/>…`)
*and* delete ~40 lines of manual focus/keyboard management. Severity: **Low**.

---

## 3. `state-decouple-implementation` / `state-context-interface` / `state-lift-state` (HIGH/MEDIUM)

### Verdict: N/A at current scale; would become relevant under the booking-flow refactor above.

Right now every stateful component owns its own `useState`. Nothing needs to
read state from outside its component subtree, and there are no siblings that
need shared state. The closest cases:

- `Navbar`'s desktop and mobile dropdowns each maintain `businessOpen`
  separately. That's the right call — they are different UI surfaces with
  different open/close lifecycles.
- The two booking forms each hold their own `selectedDate` / `monthEvents` /
  `currentMonth`. No external component needs to read these. So state is
  correctly co-located *today*.

The lifting opportunity is **purely internal to the would-be `BookingFlow`
compound**, as described above. If/when that refactor happens, the
`{ state, actions, meta }` interface should be the contract, with at least
two providers implementing it (matching the
`ForwardMessageProvider` / `ChannelProvider` example in the rule docs).

---

## 4. `patterns-explicit-variants` (MEDIUM)

### Verdict: Inconsistently applied.

- **Compliant**: `ProjectsGrid` consumes the data once and maps to `EditorialEntry`
  — no `<EditorialEntry variant="featured">`, no `mode` props.
  `EditorialPageHeader` is used directly with different data on different
  pages instead of a `kind="blog" | "project"` flag.
- **Non-compliant**: `ProjectCover` (covered in §1) and `ContentGrid` (also
  §1). Both encode variants as **data** (`layout`, `type`) rather than as
  named components.

A subtler near-miss: `BlogPostView` accepts an optional `allPosts?: BlogPost[]`
and renders `<SeriesHeader>` / `<RelatedPosts>` conditionally based on its
presence (lines 97, 167). This is fine for now — only one caller, the post
page. But if/when a "preview" caller appears that doesn't have the full post
list, the smart move per the rule is two explicit components
(`BlogPostFullView`, `BlogPostPreview`) composing a shared body, rather than
adding more `allPosts && …` gates.

---

## 5. `patterns-children-over-render-props` (MEDIUM)

### Verdict: Compliant in the editorial system; **violated in the booking forms**.

- Every editorial / MDX / layout component that needs nested content takes
  `children` (`TwoColumn`, `Aside`, `PullQuote`, `Container`, `CardWrapper`
  inside `ContentGrid`).
- The only render-prop in the codebase is `renderCalendar` inside both
  booking forms — and it's a **method on the component instance**, not a
  prop, so it's render-prop in shape, not in API. Still, it's a bad smell:
  it's a 100-line `() => JSX` that closes over a dozen pieces of state.
  Moving it into a `<BookingCalendar />` subcomponent (or, in the compound
  refactor, `BookingFlow.CalendarGrid`) would let it own its closure clearly,
  get its own test, and stop being inlined into a render method.

No `renderX` props exist on any component's public API. Good.

---

## 6. `react19-no-forwardref` (MEDIUM)

### Verdict: Compliant by absence.

`grep -rn "forwardRef" src/components` matches **only** the shadcn primitives
in `src/components/ui/` (which the project's own CLAUDE.md instructs not to
modify). No author-written component uses `forwardRef`. No author-written
component uses `useContext` (no contexts exist). When the booking-flow
context lands, it should use `use(BookingFlowContext)` per the rule.

The Next 16 + React 19 stack is current, so this is the right rule to apply.

---

## Polymorphic components / `as` prop

Not used anywhere. shadcn's primitives that this codebase consumes use
`asChild` (Radix `Slot`) internally, e.g. `<SheetTrigger asChild>` in
`Navbar`. That's the right tool when it appears. No author-written component
needs polymorphism today — the closest case is `CardWrapper` inside
`ContentGrid`, which switches between `<a target="_blank">`, `<Link>`, and
`<div>` via internal branching (lines 100–117). Two safe refactors:

1. Replace with three explicit components (`ExternalCardLink`,
   `InternalCardLink`, `StaticCard`) — matches `patterns-explicit-variants`.
2. Or use a `Slot`/`asChild` pattern from Radix, letting the caller pass the
   wrapper element.

Either is fine; the current code works but is a microcosm of the "one
component, three modes" smell.

---

## Separation of presentation from logic

There is **no `src/hooks/` directory** and almost no custom hooks. Implication:

- Calendar logic (`useMemo` for busy dates, `useEffect` for per-month fetch,
  date math) is **duplicated verbatim** between `BookingForm.tsx` and
  `PhotographyBookingForm.tsx`. A `useMonthAvailability(initialData)` hook
  returning `{ currentMonth, setCurrentMonth, monthEvents, busyDates,
  calendarError, isLoadingMonth }` would eliminate ~80 lines of duplication
  before any compound-component work. This is the cheapest, highest-value
  refactor in this review.
- The MDX shortcodes share a tiny `blurProps` helper pattern (resolve asset
  → if blurDataURL, attach `{ placeholder: "blur", blurDataURL }`). Three
  components (`Figure`, `FullBleed`, `Gallery`) do this inline. A
  `useBlogImage(slug, src)` hook returning
  `{ src, alt, blurProps }` would dedupe and is small enough to be worth
  doing.
- The CSS class soup is *not* a composition problem — it's a Tailwind/4
  inline-style choice — but the same gnarly Mountain-Time + Cal-color string
  appears in dozens of buttons. That belongs in CVA/`cva()` or a
  `Button.Ink` variant, not in a hooks refactor.

---

## Prop drilling

Negligible today. The deepest data flow is:

```
page → ProjectDetailView → ProjectCover/ProjectNavLinks
page → BlogPostView → BlogCover/SeriesHeader/RelatedPosts
page → ProjectsGrid → EditorialEntry
```

Two levels max, with no intermediate components passing the prop just to
forward it. The skill rule would only fire if/when a 3rd-level component
inside the booking form needed to read `selectedSlot` — which is exactly the
trigger for the compound-component refactor.

---

## Prioritized Recommendations

| # | Change | Impact | Effort | Rules invoked |
|---|--------|--------|--------|----------------|
| 1 | Extract `useMonthAvailability(initialData)` hook; consume from both booking forms. | High (dedupe ~80 lines, single source of truth for calendar) | Small | separation-of-concerns precursor to state-decouple |
| 2 | Refactor booking forms into `BookingFlow.*` compound components with shared Provider + per-flow Provider variants. | High (eliminates the only real god-components in the codebase, unblocks shared tests) | Medium-Large | architecture-compound-components, state-context-interface, patterns-children-over-render-props |
| 3 | Split `ProjectCover` into four explicit variant components. Keep `TypographyPlate` as a stateless presentation helper. | Medium (kills two boolean-derived branches and one inner `variant` prop) | Small | architecture-avoid-boolean-props, patterns-explicit-variants |
| 4 | Replace `ContentGrid`'s six-way `type` discriminator with a `type → Component` map (or store JSX nodes in the data array). | Low–Medium (readability; one file shrinks dramatically) | Small | patterns-explicit-variants |
| 5 | Extract `useBlogImage(slug, src)` to dedupe `Figure`/`FullBleed`/`Gallery` blur logic. | Low | Small | separation-of-concerns |
| 6 | (Optional) Replace `Navbar`'s hand-rolled Ventures dropdown with shadcn `DropdownMenu`. | Low (deletes outside-click + Escape handlers) | Small | architecture-compound-components (consume Radix) |

### Things explicitly **not** worth changing

- The editorial component family is well-shaped. Don't introduce contexts,
  `as` props, or compound namespaces here. `EditorialEntry` is consumed in
  exactly one place; adding ceremony would be over-engineering.
- The MDX shortcodes are intentionally narrow and don't need a Provider —
  `slug` is bound at MDX-component-build time via `buildMdxComponents(slug)`,
  which is a clean form of currying that the rule docs don't cover but
  satisfies the spirit (no prop drilling, no global state).
- shadcn primitives in `src/components/ui/` use `forwardRef` and `useContext`;
  the project policy is to leave them alone. Rule §6 doesn't apply to vendored
  copy-paste code.

---

## React 19 / Next 16 specifics

- The codebase is on the right stack to apply `use(Context)` once contexts
  appear. When implementing the booking-flow context, prefer
  `<BookingFlowContext value={…}>` (React 19 provider shorthand) and
  `use(BookingFlowContext)` over the legacy `<Context.Provider>` and
  `useContext()`.
- No `forwardRef` regression risk — author code already uses `ref` as a
  regular prop where needed (no occurrences found, so trivially compliant).

---

## Summary

Editorial / MDX / layout components: **healthy composition story**, conformant
with the skill's rules through avoidance (small data-prop components,
children-as-composition, no boolean flags, no contexts yet).

Two clear refactor targets: **`ProjectCover` should be four explicit variants
instead of three flag-driven branches**, and **the two booking forms should
collapse into a shared `BookingFlow` compound component with two providers**
— the latter is where the most real duplication and the most painful future
divergence currently live. Everything else is either compliant or
preemptively over-engineering would-be problems that don't exist at this
scale.
