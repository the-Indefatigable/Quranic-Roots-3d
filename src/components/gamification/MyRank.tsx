'use client';

import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalXP: number;
  userLevel: number;
}

interface MyRankProps {
  entry: LeaderboardEntry;
}

export function MyRank({ entry }: MyRankProps) {
  const isTopThree = entry.rank <= 3;
  const medalEmojis = ['🥇', '🥈', '🥉'];

  return (
    <motion.div
      className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-gold/15 to-gold/5 border border-gold/30 backdrop-blur"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Medal or Rank */}
          {isTopThree ? (
            <motion.div
              className="text-6xl"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {medalEmojis[entry.rank - 1]}
            </motion.div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-gold/20 border-2 border-gold/40 flex items-center justify-center">
              <span className="text-2xl font-bold text-gold">#{entry.rank}</span>
            </div>
          )}

          {/* Info */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Your Rank</p>
            <p className="text-2xl font-bold text-white mt-1">
              {isTopThree ? `#${entry.rank} 🎉` : `#${entry.rank}`}
            </p>
            <p className="text-sm text-slate-300 mt-1">Level {entry.userLevel}</p>
          </div>
        </div>

        {/* XP Display */}
        <motion.div
          className="text-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-3xl font-bold text-gold">{entry.totalXP.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">Total XP</p>
        </motion.div>
      </div>

      {/* Top 3 Message */}
      {isTopThree && (
        <motion.div
          className="mt-4 p-3 rounded-lg bg-white/5 border border-gold/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-gold font-semibold">
            {entry.rank === 1
              ? '🌟 You\'re on top! Keep the momentum going!'
              : '🚀 Amazing! You\'re in the top 3!'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
