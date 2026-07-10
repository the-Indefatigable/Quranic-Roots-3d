export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db, dbQuery } from '@/db';
import { feedback, users } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

const PostSchema = z.object({
  category: z.enum(['suggestion', 'bug', 'content', 'other']),
  body: z.string().trim().min(3).max(2000),
  page: z.string().trim().max(300).optional(),
});

const MIN_INTERVAL_MS = 30_000; // one submission per user per 30s

// POST /api/feedback — any signed-in user
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const parsed = PostSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Feedback must be 3–2000 characters' }, { status: 400 });
    }

    // Throttle
    const [last] = await dbQuery(() =>
      db.select({ createdAt: feedback.createdAt })
        .from(feedback)
        .where(eq(feedback.userId, session.user.id))
        .orderBy(desc(feedback.createdAt))
        .limit(1)
    );
    if (last && Date.now() - new Date(last.createdAt).getTime() < MIN_INTERVAL_MS) {
      return NextResponse.json(
        { error: 'Please wait a moment before sending more feedback.' },
        { status: 429 }
      );
    }

    await dbQuery(() =>
      db.insert(feedback).values({
        userId: session.user.id,
        category: parsed.data.category,
        body: parsed.data.body,
        page: parsed.data.page ?? null,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[feedback POST] Error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

// GET /api/feedback?status=new — admin only
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const statusFilter = req.nextUrl.searchParams.get('status');
    const where = statusFilter && ['new', 'seen', 'done'].includes(statusFilter)
      ? and(eq(feedback.status, statusFilter))
      : undefined;

    const rows = await dbQuery(() =>
      db.select({
        id: feedback.id,
        category: feedback.category,
        body: feedback.body,
        page: feedback.page,
        status: feedback.status,
        createdAt: feedback.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
        .from(feedback)
        .innerJoin(users, eq(feedback.userId, users.id))
        .where(where)
        .orderBy(desc(feedback.createdAt))
        .limit(200)
    );

    return NextResponse.json({ feedback: rows });
  } catch (error) {
    console.error('[feedback GET] Error:', error);
    return NextResponse.json({ error: 'Failed to load feedback' }, { status: 500 });
  }
}
