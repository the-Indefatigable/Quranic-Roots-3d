'use client';

import { motion } from 'framer-motion';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalXP: number;
  userLevel: number;
}

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  isMedal?: boolean;
}

const medalEmojis = ['🥇', '🥈', '🥉'];

export function LeaderboardRow({ entry, isCurrentUser = false, isMedal = false }: LeaderboardRowProps) {
  const getMedalColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30';
    if (rank === 2) return 'from-gray-400/20 to-gray-500/20 border-gray-400/30';
    if (rank === 3) return 'from-orange-600/20 to-orange-700/20 border-orange-600/30';
    return 'from-slate-700/20 to-slate-800/20 border-slate-600/20';
  };

  const getMedalGlow = (rank: number) => {
    if (rank === 1) return 'shadow-[0_0_20px_rgba(234,179,8,0.3)]';
    if (rank === 2) return 'shadow-[0_0_20px_rgba(168,162,158,0.3)]';
    if (rank === 3) return 'shadow-[0_0_20px_rgba(249,115,22,0.3)]';
    return '';
  };

  return (
    <motion.div
      className={`relative group p-4 rounded-xl border transition-all ${
        isCurrentUser
          ? `bg-gradient-to-r ${getMedalColor(entry.rank)} ${getMedalGlow(entry.rank)} border-gold/40`
          : `bg-gradient-to-r ${getMedalColor(entry.rank)} hover:border-slate-500/40`
      }`}
      whileHover={{ scale: isCurrentUser ? 1.02 : 1.01 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="flex items-center gap-4">
        {/* Rank */}
        <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
          {isMedal && entry.rank <= 3 ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-3xl"
            >
              {medalEmojis[entry.rank - 1]}
            </motion.div>
          ) : (
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-slate-700/50 border border-slate-600/50">
              <span className="text-lg font-bold text-slate-300">#{entry.rank}</span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-bold text-white truncate">{entry.userName}</p>
            {isCurrentUser && (
              <span className="text-xs px-2 py-0.5 bg-gold/20 border border-gold/30 text-gold rounded-full">
                You
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400">Level {entry.userLevel}</p>
        </div>

        {/* XP */}
        <div className="flex-shrink-0 text-right">
          <p className="text-lg font-bold text-gold">{entry.totalXP.toLocaleString()}</p>
          <p className="text-xs text-slate-400">XP</p>
        </div>
      </div>

      {/* Current User Highlight */}
      {isCurrentUser && (
        <motion.div
          className="absolute inset-0 rounded-xl border border-gold/40 pointer-events-none"
          animate={{
            boxShadow: [
              '0 0 0 0 rgba(232, 184, 109, 0.3)',
              '0 0 0 8px rgba(232, 184, 109, 0)',
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      )}
    </motion.div>
  );
}
