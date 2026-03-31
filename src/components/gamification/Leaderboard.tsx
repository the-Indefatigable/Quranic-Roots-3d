'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { LeaderboardRow } from './LeaderboardRow';
import { MyRank } from './MyRank';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  totalXP: number;
  userLevel: number;
}

interface LeaderboardProps {
  period: 'all_time' | 'weekly' | 'monthly';
  currentUserId: string;
}

export function Leaderboard({ period, currentUserId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, currentUserId]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/leaderboards/${period}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');

      const data = await response.json();
      setEntries(data.entries || []);
      setMyRank(data.myRank || null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const periodLabel = {
    all_time: 'All Time',
    weekly: 'This Week',
    monthly: 'This Month',
  }[period];

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-heading text-text mb-2">Leaderboard</h2>
        <p className="text-sm text-text-secondary">{periodLabel} Rankings</p>
      </div>

      {/* My Rank Card */}
      {myRank && <MyRank entry={myRank} />}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block">
            <div className="animate-spin">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-text-tertiary mt-3">Loading leaderboard...</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-wrong-light border border-wrong/20 rounded-xl p-4 text-wrong text-sm text-center">
          {error}
        </div>
      )}

      {/* Leaderboard Entries */}
      {!isLoading && !error && entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry, idx) => (
            <motion.div
              key={`${entry.userId}-${idx}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <LeaderboardRow
                entry={entry}
                isCurrentUser={entry.userId === currentUserId}
                isMedal={idx < 3}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && entries.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-tertiary">No data available yet</p>
        </div>
      )}
    </motion.div>
  );
}
