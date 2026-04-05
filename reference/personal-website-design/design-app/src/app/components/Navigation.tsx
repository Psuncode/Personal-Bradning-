export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-6 flex justify-between items-center">
        <a href="/" className="font-['Playfair_Display'] text-2xl hover:text-gray-600 transition-colors">
          Portfolio
        </a>
        
        <div className="hidden md:flex gap-8 font-['Inter']">
          <a href="/projects" className="text-gray-600 hover:text-black transition-colors">Projects</a>
          <a href="/blog" className="text-gray-600 hover:text-black transition-colors">Writing</a>
          <a href="/resume" className="text-gray-600 hover:text-black transition-colors">Resume</a>
          <a href="/meet" className="text-gray-600 hover:text-black transition-colors">Meet</a>
          <a href="/contact" className="text-gray-600 hover:text-black transition-colors">Contact</a>
        </div>
        
        <button className="md:hidden">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}