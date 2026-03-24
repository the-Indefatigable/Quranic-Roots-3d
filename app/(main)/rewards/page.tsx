'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface Stats {
  totalSessions: number;
  totalCorrect: number;
  totalAttempts: number;
  avgAccuracy: number;
  totalXP: number;
  levelInfo: UserLevelInfo;
  achievements: Achievement[];
}

export default function RewardsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
      const response = await fetch('/api/quiz/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin">
          <svg className="w-8 h-8 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    );
  }

  const unlockedAchievements = stats.achievements.filter((a) => a.unlockedAt);
  const lockedAchievements = stats.achievements.filter((a) => !a.unlockedAt);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-bold text-white mb-2">🏆 Your Rewards</h1>
        <p className="text-slate-400">Track your progress and achievements</p>
      </motion.div>

      {/* User Level Card */}
      <motion.div
        className="p-8 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-gold/20 backdrop-blur"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Level Badge */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
            <UserLevel
              level={stats.levelInfo.level}
              totalXP={stats.levelInfo.totalXP}
              levelProgress={stats.levelInfo.levelProgress}
              xpToNextLevel={stats.levelInfo.xpToNextLevel}
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
                className="p-4 rounded-xl bg-slate-700/30 border border-slate-600/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
              >
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
                <p className="text-2xl font-bold text-gold">{stat.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div className="flex gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        {['overview', 'achievements', 'leaderboard'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedTab === tab
                ? 'bg-gold/20 border border-gold/40 text-gold'
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'overview' && '📊 Overview'}
            {tab === 'achievements' && '🎯 Achievements'}
            {tab === 'leaderboard' && '🥇 Leaderboard'}
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
              { label: 'Total Attempts', value: stats.totalAttempts, unit: '' },
              { label: 'Correct Answers', value: stats.totalCorrect, unit: '' },
              { label: 'Total XP', value: stats.totalXP.toLocaleString(), unit: '' },
              { label: 'Level', value: stats.levelInfo.level, unit: '' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
              >
                <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gold mt-2">
                  {stat.value}
                  {stat.unit && <span className="text-sm ml-1">{stat.unit}</span>}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Recent Achievements */}
          {unlockedAchievements.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <h3 className="text-xl font-bold text-white mb-4">Recent Achievements</h3>
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
          {/* Unlocked */}
          {unlockedAchievements.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <h3 className="text-lg font-bold text-white mb-4">
                ✅ Unlocked ({unlockedAchievements.length})
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
              <h3 className="text-lg font-bold text-slate-400 mb-4">
                🔒 Locked ({lockedAchievements.length})
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
