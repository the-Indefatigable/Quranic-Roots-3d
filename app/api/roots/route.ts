import { NextResponse } from 'next/server';
import { db, dbQuery } from '../../../src/db';
import { roots, forms, tenses } from '../../../src/db/schema';
import { asc } from 'drizzle-orm';
import { cacheGet, cacheSet } from '../../../src/db/cache';

export const revalidate = 86400; // ISR: 24h — root data rarely changes

const BAB_COLORS: Record<string, string> = {
  I: '#4a9eff', II: '#f97316', III: '#a855f7', IV: '#22c55e', V: '#ec4899',
  VI: '#14b8a6', VII: '#f59e0b', VIII: '#64748b', IX: '#ef4444', X: '#8b5cf6',
};

const TENSE_COLORS: Record<string, string> = {
  madi: '#ffd700', mudari: '#00d4ff', amr: '#ff6b6b',
  passive_madi: '#c084fc', passive_mudari: '#86efac',
};

const CACHE_KEY = 'api:roots:index';

export async function GET() {
  // Return cached if available (5 min TTL)
  const cached = cacheGet<{ roots: unknown[] }>(CACHE_KEY);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // 3 sequential queries with retry (handles Railway cold starts)
    const allRoots = await dbQuery(() => db.select().from(roots));
    const allForms = await dbQuery(() => db.select().from(forms).orderBy(asc(forms.sortOrder)));
    const allTenses = await dbQuery(() => db.select({
      id: tenses.id,
      formId: tenses.formId,
      type: tenses.type,
      arabicName: tenses.arabicName,
      englishName: tenses.englishName,
      occurrences: tenses.occurrences,
    }).from(tenses));

    // Index tenses by formId
    const tensesByForm = new Map<string, typeof allTenses>();
    for (const t of allTenses) {
      if (!tensesByForm.has(t.formId)) tensesByForm.set(t.formId, []);
      tensesByForm.get(t.formId)!.push(t);
    }

    // Index forms by rootId
    const formsByRoot = new Map<string, typeof allForms>();
    for (const f of allForms) {
      if (!formsByRoot.has(f.rootId)) formsByRoot.set(f.rootId, []);
      formsByRoot.get(f.rootId)!.push(f);
    }

    // Only include roots that have at least one verb form
    const verbRoots = allRoots.filter(r => formsByRoot.has(r.id) && formsByRoot.get(r.id)!.length > 0);

    const result = verbRoots.map(r => {
      const rootForms = formsByRoot.get(r.id) || [];
      return {
        id: r.root,
        root: r.root,
        rootLetters: r.rootLetters,
        meaning: r.meaning,
        totalFreq: r.totalFreq || 0,
        babs: rootForms.map(f => {
          const formTenses = tensesByForm.get(f.id) || [];
          return {
            id: `${r.root}_${f.formNumber}`,
            form: f.formNumber,
            color: BAB_COLORS[f.formNumber] || '#888',
            arabicPattern: f.arabicPattern,
            romanNumeral: f.formNumber,
            meaning: f.meaning || '',
            semanticMeaning: f.semanticMeaning || undefined,
            verbMeaning: f.verbMeaning || undefined,
            prepositions: f.prepositions || [],
            masdar: f.masdar || undefined,
            masdarAlternatives: f.masdarAlternatives || undefined,
            faaeil: f.faaeil || undefined,
            mafool: f.mafool || undefined,
            tenses: formTenses.map(t => ({
              id: `${r.root}_${f.formNumber}_${t.type}`,
              type: t.type,
              arabicName: t.arabicName,
              englishName: t.englishName,
              color: TENSE_COLORS[t.type] || '#aaa',
              occurrences: t.occurrences || 0,
            })),
          };
        }),
      };
    });

    const payload = { roots: result };
    cacheSet(CACHE_KEY, payload);
    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
    });
  } catch (err) {
    console.error('[/api/roots] DB error:', err);
    return NextResponse.json(
      { error: 'Database temporarily unavailable' },
      { status: 503 }
    );
  }
}
