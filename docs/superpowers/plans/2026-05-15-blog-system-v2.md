# Blog System v2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. This plan is designed to be run end-to-end by `/ralph-loop` overnight — each task is atomic and ends in a single commit with the literal commit message shown.

**Goal:** Reshape the blog from a flat MDX directory into a magazine-quality, folder-based authoring system: per-post folders with co-located images, six editorial MDX shortcodes, auto blur-up placeholders, conventional cover heroes, tag pages, series support, per-post OG cards, and a project-scoped `write-blog-post` skill that drafts engaging posts via a `/storyteller-writing-assistant` handoff.

**Architecture:** Files in git, no DB, no admin UI. Per-post folders (`content/blog/<slug>/index.mdx` + co-located assets) discovered by an extended `getAllPosts()`. A `prebuild` npm hook mirrors images into `public/_blog-assets/<slug>/` and emits a per-post `__blur.json` LQIP map via `plaiceholder`. A remark plugin rewrites `./` paths in MDX at compile time. Six new shortcodes live under `src/components/mdx/`. New routes: `/blog/tag/[tag]` and `/blog/[slug]/og`. New components: `<BlogCover>` and `<SeriesHeader>`. New skill: `.claude/skills/write-blog-post/SKILL.md`.

**Tech Stack:** Next.js 16 App Router · React 19 · TypeScript 5 · Tailwind 4 · MDX via `next-mdx-remote/rsc` · `gray-matter` · `plaiceholder` (new) · Vitest + React Testing Library · Framer Motion (existing).

**Source spec:** `docs/superpowers/specs/2026-05-15-blog-system-v2-design.md`.

**Sequence:** branch + deps → types → migrate posts → discovery + cover detection → asset pipeline → asset helper → remark plugin → six shortcodes → mdx wiring → cover component → cover wiring → series header → series wiring → tag pages → per-post OG → authoring doc → write-blog-post skill → final QA + PR.

---

## Task 1: Create branch, gitignore artifacts, install plaiceholder

**Files:**
- Modify: `.gitignore`
- Modify: `package.json` (deps)

- [ ] **Step 1: Create the feature branch from main**

```bash
git checkout main
git pull --ff-only origin main 2>/dev/null || true
git checkout -b feat/blog-system-v2
```

- [ ] **Step 2: Add the build-artifact path to `.gitignore`**

Append to `.gitignore`:

```
# blog system v2 build artifact (regenerated via prebuild hook)
/public/_blog-assets/
```

- [ ] **Step 3: Install `plaiceholder` + its sharp peer**

```bash
npm install --save plaiceholder@^3.0.0 sharp@^0.33.5
```

Verify the dependency block in `package.json` now includes both. If `sharp` is already present at the same major, no change to that line.

- [ ] **Step 4: Verify nothing is broken**

```bash
npm run lint && npx tsc --noEmit && npm run build
```

Expected: lint clean, tsc passes (modulo the 3 known pre-existing errors in `src/app/__tests__/{contact,meet}.test.tsx`), build succeeds.

- [ ] **Step 5: Commit**

```bash
git add .gitignore package.json package-lock.json
git commit -m "chore(blog-v2): branch setup, gitignore build artifacts, add plaiceholder"
```

---

## Task 2: Extend `BlogPostFrontmatter` and `BlogPost` types

**Files:**
- Modify: `src/types/blog.ts`

- [ ] **Step 1: Add `series`, `seriesOrder`, and `cover` fields to the types**

Replace the contents of `src/types/blog.ts` with:

```ts
export interface BlogPostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  published: boolean;
  featured?: boolean;
  series?: string;
  seriesOrder?: number;
  faq?: Array<{ question: string; answer: string }>;
  howTo?: {
    name: string;
    description: string;
    steps: string[];
  };
}

export interface BlogCover {
  src: string;
  blurDataURL?: string;
  alt?: string;
}

export interface BlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  readingTime: string;
  content: string;
  cover?: BlogCover;
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add src/types/blog.ts
git commit -m "feat(blog-v2): extend BlogPost types with cover, series, seriesOrder"
```

---

## Task 3: Migrate the 4 existing posts into per-post folders

**Files:**
- Move (`git mv`): `content/blog/hello-world.mdx`, `lessons-from-building.mdx`, `photography-session-guide.mdx`, `welcome.mdx`

- [ ] **Step 1: Move each post into its own folder**

```bash
cd "$(git rev-parse --show-toplevel)"
for slug in hello-world lessons-from-building photography-session-guide welcome; do
  mkdir -p "content/blog/${slug}"
  git mv "content/blog/${slug}.mdx" "content/blog/${slug}/index.mdx"
done
```

Verify:

```bash
ls -1 content/blog/
```

Expected output:

```
hello-world
lessons-from-building
photography-session-guide
welcome
```

(All four are directories now.)

- [ ] **Step 2: Build still passes (folder discovery isn't wired yet — this verifies that until then nothing surfaces, which is intentional; we wire discovery in Task 4)**

This step intentionally allows `/blog` to be temporarily empty after this move. Do NOT continue to other tasks until Task 4 lands. Run build only to confirm the move itself didn't break compilation:

```bash
npm run build
```

Expected: build completes. The blog index may render empty — that's expected; Task 4 fixes it.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(blog-v2): migrate existing posts to per-post folder layout"
```

---

## Task 4: Extend `getAllPosts()` to discover folder-based posts (TDD)

**Files:**
- Modify: `src/lib/blog.ts`
- Create: `src/lib/blog.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/blog.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getAllPosts, getPostBySlug } from "./blog";

describe("blog discovery", () => {
  it("surfaces the four migrated folder-based posts", () => {
    const posts = getAllPosts();
    const slugs = posts.map((p) => p.slug);
    expect(slugs).toContain("hello-world");
    expect(slugs).toContain("lessons-from-building");
    expect(slugs).toContain("photography-session-guide");
    expect(slugs).toContain("welcome");
  });

  it("getPostBySlug returns a folder post", () => {
    const post = getPostBySlug("hello-world");
    expect(post).not.toBeNull();
    expect(post?.frontmatter.title).toMatch(/Hello World/i);
  });

  it("posts are sorted by date descending", () => {
    const posts = getAllPosts();
    for (let i = 0; i < posts.length - 1; i++) {
      const a = new Date(posts[i].frontmatter.date).getTime();
      const b = new Date(posts[i + 1].frontmatter.date).getTime();
      expect(a).toBeGreaterThanOrEqual(b);
    }
  });
});
```

- [ ] **Step 2: Confirm test fails**

```bash
npx vitest run src/lib/blog.test.ts
```

Expected: fails (`getAllPosts()` returns `[]` because the directory now contains folders, not `.mdx` files).

- [ ] **Step 3: Rewrite `src/lib/blog.ts` to discover both folder + legacy layouts**

Replace the file with:

```ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import type { BlogPost } from "@/types/blog";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

interface DiscoveredEntry {
  slug: string;
  filePath: string;
  folder?: string;
}

function discoverEntries(): DiscoveredEntry[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const entries = fs.readdirSync(BLOG_DIR, { withFileTypes: true });
  const found: DiscoveredEntry[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    if (entry.isDirectory()) {
      const indexPath = path.join(BLOG_DIR, entry.name, "index.mdx");
      if (fs.existsSync(indexPath)) {
        found.push({ slug: entry.name, filePath: indexPath, folder: path.join(BLOG_DIR, entry.name) });
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      const slug = entry.name.replace(/\.mdx$/, "");
      // Loose file: only include if no folder of the same slug also exists.
      const folderExists = entries.some((e) => e.isDirectory() && e.name === slug);
      if (!folderExists) {
        found.push({ slug, filePath: path.join(BLOG_DIR, entry.name) });
      } else if (process.env.NODE_ENV !== "test") {
        console.warn(`[blog] legacy ${entry.name} shadowed by folder ${slug}/; using folder.`);
      }
    }
  }

  return found;
}

function detectCover(folder: string | undefined, slug: string): BlogPost["cover"] {
  if (!folder) return undefined;
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const local = path.join(folder, `cover.${ext}`);
    if (fs.existsSync(local)) {
      return { src: `/_blog-assets/${slug}/cover.${ext}` };
    }
  }
  return undefined;
}

function readPost(entry: DiscoveredEntry): BlogPost {
  const raw = fs.readFileSync(entry.filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);
  return {
    slug: entry.slug,
    frontmatter: data as BlogPost["frontmatter"],
    readingTime: stats.text,
    content,
    cover: detectCover(entry.folder, entry.slug),
  };
}

export function getAllPosts(): BlogPost[] {
  return discoverEntries()
    .map(readPost)
    .filter((p) => p.frontmatter.published)
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime(),
    );
}

