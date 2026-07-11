export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { userWordReviews, vocabularyBank } from '@/db/schema';
import { and, eq, lte, sql, asc } from 'drizzle-orm';
import { getLearnedWords } from '@/lib/coverage';

const SESSION_SIZE = 15;

// GET /api/review/due
// Lazily syncs the user's review deck to their learned words (so decks
// backfill automatically for users who completed lessons before this
// feature existed), then returns the due cards.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // Sync deck: one row per learned word
    const learned = await getLearnedWords(userId);
    if (learned.length > 0) {
      await dbQuery(() =>
        db.insert(userWordReviews)
          .values(learned.map((w) => ({ userId, vocabId: w.id })))
          .onConflictDoNothing()
      );
    }

    const now = new Date();
    const [dueCards, [counts]] = await Promise.all([
      dbQuery(() =>
        db.select({
          reviewId: userWordReviews.id,
          reps: userWordReviews.reps,
          wordAr: vocabularyBank.wordAr,
          transliteration: vocabularyBank.transliteration,
          english: vocabularyBank.english,
          wordType: vocabularyBank.wordType,
          quranicRef: vocabularyBank.quranicRef,
        })
          .from(userWordReviews)
          .innerJoin(vocabularyBank, eq(userWordReviews.vocabId, vocabularyBank.id))
          .where(and(eq(userWordReviews.userId, userId), lte(userWordReviews.dueAt, now)))
          .orderBy(asc(userWordReviews.dueAt))
          .limit(SESSION_SIZE)
      ),
      dbQuery(() =>
        db.select({
          due: sql<number>`count(*) filter (where ${userWordReviews.dueAt} <= ${now.toISOString()})::int`,
          total: sql<number>`count(*)::int`,
        })
          .from(userWordReviews)
          .where(eq(userWordReviews.userId, userId))
      ),
    ]);

    return NextResponse.json({
      cards: dueCards,
      dueCount: counts?.due ?? 0,
      deckSize: counts?.total ?? 0,
    });
  } catch (error) {
    console.error('[review/due] Error:', error);
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 });
  }
}
