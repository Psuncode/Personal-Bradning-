"use client";

import { useState, useMemo } from "react";
import type { BlogPost } from "@/types/blog";
import { EditorialEntry } from "@/components/editorial/editorial-entry";
import { EditorialPageHeader } from "@/components/editorial/editorial-page-header";

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.frontmatter.tags))).sort(),
    [posts],
  );

  const filtered = selectedTag
    ? posts.filter((p) => p.frontmatter.tags.includes(selectedTag))
    : posts;

  return (
    <>
      <EditorialPageHeader
        kicker="Writing"
        title="Notes & Essays"
        sub="Field notes on product, systems, and building well."
      />

      {allTags.length > 0 && (
        <div className="editorial-shell mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            aria-pressed={selectedTag === null}
            className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] transition-colors ${
              selectedTag === null
                ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper-elevated)]"
                : "border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              aria-pressed={selectedTag === tag}
              className={`rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em] transition-colors ${
                selectedTag === tag
                  ? "bg-[color:var(--color-ink)] text-[color:var(--color-paper-elevated)]"
                  : "border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-ink)]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="editorial-shell pb-24">
        {filtered.length === 0 ? (
          <p className="py-16 text-center text-[color:var(--color-ink-soft)]">
            No posts yet. Check back soon.
          </p>
        ) : (
          filtered.map((post, i) => (
            <EditorialEntry
              key={post.slug}
              index={i}
              kicker={String(i + 1).padStart(2, "0")}
              title={post.frontmatter.title}
              description={post.frontmatter.excerpt}
              href={`/blog/${post.slug}`}
            />
          ))
        )}
      </div>
    </>
  );
}
