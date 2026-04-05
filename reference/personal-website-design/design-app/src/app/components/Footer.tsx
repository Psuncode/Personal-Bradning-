export function Footer() {
  return (
    <footer id="contact" className="bg-[#0a0a0a] text-white py-24 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="font-['Playfair_Display'] text-4xl md:text-5xl mb-6">
              Let's work together.
            </h2>
            <p className="font-['Inter'] text-gray-400 text-lg leading-relaxed mb-8">
              Open to opportunities in healthcare product management, medtech innovation, and AI-powered health solutions. Always interested in challenging problems and mission-driven teams.
            </p>
            
            {/* Secondary CTA - Repeated at bottom per feedback */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="mailto:ps324@byu.edu" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black rounded-full hover:bg-gray-100 transition-colors font-['Inter'] font-medium"
              >
                Get in Touch
              </a>
              <a 
                href="#resume" 
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white text-white rounded-full hover:bg-white hover:text-black transition-colors font-['Inter'] font-medium"
              >
                View Resume
              </a>
            </div>
          </div>
          
          <div className="flex flex-col justify-center space-y-4">
            <a 
              href="mailto:ps324@byu.edu"
              className="font-['Inter'] text-2xl hover:text-gray-300 transition-colors"
            >
              ps324@byu.edu
            </a>
            <div className="flex gap-6 pt-4">
              <a 
                href="https://linkedin.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                LinkedIn
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Twitter
              </a>
              <a 
                href="https://github.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-['Inter'] text-gray-500 text-sm">
            © 2026. All rights reserved.
          </p>
          <p className="font-['Inter'] text-gray-500 text-sm">
            Built with care and attention to detail.
          </p>
        </div>
      </div>
    </footer>
  );
}