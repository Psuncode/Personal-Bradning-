'use client';

import { useState } from 'react';
import Image from 'next/image';
import { galleryPhotos, photoCategories } from '@/data/photography';
import type { PhotoCategory } from '@/data/photography';
import { cn } from '@/lib/utils';

export function GalleryGrid() {
  const [activeCategory, setActiveCategory] = useState<PhotoCategory | 'all'>('all');

  const filteredPhotos =
    activeCategory === 'all'
      ? galleryPhotos
      : galleryPhotos.filter((photo) => photo.category === activeCategory);

  const allCategories = [{ value: 'all' as const, label: 'All' }, ...photoCategories];

  return (
    <div>
      {/* Category filter pills */}
      <div className="flex flex-wrap gap-2 mb-10">
        {allCategories.map((cat) => {
          const active = activeCategory === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              aria-pressed={active}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border',
                active
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-transparent text-gray-600 border-gray-300 hover:border-gray-600 hover:text-gray-900'
              )}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Masonry grid with hover overlays */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo.id}
            className="relative mb-4 break-inside-avoid group overflow-hidden rounded-xl bg-gray-100 cursor-zoom-in"
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="w-full h-auto block transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
              <div className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <p className="text-white text-sm font-medium leading-snug">{photo.alt}</p>
                <p className="text-white/60 text-xs mt-0.5 capitalize">{photo.category}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="py-24 text-center">
          <p className="text-gray-400 text-sm">No photos in this category yet.</p>
        </div>
      )}
    </div>
  );
}
