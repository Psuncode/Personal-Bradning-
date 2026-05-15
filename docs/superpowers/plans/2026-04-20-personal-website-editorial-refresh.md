# Personal Website Editorial Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refresh the homepage and shared visual language so the site reads as an editorial, executive-first personal brand while preserving the current information architecture.

**Architecture:** Keep the existing homepage section structure and page routes, but introduce a new editorial design system through global tokens, shared utility classes, and targeted rewrites of the homepage sections and navbar. Use TDD for copy-sensitive and structure-sensitive components so the new design is verified without relying on visual inspection alone.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Framer Motion, Vitest, Testing Library

---

## File Map

### Existing files to modify

- `src/app/globals.css`
  Responsibility: global tokens, typography, surface language, reusable editorial utility classes.
- `src/components/layout/navbar.tsx`
  Responsibility: make the professional identity primary and reduce the visual emphasis of secondary business navigation.
- `src/components/sections/hero.tsx`
  Responsibility: replace the startup-style hero with an editorial thesis-led intro.
- `src/components/sections/current-focus.tsx`
  Responsibility: restyle current focus into lighter editorial "desk notes."
- `src/components/sections/about.tsx`
  Responsibility: reframe the about section as a concise editorial profile and reduce generic feature-section styling.
- `src/components/sections/case-studies.tsx`
  Responsibility: give the proof section the strongest visual authority without changing project data structure.
- `src/app/(main)/page.tsx`
  Responsibility: align the writing section with the editorial system and keep homepage pacing consistent.
- `src/app/__tests__/home.test.tsx`
  Responsibility: verify revised homepage messaging and section presence.
- `src/components/sections/hero.test.tsx`
  Responsibility: verify the new hero copy, CTA structure, and removal of old dark-hero assumptions.

### Optional existing file to modify if needed during implementation

- `src/components/layout/container.tsx`
  Responsibility: only touch this if current width and padding constraints block the new layout rhythm.

### New files to create

- `src/components/sections/current-focus.test.tsx`
  Responsibility: verify the "desk notes" framing and CTA wording for current focus.
- `src/components/sections/about.test.tsx`
  Responsibility: verify the revised editorial about heading and recruiting CTA.
- `src/components/sections/case-studies.test.tsx`
  Responsibility: verify the featured work heading and case study CTA framing.

---

### Task 1: Establish Editorial Tokens in `globals.css`

**Files:**
- Modify: `src/app/globals.css`
- Test: none for this task; verification happens through later component tests and final build/lint/test runs

- [ ] **Step 1: Review the current global token block before editing**

Run:

```bash
sed -n '1,240p' src/app/globals.css
```

Expected: current `:root`, `.dark`, and `@layer base` definitions with BYU palette variables and `--font-sans: var(--font-inter)`.

- [ ] **Step 2: Replace the current generic palette and font aliases with editorial tokens**

Apply this patch:

```diff
--- a/src/app/globals.css
+++ b/src/app/globals.css
@@
 @theme inline {
-  /* BYU Color Palette */
-  --color-byu-navy: #002E5D;
-  --color-byu-blue: #003DA5;
-  --color-byu-light-blue: #6BB1E0;
-  --color-byu-sky: #C5E3F6;
-  --color-byu-white: #FFFFFF;
-  --color-byu-gray: #F5F5F5;
-  --color-byu-dark-gray: #4A4A4A;
+  --color-paper: #f4efe6;
+  --color-paper-elevated: #fbf7f1;
+  --color-ink: #201c1a;
+  --color-ink-soft: #5f5851;
+  --color-rule: #d9cfc1;
+  --color-accent: #5f2f2a;
+  --color-accent-foreground: #f9f4ee;
@@
-  --font-sans: var(--font-inter);
+  --font-sans: var(--font-geist-sans);
   --font-mono: var(--font-geist-mono);
   --font-display: var(--font-playfair);
@@
 :root {
   --radius: 0.625rem;
-  --background: oklch(1 0 0);
-  --foreground: oklch(0.145 0 0);
-  --card: oklch(1 0 0);
-  --card-foreground: oklch(0.145 0 0);
+  --background: #f4efe6;
+  --foreground: #201c1a;
+  --card: #fbf7f1;
+  --card-foreground: #201c1a;
@@
-  --primary: oklch(0.227 0.064 254.6);
-  --primary-foreground: oklch(1 0 0);
-  --secondary: oklch(0.97 0 0);
-  --secondary-foreground: oklch(0.205 0 0);
-  --muted: oklch(0.97 0 0);
-  --muted-foreground: oklch(0.556 0 0);
-  --accent: oklch(0.97 0 0);
-  --accent-foreground: oklch(0.205 0 0);
+  --primary: #201c1a;
+  --primary-foreground: #f9f4ee;
+  --secondary: #efe7dc;
+  --secondary-foreground: #2d2723;
+  --muted: #ece4d9;
+  --muted-foreground: #5f5851;
+  --accent: #5f2f2a;
+  --accent-foreground: #f9f4ee;
@@
-  --border: oklch(0.922 0 0);
-  --input: oklch(0.922 0 0);
-  --ring: oklch(0.708 0 0);
+  --border: #d9cfc1;
+  --input: #d9cfc1;
+  --ring: #5f2f2a;
 }
```

