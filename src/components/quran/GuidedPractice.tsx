'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { detectPitchYIN, freqToMidi, freqToY } from '@/lib/audio/pitchEngine';
import { scorePhrase, type PhraseScore, computeSessionStats } from '@/lib/audio/phraseScorer';
import { buildAyahAudioUrl, type QariInfo } from '@/lib/audio/qariLibrary';

// ─── Types ───

type PracticeMode = 'mode1' | 'mode2';
type Phase = 'idle' | 'listening' | 'recording' | 'together' | 'scored';

interface AyahItem {
  number: number;
  textUthmani: string;
  translation?: string;
}

interface Props {
  /** Main player's analyser — used by Mode 2 (Sing Together) for qari waveform */
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  currentAyah: number;
  totalAyahs: number;
  surahNumber: number;
  selectedQari: QariInfo;
  ayahs: AyahItem[];
  /** Increments on every loop restart — signals GuidedPractice to reset pitch buffers */
  playRevision: number;
  onNextAyah: () => void;
  /** Pause the main AudioPlayer — called by Mode 1 before playing own single-ayah audio */
  onPause?: () => void;
}

const MAX_HISTORY  = 300; // frames visible in scrolling waveform
const SILENCE_FRAMES = 100; // ~1.7s at 60fps before auto-stop

function getColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    primary:      s.getPropertyValue('--color-primary').trim()       || '#D4A246',
    accent:       s.getPropertyValue('--color-accent').trim()        || '#D4A246',
    correct:      s.getPropertyValue('--color-correct').trim()       || '#5CB889',
    wrong:        s.getPropertyValue('--color-wrong').trim()         || '#D9635B',
    text:         s.getPropertyValue('--color-text').trim()          || '#EDEDEC',
    textTertiary: s.getPropertyValue('--color-text-tertiary').trim() || '#636260',
  };
}

