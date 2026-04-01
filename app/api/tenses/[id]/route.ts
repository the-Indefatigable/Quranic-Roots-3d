import { NextResponse } from 'next/server';
import { db } from '../../../../src/db';
import { tenses, editHistory } from '../../../../src/db/schema';
import { eq } from 'drizzle-orm';
import { cacheInvalidate } from '../../../../src/db/cache';

export const dynamic = 'force-dynamic';

import { z } from 'zod';

const TensePatchSchema = z.object({
  conjugations: z.any().optional(),
  arabicName: z.string().optional(),
  englishName: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = TensePatchSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const [tense] = await db.select().from(tenses).where(eq(tenses.id, id)).limit(1);
    if (!tense) {
      return NextResponse.json({ error: 'Tense not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    const { conjugations, arabicName, englishName } = parsed.data;
    if (conjugations !== undefined) updates.conjugations = conjugations;
    if (arabicName !== undefined) updates.arabicName = arabicName;
    if (englishName !== undefined) updates.englishName = englishName;

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
