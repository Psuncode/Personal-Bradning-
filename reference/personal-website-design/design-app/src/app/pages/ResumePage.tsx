export function ResumePage() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-24 px-6 md:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header with Download */}
        <div className="flex justify-between items-start mb-16">
          <div>
            <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl text-gray-900 mb-4">
              Resume
            </h1>
            <p className="font-['Inter'] text-xl text-gray-600">
              Product Manager specializing in Healthcare Technology
            </p>
          </div>
          <a
            href="/resume.pdf"
            download
            className="hidden md:inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-['Inter']"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3V15M12 15L8 11M12 15L16 11M3 17V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download PDF
          </a>
        </div>

        {/* Experience */}
        <section className="mb-16">
          <h2 className="font-['Playfair_Display'] text-3xl text-gray-900 mb-8 pb-4 border-b-2 border-gray-200">
            Experience
          </h2>
          
          <div className="space-y-12">
            <div className="relative pl-8 border-l-2 border-gray-200">
              <div className="absolute w-4 h-4 bg-gray-900 rounded-full -left-[9px] top-1" />
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                <div>
                  <h3 className="font-['Inter'] font-semibold text-xl text-gray-900">Product Manager</h3>
                  <p className="font-['Inter'] text-gray-600">Inara Health</p>
                </div>
                <span className="font-['Inter'] text-gray-500 text-sm">2024 - Present</span>
              </div>
              <ul className="font-['Inter'] text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Led product strategy for maternal health monitoring platform deployed across 3 countries</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Managed cross-functional teams including hardware, software, and clinical stakeholders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Achieved 15K+ users and 60% reduction in clinic visits while maintaining care quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Conducted field research and user testing in low-resource healthcare settings</span>
                </li>
              </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-gray-200">
              <div className="absolute w-4 h-4 bg-gray-900 rounded-full -left-[9px] top-1" />
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                <div>
                  <h3 className="font-['Inter'] font-semibold text-xl text-gray-900">Product Manager</h3>
                  <p className="font-['Inter'] text-gray-600">The Church of Jesus Christ of Latter-day Saints</p>
                </div>
                <span className="font-['Inter'] text-gray-500 text-sm">2023 - 2024</span>
              </div>
              <ul className="font-['Inter'] text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Managed digital products serving 16M+ users across 20+ languages</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Improved feature adoption by 140% through streamlined user onboarding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Achieved 4.8/5 app store rating with 500K+ reviews across iOS and Android</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Led user research across diverse demographics and technological contexts</span>
                </li>
              </ul>
            </div>

            <div className="relative pl-8 border-l-2 border-gray-200">
              <div className="absolute w-4 h-4 bg-gray-900 rounded-full -left-[9px] top-1" />
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-3">
                <div>
                  <h3 className="font-['Inter'] font-semibold text-xl text-gray-900">AI Product Manager</h3>
                  <p className="font-['Inter'] text-gray-600">Nursa Health</p>
                </div>
                <span className="font-['Inter'] text-gray-500 text-sm">2022 - 2023</span>
              </div>
              <ul className="font-['Inter'] text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Managed development of AI-powered TB detection tool with 92% accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Coordinated clinical validation across 5 sites with radiologists and data scientists</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Reduced time to preliminary diagnosis from 2 weeks to 24 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400 mt-1">•</span>
                  <span>Navigated regulatory requirements and secured partnerships with health ministries</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Education */}
        <section className="mb-16">
          <h2 className="font-['Playfair_Display'] text-3xl text-gray-900 mb-8 pb-4 border-b-2 border-gray-200">
            Education
          </h2>
          
          <div className="space-y-8">
            <div>
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                <div>
                  <h3 className="font-['Inter'] font-semibold text-xl text-gray-900">Brigham Young University</h3>
                  <p className="font-['Inter'] text-gray-600">Bachelor of Science, Strategy & Product Management</p>
                </div>
                <span className="font-['Inter'] text-gray-500 text-sm">Expected 2026</span>
              </div>
              <p className="font-['Inter'] text-gray-600 mt-2">
                Focus: Healthcare Technology, Product Strategy, Data Analytics
              </p>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="mb-16">
          <h2 className="font-['Playfair_Display'] text-3xl text-gray-900 mb-8 pb-4 border-b-2 border-gray-200">
            Skills & Expertise
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-['Inter'] font-semibold text-lg text-gray-900 mb-4">Product Management</h3>
              <ul className="font-['Inter'] text-gray-600 space-y-2">
                <li>• Product Strategy & Roadmapping</li>
                <li>• User Research & Testing</li>
                <li>• Agile/Scrum Methodologies</li>
                <li>• Stakeholder Management</li>
                <li>• Data-Driven Decision Making</li>
                <li>• Go-to-Market Strategy</li>
              </ul>
            </div>

            <div>
              <h3 className="font-['Inter'] font-semibold text-lg text-gray-900 mb-4">Healthcare & Technical</h3>
              <ul className="font-['Inter'] text-gray-600 space-y-2">
                <li>• Healthcare Technology</li>
                <li>• AI/Machine Learning Products</li>
                <li>• Medical Device Regulation</li>
                <li>• Clinical Workflows</li>
                <li>• HIPAA Compliance</li>
                <li>• Global Health Systems</li>
              </ul>
            </div>

            <div>
              <h3 className="font-['Inter'] font-semibold text-lg text-gray-900 mb-4">Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {['SQL', 'Python', 'React', 'Figma', 'Jira', 'Analytics Tools', 'A/B Testing', 'APIs'].map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-['Inter'] text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-['Inter'] font-semibold text-lg text-gray-900 mb-4">Languages</h3>
              <ul className="font-['Inter'] text-gray-600 space-y-2">
                <li>• English (Native)</li>
                <li>• Spanish (Professional)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="mb-16">
          <h2 className="font-['Playfair_Display'] text-3xl text-gray-900 mb-8 pb-4 border-b-2 border-gray-200">
            Certifications & Awards
          </h2>
          
          <ul className="font-['Inter'] text-gray-600 space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-900 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>Certified Scrum Product Owner (CSPO)</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-900 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>Google Data Analytics Professional Certificate</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 text-gray-900 mt-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span>BYU Healthcare Innovation Award, 2024</span>
            </li>
          </ul>
        </section>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-gray-200">
          <a
            href="mailto:ps324@byu.edu"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-['Inter'] font-medium"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}
