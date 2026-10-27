export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db, dbQuery } from '@/db';
import { users } from '@/db/schema';
import { sendMail } from '@/lib/email';
import { dayReminder, pathOfferReminder, streakReminder } from '@/lib/emails';
import { PATH, PATH_ORDER_PREFIX, PATH_PRICE_CENTS, pathProgressByUser, previewLine } from '@/lib/salahPath';

const DAY = 24 * 60 * 60 * 1000;

// GET /api/cron/daily-reminder: at most one email a day, only to people who said yes to lesson
// reminders (reminders_opt_in). Salah path learners who paused for a day or two get their next
// day, or the offer if the next day is paid; course learners get a streak reminder. Nobody is
// emailed after three quiet days. ?dryRun=1 returns who would get what, sending nothing.
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dryRun = req.nextUrl.searchParams.get('dryRun') === '1';

    const [people, progress] = await Promise.all([
      dbQuery(() => db.execute(sql`
        SELECT u.id, u.email, u.name, u.unsubscribe_token AS token, u.supporter_order_id AS "order",
               s.current_streak AS streak, s.last_active_date AS last_active
        FROM users u LEFT JOIN user_streaks s ON s.user_id = u.id
        WHERE u.reminders_opt_in = true`)) as Promise<any[]>,
      pathProgressByUser(),
    ]);

    const now = Date.now(), yesterday = new Date(now - DAY).toISOString().slice(0, 10);
    const emails: { to: string; token: string; kind: string; subject: string; html: string }[] = [];
    for (const u of people) {
      const firstName = (u.name ?? 'friend').split(' ')[0];
      const paid = !!u.order?.startsWith(PATH_ORDER_PREFIX);
      const pr = progress.get(u.id);
      const quietDays = pr ? Math.floor((now - pr.lastAt.getTime()) / DAY) : null;
      if (pr && pr.day < 30 && quietDays !== null && quietDays >= 1 && quietDays <= 2) {
        const pctNow = PATH.days.find((d) => d.day === pr.day)?.pctSalah ?? 0;
        const next = PATH.days.find((d) => d.day === pr.day + 1)!;
        const e = !next.free && !paid
          ? pathOfferReminder({ firstName, pctNow, priceCents: PATH_PRICE_CENTS, token: u.token, finishedFatiha: pr.day >= 7 })
          : dayReminder({ firstName, day: next.day, title: next.title, pctNow, line: previewLine(next.day), token: u.token });
        emails.push({ to: u.email, token: u.token, kind: !next.free && !paid ? 'offer' : 'day', ...e });
      } else if (!pr && u.streak > 0 && String(u.last_active).slice(0, 10) === yesterday) {
        emails.push({ to: u.email, token: u.token, kind: 'streak', ...streakReminder({ firstName, streak: u.streak, token: u.token }) });
      }
    }

    if (dryRun) return NextResponse.json({ dryRun: true, wouldSend: emails.map((e) => ({ to: e.to, kind: e.kind, subject: e.subject })), sampleHtml: emails[0]?.html ?? null });

    let sent = 0;
    const errors: string[] = [];
    for (const e of emails) {
      const r = await sendMail({ to: e.to, subject: e.subject, html: e.html, token: e.token, list: 'reminders' });
      if (r.ok) sent++; else errors.push(`${e.to}: ${r.error}`);
      await new Promise((res) => setTimeout(res, 600));
    }
    console.log(`[daily-reminder] sent=${sent}/${emails.length}`, errors.length ? errors : '');
    return NextResponse.json({ sent, total: emails.length, errors });
  } catch (error) {
    console.error('[daily-reminder] Error:', error);
    return NextResponse.json({ error: 'Daily reminder run failed' }, { status: 500 });
  }
}
