# Personal Website — Portfolio Beautification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the main personal site into a slow, image-forward portfolio with a magazine-editorial visual system: full-bleed project covers, asymmetric layouts, drop caps, paper grain, view-transitions, and signature-style footer. Remove `/resume` and all sales chrome.

**Architecture:** Single feature branch off `main`. One PR at the end. Each task produces an atomic commit. New shared components live in `src/components/editorial/`. Editorial styling extends the existing token system in `src/app/globals.css`. No new design tokens, no animation libraries beyond Framer Motion (already installed), grain texture via a static SVG + CSS layer.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind 4 · Framer Motion 12 · Vitest + RTL · gray-matter (blog).

**Source spec:** `docs/superpowers/specs/2026-05-14-personal-website-functional-redesign-design.md` (commits `9c17fd8` + `3ebc09a`).

**Sequence:** repo cleanup → type + data → grain + global CSS → resume removal → shared components → inner-page lift → footer/nav/config → view-transitions wiring → QA pass.

---

## Task 1: Repo cleanup — commit staged deletions

**Files:**
- Delete (already staged): `.planning/**`, `.claude/CONTENT_TEMPLATE.md`, anything else currently shown in `git status` as `D `
- Inspect: `docs/AUDIT_REPORT.md`, `docs/AUDIT_QUICK_REFERENCE.md`, `docs/VITEST_SETUP_SUMMARY.md`, `docs/audits/`, `docs/operations/`

- [ ] **Step 1: Create the feature branch**

```bash
git checkout -b feat/portfolio-beautification
```

- [ ] **Step 2: Confirm staged deletions are all `.planning/` + the CONTENT_TEMPLATE**

```bash
git status --short | grep '^ D' | head -50
```

Expected: a long list of `.planning/...` paths and `.claude/CONTENT_TEMPLATE.md`. If anything else appears (a section file, a test file, etc.), STOP and surface to the user.

- [ ] **Step 3: Stage and commit the deletions**

```bash
git add -u .planning/ .claude/CONTENT_TEMPLATE.md
git commit -m "chore: remove abandoned planning scaffolding"
```

- [ ] **Step 4: Audit `docs/` for relevance**

Read each of: `docs/AUDIT_REPORT.md`, `docs/AUDIT_QUICK_REFERENCE.md`, `docs/VITEST_SETUP_SUMMARY.md`. Skim `docs/audits/` and `docs/operations/`.

For each: if the content is stale/no-longer-actionable, `git rm` it in a single commit. If it remains useful, leave it. Default to keeping; only remove if the reader is clearly stale.

```bash
# Example — only if something is genuinely stale:
git rm docs/VITEST_SETUP_SUMMARY.md
git commit -m "chore: drop stale vitest setup notes"
```

- [ ] **Step 5: Verify build is still green before continuing**

```bash
npm run build
```

Expected: build completes without errors. If it fails, the deletions broke something — investigate before moving on.

---

## Task 2: Extend `Project` type with `coverImage` and populate data

**Files:**
- Modify: `src/types/index.ts`
- Modify: `src/data/projects.ts`

- [ ] **Step 1: Add the `CoverImage` type to `src/types/index.ts`**

Add above the existing `Project` interface, then add the field to `Project`:

```ts
export interface CoverImage {
  src: string;
  alt: string;
  focalPoint?: "center" | "top" | "bottom";
  layout: "overlay" | "beside";
}

export interface Project {
  // ...existing fields...
  coverImage: CoverImage;
}
```

The field is required (not optional) — every project gets one.

- [ ] **Step 2: Populate `coverImage` on every project in `src/data/projects.ts`**

For each of the 5 projects (Inara, LDS, Nursa, Granger, Cocker), add a `coverImage`. Use existing SVG fallbacks from `/public/photography/*.svg` for now — the implementer can swap to real imagery later without changing the structure:

```ts
{
  id: "inara-health",
  // ...existing fields...
  coverImage: {
    src: "/photography/landscape-1.svg",
    alt: "Utah mountain sunset — cover image for Inara Health Diagnostic",
    focalPoint: "center",
    layout: "overlay",
  },
},
```

Choose per project (you decide layout per editorial fit — recommend `overlay` for most, `beside` for 1–2 to vary the rhythm). Use different `src` values across projects so the index page reads as a sequence.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: passes. If errors mention `coverImage`, every project must have the field.

- [ ] **Step 4: Commit**

```bash
git add src/types/index.ts src/data/projects.ts
git commit -m "feat(types): add CoverImage to Project and populate data"
```

---

## Task 3: Add grain SVG asset + global CSS for grain overlay

**Files:**
- Create: `public/grain.svg`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Create `public/grain.svg`**

A 200×200 SVG noise texture. Keep small (< 5 KB):

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <filter id="n">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/>
    <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.6 0"/>
  </filter>
  <rect width="100%" height="100%" filter="url(#n)"/>
</svg>
```

- [ ] **Step 2: Add grain CSS to `src/app/globals.css`**

Append (under the existing `@theme inline` block, before any media queries):

```css
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background-image: url("/grain.svg");
  background-repeat: repeat;
  background-size: 200px 200px;
  opacity: 0.04;
  mix-blend-mode: multiply;
}

@media (prefers-reduced-motion: reduce) {
  /* Grain is static; nothing to disable, but keep this comment as a marker
     for the view-transition reduced-motion fallback added later. */
}
```

- [ ] **Step 3: Verify the SVG loads in dev**

```bash
npm run dev
```

Visit `http://localhost:3000/grain.svg`. Expected: an SVG renders (looks like noise on black). Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add public/grain.svg src/app/globals.css
git commit -m "feat(style): add grain texture asset and overlay class"
```

---

## Task 4: `<GrainOverlay>` component + wire into `(main)` layout

**Files:**
- Create: `src/components/editorial/grain-overlay.tsx`
- Create: `src/components/editorial/grain-overlay.test.tsx`
- Modify: `src/app/(main)/layout.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
// src/components/editorial/grain-overlay.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GrainOverlay } from "./grain-overlay";

