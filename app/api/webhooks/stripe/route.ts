import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/db';
import { users, growthEvents } from '@/db/schema';
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

  // A completed, paid Checkout Session grants Founding Supporter status.
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as {
      id: string;
      amount_total?: number | null;
      payment_status?: string;
      client_reference_id?: string | null;
      metadata?: Record<string, string> | null;
    };
    const userId = s.metadata?.user_id || s.client_reference_id || undefined;

    if (s.payment_status && s.payment_status !== 'paid') {
      return NextResponse.json({ received: true, ignored: 'unpaid' });
    }
    if (!userId) {
      console.warn('[stripe] checkout.session.completed without user_id');
      return NextResponse.json({ received: true, warning: 'no user_id' });
    }

    try {
      // A salah-path purchase is recorded with a prefix so it unlocks the paid days; a later
      // donation must not overwrite it.
      const isPath = s.metadata?.kind === 'salah_path';
      const [current] = await db.select({ order: users.supporterOrderId }).from(users).where(eq(users.id, userId)).limit(1);
      const keepPath = !isPath && current?.order?.startsWith(PATH_ORDER_PREFIX);
      await db
        .update(users)
        .set({
          isSupporter: true,
          supporterSince: new Date(),
          ...(keepPath ? {} : { supporterOrderId: isPath ? `${PATH_ORDER_PREFIX}${s.id}` : s.id }), // unique index makes re-delivery idempotent
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
      console.log(`[stripe] granted supporter to ${userId} (session ${s.id})`);
      if (isPath) {
        const m = s.metadata ?? {};
        await db.insert(growthEvents).values({
          name: 'purchase', visitorId: m.vid || `user:${userId}`, userId, value: s.amount_total ?? null,
          source: m.source || null, campaign: m.campaign || null, variant: m.variant || null, path: '/salah',
        }).catch((err) => console.warn('[stripe] purchase event not recorded:', (err as Error).message));
      }
    } catch (err) {
      console.error('[stripe] failed to grant supporter:', err);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
