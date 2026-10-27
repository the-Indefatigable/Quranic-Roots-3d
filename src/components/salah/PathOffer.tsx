'use client';

import { useState } from 'react';
import { startPathCheckout } from './useSalahProgress';

const GOLD = '#D4A246';
const IVORY = '#F0E8D8';
const SOFT = '#B5B2AC';
const QUIET = '#8F8C86';

export type Offer = { priceCents: number; paidDays: number; paidRoots: number; paidSurahs: string[]; freePct: number };

// The first line taught after the free week, shown as a taste of what the paid days open.
const SAMPLE = [
  { ar: 'قُلْ', en: 'Say' }, { ar: 'هُوَ', en: 'He' }, { ar: 'ٱللَّهُ', en: 'is Allah' }, { ar: 'أَحَدٌ', en: 'the One' },
];

/**
 * The one offer for the paid part of the salah path. Every element points at a single action:
 * what you'll understand, a real sample, the price stated once, the refund, and a way in for
 * anyone who can't pay. "peak" follows the end of the free week; "locked" is a paid day opened
 * without access; "path" sits in the 30-day list.
 */
export function PathOffer({ offer, variant, pct, returnTo = '/salah', day }: { offer: Offer; variant: 'peak' | 'locked' | 'path'; pct?: number; returnTo?: string; day?: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const price = `$${Math.round(offer.priceCents / 100)}`;
  const from = pct ?? offer.freePct;
  const surahs = offer.paidSurahs;
  const named = `${surahs.slice(0, 4).join(', ')} and ${surahs.length - 4} more short surahs`;

  const buy = async () => {
    setBusy(true); setError(null);
    const err = await startPathCheckout(returnTo);
    if (err) { setError(err); setBusy(false); }
  };

  const headline = variant === 'peak'
    ? 'Now understand the rest of your salah.'
    : variant === 'locked' ? 'Understand the rest of your salah.' : 'Keep going after Al-Fatiha.';
  const cta = variant === 'peak' ? `Continue to day 8 · ${price}` : `Unlock days 8 to 30 · ${price}`;

  return (
    <section aria-label="The full salah path" className="rounded-3xl p-6 sm:p-8 text-left"
      style={{ background: 'linear-gradient(180deg, rgba(212,162,70,.12), rgba(212,162,70,.03) 55%, rgba(255,255,255,.015))', border: '1px solid rgba(212,162,70,.32)' }}>
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] mb-3" style={{ color: GOLD }}>The full path · days 8 to 30</p>
      <h2 className="font-heading leading-[1.1] mb-3" style={{ color: IVORY, fontSize: 'clamp(1.7rem, 4.6vw, 2.3rem)' }}>{headline}</h2>
      <p className="text-[16px] leading-relaxed mb-6" style={{ color: SOFT }}>
        {offer.paidDays} more days take you from <b style={{ color: IVORY }}>{from}%</b> to <b style={{ color: IVORY }}>100%</b> of the root words you say in prayer: {named}, two or three roots a day.
      </p>

      <div className="rounded-2xl px-5 py-4 mb-6" style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(255,255,255,.07)' }}>
        <p className="text-[12px] mb-3" style={{ color: QUIET }}>Day 8 opens with Al-Ikhlas</p>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2" dir="rtl">
          {SAMPLE.map((w) => (
            <span key={w.ar} className="flex flex-col items-center">
              <span className="font-arabic text-[28px] leading-snug" lang="ar" style={{ color: GOLD }}>{w.ar}</span>
              <span className="text-[12px]" dir="ltr" style={{ color: SOFT }}>{w.en}</span>
            </span>
          ))}
        </div>
      </div>

      <ul className="grid gap-2.5 mb-7 text-[15px]" style={{ color: '#E2DED6' }}>
        {[
          `Every line of ${surahs.length} short surahs you pray with, word by word`,
          `${offer.paidRoots} more roots, each shown in the words of your prayer`,
          'A few minutes a day, at your own pace',
          'One payment. No subscription. Yours for life.',
        ].map((t) => (
          <li key={t} className="flex gap-3">
            <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 20 20" fill="none" aria-hidden><path d="M4.5 10.5l3.5 3.5 7.5-8" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-heading text-[44px] leading-none" style={{ color: IVORY }}>{price}</span>
        <span className="text-[14px]" style={{ color: SOFT }}>USD, once</span>
      </div>

      <button onClick={buy} disabled={busy} className="w-full rounded-2xl font-semibold text-[17px] transition-transform active:scale-[0.99] disabled:opacity-70"
        style={{ minHeight: 56, background: 'linear-gradient(180deg, #E2B65A, #C99A3C)', color: '#17120A', boxShadow: '0 10px 30px rgba(212,162,70,.25)' }}>
        {busy ? 'Opening secure checkout…' : cta}
      </button>
      {error && <p className="mt-3 text-sm" role="alert" style={{ color: '#F87171' }}>{error}</p>}
      <p className="mt-3 text-[13px] text-center" style={{ color: QUIET }}>Secure checkout by Stripe · Apple Pay, Google Pay or card · no account needed</p>

      <div className="mt-6 flex gap-3 rounded-2xl px-4 py-3.5" style={{ background: 'rgba(16,185,129,.07)', border: '1px solid rgba(16,185,129,.22)' }}>
        <svg className="w-5 h-5 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6l7-3z" stroke="#34D399" strokeWidth="1.6" strokeLinejoin="round" /><path d="M8.5 12.2l2.4 2.3 4.6-4.8" stroke="#34D399" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <p className="text-[14px] leading-relaxed" style={{ color: '#CFE9DD' }}><b>14-day full refund.</b> If it isn&rsquo;t for you, email us within 14 days and you get every cent back.</p>
      </div>

      <p className="mt-5 text-[14px] leading-relaxed" style={{ color: SOFT }}>
        Can&rsquo;t afford it right now? Email <a href="mailto:salam@quroots.com?subject=A%20free%20place%20on%20the%20salah%20path" className="underline underline-offset-2" style={{ color: GOLD }}>salam@quroots.com</a> and we&rsquo;ll give you a place for free. No questions asked.
      </p>
      <p className="mt-4 pt-4 text-[13px] leading-relaxed" style={{ color: QUIET, borderTop: '1px solid rgba(255,255,255,.07)' }}>
        Built by Mohammad Alam, a Muslim software developer in Canada, so that every Muslim can understand what they say in salah.
      </p>
    </section>
  );
}
