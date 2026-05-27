---
status: complete
phase: "04"
phase_name: geo-and-ecommerce-subdomain
files_reviewed:
  - public/llms.txt
  - src/app/(ecommerce)/ecommerce/page.tsx
  - src/app/(ecommerce)/layout.tsx
  - src/app/(main)/blog/[slug]/page.tsx
  - src/app/(main)/layout.tsx
  - src/types/blog.ts
depth: standard
findings_summary:
  critical: 2
  warning: 6
  info: 5
  total: 13
generated_at: 2026-05-19
---

# Phase 04 Code Review — GEO and Ecommerce Subdomain

## Summary

Phase 04 ships SEO/GEO infrastructure (FAQPage/HowTo JSON-LD, llms.txt, expanded Person schema) and a B2B ecommerce landing page. The JSON-LD generation in `blog/[slug]/page.tsx` is structurally correct and conditional rendering is safe, but it inherits an XSS-via-JSON-injection risk from author-controlled frontmatter that is not escaped before being embedded in `<script>` tags. The far bigger and more visible issue is that the entire ecommerce landing page is styled with `byu-*` Tailwind classes that no longer exist in the Tailwind 4 `@theme inline` block in `globals.css` (per CLAUDE.md the `byu-*` tokens are deprecated). The page will render as unstyled white/black text on every surface — navy buttons, sky tag chips, and the dark CTA section all become invisible.

## Critical Findings

### CR-01 — Ecommerce page uses fully undefined `byu-*` color classes

**File:** src/app/(ecommerce)/ecommerce/page.tsx:16, 19, 29, 33, 46, 64-76, 84, 91-93, 102, 109, 118, 120, 130, 137, 150, 153-154, 161, 168, 170, 186-187, 193-194, 200-201, 211, 214, 219
**Severity:** Critical
**Issue:** The component references `text-byu-navy`, `bg-byu-navy`, `text-byu-blue`, `bg-byu-sky`, `focus-visible:ring-byu-blue`, `hover:bg-byu-sky`, etc. throughout. Per project CLAUDE.md and confirmed by inspection of `src/app/globals.css`, the `byu-*` palette is deprecated and is NOT defined in the Tailwind 4 `@theme inline` block. There is no `tailwind.config.*` providing them either.
**Impact:** Every brand-colored element (sticky header label, primary CTA buttons, hero kicker, headings, trust-bar icons, product card top accent strip, tag chips, "Who We Work With" icons, numbered process pills, dark CTA section background, footer accents) renders without color — black text on white, transparent buttons. The Section 7 `bg-byu-navy` CTA in particular becomes white-on-white and the white button text on `bg-byu-sky` chips disappears. This is a fully-broken landing page in production.
**Fix:** Replace with editorial tokens (or page-specific colors): swap `text-byu-navy` to `text-ink` (or `text-[var(--color-ink)]`), `bg-byu-navy` to `bg-ink`/`bg-accent`, `text-byu-blue` to `text-accent`, `bg-byu-sky` to `bg-paper` or `bg-paper-elevated`, focus ring to `focus-visible:ring-accent`. Or, since this is a separate subdomain with its own visual language per `(ecommerce)/layout.tsx`, define an ecommerce-only palette inside this route group's layout via `@theme` and use semantic names (`bg-brand-navy`, `bg-brand-sky`).

### CR-02 — JSON-LD embeds unescaped author content; `</script>` in frontmatter breaks the page

**File:** src/app/(main)/blog/[slug]/page.tsx:99-114
**Severity:** Critical
**Issue:** `JSON.stringify(jsonLd)` is injected into `<script>` via `dangerouslySetInnerHTML` for three blocks (Article, FAQPage, HowTo). `JSON.stringify` escapes quotes but does NOT escape `<`, `>`, `/`, or U+2028/U+2029 line separators. If any frontmatter field (`title`, `excerpt`, `faq[].question`, `faq[].answer`, `howTo.steps[]`) contains the literal sequence `</script>` (or `<!--`, `<![CDATA[`), the HTML parser closes the script tag early, breaking JSON-LD parsing for crawlers and potentially enabling stored XSS if attacker-controlled content reaches this path.
**Impact:** Today this is author-controlled and low-risk, but the same path is now wired for FAQ/HowTo content where authors commonly write multi-sentence answers that may include `</script>` examples or code snippets. A single benign post about "embedding scripts" would break Google's rich-result eligibility for the entire page.
**Fix:** Replace each `JSON.stringify(x)` with a helper that escapes the four HTML-significant characters plus the two JS line-terminator code points (U+2028 LINE SEPARATOR and U+2029 PARAGRAPH SEPARATOR — these are valid in JSON but break inline `<script>` parsing). Implementation sketch (regex literals match the raw code points; written here using their `\uXXXX` escapes for review-file clarity):

