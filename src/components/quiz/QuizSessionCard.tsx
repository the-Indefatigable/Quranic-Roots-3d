'use client';

import React, { useEffect, useState } from 'react';

interface QuizSessionCardProps {
  correctCount: number;
  totalCount: number;
  elapsedSeconds: number;
}

export function QuizSessionCard({ correctCount, totalCount, elapsedSeconds }: QuizSessionCardProps) {
  const [displayTime, setDisplayTime] = useState('0:00');

  useEffect(() => {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    setDisplayTime(`${minutes}:${seconds.toString().padStart(2, '0')}`);
  }, [elapsedSeconds]);

  const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-b from-background to-background/80 backdrop-blur-sm border-b border-border z-40">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Streak */}
        <div className="flex items-center gap-3">
          <div className="text-2xl">🔥</div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Streak</p>
            <p className="text-lg font-bold text-primary">{correctCount}</p>
          </div>
        </div>

        {/* Accuracy */}
        <div className="flex items-center gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Accuracy</p>
            <p className="text-lg font-bold text-blue-400">{accuracy}%</p>
          </div>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-3">
          <div className="text-2xl">⏱️</div>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-wide">Time</p>
            <p className="text-lg font-bold text-purple-400 font-mono">{displayTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
