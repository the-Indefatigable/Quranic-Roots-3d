import Stripe from 'stripe';

// Lazily instantiated so importing this module never throws at build time when
// STRIPE_SECRET_KEY is absent. Call getStripe() inside request handlers.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

export const SUPPORTER_PRICE_CENTS = 9900; // $99 one-time
