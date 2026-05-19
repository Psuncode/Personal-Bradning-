import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Project } from "@/types";
import { ProjectCover } from "@/components/editorial/project-cover";
import { ProjectNavLinks } from "@/components/editorial/project-nav-links";

interface ProjectDetailViewProps {
  project: Project;
  allProjects: Project[];
  numeral?: string;
}

export function ProjectDetailView({ project, allProjects, numeral }: ProjectDetailViewProps) {
  return (
    <div>
      <ProjectCover project={project} numeral={numeral} />

      <div className="editorial-shell py-20">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-7 space-y-12">
            <p className="text-lg leading-8 text-[color:var(--color-ink-soft)] italic">
              {project.description}
            </p>

            {project.problem && (
              <section>
                <p className="editorial-kicker mb-3">Problem</p>
                <p className="text-base leading-8 text-[color:var(--color-ink)]">
                  {project.problem}
                </p>
              </section>
            )}

            {project.solution && (
              <section>
                <p className="editorial-kicker mb-3">Approach</p>
                <p className="text-base leading-8 text-[color:var(--color-ink)]">
                  {project.solution}
                </p>
              </section>
            )}

            {project.results && (
              <section>
                <p className="editorial-kicker mb-3">Results</p>
                <p className="text-base leading-8 text-[color:var(--color-ink)]">
                  {project.results}
                </p>
              </section>
            )}

            <section>
              <p className="editorial-kicker mb-3">Tech Stack</p>
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)] text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[color:var(--color-ink)] text-[color:var(--color-paper-elevated)] rounded-full text-sm font-medium hover:bg-[color:var(--color-accent)] transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Launch Tool
              </a>
            )}
          </div>

          <aside className="col-span-12 md:col-span-5 space-y-12 md:pl-8">
            {project.metrics && project.metrics.length > 0 && (
              <section>
                <p className="editorial-kicker mb-4">Numbers</p>
                <ul className="space-y-3">
                  {project.metrics.map((metric, i) => (
                    <li
                      key={i}
                      className="border-l-2 border-[color:var(--color-accent)] pl-4 text-base leading-7 text-[color:var(--color-ink)]"
                    >
                      {metric}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {project.lessonsLearned && (
              <section>
                <p className="editorial-kicker mb-4">Lesson</p>
                <blockquote className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl leading-snug text-[color:var(--color-ink)]">
                  &ldquo;{project.lessonsLearned}&rdquo;
                </blockquote>
              </section>
            )}
          </aside>
        </div>

        <div className="border-t border-[color:var(--color-rule)] mt-20 pt-12 text-center">
          <p className="text-[color:var(--color-ink-soft)] mb-6">
            Want to talk about this work?
          </p>
          <Link
            href="/meet"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[color:var(--color-ink)] text-[color:var(--color-paper-elevated)] rounded-full font-medium hover:bg-[color:var(--color-accent)] transition-colors"
          >
            Book a Call
          </Link>
        </div>
      </div>

      <ProjectNavLinks current={project} all={allProjects} />
    </div>
  );
}