export function getPostBySlug(slug: string): BlogPost | null {
  const entries = discoverEntries();
  const entry = entries.find((e) => e.slug === slug);
  if (!entry) return null;
  return readPost(entry);
}
```

- [ ] **Step 4: Tests pass**

```bash
npx vitest run src/lib/blog.test.ts
```

Expected: 3 passing.

- [ ] **Step 5: Build + render verification**

```bash
npm run build
```

Expected: build succeeds, all 4 blog post routes generate.

- [ ] **Step 6: Commit**

```bash
git add src/lib/blog.ts src/lib/blog.test.ts
git commit -m "feat(blog-v2): discover folder-based posts in getAllPosts, detect covers"
```

---

## Task 5: Cover detection test extension (TDD)

**Files:**
- Modify: `src/lib/blog.test.ts`
- Create: `content/blog/hello-world/cover.jpg` (test fixture — see step 1)

- [ ] **Step 1: Add a tiny fixture cover so the detection branch is exercised**

Generate a 4×4 JPEG so the test asserts on real disk state:

```bash
# Use Node to write a minimal valid JPEG via sharp
node -e "require('sharp')({create:{width:4,height:4,channels:3,background:{r:200,g:160,b:120}}}).jpeg().toFile('content/blog/hello-world/cover.jpg').then(()=>console.log('ok'))"
```

Verify the file exists:

```bash
file content/blog/hello-world/cover.jpg
```

Expected: identifies as JPEG.

- [ ] **Step 2: Add the cover-detection test**

Append to `src/lib/blog.test.ts`:

```ts
describe("cover detection", () => {
  it("getPostBySlug returns cover.src when a cover.jpg is present", () => {
    const post = getPostBySlug("hello-world");
    expect(post?.cover?.src).toBe("/_blog-assets/hello-world/cover.jpg");
  });

  it("getPostBySlug omits cover when no cover file exists", () => {
    const post = getPostBySlug("welcome");
    expect(post?.cover).toBeUndefined();
  });
});
```

- [ ] **Step 3: Tests pass**

```bash
npx vitest run src/lib/blog.test.ts
```

Expected: 5 passing.

- [ ] **Step 4: Commit**

```bash
git add src/lib/blog.test.ts content/blog/hello-world/cover.jpg
git commit -m "test(blog-v2): cover detection fixture and assertions"
```

---

## Task 6: Asset pipeline build script (TDD)

**Files:**
- Create: `scripts/build-blog-assets.ts`
- Create: `scripts/build-blog-assets.test.ts`
- Modify: `package.json` (add `prebuild` hook)

- [ ] **Step 1: Failing test**

Create `scripts/build-blog-assets.test.ts`:

```ts
import fs from "fs";
import path from "path";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { buildBlogAssets } from "./build-blog-assets";

const FIXTURE_ROOT = path.join(process.cwd(), "tmp-asset-fixture");
const FIXTURE_BLOG = path.join(FIXTURE_ROOT, "content/blog");
const FIXTURE_PUBLIC = path.join(FIXTURE_ROOT, "public");

beforeAll(async () => {
  fs.rmSync(FIXTURE_ROOT, { recursive: true, force: true });
  fs.mkdirSync(path.join(FIXTURE_BLOG, "pipeline-test"), { recursive: true });
  fs.writeFileSync(
    path.join(FIXTURE_BLOG, "pipeline-test/index.mdx"),
    "---\ntitle: t\ndate: 2026-01-01\nexcerpt: e\ntags: []\npublished: true\n---\nhi",
  );
  const sharp = (await import("sharp")).default;
  await sharp({ create: { width: 16, height: 16, channels: 3, background: { r: 1, g: 2, b: 3 } } })
    .jpeg()
    .toFile(path.join(FIXTURE_BLOG, "pipeline-test/cover.jpg"));
});

afterAll(() => {
  fs.rmSync(FIXTURE_ROOT, { recursive: true, force: true });
});

describe("buildBlogAssets", () => {
  it("mirrors images into public and emits __blur.json", async () => {
    await buildBlogAssets({ blogDir: FIXTURE_BLOG, publicDir: FIXTURE_PUBLIC });

    const mirrored = path.join(FIXTURE_PUBLIC, "_blog-assets/pipeline-test/cover.jpg");
    expect(fs.existsSync(mirrored)).toBe(true);

    const blurPath = path.join(FIXTURE_PUBLIC, "_blog-assets/pipeline-test/__blur.json");
    expect(fs.existsSync(blurPath)).toBe(true);

    const blur = JSON.parse(fs.readFileSync(blurPath, "utf-8")) as Record<string, string>;
    expect(blur["cover.jpg"]).toMatch(/^data:image\/(jpeg|png);base64,/);
  });

  it("removes stale assets when called twice with the fixture unchanged", async () => {
    fs.writeFileSync(path.join(FIXTURE_PUBLIC, "_blog-assets/pipeline-test/stale.txt"), "stale");
    await buildBlogAssets({ blogDir: FIXTURE_BLOG, publicDir: FIXTURE_PUBLIC });
    expect(fs.existsSync(path.join(FIXTURE_PUBLIC, "_blog-assets/pipeline-test/stale.txt"))).toBe(false);
  });
});
```

- [ ] **Step 2: Confirm fail**

```bash
npx vitest run scripts/build-blog-assets.test.ts
```

Expected: fails (module not found).

- [ ] **Step 3: Implement the script**

Create `scripts/build-blog-assets.ts`:

```ts
import fs from "fs";
import path from "path";
import { getPlaiceholder } from "plaiceholder";

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

interface Options {
  blogDir?: string;
  publicDir?: string;
}

export async function buildBlogAssets(opts: Options = {}): Promise<void> {
  const blogDir = opts.blogDir ?? path.join(process.cwd(), "content/blog");
  const publicDir = opts.publicDir ?? path.join(process.cwd(), "public");
  const outRoot = path.join(publicDir, "_blog-assets");

  fs.rmSync(outRoot, { recursive: true, force: true });

  if (!fs.existsSync(blogDir)) return;

  const entries = fs.readdirSync(blogDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) continue;

    const postDir = path.join(blogDir, entry.name);
    const outDir = path.join(outRoot, entry.name);
    fs.mkdirSync(outDir, { recursive: true });

    const files = fs.readdirSync(postDir, { withFileTypes: true });
    const blurMap: Record<string, string> = {};

    for (const file of files) {
      if (!file.isFile()) continue;
      if (file.name === "index.mdx") continue;
      if (file.name === "COVER_NOTES.md") continue;
      if (file.name.startsWith(".")) continue;

      const src = path.join(postDir, file.name);
      const dest = path.join(outDir, file.name);
      fs.copyFileSync(src, dest);

      const ext = path.extname(file.name).toLowerCase();
      if (IMAGE_EXT.has(ext)) {
        try {
          const buffer = fs.readFileSync(src);
          const { base64 } = await getPlaiceholder(buffer);
          blurMap[file.name] = base64;
        } catch (err) {
          console.warn(`[blog-assets] could not compute blur for ${entry.name}/${file.name}:`, err);
        }
      }
    }

    fs.writeFileSync(path.join(outDir, "__blur.json"), JSON.stringify(blurMap, null, 2));
  }
}

// CLI entry: `node --loader tsx scripts/build-blog-assets.ts` or via tsx in package.json.
if (process.argv[1] && process.argv[1].endsWith("build-blog-assets.ts")) {
  buildBlogAssets()
    .then(() => console.log("[blog-assets] done"))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
```

- [ ] **Step 4: Add `prebuild` npm hook**

Edit `package.json` `scripts`:

```json
"prebuild": "tsx scripts/build-blog-assets.ts",
```

Install `tsx` as a devDep (it's commonly already present; verify):

```bash
npm install --save-dev tsx@^4.19.0
```

- [ ] **Step 5: Tests pass**

```bash
npx vitest run scripts/build-blog-assets.test.ts
```

Expected: 2 passing.

- [ ] **Step 6: Build dry run**

```bash
npm run build
```

Expected: `prebuild` runs, `public/_blog-assets/` is created (gitignored), build succeeds.

- [ ] **Step 7: Commit**

```bash
git add scripts/build-blog-assets.ts scripts/build-blog-assets.test.ts package.json package-lock.json
git commit -m "feat(blog-v2): prebuild script mirrors images and emits LQIP blur map"
```

---

## Task 7: `resolveBlogAsset` helper (TDD)

**Files:**
- Create: `src/lib/blog-assets.ts`
- Create: `src/lib/blog-assets.test.ts`

- [ ] **Step 1: Failing test**

Create `src/lib/blog-assets.test.ts`:

```ts
import fs from "fs";
import path from "path";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { resolveBlogAsset } from "./blog-assets";

const PUBLIC_DIR = path.join(process.cwd(), "public/_blog-assets/asset-helper-fixture");
beforeAll(() => {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(PUBLIC_DIR, "__blur.json"),
    JSON.stringify({ "hero.jpg": "data:image/jpeg;base64,XYZ" }),
  );
});
afterAll(() => {
  fs.rmSync(path.dirname(PUBLIC_DIR), { recursive: true, force: true });
});

