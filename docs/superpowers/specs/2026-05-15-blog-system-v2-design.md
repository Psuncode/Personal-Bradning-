# Blog system v2 — design spec

**Date:** 2026-05-15
**Branch target:** `feat/blog-system-v2`
**Status:** Approved by user during /superpowers:brainstorming session 2026-05-15.

## Problem

The current blogging system is bare: flat MDX files under `content/blog/`, no shortcodes, no co-located imagery, no cover heroes, no per-tag URLs, no per-post OG card. Authoring a post means writing prose into an MDX file with no editorial affordances — the visual system that exists across the rest of the site is absent on posts. Goal: turn the blog into a magazine-quality surface where dropping a `.md` (or `.mdx`) file plus a few photos into a post folder produces a polished, image-forward piece without any per-post styling effort.

## Constraints

- Stays static — no DB, no admin UI, no auth. Files in git, deploy on push.
- Reuses the existing editorial token system (`cream paper`, `ink`, `accent`, Playfair display, Inter body, grain overlay) — no new design tokens.
- Backwards compatible: the 4 existing flat `.mdx` files keep working until migrated.
- Image optimization must use `next/image`. Build pipeline must work on Vercel.
- TDD: every new component ships with a failing test first.
- One feature branch off `main`, one PR at the end. Each task is one atomic commit.

## Decisions (locked during brainstorming)

| ID | Decision | Notes |
|----|---|---|
| **A** | Local authoring DX — files in git, no upload UI | rejected web upload and CMS plug-in |
| **A1** | Per-post folder structure (`content/blog/<slug>/index.mdx`) | replaces flat MDX |
| **B1** | Ship all 6 editorial shortcodes | `<Figure>`, `<FullBleed>`, `<Gallery>`, `<PullQuote>`, `<TwoColumn>`, `<Aside>` |
| **C1** | Convention-based cover image (`cover.{jpg,png,webp}`) | no frontmatter field required |
| **D2** | All four extras in scope | tag pages, series support, per-post OG, auto blur-up placeholders |

## Architecture

### Authoring model

```
content/blog/
  hello-world/
    index.mdx
    cover.jpg
    diagram.png
  lessons-from-building/
    index.mdx
    cover.jpg
  legacy-old-post.mdx      ← flat MDX still supported
```

**Frontmatter** (additions only — existing fields unchanged):
```yaml
series: "Healthcare PM"     # optional — groups posts into a series
seriesOrder: 2              # optional — position within the series (1-indexed)
```

**Discovery rule** (extends `getAllPosts()` in `src/lib/blog.ts`):
1. List entries in `content/blog/`.
2. For each entry:
   - If it's a directory containing `index.mdx`, treat the directory name as the slug.
   - If it's a `.mdx` file (and not inside a folder), treat the filename (sans extension) as the slug.
3. Loose files take precedence over folders with the same slug — but this should never happen; a build-time warning fires if it does.
4. Existing sort by `date` descending is preserved.

### Asset pipeline

A new build script — `scripts/build-blog-assets.ts` — runs as a `prebuild` npm hook (so both `next build` and `next dev` first build trigger it). The script:

1. Walks every directory under `content/blog/`.
2. Mirrors all non-`.mdx` files into `public/_blog-assets/<slug>/...`.
3. For every image found, calls `plaiceholder` to generate a base64 LQIP and writes the result into `public/_blog-assets/<slug>/__blur.json` keyed by filename (e.g. `{"cover.jpg": "data:image/jpeg;base64,...", "diagram.png": "..."}`).
4. Cleans `public/_blog-assets/` first so deleted post folders don't leave stale assets.

`public/_blog-assets/` is gitignored — it's a build artifact.

### Path resolution

MDX files use relative paths (`./diagram.png`) for portability. A remark plugin — `scripts/remark-blog-assets.mjs` — runs during MDX compilation and rewrites every relative image reference to its public URL:

```
./diagram.png  →  /_blog-assets/hello-world/diagram.png
```

It runs against three places:
1. `<img src="./..." />` from native MDX `![]()` syntax.
2. The `src` prop on `<Figure>`, `<FullBleed>` shortcodes.
3. The `images` array prop on `<Gallery>`.