export function GuidedPractice({
  analyserNode,
  currentAyah,
  totalAyahs,
  surahNumber,
  selectedQari,
  ayahs,
  playRevision,
  onPause,
}: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const animFrameRef  = useRef<number>(0);
  const canvasSizeRef = useRef({ w: 0, h: 0 });

  // Own audio element — used for Mode 1 (listen then recite)
  const audioRef        = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef     = useRef<AudioContext | null>(null);

  // Two separate refs for qari analyser:
  //   ownQariAnalyserRef — permanently wired to own <audio> element (Mode 1), created once
  //   qariAnalyserRef    — active analyser for current session (may point to own or main player's)
  const ownQariAnalyserRef = useRef<AnalyserNode | null>(null);
  const qariAnalyserRef    = useRef<AnalyserNode | null>(null);
  const micAnalyserRef     = useRef<AnalyserNode | null>(null);
  const micStreamRef       = useRef<MediaStream | null>(null);

  const [practiceMode, setPracticeMode] = useState<PracticeMode>('mode1');
  const [phase, setPhase]               = useState<Phase>('idle');
  const phaseRef                        = useRef<Phase>('idle');
  const [selectedAyah, setSelectedAyah] = useState(currentAyah);
  const [latestScore, setLatestScore]   = useState<PhraseScore | null>(null);
  const [allScores, setAllScores]       = useState<PhraseScore[]>([]);

  // Pitch buffers
  const qariPitchesRef   = useRef<(number | null)[]>([]);
  const userPitchesRef   = useRef<(number | null)[]>([]);
  const silenceFramesRef = useRef(0);

  const setPhaseSync = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };

  // ─── Audio setup (Mode 1 only) ───

  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ''; };
  }, []);

  // React to ayah changes OR loop restarts from the main player
  useEffect(() => {
    const phase = phaseRef.current;
    if (phase === 'idle') {
      setSelectedAyah(currentAyah);
    } else if (phase === 'together' || phase === 'listening') {
      // New ayah or loop restart — reset pitch buffers so waveform starts fresh
      qariPitchesRef.current   = [];
      userPitchesRef.current   = [];
      silenceFramesRef.current = 0;
    } else if (phase === 'scored') {
      // Surah advanced/looped — dismiss score screen and reset for next round
      setLatestScore(null);
      setPhaseSync('idle');
    }
  }, [currentAyah, playRevision]);

  const ensureAudioCtx = useCallback((): AudioContext => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    return ctx;
  }, []);

  // Sets up qari analyser from own audio element (Mode 1).
  // createMediaElementSource can only be called once per element — guarded by ownQariAnalyserRef.
  const setupOwnQariAnalyser = useCallback(() => {
    if (ownQariAnalyserRef.current || !audioRef.current) return;
    try {
      const ctx      = ensureAudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.75;
      const src = ctx.createMediaElementSource(audioRef.current);
      src.connect(analyser);
      analyser.connect(ctx.destination); // must route output
      ownQariAnalyserRef.current = analyser;
      qariAnalyserRef.current    = analyser;
    } catch (e) {
      console.warn('[Practice] own qari analyser setup failed:', e);
    }
  }, [ensureAudioCtx]);

  const openMic = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      if (!stream.getAudioTracks().length) {
        stream.getTracks().forEach(t => t.stop());
        return false;
      }
      micStreamRef.current = stream;
      const ctx = ensureAudioCtx();
      if (ctx.state === 'suspended') await ctx.resume();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.75;
      ctx.createMediaStreamSource(stream).connect(analyser);
      micAnalyserRef.current = analyser;
      return true;
    } catch (e) {
      console.warn('[Practice] mic open failed:', e);
      return false;
    }
  }, [ensureAudioCtx]);

  const closeMic = useCallback(() => {
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current  = null;
    micAnalyserRef.current = null;
  }, []);

  const resetBuffers = () => {
    qariPitchesRef.current   = [];
    userPitchesRef.current   = [];
    silenceFramesRef.current = 0;
  };

  // ─── Mode 1: Listen then Recite ───
  // Pauses the main AudioPlayer, plays a single ayah via own <audio>, then records mic.

  const startListening = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // Pause main player so two audios don't conflict
    onPause?.();
    resetBuffers();
    const url = buildAyahAudioUrl(selectedQari, surahNumber, selectedAyah);
    audio.src = url;
    audio.load();
    setupOwnQariAnalyser(); // safe to call multiple times — only wires up once
    // If ctx was suspended (created before user gesture), resume now
    const ctx = audioCtxRef.current;
    if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
    audio.play().catch(() => {});
    setPhaseSync('listening');
  }, [onPause, selectedQari, surahNumber, selectedAyah, setupOwnQariAnalyser]);

  const startRecording = useCallback(async () => {
    if (phaseRef.current !== 'listening') return;
    userPitchesRef.current   = [];
    silenceFramesRef.current = 0;
    const ok = await openMic();
    if (!ok) { setPhaseSync('idle'); return; }
    setPhaseSync('recording');
  }, [openMic]);
  const startRecordingRef = useRef(startRecording);
  startRecordingRef.current = startRecording;

  const finishRecording = useCallback(() => {
    if (phaseRef.current !== 'recording') return;
    closeMic();
    const score = scorePhrase(
      qariPitchesRef.current.map(p => p !== null ? freqToMidi(p) : null),
      userPitchesRef.current.map(p => p !== null ? freqToMidi(p) : null),
      [], [],
      selectedAyah,
      60
    );
    setLatestScore(score);
    setAllScores(prev => [...prev, score]);
    setPhaseSync('scored');
  }, [closeMic, selectedAyah]);
  const finishRecordingRef = useRef(finishRecording);
  finishRecordingRef.current = finishRecording;

  // ─── Mode 2: Sing Together ───
  // Does NOT use own audio. Wires qariAnalyserRef to the main player's analyserNode,
  // opens mic, shows both waveforms live while main player continues uninterrupted.

  const startTogether = useCallback(async () => {
    resetBuffers();
    // Point active qari analyser at the main player's node (or fall back to own if set)
    qariAnalyserRef.current = analyserNode ?? ownQariAnalyserRef.current ?? null;
    const ok = await openMic();
    if (!ok) {
      qariAnalyserRef.current = ownQariAnalyserRef.current ?? null;
      return;
    }
    setPhaseSync('together');
  }, [analyserNode, openMic]);

  const finishTogether = useCallback(() => {
    if (phaseRef.current !== 'together') return;
    // Restore qariAnalyser to own (Mode 1) analyser — don't close the main player's node
    qariAnalyserRef.current = ownQariAnalyserRef.current ?? null;
    closeMic();
    const score = scorePhrase(
      qariPitchesRef.current.map(p => p !== null ? freqToMidi(p) : null),
      userPitchesRef.current.map(p => p !== null ? freqToMidi(p) : null),
      [], [],
      selectedAyah,
      60
    );
    setLatestScore(score);
    setAllScores(prev => [...prev, score]);
    setPhaseSync('scored');
  }, [closeMic, selectedAyah]);
  const finishTogetherRef = useRef(finishTogether);
  finishTogetherRef.current = finishTogether;

  // ─── Mode 1 audio `ended` event ───
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleEnded = () => {
      if (phaseRef.current === 'listening') {
        setTimeout(() => startRecordingRef.current(), 300);
      }
      // Mode 2 has no own audio, so 'together' ended event won't fire here
    };
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Cleanup ───
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      closeMic();
      cancelAnimationFrame(animFrameRef.current);
      audioCtxRef.current?.close();
    };
  }, [closeMic]);

  // ─── Animation + pitch detection loop ───
  useEffect(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      if (!canvas || !ctx2d || !container) return;

      const W = container.clientWidth;
      const H = container.clientHeight;
      if (W === 0 || H === 0) return;

      const dpr = window.devicePixelRatio || 1;
      if (canvasSizeRef.current.w !== W || canvasSizeRef.current.h !== H) {
        canvas.width  = W * dpr;
        canvas.height = H * dpr;
        canvas.style.width  = `${W}px`;
        canvas.style.height = `${H}px`;
        ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        canvasSizeRef.current = { w: W, h: H };
      }

      ctx2d.clearRect(0, 0, W, H);

      const currentPhase = phaseRef.current;
      const sampleRate   = audioCtxRef.current?.sampleRate ?? 44100;

      // ── Collect qari pitch ──
      if ((currentPhase === 'listening' || currentPhase === 'together') && qariAnalyserRef.current) {
        const buf = new Float32Array(qariAnalyserRef.current.fftSize);
        qariAnalyserRef.current.getFloatTimeDomainData(buf);
        const r = detectPitchYIN(buf, sampleRate);
        qariPitchesRef.current.push(r?.frequency ?? null);
      }

      // ── Collect user pitch ──
      if ((currentPhase === 'recording' || currentPhase === 'together') && micAnalyserRef.current) {
        const buf = new Float32Array(micAnalyserRef.current.fftSize);
        micAnalyserRef.current.getFloatTimeDomainData(buf);
        const r     = detectPitchYIN(buf, sampleRate);
        const pitch = r?.frequency ?? null;
        userPitchesRef.current.push(pitch);

        if (currentPhase === 'recording') {
          if (!pitch) {
            silenceFramesRef.current++;
            if (silenceFramesRef.current > SILENCE_FRAMES && userPitchesRef.current.length > 40) {
              finishRecordingRef.current();
              return;
            }
          } else {
            silenceFramesRef.current = 0;
          }
        }
      }

      if (currentPhase === 'listening' || currentPhase === 'recording' || currentPhase === 'together') {
        drawWaveform(ctx2d, W, H, currentPhase);
      }
    }

    // ── Piano-roll note grid data ──
    const PIANO_NOTES = [
      { name: 'C3', freq: 130.81 }, { name: 'E3', freq: 164.81 },
      { name: 'G3', freq: 196.00 }, { name: 'B3', freq: 246.94 },
      { name: 'D4', freq: 293.66 }, { name: 'F4', freq: 349.23 },
      { name: 'A4', freq: 440.00 }, { name: 'C5', freq: 523.25 },
    ];
    const GRID_LEFT = 32; // space for note labels

    function drawWaveform(ctx: CanvasRenderingContext2D, W: number, H: number, phase: Phase) {
      const drawW  = W - GRID_LEFT;
      const step   = drawW / MAX_HISTORY;
      const pad    = 14; // top/bottom padding

      // ── Background gradient ──
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
      bgGrad.addColorStop(0, 'rgba(8,18,22,0.95)');
      bgGrad.addColorStop(1, 'rgba(5,12,14,0.98)');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // ── Piano-roll grid lines + note labels ──
      ctx.font = '9px ui-monospace, monospace';
      ctx.textAlign = 'right';
      for (const note of PIANO_NOTES) {
        const y = freqToY(note.freq, H - pad * 2) + pad;
        // Grid line
        ctx.strokeStyle = note.name.startsWith('C') ? 'rgba(212,162,70,0.12)' : 'rgba(255,255,255,0.04)';
        ctx.lineWidth = note.name.startsWith('C') ? 1 : 0.5;
        ctx.beginPath();
        ctx.moveTo(GRID_LEFT, y);
        ctx.lineTo(W, y);
        ctx.stroke();
        // Label
        ctx.fillStyle = note.name.startsWith('C') ? 'rgba(212,162,70,0.5)' : 'rgba(255,255,255,0.15)';
        ctx.fillText(note.name, GRID_LEFT - 4, y + 3);
      }

      // ── Left border line ──
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(GRID_LEFT, 0);
      ctx.lineTo(GRID_LEFT, H);
      ctx.stroke();

      const qari = qariPitchesRef.current;
      const user = userPitchesRef.current;

      const toY = (f: number) => freqToY(f, H - pad * 2) + pad;

      // ── Qari ribbon (teal, thick with gradient fill) ──
      if (qari.length > 1) {
        const startIdx = Math.max(0, qari.length - MAX_HISTORY);
        const count = qari.length - startIdx;

        // Fill area under pitch curve
        ctx.beginPath();
        let fillStarted = false;
        let lastX = GRID_LEFT;
        for (let i = 0; i < count; i++) {
          const f = qari[startIdx + i];
          if (!f) { fillStarted = false; continue; }
          const x = GRID_LEFT + i * step;
          const y = toY(f);
          if (!fillStarted) { ctx.moveTo(x, H); ctx.lineTo(x, y); fillStarted = true; }
          else ctx.lineTo(x, y);
          lastX = x;
        }
        ctx.lineTo(lastX, H);
        ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, 0, 0, H);
        fillGrad.addColorStop(0, 'rgba(13,148,136,0.12)');
        fillGrad.addColorStop(1, 'rgba(13,148,136,0.01)');
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // Stroke line
        ctx.beginPath();
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#D4A246';
        ctx.shadowColor = '#D4A246';
        ctx.shadowBlur = 8;
        let started = false;
        for (let i = 0; i < count; i++) {
          const f = qari[startIdx + i];
          if (!f) { started = false; continue; }
          const x = GRID_LEFT + i * step;
          const y = toY(f);
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // ── User ribbon (color-coded: green=close, amber=near, red=far) ──
      if (user.length > 1) {
        const startIdx = Math.max(0, user.length - MAX_HISTORY);
        const count = user.length - startIdx;

        // Draw segments with per-segment color
        for (let i = 1; i < count; i++) {
          const f1 = user[startIdx + i - 1];
          const f2 = user[startIdx + i];
          if (!f1 || !f2) continue;

          // Find corresponding qari pitch
          let qF: number | null = null;
          if (phase === 'together') {
            qF = qari[startIdx + i] ?? null;
          } else {
            const qIdx = Math.floor(((startIdx + i) / user.length) * qari.length);
            qF = qari[qIdx] ?? null;
          }

          let color = '#D4A246'; // amber default
          if (qF) {
            const cents = Math.abs(1200 * Math.log2(f2 / qF));
            color = cents < 50 ? '#5CB889' : cents < 120 ? '#D4A246' : '#FF4B4B';
          }

          const x1 = GRID_LEFT + (i - 1) * step;
          const x2 = GRID_LEFT + i * step;
          const y1 = toY(f1);
          const y2 = toY(f2);

          // Thick glowing line
          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.strokeStyle = color;
          ctx.lineCap = 'round';
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Subtle fill below
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineTo(x2, y2 + 4);
          ctx.lineTo(x1, y1 + 4);
          ctx.closePath();
          ctx.fillStyle = color + '30';
          ctx.fill();
        }
      }

      // ── Scrolling playhead line ──
      const activeData = phase === 'recording' || phase === 'together' ? user : qari;
      if (activeData.length > 0) {
        const headX = GRID_LEFT + Math.min(activeData.length, MAX_HISTORY) * step;
        // Glow
        const headGrad = ctx.createLinearGradient(headX - 8, 0, headX + 8, 0);
        headGrad.addColorStop(0, 'rgba(212,162,70,0)');
        headGrad.addColorStop(0.5, 'rgba(212,162,70,0.15)');
        headGrad.addColorStop(1, 'rgba(212,162,70,0)');
        ctx.fillStyle = headGrad;
        ctx.fillRect(headX - 8, 0, 16, H);
        // Line
        ctx.strokeStyle = 'rgba(212,162,70,0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(headX, 0);
        ctx.lineTo(headX, H);
        ctx.stroke();
        // Diamond head
        ctx.fillStyle = '#D4A246';
        ctx.beginPath();
        ctx.moveTo(headX, 2);
        ctx.lineTo(headX + 4, 6);
        ctx.lineTo(headX, 10);
        ctx.lineTo(headX - 4, 6);
        ctx.closePath();
        ctx.fill();
      }

      // ── Phase badge (top-left, inside canvas) ──
      const badges: Record<string, { text: string; color: string; bg: string }> = {
        listening: { text: '🎧  LISTENING', color: '#D4A246', bg: 'rgba(212,162,70,0.12)' },
        recording: { text: '🎤  YOUR TURN', color: '#FF4B4B', bg: 'rgba(255,75,75,0.12)' },
        together:  { text: '🎵  TOGETHER', color: '#D4A246', bg: 'rgba(212,162,70,0.12)' },
      };
      const badge = badges[phase];
      if (badge) {
        ctx.font = 'bold 9px system-ui';
        const tw = ctx.measureText(badge.text).width;
        const bx = GRID_LEFT + 8, by = 8, bw = tw + 14, bh = 20, br = 6;
        // Rounded rect
        ctx.beginPath();
        ctx.moveTo(bx + br, by);
        ctx.lineTo(bx + bw - br, by);
        ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + br);
        ctx.lineTo(bx + bw, by + bh - br);
        ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - br, by + bh);
        ctx.lineTo(bx + br, by + bh);
        ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - br);
        ctx.lineTo(bx, by + br);
        ctx.quadraticCurveTo(bx, by, bx + br, by);
        ctx.closePath();
        ctx.fillStyle = badge.bg;
        ctx.fill();
        ctx.strokeStyle = badge.color + '40';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.fillStyle = badge.color;
        ctx.textAlign = 'left';
        ctx.fillText(badge.text, bx + 7, by + 14);
      }

      // ── Legend bar (bottom) ──
      const legendY = H - 24;
      // Semi-transparent bar
      ctx.fillStyle = 'rgba(5,12,14,0.8)';
      ctx.fillRect(GRID_LEFT, legendY, drawW, 24);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(GRID_LEFT, legendY); ctx.lineTo(W, legendY); ctx.stroke();

      ctx.font = '9px system-ui';
      ctx.textAlign = 'left';
      // Qari legend
      ctx.fillStyle = '#D4A246';
      ctx.fillRect(GRID_LEFT + 10, legendY + 10, 12, 3);
      ctx.shadowColor = '#D4A246'; ctx.shadowBlur = 4;
      ctx.fillRect(GRID_LEFT + 10, legendY + 10, 12, 3);
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.fillText('Qari', GRID_LEFT + 26, legendY + 14);

      if (phase === 'recording' || phase === 'together') {
        // User legend
        ctx.fillStyle = '#5CB889';
        ctx.fillRect(GRID_LEFT + 65, legendY + 10, 12, 3);
        ctx.shadowColor = '#5CB889'; ctx.shadowBlur = 4;
        ctx.fillRect(GRID_LEFT + 65, legendY + 10, 12, 3);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillText('You', GRID_LEFT + 81, legendY + 14);

        // Color key
        ctx.fillStyle = '#5CB889'; ctx.fillText('● close', GRID_LEFT + 120, legendY + 14);
        ctx.fillStyle = '#D4A246'; ctx.fillText('● near', GRID_LEFT + 168, legendY + 14);
        ctx.fillStyle = '#FF4B4B'; ctx.fillText('● far', GRID_LEFT + 210, legendY + 14);
      }
    }

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const sessionStats     = allScores.length > 0 ? computeSessionStats(allScores) : null;
  const selectedAyahText = ayahs.find(a => a.number === selectedAyah)?.textUthmani;

  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ minHeight: '240px' }}>
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* ── IDLE ── */}
      {phase === 'idle' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 py-5 overflow-y-auto">

          {/* Mode tabs */}
          <div
            className="flex rounded-xl p-0.5 mb-4"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <button
              onClick={() => setPracticeMode('mode1')}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={practiceMode === 'mode1'
                ? { background: 'rgba(212,162,70,0.15)', color: '#D4A246' }
                : { color: '#57534E' }
              }
            >
              🎧 Listen then Recite
            </button>
            <button
              onClick={() => setPracticeMode('mode2')}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all"
              style={practiceMode === 'mode2'
                ? { background: 'rgba(212,162,70,0.15)', color: '#D4A246' }
                : { color: '#57534E' }
              }
            >
              🎤 Sing Together
            </button>
          </div>

          {/* Mode description */}
          <p className="text-xs text-center mb-2" style={{ color: '#57534E', maxWidth: '260px' }}>
            {practiceMode === 'mode1'
              ? 'Pauses playback, plays one ayah, then records your recitation — scored on pitch accuracy'
              : 'Mic opens while the Qari plays — both pitch contours shown in real-time'
            }
          </p>

          {/* Headphones warning for Mode 2 */}
          {practiceMode === 'mode2' && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg mb-3 text-[11px]"
              style={{ background: 'rgba(212,162,70,0.08)', border: '1px solid rgba(212,162,70,0.15)', color: '#D4A246', maxWidth: '280px' }}
            >
              <span className="text-base">🎧</span>
              <span>Use <strong>headphones</strong> for accurate results — speakers bleed into mic</span>
            </div>
          )}

          {/* Ayah picker (Mode 1 only — Mode 2 follows the main player) */}
          {practiceMode === 'mode1' && (
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => setSelectedAyah(a => Math.max(1, a - 1))}
                disabled={selectedAyah <= 1}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base font-bold disabled:opacity-30 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#78716C', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                ‹
              </button>
              <span className="text-sm font-medium min-w-[70px] text-center" style={{ color: '#EDEDEC' }}>
                Ayah {selectedAyah}
              </span>
              <button
                onClick={() => setSelectedAyah(a => Math.min(totalAyahs, a + 1))}
                disabled={selectedAyah >= totalAyahs}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-base font-bold disabled:opacity-30 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: '#78716C', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                ›
              </button>
            </div>
          )}

          {/* Arabic preview (Mode 1) */}
          {practiceMode === 'mode1' && selectedAyahText && (
            <p
              className="font-arabic text-sm text-center mb-4 leading-[2]"
              dir="rtl"
              style={{ color: '#57534E', maxWidth: '280px' }}
            >
              {selectedAyahText}
            </p>
          )}

          {/* Mode 2 hint */}
          {practiceMode === 'mode2' && (
            <p className="text-xs text-center mb-4" style={{ color: '#3D3C3A', maxWidth: '240px' }}>
              Keep the Quran playing — hit Start and sing along
            </p>
          )}

          {/* Session stats */}
          {sessionStats && (
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: sessionStats.averageScore >= 80 ? 'rgba(212,162,70,0.15)' : sessionStats.averageScore >= 50 ? 'rgba(212,162,70,0.10)' : 'rgba(217,99,91,0.15)',
                  color:      sessionStats.averageScore >= 80 ? '#D4A246'               : sessionStats.averageScore >= 50 ? '#D4A246'               : '#D9635B',
                }}
              >
                Session avg: {sessionStats.averageScore}%
              </span>
              <span className="text-[10px]" style={{ color: '#3D3C3A' }}>
                {allScores.length} ayah{allScores.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Start button */}
          <button
            onClick={practiceMode === 'mode1' ? startListening : startTogether}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #D4A246, #C89535)', boxShadow: '0 4px 20px rgba(212,162,70,0.3)', color: '#0E0D0C' }}
          >
            {practiceMode === 'mode1' ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start Listening
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
                Start Singing
              </>
            )}
          </button>
        </div>
      )}

      {/* ── LISTENING badge ── */}
      {phase === 'listening' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(212,162,70,0.2)', border: '1px solid rgba(212,162,70,0.3)' }}>
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D4A246' }} />
          <span className="text-xs font-medium" style={{ color: '#D4A246' }}>Step 1 — Listening to Qari</span>
        </div>
      )}

      {/* ── RECORDING badge + Done ── */}
      {phase === 'recording' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(217,99,91,0.2)', border: '1px solid rgba(217,99,91,0.3)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D9635B' }} />
            <span className="text-xs font-medium" style={{ color: '#D9635B' }}>Step 2 — Your Turn</span>
          </div>
          <button
            onClick={finishRecording}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#EDEDEC', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            Done
          </button>
        </div>
      )}

      {/* ── TOGETHER badge + Stop ── */}
      {phase === 'together' && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(212,162,70,0.2)', border: '1px solid rgba(212,162,70,0.3)' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#D4A246' }} />
            <span className="text-xs font-medium" style={{ color: '#D4A246' }}>Singing Together</span>
          </div>
          <button
            onClick={finishTogether}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', color: '#EDEDEC', border: '1px solid rgba(255,255,255,0.12)' }}
          >
            Stop
          </button>
        </div>
      )}

      {/* ── SCORED ── */}
      {phase === 'scored' && latestScore && (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center overflow-y-auto"
          style={{ background: 'rgba(14,13,12,0.88)', backdropFilter: 'blur(10px)' }}
        >
          <div
            className="rounded-2xl p-5 w-full max-w-xs mx-4 my-2"
            style={{ background: 'rgba(28,27,25,0.98)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="text-center mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl font-bold"
                style={{
                  background: gradeColor(latestScore.grade).bg,
                  color:      gradeColor(latestScore.grade).text,
                }}
              >
                {latestScore.grade}
              </div>
              <p className="text-xs mb-0.5" style={{ color: '#57534E' }}>Ayah {latestScore.ayahNumber}</p>
              <p className="text-2xl font-bold" style={{ color: '#EDEDEC' }}>{latestScore.overall}%</p>
            </div>

            <div className="space-y-2 mb-4">
              <ScoreBar label="Pitch"   value={latestScore.pitch}   />
              <ScoreBar label="Rhythm"  value={latestScore.rhythm}  />
              <ScoreBar label="Sustain" value={latestScore.sustain} />
            </div>

            {latestScore.feedback.length > 0 && (
              <div className="space-y-1 mb-4">
                {latestScore.feedback.slice(0, 2).map((msg, i) => (
                  <p key={i} className="text-xs leading-relaxed" style={{ color: '#78716C' }}>
                    {i === 0 && latestScore.overall >= 70 ? '✨ ' : '→ '}{msg}
                  </p>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => { setLatestScore(null); setPhaseSync('idle'); }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#EDEDEC' }}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Retry
              </button>
              {selectedAyah < totalAyahs && practiceMode === 'mode1' && (
                <button
                  onClick={() => {
                    setSelectedAyah(a => a + 1);
                    setLatestScore(null);
                    setPhaseSync('idle');
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors"
                  style={{ background: 'linear-gradient(135deg, #D4A246, #C89535)', color: '#0E0D0C' }}
                >
                  Next Ayah
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───

function gradeColor(grade: string) {
  if (grade === 'A') return { bg: 'rgba(212,162,70,0.15)',  text: '#D4A246' };
  if (grade === 'B') return { bg: 'rgba(212,162,70,0.10)',  text: '#D4A246' };
  if (grade === 'C') return { bg: 'rgba(212,162,70,0.15)', text: '#D4A246' };
  return                    { bg: 'rgba(217,99,91,0.15)',  text: '#D9635B' };
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? '#D4A246' : value >= 60 ? '#E8B84B' : '#D9635B';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] w-12 text-right" style={{ color: '#57534E' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[10px] font-medium w-8" style={{ color: '#A09F9B' }}>{value}%</span>
    </div>
  );
}
