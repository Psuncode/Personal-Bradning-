import Image from "next/image";
import type { Project } from "@/types";

interface Props {
  project: Project;
  numeral?: string;
}

// While a project's cover photo is a labeled placeholder SVG, render an
// editorial typography plate instead. Swap-in path is `coverImage.src`
// in src/data/projects.ts — see docs/IMAGES_TO_UPLOAD.md (P0).
const isPlaceholder = (src: string) => src.endsWith(".svg");

export function ProjectCover({ project, numeral }: Props) {
  const { coverImage, title } = project;
  const transitionName = `cover-${project.slug ?? project.id}`;
  const focal = coverImage.focalPoint ?? "center";
  const placeholder = isPlaceholder(coverImage.src);

  if (coverImage.layout === "beside") {
    return (
      <header data-layout="beside" className="grid grid-cols-12 gap-6 pt-24">
        <div className="col-span-12 md:col-span-7 relative aspect-[4/3] overflow-hidden border border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)]">
          {placeholder ? (
            <div
              className="flex h-full w-full flex-col justify-between p-8 md:p-12"
              style={{ viewTransitionName: transitionName }}
            >
              <span className="text-xs uppercase tracking-[0.28em] text-[color:var(--color-accent)]">
                {numeral ? `Plate ${numeral}` : "Plate"}
              </span>
              <p className="font-[family-name:var(--font-playfair)] text-5xl leading-[0.95] tracking-[-0.02em] text-[color:var(--color-ink)] md:text-7xl">
                {title}
              </p>
              <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">
                Cover image forthcoming
              </span>
            </div>
          ) : (
            <Image
              src={coverImage.src}
              alt={coverImage.alt}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 58vw"
              style={{ objectFit: "cover", objectPosition: focal, viewTransitionName: transitionName }}
            />
          )}
        </div>
        <div className="col-span-12 md:col-span-5 flex flex-col justify-end pb-6">
          {numeral && (
            <span className="font-[family-name:var(--font-playfair)] text-5xl text-[color:var(--color-accent)] mb-4">
              {numeral}
            </span>
          )}
          <h1 className="editorial-display font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-[color:var(--color-ink)] leading-tight">
            {title}
          </h1>
        </div>
      </header>
    );
  }

  if (placeholder) {
    return (
      <header
        data-layout="overlay"
        className="relative w-full aspect-[16/9] overflow-hidden border-y border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)]"
      >
        <div
          className="flex h-full w-full flex-col justify-between p-8 md:p-16"
          style={{ viewTransitionName: transitionName }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.28em] text-[color:var(--color-accent)]">
              {numeral ? `Plate ${numeral}` : "Plate"}
            </span>
            <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">
              Cover forthcoming
            </span>
          </div>
          <h1 className="editorial-display max-w-4xl font-[family-name:var(--font-playfair)] text-5xl leading-[0.95] tracking-[-0.02em] text-[color:var(--color-ink)] md:text-8xl">
            {title}
          </h1>
        </div>
      </header>
    );
  }

  return (
    <header data-layout="overlay" className="relative w-full aspect-[16/9] overflow-hidden">
      <Image
        src={coverImage.src}
        alt={coverImage.alt}
        fill
        priority
        sizes="100vw"
        style={{ objectFit: "cover", objectPosition: focal, viewTransitionName: transitionName }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
      <div className="absolute inset-0 flex items-end p-6 md:p-12">
        <div>
          {numeral && (
            <span className="block font-[family-name:var(--font-playfair)] text-4xl text-white/80 mb-2">
              {numeral}
            </span>
          )}
          <h1 className="editorial-display font-[family-name:var(--font-playfair)] text-4xl md:text-6xl text-white leading-tight max-w-3xl">
            {title}
          </h1>
        </div>
      </div>
    </header>
  );
}