Expected result: root tokens now describe a warm-paper editorial palette and the default sans alias no longer uses `Inter`.

- [ ] **Step 3: Add editorial base styles and utility classes used by the refreshed homepage**

Append this block inside `src/app/globals.css` after the existing `@layer base` section:

```css
@layer base {
  body {
    background:
      radial-gradient(circle at top, rgba(95, 47, 42, 0.08), transparent 28%),
      linear-gradient(to bottom, #fbf7f1 0%, #f4efe6 40%, #f3ede4 100%);
    color: var(--foreground);
  }

  ::selection {
    background: rgba(95, 47, 42, 0.18);
    color: var(--foreground);
  }
}

@layer components {
  .editorial-shell {
    @apply mx-auto w-full max-w-6xl px-6 md:px-12;
  }

  .editorial-kicker {
    color: var(--color-accent);
    @apply text-[11px] font-semibold uppercase tracking-[0.28em];
  }

  .editorial-title {
    font-family: var(--font-display);
    @apply text-4xl leading-tight text-[color:var(--color-ink)] md:text-6xl;
  }

  .editorial-copy {
    color: var(--color-ink-soft);
    @apply text-base leading-8 md:text-lg;
  }

  .editorial-rule {
    border-color: var(--color-rule);
    @apply border-t;
  }

  .editorial-card {
    background: rgba(251, 247, 241, 0.82);
    border: 1px solid var(--color-rule);
    box-shadow: 0 18px 50px rgba(32, 28, 26, 0.06);
    @apply backdrop-blur-sm;
  }
}
```

Expected result: there are reusable classes for shell, kicker, title, copy, rule, and card treatments.

- [ ] **Step 4: Run lint to catch CSS or import regressions early**

Run:

```bash
npm run lint -- src/app/globals.css
```

Expected: command exits successfully or reports no blocking errors for `src/app/globals.css`.

- [ ] **Step 5: Commit the token foundation**

Run:

```bash
git add src/app/globals.css
git commit -m "feat: add editorial homepage design tokens"
```

Expected: one commit containing only the global token and utility-class changes.

---

### Task 2: Rewrite the Hero into an Editorial Thesis Section

**Files:**
- Modify: `src/components/sections/hero.tsx`
- Modify: `src/components/sections/hero.test.tsx`
- Test: `src/components/sections/hero.test.tsx`

- [ ] **Step 1: Replace hero tests so they describe the new editorial behavior before changing the component**

Replace `src/components/sections/hero.test.tsx` with:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

