/**
 * SRS (Spaced Repetition System) engine - database-backed version
 * Updates mastery levels and calculates next review dates
 */

import { db, dbQuery } from '@/db';
import { userRootMastery, userNounMastery, userParticleMastery } from '@/db/schema';
import { eq, and, or, asc, isNull, lte, sql } from 'drizzle-orm';
import type { PgColumn } from 'drizzle-orm/pg-core';

// SRS intervals (milliseconds) for each mastery level
const SRS_INTERVALS = {
  0: 0, // immediate
  1: 1 * 86_400_000, // 1 day
  2: 3 * 86_400_000, // 3 days
  3: 7 * 86_400_000, // 1 week
  4: 14 * 86_400_000, // 2 weeks
  5: 30 * 86_400_000, // 1 month
};

/** How soon a missed item comes back. */
const RELEARN_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

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
  itemType: string,
  isCorrect: boolean,
  totalInSession: number = 1
): Promise<MasteryUpdate> {
  // Map to the correct table and item column based on type
  const tableConfig = {
    root:     { table: userRootMastery,     itemCol: userRootMastery.rootId },
    noun:     { table: userNounMastery,     itemCol: userNounMastery.nounId },
    particle: { table: userParticleMastery, itemCol: userParticleMastery.particleId },
  } as const;

  // Some item types ('lesson_vocab', 'quran_verse') have no mastery table —
  // their scheduling lives in user_word_reviews. Return a no-op rather than
  // destructuring undefined, which used to throw and take the caller with it.
  const config = tableConfig[itemType as keyof typeof tableConfig];
  if (!config) {
    return { newMastery: 0, nextReview: new Date(), earnedXP: isCorrect ? 10 : 0 };
  }
  const { table, itemCol } = config;

  // Fetch current mastery record
  const [current] = await dbQuery(() =>
    db
      .select()
      .from(table)
      .where(
        and(
          eq(table.userId, userId),
          eq(itemCol, itemId)
        )
      )
  );

  const currentMastery = current?.mastery || 0;
  const currentAttempts = current?.totalAttempts || 0;
  const currentCorrect = current?.correctAttempts || 0;

  // Calculate new mastery level.
  //
  // Promotion is driven by THIS attempt, not by lifetime accuracy. The previous
  // version required lifetime accuracy >= 1.0 to advance, so a single wrong
  // answer capped an item's mastery permanently — it could never be promoted
  // again for the life of the account.
  const newAttempts = currentAttempts + 1;
  const newCorrect = currentCorrect + (isCorrect ? 1 : 0);
  const accuracy = newCorrect / newAttempts;

  let newMastery = currentMastery;

  if (isCorrect) {
    // A correct answer advances one level, capped at 5.
    newMastery = Math.min(currentMastery + 1, 5);
  } else if (currentMastery > 0) {
    // A miss drops a level. A persistently weak item (sub-50% lifetime) drops
    // all the way back to 0 so it re-enters the learning queue.
    newMastery = accuracy < 0.5 ? 0 : currentMastery - 1;
  }

  // Calculate next review date. A missed item comes back in an hour rather
  // than following the (much longer) interval for its new mastery level.
  const intervalMs = isCorrect
    ? SRS_INTERVALS[newMastery as keyof typeof SRS_INTERVALS] ?? 0
    : RELEARN_INTERVAL_MS;
  const nextReview = new Date(Date.now() + intervalMs);

  // Determine XP earned
  const earnedXP = isCorrect ? 10 : 0;

  // Build the item column key for insert (rootId, nounId, or particleId)
  const itemColumnKey = itemType === 'root' ? 'rootId' : itemType === 'noun' ? 'nounId' : 'particleId';

  // Upsert in a single statement. The previous read-then-write lost updates
  // when two answers for the same item were in flight, and raced against the
  // (user_id, item_id) primary key. Attempt counters are incremented in SQL so
  // a concurrent write can't clobber them.
  await dbQuery(() =>
    db
      .insert(table)
      .values({
        userId,
        [itemColumnKey]: itemId,
        mastery: newMastery,
        nextReview,
        totalAttempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        updatedAt: new Date(),
      } as any)
      .onConflictDoUpdate({
        target: [table.userId, itemCol],
        set: {
          mastery: newMastery,
          nextReview,
          totalAttempts: sql`${table.totalAttempts} + 1`,
          correctAttempts: sql`${table.correctAttempts} + ${isCorrect ? 1 : 0}`,
          updatedAt: new Date(),
        },
      })
  );

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

  // Fetch from all three mastery tables. The due filter, ordering and limit are
  // pushed into SQL — previously every mastery row a user had was loaded and
  // then filtered in JS, so `limit` never reached the database.
  const dueFilter = (col: PgColumn) => or(isNull(col), lte(col, now));

  const [rootsQuery, nounsQuery, particlesQuery] = await Promise.all([
    dbQuery(() =>
      db
        .select({
          id: userRootMastery.rootId,
          mastery: userRootMastery.mastery,
          nextReview: userRootMastery.nextReview,
        })
        .from(userRootMastery)
        .where(and(eq(userRootMastery.userId, userId), dueFilter(userRootMastery.nextReview)))
        .orderBy(asc(userRootMastery.nextReview))
        .limit(limit)
    ),
    dbQuery(() =>
      db
        .select({
          id: userNounMastery.nounId,
          mastery: userNounMastery.mastery,
          nextReview: userNounMastery.nextReview,
        })
        .from(userNounMastery)
        .where(and(eq(userNounMastery.userId, userId), dueFilter(userNounMastery.nextReview)))
        .orderBy(asc(userNounMastery.nextReview))
        .limit(limit)
    ),
    dbQuery(() =>
      db
        .select({
          id: userParticleMastery.particleId,
          mastery: userParticleMastery.mastery,
          nextReview: userParticleMastery.nextReview,
        })
        .from(userParticleMastery)
        .where(
          and(eq(userParticleMastery.userId, userId), dueFilter(userParticleMastery.nextReview))
        )
        .orderBy(asc(userParticleMastery.nextReview))
        .limit(limit)
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
  ];

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
