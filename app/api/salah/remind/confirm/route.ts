import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { users } from '@/db/schema';
import { recordConsent, SITE } from '@/lib/email';
import { sign, unsign, LEARNER_COOKIE, LEARNER_MAX_AGE } from '@/lib/signed';

export const dynamic = 'force-dynamic';

const WEEK = 7 * 24 * 60 * 60 * 1000;

// GET ?t=…: the button in the confirmation email. Turns reminders (and the Friday email, if they
// ticked it) on, records the consent, and opens their salah path.
export async function GET(request: NextRequest) {
  const raw = unsign('remind-confirm', request.nextUrl.searchParams.get('t'));
  const [userId, weekly, day, at] = raw?.split('|') ?? [];
  if (!userId || Date.now() - Number(at) > WEEK) return NextResponse.redirect(`${SITE}/salah?reminders=expired`);

  const updated = await db.update(users)
    .set({ remindersOptIn: true, ...(weekly === '1' ? { digestOptIn: true } : {}), updatedAt: new Date() })
    .where(eq(users.id, userId)).returning({ id: users.id });
  if (!updated.length) return NextResponse.redirect(`${SITE}/salah?reminders=expired`);

  const source = `email-confirmation (asked on salah day ${day})`;
  await recordConsent(userId, 'reminders', true, source);
  if (weekly === '1') await recordConsent(userId, 'weekly', true, source);

  const res = NextResponse.redirect(`${SITE}/salah?reminders=on`);
  res.cookies.set(LEARNER_COOKIE, sign('learner', userId), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: LEARNER_MAX_AGE });
  return res;
}
