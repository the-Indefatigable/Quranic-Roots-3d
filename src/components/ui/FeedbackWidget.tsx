'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

const CATEGORIES = [
  { id: 'suggestion', label: '💡 Suggestion' },
  { id: 'content', label: '📖 Content request' },
  { id: 'bug', label: '🐛 Something broke' },
  { id: 'other', label: '💬 Other' },
] as const;

/**
 * Floating feedback button (bottom-right). Opens a small panel where
 * signed-in users send suggestions / bug reports / content requests
 * straight to the admin dashboard at /admin/feedback.
 */
export function FeedbackWidget() {
  const pathname = usePathname();
  const { user, setShowLoginModal } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]['id']>('suggestion');
  const [body, setBody] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  // Hide inside lessons/quizzes — don't overlap the answer buttons
  if (pathname.startsWith('/lesson') || pathname.startsWith('/quiz/')) return null;

  const send = async () => {
    if (!body.trim() || state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, body: body.trim(), page: pathname }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Could not send.');
        setState('error');
        return;
      }
      setState('sent');
      setBody('');
      setTimeout(() => {
        setOpen(false);
        setState('idle');
      }, 1800);
    } catch {
      setErrorMsg('Could not send. Check your connection.');
      setState('error');
    }
  };

  return (
    <>
      {/* Launcher button — above BottomNav on mobile, corner on desktop */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Send feedback"
        className="fixed z-40 right-4 bottom-[calc(env(safe-area-inset-bottom)+92px)] lg:bottom-6 lg:right-6 flex items-center justify-center w-11 h-11 rounded-full transition-transform hover:scale-105 active:scale-95"
        style={{
          background: 'var(--color-nav-glass)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--color-nav-border)',
          boxShadow: 'var(--shadow-nav)',
          color: 'var(--color-primary)',
        }}
      >
        {open ? (
          <svg className="w-4.5 h-4.5 w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
          </svg>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed z-40 right-4 bottom-[calc(env(safe-area-inset-bottom)+148px)] lg:bottom-20 lg:right-6 w-[calc(100vw-2rem)] max-w-sm rounded-2xl p-4"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border-light)',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            {!user ? (
              <div className="text-center py-4">
                <p className="text-sm text-text-secondary mb-3">Sign in to send feedback</p>
                <button
                  onClick={() => { setOpen(false); setShowLoginModal(true); }}
                  className="px-5 py-2 rounded-xl text-sm font-semibold"
                  style={{ background: 'var(--color-primary)', color: '#1a1206' }}
                >
                  Sign in
                </button>
              </div>
            ) : state === 'sent' ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🤍</div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                  JazakAllah khair — received!
                </p>
                <p className="text-xs mt-1 text-text-tertiary">Your idea goes straight to the builder.</p>
              </div>
            ) : (
              <>
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
                  Help shape QuRoots
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setCategory(c.id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={
                        category === c.id
                          ? { background: 'rgba(212,162,70,0.16)', color: 'var(--color-primary)', border: '1px solid rgba(212,162,70,0.4)' }
                          : { background: 'var(--color-canvas)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-light)' }
                      }
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
                <textarea
                  value={body}
                  onChange={(e) => { setBody(e.target.value); if (state === 'error') setState('idle'); }}
                  rows={3}
                  maxLength={2000}
                  placeholder={
                    category === 'content'
                      ? 'Which surah, topic, or grammar should we teach next?'
                      : category === 'bug'
                        ? 'What went wrong, and where?'
                        : 'What would make QuRoots better for you?'
                  }
                  className="w-full resize-none rounded-xl px-3 py-2.5 text-sm outline-none mb-2"
                  style={{
                    background: 'var(--color-canvas)',
                    border: '1px solid var(--color-border-light)',
                    color: 'var(--color-text)',
                  }}
                />
                {state === 'error' && (
                  <p className="text-xs mb-2" style={{ color: 'var(--color-wrong)' }}>{errorMsg}</p>
                )}
                <button
                  onClick={send}
                  disabled={state === 'sending' || !body.trim()}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                  style={{ background: 'var(--color-primary)', color: '#1a1206' }}
                >
                  {state === 'sending' ? 'Sending…' : 'Send feedback'}
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
