export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { users, quizSessions } from '@/db/schema';
import { gte } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all users
    const allUsers = await dbQuery(() =>
      db.select({
        id: users.id,
        name: users.name,
        userLevel: users.userLevel,
      }).from(users)
    );

    // Get recent sessions (last 7 days)
    const recentSessions = await dbQuery(() =>
      db
        .select({
          userId: quizSessions.userId,
          correctCount: quizSessions.correctCount,
        })
        .from(quizSessions)
        .where(gte(quizSessions.sessionStartedAt, sevenDaysAgo))
    );

    // Calculate XP per user for this week
    const weeklyXPMap = new Map<string, number>();
    recentSessions.forEach((session) => {
      const xp = (session.correctCount || 0) * 10;
      weeklyXPMap.set(session.userId, (weeklyXPMap.get(session.userId) || 0) + xp);
    });

    // Build leaderboard
    const leaderboard = allUsers
      .map((u) => ({
        userId: u.id,
        userName: u.name || 'Anonymous',
        totalXP: weeklyXPMap.get(u.id) || 0,
        userLevel: u.userLevel || 1,
      }))
      .filter((u) => u.totalXP > 0)
      .sort((a, b) => b.totalXP - a.totalXP);

    // Add ranks
    const rankedUsers = leaderboard.map((u, idx) => ({
      rank: idx + 1,
      ...u,
    }));

    // Find current user's rank
    const myRank = rankedUsers.find((u) => u.userId === session.user.id) || null;

    return NextResponse.json({
      entries: rankedUsers.slice(0, 100),
      myRank,
    });
  } catch (error) {
    console.error('[leaderboards/weekly] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
