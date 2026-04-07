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

    // Run all queries in parallel — the user-progress queries don't depend on units/lessons
    const [units, lessons, unitProgress, lessonProgress] = await Promise.all([
      dbQuery(() => db.select().from(learningUnits).orderBy(asc(learningUnits.sortOrder))),
      dbQuery(() => db.select().from(learningLessons).orderBy(asc(learningLessons.sortOrder))),
      userId
        ? dbQuery(() => db.select().from(userUnitProgress).where(eq(userUnitProgress.userId, userId)))
        : Promise.resolve([] as Awaited<ReturnType<typeof db.select>> extends infer _ ? any[] : never[]),
      userId
        ? dbQuery(() => db.select().from(userLessonProgress).where(eq(userLessonProgress.userId, userId)))
        : Promise.resolve([] as any[]),
    ]);

    const unitProgressMap: Record<string, { status: string; crownLevel: number; lessonsCompleted: number }> = {};
    const lessonProgressMap: Record<string, { status: string; score: number | null; bestScore: number | null; attempts: number }> = {};

    if (userId) {
      for (const up of unitProgress) {
        unitProgressMap[up.unitId] = {
          status: up.status || 'locked',
          crownLevel: up.crownLevel || 0,
          lessonsCompleted: up.lessonsCompleted || 0,
        };
      }

      for (const lp of lessonProgress) {
        lessonProgressMap[lp.lessonId] = {
          status: lp.status || 'locked',
          score: lp.score,
          bestScore: lp.bestScore,
          attempts: lp.attempts || 0,
        };
      }
    }

    // Pre-bucket lessons by unitId — avoids O(units × lessons) filter cost
    const lessonsByUnit = new Map<string, typeof lessons>();
    for (const l of lessons) {
      const arr = lessonsByUnit.get(l.unitId);
      if (arr) arr.push(l);
      else lessonsByUnit.set(l.unitId, [l]);
    }

    const data = units.map((unit, idx) => {
      const unitLessons = (lessonsByUnit.get(unit.id) || [])
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
