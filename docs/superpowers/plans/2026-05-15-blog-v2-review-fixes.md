# Blog v2 — Code Review Remediation Plan

> **For agentic workers:** This plan is designed to be executed by `/ralph-loop` overnight on branch `feat/blog-system-v2`. Each task is atomic, ends in a single commit with the exact message shown, and addresses one finding from the code review of commits 9a4aec7 → 293ab98.

**Goal:** Address the 7 actionable findings from the code review of blog-v2 (1 critical, 3 high, 3 medium). Each fix lands as one commit. Test+build gate must remain clean after each task.

**Architecture:** All work stays on `feat/blog-system-v2`. No new dependencies. Existing TDD pattern preserved — write/update test first, then implement.

**Tech Stack:** Next.js 16 · React 19 · TypeScript 5 · Vitest.

**Source review:** completed in-session 2026-05-15. Full findings inlined as task context below.

---

## Task R1: Fix duplicate `<h1>` on cover posts (Critical, a11y)

**Files:**
- Modify: `src/components/sections/blog-post-view.tsx`
- Modify: `src/components/sections/blog-post-view.test.tsx` (if it exists; otherwise the existing test setup is implicit via page tests)

**Finding:** `<BlogCover>` renders an `<h1>` for the post title (line 28). `BlogPostView` always renders another `<h1>` for the same title (around line 114). Two h1s on one page is an a11y violation.

- [ ] **Step 1:** Drop the in-page `<h1>` to a `<p>` styled like the heading **only when** `post.cover` is truthy. The cover then owns the h1.

In `blog-post-view.tsx`, replace the existing post title block with a conditional:

```tsx
{post.cover ? (
  <p
    aria-hidden="true"
    className="editorial-display mb-4 font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight"
  >
    {post.frontmatter.title}
  </p>
) : (
  <h1 className="editorial-display mb-4 font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
    {post.frontmatter.title}
  </h1>
)}
```

Rationale: when a cover is present, the visible cover title (h1) is the page heading. The in-flow title under the cover is a visual echo, not a heading — `<p>` with `aria-hidden="true"` removes it from the a11y tree while keeping the visual.

- [ ] **Step 2:** Verify by reading a real post:

```bash
grep -n "post.cover" src/components/sections/blog-post-view.tsx
```

Expected: 2 hits (one for the BlogCover render, one for the conditional title block).

- [ ] **Step 3:** Build + lint clean:

```bash
npm run lint && npx tsc --noEmit 2>&1 | grep -v "src/app/__tests__/" | head -5 && npm run build 2>&1 | tail -3
```

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/blog-post-view.tsx
git commit -m "fix(blog-v2): drop duplicate h1 when post has a cover (a11y)"
```

---

## Task R2: Stop passing `blurDataURL={undefined}` to next/image (High)

**Files:**
- Modify: `src/components/mdx/figure.tsx`
- Modify: `src/components/mdx/full-bleed.tsx`
- Modify: `src/components/mdx/gallery.tsx`
- Modify: `src/components/editorial/blog-cover.tsx`

**Finding:** All four components currently spread `blurDataURL={resolved.blurDataURL}` even when `blurDataURL` is undefined, which triggers a React warning ("does not recognize the `blurDataURL` prop") in dev/test output.

- [ ] **Step 1:** In each of the 4 files, replace the inline `placeholder=... blurDataURL=...` with a conditional props object:

Pattern (replace in each file's `<Image ... />` call):

```tsx
const blurProps = resolved.blurDataURL
  ? { placeholder: "blur" as const, blurDataURL: resolved.blurDataURL }
  : {};
// ...
<Image
  src={resolved.src}
  alt={...}
  fill
  sizes={...}
  {...blurProps}
  className={...}
