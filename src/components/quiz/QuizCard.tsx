'use client';

import React from 'react';
import type { QuizQuestion } from '@/utils/quizGenerator';

interface QuizCardProps {
  question: QuizQuestion | null;
  currentIndex: number;
  totalQuestions: number;
  userAnswer: string | Record<string, any> | null;
  onAnswerChange: (answer: string | Record<string, any>) => void;
  onSubmit: () => void;
  isAnswered: boolean;
  feedback: string | null;
  isLoading: boolean;
}

export function QuizCard({
  question,
  currentIndex,
  totalQuestions,
  userAnswer,
  onAnswerChange,
  onSubmit,
  isAnswered,
  feedback,
  isLoading,
}: QuizCardProps) {
  if (!question) return null;

  const isTextQuestion = question.type.includes('translate');
  const isMCQ = question.type.includes('mcq');
  const isSelect = question.type.includes('identify');

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-white/60">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-xs text-gold">{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-gold/60 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-card border border-white/[0.08] rounded-2xl p-8 mb-6">
        {/* Question Text */}
        <div className="mb-6">
          <p className="text-white/60 text-sm mb-3 uppercase tracking-wide">Question</p>
          <p className="text-white text-xl font-semibold">{question.prompt.text}</p>
          {question.prompt.arabicText && (
            <p className="text-2xl font-arabic text-gold mt-4">{question.prompt.arabicText}</p>
          )}
          {question.prompt.context && (
            <p className="text-sm text-white/40 mt-3 italic">{question.prompt.context}</p>
          )}
        </div>

        {/* Answer Input */}
        <div className="mb-6">
          {isTextQuestion ? (
            <input
              type="text"
              value={(userAnswer as string) || ''}
              onChange={(e) => onAnswerChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isAnswered && !isLoading) {
                  onSubmit();
                }
              }}
              disabled={isAnswered}
              placeholder="Type your answer..."
              className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all disabled:opacity-50"
              autoFocus
            />
          ) : isMCQ ? (
            <div className="space-y-3">
              {question.prompt.options?.map((option) => (
                <button
                  key={option.id}
                  onClick={() => !isAnswered && onAnswerChange(option.id)}
                  disabled={isAnswered}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    userAnswer === option.id
                      ? 'bg-gold/20 border-gold/40'
                      : 'bg-white/[0.04] border-white/[0.1] hover:border-white/[0.2]'
                  } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <p className="text-white font-medium">{option.label}</p>
                </button>
              ))}
            </div>
          ) : isSelect ? (
            <p className="text-white/60">Select options in the form below</p>
          ) : null}
        </div>

        {/* Feedback */}
        {isAnswered && feedback && (
          <div className="mb-6 p-4 bg-white/[0.05] border border-white/[0.1] rounded-lg">
            <p className="text-sm text-white/70">{feedback}</p>
            {question.correctAnswer && typeof question.correctAnswer === 'string' && (
              <p className="text-gold text-sm mt-2">
                Correct answer: <span className="font-semibold">{question.correctAnswer}</span>
              </p>
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={onSubmit}
          disabled={isAnswered || isLoading || !userAnswer}
          className="btn-primary w-full py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
              Checking...
            </span>
          ) : isAnswered ? (
            'Next Question'
          ) : (
            'Submit Answer'
          )}
        </button>
      </div>
    </div>
  );
}
