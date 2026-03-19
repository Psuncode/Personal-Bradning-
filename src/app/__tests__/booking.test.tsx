import { describe, it, vi } from 'vitest';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

// Mock availabilityService
vi.mock('@/lib/availabilityService', () => ({
  getAvailableSlots: vi.fn().mockReturnValue([
    {
      startTime: new Date('2026-03-24T16:00:00Z'),
      endTime: new Date('2026-03-24T16:30:00Z'),
      display: '9:00 AM',
    },
    {
      startTime: new Date('2026-03-24T16:30:00Z'),
      endTime: new Date('2026-03-24T17:00:00Z'),
      display: '9:30 AM',
    },
  ]),
}));

// Mock photography data with inline values so vi.mock factory has no top-level deps
vi.mock('@/data/photography', () => ({
  photographyPackages: [
    {
      id: 1,
      name: 'Portrait Session',
      description: '1-hour studio or outdoor portrait session.',
      priceInCents: 25000,
      depositInCents: 7500,
      durationMinutes: 60,
    },
    {
      id: 2,
      name: 'Event Coverage',
      description: '3-hour event photography.',
      priceInCents: 60000,
      depositInCents: 20000,
      durationMinutes: 180,
    },
    {
      id: 3,
      name: 'Landscape Half-Day',
      description: '4-hour golden-hour landscape session.',
      priceInCents: 40000,
      depositInCents: 15000,
      durationMinutes: 240,
    },
  ],
}));

// Mock framer-motion — include all exports used across the test suite
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
  },
  useReducedMotion: () => false,
  animate: {},
}));

// Import placeholder component — real implementation arrives in Plan 03-02
import { PhotographyBookingForm } from '@/components/booking/PhotographyBookingForm';
void PhotographyBookingForm; // keep import live

describe('PhotographyBookingForm — PHOTO-03: multi-step booking flow', () => {
  it.todo('renders step 1 with package selection when no ?pkg= param');
  it.todo('pre-selects package when ?pkg=portrait-session is in URL');
  it.todo(
    'advances from step 1 to step 2 (date) when Continue is clicked with a package selected'
  );
  it.todo('advances from step 2 to step 3 (time) when a date is selected');
  it.todo(
    'advances from step 3 to step 4 (details) when a time slot is selected'
  );
  it.todo(
    'shows "Proceed to Payment" button on step 4 instead of "Continue"'
  );
  it.todo('disables Continue button when no package is selected on step 1');
});
