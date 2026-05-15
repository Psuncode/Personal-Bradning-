import Link from "next/link";
import type { BlogPost } from "@/types/blog";

interface Props {
  currentSlug: string;
  allPosts: BlogPost[];
}

export function RelatedPosts({ currentSlug, allPosts }: Props) {
  const current = allPosts.find((p) => p.slug === currentSlug);
  if (!current) return null;
  const currentTags = new Set(current.frontmatter.tags);

  const related = allPosts
    .filter((p) => p.slug !== currentSlug)
    .filter((p) => p.frontmatter.tags.some((t) => currentTags.has(t)))
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1))
    .slice(0, 2);

  if (related.length === 0) return null;

  return (
    <section className="editorial-shell border-t border-[color:var(--color-rule)] py-12">
      <p className="editorial-kicker mb-6">Related</p>
      <div className="grid md:grid-cols-2 gap-6">
        {related.map((p) => (
          <Link
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group block"
          >
            <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)] group-hover:underline mb-2">
              {p.frontmatter.title}
            </h3>
            <p className="text-sm leading-6 text-[color:var(--color-ink-soft)] line-clamp-2">
              {p.frontmatter.excerpt}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
