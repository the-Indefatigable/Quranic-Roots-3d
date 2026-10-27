export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, dbQuery } from '@/db';
import { users } from '@/db/schema';
import { sendMail } from '@/lib/email';
import { WEEKLY_VERSES, weeklyEmail } from '@/lib/emails';
import { PATH, PATH_ORDER_PREFIX, pathProgressByUser } from '@/lib/salahPath';

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// GET /api/cron/weekly-digest: the Friday email, to people who said yes to it (digest_opt_in).
// One ayah and the root inside it, then where they are in the salah path. Vercel Cron sends
// Authorization: Bearer CRON_SECRET. ?dryRun=1 returns who would get it and a sample, sending nothing.
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dryRun = req.nextUrl.searchParams.get('dryRun') === '1';

    const [subscribers, progress] = await Promise.all([
      dbQuery(() => db.select({ id: users.id, email: users.email, name: users.name, token: users.unsubscribeToken, order: users.supporterOrderId })
        .from(users).where(eq(users.digestOptIn, true))),
      pathProgressByUser(),
    ]);
    const verse = WEEKLY_VERSES[isoWeek(new Date()) % WEEKLY_VERSES.length];

    const emails = subscribers.map((s) => {
      const pr = progress.get(s.id);
      const day = pr ? PATH.days.find((d) => d.day === pr.day) : undefined;
      const next = pr && pr.day < 30 ? PATH.days.find((d) => d.day === pr.day + 1) ?? null : null;
      return {
        to: s.email, token: s.token,
        ...weeklyEmail({
          firstName: (s.name ?? 'friend').split(' ')[0], verse, token: s.token,
          progress: day ? { day: day.day, title: day.title, pct: day.pctSalah, paid: !!s.order?.startsWith(PATH_ORDER_PREFIX) } : null,
          next: next ? { day: next.day, title: next.title } : null,
        }),
      };
    });

    if (dryRun) return NextResponse.json({ dryRun: true, wouldSend: emails.length, subject: verse.subject, sampleHtml: emails[0]?.html ?? null });

    let sent = 0;
    const errors: string[] = [];
    for (const e of emails) {
      const r = await sendMail({ to: e.to, subject: e.subject, html: e.html, token: e.token, list: 'weekly' });
      if (r.ok) sent++; else errors.push(`${e.to}: ${r.error}`);
      await new Promise((res) => setTimeout(res, 600)); // Resend allows 2 requests a second
    }
    console.log(`[weekly-digest] sent=${sent}/${emails.length}`, errors.length ? errors : '');
    return NextResponse.json({ sent, total: emails.length, errors });
  } catch (error) {
    console.error('[weekly-digest] Error:', error);
    return NextResponse.json({ error: 'Digest run failed' }, { status: 500 });
  }
}
