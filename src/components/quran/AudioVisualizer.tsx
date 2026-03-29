'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export type VisualizerMode = 'analysis' | 'pitch' | 'practice';

interface Props {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  mode: VisualizerMode;
}

// ─── Pitch detection (autocorrelation / YIN-lite) ───

function detectPitch(buffer: Float32Array, sampleRate: number): number | null {
  const SIZE = buffer.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null;

  const correlation = new Float32Array(SIZE);
  for (let lag = 0; lag < SIZE; lag++) {
    let sum = 0;
    for (let i = 0; i < SIZE - lag; i++) sum += buffer[i] * buffer[i + lag];
    correlation[lag] = sum;
  }

  const threshold = 0.15;
  let foundDip = false, bestLag = -1, bestVal = -Infinity;
  const minLag = Math.floor(sampleRate / 800);
  const maxLag = Math.floor(sampleRate / 60);
  for (let lag = minLag; lag < Math.min(maxLag, SIZE); lag++) {
    const normalized = correlation[lag] / correlation[0];
    if (!foundDip && normalized < threshold) foundDip = true;
    if (foundDip && normalized > threshold && correlation[lag] > bestVal) {
      bestVal = correlation[lag]; bestLag = lag;
    }
  }
  return bestLag === -1 ? null : sampleRate / bestLag;
}

function detectRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
  return Math.sqrt(sum / buffer.length);
}

// ─── Music theory helpers ───

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function freqToMidi(freq: number): number {
  return 12 * Math.log2(freq / 440) + 69;
}

function freqToNote(freq: number): string {
  const midi = Math.round(freqToMidi(freq));
  return `${NOTE_NAMES[((midi % 12) + 12) % 12]}${Math.floor(midi / 12) - 1}`;
}

function freqToNoteName(freq: number): string {
  const midi = Math.round(freqToMidi(freq));
  return NOTE_NAMES[((midi % 12) + 12) % 12];
}

function freqToCents(freq: number): number {
  // Cents deviation from nearest semitone
  const midi = freqToMidi(freq);
  return Math.round((midi - Math.round(midi)) * 100);
}

// Maqam detection from pitch class set
const MAQAMAT: Record<string, number[]> = {
  'Bayati':    [0, 1.5, 3, 5, 7, 8, 10],    // D Eb F G A Bb C (quarter-tone on 2nd)
  'Rast':      [0, 2, 3.5, 5, 7, 9, 10.5],   // C D E↓ F G A B↓
  'Saba':      [0, 1.5, 3, 4, 5, 8, 10],      // D Eb F Gb G Bb C
  'Sikah':     [0, 1.5, 3.5, 5, 7, 8.5, 10.5],
  'Hijaz':     [0, 1, 4, 5, 7, 8, 10],        // D Eb F# G A Bb C
  'Nahawand':  [0, 2, 3, 5, 7, 8, 10],        // Natural minor
  'Ajam':      [0, 2, 4, 5, 7, 9, 11],        // Major scale
  'Kurd':      [0, 1, 3, 5, 7, 8, 10],        // Phrygian
};

function detectMaqam(noteHistogram: Map<number, number>): { name: string; confidence: number } | null {
  if (noteHistogram.size < 3) return null;

  // Find the most frequent note as tonic
  let maxCount = 0, tonic = 0;
  noteHistogram.forEach((count, note) => { if (count > maxCount) { maxCount = count; tonic = note; } });

  // Build interval set relative to tonic
  const intervals = new Set<number>();
  noteHistogram.forEach((_, note) => {
    intervals.add(((note - tonic) % 12 + 12) % 12);
  });

  let bestMatch = '', bestScore = 0;
  for (const [name, scale] of Object.entries(MAQAMAT)) {
    let matches = 0;
    for (const interval of intervals) {
      // Allow half-semitone tolerance for quarter tones
      if (scale.some(s => Math.abs(s - interval) <= 0.75)) matches++;
    }
    const score = matches / Math.max(intervals.size, scale.length);
    if (score > bestScore) { bestScore = score; bestMatch = name; }
  }

  return bestScore > 0.5 ? { name: bestMatch, confidence: Math.round(bestScore * 100) } : null;
}

