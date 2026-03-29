'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { detectPitchYIN, freqToMidi, type PitchResult } from '@/lib/audio/pitchEngine';
import type { PitchMatchContent } from '@/data/qirat-curriculum';

interface Props {
  content: PitchMatchContent;
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void;
}

export function PitchMatchStep({ content, onAnswer }: Props) {
  const [phase, setPhase] = useState<'ready' | 'recording' | 'done'>('ready');
  const [currentNoteIdx, setCurrentNoteIdx] = useState(0);
  const [noteScores, setNoteScores] = useState<number[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [isListening, setIsListening] = useState(false);

  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matchFramesRef = useRef(0);
  const totalFramesRef = useRef(0);

  const threshold = content.passThreshold ?? 70;
  const toleranceCents = 50; // cents tolerance for "matching"

  // Play a reference tone
  const playTone = useCallback((freq: number) => {
    if (!freq || !isFinite(freq) || freq <= 0) return;
    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  }, []);

  // Start mic recording
  const startRecording = useCallback(async () => {
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

      setPhase('recording');
      setCurrentNoteIdx(0);
      setNoteScores([]);
      matchFramesRef.current = 0;
      totalFramesRef.current = 0;
      setIsListening(true);
    } catch {
      // Mic denied
    }
  }, []);

  // Detection loop
  useEffect(() => {
    if (phase !== 'recording' || !analyserRef.current) return;
    if (!content.targetNotes || !content.targetNotes[currentNoteIdx]) return;

    const analyser = analyserRef.current;
    const sampleRate = audioCtxRef.current?.sampleRate ?? 44100;
    const targetFreq = content.targetNotes[currentNoteIdx];
    if (!isFinite(targetFreq) || targetFreq <= 0) return;

    let framesOnNote = 0;
    let matchedOnNote = 0;
    let scored = false; // Prevent double-scoring before effect cleanup
    const requiredFrames = 60;

    function detect() {
      if (scored) return; // Stop loop after scoring
      animFrameRef.current = requestAnimationFrame(detect);

      const buf = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buf);
      const result = detectPitchYIN(buf, sampleRate);

      if (result && result.frequency) {
        framesOnNote++;
        totalFramesRef.current++;

        const cents = Math.abs(1200 * Math.log2(result.frequency / targetFreq));
        if (cents < toleranceCents) {
          matchedOnNote++;
          matchFramesRef.current++;
        }

        drawPitchIndicator(result.frequency, targetFreq, cents);
      }

      if (framesOnNote >= requiredFrames && !scored) {
        scored = true; // Lock — only score once per note
        cancelAnimationFrame(animFrameRef.current);

        const noteAccuracy = Math.round((matchedOnNote / framesOnNote) * 100);

        const isLastNote = currentNoteIdx + 1 >= content.targetNotes.length;

        setNoteScores(prev => {
          const newScores = [...prev, noteAccuracy];

          if (isLastNote) {
            micStreamRef.current?.getTracks().forEach(t => t.stop());
            const overall = Math.round(newScores.reduce((a, b) => a + b, 0) / newScores.length);
            setOverallScore(overall);
            setPhase('done');
            setIsListening(false);

            const passed = overall >= threshold;
            onAnswer(
              passed,
              `${overall}%`,
              `${threshold}%`,
              passed
                ? `Great job! You matched the ${content.jinsName} jins with ${overall}% accuracy.`
                : `You scored ${overall}%. You need ${threshold}% to pass. Keep practicing the ${content.jinsName} intervals!`
            );
          }

          return newScores;
        });

        if (!isLastNote) {
          // Move to next note after a short delay
          setTimeout(() => {
            playTone(content.targetNotes[currentNoteIdx + 1]);
            setCurrentNoteIdx(prev => prev + 1);
          }, 300);
        }
      }
    }

    // Play the target note reference
    playTone(targetFreq);
    animFrameRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, currentNoteIdx, content.targetNotes, content.jinsName, threshold, onAnswer, playTone, toleranceCents]);

  // Cleanup
  useEffect(() => {
    return () => {
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  function drawPitchIndicator(userFreq: number, targetFreq: number, cents: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Target zone
    const centerY = H / 2;
    const zoneH = H * 0.3;
    ctx.fillStyle = '#0D948820';
    ctx.fillRect(0, centerY - zoneH / 2, W, zoneH);

    // Target line
    ctx.strokeStyle = '#0D9488';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(W, centerY);
    ctx.stroke();
    ctx.setLineDash([]);

    // User pitch indicator
    const centsOffset = 1200 * Math.log2(userFreq / targetFreq);
    const userY = centerY - (centsOffset / 100) * (H * 0.4);
    const color = cents < 50 ? '#58CC02' : cents < 100 ? '#D97706' : '#FF4B4B';

    ctx.beginPath();
    ctx.arc(W / 2, Math.max(10, Math.min(H - 10, userY)), 12, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Labels
    ctx.font = 'bold 11px system-ui';
    ctx.fillStyle = '#EDEDEC';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(userFreq)} Hz`, W / 2, Math.max(10, Math.min(H - 10, userY)) - 18);

    ctx.font = '10px system-ui';
    ctx.fillStyle = '#A09F9B';
    ctx.fillText(`Target: ${Math.round(targetFreq)} Hz`, W / 2, H - 8);
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <p className="text-white/50 text-xs uppercase tracking-wider mb-2">Jins {content.jinsName}</p>
      <p className="text-white text-lg font-bold mb-6">Match these notes with your voice</p>

      {/* Note indicators */}
      <div className="flex items-center justify-center gap-3 mb-6">
        {content.noteLabels.map((label, i) => {
          const isDone = i < noteScores.length;
          const isCurrent = i === currentNoteIdx && phase === 'recording';
          const score = noteScores[i];
          
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold border-2 transition-all ${
                  isDone
                    ? score >= threshold
                      ? 'bg-[#58CC02]/20 border-[#58CC02] text-[#58CC02]'
                      : 'bg-[#FF4B4B]/20 border-[#FF4B4B] text-[#FF4B4B]'
                    : isCurrent
                    ? 'bg-[#0D9488]/20 border-[#0D9488] text-[#0D9488] scale-110'
                    : 'bg-[#1A2F36] border-transparent text-white/40'
                }`}
              >
                {isDone ? `${score}%` : label}
              </div>
              <span className="text-[10px] text-white/30">{label}</span>
            </div>
          );
        })}
      </div>

      {/* Pitch canvas */}
      {phase === 'recording' && (
        <div className="mb-6">
          <canvas ref={canvasRef} width={400} height={120} className="w-full h-[120px] rounded-xl bg-[#1A2F36]" />
          <p className="text-center text-xs text-white/40 mt-2">
            Sing the note — match the green zone
          </p>
        </div>
      )}

      {/* Start / result */}
      {phase === 'ready' && (
        <button
          onClick={startRecording}
          className="w-full py-4 rounded-2xl bg-[#0D9488] text-white font-bold text-lg hover:bg-[#0D9488]/90 active:scale-95 transition-all"
        >
          🎤 Start Singing
        </button>
      )}

      {phase === 'recording' && (
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF4B4B]/20 text-[#FF4B4B]">
            <div className="w-2 h-2 rounded-full bg-[#FF4B4B] animate-pulse" />
            <span className="text-sm font-medium">
              Listening... Note {Math.min(currentNoteIdx + 1, content.targetNotes.length)} of {content.targetNotes.length}
            </span>
          </div>
        </div>
      )}

      {phase === 'done' && (
        <div className="text-center">
          <p className={`text-3xl font-bold ${overallScore >= threshold ? 'text-[#58CC02]' : 'text-[#FF4B4B]'}`}>
            {overallScore}%
          </p>
          <p className="text-white/50 text-sm mt-1">
            {overallScore >= threshold ? '✨ Passed!' : `Need ${threshold}% to pass`}
          </p>
        </div>
      )}
    </div>
  );
}
