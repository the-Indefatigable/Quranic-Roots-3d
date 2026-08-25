export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { userVerbProgress } from '@/db/schema';
import { dailyVerbIds } from '@/data/dailyVerbs';
import { rateLimit, tooManyRequests } from '@/lib/rateLimit';

/**
 * Daily Verbs progress — which verbs a signed-in learner has ticked as known.
 *
 * GET  -> { remembered: string[] }
 * POST { verbId, remembered } -> { remembered: string[] } (the full new set)
 *
 * POST returns the whole set rather than an ack so the client always ends a
 * round-trip holding server truth. Two tabs ticking different verbs converge
 * instead of overwriting each other, which an ack-only response would allow.
 *
 * Verb ids are validated against the static list, so a client cannot write
 * rows for verbs that do not exist.
 */

const Body = z.object({
  verbId: z.string().min(1).max(64),
  remembered: z.boolean(),
});

// Ticking is a cheap single-row write, but it is one click away from being held
// down. Generous enough that nobody working through the list will ever see it.
const LIMIT = 120;
const WINDOW_MS = 60_000;

async function readSet(userId: string): Promise<string[]> {
  const rows = await dbQuery(() =>
    db
      .select({ verbId: userVerbProgress.verbId })
      .from(userVerbProgress)
      .where(eq(userVerbProgress.userId, userId))
  );
  // Verbs removed from the list since they were ticked would otherwise show up
  // in the count and make "42 of 298" impossible to reach.
  return rows.map((r) => r.verbId).filter((id) => dailyVerbIds.has(id));
}

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    return NextResponse.json({ remembered: await readSet(userId) });
  } catch (error) {
    console.error('[verbs/progress] GET error:', error);
    return NextResponse.json({ error: 'Failed to load progress' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const limited = rateLimit(`verbs-progress:${userId}`, LIMIT, WINDOW_MS);
    if (!limited.ok) return tooManyRequests(limited);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    const { verbId, remembered } = parsed.data;

    if (!dailyVerbIds.has(verbId)) {
      return NextResponse.json({ error: 'Unknown verb' }, { status: 400 });
    }

    if (remembered) {
      // Re-ticking an already-ticked verb keeps the original timestamp, so the
      // date reflects when it was first learned.
      await dbQuery(() =>
        db.insert(userVerbProgress).values({ userId, verbId }).onConflictDoNothing()
      );
    } else {
      await dbQuery(() =>
        db
          .delete(userVerbProgress)
          .where(and(eq(userVerbProgress.userId, userId), eq(userVerbProgress.verbId, verbId)))
      );
    }

    return NextResponse.json({ remembered: await readSet(userId) });
  } catch (error) {
    console.error('[verbs/progress] POST error:', error);
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 });
  }
}

// Deliberately no XP, gems or streak credit for ticking a verb. It is
// self-reported with nothing to check it against, so paying out would put an
// unbounded, unverifiable source of XP straight onto the public leaderboard.
// The reward for ticking is the progress bar; XP stays behind graded work.