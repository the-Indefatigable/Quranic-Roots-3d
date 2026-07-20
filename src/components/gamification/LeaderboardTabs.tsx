'use client';

import Link from 'next/link';

const TABS = [
  { value: 'xp', label: '⭐ Top XP' },
  { value: 'streak', label: '🔥 Longest Streaks' },
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
            className="px-4 py-2 rounded-xl text-sm font-medium transition-colors"
            style={{
              background: on ? 'rgba(212,162,70,0.15)' : 'var(--color-surface)',
              color: on ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              border: `1px solid ${on ? 'rgba(212,162,70,0.4)' : 'var(--color-border-light)'}`,
            }}
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
