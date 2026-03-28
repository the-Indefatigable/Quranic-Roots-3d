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

  return (
    <div
      className="w-full rounded-2xl px-5 py-4 text-center"
      style={{
        backgroundColor: isLocked ? '#1E293B' : unit.color + '15',
        borderLeft: `4px solid ${isLocked ? '#334155' : unit.color}`,
      }}
    >
      <div className="flex items-center justify-center gap-3">
        <span className="text-2xl">{isLocked ? '🔒' : unit.iconEmoji}</span>
        <div>
          <h3
            className="font-bold text-base"
            style={{ color: isLocked ? '#64748B' : '#FFFFFF' }}
          >
            {unit.title}
          </h3>
          {unit.titleAr && (
            <p
              className="text-sm font-arabic"
              style={{ color: isLocked ? '#475569' : unit.color }}
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
        <p className="text-xs text-white/40 mt-1">{unit.description}</p>
      )}
    </div>
  );
}
