'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  detectPitchYIN,
  freqToMidi,
  freqToY,
} from '@/lib/audio/pitchEngine';
import { scorePhrase, type PhraseScore, computeSessionStats } from '@/lib/audio/phraseScorer';

// ─── Types ───

type PracticePhase = 'idle' | 'listening' | 'recording' | 'scored';

interface Props {
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
  currentAyah: number;
  totalAyahs: number;
  /** Callback to play a specific ayah */
  onPlayAyah: (ayahNumber: number) => void;
  /** Callback to go to next ayah */
  onNextAyah: () => void;
  /** Arabic text for the current ayah */
  ayahText?: string;
  /** Word-level timing segments for color feedback: [wordPos, startMs, endMs][] */
  wordSegments?: [number, number, number][];
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

export function GuidedPractice({
  analyserNode,
  isPlaying,
  currentAyah,
  totalAyahs,
  onPlayAyah,
  onNextAyah,
  ayahText,
  wordSegments,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);

  const [phase, setPhase] = useState<PracticePhase>('idle');
  const [latestScore, setLatestScore] = useState<PhraseScore | null>(null);
  const [allScores, setAllScores] = useState<PhraseScore[]>([]);
  const [wordScores, setWordScores] = useState<number[]>([]); // per-word similarity 0-100

  // Audio refs
  const micStreamRef = useRef<MediaStream | null>(null);
  const micAnalyserRef = useRef<AnalyserNode | null>(null);
  const qariPitchesRef = useRef<(number | null)[]>([]);
  const userPitchesRef = useRef<(number | null)[]>([]);
  const silenceFramesRef = useRef(0);

  // ─── Step 1: Listen phase ───
  const startListening = useCallback(() => {
    setPhase('listening');
    setLatestScore(null);
    setWordScores([]);
    qariPitchesRef.current = [];
    userPitchesRef.current = [];
    silenceFramesRef.current = 0;
    onPlayAyah(currentAyah);
  }, [currentAyah, onPlayAyah]);

  // ─── Step 2: Recording phase ───
  const startRecording = useCallback(async () => {
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
      userPitchesRef.current = [];
      silenceFramesRef.current = 0;
      setPhase('recording');
    } catch {
      // Mic denied — fall back
      setPhase('idle');
    }
  }, [analyserNode]);

  // ─── Stop recording and score ───
  const finishRecording = useCallback(() => {
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    micStreamRef.current = null;
    micAnalyserRef.current = null;

    // Score the phrase
    const score = scorePhrase(
      qariPitchesRef.current.map(p => p !== null ? freqToMidi(p) : null),
      userPitchesRef.current.map(p => p !== null ? freqToMidi(p) : null),
      [], [],
      currentAyah,
      60
    );
    setLatestScore(score);
    setAllScores(prev => [...prev, score]);

    // Compute per-word scores if we have word segments
    if (wordSegments && wordSegments.length > 0) {
      const totalQariFrames = qariPitchesRef.current.length;
      const totalUserFrames = userPitchesRef.current.length;
      const qariDurationMs = wordSegments[wordSegments.length - 1]?.[2] ?? 0;

      const scores: number[] = wordSegments.map(([, startMs, endMs]) => {
        if (qariDurationMs === 0) return 50;
        const startFrac = startMs / qariDurationMs;
        const endFrac = endMs / qariDurationMs;

        const qariSlice = qariPitchesRef.current.slice(
          Math.floor(startFrac * totalQariFrames),
          Math.ceil(endFrac * totalQariFrames)
        );
        const userSlice = userPitchesRef.current.slice(
          Math.floor(startFrac * totalUserFrames),
          Math.ceil(endFrac * totalUserFrames)
        );

        const qariMidi = qariSlice.filter((p): p is number => p !== null).map(freqToMidi);
        const userMidi = userSlice.filter((p): p is number => p !== null).map(freqToMidi);

        if (qariMidi.length < 2 || userMidi.length < 2) return 50;

        // Average pitch distance in cents
        const avgQari = qariMidi.reduce((a, b) => a + b, 0) / qariMidi.length;
        const avgUser = userMidi.reduce((a, b) => a + b, 0) / userMidi.length;
        const centsDiff = Math.abs(avgQari - avgUser) * 100;
        return Math.max(0, Math.min(100, Math.round(100 - centsDiff)));
      });
      setWordScores(scores);
    }

    setPhase('scored');
  }, [currentAyah, wordSegments]);