The plugin receives the post slug via MDX compile-time data. Implementation lives next to the build script.

### Shortcode API

All six components live under `src/components/mdx/` and are registered globally on the `mdxComponents` map exported from `src/components/sections/blog-post-view.tsx`. No imports needed inside MDX.

```mdx
<Figure src="./diagram.png" caption="Optional caption text." alt="Diagram of the data flow." />

<FullBleed src="./hero.jpg" alt="Wasatch sunset" />

<Gallery columns={3} images={[
  { src: "./a.jpg", alt: "..." },
  { src: "./b.jpg", alt: "..." },
  { src: "./c.jpg", alt: "..." }
]} />

<PullQuote attribution="Annie Dillard">How we spend our days is how we spend our lives.</PullQuote>

<TwoColumn>
  <div>
    Left column prose. Plain children. Can hold paragraphs, lists, anything.
  </div>
  <Figure src="./photo.jpg" caption="Right column image." />
</TwoColumn>

<Aside>A margin note. Floats right at md+, inline below at mobile.</Aside>
```

**Component contracts:**

| Component | Required props | Optional props | Visual treatment |
|---|---|---|---|
| `Figure` | `src` | `caption`, `alt`, `priority`, `aspectRatio` (default `16/9`) | Image at editorial-shell width, caption below in Inter italic, ink-soft color |
| `FullBleed` | `src` | `alt`, `caption`, `aspectRatio` (default `21/9`) | Edge-to-edge image, optional caption rendered shell-width below |
| `Gallery` | `images` | `columns` (2 or 3, default 2) | Grid with consistent gutter, each cell `aspect-[4/5]` with `object-cover`. Mobile: single column. |
| `PullQuote` | children | `attribution` | Big Playfair italic, decorative em-dash + attribution below, hangs left on desktop via negative margin |
| `TwoColumn` | children (exactly 2) | none | `md:grid-cols-2 gap-8`. Mobile: stacked. |
| `Aside` | children | none | Small Inter type, ink-soft, `md:float-right md:w-1/3 md:ml-6 md:mb-4 border-l border-rule pl-4` |

All shortcodes are TDD'd in `src/components/mdx/<name>.test.tsx`. Tests verify alt-text propagation, prop pass-through, and that blur placeholders attach when the image is in the blur map (mock the blur JSON).

### Cover (C1) treatment

Inside each post folder, the file named `cover.jpg`, `cover.png`, or `cover.webp` (first match wins) is treated as a hero. When present:

1. `src/lib/blog.ts:getPostBySlug` returns an extra field `cover?: { src: string; blurDataURL?: string }`.
2. `BlogPostView` renders a new `<BlogCover post={post} />` component at the top of the post — full-bleed 16:9, post title in Playfair overlaid with gradient scrim, view-transition-name `blog-cover-<slug>`.
3. The blog index also adopts the cover via the existing `<EditorialEntry>` — `cover` prop already exists; we just feed it the resolved blob URL.

When no cover is present, the post starts at the title block (current behavior).

The `<BlogCover>` component is a thin reuse of the layout logic from `<ProjectCover>`; both could later share an `<EditorialCover>` primitive, but that's a follow-up — for v2 we keep them parallel to avoid scope creep.

### Routes

| Route | Status | Behavior |
|---|---|---|
| `/blog` | existing — minor update | Uses cover URLs in entries when available |
| `/blog/<slug>` | existing — meaningful update | `<BlogCover>` if folder has a cover; six MDX shortcodes; series header if `series` set; per-post OG image declared in `generateMetadata` |
| `/blog/tag/<tag>` | **new** | Static-params-generated. Renders `<EditorialPageHeader kicker="Writing" title="#<tag>" sub="…">` plus the editorial entry sequence filtered to posts containing that tag. 404 if no posts use the tag. |
| `/blog/<slug>/og` | **new** | Edge runtime, returns a 1200×630 `ImageResponse`. Visual treatment matches the main `/og` route (cream paper, Playfair name, ink-soft sub) but title is the post title and the kicker is "Writing · <formatted date>". |

### Series support

A new `<SeriesHeader>` component in `src/components/editorial/` renders above the post title when `frontmatter.series` is set:

```
Series · Healthcare PM           Part 2 of 4
← Previous: Healthcare PM ...   Next: ... →
```

