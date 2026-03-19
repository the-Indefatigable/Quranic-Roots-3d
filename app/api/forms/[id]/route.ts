import { NextResponse } from 'next/server';
import { db } from '../../../../src/db';
import { forms, editHistory } from '../../../../src/db/schema';
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
    const [form] = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (body.meaning !== undefined) updates.meaning = body.meaning;
    if (body.verbMeaning !== undefined) updates.verbMeaning = body.verbMeaning;
    if (body.semanticMeaning !== undefined) updates.semanticMeaning = body.semanticMeaning;
    if (body.masdar !== undefined) updates.masdar = body.masdar;
    if (body.faaeil !== undefined) updates.faaeil = body.faaeil;
    if (body.mafool !== undefined) updates.mafool = body.mafool;

    if (Object.keys(updates).length > 0) {
      await db.update(forms).set(updates).where(eq(forms.id, id));

      for (const [field, newVal] of Object.entries(updates)) {
        await db.insert(editHistory).values({
          tableName: 'forms',
          recordId: id,
          fieldName: field,
          oldValue: String((form as Record<string, unknown>)[field] ?? ''),
          newValue: String(newVal),
        });
      }

      // Invalidate all root caches (form could belong to any root)
      cacheInvalidate('api:roots');
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[PATCH /api/forms/${id}] DB error:`, err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
