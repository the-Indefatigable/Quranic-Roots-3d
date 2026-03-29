'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AudioVisualizer } from './AudioVisualizer';
import { QARI_LIBRARY, getDefaultQari, getQariById, buildAyahAudioUrl, type QariInfo } from '@/lib/audio/qariLibrary';

type ExpandedTab = 'lyrics' | 'analysis' | 'pitch' | 'practice';

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

interface AyahDisplay {
  number: number;
  textUthmani: string;
  translation?: string;
}

interface Props {
  audioElement: HTMLAudioElement;
  surahNumber: number;
  surahName: string;
  totalAyahs: number;
  startAyah: number;
  playMode: PlayMode;
  loopMode: LoopMode;
  ayahs: AyahDisplay[];
  onAyahChange: (ayahNumber: number) => void;
  onWordChange: (wordPos: number | null) => void;
  onClose: () => void;
  onPlayModeChange: (mode: PlayMode) => void;
  onLoopModeChange: (mode: LoopMode) => void;
  /** Currently selected qari (optional — defaults to Al-Afasy) */
  selectedQariId?: string;
  /** Callback when user selects a different qari */
  onQariChange?: (qariId: string) => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5] as const;

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Animated equalizer bars shown when playing */
function PlayingAnimation({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-end gap-[3px] h-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full bg-primary transition-all ${
            isPlaying ? 'animate-equalizer' : 'h-1'
          }`}
          style={{
            animationDelay: isPlaying ? `${i * 0.12}s` : undefined,
            height: isPlaying ? undefined : '4px',
          }}
        />
      ))}
    </div>
  );
}

export function AudioPlayer({
  audioElement,
  surahNumber,
  surahName,
  totalAyahs,
  startAyah,
  playMode,
  loopMode,
  ayahs: ayahsList,
  onAyahChange,
  onWordChange,
  onClose,
  onPlayModeChange,
  onLoopModeChange,
  selectedQariId,
  onQariChange,
}: Props) {
  // Qari state
  const selectedQari: QariInfo = getQariById(selectedQariId ?? '') ?? getDefaultQari();
  const [showQariMenu, setShowQariMenu] = useState(false);
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
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [timingsLoaded, setTimingsLoaded] = useState(false);
  const [timingsError, setTimingsError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expandedTab, setExpandedTab] = useState<ExpandedTab>('lyrics');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackSpeedRef = useRef(1);
  const [volume, setVolume] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const usingSurahAudioRef = useRef(false);
  const preloadedAudioRef = useRef<HTMLAudioElement | null>(null);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const volumeBarRef = useRef<HTMLDivElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lastScrolledAyahRef = useRef<number | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Set up audio analysis using captureStream() — this captures a COPY of the
  // audio for analysis without hijacking the element's normal output.
  // Only called when user clicks a visualizer tab (user gesture → AudioContext allowed).
  const ensureAnalyser = useCallback(() => {
    if (analyserNode) return analyserNode;
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;

      // Try captureStream first (non-destructive, preserves normal playback)
      const el = audioElement as any;
      const captureFn = el.captureStream ?? el.mozCaptureStream;
      if (captureFn) {
        const stream = captureFn.call(el) as MediaStream;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
        // Don't connect to destination — audio plays normally from element
      } else {
        // Fallback: createMediaElementSource (hijacks audio routing)
        const source = ctx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(ctx.destination); // Must route to output since element is hijacked
      }

      setAnalyserNode(analyser);
      return analyser;
    } catch (e) {
      console.warn('Audio visualizer setup failed:', e);
      return null;
    }
  }, [audioElement, analyserNode]);

  // ---------- Data fetching (unchanged logic) ----------
  useEffect(() => {
    fetch(`/api/audio/timings/${surahNumber}?recitationId=${selectedQari.quranComRecitationId}`)
      .then((r) => r.json())
      .then((data) => {
        const ayahList: AyahAudio[] = Array.isArray(data) ? data : data.ayahs ?? [];
        const map = new Map<number, AyahAudio>();
        for (const d of ayahList) map.set(d.ayahNumber, d);
        ayahDataRef.current = map;

        if (!Array.isArray(data) && data.chapterAudioUrl) {
          chapterAudioUrlRef.current = data.chapterAudioUrl;
        }

        const chapterTimings = data.chapterVerseTimings ?? [];
        if (chapterTimings.length > 0) {
          const allSegments: ChapterSegment[] = [];
          for (const vt of chapterTimings) {
            for (const [wordPos, startMs, endMs] of vt.segments) {
              allSegments.push({ ayahNumber: vt.ayahNumber, wordPos, startMs, endMs });
            }
          }
          chapterSegmentsRef.current = allSegments;
        } else {
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
            if (lastSeg) cumulativeOffset += lastSeg[2] + 200;
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

  // ---------- Playback logic (unchanged) ----------
  const preloadNextAyah = useCallback((currentAyahNumber: number) => {
    const nextAyah = currentAyahNumber + 1;
    if (nextAyah > totalAyahs) return;
    const nextData = ayahDataRef.current.get(nextAyah);
    const nextSrc = nextData?.url
      ?? buildAyahAudioUrl(selectedQari, surahNumber, nextAyah);
    const preload = new Audio();
    preload.preload = 'auto';
    preload.src = nextSrc;
    preloadedAudioRef.current = preload;
  }, [surahNumber, totalAyahs]);

  const playAyah = useCallback((ayahNumber: number) => {
    const audio = audioElement;
    const ayahData = ayahDataRef.current.get(ayahNumber);
    const src = ayahData?.url
      ?? buildAyahAudioUrl(selectedQari, surahNumber, ayahNumber);

    usingSurahAudioRef.current = false;
    audio.src = src;
    audio.load();
    audio.playbackRate = playbackSpeedRef.current;
    audio.play().catch(() => setIsPlaying(false));
    setCurrentAyah(ayahNumber);
    setIsPlaying(true);
    setProgress(0);
    onAyahChangeRef.current(ayahNumber);
    onWordChangeRef.current(null);
    preloadNextAyah(ayahNumber);
  }, [audioElement, surahNumber, preloadNextAyah]);

  const playSurahAudio = useCallback((seekToAyah?: number) => {
    const audio = audioElement;
    const url = chapterAudioUrlRef.current;
    if (!url) {
      playAyah(seekToAyah ?? startAyah);
      return;
    }

    usingSurahAudioRef.current = true;
    audio.src = url;
    audio.load();
    audio.playbackRate = playbackSpeedRef.current;

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

  useEffect(() => {
    if (playModeRef.current === 'surah') {
      if (timingsLoaded) {
        if (chapterAudioUrlRef.current) {
          playSurahAudio(startAyah);
        } else {
          playAyah(startAyah);
        }
      }
    } else {
      playAyah(startAyah);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!timingsLoaded) return;
    if (playMode === 'surah' && !usingSurahAudioRef.current) {
      playSurahAudio(currentAyah);
    } else if (playMode === 'ayah' && usingSurahAudioRef.current) {
      playAyah(currentAyah);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playMode, timingsLoaded]);

  // ---------- Audio event handlers ----------
  useEffect(() => {
    const audio = audioElement;

    function handleTimeUpdate() {
      if (!isSeeking) {
        const pct = audio.duration ? audio.currentTime / audio.duration : 0;
        setProgress(pct);
        setCurrentTime(audio.currentTime);
        setDuration(audio.duration || 0);
      }

      if (usingSurahAudioRef.current) {
        const ms = audio.currentTime * 1000;
        const segments = chapterSegmentsRef.current;
        let foundAyah: number | null = null;
        let foundWord: number | null = null;

        for (let i = segments.length - 1; i >= 0; i--) {
          if (ms >= segments[i].startMs) {
            foundAyah = segments[i].ayahNumber;
            if (ms < segments[i].endMs) foundWord = segments[i].wordPos;
            break;
          }
        }

        if (foundAyah && foundAyah !== currentAyah) {
          setCurrentAyah(foundAyah);
          onAyahChangeRef.current(foundAyah);
        }
        onWordChangeRef.current(foundWord);
      } else {
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
        if (loop === 'surah') playSurahAudio(1);
        return;
      }

      if (loop === 'ayah') { playAyah(currentAyah); return; }
      if (currentAyah < totalAyahs) {
        const next = currentAyah + 1;
        setCurrentAyah(next);
        playAyah(next);
      } else if (loop === 'surah') {
        playAyah(1);
      }
    }

    function handlePlay() {
      setIsPlaying(true);
      // Resume AudioContext if we have one for visualization
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
    }
    function handlePause() { setIsPlaying(false); }
    function handleLoadedMetadata() { setDuration(audio.duration || 0); }

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioElement, currentAyah, totalAyahs, playAyah, playSurahAudio, isSeeking]);

  // ---------- Controls ----------
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

  function cycleSpeed() {
    const idx = SPEED_OPTIONS.indexOf(playbackSpeed as typeof SPEED_OPTIONS[number]);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    playbackSpeedRef.current = next;
    setPlaybackSpeed(next);
    audioElement.playbackRate = next;
  }

  function seekToAyah(ayahNumber: number) {
    if (usingSurahAudioRef.current) {
      const seg = chapterSegmentsRef.current.find((s) => s.ayahNumber === ayahNumber);
      if (seg) {
        audioElement.currentTime = seg.startMs / 1000;
        setCurrentAyah(ayahNumber);
        onAyahChangeRef.current(ayahNumber);
        if (!isPlaying) audioElement.play().catch(() => {});
      }
    } else {
      playAyah(ayahNumber);
    }
  }

  // Auto-scroll lyrics to current ayah in expanded view
  useEffect(() => {
    if (!expanded || !lyricsContainerRef.current) return;
    if (lastScrolledAyahRef.current === currentAyah) return;
    lastScrolledAyahRef.current = currentAyah;
    const el = lyricsContainerRef.current.querySelector(`[data-ayah="${currentAyah}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [expanded, currentAyah]);

  function handleSeek(clientX: number) {
    if (!seekBarRef.current) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setProgress(pct);
    if (audioElement.duration) {
      audioElement.currentTime = pct * audioElement.duration;
      setCurrentTime(pct * audioElement.duration);
    }
  }

  function handleVolumeChange(clientX: number) {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const vol = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setVolume(vol);
    audioElement.volume = vol;
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          if (e.shiftKey) { nextAyah(); e.preventDefault(); }
          break;
        case 'ArrowLeft':
          if (e.shiftKey) { prevAyah(); e.preventDefault(); }
          break;
        case 'KeyF':
          setExpanded((v) => !v);
          break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentAyah]);

  // Close speed menu on outside click
  useEffect(() => {
    if (!showSpeedMenu) return;
    const handler = () => setShowSpeedMenu(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showSpeedMenu]);

  const loopLabel = loopMode === 'ayah' ? '1' : loopMode === 'surah' ? '\u221E' : '';

  // SSR guard
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // ---------- Seekbar component ----------
  const SeekBar = ({ large }: { large?: boolean }) => (
    <div className="w-full flex flex-col gap-1">
      <div
        ref={seekBarRef}
        className={`relative w-full cursor-pointer group/seek ${large ? 'h-2' : 'h-1.5'} rounded-full bg-border`}
        onMouseDown={(e) => {
          setIsSeeking(true);
          handleSeek(e.clientX);
          const onMove = (ev: MouseEvent) => handleSeek(ev.clientX);
          const onUp = () => {
            setIsSeeking(false);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        onTouchStart={(e) => {
          setIsSeeking(true);
          handleSeek(e.touches[0].clientX);
          const onMove = (ev: TouchEvent) => handleSeek(ev.touches[0].clientX);
          const onEnd = () => {
            setIsSeeking(false);
            window.removeEventListener('touchmove', onMove);
            window.removeEventListener('touchend', onEnd);
          };
          window.addEventListener('touchmove', onMove);
          window.addEventListener('touchend', onEnd);
        }}
      >
        {/* Track fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-75"
          style={{ width: `${progress * 100}%` }}
        />
        {/* Thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-primary shadow-md transition-transform ${
            large
              ? 'w-4 h-4 group-hover/seek:scale-125'
              : 'w-3 h-3 opacity-0 group-hover/seek:opacity-100 group-hover/seek:scale-110'
          } ${isSeeking ? 'opacity-100 scale-125' : ''}`}
          style={{ left: `${progress * 100}%` }}
        />
      </div>
      {large && (
        <div className="flex justify-between text-[11px] text-text-tertiary tabular-nums">
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
        </div>
      )}
    </div>
  );

  // ---------- Volume control (desktop only) ----------
  const VolumeControl = () => (
    <div className="hidden lg:flex items-center gap-2">
      <button
        onClick={() => {
          const newVol = volume > 0 ? 0 : 1;
          setVolume(newVol);
          audioElement.volume = newVol;
        }}
        className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text transition-colors"
      >
        {volume === 0 ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-3.72a.75.75 0 0 1 1.28.53v14.88a.75.75 0 0 1-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        ) : volume < 0.5 ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-3.72a.75.75 0 0 1 1.28.53v14.88a.75.75 0 0 1-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-3.72a.75.75 0 0 1 1.28.53v14.88a.75.75 0 0 1-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        )}
      </button>
      <div
        ref={volumeBarRef}
        className="relative w-20 h-1.5 rounded-full bg-border cursor-pointer group/vol"
        onMouseDown={(e) => {
          handleVolumeChange(e.clientX);
          const onMove = (ev: MouseEvent) => handleVolumeChange(ev.clientX);
          const onUp = () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-text-tertiary group-hover/vol:bg-primary transition-colors"
          style={{ width: `${volume * 100}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-text opacity-0 group-hover/vol:opacity-100 transition-opacity"
          style={{ left: `${volume * 100}%` }}
        />
      </div>
    </div>
  );

  // ---------- EXPANDED (full-screen Now Playing) ----------
  if (expanded) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex flex-col bg-canvas transition-all duration-300 animate-slide-up">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <button
            onClick={() => setExpanded(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-border-light transition-colors"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          <div className="text-xs text-text-tertiary font-medium uppercase tracking-wider">
            Now Playing
          </div>
          <button
            onClick={() => {
              audioElement.pause();
              setExpanded(false);
              onClose();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-border-light transition-colors"
          >
            <svg className="w-5 h-5 text-text-secondary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Surah header + Qari selector */}
        <div className="text-center px-8 pt-2 pb-1">
          <h3 className="text-lg font-heading text-text">{surahName}</h3>
          <div className="relative inline-block">
            <button
              onClick={() => setShowQariMenu(!showQariMenu)}
              className="text-xs text-text-secondary hover:text-primary transition-colors flex items-center gap-1 mx-auto"
            >
              {selectedQari.name}
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary/70 font-medium">
                {selectedQari.styleLabel}
              </span>
              <svg className="w-3 h-3 text-text-tertiary" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            {showQariMenu && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-surface rounded-xl shadow-modal border border-border p-2 z-50">
                {QARI_LIBRARY.map((qari) => (
                  <button
                    key={qari.id}
                    onClick={() => {
                      onQariChange?.(qari.id);
                      setShowQariMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-3 ${
                      qari.id === selectedQari.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-text hover:bg-border-light'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{qari.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-border-light text-text-tertiary font-medium shrink-0">
                          {qari.styleLabel}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-tertiary mt-0.5 truncate">{qari.description}</p>
                    </div>
                    {qari.id === selectedQari.id && (
                      <svg className="w-4 h-4 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-text-tertiary mt-1">
            Ayah {currentAyah}/{totalAyahs}
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-center gap-1 px-6 py-2">
          {([
            { id: 'lyrics' as ExpandedTab, label: 'Lyrics', icon: (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
              </svg>
            )},
            { id: 'analysis' as ExpandedTab, label: 'Analysis', icon: (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.652a3.75 3.75 0 0 1 0-5.304m5.304 0a3.75 3.75 0 0 1 0 5.304m-7.425 2.121a6.75 6.75 0 0 1 0-9.546m9.546 0a6.75 6.75 0 0 1 0 9.546M5.106 18.894c-3.808-3.807-3.808-9.98 0-13.788m13.788 0c3.808 3.807 3.808 9.98 0 13.788" />
              </svg>
            )},
            { id: 'pitch' as ExpandedTab, label: 'Melody', icon: (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" />
              </svg>
            )},
            { id: 'practice' as ExpandedTab, label: 'Practice', icon: (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
              </svg>
            )},
          ]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id !== 'lyrics') ensureAnalyser();
                setExpandedTab(tab.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                expandedTab === tab.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-tertiary hover:text-text hover:bg-border-light'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content area */}
        {expandedTab === 'lyrics' ? (
          <div
            ref={lyricsContainerRef}
            className="flex-1 overflow-y-auto px-6 sm:px-8 min-h-0 scroll-smooth"
            style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)' }}
          >
            <div className="max-w-lg mx-auto py-8 space-y-5">
              {surahNumber !== 9 && surahNumber !== 1 && (
                <p className="font-arabic text-xl text-text-tertiary text-center pb-4 border-b border-border-light">
                  بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
                </p>
              )}
              {ayahsList.map((ayah) => {
                const isActive = ayah.number === currentAyah;
                return (
                  <button
                    key={ayah.number}
                    data-ayah={ayah.number}
                    onClick={() => seekToAyah(ayah.number)}
                    className={`w-full text-right rounded-2xl px-4 py-3 transition-all duration-300 border ${
                      isActive
                        ? 'bg-primary/[0.08] border-primary/20 scale-[1.02]'
                        : 'border-transparent hover:bg-border-light active:scale-[0.98]'
                    }`}
                    dir="rtl"
                  >
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-medium mt-1 transition-colors ${
                        isActive ? 'bg-primary text-white' : 'bg-border-light text-text-tertiary'
                      }`}>
                        {ayah.number}
                      </span>
                      <span
                        className={`font-arabic text-xl sm:text-2xl leading-[2] transition-colors ${
                          isActive ? 'text-primary' : 'text-text/70'
                        }`}
                      >
                        {ayah.textUthmani}
                      </span>
                    </div>
                    {ayah.translation && (
                      <p className={`text-xs leading-relaxed mt-2 text-left transition-colors ${
                        isActive ? 'text-text-secondary' : 'text-text-tertiary'
                      }`} dir="ltr">
                        {ayah.translation}
                      </p>
                    )}
                  </button>
                );
              })}
              <div className="h-8" />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden px-4 sm:px-6 py-2" style={{ minHeight: 0 }}>
            <div className="w-full h-full max-w-2xl mx-auto rounded-2xl bg-surface/50 border border-border-light overflow-hidden relative">
              <AudioVisualizer
                analyserNode={analyserNode}
                isPlaying={isPlaying}
                mode={expandedTab === 'analysis' ? 'analysis' : expandedTab === 'pitch' ? 'pitch' : 'practice'}
                currentAyah={currentAyah}
              />
              {/* Info overlay for the visual modes */}
              {expandedTab === 'pitch' && (
                <div className="absolute top-3 right-3 text-[10px] text-text-tertiary bg-canvas/80 backdrop-blur-sm px-2 py-1 rounded-md">
                  Pitch contour shows the Qari&apos;s melody
                </div>
              )}
              {expandedTab === 'practice' && (
                <div className="absolute top-3 right-3 text-[10px] text-text-tertiary bg-canvas/80 backdrop-blur-sm px-2 py-1 rounded-md">
                  Record yourself &amp; compare your melody to the Qari
                </div>
              )}
            </div>
          </div>
        )}

        {/* Seekbar */}
        <div className="px-8 mt-4">
          <div className="max-w-sm mx-auto">
            <SeekBar large />
          </div>
        </div>

        {/* Main transport controls */}
        <div className="px-8 mt-6 mb-2">
          <div className="max-w-sm mx-auto flex items-center justify-between">
            {/* Loop */}
            <button
              onClick={cycleLoop}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors relative ${
                loopMode !== 'none' ? 'text-primary' : 'text-text-tertiary hover:text-text'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
              </svg>
              {loopLabel && (
                <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-primary">{loopLabel}</span>
              )}
            </button>

            {/* Previous */}
            <button
              onClick={prevAyah}
              disabled={currentAyah <= 1}
              className="w-12 h-12 flex items-center justify-center text-text hover:text-primary disabled:opacity-30 transition-all active:scale-90"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
              </svg>
            </button>

            {/* Play/Pause — hero button */}
            <button
              onClick={togglePlay}
              className="w-16 h-16 flex items-center justify-center rounded-full bg-primary text-white shadow-raised hover:bg-primary-hover hover:shadow-modal hover:scale-105 active:scale-95 transition-all duration-200"
            >
              {isPlaying ? (
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg className="w-7 h-7 translate-x-[2px]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next */}
            <button
              onClick={nextAyah}
              disabled={currentAyah >= totalAyahs}
              className="w-12 h-12 flex items-center justify-center text-text hover:text-primary disabled:opacity-30 transition-all active:scale-90"
            >
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Speed */}
            <button
              onClick={(e) => { e.stopPropagation(); cycleSpeed(); }}
              className={`w-10 h-10 flex items-center justify-center rounded-full text-xs font-bold transition-colors ${
                playbackSpeed !== 1 ? 'text-primary bg-primary/10' : 'text-text-tertiary hover:text-text'
              }`}
            >
              {playbackSpeed}x
            </button>
          </div>
        </div>

        {/* Bottom controls row */}
        <div className="px-8 pb-8 pt-4">
          <div className="max-w-sm mx-auto flex items-center justify-between">
            {/* Play mode toggle */}
            <button
              onClick={() => onPlayModeChange(playMode === 'ayah' ? 'surah' : 'ayah')}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                playMode === 'surah'
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-tertiary hover:text-text'
              }`}
            >
              {playMode === 'ayah' ? 'Ayah mode' : 'Surah mode'}
            </button>

            <VolumeControl />

            {/* From start */}
            {currentAyah > 1 && (
              <button
                onClick={startFromBeginning}
                className="text-xs text-text-tertiary hover:text-primary transition-colors"
              >
                Restart
              </button>
            )}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // ---------- COLLAPSED (mini-bar) ----------
  return createPortal(
    <div className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-60 z-30" style={{ pointerEvents: 'auto' }}>
      {/* Seekbar — spans full width at top of bar */}
      <div className="px-0">
        <div
          ref={!expanded ? seekBarRef : undefined}
          className="relative w-full h-1 bg-border-light cursor-pointer group/seek"
          onMouseDown={(e) => {
            setIsSeeking(true);
            handleSeek(e.clientX);
            const onMove = (ev: MouseEvent) => handleSeek(ev.clientX);
            const onUp = () => {
              setIsSeeking(false);
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
            };
            window.addEventListener('mousemove', onMove);
            window.addEventListener('mouseup', onUp);
          }}
          onTouchStart={(e) => {
            setIsSeeking(true);
            handleSeek(e.touches[0].clientX);
            const onMove = (ev: TouchEvent) => handleSeek(ev.touches[0].clientX);
            const onEnd = () => {
              setIsSeeking(false);
              window.removeEventListener('touchmove', onMove);
              window.removeEventListener('touchend', onEnd);
            };
            window.addEventListener('touchmove', onMove);
            window.addEventListener('touchend', onEnd);
          }}
        >
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-[width] duration-75"
            style={{ width: `${progress * 100}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-primary shadow-sm opacity-0 group-hover/seek:opacity-100 transition-opacity"
            style={{ left: `${progress * 100}%` }}
          />
          {/* Expand hit area for touch */}
          <div className="absolute -top-3 -bottom-3 left-0 right-0" />
        </div>
      </div>

      <div
        className="bg-surface/95 backdrop-blur-xl border-t border-border px-3 sm:px-4 py-2.5 flex items-center gap-2 sm:gap-3 cursor-pointer"
        onClick={(e) => {
          // Don't expand if clicking a button
          if ((e.target as HTMLElement).closest('button')) return;
          setExpanded(true);
        }}
      >
        {/* Surah ornament + info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Mini artwork */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
            {isPlaying ? (
              <PlayingAnimation isPlaying={isPlaying} />
            ) : (
              <span className="text-sm font-heading text-primary">{surahNumber}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm text-text font-medium truncate">{surahName}</p>
            <p className="text-[11px] text-text-tertiary truncate">
              Ayah {currentAyah} of {totalAyahs}
              {duration > 0 && ` · ${formatTime(currentTime)} / ${formatTime(duration)}`}
              {timingsError && ' · sync unavailable'}
            </p>
          </div>
        </div>

        {/* Transport controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={prevAyah}
            disabled={currentAyah <= 1}
            className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:text-text disabled:opacity-30 transition-colors active:scale-90"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-primary text-white hover:bg-primary-hover active:scale-90 transition-all shadow-card"
          >
            {isPlaying ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 translate-x-[1px]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          <button
            onClick={nextAyah}
            disabled={currentAyah >= totalAyahs}
            className="w-9 h-9 flex items-center justify-center text-text-tertiary hover:text-text disabled:opacity-30 transition-colors active:scale-90"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* Right side controls */}
        <div className="hidden sm:flex items-center gap-1">
          {/* Speed */}
          <button
            onClick={(e) => { e.stopPropagation(); cycleSpeed(); }}
            className={`text-[11px] font-bold px-2 py-1 rounded-md transition-colors ${
              playbackSpeed !== 1 ? 'text-primary bg-primary/10' : 'text-text-tertiary hover:text-text'
            }`}
          >
            {playbackSpeed}x
          </button>

          {/* Play mode */}
          <button
            onClick={(e) => { e.stopPropagation(); onPlayModeChange(playMode === 'ayah' ? 'surah' : 'ayah'); }}
            className={`text-[11px] font-medium px-2 py-1 rounded-md transition-colors ${
              playMode === 'surah' ? 'bg-primary/10 text-primary' : 'text-text-tertiary hover:text-text'
            }`}
          >
            {playMode === 'ayah' ? 'Ayah' : 'Surah'}
          </button>

          {/* Loop */}
          <button
            onClick={(e) => { e.stopPropagation(); cycleLoop(); }}
            className={`relative w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
              loopMode !== 'none' ? 'text-primary bg-primary/10' : 'text-text-tertiary hover:text-text'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
            </svg>
            {loopLabel && (
              <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold text-primary">{loopLabel}</span>
            )}
          </button>

          <VolumeControl />
        </div>

        {/* Close */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            audioElement.pause();
            onClose();
          }}
          className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-text transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
}