describe("GrainOverlay", () => {
  it("renders a fixed, aria-hidden, non-interactive overlay", () => {
    const { container } = render(<GrainOverlay />);
    const el = container.firstChild as HTMLElement;
    expect(el).toHaveClass("grain-overlay");
    expect(el.getAttribute("aria-hidden")).toBe("true");
    expect(el.getAttribute("role")).toBe("presentation");
  });
});
```

- [ ] **Step 2: Run test, confirm it fails**

```bash
npx vitest run src/components/editorial/grain-overlay.test.tsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Create the component**

```tsx
// src/components/editorial/grain-overlay.tsx
export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" role="presentation" />;
}
```

- [ ] **Step 4: Run test, confirm it passes**

```bash
npx vitest run src/components/editorial/grain-overlay.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Wire it into the `(main)` layout**

In `src/app/(main)/layout.tsx`, import and render `<GrainOverlay />` once inside the layout's JSX, just before `<Footer />` (so it sits above everything but doesn't intercept events — `pointer-events: none` is in the CSS):

```tsx
import { GrainOverlay } from "@/components/editorial/grain-overlay";
// ...
// somewhere inside the returned JSX, e.g. just before <Footer />:
<GrainOverlay />
```

- [ ] **Step 6: Visual check**

```bash
npm run dev
```

Visit `http://localhost:3000/`. Expected: the cream surfaces have a subtle grain. If it looks too strong, stop here — the CSS opacity is 0.04, which is the agreed bar. If you can't see it at all, double-check the asset path. Stop the dev server.

- [ ] **Step 7: Commit**

```bash
git add src/components/editorial/grain-overlay.tsx src/components/editorial/grain-overlay.test.tsx src/app/\(main\)/layout.tsx
git commit -m "feat(editorial): add GrainOverlay and wire into main layout"
```

---

## Task 5: Global CSS — drop cap, hung punctuation, oldstyle figures, refined scale

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Add typography utility classes**

Append to `src/app/globals.css`:

```css
/* Drop cap — applied to the first child paragraph of a prose container */
.editorial-prose > p:first-of-type::first-letter {
  font-family: var(--font-playfair), serif;
  float: left;
  font-size: 4.5em;
  line-height: 0.9;
  padding-right: 0.08em;
  padding-top: 0.06em;
  font-weight: 700;
  color: var(--color-ink);
}

/* Hung punctuation — applied to display headings */
.editorial-display {
  hanging-punctuation: first last;
}

/* Oldstyle figures — applied to body copy where supported */
.editorial-numerals {
  font-variant-numeric: oldstyle-nums;
}

/* Asymmetric layout helpers (used by EditorialEntry, project body) */
.editorial-asym-left { grid-column: 1 / span 8; }
.editorial-asym-right { grid-column: 5 / span 8; }
@media (max-width: 768px) {
  .editorial-asym-left,
  .editorial-asym-right { grid-column: 1 / -1; }
}

/* View-transition reduced-motion fallback */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation-duration: 0s !important;
  }
}
```

- [ ] **Step 2: Verify globals.css still parses**

```bash
npm run build
```

Expected: build succeeds. If Tailwind warns about unknown properties, that's fine for the new CSS — they're vanilla CSS, not Tailwind.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(style): drop caps, hung punctuation, oldstyle figures, asym helpers"
```

---

## Task 6: Remove `/resume` route and all references

**Files:**
- Delete: `src/app/(main)/resume/page.tsx`
- Delete: `src/components/sections/resume-view.tsx`
- Delete: `src/data/resume.ts`
- Delete: any test file referencing the above
- Modify: `src/components/layout/navbar.tsx` — remove the Resume nav link
- Modify: `src/app/(main)/layout.tsx` — remove `roles, education` import and any JSON-LD using them
- Modify: `src/components/layout/footer.tsx` — remove the "View Resume" button (footer rewrite happens in Task 13; just delete the button here)

- [ ] **Step 1: Find all references**

```bash
rg -l "resume" src/ docs/ --type ts --type tsx
```

Note everything that mentions resume. The deletions and the layout edit should cover all of them.

- [ ] **Step 2: Delete the files**

```bash
git rm src/app/\(main\)/resume/page.tsx
git rm src/components/sections/resume-view.tsx
git rm src/data/resume.ts
```

Also delete any test files referencing resume:

```bash
rg -l "resume" src/**/*.test.* 2>/dev/null
# git rm each one
```

- [ ] **Step 3: Edit `src/components/layout/navbar.tsx`**

Remove the `{ href: "/resume", label: "Resume" }` entry from the `navLinks` array.

- [ ] **Step 4: Edit `src/app/(main)/layout.tsx`**

Remove the `import { roles, education } from "@/data/resume";` line and any JSON-LD or metadata referencing roles/education. Leave the rest of the layout intact.

After the edit, sweep for stragglers:

```bash
rg "roles|education|@/data/resume" src/
```

Expected: no hits in `src/app/` or `src/components/`. Hits in unrelated source (e.g., a blog post `.mdx` mentioning "education") are fine.

- [ ] **Step 5: Edit `src/components/layout/footer.tsx`**

Remove the `<Link href="/resume">View Resume</Link>` element from the footer. Leave everything else for now (full footer rewrite comes later).

- [ ] **Step 6: Type-check and build**

```bash
npx tsc --noEmit && npm run build
```

Expected: passes. If anything still references `@/data/resume` or `/resume`, fix it.

- [ ] **Step 7: Run the test suite**

```bash
npm run test -- --run
```

Expected: passes. If a test fails because it was checking for resume-related content, delete that test or update it.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(ia): remove /resume route and all references"
```

---

## Task 7: `<EditorialPageHeader>` component (TDD)

