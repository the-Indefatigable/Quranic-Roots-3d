export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { roots, forms, tenses, nouns, particles, quizSessions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getDueItemsForUser } from '@/utils/srsEngine';
import { generateConjugationQuestion, generateNounQuestion, generateParticleQuestion } from '@/utils/quizGenerator';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params
    const searchParams = req.nextUrl.searchParams;
    const quizType = (searchParams.get('type') || 'mixed') as string;
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Get due items for user
    const dueItems = await getDueItemsForUser(session.user.id, limit * 2); // Fetch extra to account for missing data

    if (dueItems.length === 0) {
      return NextResponse.json({
        sessionId: null,
        items: [],
        message: 'No items due for review. Great job!',
      });
    }

    // Filter by quiz type
    let filteredItems = dueItems;
    if (quizType === 'verb_conjugation') {
      filteredItems = dueItems.filter((i) => i.type === 'root');
    } else if (quizType === 'noun_translation') {
      filteredItems = dueItems.filter((i) => i.type === 'noun');
    } else if (quizType === 'particle_translation') {
      filteredItems = dueItems.filter((i) => i.type === 'particle');
    }

    // Slice to limit
    filteredItems = filteredItems.slice(0, limit);

    if (filteredItems.length === 0) {
      return NextResponse.json({
        sessionId: null,
        items: [],
        message: `No ${quizType.replace('_', ' ')} items due right now.`,
      });
    }

    // Generate questions for each due item
    const questions = [];
    for (const item of filteredItems) {
      try {
        if (item.type === 'root') {
          // Fetch root with forms and tenses
          const [root] = await dbQuery(() =>
            db.select().from(roots).where(eq(roots.id, item.id))
          );

          if (!root) continue;

          // Get random form and tense
          const formsList = await dbQuery(() =>
            db.select().from(forms).where(eq(forms.rootId, root.id))
          );

          if (formsList.length === 0) continue;

          const randomForm = formsList[Math.floor(Math.random() * formsList.length)];
          const tensesList = await dbQuery(() =>
            db.select().from(tenses).where(eq(tenses.formId, randomForm.id))
          );

          if (tensesList.length === 0) continue;

          const randomTense = tensesList[Math.floor(Math.random() * tensesList.length)];

          const question = generateConjugationQuestion(root, randomForm, randomTense);
          if (question) questions.push(question);
        } else if (item.type === 'noun') {
          // Fetch noun
          const [noun] = await dbQuery(() =>
            db.select().from(nouns).where(eq(nouns.id, item.id))
          );

          if (!noun) continue;

          const question = generateNounQuestion(noun);
          questions.push(question);
        } else if (item.type === 'particle') {
          // Fetch particle
          const [particle] = await dbQuery(() =>
            db.select().from(particles).where(eq(particles.id, item.id))
          );

          if (!particle) continue;

          const question = generateParticleQuestion(particle);
          questions.push(question);
        }
      } catch (err) {
        console.error(`Error generating question for item ${item.id}:`, err);
        continue;
      }
    }

    if (questions.length === 0) {
      return NextResponse.json({
        sessionId: null,
        items: [],
        message: 'Could not generate questions. Please try again.',
      });
    }

    // Create quiz session
    const [newSession] = await dbQuery(() =>
      db
        .insert(quizSessions)
        .values({
          userId: session.user.id,
          quizType: (quizType as any) || 'mixed',
          itemCount: questions.length,
          correctCount: 0,
          score: 0,
        })
        .returning()
    );

    return NextResponse.json({
      sessionId: newSession.id,
      items: questions,
      quizType,
      itemCount: questions.length,
    });
  } catch (error) {
    console.error('[quiz/start] Error:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz session' },
      { status: 500 }
    );
  }
}
