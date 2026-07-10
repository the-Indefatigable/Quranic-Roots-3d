export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { db, dbQuery } from '@/db';
import { chatMessages, users } from '@/db/schema';
import { and, eq, gte, isNull, sql, desc } from 'drizzle-orm';

// Public, unauthenticated stats for merchandising the community on the
// homepage. Exposes only aggregate counts + first name/avatar of recent
// participants — never message content.
//
// Cached in-memory per serverless instance for 60s so homepage traffic
// doesn't hammer Postgres.
let cache: { data: unknown; at: number } | null = null;
const CACHE_MS = 60_000;

export async function GET() {
  try {
    if (cache && Date.now() - cache.at < CACHE_MS) {
      return NextResponse.json(cache.data);
    }

    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [totals, recent] = await Promise.all([
      // total messages + distinct participants, all-time and last 24h
      dbQuery(() =>
        db
          .select({
            totalMessages: sql<number>`count(*)::int`,
            totalParticipants: sql<number>`count(distinct ${chatMessages.userId})::int`,
            messages24h: sql<number>`count(*) filter (where ${chatMessages.createdAt} >= ${dayAgo})::int`,
          })
          .from(chatMessages)
          .where(isNull(chatMessages.deletedAt))
      ),
      // up to 5 most recent distinct participants (first name + avatar only)
      dbQuery(() =>
        db
          .selectDistinctOn([chatMessages.userId], {
            userId: chatMessages.userId,
            name: users.name,
            image: users.image,
            lastAt: chatMessages.createdAt,
          })
          .from(chatMessages)
          .innerJoin(users, eq(chatMessages.userId, users.id))
          .where(and(isNull(chatMessages.deletedAt), gte(chatMessages.createdAt, dayAgo)))
          .orderBy(chatMessages.userId, desc(chatMessages.createdAt))
          .limit(5)
      ),
    ]);

    const t = totals[0];
    const data = {
      totalMessages: t?.totalMessages ?? 0,
      totalParticipants: t?.totalParticipants ?? 0,
      messages24h: t?.messages24h ?? 0,
      recentParticipants: recent.map((r) => ({
        // first name only — enough for social proof, no full identity
        name: (r.name ?? 'Learner').split(' ')[0],
        image: r.image,
      })),
    };

    cache = { data, at: Date.now() };
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    });
  } catch (error) {
    console.error('[chat/stats] Error:', error);
    return NextResponse.json(
      { totalMessages: 0, totalParticipants: 0, messages24h: 0, recentParticipants: [] },
      { status: 200 } // never break the homepage over stats
    );
  }
}
