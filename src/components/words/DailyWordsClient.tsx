'use client';

import { useMemo, useState } from 'react';
import { dailyWords, type DailyWord } from '@/data/dailyWords';

const GOLD = '#D4A246';

function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
}

function matches(w: DailyWord, q: string): boolean {
  const n = norm(q);
  if (!n) return true;
  return (
    norm(w.en).includes(n) ||
    norm(w.ar).includes(n) ||
    norm(w.translit).includes(n) ||
    (!!w.example && (norm(w.example.en).includes(n) || norm(w.example.ar).includes(n)))
  );
}

const TYPES = ['All', 'Expression', 'Connector', 'Feeling', 'Describing', 'Question', 'Time', 'Common'];

export function DailyWordsClient() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');

  const results = useMemo(
    () => dailyWords.filter((w) => (type === 'All' || w.type === type) && matches(w, query)),
    [query, type],
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD }}>Speak Arabic</p>
        <h1 className="text-3xl sm:text-4xl font-heading tracking-tight leading-[1.05]" style={{ color: 'var(--color-ivory)' }}>
          Everyday Words
        </h1>
        <p className="mt-2 text-sm leading-relaxed max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
          The glue of real conversation — expressions like <span className="font-arabic" style={{ color: GOLD }}>بِصَراحة</span> (honestly),
          connectors like <span className="font-arabic" style={{ color: GOLD }}>على العَكْس</span> (on the contrary), feelings, and describing
          words. Search in English or Arabic.
        </p>
      </div>

      {/* Search */}
      <div className="sticky top-16 lg:top-3 z-10 -mx-1 px-1 py-2" style={{ background: 'var(--color-canvas)' }}>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#78716C' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search a word — e.g. honestly, مهم, important…"
            className="w-full pl-11 pr-10 py-3 rounded-2xl text-sm outline-none"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', color: 'var(--color-ivory)' }}
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg" style={{ color: '#78716C' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Type chips */}
        <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {TYPES.map((t) => {
            const on = type === t;
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                style={on
                  ? { background: 'rgba(212,162,70,0.16)', color: GOLD, border: `1px solid ${GOLD}` }
                  : { background: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-light)' }}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-xs mt-3 mb-3 px-1" style={{ color: 'var(--color-text-tertiary)' }}>
        {results.length} {results.length === 1 ? 'word' : 'words'}
      </p>

      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No word matches “{query}”. Try the English meaning or the Arabic word.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {results.map((w) => (
            <article key={w.en} className="rounded-2xl p-4 flex flex-col" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-[15px] font-semibold" style={{ color: 'var(--color-ivory)' }}>{w.en}</h2>
                <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,162,70,0.1)', color: GOLD }}>
                  {w.type}
                </span>
              </div>

              <p className="font-arabic leading-none text-right" dir="rtl" style={{ fontSize: '1.9rem', color: '#F0E8D8' }}>{w.ar}</p>
              <p className="text-xs italic mt-1.5" style={{ color: '#78716C' }}>{w.translit}</p>

              {w.note && <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--color-text-tertiary)' }}>{w.note}</p>}

              {w.example && (
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                  <p className="font-arabic leading-relaxed text-right" dir="rtl" style={{ fontSize: '1.05rem', color: '#E8DFC9' }}>{w.example.ar}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{w.example.en}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      <p className="text-center text-[11px] mt-8" style={{ color: 'var(--color-text-tertiary)' }}>
        {dailyWords.length} everyday words & expressions — the pieces that make speech flow. More added regularly.
      </p>
    </div>
  );
}