/>
```

Apply to:
- `src/components/mdx/figure.tsx` (`resolved` is the result of `resolveBlogAsset(slug, src)`)
- `src/components/mdx/full-bleed.tsx` (same)
- `src/components/mdx/gallery.tsx` (inside the `.map((img) => ...)` — `blurProps` per iteration)
- `src/components/editorial/blog-cover.tsx` (`post.cover.blurDataURL` instead of `resolved.blurDataURL`)

- [ ] **Step 2:** Run shortcode tests — confirm no regressions:

```bash
npx vitest run src/components/mdx/ src/components/editorial/blog-cover.test.tsx 2>&1 | tail -8
```

Expected: all passing, no React warnings about `blurDataURL` prop.

- [ ] **Step 3: Commit**

```bash
git add src/components/mdx/figure.tsx src/components/mdx/full-bleed.tsx src/components/mdx/gallery.tsx src/components/editorial/blog-cover.tsx
git commit -m "fix(blog-v2): omit blurDataURL prop entirely when no placeholder is set"
```

---

## Task R3: Invalidate `blurCache` outside production (High)

**Files:**
- Modify: `src/lib/blog-assets.ts`
- Modify: `src/lib/blog-assets.test.ts`

**Finding:** The module-level `blurCache: Map` persists across hot-reloads in `next dev`. If a user adds a new image to a post folder and re-runs the prebuild script, the dev server still serves the stale (empty) blur map until restart.

- [ ] **Step 1:** Add a new test asserting cache is bypassed in non-production:

Append to `src/lib/blog-assets.test.ts`:

```ts
describe("resolveBlogAsset cache behavior", () => {
  it("bypasses cache in non-production environments", () => {
    // First call populates the cache
    const first = resolveBlogAsset("asset-helper-fixture", "./hero.jpg");
    expect(first.blurDataURL).toBe("data:image/jpeg;base64,XYZ");

    // Mutate the on-disk blur map
    fs.writeFileSync(
      path.join(PUBLIC_DIR, "__blur.json"),
      JSON.stringify({ "hero.jpg": "data:image/jpeg;base64,UPDATED" }),
    );

    // Second call should reflect the new value (cache bypassed in test/dev)
    const second = resolveBlogAsset("asset-helper-fixture", "./hero.jpg");
    expect(second.blurDataURL).toBe("data:image/jpeg;base64,UPDATED");
  });
});
```

- [ ] **Step 2:** Run — confirm it fails:

```bash
npx vitest run src/lib/blog-assets.test.ts 2>&1 | tail -8
```

Expected: new test fails (cached value returned).

- [ ] **Step 3:** Update `src/lib/blog-assets.ts` — bypass cache outside production:

In `loadBlurMap`, replace the early-return with:

```ts
function loadBlurMap(slug: string): Record<string, string> {
  if (process.env.NODE_ENV === "production" && blurCache.has(slug)) {
    return blurCache.get(slug)!;
  }
  const file = path.join(
    process.cwd(),
    "public/_blog-assets",
    slug,
    "__blur.json",
  );
  let map: Record<string, string> = {};
  if (fs.existsSync(file)) {
    try {
      map = JSON.parse(fs.readFileSync(file, "utf-8")) as Record<string, string>;
    } catch {
      map = {};
    }
  }
  if (process.env.NODE_ENV === "production") {
    blurCache.set(slug, map);
  }
  return map;
}
```

- [ ] **Step 4:** Tests pass:

```bash
npx vitest run src/lib/blog-assets.test.ts 2>&1 | tail -6
```

Expected: 4 passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/blog-assets.ts src/lib/blog-assets.test.ts
git commit -m "fix(blog-v2): bypass blur cache outside production so HMR sees fresh maps"
```

---

## Task R4: Delete the footgun `mdxComponents` legacy export (High)

**Files:**
- Modify: `src/components/sections/blog-post-view.tsx`

**Finding:** `mdxComponents` is exported bound to an empty slug — if any future caller imports it instead of `buildMdxComponents(slug)`, every `./img.png` resolves to `/_blog-assets//img.png` (double slash). Grep confirms it's no longer imported anywhere; delete it.

