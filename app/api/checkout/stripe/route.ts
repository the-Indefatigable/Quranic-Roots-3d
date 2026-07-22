import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStripe, MIN_DONATION_CENTS, MAX_DONATION_CENTS } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Creates a Stripe Checkout Session for a one-time, pay-what-you-want donation
 * and returns its URL. Nothing is gated — this is pure support. The signed-in
 * user's id rides along in metadata (and client_reference_id) so the webhook can
 * record who donated (for the thank-you badge).
 *
 * Body: { amount: number }  // whole US dollars
 */
export async function POST(request: NextRequest) {
  // Donations are frictionless — anyone can give, signed in or not. When we do
  // know the user we attribute the gift (for the thank-you badge); otherwise the
  // donation is simply anonymous.
  const session = await auth();
  const userId = session?.user?.id;

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Donations not configured' }, { status: 503 });
  }

  let amountDollars = 0;
  try {
    const body = await request.json();
    amountDollars = Number(body?.amount);
  } catch {
    /* fall through to validation */
  }

  const cents = Math.round(amountDollars * 100);
  if (!Number.isFinite(cents) || cents < MIN_DONATION_CENTS || cents > MAX_DONATION_CENTS) {
    return NextResponse.json({ error: 'Please choose an amount between $1 and $10,000.' }, { status: 400 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://quroots.com';

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      submit_type: 'donate',
      client_reference_id: userId,
      customer_email: session?.user?.email ?? undefined,
      metadata: { user_id: userId ?? '', kind: 'donation' },
      payment_intent_data: { metadata: { user_id: userId ?? '', kind: 'donation' } },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: cents,
            product_data: {
              name: 'Support QuRoots',
              description:
                'A one-time gift that keeps QuRoots free for learners everywhere. Thank you 🌱',
            },
          },
        },
      ],
      success_url: `${origin}/profile?donation=success`,
      cancel_url: `${origin}/profile?donation=cancelled`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('[stripe] donation session failed:', err);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }
}
