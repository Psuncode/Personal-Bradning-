---
plan: 01
phase: 01-infrastructure
type: execute
wave: 1
depends_on: []
files_modified:
  - src/proxy.ts
  - src/app/(main)/layout.tsx
  - src/app/(main)/page.tsx
  - src/app/(main)/not-found.tsx
  - src/app/(main)/loading.tsx
  - src/app/(photography)/layout.tsx
  - src/app/(photography)/page.tsx
  - src/app/(ecommerce)/layout.tsx
  - src/app/(ecommerce)/page.tsx
  - src/app/__tests__/proxy.test.ts
  - src/app/__tests__/home.test.tsx
  - src/app/__tests__/contact.test.tsx
  - src/app/__tests__/meet.test.tsx
  - src/app/__tests__/projects.test.tsx
autonomous: true
requirements:
  - SUB-01

must_haves:
  truths:
    - "photography.philipsun.com rewrites to /(photography) route group"
    - "ecommerce.philipsun.com rewrites to /(ecommerce) route group"
    - "philipsun.com (main domain) passes through without rewrite"
    - ".vercel.app preview URLs pass through without rewrite"
    - "Existing main site pages still render correctly after route group move"
    - "All existing tests pass after import path updates"
  artifacts:
    - path: "src/proxy.ts"
      provides: "Subdomain routing via NextResponse.rewrite()"
      exports: ["proxy", "config"]
    - path: "src/app/(main)/layout.tsx"
      provides: "Main site root layout (moved from src/app/layout.tsx)"
      contains: "<html"
    - path: "src/app/(photography)/page.tsx"
      provides: "Photography subdomain placeholder"
      contains: "photography"
    - path: "src/app/(ecommerce)/page.tsx"
      provides: "Ecommerce subdomain placeholder"
      contains: "ecommerce"
    - path: "src/app/__tests__/proxy.test.ts"
      provides: "Unit tests for proxy routing logic"
      contains: "photography subdomain"
  key_links:
    - from: "src/proxy.ts"
      to: "src/app/(photography)/page.tsx"
      via: "NextResponse.rewrite to /(photography)"
      pattern: "rewrite.*photography"
    - from: "src/proxy.ts"
      to: "src/app/(ecommerce)/page.tsx"
      via: "NextResponse.rewrite to /(ecommerce)"
      pattern: "rewrite.*ecommerce"
---

# Plan 01: Route Group Restructuring + Subdomain Proxy

## Objective

Restructure the existing Next.js App Router file tree into route groups (`(main)`, `(photography)`, `(ecommerce)`) and create `src/proxy.ts` for subdomain-based routing. This is the foundational routing architecture that all subsequent phases depend on. After this plan, `photography.philipsun.com` and `ecommerce.philipsun.com` resolve to their respective route groups, preview deployments on `.vercel.app` fall back gracefully, and the existing main site continues to work without regression.

Purpose: Every future feature (photography gallery, booking flow, ecommerce landing page) needs route groups to exist. The proxy is the single entry point that maps subdomain -> route group. Without this, no subdomain feature can ship.

Output: `src/proxy.ts`, three route groups with layouts, proxy unit tests, updated test imports.

## Tasks

<task id="1-01-01">
<title>Move existing routes into (main) route group and create subdomain route group placeholders</title>
<wave>1</wave>
<read_first>
- src/app/layout.tsx — current root layout with fonts, metadata, JSON-LD, Navbar, Footer, Analytics; must be preserved exactly
- src/app/page.tsx — current homepage; moves without modification
- src/app/not-found.tsx — global 404 page using Container and Button components
- src/app/loading.tsx — global loading spinner
- src/app/globals.css — Tailwind CSS 4 config with @theme inline; stays at src/app/ root, layouts import via relative path
- src/app/__tests__/home.test.tsx — imports from "@/app/page", must update to "@/app/(main)/page"
- src/app/__tests__/contact.test.tsx — imports from "@/app/contact/page", must update
- src/app/__tests__/meet.test.tsx — imports from "@/app/meet/page", must update
- src/app/__tests__/projects.test.tsx — imports from "@/app/projects/page", must update
</read_first>
<action>
**Step 1: Create the (main) route group directory and move files.**

Create directory `src/app/(main)/`.

