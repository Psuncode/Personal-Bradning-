import Image from "next/image";
import type { Project } from "@/types";

interface Props {
  project: Project;
  numeral?: string;
}

// While a project's cover photo is a labeled placeholder SVG (or simply
// missing), render an editorial typography plate instead. Swap-in path is
// `coverImage.src` in src/data/projects.ts — see docs/IMAGES_TO_UPLOAD.md (P0).
const isPlaceholder = (src?: string | null) => !src || src.endsWith(".svg");

// The plate's display character — first letter of the project title.
const displayInitial = (title: string) =>
  (title.match(/[A-Za-z0-9]/)?.[0] ?? "•").toUpperCase();

// Subtle ruled/dotted texture so the plate doesn't read as a flat swatch.
// Uses editorial rule color at low alpha — pure tokens, no hex literals here.
const plateTexture: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--color-rule) 65%, transparent) 1px, transparent 0)",
  backgroundSize: "18px 18px",
  backgroundPosition: "0 0",
};

interface PlateProps {
  title: string;
  initial: string;
  kickerLabel: string;
  transitionName: string;
  variant: "overlay" | "beside";
}

function TypographyPlate({ title, initial, kickerLabel, transitionName, variant }: PlateProps) {
  // Slightly different proportions for the two layouts so the plate fills
  // each aspect ratio without feeling cropped.
  const initialSize =
    variant === "overlay"
      ? "text-[14rem] md:text-[22rem] lg:text-[26rem]"
      : "text-[12rem] md:text-[18rem]";
  const padding = variant === "overlay" ? "p-8 md:p-14" : "p-6 md:p-10";

  return (
    <div
      data-testid="project-cover-plate"
      className={`relative flex h-full w-full flex-col justify-between bg-[color:var(--color-paper-elevated)] ${padding}`}
      style={{ viewTransitionName: transitionName }}
    >
      {/* Subtle dotted texture layer */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-60" style={plateTexture} />

      {/* Decorative corner brackets — editorial print-mark feel */}
      <div aria-hidden className="pointer-events-none absolute inset-3 md:inset-5">
        <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-[color:var(--color-rule)]" />
        <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-[color:var(--color-rule)]" />
        <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[color:var(--color-rule)]" />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[color:var(--color-rule)]" />
      </div>

      {/* Header row — kicker + cover-forthcoming note */}
      <div className="relative flex items-baseline justify-between">
        <span className="text-[0.65rem] uppercase tracking-[0.32em] text-[color:var(--color-ink-soft)] md:text-xs">
          {kickerLabel}
        </span>
        <span className="text-[0.6rem] uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)] md:text-[0.7rem]">
          Cover forthcoming
        </span>
      </div>

      {/* Centerpiece — oversized initial */}
      <div className="relative flex flex-1 items-center justify-center">
        <span
          aria-hidden
          className={`font-[family-name:var(--font-playfair)] ${initialSize} font-light leading-none tracking-[-0.04em] text-[color:var(--color-ink)] [font-feature-settings:'lnum','ss01']`}
        >
          {initial}
        </span>
      </div>

      {/* Footer — accent rule + project name as legible label */}
      <div className="relative flex flex-col gap-3">
        <span
          aria-hidden
          className="block h-[2px] w-12 bg-[color:var(--color-ink-soft)]"
        />
        <span className="font-[family-name:var(--font-playfair)] text-lg leading-snug text-[color:var(--color-ink)] md:text-2xl">
          {title}
        </span>
      </div>
    </div>
  );
}

export function ProjectCover({ project, numeral }: Props) {
  const { coverImage, title } = project;
  const transitionName = `cover-${project.slug ?? project.id}`;
  const focal = coverImage.focalPoint ?? "center";
  const placeholder = isPlaceholder(coverImage.src);
  const initial = displayInitial(title);
  const kickerLabel = numeral ? `Plate ${numeral}` : "Plate";

  if (coverImage.layout === "beside") {
    return (
      <header data-layout="beside" className="grid grid-cols-12 gap-6 pt-24">
        <div className="col-span-12 md:col-span-7 relative aspect-[4/3] overflow-hidden border border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)]">
          {placeholder ? (
            <TypographyPlate
              title={title}
              initial={initial}
              kickerLabel={kickerLabel}
              transitionName={transitionName}
              variant="beside"
            />
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
            <span className="font-[family-name:var(--font-playfair)] text-5xl text-[color:var(--color-ink-soft)] mb-4">
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
        <TypographyPlate
          title={title}
          initial={initial}
          kickerLabel={kickerLabel}
          transitionName={transitionName}
          variant="overlay"
        />
        {/* Screen-reader-only h1 so the page still exposes the title as the
            primary heading even when the plate is purely decorative. */}
        <h1 className="sr-only">{title}</h1>
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
