'use client';

import { motion } from 'framer-motion';

interface AchievementBadgeProps {
  title: string;
  description?: string;
  category: 'milestone' | 'mastery' | 'streak' | 'speed';
  isUnlocked: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  animated?: boolean;
}

const categoryColors = {
  milestone: { from: '#E8B84B', to: '#D4A246' }, // Gold
  mastery: { from: '#E8B84B', to: '#D4A246' }, // Gold
  streak: { from: '#F97316', to: '#EA580C' }, // Orange
  speed: { from: '#06B6D4', to: '#0891B2' }, // Cyan
};

const sizeMap = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
};

const iconSizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

export function AchievementBadge({
  title,
  description,
  category,
  isUnlocked,
  size = 'md',
  onClick,
  animated = true,
}: AchievementBadgeProps) {
  const colors = categoryColors[category];

  return (
    <motion.div
      className="flex flex-col items-center gap-2 cursor-pointer"
      onClick={onClick}
      whileHover={isUnlocked ? { scale: 1.1 } : {}}
      whileTap={isUnlocked ? { scale: 0.95 } : {}}
      initial={animated && isUnlocked ? { scale: 0, opacity: 0 } : {}}
      animate={animated && isUnlocked ? { scale: 1, opacity: 1 } : {}}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    >
      {/* Badge Circle */}
      <div className={`${sizeMap[size]} relative flex items-center justify-center`}>
        {/* Background Gradient */}
        <div
          className={`absolute inset-0 rounded-full ${isUnlocked ? 'opacity-100' : 'opacity-30'} transition-opacity`}
          style={{
            background: `radial-gradient(circle at 30% 30%, ${colors.from}, ${colors.to})`,
            boxShadow: isUnlocked ? `0 0 24px ${colors.from}80` : 'none',
          }}
        />

        {/* Icon Container */}
        <div className="relative z-10 flex items-center justify-center">
          {getCategoryIcon(category, iconSizeMap[size], isUnlocked)}
        </div>

        {/* Unlock Glow */}
        {isUnlocked && (
          <motion.div
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: colors.from }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}

        {/* Lock Icon (if locked) */}
        {!isUnlocked && (
          <div className="absolute bottom-0 right-0 bg-slate-700 rounded-full p-1 border border-slate-600">
            <svg className="w-3 h-3 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Title & Description */}
      <div className="text-center">
        <p className={`text-xs font-bold tracking-wider ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
          {title}
        </p>
        {description && (
          <p className={`text-[10px] ${isUnlocked ? 'text-slate-300' : 'text-slate-600'}`}>
            {description}
          </p>
        )}
      </div>
    </motion.div>
  );
}

function getCategoryIcon(category: string, size: string, isUnlocked: boolean) {
  const color = isUnlocked ? '#FFFFFF' : '#64748B';

  switch (category) {
    case 'milestone':
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case 'mastery':
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.161 12.768 12 12 12c-.768 0-1.536.161-2.121.659m0 0a5.002 5.002 0 01-4.659-2.028m0 0A9 9 0 0112 3c4.97 0 9.185 3.223 10.654 7.585.232.642.356 1.322.356 2.032 0 3.314-2.686 6-6 6-.968 0-1.881-.236-2.667-.654m0 0a5.002 5.002 0 01-4.659-2.028m0 0A9.953 9.953 0 0112 21c-5.165 0-9.577-3.325-11.425-7.974"
          />
        </svg>
      );
    case 'streak':
      return (
        <svg className={size} fill={color} viewBox="0 0 24 24">
          <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
        </svg>
      );
    case 'speed':
      return (
        <svg className={size} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={color}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.05 4.18l2.84 2.84m-12.7 0L7.95 4.18M4.18 10.95l2.84-2.84m12.7 0l-2.84 2.84M12 2a10 10 0 100 20 10 10 0 000-20zm0 18a8 8 0 100-16 8 8 0 000 16zm-1-5h2v2h-2v-2zm0-6h2v4h-2V9z"
          />
        </svg>
      );
    default:
      return null;
  }
}
