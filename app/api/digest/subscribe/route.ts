export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET → current opt-in status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const [row] = await dbQuery(() =>
      db.select({ optIn: users.digestOptIn }).from(users).where(eq(users.id, session.user.id))
    );
    return NextResponse.json({ optIn: row?.optIn ?? false });
  } catch (error) {
    console.error('[digest/subscribe GET] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST { optIn: boolean } → set opt-in
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const parsed = z.object({ optIn: z.boolean() }).safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    await dbQuery(() =>
      db.update(users)
        .set({ digestOptIn: parsed.data.optIn, updatedAt: new Date() })
        .where(eq(users.id, session.user.id))
    );
    return NextResponse.json({ success: true, optIn: parsed.data.optIn });
  } catch (error) {
    console.error('[digest/subscribe POST] Error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
