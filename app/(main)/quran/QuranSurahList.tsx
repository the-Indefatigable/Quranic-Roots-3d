'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';

interface Surah {
  number: number;
  arabicName: string;
  englishName: string;
  revelationType: string | null;
  versesCount: number;
}

export function QuranSurahList() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetch('/api/quran/surahs')
      .then((res) => res.json())
      .then((data) => setSurahs(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return surahs;
    const q = query.toLowerCase().trim();
    return surahs.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.arabicName.includes(q) ||
        String(s.number) === q
    );
  }, [surahs, query]);

  return (
    <>
      <PageHeader title="Quran" subtitle="Browse all 114 surahs" />

      {/* Search */}
      <div className="relative mb-5">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name or number..."
          className="w-full bg-card border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-gold/40 transition-colors"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl px-5 py-4 h-[76px] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30 text-sm">
          No surahs matching &ldquo;{query}&rdquo;
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((surah) => (
            <Link
              key={surah.number}
              href={`/quran/${surah.number}`}
              className="group flex items-center gap-4 bg-card border border-border rounded-2xl px-5 py-4 transition-colors hover:border-white/[0.12] hover:bg-elevated"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gold-dim text-gold text-sm font-medium">
                {surah.number}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white truncate">
                    {surah.englishName}
                  </p>
                  <span className="font-arabic text-lg text-gold ml-2 shrink-0">
                    {surah.arabicName}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Badge>{surah.versesCount} ayahs</Badge>
                  {surah.revelationType && (
                    <Badge variant={surah.revelationType === 'makkah' ? 'gold' : 'emerald'}>
                      {surah.revelationType === 'makkah' ? 'Meccan' : 'Medinan'}
                    </Badge>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
