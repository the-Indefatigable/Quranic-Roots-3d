'use client';

import { motion } from 'framer-motion';
import type { PathUnit } from './LearningPath';

// Eastern Arabic numerals
const EASTERN = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const toEastern = (n: number) => String(n).split('').map(d => EASTERN[+d]).join('');

const CROWN_LABELS = ['', 'Bronze', 'Silver', 'Gold', 'Legendary'];
const CROWN_COLORS = ['', '#CD7F32', '#C0C0C0', '#FFD700', '#9B59B6'];

interface UnitHeaderProps {
  unit: PathUnit;
  unitIndex: number;
}

export function UnitHeader({ unit, unitIndex }: UnitHeaderProps) {
  const crown = unit.progress.crownLevel;
  const isLocked = unit.progress.status === 'locked';
  const totalLessons = unit.lessons.length;
  const completedLessons = unit.lessons.filter(
    (l) => l.progress.status === 'completed'
  ).length;
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  const color = isLocked ? '#57534E' : unit.color;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}10 0%, ${color}05 100%)`,
        border: `1px solid ${color}18`,
        opacity: isLocked ? 0.5 : 1,
      }}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ background: `linear-gradient(to bottom, ${color}, ${color}30)` }}
      />

      <div className="flex items-center justify-between px-6 py-5 pl-9">
        <div className="flex-1 pr-3 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
              style={{ background: `${color}18`, color }}
            >
              Unit {toEastern(unitIndex + 1)}
            </span>
            <span className="text-[#3D3C3A] text-[10px]">
              {totalLessons} lessons
            </span>
            {crown > 0 && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: CROWN_COLORS[crown] + '20',
                  color: CROWN_COLORS[crown],
                }}
              >
                {CROWN_LABELS[crown]}
              </span>
            )}
          </div>
          <h2 className="text-[#EDEDEC] font-semibold text-base leading-snug mb-1">
            {isLocked ? '🔒 ' : ''}{unit.title}
          </h2>
          {unit.description && !isLocked && (
            <p className="text-[#57534E] text-[11px] leading-relaxed line-clamp-2">
              {unit.description}
            </p>
          )}

          {/* Progress bar */}
          {!isLocked && (
            <div className="mt-3">
              <div className="h-1 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%`, backgroundColor: color }}
                />
              </div>
              <p className="text-[10px] text-[#3D3C3A] mt-1">
                {completedLessons}/{totalLessons} completed
              </p>
            </div>
          )}
        </div>

        {/* Arabic title with glow */}
        {unit.titleAr && (
          <div
            className="font-arabic text-[2.2rem] leading-none flex-shrink-0"
            style={{
              color: isLocked ? '#3D3C3A' : color,
              textShadow: isLocked ? 'none' : `0 0 24px ${color}45`,
              opacity: isLocked ? 0.4 : 0.7,
            }}
          >
            {unit.titleAr}
          </div>
        )}
      </div>
    </motion.div>
  );
}
