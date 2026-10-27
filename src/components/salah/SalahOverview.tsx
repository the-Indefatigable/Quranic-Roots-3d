'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSalahProgress, type Overview } from './useSalahProgress';
import { PathOffer } from './PathOffer';
import { track } from '@/lib/track';

const GOLD = '#D4A246';

export function SalahOverview() {
  const { done } = useSalahProgress();
  const params = useSearchParams();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { track('path_view'); }, []);

  useEffect(() => {
    fetch('/api/salah').then((r) => r.json()).then(setData).catch(() => setError('Could not load the path. Please refresh.'));
  }, [params]);

  const last = done.length ? Math.max(...done) : 0;
  const pct = data && last ? data.days.find((d) => d.day === last)?.pctSalah ?? 0 : 0;
  const next = data?.days.find((d) => !done.includes(d.day));
  const fresh = done.length === 0;

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      {params.get('purchase') === 'cancelled' && (
        <div className="mb-8 p-4 rounded-xl border text-[15px]" style={{ borderColor: 'rgba(255,255,255,.12)', background: 'rgba(255,255,255,.03)', color: '#B5B2AC' }}>
          No payment was taken. Your free days are all still here.
        </div>
      )}

      <p className="font-arabic text-3xl mb-3" style={{ color: GOLD }} dir="rtl" lang="ar">إِيَّاكَ نَعْبُدُ</p>
      <h1 className="font-heading leading-[1.06] mb-5" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', color: '#F0E8D8' }}>
        Understand every word of your salah.
      </h1>
      <p className="text-lg leading-relaxed mb-2" style={{ color: '#B5B2AC' }}>
        Al-Fatiha and the short surahs you pray with grow from {data?.totals.roots ?? 110} Arabic roots. Learn two or three a day,
        and in 30 days you understand what you say five times a day.
      </p>
      <p className="text-sm mb-10" style={{ color: '#9A9893' }}>
        A few minutes a day. The first week, all of Al-Fatiha, is free{data?.access ? '' : ', with no account needed'}.
      </p>

      {/* progress */}
      <div className="rounded-2xl p-6 mb-10" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(212,162,70,.18)' }}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-3">
          <div>
            <p className="text-sm" style={{ color: '#9A9893' }}>{fresh ? 'The root words of your salah you understand' : 'You understand'}</p>
            <p className="font-heading text-5xl" style={{ color: '#F0E8D8' }}>{pct}%</p>
          </div>
          {next && (
            <Link href={`/salah/${next.day}`} className="btn-primary whitespace-nowrap text-center">
              {fresh ? 'Start day 1, free' : `Continue: day ${next.day}`}
            </Link>
          )}
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: `linear-gradient(90deg, #C89535, ${GOLD})` }} />
        </div>
        {data?.access && <p className="text-[13px] mt-3" style={{ color: '#34D399' }}>All 30 days are unlocked for you.</p>}
      </div>

      {error && <p className="mb-6 text-sm" style={{ color: '#F87171' }}>{error}</p>}

      {/* the 30 days */}
      <ol className="relative">
        {(data?.days ?? []).map((d) => {
          const isDone = done.includes(d.day), milestone = d.day === 7 || d.day === 30;
          const lines = d.lineCount === 1 ? '1 new line' : d.lineCount ? `${d.lineCount} new lines` : '';
          return (
            <li key={d.day}>
              {d.day === 8 && data && !data.access && (
                <div className="my-8"><PathOffer offer={data.offer} variant="path" pct={pct || undefined} /></div>
              )}
              <Link href={`/salah/${d.day}`} className="flex items-center gap-4 py-3.5 px-3 rounded-xl transition-colors hover:bg-white/[0.03]">
                <span className="w-9 h-9 shrink-0 rounded-full grid place-items-center text-sm font-semibold"
                  style={{ background: isDone ? GOLD : milestone ? 'rgba(212,162,70,.14)' : 'rgba(255,255,255,.05)', color: isDone ? '#0E0D0C' : milestone ? GOLD : '#A09F9B' }}>
                  {isDone ? '✓' : d.day}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block" style={{ color: d.locked ? '#9C988F' : '#EDEDEC' }}>{d.title}</span>
                  <span className="block text-xs" style={{ color: '#6E6B66' }}>
                    {[d.rootCount ? `${d.rootCount} roots` : '', lines, `${d.pctSalah}% of your salah`].filter(Boolean).join(' · ')}
                  </span>
                </span>
                {d.locked && (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" aria-label="Part of the full path"><rect x="5" y="11" width="14" height="9" rx="2" stroke="#8F8C86" strokeWidth="1.6" /><path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#8F8C86" strokeWidth="1.6" /></svg>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
