'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import {
  detectPitchYIN,
  detectRMS,
  freqToMidi,
  freqToNoteLabel,
  freqToNoteName,
  freqToQuarterToneName,
  freqToQuarterToneCents,
  freqToCents,
  freqToY,
  type PitchResult,
} from '@/lib/audio/pitchEngine';
import {
  createMaqamDetectionState,
  updateMaqamDetection,
  formatMaqamDisplay,
  type MaqamDetectionState,
} from '@/lib/audio/maqamEngine';
import { scorePhrase, type PhraseScore, computeSessionStats } from '@/lib/audio/phraseScorer';

export type VisualizerMode = 'analysis' | 'pitch' | 'practice';

interface Props {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  mode: VisualizerMode;
  /** Current ayah number (for per-phrase scoring) */
  currentAyah?: number;
}

const MAX_PITCH_HISTORY = 200;

function getColors() {
  const s = getComputedStyle(document.documentElement);
  return {
    primary: s.getPropertyValue('--color-primary').trim() || '#5AB8A8',
    accent: s.getPropertyValue('--color-accent').trim() || '#D4A246',
    correct: s.getPropertyValue('--color-correct').trim() || '#5CB889',
    wrong: s.getPropertyValue('--color-wrong').trim() || '#D9635B',
    text: s.getPropertyValue('--color-text').trim() || '#EDEDEC',
    textSecondary: s.getPropertyValue('--color-text-secondary').trim() || '#A09F9B',
    textTertiary: s.getPropertyValue('--color-text-tertiary').trim() || '#636260',
    surface: s.getPropertyValue('--color-surface').trim() || '#1C1B19',
  };
}

