'use client';

import { useMemo, useState } from 'react';
import { dailyVerbs, type DailyVerb } from '@/data/dailyVerbs';

const GOLD = '#D4A246';

// Diacritic-insensitive normaliser so "احب", "أحب", and "أَحَبَّ" all match, and
// English search ignores case. Lets people search in either script, loosely.
function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, '') // harakāt + tatweel
    .replace(/[إأآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
}

function matches(v: DailyVerb, q: string): boolean {
  const n = norm(q);
  if (!n) return true;
  return (
    norm(v.en).includes(n) ||
    norm(v.ar).includes(n) ||
    norm(v.present).includes(n) ||
    norm(v.translit).includes(n) ||
    v.examples.some((e) => norm(e.en).includes(n) || norm(e.ar).includes(n))
  );
}

const CATEGORIES = ['All', 'Everyday', 'Speaking', 'Movement', 'Feelings', 'Mind', 'Work & Money', 'Home', 'Food', 'Body', 'People', 'Faith', 'Nature', 'Action'];

export function DailyVerbsClient() {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');

  const results = useMemo(
    () => dailyVerbs.filter((v) => (cat === 'All' || v.cat === cat) && matches(v, query)),
    [query, cat],
  );

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: GOLD }}>Speak Arabic</p>
        <h1 className="text-3xl sm:text-4xl font-heading tracking-tight leading-[1.05]" style={{ color: 'var(--color-ivory)' }}>
          Daily Verbs
        </h1>
        <p className="mt-2 text-sm leading-relaxed max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
          The verbs you actually use — to want, to go, to love, to understand. Learn these and you can
          say most of what daily life needs. Search in English or Arabic.
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
            placeholder="Search a verb — e.g. love, أحب, to accept…"
            className="w-full pl-11 pr-10 py-3 rounded-2xl text-sm outline-none"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', color: 'var(--color-ivory)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg"
              style={{ color: '#78716C' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-1.5 mt-2.5 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((c) => {
            const on = cat === c;
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                style={on
                  ? { background: 'rgba(212,162,70,0.16)', color: GOLD, border: `1px solid ${GOLD}` }
                  : { background: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-light)' }}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs mt-3 mb-3 px-1" style={{ color: 'var(--color-text-tertiary)' }}>
        {results.length} {results.length === 1 ? 'verb' : 'verbs'}
      </p>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            No verb matches “{query}”. Try the English meaning or the Arabic word.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {results.map((v) => (
            <article
              key={v.en}
              className="rounded-2xl p-4 flex flex-col"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}
            >
              {/* English + category */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-[15px] font-semibold" style={{ color: 'var(--color-ivory)' }}>{v.en}</h2>
                <span className="shrink-0 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: 'rgba(212,162,70,0.1)', color: GOLD }}>
                  {v.cat}
                </span>
              </div>

              {/* Arabic (past · present) */}
              <div className="flex items-baseline gap-3 flex-row-reverse justify-end" dir="rtl">
                <span className="font-arabic leading-none" style={{ fontSize: '1.9rem', color: '#F0E8D8' }}>{v.ar}</span>
                <span className="font-arabic leading-none" style={{ fontSize: '1.35rem', color: GOLD, opacity: 0.85 }}>{v.present}</span>
              </div>
              <p className="text-xs italic mt-1.5" style={{ color: '#78716C' }}>{v.translit}</p>

              {/* Examples */}
              <div className="mt-3 pt-3 space-y-2.5" style={{ borderTop: '1px solid var(--color-border-light)' }}>
                {v.examples.map((ex, i) => (
                  <div key={i}>
                    <p className="font-arabic leading-relaxed text-right" dir="rtl" style={{ fontSize: '1.05rem', color: '#E8DFC9' }}>{ex.ar}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>{ex.en}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Footnote */}
      <p className="text-center text-[11px] mt-8" style={{ color: 'var(--color-text-tertiary)' }}>
        Showing {dailyVerbs.length} everyday verbs — more added regularly. The gold word is the present tense
        (يفعل), the form you use to say “I do it”.
      </p>
    </div>
  );
}
