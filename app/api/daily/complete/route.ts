export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { addXPToUser } from '@/utils/levelEngine';

const Body = z.object({ kind: z.enum(['ayah', 'hadith', 'quiz']) });
const XP_REWARD = 10;

// POST /api/daily/complete { kind } — grant XP once per user per day per kind,
// and keep the daily streak alive. Idempotent via the daily_reviews unique key.
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    const { kind } = parsed.data;

    // Idempotent insert — if a row already exists for today+kind, no XP is granted.
    const inserted = (await dbQuery(() =>
      db.execute(sql`
        INSERT INTO daily_reviews (user_id, review_date, kind, xp_earned)
        VALUES (${userId}, CURRENT_DATE, ${kind}, ${XP_REWARD})
        ON CONFLICT (user_id, review_date, kind) DO NOTHING
        RETURNING id
      `)
    )) as any[];

    if (inserted.length === 0) {
      return NextResponse.json({ alreadyDone: true, xpEarned: 0 });
    }

    await addXPToUser(userId, XP_REWARD);

    // ── Keep the daily streak alive (mirrors the lesson-complete logic) ──
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

    const [streak] = (await dbQuery(() =>
      db.execute(sql`SELECT current_streak, longest_streak, last_active_date FROM user_streaks WHERE user_id = ${userId}`)
    )) as any[];

    let currentStreak = 1;
    if (!streak) {
      await dbQuery(() =>
        db.execute(sql`INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_active_date) VALUES (${userId}, 1, 1, ${today})`)
      );
    } else {
      const last = streak.last_active_date ? String(streak.last_active_date).slice(0, 10) : null;
      if (last === today) {
        currentStreak = streak.current_streak;
      } else if (last === yesterday) {
        currentStreak = streak.current_streak + 1;
        await dbQuery(() =>
          db.execute(sql`UPDATE user_streaks SET current_streak = ${currentStreak}, longest_streak = GREATEST(${currentStreak}, longest_streak), last_active_date = ${today}, updated_at = now() WHERE user_id = ${userId}`)
        );
      } else {
        currentStreak = 1;
        await dbQuery(() =>
          db.execute(sql`UPDATE user_streaks SET current_streak = 1, last_active_date = ${today}, updated_at = now() WHERE user_id = ${userId}`)
        );
      }
    }

    // Keep the denormalized fields (used by the leaderboard) in sync.
    await dbQuery(() =>
      db.execute(sql`UPDATE users SET streak_days = ${currentStreak}, last_active = ${today}, updated_at = now() WHERE id = ${userId}`)
    );

    return NextResponse.json({ xpEarned: XP_REWARD, currentStreak });
  } catch (error) {
    console.error('[daily/complete] error:', error);
    return NextResponse.json({ error: 'Failed to record review' }, { status: 500 });
  }
}
