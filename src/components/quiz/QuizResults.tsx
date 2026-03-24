'use client';

import React from 'react';

interface QuizResultsProps {
  score: number;
  correctCount: number;
  totalCount: number;
  earnedXP: number;
  duration_s?: number;
  onRetake: () => void;
  onBack: () => void;
  isLoading: boolean;
}

export function QuizResults({
  score,
  correctCount,
  totalCount,
  earnedXP,
  duration_s,
  onRetake,
  onBack,
  isLoading,
}: QuizResultsProps) {
  const getScoreMessage = (score: number) => {
    if (score === 100) return '🎉 Perfect! Outstanding work!';
    if (score >= 80) return '🌟 Excellent! Very impressive!';
    if (score >= 60) return '👏 Good job! Keep practicing!';
    if (score >= 40) return '💪 Nice effort! Almost there!';
    return '📈 Keep learning! You\'ll get there!';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-blue-500 to-cyan-500';
    if (score >= 40) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-red-600';
  };

  const minutes = duration_s ? Math.floor(duration_s / 60) : 0;
  const seconds = duration_s ? duration_s % 60 : 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Score Circle */}
      <div className="text-center mb-12">
        <div className={`w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br ${getScoreColor(score)} p-1`}>
          <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
            <span className="text-5xl font-bold text-white">{score}</span>
          </div>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{getScoreMessage(score)}</h1>
        <p className="text-white/60 text-lg">
          You got {correctCount} out of {totalCount} correct
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-white/[0.08] rounded-xl p-4">
          <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Correct</p>
          <p className="text-2xl font-bold text-gold">{correctCount}</p>
        </div>

        <div className="bg-card border border-white/[0.08] rounded-xl p-4">
          <p className="text-white/60 text-xs uppercase tracking-wide mb-1">XP Earned</p>
          <p className="text-2xl font-bold text-green-400">+{earnedXP}</p>
        </div>

        <div className="bg-card border border-white/[0.08] rounded-xl p-4">
          <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Accuracy</p>
          <p className="text-2xl font-bold text-blue-400">{score}%</p>
        </div>

        <div className="bg-card border border-white/[0.08] rounded-xl p-4">
          <p className="text-white/60 text-xs uppercase tracking-wide mb-1">Duration</p>
          <p className="text-2xl font-bold text-purple-400">
            {minutes}m {seconds}s
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-card border border-white/[0.08] rounded-xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-4">Session Breakdown</h2>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white/60">Correct Answers</span>
            <span className="text-sm font-semibold text-gold">
              {correctCount}/{totalCount}
            </span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-gold/60"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Tips */}
        <div className="text-sm text-white/60 space-y-2">
          <p>✨ Master more items by practicing regularly</p>
          <p>📈 Your mastery levels update after each quiz</p>
          <p>⏰ Items appear again based on your learning pace</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={onRetake}
          disabled={isLoading}
          className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Loading...' : 'Retake Quiz'}
        </button>

        <button
          onClick={onBack}
          disabled={isLoading}
          className="flex-1 px-6 py-3 rounded-xl border border-white/[0.2] text-white font-semibold hover:bg-white/[0.05] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
}
