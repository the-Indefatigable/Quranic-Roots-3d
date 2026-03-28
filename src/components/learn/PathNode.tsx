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

  // Colors based on state
  const nodeColor = isLocked
    ? '#334155'
    : isLegendary
    ? '#9B59B6'
    : isCompleted
    ? unit.color
    : isAvailable
    ? unit.color
    : '#334155';

  const bgColor = isLocked
    ? '#1E293B'
    : isCompleted
    ? nodeColor + '20'
    : isAvailable
    ? nodeColor + '30'
    : '#1E293B';

  const content = (
    <div className="flex flex-col items-center gap-1.5">
      {/* Node circle */}
      <div className="relative">
        <motion.div
          className="w-16 h-16 rounded-full flex items-center justify-center border-4 relative"
          style={{
            borderColor: nodeColor,
            backgroundColor: bgColor,
          }}
          animate={
            isAvailable
              ? { scale: [1, 1.08, 1], boxShadow: [`0 0 0px ${nodeColor}`, `0 0 20px ${nodeColor}80`, `0 0 0px ${nodeColor}`] }
              : {}
          }
          transition={isAvailable ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
        >
          {isLocked && (
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
          {isAvailable && (
            <svg className="w-7 h-7" fill={nodeColor} viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
          {isCompleted && crown && (
            <span className="text-2xl">{crown}</span>
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
          <div
            className="absolute -bottom-1 -right-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: nodeColor }}
          >
            +{lesson.xpReward}
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className="text-xs font-medium text-center max-w-[100px] leading-tight"
        style={{ color: isLocked ? '#475569' : '#E2E8F0' }}
      >
        {lesson.title}
      </span>
    </div>
  );

  if (isLocked) {
    return <div className="cursor-not-allowed opacity-60">{content}</div>;
  }

  return (
    <Link href={`/learn/lesson/${lesson.id}`} className="block hover:scale-105 transition-transform">
      {content}
    </Link>
  );
}