Move ALL of the following into `src/app/(main)/`:
- `src/app/layout.tsx` -> `src/app/(main)/layout.tsx`
- `src/app/page.tsx` -> `src/app/(main)/page.tsx`
- `src/app/not-found.tsx` -> `src/app/(main)/not-found.tsx`
- `src/app/loading.tsx` -> `src/app/(main)/loading.tsx`
- `src/app/blog/` -> `src/app/(main)/blog/`
- `src/app/projects/` -> `src/app/(main)/projects/`
- `src/app/contact/` -> `src/app/(main)/contact/`
- `src/app/meet/` -> `src/app/(main)/meet/`
- `src/app/resume/` -> `src/app/(main)/resume/`
- `src/app/api/` -> `src/app/(main)/api/`
- `src/app/og/` -> `src/app/(main)/og/`
- `src/app/feed.xml/` -> `src/app/(main)/feed.xml/`

Keep at `src/app/` root (do NOT move):
- `src/app/globals.css` — shared CSS imported by all route group layouts
- `src/app/favicon.ico` — static asset served by Next.js from app root
- `src/app/sitemap.ts` — must be at root for `/sitemap.xml` URL
- `src/app/robots.ts` — must be at root for `/robots.txt` URL
- `src/app/__tests__/` — test directory (update imports, not location)

**Step 2: Fix the globals.css import in (main)/layout.tsx.**

In `src/app/(main)/layout.tsx`, change the CSS import from:
```typescript
import "./globals.css";
```
to:
```typescript
import "../globals.css";
```

This is the ONLY change to the main layout file. All other content (fonts, metadata, Navbar, Footer, Analytics, JSON-LD) stays identical.

**Step 3: Create the (photography) route group with placeholder layout and page.**

Create `src/app/(photography)/layout.tsx`:
```typescript
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Philip Sun Photography",
  description: "Professional photography by Philip Sun — portraits, events, and landscapes.",
};

export default function PhotographyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
```

Create `src/app/(photography)/page.tsx`:
```typescript
export default function PhotographyHome() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Philip Sun Photography</h1>
        <p className="mt-4 text-lg text-gray-600">Coming soon — gallery, pricing, and booking.</p>
      </div>
    </div>
  );
}
```

**Step 4: Create the (ecommerce) route group with placeholder layout and page.**

Create `src/app/(ecommerce)/layout.tsx`:
```typescript
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Philip Sun — Ecommerce",
  description: "Ecommerce ventures by Philip Sun.",
};

export default function EcommerceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
```

Create `src/app/(ecommerce)/page.tsx`:
```typescript
export default function EcommerceHome() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Philip Sun — Ecommerce</h1>
        <p className="mt-4 text-lg text-gray-600">Coming soon.</p>
      </div>
    </div>
  );
}
```

**Step 5: Update test imports.**

In `src/app/__tests__/home.test.tsx`, change:
```typescript
import HomePage from "@/app/page";
```
to:
```typescript
import HomePage from "@/app/(main)/page";
```

In `src/app/__tests__/contact.test.tsx`, change:
```typescript
import ContactPage from "@/app/contact/page";
```
to:
```typescript
import ContactPage from "@/app/(main)/contact/page";
```

In `src/app/__tests__/meet.test.tsx`, change:
```typescript
import MeetPage from "@/app/meet/page";
```
to:
```typescript
import MeetPage from "@/app/(main)/meet/page";
```

In `src/app/__tests__/projects.test.tsx`, change:
```typescript
import ProjectsPage from "@/app/projects/page";
```
to:
```typescript
import ProjectsPage from "@/app/(main)/projects/page";
```

**Step 6: Verify the old `src/app/layout.tsx` no longer exists.**

