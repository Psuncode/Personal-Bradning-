// src/data/photography.ts

export type PhotoCategory = 'couples' | 'portrait' | 'event' | 'landscape';

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
  category: 'couples' | 'portrait';
  turnaround: string;
  featured?: boolean;
}

// Placeholder Vercel Blob URLs — replace with real URLs after uploading to Vercel Blob dashboard
export const galleryPhotos: GalleryPhoto[] = [
  { id: 'p1', src: 'https://placeholder.public.blob.vercel-storage.com/portrait/photo1.jpg', alt: 'Relaxed couples session at golden hour', category: 'couples', width: 1200, height: 800 },
  { id: 'p2', src: 'https://placeholder.public.blob.vercel-storage.com/portrait/photo2.jpg', alt: 'Outdoor engagement portraits in natural light', category: 'couples', width: 800, height: 1200 },
  { id: 'p3', src: 'https://placeholder.public.blob.vercel-storage.com/portrait/photo3.jpg', alt: 'Professional headshot', category: 'portrait', width: 1200, height: 800 },
  { id: 'l1', src: 'https://placeholder.public.blob.vercel-storage.com/landscape/photo1.jpg', alt: 'Utah mountain sunset', category: 'landscape', width: 1600, height: 900 },
  { id: 'l2', src: 'https://placeholder.public.blob.vercel-storage.com/landscape/photo2.jpg', alt: 'Desert red rock formation', category: 'landscape', width: 1600, height: 900 },
  { id: 'l3', src: 'https://placeholder.public.blob.vercel-storage.com/landscape/photo3.jpg', alt: 'Alpine lake reflection', category: 'landscape', width: 1600, height: 900 },
  { id: 'e1', src: 'https://placeholder.public.blob.vercel-storage.com/event/photo1.jpg', alt: 'Corporate event keynote', category: 'event', width: 1200, height: 800 },
  { id: 'e2', src: 'https://placeholder.public.blob.vercel-storage.com/event/photo2.jpg', alt: 'Wedding ceremony moment', category: 'event', width: 1200, height: 800 },
  { id: 'e3', src: 'https://placeholder.public.blob.vercel-storage.com/event/photo3.jpg', alt: 'Graduation celebration', category: 'event', width: 800, height: 1200 },
];

export const photoCategories: { value: PhotoCategory; label: string }[] = [
  { value: 'couples', label: 'Couples' },
  { value: 'portrait', label: 'Portraits' },
  { value: 'event', label: 'Events' },
  { value: 'landscape', label: 'Landscapes' },
];

export const photographyPackages: Package[] = [
  { id: 1, name: 'Couples Session', slug: 'couples-session', description: 'A relaxed outdoor session for engagements, anniversaries, and just-because photos.', priceInCents: 32500, depositInCents: 10000, durationMinutes: 75, category: 'couples', turnaround: '7-10 days', featured: true },
  { id: 2, name: 'Portrait Session', slug: 'portrait-session', description: 'Guided portraits for seniors, headshots, graduation, and personal branding.', priceInCents: 25000, depositInCents: 7500, durationMinutes: 60, category: 'portrait', turnaround: '7-10 days' },
  { id: 3, name: 'Extended Portrait Session', slug: 'extended-portrait-session', description: 'Extra time for outfit changes, multiple nearby locations, and a larger final gallery.', priceInCents: 42500, depositInCents: 12500, durationMinutes: 105, category: 'portrait', turnaround: '7-10 days' },
];
