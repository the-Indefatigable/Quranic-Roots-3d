export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { chatMessages } from '@/db/schema';
import { eq } from 'drizzle-orm';

// DELETE /api/chat/messages/:id
// Admins/teachers can remove any message; authors can remove their own.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!z.string().uuid().safeParse(params.id).success) {
      return NextResponse.json({ error: 'Invalid message id' }, { status: 400 });
    }

    const [msg] = await dbQuery(() =>
      db
        .select({ id: chatMessages.id, userId: chatMessages.userId })
        .from(chatMessages)
        .where(eq(chatMessages.id, params.id))
    );

    if (!msg) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    const role = session.user.role;
    const isModerator = role === 'admin' || role === 'teacher';
    const isAuthor = msg.userId === session.user.id;

    if (!isModerator && !isAuthor) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await dbQuery(() =>
      db
        .update(chatMessages)
        .set({ deletedAt: new Date() })
        .where(eq(chatMessages.id, params.id))
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[chat/messages DELETE] Error:', error);
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
