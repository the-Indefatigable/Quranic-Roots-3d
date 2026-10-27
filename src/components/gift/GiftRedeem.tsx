'use client';

import Link from 'next/link';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import type { GiftInfo } from '@/lib/gifts';

const GOLD = '#D4A246';

/** /gift/CODE: the person a gift was sent to accepts it with their email. */
export function GiftRedeem({ info }: { info: GiftInfo }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'ask' | 'busy' | 'done'>('ask');
  const [error, setError] = useState<string | null>(null);

  if (!info.usable) return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <h1 className="font-heading text-3xl mb-3" style={{ color: '#F0E8D8' }}>This gift has already been opened.</h1>
      <p className="mb-8" style={{ color: '#B5B2AC' }}>If it was yours, sign in with the email you used and it&rsquo;s there. If not, the first week is free for everyone.</p>
      <Link href="/salah" className="btn-primary inline-block px-8">Start day 1</Link>
    </div>
  );

  const accept = async (e: React.FormEvent) => {
    e.preventDefault(); setState('busy'); setError(null);
    const r = await fetch('/api/gift/redeem', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: info.code, email }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (!r?.ok) { setError(d.error || 'Something went wrong. Please try again.'); setState('ask'); return; }
    setState('done');
    signIn('resend', { email: d.email, redirect: false, callbackUrl: '/salah' }).catch(() => {});
  };

  const from = info.from.trim();
  return (
    <div className="max-w-xl mx-auto px-5 py-14 text-center">
      <p className="font-arabic text-4xl mb-4" style={{ color: GOLD }} dir="rtl" lang="ar">هَدِيَّة</p>
      {state === 'done' ? (
        <>
          <h1 className="font-heading text-4xl mb-3" style={{ color: '#F0E8D8' }}>It&rsquo;s yours.</h1>
          <p className="text-[16px] leading-relaxed mb-8" style={{ color: '#B5B2AC' }}>All 30 days are unlocked on this device. We&rsquo;ve emailed you a sign-in link so you can open them anywhere.</p>
          <Link href="/salah/1" className="btn-primary inline-block px-8">Start day 1</Link>
        </>
      ) : (
        <>
          <h1 className="font-heading text-4xl leading-tight mb-3" style={{ color: '#F0E8D8' }}>
            {info.kind === 'sponsor' ? 'Someone has paid for your place.' : from ? `${from} has given you a gift.` : 'You’ve been given a gift.'}
          </h1>
          {info.kind === 'gift' && info.message && (
            <blockquote className="text-[17px] leading-relaxed italic my-6 px-5 py-4 rounded-2xl" style={{ color: '#E2DED6', background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,162,70,.2)' }}>&ldquo;{info.message}&rdquo;</blockquote>
          )}
          <p className="text-[16px] leading-relaxed mb-8" style={{ color: '#B5B2AC' }}>
            A 30-day path to understanding every word of your salah: Al-Fatiha and the short surahs you pray with, two or three Arabic roots a day, a few minutes at a time.
            {info.kind === 'sponsor' && ' May Allah reward whoever gave it.'}
          </p>
          <form onSubmit={accept} className="flex gap-2 max-w-md mx-auto">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" aria-label="Your email" autoComplete="email"
              className="flex-1 min-w-0 h-12 px-4 rounded-xl text-[15px] bg-white/[0.04] border border-white/10 focus:border-[rgba(212,162,70,0.5)] outline-none" style={{ color: '#EDEDEC' }} />
            <button disabled={state === 'busy'} className="h-12 px-5 rounded-xl font-semibold whitespace-nowrap disabled:opacity-70" style={{ background: GOLD, color: '#17120A' }}>{state === 'busy' ? 'Opening…' : 'Accept the gift'}</button>
          </form>
          {error && <p className="mt-3 text-sm" role="alert" style={{ color: '#F87171' }}>{error}</p>}
          <p className="mt-4 text-[13px]" style={{ color: '#8F8C86' }}>Your email keeps the path on any device. We won&rsquo;t send anything else unless you ask.</p>
        </>
      )}
    </div>
  );
}
