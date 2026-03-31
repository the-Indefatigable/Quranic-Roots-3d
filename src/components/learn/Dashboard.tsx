'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DashboardData {
  user: { name: string | null; level: number; totalXP: number };
  hearts: number;
  streak: { current: number; longest: number; freezes: number };
  gems: number;
  dailyGoal: { targetXp: number; earnedXp: number; completed: boolean; lessonsCompleted: number };
  quests: Array<{ id: string; type: string; title: string; target: number; progress: number; gemReward: number; completed: boolean }>;
  nextLesson: { lessonId: string; lessonTitle: string; unitTitle: string; unitColor: string; unitEmoji: string } | null;
  league: { tier: number; name: string; rank: number | null; weeklyXp: number } | null;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary mb-4">Sign in to see your dashboard</p>
        <Link href="/learn/path" className="text-primary font-medium">Browse lessons</Link>
      </div>
    );
  }

  const goalPercent = data.dailyGoal.targetXp > 0
    ? Math.min(100, Math.round((data.dailyGoal.earnedXp / data.dailyGoal.targetXp) * 100))
    : 0;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* ── Top Stats Bar ──────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Streak */}
          <div className="flex items-center gap-1.5">
            <span className="text-xl">🔥</span>
            <span className="font-bold text-accent">{data.streak.current}</span>
          </div>
          {/* Gems */}
          <div className="flex items-center gap-1.5">
            <span className="text-xl">💎</span>
            <span className="font-bold text-info">{data.gems}</span>
          </div>
          {/* Hearts */}
          <div className="flex items-center gap-1">
            <span className="text-xl">❤️</span>
            <span className="font-bold text-wrong">{data.hearts}</span>
          </div>
        </div>
        {/* Level */}
        <div className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30">
          <span className="text-sm font-bold text-accent">Level {data.user.level}</span>
        </div>
      </div>

      {/* ── Continue Learning CTA ──────────────────── */}
      {data.nextLesson ? (
        <Link href={`/lesson/${data.nextLesson.lessonId}`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-5 rounded-2xl bg-surface shadow-raised border border-primary/20 hover:border-primary/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: data.nextLesson.unitColor + '20' }}
              >
                {data.nextLesson.unitEmoji}
              </div>
              <div className="flex-1">
                <p className="text-xs text-text-tertiary mb-0.5">{data.nextLesson.unitTitle}</p>
                <p className="text-lg font-heading font-bold text-text">{data.nextLesson.lessonTitle}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-[0_3px_0_rgba(180,132,42,0.5)]">
                <svg className="w-6 h-6 text-[#0E0D0C] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </Link>
      ) : (
        <Link href="/learn/path">
          <div className="p-5 rounded-2xl bg-surface shadow-card border border-border text-center cursor-pointer hover:shadow-raised transition-shadow">
            <span className="text-3xl mb-2 block">📚</span>
            <p className="text-text font-heading font-bold">Start Learning</p>
            <p className="text-sm text-text-secondary">Begin your Quranic Arabic journey</p>
          </div>
        </Link>
      )}

      {/* ── Daily Goal Ring ────────────────────────── */}
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-surface shadow-card border border-border">
        {/* SVG Ring */}
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="35" fill="none" className="stroke-border" strokeWidth="6" />
            <motion.circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              className={data.dailyGoal.completed ? 'stroke-correct' : 'stroke-primary'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={220}
              initial={{ strokeDashoffset: 220 }}
              animate={{ strokeDashoffset: 220 - (220 * goalPercent) / 100 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-text">{goalPercent}%</span>
          </div>
        </div>
        <div>
          <p className="font-heading font-bold text-text">
            {data.dailyGoal.completed ? '🎯 Goal Complete!' : 'Daily Goal'}
          </p>
          <p className="text-sm text-text-secondary">
            {data.dailyGoal.earnedXp} / {data.dailyGoal.targetXp} XP
          </p>
          <p className="text-xs text-text-tertiary mt-1">
            {data.dailyGoal.lessonsCompleted} lesson{data.dailyGoal.lessonsCompleted !== 1 ? 's' : ''} today
          </p>
        </div>
      </div>

      {/* ── Daily Quests ───────────────────────────── */}
      {data.quests.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-heading text-sm font-bold text-text-secondary uppercase tracking-wider">Daily Quests</h3>
          {data.quests.map((q) => (
            <div
              key={q.id}
              className={`flex items-center gap-3 p-3 rounded-xl bg-surface shadow-card border ${
                q.completed
                  ? 'border-correct/30'
                  : 'border-border'
              }`}
            >
              <div className="flex-1">
                <p className={`text-sm font-medium ${q.completed ? 'text-correct' : 'text-text'}`}>
                  {q.completed ? '✓ ' : ''}{q.title}
                </p>
                <div className="mt-1 h-1.5 bg-border/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (q.progress / q.target) * 100)}%`,
                      backgroundColor: q.completed ? 'var(--color-correct)' : 'var(--color-primary)',
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-info">
                💎 {q.gemReward}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── League ─────────────────────────────────── */}
      {data.league && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface shadow-card border border-border">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <span className="text-xl">🏆</span>
          </div>
          <div>
            <p className="font-heading font-bold text-text">{data.league.name} League</p>
            <p className="text-sm text-text-secondary">
              {data.league.rank ? `#${data.league.rank}` : 'Unranked'} · {data.league.weeklyXp} XP this week
            </p>
          </div>
        </div>
      )}

      {/* ── Quick Stats ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { value: data.user.totalXP, label: 'Total XP', color: 'text-text' },
          { value: data.streak.longest, label: 'Best Streak', color: 'text-accent' },
          { value: data.streak.freezes, label: 'Freezes', color: 'text-text' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-3 rounded-xl bg-surface shadow-card border border-border-light">
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-text-secondary">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Bottom link to full path ───────────────── */}
      <Link
        href="/learn/path"
        className="block text-center py-3 text-primary font-medium hover:underline"
      >
        View Learning Path →
      </Link>
    </div>
  );
}
