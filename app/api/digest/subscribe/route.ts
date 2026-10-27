export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { recordConsent } from '@/lib/email';

// GET → current opt-in status
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const [row] = await dbQuery(() =>
      db.select({ optIn: users.digestOptIn, reminders: users.remindersOptIn }).from(users).where(eq(users.id, session.user.id))
    );
    return NextResponse.json({ optIn: row?.optIn ?? false, reminders: row?.reminders ?? false });
  } catch (error) {
    console.error('[digest/subscribe GET] Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST { optIn: boolean, kind?: 'weekly' | 'reminders', source?: string } → set one opt-in and
// record it, with the words shown, in email_consents.
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const parsed = z.object({ optIn: z.boolean(), kind: z.enum(['weekly', 'reminders']).default('weekly'), source: z.string().max(60).default('dashboard') }).safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const { optIn, kind, source } = parsed.data;
    await dbQuery(() =>
      db.update(users)
        .set({ ...(kind === 'weekly' ? { digestOptIn: optIn } : { remindersOptIn: optIn }), updatedAt: new Date() })
        .where(eq(users.id, session.user.id))
    );
    await recordConsent(session.user.id, kind, optIn, source);
    return NextResponse.json({ success: true, optIn, kind });
  } catch (error) {
    console.error('[digest/subscribe POST] Error:', error);
    return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
  }
}
