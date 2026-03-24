import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const dynamic = 'force-dynamic';
import { db, dbQuery } from '@/db';
import { quizSessions, quizAttempts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { sessionId, totalTime } = body;

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

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

    return NextResponse.json({
      sessionId,
      score,
      correctCount,
      totalCount,
      earnedXP,
      accuracy: score,
      duration_s: totalTime,
    });
  } catch (error) {
    console.error('[quiz/end-session] Error:', error);
    return NextResponse.json(
      { error: 'Failed to end session' },
      { status: 500 }
    );
  }
}
