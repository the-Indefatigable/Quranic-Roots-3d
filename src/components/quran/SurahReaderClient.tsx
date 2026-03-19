'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { WordPopover, type WordData } from './WordPopover';
import { TafsirPanel } from './TafsirPanel';

interface AyahData {
  number: number;
  textUthmani: string;
  translation: string;
  words: WordData[];
}

interface Props {
  ayahs: AyahData[];
  surahNumber: number;
  hasWords: boolean;
  hasTafsir?: boolean;
}

export function SurahReaderClient({ ayahs, surahNumber, hasWords, hasTafsir }: Props) {
  const { quranSettings, updateQuranSettings } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [wordByWord, setWordByWord] = useState(hasWords);
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null);

  return (
    <div>
      {/* Settings toggle */}
      <div className="flex justify-end gap-2 mb-6">
        {hasWords && (
          <button
            onClick={() => setWordByWord(!wordByWord)}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
              wordByWord
                ? 'bg-gold-dim text-gold'
                : 'bg-white/[0.03] text-muted-more hover:text-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            Word by Word
          </button>
        )}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 text-xs text-muted-more hover:text-white transition-colors bg-white/[0.03] px-3 py-1.5 rounded-lg"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          Settings
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-card border border-border rounded-2xl p-4 sm:p-5 mb-8 flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-more">Font size</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuranSettings({ fontSize: Math.max(20, quranSettings.fontSize - 2) })}
                className="w-7 h-7 rounded-lg bg-white/[0.04] text-muted hover:text-white text-sm transition-colors"
              >
                −
              </button>
              <span className="text-xs text-muted w-8 text-center">{quranSettings.fontSize}</span>
              <button
                onClick={() => updateQuranSettings({ fontSize: Math.min(48, quranSettings.fontSize + 2) })}
                className="w-7 h-7 rounded-lg bg-white/[0.04] text-muted hover:text-white text-sm transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-more">Translation</span>
            <button
              onClick={() => updateQuranSettings({ showTranslation: !quranSettings.showTranslation })}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                quranSettings.showTranslation ? 'bg-gold' : 'bg-white/[0.1]'
              }`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  quranSettings.showTranslation ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Ayahs */}
      <div className="space-y-6">
        {ayahs.map((ayah) => (
          <div key={ayah.number} className="group">
            {/* Ayah number */}
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-gold-dim text-gold text-xs font-medium mt-1">
                {ayah.number}
              </span>

              <div className="flex-1">
                {/* Word-by-word mode */}
                {wordByWord && ayah.words.length > 0 ? (
                  <div className="flex flex-wrap gap-x-3 gap-y-4 justify-end" dir="rtl">
                    {ayah.words
                      .filter((w) => w.charType === 'word')
                      .map((word) => (
                        <button
                          key={word.position}
                          onClick={(e) => { e.stopPropagation(); setSelectedWord(word); }}
                          className="flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl hover:bg-gold-dim active:bg-gold-dim transition-colors cursor-pointer group/word border border-transparent hover:border-gold/20"
                        >
                          <span
                            className="font-arabic text-white group-hover/word:text-gold transition-colors leading-relaxed"
                            style={{ fontSize: `${quranSettings.fontSize}px` }}
                          >
                            {word.textUthmani}
                          </span>
                          {word.translation && (
                            <span className="text-[10px] text-muted-more leading-tight max-w-[80px] text-center truncate">
                              {word.translation}
                            </span>
                          )}
                        </button>
                      ))}
                  </div>
                ) : (
                  /* Full ayah mode */
                  <p
                    className="font-arabic text-white leading-[2.2] text-right"
                    dir="rtl"
                    style={{ fontSize: `${quranSettings.fontSize}px` }}
                  >
                    {ayah.textUthmani}
                  </p>
                )}

                {/* Translation */}
                {quranSettings.showTranslation && ayah.translation && (
                  <p className="text-sm text-muted leading-relaxed mt-3" dir="ltr">
                    {ayah.translation}
                  </p>
                )}
              </div>
            </div>

            {/* Ayah actions */}
            {hasTafsir && (
              <div className="flex justify-end mt-3">
                <button
                  onClick={() => setTafsirAyah(ayah.number)}
                  className="flex items-center gap-1.5 text-xs text-gold/70 hover:text-gold active:text-gold bg-gold/[0.08] hover:bg-gold/[0.12] px-3 py-1.5 rounded-lg transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                  Tafsir
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="border-b border-white/[0.03] mt-6" />
          </div>
        ))}
      </div>

      {/* End of surah */}
      {ayahs.length > 0 && (
        <div className="text-center mt-12">
          <p className="font-arabic text-lg text-gold/30">صَدَقَ ٱللَّهُ ٱلْعَظِيمُ</p>
          <p className="text-xs text-muted-more mt-2">End of Surah {surahNumber}</p>
        </div>
      )}

      {/* Word popover */}
      <WordPopover word={selectedWord} onClose={() => setSelectedWord(null)} />

      {/* Tafsir panel */}
      <TafsirPanel
        surahNumber={surahNumber}
        ayahNumber={tafsirAyah}
        onClose={() => setTafsirAyah(null)}
      />
    </div>
  );
}
