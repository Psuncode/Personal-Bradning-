import type { Metadata } from 'next';
import { GalleryGrid } from './GalleryGrid';

export const metadata: Metadata = {
  title: 'Photography Gallery | Philip Sun Photography',
  description: 'Browse couples, portraits, events, and landscape photography by Philip Sun.',
};

export default function GalleryPage() {
  return (
    <div className="py-16 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-medium tracking-widest text-gray-400 uppercase mb-3">
            Full Archive
          </p>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Photography Gallery
          </h1>
          <p className="text-gray-500 max-w-md text-sm leading-relaxed">
            Couples and portraits are the main focus of the photography experience, with selected
            event and landscape work collected here as part of the broader archive.
          </p>
        </div>

        <GalleryGrid />
      </div>
    </div>
  );
}
