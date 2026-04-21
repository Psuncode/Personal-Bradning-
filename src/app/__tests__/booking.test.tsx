import { beforeEach, describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { HTMLAttributes, PropsWithChildren } from 'react';

type DivProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;
type ParagraphProps = PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>;
type HeadingProps = PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>;

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(() => new URLSearchParams()),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}));

// Mock availabilityService — always return two slots so time-step tests work
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

// Mock photography data with inline values (including slug) so vi.mock factory has no top-level deps
vi.mock('@/data/photography', () => ({
  photographyPackages: [
    {
      id: 1,
      slug: 'couples-session',
      name: 'Couples Session',
      description: 'A relaxed outdoor session for engagements, anniversaries, and just-because photos.',
      priceInCents: 32500,
      depositInCents: 10000,
      durationMinutes: 75,
      category: 'couples',
    },
    {
      id: 2,
      slug: 'portrait-session',
      name: 'Portrait Session',
      description: 'Guided portraits for seniors, headshots, graduation, and personal branding.',
      priceInCents: 25000,
      depositInCents: 7500,
      durationMinutes: 60,
      category: 'portrait',
    },
    {
      id: 3,
      slug: 'extended-portrait-session',
      name: 'Extended Portrait Session',
      description: 'Extra time for outfit changes, multiple nearby locations, and a larger final gallery.',
      priceInCents: 42500,
      depositInCents: 12500,
      durationMinutes: 105,
      category: 'portrait',
    },
  ],
}));

const mockFetchICloudEvents = vi.fn().mockResolvedValue([]);

// Mock icalendarService to prevent network calls
vi.mock('@/lib/icalendarService', () => ({
  fetchICloudEvents: (...args: unknown[]) => mockFetchICloudEvents(...args),
}));

// Mock framer-motion — include all exports used across the test suite
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: DivProps) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: DivProps) => <span {...props}>{children}</span>,
    p: ({ children, ...props }: ParagraphProps) => <p {...props}>{children}</p>,
    h1: ({ children, ...props }: HeadingProps) => <h1 {...props}>{children}</h1>,
  },
  useReducedMotion: () => false,
  animate: {},
}));

import { PhotographyBookingForm } from '@/components/booking/PhotographyBookingForm';
import type { ServerAvailabilityResult } from '@/lib/serverCalendar';

// Helper: navigate to step 2
function goToStep2() {
  fireEvent.click(screen.getByText('Portrait Session'));
  const continueBtn = screen
    .getAllByRole('button')
    .find((btn) => btn.textContent === 'Continue')!;
  fireEvent.click(continueBtn);
}

// Helper: click first available (non-disabled) day button in the calendar
function clickFirstAvailableDay() {
  const dayButtons = screen.getAllByRole('button').filter((btn) => {
    const text = btn.textContent?.trim() ?? '';
    return /^\d+$/.test(text) && !(btn as HTMLButtonElement).disabled;
  });
  expect(dayButtons.length).toBeGreaterThan(0);
  fireEvent.click(dayButtons[0]);
}

async function renderSettledBookingForm(props?: React.ComponentProps<typeof PhotographyBookingForm>) {
  render(<PhotographyBookingForm {...props} />);
  await waitFor(() => {
    expect(mockFetchICloudEvents).toHaveBeenCalledTimes(1);
  });
}

describe('PhotographyBookingForm — PHOTO-03: multi-step booking flow', () => {
  beforeEach(() => {
    mockFetchICloudEvents.mockClear();
    mockFetchICloudEvents.mockResolvedValue([]);
  });

  it('renders step 1 with package selection when no ?pkg= param', async () => {
    await renderSettledBookingForm();
    expect(screen.getByText('Choose Your Package')).toBeDefined();
    expect(screen.getByText('Couples Session')).toBeDefined();
    expect(screen.getByText('Portrait Session')).toBeDefined();
    expect(screen.getByText('Extended Portrait Session')).toBeDefined();
  });

  it('pre-selects package when ?pkg=portrait-session is in URL', async () => {
    // Update the useSearchParams mock for this test
    const navMod = await import('next/navigation');
    const useSearchParamsMock = navMod.useSearchParams as ReturnType<typeof vi.fn>;
    useSearchParamsMock.mockReturnValueOnce(new URLSearchParams('pkg=portrait-session'));

    await renderSettledBookingForm();

    // Step 1 is still shown, but Continue should not be disabled
    expect(screen.getByText('Choose Your Package')).toBeDefined();
    const continueBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent === 'Continue');
    expect(continueBtn).toBeDefined();
    // Pre-selection from URL: Continue should be enabled (package pre-selected)
    expect((continueBtn as HTMLButtonElement).disabled).toBe(false);
  });

  it('advances from step 1 to step 2 (date) when Continue is clicked with a package selected', async () => {
    await renderSettledBookingForm();
    goToStep2();
    expect(screen.getByText('Select a Date')).toBeDefined();
  });

  it('advances from step 2 to step 3 (time) when a date is selected', async () => {
    await renderSettledBookingForm();
    goToStep2();
    clickFirstAvailableDay();
    expect(screen.getByText('Pick a Time')).toBeDefined();
  });

  it('advances from step 3 to step 4 (details) when a time slot is selected', async () => {
    await renderSettledBookingForm();
    goToStep2();
    clickFirstAvailableDay();

    // Select a time slot
    fireEvent.click(screen.getByText('9:00 AM'));

    // Continue from step 3
    const continue3 = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent === 'Continue')!;
    expect((continue3 as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(continue3);

    expect(screen.getByText('Your Details')).toBeDefined();
  });

  it('shows "Proceed to Payment" button on step 4 instead of "Continue"', async () => {
    await renderSettledBookingForm();
    goToStep2();
    clickFirstAvailableDay();

    fireEvent.click(screen.getByText('9:00 AM'));
    const continue3 = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent === 'Continue')!;
    fireEvent.click(continue3);

    // On step 4: "Proceed to Payment" present, "Continue" absent
    expect(screen.getByText('Proceed to Payment')).toBeDefined();
    const continueOnStep4 = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent === 'Continue');
    expect(continueOnStep4).toBeUndefined();
  });

  it('disables Continue button when no package is selected on step 1', async () => {
    await renderSettledBookingForm();
    const continueBtn = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent === 'Continue');
    expect(continueBtn).toBeDefined();
    expect((continueBtn as HTMLButtonElement).disabled).toBe(true);
  });

  it('clears the fallback warning after a successful availability refresh', async () => {
    const initialData: ServerAvailabilityResult = {
      events: [],
      busyDates: [],
      error: 'calendar failed',
    };

    render(
      <PhotographyBookingForm initialData={initialData} />
    );

    expect(screen.getByText('Couples Session')).toBeDefined();
    expect(screen.getByText(/busy days may not appear blocked/i)).toBeDefined();

    await waitFor(() => {
      expect(mockFetchICloudEvents).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.queryByText(/busy days may not appear blocked/i)).toBeNull();
    });
  });
});
