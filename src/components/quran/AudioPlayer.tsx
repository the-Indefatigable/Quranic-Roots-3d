'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AyahAudio {
  ayahNumber: number;
  url: string;
  segments: [number, number, number][]; // [wordPos, startMs, endMs]
}

interface Props {
  audioElement: HTMLAudioElement;
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  startAyah: number;
  onAyahChange: (ayahNumber: number) => void;
  onWordChange: (wordPos: number | null) => void;
  onClose: () => void;
}

export function AudioPlayer({
  audioElement,
  surahNumber,
  surahName,
  totalAyahs,
  startAyah,
  onAyahChange,
  onWordChange,
  onClose,
}: Props) {
  const ayahDataRef = useRef<Map<number, AyahAudio>>(new Map());
  const onAyahChangeRef = useRef(onAyahChange);
  const onWordChangeRef = useRef(onWordChange);
  onAyahChangeRef.current = onAyahChange;
  onWordChangeRef.current = onWordChange;

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

  // On mount: the audio element was already unlocked by the click handler in
  // SurahReaderClient, so we can safely load a src and play now.
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

      const ms = audio.currentTime * 1000;
      const segments = ayahDataRef.current.get(currentAyah)?.segments ?? [];
      const active = segments.find(([, start, end]) => ms >= start && ms < end);
      onWordChangeRef.current(active ? active[0] : null);
    }

    function handleEnded() {
      setIsPlaying(false);
      onWordChangeRef.current(null);
      if (currentAyah < totalAyahs) {
        const next = currentAyah + 1;
        setCurrentAyah(next);
        setTimeout(() => playAyah(next), 300);
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

        <div className="bg-card/95 backdrop-blur-xl border-t border-white/[0.06] px-4 py-3 flex items-center gap-4">
          {/* Controls */}
          <div className="flex items-center gap-2">
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
