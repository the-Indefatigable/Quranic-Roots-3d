export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import {
  learningLessons,
  learningUnits,
  userLessonProgress,
  userUnitProgress,
  userHearts,
  userStreaks,
  userGems,
  gemTransactions,
  dailyGoals,
  dailyQuests,
  leagueMembers,
  users,
} from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { z } from 'zod';

const CompletionPayloadSchema = z.object({
  score: z.number().int().min(0).max(100),
  correctCount: z.number().int().min(0).max(200),
  totalCount: z.number().int().min(1).max(200),
  mistakes: z.array(z.object({
    stepIndex: z.number().int().min(0),
    userAnswer: z.string(),
    correctAnswer: z.string(),
  })),
  comboMax: z.number().int().min(0).max(200),
  timeSpentS: z.number().int().min(0).max(7200), // max 2 hours
});

/** POST /api/learn/lessons/:lessonId/complete — mark lesson as completed */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> },
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { lessonId } = await params;
    const rawBody = await request.json();
    const parsed = CompletionPayloadSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload', details: parsed.error.format() }, { status: 400 });
    }
    const { score, correctCount, totalCount, mistakes, comboMax, timeSpentS } = parsed.data;

    // Qirat lessons are static — skip DB operations, just return success
    if (lessonId.startsWith('qirat-')) {
      const { getQiratLessonById } = await import('@/data/qirat-curriculum');
      const found = getQiratLessonById(lessonId);
      const xpReward = found?.lesson.xpReward ?? 15;
      let xpEarned = xpReward;
      if (score === 100) xpEarned = Math.round(xpEarned * 2);
      else if (score >= 90) xpEarned = Math.round(xpEarned * 1.5);

      return NextResponse.json({
        data: {
          xpEarned,
          isPerfect: score === 100,
          score,
          streak: { currentStreak: 0, isNewStreak: false, milestoneReached: 0 },
          dailyGoalCompleted: false,
          gemsEarned: 0,
          nextLessonId: null,
        },
      });
    }

    // Fetch lesson details
    const [lesson] = await dbQuery(() =>
      db.select().from(learningLessons).where(eq(learningLessons.id, lessonId))
    );
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Calculate XP
    let xpEarned = lesson.xpReward || 15;
    const isPerfect = score === 100;
    if (isPerfect) xpEarned = Math.round(xpEarned * 2);
    else if (score >= 90) xpEarned = Math.round(xpEarned * 1.5);

    // Combo bonus
    if (comboMax >= 5) xpEarned += 10;
    else if (comboMax >= 3) xpEarned += 5;

    const today = new Date().toISOString().slice(0, 10);

    // ── 1. Update lesson progress ────────────────────────
    const [existing] = await dbQuery(() =>
      db.select().from(userLessonProgress)
        .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.lessonId, lessonId)))
    );

    if (existing) {
      await dbQuery(() =>
        db.update(userLessonProgress)
          .set({
            status: 'completed',
            score,
            bestScore: Math.max(score, existing.bestScore || 0),
            attempts: (existing.attempts || 0) + 1,
            mistakes: mistakes as unknown as Record<string, unknown>,
            completedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(userLessonProgress.id, existing.id))
      );
    } else {
      await dbQuery(() =>
        db.insert(userLessonProgress).values({
          userId,
          lessonId,
          status: 'completed',
          score,
          bestScore: score,
          attempts: 1,
          mistakes: mistakes as unknown as Record<string, unknown>,
          completedAt: new Date(),
        })
      );
    }

    // ── 2. Unlock next lesson ────────────────────────────
    const unitLessons = await dbQuery(() =>
      db.select().from(learningLessons)
        .where(eq(learningLessons.unitId, lesson.unitId))
        .orderBy(learningLessons.sortOrder)
    );

    const currentIdx = unitLessons.findIndex((l) => l.id === lessonId);
    const nextLesson = unitLessons[currentIdx + 1];

    if (nextLesson) {
      const [nextProgress] = await dbQuery(() =>
        db.select().from(userLessonProgress)
          .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.lessonId, nextLesson.id)))
      );
      if (!nextProgress) {
        await dbQuery(() =>
          db.insert(userLessonProgress).values({
            userId,
            lessonId: nextLesson.id,
            status: 'available',
          })
        );
      } else if (nextProgress.status === 'locked') {
        await dbQuery(() =>
          db.update(userLessonProgress)
            .set({ status: 'available', updatedAt: new Date() })
            .where(eq(userLessonProgress.id, nextProgress.id))
        );
      }
    }

    // ── 3. Update unit progress ──────────────────────────
    const completedInUnit = await dbQuery(() =>
      db.select({ count: sql<number>`count(*)::int` })
        .from(userLessonProgress)
        .where(and(
          eq(userLessonProgress.userId, userId),
          eq(userLessonProgress.status, 'completed'),
          sql`${userLessonProgress.lessonId} IN (SELECT id FROM learning_lessons WHERE unit_id = ${lesson.unitId})`
        ))
    );

    const lessonsCompleted = completedInUnit[0]?.count || 0;
    const unitComplete = lessonsCompleted >= unitLessons.length;
    const crownLevel = unitComplete ? (isPerfect ? 3 : score >= 80 ? 2 : 1) : 0;

    const [existingUnit] = await dbQuery(() =>
      db.select().from(userUnitProgress)
        .where(and(eq(userUnitProgress.userId, userId), eq(userUnitProgress.unitId, lesson.unitId)))
    );

    if (existingUnit) {
      await dbQuery(() =>
        db.update(userUnitProgress)
          .set({
            status: unitComplete ? 'completed' : 'in_progress',
            crownLevel: Math.max(crownLevel, existingUnit.crownLevel || 0),
            lessonsCompleted,
            updatedAt: new Date(),
          })
          .where(eq(userUnitProgress.id, existingUnit.id))
      );
    } else {
      await dbQuery(() =>
        db.insert(userUnitProgress).values({
          userId,
          unitId: lesson.unitId,
          status: unitComplete ? 'completed' : 'in_progress',
          crownLevel,
          lessonsCompleted,
        })
      );
    }

    // If unit complete and there's a next unit, unlock it
    if (unitComplete && !nextLesson) {
      const [currentUnit] = await dbQuery(() =>
        db.select().from(learningUnits).where(eq(learningUnits.id, lesson.unitId))
      );
      if (currentUnit) {
        const [nextUnit] = await dbQuery(() =>
          db.select().from(learningUnits)
            .where(sql`${learningUnits.sortOrder} > ${currentUnit.sortOrder}`)
            .orderBy(learningUnits.sortOrder)
            .limit(1)
        );
        if (nextUnit) {
          await dbQuery(() =>
            db.insert(userUnitProgress).values({
              userId,
              unitId: nextUnit.id,
              status: 'available',
            }).onConflictDoNothing()
          );
          const [firstLesson] = await dbQuery(() =>
            db.select().from(learningLessons)
              .where(eq(learningLessons.unitId, nextUnit.id))
              .orderBy(learningLessons.sortOrder)
              .limit(1)
          );
          if (firstLesson) {
            await dbQuery(() =>
              db.insert(userLessonProgress).values({
                userId,
                lessonId: firstLesson.id,
                status: 'available',
              }).onConflictDoNothing()
            );
          }
        }
      }
    }

    // ── 4. Add XP to user ────────────────────────────────
    await dbQuery(() =>
      db.update(users)
        .set({
          totalXP: sql`${users.totalXP} + ${xpEarned}`,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId))
    );

    // ── 5. Update streak ─────────────────────────────────
    let streakData = { currentStreak: 1, isNewStreak: false, milestoneReached: 0 };
    const [streak] = await dbQuery(() =>
      db.select().from(userStreaks).where(eq(userStreaks.userId, userId))
    );

    if (streak) {
      const lastActive = streak.lastActiveDate;
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

      if (lastActive === today) {
        streakData.currentStreak = streak.currentStreak;
      } else if (lastActive === yesterday) {
        const newStreak = streak.currentStreak + 1;
        streakData.currentStreak = newStreak;
        streakData.isNewStreak = true;
        if ([7, 14, 30, 50, 100, 365].includes(newStreak)) {
          streakData.milestoneReached = newStreak;
        }
        await dbQuery(() =>
          db.update(userStreaks).set({
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, streak.longestStreak),
            lastActiveDate: today,
            updatedAt: new Date(),
          }).where(eq(userStreaks.userId, userId))
        );
      } else {
        if (streak.streakFreezesOwned > 0) {
          streakData.currentStreak = streak.currentStreak + 1;
          streakData.isNewStreak = true;
          await dbQuery(() =>
            db.update(userStreaks).set({
              currentStreak: streak.currentStreak + 1,
              longestStreak: Math.max(streak.currentStreak + 1, streak.longestStreak),
              lastActiveDate: today,
              streakFreezesOwned: streak.streakFreezesOwned - 1,
              updatedAt: new Date(),
            }).where(eq(userStreaks.userId, userId))
          );
        } else {
          streakData.currentStreak = 1;
          streakData.isNewStreak = true;
          await dbQuery(() =>
            db.update(userStreaks).set({
              currentStreak: 1,
              lastActiveDate: today,
              updatedAt: new Date(),
            }).where(eq(userStreaks.userId, userId))
          );
        }
      }
    } else {
      streakData.isNewStreak = true;
      await dbQuery(() =>
        db.insert(userStreaks).values({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: today,
        })
      );
    }

    // ── 6. Update daily goal ─────────────────────────────
    let dailyGoalCompleted = false;
    const [goal] = await dbQuery(() =>
      db.select().from(dailyGoals)
        .where(and(eq(dailyGoals.userId, userId), eq(dailyGoals.goalDate, today)))
    );

    if (goal) {
      const newEarned = goal.earnedXp + xpEarned;
      const nowCompleted = newEarned >= goal.targetXp;
      dailyGoalCompleted = nowCompleted && !goal.completed;
      await dbQuery(() =>
        db.update(dailyGoals).set({
          earnedXp: newEarned,
          lessonsCompleted: goal.lessonsCompleted + 1,
          completed: nowCompleted,
        }).where(eq(dailyGoals.id, goal.id))
      );
    } else {
      const completed = xpEarned >= 30;
      dailyGoalCompleted = completed;
      await dbQuery(() =>
        db.insert(dailyGoals).values({
          userId,
          goalDate: today,
          targetXp: 30,
          earnedXp: xpEarned,
          lessonsCompleted: 1,
          completed,
        })
      );
    }

    let gemsEarned = 0;
    if (dailyGoalCompleted) gemsEarned += 5;
    if (isPerfect) gemsEarned += 5;
    if (streakData.milestoneReached > 0) gemsEarned += 10;

    if (gemsEarned > 0) {
      await dbQuery(() =>
        db.insert(userGems).values({
          userId,
          balance: gemsEarned,
          totalEarned: gemsEarned,
        }).onConflictDoUpdate({
          target: userGems.userId,
          set: {
            balance: sql`${userGems.balance} + ${gemsEarned}`,
            totalEarned: sql`${userGems.totalEarned} + ${gemsEarned}`,
            updatedAt: new Date(),
          },
        })
      );

      if (dailyGoalCompleted) {
        await dbQuery(() =>
          db.insert(gemTransactions).values({ userId, amount: 5, reason: 'daily_goal' })
        );
      }
      if (isPerfect) {
        await dbQuery(() =>
          db.insert(gemTransactions).values({ userId, amount: 5, reason: 'perfect_lesson' })
        );
      }
      if (streakData.milestoneReached > 0) {
        await dbQuery(() =>
          db.insert(gemTransactions).values({ userId, amount: 10, reason: 'streak_milestone' })
        );
      }
    }

    // ── 7. Update league XP ──────────────────────────────
    await dbQuery(() =>
      db.update(leagueMembers)
        .set({ weeklyXp: sql`${leagueMembers.weeklyXp} + ${xpEarned}` })
        .where(eq(leagueMembers.userId, userId))
    );

    return NextResponse.json({
      data: {
        xpEarned,
        isPerfect,
        score,
        streak: streakData,
        dailyGoalCompleted,
        gemsEarned,
        nextLessonId: nextLesson?.id || null,
      },
    });
  } catch (error) {
    console.error('[API] POST /api/learn/lessons/:id/complete error:', error);
    return NextResponse.json({ error: 'Failed to complete lesson' }, { status: 500 });
  }
}
