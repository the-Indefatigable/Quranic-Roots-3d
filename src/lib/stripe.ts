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

// Donation bounds (cents). Stripe's floor is $0.50; we ask for at least $1.
export const MIN_DONATION_CENTS = 100;      // $1
export const MAX_DONATION_CENTS = 1_000_000; // $10,000
export const DONATION_PRESETS = [5, 10, 25, 50]; // dollars
