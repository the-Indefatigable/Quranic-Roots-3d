import { createHmac } from 'crypto';
import type Stripe from 'stripe';
import { grantPath } from '@/lib/pathPurchase';
import { PATH_ORDER_PREFIX } from '@/lib/salahPath';

/**
 * Gifting and sponsoring the salah path, kept in Stripe so there is nothing new to store.
 *
 * A paid gift or sponsorship becomes a single-use Stripe promotion code on a 100%-off coupon.
 * Gift codes go to the buyer to pass on (quroots.com/gift/GIFT-XXXX); sponsor codes wait in a
 * pool for people who ask for a free place. Redeeming checks the code with Stripe, unlocks the
 * path for the redeemer's email under path:gift_<promotion code id>, then switches the code off.
 */

export type GiftKind = 'gift' | 'sponsor';
const COUPON_ID = 'qr-salah-path-gift';

/** Same checkout session, same code: webhook retries and the success page never create two. */
export function giftCodeFor(sessionId: string, kind: GiftKind) {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'qr';
  const h = createHmac('sha256', secret).update(`gift:${sessionId}`).digest();
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const body = Array.from(h.subarray(0, 8), (b) => alphabet[b % alphabet.length]).join('');
  return `${kind === 'sponsor' ? 'SPONSOR' : 'GIFT'}-${body}`;
}

async function ensureCoupon(stripe: Stripe) {
  try { await stripe.coupons.retrieve(COUPON_ID); }
  catch { await stripe.coupons.create({ id: COUPON_ID, percent_off: 100, duration: 'once', name: 'Salah path, gifted' }).catch(() => {}); }
}

const couponOf = (p: Stripe.PromotionCode) => { const c = p.promotion?.coupon; return typeof c === 'string' ? c : c?.id; };

export async function findGift(stripe: Stripe, code: string) {
  const list = await stripe.promotionCodes.list({ code: code.trim().toUpperCase(), limit: 1 });
  return list.data[0] ?? null;
}

/** Create (or find) the code a paid gift or sponsorship checkout should have. */
export async function issueGiftCode(stripe: Stripe, s: Pick<Stripe.Checkout.Session, 'id' | 'metadata'>) {
  const kind: GiftKind = s.metadata?.kind === 'salah_sponsor' ? 'sponsor' : 'gift';
  const code = giftCodeFor(s.id, kind);
  const existing = await findGift(stripe, code);
  if (existing) return { code, kind, promo: existing };
  await ensureCoupon(stripe);
  const promo = await stripe.promotionCodes.create({
    promotion: { type: 'coupon', coupon: COUPON_ID }, code, max_redemptions: 1,
    metadata: { kind, session: s.id, from: (s.metadata?.gift_from ?? '').slice(0, 60), message: (s.metadata?.gift_message ?? '').slice(0, 300) },
  });
  return { code, kind, promo };
}

export type GiftInfo = { code: string; kind: GiftKind; from: string; message: string; usable: boolean };

export async function giftInfo(stripe: Stripe, code: string): Promise<GiftInfo | null> {
  const promo = await findGift(stripe, code);
  if (!promo || couponOf(promo) !== COUPON_ID) return null;
  const m = promo.metadata ?? {};
  return { code: promo.code, kind: m.kind === 'sponsor' ? 'sponsor' : 'gift', from: m.from ?? '', message: m.message ?? '', usable: promo.active && !m.redeemed_by };
}

/** Unlock the path for this email with a gift code, then switch the code off. Returns the pass id. */
export async function redeemGift(stripe: Stripe, code: string, email: string): Promise<{ passId: string } | { error: string }> {
  const promo = await findGift(stripe, code);
  if (!promo || couponOf(promo) !== COUPON_ID) return { error: 'That gift code doesn’t exist. Check the link you were sent.' };
  if (!promo.active || promo.metadata?.redeemed_by) return { error: 'This gift has already been used.' };
  const passId = `gift_${promo.id}`;
  await grantPath({ order: `${PATH_ORDER_PREFIX}${passId}`, email: email.trim().toLowerCase(),
    event: { visitorId: null, value: 0, source: 'gift', campaign: promo.metadata?.kind ?? 'gift', variant: null } });
  await stripe.promotionCodes.update(promo.id, { active: false, metadata: { ...promo.metadata, redeemed_by: email.trim().toLowerCase().slice(0, 200), redeemed_at: new Date().toISOString() } });
  return { passId };
}

/** Sponsor codes nobody has used yet, for answering free-place requests. */
export async function sponsorPool(stripe: Stripe) {
  const list = await stripe.promotionCodes.list({ active: true, limit: 100 });
  return list.data.filter((p) => couponOf(p) === COUPON_ID && p.metadata?.kind === 'sponsor' && !p.metadata?.redeemed_by).map((p) => ({ code: p.code, created: p.created }));
}
