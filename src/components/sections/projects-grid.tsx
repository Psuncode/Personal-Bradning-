import { EditorialEntry } from "@/components/editorial/editorial-entry";
import { EditorialPageHeader } from "@/components/editorial/editorial-page-header";
import { projects } from "@/data/projects";

export function ProjectsGrid() {
  const midpoint = Math.floor(projects.length / 2);

  return (
    <>
      <EditorialPageHeader
        kicker="Selected Work"
        title="Projects"
        sub="A magazine of recent work — healthcare hardware, enterprise PM, AI shipped, and analytics."
      />
      <div className="editorial-shell pb-24">
        {projects.map((p, i) => (
          <div key={p.id}>
            <EditorialEntry
              index={i}
              kicker={String(i + 1).padStart(2, "0")}
              title={p.title}
              description={p.description}
              href={`/projects/${p.slug ?? p.id}`}
              cover={{ src: p.coverImage.src, alt: p.coverImage.alt }}
              transitionName={`cover-${p.slug ?? p.id}`}
            />
            {i === midpoint - 1 && (
              <div className="my-12 flex aspect-[21/9] w-full items-center justify-between border-y border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)] px-10 md:px-16">
                <span className="text-xs uppercase tracking-[0.28em] text-[color:var(--color-accent)]">
                  Intermission
                </span>
                <span className="font-[family-name:var(--font-playfair)] text-2xl text-[color:var(--color-ink)] md:text-4xl">
                  Continued overleaf
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
