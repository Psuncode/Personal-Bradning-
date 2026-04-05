import { projectsData } from '../data/projects';

export function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl text-gray-900 mb-4">
            All Projects
          </h1>
          <p className="font-['Inter'] text-xl text-gray-600 max-w-2xl">
            A complete collection of my work in healthcare technology, AI, and product management.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projectsData.map((project) => (
            <a
              key={project.slug}
              href={`/projects/${project.slug}`}
              className="group block bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-gray-900 hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-gray-900 text-white rounded-full font-['Inter'] text-sm">
                    {project.category}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="font-['Playfair_Display'] text-2xl text-gray-900 mb-2 group-hover:text-gray-600 transition-colors">
                    {project.title}
                  </h3>
                  <p className="font-['Inter'] text-gray-600 leading-relaxed">
                    {project.shortDescription}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {project.metrics.slice(0, 2).map((metric, idx) => (
                    <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-['Playfair_Display'] text-2xl text-gray-900">
                        {metric.value}
                      </div>
                      <div className="font-['Inter'] text-xs text-gray-600">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-['Inter'] text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 font-['Inter'] text-gray-900 pt-2">
                  View Details
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 10H15M15 10L10 5M15 10L10 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
