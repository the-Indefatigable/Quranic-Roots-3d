'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

// A gentle "your streak is at risk" banner — loss aversion is the single
// strongest retention mechanic. Shows once per day for signed-in users who have
// a streak but haven't studied yet today.
const KEY = 'streak_guard_snoozed';

export function StreakGuard() {
  const pathname = usePathname();
  const { user, isLoading } = useAuthStore();
  const [state, setState] = useState<{ currentStreak: number; freezes: number } | null>(null);

  useEffect(() => {
    if (isLoading || !user) return;
    // Don't interrupt an active lesson/quiz, and only nag once per day.
    if (pathname?.startsWith('/lesson') || pathname?.startsWith('/quiz/')) return;
    try {
      if (localStorage.getItem(KEY) === new Date().toISOString().slice(0, 10)) return;
    } catch { /* ignore */ }

    let cancelled = false;
    fetch('/api/streak/status')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.atRisk) setState({ currentStreak: d.currentStreak, freezes: d.freezes });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user, isLoading, pathname]);

  const dismiss = () => {
    try { localStorage.setItem(KEY, new Date().toISOString().slice(0, 10)); } catch { /* ignore */ }
    setState(null);
  };

  if (pathname?.startsWith('/lesson') || pathname?.startsWith('/quiz/')) return null;

  return (
    <AnimatePresence>
      {state && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed z-[60] left-3 right-3 top-3 lg:left-auto lg:right-6 lg:max-w-sm"
          role="alert"
        >
          <div className="rounded-2xl border p-4 shadow-xl flex items-start gap-3"
            style={{ background: 'var(--color-surface)', borderColor: 'var(--color-primary)' }}>
            <span className="text-2xl leading-none">🔥</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text">
                Your {state.currentStreak}-day streak is at risk!
              </p>
              <p className="text-xs text-text-secondary mt-0.5">
                {state.freezes > 0
                  ? `Do one lesson today to keep it — or your streak freeze (${state.freezes}) will save it.`
                  : 'Do one quick lesson or your Daily Ayah today to keep it alive.'}
              </p>
              <div className="flex gap-2 mt-2.5">
                <Link href="/daily" onClick={dismiss} className="px-3 py-1.5 rounded-lg text-xs font-semibold" style={{ background: 'var(--color-primary)', color: '#1a1206' }}>
                  Keep my streak
                </Link>
                <button onClick={dismiss} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-tertiary">Later</button>
              </div>
            </div>
            <button onClick={dismiss} aria-label="Dismiss" className="text-text-tertiary hover:text-text-secondary text-lg leading-none -mt-1 px-1">×</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
