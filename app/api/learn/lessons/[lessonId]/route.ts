export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { learningLessons, learningUnits, userHearts } from '@/db/schema';
import { eq } from 'drizzle-orm';

/** GET /api/learn/lessons/:lessonId — fetch a single lesson with steps */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const { lessonId } = await params;
    if (!lessonId) {
      return NextResponse.json({ error: 'Missing lesson id' }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id;

    // ─── Qirat curriculum (static data — no DB) ───
    if (lessonId.startsWith('qirat-')) {
      const { getQiratLessonById } = await import('@/data/qirat-curriculum');
      const found = getQiratLessonById(lessonId);
      if (!found) {
        return NextResponse.json({ error: 'Qirat lesson not found' }, { status: 404 });
      }

      const transformedSteps = found.lesson.steps.map((step: any) => {
        if (step.type === 'teach') {
          return {
            type: 'teach',
            content: {
              title: step.content.title,
              explanation: step.content.body,
              arabic: step.content.arabicExample,
            },
          };
        }
        if (step.type === 'mcq') {
          return {
            type: 'mcq',
            content: {
              question: step.content.question,
              explanation: step.content.explanation,
              options: step.content.options.map((opt: string, i: number) => ({
                text: opt,
                correct: i === step.content.correctIndex,
              })),
            },
          };
        }
        return step;
      });

      return NextResponse.json({
        data: {
          id: found.lesson.id,
          title: found.lesson.title,
          unitTitle: found.unit.title,
          unitColor: found.unit.color,
          content: { steps: transformedSteps },
          xpReward: found.lesson.xpReward,
          lessonType: 'standard',
        },
        hearts: 5,
      });
    }

    // ─── DB lessons (Arabic grammar) ───
    const [lesson] = await dbQuery(() =>
      db.select({
        id: learningLessons.id,
        slug: learningLessons.slug,
        title: learningLessons.title,
        sortOrder: learningLessons.sortOrder,
        lessonType: learningLessons.lessonType,
        content: learningLessons.content,
        xpReward: learningLessons.xpReward,
        unitId: learningLessons.unitId,
        unitTitle: learningUnits.title,
        unitColor: learningUnits.color,
      })
        .from(learningLessons)
        .innerJoin(learningUnits, eq(learningLessons.unitId, learningUnits.id))
        .where(eq(learningLessons.id, lessonId))
    );

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    let hearts = 5;
    if (userId) {
      const [heartRow] = await dbQuery(() =>
        db.select().from(userHearts).where(eq(userHearts.userId, userId))
      );
      if (heartRow) {
        const now = Date.now();
        const lastRefill = heartRow.lastRefillAt ? new Date(heartRow.lastRefillAt).getTime() : now;
        const hoursSince = (now - lastRefill) / (1000 * 60 * 60);
        const refillCount = Math.min(Math.floor(hoursSince / 4), heartRow.maxHearts - heartRow.hearts);
        hearts = Math.min(heartRow.hearts + refillCount, heartRow.maxHearts);

        if (refillCount > 0) {
          await dbQuery(() =>
            db.update(userHearts)
              .set({ hearts, lastRefillAt: new Date(), updatedAt: new Date() })
              .where(eq(userHearts.userId, userId))
          );
        }
      }
    }

    return NextResponse.json({
      data: {
        ...lesson,
        content: lesson.content as Record<string, unknown>,
      },
      hearts,
    });
  } catch (error) {
    console.error('[API] GET /api/learn/lessons/:id error:', error);
    return NextResponse.json({ error: 'Failed to load lesson' }, { status: 500 });
  }
}
