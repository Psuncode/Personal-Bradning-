"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { projects } from "@/data/projects";

// Local image paths per project. Add files at these paths to replace
// the editorial typography "plate" fallback shown until imagery is ready.
// See docs/IMAGES_TO_UPLOAD.md (P1) for the full naming map.
const projectImages: Record<string, string[]> = {
  "inara-health": [],
  "lds-church-pm": [],
  "nursa-ai-tb": [],
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
              <motion.article 
                key={project.id} 
                className="editorial-rule grid gap-8 pt-10 md:grid-cols-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
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
                      <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
                        Outcomes
                      </h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {outcomes.map((outcome, idx) => {
                          const match = outcome.match(/^([\$\d\.,%KMBT\+]+)\s*(.*)/i);
                          return (
                            <div key={idx} className="editorial-card rounded-2xl p-4 transition-all hover:-translate-y-1 bg-white/50 border border-[color:var(--color-rule)] h-full flex flex-col justify-center">
                              {match ? (
                                <>
                                  <div className="font-[family-name:var(--font-playfair)] text-3xl font-medium text-[color:var(--color-ink)] mb-1">
                                    {match[1]}
                                  </div>
                                  <div className="text-sm leading-6 text-[color:var(--color-ink-soft)]">
                                    {match[2]}
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-start gap-2 text-sm leading-6 text-[color:var(--color-ink-soft)]">
                                  <svg className="mt-1 h-4 w-4 shrink-0 text-[color:var(--color-accent)]" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                                  </svg>
                                  <span>{outcome}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
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
                    className="group inline-flex items-center gap-2 pt-2 text-sm font-medium uppercase tracking-[0.18em] text-[color:var(--color-accent)] transition-all hover:text-[color:var(--color-ink)]"
                  >
                    <span className="group-hover:underline">View Full Case Study</span>
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 4 }}
                      className="inline-block"
                    >
                      →
                    </motion.span>
                  </Link>
                </div>

                {/* Scrolling right column */}
                <div className="md:col-span-7 space-y-6">
                  {(images.length > 0 ? images : ["plate-1", "plate-2"]).map((image, imgIndex) => (
                    <div key={imgIndex} className="group editorial-card relative h-[500px] overflow-hidden rounded-[2rem] p-3">
                      {images.length > 0 ? (
                        <>
                          <Image
                            src={image}
                            alt=""
                            fill
                            className="rounded-[1.35rem] object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                            sizes="(max-width: 768px) 100vw, 58vw"
                          />
                          <div className="absolute inset-3 rounded-[1.35rem] bg-gradient-to-t from-black/15 to-transparent" />
                        </>
                      ) : (
                        <div className="flex h-full w-full flex-col justify-between rounded-[1.35rem] bg-[color:var(--color-paper-elevated)] p-10">
                          <div className="flex items-center justify-between">
                            <span className="text-xs uppercase tracking-[0.28em] text-[color:var(--color-accent)]">
                              Plate {String(imgIndex + 1).padStart(2, "0")}
                            </span>
                            <span className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-ink-soft)]">
                              {subtitle}
                            </span>
                          </div>
                          <div>
                            <p className="font-[family-name:var(--font-playfair)] text-5xl leading-[0.95] tracking-[-0.01em] text-[color:var(--color-ink)] md:text-6xl">
                              {project.title}
                            </p>
                            <p className="mt-6 max-w-md text-sm leading-7 text-[color:var(--color-ink-soft)]">
                              {project.description}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>

        <motion.div 
          className="mt-32 rounded-[2.5rem] bg-[color:var(--color-ink)] px-8 py-16 text-center text-[color:var(--color-paper-elevated)] md:px-12 md:py-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <p className="editorial-kicker !text-[color:var(--color-paper-elevated)] opacity-80 mb-6">Selected Work</p>
          <h2 className="mb-6 font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[color:var(--color-paper-elevated)]">
            More in the archive.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-[color:var(--color-paper-elevated)] opacity-80">
            Healthcare hardware, enterprise PM, AI shipped, analytics — the full catalogue lives on the projects page.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 rounded-full bg-[color:var(--color-paper)] px-8 py-4 text-sm font-medium text-[color:var(--color-ink)] transition-transform hover:scale-105"
            >
              See All Projects
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
