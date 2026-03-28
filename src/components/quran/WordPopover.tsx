'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

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
  anchorElement: HTMLElement | null;
  onClose: () => void;
}

export function WordPopover({ word, anchorElement, onClose }: Props) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [topPx, setTopPx] = useState(0);

  // Position at exact center of what user is currently viewing
  useEffect(() => {
    if (!word) return;
    const viewportH = window.innerHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    setTopPx(scrollTop + viewportH / 2);
  }, [word]);

  // Close on Escape
  useEffect(() => {
    if (!word) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [word, onClose]);

  if (!word) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Centered in visual viewport on all devices */}
      <div
        ref={popoverRef}
        className="absolute z-[101] left-1/2 w-[280px] sm:w-72"
        style={{ top: `${topPx}px`, transform: 'translate(-50%, -50%)' }}
      >
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-modal max-h-[70vh] overflow-y-auto">

          {/* Word */}
          <div className="text-center mb-4">
            <p className="font-arabic text-4xl text-primary leading-relaxed" dir="rtl">
              {word.textUthmani}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2.5">
            {word.transliteration && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Transliteration</span>
                <span className="text-sm text-text-secondary italic">{word.transliteration}</span>
              </div>
            )}

            {word.translation && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Meaning</span>
                <span className="text-sm text-text">{word.translation}</span>
              </div>
            )}

            {word.rootArabic && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Root</span>
                <span className="font-arabic text-lg text-primary">{word.rootArabic}</span>
              </div>
            )}
          </div>

          {/* Root link or particle indicator */}
          {word.rootArabic ? (
            <Link
              href={`/roots/${encodeURIComponent(word.rootArabic.replace(/\s/g, ''))}`}
              onClick={onClose}
              className="flex items-center justify-center gap-2 mt-4 bg-primary-light text-primary text-xs font-medium px-4 py-2.5 rounded-xl hover:bg-primary/20 transition-colors"
            >
              View full root
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          ) : (
            <div className="mt-4 text-center text-[10px] text-text-tertiary uppercase tracking-wider">
              Particle / Function word
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-3 text-xs text-text-tertiary hover:text-text-secondary py-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
