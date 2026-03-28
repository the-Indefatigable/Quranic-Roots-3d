'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { PathLesson, PathUnit } from './LearningPath';

interface PathNodeProps {
  lesson: PathLesson;
  unit: PathUnit;
  isCheckpoint?: boolean;
}

export function PathNode({ lesson, unit, isCheckpoint }: PathNodeProps) {
  const status = lesson.progress.status;
  const isLocked = status === 'locked';
  const isAvailable = status === 'available' || status === 'in_progress';
  const isCompleted = status === 'completed';
  const isLegendary = lesson.lessonType === 'legendary';
  const score = lesson.progress.bestScore ?? lesson.progress.score;

  // Crown for completed lessons based on score
  const getCrown = () => {
    if (!isCompleted || score === null) return null;
    if (isLegendary) return '👑'; // purple legendary
    if (score >= 95) return '⭐';
    if (score >= 80) return '🥇';
    if (score >= 60) return '🥈';
    return '🥉';
  };

  const crown = getCrown();

  const content = (
    <div className="flex flex-col items-center gap-1.5">
      {/* Node circle */}
      <div className="relative">
        {/* Crown badge above completed nodes */}
        {isCompleted && crown && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-lg z-10">
            {crown}
          </div>
        )}

        <motion.div
          className={`w-16 h-16 rounded-full flex items-center justify-center border-4 relative ${
            isLocked
              ? 'border-stone-200 bg-stone-100'
              : isCompleted
              ? 'bg-primary border-primary'
              : isAvailable
              ? 'bg-surface border-primary'
              : 'border-stone-200 bg-stone-100'
          } ${isAvailable ? 'shadow-[0_0_20px_rgba(13,148,136,0.3)]' : ''}`}
          style={
            isCompleted
              ? { backgroundColor: unit.color, borderColor: unit.color }
              : undefined
          }
          animate={
            isAvailable
              ? { scale: [1, 1.06, 1] }
              : {}
          }
          transition={isAvailable ? { duration: 2.5, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          {isLocked && (
            <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
          {isAvailable && (
            <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
          {isCompleted && (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isCheckpoint && !isLocked && !isCompleted && (
            <span className="text-2xl">🏰</span>
          )}
          {isLegendary && !isCompleted && !isLocked && (
            <span className="text-xl">💎</span>
          )}
        </motion.div>

        {/* XP badge */}
        {isAvailable && (
          <div className="absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white bg-primary">
            +{lesson.xpReward}
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className={`text-xs font-medium text-center max-w-[100px] leading-tight ${
          isLocked ? 'text-text-secondary' : 'text-text'
        }`}
      >
        {lesson.title}
      </span>
    </div>
  );

  if (isLocked) {
    return <div className="cursor-not-allowed opacity-50">{content}</div>;
  }

  return (
    <Link href={`/lesson/${lesson.id}`} className="block hover:scale-105 transition-transform">
      {content}
    </Link>
  );
}
