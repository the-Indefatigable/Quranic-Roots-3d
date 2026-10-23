'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useQuizStore } from '@/store/useQuizStore';
import { QuizSelector, type QuizType } from '@/components/quiz/QuizSelector';
import { GuestQuiz } from '@/components/quiz/GuestQuiz';

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
    return <div className="px-4"><GuestQuiz /></div>;
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
