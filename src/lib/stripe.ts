import Stripe from 'stripe';
import { requireRuntimeEnv } from './env';

// Pin Stripe API version so behavior doesn't silently change on a Stripe-side
// rollover. Sourced from the SDK's typed `LatestApiVersion` so an `npm update`
// to a new major version flags as a typecheck/upgrade, not a runtime surprise.
// See CR-04 in .planning/phases/03-booking-and-payments/03-REVIEW.md.
export const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2026-02-25.clover';

// Lazy singleton — avoids Stripe constructor throwing at build time when
// STRIPE_SECRET_KEY is not set. Instance is created on first use.
let _stripe: Stripe | undefined;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(requireRuntimeEnv('STRIPE_SECRET_KEY'), {
      apiVersion: STRIPE_API_VERSION,
      typescript: true,
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop: string) {
    return (getStripe() as unknown as Record<string, unknown>)[prop];
  },
});
