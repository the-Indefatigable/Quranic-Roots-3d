export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { learningLessons, learningUnits, userLessonProgress, userHearts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

// GET /api/learn/lesson?id=<lessonId>
export async function GET(request: NextRequest) {
  try {
    const lessonId = request.nextUrl.searchParams.get('id');
    if (!lessonId) {
      return NextResponse.json({ error: 'Missing lesson id' }, { status: 400 });
    }

    const session = await auth();
    const userId = session?.user?.id;

    // Fetch lesson + unit info
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

    // Get user hearts if logged in
    let hearts = 5;
    if (userId) {
      const [heartRow] = await dbQuery(() =>
        db.select().from(userHearts).where(eq(userHearts.userId, userId))
      );
      if (heartRow) {
        // Auto-refill hearts (1 per 4 hours)
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
      lesson: {
        ...lesson,
        content: lesson.content as Record<string, unknown>,
      },
      hearts,
    });
  } catch (error) {
    console.error('[API] /learn/lesson error:', error);
    return NextResponse.json({ error: 'Failed to load lesson' }, { status: 500 });
  }
}