  // Auto-transition: listening → recording when qari's playback ends
  useEffect(() => {
    if (phase === 'listening' && !isPlaying) {
      // Small delay to let the last audio fade
      const timer = setTimeout(() => startRecording(), 500);
      return () => clearTimeout(timer);
    }
  }, [phase, isPlaying, startRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ─── Animation loop for pitch detection ───
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !analyserNode) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sampleRate = analyserNode.context.sampleRate;

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

      const colors = getColors();

      // Detect qari pitch during listening phase
      if (phase === 'listening' && analyserNode) {
        const buf = new Float32Array(analyserNode.fftSize);
        analyserNode.getFloatTimeDomainData(buf);
        const result = detectPitchYIN(buf, sampleRate);
        qariPitchesRef.current.push(result?.frequency ?? null);
        if (qariPitchesRef.current.length > MAX_PITCH_HISTORY * 3) {
          // Keep more history for scoring but cap it
        }
      }

      // Detect user pitch during recording phase
      if (phase === 'recording' && micAnalyserRef.current) {
        const micBuf = new Float32Array(micAnalyserRef.current.fftSize);
        micAnalyserRef.current.getFloatTimeDomainData(micBuf);
        const result = detectPitchYIN(micBuf, sampleRate);
        const userPitch = result?.frequency ?? null;
        userPitchesRef.current.push(userPitch);

        // Auto-stop on extended silence (2 seconds)
        if (!userPitch) {
          silenceFramesRef.current++;
          if (silenceFramesRef.current > 120 && userPitchesRef.current.length > 30) {
            finishRecording();
            return;
          }
        } else {
          silenceFramesRef.current = 0;
        }
      }

      // Draw the dual contour (qari + user)
      if (phase === 'recording' || phase === 'listening') {
        drawDualContour(ctx, W, H, colors);
      }
    }