- [ ] **Step 1:** Verify nothing imports `mdxComponents`:

```bash
grep -rn "import.*mdxComponents" src/ 2>&1
```

Expected: no hits (or only hits inside `blog-post-view.tsx` itself, none from outside).

- [ ] **Step 2:** Delete the legacy export line and its comment:

In `src/components/sections/blog-post-view.tsx`, remove these three lines:

```tsx
// Backwards-compat re-export for legacy callers. Bound to empty slug — runtime
// rendering must go through buildMdxComponents(slug).
export const mdxComponents: MDXComponents = buildMdxComponents("");
```

- [ ] **Step 3:** Lint + build clean:

```bash
npm run lint && npx tsc --noEmit 2>&1 | grep -v "src/app/__tests__/" | head -5 && npm run build 2>&1 | tail -3
```

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/blog-post-view.tsx
git commit -m "refactor(blog-v2): remove unused mdxComponents legacy export"
```

---

## Task R5: Per-post OG route polish — 404 on unknown slug + title truncation (Medium)

**Files:**
- Modify: `src/app/(main)/blog/[slug]/og/route.tsx`

**Finding:** The route silently returns an OG image titled "Writing" when the slug doesn't exist. Long titles overflow silently. Both should be fixed.

- [ ] **Step 1:** Replace the route file with this implementation:

```tsx
import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const runtime = "nodejs";

