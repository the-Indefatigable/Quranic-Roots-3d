import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/** Returns whether the signed-in user is a Founding Supporter. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ isSupporter: false, authed: false });
  }

  try {
    const [row] = await db
      .select({ isSupporter: users.isSupporter, since: users.supporterSince })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    return NextResponse.json({
      isSupporter: !!row?.isSupporter,
      since: row?.since ?? null,
      authed: true,
    });
  } catch (err) {
    console.error('[supporter] lookup failed:', err);
    return NextResponse.json({ isSupporter: false, authed: true, error: true });
  }
}
