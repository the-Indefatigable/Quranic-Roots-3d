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
  // Gold, silver and bronze discs instead of medal emoji.
const MEDALS = ['linear-gradient(145deg,#F3D07A,#B8863B)', 'linear-gradient(145deg,#E4E2DD,#9C9A95)', 'linear-gradient(145deg,#E0A776,#9A5F33)'];

  return (
    <motion.div
      className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary-light to-primary-light/50 border border-primary/30"
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
              <span className="w-16 h-16 text-[24px] rounded-full grid place-items-center font-bold" style={{ background: MEDALS[entry.rank - 1], color: '#1a1206' }}>{entry.rank}</span>
            </motion.div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-primary-light border-2 border-primary/40 flex items-center justify-center">
              <span className="text-2xl font-bold text-primary">#{entry.rank}</span>
            </div>
          )}

          {/* Info */}
          <div>
            <p className="text-xs text-text-tertiary uppercase tracking-wider">Your Rank</p>
            <p className="text-2xl font-bold text-text mt-1">
              {isTopThree ? `#${entry.rank}` : `#${entry.rank}`}
            </p>
            <p className="text-sm text-text-secondary mt-1">Level {entry.userLevel}</p>
          </div>
        </div>

        {/* XP Display */}
        <motion.div
          className="text-right"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <p className="text-3xl font-bold text-primary">{entry.totalXP.toLocaleString()}</p>
          <p className="text-xs text-text-tertiary mt-1">Total XP</p>
        </motion.div>
      </div>

      {/* Top 3 Message */}
      {isTopThree && (
        <motion.div
          className="mt-4 p-3 rounded-lg bg-primary-light border border-primary/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-sm text-primary font-semibold">
            {entry.rank === 1
              ? 'You\'re at the top. Keep going.'
              : 'You\'re in the top 3.'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
