export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="text-center">
        <h1 className="font-['Playfair_Display'] text-6xl md:text-8xl text-gray-900 mb-4">
          404
        </h1>
        <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl text-gray-900 mb-4">
          Page Not Found
        </h2>
        <p className="font-['Inter'] text-lg text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-['Inter'] font-medium"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 10H5M5 10L10 15M5 10L10 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back to Home
        </a>
      </div>
    </div>
  );
}
