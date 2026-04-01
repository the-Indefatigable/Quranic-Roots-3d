export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { learningUnits, learningLessons, userUnitProgress, userLessonProgress } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';

/** GET /api/learn/units — list all units with nested lessons + progress */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const units = await dbQuery(() =>
      db.select().from(learningUnits).orderBy(asc(learningUnits.sortOrder))
    );

    const lessons = await dbQuery(() =>
      db.select().from(learningLessons).orderBy(asc(learningLessons.sortOrder))
    );

    let unitProgressMap: Record<string, { status: string; crownLevel: number; lessonsCompleted: number }> = {};
    let lessonProgressMap: Record<string, { status: string; score: number | null; bestScore: number | null; attempts: number }> = {};

    if (userId) {
      const unitProgress = await dbQuery(() =>
        db.select().from(userUnitProgress).where(eq(userUnitProgress.userId, userId))
      );
      for (const up of unitProgress) {
        unitProgressMap[up.unitId] = {
          status: up.status || 'locked',
          crownLevel: up.crownLevel || 0,
          lessonsCompleted: up.lessonsCompleted || 0,
        };
      }

      const lessonProgress = await dbQuery(() =>
        db.select().from(userLessonProgress).where(eq(userLessonProgress.userId, userId))
      );
      for (const lp of lessonProgress) {
        lessonProgressMap[lp.lessonId] = {
          status: lp.status || 'locked',
          score: lp.score,
          bestScore: lp.bestScore,
          attempts: lp.attempts || 0,
        };
      }
    }

    const data = units.map((unit, idx) => {
      const unitLessons = lessons
        .filter((l) => l.unitId === unit.id)
        .map((lesson) => ({
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          sortOrder: lesson.sortOrder,
          lessonType: lesson.lessonType,
          xpReward: lesson.xpReward,
          progress: lessonProgressMap[lesson.id] || {
            status: idx === 0 && lesson.sortOrder === 1 ? 'available' : 'locked',
            score: null,
            bestScore: null,
            attempts: 0,
          },
        }));

      return {
        id: unit.id,
        slug: unit.slug,
        title: unit.title,
        titleAr: unit.titleAr,
        description: unit.description,
        iconEmoji: unit.iconEmoji,
        color: unit.color,
        sortOrder: unit.sortOrder,
        checkpointAfter: unit.checkpointAfter,
        lessons: unitLessons,
        progress: unitProgressMap[unit.id] || {
          status: idx === 0 ? 'available' : 'locked',
          crownLevel: 0,
          lessonsCompleted: 0,
        },
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API] GET /api/learn/units error:', error);
    return NextResponse.json({ error: 'Failed to load learning units' }, { status: 500 });
  }
}
