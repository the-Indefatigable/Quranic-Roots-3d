'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface AyahAudio {
  ayahNumber: number;
  url: string;
  segments: [number, number, number][]; // [wordPos, startMs, endMs]
}

/** For surah mode: flattened segment with absolute timing in the chapter audio */
interface ChapterSegment {
  ayahNumber: number;
  wordPos: number;
  startMs: number;
  endMs: number;
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
  const chapterAudioUrlRef = useRef<string | null>(null);
  const chapterSegmentsRef = useRef<ChapterSegment[]>([]);
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
  // Track if we're currently using the chapter audio src
  const usingSurahAudioRef = useRef(false);

  // Fetch timing data for whole surah once
  useEffect(() => {
    fetch(`/api/audio/timings/${surahNumber}`)
      .then((r) => r.json())
      .then((data) => {
        // Support both old format (array) and new format ({ ayahs, chapterAudioUrl })
        const ayahList: AyahAudio[] = Array.isArray(data) ? data : data.ayahs ?? [];
        const map = new Map<number, AyahAudio>();
        for (const d of ayahList) map.set(d.ayahNumber, d);
        ayahDataRef.current = map;

        // Store chapter audio URL
        if (!Array.isArray(data) && data.chapterAudioUrl) {
          chapterAudioUrlRef.current = data.chapterAudioUrl;
        }

        // Use chapter-level verse timings from the API (absolute timestamps)
        // These are perfectly aligned with the chapter audio file
        const chapterTimings = data.chapterVerseTimings ?? [];
        if (chapterTimings.length > 0) {
          const allSegments: ChapterSegment[] = [];
          for (const vt of chapterTimings) {
            for (const [wordPos, startMs, endMs] of vt.segments) {
              allSegments.push({
                ayahNumber: vt.ayahNumber,
                wordPos,
                startMs,
                endMs,
              });
            }
          }
          chapterSegmentsRef.current = allSegments;
        } else {
          // Fallback: estimate from per-ayah data (less accurate)
          const sortedAyahs = [...ayahList].sort((a, b) => a.ayahNumber - b.ayahNumber);
          let cumulativeOffset = 0;
          const allSegments: ChapterSegment[] = [];
          for (const ayah of sortedAyahs) {
            for (const [wordPos, startMs, endMs] of ayah.segments) {
              allSegments.push({
                ayahNumber: ayah.ayahNumber,
                wordPos,
                startMs: startMs + cumulativeOffset,
                endMs: endMs + cumulativeOffset,
              });
            }
            const lastSeg = ayah.segments[ayah.segments.length - 1];
            if (lastSeg) {
              cumulativeOffset += lastSeg[2] + 200;
            }
          }
          chapterSegmentsRef.current = allSegments;
        }

        setTimingsLoaded(true);
      })
      .catch(() => {
        setTimingsError(true);
        setTimingsLoaded(true);
      });
  }, [surahNumber]);

