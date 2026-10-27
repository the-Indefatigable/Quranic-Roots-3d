import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';
import { PATH, PATH_PRICE_CENTS } from '@/lib/salahPath';

export const dynamic = 'force-dynamic';

/**
 * One-time purchase of the full 30-day "Understand your salah" path (founding price, lifetime
 * access). No sign-in needed: Stripe collects the email, and src/lib/pathPurchase.ts attaches
 * the purchase to that account once it is paid. A signed-in buyer's account is used directly.
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(clientKey(request, 'checkout-salah'), 10, 60_000);
  if (!limited.ok) return tooManyRequests(limited);

  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Payments are not configured yet.' }, { status: 503 });

  const session = await auth();
  const userId = session?.user?.id;

  // Where the buyer came from (src/lib/track.ts), so the purchase can be credited to it.
  const body = await request.json().catch(() => ({}));
  const tag = (v: unknown, n = 40) => (typeof v === 'string' ? v.toLowerCase().replace(/[^a-z0-9_.-]/g, '').slice(0, n) : '');
  const attribution = { vid: /^[0-9a-f-]{36}$/.test(body?.vid ?? '') ? body.vid : '', source: tag(body?.source), campaign: tag(body?.campaign), variant: tag(body?.variant) };
  const back = typeof body?.returnTo === 'string' && /^\/salah(\/\d{1,2})?$/.test(body.returnTo) ? body.returnTo : '/salah';

  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://quroots.com';
  const paidRoots = PATH.totals.roots - PATH.days.filter((d) => d.free).reduce((n, d) => n + d.roots.length, 0);
  const metadata = { kind: 'salah_path', ...(userId ? { user_id: userId } : {}), ...attribution };
  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      ...(userId ? { client_reference_id: userId, customer_email: session.user.email ?? undefined } : { customer_creation: 'always' as const }),
      allow_promotion_codes: true,
      metadata,
      payment_intent_data: { metadata },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: PATH_PRICE_CENTS,
          product_data: {
            name: 'Understand your salah: the full 30-day path',
            description: `Days 8 to 30: the short surahs you pray with, word by word, and ${paidRoots} more roots. One payment, yours for life. 14-day full refund.`,
          },
        },
      }],
      success_url: `${origin}/salah/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${back}?purchase=cancelled`,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('[stripe] salah path session failed:', err);
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 });
  }
}
