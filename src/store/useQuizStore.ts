'use client';

import { create } from 'zustand';
import type { QuizQuestion } from '@/utils/quizGenerator';

export interface QuizSession {
  sessionId: string;
  quizType: 'verb_conjugation' | 'noun_translation' | 'particle_translation' | 'mixed';
  questions: QuizQuestion[];
  currentIndex: number;
  userAnswers: (string | Record<string, any>)[];
  correctCount: number;
  startTime: number;
  endTime?: number;
}

interface QuizState {
  // Session state
  session: QuizSession | null;
  isLoading: boolean;
  error: string | null;

  // Quiz progress
  currentQuestion: QuizQuestion | null;
  userAnswer: string | Record<string, any> | null;
  isAnswered: boolean;
  feedback: string | null;

  // Actions
  startSession: (
    sessionId: string,
    quizType: QuizSession['quizType'],
    questions: QuizQuestion[]
  ) => void;
  setUserAnswer: (answer: string | Record<string, any>) => void;
  submitAnswer: (isCorrect: boolean, feedback: string) => void;
  nextQuestion: () => void;
  endSession: () => void;
  resetQuiz: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  session: null,
  isLoading: false,
  error: null,
  currentQuestion: null,
  userAnswer: null,
  isAnswered: false,
  feedback: null,

  startSession: (sessionId, quizType, questions) =>
    set({
      session: {
        sessionId,
        quizType,
        questions,
        currentIndex: 0,
        userAnswers: [],
        correctCount: 0,
        startTime: Date.now(),
      },
      currentQuestion: questions[0] || null,
      userAnswer: null,
      isAnswered: false,
      feedback: null,
      error: null,
    }),

  setUserAnswer: (answer) => set({ userAnswer: answer }),

  submitAnswer: (isCorrect, feedback) =>
    set((state) => {
      if (!state.session) return state;
      return {
        session: {
          ...state.session,
          correctCount: state.session.correctCount + (isCorrect ? 1 : 0),
          userAnswers: [...state.session.userAnswers, state.userAnswer || ''],
        },
        isAnswered: true,
        feedback,
      };
    }),

  nextQuestion: () =>
    set((state) => {
      if (!state.session) return state;
      const nextIndex = state.session.currentIndex + 1;
      const isComplete = nextIndex >= state.session.questions.length;

      return {
        currentIndex: nextIndex,
        currentQuestion: isComplete ? null : state.session.questions[nextIndex] || null,
        userAnswer: null,
        isAnswered: false,
        feedback: null,
        session: {
          ...state.session,
          currentIndex: nextIndex,
          ...(isComplete && { endTime: Date.now() }),
        },
      };
    }),

  endSession: () =>
    set((state) => ({
      session: state.session ? { ...state.session, endTime: Date.now() } : null,
      currentQuestion: null,
    })),

  resetQuiz: () =>
    set({
      session: null,
      currentQuestion: null,
      userAnswer: null,
      isAnswered: false,
      feedback: null,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));
