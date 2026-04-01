'use client';

import { motion } from 'framer-motion';

interface UserLevelProps {
  level: number;
  totalXP: number;
  levelProgress: number;
  xpToNextLevel: number;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const sizeMap = {
  sm: { badge: 'w-10 h-10', text: 'text-xs', number: 'text-sm' },
  md: { badge: 'w-14 h-14', text: 'text-sm', number: 'text-lg' },
  lg: { badge: 'w-20 h-20', text: 'text-base', number: 'text-2xl' },
};

export function UserLevel({
  level,
  totalXP,
  levelProgress,
  xpToNextLevel,
  size = 'md',
  showDetails = false,
}: UserLevelProps) {
  const sizes = sizeMap[size];
  const progressPercent = (levelProgress / (levelProgress + xpToNextLevel)) * 100;
  const nextLevelXP = levelProgress + xpToNextLevel;

  return (
    <div className="flex flex-col gap-3">
      {/* Level Badge */}
      <motion.div
        className={`${sizes.badge} relative flex items-center justify-center mx-auto`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {/* Badge Background - Gradient Circle */}
        <div
          className="absolute inset-0 rounded-full opacity-100"
          style={{
            background: `conic-gradient(from 0deg, #E8B84B, #D4A246, #E8B84B)`,
            boxShadow: `0 0 20px #D4A24640`,
          }}
        />

        {/* Badge Content */}
        <div className="relative z-10 flex flex-col items-center justify-center bg-slate-900 rounded-full w-full h-full border-2 border-primary/30">
          <span className={`${sizes.number} font-bold text-primary`}>{level}</span>
          <span className="text-[8px] text-primary/70 uppercase tracking-wider">lvl</span>
        </div>

        {/* Animated Ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-primary/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>

      {/* XP Progress Bar */}
      {showDetails && (
        <motion.div
          className="w-full flex flex-col gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-primary/60"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                boxShadow: '0 0 10px rgba(45, 212, 191, 0.4)',
              }}
            />
          </div>

          {/* XP Text */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">
              <span className="text-primary font-semibold">{levelProgress}</span>
              <span className="text-slate-600"> / </span>
              <span>{nextLevelXP}</span> XP
            </span>
            <span className="text-xs text-slate-500">Total: {totalXP} XP</span>
          </div>
        </motion.div>
      )}

      {/* Simple Version (no details) */}
      {!showDetails && (
        <div className="text-center">
          <p className={`${sizes.text} text-slate-300 font-medium`}>Level {level}</p>
        </div>
      )}
    </div>
  );
}
