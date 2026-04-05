import { projectsData } from '../data/projects';

interface ProjectDetailPageProps {
  slug: string;
}

export function ProjectDetailPage({ slug }: ProjectDetailPageProps) {
  const project = projectsData.find((p) => p.slug === slug);

  if (!project) {
    return (
      <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-['Playfair_Display'] text-4xl text-gray-900 mb-4">Project Not Found</h1>
          <a href="/projects" className="font-['Inter'] text-gray-600 hover:text-gray-900 underline">
            Back to Projects
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white pt-32 pb-16 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <a href="/projects" className="inline-flex items-center gap-2 font-['Inter'] text-gray-300 hover:text-white mb-8 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 10H5M5 10L10 15M5 10L10 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to Projects
          </a>

          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full font-['Inter'] text-sm">
              {project.category}
            </span>
          </div>

          <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl mb-4">
            {project.title}
          </h1>
          <p className="font-['Playfair_Display'] text-2xl text-gray-300 italic mb-8">
            {project.subtitle}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {project.metrics.map((metric, idx) => (
              <div key={idx} className="text-center p-4 bg-white/10 backdrop-blur rounded-xl">
                <div className="font-['Playfair_Display'] text-3xl md:text-4xl mb-1">
                  {metric.value}
                </div>
                <div className="font-['Inter'] text-sm text-gray-300">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-white/10 backdrop-blur text-white rounded-full font-['Inter'] text-sm border border-white/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Project Image */}
      <div className="relative h-[500px] overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="py-24 px-6 md:px-12">
        <div className="max-w-4xl mx-auto space-y-16">
          {/* Role */}
          <div>
            <h2 className="font-['Inter'] font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">
              My Role
            </h2>
            <p className="font-['Playfair_Display'] text-2xl text-gray-900">
              {project.role}
            </p>
          </div>

          {/* Challenge */}
          <div>
            <h2 className="font-['Inter'] font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">
              The Challenge
            </h2>
            <p className="font-['Inter'] text-lg text-gray-600 leading-relaxed">
              {project.problem}
            </p>
          </div>

          {/* Approach */}
          <div>
            <h2 className="font-['Inter'] font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">
              My Approach
            </h2>
            <p className="font-['Inter'] text-lg text-gray-600 leading-relaxed">
              {project.approach}
            </p>
          </div>

          {/* Outcomes */}
          <div>
            <h2 className="font-['Inter'] font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">
              Outcomes & Impact
            </h2>
            <ul className="space-y-3">
              {project.outcomes.map((outcome, idx) => (
                <li key={idx} className="font-['Inter'] text-lg text-gray-600 leading-relaxed flex items-start gap-3">
                  <svg className="w-6 h-6 text-gray-900 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          {project.techStack && (
            <div>
              <h2 className="font-['Inter'] font-semibold text-gray-900 mb-4 uppercase tracking-wider text-sm">
                Technologies Used
              </h2>
              <div className="flex flex-wrap gap-3">
                {project.techStack.map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-4 py-2 bg-gray-900 text-white rounded-full font-['Inter'] text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="pt-8 border-t border-gray-200">
            <p className="font-['Inter'] text-lg text-gray-600 mb-6">
              Interested in learning more about this project or discussing similar challenges?
            </p>
            <a
              href="mailto:ps324@byu.edu"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-['Inter'] font-medium"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
