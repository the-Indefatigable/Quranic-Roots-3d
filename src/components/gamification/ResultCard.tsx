'use client';

import { motion } from 'framer-motion';
import { AchievementBadge } from './AchievementBadge';
import { UserLevel } from './UserLevel';

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  category: string;
  xpBonus: number | null;
}

interface ResultCardProps {
  score: number;
  earnedXP: number;
  correctCount: number;
  totalCount: number;
  newLevel?: number | null;
  leveledUp?: boolean;
  unlockedAchievements?: Achievement[];
}

export function ResultCard({
  score,
  earnedXP,
  correctCount,
  totalCount,
  newLevel,
  leveledUp,
  unlockedAchievements = [],
}: ResultCardProps) {
  const accuracy = score;
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-blue-600';
    if (score >= 40) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Perfect! 🌟';
    if (score >= 80) return 'Excellent! 🎉';
    if (score >= 70) return 'Great job! 👏';
    if (score >= 60) return 'Good work! 💪';
    if (score >= 50) return 'Keep practicing! 📚';
    return 'Try again! 💨';
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto space-y-6"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      {/* Score Circle */}
      <motion.div
        className="relative w-40 h-40 mx-auto"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 150 }}
      >
        <div
          className={`absolute inset-0 rounded-full bg-gradient-to-br ${getScoreColor(
            score
          )} opacity-20 blur-xl`}
        />
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${getScoreColor(score)} p-1`}>
          <div className="absolute inset-1 rounded-full bg-surface flex items-center justify-center flex-col">
            <span className="text-5xl font-bold text-text">{score}</span>
            <span className="text-xs text-text-tertiary uppercase tracking-wider">Score</span>
          </div>
        </div>
      </motion.div>

      {/* Message */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-2xl font-bold text-text">{getScoreMessage(score)}</p>
        <p className="text-text-secondary mt-2">{accuracy}% Accuracy</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="p-4 rounded-xl bg-surface border border-border">
          <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">Correct</p>
          <p className="text-2xl font-bold text-primary">
            {correctCount}
            <span className="text-sm text-text-tertiary ml-1">/ {totalCount}</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-border">
          <p className="text-xs text-text-tertiary uppercase tracking-wider mb-2">XP Earned</p>
          <p className="text-2xl font-bold text-correct">+{earnedXP}</p>
        </div>
      </motion.div>

      {/* Level Up */}
      {leveledUp && newLevel && (
        <motion.div
          className="p-6 rounded-2xl bg-gradient-to-r from-primary-light to-primary-light/50 border border-primary/30"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
        >
          <motion.div
            animate={{ y: [-2, 2, -2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <p className="text-sm font-bold text-primary uppercase tracking-wider mb-3">🎉 Level Up! 🎉</p>
            <p className="text-4xl font-bold text-text">Level {newLevel}</p>
            <p className="text-text-secondary text-sm mt-2">You've unlocked new potential!</p>
          </motion.div>
        </motion.div>
      )}

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <span>🏆 New Achievements</span>
            <span className="text-sm px-2 py-0.5 bg-primary-light rounded-full text-primary">
              +{unlockedAchievements.length}
            </span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {unlockedAchievements.map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + idx * 0.1 }}
              >
                <AchievementBadge
                  title={achievement.title}
                  description={achievement.description || undefined}
                  category={achievement.category as any}
                  isUnlocked={true}
                  size="md"
                  animated={false}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Footer Message */}
      <motion.p
        className="text-center text-sm text-text-secondary"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        {unlockedAchievements.length > 0
          ? 'Amazing progress! Keep going to unlock more achievements!'
          : 'Great effort! Complete more quizzes to unlock achievements!'}
      </motion.p>
    </motion.div>
  );
}
