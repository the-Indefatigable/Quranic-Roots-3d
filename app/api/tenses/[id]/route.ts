import { NextResponse } from 'next/server';
import { db } from '../../../../src/db';
import { tenses, editHistory } from '../../../../src/db/schema';
import { eq } from 'drizzle-orm';
import { cacheInvalidate } from '../../../../src/db/cache';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const [tense] = await db.select().from(tenses).where(eq(tenses.id, id)).limit(1);
    if (!tense) {
      return NextResponse.json({ error: 'Tense not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (body.conjugations !== undefined) updates.conjugations = body.conjugations;
    if (body.arabicName !== undefined) updates.arabicName = body.arabicName;
    if (body.englishName !== undefined) updates.englishName = body.englishName;

    if (Object.keys(updates).length > 0) {
      await db.update(tenses).set(updates).where(eq(tenses.id, id));

      for (const [field, newVal] of Object.entries(updates)) {
        await db.insert(editHistory).values({
          tableName: 'tenses',
          recordId: id,
          fieldName: field,
          oldValue: JSON.stringify((tense as Record<string, unknown>)[field] ?? ''),
          newValue: JSON.stringify(newVal),
        });
      }

      // Invalidate root caches
      cacheInvalidate('api:roots');
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[PATCH /api/tenses/${id}] DB error:`, err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
