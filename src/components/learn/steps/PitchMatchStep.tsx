'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { detectPitchYIN } from '@/lib/audio/pitchEngine';
import type { PitchMatchContent } from '@/data/qirat-curriculum';

interface Props {
  content: PitchMatchContent;
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void;
}

// Phases: listen (hear all notes) → sing (one note at a time) → done
type Phase = 'listen' | 'sing' | 'done';

// Maqam-themed colors for note dots
const NOTE_COLORS = ['#0D9488', '#1CB0F6', '#D97706', '#A855F7'];

export function PitchMatchStep({ content, onAnswer }: Props) {
  const [phase, setPhase] = useState<Phase>('listen');
  const [currentNoteIdx, setCurrentNoteIdx] = useState(0);
  const [listenPlayIdx, setListenPlayIdx] = useState(-1); // which note is currently playing in listen phase
  const [noteScores, setNoteScores] = useState<number[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [proximity, setProximity] = useState(0); // 0-100, how close user is to target
  const [userActive, setUserActive] = useState(false); // is mic picking up voice?

  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const threshold = content.passThreshold ?? 70;
  const noteCount = content.targetNotes?.length ?? 0;

  // ── Play a reference tone ──
  const playTone = useCallback((freq: number, duration = 1.2): Promise<void> => {
    return new Promise((resolve) => {
      if (!freq || !isFinite(freq) || freq <= 0) { resolve(); return; }
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
      setTimeout(resolve, duration * 1000);
    });
  }, []);

  // ── Phase 1: Listen — play all notes sequentially so user can hear the melody ──
  const startListening = useCallback(async () => {
    setPhase('listen');
    if (!content.targetNotes) return;
    for (let i = 0; i < content.targetNotes.length; i++) {
      setListenPlayIdx(i);
      await playTone(content.targetNotes[i], 1.0);
      await new Promise(r => setTimeout(r, 200)); // gap between notes
    }
    setListenPlayIdx(-1);
    // Auto-transition to sing phase
    startSinging();
  }, [content.targetNotes, playTone]);

  // ── Phase 2: Sing — mic on, one note at a time ──
  const startSinging = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      micStreamRef.current = stream;
      const ctx = audioCtxRef.current || new AudioContext();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') await ctx.resume();

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      setPhase('sing');
      setCurrentNoteIdx(0);
      setNoteScores([]);
    } catch {
      // Mic denied — skip to done
      setPhase('done');
    }
  }, []);

  // ── Detection loop for sing phase ──
  useEffect(() => {
    if (phase !== 'sing' || !analyserRef.current || !content.targetNotes) return;
    if (currentNoteIdx >= content.targetNotes.length) return;

    const analyser = analyserRef.current;
    const sampleRate = audioCtxRef.current?.sampleRate ?? 44100;
    const targetFreq = content.targetNotes[currentNoteIdx];
    if (!targetFreq || !isFinite(targetFreq) || targetFreq <= 0) return;

    let framesTotal = 0;
    let framesMatched = 0;
    let scored = false;
    const requiredFrames = 90; // ~1.5 seconds

    // Play reference tone so user knows what to match
    playTone(targetFreq, 0.8);

    function detect() {
      if (scored) return;
      animFrameRef.current = requestAnimationFrame(detect);

      const buf = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buf);
      const result = detectPitchYIN(buf, sampleRate);

      if (result && result.frequency && result.frequency > 50) {
        framesTotal++;
        setUserActive(true);

        // Cents distance from target
        const cents = Math.abs(1200 * Math.log2(result.frequency / targetFreq));
        const prox = Math.max(0, Math.min(100, 100 - cents));
        setProximity(prox);

        if (cents < 50) framesMatched++;

        // Draw the mountain visualization
        drawMountain(result.frequency, targetFreq, prox);
      } else {
        setUserActive(false);
        setProximity(0);
      }

      if (framesTotal >= requiredFrames && !scored) {
        scored = true;
        cancelAnimationFrame(animFrameRef.current);

        const accuracy = framesTotal > 0 ? Math.round((framesMatched / framesTotal) * 100) : 0;
        const isLastNote = currentNoteIdx + 1 >= content.targetNotes.length;

        setNoteScores(prev => {
          const newScores = [...prev, accuracy];

          if (isLastNote) {
            // All notes done
            micStreamRef.current?.getTracks().forEach(t => t.stop());
            const overall = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
            setOverallScore(overall);
            setPhase('done');
            setProximity(0);
            setUserActive(false);

            const passed = overall >= threshold;
            onAnswer(
              passed,
              `${overall}%`,
              `${threshold}%`,
              passed
                ? `Great job! You captured the ${content.jinsName} melody with ${overall}% accuracy.`
                : `You scored ${overall}%. Keep practicing — try humming gently along with the reference tone.`
            );
          }

          return newScores;
        });

        if (!isLastNote) {
          setTimeout(() => setCurrentNoteIdx(prev => prev + 1), 500);
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, currentNoteIdx, content.targetNotes, content.jinsName, threshold, onAnswer, playTone]);

  // Cleanup
  useEffect(() => {
    return () => {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // ── Mountain / wave visualization ──
  function drawMountain(userFreq: number, targetFreq: number, prox: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background gradient based on proximity
    const green = Math.round((prox / 100) * 255);
    const red = Math.round(((100 - prox) / 100) * 180);
    const bgAlpha = 0.15;
    ctx.fillStyle = `rgba(${red}, ${green}, 80, ${bgAlpha})`;
    ctx.fillRect(0, 0, W, H);

    // Target line (where they should be)
    const centerY = H / 2;
    ctx.strokeStyle = `rgba(13, 148, 136, 0.4)`;
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(W, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // "Target zone" glow
    const zoneH = H * 0.25;
    const gradient = ctx.createLinearGradient(0, centerY - zoneH, 0, centerY + zoneH);
    gradient.addColorStop(0, 'rgba(13, 148, 136, 0)');
    gradient.addColorStop(0.5, 'rgba(13, 148, 136, 0.1)');
    gradient.addColorStop(1, 'rgba(13, 148, 136, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, centerY - zoneH, W, zoneH * 2);

    // User's voice position
    const centsOffset = 1200 * Math.log2(userFreq / targetFreq);
    const userY = centerY - (centsOffset / 200) * H * 0.8;
    const clampedY = Math.max(8, Math.min(H - 8, userY));

    // Glow around user dot
    const color = prox > 70 ? '#58CC02' : prox > 40 ? '#D97706' : '#FF4B4B';
    const glowGrad = ctx.createRadialGradient(W * 0.75, clampedY, 4, W * 0.75, clampedY, 30);
    glowGrad.addColorStop(0, color + '60');
    glowGrad.addColorStop(1, color + '00');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(W * 0.75 - 30, clampedY - 30, 60, 60);

    // User dot
    ctx.beginPath();
    ctx.arc(W * 0.75, clampedY, 8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Labels
    ctx.font = 'bold 10px system-ui';
    ctx.fillStyle = '#0D9488';
    ctx.textAlign = 'left';
    ctx.fillText('Target ─', 8, centerY - 6);

    ctx.fillStyle = '#ffffff60';
    ctx.textAlign = 'right';
    ctx.fillText(prox > 70 ? '✓ Matching!' : prox > 40 ? 'Getting closer...' : 'Keep adjusting...', W - 8, H - 8);
  }

  // ── Proximity feedback text ──
  const feedbackText = proximity > 70 ? '🟢 You\'re matching!' :
    proximity > 40 ? '🟡 Getting closer...' :
    userActive ? '🔴 Adjust your pitch...' : '🎤 Start humming...';

  const feedbackColor = proximity > 70 ? 'text-[#58CC02]' :
    proximity > 40 ? 'text-[#D97706]' : 'text-white/40';

  return (
    <div className="w-full max-w-lg mx-auto">
      <p className="text-white/50 text-xs uppercase tracking-wider mb-1">
        {content.jinsName} Melody
      </p>
      <p className="text-white text-lg font-bold mb-2">
        {phase === 'listen' ? 'Listen to the melody...' :
         phase === 'sing' ? 'Now hum along!' :
         'Results'}
      </p>
      <p className="text-white/40 text-xs mb-6">
        {phase === 'listen' ? 'Hear each note — internalize the sound' :
         phase === 'sing' ? 'Match each tone with your voice — no music knowledge needed' :
         ''}
      </p>

      {/* Note dots — colored circles, no note names */}
      <div className="flex items-center justify-center gap-4 mb-6">
        {Array.from({ length: noteCount }).map((_, i) => {
          const isDone = i < noteScores.length;
          const isCurrent = phase === 'sing' && i === currentNoteIdx;
          const isListening = phase === 'listen' && i === listenPlayIdx;
          const score = noteScores[i];
          const color = NOTE_COLORS[i % NOTE_COLORS.length];

          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div
                className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  backgroundColor: isDone
                    ? score >= threshold ? '#58CC0230' : '#FF4B4B30'
                    : isCurrent || isListening ? color + '30' : '#1A2F36',
                  border: `2px solid ${
                    isDone
                      ? score >= threshold ? '#58CC02' : '#FF4B4B'
                      : isCurrent || isListening ? color : 'transparent'
                  }`,
                  transform: isCurrent || isListening ? 'scale(1.15)' : 'scale(1)',
                  boxShadow: isListening ? `0 0 20px ${color}40` : 'none',
                }}
              >
                {isDone ? (
                  <span className={`text-xs font-bold ${score >= threshold ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
                    {score >= threshold ? '✓' : '✗'}
                  </span>
                ) : isListening ? (
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(j => (
                      <div key={j} className="w-1 rounded-full animate-pulse" style={{
                        backgroundColor: color,
                        height: `${10 + Math.random() * 10}px`,
                        animationDelay: `${j * 0.15}s`,
                      }} />
                    ))}
                  </div>
                ) : (
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color + '60' }} />
                )}
              </div>
              <span className="text-[10px] text-white/20">
                {isDone ? `${score}%` : `Note ${i + 1}`}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mountain visualization — only during sing phase */}
      {phase === 'sing' && (
        <div className="mb-4">
          <canvas ref={canvasRef} width={400} height={100} className="w-full h-[100px] rounded-xl bg-[#0D1B1F]" />
          <p className={`text-center text-sm font-medium mt-3 transition-colors ${feedbackColor}`}>
            {feedbackText}
          </p>
        </div>
      )}

      {/* Listen phase — waiting */}
      {phase === 'listen' && listenPlayIdx === -1 && (
        <button
          onClick={startListening}
          className="w-full py-5 rounded-2xl bg-[#0D9488] text-white font-bold text-lg hover:bg-[#0D9488]/90 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>
          Listen First
        </button>
      )}

      {/* Listen phase — playing */}
      {phase === 'listen' && listenPlayIdx >= 0 && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#0D9488]/20">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-pulse" />
            <span className="text-[#0D9488] font-medium text-sm">
              Listen carefully... Note {listenPlayIdx + 1} of {noteCount}
            </span>
          </div>
        </div>
      )}

      {/* Sing phase — recording indicator */}
      {phase === 'sing' && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF4B4B]/10 border border-[#FF4B4B]/20">
            <div className="w-2 h-2 rounded-full bg-[#FF4B4B] animate-pulse" />
            <span className="text-[#FF4B4B]/80 text-xs font-medium">
              Humming note {Math.min(currentNoteIdx + 1, noteCount)} of {noteCount}
            </span>
          </div>
        </div>
      )}

      {/* Done — results */}
      {phase === 'done' && (
        <div className="text-center space-y-3">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto ${
            overallScore >= threshold ? 'bg-[#58CC02]/20' : 'bg-[#FF4B4B]/20'
          }`}>
            <span className={`text-3xl font-bold ${
              overallScore >= threshold ? 'text-[#58CC02]' : 'text-[#FF4B4B]'
            }`}>
              {overallScore}%
            </span>
          </div>
          <p className="text-white/50 text-sm">
            {overallScore >= threshold
              ? '✨ Great ear! You matched the melody.'
              : 'Try again — hum gently along with the reference tone.'}
          </p>
        </div>
      )}
    </div>
  );
}
