import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// LemonSqueezy delivers webhooks server-to-server. We must read the RAW body
// to verify the HMAC signature, so this route is fully dynamic (no caching).
export const dynamic = 'force-dynamic';

/** Timing-safe compare of the X-Signature header against our computed digest. */
function verifySignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const digest = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const a = Buffer.from(digest, 'utf8');
  const b = Buffer.from(signature, 'utf8');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function POST(request: NextRequest) {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[lemonsqueezy] LEMONSQUEEZY_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // Raw body is required for signature verification — do not use request.json() first.
  const rawBody = await request.text();
  const signature = request.headers.get('x-signature');

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn('[lemonsqueezy] Invalid signature — rejecting webhook');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventName: string = payload?.meta?.event_name ?? '';
  // We attach the QuRoots user id at checkout via checkout[custom][user_id].
  const userId: string | undefined = payload?.meta?.custom_data?.user_id;
  const orderId: string = String(payload?.data?.id ?? '');
  const status: string = payload?.data?.attributes?.status ?? '';

  // Only a paid, created order grants Founding Supporter status.
  const grants = eventName === 'order_created' && status === 'paid';

  if (!grants) {
    // Acknowledge everything else (subscription events, refunds, etc.) with 200
    // so LemonSqueezy doesn't retry. We simply don't act on them here.
    return NextResponse.json({ received: true, ignored: eventName }, { status: 200 });
  }

  if (!userId) {
    console.warn('[lemonsqueezy] order_created without custom_data.user_id — cannot attribute');
    return NextResponse.json({ received: true, warning: 'no user_id' }, { status: 200 });
  }

  try {
    await db
      .update(users)
      .set({
        isSupporter: true,
        supporterSince: new Date(),
        supporterOrderId: orderId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    console.log(`[lemonsqueezy] Granted supporter to user ${userId} (order ${orderId})`);
  } catch (err) {
    console.error('[lemonsqueezy] Failed to grant supporter:', err);
    // 500 so LemonSqueezy retries — the grant is idempotent (order id is unique).
    return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true, granted: true }, { status: 200 });
}
