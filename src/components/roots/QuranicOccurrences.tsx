'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';

interface Occurrence {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;
  translation: string;
  words: { text: string; isRoot: boolean }[];
}

interface Props {
  occurrences: Occurrence[];
  totalAyahs: number;
  rootArabic: string;
}

export function QuranicOccurrences({ occurrences: initial, totalAyahs, rootArabic }: Props) {
  const [items, setItems] = useState<Occurrence[]>(initial);
  const [loading, setLoading] = useState(false);
  const hasMore = items.length < totalAyahs;

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/roots/${encodeURIComponent(rootArabic)}/occurrences?offset=${items.length}&limit=10`
      );
      const data = await res.json();
      if (data.occurrences?.length) {
        setItems((prev) => [...prev, ...data.occurrences]);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [items.length, loading, hasMore, rootArabic]);

  return (
    <div>
      <div className="space-y-3">
        {items.map((occ) => (
          <Link
            key={`${occ.surahNumber}:${occ.ayahNumber}`}
            href={`/quran/${occ.surahNumber}#ayah-${occ.ayahNumber}`}
            className="block bg-surface rounded-2xl shadow-card p-4 sm:p-5 hover:shadow-raised hover:-translate-y-0.5 transition-all duration-200 group"
          >
            {/* Location badge */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Badge variant="amber">{occ.surahNumber}:{occ.ayahNumber}</Badge>
                <span className="text-xs text-text-secondary">{occ.surahName}</span>
              </div>
              <svg
                className="w-3.5 h-3.5 text-text-tertiary group-hover:text-primary transition-colors"
                fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </div>

            {/* Arabic ayah with highlighted root words */}
            <div className="font-arabic text-xl leading-[2.2] text-right mb-3" dir="rtl">
              {occ.words.map((w, i) => (
                <span key={i}>
                  {i > 0 && ' '}
                  <span className={w.isRoot ? 'text-primary font-semibold' : 'text-white/80'}>
                    {w.text}
                  </span>
                </span>
              ))}
            </div>

            {/* Translation */}
            {occ.translation && (
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
                {occ.translation}
              </p>
            )}
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-text-tertiary">
          Showing {items.length} of {totalAyahs} ayahs
        </span>
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={loading}
            className="text-xs text-primary hover:text-primary transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Loading...' : `Show more`}
          </button>
        )}
      </div>
    </div>
  );
}
