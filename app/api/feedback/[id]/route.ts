export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { feedback } from '@/db/schema';
import { eq } from 'drizzle-orm';

const PatchSchema = z.object({
  status: z.enum(['new', 'seen', 'done']),
});

// PATCH /api/feedback/:id — admin: update status
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!z.string().uuid().safeParse(params.id).success) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }

    const parsed = PatchSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await dbQuery(() =>
      db.update(feedback)
        .set({ status: parsed.data.status })
        .where(eq(feedback.id, params.id))
        .returning({ id: feedback.id })
    );

    if (!updated.length) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[feedback PATCH] Error:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}
