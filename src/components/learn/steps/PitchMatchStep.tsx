'use client';

/**
 * PitchMatchStep — "Talaqqi Mode"
 *
 * Revolutionary approach based on how Qirat is actually taught:
 *
 * OLD: Listen → memorize → hum from memory → get scored (impossible for non-singers)
 * NEW: Reference tone plays CONTINUOUSLY while you tune to it — like a tuning fork.
 *      You don't memorize. You listen and adjust in real time until you land on it.
 *
 * Key principles:
 * 1. Simultaneous reference — target tone plays at 15% volume while mic is open
 * 2. Pitch Highway visual — full-width, shows your voice as a glowing orb vs golden band
 * 3. Large directional arrows — "Slide up ↑" / "Come down ↓" / "You're there!"
 * 4. Hold-to-pass — accumulate 1.5 cumulative seconds inside the zone (no countdown pressure)
 * 5. Note-by-note — one pitch at a time, builds up to the full jins melody
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { detectPitchYIN } from '@/lib/audio/pitchEngine';
import type { PitchMatchContent } from '@/data/qirat-curriculum';

interface Props {
  content: PitchMatchContent;
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void;
}

type Phase = 'intro' | 'active' | 'note_success' | 'done';

// How far in cents counts as "in the zone" — generous for beginners
const ZONE_CENTS = 80;
// Frames at 60fps needed to pass a note (1.5 seconds)
const PASS_FRAMES = 90;
// How many smoothed frames to average for stability
const SMOOTH_WINDOW = 6;

// Direction text and color based on cents offset
function getDirectionInfo(centsOffset: number | null): {
  label: string;
  arrow: string | null;
  color: string;
  inZone: boolean;
} {
  if (centsOffset === null) {
    return { label: 'Open your mouth and make a sound — any sound', arrow: null, color: '#57534E', inZone: false };
  }
  const abs = Math.abs(centsOffset);
  if (abs <= ZONE_CENTS) {
    return { label: "You're in the zone — hold it!", arrow: null, color: '#5CB889', inZone: true };
  }
  if (centsOffset > 0) {
    // user is above target
    if (abs < 200) return { label: 'Slightly too high — come down a little', arrow: '↓', color: '#D97706', inZone: false };
    return { label: 'Too high — lower your voice', arrow: '↓↓', color: '#D9635B', inZone: false };
  } else {
    // user is below target
    if (abs < 200) return { label: 'Slightly too low — slide up a little', arrow: '↑', color: '#D97706', inZone: false };
    return { label: 'Too low — raise your voice higher', arrow: '↑↑', color: '#D9635B', inZone: false };
  }
}

export function PitchMatchStep({ content, onAnswer }: Props) {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentNoteIdx, setCurrentNoteIdx] = useState(0);
  const [noteScores, setNoteScores] = useState<boolean[]>([]); // pass/fail per note
  const [holdProgress, setHoldProgress] = useState(0); // 0-100, frames in zone
  const [centsOffset, setCentsOffset] = useState<number | null>(null);
  const [orb, setOrb] = useState({ y: 0.5, active: false }); // orb Y position 0-1

  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const refOscRef = useRef<OscillatorNode | null>(null);
  const refGainRef = useRef<GainNode | null>(null);
  const freqHistoryRef = useRef<number[]>([]); // for smoothing
  const passedFramesRef = useRef(0);
  const noteIdxRef = useRef(0);
  const phaseRef = useRef<Phase>('intro');

  const threshold = content.passThreshold ?? 70;
  const noteCount = content.targetNotes?.length ?? 0;

  // ── Get or create AudioContext ─────────────────────────────
  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // ── Play reference tone at low volume simultaneously ───────
  const startRefTone = useCallback((freq: number) => {
    const ctx = getCtx();
    // Stop previous
    refOscRef.current?.stop();
    refGainRef.current?.disconnect();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.3); // gentle fade in
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    refOscRef.current = osc;
    refGainRef.current = gain;
  }, [getCtx]);

  const stopRefTone = useCallback(() => {
    if (refGainRef.current && audioCtxRef.current) {
      refGainRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.2);
      setTimeout(() => {
        refOscRef.current?.stop();
        refOscRef.current = null;
      }, 300);
    }
  }, []);

  // ── Brief success tone when note is hit ───────────────────
  const playSuccessTone = useCallback((freq: number) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq * 1.5; // octave up for celebration
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  }, [getCtx]);

  // ── Start mic + detection ─────────────────────────────────
  const startActive = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      micStreamRef.current = stream;
      const ctx = getCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);
      analyserRef.current = analyser;

      passedFramesRef.current = 0;
      noteIdxRef.current = 0;
      freqHistoryRef.current = [];

      phaseRef.current = 'active';
      setPhase('active');
      setCurrentNoteIdx(0);
      setHoldProgress(0);

      // Start playing reference tone for first note
      if (content.targetNotes?.[0]) {
        startRefTone(content.targetNotes[0]);
      }
    } catch {
      // Mic denied — pass gracefully
      onAnswer(true, 'mic_denied', 'mic_required',
        'Mic access denied. Enable microphone in browser settings to practice pitch.');
    }
  }, [content.targetNotes, getCtx, startRefTone, onAnswer]);

  // ── Main detection loop ────────────────────────────────────
  useEffect(() => {
    if (phase !== 'active' || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const sampleRate = audioCtxRef.current?.sampleRate ?? 44100;

    function draw(userFreq: number | null, targetFreq: number, offset: number | null, holdFrac: number) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = '#0E0D0C';
      ctx.fillRect(0, 0, W, H);

      // Target zone band — centered
      const bandH = H * 0.28;
      const bandY = H / 2 - bandH / 2;
      const inZone = offset !== null && Math.abs(offset) <= ZONE_CENTS;

      // Glow behind band when in zone
      if (inZone) {
        const grd = ctx.createLinearGradient(0, bandY - 20, 0, bandY + bandH + 20);
        grd.addColorStop(0, 'rgba(92,184,137,0)');
        grd.addColorStop(0.5, 'rgba(92,184,137,0.12)');
        grd.addColorStop(1, 'rgba(92,184,137,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, bandY - 20, W, bandH + 40);
      }

      // Target band
      const bandGrd = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
      bandGrd.addColorStop(0, 'rgba(212,162,70,0.08)');
      bandGrd.addColorStop(0.5, 'rgba(212,162,70,0.18)');
      bandGrd.addColorStop(1, 'rgba(212,162,70,0.08)');
      ctx.fillStyle = bandGrd;
      ctx.beginPath();
      ctx.roundRect(8, bandY, W - 16, bandH, 6);
      ctx.fill();

      // Band border
      ctx.strokeStyle = inZone ? 'rgba(92,184,137,0.5)' : 'rgba(212,162,70,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(8, bandY, W - 16, bandH, 6);
      ctx.stroke();

      // Center dashed line
      ctx.strokeStyle = 'rgba(212,162,70,0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 6]);
      ctx.beginPath();
      ctx.moveTo(8, H / 2);
      ctx.lineTo(W - 8, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Target label
      ctx.fillStyle = 'rgba(212,162,70,0.5)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('TARGET ZONE', 14, bandY - 6);

      // User orb
      if (userFreq !== null && userFreq > 50) {
        // Map cents offset to Y — ZONE_CENTS = center ± bandH/2
        const clampedOffset = Math.max(-600, Math.min(600, offset ?? 0));
        const orbY = H / 2 + (clampedOffset / 600) * (H * 0.42);
        const clampedOrbY = Math.max(18, Math.min(H - 18, orbY));

        const orbColor = inZone ? '#5CB889' :
          Math.abs(offset ?? 999) < 200 ? '#D97706' : '#D9635B';

        // Orb glow
        const grd = ctx.createRadialGradient(W * 0.5, clampedOrbY, 2, W * 0.5, clampedOrbY, 32);
        grd.addColorStop(0, orbColor + '55');
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.fillRect(W * 0.5 - 32, clampedOrbY - 32, 64, 64);

        // Orb body
        ctx.beginPath();
        ctx.arc(W * 0.5, clampedOrbY, inZone ? 13 : 10, 0, Math.PI * 2);
        ctx.fillStyle = orbColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Trail line from orb to target center
        if (!inZone && Math.abs(clampedOrbY - H / 2) > 15) {
          ctx.strokeStyle = orbColor + '30';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.beginPath();
          ctx.moveTo(W * 0.5, clampedOrbY);
          ctx.lineTo(W * 0.5, H / 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        // No voice — show pulsing placeholder at center
        ctx.beginPath();
        ctx.arc(W * 0.5, H / 2, 8, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Hold progress bar — bottom of canvas
      if (holdFrac > 0) {
        const barW = (W - 32) * holdFrac;
        ctx.fillStyle = 'rgba(92,184,137,0.15)';
        ctx.beginPath();
        ctx.roundRect(16, H - 12, W - 32, 6, 3);
        ctx.fill();
        ctx.fillStyle = inZone ? '#5CB889' : 'rgba(92,184,137,0.4)';
        ctx.beginPath();
        ctx.roundRect(16, H - 12, barW, 6, 3);
        ctx.fill();
      }
    }

    function detect() {
      if (phaseRef.current !== 'active') return;
      animFrameRef.current = requestAnimationFrame(detect);

      const buf = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buf);
      const result = detectPitchYIN(buf, sampleRate);

      const targetFreq = content.targetNotes?.[noteIdxRef.current];
      if (!targetFreq) return;

      let userFreq: number | null = null;
      let offset: number | null = null;

      if (result?.frequency && result.frequency > 50 && result.frequency < 900) {
        userFreq = result.frequency;
        // Smooth over last N frames
        freqHistoryRef.current.push(userFreq);
        if (freqHistoryRef.current.length > SMOOTH_WINDOW) {
          freqHistoryRef.current.shift();
        }
        const smoothed = freqHistoryRef.current.reduce((a, b) => a + b, 0) / freqHistoryRef.current.length;
        // Cents offset: positive = user is higher than target, negative = lower
        offset = 1200 * Math.log2(smoothed / targetFreq);
        setCentsOffset(offset);
        setOrb({ y: 0.5 + offset / 1200, active: true });
      } else {
        freqHistoryRef.current = [];
        setCentsOffset(null);
        setOrb(prev => ({ ...prev, active: false }));
      }

      // Hold-to-pass accumulator
      const inZone = offset !== null && Math.abs(offset) <= ZONE_CENTS;
      if (inZone) {
        passedFramesRef.current += 1;
      } else if (passedFramesRef.current > 0 && !inZone) {
        // Slight decay when out of zone (not reset — keeps partial credit)
        passedFramesRef.current = Math.max(0, passedFramesRef.current - 0.5);
      }

      const holdFrac = Math.min(1, passedFramesRef.current / PASS_FRAMES);
      setHoldProgress(Math.round(holdFrac * 100));
      draw(userFreq, targetFreq, offset, holdFrac);

      // Note passed!
      if (passedFramesRef.current >= PASS_FRAMES) {
        passedFramesRef.current = 0;
        freqHistoryRef.current = [];
        const nextIdx = noteIdxRef.current + 1;
        playSuccessTone(targetFreq);

        setNoteScores(prev => [...prev, true]);

        if (nextIdx >= noteCount) {
          // All notes done — lesson passed
          stopRefTone();
          phaseRef.current = 'done';
          setPhase('done');
          onAnswer(
            true,
            '100%',
            `${threshold}%`,
            `Excellent! You matched all ${noteCount} note${noteCount > 1 ? 's' : ''} of ${content.jinsName}. Your ear is developing!`
          );
        } else {
          // Transition to next note
          phaseRef.current = 'note_success';
          setPhase('note_success');
          cancelAnimationFrame(animFrameRef.current);

          setTimeout(() => {
            noteIdxRef.current = nextIdx;
            setCurrentNoteIdx(nextIdx);
            setHoldProgress(0);
            setCentsOffset(null);
            passedFramesRef.current = 0;
            freqHistoryRef.current = [];

            if (content.targetNotes?.[nextIdx]) {
              startRefTone(content.targetNotes[nextIdx]);
            }

            phaseRef.current = 'active';
            setPhase('active');
          }, 1200);
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, content.targetNotes, content.jinsName, noteCount, threshold, onAnswer, playSuccessTone, startRefTone, stopRefTone]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopRefTone();
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [stopRefTone]);

  const dirInfo = getDirectionInfo(centsOffset);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="w-full max-w-lg mx-auto select-none">

      {/* Header */}
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-1" style={{ color: '#D4A246' }}>
          {content.jinsName} — Pitch Training
        </p>
        <p className="text-[#EDEDEC] text-lg font-semibold">
          {phase === 'intro' ? 'Tune your voice to the note' :
           phase === 'done' ? 'All notes matched!' :
           `Note ${currentNoteIdx + 1} of ${noteCount}`}
        </p>
        <p className="text-[#636260] text-xs mt-0.5">
          {phase === 'intro'
            ? 'A reference tone plays while your mic is open — no memorizing, just tune in'
            : 'Hold your voice in the golden zone until the bar fills'}
        </p>
      </div>

      {/* Note progress dots */}
      <div className="flex items-center gap-2 mb-5">
        {Array.from({ length: noteCount }).map((_, i) => {
          const done = i < noteScores.length;
          const current = phase === 'active' && i === currentNoteIdx;
          return (
            <div
              key={i}
              className="flex-1 h-1.5 rounded-full transition-all duration-500"
              style={{
                background: done
                  ? '#5CB889'
                  : current
                  ? 'rgba(212,162,70,0.6)'
                  : 'rgba(255,255,255,0.06)',
                boxShadow: done ? '0 0 6px rgba(92,184,137,0.4)' : current ? '0 0 6px rgba(212,162,70,0.3)' : 'none',
              }}
            />
          );
        })}
      </div>

      {/* INTRO STATE */}
      {phase === 'intro' && (
        <div className="space-y-4">
          {/* How it works */}
          <div
            className="rounded-2xl p-4 space-y-3"
            style={{ background: 'rgba(212,162,70,0.06)', border: '1px solid rgba(212,162,70,0.15)' }}
          >
            <p className="text-[#D4A246] text-sm font-semibold">How this works</p>
            {[
              { icon: '🎵', text: 'A reference tone plays softly in your ear' },
              { icon: '🎤', text: 'Open your mouth and make a steady sound' },
              { icon: '↕️', text: 'Adjust higher or lower until you\'re in the zone' },
              { icon: '✓',  text: 'Hold it there — the progress bar fills up' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-2.5">
                <span className="text-base w-5 text-center shrink-0">{icon}</span>
                <p className="text-[#A09F9B] text-sm">{text}</p>
              </div>
            ))}
          </div>

          <button
            onClick={startActive}
            className="w-full py-4 rounded-2xl font-bold text-base text-[#0E0D0C] transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #D4A246 0%, #E8B84B 100%)',
              boxShadow: '0 4px 20px rgba(212,162,70,0.3), 0 1px 0 rgba(255,255,255,0.2) inset',
            }}
          >
            Start Listening & Tuning
          </button>
        </div>
      )}

      {/* ACTIVE STATE */}
      {(phase === 'active' || phase === 'note_success') && (
        <div className="space-y-3">

          {/* Direction arrow — large and clear */}
          <div className="flex items-center justify-center h-10">
            {dirInfo.arrow && (
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold transition-all"
                style={{
                  color: dirInfo.color,
                  background: `${dirInfo.color}15`,
                  border: `1px solid ${dirInfo.color}30`,
                }}
              >
                <span className="text-lg font-bold">{dirInfo.arrow}</span>
                <span>{dirInfo.label}</span>
              </div>
            )}
            {!dirInfo.arrow && (
              <div
                className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold"
                style={{
                  color: dirInfo.color,
                  background: `${dirInfo.color}15`,
                  border: `1px solid ${dirInfo.color}30`,
                }}
              >
                {dirInfo.inZone ? '✓' : '🎤'} {dirInfo.label}
              </div>
            )}
          </div>

          {/* Pitch highway canvas */}
          <div className="relative rounded-2xl overflow-hidden" style={{ background: '#0E0D0C', border: '1px solid rgba(255,255,255,0.06)' }}>
            <canvas
              ref={canvasRef}
              width={480}
              height={200}
              className="w-full"
              style={{ height: '200px' }}
            />
            {/* Note_success overlay */}
            {phase === 'note_success' && (
              <div className="absolute inset-0 flex items-center justify-center bg-[#0E0D0C]/60 backdrop-blur-sm">
                <div className="text-center">
                  <p className="text-3xl mb-1">✓</p>
                  <p className="text-[#5CB889] font-bold text-base">Note matched!</p>
                </div>
              </div>
            )}
          </div>

          {/* Hold progress label */}
          <div className="flex items-center justify-between text-xs text-[#636260]">
            <span>Hold in the zone to fill the bar</span>
            <span style={{ color: holdProgress > 50 ? '#5CB889' : '#636260' }}>
              {holdProgress}%
            </span>
          </div>

          {/* Reference tone indicator */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(212,162,70,0.06)', border: '1px solid rgba(212,162,70,0.12)' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4A246] animate-pulse" />
            <p className="text-[#636260] text-xs">Reference tone playing softly — tune your voice to it</p>
          </div>
        </div>
      )}

      {/* DONE STATE */}
      {phase === 'done' && (
        <div className="text-center py-6 space-y-3">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto text-4xl"
            style={{ background: 'rgba(92,184,137,0.12)', border: '1px solid rgba(92,184,137,0.25)' }}
          >
            ✓
          </div>
          <p className="text-[#5CB889] font-bold text-xl">All notes matched!</p>
          <p className="text-[#636260] text-sm">
            You've trained your ear to the {content.jinsName} melody.
          </p>
        </div>
      )}
    </div>
  );
}
