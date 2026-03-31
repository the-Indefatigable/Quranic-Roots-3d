'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuizStore } from '@/store/useQuizStore';
import { QuizSelector, type QuizType } from '@/components/quiz/QuizSelector';

export default function QuizPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const quizStore = useQuizStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartQuiz = async (quizType: QuizType, limit: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/quiz/start?type=${quizType}&limit=${limit}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to start quiz');
        setIsLoading(false);
        return;
      }

      if (!data.sessionId) {
        setError(data.message || 'No items available for this quiz type');
        setIsLoading(false);
        return;
      }

      // Store quiz session in Zustand before navigating
      quizStore.startSession(data.sessionId, quizType, data.items);

      // Navigate to quiz session
      router.push(`/quiz/${data.sessionId}`);
    } catch (err) {
      setError('Failed to start quiz. Please try again.');
      setIsLoading(false);
      console.error('[quiz/page] Error:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 rounded-full bg-surface shadow-card flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-text-tertiary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h2 className="text-lg font-heading text-text mb-2">Sign in to access quizzes</h2>
          <p className="text-sm text-text-secondary mb-6">Track your progress and master Quranic vocabulary</p>
          <button onClick={() => router.push('/')} className="btn-primary">
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {error && (
          <motion.div
            className="mb-6 p-4 bg-wrong-light border border-wrong/20 rounded-xl"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-wrong text-sm">{error}</p>
          </motion.div>
        )}

        <QuizSelector onSelect={handleStartQuiz} isLoading={isLoading} />
      </div>
    </div>
  );
}
