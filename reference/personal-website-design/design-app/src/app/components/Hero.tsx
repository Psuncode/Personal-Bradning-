export function Hero() {
  return (
    <section className="bg-[#0a0a0a] text-white min-h-screen flex items-center justify-center px-6 md:px-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-6xl w-full relative z-10">
        <div className="space-y-8">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-['Playfair_Display'] leading-[1.1] max-w-5xl">
            Creative Thinker. Modern Builder.
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 font-['Inter'] max-w-3xl">
            Product Manager specializing in Healthcare Technology and AI-Powered Solutions.
          </p>
          
          <div className="pt-8 flex flex-wrap gap-4">
            <a 
              href="#contact" 
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
      </div>
      
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
        <div className="animate-bounce">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M12 19L6 13M12 19L18 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
}