After the move, `src/app/layout.tsx` must NOT exist at the root. Only `src/app/(main)/layout.tsx`, `src/app/(photography)/layout.tsx`, and `src/app/(ecommerce)/layout.tsx` should have layout files. The absence of a root layout.tsx is what tells Next.js to use per-route-group root layouts.
</action>
<acceptance_criteria>
- `src/app/layout.tsx` does NOT exist (deleted/moved)
- `src/app/(main)/layout.tsx` exists and contains `import "../globals.css"`
- `src/app/(main)/layout.tsx` contains `<html lang="en">`
- `src/app/(main)/layout.tsx` contains `<Navbar />`
- `src/app/(main)/layout.tsx` contains `<Footer />`
- `src/app/(main)/layout.tsx` contains `<Analytics />`
- `src/app/(main)/page.tsx` exists and contains `<Hero />`
- `src/app/(photography)/layout.tsx` exists and contains `<html lang="en">`
- `src/app/(photography)/page.tsx` exists and contains `Philip Sun Photography`
- `src/app/(ecommerce)/layout.tsx` exists and contains `<html lang="en">`
- `src/app/(ecommerce)/page.tsx` exists and contains `Ecommerce`
- `src/app/globals.css` still exists at root (not moved)
- `src/app/favicon.ico` still exists at root (not moved)
- `src/app/sitemap.ts` still exists at root (not moved)
- `src/app/robots.ts` still exists at root (not moved)
- `src/app/(main)/blog/` directory exists
- `src/app/(main)/projects/` directory exists
- `src/app/(main)/contact/` directory exists
- `src/app/(main)/meet/` directory exists
- `src/app/(main)/resume/` directory exists
- `src/app/(main)/api/` directory exists
- `src/app/__tests__/home.test.tsx` contains `from "@/app/(main)/page"`
- `src/app/__tests__/contact.test.tsx` contains `from "@/app/(main)/contact/page"`
- `src/app/__tests__/meet.test.tsx` contains `from "@/app/(main)/meet/page"`
- `src/app/__tests__/projects.test.tsx` contains `from "@/app/(main)/projects/page"`
- `npx vitest run src/app/__tests__/ --reporter=verbose` passes all existing tests
- `npm run build` completes without errors (no "Multiple root layouts" conflict)
</acceptance_criteria>
</task>

<task id="1-01-02">
<title>Create src/proxy.ts with subdomain routing and proxy unit tests</title>
<wave>1</wave>
<read_first>
- .planning/phases/01-infrastructure/01-RESEARCH.md lines 102-161 — proxy.ts pattern with SUBDOMAINS map, host parsing, preview detection, rewrite construction
- src/data/site-config.ts — siteConfig.url is currently "https://personal-bradning-uxl12vfcg.vercel.app" (Vercel preview URL, not philipsun.com yet); proxy.ts should use NEXT_PUBLIC_DOMAIN env var, not hardcode
- src/app/(photography)/page.tsx — must exist (created by task 1-01-01) for rewrite target to resolve
- src/app/(ecommerce)/page.tsx — must exist (created by task 1-01-01) for rewrite target to resolve
</read_first>
<action>
**Step 1: Create `src/proxy.ts`.**

This file is the Next.js 16 proxy convention (NOT middleware.ts). The exported function MUST be named `proxy`, NOT `middleware`.

```typescript
// src/proxy.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUBDOMAINS: Record<string, string> = {
  photography: "/(photography)",
  ecommerce: "/(ecommerce)",
};

export function proxy(request: NextRequest) {
  const hostname = request.headers.get("host") ?? "";

  // Strip port for local dev (e.g. "photography.localhost:3000" -> "photography.localhost")
  const hostWithoutPort = hostname.split(":")[0];

  // Preview deployments on .vercel.app — pass through without rewriting
  if (hostWithoutPort.endsWith(".vercel.app")) {
    return NextResponse.next();
  }

  // Localhost — pass through (subdomain routing not needed for local dev in Phase 1)
  if (hostWithoutPort.endsWith(".localhost") || hostWithoutPort === "localhost") {
    return NextResponse.next();
  }

  // Main domain — no rewrite needed
  const mainDomain = process.env.NEXT_PUBLIC_DOMAIN ?? "philipsun.com";
  if (hostWithoutPort === mainDomain || hostWithoutPort === `www.${mainDomain}`) {
    return NextResponse.next();
  }

  // Extract subdomain: "photography.philipsun.com" -> "photography"
  const subdomain = hostWithoutPort.split(".")[0];
  const routeGroupPath = SUBDOMAINS[subdomain];

  if (!routeGroupPath) {
    return NextResponse.next();
  }

  // Rewrite to route group: photography.philipsun.com/about -> /(photography)/about
  const url = request.nextUrl.clone();
  url.pathname =
    routeGroupPath + (request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: [
    // Run on all paths except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
```

**Step 2: Create proxy unit tests at `src/app/__tests__/proxy.test.ts`.**

Use the `next/experimental/testing/server` utilities (`isRewrite`, `getRewrittenUrl`) as documented in the research. These are the official Next.js testing helpers for proxy files.

