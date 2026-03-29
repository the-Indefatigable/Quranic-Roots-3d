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
    <div className="fixed inset-0 z-50 bg-[#131F24] flex flex-col">
      {/* Top bar: progress + hearts + close */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0">
        <button onClick={onExit} className="text-white/40 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress bar */}
        <div className="flex-1 h-3 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: unitColor || '#58CC02' }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          />
        </div>

        {/* Hearts */}
        <div className="flex items-center gap-1 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.span
              key={i}
              className="text-lg"
              animate={i >= hearts ? { scale: [1, 0.5], opacity: [1, 0.3] } : {}}
            >
              {i < hearts ? '❤️' : '🖤'}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Combo indicator */}
      <AnimatePresence>
        {combo >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-1"
          >
            <span className="text-sm font-bold" style={{ color: '#D97706' }}>
              🔥 {combo}x Combo!
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-lg"
          >
            {currentStepData && renderStep(currentStepData, handleAnswer, handleContinue)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Feedback banner */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={`absolute bottom-0 left-0 right-0 p-5 ${
              showFeedback === 'correct'
                ? 'bg-[#58CC02]'
                : 'bg-[#FF4B4B]'
            }`}
          >
            <div className="max-w-lg mx-auto">
              <p className="font-bold text-white text-lg mb-1">
                {showFeedback === 'correct' ? '✓ Correct!' : '✗ Not quite'}
              </p>
              <p className="text-white/90 text-sm">{feedbackExplanation}</p>
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
