import Link from "next/link";
import type { Project } from "@/types";

interface Props {
  current: Project;
  all: Project[];
}

export function ProjectNavLinks({ current, all }: Props) {
  const i = all.findIndex((p) => p.id === current.id);
  const prev = i > 0 ? all[i - 1] : null;
  const next = i >= 0 && i < all.length - 1 ? all[i + 1] : null;

  if (!prev && !next) return null;

  return (
    <nav className="editorial-shell flex justify-between border-t border-[color:var(--color-rule)] py-12 text-sm">
      {prev ? (
        <Link
          href={`/projects/${prev.slug ?? prev.id}`}
          className="group flex flex-col gap-1 max-w-[45%]"
          aria-label={`Previous: ${prev.title}`}
        >
          <span className="editorial-kicker">← Previous</span>
          <span className="font-[family-name:var(--font-playfair)] text-xl text-[color:var(--color-ink)] group-hover:underline">
            {prev.title}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/projects/${next.slug ?? next.id}`}
          className="group flex flex-col gap-1 max-w-[45%] text-right ml-auto"
          aria-label={`Next: ${next.title}`}
        >
          <span className="editorial-kicker">Next →</span>
          <span className="font-[family-name:var(--font-playfair)] text-xl text-[color:var(--color-ink)] group-hover:underline">
            {next.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
