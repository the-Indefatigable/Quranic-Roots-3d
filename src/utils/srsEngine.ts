/**
 * SRS (Spaced Repetition System) engine - database-backed version
 * Updates mastery levels and calculates next review dates
 */

import { db, dbQuery } from '@/db';
import { userRootMastery, userNounMastery, userParticleMastery } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// SRS intervals (milliseconds) for each mastery level
const SRS_INTERVALS = {
  0: 0, // immediate
  1: 1 * 86_400_000, // 1 day
  2: 3 * 86_400_000, // 3 days
  3: 7 * 86_400_000, // 1 week
  4: 14 * 86_400_000, // 2 weeks
  5: 30 * 86_400_000, // 1 month
};

export interface MasteryUpdate {
  newMastery: number;
  nextReview: Date;
  earnedXP: number;
}

/**
 * Update mastery level in database based on quiz performance
 * Uses SRS algorithm to determine progression
 *
 * @param userId - User ID
 * @param itemId - Root/noun/particle ID
 * @param itemType - Type of item: 'root' | 'noun' | 'particle'
 * @param isCorrect - Was the answer correct?
 * @param totalInSession - Total questions in this session (for accuracy calculation)
 * @returns Updated mastery level and next review date
 */
export async function updateMasteryInDB(
  userId: string,
  itemId: string,
  itemType: 'root' | 'noun' | 'particle',
  isCorrect: boolean,
  totalInSession: number = 1
): Promise<MasteryUpdate> {
  const table =
    itemType === 'root'
      ? userRootMastery
      : itemType === 'noun'
        ? userNounMastery
        : userParticleMastery;

  // Fetch current mastery record
  const [current] = await dbQuery(() =>
    db
      .select()
      .from(table as any)
      .where(
        and(
          eq((table as any).userId, userId),
          eq((table as any).itemId, itemId)
        )
      )
  );

  const currentMastery = current?.mastery || 0;
  const currentAttempts = current?.totalAttempts || 0;
  const currentCorrect = current?.correctAttempts || 0;

  // Calculate new mastery level
  let newMastery = currentMastery;
  const accuracy = (currentCorrect + (isCorrect ? 1 : 0)) / (currentAttempts + 1);

  if (isCorrect) {
    // Correct answer: possible increase
    if (accuracy >= 1.0 && currentMastery < 5) {
      // 100% correct on this attempt
      newMastery = Math.min(currentMastery + 1, 5);
    } else if (accuracy >= 0.7 && currentMastery > 0) {
      // Keep level if 70%+ accuracy
      newMastery = currentMastery;
    } else if (currentMastery === 0) {
      // First correct answer: move to level 1
      newMastery = 1;
    }
  } else {
    // Incorrect answer: possible decrease
    if (accuracy < 0.5 && currentMastery > 0) {
      // Below 50% accuracy: decrease level
      newMastery = Math.max(currentMastery - 1, 0);
    }
  }

  // Calculate next review date based on new mastery
  const intervalMs = SRS_INTERVALS[newMastery as keyof typeof SRS_INTERVALS] || 0;
  const nextReview = new Date(Date.now() + intervalMs);

  // Determine XP earned
  const earnedXP = isCorrect ? 10 : 0;

  // Upsert mastery record
  await dbQuery(async () => {
    if (current) {
      // Update existing
      return db
        .update(table as any)
        .set({
          mastery: newMastery,
          nextReview,
          totalAttempts: currentAttempts + 1,
          correctAttempts: currentCorrect + (isCorrect ? 1 : 0),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq((table as any).userId, userId),
            eq((table as any).itemId, itemId)
          )
        );
    } else {
      // Insert new
      return db.insert(table as any).values({
        userId,
        itemId,
        mastery: isCorrect ? 1 : 0,
        nextReview,
        totalAttempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        updatedAt: new Date(),
      });
    }
  });

  return {
    newMastery,
    nextReview,
    earnedXP,
  };
}

