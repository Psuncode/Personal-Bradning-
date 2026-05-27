---
phase: quick
plan: 260319-lxr
type: execute
wave: 1
depends_on: []
files_modified:
  - src/components/layout/Navbar.tsx
autonomous: true
requirements: []

must_haves:
  truths:
    - "Photography link is removed as a standalone nav item"
    - "A 'Business' dropdown appears in the desktop nav containing Photography and Ecommerce links"
    - "Mobile nav shows Business as an expandable section (or flat list) with Photography and Ecommerce links"
    - "Clicking Ecommerce navigates to /ecommerce (coming-soon page already exists)"
    - "Active-state highlighting works correctly for /photography and /ecommerce routes"
  artifacts:
    - path: "src/components/layout/Navbar.tsx"
      provides: "Updated navbar with Business dropdown"
  key_links:
    - from: "Business dropdown"
      to: "/photography, /ecommerce"
      via: "href links inside dropdown menu"
---

<objective>
Restructure the navbar by replacing the standalone Photography link with a "Business" dropdown that contains Photography and Ecommerce sub-links. Apply to both desktop (hover/click dropdown) and mobile (sheet nav) layouts.

Purpose: Groups the two business-facing routes under a single nav entry to reduce clutter and signal product intent.
Output: Updated Navbar.tsx with a Business dropdown; /ecommerce already exists as a coming-soon stub.
</objective>

<execution_context>
@/Users/philipsun/.claude/get-shit-done/workflows/execute-plan.md
@/Users/philipsun/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@src/components/layout/Navbar.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Business dropdown to Navbar (desktop + mobile)</name>
  <files>src/components/layout/Navbar.tsx</files>
  <action>
Rewrite Navbar.tsx to replace the standalone `/photography` link with a "Business" dropdown containing Photography (`/photography`) and Ecommerce (`/ecommerce`).

**Desktop dropdown:**
- Add a `useState` for `businessOpen` (boolean) to track open state.
- Render "Business" as a `<button>` (not a `<Link>`) with a `ChevronDown` icon from lucide-react.
- Position a dropdown `<div>` absolutely below it (e.g., `absolute top-full left-0 mt-1`) containing two `<Link>` items: Photography and Ecommerce.
- Show/hide dropdown on click of the button (toggle `businessOpen`). Also close on outside click — add a `useEffect` with a `mousedown` listener on `document` that closes the dropdown when clicking outside the dropdown container. Use a `useRef` on the container div for this.
- Apply active-state styling to the "Business" button when `pathname.startsWith("/photography") || pathname.startsWith("/ecommerce")` — use `text-black font-medium`, else `text-gray-600 hover:text-black`.
- Apply active-state styling to each sub-link when `pathname === link.href`.
- Dropdown panel: `bg-white border border-gray-200 rounded-md shadow-md py-1 min-w-[160px] z-50`. Each item: `block px-4 py-2 text-sm transition-colors` with same active/inactive class logic.

**Mobile sheet nav:**
- Replace the Photography link in `navLinks` (or handle separately) with an expandable "Business" section.
- Add a `useState` for `businessMobileOpen`. Render "Business" as a button with a `ChevronDown`/`ChevronUp` icon that toggles. When open, render two indented links (Photography, Ecommerce) with `pl-6` padding.
- Close the sheet (`setOpen(false)`) when a sub-link is clicked.
- Active state on the "Business" button: same `pathname.startsWith` logic.

**navLinks array:** Remove `{ href: "/photography", label: "Photography" }` from the shared `navLinks` constant — it no longer appears as a flat link.

**Imports to add:** `ChevronDown`, `ChevronUp` from `lucide-react`; `useRef`, `useEffect` from `react`.

Do NOT use any additional npm packages — build with existing shadcn/ui primitives and Tailwind CSS 4 classes only.
  </action>
  <verify>
    <automated>npm run build 2>&1 | tail -20</automated>
  </verify>
  <done>
    - `npm run build` exits 0 with no TypeScript errors.
    - Desktop nav shows Projects, Business (dropdown), Writing, Resume, Meet, Contact — no standalone Photography link.
    - Business dropdown opens on click and contains Photography and Ecommerce links.
    - Mobile sheet shows same structure with Business expandable section.
    - `/ecommerce` renders the existing coming-soon page.
  </done>
</task>

</tasks>

<verification>
npm run build must pass. Spot-check in browser: desktop dropdown opens/closes, both sub-links navigate correctly, mobile sheet Business section expands.
</verification>

<success_criteria>
Navbar has no standalone Photography link. Business dropdown present on desktop and mobile, containing Photography (/photography) and Ecommerce (/ecommerce). Build passes with no type errors.
</success_criteria>

<output>
After completion, create `.planning/quick/260319-lxr-restructure-the-navbar-remove-the-standa/260319-lxr-SUMMARY.md`
</output>
