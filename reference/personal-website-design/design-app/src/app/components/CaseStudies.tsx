export function CaseStudies() {
  const caseStudies = [
    {
      title: "Inara Health",
      subtitle: "Maternal Health Tech",
      impacts: [
        { metric: "15K+", label: "Women Monitored" },
        { metric: "12 months", label: "Product Development" },
        { metric: "3 countries", label: "Deployment" }
      ],
      problem: "Pregnant women in low-resource settings lack access to consistent progesterone monitoring, leading to preventable complications and adverse outcomes. Traditional lab-based testing is expensive and requires multiple clinic visits.",
      solution: "Led product strategy for a mobile health platform that enables at-home progesterone monitoring using connected devices and AI-powered analysis. Worked with clinical teams to design workflows that integrate with existing prenatal care protocols.",
      outcomes: [
        "Successfully deployed across 3 countries in sub-Saharan Africa",
        "Reduced need for clinic visits by 60% while maintaining care quality",
        "Received positive feedback from 94% of participating healthcare providers"
      ],
      tags: ["MedTech", "Product Strategy", "Global Health"],
      images: [
        "https://images.unsplash.com/photo-1766934587214-86e21b3ae093?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwZGVzaWduJTIwY29uY2VwdHxlbnwxfHx8fDE3NzI0NDg0NTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBwYXR0ZXJufGVufDF8fHx8MTc3MjQwNDcxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      ]
    },
    {
      title: "LDS Church Product Management",
      subtitle: "Enterprise Faith Tech",
      impacts: [
        { metric: "16M+", label: "Global Users" },
        { metric: "20+", label: "Languages Supported" },
        { metric: "5 platforms", label: "Web, iOS, Android" }
      ],
      problem: "Church members needed a unified digital experience to access religious content, connect with their congregation, and manage church responsibilities. Existing solutions were fragmented across multiple platforms with inconsistent experiences.",
      solution: "Managed product development for a suite of digital tools serving millions of church members worldwide. Conducted extensive user research across diverse demographics and coordinated with engineering, design, and content teams to deliver cohesive experiences.",
      outcomes: [
        "Launched features used by 16M+ members across 20+ languages",
        "Improved feature adoption by 140% through streamlined onboarding",
        "Achieved 4.8/5 app store rating with 500K+ reviews"
      ],
      tags: ["Product Management", "Enterprise", "Global Scale"],
      images: [
        "https://images.unsplash.com/photo-1750056393306-ac672d0dbb8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcmVhdGl2ZSUyMHdvcmtzcGFjZSUyMG1vY2t1cHxlbnwxfHx8fDE3NzI0NDQ2MDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1647368890626-7e9e59c05a55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJjaGl0ZWN0dXJlJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzcyNDg4NDA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      ]
    },
    {
      title: "Nursa AI TB Detection",
      subtitle: "AI Healthcare Diagnostics",
      impacts: [
        { metric: "92%", label: "Detection Accuracy" },
        { metric: "8 months", label: "Development to Pilot" },
        { metric: "5 clinics", label: "Clinical Validation" }
      ],
      problem: "Tuberculosis remains a leading cause of death in developing nations, but diagnosis is slow and requires specialized lab equipment. Early detection is critical but inaccessible in many communities.",
      solution: "Managed the development of an AI-powered TB screening tool that analyzes chest X-rays to flag potential cases for further testing. Collaborated with radiologists, data scientists, and public health experts to ensure clinical validity and practical deployment.",
      outcomes: [
        "Achieved 92% accuracy validated across 5 clinical sites",
        "Reduced time to preliminary diagnosis from 2 weeks to 24 hours",
        "Enabled screening in rural clinics without on-site radiologists"
      ],
      tags: ["AI/ML", "Healthcare", "Diagnostics"],
      images: [
        "https://images.unsplash.com/photo-1688413709025-5f085266935a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMHRlY2hub2xvZ3klMjBwYXR0ZXJufGVufDF8fHx8MTc3MjQwNDcxMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
        "https://images.unsplash.com/photo-1766934587214-86e21b3ae093?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9kdWN0JTIwZGVzaWduJTIwY29uY2VwdHxlbnwxfHx8fDE3NzI0NDg0NTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
      ]
    }
  ];

  return (
    <section id="work" className="bg-white py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="font-['Playfair_Display'] text-5xl md:text-6xl text-gray-900 mb-4">
            Featured Work
          </h2>
          <p className="font-['Inter'] text-xl text-gray-600 max-w-2xl">
            Impact-driven case studies in healthcare product strategy and AI innovation.
          </p>
        </div>
        
        <div className="space-y-32">
          {caseStudies.map((study, index) => (
            <article key={index} className="grid md:grid-cols-12 gap-8">
              {/* Sticky Left Column - Text Content */}
              <div className="md:col-span-5 space-y-8 md:sticky md:top-32 md:self-start">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-gray-900 text-white rounded-full font-['Inter'] text-sm">
                      {study.subtitle}
                    </span>
                  </div>
                  <h3 className="font-['Playfair_Display'] text-4xl md:text-5xl text-gray-900 mb-8">
                    {study.title}
                  </h3>
                  
                  {/* Impact Metrics - Lead with Results */}
                  <div className="grid grid-cols-3 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl">
                    {study.impacts.map((impact, idx) => (
                      <div key={idx} className="text-center">
                        <div className="font-['Playfair_Display'] text-3xl md:text-4xl text-gray-900 mb-1">
                          {impact.metric}
                        </div>
                        <div className="font-['Inter'] text-sm text-gray-600">
                          {impact.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-['Inter'] font-semibold text-gray-900 mb-2 uppercase tracking-wider text-sm">
                      Challenge
                    </h4>
                    <p className="font-['Inter'] text-gray-600 leading-relaxed">
                      {study.problem}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-['Inter'] font-semibold text-gray-900 mb-2 uppercase tracking-wider text-sm">
                      Approach
                    </h4>
                    <p className="font-['Inter'] text-gray-600 leading-relaxed">
                      {study.solution}
                    </p>
                  </div>
                  
                  <div>
                    <h4 className="font-['Inter'] font-semibold text-gray-900 mb-2 uppercase tracking-wider text-sm">
                      Outcomes
                    </h4>
                    <ul className="space-y-2">
                      {study.outcomes.map((outcome, idx) => (
                        <li key={idx} className="font-['Inter'] text-gray-600 leading-relaxed flex items-start gap-2">
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
                  {study.tags.map((tag, tagIndex) => (
                    <span 
                      key={tagIndex}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-['Inter'] text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Scrolling Right Column - Visuals */}
              <div className="md:col-span-7 space-y-6">
                {study.images.map((image, imgIndex) => (
                  <div key={imgIndex} className="relative group overflow-hidden rounded-2xl">
                    <img 
                      src={image}
                      alt={`${study.title} visual ${imgIndex + 1}`}
                      className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
