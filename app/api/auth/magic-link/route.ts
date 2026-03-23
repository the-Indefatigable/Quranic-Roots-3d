import { NextResponse } from 'next/server';
import { createMagicLinkToken, canSendMagicLink } from '@/lib/auth';
import { sendMagicLinkEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limit: 1 per 60 seconds per email
    const allowed = await canSendMagicLink(normalizedEmail);
    if (!allowed) {
      return NextResponse.json({ error: 'Please wait before requesting another link' }, { status: 429 });
    }

    const token = await createMagicLinkToken(normalizedEmail);
    await sendMagicLinkEmail(normalizedEmail, token);

    // Always return ok (don't reveal if user exists)
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/magic-link] Error:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