Computed at render time by:
1. Filtering `getAllPosts()` to posts with the same `series`.
2. Sorting by `seriesOrder` ascending (fallback to date ascending).
3. Locating the current post's index → renders prev/next labels.

No new data files; pure derivation from frontmatter.

### Blur-up placeholders (D2 extra)

Already covered by the asset pipeline. Every `<Figure>`, `<FullBleed>`, `<Gallery>` item, and the `<BlogCover>` read the `__blur.json` for their post and pass `placeholder="blur" blurDataURL={...}` to `next/image`. If a particular image is missing from the blur map (e.g., an image hosted externally), `placeholder` is omitted — graceful fallback.

A helper `src/lib/blog-assets.ts` exports:
```ts
export function resolveBlogAsset(slug: string, relPath: string): { src: string; blurDataURL?: string };
```
Used by all rendering paths.

## Data flow

```
content/blog/<slug>/index.mdx ─┐
                               ├─► getAllPosts / getPostBySlug ─► page render
content/blog/<slug>/cover.jpg ─┤                                       │
content/blog/<slug>/*.png  ───┐│                                       ▼
                              ▼▼                            <BlogCover/Figure/.../>
              prebuild: build-blog-assets.ts                  + blurDataURL
                              │
                              ▼
public/_blog-assets/<slug>/{*, __blur.json}
```

## Migration plan

The 4 existing posts move into folders. No copy beyond the rename:

```
content/blog/hello-world.mdx                  → content/blog/hello-world/index.mdx
content/blog/lessons-from-building.mdx        → content/blog/lessons-from-building/index.mdx
content/blog/photography-session-guide.mdx    → content/blog/photography-session-guide/index.mdx
content/blog/welcome.mdx                      → content/blog/welcome/index.mdx
```

Covers can be added later — the convention is opt-in. One commit.

## Testing strategy

- **TDD per shortcode** — `src/components/mdx/<name>.test.tsx` for all six. Each test asserts rendering, prop pass-through, alt-text propagation, and blur placeholder attachment when the blur map is present (the map is mockable).
- **`getAllPosts()` test** — folder-based posts and legacy flat MDX both surface in the same list with correct slugs, sorted by date.
- **Tag page test** — `/blog/tag/<tag>` page test asserting `generateStaticParams` returns the union of tags across all posts, that posts are correctly filtered, and that an unknown tag 404s.
- **Cover detection test** — `getPostBySlug` returns `cover` when a `cover.{jpg,png,webp}` file exists in the folder, otherwise the field is absent.
- **Asset pipeline test** — `scripts/build-blog-assets.test.ts` runs the script against a fixture folder, asserts `public/_blog-assets/<fixture>/__blur.json` contains entries for each image.
- **Smoke test** — a fixture post using all six shortcodes renders without crashing in `BlogPostView`.
- **Series header test** — render `<SeriesHeader>` with a fixture of three series-tagged posts and assert prev/next labels and ordering.

## Out of scope (deferred)

- Web upload UI / admin dashboard / WYSIWYG editor.
- Drafts UI (existing `published: false` field is sufficient).
- Comments / reactions.
- Search across posts.
- RSS expansion (existing `/feed.xml` route stays as-is; updates only if blog data shape changes).
- Notion/Tina/Decap CMS integration.

## Definition of done

1. `npm run lint`, `npx tsc --noEmit`, `npm run test -- --run`, `npm run build` all clean (except for the 3 known pre-existing TS errors in `src/app/__tests__/{contact,meet}.test.tsx`).
2. The 4 existing posts have been migrated to folder structure and render identically to before, except they now use editorial-token styling already in place.
3. A test fixture post exists exercising all 6 shortcodes; it renders without runtime errors.
4. `/blog/tag/<tag>` works for at least one tag with multiple posts.
5. Per-post OG image renders correctly at `/blog/<any-slug>/og`.
6. `<BlogCover>` renders only when a cover file is present, with a working view-transition between `/blog` and `/blog/<slug>` (matching the projects pattern).
7. `public/_blog-assets/` is gitignored and rebuilt from source on every build.
8. Documentation lives at `content/blog/AUTHORING.md` — a short guide so the user (future-self) remembers the conventions.
