'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TafsirEntry {
  ayahNumber: number;
  text: string;
}

interface Props {
  surahNumber: number;
  ayahNumber: number | null;
  ayahs: { number: number; textUthmani: string }[];
  onClose: () => void;
}

// Client-side cache — survives across open/close within the same page
const tafsirCache = new Map<string, { entries: TafsirEntry[]; tafsirName: string; authorName: string }>();

export function TafsirPanel({ surahNumber, ayahNumber, ayahs, onClose }: Props) {
  const [entry, setEntry] = useState<TafsirEntry | null>(null);
  const [meta, setMeta] = useState<{ tafsirName: string; authorName: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchTafsir = useCallback(async (ayah: number) => {
    const cacheKey = `${surahNumber}`;

    // Check if we have the full surah cached
    let cached = tafsirCache.get(cacheKey);
    if (!cached) {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/tafsir/${surahNumber}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        // Ensure entries are sorted by ayah ASC for range calculation
        const entries = (data.entries || []).sort((a: TafsirEntry, b: TafsirEntry) => a.ayahNumber - b.ayahNumber);
        cached = {
          entries,
          tafsirName: data.tafsirName || '',
          authorName: data.authorName || '',
        };
        tafsirCache.set(cacheKey, cached);
      } catch {
        setError(true);
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    setMeta({ tafsirName: cached.tafsirName, authorName: cached.authorName });

    // Find exact match or nearest preceding entry
    const exact = cached.entries.find((e) => e.ayahNumber === ayah);
    if (exact) {
      setEntry(exact);
    } else {
      // Find the nearest preceding entry (Ibn Kathir groups multiple ayahs)
      const preceding = cached.entries
        .filter((e) => e.ayahNumber <= ayah)
        .sort((a, b) => b.ayahNumber - a.ayahNumber);
      setEntry(preceding[0] || null);
    }
  }, [surahNumber]);

  useEffect(() => {
    if (ayahNumber !== null) {
      fetchTafsir(ayahNumber);
      // Scroll panel to top on new ayah
      panelRef.current?.scrollTo(0, 0);
    }
  }, [ayahNumber, fetchTafsir]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (ayahNumber !== null) {
      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }
  }, [ayahNumber, onClose]);

  const isOpen = ayahNumber !== null;

  // Calculate the ayah range covered by this tafsir entry
  let endAyah = ayahNumber || 0;
  if (entry) {
    const cached = tafsirCache.get(`${surahNumber}`);
    if (cached) {
      const nextEntry = cached.entries.find((e) => e.ayahNumber > entry.ayahNumber);
      if (nextEntry) {
        endAyah = nextEntry.ayahNumber - 1;
      } else {
        endAyah = ayahs[ayahs.length - 1]?.number || entry.ayahNumber;
      }
    } else {
      endAyah = entry.ayahNumber;
    }
  }

  const coveredAyahs = entry
    ? ayahs.filter((a) => a.number >= entry.ayahNumber && a.number <= endAyah)
    : [];

  const ayahRangeText =
    entry && endAyah > entry.ayahNumber
      ? `${entry.ayahNumber}-${endAyah}`
      : `${ayahNumber}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel — slides from right on desktop, bottom on mobile */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[440px] lg:w-[500px] bg-background border-l border-border flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
              <div>
                <h3 className="text-sm font-medium text-text">Tafsir</h3>
                {meta && (
                  <p className="text-[10px] text-text-tertiary mt-0.5">
                    {meta.tafsirName} — {meta.authorName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-primary bg-primary-light px-2 py-1 rounded-lg">
                  Ayah {ayahRangeText}
                </span>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface text-text-tertiary hover:text-text transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div ref={panelRef} className="flex-1 overflow-y-auto px-5 py-5">
              {loading && (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-surface rounded w-full mb-2" />
                      <div className="h-4 bg-surface rounded w-5/6 mb-2" />
                      <div className="h-4 bg-surface rounded w-4/6" />
                    </div>
                  ))}
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-sm text-text-secondary">Failed to load tafsir</p>
                  <button
                    onClick={() => ayahNumber !== null && fetchTafsir(ayahNumber)}
                    className="text-xs text-primary mt-2 hover:text-primary transition-colors"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!loading && !error && !entry && (
                <div className="text-center py-12">
                  <p className="text-sm text-text-secondary">No commentary available for this ayah</p>
                </div>
              )}

              {!loading && !error && entry && (
                <div>
                  {/* Arabic text for the covered ayahs */}
                  {coveredAyahs.length > 0 && (
                    <div className="bg-surface border border-border-light rounded-xl p-5 mb-6 space-y-4">
                      {coveredAyahs.map((a) => (
                        <p key={a.number} className="font-arabic text-2xl text-text leading-loose text-right" dir="rtl">
                          {a.textUthmani}
                          <span className="inline-block shrink-0 w-8 h-8 ml-2 text-center rounded-full bg-primary-light text-primary text-[10px] font-sans font-medium">
                            <span className="flex items-center justify-center h-full pt-[2px]">{a.number}</span>
                          </span>
                        </p>
                      ))}
                    </div>
                  )}

                  <div 
                    className="text-sm text-text-secondary leading-relaxed whitespace-pre-line tafsir-content"
                    dangerouslySetInnerHTML={{
                      __html: entry.text
                        // Bold
                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-text font-medium">$1</strong>')
                        // H3 Headers (###)
                        .replace(/^###\s+(.*)$/gm, '<h3 class="text-base text-primary mt-6 mb-2 font-medium">$1</h3>')
                    }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