// ─── Helpers ───

function freqToY(freq: number, height: number): number {
  const logMin = Math.log2(70), logMax = Math.log2(700);
  const logFreq = Math.log2(Math.max(70, Math.min(700, freq)));
  return height - ((logFreq - logMin) / (logMax - logMin)) * height * 0.85 - height * 0.05;
}

const MAX_PITCH_HISTORY = 200;

function getColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    primary: s.getPropertyValue('--color-primary').trim() || '#0D9488',
    accent: s.getPropertyValue('--color-accent').trim() || '#B45309',
    correct: s.getPropertyValue('--color-correct').trim() || '#059669',
    wrong: s.getPropertyValue('--color-wrong').trim() || '#DC2626',
    text: s.getPropertyValue('--color-text').trim() || '#1C1917',
    textSecondary: s.getPropertyValue('--color-text-secondary').trim() || '#78716C',
    textTertiary: s.getPropertyValue('--color-text-tertiary').trim() || '#A8A29E',
    surface: s.getPropertyValue('--color-surface').trim() || '#FFFFFF',
  };
}

// Pitch similarity: 0-100, based on cents distance
function pitchSimilarity(f1: number | null, f2: number | null): number | null {
  if (!f1 || !f2) return null;
  const cents = Math.abs(1200 * Math.log2(f1 / f2));
  // 0 cents = 100%, 100 cents (1 semitone) = 0%
  return Math.max(0, Math.round(100 - cents));
}

// ─── Component ───

