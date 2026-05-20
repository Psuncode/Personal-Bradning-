import Link from "next/link";
import { projects } from "@/data/projects";
import type { Project } from "@/types";

interface HeadlineProjectProps {
  /** Defaults to the Inara Health entry in src/data/projects.ts. */
  project?: Project;
}

// Subtle ruled/dotted texture so the plate doesn't read as a flat swatch.
// Mirrors `ProjectCover`'s plate texture — same tokens, no hex literals.
const plateTexture: React.CSSProperties = {
  backgroundImage:
    "radial-gradient(circle at 1px 1px, color-mix(in oklab, var(--color-rule) 65%, transparent) 1px, transparent 0)",
  backgroundSize: "18px 18px",
  backgroundPosition: "0 0",
};

export function HeadlineProject({ project }: HeadlineProjectProps) {
  const inara =
    project ?? projects.find((p) => p.slug === "inara-health") ?? projects[0];

  const href = `/projects/${inara.slug}`;

  return (
    <section className="py-24 md:py-32">
      <div className="editorial-shell">
        {/* Typographic plate — full-width 2:1 placeholder. The "device render
            forthcoming" corner label is the design-principle-#9 honest
            placeholder while Inara's real hardware imagery is in flight. */}
        <div
          data-testid="headline-project-plate"
          className="relative w-full aspect-[2/1] overflow-hidden border border-[color:var(--color-rule)] bg-[color:var(--color-paper-elevated)]"
        >
          {/* Dotted texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-60"
            style={plateTexture}
          />

          {/* Corner brackets — editorial print mark */}
          <div aria-hidden className="pointer-events-none absolute inset-3 md:inset-5">
            <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-[color:var(--color-rule)]" />
            <span className="absolute right-0 top-0 h-3 w-3 border-r border-t border-[color:var(--color-rule)]" />
            <span className="absolute bottom-0 left-0 h-3 w-3 border-b border-l border-[color:var(--color-rule)]" />
            <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-[color:var(--color-rule)]" />
          </div>

          {/* Centerpiece — "Inara Health" in Playfair */}
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <span
              aria-hidden
              className="font-[family-name:var(--font-playfair)] text-5xl font-light leading-none tracking-[-0.03em] text-[color:var(--color-ink)] md:text-7xl lg:text-8xl"
            >
              Inara Health
            </span>
          </div>

          {/* Bottom-left corner label — honest placeholder, design principle #9 */}
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
            <span className="text-[0.65rem] uppercase tracking-[0.28em] text-[color:var(--color-ink-soft)] md:text-xs">
              ↳ device render forthcoming
            </span>
          </div>
        </div>

        {/* Eyebrow */}
        <p className="mt-12 text-xs uppercase tracking-widest text-[color:var(--color-ink-soft)]">
          Headline Project · 2025–
        </p>

        {/* H2 */}
        <h2 className="mt-4 font-[family-name:var(--font-playfair)] text-5xl leading-tight tracking-[-0.02em] text-[color:var(--color-ink)] md:text-6xl">
          Inara Health
        </h2>

        {/* Body */}
        <p className="mt-6 max-w-[60ch] text-lg leading-8 text-[color:var(--color-ink-soft)]">
          Progesterone levels are critical in early pregnancy, but current
          testing requires clinic visits and days-long lab delays — leaving
          patients without actionable data during their most vulnerable window.
          Inara is building a wearable continuous progesterone monitor with a
          cross-functional team across biosensing, hardware, and clinical
          research. We&apos;re working toward first wearable prototype
          (milestone forthcoming) and IRB-approved feasibility study (timing
          forthcoming).
        </p>

        {/* Text link, same style as hero CTA */}
        <p className="mt-8">
          <Link
            href={href}
            className="text-base text-[color:var(--color-ink)] transition-colors hover:text-[color:var(--color-accent)] hover:underline"
          >
            Read the case study →
          </Link>
        </p>
      </div>
    </section>
  );
}
