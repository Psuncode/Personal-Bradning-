'use client';

import { useState } from 'react';
import Image from 'next/image';
import { galleryPhotos, photoCategories } from '@/data/photography';
import type { PhotoCategory } from '@/data/photography';

export function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState<PhotoCategory | 'all'>('all');

  const filteredPhotos = activeCategory === 'all'
    ? galleryPhotos
    : galleryPhotos.filter((photo) => photo.category === activeCategory);

  return (
    <div>
      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {photoCategories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat.value
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Masonry-style photo grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {filteredPhotos.map((photo) => (
          <div key={photo.id} className="relative mb-4 break-inside-avoid">
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-auto rounded-lg"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <p className="text-center text-gray-500 py-12">No photos in this category yet.</p>
      )}
    </div>
  );
}
