import Link from "next/link";
import { projects } from "@/data/projects";

interface ProjectsGridProps {
  featured?: boolean;
}

export function ProjectsGrid({ featured = false }: ProjectsGridProps) {
  const displayProjects = featured
    ? projects.filter((p) => p.featured).slice(0, 3)
    : projects;

  return (
    <section className="bg-[#faf9f7] py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-gray-900 mb-4">
            {featured ? "Featured Projects" : "All Projects"}
          </h1>
          <p className="text-gray-600 text-lg">A selection of things I&apos;ve built</p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {displayProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group block bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gray-900 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              {/* Placeholder image with letter avatar */}
              <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="font-[family-name:var(--font-playfair)] text-5xl text-gray-300">
                  {project.title[0]}
                </span>
                <span className="absolute top-4 right-4 px-3 py-1 bg-gray-900 text-white rounded-full text-sm">
                  {project.techStack[0]}
                </span>
              </div>

              <div className="p-6 space-y-4">
                <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900">
                  {project.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{project.description}</p>

                {project.metrics && project.metrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {project.metrics.slice(0, 2).map((metric, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3 text-center">
                        <p className="text-xs font-semibold text-gray-900 leading-tight">{metric}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {project.techStack.slice(1, 4).map((tech) => (
                    <span key={tech} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {tech}
                    </span>
                  ))}
                </div>

                <p className="text-sm font-medium text-gray-900 group-hover:underline">
                  View Details →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {featured && (
          <div className="mt-12 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-900 text-gray-900 rounded-full hover:bg-gray-900 hover:text-white transition-colors font-medium"
            >
              View All Projects
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