/**
 * Get all items due for review (mastery >= 1 and nextReview <= now)
 * Used by quiz start endpoint to fetch SRS queue
 */
export async function getDueItemsForUser(
  userId: string,
  limit: number = 10
): Promise<
  Array<{
    id: string;
    type: 'root' | 'noun' | 'particle';
    mastery: number;
    nextReview: Date | null;
  }>
> {
  const now = new Date();

  // Fetch from all three mastery tables and combine
  const [rootsQuery, nounsQuery, particlesQuery] = await Promise.all([
    dbQuery(() =>
      db
        .select({
          id: userRootMastery.rootId,
          mastery: userRootMastery.mastery,
          nextReview: userRootMastery.nextReview,
        })
        .from(userRootMastery)
        .where(eq(userRootMastery.userId, userId))
    ),
    dbQuery(() =>
      db
        .select({
          id: userNounMastery.nounId,
          mastery: userNounMastery.mastery,
          nextReview: userNounMastery.nextReview,
        })
        .from(userNounMastery)
        .where(eq(userNounMastery.userId, userId))
    ),
    dbQuery(() =>
      db
        .select({
          id: userParticleMastery.particleId,
          mastery: userParticleMastery.mastery,
          nextReview: userParticleMastery.nextReview,
        })
        .from(userParticleMastery)
        .where(eq(userParticleMastery.userId, userId))
    ),
  ]);

  const allItems = [
    ...rootsQuery.map((r) => ({
      id: r.id,
      mastery: r.mastery ?? 0,
      nextReview: r.nextReview,
      type: 'root' as const
    })),
    ...nounsQuery.map((n) => ({
      id: n.id,
      mastery: n.mastery ?? 0,
      nextReview: n.nextReview,
      type: 'noun' as const
    })),
    ...particlesQuery.map((p) => ({
      id: p.id,
      mastery: p.mastery ?? 0,
      nextReview: p.nextReview,
      type: 'particle' as const
    })),
  ].filter((item) => {
    // Filter for items that are due: no nextReview set OR nextReview is in the past
    return !item.nextReview || new Date(item.nextReview) <= now;
  });

  // Sort by: 1) overdue (nextReview oldest first), 2) new items (mastery 0 last)
  allItems.sort((a, b) => {
    if (a.nextReview && b.nextReview) {
      return new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime();
    }
    if (!a.nextReview && b.nextReview) return -1;
    if (a.nextReview && !b.nextReview) return 1;
    const aMastery = a.mastery ?? 0;
    const bMastery = b.mastery ?? 0;
    return aMastery - bMastery;
  });

  return allItems.slice(0, limit);
}

/**
 * Calculate user statistics: total learned items, average accuracy, etc.
 */
export async function getUserStats(userId: string) {
  const [roots, nouns, particles] = await Promise.all([
    dbQuery(() =>
      db.select().from(userRootMastery).where(eq(userRootMastery.userId, userId))
    ),
    dbQuery(() =>
      db.select().from(userNounMastery).where(eq(userNounMastery.userId, userId))
    ),
    dbQuery(() =>
      db.select().from(userParticleMastery).where(eq(userParticleMastery.userId, userId))
    ),
  ]);

  const allItems = [...roots, ...nouns, ...particles];

  const totalLearned = allItems.filter((item) => (item.mastery ?? 0) >= 1).length;
  const avgMastery =
    allItems.length > 0
      ? allItems.reduce((sum, item) => sum + (item.mastery ?? 0), 0) / allItems.length
      : 0;

  const avgAccuracy =
    allItems.length > 0
      ? allItems.reduce(
          (sum, item) =>
            sum +
            ((item.totalAttempts ?? 0) > 0
              ? (item.correctAttempts ?? 0) / (item.totalAttempts ?? 1)
              : 0),
          0
        ) / allItems.length
      : 0;

  return {
    totalLearned,
    avgMastery: Math.round(avgMastery * 10) / 10,
    avgAccuracy: Math.round(avgAccuracy * 100),
  };
}
