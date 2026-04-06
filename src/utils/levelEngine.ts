/**
 * Level Engine
 * Handles user level progression, XP tracking, and level thresholds
 */

import { db, dbQuery } from '@/db';
import { users } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

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
 * Add XP to user and update level
 * Returns the new level if user leveled up, null otherwise
 */
export async function addXPToUser(
  userId: string,
  xpAmount: number
): Promise<{ newLevel: number | null; newTotalXP: number; totalXPEarned: number }> {
  // Get current user XP and level
  const [user] = await dbQuery(() =>
    db.select({ totalXP: users.totalXP, userLevel: users.userLevel }).from(users).where(eq(users.id, userId))
  );

  if (!user) {
    return { newLevel: null, newTotalXP: 0, totalXPEarned: 0 };
  }

  const currentTotalXP = user.totalXP || 0;
  const currentLevel = user.userLevel || 1;
  const newTotalXP = currentTotalXP + xpAmount;

  // Calculate new level
  const { level: newLevel, levelProgress } = calculateLevelFromXP(newTotalXP);

  // Atomic XP update to prevent race conditions under concurrent requests
  await dbQuery(() =>
    db
      .update(users)
      .set({
        totalXP: sql`${users.totalXP} + ${xpAmount}`,
        userLevel: newLevel,
        levelProgress,
      })
      .where(eq(users.id, userId))
  );

  return {
    newLevel: newLevel > currentLevel ? newLevel : null,
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