  // Load and play a specific ayah (per-ayah mode)
  const playAyah = useCallback((ayahNumber: number) => {
    const audio = audioElement;
    const ayahData = ayahDataRef.current.get(ayahNumber);
    const src = ayahData?.url
      ?? `https://everyayah.com/data/Alafasy_128kbps/${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;

    usingSurahAudioRef.current = false;
    audio.src = src;
    audio.load();
    audio.play().catch(() => setIsPlaying(false));
    setCurrentAyah(ayahNumber);
    setIsPlaying(true);
    setProgress(0);
    onAyahChangeRef.current(ayahNumber);
    onWordChangeRef.current(null);
  }, [audioElement, surahNumber]);

  // Load and play full chapter audio (surah mode)
  const playSurahAudio = useCallback((seekToAyah?: number) => {
    const audio = audioElement;
    const url = chapterAudioUrlRef.current;
    if (!url) {
      // Fallback: play per-ayah if chapter audio unavailable
      playAyah(seekToAyah ?? startAyah);
      return;
    }

    usingSurahAudioRef.current = true;
    audio.src = url;
    audio.load();

    // If seeking to a specific ayah, calculate the offset
    if (seekToAyah && seekToAyah > 1) {
      const firstSegOfAyah = chapterSegmentsRef.current.find(
        (s) => s.ayahNumber === seekToAyah
      );
      if (firstSegOfAyah) {
        audio.currentTime = firstSegOfAyah.startMs / 1000;
      }
    }

    audio.play().catch(() => setIsPlaying(false));
    setCurrentAyah(seekToAyah ?? startAyah);
    setIsPlaying(true);
    setProgress(0);
    onAyahChangeRef.current(seekToAyah ?? startAyah);
    onWordChangeRef.current(null);
  }, [audioElement, playAyah, startAyah]);

  // On mount: start playback based on mode
  useEffect(() => {
    if (playModeRef.current === 'surah') {
      // Wait for timings to load so we have the chapter URL
      const checkAndPlay = () => {
        if (chapterAudioUrlRef.current) {
          playSurahAudio(startAyah);
        } else {
          playAyah(startAyah);
        }
      };
      // If timings already loaded, play now; otherwise wait a bit
      if (timingsLoaded) {
        checkAndPlay();
      } else {
        // Start with per-ayah immediately, switch to chapter when loaded
        playAyah(startAyah);
      }
    } else {
      playAyah(startAyah);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When play mode changes, switch audio source
  useEffect(() => {
    if (!timingsLoaded) return;
    if (playMode === 'surah' && !usingSurahAudioRef.current) {
      playSurahAudio(currentAyah);
    } else if (playMode === 'ayah' && usingSurahAudioRef.current) {
      playAyah(currentAyah);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playMode, timingsLoaded]);

  // Audio event handlers
  useEffect(() => {
    const audio = audioElement;

    function handleTimeUpdate() {
      const pct = audio.duration ? audio.currentTime / audio.duration : 0;
      setProgress(pct);

      if (usingSurahAudioRef.current) {
        // Surah mode: find current segment from chapter-level timing
        const ms = audio.currentTime * 1000;
        const segments = chapterSegmentsRef.current;

        // Find which ayah we're in
        let foundAyah: number | null = null;
        let foundWord: number | null = null;

        for (let i = segments.length - 1; i >= 0; i--) {
          if (ms >= segments[i].startMs) {
            foundAyah = segments[i].ayahNumber;
            if (ms < segments[i].endMs) {
              foundWord = segments[i].wordPos;
            }
            break;
          }
        }

        if (foundAyah && foundAyah !== currentAyah) {
          setCurrentAyah(foundAyah);
          onAyahChangeRef.current(foundAyah);
        }
        onWordChangeRef.current(foundWord);
      } else {
        // Ayah mode: word highlighting from per-ayah segments
        const ms = audio.currentTime * 1000;
        const segments = ayahDataRef.current.get(currentAyah)?.segments ?? [];
        const active = segments.find(([, start, end]) => ms >= start && ms < end);
        onWordChangeRef.current(active ? active[0] : null);
      }
    }

    function handleEnded() {
      setIsPlaying(false);
      onWordChangeRef.current(null);

      const loop = loopModeRef.current;

      if (usingSurahAudioRef.current) {
        // Surah audio ended — the whole surah finished
        if (loop === 'surah') {
          setTimeout(() => playSurahAudio(1), 300);
        }
        // loop === 'ayah' doesn't apply to surah audio track
        return;
      }

      // Per-ayah mode
      if (loop === 'ayah') {
        setTimeout(() => playAyah(currentAyah), 300);
        return;
      }

      if (currentAyah < totalAyahs) {
        const next = currentAyah + 1;
        setCurrentAyah(next);
        setTimeout(() => playAyah(next), 300);
      } else if (loop === 'surah') {
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
  }, [audioElement, currentAyah, totalAyahs, playAyah, playSurahAudio]);

  function togglePlay() {
    const audio = audioElement;
    if (audio.src) {
      isPlaying ? audio.pause() : audio.play().catch(() => {});
    } else if (playMode === 'surah') {
      playSurahAudio(currentAyah);
    } else {
      playAyah(currentAyah);
    }
  }

  function prevAyah() {
    if (currentAyah <= 1) return;
    const prev = currentAyah - 1;
    if (usingSurahAudioRef.current) {
      // Seek in chapter audio
      const seg = chapterSegmentsRef.current.find((s) => s.ayahNumber === prev);
      if (seg) {
        audioElement.currentTime = seg.startMs / 1000;
        setCurrentAyah(prev);
        onAyahChangeRef.current(prev);
        if (!isPlaying) audioElement.play().catch(() => {});
      }
    } else {
      playAyah(prev);
    }
  }

  function nextAyah() {
    if (currentAyah >= totalAyahs) return;
    const next = currentAyah + 1;
    if (usingSurahAudioRef.current) {
      const seg = chapterSegmentsRef.current.find((s) => s.ayahNumber === next);
      if (seg) {
        audioElement.currentTime = seg.startMs / 1000;
        setCurrentAyah(next);
        onAyahChangeRef.current(next);
        if (!isPlaying) audioElement.play().catch(() => {});
      }
    } else {
      playAyah(next);
    }
  }

  function startFromBeginning() {
    if (usingSurahAudioRef.current) {
      audioElement.currentTime = 0;
      setCurrentAyah(1);
      onAyahChangeRef.current(1);
      if (!isPlaying) audioElement.play().catch(() => {});
    } else {
      playAyah(1);
    }
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
            title={playMode === 'ayah' ? 'Per-ayah with word highlighting' : 'Full surah continuous playback'}
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
