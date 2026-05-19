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
  await sharp({
    create: {
      width: 16,
      height: 16,
      channels: 3,
      background: { r: 1, g: 2, b: 3 },
    },
  })
    .jpeg()
    .toFile(path.join(FIXTURE_BLOG, "pipeline-test/cover.jpg"));
});

afterAll(() => {
  fs.rmSync(FIXTURE_ROOT, { recursive: true, force: true });
});

describe("buildBlogAssets", () => {
  it("mirrors images into public and emits __blur.json", async () => {
    await buildBlogAssets({ blogDir: FIXTURE_BLOG, publicDir: FIXTURE_PUBLIC });

    const mirrored = path.join(
      FIXTURE_PUBLIC,
      "_blog-assets/pipeline-test/cover.jpg",
    );
    expect(fs.existsSync(mirrored)).toBe(true);

    const blurPath = path.join(
      FIXTURE_PUBLIC,
      "_blog-assets/pipeline-test/__blur.json",
    );
    expect(fs.existsSync(blurPath)).toBe(true);

    const blur = JSON.parse(fs.readFileSync(blurPath, "utf-8")) as Record<
      string,
      string
    >;
    expect(blur["cover.jpg"]).toMatch(/^data:image\/(jpeg|png);base64,/);
  });

  it("removes stale assets when called twice with the fixture unchanged", async () => {
    fs.writeFileSync(
      path.join(FIXTURE_PUBLIC, "_blog-assets/pipeline-test/stale.txt"),
      "stale",
    );
    await buildBlogAssets({ blogDir: FIXTURE_BLOG, publicDir: FIXTURE_PUBLIC });
    expect(
      fs.existsSync(
        path.join(FIXTURE_PUBLIC, "_blog-assets/pipeline-test/stale.txt"),
      ),
    ).toBe(false);
  });
});
