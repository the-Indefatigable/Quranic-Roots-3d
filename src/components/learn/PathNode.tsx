'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import type { PathLesson, PathUnit } from './LearningPath';

// Eastern Arabic numerals
const EASTERN = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const toEastern = (n: number) => String(n).split('').map(d => EASTERN[+d]).join('');

// Octagon clip-path
const OCTAGON = 'polygon(29% 0%, 71% 0%, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0% 71%, 0% 29%)';

interface PathNodeProps {
  lesson: PathLesson;
  unit: PathUnit;
  lessonIndex: number;
  isCheckpoint?: boolean;
}

export function PathNode({ lesson, unit, lessonIndex, isCheckpoint }: PathNodeProps) {
  const status = lesson.progress.status;
  const isLocked = status === 'locked';
  const isAvailable = status === 'available' || status === 'in_progress';
  const isCompleted = status === 'completed';
  const isLegendary = lesson.lessonType === 'legendary';
  const score = lesson.progress.bestScore ?? lesson.progress.score;

  const color = unit.color;

  // Crown for completed lessons based on score
  const getCrown = () => {
    if (!isCompleted || score === null) return null;
    if (isLegendary) return '👑';
    if (score >= 95) return '⭐';
    if (score >= 80) return '🥇';
    if (score >= 60) return '🥈';
    return '🥉';
  };

  const crown = getCrown();

  // Node inner content
  const getInner = () => {
    if (isLocked) {
      return (
        <svg className="w-5 h-5" style={{ color: '#3D3C3A' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      );
    }
    if (isCheckpoint && !isCompleted) {
      return <span className="text-lg">🏰</span>;
    }
    if (isLegendary && !isCompleted) {
      return <span className="text-lg">💎</span>;
    }
    if (isCompleted) {
      return (
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    // Available — show lesson number in Eastern Arabic
    return (
      <span
        className="font-arabic text-lg font-bold leading-none select-none"
        style={{ color, textShadow: `0 0 10px ${color}90` }}
      >
        {toEastern(lessonIndex + 1)}
      </span>
    );
  };

  const nodeContent = (
    <div className="group flex flex-col items-center gap-2.5 py-1">
      {/* Crown badge above completed nodes */}
      {isCompleted && crown && (
        <div className="text-lg -mb-1">{crown}</div>
      )}

      {/* Octagonal node */}
      <div className="relative">
        {/* Outer ambient pulse ring */}
        {(isAvailable || isCompleted) && !isLocked && (
          <motion.div
            className="absolute inset-[-14px] z-0"
            style={{
              clipPath: OCTAGON,
              background: `radial-gradient(circle, ${color}${isAvailable ? '18' : '0d'} 0%, transparent 65%)`,
            }}
            animate={isAvailable ? { opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] } : {}}
            transition={isAvailable ? { duration: 3 + lessonIndex * 0.4, repeat: Infinity, ease: 'easeInOut' } : {}}
          />
        )}

        {/* Node face */}
        <motion.div
          className="relative z-10 w-[68px] h-[68px] flex items-center justify-center transition-all duration-300"
          style={{
            clipPath: OCTAGON,
            background: isLocked
              ? 'linear-gradient(145deg, rgba(61,60,58,0.15) 0%, rgba(61,60,58,0.08) 100%)'
              : isCompleted
              ? `linear-gradient(145deg, ${color} 0%, ${color}cc 100%)`
              : `linear-gradient(145deg, ${color}22 0%, ${color}0d 100%)`,
          }}
          whileHover={!isLocked ? { scale: 1.08 } : {}}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        >
          {/* Thin octagon border */}
          <div
            className="absolute inset-[2px]"
            style={{
              clipPath: OCTAGON,
              boxShadow: isLocked
                ? 'inset 0 0 0 1px rgba(61,60,58,0.25)'
                : `inset 0 0 0 1px ${color}35`,
            }}
          />
          {/* Inner accent octagon */}
          <div
            className="w-8 h-8 flex items-center justify-center"
            style={{
              clipPath: OCTAGON,
              background: isLocked
                ? 'rgba(61,60,58,0.10)'
                : isCompleted
                ? `${color}40`
                : `${color}15`,
            }}
          >
            {getInner()}
          </div>
        </motion.div>

        {/* XP badge */}
        {isAvailable && (
          <div
            className="absolute -bottom-1 -right-1 z-20 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: color, color: '#0E0D0C' }}
          >
            +{lesson.xpReward}
          </div>
        )}
      </div>

      {/* Lesson label */}
      <div className="text-center" style={{ maxWidth: '160px' }}>
        <p
          className="text-[13px] font-medium leading-snug mb-0.5 transition-colors"
          style={{ color: isLocked ? '#3D3C3A' : '#CCCBC8' }}
        >
          {lesson.title}
        </p>
        {!isLocked && (
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#3D3C3A]">
            <span style={{ color: `${color}70` }}>{lesson.xpReward} XP</span>
          </div>
        )}
      </div>
    </div>
  );

  if (isLocked) {
    return <div className="opacity-40 cursor-not-allowed">{nodeContent}</div>;
  }

  return (
    <Link href={`/lesson/${lesson.id}`} className="block focus:outline-none">
      {nodeContent}
    </Link>
  );
}
