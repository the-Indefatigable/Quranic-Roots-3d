'use client';

/**
 * ReciteScoreStep — "Phrase Echo" Mode
 *
 * Teaches through the same talaqqi principle:
 * - Arabic text displayed prominently
 * - Qari recites one phrase → you echo it → see pitch comparison
 * - Qari audio plays at low volume WHILE you're recording
 *   so you can hear yourself against the reference
 * - Words light up as they're being recited
 * - Scoring is compassionate — any serious attempt passes
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { detectPitchYIN, freqToMidi } from '@/lib/audio/pitchEngine';
import { scorePhrase, type PhraseScore } from '@/lib/audio/phraseScorer';
import type { ReciteScoreContent } from '@/data/qirat-curriculum';

interface Props {
  content: ReciteScoreContent;
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void;
}

type Phase = 'ready' | 'listening' | 'countdown' | 'recording' | 'scored';

// Feedback messages by grade
const GRADE_MSG: Record<string, { title: string; body: string; emoji: string }> = {
  A: { emoji: '🌟', title: 'Exceptional!', body: 'Your recitation was very close to the Qari. Keep this up and you will develop a beautiful tilawa.' },
  B: { emoji: '✨', title: 'Well done!', body: 'Good attempt. Your rhythm and pitch are developing well. Repeat to build muscle memory.' },
  C: { emoji: '📖', title: 'Good start', body: 'You tried — that\'s what matters. Listen carefully one more time, then try again.' },
  D: { emoji: '🎤', title: 'Keep going', body: 'The more you listen and repeat, the more natural it becomes. Every Qari started exactly where you are.' },
  F: { emoji: '🎤', title: 'Keep going', body: 'The more you listen and repeat, the more natural it becomes. Every Qari started exactly where you are.' },
};

export function ReciteScoreStep({ content, onAnswer }: Props) {
  const [phase, setPhase] = useState<Phase>('ready');
  const [score, setScore] = useState<PhraseScore | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [hasListened, setHasListened] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number>(0);
  const qariPitchesRef = useRef<(number | null)[]>([]);
  const userPitchesRef = useRef<(number | null)[]>([]);
  const silenceFramesRef = useRef(0);
  const phaseRef = useRef<Phase>('ready');
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audioUrl = `https://everyayah.com/data/${content.reciterId}/${String(content.surah).padStart(3, '0')}${String(content.ayah).padStart(3, '0')}.mp3`;
  const passThreshold = content.passThreshold ?? 20; // very low — any real attempt passes

  const getCtx = useCallback(() => {
    if (!audioCtxRef.current) audioCtxRef.current = new AudioContext();
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    return audioCtxRef.current;
  }, []);

  // Step 1: Play qari + collect their pitch
  const startListening = useCallback(() => {
    setPhase('listening');
    phaseRef.current = 'listening';
    qariPitchesRef.current = [];
    userPitchesRef.current = [];
    silenceFramesRef.current = 0;

    const ctx = getCtx();
    const audio = new Audio(audioUrl);
    audio.crossOrigin = 'anonymous';
    audioRef.current = audio;

    try {
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyser.connect(ctx.destination);

      let qariFrame = 0;
      const sr = ctx.sampleRate;
      function collectQari() {
        if (phaseRef.current !== 'listening') return;
        qariFrame = requestAnimationFrame(collectQari);
        const buf = new Float32Array(analyser.fftSize);
        analyser.getFloatTimeDomainData(buf);
        const r = detectPitchYIN(buf, sr);
        qariPitchesRef.current.push(r?.frequency ? freqToMidi(r.frequency) : null);
      }
      qariFrame = requestAnimationFrame(collectQari);

      audio.addEventListener('ended', () => {
        cancelAnimationFrame(qariFrame);
        setHasListened(true);
        startCountdown();
      });
      audio.addEventListener('error', () => {
        cancelAnimationFrame(qariFrame);
        setPhase('ready');
        phaseRef.current = 'ready';
      });
      audio.play().catch(() => {
        setPhase('ready');
        phaseRef.current = 'ready';
      });
    } catch {
      audio.play().catch(() => {});
      audio.addEventListener('ended', () => {
        setHasListened(true);
        startCountdown();
      });
    }
  }, [audioUrl, getCtx]); // eslint-disable-line react-hooks/exhaustive-deps

  const startCountdown = useCallback(() => {
    setPhase('countdown');
    phaseRef.current = 'countdown';
    setCountdown(3);
    let c = 3;
    const t = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(t);
        startRecording();
      }
    }, 900);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      micStreamRef.current = stream;
      const ctx = getCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Play qari softly alongside (reference while recording)
      const refAudio = new Audio(audioUrl);
      refAudio.volume = 0.2;
      refAudio.play().catch(() => {});

      setPhase('recording');
      phaseRef.current = 'recording';
      silenceFramesRef.current = 0;
      setRecordingSeconds(0);

      // Counting seconds display
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } catch {
      onAnswer(true, 'mic_denied', 'mic_required',
        'Mic access denied. Enable microphone in browser settings to practice recitation.');
    }
  }, [audioUrl, getCtx, onAnswer]);

  // Recording detection loop
  useEffect(() => {
    if (phase !== 'recording' || !analyserRef.current) return;

    const analyser = analyserRef.current;
    const sr = audioCtxRef.current?.sampleRate ?? 44100;

    function detect() {
      animFrameRef.current = requestAnimationFrame(detect);
      const buf = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(buf);
      const r = detectPitchYIN(buf, sr);
      const pitch = r?.frequency ?? null;
      userPitchesRef.current.push(pitch ? freqToMidi(pitch) : null);

      if (!pitch) {
        silenceFramesRef.current++;
        if (silenceFramesRef.current > 150 && userPitchesRef.current.length > 40) {
          finish();
        }
      } else {
        silenceFramesRef.current = 0;
      }
    }

    function finish() {
      cancelAnimationFrame(animFrameRef.current);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      micStreamRef.current?.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;

      const result = scorePhrase(
        qariPitchesRef.current,
        userPitchesRef.current,
        [], [], content.ayah, 60
      );

      setScore(result);
      setPhase('scored');
      phaseRef.current = 'scored';

      // Very low threshold — almost any attempt passes
      const passed = result.overall >= passThreshold;
      const msg = GRADE_MSG[result.grade] ?? GRADE_MSG['F'];
      onAnswer(
        passed,
        `${result.overall}%`,
        `${passThreshold}%`,
        `${msg.title} ${msg.body}`
      );
    }

    animFrameRef.current = requestAnimationFrame(detect);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [phase, content.ayah, passThreshold, onAnswer]);

  useEffect(() => () => {
    audioRef.current?.pause();
    micStreamRef.current?.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(animFrameRef.current);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  }, []);

  const gradeInfo = score ? (GRADE_MSG[score.grade] ?? GRADE_MSG['F']) : null;

  return (
    <div className="w-full max-w-lg mx-auto">

      {/* Header */}
      <div className="mb-5">
        {content.expectedMaqam && (
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium mb-1" style={{ color: '#D4A246' }}>
            Maqam {content.expectedMaqam}
          </p>
        )}
        <p className="text-[#EDEDEC] text-lg font-semibold">
          Surah {content.surah} · Ayah {content.ayah}
        </p>
        <p className="text-[#636260] text-xs mt-0.5">
          Listen to the Qari, then echo what you heard
        </p>
      </div>

      {/* Phase indicators */}
      <div className="flex items-center gap-2 mb-6">
        {(['listen', 'echo'] as const).map((step, i) => {
          const active = (step === 'listen' && (phase === 'ready' || phase === 'listening')) ||
                         (step === 'echo' && (phase === 'countdown' || phase === 'recording' || phase === 'scored'));
          const done = step === 'listen' && (phase === 'countdown' || phase === 'recording' || phase === 'scored');
          return (
            <div key={step} className="flex items-center gap-2">
              {i > 0 && <div className="w-4 h-px bg-[#2D2C2A]" />}
              <div className="flex items-center gap-1.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                  style={{
                    background: done ? '#5CB889' : active ? 'rgba(212,162,70,0.2)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${done ? '#5CB889' : active ? 'rgba(212,162,70,0.4)' : 'rgba(255,255,255,0.08)'}`,
                    color: done ? '#0E0D0C' : active ? '#D4A246' : '#3D3C3A',
                  }}
                >
                  {done ? '✓' : i + 1}
                </div>
                <span className="text-xs" style={{ color: active ? '#A09F9B' : '#3D3C3A' }}>
                  {step === 'listen' ? 'Listen' : 'Echo'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* READY */}
      {phase === 'ready' && (
        <div className="space-y-4">
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(212,162,70,0.06)', border: '1px solid rgba(212,162,70,0.15)' }}
          >
            <p className="text-[#D4A246] text-sm font-semibold mb-2">How this works</p>
            <div className="space-y-2">
              {[
                { n: '1', text: 'Listen: the Qari recites — absorb the melody' },
                { n: '2', text: 'Echo: the Qari plays softly while you recite — let it guide you' },
                { n: '3', text: 'Any genuine attempt earns a pass — this is about exposure, not perfection' },
              ].map(({ n, text }) => (
                <div key={n} className="flex items-start gap-2.5">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ background: 'rgba(212,162,70,0.15)', color: '#D4A246' }}
                  >
                    {n}
                  </span>
                  <p className="text-[#A09F9B] text-sm">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startListening}
            className="w-full py-4 rounded-2xl font-bold text-base transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #D4A246 0%, #E8B84B 100%)',
              color: '#0E0D0C',
              boxShadow: '0 4px 20px rgba(212,162,70,0.3)',
            }}
          >
            Listen to Qari
          </button>
        </div>
      )}

      {/* LISTENING */}
      {phase === 'listening' && (
        <div className="flex flex-col items-center gap-5 py-4">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.25)' }}
          >
            <div className="flex items-end gap-1 h-10">
              {[4, 8, 12, 6, 10, 14, 8].map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 rounded-full animate-pulse"
                  style={{
                    height: `${h * 2}px`,
                    background: '#0D9488',
                    animationDelay: `${i * 0.12}s`,
                    animationDuration: '1s',
                  }}
                />
              ))}
            </div>
          </div>
          <div className="text-center">
            <p className="text-[#EDEDEC] font-semibold">Listening to Qari...</p>
            <p className="text-[#636260] text-sm mt-1">Absorb the melody — notice how it rises and falls</p>
          </div>
        </div>
      )}

      {/* COUNTDOWN */}
      {phase === 'countdown' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-[#A09F9B] text-sm">Get ready to echo in...</p>
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(212,162,70,0.1)', border: '2px solid rgba(212,162,70,0.3)' }}
          >
            <span className="text-5xl font-bold" style={{ color: '#D4A246' }}>{countdown}</span>
          </div>
          <p className="text-[#636260] text-xs text-center max-w-xs">
            The Qari will play softly while you recite — let their voice guide yours
          </p>
        </div>
      )}

      {/* RECORDING */}
      {phase === 'recording' && (
        <div className="flex flex-col items-center gap-5 py-4">
          <div className="relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(217,99,91,0.1)', border: '1px solid rgba(217,99,91,0.25)' }}
            >
              <div className="flex items-end gap-1 h-10">
                {[6, 12, 8, 14, 10, 8, 12].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full animate-pulse"
                    style={{
                      height: `${h * 2}px`,
                      background: '#D9635B',
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
            {/* Recording dot */}
            <div
              className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#D9635B] animate-pulse"
              style={{ boxShadow: '0 0 8px rgba(217,99,91,0.6)' }}
            />
          </div>
          <div className="text-center">
            <p className="text-[#EDEDEC] font-semibold">Recite now!</p>
            <p className="text-[#636260] text-sm mt-1">
              {recordingSeconds}s · Qari playing softly in background
            </p>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(212,162,70,0.06)', border: '1px solid rgba(212,162,70,0.12)' }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4A246] animate-pulse" />
            <p className="text-[#636260] text-xs">Stops automatically after silence</p>
          </div>
        </div>
      )}

      {/* SCORED */}
      {phase === 'scored' && score && gradeInfo && (
        <div className="space-y-4">
          {/* Grade display */}
          <div
            className="rounded-2xl p-5 text-center"
            style={{
              background: score.overall >= 60
                ? 'rgba(92,184,137,0.08)'
                : 'rgba(212,162,70,0.08)',
              border: `1px solid ${score.overall >= 60 ? 'rgba(92,184,137,0.2)' : 'rgba(212,162,70,0.2)'}`,
            }}
          >
            <div className="text-4xl mb-2">{gradeInfo.emoji}</div>
            <p className="text-[#EDEDEC] font-bold text-xl mb-1">{gradeInfo.title}</p>
            <p className="text-[#636260] text-sm leading-relaxed">{gradeInfo.body}</p>
          </div>

          {/* Score breakdown */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#636260] text-xs uppercase tracking-wider">Score breakdown</p>
              <p className="text-[#EDEDEC] font-bold text-lg">{score.overall}%</p>
            </div>
            {[
              { label: 'Pitch', value: score.pitch, desc: 'How close your notes were' },
              { label: 'Rhythm', value: score.rhythm, desc: 'Timing and flow' },
              { label: 'Sustain', value: score.sustain, desc: 'Holding notes steadily' },
            ].map(({ label, value, desc }) => (
              <div key={label} className="mb-2.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#A09F9B]">{label}</span>
                  <span className="text-[#636260]">{value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[#1C1B19] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${value}%`,
                      background: value >= 60 ? '#5CB889' : value >= 40 ? '#D97706' : '#D9635B',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Retry cue */}
          {score.overall < 50 && (
            <button
              onClick={() => {
                setPhase('ready');
                phaseRef.current = 'ready';
                setScore(null);
                setHasListened(false);
              }}
              className="w-full py-3 rounded-2xl text-sm font-medium text-[#A09F9B] transition-all hover:text-[#EDEDEC]"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Listen again &amp; retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
