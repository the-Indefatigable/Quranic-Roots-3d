'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { WordPopover, type WordData } from './WordPopover';
import { TafsirPanel } from './TafsirPanel';
import { AudioPlayer } from './AudioPlayer';

interface AyahData {
  number: number;
  textUthmani: string;
  translation: string;
  words: WordData[];
}

interface Props {
  ayahs: AyahData[];
  surahNumber: number;
  surahName: string;
  hasWords: boolean;
  hasTafsir?: boolean;
}

async function shareAyah(surahNumber: number, ayahNumber: number, setCopied: (n: number | null) => void) {
  const shareUrl = `${window.location.origin}/share/${surahNumber}/${ayahNumber}`;
  if (navigator.share) {
    try {
      await navigator.share({ url: shareUrl });
      return;
    } catch {
      // fell through to clipboard
    }
  }
  try {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(ayahNumber);
    setTimeout(() => setCopied(null), 2000);
  } catch {
    // clipboard not available
  }
}

function getVisibleAyahNumber(ayahs: AyahData[]): number {
  const viewportCenter = window.innerHeight / 2;
  let closest = ayahs[0]?.number ?? 1;
  let closestDist = Infinity;
  for (const ayah of ayahs) {
    const el = document.getElementById(`ayah-${ayah.number}`);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const dist = Math.abs(rect.top + rect.height / 2 - viewportCenter);
    if (dist < closestDist) { closestDist = dist; closest = ayah.number; }
  }
  return closest;
}

export function SurahReaderClient({ ayahs, surahNumber, surahName, hasWords, hasTafsir }: Props) {
  const { quranSettings, updateQuranSettings } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [wordByWord, setWordByWord] = useState(hasWords);
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  // Audio mode
  const [audioMode, setAudioMode] = useState(false);
  const [audioStartAyah, setAudioStartAyah] = useState(1);
  const [audioCurrentAyah, setAudioCurrentAyah] = useState<number | null>(null);
  const [audioCurrentWordPos, setAudioCurrentWordPos] = useState<number | null>(null);

  // Shared audio element — must exist before AudioPlayer mounts so we can
  // unlock it synchronously inside the click handler (iOS Safari autoplay gate)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll to active ayah during playback
  const scrolledAyahRef = useRef<number | null>(null);
  useEffect(() => {
    if (!audioMode || audioCurrentAyah === null) return;
    if (scrolledAyahRef.current === audioCurrentAyah) return;
    scrolledAyahRef.current = audioCurrentAyah;
    const el = document.getElementById(`ayah-${audioCurrentAyah}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [audioCurrentAyah, audioMode]);

  const openAudioMode = useCallback(() => {
    // Unlock the audio element RIGHT HERE inside the user gesture —
    // iOS Safari only allows play() when called synchronously from a click.
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    const startAyah = getVisibleAyahNumber(ayahs);
    setAudioStartAyah(startAyah);
    setAudioCurrentAyah(startAyah);
    setAudioMode(true);
  }, [ayahs]);

  const closeAudioMode = useCallback(() => {
    setAudioMode(false);
    setAudioCurrentAyah(null);
    setAudioCurrentWordPos(null);
    scrolledAyahRef.current = null;
  }, []);

  return (
    <div className={audioMode ? 'pb-28 lg:pb-20' : ''}>
      {/* Always-mounted audio element so we can unlock it in the click handler */}
      <audio ref={audioRef} className="hidden" />
      {/* Toolbar */}
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

        {/* Audio mode toggle */}
        <button
          onClick={audioMode ? closeAudioMode : openAudioMode}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            audioMode
              ? 'bg-gold-dim text-gold'
              : 'bg-white/[0.03] text-muted-more hover:text-white'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={audioMode ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
          Listen
        </button>

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
        {ayahs.map((ayah) => {
          const isActiveAyah = audioMode && audioCurrentAyah === ayah.number;
          return (
            <div
              key={ayah.number}
              id={`ayah-${ayah.number}`}
              className={`group transition-all duration-300 rounded-2xl ${
                isActiveAyah
                  ? 'bg-gold/[0.04] ring-1 ring-gold/20 px-3 -mx-3'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3 pt-1">
                <span className={`shrink-0 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs font-medium mt-1 transition-colors ${
                  isActiveAyah ? 'bg-gold text-black' : 'bg-gold-dim text-gold'
                }`}>
                  {ayah.number}
                </span>

                <div className="flex-1">
                  {/* Word-by-word mode */}
                  {wordByWord && ayah.words.length > 0 ? (
                    <div className="flex flex-wrap gap-x-3 gap-y-4 justify-end" dir="rtl">
                      {ayah.words
                        .filter((w) => w.charType === 'word')
                        .map((word) => {
                          const isActiveWord = isActiveAyah && audioCurrentWordPos === word.position;
                          return (
                            <button
                              key={word.position}
                              onClick={(e) => { e.stopPropagation(); setSelectedWord(word); }}
                              className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl transition-colors cursor-pointer group/word border ${
                                isActiveWord
                                  ? 'bg-gold-dim border-gold/30'
                                  : 'border-transparent hover:bg-gold-dim hover:border-gold/20'
                              }`}
                            >
                              <span
                                className={`font-arabic leading-loose transition-colors ${
                                  isActiveWord ? 'text-gold' : 'text-slate-200 group-hover/word:text-gold'
                                }`}
                                style={{ fontSize: `${quranSettings.fontSize}px` }}
                              >
                                {word.textUthmani}
                              </span>
                              {word.translation && (
                                <span className="text-[10px] text-muted leading-tight max-w-[80px] text-center truncate">
                                  {word.translation}
                                </span>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  ) : (
                    /* Full ayah mode */
                    <p
                      className="font-arabic text-slate-200 leading-[2.4] text-right"
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
              <div className="flex justify-end gap-2 mt-3 pb-1">
                {hasTafsir && (
                  <button
                    onClick={() => setTafsirAyah(ayah.number)}
                    className="flex items-center gap-1.5 text-xs text-gold/70 hover:text-gold active:text-gold bg-gold/[0.08] hover:bg-gold/[0.12] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                    Tafsir
                  </button>
                )}
                <button
                  onClick={() => shareAyah(surahNumber, ayah.number, setCopiedAyah)}
                  className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/70 bg-white/[0.03] hover:bg-white/[0.06] px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copiedAyah === ayah.number ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span className="text-emerald">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                      </svg>
                      Share
                    </>
                  )}
                </button>
              </div>

              <div className="border-b border-white/[0.03] mt-3" />
            </div>
          );
        })}
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
        ayahs={ayahs}
        onClose={() => setTafsirAyah(null)}
      />

      {/* Audio player */}
      {audioMode && (
        <AudioPlayer
          audioElement={audioRef.current!}
          surahNumber={surahNumber}
          surahName={surahName}
          totalAyahs={ayahs.length}
          startAyah={audioStartAyah}
          onAyahChange={setAudioCurrentAyah}
          onWordChange={setAudioCurrentWordPos}
          onClose={closeAudioMode}
        />
      )}
    </div>
  );
}
