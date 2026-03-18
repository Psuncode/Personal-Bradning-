import type { Metadata } from 'next';
import { GalleryGrid } from './GalleryGrid';

export const metadata: Metadata = {
  title: 'Gallery | Philip Sun Photography',
  description: 'Browse photography by Philip Sun — portraits, landscapes, and events.',
};

export default function GalleryPage() {
  return (
    <div className="py-16 px-6 md:px-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Gallery</h1>
        <p className="text-gray-600 mb-10 max-w-2xl">
          A selection of my work across portraits, landscapes, and events.
        </p>
        <GalleryGrid />
      </div>
    </div>
  );
}
