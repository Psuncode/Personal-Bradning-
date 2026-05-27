---
review: seo
scope: metadata, structured data, sitemap, robots, llms.txt, OG/Twitter cards, canonical URLs
date: 2026-05-19
branch: feat/blog-system-v2
reviewer: code-review agent (seo lens, .agents/skills/seo/SKILL.md)
files:
  - src/app/layout.tsx
  - src/app/(main)/layout.tsx
  - src/app/(main)/blog/[slug]/page.tsx
  - src/app/(main)/blog/[slug]/og/route.tsx
  - src/app/(main)/blog/page.tsx
  - src/app/(main)/blog/tag/[tag]/page.tsx
  - src/app/(main)/projects/[slug]/page.tsx
  - src/app/(main)/og/route.tsx
  - src/app/(main)/feed.xml/route.ts
  - src/app/sitemap.ts
  - src/app/robots.ts
  - public/llms.txt
findings_summary:
  critical: 1
  high: 4
  medium: 6
  low: 5
---

# SEO review — philipsun.com (blog-system-v2)

Reviewed against the `seo` skill's Lighthouse/Google Search checklist: structured data correctness, metadata completeness, sitemap coverage, canonical URLs, robots/llms.txt accuracy, image alt, OG/Twitter cards, mobile viewport. No source edits — this is an audit only.

## CRITICAL

### C1. No `viewport` meta tag declared (mobile SEO + Lighthouse fail)

**Files:** `src/app/layout.tsx`, `src/app/(main)/layout.tsx`

The root layout sets `metadataBase` but no `viewport`. Next.js 16 expects either a top-level `viewport` export from `Metadata`, or the dedicated `export const viewport: Viewport` (preferred in App Router). The `(main)` group layout also omits it. The skill's mobile section explicitly flags `<meta name="viewport" content="width=device-width, initial-scale=1">` as required — and Lighthouse SEO scores it as a hard fail.

