'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AudioVisualizer } from './AudioVisualizer';
import { GuidedPractice } from './GuidedPractice';
import { QARI_LIBRARY, getDefaultQari, getQariById, buildAyahAudioUrl, type QariInfo } from '@/lib/audio/qariLibrary';

type ExpandedTab = 'lyrics' | 'spectrum' | 'pitch' | 'practice';

interface AyahAudio {
  ayahNumber: number;
  url: string;
  segments: [number, number, number][];
}

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
  selectedQariId?: string;
  onQariChange?: (qariId: string) => void;
}

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5] as const;

// ── Design tokens ─────────────────────────────────────────────────────────
const G = {
  bg:           '#0E0D0C',
  gold:         '#D4A246',
  goldDim:      '#C89535',
  teal:         '#0D9488',
  surface:      'rgba(255,255,255,0.03)',
  surfaceHover: 'rgba(255,255,255,0.06)',
  border:       'rgba(255,255,255,0.07)',
  goldBorder:   'rgba(212,162,70,0.15)',
  textPrimary:  '#EDEDEC',
  textSecond:   'rgba(237,237,236,0.55)',
  textTert:     'rgba(237,237,236,0.3)',
} as const;

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Animated equalizer bars
function EqBars({ active }: { active: boolean }) {
  return (
    <div className="flex items-end gap-[2px] h-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all ${active ? 'animate-equalizer' : ''}`}
          style={{
            background: G.gold,
            height: active ? undefined : '4px',
            animationDelay: active ? `${i * 0.12}s` : undefined,
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
  const selectedQari: QariInfo = getQariById(selectedQariId ?? '') ?? getDefaultQari();
  const [showQariMenu, setShowQariMenu] = useState(false);
  const ayahDataRef       = useRef<Map<number, AyahAudio>>(new Map());
  const chapterAudioUrlRef = useRef<string | null>(null);
  const chapterSegmentsRef = useRef<ChapterSegment[]>([]);
  const onAyahChangeRef   = useRef(onAyahChange);
  const onWordChangeRef   = useRef(onWordChange);
  onAyahChangeRef.current = onAyahChange;
  onWordChangeRef.current = onWordChange;

  const playModeRef    = useRef(playMode);
  const loopModeRef    = useRef(loopMode);
  const currentAyahRef = useRef(startAyah);
  const totalAyahsRef  = useRef(totalAyahs);
  playModeRef.current    = playMode;
  loopModeRef.current    = loopMode;
  totalAyahsRef.current  = totalAyahs;

  const [isPlaying, setIsPlaying]         = useState(false);
  const [currentAyah, _setCurrentAyah]    = useState(startAyah);
  const setCurrentAyah = useCallback((v: number | ((prev: number) => number)) => {
    _setCurrentAyah(prev => {
      const next = typeof v === 'function' ? v(prev) : v;
      currentAyahRef.current = next;
      return next;
    });
  }, []);
  const [progress, setProgress]           = useState(0);
  const [currentTime, setCurrentTime]     = useState(0);
  const [duration, setDuration]           = useState(0);
  const [playRevision, setPlayRevision]   = useState(0);
  const [timingsLoaded, setTimingsLoaded] = useState(false);
  const [timingsError, setTimingsError]   = useState(false);
  const [expanded, setExpanded]           = useState(false);
  const [expandedTab, setExpandedTab]     = useState<ExpandedTab>('lyrics');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const playbackSpeedRef                  = useRef(1);
  const [volume, setVolume]               = useState(1);
  const [isSeeking, setIsSeeking]         = useState(false);
  const usingSurahAudioRef                = useRef(false);
  const preloadedAudioRef                 = useRef<HTMLAudioElement | null>(null);
  const seekBarRef                        = useRef<HTMLDivElement>(null);
  const volumeBarRef                      = useRef<HTMLDivElement>(null);
  const lyricsContainerRef               = useRef<HTMLDivElement>(null);
  const lastScrolledAyahRef              = useRef<number | null>(null);
  const [analyserNode, setAnalyserNode]   = useState<AnalyserNode | null>(null);
  const audioCtxRef                       = useRef<AudioContext | null>(null);

  const ensureAnalyser = useCallback(() => {
    if (analyserNode) return analyserNode;
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      // If audio is already playing, the 'play' event already fired before this
      // AudioContext existed — resume it immediately so the analyser gets data.
      if (!audioElement.paused) ctx.resume().catch(() => {});
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      const el = audioElement as any;
      const captureFn = el.captureStream ?? el.mozCaptureStream;
      if (captureFn) {
        const stream = captureFn.call(el) as MediaStream;
        const source = ctx.createMediaStreamSource(stream);
        source.connect(analyser);
      } else {
        const source = ctx.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(ctx.destination);
      }
      setAnalyserNode(analyser);
      return analyser;
    } catch (e) {
      console.warn('Audio visualizer setup failed:', e);
      return null;
    }
  }, [audioElement, analyserNode]);

  // ── Data fetching ──────────────────────────────────────────────────────────
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

  // ── Playback ───────────────────────────────────────────────────────────────
  const preloadNextAyah = useCallback((currentAyahNumber: number) => {
    const nextAyah = currentAyahNumber + 1;
    if (nextAyah > totalAyahs) return;
    const nextData = ayahDataRef.current.get(nextAyah);
    const nextSrc  = nextData?.url ?? buildAyahAudioUrl(selectedQari, surahNumber, nextAyah);
    const preload  = new Audio();
    preload.preload = 'auto';
    preload.src = nextSrc;
    preloadedAudioRef.current = preload;
  }, [surahNumber, totalAyahs]);

  const playAyah = useCallback((ayahNumber: number) => {
    const audio   = audioElement;
    const ayahData = ayahDataRef.current.get(ayahNumber);
    const src     = ayahData?.url ?? buildAyahAudioUrl(selectedQari, surahNumber, ayahNumber);
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
    const url   = chapterAudioUrlRef.current;
    if (!url) { playAyah(seekToAyah ?? startAyah); return; }
    usingSurahAudioRef.current = true;
    audio.src = url;
    audio.load();
    audio.playbackRate = playbackSpeedRef.current;
    if (seekToAyah && seekToAyah > 1) {
      const firstSeg = chapterSegmentsRef.current.find((s) => s.ayahNumber === seekToAyah);
      if (firstSeg) audio.currentTime = firstSeg.startMs / 1000;
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
        if (chapterAudioUrlRef.current) { playSurahAudio(startAyah); }
        else { playAyah(startAyah); }
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

  // ── Audio event handlers ───────────────────────────────────────────────────
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
        const ms       = audio.currentTime * 1000;
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
        if (foundAyah && foundAyah !== currentAyahRef.current) {
          setCurrentAyah(foundAyah);
          onAyahChangeRef.current(foundAyah);
        }
        onWordChangeRef.current(foundWord);
      } else {
        const ms       = audio.currentTime * 1000;
        const segments = ayahDataRef.current.get(currentAyahRef.current)?.segments ?? [];
        const active   = segments.find(([, start, end]) => ms >= start && ms < end);
        onWordChangeRef.current(active ? active[0] : null);
      }
    }

    function handleEnded() {
      setIsPlaying(false);
      onWordChangeRef.current(null);
      const loop = loopModeRef.current;
      if (usingSurahAudioRef.current) {
        if (loop === 'surah') {
          // Seek instead of reloading — preserves captureStream / MediaElementSource chain
          audio.currentTime = 0;
          audio.play().catch(() => setIsPlaying(false));
          setCurrentAyah(1);
          setIsPlaying(true);
          setProgress(0);
          setPlayRevision(r => r + 1);
          onAyahChangeRef.current(1);
          onWordChangeRef.current(null);
        }
        return;
      }
      if (loop === 'ayah') {
        // Same ayah — seek instead of reloading to keep analyser connected
        audio.currentTime = 0;
        audio.play().catch(() => setIsPlaying(false));
        setIsPlaying(true);
        setProgress(0);
        setPlayRevision(r => r + 1);
        return;
      }
      const ayah = currentAyahRef.current;
      const total = totalAyahsRef.current;
      if (ayah < total) {
        const next = ayah + 1;
        setCurrentAyah(next);
        playAyah(next);
      } else if (loop === 'surah') {
        setPlayRevision(r => r + 1);
        playAyah(1);
      }
    }

    function handlePlay()           { setIsPlaying(true); if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume(); }
    function handlePause()          { setIsPlaying(false); }
    function handleLoadedMetadata() { setDuration(audio.duration || 0); }

    audio.addEventListener('timeupdate',     handleTimeUpdate);
    audio.addEventListener('ended',          handleEnded);
    audio.addEventListener('play',           handlePlay);
    audio.addEventListener('pause',          handlePause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => {
      audio.removeEventListener('timeupdate',     handleTimeUpdate);
      audio.removeEventListener('ended',          handleEnded);
      audio.removeEventListener('play',           handlePlay);
      audio.removeEventListener('pause',          handlePause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  // currentAyah/totalAyahs accessed via refs to avoid stale closures + re-attaching listeners
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioElement, playAyah, playSurahAudio, isSeeking]);

  // ── Controls ───────────────────────────────────────────────────────────────
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
    const idx  = SPEED_OPTIONS.indexOf(playbackSpeed as typeof SPEED_OPTIONS[number]);
    const next = SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length];
    playbackSpeedRef.current  = next;
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

  // Auto-scroll lyrics to current ayah
  useEffect(() => {
    if (!expanded || !lyricsContainerRef.current) return;
    if (lastScrolledAyahRef.current === currentAyah) return;
    lastScrolledAyahRef.current = currentAyah;
    const el = lyricsContainerRef.current.querySelector(`[data-ayah="${currentAyah}"]`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [expanded, currentAyah]);

  function handleSeek(clientX: number) {
    if (!seekBarRef.current) return;
    const rect = seekBarRef.current.getBoundingClientRect();
    const pct  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setProgress(pct);
    if (audioElement.duration) {
      audioElement.currentTime = pct * audioElement.duration;
      setCurrentTime(pct * audioElement.duration);
    }
  }

  function handleVolumeChange(clientX: number) {
    if (!volumeBarRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const vol  = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setVolume(vol);
    audioElement.volume = vol;
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case 'Space':      e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': if (e.shiftKey) { nextAyah(); e.preventDefault(); } break;
        case 'ArrowLeft':  if (e.shiftKey) { prevAyah(); e.preventDefault(); } break;
        case 'KeyF':       setExpanded((v) => !v); break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentAyah]);

  useEffect(() => {
    if (!showQariMenu) return;
    const handler = () => setShowQariMenu(false);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [showQariMenu]);

  const loopLabel = loopMode === 'ayah' ? '1' : loopMode === 'surah' ? '∞' : '';

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // ── Shared seekbar ─────────────────────────────────────────────────────────
  const SeekBar = ({ large }: { large?: boolean }) => (
    <div className="w-full flex flex-col gap-1.5">
      <div
        ref={seekBarRef}
        className={`relative w-full cursor-pointer group/seek ${large ? 'h-1.5' : 'h-[3px]'} rounded-full`}
        style={{ background: 'rgba(255,255,255,0.1)' }}
        onMouseDown={(e) => {
          setIsSeeking(true);
          handleSeek(e.clientX);
          const onMove = (ev: MouseEvent) => handleSeek(ev.clientX);
          const onUp   = () => { setIsSeeking(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        onTouchStart={(e) => {
          setIsSeeking(true);
          handleSeek(e.touches[0].clientX);
          const onMove = (ev: TouchEvent) => handleSeek(ev.touches[0].clientX);
          const onEnd  = () => { setIsSeeking(false); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
          window.addEventListener('touchmove', onMove);
          window.addEventListener('touchend', onEnd);
        }}
      >
        {/* Gradient fill */}
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(to right, ${G.teal}, ${G.gold})`,
            boxShadow: progress > 0.01 ? `0 0 6px rgba(212,162,70,0.35)` : 'none',
          }}
        />
        {/* Gold thumb */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full transition-[opacity,transform] ${
            large
              ? 'w-3.5 h-3.5 group-hover/seek:scale-125'
              : 'w-2.5 h-2.5 opacity-0 group-hover/seek:opacity-100 group-hover/seek:scale-110'
          } ${isSeeking ? '!opacity-100 scale-125' : ''}`}
          style={{
            left: `${progress * 100}%`,
            background: G.gold,
            boxShadow: `0 0 8px rgba(212,162,70,0.6)`,
          }}
        />
      </div>
      {large && (
        <div className="flex justify-between text-[11px] tabular-nums" style={{ color: G.textTert }}>
          <span>{formatTime(currentTime)}</span>
          <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
        </div>
      )}
    </div>
  );

  // ── Volume control ─────────────────────────────────────────────────────────
  const VolumeControl = () => (
    <div className="hidden lg:flex items-center gap-2">
      <button
        onClick={() => { const v = volume > 0 ? 0 : 1; setVolume(v); audioElement.volume = v; }}
        className="w-8 h-8 flex items-center justify-center transition-colors"
        style={{ color: G.textTert }}
      >
        {volume === 0 ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-3.72a.75.75 0 0 1 1.28.53v14.88a.75.75 0 0 1-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-3.72a.75.75 0 0 1 1.28.53v14.88a.75.75 0 0 1-1.28.53l-4.72-3.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
        )}
      </button>
      <div
        ref={volumeBarRef}
        className="relative w-20 h-[3px] rounded-full cursor-pointer group/vol"
        style={{ background: 'rgba(255,255,255,0.1)' }}
        onMouseDown={(e) => {
          handleVolumeChange(e.clientX);
          const onMove = (ev: MouseEvent) => handleVolumeChange(ev.clientX);
          const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ width: `${volume * 100}%`, background: G.gold, opacity: 0.7 }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full opacity-0 group-hover/vol:opacity-100 transition-opacity"
          style={{ left: `${volume * 100}%`, background: G.gold }}
        />
      </div>
    </div>
  );

  // ── EXPANDED VIEW ──────────────────────────────────────────────────────────
  if (expanded) {
    return createPortal(
      <div
        className="fixed inset-0 z-50 flex flex-col overflow-hidden animate-slide-up"
        style={{ background: G.bg }}
      >
        {/* Manuscript ruling lines — faint horizontal gold hairlines */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'repeating-linear-gradient(to bottom, transparent, transparent 31px, rgba(212,162,70,0.018) 31px, rgba(212,162,70,0.018) 32px)',
          }}
        />
        {/* Radial gold vignette from top */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-56 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 90% 100% at 50% 0%, rgba(212,162,70,0.07) 0%, transparent 100%)',
          }}
        />

        {/* All content sits above the decorative layers */}
        <div className="relative z-10 flex flex-col h-full">

          {/* ── Top bar ── */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <button
              onClick={() => setExpanded(false)}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
              style={{ background: G.surface, border: `1px solid ${G.border}` }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={G.textTert}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            <span
              className="text-[10px] font-semibold tracking-[0.15em] uppercase"
              style={{ color: G.textTert }}
            >
              Now Playing
            </span>

            <button
              onClick={() => { audioElement.pause(); setExpanded(false); onClose(); }}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-colors"
              style={{ background: G.surface, border: `1px solid ${G.border}` }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={G.textTert}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* ── Surah name + qari selector ── */}
          <div className="text-center px-8 pt-1 pb-2">
            <h3
              className="text-xl font-heading"
              style={{ color: G.textPrimary, letterSpacing: '0.01em' }}
            >
              {surahName}
            </h3>

            <div className="relative inline-block mt-1">
              <button
                onClick={() => setShowQariMenu(!showQariMenu)}
                className="flex items-center gap-1.5 mx-auto text-xs transition-colors"
                style={{ color: G.textSecond }}
              >
                {selectedQari.name}
                <span
                  className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                  style={{ background: 'rgba(212,162,70,0.12)', color: G.gold }}
                >
                  {selectedQari.styleLabel}
                </span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {showQariMenu && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 rounded-xl p-2 z-50"
                  style={{ background: '#161513', border: `1px solid ${G.goldBorder}`, boxShadow: '0 16px 40px rgba(0,0,0,0.6)' }}
                >
                  {QARI_LIBRARY.map((qari) => (
                    <button
                      key={qari.id}
                      onClick={() => { onQariChange?.(qari.id); setShowQariMenu(false); }}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-start gap-3"
                      style={{
                        background: qari.id === selectedQari.id ? 'rgba(212,162,70,0.08)' : 'transparent',
                        color: qari.id === selectedQari.id ? G.gold : G.textSecond,
                      }}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium truncate">{qari.name}</span>
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0"
                            style={{ background: 'rgba(255,255,255,0.06)', color: G.textTert }}
                          >
                            {qari.styleLabel}
                          </span>
                        </div>
                        <p className="text-[11px] mt-0.5 truncate" style={{ color: G.textTert }}>{qari.description}</p>
                      </div>
                      {qari.id === selectedQari.id && (
                        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke={G.gold}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <p className="text-[11px] mt-1" style={{ color: G.textTert }}>
              Ayah {currentAyah} / {totalAyahs}
            </p>
          </div>

          {/* ── Tab bar — underline style ── */}
          <div
            className="flex items-end justify-center gap-0 px-6"
            style={{ borderBottom: `1px solid ${G.border}` }}
          >
            {([
              { id: 'lyrics'   as ExpandedTab, label: 'Lyrics',    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" /></svg> },
              { id: 'spectrum' as ExpandedTab, label: 'Spectrum',  icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg> },
              { id: 'pitch'    as ExpandedTab, label: 'Melody',    icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z" /></svg> },
              { id: 'practice' as ExpandedTab, label: 'Practice',  icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" /></svg> },
            ]).map((tab) => {
              const active = expandedTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { if (tab.id !== 'lyrics') ensureAnalyser(); setExpandedTab(tab.id); }}
                  className="flex items-center gap-1.5 px-3 sm:px-4 py-3 text-xs font-medium transition-colors"
                  style={{
                    color: active ? G.gold : G.textTert,
                    borderBottom: active ? `2px solid ${G.gold}` : '2px solid transparent',
                    marginBottom: '-1px',
                  }}
                >
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── Tab content ── */}
          {expandedTab === 'lyrics' ? (
            <div
              ref={lyricsContainerRef}
              className="flex-1 overflow-y-auto px-4 sm:px-8 min-h-0 scroll-smooth"
              style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)' }}
            >
              <div className="max-w-lg mx-auto py-6 space-y-3">
                {surahNumber !== 9 && surahNumber !== 1 && (
                  <p
                    className="font-arabic text-xl text-center pb-4"
                    style={{ color: G.textTert, borderBottom: `1px solid ${G.border}` }}
                  >
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
                      className="w-full text-right rounded-xl px-4 py-3 transition-all duration-300 border"
                      style={{
                        background: isActive ? 'rgba(212,162,70,0.06)' : 'transparent',
                        borderColor: isActive ? 'rgba(212,162,70,0.18)' : 'transparent',
                        transform: isActive ? 'scale(1.01)' : 'scale(1)',
                      }}
                      dir="rtl"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-[11px] font-medium mt-1 transition-colors"
                          style={{
                            background: isActive ? G.gold : 'rgba(255,255,255,0.06)',
                            color:      isActive ? G.bg   : G.textTert,
                          }}
                        >
                          {ayah.number}
                        </span>
                        <span
                          className="font-arabic text-xl sm:text-2xl leading-[2] transition-colors"
                          style={{ color: isActive ? G.gold : G.textSecond }}
                        >
                          {ayah.textUthmani}
                        </span>
                      </div>
                      {ayah.translation && (
                        <p
                          className="text-xs leading-relaxed mt-2 text-left transition-colors"
                          dir="ltr"
                          style={{ color: isActive ? G.textSecond : G.textTert }}
                        >
                          {ayah.translation}
                        </p>
                      )}
                    </button>
                  );
                })}
                <div className="h-8" />
              </div>
            </div>

          ) : expandedTab === 'practice' ? (
            <div className="flex-1 overflow-hidden px-4 sm:px-6 py-3" style={{ minHeight: 0 }}>
              <div
                className="w-full h-full max-w-2xl mx-auto rounded-2xl overflow-hidden relative"
                style={{ border: `1px solid ${G.goldBorder}`, background: 'rgba(255,255,255,0.015)' }}
              >
                <GuidedPractice
                  analyserNode={analyserNode}
                  isPlaying={isPlaying}
                  currentAyah={currentAyah}
                  totalAyahs={totalAyahs}
                  surahNumber={surahNumber}
                  selectedQari={selectedQari}
                  ayahs={ayahsList}
                  playRevision={playRevision}
                  onNextAyah={() => { if (currentAyah < totalAyahs) seekToAyah(currentAyah + 1); }}
                  onPause={() => audioElement.pause()}
                />
              </div>
            </div>

          ) : (
            <div className="flex-1 overflow-hidden px-4 sm:px-6 py-3" style={{ minHeight: 0 }}>
              <div
                className="w-full h-full max-w-2xl mx-auto rounded-2xl overflow-hidden relative"
                style={{ border: `1px solid ${G.border}`, background: 'rgba(255,255,255,0.015)' }}
              >
                <AudioVisualizer
                  analyserNode={analyserNode}
                  isPlaying={isPlaying}
                  mode={expandedTab === 'spectrum' ? 'spectrum' : 'pitch'}
                  currentAyah={currentAyah}
                />
                <div
                  className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-md"
                  style={{ background: 'rgba(14,13,12,0.8)', color: G.textTert, backdropFilter: 'blur(6px)' }}
                >
                  {expandedTab === 'spectrum'
                    ? 'FFT frequency spectrum · Harmonics highlighted'
                    : "Pitch contour shows the Qari's melody"}
                </div>
              </div>
            </div>
          )}

          {/* ── Seekbar ── */}
          <div className="px-8 mt-4">
            <div className="max-w-sm mx-auto">
              <SeekBar large />
            </div>
          </div>

          {/* ── Transport controls ── */}
          <div className="px-8 mt-5 mb-1">
            <div className="max-w-sm mx-auto flex items-center justify-between">

              {/* Loop */}
              <button
                onClick={cycleLoop}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-colors relative"
                style={{ color: loopMode !== 'none' ? G.gold : G.textTert }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
                </svg>
                {loopLabel && (
                  <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold" style={{ color: G.gold }}>{loopLabel}</span>
                )}
              </button>

              {/* Previous */}
              <button
                onClick={prevAyah}
                disabled={currentAyah <= 1}
                className="w-12 h-12 flex items-center justify-center disabled:opacity-25 transition-all active:scale-90"
                style={{ color: G.textSecond }}
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
                </svg>
              </button>

              {/* Play/Pause — gold hero button */}
              <button
                onClick={togglePlay}
                className="w-16 h-16 flex items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: G.gold,
                  color: G.bg,
                  boxShadow: `0 0 30px rgba(212,162,70,0.35), 0 4px 20px rgba(212,162,70,0.2)`,
                }}
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
                className="w-12 h-12 flex items-center justify-center disabled:opacity-25 transition-all active:scale-90"
                style={{ color: G.textSecond }}
              >
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>

              {/* Speed */}
              <button
                onClick={(e) => { e.stopPropagation(); cycleSpeed(); }}
                className="w-10 h-10 flex items-center justify-center rounded-full text-xs font-bold transition-colors"
                style={{
                  color: playbackSpeed !== 1 ? G.gold : G.textTert,
                  background: playbackSpeed !== 1 ? 'rgba(212,162,70,0.1)' : 'transparent',
                }}
              >
                {playbackSpeed}x
              </button>
            </div>
          </div>

          {/* ── Bottom row ── */}
          <div className="px-8 pb-8 pt-3">
            <div className="max-w-sm mx-auto flex items-center justify-between">
              {/* Play mode toggle */}
              <button
                onClick={() => onPlayModeChange(playMode === 'ayah' ? 'surah' : 'ayah')}
                className="text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                style={{
                  background: playMode === 'surah' ? 'rgba(212,162,70,0.1)' : G.surface,
                  color: playMode === 'surah' ? G.gold : G.textTert,
                  border: `1px solid ${playMode === 'surah' ? G.goldBorder : G.border}`,
                }}
              >
                {playMode === 'ayah' ? 'Ayah mode' : 'Surah mode'}
              </button>

              <VolumeControl />

              {currentAyah > 1 && (
                <button
                  onClick={startFromBeginning}
                  className="text-xs transition-colors"
                  style={{ color: G.textTert }}
                >
                  Restart
                </button>
              )}
            </div>
          </div>

        </div>
      </div>,
      document.body
    );
  }

  // ── COLLAPSED MINI-BAR ─────────────────────────────────────────────────────
  return createPortal(
    <div
      className="fixed bottom-16 left-0 right-0 lg:bottom-0 lg:left-60 z-30"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Top seekbar */}
      <div
        ref={!expanded ? seekBarRef : undefined}
        className="relative w-full h-[3px] cursor-pointer group/seek"
        style={{ background: 'rgba(255,255,255,0.08)' }}
        onMouseDown={(e) => {
          setIsSeeking(true);
          handleSeek(e.clientX);
          const onMove = (ev: MouseEvent) => handleSeek(ev.clientX);
          const onUp   = () => { setIsSeeking(false); window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        onTouchStart={(e) => {
          setIsSeeking(true);
          handleSeek(e.touches[0].clientX);
          const onMove = (ev: TouchEvent) => handleSeek(ev.touches[0].clientX);
          const onEnd  = () => { setIsSeeking(false); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onEnd); };
          window.addEventListener('touchmove', onMove);
          window.addEventListener('touchend', onEnd);
        }}
      >
        <div
          className="absolute inset-y-0 left-0 transition-[width] duration-75"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(to right, ${G.teal}, ${G.gold})`,
          }}
        />
        <div className="absolute -top-3 -bottom-3 left-0 right-0" />
      </div>

      {/* Bar body */}
      <div
        className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 cursor-pointer"
        style={{
          background: 'rgba(14,13,12,0.96)',
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${G.goldBorder}`,
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('button')) return;
          setExpanded(true);
        }}
      >
        {/* Art / now-playing indicator */}
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'rgba(212,162,70,0.1)', border: `1px solid ${G.goldBorder}` }}
        >
          {isPlaying ? (
            <EqBars active />
          ) : (
            <span className="text-sm font-heading" style={{ color: G.gold }}>{surahNumber}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: G.textPrimary }}>{surahName}</p>
          <p className="text-[11px] truncate" style={{ color: G.textTert }}>
            Ayah {currentAyah} of {totalAyahs}
            {duration > 0 && ` · ${formatTime(currentTime)} / ${formatTime(duration)}`}
            {timingsError && ' · sync unavailable'}
          </p>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={prevAyah}
            disabled={currentAyah <= 1}
            className="w-9 h-9 flex items-center justify-center disabled:opacity-25 transition-colors active:scale-90"
            style={{ color: G.textSecond }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </button>

          <button
            onClick={togglePlay}
            className="w-11 h-11 flex items-center justify-center rounded-full transition-all active:scale-90"
            style={{
              background: G.gold,
              color: G.bg,
              boxShadow: `0 0 16px rgba(212,162,70,0.3)`,
            }}
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
            className="w-9 h-9 flex items-center justify-center disabled:opacity-25 transition-colors active:scale-90"
            style={{ color: G.textSecond }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>

        {/* Right-side mini controls */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); cycleSpeed(); }}
            className="text-[11px] font-bold px-2 py-1 rounded-md transition-colors"
            style={{
              color: playbackSpeed !== 1 ? G.gold : G.textTert,
              background: playbackSpeed !== 1 ? 'rgba(212,162,70,0.1)' : 'transparent',
            }}
          >
            {playbackSpeed}x
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onPlayModeChange(playMode === 'ayah' ? 'surah' : 'ayah'); }}
            className="text-[11px] font-medium px-2 py-1 rounded-md transition-colors"
            style={{
              color: playMode === 'surah' ? G.gold : G.textTert,
              background: playMode === 'surah' ? 'rgba(212,162,70,0.1)' : 'transparent',
            }}
          >
            {playMode === 'ayah' ? 'Ayah' : 'Surah'}
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); cycleLoop(); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-md transition-colors"
            style={{ color: loopMode !== 'none' ? G.gold : G.textTert }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3" />
            </svg>
            {loopLabel && (
              <span className="absolute -top-0.5 -right-0.5 text-[8px] font-bold" style={{ color: G.gold }}>{loopLabel}</span>
            )}
          </button>

          <VolumeControl />
        </div>

        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); audioElement.pause(); onClose(); }}
          className="w-8 h-8 flex items-center justify-center transition-colors"
          style={{ color: G.textTert }}
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