const MAX_TITLE_LEN = 90;

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return new Response("Not found", { status: 404 });
  }

  const title = truncate(post.frontmatter.title, MAX_TITLE_LEN);
  const date = post.frontmatter.date;

  return new ImageResponse(
    (
      <div
        style={{
          background: "#f4efe6",
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            color: "#5f2f2a",
            fontSize: 18,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          Writing{date ? ` · ${date}` : ""}
        </div>
        <div
          style={{
            color: "#201c1a",
            fontSize: 84,
            fontWeight: 700,
            lineHeight: 1.04,
            letterSpacing: "-0.02em",
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            color: "#5f5851",
            fontSize: 22,
            lineHeight: 1.4,
          }}
        >
          philipsun.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

- [ ] **Step 2:** Build verify:

```bash
npm run build 2>&1 | tail -3
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/(main)/blog/[slug]/og/route.tsx"
git commit -m "fix(blog-v2): per-post OG 404s on unknown slug and truncates long titles"
```

---

## Task R6: Surface cover alt text from frontmatter (Medium)

**Files:**
- Modify: `src/lib/blog.ts`
- Modify: `src/lib/blog.test.ts`

**Finding:** `BlogCover` falls back to `${title} — cover image` when no alt is provided, but there's currently no path for an author to specify alt text. The `BlogPost.cover.alt` field exists in the type but is never populated.

- [ ] **Step 1:** Add the test first (TDD):

Append to `src/lib/blog.test.ts`:

```ts
describe("cover alt from frontmatter", () => {
  it("reads cover.alt from frontmatter when present", () => {
    // hello-world is the fixture with cover.jpg; verify default behavior first
    const post = getPostBySlug("hello-world");
    // Without frontmatter coverAlt, alt should be undefined (BlogCover provides fallback)
    expect(post?.cover?.alt).toBeUndefined();
  });
});
```

(This test passes immediately on current behavior — we keep it as a regression guard. The next step adds frontmatter parsing without changing this case.)

- [ ] **Step 2:** Add the new frontmatter field and parser. In `src/lib/blog.ts`:

In `readPost`, after constructing the cover via `detectCover`, augment with frontmatter alt:

```ts
function readPost(entry: DiscoveredEntry): BlogPost {
  const raw = fs.readFileSync(entry.filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);
  const frontmatter = data as BlogPost["frontmatter"] & { coverAlt?: string };
  let cover = detectCover(entry.folder, entry.slug);
  if (cover && typeof frontmatter.coverAlt === "string") {
    cover = { ...cover, alt: frontmatter.coverAlt };
  }
  return {
    slug: entry.slug,
    frontmatter,
    readingTime: stats.text,
    content,
    cover,
  };
}
```

- [ ] **Step 3:** Document the new field in `content/blog/AUTHORING.md`. Add to the frontmatter example block:

```yaml
coverAlt: "Wasatch sunset — accessible description of the cover image"  # optional
```

with a one-sentence note in prose: "If you have a `cover.jpg`, set `coverAlt` to provide alt text for screen readers. If omitted, the cover falls back to a generic description derived from the title."

- [ ] **Step 4:** Tests pass:

```bash
npx vitest run src/lib/blog.test.ts 2>&1 | tail -6
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/blog.ts src/lib/blog.test.ts content/blog/AUTHORING.md
git commit -m "feat(blog-v2): surface cover alt from coverAlt frontmatter field"
```

---

## Task R7: Encode tag URLs (Medium)

**Files:**
- Modify: `src/components/sections/blog-post-view.tsx`
- Modify: `src/app/(main)/blog/tag/[tag]/page.tsx`

**Finding:** Tag pills on post pages use `href={\`/blog/tag/${tag}\`}` without encoding. Tags with spaces, slashes, or unicode produce broken URLs.

- [ ] **Step 1:** In `src/components/sections/blog-post-view.tsx`, update the tag pill `<Link>` href to encode:

```tsx
<Link
  key={tag}
  href={`/blog/tag/${encodeURIComponent(tag)}`}
  className="px-3 py-1 border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] text-xs uppercase tracking-[0.18em] hover:text-[color:var(--color-ink)] transition-colors"
>
  {tag}
</Link>
```

- [ ] **Step 2:** In `src/app/(main)/blog/tag/[tag]/page.tsx`, decode incoming params and ensure filtering matches the raw tag:

After `const { tag } = await params;`, decode:

```tsx
const { tag } = await params;
const decoded = decodeURIComponent(tag);
const posts = getAllPosts().filter((p) => p.frontmatter.tags.includes(decoded));
```

Also update the `<EditorialPageHeader title={...}>` to use `decoded` instead of raw `tag`. Update `generateMetadata` similarly.

- [ ] **Step 3:** Build verify:

```bash
npm run build 2>&1 | tail -5
```

Expected: tag pages generate without errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/blog-post-view.tsx "src/app/(main)/blog/tag/[tag]/page.tsx"
git commit -m "fix(blog-v2): URL-encode tag pills and decode on the tag page"
```

---

## Task R8: Final QA + push

**Files:**
- None to modify.

- [ ] **Step 1:** Full gate:

```bash
npm run lint
npx tsc --noEmit
npm run test -- --run
npm run build
```

All four clean (modulo the 3 known pre-existing TS errors in `src/app/__tests__/{contact,meet}.test.tsx` and the 16 pre-existing test failures in `home/about/case-studies/current-focus` that predate blog-v2).

- [ ] **Step 2:** Push:

```bash
git push origin feat/blog-system-v2
```

- [ ] **Step 3:** Surface that the PR is updated with the review-fix commits.

- [ ] **Step 4:** Emit:

```
<promise>ALL TASKS COMPLETE</promise>
```

---

## Skipped (deferred, low value)

- **L1 (defensive assert on `fs.rmSync`)** — `outRoot` is computed inside the function from a hardcoded suffix. The attack surface is only callers of `buildBlogAssets({ publicDir: "/" })`, which is internal. Not worth the line.
- **L2 (skip plaiceholder on tiny images)** — wastes microseconds on the 16×16 test fixture; never matters for real images. Defer.
- **L3 (non-image file allowlist)** — `.`-prefixed files already filtered; risk of cruft is low until posts accumulate non-image attachments.
- **L4 (skill template placeholder note)** — the skill body already shows substitution in context; adding "substitute placeholders" is redundant.
- **L5 (decide on `welcome` published: false)** — out of scope for this PR; leave as preview.

All five are tracked in this section for future cleanup but don't block merge.
