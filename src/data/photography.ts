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

export interface PhotographyTestimonial {
  id: string;
  name: string;
  quote: string;
}

export interface PhotographyFaq {
  question: string;
  answer: string;
}

// Local fallback assets keep the photography funnel rendering until real client galleries are wired in.
export const galleryPhotos: GalleryPhoto[] = [
  { id: 'p1', src: '/photography/couples-session-1.svg', alt: 'Couples session photograph at golden hour: two people walking together outdoors in warm late-afternoon light, relaxed body language, natural Utah backdrop', category: 'couples', width: 1200, height: 800 },
  { id: 'p2', src: '/photography/couples-session-2.svg', alt: 'Outdoor engagement portrait in soft natural light: a couple sharing a candid moment against a muted landscape, vertical composition', category: 'couples', width: 800, height: 1200 },
  { id: 'p3', src: '/photography/portrait-session-1.svg', alt: 'Professional headshot portrait: subject framed from the shoulders up against a neutral background, even studio-style lighting suited for personal branding or LinkedIn', category: 'portrait', width: 1200, height: 800 },
  { id: 'l1', src: '/photography/landscape-1.svg', alt: 'Landscape photograph of a Utah mountain ridge at sunset, warm orange and purple sky over silhouetted peaks, wide horizontal composition', category: 'landscape', width: 1600, height: 900 },
  { id: 'l2', src: '/photography/landscape-2.svg', alt: 'Landscape photograph of a southern Utah desert red rock formation, sandstone cliffs in golden hour light against a clear sky', category: 'landscape', width: 1600, height: 900 },
  { id: 'l3', src: '/photography/landscape-3.svg', alt: 'Landscape photograph of a still alpine lake mirroring surrounding mountains and evergreen trees, calm morning light', category: 'landscape', width: 1600, height: 900 },
  { id: 'e1', src: '/photography/event-1.svg', alt: 'Corporate event photograph: a keynote speaker on stage addressing a seated audience, stage lighting and presentation screen behind them', category: 'event', width: 1200, height: 800 },
  { id: 'e2', src: '/photography/event-2.svg', alt: 'Wedding ceremony photograph capturing a candid moment between the couple at the altar, soft ambient venue light', category: 'event', width: 1200, height: 800 },
  { id: 'e3', src: '/photography/event-3.svg', alt: 'Graduation celebration photograph: a graduate in cap and gown smiling outdoors after the ceremony, vertical portrait composition', category: 'event', width: 800, height: 1200 },
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

export const photographyTestimonials: PhotographyTestimonial[] = [
  {
    id: 'couples-client',
    name: 'Couples Client',
    quote:
      'He made us feel comfortable right away and the photos looked natural instead of stiff.',
  },
  {
    id: 'portrait-client',
    name: 'Portrait Client',
    quote:
      'The direction was clear, the turnaround was fast, and the final gallery was exactly what I needed.',
  },
];

export const photographyFaqs: PhotographyFaq[] = [
  {
    question: 'Where do you shoot in Utah?',
    answer:
      'Most sessions happen in Provo, Utah County, and Salt Lake City, with location planning based on the look you want.',
  },
  {
    question: 'Do you help with posing?',
    answer:
      'Yes. Every session is guided, so you do not need modeling experience to get relaxed, natural photos.',
  },
  {
    question: 'How long does it take to get the photos back?',
    answer:
      'Most couples and portrait sessions are delivered within 7 to 10 days through an online gallery.',
  },
];
