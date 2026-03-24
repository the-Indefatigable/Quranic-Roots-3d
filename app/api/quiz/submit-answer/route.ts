import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { quizAttempts } from '@/db/schema';
import { updateMasteryInDB } from '@/utils/srsEngine';
import { validateAnswer, validateMCQ, validateStructured } from '@/utils/answerValidator';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
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
    } = body;

    // Validate input
    if (
      !sessionId ||
      !itemId ||
      !itemType ||
      !questionType ||
      userAnswer === undefined ||
      !correctAnswer
    ) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine if answer is correct based on question type
    let isCorrect = false;
    let feedback = '';

    if (questionType === 'translate_conjugation' || questionType === 'translate_noun' || questionType === 'translate_particle') {
      // Text answer with diacritic flexibility
      const validation = validateAnswer(userAnswer, validAnswers || [correctAnswer]);
      isCorrect = validation.isCorrect;
      feedback = validation.feedback;
    } else if (questionType.startsWith('mcq_')) {
      // Multiple choice
      const validation = validateMCQ(userAnswer, correctAnswer);
      isCorrect = validation.isCorrect;
      feedback = validation.feedback;
    } else if (questionType === 'identify_conjugation' || questionType === 'identify_root') {
      // Structured answer
      const validation = validateStructured(userAnswer, correctAnswer);
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