```ts
const safeStringify = (obj: unknown) =>
  JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(new RegExp(String.fromCharCode(0x2028), "g"), "\\u2028")
    .replace(new RegExp(String.fromCharCode(0x2029), "g"), "\\u2029");
```

Apply to all three `__html` payloads here AND to the Person JSON-LD in `(main)/layout.tsx:109`.

## Warnings

### WR-01 — Two `<html>` / `<body>` elements from nested route-group layouts

**File:** src/app/(ecommerce)/layout.tsx:22-26
**Severity:** Warning
**Issue:** `(ecommerce)/layout.tsx` renders its own `<html lang="en"><body>...`. In Next.js App Router, route groups share the single root layout — only `src/app/layout.tsx` (the true root) may render `<html>`/`<body>`. If `src/app/layout.tsx` also renders `<html>`, the ecommerce route ships nested `<html>` elements and hydration warnings. (If, by contrast, the root `app/layout.tsx` is a passthrough delegating to the group layouts, that's a non-standard pattern that should be documented.)
**Impact:** Likely hydration errors and double-rendered `<head>`. SEO and analytics may double-fire. The `suppressHydrationWarning` masks the symptom.
**Fix:** Verify `src/app/layout.tsx`. If it renders `<html>`, remove the `<html>`/`<body>` from both `(main)/layout.tsx` and `(ecommerce)/layout.tsx` and apply font variable classes via a wrapper `<div>` instead — or move per-route `<head>` content to `metadata`. If a different root layout was intentionally omitted, add a brief comment in `(ecommerce)/layout.tsx`.

### WR-02 — `(main)/layout.tsx` likewise renders `<html>` — same nesting concern

**File:** src/app/(main)/layout.tsx:97-118
**Severity:** Warning
**Issue:** Same as WR-01; verify only one layout in the tree owns `<html>`/`<body>`.
**Impact:** Same.
**Fix:** Same — pick one owner.

### WR-03 — `llms.txt` advertises a `/resume` URL that was deleted

**File:** public/llms.txt:31
**Severity:** Warning
**Issue:** Line 31 lists `philipsun.com/resume — Full resume and work history`. Per CLAUDE.md "Known carve-outs": the `/resume` route was removed in commit 8dcb863 and explicitly should not be reintroduced.
**Impact:** AI crawlers (which is the whole point of `llms.txt`) will fetch a 404 and may downgrade confidence in the file. Also misleads humans inspecting the file.
**Fix:** Delete line 31 or replace with `philipsun.com/projects — Project case studies` (which is already on line 29 — so just delete the resume line).

### WR-04 — `llms.txt` advertises `philipsun.com/ecommerce` but layout/metadata says ecommerce is a subdomain

**File:** public/llms.txt:28; src/app/(ecommerce)/ecommerce/page.tsx:229 ("ecommerce.philipsun.com"); src/app/(ecommerce)/layout.tsx:11
**Severity:** Warning
**Issue:** The footer string in `page.tsx` and the metadata title `"Philip Sun — Global Trading | B2B Product Sourcing"` both treat ecommerce as a separate subdomain (`ecommerce.philipsun.com`), but `llms.txt`, sitemap, and routing serve it at `philipsun.com/ecommerce`. The two presentations contradict each other.
**Impact:** Crawler confusion; canonical URL ambiguity; an inquiry email landing on `ecommerce.philipsun.com` that doesn't exist is a dead link.
**Fix:** Pick one. If staying at `/ecommerce`, change the footer text to `philipsun.com/ecommerce`. If migrating to a real subdomain, add a redirect and update `llms.txt`.

### WR-05 — `Article` JSON-LD missing `image`, `mainEntityOfPage`, and `dateModified`

**File:** src/app/(main)/blog/[slug]/page.tsx:50-66
**Severity:** Warning
**Issue:** Google's Article rich-result eligibility requires (or strongly prefers) `image` (URL), `mainEntityOfPage` (the canonical post URL), and `dateModified`. The current payload has none.
**Impact:** Posts will not qualify for Article rich results in Search Console. The per-post OG image already exists at `/blog/${slug}/og` and the canonical URL can be derived from `siteConfig.url`.
**Fix:**
```ts
image: [`${siteConfig.url}/blog/${slug}/og`],
mainEntityOfPage: { "@type": "WebPage", "@id": `${siteConfig.url}/blog/${slug}` },
dateModified: post.frontmatter.dateModified ?? post.frontmatter.date,
```
Add an optional `dateModified?: string` field to `BlogPostFrontmatter` in `src/types/blog.ts`.

### WR-06 — Hardcoded copyright/footer string and contact-handler URL not in `siteConfig`

**File:** src/app/(ecommerce)/ecommerce/page.tsx:16, 215, 229
**Severity:** Warning
**Issue:** "Philip Sun — Global Trading", the 24-hour SLA promise, and the ecommerce hostname are hardcoded inline. Per CLAUDE.md the data layer principle is that site title/copy lives in `src/data/site-config.ts` (or a new `src/data/ecommerce.ts`).
**Impact:** Two sources of truth for the brand name; SLA copy can't be A/B tested or localized.
**Fix:** Move the Global Trading brand string and SLA copy to a new `src/data/ecommerce.ts` (alongside the products list), or extend `siteConfig` with a `subBrands.ecommerce` object.

## Info

### IN-01 — `BlogPost` type doesn't allow `null` frontmatter fields, but YAML can produce them

**File:** src/types/blog.ts:10-15
**Severity:** Info
**Issue:** `faq?: Array<...>` and `howTo?: {...}` are optional, but if an author writes `faq: ~` or `faq:` (empty) in YAML, gray-matter parses that as `null`, not `undefined`. `post.frontmatter.faq && post.frontmatter.faq.length > 0` in `page.tsx:68` handles the null case fine, but `post.frontmatter.howTo.steps.map(...)` on line 89 would throw if `howTo: {}` is written without `steps`.
**Impact:** A malformed post crashes the route at build time.
**Fix:** Either tighten the type to `faq?: Array<{...}> | null` (documenting the YAML reality) and add a runtime guard `Array.isArray(howTo.steps)`, or validate frontmatter with Zod in `src/lib/blog.ts` and reject malformed posts loudly with the slug in the error.

### IN-02 — `HowTo` schema is missing recommended `HowToStep.name`

**File:** src/app/(main)/blog/[slug]/page.tsx:89-93
**Severity:** Info
**Issue:** schema.org's `HowToStep` accepts `name` (short label) and `text` (detailed instructions). Google Search Gallery examples include both; only `text` is provided.
**Impact:** Slightly weaker rich-result eligibility for HowTo posts. Not a blocker.
**Fix:** Either accept richer step shape in `BlogPostFrontmatter` (`steps: Array<string | { name: string; text: string }>`) or generate `name` by taking the first sentence of `text`.

### IN-03 — Ecommerce page has no `<main>` landmark and no `lang` propagation

**File:** src/app/(ecommerce)/ecommerce/page.tsx:11; src/app/(ecommerce)/layout.tsx:23
**Severity:** Info
**Issue:** The layout wraps children in `<main>`, but the page renders `<header>` AND `<footer>` inside that `<main>`. HTML5 disallows nesting `<header>` (page-level) and `<footer>` (page-level) inside `<main>`; they should be siblings.
**Impact:** Minor a11y / landmark navigation issue for screen-reader users; AXE will flag it.
**Fix:** Move `<header>` and `<footer>` out of the page component into `(ecommerce)/layout.tsx` as siblings of `<main>`, OR drop the page-level `<main>` from the layout and keep them inside the page as siblings of an explicit `<main>`.

### IN-04 — No `metadata.alternates.canonical` on blog posts or ecommerce

**File:** src/app/(main)/blog/[slug]/page.tsx:12-35; src/app/(ecommerce)/layout.tsx:10-14
**Severity:** Info
**Issue:** Neither route declares a canonical URL via `metadata.alternates.canonical`. With Vercel preview deploys, this can cause duplicate-content indexing across `vercel.app` preview URLs.
**Impact:** Minor SEO leak; preview URLs may rank instead of production.
**Fix:** Add `alternates: { canonical: \`${siteConfig.url}/blog/${slug}\` }` in `generateMetadata` and `alternates: { canonical: \`${siteConfig.url}/ecommerce\` }` in the ecommerce layout. (Note: `metadataBase` in `(main)/layout.tsx` already partially handles this for OG, but explicit canonical is the belt-and-suspenders move.)

### IN-05 — Person schema `email` and Article `author.email` would help E-E-A-T

**File:** src/app/(main)/layout.tsx:62; src/app/(main)/blog/[slug]/page.tsx:56-65
**Severity:** Info
**Issue:** Person schema includes `email`, which is good; Article schema's `author` is missing `email` and `sameAs` (LinkedIn/GitHub). Cross-linking author identity across schemas helps Google de-dupe entities.
**Impact:** Modest GEO/E-E-A-T improvement.
**Fix:** In `blog/[slug]/page.tsx` extend `author` to `{ "@type": "Person", name: "Philip Sun", url: siteConfig.url, sameAs: [siteConfig.links.linkedin, siteConfig.links.github] }`.

## Files Reviewed

- public/llms.txt
- src/app/(ecommerce)/ecommerce/page.tsx
- src/app/(ecommerce)/layout.tsx
- src/app/(main)/blog/[slug]/page.tsx
- src/app/(main)/layout.tsx
- src/types/blog.ts
