export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, dbQuery } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { recordConsent, type MailList } from '@/lib/email';

const LISTS = { weekly: 'the Friday email', reminders: 'lesson reminders', all: 'QuRoots emails' } as const;
type List = keyof typeof LISTS;

// One-click unsubscribe from email links, no login needed. ?list=weekly|reminders|all (default all).
// Gmail and Yahoo send a POST for their own unsubscribe button (List-Unsubscribe-Post).
export async function POST(req: NextRequest) {
  const res = await GET(req);
  return new NextResponse(null, { status: res.status === 200 ? 200 : res.status });
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token') ?? '';
  const asked = req.nextUrl.searchParams.get('list') ?? 'all';
  const list: List = asked in LISTS ? (asked as List) : 'all';
  const page = (title: string, body: string) =>
    new NextResponse(
      `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;background:#111110;color:#F0E4CA;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center">
<div style="max-width:420px;padding:32px">
<div style="font-size:40px;margin-bottom:16px">🌿</div>
<h1 style="font-size:22px;margin:0 0 12px">${title}</h1>
<p style="color:#8A8783;font-size:15px;line-height:1.6">${body}</p>
<a href="https://www.quroots.com" style="display:inline-block;margin-top:20px;color:#D4A246;font-size:14px">← Back to QuRoots</a>
</div></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );

  try {
    if (!z.string().uuid().safeParse(token).success) {
      return page('Invalid link', 'This unsubscribe link is not valid. If you keep receiving emails, reply to one and we will remove you manually.');
    }

    const updated = await dbQuery(() =>
      db.update(users)
        .set({
          ...(list !== 'reminders' ? { digestOptIn: false } : {}),
          ...(list !== 'weekly' ? { remindersOptIn: false } : {}),
          updatedAt: new Date(),
        })
        .where(eq(users.unsubscribeToken, token))
        .returning({ id: users.id })
    );
    if (updated[0]) {
      const kinds: MailList[] = list === 'all' ? ['weekly', 'reminders'] : [list];
      for (const k of kinds) await recordConsent(updated[0].id, k, false, 'email-unsubscribe-link', 'Unsubscribed with the link in an email.');
    }

    if (!updated.length) {
      return page('Invalid link', 'This unsubscribe link is not valid. If you keep receiving emails, reply to one and we will remove you manually.');
    }

    return page('You are unsubscribed', `You won't get ${LISTS[list]} any more. You can turn them back on any time from your dashboard on QuRoots.`);
  } catch (error) {
    console.error('[digest/unsubscribe] Error:', error);
    return page('Something went wrong', 'Please try the link again in a moment.');
  }
}
