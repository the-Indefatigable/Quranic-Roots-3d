import { NextRequest, NextResponse } from 'next/server';
import { getStripe } from '@/lib/stripe';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';
import { issueGiftCode } from '@/lib/gifts';

export const dynamic = 'force-dynamic';

// GET ?session_id=…: the page after paying for a gift or sponsorship. Confirms the payment with
// Stripe and returns the code (issued here if the webhook hasn't yet).
export async function GET(request: NextRequest) {
  const limited = rateLimit(clientKey(request, 'gift-sent'), 20, 60_000);
  if (!limited.ok) return tooManyRequests(limited);
  const id = request.nextUrl.searchParams.get('session_id') ?? '';
  const stripe = getStripe();
  if (!stripe || !/^cs_[A-Za-z0-9_]+$/.test(id)) return NextResponse.json({ error: 'Missing checkout session.' }, { status: 400 });
  try {
    const s = await stripe.checkout.sessions.retrieve(id);
    if (s.metadata?.kind !== 'salah_gift' && s.metadata?.kind !== 'salah_sponsor') return NextResponse.json({ error: 'Not a gift.' }, { status: 400 });
    if (s.payment_status !== 'paid') return NextResponse.json({ paid: false }, { status: 202 });
    const { code, kind } = await issueGiftCode(stripe, s);
    return NextResponse.json({ paid: true, kind, code, url: `https://quroots.com/gift/${code}`, from: s.metadata?.gift_from ?? '' });
  } catch (err) {
    console.error('[gift] sent failed:', err);
    return NextResponse.json({ error: 'We could not confirm the payment yet. Refresh in a moment.' }, { status: 500 });
  }
}
