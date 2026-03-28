'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

interface SearchResult {
  surahNumber: number;
  ayahNumber: number;
  textUthmani: string;
  translation: string | null;
  surahEnglishName: string;
  surahArabicName: string;
}

function highlight(text: string, query: string) {
  if (!query || !text) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-primary/20 text-primary rounded px-0.5">{part}</mark>
      : part
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setSearched(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const isArabic = /[\u0600-\u06FF]/.test(query);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light tracking-tight text-white mb-1">Search</h1>
        <p className="text-sm text-text-secondary">Search by Arabic text or English translation</p>
      </div>

      {/* Search input */}
      <div className="relative mb-8">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. mercy, صبر, knowledge…"
          className={`w-full bg-surface border border-border rounded-2xl pl-12 pr-12 py-4 text-white placeholder:text-white/25 focus:outline-none focus:border-primary/40 focus:bg-surface transition-all text-base ${isArabic ? 'text-right font-arabic text-xl' : ''}`}
          dir={isArabic ? 'rtl' : 'ltr'}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-white/30 mb-6">
          <div className="w-3 h-3 rounded-full border border-primary/40 border-t-primary animate-spin" />
          Searching…
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-white/30 mb-4 tracking-wide">
            {results.length} result{results.length !== 1 ? 's' : ''}
            {results.length === 20 ? ' (showing top 20)' : ''}
          </p>

          {results.map((r) => (
            <Link
              key={`${r.surahNumber}:${r.ayahNumber}`}
              href={`/quran/${r.surahNumber}`}
              className="group block bg-surface border border-border-light hover:border-border hover:bg-surface rounded-2xl p-5 transition-all"
            >
              {/* Reference */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-primary/60 group-hover:text-primary transition-colors">
                  {r.surahEnglishName} · {r.surahNumber}:{r.ayahNumber}
                </span>
                <span className="font-arabic text-xs text-white/25">{r.surahArabicName}</span>
              </div>

              {/* Arabic text */}
              <p className="font-arabic text-xl text-white/90 leading-[2] text-right mb-3 dir-rtl" dir="rtl">
                {isArabic ? highlight(r.textUthmani, query.trim()) : r.textUthmani}
              </p>

              {/* Translation */}
              {r.translation && (
                <p className="text-sm text-white/50 leading-relaxed">
                  {isArabic ? r.translation : highlight(r.translation, query.trim())}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && searched && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/20 text-sm">No ayahs found for &ldquo;{query}&rdquo;</p>
          <p className="text-white/15 text-xs mt-2">Try a different word or phrase</p>
        </div>
      )}

      {/* Idle hint */}
      {!loading && !searched && !query && (
        <div className="text-center py-16 space-y-6">
          <div className="inline-flex flex-col items-center gap-2 text-white/15 text-sm">
            <p>Try searching for</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['mercy', 'patience', 'رحمة', 'صبر', 'knowledge', 'paradise'].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className={`px-3 py-1.5 rounded-lg bg-surface border border-border-light hover:border-primary/30 hover:text-primary/60 transition-all text-xs ${/[\u0600-\u06FF]/.test(s) ? 'font-arabic text-base' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