vi.mock("framer-motion", () => ({
  motion: {
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => false,
}));

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe("Hero Component", () => {
  it("renders the editorial kicker", () => {
    render(<Hero />);
    expect(screen.getByText("Philip Sun")).toBeDefined();
  });

  it("renders the new thesis-led headline", () => {
    render(<Hero />);
    expect(
      screen.getByText(/I build product strategy, operating leverage, and trust/i),
    ).toBeDefined();
  });

  it("renders supporting positioning copy", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Product manager, founder, and selective builder across healthcare, systems, and craft/i),
    ).toBeDefined();
  });

  it("renders the primary and secondary CTAs", () => {
    render(<Hero />);
    expect(screen.getByText(/Book a Call/i)).toBeDefined();
    expect(screen.getByText(/View Resume/i)).toBeDefined();
  });

  it("links Book a Call to /meet", () => {
    render(<Hero />);
    expect(screen.getByText(/Book a Call/i).closest("a")?.getAttribute("href")).toBe("/meet");
  });

  it("links View Resume to /resume", () => {
    render(<Hero />);
    expect(screen.getByText(/View Resume/i).closest("a")?.getAttribute("href")).toBe("/resume");
  });

  it("does not use the old dark hero treatment", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector("section")?.className).not.toContain("bg-[#0a0a0a]");
  });
});
```

- [ ] **Step 2: Run the hero test to verify the new expectations fail**

Run:

```bash
npm test -- src/components/sections/hero.test.tsx --runInBand
```

Expected: FAIL because the current hero still renders "Creative Thinker. Modern Builder." and the old dark-section classes.

- [ ] **Step 3: Replace the hero implementation with the editorial layout**

Replace `src/components/sections/hero.tsx` with:

```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-28 md:px-12 md:pb-28 md:pt-36">
      <div className="editorial-shell relative">
        <div className="editorial-rule mb-8 pt-6">
          <p className="editorial-kicker">Philip Sun</p>
        </div>

        <div className="grid gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="font-[family-name:var(--font-playfair)] text-5xl leading-[1.04] tracking-[-0.03em] text-[color:var(--color-ink)] md:text-7xl"
            >
              I build product strategy, operating leverage, and trust.
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.18 }}
              className="mt-6 max-w-2xl text-lg leading-8 text-[color:var(--color-ink-soft)] md:text-xl"
            >
              Product manager, founder, and selective builder across healthcare,
              systems, and craft. I care about clear decisions, thoughtful
              execution, and work that holds up under scrutiny.
            </motion.p>
          </div>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
            className="editorial-card md:col-span-4 rounded-[1.75rem] p-6"
          >
            <p className="editorial-kicker mb-4">Current Positioning</p>
            <div className="space-y-3 text-sm leading-7 text-[color:var(--color-ink-soft)]">
              <p>16M+ users influenced across enterprise and healthcare systems.</p>
              <p>3+ years in product across startup and scaled environments.</p>
              <p>Open to full-time PM roles starting April 2026.</p>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.34 }}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link
            href="/meet"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-ink)] px-6 py-3 text-sm font-medium text-[color:var(--color-paper-elevated)] transition-colors hover:bg-[color:var(--color-accent)]"
          >
            Book a Call
          </Link>
          <Link
            href="/resume"
            className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-rule)] bg-[rgba(251,247,241,0.6)] px-6 py-3 text-sm font-medium text-[color:var(--color-ink)] transition-colors hover:border-[color:var(--color-ink)]"
          >
            View Resume
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the hero test again**

Run:

```bash
npm test -- src/components/sections/hero.test.tsx --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit the hero rewrite**

Run:

```bash
git add src/components/sections/hero.tsx src/components/sections/hero.test.tsx
git commit -m "feat: redesign homepage hero as editorial thesis"
```

Expected: one commit with the new hero and updated tests.

---

### Task 3: Restyle Current Focus as Editorial Desk Notes

**Files:**
- Modify: `src/components/sections/current-focus.tsx`
- Create: `src/components/sections/current-focus.test.tsx`
- Test: `src/components/sections/current-focus.test.tsx`

- [ ] **Step 1: Add a test that captures the new desk-notes framing**

Create `src/components/sections/current-focus.test.tsx` with:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentFocus } from "./current-focus";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("CurrentFocus", () => {
  it("renders the desk-notes heading", () => {
    render(<CurrentFocus />);
    expect(screen.getByText(/Current Focus/i)).toBeDefined();
    expect(screen.getByText(/Signals from the desk/i)).toBeDefined();
  });

  it("renders the focus items from data", () => {
    render(<CurrentFocus />);
    expect(screen.getAllByText(/Building|Reading|Open To/i).length).toBeGreaterThan(0);
  });

  it("uses the revised CTA wording for linked items", () => {
    render(<CurrentFocus />);
    expect(screen.getByText(/Open the conversation/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run the new test to verify it fails**

Run:

```bash
npm test -- src/components/sections/current-focus.test.tsx --runInBand
```

Expected: FAIL because the section still says `What I'm Working On` and uses `Book a Call`.

- [ ] **Step 3: Replace the component implementation**

Replace `src/components/sections/current-focus.tsx` with:

