export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import {
  users,
  userHearts,
  userStreaks,
  userGems,
  dailyGoals,
  dailyQuests,
  userLessonProgress,
  learningLessons,
  learningUnits,
  leagueMembers,
  weeklyLeagues,
} from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const today = new Date().toISOString().slice(0, 10);

    // Fetch all dashboard data in parallel
    const [
      [user],
      [heartRow],
      [streakRow],
      [gemRow],
      [goalRow],
      quests,
      nextLessonResult,
      leagueResult,
    ] = await Promise.all([
      dbQuery(() => db.select().from(users).where(eq(users.id, userId))),
      dbQuery(() => db.select().from(userHearts).where(eq(userHearts.userId, userId))),
      dbQuery(() => db.select().from(userStreaks).where(eq(userStreaks.userId, userId))),
      dbQuery(() => db.select().from(userGems).where(eq(userGems.userId, userId))),
      dbQuery(() => db.select().from(dailyGoals).where(and(eq(dailyGoals.userId, userId), eq(dailyGoals.goalDate, today)))),
      dbQuery(() => db.select().from(dailyQuests).where(and(eq(dailyQuests.userId, userId), eq(dailyQuests.questDate, today)))),
      // Next available lesson
      dbQuery(() =>
        db.select({
          lessonId: userLessonProgress.lessonId,
          lessonTitle: learningLessons.title,
          unitTitle: learningUnits.title,
          unitColor: learningUnits.color,
          unitEmoji: learningUnits.iconEmoji,
        })
          .from(userLessonProgress)
          .innerJoin(learningLessons, eq(userLessonProgress.lessonId, learningLessons.id))
          .innerJoin(learningUnits, eq(learningLessons.unitId, learningUnits.id))
          .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.status, 'available')))
          .orderBy(learningUnits.sortOrder, learningLessons.sortOrder)
          .limit(1)
      ),
      // Current league
      dbQuery(() =>
        db.select({
          tier: weeklyLeagues.tier,
          rank: leagueMembers.rank,
          weeklyXp: leagueMembers.weeklyXp,
        })
          .from(leagueMembers)
          .innerJoin(weeklyLeagues, eq(leagueMembers.leagueId, weeklyLeagues.id))
          .where(eq(leagueMembers.userId, userId))
          .orderBy(desc(weeklyLeagues.weekStart))
          .limit(1)
      ),
    ]);

    // Auto-refill hearts
    let hearts = heartRow?.hearts ?? 5;
    if (heartRow) {
      const now = Date.now();
      const lastRefill = heartRow.lastRefillAt ? new Date(heartRow.lastRefillAt).getTime() : now;
      const hoursSince = (now - lastRefill) / (1000 * 60 * 60);
      const refillCount = Math.min(Math.floor(hoursSince / 4), heartRow.maxHearts - heartRow.hearts);
      hearts = Math.min(heartRow.hearts + refillCount, heartRow.maxHearts);
    }

    const LEAGUE_NAMES = ['', 'Bronze', 'Silver', 'Gold', 'Sapphire', 'Ruby', 'Emerald', 'Amethyst', 'Pearl', 'Obsidian', 'Diamond'];

    return NextResponse.json({
      user: {
        name: user?.name,
        level: user?.userLevel || 1,
        totalXP: user?.totalXP || 0,
      },
      hearts,
      streak: {
        current: streakRow?.currentStreak || 0,
        longest: streakRow?.longestStreak || 0,
        freezes: streakRow?.streakFreezesOwned || 0,
      },
      gems: gemRow?.balance || 0,
      dailyGoal: goalRow
        ? { targetXp: goalRow.targetXp, earnedXp: goalRow.earnedXp, completed: goalRow.completed, lessonsCompleted: goalRow.lessonsCompleted }
        : { targetXp: 30, earnedXp: 0, completed: false, lessonsCompleted: 0 },
      quests: quests.map((q) => ({
        id: q.id,
        type: q.questType,
        title: q.title,
        target: q.target,
        progress: q.progress,
        gemReward: q.gemReward,
        completed: q.completed,
      })),
      nextLesson: nextLessonResult[0] || null,
      league: leagueResult[0]
        ? { tier: leagueResult[0].tier, name: LEAGUE_NAMES[leagueResult[0].tier] || 'Bronze', rank: leagueResult[0].rank, weeklyXp: leagueResult[0].weeklyXp }
        : null,
    });
  } catch (error) {
    console.error('[API] /dashboard error:', error);
    return NextResponse.json({ error: 'Failed to load dashboard' }, { status: 500 });
  }
}
