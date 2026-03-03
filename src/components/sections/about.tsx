export function About() {
  return (
    <section id="about" className="bg-[#faf9f7] py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-12 gap-12">
          {/* Content — 7 columns */}
          <div className="md:col-span-7 space-y-6">
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-gray-900">
              Building healthcare solutions that improve lives through thoughtful product strategy.
            </h2>

            <div className="text-lg text-gray-600 space-y-4 leading-relaxed">
              <p>
                As a Product Manager and Founder with a passion for healthcare innovation, I focus on bridging the gap between complex medical needs and intuitive digital solutions.
              </p>
              <p>
                My work spans maternal health diagnostics, enterprise-scale product management, and AI-powered healthcare verification. I believe great healthcare products start with deep empathy for patients and providers.
              </p>
            </div>

            <div className="pt-8">
              <h3 className="font-[family-name:var(--font-playfair)] text-2xl mb-6 text-gray-900">Core Competencies</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4.5 17.5C4.5 18.8807 5.61929 20 7 20C8.38071 20 9.5 18.8807 9.5 17.5C9.5 16.1193 8.38071 15 7 15C5.61929 15 4.5 16.1193 4.5 17.5ZM4.5 17.5V11C4.5 9.067 6.067 7.5 8 7.5H10M14.5 6.5C14.5 7.88071 15.6193 9 17 9C18.3807 9 19.5 7.88071 19.5 6.5C19.5 5.11929 18.3807 4 17 4C15.6193 4 14.5 5.11929 14.5 6.5ZM14.5 6.5V13C14.5 14.933 16.067 16.5 18 16.5H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Healthcare Product Strategy</h4>
                    <p className="text-gray-600">Designing patient-centered digital health solutions that navigate complex regulatory and clinical requirements.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 10V3L4 14H11L11 21L20 10L13 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">AI in Healthcare</h4>
                    <p className="text-gray-600">Implementing machine learning and AI to improve diagnostic accuracy and clinical workflows.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 20H22V18C22 16.3431 20.6569 15 19 15C18.0444 15 17.1931 15.4468 16.6438 16.1429M17 20H7M17 20V18C17 17.3438 16.8736 16.717 16.6438 16.1429M7 20H2V18C2 16.3431 3.34315 15 5 15C5.95561 15 6.80686 15.4468 7.35625 16.1429M7 20V18C7 17.3438 7.12642 16.717 7.35625 16.1429M7.35625 16.1429C8.0935 14.301 9.89482 13 12 13C14.1052 13 15.9065 14.301 16.6438 16.1429M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7ZM21 10C21 11.1046 20.1046 12 19 12C17.8954 12 17 11.1046 17 10C17 8.89543 17.8954 8 19 8C20.1046 8 21 8.89543 21 10ZM7 10C7 11.1046 6.10457 12 5 12C3.89543 12 3 11.1046 3 10C3 8.89543 3.89543 8 5 8C6.10457 8 7 8.89543 7 10Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">User Research & Testing</h4>
                    <p className="text-gray-600">Deep discovery with patients, clinicians, and stakeholders to build products that truly solve problems.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky image — 5 columns */}
          <div className="md:col-span-5 md:col-start-8">
            <div className="sticky top-32">
              <img
                src="https://images.unsplash.com/photo-1700619663094-be321751b545?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
                alt="Workspace"
                className="rounded-2xl w-full h-[600px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
