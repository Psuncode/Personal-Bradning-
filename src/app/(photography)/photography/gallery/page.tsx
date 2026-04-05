import type { Metadata } from 'next';
import { GalleryGrid } from './GalleryGrid';

export const metadata: Metadata = {
  title: 'Gallery | Philip Sun Photography',
  description: 'Browse photography by Philip Sun — portraits, landscapes, and events.',
};

export default function GalleryPage() {
  return (
    <div className="py-16 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3">
            Portfolio
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Gallery
          </h1>
          <p className="text-gray-500 max-w-md text-sm leading-relaxed">
            A selection of my work across portraits, landscapes, and events. Hover any photo to
            see details.
          </p>
        </div>

        <GalleryGrid />
      </div>
    </div>
  );
}