**Files:**
- Create: `src/components/editorial/editorial-page-header.tsx`
- Create: `src/components/editorial/editorial-page-header.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/editorial/editorial-page-header.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditorialPageHeader } from "./editorial-page-header";

describe("EditorialPageHeader", () => {
  it("renders the title as an h1", () => {
    render(<EditorialPageHeader title="Selected Work" />);
    expect(screen.getByRole("heading", { level: 1, name: "Selected Work" })).toBeInTheDocument();
  });

  it("renders the kicker when provided", () => {
    render(<EditorialPageHeader title="Selected Work" kicker="Projects" />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("omits the kicker when not provided", () => {
    const { container } = render(<EditorialPageHeader title="Selected Work" />);
    expect(container.querySelector(".editorial-kicker")).toBeNull();
  });

  it("renders the sub-line when provided", () => {
    render(<EditorialPageHeader title="Selected Work" sub="A magazine of recent projects." />);
    expect(screen.getByText("A magazine of recent projects.")).toBeInTheDocument();
  });

  it("renders the numeral when provided", () => {
    render(<EditorialPageHeader title="Selected Work" numeral="01" />);
    expect(screen.getByText("01")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests, confirm failure**

```bash
npx vitest run src/components/editorial/editorial-page-header.test.tsx
```

Expected: FAIL (module not found).

- [ ] **Step 3: Create the component**

```tsx
// src/components/editorial/editorial-page-header.tsx
interface Props {
  title: string;
  kicker?: string;
  sub?: string;
  numeral?: string;
}

export function EditorialPageHeader({ title, kicker, sub, numeral }: Props) {
  return (
    <header className="editorial-shell pt-24 pb-10">
      {numeral && (
        <span className="block font-[family-name:var(--font-playfair)] text-5xl text-[color:var(--color-accent)] mb-6">
          {numeral}
        </span>
      )}
      {kicker && <p className="editorial-kicker mb-3">{kicker}</p>}
      <h1 className="editorial-display font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
        {title}
      </h1>
      {sub && (
        <p className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--color-ink-soft)]">
          {sub}
        </p>
      )}
      <div className="editorial-rule mt-10" />
    </header>
  );
}
```

- [ ] **Step 4: Run tests, confirm pass**

```bash
npx vitest run src/components/editorial/editorial-page-header.test.tsx
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/editorial/editorial-page-header.tsx src/components/editorial/editorial-page-header.test.tsx
git commit -m "feat(editorial): EditorialPageHeader component"
```

---

## Task 8: `<EditorialEntry>` component (TDD)

**Files:**
- Create: `src/components/editorial/editorial-entry.tsx`
- Create: `src/components/editorial/editorial-entry.test.tsx`

- [ ] **Step 1: Write the failing tests**

```tsx
// src/components/editorial/editorial-entry.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EditorialEntry } from "./editorial-entry";

