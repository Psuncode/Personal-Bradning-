import Link from 'next/link';

export default function PhotographyHome() {
  return (
    <div className="py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Philip Sun Photography
        </h1>
        <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
          Portraits, landscapes, and event photography based in Provo, Utah.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/gallery"
            className="px-8 py-4 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-700 transition-colors"
          >
            View Gallery
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-4 border border-gray-300 text-gray-900 rounded-full font-medium hover:bg-gray-50 transition-colors"
          >
            See Pricing
          </Link>
        </div>
      </div>
    </div>
  );
}
