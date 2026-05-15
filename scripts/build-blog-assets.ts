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
          console.warn(
            `[blog-assets] could not compute blur for ${entry.name}/${file.name}:`,
            err,
          );
        }
      }
    }

    fs.writeFileSync(
      path.join(outDir, "__blur.json"),
      JSON.stringify(blurMap, null, 2),
    );
  }
}

if (
  process.argv[1] &&
  process.argv[1].endsWith("build-blog-assets.ts")
) {
  buildBlogAssets()
    .then(() => console.log("[blog-assets] done"))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
