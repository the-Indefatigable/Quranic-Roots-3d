import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';
import { grantPathPurchase, signPass, PASS_COOKIE, PASS_MAX_AGE } from '@/lib/pathPurchase';

export const dynamic = 'force-dynamic';

/**
 * Called by the page Stripe returns to after paying. Asks Stripe whether the session is paid,
 * unlocks the path (the webhook may not have arrived yet) and gives this browser a path pass,
 * so the paid days open immediately. Returns the email the purchase is saved under.
 */
export async function GET(request: NextRequest) {
  const limited = rateLimit(clientKey(request, 'checkout-confirm'), 20, 60_000);
  if (!limited.ok) return tooManyRequests(limited);

  const id = request.nextUrl.searchParams.get('session_id') ?? '';
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) return NextResponse.json({ error: 'Missing checkout session.' }, { status: 400 });
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'Payments are not configured.' }, { status: 503 });

  try {
    const s = await stripe.checkout.sessions.retrieve(id);
    if (s.metadata?.kind !== 'salah_path') return NextResponse.json({ error: 'Not a salah path purchase.' }, { status: 400 });
    if (s.payment_status !== 'paid') return NextResponse.json({ paid: false }, { status: 202 });
    const { email } = await grantPathPurchase(s);
    const session = await auth();
    const res = NextResponse.json({ paid: true, email, signedIn: !!session?.user?.id });
    res.cookies.set(PASS_COOKIE, signPass(s.id), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: PASS_MAX_AGE });
    return res;
  } catch (err) {
    console.error('[path] confirm failed:', err);
    return NextResponse.json({ error: 'We could not confirm the payment yet. Refresh in a moment.' }, { status: 500 });
  }
}