```typescript
// src/app/__tests__/proxy.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { isRewrite, getRewrittenUrl } from "next/experimental/testing/server";
import { proxy } from "@/proxy";

describe("proxy subdomain routing", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_DOMAIN", "philipsun.com");
  });

  describe("photography subdomain", () => {
    it("rewrites photography.philipsun.com/ to /(photography)", () => {
      const request = new NextRequest("https://photography.philipsun.com/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/(photography)");
    });

    it("rewrites photography.philipsun.com/gallery to /(photography)/gallery", () => {
      const request = new NextRequest("https://photography.philipsun.com/gallery");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/(photography)/gallery");
    });
  });

  describe("ecommerce subdomain", () => {
    it("rewrites ecommerce.philipsun.com/ to /(ecommerce)", () => {
      const request = new NextRequest("https://ecommerce.philipsun.com/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(true);
      expect(getRewrittenUrl(response)).toContain("/(ecommerce)");
    });
  });

  describe("main domain pass-through", () => {
    it("does not rewrite philipsun.com", () => {
      const request = new NextRequest("https://philipsun.com/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });

    it("does not rewrite www.philipsun.com", () => {
      const request = new NextRequest("https://www.philipsun.com/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });

  describe("preview deployment pass-through", () => {
    it("does not rewrite .vercel.app URLs", () => {
      const request = new NextRequest("https://philipsun-com-git-main.vercel.app/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });

    it("does not rewrite preview URLs even if they contain subdomain keywords", () => {
      const request = new NextRequest(
        "https://philipsun-com-photography-feature.vercel.app/"
      );
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });

  describe("localhost pass-through", () => {
    it("does not rewrite localhost", () => {
      const request = new NextRequest("http://localhost:3000/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });

    it("does not rewrite photography.localhost", () => {
      const request = new NextRequest("http://photography.localhost:3000/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });

  describe("unknown subdomain pass-through", () => {
    it("does not rewrite unknown subdomains", () => {
      const request = new NextRequest("https://staging.philipsun.com/");
      const response = proxy(request);
      expect(isRewrite(response)).toBe(false);
    });
  });
});
```

**IMPORTANT NOTES:**
- If `next/experimental/testing/server` imports fail (the module may not exist in Next.js 16.1.6), fall back to checking the response object directly. Check `response.headers.get('x-middleware-rewrite')` for the rewritten URL, or inspect `response.status` and response type. In that case, adjust tests to:
  - For rewrites: check that `response.headers.get('x-middleware-rewrite')` is not null and contains the expected path
  - For pass-through: check that `response.headers.get('x-middleware-rewrite')` is null
- The test file uses `vi.stubEnv` to set `NEXT_PUBLIC_DOMAIN` for consistent test behavior.
- Each test constructs a real `NextRequest` with full URL — no manual mocks of the request object.
</action>
<acceptance_criteria>
- `src/proxy.ts` exists at project root's `src/` directory
- `src/proxy.ts` contains `export function proxy(request: NextRequest)`
- `src/proxy.ts` does NOT contain `export function middleware` anywhere
- `src/proxy.ts` contains `SUBDOMAINS` map with `photography` and `ecommerce` keys
- `src/proxy.ts` contains `process.env.NEXT_PUBLIC_DOMAIN` (not hardcoded domain)
- `src/proxy.ts` contains `.endsWith(".vercel.app")` for preview detection
- `src/proxy.ts` contains `NextResponse.rewrite(url)` for subdomain routing
- `src/proxy.ts` contains `export const config` with matcher array
- `src/app/__tests__/proxy.test.ts` exists
- `src/app/__tests__/proxy.test.ts` contains at least 7 test cases (photography rewrite, photography subpath, ecommerce rewrite, main domain, www domain, vercel preview, unknown subdomain)
- `npx vitest run src/app/__tests__/proxy.test.ts --reporter=verbose` passes all tests
- `npm run build` completes without errors
</acceptance_criteria>
</task>

## Verification

### Automated
```bash
# All proxy tests pass
npx vitest run src/app/__tests__/proxy.test.ts --reporter=verbose

# All existing tests still pass (no regression from route group move)
npx vitest run src/app/__tests__/ --reporter=verbose

# Production build succeeds (no root layout conflict, no broken imports)
npm run build
```

### Manual
- Run `npm run dev` and visit `http://localhost:3000` — main site renders normally with Navbar, Hero, Footer
- (After DNS propagation) Visit `photography.philipsun.com` — see photography placeholder page
- (After DNS propagation) Visit `ecommerce.philipsun.com` — see ecommerce placeholder page

## Success Criteria
- All proxy routing tests green (7+ test cases)
- All existing 4 test files pass without modification (beyond import path updates)
- `npm run build` exits 0
- Route group structure exists: `(main)/`, `(photography)/`, `(ecommerce)/` each with layout.tsx and page.tsx
- No `src/app/layout.tsx` at root level
