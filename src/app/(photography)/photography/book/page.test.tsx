import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import BookingPage from '@/app/(photography)/photography/book/page';
import { siteConfig } from '@/data/site-config';

vi.mock('@/components/cal-embed', () => ({
  CalEmbed: ({ calLink }: { calLink: string }) => (
    <div data-testid="cal-embed" data-cal-link={calLink} />
  ),
}));

describe('Photography booking page', () => {
  it('renders the couples and portrait booking intro copy', () => {
    render(<BookingPage />);

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

  it('mounts the Cal.com embed with the configured photography event link', () => {
    render(<BookingPage />);

    const embed = screen.getByTestId('cal-embed');
    expect(embed).toBeDefined();
    // Pulls from siteConfig.cal — test against the actual configured slug so
    // changing the Cal.com event slug only touches site-config.ts.
    expect(embed.getAttribute('data-cal-link')).toBe(
      `${siteConfig.cal.username}/${siteConfig.cal.photographyEventSlug}`,
    );
  });
});
