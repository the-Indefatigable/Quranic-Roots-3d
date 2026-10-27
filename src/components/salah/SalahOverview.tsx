'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalahProgress, startPathCheckout, type Overview } from './useSalahProgress';
import { track } from '@/lib/track';

const GOLD = '#D4A246';

export function SalahOverview() {
  const { login } = useAuthStore();
  const { done } = useSalahProgress();
  const params = useSearchParams();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { track('path_view'); }, []);

  useEffect(() => {
    fetch('/api/salah').then((r) => r.json()).then(setData).catch(() => setError('Could not load the path. Please refresh.'));
  }, [params]);

  const last = done.length ? Math.max(...done) : 0;
  const pct = data && last ? data.days.find((d) => d.day === last)?.pctSalah ?? 0 : 0;
  const next = data?.days.find((d) => !done.includes(d.day));
  const price = data ? `$${(data.priceCents / 100).toFixed(0)}` : '';

  const buy = async () => {
    if (!data) return;
    setBusy(true);
    const err = await startPathCheckout(login, data.signedIn);
    if (err) setError(err);
    setBusy(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      {params.get('purchase') === 'success' && (
        <div className="mb-8 p-4 rounded-xl border" style={{ borderColor: 'rgba(16,185,129,.35)', background: 'rgba(16,185,129,.08)' }}>
          JazakAllahu khayran. The full path is unlocked; it can take a few seconds to show.
        </div>
      )}

      <p className="font-arabic text-3xl mb-3" style={{ color: GOLD }} dir="rtl" lang="ar">إِيَّاكَ نَعْبُدُ</p>
      <h1 className="font-heading leading-[1.06] mb-5" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', color: '#F0E8D8' }}>
        Understand every word of your salah.
      </h1>
      <p className="text-lg leading-relaxed mb-2" style={{ color: '#B5B2AC' }}>
        Al-Fatiha and the short surahs you pray with use {data?.totals.roots ?? 85} roots. Learn two or three a day,
        and in 30 days you will understand what you say five times a day.
      </p>
      <p className="text-sm mb-10" style={{ color: '#9A9893' }}>Ten minutes a day. The first week, all of Al-Fatiha, is free.</p>

      {/* progress */}
      <div className="rounded-2xl p-6 mb-10" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,162,70,.18)' }}>
        <div className="flex items-end justify-between gap-4 mb-3">
          <div>
            <p className="text-sm" style={{ color: '#9A9893' }}>Root words of your salah you understand</p>
            <p className="font-heading text-5xl" style={{ color: '#F0E8D8' }}>{pct}%</p>
          </div>
          {next && (
            <Link href={`/salah/${next.day}`} className="btn-primary whitespace-nowrap">
              {done.length ? `Continue: day ${next.day}` : 'Start day 1'}
            </Link>
          )}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, #C89535, ${GOLD})` }} />
        </div>
      </div>

      {error && <p className="mb-6 text-sm" style={{ color: '#F87171' }}>{error}</p>}

      {/* the 30 days */}
      <ol className="relative">
        {(data?.days ?? []).map((d) => {
          const isDone = done.includes(d.day), milestone = d.day === 7 || d.day === 30;
          const row = (
            <div className="flex items-center gap-4 py-3.5 px-3 rounded-xl transition-colors hover:bg-white/[0.03]">
              <span className="w-9 h-9 shrink-0 rounded-full grid place-items-center text-sm font-semibold"
                style={{ background: isDone ? GOLD : milestone ? 'rgba(212,162,70,.14)' : 'rgba(255,255,255,.05)', color: isDone ? '#0E0D0C' : milestone ? GOLD : '#A09F9B' }}>
                {isDone ? '✓' : d.day}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block truncate" style={{ color: d.locked ? '#77736D' : '#EDEDEC' }}>{d.title}</span>
                <span className="block text-xs" style={{ color: '#6E6B66' }}>
                  {d.rootCount ? `${d.rootCount} roots · ` : ''}{d.lineCount ? `${d.lineCount} lines unlocked · ` : ''}{d.pctSalah}% after this day
                </span>
              </span>
              {d.locked && <span className="text-xs px-2.5 py-1 rounded-full" style={{ color: GOLD, background: 'rgba(212,162,70,.1)' }}>Full path</span>}
            </div>
          );
          return (
            <li key={d.day}>
              {d.day === 8 && data && !data.access && (
                <div className="my-6 rounded-2xl p-6 text-center" style={{ background: 'linear-gradient(180deg, rgba(212,162,70,.10), rgba(212,162,70,.03))', border: '1px solid rgba(212,162,70,.3)' }}>
                  <p className="font-heading text-2xl mb-2" style={{ color: '#F0E8D8' }}>Unlock the rest of your salah</p>
                  <p className="text-sm mb-5 max-w-md mx-auto" style={{ color: '#A09F9B' }}>
                    Days 8 to 30: Al-Ikhlas, Al-Falaq, An-Nas, Al-Asr and the other short surahs, {(data.totals.roots - 14)} more roots.
                    Founding price {price}, once, yours for life.
                  </p>
                  <button onClick={buy} disabled={busy || !data.checkoutEnabled} className="btn-primary">
                    {!data.checkoutEnabled ? 'Coming soon' : busy ? 'Opening checkout…' : data.signedIn ? `Unlock for ${price}` : 'Sign in to unlock'}
                  </button>
                </div>
              )}
              {d.locked ? row : <Link href={`/salah/${d.day}`}>{row}</Link>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
