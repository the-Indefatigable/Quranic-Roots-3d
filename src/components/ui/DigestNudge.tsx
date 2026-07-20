'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * A gentle, once-in-a-while prompt to opt into the weekly digest (the main
 * "subscriber" signal). Shows after the visitor has spent a little time on the
 * site, never on lesson/quiz screens, and never again once they subscribe or
 * dismiss (cooldown stored in localStorage).
 *
 * - Signed-in + not subscribed → one-click "Enable weekly digest"
 * - Signed-out → "Create a free account" (opens the login modal)
 * - Already subscribed → never shows
 */

const COOLDOWN_KEY = 'digest_nudge_until';
const COOLDOWN_DAYS = 14;
const SHOW_DELAY_MS = 25_000; // let them browse first

export function DigestNudge() {
  const pathname = usePathname();
  const { user, isLoading, setShowLoginModal } = useAuthStore();
  const [visible, setVisible] = useState(false);
  const [state, setState] = useState<'idle' | 'saving' | 'done'>('idle');

  const inCooldown = useCallback(() => {
    try {
      const until = Number(localStorage.getItem(COOLDOWN_KEY) || 0);
      return Date.now() < until;
    } catch {
      return false;
    }
  }, []);

  const snooze = useCallback(() => {
    try {
      localStorage.setItem(COOLDOWN_KEY, String(Date.now() + COOLDOWN_DAYS * 86_400_000));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (inCooldown()) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;

    const arm = () => {
      timer = setTimeout(() => {
        if (!cancelled) setVisible(true);
      }, SHOW_DELAY_MS);
    };

    if (user) {
      // Only prompt signed-in users who haven't already opted in.
      fetch('/api/digest/subscribe')
        .then((r) => (r.ok ? r.json() : { optIn: true }))
        .then((d) => {
          if (cancelled) return;
          if (d.optIn) snooze(); // already subscribed — never nag
          else arm();
        })
        .catch(() => {});
    } else {
      arm();
    }

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [user, isLoading, inCooldown, snooze]);

  // Don't cover the answer buttons in a lesson/quiz.
  if (pathname.startsWith('/lesson') || pathname.startsWith('/quiz/')) return null;

  const dismiss = () => {
    snooze();
    setVisible(false);
  };

  const enable = async () => {
    if (!user) {
      snooze();
      setVisible(false);
      setShowLoginModal(true);
      return;
    }
    setState('saving');
    try {
      const res = await fetch('/api/digest/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optIn: true }),
      });
      if (!res.ok) throw new Error();
      setState('done');
      snooze();
      setTimeout(() => setVisible(false), 2200);
    } catch {
      setState('idle');
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed z-[60] left-4 right-4 sm:left-6 sm:right-auto bottom-[calc(env(safe-area-inset-bottom)+96px)] lg:bottom-6 sm:max-w-sm"
          role="dialog"
          aria-label="Weekly digest invitation"
        >
          <div
            className="rounded-2xl border p-4 shadow-xl"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
            }}
          >
            {state === 'done' ? (
              <div className="flex items-center gap-3 py-1">
                <span className="text-2xl">✅</span>
                <p className="text-sm text-text">
                  You’re in! Your first digest lands <span className="text-primary font-semibold">Friday</span>. 📬
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <span className="text-2xl leading-none">📬</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text mb-0.5">
                      {user ? 'Get your weekly progress digest' : 'Save your progress & get the weekly digest'}
                    </p>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {user
                        ? 'Every Friday: your streak, XP, and a fresh ayah to master — one tap to turn it on.'
                        : 'Create a free account to keep your streak and receive a new ayah every Friday.'}
                    </p>
                  </div>
                  <button
                    onClick={dismiss}
                    aria-label="Dismiss"
                    className="text-text-tertiary hover:text-text-secondary text-lg leading-none -mt-1 -mr-1 px-1"
                  >
                    ×
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={enable}
                    disabled={state === 'saving'}
                    className="flex-1 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
                    style={{ background: 'var(--color-primary)', color: '#1a1206' }}
                  >
                    {state === 'saving' ? 'Enabling…' : user ? 'Enable digest' : 'Create free account'}
                  </button>
                  <button
                    onClick={dismiss}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-text-tertiary hover:text-text-secondary"
                  >
                    Not now
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