describe("resolveBlogAsset", () => {
  it("rewrites './hero.jpg' to a public URL and attaches blurDataURL", () => {
    const out = resolveBlogAsset("asset-helper-fixture", "./hero.jpg");
    expect(out.src).toBe("/_blog-assets/asset-helper-fixture/hero.jpg");
    expect(out.blurDataURL).toBe("data:image/jpeg;base64,XYZ");
  });

  it("passes through an absolute URL unchanged and omits blur", () => {
    const out = resolveBlogAsset("asset-helper-fixture", "https://example.com/x.jpg");
    expect(out.src).toBe("https://example.com/x.jpg");
    expect(out.blurDataURL).toBeUndefined();
  });

  it("omits blur when the file is not in the blur map", () => {
    const out = resolveBlogAsset("asset-helper-fixture", "./missing.jpg");
    expect(out.src).toBe("/_blog-assets/asset-helper-fixture/missing.jpg");
    expect(out.blurDataURL).toBeUndefined();
  });
});
```

- [ ] **Step 2: Confirm fail**

```bash
npx vitest run src/lib/blog-assets.test.ts
```

Expected: fails.

- [ ] **Step 3: Implement**

Create `src/lib/blog-assets.ts`:

```ts
import fs from "fs";
import path from "path";

interface Resolved {
  src: string;
  blurDataURL?: string;
}

const blurCache = new Map<string, Record<string, string>>();

function loadBlurMap(slug: string): Record<string, string> {
  if (blurCache.has(slug)) return blurCache.get(slug)!;
  const file = path.join(process.cwd(), "public/_blog-assets", slug, "__blur.json");
  let map: Record<string, string> = {};
  if (fs.existsSync(file)) {
    try {
      map = JSON.parse(fs.readFileSync(file, "utf-8")) as Record<string, string>;
    } catch {
      map = {};
    }
  }
  blurCache.set(slug, map);
  return map;
}

export function resolveBlogAsset(slug: string, relPath: string): Resolved {
  if (/^https?:\/\//.test(relPath) || relPath.startsWith("/")) {
    return { src: relPath };
  }
  const cleaned = relPath.replace(/^\.\//, "");
  const src = `/_blog-assets/${slug}/${cleaned}`;
  const blur = loadBlurMap(slug);
  return { src, blurDataURL: blur[cleaned] };
}
```

- [ ] **Step 4: Pass**

```bash
npx vitest run src/lib/blog-assets.test.ts
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/lib/blog-assets.ts src/lib/blog-assets.test.ts
git commit -m "feat(blog-v2): resolveBlogAsset helper resolves relative paths and attaches LQIP"
```

---

## Task 8: `<Figure>` shortcode (TDD)

**Files:**
- Create: `src/components/mdx/figure.tsx`
- Create: `src/components/mdx/figure.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// src/components/mdx/figure.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Figure } from "./figure";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...(props as { src: string; alt: string })} />;
  },
}));

vi.mock("@/lib/blog-assets", () => ({
  resolveBlogAsset: (slug: string, rel: string) => ({
    src: `/_blog-assets/${slug}/${rel.replace(/^\.\//, "")}`,
    blurDataURL: rel === "./has-blur.jpg" ? "data:image/jpeg;base64,XYZ" : undefined,
  }),
}));

describe("Figure", () => {
  it("renders the image with alt text and shell-width caption", () => {
    render(<Figure slug="post" src="./photo.jpg" alt="A photo" caption="Caption text" />);
    expect(screen.getByAltText("A photo")).toBeInTheDocument();
    expect(screen.getByText("Caption text")).toBeInTheDocument();
  });

  it("uses an empty alt when caption is provided without alt (decorative)", () => {
    render(<Figure slug="post" src="./photo.jpg" caption="Just a caption" />);
    const img = screen.getByRole("img", { hidden: true });
    expect(img.getAttribute("alt")).toBe("");
  });

  it("forwards blurDataURL when the resolver returns one", () => {
    const { container } = render(<Figure slug="post" src="./has-blur.jpg" alt="x" />);
    const img = container.querySelector("img");
    expect(img?.getAttribute("placeholder")).toBe("blur");
  });
});
```

- [ ] **Step 2: Fail**

```bash
npx vitest run src/components/mdx/figure.test.tsx
```

- [ ] **Step 3: Implement**

```tsx
// src/components/mdx/figure.tsx
import Image from "next/image";
import { resolveBlogAsset } from "@/lib/blog-assets";

interface FigureProps {
  slug: string;
  src: string;
  alt?: string;
  caption?: string;
  priority?: boolean;
  aspectRatio?: string;
}

export function Figure({ slug, src, alt, caption, priority, aspectRatio = "16/9" }: FigureProps) {
  const resolved = resolveBlogAsset(slug, src);
  const effectiveAlt = alt ?? (caption ? "" : "");

  return (
    <figure className="my-10">
      <div
        className="relative w-full overflow-hidden border border-[color:var(--color-rule)]"
        style={{ aspectRatio }}
      >
        <Image
          src={resolved.src}
          alt={effectiveAlt}
          fill
          sizes="(max-width: 768px) 100vw, 720px"
          priority={priority}
          placeholder={resolved.blurDataURL ? "blur" : undefined}
          blurDataURL={resolved.blurDataURL}
          className="object-cover"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm leading-6 italic text-[color:var(--color-ink-soft)]">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
```

- [ ] **Step 4: Pass**

```bash
npx vitest run src/components/mdx/figure.test.tsx
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/figure.tsx src/components/mdx/figure.test.tsx
git commit -m "feat(mdx): <Figure> shortcode with caption and blur placeholder"
```

---

## Task 9: `<FullBleed>` shortcode (TDD)

**Files:**
- Create: `src/components/mdx/full-bleed.tsx`
- Create: `src/components/mdx/full-bleed.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// src/components/mdx/full-bleed.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FullBleed } from "./full-bleed";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...(props as { src: string; alt: string })} />
  ),
}));

vi.mock("@/lib/blog-assets", () => ({
  resolveBlogAsset: (slug: string, rel: string) => ({
    src: `/_blog-assets/${slug}/${rel.replace(/^\.\//, "")}`,
  }),
}));

