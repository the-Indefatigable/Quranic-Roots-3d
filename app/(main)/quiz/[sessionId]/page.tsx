'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuizStore } from '@/store/useQuizStore';
import { QuizCard } from '@/components/quiz/QuizCard';
import { QuizSessionCard } from '@/components/quiz/QuizSessionCard';
import { QuizResults } from '@/components/quiz/QuizResults';
import type { QuizQuestion } from '@/utils/quizGenerator';

interface PageProps {
  params: {
    sessionId: string;
  };
}

export default function QuizSessionPage({ params }: PageProps) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const quizStore = useQuizStore();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Session tracking
  const [startTime] = useState(Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionStats, setSessionStats] = useState<{
    score: number;
    correctCount: number;
    earnedXP: number;
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load questions from store on mount
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
      return;
    }

    // Check if we have questions in the store
    if (quizStore.session?.questions) {
      setQuestions(quizStore.session.questions);
      setIsLoadingQuestions(false);
    } else {
      // No questions found - redirect back to selector
      router.push('/quiz');
    }
  }, [authLoading, user, router, quizStore.session?.questions]);

  // Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleSubmitAnswer = async () => {
    if (!quizStore.currentQuestion) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/quiz/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: params.sessionId,
          itemId: quizStore.currentQuestion.itemId,
          itemType: quizStore.currentQuestion.itemType,
          questionType: quizStore.currentQuestion.type,
          questPrompt: quizStore.currentQuestion.prompt,
          userAnswer: quizStore.userAnswer,
          correctAnswer: quizStore.currentQuestion.correctAnswer,
          validAnswers: quizStore.currentQuestion.validAnswers,
          responseTime_ms: elapsedSeconds * 1000,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit answer');
        setIsSubmitting(false);
        return;
      }

      // Update store with result
      quizStore.submitAnswer(data.isCorrect, data.feedback);
      setIsSubmitting(false);
    } catch (err) {
      setError('Failed to submit answer');
      setIsSubmitting(false);
      console.error('[quiz/session] Error:', err);
    }
  };

  const handleNextQuestion = async () => {
    quizStore.nextQuestion();

    // Check if quiz is complete
    if (!quizStore.currentQuestion) {
      await handleEndSession();
    }
  };

  const handleEndSession = async () => {
    try {
      const response = await fetch('/api/quiz/end-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: params.sessionId,
          totalTime: elapsedSeconds,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSessionStats({
          score: data.score,
          correctCount: data.correctCount,
          earnedXP: data.earnedXP,
        });
      }
    } catch (err) {
      setError('Failed to end session');
      console.error('[quiz/session] Error:', err);
    }
  };

  const handleRetake = () => {
    quizStore.resetQuiz();
    router.push('/quiz');
  };

  const handleBack = () => {
    quizStore.resetQuiz();
    router.push('/quiz');
  };

  // Loading state
  if (authLoading || isLoadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Please sign in to access quizzes</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Results view
  if (sessionStats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-12 px-4">
        <QuizResults
          score={sessionStats.score}
          correctCount={sessionStats.correctCount}
          totalCount={5} // TODO: get from session
          earnedXP={sessionStats.earnedXP}
          duration_s={elapsedSeconds}
          onRetake={handleRetake}
          onBack={handleBack}
          isLoading={false}
        />
      </div>
    );
  }

  // Quiz view
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 pt-24 pb-12 px-4">
      {quizStore.session && (
        <>
          <QuizSessionCard
            correctCount={quizStore.session.correctCount}
            totalCount={quizStore.session.questions.length}
            elapsedSeconds={elapsedSeconds}
          />

          <div className="max-w-2xl mx-auto">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <QuizCard
              question={quizStore.currentQuestion}
              currentIndex={quizStore.session.currentIndex}
              totalQuestions={quizStore.session.questions.length}
              userAnswer={quizStore.userAnswer}
              onAnswerChange={(answer) => quizStore.setUserAnswer(answer)}
              onSubmit={() => {
                if (quizStore.isAnswered) {
                  handleNextQuestion();
                } else {
                  handleSubmitAnswer();
                }
              }}
              isAnswered={quizStore.isAnswered}
              feedback={quizStore.feedback}
              isLoading={isSubmitting}
            />
          </div>
        </>
      )}
    </div>
  );
}
