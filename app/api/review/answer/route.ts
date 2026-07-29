export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { userWordReviews } from '@/db/schema';
import { and, eq, gte, sql } from 'drizzle-orm';
import { addXPToUser } from '@/utils/levelEngine';

const Schema = z.object({
  reviewId: z.string().uuid(),
  grade: z.enum(['again', 'good', 'easy']),
});

const XP_PER_REVIEW = 2;

// Ceiling on review XP per day. Even with the due-date check below, a user with
// a large backlog shouldn't be able to sit and grind the leaderboard.
const MAX_REVIEW_XP_PER_DAY = 200;

// POST /api/review/answer — SM-2 lite scheduling.
// again → relearn in 10 min, ease down, lapse.
// good  → first rep 1 day, then interval × ease.
// easy  → interval × ease × 1.3, ease up.
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = Schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const { reviewId, grade } = parsed.data;

    const [card] = await dbQuery(() =>
      db.select()
        .from(userWordReviews)
        .where(and(eq(userWordReviews.id, reviewId), eq(userWordReviews.userId, session.user.id)))
    );
    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    const now = new Date();

    // A card that isn't due yet is not a review. Without this, replaying the
    // same reviewId pays out XP on every call, indefinitely.
    if (card.dueAt && new Date(card.dueAt) > now) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'not_due',
        nextDueInDays: Math.max(
          0,
          Math.round(((new Date(card.dueAt).getTime() - now.getTime()) / 86_400_000) * 10) / 10
        ),
        xpEarned: 0,
      });
    }

    let { intervalDays, ease, reps, lapses } = card;

    if (grade === 'again') {
      lapses += 1;
      ease = Math.max(1.3, ease - 0.2);
      intervalDays = 0;
    } else {
      reps += 1;
      if (grade === 'easy') ease = Math.min(3.0, ease + 0.15);
      if (intervalDays < 1) {
        intervalDays = grade === 'easy' ? 3 : 1;
      } else {
        intervalDays = Math.min(180, intervalDays * ease * (grade === 'easy' ? 1.3 : 1));
      }
    }

    const dueAt = grade === 'again'
      ? new Date(now.getTime() + 10 * 60 * 1000)
      : new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    await dbQuery(() =>
      db.update(userWordReviews)
        .set({ intervalDays, ease, reps, lapses, dueAt, lastAnswered: now })
        .where(eq(userWordReviews.id, reviewId))
    );

    // Small XP reward for successful recall, under a daily ceiling.
    let xpEarned = 0;
    if (grade !== 'again') {
      const startOfDay = new Date(now);
      startOfDay.setUTCHours(0, 0, 0, 0);

      const [{ count: reviewsToday } = { count: 0 }] = await dbQuery(() =>
        db
          .select({ count: sql<number>`count(*)::int` })
          .from(userWordReviews)
          .where(
            and(
              eq(userWordReviews.userId, session.user.id),
              gte(userWordReviews.lastAnswered, startOfDay)
            )
          )
      );

      if (reviewsToday * XP_PER_REVIEW <= MAX_REVIEW_XP_PER_DAY) {
        xpEarned = XP_PER_REVIEW;
        // Routed through addXPToUser so level stays consistent with total_xp.
        await addXPToUser(session.user.id, XP_PER_REVIEW);
      }
    }

    return NextResponse.json({
      success: true,
      nextDueInDays: grade === 'again' ? 0 : Math.round(intervalDays * 10) / 10,
      xpEarned,
    });
  } catch (error) {
    console.error('[review/answer] Error:', error);
    return NextResponse.json({ error: 'Failed to record answer' }, { status: 500 });
  }
}
