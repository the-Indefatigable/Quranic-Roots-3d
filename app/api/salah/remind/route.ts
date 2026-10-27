import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users, growthEvents } from '@/db/schema';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';
import { recordConsent, sendMail, SITE } from '@/lib/email';
import { confirmReminders } from '@/lib/emails';
import { PATH } from '@/lib/salahPath';
import { sign, unsign, LEARNER_COOKIE, LEARNER_MAX_AGE } from '@/lib/signed';

export const dynamic = 'force-dynamic';

/** Who this browser is: the signed-in account, or the account it asked for reminders with. */
async function learnerId(): Promise<string | null> {
  const session = await auth().catch(() => null);
  return session?.user?.id ?? unsign('learner', cookies().get(LEARNER_COOKIE)?.value);
}

// GET: are reminders on for this browser?
export async function GET() {
  const id = await learnerId();
  if (!id) return NextResponse.json({ known: false, on: false });
  const [u] = await db.select({ on: users.remindersOptIn }).from(users).where(eq(users.id, id)).limit(1);
  return NextResponse.json({ known: !!u, on: !!u?.on });
}

const Body = z.object({
  email: z.string().email().max(200).optional(),
  weekly: z.boolean().default(false),
  day: z.number().int().min(1).max(30),
  done: z.array(z.number().int().min(1).max(30)).max(30).default([]),
  vid: z.string().regex(/^[0-9a-f-]{36}$/).optional(),
});

/**
 * POST: ask for lesson reminders at the end of a lesson. Signed in, they start at once. Otherwise
 * the account for that email is found or created, this browser's progress is saved to it, and a
 * confirmation email is sent; nothing else goes out until they tap it (double opt-in).
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(clientKey(request, 'salah-remind'), 5, 60_000);
  if (!limited.ok) return tooManyRequests(limited);
  const parsed = Body.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  const { email, weekly, day, done, vid } = parsed.data;
  const source = `salah-day-${day}`;

  const session = await auth().catch(() => null);
  let userId = session?.user?.id ?? null;

  if (!userId) {
    if (!email) return NextResponse.json({ error: 'Please enter your email.' }, { status: 400 });
    const address = email.trim().toLowerCase();
    const [found] = await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${address}`).limit(1);
    userId = found?.id ?? (await db.insert(users).values({ email: address }).onConflictDoNothing().returning({ id: users.id }))[0]?.id
      ?? (await db.select({ id: users.id }).from(users).where(sql`lower(${users.email}) = ${address}`).limit(1))[0]?.id ?? null;
    if (!userId) return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }

  // Save this browser's progress to the account, so reminders know the next day.
  const days = [...new Set([...done, day])].filter((d) => d >= 1 && d <= 30);
  if (days.length) {
    await db.insert(growthEvents).values(days.map((d) => ({ name: 'day_complete', visitorId: vid ?? `user:${userId}`, userId, day: d, path: '/salah' })))
      .catch((err) => console.warn('[remind] progress not saved:', (err as Error).message));
  }

  const [u] = await db.select({ token: users.unsubscribeToken, on: users.remindersOptIn }).from(users).where(eq(users.id, userId)).limit(1);
  const res = (body: object) => {
    const r = NextResponse.json(body);
    if (!session?.user?.id) r.cookies.set(LEARNER_COOKIE, sign('learner', userId!), { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: LEARNER_MAX_AGE });
    return r;
  };

  if (session?.user?.id) {
    await db.update(users).set({ remindersOptIn: true, ...(weekly ? { digestOptIn: true } : {}), updatedAt: new Date() }).where(eq(users.id, userId));
    await recordConsent(userId, 'reminders', true, source);
    if (weekly) await recordConsent(userId, 'weekly', true, source);
    return res({ status: 'on' });
  }
  if (u?.on) return res({ status: 'on' });

  const last = Math.max(...days);
  const pct = PATH.days.find((d) => d.day === last)?.pctSalah ?? 0;
  const next = PATH.days.find((d) => d.day === last + 1) ?? null;
  const token = sign('remind-confirm', `${userId}|${weekly ? 1 : 0}|${day}|${Date.now()}`);
  const mail = confirmReminders({ day: last, pct, nextTitle: next?.title ?? null, confirmUrl: `${SITE}/api/salah/remind/confirm?t=${encodeURIComponent(token)}`, token: u!.token });
  const sent = await sendMail({ to: email!.trim().toLowerCase(), subject: mail.subject, html: mail.html, token: u!.token, list: 'reminders' });
  if (!sent.ok) console.warn('[remind] confirmation not sent:', sent.error);
  return res({ status: sent.ok ? 'confirm' : 'error', ...(sent.ok ? {} : { error: 'We could not send the email. Please try again later.' }) });
}
