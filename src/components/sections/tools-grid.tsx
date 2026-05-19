import Image from "next/image";
import Link from "next/link";
import { tools as defaultTools, type FeaturedProject } from "@/data/featured-projects";

interface ToolsGridProps {
  /** Defaults to the curated list in `src/data/featured-projects.ts`. */
  tools?: FeaturedProject[];
}

const plateTexture: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--color-rule) 65%, transparent) 1px, transparent 0)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0",
};

const displayInitial = (name: string) =>
  (name.match(/[A-Za-z0-9]/)?.[0] ?? "•").toUpperCase();

function ToolCard({ tool }: { tool: FeaturedProject }) {
  const isExternal = tool.external;
  const arrow = isExternal ? "↗" : "→";
  const linkRel = isExternal ? "noopener noreferrer" : undefined;
  const linkTarget = isExternal ? "_blank" : undefined;

  return (
    <article className="flex flex-col">
      {/* Thumbnail OR typographic plate fallback */}
      <div className="relative w-full aspect-[16/10] overflow-hidden border border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)]">
        {tool.thumbnail ? (
          <Image
            src={tool.thumbnail.src}
            alt={tool.thumbnail.alt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div data-testid={`tools-plate-${tool.slug}`} className="absolute inset-0">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-60"
              style={plateTexture}
            />
            <div aria-hidden className="pointer-events-none absolute inset-3 md:inset-5">
              <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-[color:var(--color-rule)]" />
              <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-[color:var(--color-rule)]" />
              <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[color:var(--color-rule)]" />
              <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[color:var(--color-rule)]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                aria-hidden
                className="font-[family-name:var(--font-playfair)] text-[10rem] font-light leading-none tracking-[-0.04em] text-[color:var(--color-ink)] md:text-[14rem]"
              >
                {displayInitial(tool.name)}
              </span>
            </div>
            <div className="absolute bottom-3 left-3 md:bottom-4 md:left-4">
              <span className="text-[0.6rem] uppercase tracking-[0.24em] text-[color:var(--color-ink-soft)] md:text-[0.7rem]">
                ↳ screenshot forthcoming
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Name */}
      <h3 className="mt-5 font-[family-name:var(--font-playfair)] text-2xl leading-snug text-[color:var(--color-ink)]">
        {tool.name}
      </h3>

      {/* Description */}
      <p className="mt-2 text-base text-[color:var(--color-ink-soft)]">
        {tool.description}
      </p>

      {/* Open link */}
      <p className="mt-4">
        <Link
          href={tool.href}
          target={linkTarget}
          rel={linkRel}
          className="text-base text-[color:var(--color-ink)] transition-colors hover:text-[color:var(--color-accent)] hover:underline"
        >
          Open {arrow}
        </Link>
      </p>
    </article>
  );
}

export function ToolsGrid({ tools = defaultTools }: ToolsGridProps) {
  return (
    <section className="py-24">
      <div className="editorial-shell">
        <p className="mb-8 text-xs uppercase tracking-widest text-[color:var(--color-ink-soft)]">
          Tools
        </p>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </div>
    </section>
  );
}
