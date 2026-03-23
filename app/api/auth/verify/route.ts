import { NextRequest, NextResponse } from 'next/server';
import { verifyMagicLinkToken, findOrCreateUser, createSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (!token) {
    return NextResponse.redirect(`${appUrl}/?auth=error&reason=missing_token`);
  }

  try {
    const email = await verifyMagicLinkToken(token);

    if (!email) {
      return NextResponse.redirect(`${appUrl}/?auth=error&reason=invalid_or_expired`);
    }

    const user = await findOrCreateUser(email);
    await createSession(user.id);

    return NextResponse.redirect(`${appUrl}/quran?auth=success`);
  } catch (err) {
    console.error('[auth/verify] Error:', err);
    return NextResponse.redirect(`${appUrl}/?auth=error&reason=server_error`);
  }
}
