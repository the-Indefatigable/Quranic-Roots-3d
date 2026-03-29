'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeachStep } from './steps/TeachStep';
import { MCQStep } from './steps/MCQStep';
import { MatchStep } from './steps/MatchStep';
import { FillBlankStep } from './steps/FillBlankStep';
import { ArrangeStep } from './steps/ArrangeStep';
import { ClassifyStep } from './steps/ClassifyStep';
import { TranslateStep } from './steps/TranslateStep';
import { ListenIdentifyStep } from './steps/ListenIdentifyStep';
import { PitchMatchStep } from './steps/PitchMatchStep';
import { ReciteScoreStep } from './steps/ReciteScoreStep';
import { LessonComplete } from './LessonComplete';

export interface LessonStep {
  type: 'teach' | 'mcq' | 'match' | 'fill_blank' | 'arrange' | 'classify' | 'translate' | 'listen_identify' | 'pitch_match' | 'recite_score';
  content: Record<string, unknown>;
}

interface LessonPlayerProps {
  lessonId: string;
  title: string;
  unitTitle: string;
  unitColor: string;
  steps: LessonStep[];
  xpReward: number;
  initialHearts: number;
  onExit: () => void;
}

export function LessonPlayer({
  lessonId,
  title,
  unitTitle,
  unitColor,
  steps,
  xpReward,
  initialHearts,
  onExit,
}: LessonPlayerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [hearts, setHearts] = useState(initialHearts);
  const [combo, setCombo] = useState(0);
  const [comboMax, setComboMax] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [mistakes, setMistakes] = useState<Array<{ stepIndex: number; userAnswer: string; correctAnswer: string }>>([]);
  const [recycledSteps, setRecycledSteps] = useState<LessonStep[]>([]);
  const [isComplete, setIsComplete] = useState(false);
  const [completionData, setCompletionData] = useState<Record<string, unknown> | null>(null);
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackExplanation, setFeedbackExplanation] = useState('');

  // Refs to avoid stale closures in finishLesson / handleAnswer
  const correctCountRef = useRef(0);
  const totalAnsweredRef = useRef(0);
  const mistakesRef = useRef<Array<{ stepIndex: number; userAnswer: string; correctAnswer: string }>>([]);
  const comboMaxRef = useRef(0);
  const recycledStepsRef = useRef<LessonStep[]>([]);
  const isCompleteRef = useRef(false);

  // All steps = original + recycled mistakes
  const allSteps = [...steps, ...recycledSteps];
  const totalSteps = allSteps.length;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const currentStepData = allSteps[currentStep];

  // Audio step types don't penalize hearts — mic/environment issues aren't user error
  const isAudioStep = (type: LessonStep['type']) =>
    type === 'pitch_match' || type === 'recite_score';

  const finishLesson = useCallback(async () => {
    if (isCompleteRef.current) return;
    isCompleteRef.current = true;

    const timeSpentS = Math.round((Date.now() - startTime) / 1000);
    const tot = totalAnsweredRef.current;
    const cor = correctCountRef.current;
    const score = tot > 0 ? Math.round((cor / tot) * 100) : 100;

    try {
      const res = await fetch('/api/learn/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          score,
          correctCount: cor,
          totalCount: tot,
          mistakes: mistakesRef.current,
          comboMax: comboMaxRef.current,
          timeSpentS,
        }),
      });

      const data = await res.json();
      setCompletionData(data);
    } catch {
      setCompletionData({
        xpEarned: xpReward,
        score,
        streak: { currentStreak: 0 },
        error: true,
      });
    }

    setIsComplete(true);
  }, [lessonId, xpReward, startTime]);

  // Handle answer from any step type
  const handleAnswer = useCallback((isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => {
    totalAnsweredRef.current += 1;
    setTotalAnswered(totalAnsweredRef.current);

    const stepType = currentStepData?.type;
    const audioStep = stepType ? isAudioStep(stepType) : false;

    if (isCorrect) {
      correctCountRef.current += 1;
      setCorrectCount(correctCountRef.current);
      setCombo((p) => {
        const newCombo = p + 1;
        comboMaxRef.current = Math.max(comboMaxRef.current, newCombo);
        setComboMax(comboMaxRef.current);
        return newCombo;
      });
      setShowFeedback('correct');
      setFeedbackExplanation(explanation || 'Correct!');
    } else {
      setCombo(0);
      // Audio steps don't lose hearts — env/mic issues aren't user mistakes
      if (!audioStep) {
        setHearts((h) => Math.max(0, h - 1));
      }
      mistakesRef.current = [...mistakesRef.current, { stepIndex: currentStep, userAnswer, correctAnswer }];
      setMistakes(mistakesRef.current);
      // Recycle non-audio steps only
      if (currentStepData && !audioStep) {
        recycledStepsRef.current = [...recycledStepsRef.current, currentStepData];
        setRecycledSteps(recycledStepsRef.current);
      }
      setShowFeedback('wrong');
      setFeedbackExplanation(explanation || `The correct answer is: ${correctAnswer}`);
    }

    // Use ref for recycled count to avoid stale closure
    const totalAfter = steps.length + recycledStepsRef.current.length;
    const recycledWasAdded = !isCorrect && !audioStep ? 1 : 0;

    setTimeout(() => {
      setShowFeedback(null);
      if (currentStep + 1 >= totalAfter + recycledWasAdded) {
        finishLesson();
      } else {
        setCurrentStep((p) => p + 1);
      }
    }, 1500);
  }, [currentStep, currentStepData, steps.length, finishLesson]);

  // For teach steps — just advance
  const handleContinue = useCallback(() => {
    const totalAfter = steps.length + recycledStepsRef.current.length;
    if (currentStep + 1 >= totalAfter) {
      finishLesson();
    } else {
      setCurrentStep((p) => p + 1);
    }
  }, [currentStep, steps.length, finishLesson]);

  // Check hearts — if 0, force end
  useEffect(() => {
    if (hearts <= 0 && !isComplete) {
      setCompletionData({
        outOfHearts: true,
        xpEarned: 0,
        score: 0,
      });
      setIsComplete(true);
      isCompleteRef.current = true;
    }
  }, [hearts, isComplete]);

  if (isComplete && completionData) {
    return (
      <LessonComplete
        data={completionData}
        onContinue={onExit}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#0E0D0C' }}>

      {/* Subtle dot-grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(212,162,70,0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Unit-colored ambient glow at top */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 right-0 h-48 z-0"
        style={{ background: `radial-gradient(ellipse at 50% -20%, ${unitColor}18 0%, transparent 70%)` }}
      />

      {/* ── Top bar ─────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-3 shrink-0">
        <button
          onClick={onExit}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#57534E] hover:text-[#A09F9B] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress bar — with octagon-tipped capsule feel */}
        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <motion.div
            className="h-full rounded-full"
            style={{
              background: `linear-gradient(to right, ${unitColor}cc, ${unitColor})`,
              boxShadow: `0 0 8px ${unitColor}60`,
            }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
          />
        </div>

        {/* Heart dots — refined, not emoji */}
        <div className="flex items-center gap-1 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: i < hearts ? '#D9635B' : 'rgba(255,255,255,0.08)' }}
              animate={i === hearts ? { scale: [1, 0.4, 1] } : {}}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      </div>

      {/* Lesson title + unit breadcrumb */}
      <div className="relative z-10 px-5 pb-1 shrink-0">
        <p className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: `${unitColor}80` }}>
          {unitTitle}
        </p>
        <p className="text-[#A09F9B] text-xs truncate">{title}</p>
      </div>

      {/* Combo indicator */}
      <AnimatePresence>
        {combo >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative z-10 text-center py-1"
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(217,151,91,0.12)', color: '#D97706', border: '1px solid rgba(217,151,91,0.2)' }}
            >
              <span>🔥</span> {combo}× Combo
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step content ─────────────────────────────────────── */}
      <div className="relative z-10 flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 32, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -32, filter: 'blur(4px)' }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg"
          >
            {currentStepData && renderStep(currentStepData, handleAnswer, handleContinue)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Feedback banner — refined, not a flat slab ───────── */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="absolute bottom-0 left-0 right-0 z-20"
          >
            <div
              className="mx-3 mb-3 rounded-2xl p-5"
              style={showFeedback === 'correct' ? {
                background: 'linear-gradient(135deg, rgba(92,184,137,0.18) 0%, rgba(92,184,137,0.10) 100%)',
                border: '1px solid rgba(92,184,137,0.30)',
                boxShadow: '0 8px 32px rgba(92,184,137,0.12)',
              } : {
                background: 'linear-gradient(135deg, rgba(217,99,91,0.18) 0%, rgba(217,99,91,0.10) 100%)',
                border: '1px solid rgba(217,99,91,0.30)',
                boxShadow: '0 8px 32px rgba(217,99,91,0.12)',
              }}
            >
              <div className="max-w-lg mx-auto flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: showFeedback === 'correct' ? 'rgba(92,184,137,0.2)' : 'rgba(217,99,91,0.2)' }}
                >
                  <span className="text-base">{showFeedback === 'correct' ? '✓' : '✗'}</span>
                </div>
                <div>
                  <p className="font-bold text-[#EDEDEC] text-base mb-0.5">
                    {showFeedback === 'correct' ? 'Correct!' : 'Not quite'}
                  </p>
                  <p className="text-[#A09F9B] text-sm leading-relaxed">{feedbackExplanation}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function renderStep(
  step: LessonStep,
  onAnswer: (isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => void,
  onContinue: () => void,
) {
  switch (step.type) {
    case 'teach':
      return <TeachStep content={step.content} onContinue={onContinue} />;
    case 'mcq':
      return <MCQStep content={step.content} onAnswer={onAnswer} />;
    case 'match':
      return <MatchStep content={step.content} onAnswer={onAnswer} />;
    case 'fill_blank':
      return <FillBlankStep content={step.content} onAnswer={onAnswer} />;
    case 'arrange':
      return <ArrangeStep content={step.content} onAnswer={onAnswer} />;
    case 'classify':
      return <ClassifyStep content={step.content} onAnswer={onAnswer} />;
    case 'translate':
      return <TranslateStep content={step.content} onAnswer={onAnswer} />;
    case 'listen_identify':
      return <ListenIdentifyStep content={step.content as any} onAnswer={onAnswer} />;
    case 'pitch_match':
      return <PitchMatchStep content={step.content as any} onAnswer={onAnswer} />;
    case 'recite_score':
      return <ReciteScoreStep content={step.content as any} onAnswer={onAnswer} />;
    default:
      return <div className="text-white">Unknown step type</div>;
  }
}
