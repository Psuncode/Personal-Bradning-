import Stripe from 'stripe';

// Lazy singleton — avoids Stripe constructor throwing at build time when
// STRIPE_SECRET_KEY is not set. Instance is created on first use.
let _stripe: Stripe | undefined;

function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
