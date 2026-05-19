// src/lib/stripe.test.ts — Wave 7a env-registry integration coverage.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('stripe lazy singleton — Wave 7a env integration', () => {
  const ORIGINAL = process.env.STRIPE_SECRET_KEY;

  beforeEach(() => {
    // Reset both the module graph (so `_stripe` is undefined again) and the
    // env-registry cache (so `requireRuntimeEnv` re-reads process.env on the
    // next call).
    vi.resetModules();
  });

  afterEach(() => {
    if (ORIGINAL === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = ORIGINAL;
    }
  });

  it('does NOT throw at module import even when STRIPE_SECRET_KEY is unset (lazy)', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    // Importing the module must not crash — that's the whole point of the
    // lazy singleton + `requireRuntimeEnv` (vs. `requireBuildEnv`). Builds in
    // preview environments without the secret wired up still need to compile.
    await expect(import('./stripe')).resolves.toBeDefined();
  });

  it('surfaces the tiered env-registry diagnostic on first stripe access', async () => {
    delete process.env.STRIPE_SECRET_KEY;
    const { stripe } = await import('./stripe');
    // Real driver access (any Stripe property) must surface the standardised
    // "set in .env.local for dev, or Vercel project settings for
    // preview/production" message instead of an opaque Stripe SDK error from
    // `new Stripe(undefined!, …)`.
    expect(() => (stripe as unknown as Record<string, unknown>).checkout).toThrow(
      /STRIPE_SECRET_KEY environment variable is required.*\.env\.local.*Vercel project settings/s
    );
  });
});
