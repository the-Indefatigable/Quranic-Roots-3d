/**
 * Achievement Engine
 * Handles achievement unlocking, checking, and progress tracking
 */

import { db, dbQuery } from '@/db';
import { achievements, userAchievements, users } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export interface Achievement {
  id: string;
  title: string;
  description: string | null;
  category: string;
  iconSvg: string | null;
  xpBonus: number | null;
  unlockcriteria: unknown;
}

export interface UnlockedAchievement extends Achievement {
  unlockedAt: Date | null;
}

/**
 * Get all available achievements
 */
export async function getAllAchievements(): Promise<Achievement[]> {
  return await dbQuery(() => db.select().from(achievements));
}

/**
 * Get user's unlocked achievements
 */
export async function getUserAchievements(userId: string): Promise<UnlockedAchievement[]> {
  return await dbQuery(() =>
    db
      .select({
        id: achievements.id,
        title: achievements.title,
        description: achievements.description,
        category: achievements.category,
        iconSvg: achievements.iconSvg,
        xpBonus: achievements.xpBonus,
        unlockcriteria: achievements.unlockcriteria,
        unlockedAt: userAchievements.unlockedAt,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(userAchievements.unlockedAt)
  );
}

/**
 * Check if user has unlocked a specific achievement
 */
export async function hasAchievement(userId: string, achievementTitle: string): Promise<boolean> {
  const result = await dbQuery(() =>
    db
      .select({ id: userAchievements.achievementId })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(and(eq(userAchievements.userId, userId), eq(achievements.title, achievementTitle)))
      .limit(1)
  );

  return result.length > 0;
}

/**
 * Unlock achievement for user (idempotent - returns true if newly unlocked, false if already had it)
 */
export async function unlockAchievement(
  userId: string,
  achievementTitle: string,
  awardXP: boolean = true
): Promise<{ newlyUnlocked: boolean; xpBonus: number }> {
  // Get achievement by title
  const [achievement] = await dbQuery(() =>
    db.select().from(achievements).where(eq(achievements.title, achievementTitle))
  );

  if (!achievement) {
    return { newlyUnlocked: false, xpBonus: 0 };
  }

  // Check if already unlocked
  const alreadyUnlocked = await hasAchievement(userId, achievementTitle);
  if (alreadyUnlocked) {
    return { newlyUnlocked: false, xpBonus: 0 };
  }

  // Unlock achievement
  await dbQuery(() =>
    db.insert(userAchievements).values({
      userId,
      achievementId: achievement.id,
    })
  );

  // Award XP if enabled — atomic increment to prevent race conditions
  const xpBonus = achievement.xpBonus || 0;
  if (awardXP && xpBonus > 0) {
    await dbQuery(() =>
      db
        .update(users)
        .set({
          totalXP: sql`${users.totalXP} + ${xpBonus}`,
        })
        .where(eq(users.id, userId))
    );
  }

  return { newlyUnlocked: true, xpBonus };
}

/**
 * Check and unlock achievements based on user progress
 * Called after quiz sessions or when user updates progress
 */
export async function checkAndUnlockAchievements(
  userId: string,
  stats: {
    totalXP?: number;
    rootsMastered?: number;
    nounsMastered?: number;
    particlesMastered?: number;
    streakDays?: number;
    recentAnswerTimes?: number[];
  }
): Promise<{ unlockedAchievements: UnlockedAchievement[]; totalXPEarned: number }> {
  const unlockedAchievements: UnlockedAchievement[] = [];
  let totalXPEarned = 0;

  // MILESTONE achievements (based on total XP)
  if (stats.totalXP !== undefined) {
    if (stats.totalXP >= 10 && !(await hasAchievement(userId, 'First Steps'))) {
      const result = await unlockAchievement(userId, 'First Steps', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('First Steps');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }

    if (stats.totalXP >= 100 && !(await hasAchievement(userId, 'Century Club'))) {
      const result = await unlockAchievement(userId, 'Century Club', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Century Club');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }

    if (stats.totalXP >= 500 && !(await hasAchievement(userId, 'Brilliant Mind'))) {
      const result = await unlockAchievement(userId, 'Brilliant Mind', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Brilliant Mind');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }

    if (stats.totalXP >= 1000 && !(await hasAchievement(userId, 'Master Learner'))) {
      const result = await unlockAchievement(userId, 'Master Learner', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Master Learner');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }
  }

  // MASTERY achievements (based on count of mastered items)
  if (stats.rootsMastered !== undefined) {
    if (stats.rootsMastered >= 5 && !(await hasAchievement(userId, 'Root Explorer'))) {
      const result = await unlockAchievement(userId, 'Root Explorer', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Root Explorer');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }

    if (stats.rootsMastered >= 25 && !(await hasAchievement(userId, 'Root Master'))) {
      const result = await unlockAchievement(userId, 'Root Master', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Root Master');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }

    if (stats.rootsMastered >= 50 && !(await hasAchievement(userId, 'Verb Virtuoso'))) {
      const result = await unlockAchievement(userId, 'Verb Virtuoso', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Verb Virtuoso');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }
  }

  if (stats.nounsMastered !== undefined) {
    if (stats.nounsMastered >= 50 && !(await hasAchievement(userId, 'Word Warrior'))) {
      const result = await unlockAchievement(userId, 'Word Warrior', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Word Warrior');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }
  }

  if (stats.particlesMastered !== undefined) {
    if (stats.particlesMastered >= 25 && !(await hasAchievement(userId, 'Grammar Guardian'))) {
      const result = await unlockAchievement(userId, 'Grammar Guardian', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Grammar Guardian');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }
  }

  // STREAK achievements
  if (stats.streakDays !== undefined) {
    if (stats.streakDays >= 3 && !(await hasAchievement(userId, 'On Fire'))) {
      const result = await unlockAchievement(userId, 'On Fire', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('On Fire');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }

    if (stats.streakDays >= 7 && !(await hasAchievement(userId, 'Unstoppable'))) {
      const result = await unlockAchievement(userId, 'Unstoppable', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Unstoppable');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }

    if (stats.streakDays >= 30 && !(await hasAchievement(userId, 'Legend Status'))) {
      const result = await unlockAchievement(userId, 'Legend Status', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Legend Status');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }
  }

  // SPEED achievements
  if (stats.recentAnswerTimes && stats.recentAnswerTimes.length >= 5) {
    const avgTime = stats.recentAnswerTimes.reduce((a, b) => a + b, 0) / stats.recentAnswerTimes.length;

    if (avgTime < 3000 && !(await hasAchievement(userId, 'Quick Learner'))) {
      const result = await unlockAchievement(userId, 'Quick Learner', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Quick Learner');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }
  }

  if (stats.recentAnswerTimes && stats.recentAnswerTimes.length >= 10) {
    const avgTime = stats.recentAnswerTimes.slice(-10).reduce((a, b) => a + b, 0) / 10;

    if (avgTime < 2000 && !(await hasAchievement(userId, 'Lightning Fast'))) {
      const result = await unlockAchievement(userId, 'Lightning Fast', true);
      if (result.newlyUnlocked) {
        totalXPEarned += result.xpBonus;
        const ach = await getAchievementByTitle('Lightning Fast');
        if (ach) unlockedAchievements.push({ ...ach, unlockedAt: new Date() });
      }
    }
  }

  return { unlockedAchievements, totalXPEarned };
}

/**
 * Get achievement by title (helper)
 */
async function getAchievementByTitle(title: string): Promise<UnlockedAchievement | null> {
  const [ach] = await dbQuery(() =>
    db.select().from(achievements).where(eq(achievements.title, title))
  );

  if (!ach) return null;
  return { ...ach, unlockedAt: new Date() };
}
