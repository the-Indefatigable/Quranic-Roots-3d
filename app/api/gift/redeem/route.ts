import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';
import { redeemGift } from '@/lib/gifts';
import { signPass, PASS_COOKIE, PASS_MAX_AGE } from '@/lib/pathPurchase';

export const dynamic = 'force-dynamic';

// POST { code, email }: accept a gifted or sponsored place. Unlocks the path for that email and
// for this browser at once.
export async function POST(request: NextRequest) {
  const limited = rateLimit(clientKey(request, 'gift-redeem'), 8, 60_000);
  if (!limited.ok) return tooManyRequests(limited);
  const parsed = z.object({ code: z.string().regex(/^(GIFT|SPONSOR)-[A-Z0-9]{6,12}$/i), email: z.string().email().max(200) }).safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Gifts are not available right now.' }, { status: 503 });
  try {
    const r = await redeemGift(stripe, parsed.data.code, parsed.data.email);
    if ('error' in r) return NextResponse.json({ error: r.error }, { status: 409 });
    const res = NextResponse.json({ ok: true, email: parsed.data.email.trim().toLowerCase() });
    res.cookies.set(PASS_COOKIE, signPass(r.passId), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: PASS_MAX_AGE });
    return res;
  } catch (err) {
    console.error('[gift] redeem failed:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
