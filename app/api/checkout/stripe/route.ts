import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStripe, SUPPORTER_PRICE_CENTS } from '@/lib/stripe';

export const dynamic = 'force-dynamic';

/**
 * Creates a Stripe Checkout Session for the one-time $99 Founding Supporter
 * purchase and returns its URL. The signed-in user's id rides along in metadata
 * (and client_reference_id) so the webhook can attribute the payment.
 */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: 'Payments not configured' }, { status: 503 });
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://quroots.com';

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: session.user.id,
      customer_email: session.user.email ?? undefined,
      metadata: { user_id: session.user.id },
      // Attach to the PaymentIntent too, so it's present on every webhook shape.
      payment_intent_data: { metadata: { user_id: session.user.id } },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: SUPPORTER_PRICE_CENTS,
            product_data: {
              name: 'QuRoots Founding Supporter — Lifetime',
              description:
                'A one-time gift that keeps QuRoots free for learners everywhere and unlocks every current and future Pro feature, for life.',
            },
          },
        },
      ],
      success_url: `${origin}/profile?supporter=success`,
      cancel_url: `${origin}/profile?supporter=cancelled`,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('[stripe] checkout session failed:', err);
    return NextResponse.json({ error: 'Could not start checkout' }, { status: 500 });
  }
}