export function AudioVisualizer({ analyserNode, isPlaying, mode, currentAyah }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  // Shared analysis state (persisted across frames via refs)
  const pitchHistoryRef = useRef<(number | null)[]>([]);
  const pitchMinRef = useRef(Infinity);
  const pitchMaxRef = useRef(0);
  const sustainCountRef = useRef(0);
  const lastPitchRef = useRef<number | null>(null);
  const rmsHistoryRef = useRef<number[]>([]);

  // Maqam detection state (jins-based)
  const maqamStateRef = useRef<MaqamDetectionState>(createMaqamDetectionState());
  const frameCountRef = useRef(0);

  // Practice mode
  const [isRecording, setIsRecording] = useState(false);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const userPitchHistoryRef = useRef<(number | null)[]>([]);
  const scoreHistoryRef = useRef<number[]>([]);

  // Per-phrase scoring
  const [phraseScores, setPhraseScores] = useState<PhraseScore[]>([]);
  const [latestScore, setLatestScore] = useState<PhraseScore | null>(null);
  const lastScoredAyahRef = useRef<number | null>(null);
  const qariPhrasePitchesRef = useRef<(number | null)[]>([]);
  const userPhrasePitchesRef = useRef<(number | null)[]>([]);
  const phraseAyahRef = useRef<number | null>(null);

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
      userPhrasePitchesRef.current = [];
      scoreHistoryRef.current = [];
      setLatestScore(null);
      setIsRecording(true);
    } catch { /* mic denied */ }
  }, [analyserNode]);

  const stopMic = useCallback(() => {
    // Score the current phrase before stopping
    if (phraseAyahRef.current !== null && userPhrasePitchesRef.current.length > 10) {
      const score = scorePhrase(
        qariPhrasePitchesRef.current,
        userPhrasePitchesRef.current,
        [], // word onsets - we don't have fine-grained detection yet
        [],
        phraseAyahRef.current,
        60
      );
      setLatestScore(score);
      setPhraseScores(prev => [...prev, score]);
    }

    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;
    micAnalyserRef.current = null;
    setIsRecording(false);
  }, []);

  // Detect ayah changes and auto-score the previous phrase
  useEffect(() => {
    if (currentAyah === undefined || !isRecording) return;
    if (phraseAyahRef.current !== null && phraseAyahRef.current !== currentAyah) {
      // Ayah changed — score the previous one
      if (userPhrasePitchesRef.current.length > 10 && lastScoredAyahRef.current !== phraseAyahRef.current) {
        const score = scorePhrase(
          qariPhrasePitchesRef.current,
          userPhrasePitchesRef.current,
          [], [],
          phraseAyahRef.current,
          60
        );
        setLatestScore(score);
        setPhraseScores(prev => [...prev, score]);
        lastScoredAyahRef.current = phraseAyahRef.current;
      }
      // Reset for new phrase
      qariPhrasePitchesRef.current = [];
      userPhrasePitchesRef.current = [];
    }
    phraseAyahRef.current = currentAyah;
  }, [currentAyah, isRecording]);

  useEffect(() => {
    return () => { micStreamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  useEffect(() => {
    pitchHistoryRef.current = [];
    userPitchHistoryRef.current = [];
    pitchMinRef.current = Infinity;
    pitchMaxRef.current = 0;
    maqamStateRef.current = createMaqamDetectionState();
    frameCountRef.current = 0;
    scoreHistoryRef.current = [];
    qariPhrasePitchesRef.current = [];
    userPhrasePitchesRef.current = [];
    setLatestScore(null);
    setPhraseScores([]);
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

      frameCountRef.current++;

      // Common: detect pitch with YIN
      const buf = new Float32Array(analyserNode.fftSize);
      analyserNode.getFloatTimeDomainData(buf);
      const rms = detectRMS(buf);
      const pitchResult: PitchResult | null = isPlaying ? detectPitchYIN(buf, sampleRate) : null;
      const pitch = pitchResult?.frequency ?? null;
      const pitchMidi = pitchResult?.midi ?? null;

      // Track stats
      pitchHistoryRef.current.push(pitch);
      if (pitchHistoryRef.current.length > MAX_PITCH_HISTORY) pitchHistoryRef.current.shift();
      rmsHistoryRef.current.push(rms);
      if (rmsHistoryRef.current.length > MAX_PITCH_HISTORY) rmsHistoryRef.current.shift();

      if (pitch && pitchMidi !== null) {
        if (pitch < pitchMinRef.current) pitchMinRef.current = pitch;
        if (pitch > pitchMaxRef.current) pitchMaxRef.current = pitch;

        // Maqam detection — feed fractional MIDI to jins engine
        const now = performance.now();
        maqamStateRef.current = updateMaqamDetection(maqamStateRef.current, pitchMidi, now);

        // Track per-phrase pitches for scoring
        qariPhrasePitchesRef.current.push(pitchMidi);

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
        qariPhrasePitchesRef.current.push(null);
      }

      // Practice: detect user pitch
      let userPitch: number | null = null;
      let userPitchMidi: number | null = null;
      if (mode === 'practice' && micAnalyserRef.current) {
        const micBuf = new Float32Array(micAnalyserRef.current.fftSize);
        micAnalyserRef.current.getFloatTimeDomainData(micBuf);
        const userResult = detectPitchYIN(micBuf, sampleRate);
        userPitch = userResult?.frequency ?? null;
        userPitchMidi = userResult?.midi ?? null;
        userPitchHistoryRef.current.push(userPitch);
        if (userPitchHistoryRef.current.length > MAX_PITCH_HISTORY) userPitchHistoryRef.current.shift();

        // Track per-phrase user pitches
        userPhrasePitchesRef.current.push(userPitchMidi);

        // Continuous similarity for real-time feedback
        if (pitch && userPitch) {
          const cents = Math.abs(1200 * Math.log2(pitch / userPitch));
          const sim = Math.max(0, Math.round(100 - cents));
          scoreHistoryRef.current.push(sim);
        }
      }

      const colors = getColors();

      if (mode === 'analysis') {
        drawAnalysis(ctx, W, H, pitch, pitchResult, rms, colors);
      } else if (mode === 'pitch') {
        drawMelody(ctx, W, H, pitch, colors);
      } else {
        drawPractice(ctx, W, H, pitch, userPitch, colors);
      }
    }

    // ─── ANALYSIS MODE: Live dashboard ───
    function drawAnalysis(ctx: CanvasRenderingContext2D, W: number, H: number, pitch: number | null, pitchResult: PitchResult | null, rms: number, colors: ReturnType<typeof getColors>) {
      const midX = W / 2;

      // ── Current note (big display) ──
      if (pitch && pitchResult) {
        const note = freqToNoteName(pitch);
        const quarterNote = freqToQuarterToneName(pitch);
        const label = freqToNoteLabel(pitch);
        const octave = label.replace(note, '');
        const cents = freqToCents(pitch);
        const quarterCents = freqToQuarterToneCents(pitch);

        // Note name
        ctx.font = `bold ${Math.min(72, W * 0.15)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillStyle = colors.primary;
        ctx.fillText(note, midX, H * 0.28);

        // Octave
        ctx.font = `${Math.min(24, W * 0.05)}px system-ui`;
        ctx.fillStyle = colors.textSecondary;
        ctx.fillText(octave, midX + Math.min(45, W * 0.09), H * 0.22);

        // Hz + confidence
        ctx.font = '13px system-ui';
        ctx.fillStyle = colors.textTertiary;
        const confLabel = pitchResult.confidence > 0.9 ? '●' : pitchResult.confidence > 0.7 ? '◐' : '○';
        ctx.fillText(`${Math.round(pitch)} Hz  ${confLabel}`, midX, H * 0.34);

        // Quarter-tone indicator (shows if the pitch is near a quarter tone)
        if (quarterNote !== note && Math.abs(quarterCents) < 15) {
          ctx.font = 'bold 11px system-ui';
          ctx.fillStyle = colors.accent;
          ctx.fillText(`≈ ${quarterNote} (¼ tone)`, midX, H * 0.40);
        }

        // Cents meter (tuner-style bar)
        const meterW = Math.min(180, W * 0.45);
        const meterH = 6;
        const meterX = midX - meterW / 2;
        const meterY = H * 0.43;

        ctx.fillStyle = `${colors.textTertiary}20`;
        ctx.beginPath(); ctx.roundRect(meterX, meterY, meterW, meterH, 3); ctx.fill();

        ctx.fillStyle = `${colors.textTertiary}40`;
        ctx.fillRect(midX - 1, meterY - 2, 2, meterH + 4);

        const centsPos = midX + (cents / 50) * (meterW / 2);
        const centsColor = Math.abs(cents) < 10 ? colors.correct : Math.abs(cents) < 30 ? colors.accent : colors.wrong;
        ctx.beginPath(); ctx.arc(centsPos, meterY + meterH / 2, 5, 0, Math.PI * 2);
        ctx.fillStyle = centsColor; ctx.fill();

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

      // ── Stats grid ──
      const statsY = H * 0.55;
      const colW = W / 4;

      // Volume
      drawStat(ctx, colW * 0.5, statsY, 'Volume', `${Math.round(rms * 1000)}`, colors);
      drawVolumeBar(ctx, colW * 0.5 - 25, statsY + 28, 50, 4, rms, colors);

      // Range
      const rangeStr = pitchMinRef.current < Infinity
        ? `${freqToNoteName(pitchMinRef.current)} – ${freqToNoteName(pitchMaxRef.current)}`
        : '—';
      drawStat(ctx, colW * 1.5, statsY, 'Range', rangeStr, colors);

      // Sustain
      const isSustaining = sustainCountRef.current > 15;
      drawStat(ctx, colW * 2.5, statsY, 'Sustain', isSustaining ? 'Madd ━━' : 'Normal', colors, isSustaining ? colors.accent : undefined);

      // Maqam (jins-based)
      const maqamDisplay = formatMaqamDisplay(maqamStateRef.current);
      if (maqamDisplay) {
        drawStat(ctx, colW * 3.5, statsY, 'Maqam', maqamDisplay.label.replace('Maqam ', ''), colors, colors.primary);
        ctx.font = '9px system-ui';
        ctx.fillStyle = colors.textTertiary;
        ctx.textAlign = 'center';
        ctx.fillText(`${maqamDisplay.confidence}% · ${maqamDisplay.sublabel.split(' — ')[0]}`, colW * 3.5, statsY + 30);
      } else {
        const elapsed = maqamStateRef.current.timestamps.length > 0
          ? (performance.now() - maqamStateRef.current.timestamps[0]) / 1000
          : 0;
        const statusText = elapsed > 0 ? `Listening... ${Math.round(elapsed)}s` : '...';
        drawStat(ctx, colW * 3.5, statsY, 'Maqam', statusText, colors);
      }

      // Modulations indicator
      const mods = maqamStateRef.current.modulations;
      if (mods.length > 0) {
        ctx.font = '9px system-ui';
        ctx.textAlign = 'center';
        ctx.fillStyle = colors.accent;
        const lastMod = mods[mods.length - 1];
        ctx.fillText(`↗ ${lastMod.fromJins} → ${lastMod.toJins}`, colW * 3.5, statsY + 42);
      }

      // ── Mini pitch contour ──
      const histY = H * 0.72;
      const histH = H * 0.24;
      drawMiniContour(ctx, 16, histY, W - 32, histH, pitchHistoryRef.current, colors.primary, colors);
    }

    function drawStat(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, value: string, colors: ReturnType<typeof getColors>, valueColor?: string) {
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

    // ─── MELODY MODE ───
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
        ctx.fillText(freqToNoteLabel(f), 2, y + 3);
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

      // Elongation markers
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
        ctx.fillText(freqToNoteLabel(pitch), W - 26, y - 6);
      }

      // Maqam badge (jins-based)
      const maqamDisplay = formatMaqamDisplay(maqamStateRef.current);
      if (maqamDisplay) {
        ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left';
        ctx.fillStyle = colors.primary;
        ctx.fillText(`${maqamDisplay.label} (${maqamDisplay.confidence}%)`, 8, 16);
        if (maqamDisplay.sublabel) {
          ctx.font = '9px system-ui';
          ctx.fillStyle = colors.textTertiary;
          ctx.fillText(maqamDisplay.sublabel.split(' — ')[0], 8, 28);
        }
      }

      // Legend
      ctx.textAlign = 'left'; ctx.font = '10px system-ui';
      ctx.fillStyle = colors.primary;
      ctx.fillRect(8, H - 16, 8, 3); ctx.fillText('Qari', 20, H - 11);
      ctx.fillStyle = colors.accent;
      ctx.fillRect(58, H - 16, 8, 3); ctx.fillText('Madd', 70, H - 11);
    }

    // ─── PRACTICE MODE: Per-ayah scoring ───
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
        ctx.fillText(freqToNoteLabel(f), 2, y + 3);
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

          const qariPitch = qariH[i] ?? null;
          let color: string;
          if (!qariPitch) {
            color = colors.accent;
          } else {
            const cents = Math.abs(1200 * Math.log2(f2 / qariPitch));
            const sim = Math.max(0, 100 - cents);
            color = sim >= 80 ? colors.correct : sim >= 50 ? colors.accent : colors.wrong;
          }

          ctx.beginPath();
          ctx.lineWidth = 3;
          ctx.strokeStyle = color;
          ctx.lineCap = 'round';
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }

      // Real-time similarity indicator
      if (pitch && userPitch) {
        const cents = Math.abs(1200 * Math.log2(pitch / userPitch));
        const currentSim = Math.max(0, Math.round(100 - cents));
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
      ctx.save(); ctx.globalAlpha = 0.12; ctx.lineWidth = lw + 4; ctx.strokeStyle = color;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.beginPath();
      let started = false;
      for (let i = 0; i < history.length; i++) {
        const f = history[i]; if (!f) { started = false; continue; }
        const x = i * step, y = freqToY(f, H);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke(); ctx.restore();
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

  // Session stats
  const sessionStats = phraseScores.length > 0 ? computeSessionStats(phraseScores) : null;

  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ minHeight: '200px' }}>
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Practice mode controls */}
      {mode === 'practice' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
          {/* Session stats */}
          {sessionStats && (
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                sessionStats.averageScore >= 80 ? 'bg-correct/20 text-correct' :
                sessionStats.averageScore >= 50 ? 'bg-accent/20 text-accent' : 'bg-wrong/20 text-wrong'
              }`}>
                Avg: {sessionStats.averageScore}%
              </div>
              <span className="text-[10px] text-text-tertiary">
                {sessionStats.scores.length} phrase{sessionStats.scores.length !== 1 ? 's' : ''}
              </span>
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

      {/* Per-phrase scorecard overlay */}
      {mode === 'practice' && latestScore && !isRecording && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-canvas/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-modal p-6 max-w-xs w-full mx-4 text-center">
            {/* Letter grade */}
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold ${
              latestScore.grade === 'A' ? 'bg-correct/20 text-correct' :
              latestScore.grade === 'B' ? 'bg-primary/20 text-primary' :
              latestScore.grade === 'C' ? 'bg-accent/20 text-accent' :
              'bg-wrong/20 text-wrong'
            }`}>
              {latestScore.grade}
            </div>
            <p className="text-sm text-text-secondary mb-1">Ayah {latestScore.ayahNumber}</p>
            <p className="text-2xl font-bold text-text mb-4">{latestScore.overall}%</p>

            {/* Sub-score bars */}
            <div className="space-y-2 mb-4">
              <ScoreBar label="Pitch" value={latestScore.pitch} />
              <ScoreBar label="Rhythm" value={latestScore.rhythm} />
              <ScoreBar label="Sustain" value={latestScore.sustain} />
            </div>

            {/* Feedback */}
            {latestScore.feedback.length > 0 && (
              <div className="text-left space-y-1 mb-4">
                {latestScore.feedback.slice(0, 3).map((msg, i) => (
                  <p key={i} className="text-xs text-text-secondary leading-relaxed">
                    {i === 0 && latestScore.overall >= 70 ? '✨ ' : '→ '}{msg}
                  </p>
                ))}
              </div>
            )}

            {/* Try again */}
            <button
              onClick={() => {
                setLatestScore(null);
                startMic();
              }}
              className="btn-primary text-sm px-6 py-2.5 w-full"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Score bar component ───

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? 'bg-correct' : value >= 60 ? 'bg-accent' : 'bg-wrong';
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-text-tertiary w-12 text-right">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-border-light">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] text-text-secondary font-medium w-8">{value}%</span>
    </div>
  );
}
