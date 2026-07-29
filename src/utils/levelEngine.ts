/**
 * Level Engine
 * Handles user level progression, XP tracking, and level thresholds
 */

import { db, dbQuery } from '@/db';
import { users } from '@/db/schema';
import { and, eq, lte, sql } from 'drizzle-orm';

/**
 * Level threshold configuration
 * Maps level to minimum XP required for that level
 */
const LEVEL_THRESHOLDS = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
};

/**
 * Get XP threshold for a specific level
 */
export function getXPThresholdForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level <= 6) return LEVEL_THRESHOLDS[level as keyof typeof LEVEL_THRESHOLDS];
  // For levels 7+, each level requires +300 XP from previous
  const baseXP = LEVEL_THRESHOLDS[6];
  return baseXP + (level - 6) * 300;
}

/**
 * Get XP required to reach next level (from current level)
 */
export function getXPToNextLevel(currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  const nextThreshold = getXPThresholdForLevel(nextLevel);
  const currentThreshold = getXPThresholdForLevel(currentLevel);
  return nextThreshold - currentThreshold;
}

/**
 * Calculate level based on total XP
 */
export function calculateLevelFromXP(totalXP: number): { level: number; levelProgress: number } {
  let level = 1;

  // Binary search for current level
  for (let l = 6; l >= 1; l--) {
    if (totalXP >= getXPThresholdForLevel(l)) {
      level = l;
      break;
    }
  }

  // Check if we should be even higher (7+)
  const baseThreshold = getXPThresholdForLevel(6);
  if (totalXP >= baseThreshold) {
    level = 6 + Math.floor((totalXP - baseThreshold) / 300);
  }

  // Calculate progress within current level
  const currentThreshold = getXPThresholdForLevel(level);
  const nextThreshold = getXPThresholdForLevel(level + 1);
  const levelProgress = Math.min(totalXP - currentThreshold, nextThreshold - currentThreshold);

  return { level, levelProgress };
}

/**
 * Add XP to a user and recompute their level.
 *
 * This is the ONLY place `users.total_xp` should be written. Level is derived
 * from the value the database actually landed on (via RETURNING), not from a
 * value read beforehand — otherwise two concurrent awards each compute a level
 * from the same stale total and one of them writes a level that is too low.
 *
 * Returns the new level when the user levelled up, otherwise null.
 */
export async function addXPToUser(
  userId: string,
  xpAmount: number
): Promise<{ newLevel: number | null; newTotalXP: number; totalXPEarned: number }> {
  if (!Number.isFinite(xpAmount) || xpAmount <= 0) {
    const [user] = await dbQuery(() =>
      db.select({ totalXP: users.totalXP }).from(users).where(eq(users.id, userId))
    );
    return { newLevel: null, newTotalXP: user?.totalXP ?? 0, totalXPEarned: 0 };
  }

  // Increment atomically and read back the resulting total in one statement.
  const [row] = await dbQuery(() =>
    db
      .update(users)
      .set({
        totalXP: sql`coalesce(${users.totalXP}, 0) + ${xpAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({ totalXP: users.totalXP, previousLevel: users.userLevel })
  );

  if (!row) {
    return { newLevel: null, newTotalXP: 0, totalXPEarned: 0 };
  }

  const newTotalXP = row.totalXP ?? 0;
  const previousLevel = row.previousLevel || 1;
  const { level, levelProgress } = calculateLevelFromXP(newTotalXP);

  // Second write, but derived from the authoritative total. Guarded so a
  // slower concurrent request can't drag the level back down.
  await dbQuery(() =>
    db
      .update(users)
      .set({ userLevel: level, levelProgress })
      .where(and(eq(users.id, userId), lte(users.userLevel, level)))
  );

  return {
    newLevel: level > previousLevel ? level : null,
    newTotalXP,
    totalXPEarned: xpAmount,
  };
}

/**
 * Get user level info
 */
export async function getUserLevelInfo(
  userId: string
): Promise<{
  level: number;
  totalXP: number;
  levelProgress: number;
  xpToNextLevel: number;
  nextLevelThreshold: number;
} | null> {
  const [user] = await dbQuery(() =>
    db.select({ totalXP: users.totalXP, userLevel: users.userLevel, levelProgress: users.levelProgress }).from(users).where(eq(users.id, userId))
  );

  if (!user || user.totalXP === null) return null;

  const level = user.userLevel || 1;
  const totalXP = user.totalXP;
  const levelProgress = user.levelProgress || 0;
  const nextLevelXP = getXPThresholdForLevel(level + 1);
  const currentLevelXP = getXPThresholdForLevel(level);
  const xpToNextLevel = nextLevelXP - totalXP;

  return {
    level,
    totalXP,
    levelProgress,
    xpToNextLevel,
    nextLevelThreshold: nextLevelXP,
  };
}
