import { NextResponse } from 'next/server';
import { and, desc, gt, ne } from 'drizzle-orm';
import { db, dbQuery } from '@/db';
import { roots } from '@/db/schema';
import { cacheGet, cacheSet } from '@/db/cache';

export const dynamic = 'force-dynamic';

// A five-question taste of the quiz for visitors who have not signed in: the meaning
// of a root, chosen from the 60 most frequent. Nothing is saved.
const POOL_KEY = 'api:quiz:sample-pool';

type PoolRoot = { root: string; meaning: string; totalFreq: number | null };

function shuffle<T>(xs: T[]): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET() {
  let pool = cacheGet<PoolRoot[]>(POOL_KEY);
  if (!pool) {
    try {
      pool = await dbQuery(() => db
        .select({ root: roots.root, meaning: roots.meaning, totalFreq: roots.totalFreq })
        .from(roots)
        .where(and(gt(roots.totalFreq, 0), ne(roots.meaning, '')))
        .orderBy(desc(roots.totalFreq))
        .limit(60));
      cacheSet(POOL_KEY, pool);
    } catch {
      return NextResponse.json({ error: 'Could not load a quiz right now.' }, { status: 503 });
    }
  }
  const picks = shuffle(pool).slice(0, 5);
  const questions = picks.map((r) => {
    const seen = new Set([r.meaning]);
    const distractors = shuffle(pool!).filter((o) => o.meaning.trim() && !seen.has(o.meaning) && seen.add(o.meaning)).slice(0, 3);
    return {
      root: r.root,
      occurrences: r.totalFreq ?? 0,
      options: shuffle([r.meaning, ...distractors.map((d) => d.meaning)]),
      answer: r.meaning,
    };
  });
  return NextResponse.json({ questions }, { headers: { 'Cache-Control': 'private, no-store' } });
}
