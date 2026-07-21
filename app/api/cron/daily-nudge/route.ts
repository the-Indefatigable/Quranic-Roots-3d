export const dynamic = 'force-dynamic';
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { db, dbQuery } from '@/db';

const SITE = 'https://www.quroots.com';

function renderEmail(opts: { firstName: string; streak: number; unsubscribeUrl: string }): string {
  const { firstName, streak, unsubscribeUrl } = opts;
  const gold = '#D4A246';
  return `<!doctype html><html><body style="margin:0;padding:0;background:#0E0D0C">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0E0D0C;padding:32px 0">
      <tr><td align="center">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#141311;border:1px solid rgba(212,162,70,0.15);border-radius:16px;overflow:hidden">
          <tr><td style="padding:36px 32px 8px">
            <p style="margin:0;font-size:44px">🔥</p>
            <h1 style="margin:12px 0 4px;font-size:22px;color:#F0E4CA;font-family:Georgia,serif">Keep your ${streak}-day streak alive, ${firstName}</h1>
            <p style="margin:8px 0 0;font-size:15px;line-height:1.6;color:#B7B2A8">You haven't studied today yet. Just one quick lesson — or your Daily Ayah — keeps your streak going. Small and steady is how the Quran is learned.</p>
          </td></tr>
          <tr><td style="padding:20px 32px 8px">
            <a href="${SITE}/daily" style="display:inline-block;background:${gold};color:#1a1206;font-weight:bold;font-size:15px;text-decoration:none;padding:12px 24px;border-radius:12px">Keep my streak →</a>
          </td></tr>
          <tr><td style="padding:24px 32px 28px">
            <p style="margin:0;font-size:12px;color:#6B675F">You're receiving this because you opted into QuRoots reminders. <a href="${unsubscribeUrl}" style="color:#8A8783">Unsubscribe</a>.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

// Daily streak-saver nudge. Protected by CRON_SECRET (Vercel sends it as a
// Bearer token). Emails ONLY opted-in users whose streak is at risk *today*
// (active yesterday, nothing yet today) — low volume, high relevance, consented.
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Dry-run: ?dryRun=1 returns exactly who WOULD be emailed + a sample render,
    // without sending anything. A safety valve for previewing the cron.
    const dryRun = req.nextUrl.searchParams.get('dryRun') === '1';

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.DIGEST_FROM || 'QuRoots <digest@quroots.com>';
    if (!apiKey && !dryRun) {
      return NextResponse.json({ skipped: true, reason: 'RESEND_API_KEY not configured' });
    }

    // Opted-in, has a live streak, was active YESTERDAY but not today.
    const targets = (await dbQuery(() =>
      db.execute(sql`
        SELECT u.email, u.name, u.unsubscribe_token AS token, s.current_streak AS streak
        FROM users u
        JOIN user_streaks s ON s.user_id = u.id
        WHERE u.digest_opt_in = true
          AND s.current_streak >= 1
          AND s.last_active_date = CURRENT_DATE - 1
      `)
    )) as any[];

    if (dryRun) {
      return NextResponse.json({
        dryRun: true,
        wouldSend: targets.length,
        recipients: targets.map((t) => ({ email: t.email, streak: t.streak })),
        sampleHtml: renderEmail({
          firstName: (targets[0]?.name ?? 'Aisha').split(' ')[0],
          streak: targets[0]?.streak ?? 5,
          unsubscribeUrl: `${SITE}/api/digest/unsubscribe?token=…`,
        }),
        resendConfigured: !!apiKey,
      });
    }

    if (targets.length === 0) return NextResponse.json({ sent: 0, reason: 'no at-risk streaks' });

    let sent = 0;
    const errors: string[] = [];
    for (const t of targets) {
      const html = renderEmail({
        firstName: (t.name ?? 'friend').split(' ')[0],
        streak: t.streak,
        unsubscribeUrl: `${SITE}/api/digest/unsubscribe?token=${t.token}`,
      });
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from,
          to: [t.email],
          subject: `🔥 Don't lose your ${t.streak}-day streak`,
          html,
        }),
      });
      if (res.ok) sent++;
      else errors.push(`${t.email}: ${res.status}`);
      await new Promise((r) => setTimeout(r, 600)); // Resend rate limit
    }

    console.log(`[daily-nudge] sent=${sent}/${targets.length}`, errors.length ? errors : '');
    return NextResponse.json({ sent, total: targets.length, errors });
  } catch (error) {
    console.error('[daily-nudge] Error:', error);
    return NextResponse.json({ error: 'Daily nudge run failed' }, { status: 500 });
  }
}
