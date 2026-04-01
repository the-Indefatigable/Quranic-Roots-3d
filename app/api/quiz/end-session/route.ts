export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { quizSessions, quizAttempts, userRootMastery, userNounMastery, userParticleMastery } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { addXPToUser } from '@/utils/levelEngine';
import { checkAndUnlockAchievements } from '@/utils/achievementEngine';
import { z } from 'zod';

const EndSessionSchema = z.object({
  sessionId: z.string().uuid(),
  totalTime: z.number().int().nonnegative(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = EndSessionSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 }
      );
    }
    
    const { sessionId, totalTime } = parsed.data;

    // Get all attempts for this session
    const attempts = await dbQuery(() =>
      db
        .select()
        .from(quizAttempts)
        .where(eq(quizAttempts.sessionId, sessionId))
    );

    if (attempts.length === 0) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Calculate stats
    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const totalCount = attempts.length;
    const score = Math.round((correctCount / totalCount) * 100);
    const earnedXP = correctCount * 10;

    // Update session
    await dbQuery(() =>
      db
        .update(quizSessions)
        .set({
          correctCount,
          score,
          duration_s: totalTime,
          sessionEndedAt: new Date(),
        })
        .where(eq(quizSessions.id, sessionId))
    );

    // Add XP to user and update level
    const xpResult = await addXPToUser(session.user.id, earnedXP);

    // Get user's mastery counts for achievement checking
    const rootsMasteredList = await dbQuery(() =>
      db
        .select()
        .from(userRootMastery)
        .where(
          and(
            eq(userRootMastery.userId, session.user.id),
            gte(userRootMastery.mastery, 1)
          )
        )
    );

    const nounsMasteredList = await dbQuery(() =>
      db
        .select()
        .from(userNounMastery)
        .where(
          and(
            eq(userNounMastery.userId, session.user.id),
            gte(userNounMastery.mastery, 1)
          )
        )
    );

    const particlesMasteredList = await dbQuery(() =>
      db
        .select()
        .from(userParticleMastery)
        .where(
          and(
            eq(userParticleMastery.userId, session.user.id),
            gte(userParticleMastery.mastery, 1)
          )
        )
    );

    // Get recent answer times for speed achievements
    const recentAttempts = await dbQuery(() =>
      db
        .select({ responseTime: quizAttempts.responseTime_ms })
        .from(quizAttempts)
        .where(and(eq(quizAttempts.userId, session.user.id), eq(quizAttempts.isCorrect, true)))
        .orderBy(quizAttempts.createdAt)
        .limit(10)
    );

    const recentAnswerTimes = recentAttempts
      .map((a) => a.responseTime)
      .filter((t) => t !== null) as number[];

    // Check and unlock achievements
    const { unlockedAchievements, totalXPEarned: achievementXP } = await checkAndUnlockAchievements(
      session.user.id,
      {
        totalXP: xpResult.newTotalXP,
        rootsMastered: rootsMasteredList.length,
        nounsMastered: nounsMasteredList.length,
        particlesMastered: particlesMasteredList.length,
        recentAnswerTimes,
      }
    );

    return NextResponse.json({
      sessionId,
      score,
      correctCount,
      totalCount,
      earnedXP: earnedXP + achievementXP,
      accuracy: score,
      duration_s: totalTime,
      leveledUp: xpResult.newLevel !== null,
      newLevel: xpResult.newLevel,
      newTotalXP: xpResult.newTotalXP,
      unlockedAchievements,
    });
  } catch (error) {
    console.error('[quiz/end-session] Error:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
