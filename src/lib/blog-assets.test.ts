import fs from "fs";
import path from "path";
import { describe, expect, it, beforeAll, afterAll } from "vitest";
import { resolveBlogAsset } from "./blog-assets";

const PUBLIC_DIR = path.join(
  process.cwd(),
  "public/_blog-assets/asset-helper-fixture",
);

beforeAll(() => {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(PUBLIC_DIR, "__blur.json"),
    JSON.stringify({ "hero.jpg": "data:image/jpeg;base64,XYZ" }),
  );
});

afterAll(() => {
  fs.rmSync(PUBLIC_DIR, { recursive: true, force: true });
});

describe("resolveBlogAsset", () => {
  it("rewrites './hero.jpg' to a public URL and attaches blurDataURL", () => {
    const out = resolveBlogAsset("asset-helper-fixture", "./hero.jpg");
    expect(out.src).toBe("/_blog-assets/asset-helper-fixture/hero.jpg");
    expect(out.blurDataURL).toBe("data:image/jpeg;base64,XYZ");
  });

  it("passes through an absolute URL unchanged and omits blur", () => {
    const out = resolveBlogAsset(
      "asset-helper-fixture",
      "https://example.com/x.jpg",
    );
    expect(out.src).toBe("https://example.com/x.jpg");
    expect(out.blurDataURL).toBeUndefined();
  });

  it("omits blur when the file is not in the blur map", () => {
    const out = resolveBlogAsset("asset-helper-fixture", "./missing.jpg");
    expect(out.src).toBe("/_blog-assets/asset-helper-fixture/missing.jpg");
    expect(out.blurDataURL).toBeUndefined();
  });
});
