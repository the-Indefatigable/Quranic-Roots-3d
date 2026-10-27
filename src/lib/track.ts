'use client';

/**
 * First-party funnel tracking for the private /admin/growth dashboard.
 *
 * Each browser gets a random visitor id (localStorage). The first time we see a visitor we
 * remember where they came from: ?src= / ?utm_source= on the link, else the referrer's site.
 * ?utm_campaign= and ?utm_content= (or ?c= and ?v=) name the reel and its A/B version.
 * Nothing else about the visitor is collected. Tracking never throws and never blocks the UI.
 */

export type GrowthEvent = 'visit' | 'path_view' | 'day_open' | 'day_complete' | 'share' | 'checkout_start';
export type Touch = { vid: string; source: string; campaign?: string; variant?: string };

const VID = 'qr:vid';
const TOUCH = 'qr:touch';

const REFERRERS: [RegExp, string][] = [
  [/instagram\./, 'instagram'], [/tiktok\./, 'tiktok'], [/youtube\.|youtu\.be/, 'youtube'],
  [/facebook\.|fb\.me/, 'facebook'], [/whatsapp\.|wa\.me/, 'whatsapp'], [/(^|\.)t\.co$|twitter\.|x\.com/, 'x'],
  [/threads\.net/, 'threads'], [/linkedin\./, 'linkedin'], [/reddit\./, 'reddit'],
  [/google\./, 'google'], [/bing\./, 'bing'], [/duckduckgo\./, 'duckduckgo'],
  [/chatgpt\.com|openai\.com/, 'chatgpt'], [/perplexity\./, 'perplexity'],
];
const SHORT: Record<string, string> = { ig: 'instagram', tt: 'tiktok', yt: 'youtube', fb: 'facebook', wa: 'whatsapp' };

const clean = (v: string | null | undefined) => (v ? v.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40) : undefined) || undefined;

function sourceFromReferrer(): string {
  try {
    const host = new URL(document.referrer).hostname;
    if (!host || host === location.hostname) return 'direct';
    return REFERRERS.find(([re]) => re.test(host))?.[1] ?? host.replace(/^www\./, '').slice(0, 40);
  } catch {
    return 'direct';
  }
}

/** The visitor id and first-touch attribution, created on first call. */
export function touch(): Touch | null {
  try {
    let vid = localStorage.getItem(VID);
    if (!vid) { vid = crypto.randomUUID(); localStorage.setItem(VID, vid); }
    const saved = localStorage.getItem(TOUCH);
    if (saved) return { vid, ...JSON.parse(saved) };
    const q = new URLSearchParams(location.search);
    const raw = clean(q.get('src') || q.get('utm_source'));
    const t = { source: (raw && SHORT[raw]) || raw || sourceFromReferrer(), campaign: clean(q.get('c') || q.get('utm_campaign')), variant: clean(q.get('v') || q.get('utm_content')) };
    localStorage.setItem(TOUCH, JSON.stringify(t));
    return { vid, ...t };
  } catch {
    return null;
  }
}

export function track(name: GrowthEvent, extra: { day?: number } = {}) {
  const t = touch();
  if (!t) return;
  const body = JSON.stringify({ name, ...t, ...extra, path: location.pathname });
  try {
    if (navigator.sendBeacon?.('/api/track', new Blob([body], { type: 'application/json' }))) return;
  } catch { /* fall through */ }
  fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
}
