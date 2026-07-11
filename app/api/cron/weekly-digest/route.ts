export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { db, dbQuery } from '@/db';
import { users, learningLessons, chatMessages } from '@/db/schema';
import { eq, gte, isNull, and, sql } from 'drizzle-orm';

const SITE = 'https://www.quroots.com';

// Curated verse of the week — rotates by ISO week number.
const VERSES = [
  { ar: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', tr: 'And say: My Lord, increase me in knowledge.', ref: 'Ta-Ha 20:114' },
  { ar: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', tr: 'Indeed, with hardship comes ease.', ref: 'Ash-Sharh 94:5' },
  { ar: 'وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ', tr: 'And Allah knows, while you know not.', ref: 'Al-Baqarah 2:216' },
  { ar: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ', tr: 'Indeed, Allah is with the patient.', ref: 'Al-Baqarah 2:153' },
  { ar: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ', tr: 'And He is with you wherever you are.', ref: 'Al-Hadid 57:4' },
  { ar: 'فَاذْكُرُونِي أَذْكُرْكُمْ', tr: 'So remember Me; I will remember you.', ref: 'Al-Baqarah 2:152' },
  { ar: 'وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ', tr: 'And My mercy encompasses all things.', ref: 'Al-A’raf 7:156' },
  { ar: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ', tr: 'Truly, in the remembrance of Allah do hearts find rest.', ref: 'Ar-Ra’d 13:28' },
];

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

function renderEmail(opts: {
  firstName: string;
  verse: (typeof VERSES)[number];
  newLessons: { title: string }[];
  chatCount: number;
  unsubscribeUrl: string;
}) {
  const { firstName, verse, newLessons, chatCount, unsubscribeUrl } = opts;
  const gold = '#D4A246';
  const lessonsBlock = newLessons.length
    ? `<tr><td style="padding:0 32px 24px">
        <p style="margin:0 0 8px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:${gold};font-weight:bold">New this week</p>
        ${newLessons.map((l) => `<p style="margin:0 0 6px;font-size:15px;color:#F0E4CA">🌱 ${l.title}</p>`).join('')}
        <a href="${SITE}/learn/path" style="display:inline-block;margin-top:10px;color:${gold};font-size:14px">Continue your path →</a>
      </td></tr>`
    : `<tr><td style="padding:0 32px 24px">
        <a href="${SITE}/learn/path" style="display:inline-block;color:${gold};font-size:14px">Continue your learning path →</a>
      </td></tr>`;
  const chatBlock = chatCount > 0
    ? `<tr><td style="padding:0 32px 24px">
        <p style="margin:0;font-size:14px;color:#8A8783">💬 ${chatCount} message${chatCount === 1 ? '' : 's'} in the <a href="${SITE}/community" style="color:${gold}">Learners' Lounge</a> this week — come say salaam.</p>
      </td></tr>`
    : '';

  return `<!doctype html><html><body style="margin:0;padding:0;background:#0E0D0C">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0E0D0C;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#171614;border-radius:16px;overflow:hidden;font-family:Georgia,'Times New Roman',serif">
  <tr><td style="padding:28px 32px 8px">
    <span style="font-size:18px;color:#F0E4CA">Qu<span style="color:${gold}">Roots</span></span>
    <span style="float:right;font-size:12px;color:#57534E">Weekly Digest</span>
  </td></tr>
  <tr><td style="padding:16px 32px 8px">
    <p style="margin:0;font-size:15px;color:#F0E4CA">Salaam ${firstName},</p>
  </td></tr>
  <tr><td style="padding:16px 32px 24px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#111110;border:1px solid rgba(212,162,70,0.25);border-radius:12px">
      <tr><td style="padding:24px;text-align:center">
        <p style="margin:0 0 12px;font-size:26px;line-height:1.8;color:${gold}" dir="rtl">${verse.ar}</p>
        <p style="margin:0 0 6px;font-size:14px;font-style:italic;color:#F0E4CA">&ldquo;${verse.tr}&rdquo;</p>
        <p style="margin:0;font-size:12px;color:#57534E">${verse.ref}</p>
      </td></tr>
    </table>
  </td></tr>
  ${lessonsBlock}
  ${chatBlock}
  <tr><td style="padding:8px 32px 28px;border-top:1px solid rgba(255,255,255,0.06)">
    <p style="margin:16px 0 0;font-size:11px;color:#57534E">
      You're receiving this because you subscribed on QuRoots.
      <a href="${unsubscribeUrl}" style="color:#57534E;text-decoration:underline">Unsubscribe</a>
    </p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

// GET /api/cron/weekly-digest — invoked by Vercel Cron (Fridays).
// Protected: Vercel sends `Authorization: Bearer ${CRON_SECRET}` when the
// CRON_SECRET env var is set on the project.
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.DIGEST_FROM || 'QuRoots <digest@quroots.com>';
    if (!apiKey) {
      console.warn('[weekly-digest] RESEND_API_KEY not set — skipping send');
      return NextResponse.json({ skipped: true, reason: 'RESEND_API_KEY not configured' });
    }

    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [subscribers, newLessons, [chat]] = await Promise.all([
      dbQuery(() =>
        db.select({
          id: users.id,
          email: users.email,
          name: users.name,
          unsubscribeToken: users.unsubscribeToken,
        }).from(users).where(eq(users.digestOptIn, true))
      ),
      dbQuery(() =>
        db.select({ title: learningLessons.title })
          .from(learningLessons)
          .where(gte(learningLessons.createdAt, weekAgo))
          .limit(6)
      ),
      dbQuery(() =>
        db.select({ count: sql<number>`count(*)::int` })
          .from(chatMessages)
          .where(and(isNull(chatMessages.deletedAt), gte(chatMessages.createdAt, weekAgo)))
      ),
    ]);

    if (subscribers.length === 0) {
      return NextResponse.json({ sent: 0, reason: 'no subscribers' });
    }

    const verse = VERSES[isoWeek(new Date()) % VERSES.length];
    let sent = 0;
    const errors: string[] = [];

    for (const s of subscribers) {
      const html = renderEmail({
        firstName: (s.name ?? 'friend').split(' ')[0],
        verse,
        newLessons,
        chatCount: chat?.count ?? 0,
        unsubscribeUrl: `${SITE}/api/digest/unsubscribe?token=${s.unsubscribeToken}`,
      });

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [s.email],
          subject: `🌿 Your QuRoots week — ${verse.ref}`,
          html,
        }),
      });

      if (res.ok) sent++;
      else errors.push(`${s.email}: ${res.status} ${(await res.text()).slice(0, 120)}`);

      // Resend free tier: 2 req/s — stay well under
      await new Promise((r) => setTimeout(r, 600));
    }

    console.log(`[weekly-digest] sent=${sent}/${subscribers.length}`, errors.length ? errors : '');
    return NextResponse.json({ sent, total: subscribers.length, errors });
  } catch (error) {
    console.error('[weekly-digest] Error:', error);
    return NextResponse.json({ error: 'Digest run failed' }, { status: 500 });
  }
}
