import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Must mock before importing BookingForm
const mockFetchICloudEvents = vi.fn().mockResolvedValue([]);

vi.mock('@/lib/icalendarService', () => ({
  fetchICloudEvents: (...args: unknown[]) => mockFetchICloudEvents(...args),
}));

vi.mock('@/lib/availabilityService', () => ({
  getAvailableSlots: vi.fn().mockReturnValue([
    {
      startTime: new Date('2026-03-24T16:00:00Z'),
      endTime: new Date('2026-03-24T16:30:00Z'),
      display: '9:00 AM',
    },
  ]),
}));

vi.mock('@/lib/icsService', () => ({
  generateICSContent: vi.fn().mockReturnValue('BEGIN:VCALENDAR'),
  downloadICS: vi.fn(),
}));

import { BookingForm } from '@/components/booking/BookingForm';

describe('BookingForm — BUG-03: loadedMonths immutability', () => {
  beforeEach(() => {
    mockFetchICloudEvents.mockClear();
    mockFetchICloudEvents.mockResolvedValue([]);
  });

  it('does not call fetchICloudEvents for already-loaded months when navigating back', async () => {
    const user = userEvent.setup();

    render(<BookingForm />);

    // Initially, current month should be loaded from initialData (empty set) — no fetch yet
    // (no initialData provided, so loadedMonths is empty and current month will be fetched)
    await waitFor(() => {
      expect(mockFetchICloudEvents).toHaveBeenCalledTimes(1);
    });

    const callCountAfterFirstLoad = mockFetchICloudEvents.mock.calls.length;

    // Navigate to next month
    const nextBtn = screen.getByLabelText('Next month');
    await act(async () => {
      await user.click(nextBtn);
    });

    // Should fetch next month
    await waitFor(() => {
      expect(mockFetchICloudEvents.mock.calls.length).toBeGreaterThan(callCountAfterFirstLoad);
    });

    const callCountAfterSecondLoad = mockFetchICloudEvents.mock.calls.length;

    // Navigate back to original month
    const prevBtn = screen.getByLabelText('Previous month');
    await act(async () => {
      await user.click(prevBtn);
    });

    // Should NOT fetch again — month was already loaded
    // Give it time to potentially fire an erroneous fetch
    await new Promise((r) => setTimeout(r, 100));
    expect(mockFetchICloudEvents.mock.calls.length).toBe(callCountAfterSecondLoad);
  });

  it('renders the date selection step by default', () => {
    render(<BookingForm />);
    expect(screen.getByText('Select a Date')).toBeDefined();
  });
});
