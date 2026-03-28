'use client';

import type { PathUnit } from './LearningPath';

const CROWN_LABELS = ['', 'Bronze', 'Silver', 'Gold', 'Legendary'];
const CROWN_COLORS = ['', '#CD7F32', '#C0C0C0', '#FFD700', '#9B59B6'];

interface UnitHeaderProps {
  unit: PathUnit;
}

export function UnitHeader({ unit }: UnitHeaderProps) {
  const crown = unit.progress.crownLevel;
  const isLocked = unit.progress.status === 'locked';
  const totalLessons = unit.lessons.length;
  const completedLessons = unit.lessons.filter(
    (l) => l.progress.status === 'completed'
  ).length;
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <div
      className="w-full bg-surface shadow-card rounded-2xl p-5"
      style={{
        borderLeft: `4px solid ${isLocked ? '#D6D3D1' : unit.color}`,
      }}
    >
      <div className="flex items-center gap-3">
        <span className={`text-2xl ${isLocked ? 'opacity-40' : ''}`}>
          {isLocked ? '🔒' : unit.iconEmoji}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-text-tertiary text-xs uppercase tracking-widest mb-0.5">
            Unit {unit.sortOrder}
          </p>
          <h3
            className={`font-heading text-lg leading-tight ${
              isLocked ? 'text-text-tertiary' : 'text-text'
            }`}
          >
            {unit.title}
          </h3>
          {unit.titleAr && (
            <p
              className={`text-sm font-arabic mt-0.5 ${isLocked ? 'text-text-tertiary' : ''}`}
              style={!isLocked ? { color: unit.color } : undefined}
            >
              {unit.titleAr}
            </p>
          )}
        </div>
        {crown > 0 && (
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{
              backgroundColor: CROWN_COLORS[crown] + '20',
              color: CROWN_COLORS[crown],
            }}
          >
            {CROWN_LABELS[crown]}
          </span>
        )}
      </div>

      {unit.description && !isLocked && (
        <p className="text-xs text-text-tertiary mt-2">{unit.description}</p>
      )}

      {/* Progress bar */}
      <div className="mt-3 h-1 bg-border/30 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: isLocked ? '#D6D3D1' : unit.color,
          }}
        />
      </div>
      {!isLocked && (
        <p className="text-[10px] text-text-tertiary mt-1">
          {completedLessons}/{totalLessons} lessons
        </p>
      )}
    </div>
  );
}
