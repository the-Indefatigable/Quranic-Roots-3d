export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await dbQuery(() =>
      db.select().from(users).where(eq(users.id, session.user.id))
    );

    if (!user.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = user[0];

    return NextResponse.json({
      userId: userData.id,
      userName: userData.name || userData.email,
      totalXP: userData.totalXP || 0,
      userLevel: userData.userLevel || 1,
      levelProgress: userData.levelProgress || 0,
    });
  } catch (error) {
    console.error('[users/me] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
}
