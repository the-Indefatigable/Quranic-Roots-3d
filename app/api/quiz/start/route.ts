export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { roots, forms, tenses, nouns, particles, quizSessions } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
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

    // Get due items for user (SRS-based)
    let dueItems = await getDueItemsForUser(session.user.id, limit * 2);

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

    // Fallback: if no SRS items are due, pick random items from the database
    if (filteredItems.length < limit) {
      const needed = limit - filteredItems.length;
      const existingIds = new Set(filteredItems.map((i) => i.id));

      if (quizType === 'mixed' || quizType === 'verb_conjugation') {
        const randomRoots = await dbQuery(() =>
          db.select({ id: roots.id }).from(roots).orderBy(sql`RANDOM()`).limit(needed)
        );
        for (const r of randomRoots) {
          if (!existingIds.has(r.id) && filteredItems.length < limit) {
            filteredItems.push({ id: r.id, type: 'root', mastery: 0, nextReview: null });
            existingIds.add(r.id);
          }
        }
      }

      if (quizType === 'mixed' || quizType === 'noun_translation') {
        const randomNouns = await dbQuery(() =>
          db.select({ id: nouns.id }).from(nouns).orderBy(sql`RANDOM()`).limit(needed)
        );
        for (const n of randomNouns) {
          if (!existingIds.has(n.id) && filteredItems.length < limit) {
            filteredItems.push({ id: n.id, type: 'noun', mastery: 0, nextReview: null });
            existingIds.add(n.id);
          }
        }
      }

      if (quizType === 'mixed' || quizType === 'particle_translation') {
        const randomParticles = await dbQuery(() =>
          db.select({ id: particles.id }).from(particles).orderBy(sql`RANDOM()`).limit(needed)
        );
        for (const p of randomParticles) {
          if (!existingIds.has(p.id) && filteredItems.length < limit) {
            filteredItems.push({ id: p.id, type: 'particle', mastery: 0, nextReview: null });
            existingIds.add(p.id);
          }
        }
      }

      // Shuffle the combined items
      filteredItems.sort(() => Math.random() - 0.5);
      filteredItems = filteredItems.slice(0, limit);
    }

    if (filteredItems.length === 0) {
      return NextResponse.json({
        sessionId: null,
        items: [],
        message: 'No quiz items available. Please check back later.',
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
