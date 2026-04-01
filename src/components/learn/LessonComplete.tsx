'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LessonCompleteProps {
  data: Record<string, unknown>;
  onContinue: () => void;
}

export function LessonComplete({ data, onContinue }: LessonCompleteProps) {
  const xpEarned = (data.xpEarned as number) || 0;
  const score = (data.score as number) || 0;
  const isPerfect = (data.isPerfect as boolean) || false;
  const outOfHearts = (data.outOfHearts as boolean) || false;
  const streak = data.streak as { currentStreak?: number; milestoneReached?: number } | undefined;
  const dailyGoalCompleted = (data.dailyGoalCompleted as boolean) || false;
  const gemsEarned = (data.gemsEarned as number) || 0;
  const nextLessonId = data.nextLessonId as string | null;

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!outOfHearts) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [outOfHearts]);

  if (outOfHearts) {
    return (
      <div className="fixed inset-0 z-50 bg-[#131F24] flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <span className="text-6xl mb-4 block">💔</span>
          <h2 className="text-2xl font-bold text-white mb-2">Out of Hearts!</h2>
          <p className="text-white/50 mb-8">Practice earlier lessons to earn hearts back, or wait for them to refill.</p>
          <button
            onClick={onContinue}
            className="px-8 py-4 rounded-2xl bg-[#1CB0F6] text-white font-bold text-lg shadow-[0_4px_0_#0d8ecf] hover:translate-y-[2px] hover:shadow-[0_2px_0_#0d8ecf] transition-all"
          >
            Back to Path
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#131F24] flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Confetti particles */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{
                x: Math.random() * window.innerWidth,
                y: -20,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight + 20,
                rotate: Math.random() * 720 - 360,
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                delay: Math.random() * 0.5,
                ease: 'easeOut',
              }}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#D4A246', '#1CB0F6', '#D97706', '#059669', '#CE82FF'][i % 5],
              }}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center z-10"
      >
        {/* Trophy/star */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          className="mb-4"
        >
          <span className="text-7xl">{isPerfect ? '🌟' : score >= 80 ? '⭐' : '✅'}</span>
        </motion.div>

        <h2 className="text-3xl font-bold text-white mb-2">
          {isPerfect ? 'PERFECT!' : 'Lesson Complete!'}
        </h2>

        {/* XP earned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-3 my-6"
        >
          <div className="px-6 py-3 rounded-2xl bg-[#D97706]/10 border border-[#D97706]/30">
            <span className="text-3xl font-bold text-[#D97706]">+{xpEarned} XP</span>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-6 mb-6"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{score}%</p>
            <p className="text-xs text-white/40">Accuracy</p>
          </div>
          {streak?.currentStreak && streak.currentStreak > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-[#D97706]">🔥 {streak.currentStreak}</p>
              <p className="text-xs text-white/40">Day Streak</p>
            </div>
          )}
          {gemsEarned > 0 && (
            <div className="text-center">
              <p className="text-2xl font-bold text-[#1CB0F6]">💎 +{gemsEarned}</p>
              <p className="text-xs text-white/40">Gems</p>
            </div>
          )}
        </motion.div>

        {/* Milestone badges */}
        {dailyGoalCompleted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-4 px-4 py-2 rounded-full bg-[#58CC02]/10 border border-[#58CC02]/30 inline-block"
          >
            <span className="text-sm text-[#58CC02] font-bold">🎯 Daily Goal Complete!</span>
          </motion.div>
        )}

        {streak?.milestoneReached && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0 }}
            className="mb-4 px-4 py-2 rounded-full bg-[#D97706]/10 border border-[#D97706]/30 inline-block"
          >
            <span className="text-sm text-[#D97706] font-bold">🔥 {streak.milestoneReached}-Day Streak!</span>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          onClick={onContinue}
          className="w-full max-w-xs py-4 rounded-2xl bg-[#D4A246] text-[#0E0D0C] font-bold text-lg shadow-[0_4px_0_#B4842A] hover:shadow-[0_2px_0_#B4842A] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all mt-4"
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
}
