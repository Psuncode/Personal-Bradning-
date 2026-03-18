import { describe, it, expect, vi } from 'vitest';

describe('Photography pricing data — PHOTO-02', () => {
  it('exports photographyPackages with non-zero integer prices', async () => {
    const { photographyPackages } = await import('@/data/photography');

    expect(photographyPackages).toBeDefined();
    expect(Array.isArray(photographyPackages)).toBe(true);
    expect(photographyPackages.length).toBeGreaterThanOrEqual(3);

    photographyPackages.forEach((pkg) => {
      // Price must be a positive integer (cents)
      expect(typeof pkg.priceInCents).toBe('number');
      expect(pkg.priceInCents).toBeGreaterThan(0);
      expect(Number.isInteger(pkg.priceInCents)).toBe(true);

      // Deposit must be a positive integer
      expect(typeof pkg.depositInCents).toBe('number');
      expect(pkg.depositInCents).toBeGreaterThan(0);
      expect(Number.isInteger(pkg.depositInCents)).toBe(true);

      // Name must be a non-empty string
      expect(typeof pkg.name).toBe('string');
      expect(pkg.name.length).toBeGreaterThan(0);

      // Price must NOT be a string like "contact for pricing"
      expect(typeof pkg.priceInCents).not.toBe('string');
    });
  });

  it('each package has a duration in minutes', async () => {
    const { photographyPackages } = await import('@/data/photography');

    photographyPackages.forEach((pkg) => {
      expect(typeof pkg.durationMinutes).toBe('number');
      expect(pkg.durationMinutes).toBeGreaterThan(0);
    });
  });
});
