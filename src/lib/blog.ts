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
        found.push({
          slug: entry.name,
          filePath: indexPath,
          folder: path.join(BLOG_DIR, entry.name),
        });
      }
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".mdx")) {
      const slug = entry.name.replace(/\.mdx$/, "");
      const folderExists = entries.some(
        (e) => e.isDirectory() && e.name === slug,
      );
      if (!folderExists) {
        found.push({ slug, filePath: path.join(BLOG_DIR, entry.name) });
      } else if (process.env.NODE_ENV !== "test") {
        console.warn(
          `[blog] legacy ${entry.name} shadowed by folder ${slug}/; using folder.`,
        );
      }
    }
  }

  return found;
}

function detectCover(
  folder: string | undefined,
  slug: string,
): BlogPost["cover"] {
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
