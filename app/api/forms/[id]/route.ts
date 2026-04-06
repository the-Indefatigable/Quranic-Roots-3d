import { NextResponse } from 'next/server';
import { db } from '../../../../src/db';
import { forms, editHistory } from '../../../../src/db/schema';
import { eq } from 'drizzle-orm';
import { cacheInvalidate } from '../../../../src/db/cache';

export const dynamic = 'force-dynamic';

import { z } from 'zod';
import { auth } from '@/lib/auth';

const FormPatchSchema = z.object({
  meaning: z.string().optional(),
  verbMeaning: z.string().optional(),
  semanticMeaning: z.string().optional(),
  masdar: z.string().optional(),
  faaeil: z.string().optional(),
  mafool: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = FormPatchSchema.safeParse(body);
    
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid payload', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const [form] = await db.select().from(forms).where(eq(forms.id, id)).limit(1);
    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    const { meaning, verbMeaning, semanticMeaning, masdar, faaeil, mafool } = parsed.data;
    if (meaning !== undefined) updates.meaning = meaning;
    if (verbMeaning !== undefined) updates.verbMeaning = verbMeaning;
    if (semanticMeaning !== undefined) updates.semanticMeaning = semanticMeaning;
    if (masdar !== undefined) updates.masdar = masdar;
    if (faaeil !== undefined) updates.faaeil = faaeil;
    if (mafool !== undefined) updates.mafool = mafool;

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
