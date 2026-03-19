import { NextResponse } from 'next/server';
import { db } from '../../../src/db';
import { nouns, roots } from '../../../src/db/schema';
import { cacheGet, cacheSet } from '../../../src/db/cache';

export const dynamic = 'force-dynamic';

const CACHE_KEY = 'api:nouns';

export async function GET() {
  const cached = cacheGet(CACHE_KEY);
  if (cached) return NextResponse.json(cached);

  try {
    const allNouns = await db.select({
      id: nouns.id,
      lemma: nouns.lemma,
      lemmaClean: nouns.lemmaClean,
      rootId: nouns.rootId,
      type: nouns.type,
      typeAr: nouns.typeAr,
      baab: nouns.baab,
      meaning: nouns.meaning,
      totalFreq: nouns.totalFreq,
      references: nouns.references,
    }).from(nouns);

    const rootRows = await db.select({ id: roots.id, root: roots.root }).from(roots);
    const rootMap = new Map(rootRows.map(r => [r.id, r.root]));

    const result = allNouns.map(n => ({
      id: n.lemmaClean || n.id,
      lemma: n.lemma,
      lemmaClean: n.lemmaClean,
      root: n.rootId ? rootMap.get(n.rootId) || '' : '',
      type: n.type,
      typeAr: n.typeAr || '',
      baab: n.baab,
      meaning: n.meaning || '',
      lookupRef: ((n.references as string[]) || [])[0] || '',
      references: (n.references as string[]) || [],
      totalFreq: n.totalFreq || 0,
      _dbId: n.id,
    }));

    const payload = { nouns: result };
    cacheSet(CACHE_KEY, payload);
    return NextResponse.json(payload);
  } catch (err) {
    console.error('[/api/nouns] DB error:', err);
    return NextResponse.json(
      { error: 'Database temporarily unavailable' },
      { status: 503 }
    );
  }
}
