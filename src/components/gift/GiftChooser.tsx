'use client';

import { useState } from 'react';
import { touch, track } from '@/lib/track';

const GOLD = '#D4A246', IVORY = '#F0E8D8', SOFT = '#B5B2AC', QUIET = '#8F8C86';

async function checkout(kind: 'gift' | 'sponsor', extra: { from?: string; message?: string }) {
  track('checkout_start');
  const r = await fetch('/api/checkout/salah', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...(touch() ?? {}), kind, returnTo: '/gift', ...extra }) }).catch(() => null);
  const d = r ? await r.json().catch(() => ({})) : {};
  if (r?.ok && d.url) { window.location.href = d.url; return null; }
  return d.error || 'Could not open checkout. Please try again.';
}

/** /gift: give the salah path to someone you love, or pay for a free place for someone who can't. */
export function GiftChooser() {
  const [from, setFrom] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState<null | 'gift' | 'sponsor'>(null);
  const [error, setError] = useState<string | null>(null);
  const go = async (kind: 'gift' | 'sponsor') => {
    setBusy(kind); setError(null);
    const e = await checkout(kind, kind === 'gift' ? { from, message } : {});
    if (e) { setError(e); setBusy(null); }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <p className="font-arabic text-3xl mb-3" style={{ color: GOLD }} dir="rtl" lang="ar">هَدِيَّة</p>
      <h1 className="font-heading leading-[1.06] mb-4" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.2rem)', color: IVORY }}>Give someone their salah.</h1>
      <p className="text-lg leading-relaxed mb-10 max-w-2xl" style={{ color: SOFT }}>
        Every word of Al-Fatiha and the short surahs they pray with, two or three roots a day, for 30 days. One payment of $29, and it&rsquo;s theirs for life.
      </p>

      <div className="grid md:grid-cols-2 gap-5">
        <section className="rounded-3xl p-6 flex flex-col" style={{ background: 'linear-gradient(180deg, rgba(212,162,70,.12), rgba(212,162,70,.03))', border: '1px solid rgba(212,162,70,.32)' }}>
          <h2 className="font-heading text-2xl mb-2" style={{ color: IVORY }}>For someone you love</h2>
          <p className="text-[15px] leading-relaxed mb-5" style={{ color: SOFT }}>A parent, a child, a friend who&rsquo;s just started praying. You get a personal link to send on WhatsApp or by text. They open it, and all 30 days are theirs.</p>
          <label className="text-[13px] mb-1" style={{ color: QUIET }} htmlFor="gift-from">From (optional)</label>
          <input id="gift-from" value={from} onChange={(e) => setFrom(e.target.value)} maxLength={60} placeholder="Your name"
            className="h-11 px-4 rounded-xl text-[15px] bg-white/[0.04] border border-white/10 focus:border-[rgba(212,162,70,0.5)] outline-none mb-3" style={{ color: '#EDEDEC' }} />
          <label className="text-[13px] mb-1" style={{ color: QUIET }} htmlFor="gift-msg">A short message (optional)</label>
          <textarea id="gift-msg" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={300} rows={3} placeholder="Ramadan Mubarak. I hope this brings you closer to every word you pray."
            className="px-4 py-3 rounded-xl text-[15px] bg-white/[0.04] border border-white/10 focus:border-[rgba(212,162,70,0.5)] outline-none mb-5 resize-none" style={{ color: '#EDEDEC' }} />
          <button onClick={() => go('gift')} disabled={!!busy} className="mt-auto w-full rounded-2xl font-semibold text-[17px] disabled:opacity-70"
            style={{ minHeight: 54, background: 'linear-gradient(180deg, #E2B65A, #C99A3C)', color: '#17120A' }}>{busy === 'gift' ? 'Opening secure checkout…' : 'Gift the path · $29'}</button>
        </section>

        <section className="rounded-3xl p-6 flex flex-col" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.1)' }}>
          <h2 className="font-heading text-2xl mb-2" style={{ color: IVORY }}>For someone who can&rsquo;t afford it</h2>
          <p className="text-[15px] leading-relaxed mb-5" style={{ color: SOFT }}>Pay for a free place. When someone writes to us saying they can&rsquo;t afford the path, your place becomes theirs. You won&rsquo;t know who they are, and they won&rsquo;t know you. Allah will.</p>
          <blockquote className="text-[15px] leading-relaxed italic mb-6 pl-4" style={{ color: '#D8D4CC', borderLeft: `2px solid ${GOLD}` }}>
            &ldquo;Whoever guides someone to goodness will have a reward like the one who does it.&rdquo;
            <span className="block not-italic text-[13px] mt-1" style={{ color: QUIET }}>The Prophet ﷺ · Sahih Muslim</span>
          </blockquote>
          <button onClick={() => go('sponsor')} disabled={!!busy} className="mt-auto w-full rounded-2xl font-semibold text-[17px] disabled:opacity-70"
            style={{ minHeight: 54, background: 'transparent', color: GOLD, border: `2px solid ${GOLD}` }}>{busy === 'sponsor' ? 'Opening secure checkout…' : 'Sponsor a place · $29'}</button>
        </section>
      </div>
      {error && <p className="mt-4 text-sm" role="alert" style={{ color: '#F87171' }}>{error}</p>}
      <p className="mt-6 text-[13px]" style={{ color: QUIET }}>Secure checkout by Stripe · Apple Pay, Google Pay or card · no account needed. An unused gift can be refunded within 14 days.</p>
    </div>
  );
}
