'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { detectPitchYIN, freqToMidi } from '@/lib/audio/pitchEngine';
import { scorePhrase, type PhraseScore } from '@/lib/audio/phraseScorer';
import type { ReciteScoreContent } from '@/data/qirat-curriculum';

interface Props {
  content: ReciteScoreContent;
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void;
}

type Phase = 'ready' | 'listening' | 'countdown' | 'recording' | 'scored';

export function ReciteScoreStep({ content, onAnswer }: Props) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState<PhraseScore | null>(null);
  const [countdown, setCountdown] = useState(3);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const qariPitchesRef = useRef<(number | null)[]>([]);
  const userPitchesRef = useRef<(number | null)[]>([]);
  const silenceFramesRef = useRef(0);
  const phaseRef = useRef<Phase>('ready');

  const audioUrl = `https://everyayah.com/data/${content.reciterId}/${String(content.surah).padStart(3, '0')}${String(content.ayah).padStart(3, '0')}.mp3`;
  const passThreshold = content.passThreshold ?? 30;

  // Step 1: Play qari AND collect their pitch data via Web Audio routing
  const startListening = useCallback(() => {
    setPhase('listening');
    phaseRef.current = 'listening';
    qariPitchesRef.current = [];
    userPitchesRef.current = [];
    silenceFramesRef.current = 0;

    const ctx = audioCtxRef.current || new AudioContext();
    audioCtxRef.current = ctx;
    if (ctx.state === 'suspended') ctx.resume();

    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    // Route qari audio through analyser to capture pitch
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyser.connect(ctx.destination); // still plays audio
    const qariAnalyser = analyser;

    let qariAnimFrame = 0;
    const sampleRate = ctx.sampleRate;

    function collectQariPitch() {
      if (phaseRef.current !== 'listening') return;
      qariAnimFrame = requestAnimationFrame(collectQariPitch);
      const buf = new Float32Array(qariAnalyser.fftSize);
      qariAnalyser.getFloatTimeDomainData(buf);
      const result = detectPitchYIN(buf, sampleRate);
      qariPitchesRef.current.push(result?.frequency ? freqToMidi(result.frequency) : null);
    }

    qariAnimFrame = requestAnimationFrame(collectQariPitch);

    audio.addEventListener('ended', () => {
      cancelAnimationFrame(qariAnimFrame);
      // Show countdown before recording
      startCountdown();
    });

    audio.addEventListener('error', () => {
      cancelAnimationFrame(qariAnimFrame);
      setPhase('ready');
    });

    audio.play().catch(() => {
      cancelAnimationFrame(qariAnimFrame);
      setPhase('ready');
    });
  }, [audioUrl]);

  // Countdown (3-2-1) before recording starts
  const startCountdown = useCallback(() => {
    setPhase('countdown');
    phaseRef.current = 'countdown';
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        startRecording();
      }
    }, 1000);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 2: Record user
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
      phaseRef.current = 'recording';
      silenceFramesRef.current = 0;
    } catch {
      // Mic denied — pass and continue
      setPhase('scored');
      phaseRef.current = 'scored';
      onAnswer(
        true,
        'mic_denied',
        'mic_required',
        'Microphone access was denied. Enable mic in your browser settings to practice recitation.'
      );
    }
  }, [onAnswer]);

  // Detection loop for recording phase
  useEffect(() => {
    if (phase !== 'recording' || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const sampleRate = audioCtxRef.current?.sampleRate ?? 44100;

    function detect() {
      animFrameRef.current = requestAnimationFrame(detect);

      const buf = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buf);
      const result = detectPitchYIN(buf, sampleRate);
      const userPitch = result?.frequency ?? null;
      userPitchesRef.current.push(userPitch ? freqToMidi(userPitch) : null);

      // Auto-stop on extended silence (after user has started reciting)
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

    function finishRecording() {
      cancelAnimationFrame(animFrameRef.current);
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;

      const result = scorePhrase(
        qariPitchesRef.current,
        userPitchesRef.current,
        [], [],
        content.ayah,
        60
      );

      setScore(result);
      setPhase('scored');
      phaseRef.current = 'scored';

      const passed = result.overall >= passThreshold;
      const maqamNote = content.expectedMaqam ? ` in ${content.expectedMaqam}` : '';
      onAnswer(
        passed,
        `${result.overall}%`,
        `${passThreshold}%`,
        passed
          ? `Well done! You scored ${result.overall}%${maqamNote}. ${result.feedback[0] || ''}`
          : `You scored ${result.overall}%. Need ${passThreshold}% to pass. ${result.feedback[0] || 'Keep practicing!'}`
      );
    }

    animFrameRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, content.ayah, content.expectedMaqam, passThreshold, onAnswer]);

  // Cleanup
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto text-center">
      {content.expectedMaqam && (
        <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
          Maqam {content.expectedMaqam}
        </p>
      )}
      <p className="text-white text-lg font-bold mb-2">
        Surah {content.surah}, Ayah {content.ayah}
      </p>
      <p className="text-white/50 text-sm mb-8">
        Listen to the Qari, then recite the same ayah
      </p>

      {/* Ready state */}
      {phase === 'ready' && (
        <button
          onClick={startListening}
          className="w-full py-5 rounded-2xl bg-[#0D9488] text-white font-bold text-lg hover:bg-[#0D9488]/90 active:scale-95 transition-all flex items-center justify-center gap-3"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
          </svg>
          Start — Listen First
        </button>
      )}

      {/* Listening state */}
      {phase === 'listening' && (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#0D9488]/20">
            <div className="w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-pulse" />
            <span className="text-[#0D9488] font-medium">Step 1: Listening to Qari...</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            {[...Array(7)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-[#0D9488] rounded-full animate-pulse"
                style={{ height: `${[10, 18, 14, 22, 12, 20, 16][i]}px`, animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Countdown state */}
      {phase === 'countdown' && (
        <div className="space-y-4">
          <p className="text-white/60 text-sm">Get ready to recite in...</p>
          <div className="w-24 h-24 rounded-full bg-[#0D9488]/20 border-2 border-[#0D9488] flex items-center justify-center mx-auto">
            <span className="text-5xl font-bold text-[#0D9488]">{countdown}</span>
          </div>
        </div>
      )}

      {/* Recording state */}
      {phase === 'recording' && (
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[#FF4B4B]/20">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF4B4B] animate-pulse" />
            <span className="text-[#FF4B4B] font-medium">Step 2: Your Turn — Recite Now!</span>
          </div>
          <p className="text-white/40 text-xs">Recording stops after 2 seconds of silence</p>
        </div>
      )}

      {/* Scored state */}
      {phase === 'scored' && score && (
        <div className="space-y-3">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold ${
            score.grade === 'A' ? 'bg-[#58CC02]/20 text-[#58CC02]' :
            score.grade === 'B' ? 'bg-[#0D9488]/20 text-[#0D9488]' :
            score.grade === 'C' ? 'bg-[#D97706]/20 text-[#D97706]' :
            'bg-[#FF4B4B]/20 text-[#FF4B4B]'
          }`}>
            {score.grade}
          </div>
          <p className="text-white text-2xl font-bold">{score.overall}%</p>

          {/* Sub-scores */}
          <div className="flex justify-center gap-6 text-sm">
            <div>
              <p className="text-white/40 text-xs">Pitch</p>
              <p className="text-white font-bold">{score.pitch}%</p>
            </div>
            <div>
              <p className="text-white/40 text-xs">Rhythm</p>
              <p className="text-white font-bold">{score.rhythm}%</p>
            </div>
            <div>
              <p className="text-white/40 text-xs">Sustain</p>
              <p className="text-white font-bold">{score.sustain}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
