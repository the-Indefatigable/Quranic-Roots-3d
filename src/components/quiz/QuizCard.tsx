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
          <span className="text-sm text-text-secondary">
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <span className="text-xs text-primary">{Math.round(((currentIndex + 1) / totalQuestions) * 100)}%</span>
        </div>
        <div className="w-full h-1 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/60 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-surface rounded-2xl shadow-card p-8 mb-6">
        {/* Question Text */}
        <div className="mb-6">
          <p className="text-text-secondary text-sm mb-3 uppercase tracking-wide">Question</p>
          <p className="text-text text-xl font-semibold">{question.prompt.text}</p>
          {question.prompt.arabicText && (
            <p className="text-2xl font-arabic text-primary mt-4">{question.prompt.arabicText}</p>
          )}
          {question.prompt.context && (
            <p className="text-sm text-text-tertiary mt-3 italic">{question.prompt.context}</p>
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
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text placeholder:text-text-tertiary focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
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
                      ? 'bg-primary/20 border-primary/40'
                      : 'bg-surface border-border hover:border-border'
                  } ${isAnswered ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  <p className="text-text font-medium">{option.label}</p>
                </button>
              ))}
            </div>
          ) : isSelect ? (
            <p className="text-text-secondary">Select options in the form below</p>
          ) : null}
        </div>

        {/* Feedback */}
        {isAnswered && feedback && (
          <div className="mb-6 p-4 bg-surface rounded-lg shadow-card">
            <p className="text-sm text-text-secondary">{feedback}</p>
            {question.correctAnswer && typeof question.correctAnswer === 'string' && (
              <p className="text-primary text-sm mt-2">
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
