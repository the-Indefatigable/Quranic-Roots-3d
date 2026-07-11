export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { db, dbQuery } from '@/db';
import { users, userStreaks } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

const SITE = 'https://www.quroots.com';

function renderEmail(firstName: string, streak: number, unsubscribeUrl: string) {
  const gold = '#D4A246';
  return `<!doctype html><html><body style="margin:0;padding:0;background:#0E0D0C">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0E0D0C;padding:24px 0">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#171614;border-radius:16px;font-family:Georgia,'Times New Roman',serif">
  <tr><td style="padding:28px 32px 4px">
    <span style="font-size:18px;color:#F0E4CA">Qu<span style="color:${gold}">Roots</span></span>
  </td></tr>
  <tr><td style="padding:20px 32px;text-align:center">
    <p style="margin:0 0 8px;font-size:44px">🔥</p>
    <p style="margin:0 0 10px;font-size:20px;color:#F0E4CA">Salaam ${firstName} — your ${streak}-day streak ends tonight</p>
    <p style="margin:0 0 22px;font-size:14px;color:#8A8783;line-height:1.6">One 3-minute lesson keeps it alive. The Prophet ﷺ said the most beloved deeds are the most consistent ones — even if small.</p>
    <a href="${SITE}/learn/path" style="display:inline-block;background:${gold};color:#1a1206;font-weight:bold;font-size:15px;padding:13px 34px;border-radius:14px;text-decoration:none">Save my streak</a>
  </td></tr>
  <tr><td style="padding:8px 32px 26px">
    <p style="margin:14px 0 0;font-size:11px;color:#57534E;border-top:1px solid rgba(255,255,255,0.06);padding-top:14px">
      Streak reminders go to weekly-digest subscribers.
      <a href="${unsubscribeUrl}" style="color:#57534E;text-decoration:underline">Unsubscribe</a>
    </p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

// GET /api/cron/streak-saver — daily via Vercel Cron.
// Emails digest-subscribed users whose streak was extended YESTERDAY but not
// yet today: their streak dies at midnight UTC unless they practice.
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.DIGEST_FROM || 'QuRoots <digest@quroots.com>';
    if (!apiKey) {
      return NextResponse.json({ skipped: true, reason: 'RESEND_API_KEY not configured' });
    }

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const atRisk = await dbQuery(() =>
      db.select({
        email: users.email,
        name: users.name,
        unsubscribeToken: users.unsubscribeToken,
        streak: userStreaks.currentStreak,
      })
        .from(userStreaks)
        .innerJoin(users, eq(userStreaks.userId, users.id))
        .where(and(
          eq(users.digestOptIn, true),
          gt(userStreaks.currentStreak, 0),
          eq(userStreaks.lastActiveDate, yesterday) // practiced yesterday, not yet today
        ))
    );

    let sent = 0;
    const errors: string[] = [];
    for (const u of atRisk) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [u.email],
          subject: `🔥 Your ${u.streak}-day streak ends tonight`,
          html: renderEmail(
            (u.name ?? 'friend').split(' ')[0],
            u.streak,
            `${SITE}/api/digest/unsubscribe?token=${u.unsubscribeToken}`
          ),
        }),
      });
      if (res.ok) sent++;
      else errors.push(`${u.email}: ${res.status}`);
      await new Promise((r) => setTimeout(r, 600));
    }

    console.log(`[streak-saver] at-risk=${atRisk.length} sent=${sent}`, errors.length ? errors : '');
    return NextResponse.json({ atRisk: atRisk.length, sent, errors });
  } catch (error) {
    console.error('[streak-saver] Error:', error);
    return NextResponse.json({ error: 'Streak saver failed' }, { status: 500 });
  }
}
