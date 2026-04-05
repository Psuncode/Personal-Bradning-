import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BookingPage from '@/app/(photography)/photography/book/page';

vi.mock('@/lib/serverCalendar', () => ({
  getServerAvailability: vi.fn().mockResolvedValue({ events: [], error: null }),
}));

vi.mock('@/components/booking/PhotographyBookingForm', () => ({
  PhotographyBookingForm: () => <div data-testid="photography-booking-form" />,
}));

describe('Photography booking page', () => {
  it('renders the couples and portrait booking intro copy', async () => {
    render(await BookingPage());

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Book a Couples or Portrait Session',
      })
    ).toBeDefined();
    expect(
      screen.getByText(/If scheduling gives you trouble, send an inquiry and I will follow up directly/i)
    ).toBeDefined();
  });
});
