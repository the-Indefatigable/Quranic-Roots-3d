'use client';

import Link from 'next/link';

const TABS = [
  { value: 'xp', label: 'Top XP', path: 'M11.48 3.5a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z' },
  { value: 'streak', label: 'Longest Streaks', path: 'M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.048 8.287 8.287 0 0 0 9 9.6a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z' },
];

export function LeaderboardTabs({ active }: { active: string }) {
  return (
    <div className="flex gap-2 mb-5">
      {TABS.map((t) => {
        const on = active === t.value;
        return (
          <Link
            key={t.value}
            href={`/leaderboard?sort=${t.value}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: on ? 'rgba(212,162,70,0.15)' : 'var(--color-surface)',
              color: on ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              border: `1px solid ${on ? 'rgba(212,162,70,0.4)' : 'var(--color-border-light)'}`,
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.6} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d={t.path} />
            </svg>
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