```tsx
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { currentFocus } from "@/data/current-focus";

export function CurrentFocus() {
  return (
    <section className="border-y border-[color:var(--color-rule)] bg-[rgba(251,247,241,0.55)] py-20">
      <Container>
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="editorial-kicker mb-3">Current Focus</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-[color:var(--color-ink)] md:text-5xl">
              Signals from the desk.
            </h2>
          </div>
          <p className="max-w-xl text-sm leading-7 text-[color:var(--color-ink-soft)] md:text-base">
            A short view into what I am building, studying, and open to right now.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {currentFocus.map((item) => {
            const card = (
              <>
                <p className="editorial-kicker mb-5">{item.label}</p>
                <h3 className="mb-3 font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)]">
                  {item.heading}
                </h3>
                <p className="text-sm leading-7 text-[color:var(--color-ink-soft)]">
                  {item.body}
                </p>
                {item.href ? (
                  <span className="mt-6 inline-flex text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
                    Open the conversation
                  </span>
                ) : null}
              </>
            );

            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                className="editorial-card rounded-[1.5rem] p-6 transition-transform duration-300 hover:-translate-y-0.5"
              >
                {card}
              </Link>
            ) : (
              <div key={item.label} className="editorial-card rounded-[1.5rem] p-6">
                {card}
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: Run the new current-focus test**

Run:

```bash
npm test -- src/components/sections/current-focus.test.tsx --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit the current-focus restyle**

Run:

```bash
git add src/components/sections/current-focus.tsx src/components/sections/current-focus.test.tsx
git commit -m "feat: restyle current focus as editorial desk notes"
```

Expected: one commit with the component and its new test.

---

### Task 4: Reframe the About Section as an Editorial Profile

**Files:**
- Modify: `src/components/sections/about.tsx`
- Create: `src/components/sections/about.test.tsx`
- Test: `src/components/sections/about.test.tsx`

- [ ] **Step 1: Add a test for the revised about framing**

Create `src/components/sections/about.test.tsx` with:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { About } from "./about";

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({ alt }: any) => <img alt={alt} />,
}));

describe("About", () => {
  it("renders the editorial heading", () => {
    render(<About />);
    expect(screen.getByText(/I work at the intersection of product, healthcare, and craft/i)).toBeDefined();
  });

  it("renders the recruiting CTA copy", () => {
    render(<About />);
    expect(screen.getByText(/Open to full-time PM roles starting April 2026/i)).toBeDefined();
  });

  it("renders the competencies section", () => {
    render(<About />);
    expect(screen.getByText(/Core Competencies/i)).toBeDefined();
  });
});
```

- [ ] **Step 2: Run the about test to verify it fails**

Run:

```bash
npm test -- src/components/sections/about.test.tsx --runInBand
```

Expected: FAIL because the current section still uses the old headline copy.

- [ ] **Step 3: Replace the about section implementation**

Replace `src/components/sections/about.tsx` with:

```tsx
import Image from "next/image";
import Link from "next/link";

const competencies = [
  {
    title: "Healthcare Product Strategy",
    body: "Designing patient-centered digital health products that can survive clinical, operational, and regulatory scrutiny.",
  },
  {
    title: "AI in Healthcare",
    body: "Translating applied machine learning into workflows that improve signal quality, adoption, and decision confidence.",
  },
  {
    title: "User Research & Testing",
    body: "Working closely with patients, clinicians, and stakeholders to understand what actually changes behavior.",
  },
];

