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
      return (
        new Date(a.frontmatter.date).getTime() -
        new Date(b.frontmatter.date).getTime()
      );
    });

  const idx = inSeries.findIndex((p) => p.slug === current.slug);
  if (idx < 0) return null;

  const prev = idx > 0 ? inSeries[idx - 1] : null;
  const next = idx < inSeries.length - 1 ? inSeries[idx + 1] : null;

  return (
    <div className="editorial-shell mb-6 mt-2 flex flex-col gap-2 border-y border-[color:var(--color-rule)] py-4 text-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">
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
