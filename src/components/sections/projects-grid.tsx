import { EditorialEntry } from "@/components/editorial/editorial-entry";
import { EditorialPageHeader } from "@/components/editorial/editorial-page-header";
import { projects } from "@/data/projects";

export function ProjectsGrid() {
  return (
    <>
      <EditorialPageHeader
        kicker="Selected Work"
        title="Projects"
        sub="A magazine of recent work — healthcare hardware, enterprise PM, AI shipped, and analytics."
      />
      <div className="editorial-shell pb-24">
        {projects.map((p, i) => (
          <EditorialEntry
            key={p.id}
            index={i}
            kicker={String(i + 1).padStart(2, "0")}
            title={p.title}
            description={p.description}
            href={`/projects/${p.slug ?? p.id}`}
            cover={{ src: p.coverImage.src, alt: p.coverImage.alt }}
          />
        ))}
      </div>
    </>
  );
}
