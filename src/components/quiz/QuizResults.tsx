'use client';

import React, { useState } from 'react';
import { ResultCard } from '@/components/gamification/ResultCard';
import { AchievementUnlock } from '@/components/gamification/AchievementUnlock';

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  category: string;
  xpBonus: number | null;
}

interface QuizResultsProps {
  score: number;
  correctCount: number;
  totalCount: number;
  earnedXP: number;
  duration_s?: number;
  newLevel?: number | null;
  leveledUp?: boolean;
  unlockedAchievements?: Achievement[];
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
  newLevel,
  leveledUp,
  unlockedAchievements = [],
  onRetake,
  onBack,
  isLoading,
}: QuizResultsProps) {
  const [showAchievements, setShowAchievements] = useState(unlockedAchievements.length > 0);

  const minutes = duration_s ? Math.floor(duration_s / 60) : 0;
  const seconds = duration_s ? duration_s % 60 : 0;

  return (
    <>
      {/* Achievement Unlock Modal */}
      <AchievementUnlock
        achievements={unlockedAchievements}
        isVisible={showAchievements}
        onClose={() => setShowAchievements(false)}
      />

      {/* Results */}
      <div className="w-full max-w-2xl mx-auto space-y-8">
        {/* Premium Result Card */}
        <ResultCard
          score={score}
          earnedXP={earnedXP}
          correctCount={correctCount}
          totalCount={totalCount}
          newLevel={newLevel}
          leveledUp={leveledUp}
          unlockedAchievements={unlockedAchievements}
        />

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
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
            className="flex-1 px-6 py-3 rounded-xl border border-border text-text font-semibold hover:bg-border-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </>
  );
}
