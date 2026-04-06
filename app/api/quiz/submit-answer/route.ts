export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { quizAttempts, quizSessions } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { updateMasteryInDB } from '@/utils/srsEngine';
import { validateAnswer, validateMCQ, validateStructured } from '@/utils/answerValidator';
import { z } from 'zod';

const SubmitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  itemId: z.string().uuid(),
  itemType: z.enum(['root', 'noun', 'particle', 'lesson_vocab', 'quran_verse']),
  questionType: z.string(),
  questPrompt: z.union([z.string(), z.record(z.string(), z.unknown())]).optional(),
  userAnswer: z.union([z.string(), z.record(z.string(), z.unknown())]),
  correctAnswer: z.union([z.string(), z.record(z.string(), z.unknown())]),
  validAnswers: z.array(z.string()).optional(),
  responseTime_ms: z.number().int().nonnegative().optional(),
});

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
    
    const {
      sessionId,
      itemId,
      itemType,
      questionType,
      questPrompt,
      userAnswer,
      correctAnswer,
      validAnswers,
      responseTime_ms,
    } = parsed.data;

    // Verify session belongs to this user
    const [quizSession] = await dbQuery(() =>
      db
        .select({ id: quizSessions.id })
        .from(quizSessions)
        .where(and(eq(quizSessions.id, sessionId), eq(quizSessions.userId, session.user.id)))
    );
    if (!quizSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Determine if answer is correct based on question type
    let isCorrect = false;
    let feedback = '';

    if (questionType === 'translate_conjugation' || questionType === 'translate_noun' || questionType === 'translate_particle') {
      // Text answer with diacritic flexibility
      const validation = validateAnswer(userAnswer as string, (validAnswers || [correctAnswer]) as string[]);
      isCorrect = validation.isCorrect;
      feedback = validation.feedback;
    } else if (questionType.startsWith('mcq_')) {
      // Multiple choice
      const validation = validateMCQ(userAnswer as string, correctAnswer as string);
      isCorrect = validation.isCorrect;
      feedback = validation.feedback;
    } else if (questionType === 'identify_conjugation' || questionType === 'identify_root') {
      // Structured answer
      const validation = validateStructured(userAnswer as Record<string, any>, correctAnswer as Record<string, any>);
      isCorrect = validation.isCorrect;
      feedback = validation.feedback;
    }

    // Update mastery in database
    const masteryUpdate = await updateMasteryInDB(
      session.user.id,
      itemId,
      itemType as 'root' | 'noun' | 'particle',
      isCorrect,
      1
    );

    // Record the attempt
    await dbQuery(() =>
      db.insert(quizAttempts).values({
        sessionId,
        userId: session.user.id,
        itemType,
        itemId,
        questionType,
        questPrompt: questPrompt ? JSON.stringify(questPrompt) : null,
        userAnswer: typeof userAnswer === 'string' ? userAnswer : JSON.stringify(userAnswer),
        correctAnswer: typeof correctAnswer === 'string' ? correctAnswer : JSON.stringify(correctAnswer),
        isCorrect,
        responseTime_ms,
      })
    );

    return NextResponse.json({
      isCorrect,
      feedback,
      correctAnswer,
      earnedXP: masteryUpdate.earnedXP,
      newMastery: masteryUpdate.newMastery,
      nextReview: masteryUpdate.nextReview,
    });
  } catch (error) {
    console.error('[quiz/submit-answer] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    );
  }
}
