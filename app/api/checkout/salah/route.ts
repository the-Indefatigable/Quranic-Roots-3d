import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';
import { PATH_PRICE_CENTS } from '@/lib/salahPath';

export const dynamic = 'force-dynamic';

/**
 * One-time purchase of the full 30-day "Understand your salah" path (founding price,
 * lifetime access). Sign-in is required so the purchase can be attached to the account;
 * the Stripe webhook records it (kind 'salah_path').
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(clientKey(request, 'checkout-salah'), 10, 60_000);
  if (!limited.ok) return tooManyRequests(limited);

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Sign in first so the path is saved to your account.' }, { status: 401 });

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 503 });

  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://quroots.com';
  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: userId,
      customer_email: session.user.email ?? undefined,
      allow_promotion_codes: true,
      metadata: { user_id: userId, kind: 'salah_path' },
      payment_intent_data: { metadata: { user_id: userId, kind: 'salah_path' } },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: PATH_PRICE_CENTS,
          product_data: {
            name: 'Understand your salah: the full 30-day path',
            description: 'All 30 days, 85 roots, every word of Al-Fatiha and the short surahs you pray with. Founding price, lifetime access.',
          },
        },
      }],
      success_url: `${origin}/salah?purchase=success`,
      cancel_url: `${origin}/salah?purchase=cancelled`,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('[stripe] salah path session failed:', err);
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 });
  }
}
