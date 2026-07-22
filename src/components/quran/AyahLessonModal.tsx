'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { generateAyahLesson, type LessonWord, type LessonStep } from '@/utils/ayahLessonGenerator';

interface Props {
  surahNumber: number;
  ayahNumber: number;
  words: LessonWord[];
  translation: string;
  onClose: () => void;
}

const GOLD = '#D4A246';

export function AyahLessonModal({ surahNumber, ayahNumber, words, translation, onClose }: Props) {
  const { updateStreak } = useAppStore();

  const lesson = useMemo(
    () => generateAyahLesson(surahNumber, ayahNumber, words, translation),
    [surahNumber, ayahNumber, words, translation],
  );

  const steps = lesson?.steps ?? [];
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState<{ choice: string; ok: boolean } | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Portal to <body>: the reader lives inside a `.page-enter` element whose
  // animation leaves a residual `transform`, which would scope our
  // `position: fixed` to that column instead of the viewport. Portaling escapes it.
  useEffect(() => setMounted(true), []);

  const mcqCount = useMemo(() => steps.filter((s) => s.kind === 'mcq').length, [steps]);

  const advance = useCallback(() => {
    setAnswered(null);
    setRevealed(false);
    setIdx((i) => {
      if (i + 1 >= steps.length) {
        setFinished(true);
        updateStreak(); // count this practice toward the daily streak
        return i;
      }
      return i + 1;
    });
  }, [steps.length, updateStreak]);

  const pickAnswer = useCallback((mcq: Extract<LessonStep, { kind: 'mcq' }>, choice: string) => {
    if (answered) return;
    const ok = choice.trim().toLowerCase() === mcq.answer.trim().toLowerCase();
    setAnswered({ choice, ok });
    if (ok) setCorrect((c) => c + 1);
  }, [answered]);

  if (!lesson || steps.length === 0 || !mounted) return null;

  const step = steps[idx];
  const progress = finished ? 100 : Math.round((idx / steps.length) * 100);
  const xp = 5 + correct * 3; // base + per-correct

  // Content for the current screen. Keyed remount (below) plays the entrance
  // animation on each step change — no AnimatePresence / exit lifecycle to stall.
  let body: React.ReactNode;
  if (finished) {
    body = (
      <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4" style={{ background: 'rgba(212,162,70,0.15)' }}>🌱</div>
        <h3 className="font-heading text-xl mb-1" style={{ color: '#F0E4CA' }}>Ayah learned</h3>
        <p className="text-sm mb-5" style={{ color: '#A8946A' }}>
          {mcqCount > 0 ? `${correct} of ${mcqCount} correct` : 'Nice work'} · +{xp} XP
        </p>
        <button onClick={onClose} className="w-full py-3 rounded-xl text-sm font-semibold" style={{ background: GOLD, color: '#1A1712' }}>
          Continue reading
        </button>
      </div>
    );
  } else if (step.kind === 'flashcard') {
    body = (
      <div className="flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-widest mb-6" style={{ color: '#57534E' }}>New word</p>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="font-arabic mb-3" style={{ fontSize: '2.75rem', color: '#F0E8D8' }} dir="rtl">{step.word.textUthmani}</p>
          {step.word.transliteration && <p className="text-sm italic mb-4" style={{ color: '#78716C' }}>{step.word.transliteration}</p>}
          <p className="text-lg font-medium" style={{ color: GOLD }}>{step.word.translation}</p>
          {step.word.rootArabic && (
            <div className="mt-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: 'rgba(212,162,70,0.08)', border: '1px solid rgba(212,162,70,0.2)' }}>
              <span className="text-[10px] uppercase tracking-wider" style={{ color: '#78716C' }}>Root</span>
              <span className="font-arabic text-base" style={{ color: GOLD }} dir="rtl">{step.word.rootArabic}</span>
            </div>
          )}
        </div>
        <button onClick={advance} className="w-full py-3 rounded-xl text-sm font-semibold mt-6" style={{ background: 'rgba(212,162,70,0.12)', color: GOLD, border: '1px solid rgba(212,162,70,0.25)' }}>
          Got it
        </button>
      </div>
    );
  } else if (step.kind === 'mcq') {
    body = (
      <div className="flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-widest mb-5" style={{ color: '#57534E' }}>What does this mean?</p>
        <p className="font-arabic text-center mb-6" style={{ fontSize: '2.5rem', color: '#F0E8D8' }} dir="rtl">{step.prompt}</p>
        <div className="space-y-2.5 flex-1">
          {step.options.map((opt) => {
            const isChoice = answered?.choice === opt;
            const isAnswer = opt.trim().toLowerCase() === step.answer.trim().toLowerCase();
            let bg = 'rgba(255,255,255,0.04)', border = 'rgba(255,255,255,0.08)', color = '#D6CDBB';
            if (answered) {
              if (isAnswer) { bg = 'rgba(74,163,90,0.14)'; border = 'rgba(74,163,90,0.5)'; color = '#7FD48B'; }
              else if (isChoice) { bg = 'rgba(200,72,72,0.12)'; border = 'rgba(200,72,72,0.45)'; color = '#E08A8A'; }
            }
            return (
              <button key={opt} onClick={() => pickAnswer(step, opt)} disabled={!!answered}
                className="w-full py-3 px-4 rounded-xl text-sm font-medium text-left transition-all duration-150"
                style={{ background: bg, border: `1px solid ${border}`, color }}>
                {opt}
              </button>
            );
          })}
        </div>
        {answered && (
          <button onClick={advance} className="w-full py-3 rounded-xl text-sm font-semibold mt-5" style={{ background: GOLD, color: '#1A1712' }}>
            {answered.ok ? 'Correct — continue' : `Answer: ${step.answer}`}
          </button>
        )}
      </div>
    );
  } else {
    // recall
    body = (
      <div className="flex-1 flex flex-col">
        <p className="text-[11px] uppercase tracking-widest mb-5" style={{ color: '#57534E' }}>The whole ayah</p>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="font-arabic leading-loose mb-6" style={{ fontSize: '1.9rem', color: '#F0E8D8' }} dir="rtl">{step.arabic}</p>
          {revealed ? (
            <p className="text-sm leading-relaxed" style={{ color: '#A8946A' }}>{step.translation}</p>
          ) : (
            <button onClick={() => setRevealed(true)} className="text-sm px-4 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)', color: '#78716C' }}>
              Reveal meaning
            </button>
          )}
        </div>
        <button onClick={advance} className="w-full py-3 rounded-xl text-sm font-semibold mt-6" style={{ background: GOLD, color: '#1A1712' }}>
          Finish
        </button>
      </div>
    );
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(10,9,7,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden"
        style={{ background: '#181510', border: '1px solid rgba(212,162,70,0.18)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header + progress */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)', color: '#78716C' }} aria-label="Close lesson">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
              <motion.div className="h-full rounded-full" style={{ background: GOLD }} animate={{ width: `${progress}%` }} transition={{ duration: 0.35 }} />
            </div>
            <span className="text-[11px] font-medium tabular-nums shrink-0" style={{ color: '#78716C' }}>{surahNumber}:{ayahNumber}</span>
          </div>
        </div>

        <div className="px-5 pb-6 min-h-[340px] flex flex-col">
          <motion.div
            key={finished ? 'done' : `step-${idx}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col"
          >
            {body}
          </motion.div>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
