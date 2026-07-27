export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { quizAttempts, quizSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateMasteryInDB } from '@/utils/srsEngine';
import { validateAnswer, validateMCQ, validateStructured } from '@/utils/answerValidator';
import { z } from 'zod';

/**
 * The client submits *what it answered*, never what the answer is. The answer
 * key lives in quiz_sessions.questions, written when the session was created.
 */
const SubmitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().min(1),
  userAnswer: z.union([z.string(), z.record(z.string(), z.unknown())]),
  responseTime_ms: z.number().int().nonnegative().optional(),
});

/** Shape of an entry in quiz_sessions.questions. */
interface StoredQuestion {
  id: string;
  type: string;
  itemType: string;
  itemId: string;
  correctAnswer: string | Record<string, unknown>;
  validAnswers: string[] | null;
  correctAnswerLabel: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = SubmitAnswerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { sessionId, questionId, userAnswer, responseTime_ms } = parsed.data;

    // Load the session (and its answer key), verifying it belongs to this user.
    const [quizSession] = await dbQuery(() =>
      db
        .select({ id: quizSessions.id, questions: quizSessions.questions })
        .from(quizSessions)
        .where(and(eq(quizSessions.id, sessionId), eq(quizSessions.userId, session.user.id)))
    );
    if (!quizSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const stored = ((quizSession.questions as StoredQuestion[]) ?? []).find(
      (q) => q.id === questionId
    );
    if (!stored) {
      return NextResponse.json({ error: 'Question not found in session' }, { status: 404 });
    }

    // Answering the same question twice must not pay out twice.
    const [existing] = await dbQuery(() =>
      db
        .select({ id: quizAttempts.id })
        .from(quizAttempts)
        .where(and(eq(quizAttempts.sessionId, sessionId), eq(quizAttempts.questionId, questionId)))
    );
    if (existing) {
      return NextResponse.json(
        { error: 'This question has already been answered' },
        { status: 409 }
      );
    }

    const { type: questionType, itemType, itemId, correctAnswer, validAnswers } = stored;

    // Grade against the stored key.
    let isCorrect = false;
    let feedback = '';

    if (
      questionType === 'translate_conjugation' ||
      questionType === 'translate_noun' ||
      questionType === 'translate_particle'
    ) {
      const accepted = validAnswers?.length ? validAnswers : [correctAnswer as string];
      const validation = validateAnswer(userAnswer as string, accepted);
      isCorrect = validation.isCorrect;
      feedback = validation.feedback;
    } else if (questionType.startsWith('mcq_')) {
      const validation = validateMCQ(userAnswer as string, correctAnswer as string);
      isCorrect = validation.isCorrect;
      feedback = validation.feedback;
    } else if (questionType === 'identify_conjugation' || questionType === 'identify_root') {
      const validation = validateStructured(
        userAnswer as Record<string, unknown>,
        correctAnswer as Record<string, unknown>
      );
      isCorrect = validation.isCorrect;
      feedback = validation.feedback;
    } else {
      return NextResponse.json({ error: 'Unsupported question type' }, { status: 400 });
    }

    // Record the attempt first, so a mastery failure can't lose the answer.
    await dbQuery(() =>
      db.insert(quizAttempts).values({
        sessionId,
        userId: session.user.id,
        questionId,
        itemType,
        itemId,
        questionType,
        userAnswer: typeof userAnswer === 'string' ? userAnswer : JSON.stringify(userAnswer),
        correctAnswer:
          typeof correctAnswer === 'string' ? correctAnswer : JSON.stringify(correctAnswer),
        isCorrect,
        responseTime_ms,
      })
    );

    const masteryUpdate = await updateMasteryInDB(
      session.user.id,
      itemId,
      itemType as 'root' | 'noun' | 'particle',
      isCorrect,
      1
    );

    return NextResponse.json({
      isCorrect,
      feedback,
      // Reveal the readable answer only now that the question is answered.
      correctAnswer: stored.correctAnswerLabel ?? correctAnswer,
      earnedXP: masteryUpdate.earnedXP,
      newMastery: masteryUpdate.newMastery,
      nextReview: masteryUpdate.nextReview,
    });
  } catch (error) {
    console.error('[quiz/submit-answer] Error:', error);
    return NextResponse.json({ error: 'Failed to submit answer' }, { status: 500 });
  }
}
