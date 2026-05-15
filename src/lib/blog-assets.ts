import fs from "fs";
import path from "path";

interface Resolved {
  src: string;
  blurDataURL?: string;
}

const blurCache = new Map<string, Record<string, string>>();

function loadBlurMap(slug: string): Record<string, string> {
  if (blurCache.has(slug)) return blurCache.get(slug)!;
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
