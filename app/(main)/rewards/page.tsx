'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { UserLevel } from '@/components/gamification/UserLevel';
import { AchievementBadge } from '@/components/gamification/AchievementBadge';
import { Leaderboard } from '@/components/gamification/Leaderboard';
import { motion } from 'framer-motion';

interface UserLevelInfo {
  level: number;
  totalXP: number;
  levelProgress: number;
  xpToNextLevel: number;
  nextLevelThreshold: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  category: string;
  xpBonus: number | null;
  unlockedAt: string | null;
}

interface MasteryBreakdown {
  roots: { learned: number; total: number; avgMastery: number };
  nouns: { learned: number; total: number; avgMastery: number };
  particles: { learned: number; total: number; avgMastery: number };
}

interface Stats {
  totalSessions: number;
  totalCorrect: number;
  totalAttempts: number;
  avgAccuracy: number;
  totalXP: number;
  levelInfo: UserLevelInfo;
  achievements: Achievement[];
  masteryBreakdown: MasteryBreakdown;
  totalLearned: number;
}

const DEFAULT_LEVEL: UserLevelInfo = {
  level: 1,
  totalXP: 0,
  levelProgress: 0,
  xpToNextLevel: 100,
  nextLevelThreshold: 100,
};

export default function RewardsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'achievements' | 'leaderboard'>('overview');

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/');
      return;
    }

    fetchStats();
  }, [user, authLoading, router]);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(false);
      const response = await fetch('/api/quiz/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="text-4xl mb-4">📊</div>
        <h2 className="text-xl font-bold text-text mb-2">No progress yet</h2>
        <p className="text-text-tertiary text-sm mb-6 max-w-md">
          Take your first quiz to start tracking your progress, earning XP, and unlocking achievements.
        </p>
        <Link
          href="/quiz"
          className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:brightness-110 transition-all"
        >
          Start a Quiz
        </Link>
      </div>
    );
  }

  const levelInfo = stats.levelInfo ?? DEFAULT_LEVEL;
  const achievementsList = stats.achievements ?? [];
  const unlockedAchievements = achievementsList.filter((a) => a.unlockedAt);
  const lockedAchievements = achievementsList.filter((a) => !a.unlockedAt);
  const mastery = stats.masteryBreakdown;
  const isNewUser = stats.totalSessions === 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-text mb-2">Your Rewards</h1>
        <p className="text-text-secondary">Track your progress and achievements</p>
      </motion.div>

      {/* User Level Card */}
      <motion.div
        className="p-8 rounded-3xl bg-surface border border-border backdrop-blur"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Level Badge */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
            <UserLevel
              level={levelInfo.level}
              totalXP={levelInfo.totalXP}
              levelProgress={levelInfo.levelProgress}
              xpToNextLevel={levelInfo.xpToNextLevel}
              size="lg"
              showDetails={true}
            />
          </motion.div>

          {/* Stats Grid */}
          <div className="md:col-span-2 grid grid-cols-3 gap-4">
            {[
              { label: 'Quizzes', value: stats.totalSessions },
              { label: 'Accuracy', value: `${stats.avgAccuracy}%` },
              { label: 'Unlocked', value: unlockedAchievements.length },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="p-4 rounded-xl bg-surface border border-border"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <p className="text-xs text-text-secondary uppercase tracking-wider mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Mastery Breakdown */}
      {mastery && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {[
            { label: 'Roots', data: mastery.roots, href: '/quiz?type=conjugation' },
            { label: 'Nouns', data: mastery.nouns, href: '/quiz?type=noun' },
            { label: 'Particles', data: mastery.particles, href: '/quiz?type=particle' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="p-5 rounded-2xl bg-surface border border-border hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-text">{item.label}</p>
                <span className="text-xs text-text-tertiary group-hover:text-primary/60 transition-colors">Practice</span>
              </div>
              <p className="text-3xl font-bold text-primary">{item.data.learned}</p>
              <p className="text-xs text-text-tertiary mt-1">
                {item.data.learned === 0 ? 'None learned yet' : `of ${item.data.total} studied`}
              </p>
              {item.data.total > 0 && (
                <div className="mt-3 h-1.5 bg-border-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full transition-all"
                    style={{ width: `${Math.min((item.data.learned / Math.max(item.data.total, 1)) * 100, 100)}%` }}
                  />
                </div>
              )}
            </Link>
          ))}
        </motion.div>
      )}

      {/* New user CTA */}
      {isNewUser && (
        <motion.div
          className="p-6 rounded-2xl bg-primary-light border border-primary/20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <p className="text-text-secondary text-sm mb-4">
            Start quizzing to learn roots, nouns, and particles. The spaced repetition system will track your mastery and bring back words you need to review.
          </p>
          <Link
            href="/quiz"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:brightness-110 transition-all"
          >
            Take Your First Quiz
          </Link>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <motion.div className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {['overview', 'achievements', 'leaderboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTab === tab
                ? 'bg-primary/10 border border-primary/30 text-primary'
                : 'bg-surface border border-border text-text-secondary hover:text-text'
            }`}
          >
            {tab === 'overview' && 'Overview'}
            {tab === 'achievements' && 'Achievements'}
            {tab === 'leaderboard' && 'Leaderboard'}
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Quick Stats */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {[
              { label: 'Total Attempts', value: stats.totalAttempts },
              { label: 'Correct Answers', value: stats.totalCorrect },
              { label: 'Total XP', value: stats.totalXP.toLocaleString() },
              { label: 'Level', value: levelInfo.level },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="p-4 rounded-xl bg-surface border border-border"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
              >
                <p className="text-xs text-text-secondary uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-primary mt-2">{stat.value}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Achievements */}
          {unlockedAchievements.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h3 className="text-xl font-bold text-text mb-4">Recent Achievements</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {unlockedAchievements.slice(0, 8).map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.05 }}
                  >
                    <AchievementBadge
                      title={achievement.title}
                      description={achievement.description || undefined}
                      category={achievement.category as any}
                      isUnlocked={true}
                      size="md"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {selectedTab === 'achievements' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {achievementsList.length === 0 && (
            <div className="text-center py-12 text-text-tertiary text-sm">
              No achievements available yet. Complete quizzes to start unlocking them.
            </div>
          )}

          {/* Unlocked */}
          {unlockedAchievements.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-lg font-bold text-text mb-4">
                Unlocked ({unlockedAchievements.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {unlockedAchievements.map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <AchievementBadge
                      title={achievement.title}
                      description={achievement.description || undefined}
                      category={achievement.category as any}
                      isUnlocked={true}
                      size="md"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Locked */}
          {lockedAchievements.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <h3 className="text-lg font-bold text-text-secondary mb-4">
                Locked ({lockedAchievements.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {lockedAchievements.map((achievement, idx) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + idx * 0.05 }}
                  >
                    <AchievementBadge
                      title={achievement.title}
                      description={achievement.description || undefined}
                      category={achievement.category as any}
                      isUnlocked={false}
                      size="md"
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {selectedTab === 'leaderboard' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {user && <Leaderboard period="all_time" currentUserId={user.id || ''} />}
        </motion.div>
      )}
    </div>
  );
}
