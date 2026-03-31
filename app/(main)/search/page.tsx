'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1
          className="text-2xl sm:text-3xl font-heading tracking-tight"
          style={{ color: '#F0E4CA', textShadow: '0 0 40px rgba(212,162,70,0.15)' }}
        >Search</h1>
        <p className="text-sm text-text-secondary">Search by Arabic text or English translation</p>
      </motion.div>

      {/* Search input */}
      <motion.div
        className="relative mb-8"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.35 }}
      >
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
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
          className={`w-full bg-surface border border-border rounded-2xl shadow-card pl-12 pr-12 py-4 text-text placeholder:text-text-tertiary focus:outline-none focus:border-primary/40 focus:shadow-raised transition-all text-base ${isArabic ? 'text-right font-arabic text-xl' : ''}`}
          dir={isArabic ? 'rtl' : 'ltr'}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </motion.div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="flex items-center gap-2.5 text-sm text-text-tertiary mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            Searching…
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      {!loading && results.length > 0 && (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs text-text-tertiary mb-4 tracking-wide">
            {results.length} result{results.length !== 1 ? 's' : ''}
            {results.length === 20 ? ' (showing top 20)' : ''}
          </p>

          {results.map((r, idx) => (
            <motion.div
              key={`${r.surahNumber}:${r.ayahNumber}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
            >
              <Link
                href={`/quran/${r.surahNumber}`}
                className="group block bg-surface border border-border-light rounded-2xl p-5 shadow-card hover:shadow-raised hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* Reference */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-primary/60 group-hover:text-primary transition-colors">
                    {r.surahEnglishName} · {r.surahNumber}:{r.ayahNumber}
                  </span>
                  <span className="font-arabic text-xs text-text-tertiary">{r.surahArabicName}</span>
                </div>

                {/* Arabic text */}
                <p className="font-arabic text-xl text-text leading-[2] text-right mb-3" dir="rtl">
                  {isArabic ? highlight(r.textUthmani, query.trim()) : r.textUthmani}
                </p>

                {/* Translation */}
                {r.translation && (
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {isArabic ? r.translation : highlight(r.translation, query.trim())}
                  </p>
                )}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && searched && results.length === 0 && (
        <motion.div
          className="text-center py-20"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg className="w-12 h-12 text-text-tertiary mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-text-secondary text-sm">No ayahs found for &ldquo;{query}&rdquo;</p>
          <p className="text-text-tertiary text-xs mt-2">Try a different word or phrase</p>
        </motion.div>
      )}

      {/* Idle hint */}
      {!loading && !searched && !query && (
        <motion.div
          className="text-center py-16 space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="inline-flex flex-col items-center gap-3 text-text-tertiary text-sm">
            <p>Try searching for</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {['mercy', 'patience', 'رحمة', 'صبر', 'knowledge', 'paradise'].map((s) => (
                <button
                  key={s}
                  onClick={() => setQuery(s)}
                  className={`px-3.5 py-2 rounded-xl bg-surface border border-border-light shadow-card hover:shadow-raised hover:border-primary/30 hover:text-primary hover:-translate-y-0.5 transition-all duration-200 text-xs ${/[\u0600-\u06FF]/.test(s) ? 'font-arabic text-base' : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
