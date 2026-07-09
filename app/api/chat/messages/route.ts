export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { chatMessages, users } from '@/db/schema';
import { and, eq, gt, isNull, desc, asc } from 'drizzle-orm';

const ROOM = 'general';
const PAGE_SIZE = 50;
const MAX_BODY = 1000;
const MIN_INTERVAL_MS = 2000; // anti-spam: one message per user per 2s

// Shape returned to the client
function serialize(row: {
  id: string;
  body: string;
  createdAt: Date;
  userId: string;
  userName: string | null;
  userImage: string | null;
  userRole: string;
}) {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.createdAt,
    user: {
      id: row.userId,
      name: row.userName,
      image: row.userImage,
      role: row.userRole,
    },
  };
}

const selectCols = {
  id: chatMessages.id,
  body: chatMessages.body,
  createdAt: chatMessages.createdAt,
  userId: chatMessages.userId,
  userName: users.name,
  userImage: users.image,
  userRole: users.role,
};

// GET /api/chat/messages            → latest 50 (chronological)
// GET /api/chat/messages?after=ISO  → only messages newer than the cursor
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const afterParam = req.nextUrl.searchParams.get('after');
    const after = afterParam ? new Date(afterParam) : null;
    const validAfter = after && !isNaN(after.getTime()) ? after : null;

    if (validAfter) {
      // Polling: fetch new messages since the cursor, oldest → newest
      const rows = await dbQuery(() =>
        db
          .select(selectCols)
          .from(chatMessages)
          .innerJoin(users, eq(chatMessages.userId, users.id))
          .where(
            and(
              eq(chatMessages.room, ROOM),
              isNull(chatMessages.deletedAt),
              gt(chatMessages.createdAt, validAfter)
            )
          )
          .orderBy(asc(chatMessages.createdAt))
          .limit(200)
      );
      return NextResponse.json({ messages: rows.map(serialize) });
    }

    // Initial load: latest page, then reverse to chronological order
    const rows = await dbQuery(() =>
      db
        .select(selectCols)
        .from(chatMessages)
        .innerJoin(users, eq(chatMessages.userId, users.id))
        .where(and(eq(chatMessages.room, ROOM), isNull(chatMessages.deletedAt)))
        .orderBy(desc(chatMessages.createdAt))
        .limit(PAGE_SIZE)
    );

    return NextResponse.json({ messages: rows.reverse().map(serialize) });
  } catch (error) {
    console.error('[chat/messages GET] Error:', error);
    return NextResponse.json({ error: 'Failed to load messages' }, { status: 500 });
  }
}

const PostSchema = z.object({
  body: z.string().trim().min(1).max(MAX_BODY),
});

// POST /api/chat/messages → send a message
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = PostSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Message must be 1–1000 characters' }, { status: 400 });
    }

    // Anti-spam throttle: reject if this user posted very recently
    const [last] = await dbQuery(() =>
      db
        .select({ createdAt: chatMessages.createdAt })
        .from(chatMessages)
        .where(eq(chatMessages.userId, session.user.id))
        .orderBy(desc(chatMessages.createdAt))
        .limit(1)
    );

    if (last && Date.now() - new Date(last.createdAt).getTime() < MIN_INTERVAL_MS) {
      return NextResponse.json(
        { error: 'You are sending messages too fast. Slow down a moment.' },
        { status: 429 }
      );
    }

    const [inserted] = await dbQuery(() =>
      db
        .insert(chatMessages)
        .values({ userId: session.user.id, room: ROOM, body: parsed.data.body })
        .returning({ id: chatMessages.id, createdAt: chatMessages.createdAt })
    );

    return NextResponse.json({
      message: serialize({
        id: inserted.id,
        body: parsed.data.body,
        createdAt: inserted.createdAt,
        userId: session.user.id,
        userName: session.user.name ?? null,
        userImage: session.user.image ?? null,
        userRole: session.user.role ?? 'student',
      }),
    });
  } catch (error) {
    console.error('[chat/messages POST] Error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