describe("EditorialEntry", () => {
  it("renders title, description, and link", () => {
    render(
      <EditorialEntry
        index={0}
        title="Inara Health"
        description="A continuous progesterone monitor."
        href="/projects/inara-health"
      />,
    );
    expect(screen.getByRole("heading", { name: "Inara Health" })).toBeInTheDocument();
    expect(screen.getByText("A continuous progesterone monitor.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /inara health/i })).toHaveAttribute(
      "href",
      "/projects/inara-health",
    );
  });

  it("uses left orientation on even index, right on odd", () => {
    const { container: even } = render(
      <EditorialEntry index={0} title="A" description="x" href="/a" />,
    );
    expect(even.querySelector(".editorial-asym-left")).not.toBeNull();

    const { container: odd } = render(
      <EditorialEntry index={1} title="B" description="y" href="/b" />,
    );
    expect(odd.querySelector(".editorial-asym-right")).not.toBeNull();
  });

  it("renders cover image when provided", () => {
    render(
      <EditorialEntry
        index={0}
        title="A"
        description="x"
        href="/a"
        cover={{ src: "/photography/landscape-1.svg", alt: "cover" }}
      />,
    );
    expect(screen.getByAltText("cover")).toBeInTheDocument();
  });

  it("renders the kicker numeral when provided", () => {
    render(
      <EditorialEntry index={0} title="A" description="x" href="/a" kicker="01" />,
    );
    expect(screen.getByText("01")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, confirm fail**

```bash
npx vitest run src/components/editorial/editorial-entry.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create the component**

```tsx
// src/components/editorial/editorial-entry.tsx
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Props {
  index: number;
  title: string;
  description: string;
  href: string;
  kicker?: string;
  cover?: { src: string; alt: string };
}

export function EditorialEntry({ index, title, description, href, kicker, cover }: Props) {
  const orientation = index % 2 === 0 ? "editorial-asym-left" : "editorial-asym-right";

  return (
    <article className="grid grid-cols-12 gap-6 py-16 border-t border-[color:var(--color-rule)] first:border-t-0">
      <div className={cn(orientation)}>
        <Link href={href} className="group block">
          {kicker && (
            <span className="block font-[family-name:var(--font-playfair)] text-3xl text-[color:var(--color-accent)] mb-4">
              {kicker}
            </span>
          )}
          {cover && (
            <div className="relative aspect-[16/9] mb-6 overflow-hidden rounded-sm">
              <Image
                src={cover.src}
                alt={cover.alt}
                fill
                sizes="(max-width: 768px) 100vw, 66vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
              />
            </div>
          )}
          <h2 className="editorial-display font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-[color:var(--color-ink)] mb-3 group-hover:underline">
            {title}
          </h2>
          <p className="text-base leading-7 text-[color:var(--color-ink-soft)] max-w-xl">
            {description}
          </p>
        </Link>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Pass tests**

```bash
npx vitest run src/components/editorial/editorial-entry.test.tsx
```

Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/editorial/editorial-entry.tsx src/components/editorial/editorial-entry.test.tsx
git commit -m "feat(editorial): EditorialEntry component"
```

---

## Task 9: `<ProjectCover>` component (TDD)

**Files:**
- Create: `src/components/editorial/project-cover.tsx`
- Create: `src/components/editorial/project-cover.test.tsx`

- [ ] **Step 1: Failing tests**

```tsx
// src/components/editorial/project-cover.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectCover } from "./project-cover";
import type { Project } from "@/types";

const baseProject: Project = {
  id: "test",
  slug: "test",
  title: "Test Project",
  description: "d",
  techStack: [],
  coverImage: {
    src: "/photography/landscape-1.svg",
    alt: "test cover",
    layout: "overlay",
  },
};

describe("ProjectCover", () => {
  it("renders the cover image with correct alt", () => {
    render(<ProjectCover project={baseProject} />);
    expect(screen.getByAltText("test cover")).toBeInTheDocument();
  });

  it("renders the project title as an h1", () => {
    render(<ProjectCover project={baseProject} />);
    expect(screen.getByRole("heading", { level: 1, name: "Test Project" })).toBeInTheDocument();
  });

  it("applies view-transition-name on the image", () => {
    const { container } = render(<ProjectCover project={baseProject} />);
    const img = container.querySelector("img");
    // Next/Image renders an <img>; style attribute carries view-transition-name
    expect(img?.getAttribute("style") || "").toContain("view-transition-name");
  });

  it("uses overlay layout when project.coverImage.layout is overlay", () => {
    const { container } = render(<ProjectCover project={baseProject} />);
    expect(container.querySelector("[data-layout='overlay']")).not.toBeNull();
  });

  it("uses beside layout when project.coverImage.layout is beside", () => {
    const beside = {
      ...baseProject,
      coverImage: { ...baseProject.coverImage, layout: "beside" as const },
    };
    const { container } = render(<ProjectCover project={beside} />);
    expect(container.querySelector("[data-layout='beside']")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run, fail**

```bash
npx vitest run src/components/editorial/project-cover.test.tsx
```

Expected: FAIL.

- [ ] **Step 3: Create the component**

```tsx
// src/components/editorial/project-cover.tsx
import Image from "next/image";
import type { Project } from "@/types";

interface Props {
  project: Project;
  numeral?: string;
}

export function ProjectCover({ project, numeral }: Props) {
  const { coverImage, title } = project;
  const transitionName = `cover-${project.slug ?? project.id}`;
  const focal = coverImage.focalPoint ?? "center";

  if (coverImage.layout === "beside") {
    return (
      <header data-layout="beside" className="grid grid-cols-12 gap-6 pt-24">
        <div className="col-span-12 md:col-span-7 relative aspect-[4/3] overflow-hidden">
          <Image
            src={coverImage.src}
            alt={coverImage.alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 58vw"
            style={{ objectFit: "cover", objectPosition: focal, viewTransitionName: transitionName }}
          />
        </div>
        <div className="col-span-12 md:col-span-5 flex flex-col justify-end pb-6">
          {numeral && (
            <span className="font-[family-name:var(--font-playfair)] text-5xl text-[color:var(--color-accent)] mb-4">
              {numeral}
            </span>
          )}
          <h1 className="editorial-display font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            {title}
          </h1>
        </div>
      </header>
    );
  }

  return (
    <header data-layout="overlay" className="relative w-full aspect-[16/9] overflow-hidden">
      <Image
        src={coverImage.src}
        alt={coverImage.alt}
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: focal, viewTransitionName: transitionName }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute inset-0 flex items-end p-6 md:p-12">
        <div>
          {numeral && (
            <span className="block font-[family-name:var(--font-playfair)] text-4xl text-white/80 mb-2">
              {numeral}
            </span>
          )}
          <h1 className="editorial-display font-[family-name:var(--font-playfair)] text-4xl md:text-6xl text-white leading-tight max-w-3xl">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Pass tests**

```bash
npx vitest run src/components/editorial/project-cover.test.tsx
```

Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/editorial/project-cover.tsx src/components/editorial/project-cover.test.tsx
git commit -m "feat(editorial): ProjectCover component with overlay/beside layouts"
```

---

## Task 10: `<ProjectNavLinks>` component (TDD)

**Files:**
- Create: `src/components/editorial/project-nav-links.tsx`
- Create: `src/components/editorial/project-nav-links.test.tsx`

- [ ] **Step 1: Failing tests**

```tsx
// src/components/editorial/project-nav-links.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectNavLinks } from "./project-nav-links";
import type { Project } from "@/types";

const make = (id: string): Project => ({
  id,
  slug: id,
  title: id,
  description: "",
  techStack: [],
  coverImage: { src: "/photography/landscape-1.svg", alt: "x", layout: "overlay" },
});

const all = [make("a"), make("b"), make("c")];

describe("ProjectNavLinks", () => {
  it("renders prev and next when in the middle", () => {
    render(<ProjectNavLinks current={all[1]} all={all} />);
    expect(screen.getByRole("link", { name: /a/i })).toHaveAttribute("href", "/projects/a");
    expect(screen.getByRole("link", { name: /c/i })).toHaveAttribute("href", "/projects/c");
  });

  it("omits prev on the first project", () => {
    render(<ProjectNavLinks current={all[0]} all={all} />);
    expect(screen.queryByRole("link", { name: /previous/i })).toBeNull();
    expect(screen.getByRole("link", { name: /b/i })).toBeInTheDocument();
  });

  it("omits next on the last project", () => {
    render(<ProjectNavLinks current={all[2]} all={all} />);
    expect(screen.queryByRole("link", { name: /next/i })).toBeNull();
    expect(screen.getByRole("link", { name: /b/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Fail**

```bash
npx vitest run src/components/editorial/project-nav-links.test.tsx
```

- [ ] **Step 3: Create**

```tsx
// src/components/editorial/project-nav-links.tsx
import Link from "next/link";
import type { Project } from "@/types";

interface Props {
  current: Project;
  all: Project[];
}

export function ProjectNavLinks({ current, all }: Props) {
  const i = all.findIndex((p) => p.id === current.id);
  const prev = i > 0 ? all[i - 1] : null;
  const next = i >= 0 && i < all.length - 1 ? all[i + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav className="editorial-shell flex justify-between border-t border-[color:var(--color-rule)] py-12 text-sm">
      {prev ? (
        <Link
          href={`/projects/${prev.slug ?? prev.id}`}
          className="group flex flex-col gap-1 max-w-[45%]"
          aria-label={`Previous: ${prev.title}`}
        >
          <span className="editorial-kicker">← Previous</span>
          <span className="font-[family-name:var(--font-playfair)] text-xl text-[color:var(--color-ink)] group-hover:underline">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/projects/${next.slug ?? next.id}`}
          className="group flex flex-col gap-1 max-w-[45%] text-right ml-auto"
          aria-label={`Next: ${next.title}`}
        >
          <span className="editorial-kicker">Next →</span>
          <span className="font-[family-name:var(--font-playfair)] text-xl text-[color:var(--color-ink)] group-hover:underline">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
```

- [ ] **Step 4: Pass**

```bash
npx vitest run src/components/editorial/project-nav-links.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/editorial/project-nav-links.tsx src/components/editorial/project-nav-links.test.tsx
git commit -m "feat(editorial): ProjectNavLinks with prev/next, omits at edges"
```

---

## Task 11: `<RelatedPosts>` component (TDD)

**Files:**
- Create: `src/components/editorial/related-posts.tsx`
- Create: `src/components/editorial/related-posts.test.tsx`

- [ ] **Step 1: Inspect `BlogPost` shape**

```bash
cat src/types/blog.ts
```

Note the exact field names (`slug`, `frontmatter.title`, `frontmatter.tags`, `frontmatter.date` are most likely).

- [ ] **Step 2: Failing tests**

```tsx
// src/components/editorial/related-posts.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RelatedPosts } from "./related-posts";
import type { BlogPost } from "@/types/blog";

const make = (slug: string, tags: string[], date = "2026-01-01"): BlogPost => ({
  slug,
  readingTime: "2 min",
  frontmatter: { title: slug, date, excerpt: "", tags, published: true },
  content: "",
});

describe("RelatedPosts", () => {
  it("returns up to 2 posts sharing a tag, excluding the current", () => {
    const current = make("a", ["product"]);
    const all = [current, make("b", ["product"]), make("c", ["product"]), make("d", ["other"])];
    render(<RelatedPosts currentSlug="a" allPosts={all} />);
    expect(screen.getByRole("link", { name: /b/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /c/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /d/i })).toBeNull();
  });

  it("renders nothing when no posts share a tag", () => {
    const current = make("a", ["product"]);
    const all = [current, make("b", ["other"])];
    const { container } = render(<RelatedPosts currentSlug="a" allPosts={all} />);
    expect(container.firstChild).toBeNull();
  });
});
```

- [ ] **Step 3: Fail**

```bash
npx vitest run src/components/editorial/related-posts.test.tsx
```

- [ ] **Step 4: Create**

```tsx
// src/components/editorial/related-posts.tsx
import Link from "next/link";
import type { BlogPost } from "@/types/blog";

interface Props {
  currentSlug: string;
  allPosts: BlogPost[];
}

export function RelatedPosts({ currentSlug, allPosts }: Props) {
  const current = allPosts.find((p) => p.slug === currentSlug);
  if (!current) return null;
  const currentTags = new Set(current.frontmatter.tags);

  const related = allPosts
    .filter((p) => p.slug !== currentSlug)
    .filter((p) => p.frontmatter.tags.some((t) => currentTags.has(t)))
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1))
    .slice(0, 2);

  if (related.length === 0) return null;

  return (
    <section className="editorial-shell border-t border-[color:var(--color-rule)] py-12">
      <p className="editorial-kicker mb-6">Related</p>
      <div className="grid md:grid-cols-2 gap-6">
        {related.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group block"
          >
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)] group-hover:underline mb-2">
              {p.frontmatter.title}
            </h3>
            <p className="text-sm leading-6 text-[color:var(--color-ink-soft)] line-clamp-2">
              {p.frontmatter.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Pass**

```bash
npx vitest run src/components/editorial/related-posts.test.tsx
```

Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/editorial/related-posts.tsx src/components/editorial/related-posts.test.tsx
git commit -m "feat(editorial): RelatedPosts component with quiet related-only list"
```

---

## Task 12: Replace `projects-grid.tsx` with `<EditorialEntry>` sequence

**Files:**
- Modify: `src/components/sections/projects-grid.tsx`
- Modify: `src/components/sections/projects-grid.test.tsx`
- Modify (if needed): `src/app/(main)/projects/page.tsx`

- [ ] **Step 1: Rewrite `projects-grid.tsx`**

```tsx
// src/components/sections/projects-grid.tsx
import { EditorialEntry } from "@/components/editorial/editorial-entry";
import { EditorialPageHeader } from "@/components/editorial/editorial-page-header";
import { projects } from "@/data/projects";

export function ProjectsGrid() {
  return (
    <>
      <EditorialPageHeader
        kicker="Selected Work"
        title="Projects"
        sub="A magazine of recent work — healthcare hardware, enterprise PM, AI shipped, and analytics."
      />
      <div className="editorial-shell pb-24">
        {projects.map((p, i) => (
          <EditorialEntry
            key={p.id}
            index={i}
            kicker={String(i + 1).padStart(2, "0")}
            title={p.title}
            description={p.description}
            href={`/projects/${p.slug ?? p.id}`}
            cover={{ src: p.coverImage.src, alt: p.coverImage.alt }}
          />
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Update the existing test**

Open `src/components/sections/projects-grid.test.tsx` and adjust assertions: instead of expecting card grid structure, expect each project's title to be rendered as a heading and each `href` to be present. Drop assertions about old class names that no longer exist.

Example structure:

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProjectsGrid } from "./projects-grid";
import { projects } from "@/data/projects";

describe("ProjectsGrid", () => {
  it("renders all projects as editorial entries", () => {
    render(<ProjectsGrid />);
    projects.forEach((p) => {
      expect(screen.getByRole("heading", { name: p.title })).toBeInTheDocument();
    });
  });

  it("links each project to its slug", () => {
    render(<ProjectsGrid />);
    projects.forEach((p) => {
      const link = screen.getByRole("link", { name: new RegExp(p.title, "i") });
      expect(link).toHaveAttribute("href", `/projects/${p.slug ?? p.id}`);
    });
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/components/sections/projects-grid.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Visual check**

```bash
npm run dev
```

Visit `http://localhost:3000/projects`. Expected: header at top, projects rendered as alternating-orientation editorial entries with numerals (01, 02, 03, …). Stop the server.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/projects-grid.tsx src/components/sections/projects-grid.test.tsx
git commit -m "feat(projects): editorial entry sequence on /projects index"
```

---

## Task 13: Project detail page — `<ProjectCover>` + asymmetric body + `<ProjectNavLinks>`

**Files:**
- Modify: `src/components/sections/project-detail-view.tsx`
- Modify (if needed): `src/app/(main)/projects/[slug]/page.tsx` to pass `allProjects` to the view

- [ ] **Step 1: Read the current file**

```bash
cat src/components/sections/project-detail-view.tsx
```

Understand the current structure (heading, problem/solution/results/lessons sections).

- [ ] **Step 2: Rewrite using new editorial primitives**

Replace the existing top-of-page header with `<ProjectCover project={project} numeral={...} />`. Convert the body to a 12-column grid where narrative copy sits in `col-span-12 md:col-span-7` and pull quotes / metrics live in `col-span-12 md:col-span-5`. Lift "Lessons Learned" into a pull-quote treatment (large Playfair text inside the right column). Append `<ProjectNavLinks current={project} all={allProjects} />` at the bottom.

The detail view needs the index of the current project for the numeral. Compute it in the parent page:

```tsx
// src/app/(main)/projects/[slug]/page.tsx — inside the page render
const index = projects.findIndex((p) => (p.slug ?? p.id) === params.slug);
return <ProjectDetailView project={project} allProjects={projects} numeral={String(index + 1).padStart(2, "0")} />;
```

And update the `ProjectDetailView` signature to accept `allProjects: Project[]` and `numeral?: string`. Keep the data-flow simple.

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Visual check**

```bash
npm run dev
```

Visit `/projects/inara-health` (or any). Expected: full-bleed cover or beside-layout header (depending on data), asymmetric body grid, pull-quote moment on lessons, prev/next link pair at the bottom. Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/project-detail-view.tsx src/app/\(main\)/projects/\[slug\]/page.tsx
git commit -m "feat(projects): cover, asymmetric body, prev/next on project detail"
```

---

## Task 14: Blog index — `<EditorialEntry>` sequence + `<EditorialPageHeader>`

**Files:**
- Modify: `src/components/sections/blog-list.tsx`

- [ ] **Step 1: Rewrite**

Replace the current card grid with an `<EditorialPageHeader>` and a vertical `<EditorialEntry>` sequence. Map each post to an entry with kicker numeral. If the existing component shows tag chips, keep them in the header (between sub-line and rule) but restyle to editorial:

```tsx
// pseudocode for blog-list.tsx
return (
  <>
    <EditorialPageHeader kicker="Writing" title="Notes & Essays" sub="Field notes on product, systems, and building well." />
    <div className="editorial-shell pb-24">
      {posts.map((post, i) => (
        <EditorialEntry
          key={post.slug}
          index={i}
          kicker={String(i + 1).padStart(2, "0")}
          title={post.frontmatter.title}
          description={post.frontmatter.excerpt}
          href={`/blog/${post.slug}`}
        />
      ))}
    </div>
  </>
);
```

(No cover image for blog entries — keep it text-forward.)

- [ ] **Step 2: Run tests** (if a `blog-list.test.tsx` exists — if not, skip)

```bash
npx vitest run src/components/sections/blog-list.test.tsx
```

Expected: PASS or "no test file found." If a test breaks because of old structure assertions, update or remove the assertion.

- [ ] **Step 3: Visual check**

```bash
npm run dev
```

Visit `/blog`. Expected: editorial header, posts in alternating-orientation sequence with numerals. Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/blog-list.tsx
git commit -m "feat(blog): editorial entry sequence on /blog index"
```

---

## Task 15: Blog post — drop cap + `<RelatedPosts>` + editorial token pass

**Files:**
- Modify: `src/components/sections/blog-post-view.tsx`
- Modify (if needed): `src/app/(main)/blog/[slug]/page.tsx` to pass `allPosts`

- [ ] **Step 1: Add `editorial-prose` class to the body container**

Wrap the rendered MDX/markdown body in a container with `className="editorial-prose ..."`. The drop cap CSS from Task 5 will pick up the first paragraph's first letter.

- [ ] **Step 2: Audit existing classes for non-editorial tokens**

Open `blog-post-view.tsx` and replace any hardcoded color classes (e.g. `text-byu-navy`, `text-gray-700`) with editorial tokens (`text-[color:var(--color-ink)]`, `text-[color:var(--color-ink-soft)]`). Use Playfair for the title and `editorial-display` class.

- [ ] **Step 3: Append `<RelatedPosts>` before the existing footer**

In the page or view component, render `<RelatedPosts currentSlug={post.slug} allPosts={allPosts} />` after the prose body, before the Footer. Pass `allPosts` from the page-level component.

- [ ] **Step 4: Visual check**

```bash
npm run dev
```

Visit `/blog/hello-world` (or any). Expected: drop cap on first paragraph, editorial prose typography, related-posts panel at the end (only if matching tags exist). Stop server.

- [ ] **Step 5: Run tests**

```bash
npm run test -- --run
```

Expected: all green.

- [ ] **Step 6: Commit**

```bash
git add src/components/sections/blog-post-view.tsx src/app/\(main\)/blog/\[slug\]/page.tsx
git commit -m "feat(blog): drop cap, editorial prose, related posts"
```

---

## Task 16: Contact section — editorial tokens + `<EditorialPageHeader>`

**Files:**
- Modify: `src/components/sections/contact-section.tsx`

- [ ] **Step 1: Add `<EditorialPageHeader>` to the top**

Replace any existing inline header with `<EditorialPageHeader kicker="Contact" title="Send a Message" sub="..." />`.

- [ ] **Step 2: Restyle form inputs to editorial cream/ink palette**

Replace `border-gray-300`, `bg-white`, `text-byu-navy`, and similar classes with editorial token equivalents. Inputs should sit on the cream background with `border-[color:var(--color-rule)]` and focus state using `--color-accent`.

- [ ] **Step 3: Run tests**

```bash
npx vitest run src/components/sections/contact-section.test.tsx
```

Expected: PASS. If a test asserts a specific old class, update.

- [ ] **Step 4: Visual check**

```bash
npm run dev
```

Visit `/contact`. Expected: editorial header, cream-palette form. Stop server.

- [ ] **Step 5: Commit**

```bash
git add src/components/sections/contact-section.tsx src/components/sections/contact-section.test.tsx
git commit -m "feat(contact): editorial header and cream/ink form palette"
```

---

## Task 17: Footer rewrite — signature/colophon

**Files:**
- Modify: `src/components/layout/footer.tsx`

- [ ] **Step 1: Replace the entire footer body**

Keep `bg-[#0a0a0a]` background, drop all CTA copy ("Let's work together," paragraph about "Open to PM roles..."), drop the "Book a Call" and (already-removed) "View Resume" buttons. Replace with a signature/colophon layout:

```tsx
import Link from "next/link";
import { siteConfig } from "@/data/site-config";

export function Footer() {
  return (
    <footer id="contact" className="bg-[#0a0a0a] text-white py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto grid gap-12 md:grid-cols-3">
        <div>
          <p className="font-[family-name:var(--font-playfair)] text-3xl mb-2">Philip Sun</p>
          <p className="text-sm text-gray-400">Portfolio · {new Date().getFullYear()}</p>
        </div>
        <div className="text-sm space-y-2">
          <a href={siteConfig.links.email} className="block hover:text-gray-300">
            {siteConfig.email}
          </a>
          <div className="flex gap-4 text-gray-400">
            <a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-white">LinkedIn</a>
            <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="hover:text-white">GitHub</a>
          </div>
        </div>
        <div className="text-xs text-gray-500 leading-6">
          Built with Next.js and Tailwind. Photography by Philip. Set in Playfair Display and Inter.
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Visual check**

```bash
npm run dev
```

Visit any page and scroll to the footer. Expected: name on the left, contact in the middle, colophon on the right; no sales copy. Stop server.

- [ ] **Step 3: Run tests**

```bash
npm run test -- --run
```

Update any footer-related test that asserted the old "Let's work together" copy.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/footer.tsx
git commit -m "feat(footer): signature/colophon style; remove sales copy"
```

---

## Task 18: Update `siteConfig` title and description

**Files:**
- Modify: `src/data/site-config.ts`

- [ ] **Step 1: Set exact values**

```ts
export const siteConfig = {
  name: "Philip Sun",
  title: "Philip Sun — Selected Work",
  description:
    "Portfolio of Philip Sun — product, hardware, AI, and analytics work, alongside writing and photography.",
  url: "https://philipsun.com",
  ogImage: "/og-image.png",
  email: "ps324@byu.edu",
  links: {
    github: "https://github.com/Psuncode",
    linkedin: "https://www.linkedin.com/in/-philipsun/",
    email: "mailto:ps324@byu.edu",
  },
};
```

- [ ] **Step 2: Run tests**

```bash
npm run test -- --run
```

Some page tests may assert against the old title — update them to expect the new exact strings.

- [ ] **Step 3: Build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add src/data/site-config.ts
git commit -m "feat(config): siteConfig.title 'Philip Sun — Selected Work'"
```

---

## Task 19: Photography cross-pollination — insert 2–4 photos into the main site

**Files:**
- Modify: `src/app/(main)/page.tsx` OR one of the homepage section files (choose the cleanest insertion)
- Possibly modify: `src/components/sections/projects-grid.tsx` (optional — a single photo break between groups of projects)

- [ ] **Step 1: Pick 3 photos from `galleryPhotos`**

Choose from `src/data/photography.ts`. Recommended: 3 landscape-category photos (so personal portraits don't bleed into business context). Note their `src` and `alt`.

- [ ] **Step 2: Verify the current homepage section order**

```bash
cat "src/app/(main)/page.tsx"
```

Note the actual order of `<Hero />`, `<CaseStudies />`, `<About />`, `<CurrentFocus />`, the writing section, and `<ContentGrid />`. The plan assumes Hero → CaseStudies → About → CurrentFocus → Latest Writing → ContentGrid based on prior reads, but if it's different, choose section boundaries in the actual order.

- [ ] **Step 3: Insert photo breaks**

On the homepage (`src/app/(main)/page.tsx`), insert 2 photo breaks between major sections at natural seams (in the order observed in Step 2). On `/projects`, insert 1 photo break midway through the projects list.

Pattern for a photo break (inline, not a new component — keep it simple):

```tsx
<section className="px-6 py-12 md:px-12">
  <div className="editorial-shell">
    <div className="relative w-full aspect-[21/9] overflow-hidden">
      <Image
        src="/photography/landscape-1.svg"
        alt="..."
        fill
        sizes="100vw"
        className="object-cover"
      />
    </div>
  </div>
</section>
```

- [ ] **Step 3: Visual check**

```bash
npm run dev
```

Visit `/` and `/projects`. Expected: 3 photo breaks total, no jarring scale changes, photos feel like editorial section transitions. Stop server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(home): photography cross-pollination on main site"
```

---

## Task 20: View-transitions — wire up morph between project index and detail

**Files:**
- Modify: `src/components/editorial/editorial-entry.tsx` (add `viewTransitionName` to cover image when used on `/projects`)
- Verify: `src/components/editorial/project-cover.tsx` (already sets `viewTransitionName` in Task 9)

- [ ] **Step 1: Pass an optional `transitionName` prop to EditorialEntry**

Update the component signature to accept `transitionName?: string`, and apply it to the cover image:

```tsx
// in editorial-entry.tsx, inside the cover Image:
<Image
  src={cover.src}
  alt={cover.alt}
  fill
  sizes="(max-width: 768px) 100vw, 66vw"
  style={transitionName ? { viewTransitionName: transitionName } : undefined}
  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
/>
```

- [ ] **Step 2: Pass matching names from `projects-grid.tsx`**

```tsx
<EditorialEntry
  // ...
  transitionName={`cover-${p.slug ?? p.id}`}
  cover={{ src: p.coverImage.src, alt: p.coverImage.alt }}
/>
```

The detail page's `<ProjectCover>` already sets `viewTransitionName: cover-<slug>` from Task 9. Names matching across the two pages enables the browser's morph.

- [ ] **Step 3: Update tests**

In `editorial-entry.test.tsx`, add one test that passes `transitionName` and asserts the inline style includes `view-transition-name`.

```tsx
it("applies the viewTransitionName when transitionName is provided", () => {
  const { container } = render(
    <EditorialEntry
      index={0}
      title="A"
      description="x"
      href="/a"
      cover={{ src: "/photography/landscape-1.svg", alt: "cover" }}
      transitionName="cover-a"
    />,
  );
  const img = container.querySelector("img");
  expect(img?.getAttribute("style") || "").toContain("view-transition-name");
});
```

- [ ] **Step 4: Run tests**

```bash
npx vitest run src/components/editorial/editorial-entry.test.tsx
```

Expected: PASS.

- [ ] **Step 5: Manual transition check (Chrome/Safari)**

```bash
npm run dev
```

Visit `/projects`, click into a project, then use the browser back button. In supported browsers, the cover image should morph between surfaces (subtle — view it once or twice). In Firefox or with `prefers-reduced-motion: reduce`, navigation should be instant — verify there is no jank or empty frame. Stop server.

- [ ] **Step 6: Commit**

```bash
git add src/components/editorial/editorial-entry.tsx src/components/editorial/editorial-entry.test.tsx src/components/sections/projects-grid.tsx
git commit -m "feat(editorial): view-transition morph between project index and detail"
```

---

## Task 21: Copy audit — homepage + footer-adjacent sections

**Files:**
- Read every section file under `src/components/sections/` and the homepage `src/app/(main)/page.tsx`
- Modify any string that reads weak, template-y, or sales-y

- [ ] **Step 1: Open `src/app/(main)/page.tsx` and each section file referenced from the homepage**

Files: `hero.tsx`, `case-studies.tsx`, `about.tsx`, `current-focus.tsx`, `content-grid.tsx`, plus any inline strings in `page.tsx` (e.g., "Latest Writing").

- [ ] **Step 2: Flag and rewrite weak strings**

Specifically check for: any remaining "let's work together" / "open to roles" / "book a call" outside of `/meet`. Tighten sales-y kickers. Refine sub-lines if they read template-y.

- [ ] **Step 3: Run tests**

```bash
npm run test -- --run
```

Some tests assert specific copy. Update them to match new copy.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "polish: copy audit on homepage and main sections"
```

---

## Task 22: Accessibility + performance sweep

**Files:**
- Modify any file where the sweep finds an issue
- This task is verification-heavy; commits depend on what's found

- [ ] **Step 1: Build and start a production preview**

```bash
npm run build && npm start
```

(In a separate terminal.) Open `http://localhost:3000`.

- [ ] **Step 2: Run Lighthouse mobile a11y on each main-route page**

For each of `/`, `/projects`, `/projects/inara-health` (or any slug), `/blog`, `/blog/hello-world` (or any slug), `/meet`, `/contact`:

Run Lighthouse in Chrome DevTools, mobile, Accessibility category. Target ≥ 95. Record numbers.

- [ ] **Step 3: Fix any a11y issues found**

Common: missing `alt`, low contrast, focus order, focus-visible rings, target size. Fix in place. Commit per category.

- [ ] **Step 4: Run Lighthouse mobile Performance on `/`, `/projects`, `/blog`**

Target ≥ 90. If the grain overlay or any image is the bottleneck, investigate — grain opacity is the most likely lever.

- [ ] **Step 5: Manual viewport check**

For each of the 7 main-route pages at 375 / 768 / 1024 / 1440 px in DevTools responsive mode: capture a screenshot, store under `docs/superpowers/screenshots/2026-05-14/<page>-<viewport>.png` for the PR.

```bash
mkdir -p docs/superpowers/screenshots/2026-05-14
# save screenshots manually from the browser
```

- [ ] **Step 6: Verify reduced-motion fallback**

In DevTools → Rendering → Emulate CSS prefers-reduced-motion: reduce. Click between `/projects` and a project detail. Expected: instant nav, no animation.

- [ ] **Step 7: Stop the production server, commit any fixes plus the screenshots**

```bash
git add -A
git commit -m "polish: a11y + perf sweep; screenshots captured"
```

---

## Task 23: Final QA + PR

**Files:**
- None to modify; this is the merge-bar gate.

- [ ] **Step 1: Full check**

```bash
npm run lint
npx tsc --noEmit
npm run test -- --run
npm run build
```

All four must be clean. If anything fails, fix and recommit before opening the PR.

- [ ] **Step 2: Push the branch**

```bash
git push -u origin feat/portfolio-beautification
```

- [ ] **Step 3: Open PR**

```bash
gh pr create --title "Portfolio beautification — IA + visual redesign" --body "$(cat <<'EOF'
## Summary
- Reshape the main site into an image-forward portfolio (no sales chrome).
- Remove /resume route and references; reduce nav to 5 items.
- New components: EditorialPageHeader, EditorialEntry, ProjectCover, ProjectNavLinks, RelatedPosts, GrainOverlay.
- Beautification: drop caps, hung punctuation, oldstyle figures, grain texture, editorial numerals, asymmetric layouts, view-transitions API.
- Signature-style footer.
- siteConfig.title → "Philip Sun — Selected Work".

## Spec
docs/superpowers/specs/2026-05-14-personal-website-functional-redesign-design.md

## Test plan
- [ ] npm run lint — clean
- [ ] tsc --noEmit — clean
- [ ] npm run test -- --run — clean
- [ ] npm run build — clean
- [ ] Lighthouse mobile a11y ≥ 95 on /, /projects, /projects/[slug], /blog, /blog/[slug], /meet, /contact (numbers below)
- [ ] Lighthouse mobile perf ≥ 90 on /, /projects, /blog (numbers below)
- [ ] Reduced-motion fallback: view-transitions disabled

## Lighthouse numbers
(paste from Task 22)

## Screenshots
docs/superpowers/screenshots/2026-05-14/

🤖 Generated with [claude-flow](https://github.com/ruvnet/claude-flow)
EOF
)"
```

- [ ] **Step 4: Verify Definition of Done**

Walk the §Definition of Done in the spec line-by-line against the PR. Every item must be checkable.

- [ ] **Step 5: Hand off to the user for review and merge**

Done.

---

## Skills

- `superpowers:subagent-driven-development` — preferred for task-by-task subagent execution.
- `superpowers:executing-plans` — inline batch execution with checkpoints.
- `superpowers:test-driven-development` — referenced throughout; every new component follows the failing-test-first pattern.
- `superpowers:verification-before-completion` — required before reporting "done"; runs the build/lint/test gate.
