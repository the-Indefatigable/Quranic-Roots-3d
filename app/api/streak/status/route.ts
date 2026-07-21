export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';

// GET /api/streak/status — the signed-in user's streak, freezes, and whether
// today's streak is at risk (a streak exists but there's been no activity today).
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ loggedIn: false });

    const [row] = (await dbQuery(() =>
      db.execute(sql`
        SELECT current_streak, longest_streak, streak_freezes_owned,
               (last_active_date = CURRENT_DATE) AS did_today
        FROM user_streaks WHERE user_id = ${session.user.id}
      `)
    )) as any[];

    const currentStreak = row?.current_streak ?? 0;
    const didToday = row?.did_today ?? false;

    return NextResponse.json({
      loggedIn: true,
      currentStreak,
      longestStreak: row?.longest_streak ?? 0,
      freezes: row?.streak_freezes_owned ?? 0,
      didToday,
      atRisk: currentStreak >= 1 && !didToday,
    });
  } catch (error) {
    console.error('[streak/status] error:', error);
    return NextResponse.json({ loggedIn: false }, { status: 200 });
  }
}
