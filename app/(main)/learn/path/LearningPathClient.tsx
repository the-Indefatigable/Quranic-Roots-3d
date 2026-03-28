'use client';

import { useEffect, useState } from 'react';
import { LearningPath, type PathUnit } from '@/components/learn/LearningPath';

export function LearningPathClient() {
  const [units, setUnits] = useState<PathUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/learn/path')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUnits(data.path || []);
        }
      })
      .catch((err) => {
        console.error('[LearningPath] fetch error:', err);
        setError(`Failed to load learning path: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-text-secondary text-sm">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-wrong mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <span className="text-5xl mb-4 block">📚</span>
          <h2 className="text-xl font-heading font-bold text-text mb-2">Lessons Coming Soon!</h2>
          <p className="text-text-secondary text-sm">
            We&apos;re building interactive Quranic Arabic lessons. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="text-center py-8 px-4">
        <h1 className="text-2xl font-heading font-bold text-text mb-1">Learn Quranic Arabic</h1>
        <p className="text-text-secondary text-sm">Master grammar step by step</p>
      </div>

      {/* Path */}
      <LearningPath units={units} />
    </div>
  );
}
