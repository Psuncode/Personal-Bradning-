export function ContentGrid() {
  const gridItems = [
    // Large Healthcare/AI Project Hero Blocks
    {
      type: "ai-project-hero",
      title: "Progesterone Monitoring System",
      description: "Developed a connected health device ecosystem for at-home hormone monitoring. Integrated with mobile app for data tracking and clinical dashboards for provider oversight.",
      metrics: [
        { value: "15K+", label: "Patients Monitored" },
        { value: "60%", label: "Reduced Clinic Visits" }
      ],
      tags: ["MedTech", "IoT", "Product Strategy"],
      span: "md:col-span-2 md:row-span-2"
    },
    {
      type: "linkedin",
      title: "Why Healthcare PM is Different",
      excerpt: "Building health products isn't just about moving fast—it's about getting it right. Here's what I learned...",
      reactions: "184 reactions",
      span: "md:col-span-1"
    },
    {
      type: "resume",
      title: "View Full Resume",
      description: "Healthcare PM experience across MedTech, Faith Tech, and AI diagnostics.",
      span: "md:col-span-1"
    },
    {
      type: "ai-project-hero",
      title: "TB Detection Neural Network",
      description: "Trained and validated a convolutional neural network to identify tuberculosis patterns in chest X-rays. Worked with radiologists to define ground truth and validate model outputs.",
      metrics: [
        { value: "92%", label: "Detection Accuracy" },
        { value: "24 hrs", label: "Time to Diagnosis" }
      ],
      tags: ["AI/ML", "Computer Vision", "Healthcare"],
      span: "md:col-span-2 md:row-span-2"
    },
    {
      type: "photography",
      title: "Design & Space",
      image: "https://images.unsplash.com/photo-1647368890626-7e9e59c05a55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJjaGl0ZWN0dXJlJTIwcGhvdG9ncmFwaHl8ZW58MXx8fHwxNzcyNDg4NDA5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      span: "md:col-span-1 md:row-span-1"
    },
    {
      type: "healthcare",
      title: "Global Health Fellowship",
      description: "Research on improving healthcare access in low-resource settings through mobile technology.",
      tags: ["Research", "Global Health"],
      span: "md:col-span-1"
    },
    {
      type: "linkedin",
      title: "The Product-Medical Divide",
      excerpt: "Doctors and PMs speak different languages. Here's how I learned to bridge the gap in healthcare product development...",
      reactions: "267 reactions",
      span: "md:col-span-1"
    },
    {
      type: "ai-project",
      title: "Clinical Dashboard Analytics",
      description: "Designed analytics platform for healthcare providers to monitor patient populations and identify intervention opportunities.",
      tags: ["Data Viz", "Healthcare"],
      span: "md:col-span-1"
    },
    {
      type: "photography",
      title: "Urban Studies",
      image: "https://images.unsplash.com/photo-1762436933065-fe6d7f51d4f3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMHN0cmVldCUyMHBob3RvZ3JhcGh5fGVufDF8fHx8MTc3MjQzMzgwM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      span: "md:col-span-1 md:row-span-1"
    }
  ];

  return (
    <section id="projects" className="bg-[#faf9f7] py-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h2 className="font-['Playfair_Display'] text-5xl md:text-6xl text-gray-900 mb-4">
            Projects & Thought Leadership
          </h2>
          <p className="font-['Inter'] text-xl text-gray-600 max-w-2xl">
            Healthcare innovation, side projects, and reflections on building products that matter.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {gridItems.map((item, index) => (
            <div 
              key={index}
              className={`${item.span} rounded-2xl overflow-hidden group cursor-pointer hover:shadow-xl transition-all hover:-translate-y-1`}
            >
              {/* Large AI/Healthcare Project Hero Cards */}
              {item.type === 'ai-project-hero' && (
                <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 h-full p-8 flex flex-col justify-between text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <span className="font-['Inter'] text-sm uppercase tracking-wider opacity-80">Healthcare Tech</span>
                    </div>
                    <h3 className="font-['Playfair_Display'] text-3xl mb-4">{item.title}</h3>
                    <p className="font-['Inter'] text-gray-300 leading-relaxed mb-6">{item.description}</p>
                    
                    {item.metrics && (
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {item.metrics.map((metric, idx) => (
                          <div key={idx}>
                            <div className="font-['Playfair_Display'] text-2xl mb-1">{metric.value}</div>
                            <div className="font-['Inter'] text-xs text-gray-400 uppercase tracking-wider">{metric.label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 relative z-10">
                    {item.tags?.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-3 py-1 bg-white/10 backdrop-blur text-white rounded-full font-['Inter'] text-xs border border-white/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Small Project Cards */}
              {item.type === 'ai-project' && (
                <div className="bg-white h-full p-6 flex flex-col justify-between border-2 border-gray-200 hover:border-gray-900 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 8V16M12 11V16M8 14V16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <span className="font-['Inter'] text-xs text-gray-500 uppercase tracking-wider">Project</span>
                    </div>
                    <h3 className="font-['Playfair_Display'] text-xl text-gray-900 mb-2">{item.title}</h3>
                    <p className="font-['Inter'] text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.tags?.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-['Inter'] text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Healthcare/Research Cards */}
              {item.type === 'healthcare' && (
                <div className="bg-white h-full p-6 flex flex-col justify-between border-2 border-gray-200 hover:border-gray-900 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4.5 17.5C4.5 18.8807 5.61929 20 7 20C8.38071 20 9.5 18.8807 9.5 17.5C9.5 16.1193 8.38071 15 7 15C5.61929 15 4.5 16.1193 4.5 17.5ZM4.5 17.5V11C4.5 9.067 6.067 7.5 8 7.5H10M14.5 6.5C14.5 7.88071 15.6193 9 17 9C18.3807 9 19.5 7.88071 19.5 6.5C19.5 5.11929 18.3807 4 17 4C15.6193 4 14.5 5.11929 14.5 6.5ZM14.5 6.5V13C14.5 14.933 16.067 16.5 18 16.5H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <span className="font-['Inter'] text-xs text-gray-500 uppercase tracking-wider">Healthcare</span>
                    </div>
                    <h3 className="font-['Playfair_Display'] text-xl text-gray-900 mb-2">{item.title}</h3>
                    <p className="font-['Inter'] text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.tags?.map((tag, tagIndex) => (
                      <span 
                        key={tagIndex}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full font-['Inter'] text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* LinkedIn Posts */}
              {item.type === 'linkedin' && (
                <div className="bg-[#0077B5] h-full p-6 flex flex-col justify-between text-white">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                      <span className="font-['Inter'] text-xs uppercase tracking-wider opacity-90">LinkedIn Post</span>
                    </div>
                    <h3 className="font-['Playfair_Display'] text-lg mb-2">{item.title}</h3>
                    <p className="font-['Inter'] text-sm text-blue-100 leading-relaxed">{item.excerpt}</p>
                  </div>
                  <div className="font-['Inter'] text-xs opacity-80 mt-3">
                    {item.reactions}
                  </div>
                </div>
              )}
              
              {/* Photography */}
              {item.type === 'photography' && (
                <div className="relative h-full">
                  <img 
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                    <h3 className="font-['Playfair_Display'] text-xl text-white">{item.title}</h3>
                  </div>
                </div>
              )}
              
              {/* Resume Card */}
              {item.type === 'resume' && (
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 h-full p-6 flex flex-col justify-center items-center text-center hover:from-gray-900 hover:to-gray-800 hover:text-white transition-all group">
                  <svg className="w-12 h-12 mb-3 text-gray-900 group-hover:text-white transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <h3 className="font-['Playfair_Display'] text-xl mb-2">{item.title}</h3>
                  <p className="font-['Inter'] text-sm opacity-70">{item.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
