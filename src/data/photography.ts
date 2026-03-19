// src/data/photography.ts

export type PhotoCategory = 'portrait' | 'landscape' | 'event';

export interface GalleryPhoto {
  id: string;
  src: string;       // Full Vercel Blob URL
  alt: string;
  category: PhotoCategory;
  width: number;
  height: number;
}

export interface Package {
  id: number;
  name: string;
  slug: string;
  description: string;
  priceInCents: number;
  depositInCents: number;
  durationMinutes: number;
}

// Placeholder Vercel Blob URLs — replace with real URLs after uploading to Vercel Blob dashboard
export const galleryPhotos: GalleryPhoto[] = [
  { id: 'p1', src: 'https://placeholder.public.blob.vercel-storage.com/portrait/photo1.jpg', alt: 'Studio portrait session', category: 'portrait', width: 1200, height: 800 },
  { id: 'p2', src: 'https://placeholder.public.blob.vercel-storage.com/portrait/photo2.jpg', alt: 'Outdoor natural light portrait', category: 'portrait', width: 800, height: 1200 },
  { id: 'p3', src: 'https://placeholder.public.blob.vercel-storage.com/portrait/photo3.jpg', alt: 'Professional headshot', category: 'portrait', width: 1200, height: 800 },
  { id: 'l1', src: 'https://placeholder.public.blob.vercel-storage.com/landscape/photo1.jpg', alt: 'Utah mountain sunset', category: 'landscape', width: 1600, height: 900 },
  { id: 'l2', src: 'https://placeholder.public.blob.vercel-storage.com/landscape/photo2.jpg', alt: 'Desert red rock formation', category: 'landscape', width: 1600, height: 900 },
  { id: 'l3', src: 'https://placeholder.public.blob.vercel-storage.com/landscape/photo3.jpg', alt: 'Alpine lake reflection', category: 'landscape', width: 1600, height: 900 },
  { id: 'e1', src: 'https://placeholder.public.blob.vercel-storage.com/event/photo1.jpg', alt: 'Corporate event keynote', category: 'event', width: 1200, height: 800 },
  { id: 'e2', src: 'https://placeholder.public.blob.vercel-storage.com/event/photo2.jpg', alt: 'Wedding ceremony moment', category: 'event', width: 1200, height: 800 },
  { id: 'e3', src: 'https://placeholder.public.blob.vercel-storage.com/event/photo3.jpg', alt: 'Graduation celebration', category: 'event', width: 800, height: 1200 },
];

export const photoCategories: { value: PhotoCategory; label: string }[] = [
  { value: 'portrait', label: 'Portraits' },
  { value: 'landscape', label: 'Landscapes' },
  { value: 'event', label: 'Events' },
];

export const photographyPackages: Package[] = [
  { id: 1, slug: 'portrait-session', name: 'Portrait Session', description: '1-hour studio or outdoor portrait session. Includes 15 edited digital photos, online gallery, and print release.', priceInCents: 25000, depositInCents: 7500, durationMinutes: 60 },
  { id: 2, slug: 'event-coverage', name: 'Event Coverage', description: '3-hour event photography. Includes full event gallery with 100+ edited photos, online delivery within 5 business days.', priceInCents: 60000, depositInCents: 20000, durationMinutes: 180 },
  { id: 3, slug: 'landscape-half-day', name: 'Landscape Half-Day', description: '4-hour golden-hour landscape session. Includes 20 edited prints, fine-art post-processing, and high-resolution files.', priceInCents: 40000, depositInCents: 15000, durationMinutes: 240 },
];
