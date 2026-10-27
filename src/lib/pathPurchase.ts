import { createHmac, timingSafeEqual } from 'crypto';
import { eq, sql } from 'drizzle-orm';
import type Stripe from 'stripe';
import { db } from '@/db';
import { users, growthEvents } from '@/db/schema';
import { PATH_ORDER_PREFIX, hasPathAccess } from '@/lib/salahPath';

/**
 * Buying the salah path without signing in first.
 *
 * Stripe Checkout collects the buyer's email. Once the payment is confirmed (by the webhook, or
 * by the success page asking Stripe directly, whichever comes first) the purchase is attached to
 * the account with that email, creating it if needed. The browser that paid also gets a signed
 * "path pass" cookie, so the paid days open there at once, even inside Instagram's or TikTok's
 * browser where signing in is awkward. Signing in later with the same email keeps the purchase.
 */

export const PASS_COOKIE = 'qr_path';
export const PASS_MAX_AGE = 60 * 60 * 24 * 400;

const secret = () => process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || '';
const mac = (v: string) => createHmac('sha256', secret()).update(`path-pass:${v}`).digest('base64url');

export function signPass(checkoutSessionId: string): string {
  return `${checkoutSessionId}.${mac(checkoutSessionId)}`;
}

/** The Checkout Session id inside a valid pass, or null. */
export function readPass(value: string | undefined): string | null {
  if (!value || !secret()) return null;
  const i = value.lastIndexOf('.');
  if (i <= 0) return null;
  const id = value.slice(0, i), given = Buffer.from(value.slice(i + 1)), want = Buffer.from(mac(id));
  return given.length === want.length && timingSafeEqual(given, want) ? id : null;
}

/** A pass only counts while the purchase it names is still on an account (a refund can remove it). */
export async function passIsValid(value: string | undefined): Promise<boolean> {
  const id = readPass(value);
  if (!id) return false;
  try {
    const [row] = await db.select({ id: users.id }).from(users).where(eq(users.supporterOrderId, `${PATH_ORDER_PREFIX}${id}`)).limit(1);
    return !!row;
  } catch {
    return false;
  }
}

type PaidSession = Pick<Stripe.Checkout.Session, 'id' | 'amount_total' | 'payment_status' | 'client_reference_id' | 'metadata' | 'customer_details' | 'customer_email'>;

/**
 * Attach a paid path purchase to an account. Safe to call more than once for the same session.
 * Returns the account's id and email.
 */
export async function grantPathPurchase(s: PaidSession): Promise<{ userId: string; email: string | null }> {
  const m = s.metadata ?? {};
  const email = (s.customer_details?.email || s.customer_email || '').trim().toLowerCase() || null;
  return grantPath({ order: `${PATH_ORDER_PREFIX}${s.id}`, userId: m.user_id || s.client_reference_id || null, email, name: s.customer_details?.name ?? null,
    event: { visitorId: m.vid || null, value: s.amount_total ?? null, source: m.source || null, campaign: m.campaign || null, variant: m.variant || null } });
}

/**
 * Unlock the path on an account (found by id, else by email, else created) under an order id.
 * Purchases use path:<checkout session>, redeemed gifts path:gift_<promotion code>.
 */
export async function grantPath(o: { order: string; userId?: string | null; email: string | null; name?: string | null;
  event: { visitorId: string | null; value: number | null; source: string | null; campaign: string | null; variant: string | null } }): Promise<{ userId: string; email: string | null }> {
  let userId = o.userId ?? null;
  const email = o.email;
  if (!userId) {
    if (!email) throw new Error(`order ${o.order} has neither a user nor an email`);
    const [existing] = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`).limit(1);
    if (existing) userId = existing.id;
    else {
      const [created] = await db.insert(users).values({ email, name: o.name ?? null }).onConflictDoNothing().returning({ id: users.id });
      userId = created?.id ?? (await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${email}`).limit(1))[0]?.id ?? null;
    }
    if (!userId) throw new Error(`could not create an account for ${o.order}`);
  }

  const [current] = await db.select({ order: users.supporterOrderId, email: users.email }).from(users).where(eq(users.id, userId)).limit(1);
  if (current?.order !== o.order) {
    await db.update(users).set({ isSupporter: true, supporterSince: new Date(), supporterOrderId: o.order, updatedAt: new Date() }).where(eq(users.id, userId));
    await db.insert(growthEvents).values({
      name: 'purchase', visitorId: o.event.visitorId || `user:${userId}`, userId, value: o.event.value,
      source: o.event.source, campaign: o.event.campaign, variant: o.event.variant, path: '/salah',
    }).catch((err) => console.warn('[path] purchase event not recorded:', (err as Error).message));
  }
  return { userId, email: current?.email ?? email };
}

/** Whether this request may open the paid days: a signed-in buyer, or the browser that paid. */
export async function requestHasPathAccess(userId: string | undefined): Promise<boolean> {
  if (await hasPathAccess(userId)) return true;
  const { cookies } = await import('next/headers');
  return passIsValid(cookies().get(PASS_COOKIE)?.value);
}