    function drawDualContour(ctx: CanvasRenderingContext2D, W: number, H: number, colors: ReturnType<typeof getColors>) {
      // Guide lines
      ctx.strokeStyle = `${colors.primary}0F`;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      for (const f of [100, 200, 300, 400, 500]) {
        const y = freqToY(f, H);
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.setLineDash([]);

      // Qari contour
      const qari = qariPitchesRef.current;
      if (qari.length > 1) {
        const step = W / Math.max(qari.length, MAX_PITCH_HISTORY);
        ctx.beginPath(); ctx.lineWidth = 2.5; ctx.strokeStyle = colors.primary;
        ctx.lineJoin = 'round'; ctx.lineCap = 'round';
        let started = false;
        for (let i = 0; i < qari.length; i++) {
          const f = qari[i]; if (!f) { started = false; continue; }
          const x = i * step, y = freqToY(f, H);
          if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // User contour (green/amber/red)
      const user = userPitchesRef.current;
      if (user.length > 1) {
        const step = W / Math.max(user.length, MAX_PITCH_HISTORY);
        for (let i = 1; i < user.length; i++) {
          const f1 = user[i-1], f2 = user[i];
          if (!f1 || !f2) continue;
          const x1 = (i-1) * step, x2 = i * step;
          const y1 = freqToY(f1, H), y2 = freqToY(f2, H);

          // Compare to qari at same relative position
          const qIdx = Math.floor((i / user.length) * qari.length);
          const qF = qari[qIdx];
          let color = colors.accent;
          if (qF) {
            const cents = Math.abs(1200 * Math.log2(f2 / qF));
            color = cents < 50 ? colors.correct : cents < 100 ? colors.accent : colors.wrong;
          }

          ctx.beginPath(); ctx.lineWidth = 3; ctx.strokeStyle = color;
          ctx.lineCap = 'round';
          ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        }
      }

      // Phase indicator
      ctx.font = 'bold 11px system-ui'; ctx.textAlign = 'left';
      if (phase === 'listening') {
        ctx.fillStyle = colors.primary;
        ctx.fillText('🎧 Listen to the Qari...', 12, 20);
      } else if (phase === 'recording') {
        ctx.fillStyle = colors.wrong;
        ctx.fillText('🎤 Your turn — recite now!', 12, 20);
      }

      // Legend
      ctx.textAlign = 'left'; ctx.font = '10px system-ui';
      ctx.fillStyle = colors.primary;
      ctx.fillRect(8, H - 16, 8, 3); ctx.fillText('Qari', 20, H - 11);
      if (phase === 'recording') {
        ctx.fillStyle = colors.correct;
        ctx.fillRect(58, H - 16, 8, 3); ctx.fillText('You', 70, H - 11);
      }
    }

    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [analyserNode, phase, finishRecording]);

  const sessionStats = allScores.length > 0 ? computeSessionStats(allScores) : null;

  // ─── Render ───
  return (
    <div ref={containerRef} className="relative w-full h-full" style={{ minHeight: '200px' }}>
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Phase: Idle — Start button */}
      {phase === 'idle' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <div className="text-center mb-6">
            <h3 className="text-lg font-heading text-text mb-1">Guided Practice</h3>
            <p className="text-sm text-text-secondary">
              Listen to the Qari, then recite — get scored on each ayah
            </p>
          </div>

          {/* Session stats if any */}
          {sessionStats && (
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                sessionStats.averageScore >= 80 ? 'bg-correct/20 text-correct' :
                sessionStats.averageScore >= 50 ? 'bg-accent/20 text-accent' : 'bg-wrong/20 text-wrong'
              }`}>
                Session: {sessionStats.averageScore}%
              </div>
              <span className="text-[10px] text-text-tertiary">
                {allScores.length} ayah{allScores.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          <button
            onClick={startListening}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium shadow-raised hover:bg-primary-hover hover:shadow-modal hover:scale-105 active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
            </svg>
            Start Ayah {currentAyah}
          </button>
        </div>
      )}

      {/* Phase: Listening — visual indicator */}
      {phase === 'listening' && (
        <div className="absolute top-4 right-4 z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-primary font-medium">Step 1: Listening</span>
          </div>
        </div>
      )}

      {/* Phase: Recording — visual indicator */}
      {phase === 'recording' && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-wrong/20 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-wrong animate-pulse" />
            <span className="text-xs text-wrong font-medium">Step 2: Your Turn</span>
          </div>
          <button
            onClick={finishRecording}
            className="px-3 py-1.5 rounded-full text-xs text-text-secondary bg-surface/80 backdrop-blur-sm hover:text-text transition-colors"
          >
            Done
          </button>
        </div>
      )}

      {/* Phase: Scored — Scorecard */}
      {phase === 'scored' && latestScore && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-canvas/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface rounded-2xl shadow-modal p-6 max-w-sm w-full mx-4">
            {/* Letter grade */}
            <div className="text-center mb-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-2 text-2xl font-bold ${
                latestScore.grade === 'A' ? 'bg-correct/20 text-correct' :
                latestScore.grade === 'B' ? 'bg-primary/20 text-primary' :
                latestScore.grade === 'C' ? 'bg-accent/20 text-accent' :
                'bg-wrong/20 text-wrong'
              }`}>
                {latestScore.grade}
              </div>
              <p className="text-sm text-text-secondary">Ayah {latestScore.ayahNumber}</p>
              <p className="text-2xl font-bold text-text">{latestScore.overall}%</p>
            </div>

            {/* Sub-score bars */}
            <div className="space-y-2 mb-4">
              <ScoreBar label="Pitch" value={latestScore.pitch} />
              <ScoreBar label="Rhythm" value={latestScore.rhythm} />
              <ScoreBar label="Sustain" value={latestScore.sustain} />
            </div>

            {/* Word-level color feedback */}
            {ayahText && wordScores.length > 0 && (
              <div className="mb-4 p-3 rounded-xl bg-canvas/50 border border-border-light">
                <p className="text-[10px] text-text-tertiary mb-2">Word accuracy</p>
                <p className="font-arabic text-lg leading-[2] text-right" dir="rtl">
                  {ayahText.split(' ').map((word, i) => {
                    const score = wordScores[i] ?? 50;
                    const colorClass = score >= 80 ? 'text-correct'
                      : score >= 50 ? 'text-accent'
                      : 'text-wrong';
                    return (
                      <span key={i} className={`${colorClass} transition-colors cursor-default`} title={`${score}%`}>
                        {word}{' '}
                      </span>
                    );
                  })}
                </p>
              </div>
            )}

            {/* Feedback messages */}
            {latestScore.feedback.length > 0 && (
              <div className="space-y-1 mb-4">
                {latestScore.feedback.slice(0, 3).map((msg, i) => (
                  <p key={i} className="text-xs text-text-secondary leading-relaxed">
                    {i === 0 && latestScore.overall >= 70 ? '✨ ' : '→ '}{msg}
                  </p>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLatestScore(null);
                  setWordScores([]);
                  startListening();
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border border-border-light text-text hover:bg-border-light transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Retry
              </button>
              {currentAyah < totalAyahs && (
                <button
                  onClick={() => {
                    setLatestScore(null);
                    setWordScores([]);
                    onNextAyah();
                    // Start listening for the next ayah after a small delay
                    setTimeout(() => startListening(), 300);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
                >
                  Next Ayah
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
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

// ─── Score bar sub-component ───

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
