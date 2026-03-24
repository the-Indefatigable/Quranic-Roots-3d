import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { quizSessions, userRootMastery, userNounMastery, userParticleMastery } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getUserStats } from '@/utils/srsEngine';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get quiz sessions
    const sessions = await dbQuery(() =>
      db.select().from(quizSessions).where(eq(quizSessions.userId, session.user.id))
    );

    const totalSessions = sessions.length;
    const totalCorrect = sessions.reduce((sum, s) => sum + s.correctCount, 0);
    const totalAttempts = sessions.reduce((sum, s) => sum + s.itemCount, 0);
    const avgAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const totalXP = totalCorrect * 10;

    // Get mastery stats
    const stats = await getUserStats(session.user.id);

    // Get masteries
    const [roots, nouns, particles] = await Promise.all([
      dbQuery(() =>
        db
          .select()
          .from(userRootMastery)
          .where(eq(userRootMastery.userId, session.user.id))
      ),
      dbQuery(() =>
        db
          .select()
          .from(userNounMastery)
          .where(eq(userNounMastery.userId, session.user.id))
      ),
      dbQuery(() =>
        db
          .select()
          .from(userParticleMastery)
          .where(eq(userParticleMastery.userId, session.user.id))
      ),
    ]);

    const masteryBreakdown = {
      roots: {
        learned: roots.filter((r) => (r.mastery ?? 0) >= 1).length,
        total: roots.length,
        avgMastery: roots.length > 0 ? Math.round((roots.reduce((s, r) => s + (r.mastery ?? 0), 0) / roots.length) * 10) / 10 : 0,
      },
      nouns: {
        learned: nouns.filter((n) => (n.mastery ?? 0) >= 1).length,
        total: nouns.length,
        avgMastery: nouns.length > 0 ? Math.round((nouns.reduce((s, n) => s + (n.mastery ?? 0), 0) / nouns.length) * 10) / 10 : 0,
      },
      particles: {
        learned: particles.filter((p) => (p.mastery ?? 0) >= 1).length,
        total: particles.length,
        avgMastery:
          particles.length > 0 ? Math.round((particles.reduce((s, p) => s + (p.mastery ?? 0), 0) / particles.length) * 10) / 10 : 0,
      },
    };

    return NextResponse.json({
      totalSessions,
      totalCorrect,
      totalAttempts,
      avgAccuracy,
      totalXP,
      masteryBreakdown,
      totalLearned: stats.totalLearned,
      overallAvgMastery: stats.avgMastery,
    });
  } catch (error) {
    console.error('[quiz/stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