While Next.js *used to* inject a default viewport, that behavior is no longer guaranteed (it's now opt-in via the `viewport` export). Verify the rendered HTML — if missing, every page is non-mobile-friendly per Google's mobile-first index.

**Fix:** Add to `src/app/layout.tsx`:
```ts
import type { Viewport } from "next";
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4efe6",
};
```

---

## HIGH

### H1. No canonical URLs set anywhere

**Files:** all `generateMetadata` and `metadata` exports

No page declares `alternates.canonical`. The skill flags self-referencing canonicals as a high-priority requirement. Without them, duplicate-content collisions are likely on the photography sub-tree (`/photography`, `/photography/gallery`, etc.), tag pages that re-list posts, and trailing-slash / case variants.

**Fix:** In each `generateMetadata` and static `metadata`, set `alternates: { canonical: '<absolute or path>' }`. For dynamic routes:
```ts
alternates: { canonical: `/blog/${slug}` }   // metadataBase makes it absolute
```

### H2. Article JSON-LD `image` points to OG card, not real cover image

**File:** `src/app/(main)/blog/[slug]/page.tsx:56`

```ts
image: [`${siteConfig.url}/blog/${slug}/og`],
```

The Article schema's `image` is supposed to be the *article's* image — the cover photograph — not a generated social card. Google specifically recommends a 1200×675+ image **representing the article content**. Using the synthetic OG plate (cream-paper text-only card) deprives rich results of a real photo and hurts Discover eligibility. The post already has `post.cover.src` available (covers are auto-detected in `src/lib/blog.ts:detectCover`).

**Fix:**
```ts
image: post.cover?.src
  ? [`${siteConfig.url}${post.cover.src}`, `${siteConfig.url}/blog/${slug}/og`]
  : [`${siteConfig.url}/blog/${slug}/og`],
```

### H3. Article JSON-LD `publisher` mis-typed as `Person`

**File:** `src/app/(main)/blog/[slug]/page.tsx:68-72`

```ts
publisher: { "@type": "Person", name: "Philip Sun", url: siteConfig.url },
```

`schema.org/Article.publisher` expects an `Organization` with a `logo` ImageObject for Google rich results. A `Person` publisher is technically valid schema but Google's Article guidelines require an `Organization` for rich-result eligibility. This will silently disqualify posts from the news/Article carousel.

**Fix:**
```ts
publisher: {
  "@type": "Organization",
  name: "Philip Sun",
  logo: {
    "@type": "ImageObject",
    url: `${siteConfig.url}/og`,   // or a dedicated logo asset
  },
},
```

### H4. Project JSON-LD uses `SoftwareApplication` for non-software work

**File:** `src/app/(main)/projects/[slug]/page.tsx:42`

Every project (including Inara Health Diagnostic — a hardware medical device, and LDS Church PM — an internal migration) is typed as `SoftwareApplication` with `applicationCategory: "WebApplication"`. The same schema is also missing the `offers` or `operatingSystem` properties Google requires for SoftwareApplication rich results — so it's both inaccurate *and* ineligible.

**Fix:** Use `CreativeWork` (or `Article` for case studies) as the default. Optionally branch on project type:
```ts
"@type": project.techStack?.includes("Hardware") ? "CreativeWork" : "CreativeWork",
```
Drop `applicationCategory` unless real software with installable artifacts.

---

## MEDIUM

### M1. Sitemap `lastModified` is `new Date()` everywhere (always "now")

**File:** `src/app/sitemap.ts:8-85`

Every URL emits `lastModified: new Date()` at build time. This means Google sees every page updated on every redeploy regardless of whether it actually changed — a noisy signal that search engines learn to ignore. Blog posts have `post.frontmatter.date` (and optional `dateModified`); projects can use a stable date or fall back to the build date for the index pages only.

**Fix:**
```ts
const blogPostRoutes = getAllPosts().map((p) => ({
  url: `${siteConfig.url}/blog/${p.slug}`,
  lastModified: new Date(p.frontmatter.dateModified ?? p.frontmatter.date),
  changeFrequency: "monthly" as const,
  priority: 0.6,
}));
```

### M2. Sitemap missing routes

**File:** `src/app/sitemap.ts`

Not in sitemap (compared to `app/(main)` + `app/(photography)` + `app/(ecommerce)` page inventory):
- `/about` (if present — not found in tree, ignore if intentional)
- `/blog/tag/<tag>` index URLs (these are static-params'd and indexable — should be in sitemap or have explicit `robots: { index: false }`)
- `/ecommerce` (subdomain may handle this — verify intent)

Plus `/photography/book/success` should be `noindex` (it's a post-checkout confirmation), not in sitemap.

**Fix:** Either include tag pages in sitemap (low priority ~0.4, generate from `getAllPosts`'s tags) **or** add `robots: { index: false }` to `blog/tag/[tag]/page.tsx`'s `generateMetadata`. Add `robots: { index: false, follow: false }` to `photography/book/success/page.tsx`.

### M3. Tag pages: no canonical, no OG, no JSON-LD, no rel=self

**File:** `src/app/(main)/blog/tag/[tag]/page.tsx`

`#${decoded}` is the page title — fine — but no `alternates.canonical`, no `openGraph`, no `twitter`, and no `CollectionPage`/`Blog` JSON-LD. Combined with M2, tag pages are weak SEO surfaces. If they index, they compete with `/blog`; if they don't, they shouldn't be `generateStaticParams`'d to be discoverable.

**Fix:** Decide policy. If indexable, add canonical + OG image + `CollectionPage` JSON-LD with `hasPart` array of posts. If not, set `robots: { index: false, follow: true }`.

### M4. RSS feed missing required `<lastBuildDate>` and `<pubDate>` validity

**File:** `src/app/(main)/feed.xml/route.ts`

Functional, but missing:
- `<lastBuildDate>` on the channel (W3C feed validator flags this)
- `<atom:link rel="self">` is present (good)
- `<language>` is present (good)
- `<description>` includes `<content:encoded>` would let readers render full posts (nice-to-have)

Also: feed is at `/feed.xml` but path is rendered from `(main)` group route handler — verify the route emits at root path (Next.js groups don't add URL segments, so this should work). However the `Cache-Control: max-age=3600` is reasonable.

**Fix:** Add `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>` inside `<channel>`.

### M5. llms.txt is out of date / inaccurate

**File:** `public/llms.txt`

- Line 5 says "graduating April 2026" — today is past that. Stale.
- Lines 33–37 list 4 featured projects (`inara-health`, `lds-church-pm`, `nursa-ai-tb`, `granger-rvu-analytics`) — must match `src/data/projects.ts` slugs. The `granger-rvu-analytics` slug must be verified against the source of truth (I didn't enumerate all projects, but the list is hand-maintained and prone to drift). 
- Line 42 lists only one blog post (`photography-session-guide`) but `content/blog/` has four (`hello-world`, `welcome`, `lessons-from-building`, `photography-session-guide`). If those others are published, llms.txt under-reports the writing surface.

**Fix:** Either (a) regenerate `llms.txt` at build time from `projects.ts` + `getAllPosts()` (preferred — same pattern as sitemap.ts), or (b) move it to a doc-as-code spec and update on every project/post.

### M6. Person JSON-LD missing `image` and `description`

**File:** `src/app/(main)/layout.tsx:56-94`

Solid coverage (jobTitle, sameAs, knowsAbout, hasOccupation), but missing `image` (Knowledge Panel photo) and `description` (the same short bio used in `siteConfig.description` would work). Both help Google build the entity card for the name "Philip Sun."

**Fix:** Add:
```ts
image: `${siteConfig.url}/og`,            // or a real headshot
description: siteConfig.description,
```

---

## LOW

### L1. OG card text doesn't show post excerpt

**File:** `src/app/(main)/blog/[slug]/og/route.tsx`

The per-post OG card shows kicker ("Writing · <date>") + title + footer ("philipsun.com") but not the excerpt. Adding a short truncated excerpt below the title would raise CTR on social shares without changing the editorial palette.

### L2. OG card `fontFamily: "Georgia, serif"` falls back to serif

**Files:** `src/app/(main)/og/route.tsx:18`, `src/app/(main)/blog/[slug]/og/route.tsx:38`

Edge `ImageResponse` doesn't include Georgia by default — it'll render a generic serif. Either embed Playfair Display via `fonts: [{ name, data, weight }]` (the site already loads Playfair via next/font) or accept the fallback. Cosmetic; doesn't affect ranking.

### L3. `email` exposed in JSON-LD Person

**File:** `src/app/(main)/layout.tsx:62`

`email: siteConfig.email` is emitted in the JSON-LD blob. Spam crawlers parse JSON-LD. Either remove or use `contactPoint` with a separate contact email, or accept the risk.

### L4. `robots.ts` doesn't block `/admin` or `/api`

**File:** `src/app/robots.ts`

```ts
rules: { userAgent: "*", allow: "/" }
```

The skill explicitly recommends `Disallow: /admin/` and `Disallow: /api/` as defensive crawl-budget guidance. Admin and API routes shouldn't render meaningful indexable HTML, but blocking is cheap insurance.

**Fix:**
```ts
rules: [
  { userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] },
],
```

### L5. Article JSON-LD missing `wordCount` and `articleSection`

**File:** `src/app/(main)/blog/[slug]/page.tsx`

Both are optional but recommended Article properties Google uses. Tags are already on the frontmatter — `articleSection: post.frontmatter.tags[0]` is a one-liner. `wordCount` is available from `post.content.split(/\s+/).length`.

---

## What's already good (worth preserving)

- `safeJsonLd` correctly escapes `<`, `>`, `&`, U+2028, U+2029 — defense against script-tag breakout.
- `metadataBase` is set on the root layout so all relative `openGraph.images` resolve absolutely.
- Blog index `alternates.types["application/rss+xml"]` correctly advertises the feed.
- Per-post OG route uses `nodejs` runtime (needed for fs access) and truncates long titles to 90 chars.
- `generateStaticParams` is used for projects, blog posts, and tag pages — full static generation, good crawlability.
- Tag pages already decode `decodeURIComponent` correctly (recent fix `f1cf45d`).

## Recommended next steps (priority order)

1. **C1** — add `viewport` export (5 min, unblocks mobile-friendliness signal)
2. **H3, H4** — fix Article publisher + project schema type (10 min, unblocks rich results)
3. **H1** — add canonical URLs (30 min)
4. **H2** — point Article.image at real cover (15 min)
5. **M5** — automate `llms.txt` generation at build time (1 hr)
6. **M1, M2** — sitemap accuracy (lastModified from frontmatter, add/exclude tag pages) (30 min)

None of these require touching the editorial design system or blog asset pipeline.