export function AudioVisualizer({ analyserNode, isPlaying, mode }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Shared analysis state (persisted across frames via refs)
  const pitchHistoryRef = useRef<(number | null)[]>([]);
  const noteHistogramRef = useRef<Map<number, number>>(new Map());
  const pitchMinRef = useRef(Infinity);
  const pitchMaxRef = useRef(0);
  const sustainCountRef = useRef(0); // frames at ~same pitch = elongation
  const lastPitchRef = useRef<number | null>(null);
  const rmsHistoryRef = useRef<number[]>([]);

  // Practice mode
  const [isRecording, setIsRecording] = useState(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const userPitchHistoryRef = useRef<(number | null)[]>([]);
  const scoreHistoryRef = useRef<number[]>([]);
  const [avgScore, setAvgScore] = useState<number | null>(null);

  const startMic = useCallback(async () => {
    if (!analyserNode) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      micStreamRef.current = stream;
      const ctx = analyserNode.context as AudioContext;
      if (ctx.state === 'suspended') await ctx.resume();
      const micSource = ctx.createMediaStreamSource(stream);
      const micAnalyser = ctx.createAnalyser();
      micAnalyser.fftSize = 2048;
      micAnalyser.smoothingTimeConstant = 0.8;
      micSource.connect(micAnalyser);
      micAnalyserRef.current = micAnalyser;
      userPitchHistoryRef.current = [];
      scoreHistoryRef.current = [];
      setAvgScore(null);
      setIsRecording(true);
    } catch { /* mic denied */ }
  }, [analyserNode]);

  const stopMic = useCallback(() => {
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    micAnalyserRef.current = null;
    setIsRecording(false);
  }, []);

  useEffect(() => {
    return () => { micStreamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  useEffect(() => {
    pitchHistoryRef.current = [];
    userPitchHistoryRef.current = [];
    noteHistogramRef.current = new Map();
    pitchMinRef.current = Infinity;
    pitchMaxRef.current = 0;
    scoreHistoryRef.current = [];
    setAvgScore(null);
  }, [mode]);

  // ─── Animation loop ───
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sampleRate = analyserNode?.context.sampleRate ?? 44100;

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      if (!canvas || !ctx || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const W = container.clientWidth;
      const H = container.clientHeight;
      if (W === 0 || H === 0) return;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);

      if (!analyserNode) {
        const c = getColors();
        ctx.fillStyle = c.textTertiary;
        ctx.font = '13px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('Tap a visualizer tab while audio plays', W / 2, H / 2);
        return;
      }

      // Common: detect pitch
      const buf = new Float32Array(analyserNode.fftSize);
      analyserNode.getFloatTimeDomainData(buf);
      const rms = detectRMS(buf);
      const pitch = isPlaying ? detectPitch(buf, sampleRate) : null;

      // Track stats
      pitchHistoryRef.current.push(pitch);
      if (pitchHistoryRef.current.length > MAX_PITCH_HISTORY) pitchHistoryRef.current.shift();
      rmsHistoryRef.current.push(rms);
      if (rmsHistoryRef.current.length > MAX_PITCH_HISTORY) rmsHistoryRef.current.shift();

      if (pitch) {
        if (pitch < pitchMinRef.current) pitchMinRef.current = pitch;
        if (pitch > pitchMaxRef.current) pitchMaxRef.current = pitch;
        const midi = Math.round(freqToMidi(pitch)) % 12;
        noteHistogramRef.current.set(midi, (noteHistogramRef.current.get(midi) ?? 0) + 1);

        // Elongation detection
        if (lastPitchRef.current && Math.abs(1200 * Math.log2(pitch / lastPitchRef.current)) < 50) {
          sustainCountRef.current++;
        } else {
          sustainCountRef.current = 0;
        }
        lastPitchRef.current = pitch;
      } else {
        sustainCountRef.current = 0;
        lastPitchRef.current = null;
      }

      // Practice: detect user pitch
      let userPitch: number | null = null;
      if (mode === 'practice' && micAnalyserRef.current) {
        const micBuf = new Float32Array(micAnalyserRef.current.fftSize);
        micAnalyserRef.current.getFloatTimeDomainData(micBuf);
        userPitch = detectPitch(micBuf, sampleRate);
        userPitchHistoryRef.current.push(userPitch);
        if (userPitchHistoryRef.current.length > MAX_PITCH_HISTORY) userPitchHistoryRef.current.shift();

        const sim = pitchSimilarity(pitch, userPitch);
        if (sim !== null) {
          scoreHistoryRef.current.push(sim);
          // Update avg score every 30 frames (~0.5s)
          if (scoreHistoryRef.current.length % 30 === 0) {
            const avg = scoreHistoryRef.current.reduce((a, b) => a + b, 0) / scoreHistoryRef.current.length;
            setAvgScore(Math.round(avg));
          }
        }
      }

      const colors = getColors();

      if (mode === 'analysis') {
        drawAnalysis(ctx, W, H, pitch, rms, colors);
      } else if (mode === 'pitch') {
        drawMelody(ctx, W, H, pitch, colors);
      } else {
        drawPractice(ctx, W, H, pitch, userPitch, colors);
      }
    }

    // ─── ANALYSIS MODE: Live dashboard ───
    function drawAnalysis(ctx: CanvasRenderingContext2D, W: number, H: number, pitch: number | null, rms: number, colors: ReturnType<typeof getColors>) {
      const midX = W / 2;

      // ── Current note (big display) ──
      if (pitch) {
        const note = freqToNoteName(pitch);
        const octave = freqToNote(pitch).replace(note, '');
        const cents = freqToCents(pitch);

        // Note name
        ctx.font = `bold ${Math.min(72, W * 0.15)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillStyle = colors.primary;
        ctx.fillText(note, midX, H * 0.28);

        // Octave
        ctx.font = `${Math.min(24, W * 0.05)}px system-ui`;
        ctx.fillStyle = colors.textSecondary;
        ctx.fillText(octave, midX + Math.min(45, W * 0.09), H * 0.22);

        // Hz
        ctx.font = '13px system-ui';
        ctx.fillStyle = colors.textTertiary;
        ctx.fillText(`${Math.round(pitch)} Hz`, midX, H * 0.34);

        // Cents meter (tuner-style bar)
        const meterW = Math.min(180, W * 0.45);
        const meterH = 6;
        const meterX = midX - meterW / 2;
        const meterY = H * 0.38;

        // Background
        ctx.fillStyle = `${colors.textTertiary}20`;
        ctx.beginPath();
        ctx.roundRect(meterX, meterY, meterW, meterH, 3);
        ctx.fill();

        // Center mark
        ctx.fillStyle = `${colors.textTertiary}40`;
        ctx.fillRect(midX - 1, meterY - 2, 2, meterH + 4);

        // Cents indicator
        const centsPos = midX + (cents / 50) * (meterW / 2);
        const centsColor = Math.abs(cents) < 10 ? colors.correct : Math.abs(cents) < 30 ? colors.accent : colors.wrong;
        ctx.beginPath();
        ctx.arc(centsPos, meterY + meterH / 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = centsColor;
        ctx.fill();

        ctx.font = '10px system-ui';
        ctx.fillStyle = centsColor;
        ctx.fillText(`${cents > 0 ? '+' : ''}${cents}¢`, midX, meterY + 20);
      } else {
        ctx.font = `${Math.min(48, W * 0.1)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `${colors.textTertiary}60`;
        ctx.fillText('—', midX, H * 0.28);
        ctx.font = '13px system-ui';
        ctx.fillText(isPlaying ? 'Silence' : 'Play to begin', midX, H * 0.36);
      }

      // ── Stats grid below ──
      const statsY = H * 0.5;
      const colW = W / 4;

      // Volume meter
      drawStat(ctx, colW * 0.5, statsY, 'Volume', `${Math.round(rms * 1000)}`, colors, W);
      drawVolumeBar(ctx, colW * 0.5 - 25, statsY + 28, 50, 4, rms, colors);

      // Pitch range
      const rangeStr = pitchMinRef.current < Infinity
        ? `${freqToNoteName(pitchMinRef.current)} – ${freqToNoteName(pitchMaxRef.current)}`
        : '—';
      drawStat(ctx, colW * 1.5, statsY, 'Range', rangeStr, colors, W);

      // Elongation
      const isSustaining = sustainCountRef.current > 15; // ~0.25s at 60fps
      const sustainLabel = isSustaining ? 'Madd ━━' : 'Normal';
      drawStat(ctx, colW * 2.5, statsY, 'Sustain', sustainLabel, colors, W, isSustaining ? colors.accent : undefined);

      // Maqam
      const maqam = detectMaqam(noteHistogramRef.current);
      drawStat(ctx, colW * 3.5, statsY, 'Maqam', maqam ? maqam.name : '...', colors, W, maqam ? colors.primary : undefined);
      if (maqam) {
        ctx.font = '9px system-ui';
        ctx.fillStyle = colors.textTertiary;
        ctx.fillText(`${maqam.confidence}%`, colW * 3.5, statsY + 30);
      }

      // ── Mini pitch history at the bottom ──
      const histY = H * 0.68;
      const histH = H * 0.28;
      drawMiniContour(ctx, 16, histY, W - 32, histH, pitchHistoryRef.current, colors.primary, colors);
    }

    function drawStat(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, value: string, colors: ReturnType<typeof getColors>, _W: number, valueColor?: string) {
      ctx.textAlign = 'center';
      ctx.font = '10px system-ui';
      ctx.fillStyle = colors.textTertiary;
      ctx.fillText(label, x, y);
      ctx.font = 'bold 14px system-ui';
      ctx.fillStyle = valueColor ?? colors.text;
      ctx.fillText(value, x, y + 18);
    }

    function drawVolumeBar(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, rms: number, colors: ReturnType<typeof getColors>) {
      ctx.fillStyle = `${colors.textTertiary}20`;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 2); ctx.fill();
      const fillW = Math.min(1, rms * 10) * w;
      const col = rms > 0.08 ? colors.wrong : rms > 0.04 ? colors.accent : colors.correct;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.roundRect(x, y, fillW, h, 2); ctx.fill();
    }

    // ─── MELODY MODE: Pitch contour with annotations ───
    function drawMelody(ctx: CanvasRenderingContext2D, W: number, H: number, pitch: number | null, colors: ReturnType<typeof getColors>) {
      // Guide lines
      ctx.strokeStyle = `${colors.primary}0F`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      ctx.font = '10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = `${colors.textTertiary}80`;
      for (const f of [100, 150, 200, 300, 400, 500]) {
        const y = freqToY(f, H);
        ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W, y); ctx.stroke();
        ctx.fillText(freqToNote(f), 2, y + 3);
      }
      ctx.setLineDash([]);

      // Pitch range band
      if (pitchMinRef.current < Infinity) {
        const yTop = freqToY(pitchMaxRef.current, H);
        const yBot = freqToY(pitchMinRef.current, H);
        ctx.fillStyle = `${colors.primary}08`;
        ctx.fillRect(30, yTop, W - 30, yBot - yTop);
      }

      // Contour line
      drawContourLine(ctx, pitchHistoryRef.current, W, H, colors.primary, 2.5);

      // Elongation markers — show where the qari holds a note
      let sustainStart = -1;
      let sustainPitch: number | null = null;
      const history = pitchHistoryRef.current;
      for (let i = 1; i < history.length; i++) {
        const p = history[i];
        const prev = history[i - 1];
        const isSameNote = p && prev && Math.abs(1200 * Math.log2(p / prev)) < 50;
        if (isSameNote) {
          if (sustainStart === -1) { sustainStart = i - 1; sustainPitch = p; }
        } else {
          if (sustainStart !== -1 && i - sustainStart > 15 && sustainPitch) {
            // Draw elongation bracket
            const x1 = (sustainStart / MAX_PITCH_HISTORY) * W;
            const x2 = (i / MAX_PITCH_HISTORY) * W;
            const y = freqToY(sustainPitch, H);
            ctx.strokeStyle = `${colors.accent}80`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y - 8); ctx.lineTo(x1, y - 12); ctx.lineTo(x2, y - 12); ctx.lineTo(x2, y - 8);
            ctx.stroke();
            ctx.fillStyle = colors.accent;
            ctx.font = '9px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText('madd', (x1 + x2) / 2, y - 15);
          }
          sustainStart = -1; sustainPitch = null;
        }
      }

      // Current pitch dot
      if (pitch) {
        const y = freqToY(pitch, H);
        ctx.beginPath(); ctx.arc(W - 16, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `${colors.primary}4D`; ctx.fill();
        ctx.beginPath(); ctx.arc(W - 16, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = colors.primary; ctx.fill();
        ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'right'; ctx.fillStyle = colors.primary;
        ctx.fillText(freqToNote(pitch), W - 26, y - 6);
      }

      // Maqam badge
      const maqam = detectMaqam(noteHistogramRef.current);
      if (maqam) {
        ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left';
        ctx.fillStyle = colors.primary;
        ctx.fillText(`Maqam: ${maqam.name} (${maqam.confidence}%)`, 8, 16);
      }

      // Legend
      ctx.textAlign = 'left'; ctx.font = '10px system-ui';
      ctx.fillStyle = colors.primary;
      ctx.fillRect(8, H - 16, 8, 3); ctx.fillText('Qari', 20, H - 11);
      ctx.fillStyle = colors.accent;
      ctx.fillRect(58, H - 16, 8, 3); ctx.fillText('Madd', 70, H - 11);
    }

    // ─── PRACTICE MODE: Comparison with scoring ───
    function drawPractice(ctx: CanvasRenderingContext2D, W: number, H: number, pitch: number | null, userPitch: number | null, colors: ReturnType<typeof getColors>) {
      // Guide lines
      ctx.strokeStyle = `${colors.primary}0F`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      ctx.font = '10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillStyle = `${colors.textTertiary}80`;
      for (const f of [100, 150, 200, 300, 400, 500]) {
        const y = freqToY(f, H);
        ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(W, y); ctx.stroke();
        ctx.fillText(freqToNote(f), 2, y + 3);
      }
      ctx.setLineDash([]);

      // Qari contour
      drawContourLine(ctx, pitchHistoryRef.current, W, H, colors.primary, 2.5);

      // User contour — color-coded by similarity
      if (userPitchHistoryRef.current.length > 1) {
        const step = W / MAX_PITCH_HISTORY;
        const userH = userPitchHistoryRef.current;
        const qariH = pitchHistoryRef.current;

        for (let i = 1; i < userH.length; i++) {
          const f1 = userH[i - 1], f2 = userH[i];
          if (!f1 || !f2) continue;
          const x1 = (i - 1) * step, x2 = i * step;
          const y1 = freqToY(f1, H), y2 = freqToY(f2, H);

          // Color based on similarity to qari at same time index
          const qariPitch = qariH[i] ?? null;
          const sim = pitchSimilarity(f2, qariPitch);
          let color: string;
          if (sim === null) color = colors.accent;
          else if (sim >= 80) color = colors.correct;
          else if (sim >= 50) color = colors.accent;
          else color = colors.wrong;

          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.strokeStyle = color;
          ctx.lineCap = 'round';
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Real-time similarity indicator (right side)
      const currentSim = pitchSimilarity(pitch, userPitch);
      if (currentSim !== null) {
        const simColor = currentSim >= 80 ? colors.correct : currentSim >= 50 ? colors.accent : colors.wrong;
        ctx.font = `bold ${Math.min(36, W * 0.08)}px system-ui`;
        ctx.textAlign = 'right';
        ctx.fillStyle = simColor;
        ctx.fillText(`${currentSim}%`, W - 12, 30);
        ctx.font = '10px system-ui';
        ctx.fillStyle = colors.textTertiary;
        ctx.fillText('match', W - 12, 42);
      }

      // Legend
      ctx.textAlign = 'left'; ctx.font = '10px system-ui';
      ctx.fillStyle = colors.primary;
      ctx.fillRect(8, H - 16, 8, 3); ctx.fillText('Qari', 20, H - 11);
      ctx.fillStyle = colors.correct;
      ctx.fillRect(58, H - 16, 8, 3); ctx.fillText('You (match)', 70, H - 11);
      ctx.fillStyle = colors.wrong;
      ctx.fillRect(145, H - 16, 8, 3); ctx.fillText('You (off)', 157, H - 11);
    }

    // ─── Shared drawing helpers ───
    function drawContourLine(ctx: CanvasRenderingContext2D, history: (number | null)[], W: number, H: number, color: string, lw: number) {
      if (history.length < 2) return;
      const step = W / MAX_PITCH_HISTORY;
      // Glow
      ctx.save(); ctx.globalAlpha = 0.12; ctx.lineWidth = lw + 4; ctx.strokeStyle = color;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
      let started = false;
      for (let i = 0; i < history.length; i++) {
        const f = history[i]; if (!f) { started = false; continue; }
        const x = i * step, y = freqToY(f, H);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.restore();
      // Main
      ctx.beginPath(); ctx.lineWidth = lw; ctx.strokeStyle = color;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      started = false;
      for (let i = 0; i < history.length; i++) {
        const f = history[i]; if (!f) { started = false; continue; }
        const x = i * step, y = freqToY(f, H);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    function drawMiniContour(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, history: (number | null)[], color: string, colors: ReturnType<typeof getColors>) {
      // Background
      ctx.fillStyle = `${colors.textTertiary}08`;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.fill();
      ctx.strokeStyle = `${colors.textTertiary}15`;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.stroke();

      if (history.length < 2) return;
      const step = w / MAX_PITCH_HISTORY;
      ctx.save();
      ctx.beginPath(); ctx.roundRect(x, y, w, h, 8); ctx.clip();

      ctx.beginPath(); ctx.lineWidth = 2; ctx.strokeStyle = color;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      let started = false;
      for (let i = 0; i < history.length; i++) {
        const f = history[i]; if (!f) { started = false; continue; }
        const px = x + i * step;
        const py = y + h - ((Math.log2(Math.max(70, Math.min(700, f))) - Math.log2(70)) / (Math.log2(700) - Math.log2(70))) * h * 0.85 - h * 0.05;
        if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();
    }

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [analyserNode, mode, isPlaying]);

  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ minHeight: '200px' }}>
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Practice mode controls */}
      {mode === 'practice' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
          {avgScore !== null && (
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              avgScore >= 80 ? 'bg-correct/20 text-correct' :
              avgScore >= 50 ? 'bg-accent/20 text-accent' : 'bg-wrong/20 text-wrong'
            }`}>
              Avg: {avgScore}%
            </div>
          )}
          <button
            onClick={isRecording ? stopMic : startMic}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isRecording
                ? 'bg-wrong/20 text-wrong hover:bg-wrong/30'
                : 'bg-primary/20 text-primary hover:bg-primary/30'
            }`}
          >
            {isRecording ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-wrong animate-pulse" />
                Stop
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
                Record &amp; Compare
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
