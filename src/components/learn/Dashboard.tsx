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
        <div className="w-10 h-10 border-4 border-[#58CC02] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-white/50 mb-4">Sign in to see your dashboard</p>
        <Link href="/learn/path" className="text-[#1CB0F6] font-medium">Browse lessons</Link>
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
            <span className="font-bold text-[#FF9600]">{data.streak.current}</span>
          </div>
          {/* Gems */}
          <div className="flex items-center gap-1.5">
            <span className="text-xl">💎</span>
            <span className="font-bold text-[#1CB0F6]">{data.gems}</span>
          </div>
          {/* Hearts */}
          <div className="flex items-center gap-1">
            <span className="text-xl">❤️</span>
            <span className="font-bold text-[#FF4B4B]">{data.hearts}</span>
          </div>
        </div>
        {/* Level */}
        <div className="px-3 py-1 rounded-full bg-[#FFC800]/10 border border-[#FFC800]/30">
          <span className="text-sm font-bold text-[#FFC800]">Level {data.user.level}</span>
        </div>
      </div>

      {/* ── Continue Learning CTA ──────────────────── */}
      {data.nextLesson ? (
        <Link href={`/lesson/${data.nextLesson.lessonId}`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-5 rounded-2xl border-2 border-[#58CC02]/30 bg-[#58CC02]/5 hover:bg-[#58CC02]/10 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: data.nextLesson.unitColor + '20' }}
              >
                {data.nextLesson.unitEmoji}
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/40 mb-0.5">{data.nextLesson.unitTitle}</p>
                <p className="text-lg font-bold text-white">{data.nextLesson.lessonTitle}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[#58CC02] flex items-center justify-center shadow-[0_3px_0_#46a302]">
                <svg className="w-6 h-6 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </Link>
      ) : (
        <Link href="/learn/path">
          <div className="p-5 rounded-2xl border-2 border-white/10 bg-white/5 text-center cursor-pointer hover:bg-white/10 transition-colors">
            <span className="text-3xl mb-2 block">📚</span>
            <p className="text-white font-bold">Start Learning</p>
            <p className="text-sm text-white/40">Begin your Quranic Arabic journey</p>
          </div>
        </Link>
      )}

      {/* ── Daily Goal Ring ────────────────────────── */}
      <div className="flex items-center gap-5 p-5 rounded-2xl bg-white/5 border border-white/10">
        {/* SVG Ring */}
        <div className="relative w-20 h-20 shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
            <motion.circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke={data.dailyGoal.completed ? '#58CC02' : '#FFC800'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={220}
              initial={{ strokeDashoffset: 220 }}
              animate={{ strokeDashoffset: 220 - (220 * goalPercent) / 100 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{goalPercent}%</span>
          </div>
        </div>
        <div>
          <p className="font-bold text-white">
            {data.dailyGoal.completed ? '🎯 Goal Complete!' : 'Daily Goal'}
          </p>
          <p className="text-sm text-white/50">
            {data.dailyGoal.earnedXp} / {data.dailyGoal.targetXp} XP
          </p>
          <p className="text-xs text-white/30 mt-1">
            {data.dailyGoal.lessonsCompleted} lesson{data.dailyGoal.lessonsCompleted !== 1 ? 's' : ''} today
          </p>
        </div>
      </div>

      {/* ── Daily Quests ───────────────────────────── */}
      {data.quests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Daily Quests</h3>
          {data.quests.map((q) => (
            <div
              key={q.id}
              className={`flex items-center gap-3 p-3 rounded-xl border ${
                q.completed
                  ? 'border-[#58CC02]/30 bg-[#58CC02]/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="flex-1">
                <p className={`text-sm font-medium ${q.completed ? 'text-[#58CC02]' : 'text-white'}`}>
                  {q.completed ? '✓ ' : ''}{q.title}
                </p>
                <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (q.progress / q.target) * 100)}%`,
                      backgroundColor: q.completed ? '#58CC02' : '#1CB0F6',
                    }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#1CB0F6]">
                💎 {q.gemReward}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── League ─────────────────────────────────── */}
      {data.league && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-12 h-12 rounded-full bg-[#FFC800]/10 flex items-center justify-center">
            <span className="text-xl">🏆</span>
          </div>
          <div>
            <p className="font-bold text-white">{data.league.name} League</p>
            <p className="text-sm text-white/40">
              {data.league.rank ? `#${data.league.rank}` : 'Unranked'} · {data.league.weeklyXp} XP this week
            </p>
          </div>
        </div>
      )}

      {/* ── Quick Stats ────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-2xl font-bold text-white">{data.user.totalXP}</p>
          <p className="text-xs text-white/40">Total XP</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-2xl font-bold text-[#FF9600]">{data.streak.longest}</p>
          <p className="text-xs text-white/40">Best Streak</p>
        </div>
        <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-2xl font-bold text-white">{data.streak.freezes}</p>
          <p className="text-xs text-white/40">Freezes</p>
        </div>
      </div>

      {/* ── Bottom link to full path ───────────────── */}
      <Link
        href="/learn/path"
        className="block text-center py-3 text-[#1CB0F6] font-medium hover:underline"
      >
        View Learning Path →
      </Link>
    </div>
  );
}
