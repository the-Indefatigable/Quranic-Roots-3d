'use client';

import { useEffect, useState } from 'react';
import { touch } from '@/lib/track';
import { useSalahProgress } from './useSalahProgress';

const GOLD = '#D4A246';
// Shown word for word: this is what email_consents records as the reminders consent.
const CONSENT = 'Lesson reminders: a short email on days your next salah lesson is waiting. Never more than one a day. Unsubscribe any time.';

/**
 * At the end of a lesson: "Want day N tomorrow?" One field, one button. Signed in, reminders
 * start at once; otherwise we send one confirmation email and nothing more until it's tapped.
 */
export function RemindCard({ day }: { day: number }) {
  const { done } = useSalahProgress();
  const [state, setState] = useState<'hidden' | 'ask' | 'sending' | 'confirm' | 'on' | 'error'>('hidden');
  const [email, setEmail] = useState('');
  const [weekly, setWeekly] = useState(false);
  const [error, setError] = useState('');
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    fetch('/api/salah/remind').then((r) => r.json()).then((d) => setState(d.on ? 'hidden' : 'ask')).catch(() => setState('ask'));
    fetch('/api/auth/session').then((r) => r.json()).then((s) => setSignedIn(!!s?.user)).catch(() => {});
  }, []);

  if (state === 'hidden') return null;
  const next = day + 1;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('sending'); setError('');
    const r = await fetch('/api/salah/remind', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: signedIn ? undefined : email, weekly, day, done, vid: touch()?.vid }) }).catch(() => null);
    const d = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok && (d.status === 'on' || d.status === 'confirm')) setState(d.status);
    else { setError(d.error || 'Something went wrong. Please try again.'); setState('ask'); }
  };

  if (state === 'on' || state === 'confirm') {
    return (
      <div className="mt-8 rounded-2xl px-5 py-4 text-left" style={{ background: 'rgba(16,185,129,.07)', border: '1px solid rgba(16,185,129,.22)' }}>
        <p className="text-[15px] leading-relaxed" style={{ color: '#CFE9DD' }}>
          {state === 'on' ? <>Done. We&rsquo;ll email you when day {next} is ready.</> : <><b>Check your inbox.</b> Tap the button in our email and day {next} comes to you.</>}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 rounded-2xl p-5 text-left" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,162,70,.25)' }}>
      <p className="font-heading text-[22px] leading-tight mb-1" style={{ color: '#F0E8D8' }}>Want day {next} tomorrow?</p>
      <p className="text-[15px] mb-4" style={{ color: '#B5B2AC' }}>We&rsquo;ll email you when it&rsquo;s ready, so you don&rsquo;t lose the thread.</p>
      <div className="flex gap-2">
        {!signedIn && (
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" autoComplete="email" aria-label="Your email"
            className="flex-1 min-w-0 h-12 px-4 rounded-xl text-[15px] bg-white/[0.04] border border-white/10 focus:border-[rgba(212,162,70,0.5)] outline-none" style={{ color: '#EDEDEC' }} />
        )}
        <button disabled={state === 'sending'} className="h-12 px-5 rounded-xl font-semibold text-[15px] whitespace-nowrap disabled:opacity-70" style={{ background: GOLD, color: '#17120A' }}>
          {state === 'sending' ? 'Sending…' : 'Remind me'}
        </button>
      </div>
      <label className="flex gap-2.5 items-start mt-4 text-[13px] leading-snug cursor-pointer" style={{ color: '#9A9893' }}>
        <input type="checkbox" checked={weekly} onChange={(e) => setWeekly(e.target.checked)} className="mt-0.5 accent-[#D4A246]" />
        <span>Also send me the Friday email: one ayah, the root inside it, and what&rsquo;s new. Once a week.</span>
      </label>
      {error && <p className="mt-3 text-sm" role="alert" style={{ color: '#F87171' }}>{error}</p>}
      <p className="mt-3 text-[12px] leading-relaxed" style={{ color: '#6E6B66' }}>{CONSENT}</p>
    </form>
  );
}
