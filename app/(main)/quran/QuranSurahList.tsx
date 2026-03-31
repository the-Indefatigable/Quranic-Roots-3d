'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';

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
    <div className="relative overflow-hidden">
      {/* Atmospheric background — matches surah reader */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[560px] h-[400px]"
          style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(212,162,70,0.06) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(212,162,70,0.04) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 relative z-10"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div>
          <h1
            className="text-2xl sm:text-3xl font-heading tracking-tight"
            style={{ color: '#F0E4CA', textShadow: '0 0 40px rgba(212,162,70,0.15)' }}
          >
            Quran
          </h1>
          <motion.p
            className="mt-1.5 text-sm text-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.3 }}
          >
            Browse all 114 surahs
          </motion.p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        className="relative mb-6 z-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08, duration: 0.35 }}
      >
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary pointer-events-none"
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
          className="w-full rounded-xl pl-10 pr-4 py-3 text-sm text-text placeholder-text-tertiary focus:outline-none transition-all"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(212,162,70,0.12)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'rgba(212,162,70,0.35)';
            e.target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,162,70,0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(212,162,70,0.12)';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl px-5 py-4 h-[76px] animate-pulse"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          className="text-center py-20 relative z-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg className="w-12 h-12 text-text-tertiary mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-text-secondary text-sm">No surahs matching &ldquo;{query}&rdquo;</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 relative z-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.02 } },
          }}
        >
          {filtered.map((surah) => (
            <motion.div
              key={surah.number}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.25 }}
            >
              <Link
                href={`/quran/${surah.number}`}
                className="group flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(212,162,70,0.06)';
                  e.currentTarget.style.borderColor = 'rgba(212,162,70,0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(212,162,70,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.25)';
                }}
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium"
                  style={{ background: 'rgba(212,162,70,0.10)', color: '#D4A246' }}
                >
                  {surah.number}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text truncate">
                      {surah.englishName}
                    </p>
                    <span
                      className="font-arabic text-lg ml-2 shrink-0"
                      style={{ color: '#D4A246' }}
                    >
                      {surah.arabicName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge>{surah.versesCount} ayahs</Badge>
                    {surah.revelationType && (
                      <Badge variant={surah.revelationType === 'makkah' ? 'amber' : 'emerald'}>
                        {surah.revelationType === 'makkah' ? 'Meccan' : 'Medinan'}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
