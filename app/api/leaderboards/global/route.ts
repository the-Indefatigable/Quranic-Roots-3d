export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { users } from '@/db/schema';
import { desc, gt } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get top 100 users by total XP with XP > 0
    const topUsers = await dbQuery(() =>
      db
        .select({
          userId: users.id,
          userName: users.name,
          totalXP: users.totalXP,
          userLevel: users.userLevel,
        })
        .from(users)
        .where(gt(users.totalXP || 0, 0))
        .orderBy(desc(users.totalXP))
        .limit(100)
    );

    // Add ranks
    const rankedUsers = topUsers.map((u, idx) => ({
      rank: idx + 1,
      userId: u.userId,
      userName: u.userName || 'Anonymous',
      totalXP: u.totalXP || 0,
      userLevel: u.userLevel || 1,
    }));

    // Find current user's rank
    const myRank = rankedUsers.find((u) => u.userId === session.user.id) || null;

    return NextResponse.json({
      entries: rankedUsers,
      myRank,
    });
  } catch (error) {
    console.error('[leaderboards/global] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
}
