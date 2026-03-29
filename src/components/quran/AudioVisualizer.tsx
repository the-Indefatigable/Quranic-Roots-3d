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

export type VisualizerMode = 'spectrum' | 'pitch' | 'practice';

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

  // ─── Shared analysis state (persisted across ALL tabs — never cleared on mode switch) ───
  const pitchHistoryRef = useRef<(number | null)[]>([]);
  const pitchMinRef = useRef(Infinity);
  const pitchMaxRef = useRef(0);
  const sustainCountRef = useRef(0);
  const lastPitchRef = useRef<number | null>(null);
  const rmsHistoryRef = useRef<number[]>([]);

  // Maqam detection state (jins-based — persisted across tabs)
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
        [], [],
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
      qariPhrasePitchesRef.current = [];
      userPhrasePitchesRef.current = [];
    }
    phraseAyahRef.current = currentAyah;
  }, [currentAyah, isRecording]);

  useEffect(() => {
    return () => { micStreamRef.current?.getTracks().forEach((t) => t.stop()); };
  }, []);

  // ─── FIX: Only clear practice-specific state on mode switch ───
  // Pitch history, maqam state, and RMS are SHARED across all tabs.
  // Only practice-specific UI state needs resetting.
  useEffect(() => {
    if (mode === 'practice') {
      // Reset practice scoring when entering practice mode
      userPitchHistoryRef.current = [];
      scoreHistoryRef.current = [];
      qariPhrasePitchesRef.current = [];
      userPhrasePitchesRef.current = [];
      setLatestScore(null);
      setPhraseScores([]);
    }
    // Do NOT clear pitchHistoryRef, maqamStateRef, rmsHistoryRef, etc.
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
        ctx.fillText('Play audio to see visualization', W / 2, H / 2);
        return;
      }

      frameCountRef.current++;

      // ── Common: detect pitch with YIN (runs on every tab) ──
      const buf = new Float32Array(analyserNode.fftSize);
      analyserNode.getFloatTimeDomainData(buf);
      const rms = detectRMS(buf);
      const pitchResult: PitchResult | null = isPlaying ? detectPitchYIN(buf, sampleRate) : null;
      const pitch = pitchResult?.frequency ?? null;
      const pitchMidi = pitchResult?.midi ?? null;

      // Track stats (runs on EVERY tab so data persists across switches)
      pitchHistoryRef.current.push(pitch);
      if (pitchHistoryRef.current.length > MAX_PITCH_HISTORY) pitchHistoryRef.current.shift();
      rmsHistoryRef.current.push(rms);
      if (rmsHistoryRef.current.length > MAX_PITCH_HISTORY) rmsHistoryRef.current.shift();

      if (pitch && pitchMidi !== null) {
        if (pitch < pitchMinRef.current) pitchMinRef.current = pitch;
        if (pitch > pitchMaxRef.current) pitchMaxRef.current = pitch;

        // Maqam detection — always accumulating regardless of tab
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

        userPhrasePitchesRef.current.push(userPitchMidi);

        if (pitch && userPitch) {
          const cents = Math.abs(1200 * Math.log2(pitch / userPitch));
          const sim = Math.max(0, Math.round(100 - cents));
          scoreHistoryRef.current.push(sim);
        }
      }

      const colors = getColors();

      if (mode === 'spectrum') {
        drawSpectrum(ctx, W, H, pitch, pitchResult, rms, colors);
      } else if (mode === 'pitch') {
        drawMelody(ctx, W, H, pitch, colors);
      } else {
        drawPractice(ctx, W, H, pitch, userPitch, colors);
      }
    }

    // ─── SPECTRUM MODE: FFT frequency bars + live stats ───
    function drawSpectrum(ctx: CanvasRenderingContext2D, W: number, H: number, pitch: number | null, pitchResult: PitchResult | null, rms: number, colors: ReturnType<typeof getColors>) {
      if (!analyserNode) return;

      // ── FFT frequency spectrum (bottom half) ──
      const freqData = new Float32Array(analyserNode.frequencyBinCount);
      analyserNode.getFloatFrequencyData(freqData);
      const binCount = analyserNode.frequencyBinCount;
      const nyquist = sampleRate / 2;

      const spectrumY = H * 0.48;
      const spectrumH = H * 0.48;
      const barCount = Math.min(128, Math.floor(W / 4));

      // Draw spectrum bars (log-scaled frequency axis for better visualization)
      for (let i = 0; i < barCount; i++) {
        // Log-scale mapping: more detail at low frequencies
        const frac = i / barCount;
        const logFreq = 60 * Math.pow(10, frac * Math.log10(8000 / 60));
        const binIndex = Math.round((logFreq / nyquist) * binCount);
        if (binIndex >= binCount) continue;

        // Average a few nearby bins for smoother display
        let dbSum = 0;
        let count = 0;
        for (let b = Math.max(0, binIndex - 1); b <= Math.min(binCount - 1, binIndex + 1); b++) {
          dbSum += freqData[b];
          count++;
        }
        const db = count > 0 ? dbSum / count : -100;

        // Normalize: -100dB → 0, 0dB → 1
        const normalized = Math.max(0, (db + 100) / 100);
        const barH = normalized * spectrumH * 0.9;

        // Color: primary for most, accent for harmonics of detected pitch
        let barColor = colors.primary;
        let alpha = 0.5;
        if (pitch) {
          // Highlight fundamental and harmonics
          for (let harmonic = 1; harmonic <= 5; harmonic++) {
            const harmonicFreq = pitch * harmonic;
            if (Math.abs(logFreq - harmonicFreq) / harmonicFreq < 0.08) {
              barColor = harmonic === 1 ? colors.correct : colors.accent;
              alpha = harmonic === 1 ? 1.0 : 0.8;
              break;
            }
          }
        }

        const barW = Math.max(1, (W / barCount) - 1.5);
        const x = (i / barCount) * W;
        ctx.fillStyle = barColor;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.roundRect(x, spectrumY + spectrumH - barH, barW, barH, 1);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Frequency axis labels
      ctx.font = '9px system-ui';
      ctx.textAlign = 'center';
      ctx.fillStyle = `${colors.textTertiary}80`;
      for (const f of [100, 200, 500, 1000, 2000, 5000]) {
        const logFrac = Math.log10(f / 60) / Math.log10(8000 / 60);
        if (logFrac < 0 || logFrac > 1) continue;
        const x = logFrac * W;
        ctx.fillText(f >= 1000 ? `${f / 1000}k` : `${f}`, x, spectrumY + spectrumH + 12);
      }

      // ── Current note display (top area) ──
      const midX = W / 2;
      if (pitch && pitchResult) {
        const note = freqToNoteName(pitch);
        const quarterNote = freqToQuarterToneName(pitch);
        const label = freqToNoteLabel(pitch);
        const octave = label.replace(note, '');
        const cents = freqToCents(pitch);
        const quarterCents = freqToQuarterToneCents(pitch);

        // Note name
        ctx.font = `bold ${Math.min(48, W * 0.10)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillStyle = colors.primary;
        ctx.fillText(note, midX * 0.45, H * 0.15);

        // Octave subscript
        ctx.font = `${Math.min(18, W * 0.04)}px system-ui`;
        ctx.fillStyle = colors.textSecondary;
        ctx.fillText(octave, midX * 0.45 + Math.min(30, W * 0.07), H * 0.11);

        // Hz + confidence
        ctx.font = '11px system-ui';
        ctx.fillStyle = colors.textTertiary;
        const confDot = pitchResult.confidence > 0.9 ? '●' : pitchResult.confidence > 0.7 ? '◐' : '○';
        ctx.fillText(`${Math.round(pitch)} Hz ${confDot}`, midX * 0.45, H * 0.20);

        // Quarter-tone indicator
        if (quarterNote !== note && Math.abs(quarterCents) < 15) {
          ctx.font = 'bold 10px system-ui';
          ctx.fillStyle = colors.accent;
          ctx.fillText(`≈ ${quarterNote} (¼ tone)`, midX * 0.45, H * 0.25);
        }

        // Cents meter
        const meterW = Math.min(120, W * 0.25);
        const meterH = 5;
        const meterX = midX * 0.45 - meterW / 2;
        const meterY = H * 0.28;

        ctx.fillStyle = `${colors.textTertiary}20`;
        ctx.beginPath(); ctx.roundRect(meterX, meterY, meterW, meterH, 3); ctx.fill();
        ctx.fillStyle = `${colors.textTertiary}40`;
        ctx.fillRect(midX * 0.45 - 0.5, meterY - 1, 1, meterH + 2);

        const centsPos = midX * 0.45 + (cents / 50) * (meterW / 2);
        const centsColor = Math.abs(cents) < 10 ? colors.correct : Math.abs(cents) < 30 ? colors.accent : colors.wrong;
        ctx.beginPath(); ctx.arc(centsPos, meterY + meterH / 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = centsColor; ctx.fill();

        ctx.font = '9px system-ui';
        ctx.fillStyle = centsColor;
        ctx.fillText(`${cents > 0 ? '+' : ''}${cents}¢`, midX * 0.45, meterY + 16);

        // ── Stats panel (right side) ── Plain English for learners
        const statsX = midX * 1.3;
        let statsY = H * 0.08;
        const lineH = 38;

        // Volume
        const volLabel = rms > 0.08 ? 'Loud' : rms > 0.03 ? 'Good' : rms > 0.01 ? 'Soft' : 'Silent';
        const volColor = rms > 0.08 ? colors.wrong : rms > 0.03 ? colors.correct : rms > 0.01 ? colors.accent : undefined;
        drawStatCompact(ctx, statsX, statsY, 'Volume', volLabel, colors, volColor);
        drawVolumeBar(ctx, statsX - 20, statsY + 16, 40, 3, rms, colors);
        statsY += lineH;

        // Range
        let rangeLabel = '—';
        if (pitchMinRef.current < Infinity) {
          const rangeSemitones = freqToMidi(pitchMaxRef.current) - freqToMidi(pitchMinRef.current);
          rangeLabel = rangeSemitones < 4 ? 'Narrow' : rangeSemitones < 8 ? 'Normal' : rangeSemitones < 14 ? 'Wide' : 'Very wide';
          ctx.font = '8px system-ui';
          ctx.fillStyle = colors.textTertiary;
          ctx.textAlign = 'center';
          ctx.fillText(`${freqToNoteName(pitchMinRef.current)}–${freqToNoteName(pitchMaxRef.current)}`, statsX, statsY + 26);
        }
        drawStatCompact(ctx, statsX, statsY, 'Range', rangeLabel, colors);
        statsY += lineH;

        // Sustain
        const isSustaining = sustainCountRef.current > 15;
        const sustainLabel = isSustaining
          ? (sustainCountRef.current > 45 ? 'Long madd ━━' : 'Madd ━')
          : 'Normal';
        drawStatCompact(ctx, statsX, statsY, 'Sustain', sustainLabel, colors, isSustaining ? colors.accent : undefined);
        statsY += lineH;

        // Maqam (jins-based — stable once locked)
        const maqamDisplay = formatMaqamDisplay(maqamStateRef.current);
        if (maqamDisplay) {
          const maqamName = maqamDisplay.label.replace('Maqam ', '');
          drawStatCompact(ctx, statsX, statsY, 'Maqam', maqamName, colors, colors.primary);
          // Show lock indicator
          if (maqamStateRef.current.isLocked) {
            ctx.font = '8px system-ui';
            ctx.fillStyle = colors.correct;
            ctx.textAlign = 'center';
            ctx.fillText('🔒 Confirmed', statsX, statsY + 26);
          } else {
            ctx.font = '8px system-ui';
            ctx.fillStyle = colors.textTertiary;
            ctx.textAlign = 'center';
            ctx.fillText(`${maqamDisplay.confidence}% confident`, statsX, statsY + 26);
          }
          // Show jins description below
          if (maqamDisplay.sublabel) {
            statsY += lineH;
            ctx.font = '8px system-ui';
            ctx.fillStyle = colors.textTertiary;
            ctx.textAlign = 'center';
            const desc = maqamDisplay.sublabel.split(' · ')[0]; // just the jins description
            if (desc.length > 35) {
              ctx.fillText(desc.slice(0, 35) + '…', statsX, statsY);
            } else {
              ctx.fillText(desc, statsX, statsY);
            }
          }
        } else {
          const elapsed = maqamStateRef.current.timestamps.length > 0
            ? (performance.now() - maqamStateRef.current.timestamps[0]) / 1000
            : 0;
          drawStatCompact(ctx, statsX, statsY, 'Maqam', elapsed > 0 ? 'Listening…' : '—', colors);
          if (elapsed > 0) {
            ctx.font = '8px system-ui';
            ctx.fillStyle = colors.textTertiary;
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round(10 - elapsed)}s remaining`, statsX, statsY + 26);
          }
        }
        statsY += lineH;

        // Modulations
        const mods = maqamStateRef.current.modulations;
        if (mods.length > 0) {
          const lastMod = mods[mods.length - 1];
          drawStatCompact(ctx, statsX, statsY, 'Shift', `${lastMod.fromJins} → ${lastMod.toJins}`, colors, colors.accent);
        }
      } else {
        ctx.font = `${Math.min(36, W * 0.08)}px system-ui`;
        ctx.textAlign = 'center';
        ctx.fillStyle = `${colors.textTertiary}60`;
        ctx.fillText('—', midX, H * 0.15);
        ctx.font = '12px system-ui';
        ctx.fillText(isPlaying ? 'Detecting...' : 'Play to begin', midX, H * 0.22);
      }

      // Harmonic label
      if (pitch) {
        ctx.font = '9px system-ui';
        ctx.textAlign = 'left';
        ctx.fillStyle = colors.correct;
        ctx.fillRect(8, spectrumY - 14, 6, 2);
        ctx.fillText(' Fundamental', 16, spectrumY - 10);
        ctx.fillStyle = colors.accent;
        ctx.fillRect(90, spectrumY - 14, 6, 2);
        ctx.fillText(' Harmonics', 98, spectrumY - 10);
      }
    }

    function drawStatCompact(ctx: CanvasRenderingContext2D, x: number, y: number, label: string, value: string, colors: ReturnType<typeof getColors>, valueColor?: string) {
      ctx.textAlign = 'center';
      ctx.font = '9px system-ui';
      ctx.fillStyle = colors.textTertiary;
      ctx.fillText(label, x, y);
      ctx.font = 'bold 13px system-ui';
      ctx.fillStyle = valueColor ?? colors.text;
      ctx.fillText(value, x, y + 14);
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

            <div className="space-y-2 mb-4">
              <ScoreBar label="Pitch" value={latestScore.pitch} />
              <ScoreBar label="Rhythm" value={latestScore.rhythm} />
              <ScoreBar label="Sustain" value={latestScore.sustain} />
            </div>

            {latestScore.feedback.length > 0 && (
              <div className="text-left space-y-1 mb-4">
                {latestScore.feedback.slice(0, 3).map((msg, i) => (
                  <p key={i} className="text-xs text-text-secondary leading-relaxed">
                    {i === 0 && latestScore.overall >= 70 ? '✨ ' : '→ '}{msg}
                  </p>
                ))}
              </div>
            )}

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
