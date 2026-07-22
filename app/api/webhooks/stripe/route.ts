import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

  // A completed, paid Checkout Session grants Founding Supporter status.
  if (event.type === 'checkout.session.completed') {
    const s = event.data.object as {
      id: string;
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
      await db
        .update(users)
        .set({
          isSupporter: true,
          supporterSince: new Date(),
          supporterOrderId: s.id, // unique index makes re-delivery idempotent
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