describe("FullBleed", () => {
  it("renders an edge-to-edge image with alt text", () => {
    render(<FullBleed slug="post" src="./hero.jpg" alt="Hero photo" />);
    expect(screen.getByAltText("Hero photo")).toBeInTheDocument();
  });

  it("renders an optional caption below at shell width", () => {
    render(<FullBleed slug="post" src="./hero.jpg" alt="x" caption="A view from above." />);
    expect(screen.getByText("A view from above.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Fail**

```bash
npx vitest run src/components/mdx/full-bleed.test.tsx
```

- [ ] **Step 3: Implement**

```tsx
// src/components/mdx/full-bleed.tsx
import Image from "next/image";
import { resolveBlogAsset } from "@/lib/blog-assets";

interface FullBleedProps {
  slug: string;
  src: string;
  alt?: string;
  caption?: string;
  aspectRatio?: string;
}

export function FullBleed({ slug, src, alt = "", caption, aspectRatio = "21/9" }: FullBleedProps) {
  const resolved = resolveBlogAsset(slug, src);
  return (
    <div className="my-14 not-prose">
      <div
        className="relative w-screen left-1/2 -translate-x-1/2 overflow-hidden"
        style={{ aspectRatio }}
      >
        <Image
          src={resolved.src}
          alt={alt}
          fill
          sizes="100vw"
          placeholder={resolved.blurDataURL ? "blur" : undefined}
          blurDataURL={resolved.blurDataURL}
          className="object-cover"
        />
      </div>
      {caption && (
        <p className="editorial-shell mt-3 text-sm leading-6 italic text-[color:var(--color-ink-soft)]">
          {caption}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Pass**

```bash
npx vitest run src/components/mdx/full-bleed.test.tsx
```

Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/full-bleed.tsx src/components/mdx/full-bleed.test.tsx
git commit -m "feat(mdx): <FullBleed> shortcode with edge-to-edge image and caption"
```

---

## Task 10: `<Gallery>` shortcode (TDD)

**Files:**
- Create: `src/components/mdx/gallery.tsx`
- Create: `src/components/mdx/gallery.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// src/components/mdx/gallery.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Gallery } from "./gallery";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...(props as { src: string; alt: string })} />
  ),
}));

vi.mock("@/lib/blog-assets", () => ({
  resolveBlogAsset: (slug: string, rel: string) => ({
    src: `/_blog-assets/${slug}/${rel.replace(/^\.\//, "")}`,
  }),
}));

describe("Gallery", () => {
  it("renders one img per image entry with its alt", () => {
    render(
      <Gallery
        slug="p"
        images={[
          { src: "./a.jpg", alt: "Photo A" },
          { src: "./b.jpg", alt: "Photo B" },
          { src: "./c.jpg", alt: "Photo C" },
        ]}
      />,
    );
    expect(screen.getByAltText("Photo A")).toBeInTheDocument();
    expect(screen.getByAltText("Photo B")).toBeInTheDocument();
    expect(screen.getByAltText("Photo C")).toBeInTheDocument();
  });

  it("uses 3-column grid when columns=3", () => {
    const { container } = render(
      <Gallery slug="p" columns={3} images={[{ src: "./a.jpg", alt: "A" }]} />,
    );
    expect(container.querySelector(".md\\:grid-cols-3")).not.toBeNull();
  });

  it("defaults to 2 columns", () => {
    const { container } = render(<Gallery slug="p" images={[{ src: "./a.jpg", alt: "A" }]} />);
    expect(container.querySelector(".md\\:grid-cols-2")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Fail**

```bash
npx vitest run src/components/mdx/gallery.test.tsx
```

- [ ] **Step 3: Implement**

```tsx
// src/components/mdx/gallery.tsx
import Image from "next/image";
import { resolveBlogAsset } from "@/lib/blog-assets";

interface GalleryImage {
  src: string;
  alt: string;
}

interface GalleryProps {
  slug: string;
  images: GalleryImage[];
  columns?: 2 | 3;
}

export function Gallery({ slug, images, columns = 2 }: GalleryProps) {
  const gridCols = columns === 3 ? "md:grid-cols-3" : "md:grid-cols-2";

  return (
    <div className={`my-10 grid grid-cols-1 gap-4 ${gridCols}`}>
      {images.map((img, i) => {
        const resolved = resolveBlogAsset(slug, img.src);
        return (
          <div key={i} className="relative aspect-[4/5] overflow-hidden border border-[color:var(--color-rule)]">
            <Image
              src={resolved.src}
              alt={img.alt}
              fill
              sizes={`(max-width: 768px) 100vw, ${100 / columns}vw`}
              placeholder={resolved.blurDataURL ? "blur" : undefined}
              blurDataURL={resolved.blurDataURL}
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Pass**

```bash
npx vitest run src/components/mdx/gallery.test.tsx
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/gallery.tsx src/components/mdx/gallery.test.tsx
git commit -m "feat(mdx): <Gallery> shortcode with 2 or 3 column grid"
```

---

## Task 11: `<PullQuote>` shortcode (TDD)

**Files:**
- Create: `src/components/mdx/pull-quote.tsx`
- Create: `src/components/mdx/pull-quote.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// src/components/mdx/pull-quote.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PullQuote } from "./pull-quote";

describe("PullQuote", () => {
  it("renders the quote children", () => {
    render(<PullQuote>The point of writing is to discover what you think.</PullQuote>);
    expect(
      screen.getByText(/The point of writing is to discover what you think/),
    ).toBeInTheDocument();
  });

  it("renders attribution when provided", () => {
    render(<PullQuote attribution="Annie Dillard">A line.</PullQuote>);
    expect(screen.getByText(/Annie Dillard/)).toBeInTheDocument();
  });

  it("omits attribution when not provided", () => {
    const { container } = render(<PullQuote>A line.</PullQuote>);
    expect(container.querySelector("[data-attribution]")).toBeNull();
  });
});
```

- [ ] **Step 2: Fail**

```bash
npx vitest run src/components/mdx/pull-quote.test.tsx
```

- [ ] **Step 3: Implement**

```tsx
// src/components/mdx/pull-quote.tsx
import type { ReactNode } from "react";

interface PullQuoteProps {
  children: ReactNode;
  attribution?: string;
}

export function PullQuote({ children, attribution }: PullQuoteProps) {
  return (
    <blockquote className="my-12 md:-ml-12 max-w-2xl">
      <p className="editorial-display font-[family-name:var(--font-playfair)] text-3xl italic leading-[1.2] text-[color:var(--color-ink)] md:text-4xl">
        {children}
      </p>
      {attribution && (
        <footer
          data-attribution
          className="mt-3 text-sm uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]"
        >
          — {attribution}
        </footer>
      )}
    </blockquote>
  );
}
```

- [ ] **Step 4: Pass**

```bash
npx vitest run src/components/mdx/pull-quote.test.tsx
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/pull-quote.tsx src/components/mdx/pull-quote.test.tsx
git commit -m "feat(mdx): <PullQuote> shortcode with optional attribution"
```

---

## Task 12: `<TwoColumn>` shortcode (TDD)

**Files:**
- Create: `src/components/mdx/two-column.tsx`
- Create: `src/components/mdx/two-column.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// src/components/mdx/two-column.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TwoColumn } from "./two-column";

describe("TwoColumn", () => {
  it("renders both children", () => {
    render(
      <TwoColumn>
        <div>Left side</div>
        <div>Right side</div>
      </TwoColumn>,
    );
    expect(screen.getByText("Left side")).toBeInTheDocument();
    expect(screen.getByText("Right side")).toBeInTheDocument();
  });

  it("uses md:grid-cols-2 wrapper", () => {
    const { container } = render(
      <TwoColumn>
        <div>a</div>
        <div>b</div>
      </TwoColumn>,
    );
    expect(container.querySelector(".md\\:grid-cols-2")).not.toBeNull();
  });
});
```

- [ ] **Step 2: Fail**

```bash
npx vitest run src/components/mdx/two-column.test.tsx
```

- [ ] **Step 3: Implement**

```tsx
// src/components/mdx/two-column.tsx
import type { ReactNode } from "react";

interface TwoColumnProps {
  children: ReactNode;
}

export function TwoColumn({ children }: TwoColumnProps) {
  return <div className="my-10 grid grid-cols-1 gap-8 md:grid-cols-2">{children}</div>;
}
```

- [ ] **Step 4: Pass**

```bash
npx vitest run src/components/mdx/two-column.test.tsx
```

Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/two-column.tsx src/components/mdx/two-column.test.tsx
git commit -m "feat(mdx): <TwoColumn> shortcode with responsive split"
```

---

## Task 13: `<Aside>` shortcode (TDD)

**Files:**
- Create: `src/components/mdx/aside.tsx`
- Create: `src/components/mdx/aside.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// src/components/mdx/aside.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Aside } from "./aside";

describe("Aside", () => {
  it("renders the body content", () => {
    render(<Aside>A margin note.</Aside>);
    expect(screen.getByText("A margin note.")).toBeInTheDocument();
  });

  it("uses an aside element with margin-note styling classes", () => {
    const { container } = render(<Aside>x</Aside>);
    const el = container.querySelector("aside");
    expect(el).not.toBeNull();
    expect(el?.className).toMatch(/border-l/);
  });
});
```

- [ ] **Step 2: Fail**

```bash
npx vitest run src/components/mdx/aside.test.tsx
```

- [ ] **Step 3: Implement**

```tsx
// src/components/mdx/aside.tsx
import type { ReactNode } from "react";

interface AsideProps {
  children: ReactNode;
}

export function Aside({ children }: AsideProps) {
  return (
    <aside className="my-6 border-l-2 border-[color:var(--color-rule)] pl-4 text-sm leading-6 italic text-[color:var(--color-ink-soft)] md:float-right md:w-1/3 md:ml-6 md:mb-4">
      {children}
    </aside>
  );
}
```

- [ ] **Step 4: Pass**

```bash
npx vitest run src/components/mdx/aside.test.tsx
```

Expected: 2 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/mdx/aside.tsx src/components/mdx/aside.test.tsx
git commit -m "feat(mdx): <Aside> shortcode for margin notes"
```

---

## Task 14: Wire shortcodes into `mdxComponents` + slug binding

**Files:**
- Modify: `src/components/sections/blog-post-view.tsx`
- Modify: `src/app/(main)/blog/[slug]/page.tsx`

The shortcodes accept a `slug` prop. MDX components are looked up by name, so we wrap them per-render with the current slug bound. The wrappers live in `BlogPostView`.

- [ ] **Step 1: Update `BlogPostView` to bind slug into shortcodes**

Open `src/components/sections/blog-post-view.tsx`. Replace the existing `mdxComponents` export and `BlogPostView` props with:

```tsx
import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Separator } from "@/components/ui/separator";
import type { BlogPost } from "@/types/blog";
import type { MDXComponents } from "mdx/types";
import { formatDate } from "@/lib/utils";
import { RelatedPosts } from "@/components/editorial/related-posts";
import { Figure } from "@/components/mdx/figure";
import { FullBleed } from "@/components/mdx/full-bleed";
import { Gallery } from "@/components/mdx/gallery";
import { PullQuote } from "@/components/mdx/pull-quote";
import { TwoColumn } from "@/components/mdx/two-column";
import { Aside } from "@/components/mdx/aside";

interface BlogPostViewProps {
  post: BlogPost;
  Content: React.ComponentType;
  allPosts?: BlogPost[];
}

export function buildMdxComponents(slug: string): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="mt-10 mb-4 font-[family-name:var(--font-playfair)] text-3xl text-[color:var(--color-ink)]">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="mt-8 mb-3 font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-6 mb-2 text-xl font-semibold text-[color:var(--color-ink)]">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="mb-5 leading-8 text-[color:var(--color-ink)]">{children}</p>
    ),
    a: ({ children, href }) => (
      <a
        href={href}
        className="text-[color:var(--color-accent)] underline underline-offset-4 hover:text-[color:var(--color-ink)] transition-colors"
      >
        {children}
      </a>
    ),
    code: ({ children }) => (
      <code className="rounded bg-[color:var(--color-paper-elevated)] px-1.5 py-0.5 font-mono text-sm text-[color:var(--color-ink)] border border-[color:var(--color-rule)]">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="my-6 overflow-x-auto rounded-xl bg-[#0a0a0a] p-4 font-mono text-sm text-gray-100">
        {children}
      </pre>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-6 border-l-2 border-[color:var(--color-accent)] pl-4 italic text-[color:var(--color-ink-soft)]">
        {children}
      </blockquote>
    ),
    ul: ({ children }) => (
      <ul className="mb-5 list-inside list-disc space-y-1.5 leading-8 text-[color:var(--color-ink)]">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="mb-5 list-inside list-decimal space-y-1.5 leading-8 text-[color:var(--color-ink)]">{children}</ol>
    ),
    hr: () => <Separator className="my-10" />,
    // Editorial shortcodes — slug is bound per-render.
    Figure: (props: Omit<React.ComponentProps<typeof Figure>, "slug">) => <Figure slug={slug} {...props} />,
    FullBleed: (props: Omit<React.ComponentProps<typeof FullBleed>, "slug">) => <FullBleed slug={slug} {...props} />,
    Gallery: (props: Omit<React.ComponentProps<typeof Gallery>, "slug">) => <Gallery slug={slug} {...props} />,
    PullQuote,
    TwoColumn,
    Aside,
  };
}

// Backwards-compat re-export (some tests still import `mdxComponents`).
// Bound to an empty slug — only used as a type/shape probe; runtime callers must use buildMdxComponents.
export const mdxComponents: MDXComponents = buildMdxComponents("");

export function BlogPostView({ post, Content, allPosts }: BlogPostViewProps) {
  return (
    <>
      <Container>
        <div className="mb-8 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)] transition-colors"
          >
            <ArrowLeft className="size-4" />
            All Posts
          </Link>
        </div>

        <div className="mb-10 max-w-3xl">
          <h1 className="editorial-display mb-4 font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[color:var(--color-ink)] leading-tight">
            {post.frontmatter.title}
          </h1>
          <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-[color:var(--color-ink-soft)]">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-4" />
              {formatDate(post.frontmatter.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {post.readingTime}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {post.frontmatter.tags.map((tag) => (
              <Link
                key={tag}
                href={`/blog/tag/${tag}`}
                className="px-3 py-1 border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] text-xs uppercase tracking-[0.18em] hover:text-[color:var(--color-ink)] transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>

        <Separator className="mb-10" />

        <article className="editorial-prose mx-auto max-w-2xl">
          <Content />
        </article>

        <div className="mx-auto max-w-2xl mt-16 border-t border-[color:var(--color-rule)] pt-10 text-center">
          <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)] mb-3">
            Want to discuss?
          </h3>
          <p className="text-[color:var(--color-ink-soft)] mb-6">
            Have thoughts on this post? I&apos;d love to hear from you.
          </p>
          <Link
            href="/meet"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[color:var(--color-ink)] text-[color:var(--color-paper-elevated)] rounded-full hover:bg-[color:var(--color-accent)] transition-colors font-medium text-sm"
          >
            Book a Call
          </Link>
        </div>
      </Container>

      {allPosts && allPosts.length > 1 && (
        <div className="mt-16">
          <RelatedPosts currentSlug={post.slug} allPosts={allPosts} />
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Update the page to bind slug into MDXRemote components**

Open `src/app/(main)/blog/[slug]/page.tsx`. Replace the `mdxComponents` import with `buildMdxComponents`, and pass it into `MDXRemote` per-render:

```tsx
import { BlogPostView, buildMdxComponents } from "@/components/sections/blog-post-view";
// ...
const Content = async () => (
  <MDXRemote source={post.content} components={buildMdxComponents(post.slug)} />
);
```

The rest of the file stays the same.

- [ ] **Step 3: Build + run tests**

```bash
npx tsc --noEmit
npm run test -- --run
npm run build
```

Expected: passes (modulo the known pre-existing errors), build green.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/blog-post-view.tsx "src/app/(main)/blog/[slug]/page.tsx"
git commit -m "feat(blog-v2): register editorial shortcodes on MDX components"
```

---

## Task 15: `<BlogCover>` component (TDD)

**Files:**
- Create: `src/components/editorial/blog-cover.tsx`
- Create: `src/components/editorial/blog-cover.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// src/components/editorial/blog-cover.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BlogCover } from "./blog-cover";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...(props as { src: string; alt: string; style?: React.CSSProperties })} />
  ),
}));

const basePost = {
  slug: "test-post",
  frontmatter: { title: "Test Post", date: "2026-01-01", excerpt: "", tags: [], published: true },
  readingTime: "1 min",
  content: "",
  cover: { src: "/_blog-assets/test-post/cover.jpg", alt: "Cover photo" },
};

describe("BlogCover", () => {
  it("renders the title as an h1", () => {
    render(<BlogCover post={basePost} />);
    expect(screen.getByRole("heading", { level: 1, name: "Test Post" })).toBeInTheDocument();
  });

  it("renders the cover image with derived alt", () => {
    render(<BlogCover post={basePost} />);
    expect(screen.getByAltText("Cover photo")).toBeInTheDocument();
  });

  it("applies view-transition-name keyed by slug", () => {
    const { container } = render(<BlogCover post={basePost} />);
    const styled = Array.from(container.querySelectorAll("[style]")).find((el) =>
      el.getAttribute("style")?.includes("view-transition-name"),
    );
    expect(styled).toBeTruthy();
  });
});
```

- [ ] **Step 2: Fail**

```bash
npx vitest run src/components/editorial/blog-cover.test.tsx
```

- [ ] **Step 3: Implement**

```tsx
// src/components/editorial/blog-cover.tsx
import Image from "next/image";
import type { BlogPost } from "@/types/blog";

interface Props {
  post: BlogPost;
}

export function BlogCover({ post }: Props) {
  if (!post.cover) return null;
  const transitionName = `blog-cover-${post.slug}`;
  const alt = post.cover.alt ?? `${post.frontmatter.title} — cover image`;

  return (
    <header className="relative w-full aspect-[16/9] overflow-hidden">
      <Image
        src={post.cover.src}
        alt={alt}
        fill
        priority
        sizes="100vw"
        placeholder={post.cover.blurDataURL ? "blur" : undefined}
        blurDataURL={post.cover.blurDataURL}
        style={{ objectFit: "cover", viewTransitionName: transitionName }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute inset-0 flex items-end p-6 md:p-12">
        <div>
          <h1 className="editorial-display font-[family-name:var(--font-playfair)] text-4xl md:text-6xl text-white leading-tight max-w-3xl">
            {post.frontmatter.title}
          </h1>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Pass**

```bash
npx vitest run src/components/editorial/blog-cover.test.tsx
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/editorial/blog-cover.tsx src/components/editorial/blog-cover.test.tsx
git commit -m "feat(editorial): <BlogCover> component with view-transition support"
```

---

## Task 16: Wire `<BlogCover>` into the post page; show cover thumbnail on the index

**Files:**
- Modify: `src/components/sections/blog-post-view.tsx`
- Modify: `src/components/sections/blog-list.tsx`

- [ ] **Step 1: Render the cover in `BlogPostView` when present**

In `src/components/sections/blog-post-view.tsx`, add an import for `BlogCover` and insert it above the `<Container>` block:

```tsx
import { BlogCover } from "@/components/editorial/blog-cover";
// ...
return (
  <>
    {post.cover && <BlogCover post={post} />}
    <Container>
      {/* ...rest unchanged... */}
    </Container>
    {/* ...rest unchanged... */}
  </>
);
```

When `post.cover` is undefined, layout is unchanged from current state.

- [ ] **Step 2: Pass `cover` to `<EditorialEntry>` in the blog list**

In `src/components/sections/blog-list.tsx`, where each post maps into an `EditorialEntry`, pass cover when present and set the matching view-transition name:

```tsx
<EditorialEntry
  key={post.slug}
  index={i}
  kicker={String(i + 1).padStart(2, "0")}
  title={post.frontmatter.title}
  description={post.frontmatter.excerpt}
  href={`/blog/${post.slug}`}
  cover={post.cover ? { src: post.cover.src, alt: post.cover.alt ?? post.frontmatter.title } : undefined}
  transitionName={post.cover ? `blog-cover-${post.slug}` : undefined}
/>
```

- [ ] **Step 3: Build + smoke check**

```bash
npx tsc --noEmit
npm run build
```

Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/sections/blog-post-view.tsx src/components/sections/blog-list.tsx
git commit -m "feat(blog-v2): render <BlogCover> on post + cover thumbnails on index"
```

---

## Task 17: `<SeriesHeader>` component (TDD)

**Files:**
- Create: `src/components/editorial/series-header.tsx`
- Create: `src/components/editorial/series-header.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// src/components/editorial/series-header.test.tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SeriesHeader } from "./series-header";
import type { BlogPost } from "@/types/blog";

const mk = (slug: string, order: number): BlogPost => ({
  slug,
  frontmatter: {
    title: `Post ${slug}`,
    date: "2026-01-01",
    excerpt: "",
    tags: [],
    published: true,
    series: "Healthcare PM",
    seriesOrder: order,
  },
  readingTime: "1 min",
  content: "",
});

const all = [mk("a", 1), mk("b", 2), mk("c", 3)];

describe("SeriesHeader", () => {
  it("returns null when current post has no series", () => {
    const current = { ...mk("z", 1), frontmatter: { ...mk("z", 1).frontmatter, series: undefined } };
    const { container } = render(<SeriesHeader current={current} all={all} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the series name and position", () => {
    render(<SeriesHeader current={all[1]} all={all} />);
    expect(screen.getByText(/Healthcare PM/)).toBeInTheDocument();
    expect(screen.getByText(/2 of 3/)).toBeInTheDocument();
  });

  it("links to previous and next posts in the series", () => {
    render(<SeriesHeader current={all[1]} all={all} />);
    expect(screen.getByRole("link", { name: /Post a/i })).toHaveAttribute("href", "/blog/a");
    expect(screen.getByRole("link", { name: /Post c/i })).toHaveAttribute("href", "/blog/c");
  });
});
```

- [ ] **Step 2: Fail**

```bash
npx vitest run src/components/editorial/series-header.test.tsx
```

- [ ] **Step 3: Implement**

```tsx
// src/components/editorial/series-header.tsx
import Link from "next/link";
import type { BlogPost } from "@/types/blog";

interface Props {
  current: BlogPost;
  all: BlogPost[];
}

export function SeriesHeader({ current, all }: Props) {
  const series = current.frontmatter.series;
  if (!series) return null;

  const inSeries = all
    .filter((p) => p.frontmatter.series === series)
    .sort((a, b) => {
      const oa = a.frontmatter.seriesOrder ?? 999;
      const ob = b.frontmatter.seriesOrder ?? 999;
      if (oa !== ob) return oa - ob;
      return new Date(a.frontmatter.date).getTime() - new Date(b.frontmatter.date).getTime();
    });

  const idx = inSeries.findIndex((p) => p.slug === current.slug);
  if (idx < 0) return null;

  const prev = idx > 0 ? inSeries[idx - 1] : null;
  const next = idx < inSeries.length - 1 ? inSeries[idx + 1] : null;

  return (
    <div className="editorial-shell mb-6 mt-2 flex flex-col gap-2 border-y border-[color:var(--color-rule)] py-4 text-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
          Series · {series}
        </span>
        <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">
          Part {idx + 1} of {inSeries.length}
        </span>
      </div>
      <div className="flex gap-4 text-[color:var(--color-ink)]">
        {prev && (
          <Link href={`/blog/${prev.slug}`} className="hover:underline">
            ← {prev.frontmatter.title}
          </Link>
        )}
        {next && (
          <Link href={`/blog/${next.slug}`} className="hover:underline">
            {next.frontmatter.title} →
          </Link>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Pass**

```bash
npx vitest run src/components/editorial/series-header.test.tsx
```

Expected: 3 passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/editorial/series-header.tsx src/components/editorial/series-header.test.tsx
git commit -m "feat(editorial): <SeriesHeader> with prev/next and position indicator"
```

---

## Task 18: Wire `<SeriesHeader>` into the blog post page

**Files:**
- Modify: `src/components/sections/blog-post-view.tsx`

- [ ] **Step 1: Import and render**

In `BlogPostView`, add the import:

```tsx
import { SeriesHeader } from "@/components/editorial/series-header";
```

Render directly below the cover and above the `Container` open:

```tsx
{post.cover && <BlogCover post={post} />}
{allPosts && <SeriesHeader current={post} all={allPosts} />}
<Container>
  {/* ... */}
</Container>
```

- [ ] **Step 2: Build verify**

```bash
npx tsc --noEmit && npm run build
```

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/blog-post-view.tsx
git commit -m "feat(blog-v2): show series header on posts with series frontmatter"
```

---

## Task 19: `/blog/tag/[tag]` page

**Files:**
- Create: `src/app/(main)/blog/tag/[tag]/page.tsx`
- Create: `src/app/(main)/blog/tag/[tag]/page.test.tsx`

- [ ] **Step 1: Failing test**

```tsx
// src/app/(main)/blog/tag/[tag]/page.test.tsx
import { describe, expect, it, vi } from "vitest";
import type { BlogPost } from "@/types/blog";

vi.mock("@/lib/blog", () => ({
  getAllPosts: (): BlogPost[] => [
    { slug: "a", frontmatter: { title: "A", date: "2026-01-01", excerpt: "", tags: ["pm"], published: true }, readingTime: "1 min", content: "" },
    { slug: "b", frontmatter: { title: "B", date: "2026-01-02", excerpt: "", tags: ["pm", "ai"], published: true }, readingTime: "1 min", content: "" },
    { slug: "c", frontmatter: { title: "C", date: "2026-01-03", excerpt: "", tags: ["photography"], published: true }, readingTime: "1 min", content: "" },
  ],
}));

import { generateStaticParams } from "./page";

describe("blog tag page", () => {
  it("generateStaticParams returns union of tags across posts", async () => {
    const params = await generateStaticParams();
    const tags = params.map((p: { tag: string }) => p.tag).sort();
    expect(tags).toEqual(["ai", "photography", "pm"]);
  });
});
```

- [ ] **Step 2: Fail**

```bash
npx vitest run src/app/\(main\)/blog/tag/\[tag\]/page.test.tsx
```

- [ ] **Step 3: Implement the page**

```tsx
// src/app/(main)/blog/tag/[tag]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts } from "@/lib/blog";
import { EditorialPageHeader } from "@/components/editorial/editorial-page-header";
import { EditorialEntry } from "@/components/editorial/editorial-entry";
import { siteConfig } from "@/data/site-config";

export async function generateStaticParams() {
  const posts = getAllPosts();
  const tags = new Set<string>();
  posts.forEach((p) => p.frontmatter.tags.forEach((t) => tags.add(t)));
  return Array.from(tags).map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  return {
    title: `#${tag} — Writing`,
    description: `Posts tagged #${tag} on ${siteConfig.name}.`,
  };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = getAllPosts().filter((p) => p.frontmatter.tags.includes(tag));
  if (posts.length === 0) notFound();

  return (
    <>
      <EditorialPageHeader
        kicker="Writing"
        title={`#${tag}`}
        sub={`Posts tagged #${tag}.`}
      />
      <div className="editorial-shell pb-24">
        {posts.map((post, i) => (
          <EditorialEntry
            key={post.slug}
            index={i}
            kicker={String(i + 1).padStart(2, "0")}
            title={post.frontmatter.title}
            description={post.frontmatter.excerpt}
            href={`/blog/${post.slug}`}
            cover={post.cover ? { src: post.cover.src, alt: post.cover.alt ?? post.frontmatter.title } : undefined}
          />
        ))}
      </div>
    </>
  );
}
```

- [ ] **Step 4: Pass**

```bash
npx vitest run src/app/\(main\)/blog/tag/\[tag\]/page.test.tsx
npm run build
```

Expected: test passes; build generates static pages for every tag.

- [ ] **Step 5: Commit**

```bash
git add "src/app/(main)/blog/tag/[tag]/page.tsx" "src/app/(main)/blog/tag/[tag]/page.test.tsx"
git commit -m "feat(blog-v2): /blog/tag/[tag] route with static params per unique tag"
```

---

## Task 20: Per-post OG route `/blog/[slug]/og`

**Files:**
- Create: `src/app/(main)/blog/[slug]/og/route.tsx`
- Modify: `src/app/(main)/blog/[slug]/page.tsx` (wire `openGraph.images`)

- [ ] **Step 1: Implement the OG route**

```tsx
// src/app/(main)/blog/[slug]/og/route.tsx
import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.frontmatter.title ?? "Writing";
  const date = post?.frontmatter.date ?? "";

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

(Using `runtime: "nodejs"` instead of `"edge"` so the route can use `fs`-backed `getPostBySlug`.)

- [ ] **Step 2: Wire `openGraph.images` in the post page**

In `src/app/(main)/blog/[slug]/page.tsx`'s `generateMetadata`, after computing `post`, set:

```tsx
return {
  title: post.frontmatter.title,
  description: post.frontmatter.excerpt,
  openGraph: {
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    images: [{ url: `/blog/${slug}/og`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: post.frontmatter.title,
    description: post.frontmatter.excerpt,
    images: [`/blog/${slug}/og`],
  },
};
```

- [ ] **Step 3: Build verify**

```bash
npm run build
```

Expected: build succeeds. Visit `/blog/hello-world/og` after running `npm run start` to manually verify it renders.

- [ ] **Step 4: Commit**

```bash
git add "src/app/(main)/blog/[slug]/og/route.tsx" "src/app/(main)/blog/[slug]/page.tsx"
git commit -m "feat(blog-v2): per-post OG card and metadata wiring"
```

---

## Task 21: Smoke fixture — all 6 shortcodes in one render

**Files:**
- Create: `src/components/mdx/all-shortcodes.smoke.test.tsx`

- [ ] **Step 1: Author the fixture test**

```tsx
// src/components/mdx/all-shortcodes.smoke.test.tsx
import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Figure } from "./figure";
import { FullBleed } from "./full-bleed";
import { Gallery } from "./gallery";
import { PullQuote } from "./pull-quote";
import { TwoColumn } from "./two-column";
import { Aside } from "./aside";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...(props as { src: string; alt: string })} />
  ),
}));

vi.mock("@/lib/blog-assets", () => ({
  resolveBlogAsset: (slug: string, rel: string) => ({
    src: `/_blog-assets/${slug}/${rel.replace(/^\.\//, "")}`,
  }),
}));

describe("All shortcodes render together", () => {
  it("does not throw", () => {
    expect(() =>
      render(
        <>
          <Figure slug="x" src="./a.jpg" alt="a" caption="cap" />
          <FullBleed slug="x" src="./b.jpg" alt="b" caption="cap" />
          <Gallery
            slug="x"
            columns={3}
            images={[
              { src: "./c.jpg", alt: "c" },
              { src: "./d.jpg", alt: "d" },
              { src: "./e.jpg", alt: "e" },
            ]}
          />
          <PullQuote attribution="Author">Sample quote.</PullQuote>
          <TwoColumn>
            <div>Left</div>
            <div>Right</div>
          </TwoColumn>
          <Aside>Aside body.</Aside>
        </>,
      ),
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Pass**

```bash
npx vitest run src/components/mdx/all-shortcodes.smoke.test.tsx
```

Expected: 1 passing.

- [ ] **Step 3: Commit**

```bash
git add src/components/mdx/all-shortcodes.smoke.test.tsx
git commit -m "test(blog-v2): smoke test that all six shortcodes render together"
```

---

## Task 22: Authoring guide `content/blog/AUTHORING.md`

**Files:**
- Create: `content/blog/AUTHORING.md`

- [ ] **Step 1: Write the guide**

```markdown
# Authoring guide — blog v2

## File layout

Every post is a folder:

```
content/blog/<slug>/
  index.mdx
  cover.jpg            (optional — auto-detected hero)
  any-image.png        (referenced as ./any-image.png in MDX)
```

Slug is the folder name (kebab-case, max ~5 words).

## Frontmatter

```yaml
---
title: "Your title"
date: "2026-05-15"           # publish date
excerpt: "One-sentence summary for the index page."
tags: ["product", "writing"] # 2–4 tags
published: true              # false to keep as draft
featured: false              # optional, surfaces on the homepage
series: "Healthcare PM"      # optional — groups posts in a series
seriesOrder: 2               # optional — position within the series
faq: []                      # optional, generates FAQ JSON-LD
howTo: ~                     # optional, generates HowTo JSON-LD
---
```

## Shortcodes available in every MDX file

```mdx
<Figure src="./diagram.png" caption="Optional caption." alt="Diagram alt." />

<FullBleed src="./hero.jpg" alt="Wasatch sunset" caption="Optional caption." />

<Gallery columns={3} images={[
  { src: "./a.jpg", alt: "A" },
  { src: "./b.jpg", alt: "B" },
  { src: "./c.jpg", alt: "C" }
]} />

<PullQuote attribution="Annie Dillard">
How we spend our days is how we spend our lives.
</PullQuote>

<TwoColumn>
  <div>Left column text.</div>
  <Figure src="./right.jpg" caption="Right column image." />
</TwoColumn>

<Aside>
A margin note. Floats right at md+, inline below at mobile.
</Aside>
```

Use relative paths (`./...`) for any image inside the post folder.

## Covers (heroes)

If a file named `cover.jpg`, `cover.png`, or `cover.webp` exists in the post folder, it auto-renders as a full-bleed editorial cover at the top of the post. No frontmatter required.

## Build pipeline

`npm run build` automatically:

1. Mirrors every image from `content/blog/<slug>/` to `public/_blog-assets/<slug>/`.
2. Generates blur-up placeholders (LQIP) into `public/_blog-assets/<slug>/__blur.json`.

Don't commit `public/_blog-assets/` — it's gitignored and regenerated on every build.

## Writing with `/write-blog-post`

The project ships a skill that drafts a polished post from a 5-question interview, hands off to `/storyteller-writing-assistant` to lock the narrative framework, then writes the draft to `content/blog/<slug>/index.mdx` with frontmatter pre-filled and `published: false`. Use it as your starting point.

## Tag URLs

Every tag automatically gets a static page at `/blog/tag/<tag>`. Click any tag pill on a post to see the page for it.

## OG images

Every post has a dynamic 1200×630 OG card at `/blog/<slug>/og`. The metadata is wired automatically — no manual work.
```

- [ ] **Step 2: Commit**

```bash
git add content/blog/AUTHORING.md
git commit -m "docs(blog-v2): authoring guide for folder layout, frontmatter, shortcodes"
```

---

## Task 23: `write-blog-post` skill

**Files:**
- Create: `.claude/skills/write-blog-post/SKILL.md`

- [ ] **Step 1: Write the skill**

```markdown
---
name: write-blog-post
description: Draft an engaging blog post end-to-end using a short interview, an internal Pip Decks framework recommendation, a mid-flow handoff to /storyteller-writing-assistant to confirm purpose and lock the framework, then write a polished MDX draft to content/blog/<slug>/index.mdx with editorial shortcodes placed at narrative pivots. Triggers — "/write-blog-post", "write a blog post", "draft a post", "new blog post", "blog post about", "help me blog".
---

# Write Blog Post

You are drafting a polished blog post for Philip Sun's personal site. The post lives in this repo at `content/blog/<slug>/index.mdx`. The repo already has a v2 editorial system: shortcodes (`<Figure>`, `<FullBleed>`, `<Gallery>`, `<PullQuote>`, `<TwoColumn>`, `<Aside>`), per-post folder layout, cover convention, drop-cap-friendly opening paragraphs.

Read `content/blog/AUTHORING.md` for conventions before you write.

## Hard rules

1. **The storyteller handoff is non-negotiable.** You MUST invoke the `storyteller-writing-assistant` skill via the Skill tool mid-flow (step 3). If you cannot invoke it, stop and surface the failure — do not proceed to drafting on your own.
2. **Every run ends with a file on disk.** Never return a draft only inline; always Write it to `content/blog/<slug>/index.mdx`.
3. **Frontmatter always ships with `published: false`.** The user flips it to `true` when ready.
4. **Use the per-post folder convention.** Create the folder if missing.
5. **One question at a time during the interview.** Like the brainstorming skill.

## Flow

### 1. Interview (5–7 questions, one at a time)

Ask in this order, one per turn:

1. What's the topic / working title?
2. Who is the audience? (peers, recruiters, photography clients, general builders)
3. What's the single insight or "so what"?
4. What experience or evidence grounds it?
5. What outcome do you want for the reader? (a-ha, a new mental model, a decision, a feeling)
6. Approximate length? (short ~500w, medium ~900w, long ~1500w)
7. Any photos you plan to drop into the post folder?

Capture each answer compactly. After question 7, summarize in two sentences.

### 2. Internal framework recommendation

From the answers, pick ONE of these Pip Decks Storyteller Tactics (use the cheat sheet below). Prepare a one-sentence justification — you'll pass it to storyteller in step 3 as your proposed framework.

Cheat sheet:

| Tactic | Best for | Length sweet spot |
|---|---|---|
| **Mountain** | A struggle → climb → resolution narrative. Lessons-learned posts. | 900–1500 words |
| **Sparklines** | Contrast: expectation vs reality, before vs after, what we thought vs what we found. | 500–900 words |
| **Cinderella** | Transformation arc — humble start, turning point, new state. | ~900 words |
| **Quest** | Decision-driven journey — a series of choices and what each cost. | ~1200 words |
| **Petal Structure** | One insight illuminated from multiple angles. Each section is a petal. | ~700 words |

Recommendation heuristic:
- Primary emotion = struggle/grit → Mountain.
- Primary tension = surprise/contrast → Sparklines.
- Primary arc = transformation of self → Cinderella.
- Primary spine = decisions made under uncertainty → Quest.
- Single insight, multiple perspectives → Petal Structure.

### 3. Storyteller handoff (MANDATORY)

Invoke `storyteller-writing-assistant` via the Skill tool with this exact handoff prompt template:

> I'm drafting a blog post for Philip Sun's personal site. Here's the context from a short interview:
> - Topic: <topic>
> - Audience: <audience>
> - Insight ("so what"): <insight>
> - Grounding experience: <experience>
> - Reader outcome: <outcome>
> - Target length: <length>
> - Photos planned: <photos>
>
> My recommended Pip Decks framework is **<framework name>** because <one-sentence justification>.
>
> Please:
> 1. Confirm the post's purpose statement with the user (one sentence — what is this post for).
> 2. Confirm or override the framework choice.
> 3. Produce a section-by-section outline I can draft against (3–6 sections, with one-line description each).
>
> Return the locked purpose, chosen framework, and outline.

Wait for storyteller's return. The locked outline is your contract for step 4.

### 4. Draft using the confirmed framework

- Suggest a slug: kebab-case of the working title, max 5 words.
- Create `content/blog/<slug>/` if it doesn't exist.
- Draft the full MDX:
  - Open with a drop-cap-friendly first sentence (single strong sentence, no ramp-up like "In this post we'll").
  - Follow the locked outline section by section.
  - Place shortcodes at narrative pivots:
    - `<PullQuote>` at the emotional/insight peak. One per post, max.
    - `<Figure src="./<descriptive-name>.jpg" caption="..." alt="..." />` placeholder wherever the outline suggests imagery. The user will drop in the actual image later.
    - `<TwoColumn>` for contrast moments (especially natural in Sparklines).
    - `<Aside>` for tangents the user mentioned but that would derail the spine.
- Pre-filled frontmatter:

```yaml
---
title: "<working title>"
date: "<today's date YYYY-MM-DD>"
excerpt: "<one sentence pulled from the body, written for the index page>"
tags: ["<tag1>", "<tag2>"]  # suggest 2–3 from the existing taxonomy across content/blog/
published: false
---
```

To find existing tags, read the frontmatter of existing posts under `content/blog/*/index.mdx`.

### 5. Write to disk

Use the Write tool to create `content/blog/<slug>/index.mdx` with the full draft.

If the post calls for a cover or any inline images, ALSO write `content/blog/<slug>/COVER_NOTES.md` describing what photo would fit the post's emotional tone — subject, mood, framing, aspect ratio. This guides the user when they upload `cover.jpg` later.

### 6. Hand back

Print:

- The path(s) created.
- 1–2 specific suggestions for light edits the user might want.

Do not commit to git. The user reviews and commits when ready.

## Out of scope

- Selecting / placing real images (user does this after the draft exists).
- Final copyedit pass.
- Setting `published: true` and committing.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/write-blog-post/SKILL.md
git commit -m "feat(skill): write-blog-post with storyteller handoff"
```

---

## Task 24: Final QA gate + push

**Files:**
- None to modify. This is the merge-bar.

- [ ] **Step 1: Run the full gate**

```bash
npm run lint
npx tsc --noEmit
npm run test -- --run
npm run build
```

All four must pass clean except the 3 known pre-existing TS errors in `src/app/__tests__/{contact,meet}.test.tsx`. If anything else fails, fix and recommit before pushing.

- [ ] **Step 2: Push the branch**

```bash
git push -u origin feat/blog-system-v2
```

- [ ] **Step 3: Open the PR**

```bash
gh pr create --title "Blog system v2 — folder posts, editorial shortcodes, write-blog-post skill" --body "$(cat <<'EOF'
## Summary
- Per-post folder layout (`content/blog/<slug>/index.mdx`) with co-located images.
- Six MDX shortcodes (`<Figure>`, `<FullBleed>`, `<Gallery>`, `<PullQuote>`, `<TwoColumn>`, `<Aside>`).
- Cover convention (`cover.{jpg,png,webp}`) auto-rendered as hero with view-transition morph.
- Build-time image mirror + LQIP blur placeholders via `plaiceholder`.
- `/blog/tag/[tag]` static-params route.
- `/blog/[slug]/og` per-post 1200×630 card with editorial palette.
- `<SeriesHeader>` component when `series` frontmatter is set.
- New skill `.claude/skills/write-blog-post/SKILL.md` — drafts engaging posts via short interview → storyteller handoff → MDX file on disk.
- 4 existing posts migrated to folder layout.

## Spec
docs/superpowers/specs/2026-05-15-blog-system-v2-design.md

## Plan
docs/superpowers/plans/2026-05-15-blog-system-v2.md

## Test plan
- [ ] npm run lint clean
- [ ] tsc --noEmit clean (modulo 3 pre-existing test-file errors)
- [ ] npm run test -- --run clean
- [ ] npm run build clean
- [ ] `/blog/hello-world/og` renders a 1200×630 cream/ink card
- [ ] `/blog/tag/photography` returns a non-empty editorial sequence
- [ ] `<BlogCover>` shows on posts with a cover file; view-transition morph works on supported browsers
- [ ] `/write-blog-post` skill executes end-to-end on a smoke run, producing a real draft on disk

🤖 Generated with [claude-flow](https://github.com/ruvnet/claude-flow)
EOF
)"
```

- [ ] **Step 4: Verify Definition of Done against the spec**

Walk through §Definition of Done in `docs/superpowers/specs/2026-05-15-blog-system-v2-design.md` line-by-line:

1. lint + tsc + tests + build clean (modulo known pre-existing errors).
2. 4 existing posts migrated to folder layout and rendering.
3. Smoke test exercises all 6 shortcodes (Task 21).
4. `/blog/tag/<tag>` works for tags with multiple posts.
5. Per-post OG image renders.
6. `<BlogCover>` renders only with a cover file; view-transition wired.
7. `public/_blog-assets/` gitignored and built from source.
8. `content/blog/AUTHORING.md` exists.
9. `.claude/skills/write-blog-post/SKILL.md` exists with interview → storyteller handoff flow.

If any item fails, surface to the user before declaring complete.

- [ ] **Step 5: Hand off**

When all 23 prior task commits exist on `feat/blog-system-v2`, the four-gate check is clean, and the PR is open, emit:

```
<promise>ALL TASKS COMPLETE</promise>
```

---

## Skills

- `superpowers:subagent-driven-development` — recommended task-by-task execution.
- `superpowers:executing-plans` — inline batch execution with checkpoints.
- `superpowers:test-driven-development` — referenced throughout; new components/scripts follow the failing-test-first pattern.
- `superpowers:verification-before-completion` — required before reporting "done"; runs the build/lint/test gate.
