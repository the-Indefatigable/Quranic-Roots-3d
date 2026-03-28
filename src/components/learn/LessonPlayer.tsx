'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TeachStep } from './steps/TeachStep';
import { MCQStep } from './steps/MCQStep';
import { MatchStep } from './steps/MatchStep';
import { FillBlankStep } from './steps/FillBlankStep';
import { ArrangeStep } from './steps/ArrangeStep';
import { ClassifyStep } from './steps/ClassifyStep';
import { TranslateStep } from './steps/TranslateStep';
import { LessonComplete } from './LessonComplete';

export interface LessonStep {
  type: 'teach' | 'mcq' | 'match' | 'fill_blank' | 'arrange' | 'classify' | 'translate';
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

  // All steps = original + recycled mistakes
  const allSteps = [...steps, ...recycledSteps];
  const totalSteps = allSteps.length;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const currentStepData = allSteps[currentStep];

  // Handle answer from any step type
  const handleAnswer = useCallback((isCorrect: boolean, userAnswer: string, correctAnswer: string, explanation?: string) => {
    setTotalAnswered((p) => p + 1);

    if (isCorrect) {
      setCorrectCount((p) => p + 1);
      setCombo((p) => {
        const newCombo = p + 1;
        setComboMax((m) => Math.max(m, newCombo));
        return newCombo;
      });
      setShowFeedback('correct');
      setFeedbackExplanation(explanation || 'Correct!');
    } else {
      setCombo(0);
      setHearts((h) => Math.max(0, h - 1));
      setMistakes((prev) => [...prev, { stepIndex: currentStep, userAnswer, correctAnswer }]);
      // Recycle this step for later (different position)
      if (currentStepData) {
        setRecycledSteps((prev) => [...prev, currentStepData]);
      }
      setShowFeedback('wrong');
      setFeedbackExplanation(explanation || `The correct answer is: ${correctAnswer}`);
    }

    // Auto-advance after feedback delay
    setTimeout(() => {
      setShowFeedback(null);
      if (currentStep + 1 >= allSteps.length + (isCorrect ? 0 : 1)) {
        // Adding 1 for the recycled step we just pushed
        finishLesson();
      } else {
        setCurrentStep((p) => p + 1);
      }
    }, 1500);
  }, [currentStep, allSteps.length, currentStepData]);

  // For teach steps — just advance
  const handleContinue = useCallback(() => {
    if (currentStep + 1 >= allSteps.length) {
      finishLesson();
    } else {
      setCurrentStep((p) => p + 1);
    }
  }, [currentStep, allSteps.length]);

  // Check hearts — if 0, force end
  useEffect(() => {
    if (hearts <= 0 && !isComplete) {
      setCompletionData({
        outOfHearts: true,
        xpEarned: 0,
        score: 0,
      });
      setIsComplete(true);
    }
  }, [hearts, isComplete]);

  const finishLesson = async () => {
    const timeSpentS = Math.round((Date.now() - startTime) / 1000);
    const score = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 100;

    try {
      const res = await fetch('/api/learn/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          score,
          correctCount,
          totalCount: totalAnswered,
          mistakes,
          comboMax,
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
  };

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
        <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
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
    default:
      return <div className="text-white">Unknown step type</div>;
  }
}
