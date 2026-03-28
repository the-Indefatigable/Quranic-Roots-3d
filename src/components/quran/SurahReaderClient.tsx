'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { WordPopover, type WordData } from './WordPopover';
import { TafsirPanel } from './TafsirPanel';
import { AudioPlayer, type PlayMode, type LoopMode } from './AudioPlayer';

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
  const { quranSettings, updateQuranSettings, setLastRead, updateStreak } = useAppStore();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedWord, setSelectedWord] = useState<WordData | null>(null);
  const [wordAnchor, setWordAnchor] = useState<HTMLElement | null>(null);
  const [wordByWord, setWordByWord] = useState(hasWords);
  const [tafsirAyah, setTafsirAyah] = useState<number | null>(null);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  // Flat list of words for keyboard navigation
  const allWords = useMemo(() => {
    return ayahs.flatMap(a => a.words.filter(w => w.charType === 'word'));
  }, [ayahs]);

  // Keyboard navigation for words
  useEffect(() => {
    if (!selectedWord) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentIndex = allWords.findIndex(w => w.position === selectedWord.position);
        if (currentIndex === -1) return;
        
        // Arabic is RTL, so ArrowLeft visually moves to the "next" word in reading order
        const nextIndex = e.key === 'ArrowLeft' 
          ? Math.min(allWords.length - 1, currentIndex + 1)
          : Math.max(0, currentIndex - 1);
          
        if (nextIndex !== currentIndex) {
          const nextWord = allWords[nextIndex];
          setSelectedWord(nextWord);
          
          // Must wait for render to potentially mount the button if user navigated across ayahs
          // although in Word By Word mode they are all mounted.
          setTimeout(() => {
            const btn = document.getElementById(`word-btn-${nextWord.position}`);
            if (btn) {
              // Calculate custom scroll boundary to leave room for the top nav and popover
              const rect = btn.getBoundingClientRect();
              const absoluteY = rect.top + window.scrollY;
              // If the word is near the top or bottom of the viewport, smooth scroll to it
              if (rect.top < 150 || rect.bottom > window.innerHeight - 150) {
                // Scroll first, then update anchor after scroll completes
                window.scrollTo({
                  top: absoluteY - window.innerHeight / 2,
                  behavior: 'smooth'
                });
                // Wait for scroll to complete before updating anchor to avoid race condition
                // with floating-ui's position recalculation
                const handleScrollEnd = () => {
                  setWordAnchor(btn);
                  window.removeEventListener('scrollend', handleScrollEnd);
                };
                if ('onscrollend' in window) {
                  window.addEventListener('scrollend', handleScrollEnd);
                } else {
                  // Fallback for browsers without scrollend event: smooth scroll takes ~300-400ms
                  setTimeout(() => setWordAnchor(btn), 500);
                }
              } else {
                // Word is already in viewport, just set anchor immediately
                setWordAnchor(btn);
              }
            }
          }, 10);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedWord, allWords]);

  // Track daily streak on load
  useEffect(() => {
    updateStreak();
  }, [updateStreak]);

  // Track reading progress passively
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const visibleAyah = getVisibleAyahNumber(ayahs);
        setLastRead(surahNumber, visibleAyah);
      }, 1000); // Debounce to avoid spamming local storage
    };
    
    // Save initial load position and attach listener
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [ayahs, surahNumber, setLastRead]);

  // Audio mode
  const [audioMode, setAudioMode] = useState(false);
  const [audioStartAyah, setAudioStartAyah] = useState(1);
  const [audioCurrentAyah, setAudioCurrentAyah] = useState<number | null>(null);
  const [audioCurrentWordPos, setAudioCurrentWordPos] = useState<number | null>(null);
  const [audioPlayMode, setAudioPlayMode] = useState<PlayMode>('ayah');
  const [audioLoopMode, setAudioLoopMode] = useState<LoopMode>('none');

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

  const openAudioMode = useCallback((fromAyah?: number) => {
    // Unlock the audio element RIGHT HERE inside the user gesture —
    // iOS Safari only allows play() when called synchronously from a click.
    if (audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
    const startAyah = fromAyah ?? getVisibleAyahNumber(ayahs);
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
                ? 'bg-primary-light text-primary'
                : 'bg-surface text-text-tertiary hover:text-text'
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
          onClick={() => audioMode ? closeAudioMode() : openAudioMode()}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            audioMode
              ? 'bg-primary-light text-primary'
              : 'bg-surface text-text-tertiary hover:text-text'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={audioMode ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
          Listen
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text transition-colors bg-surface px-3 py-1.5 rounded-lg"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
          </svg>
          Settings
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="bg-surface border border-border rounded-2xl p-4 sm:p-5 mb-8 flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-tertiary">Font size</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateQuranSettings({ fontSize: Math.max(20, quranSettings.fontSize - 2) })}
                className="w-7 h-7 rounded-lg bg-border-light text-text-secondary hover:text-text text-sm transition-colors"
              >
                −
              </button>
              <span className="text-xs text-text-secondary w-8 text-center">{quranSettings.fontSize}</span>
              <button
                onClick={() => updateQuranSettings({ fontSize: Math.min(48, quranSettings.fontSize + 2) })}
                className="w-7 h-7 rounded-lg bg-border-light text-text-secondary hover:text-text text-sm transition-colors"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-text-tertiary">Translation</span>
            <button
              onClick={() => updateQuranSettings({ showTranslation: !quranSettings.showTranslation })}
              className={`w-9 h-5 rounded-full transition-colors relative ${
                quranSettings.showTranslation ? 'bg-primary' : 'bg-border'
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
          const showWordHighlight = isActiveAyah;
          return (
            <div
              key={ayah.number}
              id={`ayah-${ayah.number}`}
              className={`group transition-all duration-300 rounded-2xl ${
                isActiveAyah
                  ? 'bg-primary/[0.06] ring-1 ring-primary/20 px-3 -mx-3'
                  : ''
              }`}
            >
              <div className="flex items-start gap-3 pt-1">
                <span className={`shrink-0 w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs font-medium mt-1 transition-colors ${
                  isActiveAyah ? 'bg-primary text-white' : 'bg-primary-light text-primary'
                }`}>
                  {ayah.number}
                </span>

                <div className="flex-1">
                  {/* Word-by-word mode (forced on when audio plays this ayah in ayah mode) */}
                  {(wordByWord || showWordHighlight) && ayah.words.length > 0 ? (
                    <div className="flex flex-wrap gap-x-3 gap-y-4 justify-end" dir="rtl">
                      {ayah.words
                        .filter((w) => w.charType === 'word')
                        .map((word) => {
                          const isActiveWord = showWordHighlight && audioCurrentWordPos === word.position;
                          return (
                            <button
                              id={`word-btn-${word.position}`}
                              key={word.position}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setSelectedWord(word); 
                                setWordAnchor(e.currentTarget); 
                              }}
                              className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-xl cursor-pointer group/word border transition-all duration-200 ${
                                isActiveWord
                                  ? 'bg-primary-light border-primary/30 -translate-y-1.5 scale-105'
                                  : 'border-transparent hover:bg-primary-light hover:border-primary/20'
                              }`}
                            >
                              <span
                                className={`font-arabic leading-loose transition-colors ${
                                  isActiveWord ? 'text-primary' : 'text-text group-hover/word:text-primary'
                                }`}
                                style={{ fontSize: `${quranSettings.fontSize}px` }}
                              >
                                {word.textUthmani}
                              </span>
                              {word.translation && (
                                <span className="text-[10px] text-text-secondary leading-tight max-w-[80px] text-center truncate">
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
                      className="font-arabic text-text leading-[2.4] text-right"
                      dir="rtl"
                      style={{ fontSize: `${quranSettings.fontSize}px` }}
                    >
                      {ayah.textUthmani}
                    </p>
                  )}

                  {/* Translation */}
                  {quranSettings.showTranslation && ayah.translation && (
                    <p className="text-sm text-text-secondary leading-relaxed mt-3" dir="ltr">
                      {ayah.translation}
                    </p>
                  )}
                </div>
              </div>

              {/* Ayah actions */}
              <div className="flex justify-end gap-2 mt-3 pb-1">
                <button
                  onClick={() => openAudioMode(ayah.number)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                    isActiveAyah
                      ? 'text-primary bg-primary/[0.12]'
                      : 'text-text-tertiary hover:text-text-secondary bg-surface hover:bg-border-light'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill={isActiveAyah ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                  </svg>
                  Listen
                </button>
                {hasTafsir && (
                  <button
                    onClick={() => setTafsirAyah(ayah.number)}
                    className="flex items-center gap-1.5 text-xs text-primary/70 hover:text-primary active:text-primary bg-primary/[0.08] hover:bg-primary/[0.12] px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                    </svg>
                    Tafsir
                  </button>
                )}
                <button
                  onClick={() => shareAyah(surahNumber, ayah.number, setCopiedAyah)}
                  className="flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary bg-surface hover:bg-border-light px-3 py-1.5 rounded-lg transition-colors"
                >
                  {copiedAyah === ayah.number ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-correct" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                      <span className="text-correct">Copied</span>
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

              <div className="border-b border-border-light mt-3" />
            </div>
          );
        })}
      </div>

      {/* End of surah */}
      {ayahs.length > 0 && (
        <div className="text-center mt-12">
          <p className="font-arabic text-lg text-primary/30">صَدَقَ ٱللَّهُ ٱلْعَظِيمُ</p>
          <p className="text-xs text-text-tertiary mt-2">End of Surah {surahNumber}</p>
        </div>
      )}

      {/* Modals & Popovers */}
      <WordPopover
        word={selectedWord}
        anchorElement={wordAnchor}
        onClose={() => { setSelectedWord(null); setWordAnchor(null); }}
      />
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
          key={audioStartAyah}
          audioElement={audioRef.current!}
          surahNumber={surahNumber}
          surahName={surahName}
          totalAyahs={ayahs.length}
          startAyah={audioStartAyah}
          playMode={audioPlayMode}
          loopMode={audioLoopMode}
          onAyahChange={setAudioCurrentAyah}
          onWordChange={setAudioCurrentWordPos}
          onClose={closeAudioMode}
          onPlayModeChange={setAudioPlayMode}
          onLoopModeChange={setAudioLoopMode}
        />
      )}
    </div>
  );
}
