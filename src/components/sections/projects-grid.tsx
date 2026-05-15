import Image from "next/image";
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
              <div className="relative aspect-[21/9] w-full overflow-hidden my-12">
                <Image
                  src="/photography/landscape-3.svg"
                  alt="Alpine lake reflection — section break"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
