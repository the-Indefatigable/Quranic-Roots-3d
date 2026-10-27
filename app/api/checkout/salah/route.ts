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
  const back = typeof body?.returnTo === 'string' && /^\/(salah(\/\d{1,2})?|gift|support)$/.test(body.returnTo) ? body.returnTo : '/salah';
  // 'gift': bought for someone the buyer names; 'sponsor': a free place for someone who can't pay.
  const kind: 'path' | 'gift' | 'sponsor' = body?.kind === 'gift' || body?.kind === 'sponsor' ? body.kind : 'path';
  const clean = (v: unknown, n: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n) : '');
  const giftFrom = kind === 'gift' ? clean(body?.from, 60) : '', giftMessage = kind === 'gift' ? clean(body?.message, 300) : '';

  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://quroots.com';
  const paidRoots = PATH.totals.roots - PATH.days.filter((d) => d.free).reduce((n, d) => n + d.roots.length, 0);
  const metadata = {
    kind: kind === 'path' ? 'salah_path' : kind === 'gift' ? 'salah_gift' : 'salah_sponsor',
    ...(userId ? { user_id: userId } : {}), ...attribution,
    ...(giftFrom ? { gift_from: giftFrom } : {}), ...(giftMessage ? { gift_message: giftMessage } : {}),
  };
  const product = kind === 'path'
    ? { name: 'Understand your salah: the full 30-day path', description: `Days 8 to 30: the short surahs you pray with, word by word, and ${paidRoots} more roots. One payment, yours for life. 14-day full refund.` }
    : kind === 'gift'
      ? { name: 'Gift: Understand your salah, the full 30-day path', description: 'You get a personal link to send. Whoever opens it gets all 30 days, for life.' }
      : { name: 'Sponsor a learner: the full 30-day salah path', description: 'A free place on the path for someone who asked for one because they can’t afford it.' };
  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      ...(userId ? { client_reference_id: userId, customer_email: session.user.email ?? undefined } : { customer_creation: 'always' as const }),
      // Codes only on the path itself: a free gift code must never buy another gift.
      allow_promotion_codes: kind === 'path',
      metadata,
      payment_intent_data: { metadata },
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: PATH_PRICE_CENTS,
          product_data: product,
        },
      }],
      success_url: kind === 'path' ? `${origin}/salah/welcome?session_id={CHECKOUT_SESSION_ID}` : `${origin}/gift/sent?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${back}?purchase=cancelled`,
    });
    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('[stripe] salah path session failed:', err);
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 });
  }
}
