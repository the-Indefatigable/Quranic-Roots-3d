export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { roots, forms, tenses, nouns, particles, quizSessions } from '@/db/schema';
import { eq, sql, inArray } from 'drizzle-orm';
import { getDueItemsForUser } from '@/utils/srsEngine';
import { generateConjugationQuestion, generateNounQuestion, generateParticleQuestion } from '@/utils/quizGenerator';

const MAX_LIMIT = 50;

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params with bounds
    const searchParams = req.nextUrl.searchParams;
    const quizType = (searchParams.get('type') || 'mixed') as string;
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '10', 10) || 10, 1), MAX_LIMIT);

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

      // Fetch random fallbacks in parallel based on quiz type
      const fallbackPromises: Promise<{ id: string; type: 'root' | 'noun' | 'particle' }[]>[] = [];

      if (quizType === 'mixed' || quizType === 'verb_conjugation') {
        fallbackPromises.push(
          dbQuery(() =>
            db.select({ id: roots.id }).from(roots).orderBy(sql`RANDOM()`).limit(needed)
          ).then((rows) => rows.map((r) => ({ id: r.id, type: 'root' as const })))
        );
      }
      if (quizType === 'mixed' || quizType === 'noun_translation') {
        fallbackPromises.push(
          dbQuery(() =>
            db.select({ id: nouns.id }).from(nouns).orderBy(sql`RANDOM()`).limit(needed)
          ).then((rows) => rows.map((n) => ({ id: n.id, type: 'noun' as const })))
        );
      }
      if (quizType === 'mixed' || quizType === 'particle_translation') {
        fallbackPromises.push(
          dbQuery(() =>
            db.select({ id: particles.id }).from(particles).orderBy(sql`RANDOM()`).limit(needed)
          ).then((rows) => rows.map((p) => ({ id: p.id, type: 'particle' as const })))
        );
      }

      const fallbackResults = await Promise.all(fallbackPromises);
      for (const items of fallbackResults) {
        for (const item of items) {
          if (!existingIds.has(item.id) && filteredItems.length < limit) {
            filteredItems.push({ id: item.id, type: item.type, mastery: 0, nextReview: null });
            existingIds.add(item.id);
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

    // Batch-fetch all data by type instead of N+1 per-item queries
    const rootIds = filteredItems.filter((i) => i.type === 'root').map((i) => i.id);
    const nounIds = filteredItems.filter((i) => i.type === 'noun').map((i) => i.id);
    const particleIds = filteredItems.filter((i) => i.type === 'particle').map((i) => i.id);

    // Fetch roots, nouns, particles in parallel
    const [allRoots, allNouns, allParticles] = await Promise.all([
      rootIds.length > 0
        ? dbQuery(() => db.select().from(roots).where(inArray(roots.id, rootIds)))
        : Promise.resolve([]),
      nounIds.length > 0
        ? dbQuery(() => db.select().from(nouns).where(inArray(nouns.id, nounIds)))
        : Promise.resolve([]),
      particleIds.length > 0
        ? dbQuery(() => db.select().from(particles).where(inArray(particles.id, particleIds)))
        : Promise.resolve([]),
    ]);

    // Batch-fetch forms and tenses for all roots
    let allForms: any[] = [];
    let allTenses: any[] = [];
    if (rootIds.length > 0) {
      allForms = await dbQuery(() =>
        db.select().from(forms).where(inArray(forms.rootId, rootIds))
      );
      const formIds = allForms.map((f: any) => f.id);
      if (formIds.length > 0) {
        allTenses = await dbQuery(() =>
          db.select().from(tenses).where(inArray(tenses.formId, formIds))
        );
      }
    }

    // Build lookup maps
    const rootMap = new Map(allRoots.map((r) => [r.id, r]));
    const nounMap = new Map(allNouns.map((n) => [n.id, n]));
    const particleMap = new Map(allParticles.map((p) => [p.id, p]));

    // Group forms by rootId, tenses by formId
    const formsByRoot = new Map<string, any[]>();
    for (const f of allForms) {
      if (!formsByRoot.has(f.rootId)) formsByRoot.set(f.rootId, []);
      formsByRoot.get(f.rootId)!.push(f);
    }
    const tensesByForm = new Map<string, any[]>();
    for (const t of allTenses) {
      if (!tensesByForm.has(t.formId)) tensesByForm.set(t.formId, []);
      tensesByForm.get(t.formId)!.push(t);
    }

    // Generate questions from pre-fetched data (no more DB calls)
    const questions = [];
    for (const item of filteredItems) {
      try {
        if (item.type === 'root') {
          const root = rootMap.get(item.id);
          if (!root) continue;

          const rootForms = formsByRoot.get(root.id);
          if (!rootForms || rootForms.length === 0) continue;

          const randomForm = rootForms[Math.floor(Math.random() * rootForms.length)];
          const formTenses = tensesByForm.get(randomForm.id);
          if (!formTenses || formTenses.length === 0) continue;

          const randomTense = formTenses[Math.floor(Math.random() * formTenses.length)];
          const question = generateConjugationQuestion(root, randomForm, randomTense);
          if (question) questions.push(question);
        } else if (item.type === 'noun') {
          const noun = nounMap.get(item.id);
          if (!noun) continue;
          questions.push(generateNounQuestion(noun));
        } else if (item.type === 'particle') {
          const particle = particleMap.get(item.id);
          if (!particle) continue;
          questions.push(generateParticleQuestion(particle));
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
