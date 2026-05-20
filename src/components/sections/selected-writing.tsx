import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

interface SelectedWritingProps {
  /** How many posts to surface. Defaults to 3 per spec (2-3 acceptable). */
  limit?: number;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Promoted blog section for the homepage. Renders the most recent 2-3
 * published posts as a typographic list — no thumbnails, no badges, no tags.
 * Big Playfair titles with a date · read-time meta row and the post excerpt.
 */
export function SelectedWriting({ limit = 3 }: SelectedWritingProps) {
  const posts = getAllPosts().slice(0, limit);

  if (posts.length === 0) return null;

  return (
    <section className="editorial-shell py-24">
      <p className="mb-12 text-xs uppercase tracking-widest text-[color:var(--color-ink-soft)]">
        Selected Writing
      </p>

      <ul className="flex flex-col">
        {posts.map((post) => (
          <li key={post.slug}>
            <hr className="border-t border-[color:var(--color-rule)]" />
            <Link
              href={`/blog/${post.slug}`}
              className="group block py-8 transition-colors"
            >
              <h3 className="font-[family-name:var(--font-playfair)] text-3xl text-[color:var(--color-ink)] transition-[font-style] duration-150 group-hover:italic md:text-4xl">
                {post.frontmatter.title}
              </h3>
              <p className="mt-3 text-sm text-[color:var(--color-ink-soft)]">
                {formatDate(post.frontmatter.date)}
                {post.readingTime ? ` · ${post.readingTime}` : ""}
              </p>
              {post.frontmatter.excerpt && (
                <p className="mt-4 max-w-[60ch] text-base text-[color:var(--color-ink-soft)]">
                  {post.frontmatter.excerpt}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <hr className="border-t border-[color:var(--color-rule)]" />

      <div className="mt-8">
        <Link
          href="/blog"
          className="text-sm text-[color:var(--color-ink-soft)] transition-colors hover:text-[color:var(--color-accent)]"
        >
          All writing &rarr;
        </Link>
      </div>
    </section>
  );
}
