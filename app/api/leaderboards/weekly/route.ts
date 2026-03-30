export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { users, quizSessions } from '@/db/schema';
import { eq, gte, desc, sql } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Single SQL query: JOIN users + sessions, GROUP BY user, ORDER BY XP, LIMIT 100
    const topUsers = await dbQuery(() =>
      db
        .select({
          userId: users.id,
          userName: users.name,
          userLevel: users.userLevel,
          totalXP: sql<number>`COALESCE(SUM(${quizSessions.correctCount} * 10), 0)`.as('total_xp'),
        })
        .from(quizSessions)
        .innerJoin(users, eq(quizSessions.userId, users.id))
        .where(gte(quizSessions.sessionStartedAt, sevenDaysAgo))
        .groupBy(users.id, users.name, users.userLevel)
        .orderBy(desc(sql`total_xp`))
        .limit(100)
    );

    // Add ranks
    const rankedUsers = topUsers.map((u, idx) => ({
      rank: idx + 1,
      userId: u.userId,
      userName: u.userName || 'Anonymous',
      totalXP: Number(u.totalXP) || 0,
      userLevel: u.userLevel || 1,
    }));

    // Find current user's rank
    const myRank = rankedUsers.find((u) => u.userId === session.user.id) || null;

    return NextResponse.json({
      entries: rankedUsers,
      myRank,
    });
  } catch (error) {
    console.error('[leaderboards/weekly] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
