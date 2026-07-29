'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

// A centered, once-per-day invitation for signed-out visitors to create a free
// account. Shown after a short browse, dismissible with the ✕, and never shown
// again the same calendar day.
const SEEN_KEY = 'signup_modal_seen_on';
const SHOW_DELAY_MS = 12_000;

function today() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (local-ish, stable per day)
}

const BENEFITS = [
  'Save your streak, XP, and progress',
  'A learning path tailored to you',
  'The weekly digest — a new ayah every Friday',
];

export function SignupModal() {
  const pathname = usePathname();
  const { user, isLoading, showLoginModal, setShowLoginModal } = useAuthStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isLoading || user) return; // signed-in users never see it
    if (pathname?.startsWith('/lesson') || pathname?.startsWith('/quiz/')) return;
    try {
      if (localStorage.getItem(SEEN_KEY) === today()) return; // already shown today
    } catch { /* ignore */ }

    const t = setTimeout(() => {
      setVisible(true);
      try { localStorage.setItem(SEEN_KEY, today()); } catch { /* ignore */ }
    }, SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, [user, isLoading, pathname]);

  // If they open the login modal from elsewhere, get out of the way.
  useEffect(() => { if (showLoginModal) setVisible(false); }, [showLoginModal]);

  const close = () => setVisible(false);
  const createAccount = () => {
    setVisible(false);
    setShowLoginModal(true);
  };

  return (
    <AnimatePresence>
      {visible && !user && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            className="absolute inset-0" style={{ background: 'rgba(10,9,7,0.72)', backdropFilter: 'blur(6px)' }}
            onClick={close}
          />
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden"
            style={{ background: '#181510', border: '1px solid rgba(212,162,70,0.2)', boxShadow: '0 24px 70px rgba(0,0,0,0.5)' }}
            role="dialog" aria-modal="true" aria-label="Create a free account"
          >
            {/* Close */}
            <button
              onClick={close}
              aria-label="Close"
              className="absolute top-3.5 right-3.5 w-9 h-9 flex items-center justify-center rounded-xl z-10"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#A09F9B' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
            </button>

            <div className="px-7 pt-9 pb-7 text-center">
              {/* Ambient glow */}
              <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(212,162,70,0.12) 0%, transparent 70%)' }} />

              <div className="relative">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{ background: 'rgba(212,162,70,0.14)', color: '#D4A246' }}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>

                <h2 className="font-heading text-2xl mb-2" style={{ color: '#F0E8D8' }}>Keep your progress</h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#A09F9B' }}>
                  QuRoots is free. Create an account to save everything and learn a little every day.
                </p>

                <ul className="text-left space-y-2.5 mb-7">
                  {BENEFITS.map((b) => (
                    <li key={b} className="flex items-start gap-2.5">
                      <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: '#D4A246' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      <span className="text-sm" style={{ color: '#D6CDBB' }}>{b}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={createAccount}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold transition-transform hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #D4A246, #C89535)', color: '#0E0D0C', boxShadow: '0 4px 20px rgba(212,162,70,0.3)' }}
                >
                  Create your free account
                </button>
                <button onClick={close} className="mt-3 text-xs font-medium" style={{ color: '#78716C' }}>
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
