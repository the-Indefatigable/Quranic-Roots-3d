import { db } from '@/db';
import { emailConsents } from '@/db/schema';

/**
 * Shared pieces for every QuRoots email: the layout, the footer the law asks for, and sending
 * through Resend with one-click unsubscribe headers.
 *
 * Two kinds of email need their own yes: 'weekly' (the Friday email) and 'reminders' (daily
 * lesson reminders). Sign-in links and receipts are part of the service and need none. Every
 * yes and no is written to email_consents with the words the person saw (recordConsent).
 */

export const SITE = 'https://quroots.com';
export type MailList = 'weekly' | 'reminders';

export const CONSENT_WORDING: Record<MailList, string> = {
  weekly: 'The Friday email: one ayah, the root inside it, and what is new on QuRoots. Once a week. Unsubscribe any time.',
  reminders: 'Lesson reminders: a short email on days your next salah lesson is waiting. Never more than one a day. Unsubscribe any time.',
};

const GOLD = '#D4A246';
const INK = '#F0E4CA';
const SOFT = '#B7B2A8';
const QUIET = '#7A766F';

export const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function unsubscribeUrl(token: string, list: MailList | 'all') {
  return `${SITE}/api/digest/unsubscribe?token=${encodeURIComponent(token)}&list=${list}`;
}

/** A gold button. Email clients ignore most CSS, so this is a plain styled link. */
export function button(href: string, label: string) {
  return `<a href="${href}" style="display:inline-block;background:${GOLD};color:#1a1206;font-weight:bold;font-size:16px;line-height:1;text-decoration:none;padding:16px 30px;border-radius:14px;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">${esc(label)}</a>`;
}

export function layout(opts: { preheader: string; body: string; list: MailList; token: string; credit?: string; reason?: string }) {
  const { preheader, body, list, token, credit, reason } = opts;
  const why = list === 'weekly' ? 'the Friday email' : 'lesson reminders';
  const address = process.env.MAIL_POSTAL_ADDRESS;
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="dark light"></head>
<body style="margin:0;padding:0;background:#0E0D0C">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#0E0D0C">${esc(preheader)}&#8199;&#847;&#8199;&#847;&#8199;&#847;&#8199;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0E0D0C;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#161512;border:1px solid rgba(212,162,70,0.16);border-radius:18px;font-family:Georgia,'Times New Roman',serif">
  <tr><td style="padding:26px 30px 0"><span style="font-size:17px;color:${INK}">Qu<span style="color:${GOLD}">Roots</span></span></td></tr>
  ${body}
  <tr><td style="padding:22px 30px 26px;border-top:1px solid rgba(255,255,255,0.06);font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif">
    <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:${QUIET}">${reason ?? `You&rsquo;re getting this because you said yes to ${why} on QuRoots.
      <a href="${unsubscribeUrl(token, list)}" style="color:${QUIET};text-decoration:underline">Stop ${why}</a> ·
      <a href="${unsubscribeUrl(token, 'all')}" style="color:${QUIET};text-decoration:underline">stop all QuRoots emails</a>`}</p>
    <p style="margin:0 0 8px;font-size:12px;line-height:1.6;color:${QUIET}">Meanings are simplified for learners and may contain errors. For religious guidance, ask a qualified scholar.${credit ? ` ${esc(credit)}` : ''}</p>
    <p style="margin:0;font-size:12px;line-height:1.6;color:${QUIET}">QuRoots${address ? ` · ${esc(address)}` : ''} · <a href="mailto:salam@quroots.com" style="color:${QUIET}">salam@quroots.com</a></p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

/** Paragraph helpers so the templates stay readable. */
export const p = (html: string, size = 16, color = SOFT) => `<p style="margin:0 0 14px;font-size:${size}px;line-height:1.65;color:${color}">${html}</p>`;
export const row = (inner: string, pad = '18px 30px 0') => `<tr><td style="padding:${pad}">${inner}</td></tr>`;
export const COLORS = { GOLD, INK, SOFT, QUIET };

export async function sendMail(opts: { to: string; subject: string; html: string; token: string; list: MailList }): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: 'RESEND_API_KEY not configured' };
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.DIGEST_FROM || 'QuRoots <digest@quroots.com>',
      reply_to: 'salam@quroots.com',
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
      headers: {
        // Gmail and Yahoo expect one-click unsubscribe from anyone sending regular email.
        'List-Unsubscribe': `<${unsubscribeUrl(opts.token, opts.list)}>, <mailto:salam@quroots.com?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
    }),
  });
  return res.ok ? { ok: true } : { ok: false, error: `${res.status} ${(await res.text()).slice(0, 120)}` };
}

export async function recordConsent(userId: string, kind: MailList, granted: boolean, source: string, wording = CONSENT_WORDING[kind]) {
  await db.insert(emailConsents).values({ userId, kind, granted, wording, source })
    .catch((err) => console.warn('[email] consent not recorded:', (err as Error).message));
}
