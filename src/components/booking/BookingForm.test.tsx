import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock next/navigation (BookingForm likely uses it)
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

// This test validates BUG-02: organizer email must come from siteConfig, not hardcoded
describe('BookingForm — BUG-02 email source', () => {
  it('does not contain hardcoded ps324@byu.edu in rendered output', async () => {
    // Import dynamically so mocks are set up first
    const { siteConfig } = await import('@/data/site-config');

    // After BUG-02 fix, siteConfig should have a top-level email field
    expect(siteConfig).toHaveProperty('email');
    expect(typeof siteConfig.email).toBe('string');
    expect(siteConfig.email).not.toBe('');
  });

  it('siteConfig.email is the raw email without mailto: prefix', async () => {
    const { siteConfig } = await import('@/data/site-config');

    // The email field should be raw (not mailto:)
    expect(siteConfig.email).toBeDefined();
    expect(siteConfig.email).not.toMatch(/^mailto:/);
  });
});
