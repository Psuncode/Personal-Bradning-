import { describe, it, vi } from 'vitest';

// Mock icalendarService before importing BookingForm
vi.mock('@/lib/icalendarService', () => ({
  fetchICloudEvents: vi.fn().mockResolvedValue([]),
}));

// Mock availabilityService
vi.mock('@/lib/availabilityService', () => ({
  getAvailableSlots: vi.fn().mockReturnValue([
    {
      startTime: new Date('2026-03-24T16:00:00Z'), // 9 AM Mountain
      endTime: new Date('2026-03-24T16:30:00Z'),
      display: '9:00 AM',
    },
  ]),
}));

// Mock date-fns-tz format to return stable strings
vi.mock('date-fns-tz', async (importOriginal) => {
  const actual = await importOriginal<typeof import('date-fns-tz')>();
  return {
    ...actual,
    format: vi.fn().mockReturnValue('2026-03'),
  };
});

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    span: 'span',
  },
  useReducedMotion: () => false,
}));

// Import BookingForm — will resolve once component exists
// import { BookingForm } from '@/components/booking/BookingForm';

describe('BookingForm — BUG-03: loadedMonths immutability', () => {
  it.todo(
    'does not call loadedMonths.add() directly — uses setLoadedMonths functional update'
  );
  it.todo(
    'navigating to a new month and back does not re-fetch already-loaded months'
  );
});