export function About() {
  return (
    <section id="about" className="px-6 py-24 md:px-12">
      <div className="editorial-shell grid gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="editorial-kicker mb-4">Profile</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-4xl leading-tight text-[color:var(--color-ink)] md:text-6xl">
            I work at the intersection of product, healthcare, and craft.
          </h2>

          <div className="mt-8 max-w-2xl space-y-5 text-lg leading-8 text-[color:var(--color-ink-soft)]">
            <p>
              I am a product manager and healthcare founder building systems that
              need both strategic clarity and operational discipline, from AI
              diagnostics and analytics platforms to enterprise-scale internal tools.
            </p>
            <p>
              Photography remains part of the same worldview. Good product work and
              good image-making both depend on attention, judgment, and an honest
              read of what matters.
            </p>
          </div>

          <div className="mt-8">
            <Link
              href="/meet"
              className="inline-flex items-center border-b border-[color:var(--color-accent)] pb-1 text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--color-accent)]"
            >
              Open to full-time PM roles starting April 2026
            </Link>
          </div>

          <div className="editorial-rule mt-12 pt-8">
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)]">
              Core Competencies
            </h3>
            <div className="mt-6 space-y-6">
              {competencies.map((item) => (
                <div key={item.title} className="grid gap-2 md:grid-cols-[220px_minmax(0,1fr)]">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-ink)]">
                    {item.title}
                  </h4>
                  <p className="text-sm leading-7 text-[color:var(--color-ink-soft)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-5">
          <div className="editorial-card sticky top-28 overflow-hidden rounded-[2rem] p-4">
            <div className="relative h-[560px] overflow-hidden rounded-[1.5rem]">
              <Image
                src="https://images.unsplash.com/photo-1700619663094-be321751b545?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="Philip Sun workspace editorial portrait"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Run the about test**

Run:

```bash
npm test -- src/components/sections/about.test.tsx --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit the about refresh**

Run:

```bash
git add src/components/sections/about.tsx src/components/sections/about.test.tsx
git commit -m "feat: reframe about section as editorial profile"
```

Expected: one commit with the new section implementation and test.

---

### Task 5: Strengthen Case Studies as the Primary Proof Block

**Files:**
- Modify: `src/components/sections/case-studies.tsx`
- Create: `src/components/sections/case-studies.test.tsx`
- Test: `src/components/sections/case-studies.test.tsx`

- [ ] **Step 1: Add a targeted case-studies test**

Create `src/components/sections/case-studies.test.tsx` with:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CaseStudies } from "./case-studies";

vi.mock("next/link", () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock("next/image", () => ({
  default: ({ alt }: any) => <img alt={alt} />,
}));

describe("CaseStudies", () => {
  it("renders the refined proof-section heading", () => {
    render(<CaseStudies />);
    expect(screen.getByText(/Selected Work/i)).toBeDefined();
    expect(screen.getByText(/A few cases where strategy met measurable execution/i)).toBeDefined();
  });

  it("renders case study links", () => {
    render(<CaseStudies />);
    expect(screen.getAllByText(/View Full Case Study/i).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run the case-studies test to verify it fails**

Run:

```bash
npm test -- src/components/sections/case-studies.test.tsx --runInBand
```

Expected: FAIL because the current heading still says `Featured Work`.

- [ ] **Step 3: Update the section heading and visual system**

Apply this focused patch to `src/components/sections/case-studies.tsx`:

```diff
--- a/src/components/sections/case-studies.tsx
+++ b/src/components/sections/case-studies.tsx
@@
-    <section id="work" className="bg-white py-24 px-6 md:px-12">
+    <section id="work" className="px-6 py-24 md:px-12">
       <div className="max-w-7xl mx-auto">
         <div className="mb-16">
-          <h2 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-gray-900 mb-4">
-            Featured Work
-          </h2>
-          <p className="text-xl text-gray-600 max-w-2xl">
-            Impact-driven case studies in healthcare product strategy and AI innovation.
-          </p>
+          <p className="editorial-kicker mb-4">Selected Work</p>
+          <h2 className="font-[family-name:var(--font-playfair)] text-5xl text-[color:var(--color-ink)] md:text-6xl">
+            Proof, presented with restraint.
+          </h2>
+          <p className="mt-4 max-w-2xl text-lg leading-8 text-[color:var(--color-ink-soft)]">
+            A few cases where strategy met measurable execution across healthcare, AI, and enterprise systems.
+          </p>
         </div>
@@
-              <article key={project.id} className="grid md:grid-cols-12 gap-8">
+              <article key={project.id} className="editorial-rule grid gap-8 pt-10 md:grid-cols-12">
@@
-                      <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-sm">
+                      <span className="rounded-full bg-[color:var(--color-ink)] px-3 py-1 text-sm text-[color:var(--color-paper-elevated)]">
                         {subtitle}
                       </span>
@@
-                    <h3 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-gray-900 mb-8">
+                    <h3 className="font-[family-name:var(--font-playfair)] text-4xl text-[color:var(--color-ink)] md:text-5xl md:leading-tight">
                       {project.title}
                     </h3>
@@
-                    <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl">
+                    <div className="editorial-card mb-8 grid grid-cols-3 gap-4 rounded-[1.75rem] p-6">
@@
-                          <div className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900 mb-1 leading-tight">
+                          <div className="font-[family-name:var(--font-playfair)] text-2xl leading-tight text-[color:var(--color-ink)]">
                             {metric}
                           </div>
@@
-                      <h4 className="font-semibold text-gray-900 mb-2 uppercase tracking-wider text-sm">
+                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                         Challenge
                       </h4>
-                      <p className="text-gray-600 leading-relaxed">{project.problem}</p>
+                      <p className="leading-8 text-[color:var(--color-ink-soft)]">{project.problem}</p>
@@
-                      <h4 className="font-semibold text-gray-900 mb-2 uppercase tracking-wider text-sm">
+                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                         Approach
                       </h4>
-                      <p className="text-gray-600 leading-relaxed">{project.solution}</p>
+                      <p className="leading-8 text-[color:var(--color-ink-soft)]">{project.solution}</p>
@@
-                      <h4 className="font-semibold text-gray-900 mb-2 uppercase tracking-wider text-sm">
+                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                         Outcomes
                       </h4>
@@
-                          <li key={idx} className="text-gray-600 leading-relaxed flex items-start gap-2">
+                          <li key={idx} className="flex items-start gap-2 leading-8 text-[color:var(--color-ink-soft)]">
@@
-                            <svg className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
+                            <svg className="mt-1 h-5 w-5 shrink-0 text-[color:var(--color-accent)]" viewBox="0 0 20 20" fill="currentColor">
@@
-                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
+                        className="rounded-full border border-[color:var(--color-rule)] bg-[rgba(251,247,241,0.7)] px-4 py-2 text-sm text-[color:var(--color-ink-soft)]"
@@
-                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:underline pt-2"
+                    className="inline-flex items-center gap-2 pt-2 text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--color-accent)] hover:underline"
                   >
                     View Full Case Study →
                   </Link>
@@
-                    <div key={imgIndex} className="relative group overflow-hidden rounded-2xl h-[500px]">
+                    <div key={imgIndex} className="editorial-card relative h-[500px] overflow-hidden rounded-[2rem] p-3">
                       <Image
@@
-                        className="object-cover transition-transform duration-500 group-hover:scale-105"
+                        className="rounded-[1.35rem] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
@@
-                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
+                      <div className="absolute inset-3 rounded-[1.35rem] bg-gradient-to-t from-black/15 to-transparent" />
```

- [ ] **Step 4: Run the case-studies test**

Run:

```bash
npm test -- src/components/sections/case-studies.test.tsx --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit the case-studies refresh**

Run:

```bash
git add src/components/sections/case-studies.tsx src/components/sections/case-studies.test.tsx
git commit -m "feat: elevate case studies as editorial proof block"
```

Expected: one commit with case-study visual updates and tests.

---

### Task 6: Align the Homepage Writing Section with the Editorial System

**Files:**
- Modify: `src/app/(main)/page.tsx`
- Modify: `src/app/__tests__/home.test.tsx`
- Test: `src/app/__tests__/home.test.tsx`

- [ ] **Step 1: Update homepage tests to reflect the new section headings and hero copy**

Replace `src/app/__tests__/home.test.tsx` with:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "@/app/(main)/page";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("framer-motion", () => ({
  motion: {
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useReducedMotion: () => false,
}));

describe("Home Page", () => {
  it("renders the new hero thesis", () => {
    render(<HomePage />);
    expect(screen.getByText(/I build product strategy, operating leverage, and trust/i)).toBeDefined();
  });

  it("renders the current focus section", () => {
    render(<HomePage />);
    expect(screen.getByText(/Current Focus/i)).toBeDefined();
  });

  it("renders the about section", () => {
    render(<HomePage />);
    expect(screen.getByText(/I work at the intersection of product, healthcare, and craft/i)).toBeDefined();
  });

  it("renders the selected work section", () => {
    render(<HomePage />);
    expect(screen.getByText(/Selected Work/i)).toBeDefined();
  });

  it("renders the latest writing section", () => {
    render(<HomePage />);
    expect(screen.getByText(/Latest Writing/i)).toBeDefined();
    expect(screen.getByText(/Notes, essays, and field reports on product, systems, and building well/i)).toBeDefined();
  });

  it("renders both hero CTAs", () => {
    render(<HomePage />);
    expect(screen.getAllByText(/Book a Call/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/View Resume/i).length).toBeGreaterThanOrEqual(1);
  });
});
```

- [ ] **Step 2: Run the homepage test to verify it fails**

Run:

```bash
npm test -- src/app/__tests__/home.test.tsx --runInBand
```

Expected: FAIL because the old homepage still renders `Creative Thinker`, `Featured Work`, and the older writing-section copy.

- [ ] **Step 3: Update the writing section styling in `src/app/(main)/page.tsx`**

Apply this patch:

```diff
--- a/src/app/(main)/page.tsx
+++ b/src/app/(main)/page.tsx
@@
       {recentPosts.length > 0 && (
-        <section className="bg-white py-24 px-6 md:px-12 border-t border-gray-100">
-          <div className="max-w-6xl mx-auto">
-            <div className="flex items-center justify-between mb-10">
-              <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-gray-900">
+        <section className="px-6 py-24 md:px-12">
+          <div className="editorial-shell editorial-rule pt-10">
+            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
+              <div>
+                <p className="editorial-kicker mb-3">Latest Writing</p>
+                <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-[color:var(--color-ink)] md:text-5xl">
                 Latest Writing
               </h2>
-              <Link href="/blog" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
+                <p className="mt-3 max-w-2xl text-base leading-7 text-[color:var(--color-ink-soft)]">
+                  Notes, essays, and field reports on product, systems, and building well.
+                </p>
+              </div>
+              <Link href="/blog" className="text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--color-accent)] transition-colors hover:text-[color:var(--color-ink)]">
                 All posts →
               </Link>
             </div>
             <div className="grid md:grid-cols-2 gap-6">
@@
-                  className="group block bg-[#faf9f7] border-2 border-gray-200 rounded-2xl p-8 hover:border-gray-900 hover:shadow-lg transition-all"
+                  className="editorial-card group block rounded-[1.75rem] p-8 transition-all hover:-translate-y-0.5"
                 >
                   <div className="flex flex-wrap gap-2 mb-4">
                     {post.frontmatter.tags.slice(0, 2).map((tag) => (
-                      <span key={tag} className="px-3 py-1 bg-white text-gray-600 rounded-full text-xs border border-gray-200">
+                      <span key={tag} className="rounded-full border border-[color:var(--color-rule)] bg-[rgba(251,247,241,0.6)] px-3 py-1 text-xs uppercase tracking-[0.15em] text-[color:var(--color-ink-soft)]">
                         {tag}
                       </span>
                     ))}
                   </div>
-                  <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900 mb-3 group-hover:underline">
+                  <h3 className="mb-3 font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)] group-hover:underline">
                     {post.frontmatter.title}
                   </h3>
-                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-2">
+                  <p className="mb-4 line-clamp-2 text-sm leading-7 text-[color:var(--color-ink-soft)]">
                     {post.frontmatter.excerpt}
                   </p>
-                  <span className="text-xs text-gray-400">{formatDate(post.frontmatter.date)} · {post.readingTime}</span>
+                  <span className="text-xs uppercase tracking-[0.18em] text-[color:var(--color-accent)]">{formatDate(post.frontmatter.date)} · {post.readingTime}</span>
                 </Link>
               ))}
             </div>
```

- [ ] **Step 4: Run the homepage test again**

Run:

```bash
npm test -- src/app/__tests__/home.test.tsx --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit the homepage writing refresh**

Run:

```bash
git add 'src/app/(main)/page.tsx' src/app/__tests__/home.test.tsx
git commit -m "feat: align homepage writing section with editorial system"
```

Expected: one commit with the home page and home test changes.

---

### Task 7: Reduce Nav Emphasis on Secondary Ventures

**Files:**
- Modify: `src/components/layout/navbar.tsx`
- Test: use existing app and component tests plus final lint/test pass

- [ ] **Step 1: Review the current navbar business emphasis**

Run:

```bash
sed -n '1,260p' src/components/layout/navbar.tsx
```

Expected: a sticky white navbar with a `Business` dropdown visually weighted similarly to primary portfolio links.

- [ ] **Step 2: Apply an editorial navbar treatment**

Apply this patch:

```diff
--- a/src/components/layout/navbar.tsx
+++ b/src/components/layout/navbar.tsx
@@
-    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
+    <header className="sticky top-0 z-50 border-b border-[color:var(--color-rule)] bg-[rgba(251,247,241,0.86)] backdrop-blur-md">
       <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 lg:px-8">
         <Link
           href="/"
-          className="font-[family-name:var(--font-playfair)] text-2xl hover:text-gray-600 transition-colors"
+          className="font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)] transition-colors hover:text-[color:var(--color-accent)]"
         >
           Philip Sun
         </Link>
@@
-                isBusinessActive
-                  ? "text-black font-medium"
-                  : "text-gray-600 hover:text-black"
+                isBusinessActive
+                  ? "text-[color:var(--color-ink)] font-medium"
+                  : "text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
               )}
@@
-              Business
+              Ventures
               <ChevronDown className="size-3.5" />
             </button>
             {businessOpen && (
-              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-md py-1 min-w-[160px] z-50">
+              <div className="absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-2xl border border-[color:var(--color-rule)] bg-[rgba(251,247,241,0.95)] py-2 shadow-[0_18px_40px_rgba(32,28,26,0.08)]">
@@
-                    className={cn(
-                      "block px-4 py-2 text-sm transition-colors",
+                    className={cn(
+                      "block px-4 py-2 text-sm transition-colors",
                       pathname === link.href
-                        ? "text-black font-medium bg-gray-50"
-                        : "text-gray-600 hover:text-black hover:bg-gray-50"
+                        ? "bg-[rgba(95,47,42,0.08)] font-medium text-[color:var(--color-ink)]"
+                        : "text-[color:var(--color-ink-soft)] hover:bg-[rgba(95,47,42,0.04)] hover:text-[color:var(--color-ink)]"
                     )}
                   >
@@
-                  className="inline-flex items-center px-4 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-full hover:bg-gray-700 transition-colors"
+                  className="inline-flex items-center rounded-full bg-[color:var(--color-ink)] px-4 py-1.5 text-sm font-medium text-[color:var(--color-paper-elevated)] transition-colors hover:bg-[color:var(--color-accent)]"
                 >
                   Book a Call
                 </Link>
```

- [ ] **Step 3: Run lint on the navbar file**

Run:

```bash
npm run lint -- src/components/layout/navbar.tsx
```

Expected: PASS.

- [ ] **Step 4: Run homepage tests to verify nav changes did not break rendering**

Run:

```bash
npm test -- src/app/__tests__/home.test.tsx src/components/sections/hero.test.tsx --runInBand
```

Expected: PASS.

- [ ] **Step 5: Commit the navbar changes**

Run:

```bash
git add src/components/layout/navbar.tsx
git commit -m "feat: reduce nav emphasis on secondary ventures"
```

Expected: one commit containing only the navbar refinement.

---

### Task 8: Final Integration Verification

**Files:**
- Verify all files changed in Tasks 1-7

- [ ] **Step 1: Run the focused homepage-related tests together**

Run:

```bash
npm test -- src/components/sections/hero.test.tsx src/components/sections/current-focus.test.tsx src/components/sections/about.test.tsx src/components/sections/case-studies.test.tsx src/app/__tests__/home.test.tsx --runInBand
```

Expected: PASS for all five test files.

- [ ] **Step 2: Run the full test suite**

Run:

```bash
npm test -- --runInBand
```

Expected: PASS for the existing Vitest suite with no regressions.

- [ ] **Step 3: Run lint across the project**

Run:

```bash
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Run a production build**

Run:

```bash
npm run build
```

Expected: PASS and a successful Next.js production build.

- [ ] **Step 5: Commit the final verified integration state**

Run:

```bash
git add src/app/globals.css src/components/layout/navbar.tsx src/components/sections/hero.tsx src/components/sections/current-focus.tsx src/components/sections/about.tsx src/components/sections/case-studies.tsx 'src/app/(main)/page.tsx' src/app/__tests__/home.test.tsx src/components/sections/hero.test.tsx src/components/sections/current-focus.test.tsx src/components/sections/about.test.tsx src/components/sections/case-studies.test.tsx
git commit -m "chore: verify editorial homepage refresh"
```

Expected: final verification commit after tests, lint, and build succeed.

---

## Self-Review

### Spec coverage

- Homepage remains structurally intact: covered by Tasks 2-6.
- Editorial visual system and warm palette: covered by Task 1.
- Hero becomes thesis-led and less startup-like: covered by Task 2.
- Current Focus becomes desk notes: covered by Task 3.
- About becomes editorial profile: covered by Task 4.
- Case Studies become the strongest proof block: covered by Task 5.
- Writing becomes integrated evidence of thinking: covered by Task 6.
- Navigation keeps business links but reduces emphasis: covered by Task 7.
- Accessibility, responsiveness, reduced motion, and verification: covered by Task 8 plus reduced-motion preservation in Task 2.

### Placeholder scan

- No `TODO`, `TBD`, or deferred implementation markers remain.
- Every code-edit step includes concrete code or a concrete patch.
- Every verification step includes an exact command and expected result.

### Type consistency

- Shared copy classes use `editorial-*` naming consistently between tokens and component tasks.
- Hero, current focus, about, case studies, and homepage tests all expect the same editorial framing terms introduced in the implementation steps.

