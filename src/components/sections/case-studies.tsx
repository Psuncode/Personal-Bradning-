import Image from "next/image";
import Link from "next/link";
import { projects } from "@/data/projects";

// Placeholder images for the scrolling visual column
const projectImages: Record<string, string[]> = {
  "inara-health": [
    "https://images.unsplash.com/photo-1766934587214-86e21b3ae093?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  ],
  "lds-church-pm": [
    "https://images.unsplash.com/photo-1750056393306-ac672d0dbb8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1647368890626-7e9e59c05a55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  ],
  "nursa-ai-tb": [
    "https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    "https://images.unsplash.com/photo-1766934587214-86e21b3ae093?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
  ],
};

const featuredProjects = projects.filter((p) => p.featured);

export function CaseStudies() {
  return (
    <section id="work" className="px-6 py-24 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="editorial-kicker mb-4">Selected Work</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-5xl text-[color:var(--color-ink)] md:text-6xl">
            Proof, presented with restraint.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[color:var(--color-ink-soft)]">
            A few cases where strategy met measurable execution across healthcare, AI, and enterprise systems.
          </p>
        </div>

        <div className="space-y-32">
          {featuredProjects.map((project) => {
            const images = projectImages[project.id] ?? [];
            const subtitle = project.techStack[0] ?? "Product";
            // Split results string into bullet sentences
            const outcomes = (project.results ?? "")
              .split(/\.\s+/)
              .map((s) => s.replace(/\.$/, "").trim())
              .filter(Boolean);

            return (
              <article key={project.id} className="editorial-rule grid gap-8 pt-10 md:grid-cols-12">
                {/* Sticky left column */}
                <div className="md:col-span-5 space-y-8 md:sticky md:top-32 md:self-start">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="rounded-full bg-[color:var(--color-ink)] px-3 py-1 text-sm text-[color:var(--color-paper-elevated)]">
                        {subtitle}
                      </span>
                    </div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-4xl text-[color:var(--color-ink)] md:text-5xl md:leading-tight">
                      {project.title}
                    </h3>

                    {/* Impact metrics */}
                    <div className="editorial-card mb-8 grid grid-cols-3 gap-4 rounded-[1.75rem] p-6">
                      {(project.metrics ?? []).map((metric, idx) => (
                        <div key={idx} className="text-center">
                          <div className="font-[family-name:var(--font-playfair)] text-2xl leading-tight text-[color:var(--color-ink)]">
                            {metric}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                        Challenge
                      </h4>
                      <p className="leading-8 text-[color:var(--color-ink-soft)]">{project.problem}</p>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                        Approach
                      </h4>
                      <p className="leading-8 text-[color:var(--color-ink-soft)]">{project.solution}</p>
                    </div>

                    <div>
                      <h4 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                        Outcomes
                      </h4>
                      <ul className="space-y-2">
                        {outcomes.map((outcome, idx) => (
                          <li key={idx} className="flex items-start gap-2 leading-8 text-[color:var(--color-ink-soft)]">
                            <svg className="mt-1 h-5 w-5 shrink-0 text-[color:var(--color-accent)]" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                            </svg>
                            {outcome}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-4">
                    {project.techStack.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-[color:var(--color-rule)] bg-[rgba(251,247,241,0.7)] px-4 py-2 text-sm text-[color:var(--color-ink-soft)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/projects/${project.slug}`}
                    className="inline-flex items-center gap-2 pt-2 text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--color-accent)] hover:underline"
                  >
                    View Full Case Study →
                  </Link>
                </div>

                {/* Scrolling right column */}
                <div className="md:col-span-7 space-y-6">
                  {images.map((image, imgIndex) => (
                    <div key={imgIndex} className="group editorial-card relative h-[500px] overflow-hidden rounded-[2rem] p-3">
                      <Image
                        src={image}
                        alt=""
                        fill
                        className="rounded-[1.35rem] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 768px) 100vw, 58vw"
                      />
                      <div className="absolute inset-3 rounded-[1.35rem] bg-gradient-to-t from-black/15 to-transparent" />
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-ink)] px-6 py-3 text-sm font-medium text-[color:var(--color-paper-elevated)] transition-colors hover:bg-[color:var(--color-accent)]"
          >
            See All Projects
          </Link>
        </div>
      </div>
    </section>
  );
}
