export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { quizSessions, userRootMastery, userNounMastery, userParticleMastery, achievements, userAchievements } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUserLevelInfo } from '@/utils/levelEngine';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get quiz sessions, masteries, level info, and achievements in parallel
    const [sessions, roots, nouns, particles, levelInfo, allAchievements, unlockedAchievements] = await Promise.all([
      dbQuery(() =>
        db.select().from(quizSessions).where(eq(quizSessions.userId, userId))
      ),
      dbQuery(() =>
        db.select().from(userRootMastery).where(eq(userRootMastery.userId, userId))
      ),
      dbQuery(() =>
        db.select().from(userNounMastery).where(eq(userNounMastery.userId, userId))
      ),
      dbQuery(() =>
        db.select().from(userParticleMastery).where(eq(userParticleMastery.userId, userId))
      ),
      getUserLevelInfo(userId),
      dbQuery(() => db.select().from(achievements)),
      dbQuery(() =>
        db.select({ achievementId: userAchievements.achievementId, unlockedAt: userAchievements.unlockedAt })
          .from(userAchievements)
          .where(eq(userAchievements.userId, userId))
      ),
    ]);

    const totalSessions = sessions.length;
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctCount, 0);
    const totalAttempts = sessions.reduce((sum, s) => sum + s.itemCount, 0);
    const avgAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const totalXP = levelInfo?.totalXP ?? totalCorrect * 10;

    const masteryBreakdown = {
      roots: {
        learned: roots.filter((r) => (r.mastery ?? 0) >= 1).length,
        total: roots.length,
        avgMastery: roots.length > 0 ? Math.round((roots.reduce((s, r) => s + (r.mastery ?? 0), 0) / roots.length) * 10) / 10 : 0,
      },
      nouns: {
        learned: nouns.filter((n) => (n.mastery ?? 0) >= 1).length,
        total: nouns.length,
        avgMastery: nouns.length > 0 ? Math.round((nouns.reduce((s, n) => s + (n.mastery ?? 0), 0) / nouns.length) * 10) / 10 : 0,
      },
      particles: {
        learned: particles.filter((p) => (p.mastery ?? 0) >= 1).length,
        total: particles.length,
        avgMastery:
          particles.length > 0 ? Math.round((particles.reduce((s, p) => s + (p.mastery ?? 0), 0) / particles.length) * 10) / 10 : 0,
      },
    };

    // Merge all achievements with user's unlocked status
    const unlockedMap = new Map(unlockedAchievements.map((u) => [u.achievementId, u.unlockedAt]));
    const mergedAchievements = allAchievements.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category,
      xpBonus: a.xpBonus,
      unlockedAt: unlockedMap.get(a.id)?.toISOString() ?? null,
    }));

    // Compute SRS stats from already-fetched mastery data (no extra queries)
    const allMasteryItems = [...roots, ...nouns, ...particles];
    const totalLearned = allMasteryItems.filter((item) => (item.mastery ?? 0) >= 1).length;
    const overallAvgMastery = allMasteryItems.length > 0
      ? Math.round((allMasteryItems.reduce((sum, item) => sum + (item.mastery ?? 0), 0) / allMasteryItems.length) * 10) / 10
      : 0;

    return NextResponse.json({
      totalSessions,
      totalCorrect,
      totalAttempts,
      avgAccuracy,
      totalXP,
      levelInfo: levelInfo ?? {
        level: 1,
        totalXP: 0,
        levelProgress: 0,
        xpToNextLevel: 100,
        nextLevelThreshold: 100,
      },
      achievements: mergedAchievements,
      masteryBreakdown,
      totalLearned,
      overallAvgMastery,
    });
  } catch (error) {
    console.error('[quiz/stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
