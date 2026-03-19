import { NextResponse } from 'next/server';
import { db } from '../../../../src/db';
import { roots, forms, tenses, editHistory } from '../../../../src/db/schema';
import { eq, asc } from 'drizzle-orm';
import { cacheGet, cacheSet, cacheInvalidate } from '../../../../src/db/cache';

export const dynamic = 'force-dynamic';

const BAB_COLORS: Record<string, string> = {
  I: '#4a9eff', II: '#f97316', III: '#a855f7', IV: '#22c55e', V: '#ec4899',
  VI: '#14b8a6', VII: '#f59e0b', VIII: '#64748b', IX: '#ef4444', X: '#8b5cf6',
};

const TENSE_COLORS: Record<string, string> = {
  madi: '#ffd700', mudari: '#00d4ff', amr: '#ff6b6b',
  passive_madi: '#c084fc', passive_mudari: '#86efac',
};

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rootId = decodeURIComponent(id);
  const cacheKey = `api:roots:${rootId}`;

  const cached = cacheGet(cacheKey);
  if (cached) return NextResponse.json(cached);

  try {
    const [root] = await db.select().from(roots).where(eq(roots.root, rootId)).limit(1);
    if (!root) {
      return NextResponse.json({ error: 'Root not found' }, { status: 404 });
    }

    const rootForms = await db.select().from(forms)
      .where(eq(forms.rootId, root.id))
      .orderBy(asc(forms.sortOrder));

    // Fetch tenses per form (small number per root, ~2-10 forms max)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tensesByForm = new Map<string, any[]>();
    for (const f of rootForms) {
      const formTenses = await db.select().from(tenses).where(eq(tenses.formId, f.id));
      tensesByForm.set(f.id, formTenses);
    }

    const babs = rootForms.map(f => {
      const formTenses = tensesByForm.get(f.id) || [];
      return {
        id: `${root.root}_${f.formNumber}`,
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
          id: `${root.root}_${f.formNumber}_${t.type}`,
          type: t.type,
          arabicName: t.arabicName,
          englishName: t.englishName,
          color: TENSE_COLORS[t.type] || '#aaa',
          occurrences: t.occurrences || 0,
          references: (t.references as string[]) || [],
          conjugation: (t.conjugations as unknown[]) || [],
          _tenseDbId: t.id,
        })),
        _formDbId: f.id,
      };
    });

    const payload = {
      id: root.root,
      root: root.root,
      rootLetters: root.rootLetters,
      meaning: root.meaning,
      totalFreq: root.totalFreq || 0,
      enriched: true,
      allReferences: (root.allReferences as string[]) || [],
      babs,
      _dbId: root.id,
    };

    cacheSet(cacheKey, payload); // Cache for 5 min
    return NextResponse.json(payload);
  } catch (err) {
    console.error(`[/api/roots/${rootId}] DB error:`, err);
    return NextResponse.json(
      { error: 'Database temporarily unavailable' },
      { status: 503 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const rootId = decodeURIComponent(id);

  try {
    const body = await req.json();
    const [root] = await db.select().from(roots).where(eq(roots.root, rootId)).limit(1);
    if (!root) {
      return NextResponse.json({ error: 'Root not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (body.meaning !== undefined) updates.meaning = body.meaning;

    if (Object.keys(updates).length > 0) {
      await db.update(roots).set(updates).where(eq(roots.id, root.id));

      for (const [field, newVal] of Object.entries(updates)) {
        await db.insert(editHistory).values({
          tableName: 'roots',
          recordId: root.id,
          fieldName: field,
          oldValue: String((root as Record<string, unknown>)[field] ?? ''),
          newValue: String(newVal),
        });
      }

      // Invalidate caches so next GET reflects the edit
      cacheInvalidate(`api:roots:${rootId}`);
      cacheInvalidate('api:roots:index');
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[PATCH /api/roots/${rootId}] DB error:`, err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
