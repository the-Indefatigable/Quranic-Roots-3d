'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export interface WordData {
  position: number;
  textUthmani: string;
  transliteration: string | null;
  translation: string | null;
  rootArabic: string | null;
  charType: string;
}

interface Props {
  word: WordData | null;
  onClose: () => void;
}

export function WordPopover({ word, onClose }: Props) {
  return (
    <AnimatePresence>
      {word && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          {/* Popover */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed bottom-16 left-0 right-0 z-50 sm:bottom-auto sm:left-auto sm:right-auto sm:fixed sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2"
          >
            <div className="bg-card border border-border rounded-t-2xl sm:rounded-2xl p-5 sm:p-4 shadow-2xl max-w-sm mx-auto sm:mx-0 w-full sm:w-72">
              {/* Word */}
              <div className="text-center sm:text-right mb-4">
                <p className="font-arabic text-4xl text-gold leading-relaxed" dir="rtl">
                  {word.textUthmani}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2.5">
                {word.transliteration && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-more uppercase tracking-wider">Transliteration</span>
                    <span className="text-sm text-slate-300 italic">{word.transliteration}</span>
                  </div>
                )}

                {word.translation && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-more uppercase tracking-wider">Meaning</span>
                    <span className="text-sm text-slate-200">{word.translation}</span>
                  </div>
                )}

                {word.rootArabic && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-more uppercase tracking-wider">Root</span>
                    <span className="font-arabic text-lg text-gold">{word.rootArabic}</span>
                  </div>
                )}
              </div>

              {/* Root link or particle indicator */}
              {word.rootArabic ? (
                <Link
                  href={`/roots/${encodeURIComponent(word.rootArabic.replace(/\s/g, ''))}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 mt-4 bg-gold-dim text-gold text-xs font-medium px-4 py-2.5 rounded-xl hover:bg-gold/20 transition-colors"
                >
                  View full root
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              ) : (
                <div className="mt-4 text-center text-[10px] text-muted-more uppercase tracking-wider">
                  Particle / Function word
                </div>
              )}

              {/* Close on mobile */}
              <button
                onClick={onClose}
                className="sm:hidden w-full mt-3 text-xs text-muted-more py-2"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
