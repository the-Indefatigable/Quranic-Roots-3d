'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AyahAudio {
  ayahNumber: number;
  url: string;
  segments: [number, number, number][]; // [wordPos, startMs, endMs]
}

export type PlayMode = 'ayah' | 'surah';
export type LoopMode = 'none' | 'ayah' | 'surah';

interface Props {
  audioElement: HTMLAudioElement;
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  startAyah: number;
  playMode: PlayMode;
  loopMode: LoopMode;
  onAyahChange: (ayahNumber: number) => void;
  onWordChange: (wordPos: number | null) => void;
  onClose: () => void;
  onPlayModeChange: (mode: PlayMode) => void;
  onLoopModeChange: (mode: LoopMode) => void;
}

export function AudioPlayer({
  audioElement,
  surahNumber,
  surahName,
  totalAyahs,
  startAyah,
  playMode,
  loopMode,
  onAyahChange,
  onWordChange,
  onClose,
  onPlayModeChange,
  onLoopModeChange,
}: Props) {
  const ayahDataRef = useRef<Map<number, AyahAudio>>(new Map());
  const onAyahChangeRef = useRef(onAyahChange);
  const onWordChangeRef = useRef(onWordChange);
  onAyahChangeRef.current = onAyahChange;
  onWordChangeRef.current = onWordChange;

  const playModeRef = useRef(playMode);
  const loopModeRef = useRef(loopMode);
  playModeRef.current = playMode;
  loopModeRef.current = loopMode;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyah, setCurrentAyah] = useState(startAyah);
  const [progress, setProgress] = useState(0);
  const [timingsLoaded, setTimingsLoaded] = useState(false);
  const [timingsError, setTimingsError] = useState(false);

  // Fetch timing data for whole surah once
  useEffect(() => {
    fetch(`/api/audio/timings/${surahNumber}`)
      .then((r) => r.json())
      .then((data: AyahAudio[]) => {
        if (!Array.isArray(data)) throw new Error('bad response');
        const map = new Map<number, AyahAudio>();
        for (const d of data) map.set(d.ayahNumber, d);
        ayahDataRef.current = map;
        setTimingsLoaded(true);
      })
      .catch(() => {
        setTimingsError(true);
        setTimingsLoaded(true);
      });
  }, [surahNumber]);

  // Load and play a specific ayah
  const playAyah = useCallback((ayahNumber: number) => {
    const audio = audioElement;
    const ayahData = ayahDataRef.current.get(ayahNumber);
    const src = ayahData?.url
      ?? `https://everyayah.com/data/Alafasy_128kbps/${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;

    audio.src = src;
    audio.load();
    audio.play().catch(() => setIsPlaying(false));
    setCurrentAyah(ayahNumber);
    setIsPlaying(true);
    setProgress(0);
    onAyahChangeRef.current(ayahNumber);
    onWordChangeRef.current(null);
  }, [audioElement, surahNumber]);

  // On mount: play the starting ayah
  useEffect(() => {
    playAyah(startAyah);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Audio event handlers
  useEffect(() => {
    const audio = audioElement;

    function handleTimeUpdate() {
      const pct = audio.duration ? audio.currentTime / audio.duration : 0;
      setProgress(pct);

      // Word highlighting only in ayah mode
      if (playModeRef.current === 'ayah') {
        const ms = audio.currentTime * 1000;
        const segments = ayahDataRef.current.get(currentAyah)?.segments ?? [];
        const active = segments.find(([, start, end]) => ms >= start && ms < end);
        onWordChangeRef.current(active ? active[0] : null);
      } else {
        onWordChangeRef.current(null);
      }
    }

    function handleEnded() {
      setIsPlaying(false);
      onWordChangeRef.current(null);

      const loop = loopModeRef.current;

      // Loop current ayah
      if (loop === 'ayah') {
        setTimeout(() => playAyah(currentAyah), 300);
        return;
      }

      // Continue to next ayah
      if (currentAyah < totalAyahs) {
        const next = currentAyah + 1;
        setCurrentAyah(next);
        setTimeout(() => playAyah(next), 300);
      } else if (loop === 'surah') {
        // Loop whole surah — restart from ayah 1
        setTimeout(() => playAyah(1), 300);
      }
    }

    function handlePlay() { setIsPlaying(true); }
    function handlePause() { setIsPlaying(false); }

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioElement, currentAyah, totalAyahs, playAyah]);

  function togglePlay() {
    const audio = audioElement;
    if (audio.src) {
      isPlaying ? audio.pause() : audio.play().catch(() => {});
    } else {
      playAyah(currentAyah);
    }
  }

  function prevAyah() {
    if (currentAyah > 1) playAyah(currentAyah - 1);
  }

  function nextAyah() {
    if (currentAyah < totalAyahs) playAyah(currentAyah + 1);
  }

  function startFromBeginning() {
    playAyah(1);
  }

  function cycleLoop() {
    const order: LoopMode[] = ['none', 'ayah', 'surah'];
    const idx = order.indexOf(loopMode);
    onLoopModeChange(order[(idx + 1) % order.length]);
  }

  const loopLabel = loopMode === 'ayah' ? '1' : loopMode === 'surah' ? '∞' : '';

  return (
    <>
      {/* Floating player bar */}
      <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-60 z-30">
        {/* Progress bar */}
        <div className="h-[2px] bg-white/[0.06] w-full">
          <div
            className="h-full bg-gold/70 transition-all duration-100"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="bg-card/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3 flex items-center gap-3">
          {/* Transport controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevAyah}
              disabled={currentAyah <= 1}
              className="w-8 h-8 flex items-center justify-center text-muted-more hover:text-white disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>

            <button
              onClick={togglePlay}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gold text-black hover:brightness-110 transition-all"
            >
              {isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={nextAyah}
              disabled={currentAyah >= totalAyahs}
              className="w-8 h-8 flex items-center justify-center text-muted-more hover:text-white disabled:opacity-30 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          {/* Surah + ayah info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-white font-medium truncate">{surahName}</p>
            <p className="text-[10px] text-muted-more">
              Ayah {currentAyah} of {totalAyahs}
              {timingsError && ' · word sync unavailable'}
            </p>
          </div>

          {/* Play mode toggle: Ayah / Surah */}
          <button
            onClick={() => onPlayModeChange(playMode === 'ayah' ? 'surah' : 'ayah')}
            className={`text-[10px] font-medium px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
              playMode === 'surah'
                ? 'bg-gold/15 text-gold'
                : 'bg-white/[0.05] text-muted-more hover:text-white'
            }`}
            title={playMode === 'ayah' ? 'Playing per-ayah with word highlighting' : 'Playing full surah continuously'}
          >
            {playMode === 'ayah' ? 'Ayah' : 'Surah'}
          </button>

          {/* Loop toggle */}
          <button
            onClick={cycleLoop}
            className={`relative w-7 h-7 flex items-center justify-center rounded-md transition-colors ${
              loopMode !== 'none'
                ? 'bg-gold/15 text-gold'
                : 'text-muted-more hover:text-white'
            }`}
            title={
              loopMode === 'none' ? 'Loop off' :
              loopMode === 'ayah' ? 'Looping current ayah' :
              'Looping full surah'
            }
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
            </svg>
            {loopLabel && (
              <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold leading-none text-gold">
                {loopLabel}
              </span>
            )}
          </button>

          {/* Start from top */}
          {currentAyah > 1 && (
            <button
              onClick={startFromBeginning}
              className="text-[10px] text-muted-more hover:text-gold transition-colors whitespace-nowrap hidden sm:block"
            >
              ↑ From start
            </button>
          )}

          {/* Close */}
          <button
            onClick={() => {
              audioElement.pause();
              onClose();
            }}
            className="w-7 h-7 flex items-center justify-center text-muted-more hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
