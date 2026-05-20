// src/data/photography.ts

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
