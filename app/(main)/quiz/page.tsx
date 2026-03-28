'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <QuizSelector onSelect={handleStartQuiz} isLoading={isLoading} />
      </div>
    </div>
  );
}
