import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/db';
import type Stripe from 'stripe';
import { users } from '@/db/schema';
import { grantPathPurchase } from '@/lib/pathPurchase';
import { eq } from 'drizzle-orm';
import { PATH_ORDER_PREFIX } from '@/lib/salahPath';

// Raw body is required for signature verification, so keep this fully dynamic.
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    console.error('[stripe] webhook not configured (missing key or secret)');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');
  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.warn('[stripe] signature verification failed:', (err as Error).message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // A test-mode event delivered to a live endpoint is correctly signed, so the
  // signature check above passes — but it must not grant supporter status.
  // Acknowledge (200) so Stripe stops retrying, without acting on it.
  const expectLive = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live');
  if (expectLive && !event.livemode) {
    console.warn('[stripe] ignoring test-mode event on a live endpoint:', event.id);
    return NextResponse.json({ received: true, ignored: 'test_mode_event' });
  }

  // A completed, paid Checkout Session: a salah path purchase, or a donation.
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as Stripe.Checkout.Session;
    if (s.payment_status && s.payment_status !== 'paid') {
      return NextResponse.json({ received: true, ignored: 'unpaid' });
    }

    // The path can be bought without signing in, so it is matched to an account by email.
    if (s.metadata?.kind === 'salah_path') {
      try {
        const { userId } = await grantPathPurchase(s);
        console.log(`[stripe] salah path unlocked for ${userId} (session ${s.id})`);
      } catch (err) {
        console.error('[stripe] failed to unlock the salah path:', err);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }
      return NextResponse.json({ received: true });
    }

    // A donation grants Founding Supporter status, without replacing a path purchase.
    const userId = s.metadata?.user_id || s.client_reference_id || undefined;
    if (!userId) {
      console.warn('[stripe] donation checkout without user_id');
      return NextResponse.json({ received: true, warning: 'no user_id' });
    }
    try {
      const [current] = await db.select({ order: users.supporterOrderId }).from(users).where(eq(users.id, userId)).limit(1);
      const keepPath = current?.order?.startsWith(PATH_ORDER_PREFIX);
      await db
        .update(users)
        .set({
          isSupporter: true,
          supporterSince: new Date(),
          ...(keepPath ? {} : { supporterOrderId: s.id }), // unique index makes re-delivery idempotent
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      console.log(`[stripe] granted supporter to ${userId} (session ${s.id})`);
    } catch (err) {
      console.error('[stripe] failed to grant supporter:', err);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
