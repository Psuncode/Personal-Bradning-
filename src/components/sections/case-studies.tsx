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
    <section id="work" className="bg-white py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl text-gray-900 mb-4">
            Featured Work
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl">
            Impact-driven case studies in healthcare product strategy and AI innovation.
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
              <article key={project.id} className="grid md:grid-cols-12 gap-8">
                {/* Sticky left column */}
                <div className="md:col-span-5 space-y-8 md:sticky md:top-32 md:self-start">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 bg-gray-900 text-white rounded-full text-sm">
                        {subtitle}
                      </span>
                    </div>
                    <h3 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-gray-900 mb-8">
                      {project.title}
                    </h3>

                    {/* Impact metrics */}
                    <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl">
                      {(project.metrics ?? []).map((metric, idx) => (
                        <div key={idx} className="text-center">
                          <div className="font-[family-name:var(--font-playfair)] text-2xl text-gray-900 mb-1 leading-tight">
                            {metric}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 uppercase tracking-wider text-sm">
                        Challenge
                      </h4>
                      <p className="text-gray-600 leading-relaxed">{project.problem}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 uppercase tracking-wider text-sm">
                        Approach
                      </h4>
                      <p className="text-gray-600 leading-relaxed">{project.solution}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 uppercase tracking-wider text-sm">
                        Outcomes
                      </h4>
                      <ul className="space-y-2">
                        {outcomes.map((outcome, idx) => (
                          <li key={idx} className="text-gray-600 leading-relaxed flex items-start gap-2">
                            <svg className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
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
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Scrolling right column */}
                <div className="md:col-span-7 space-y-6">
                  {images.map((image, imgIndex) => (
                    <div key={imgIndex} className="relative group overflow-hidden rounded-2xl">
                      <img
                        src={image}
                        alt={`${project.title} visual ${imgIndex + 1}`}
                        className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
