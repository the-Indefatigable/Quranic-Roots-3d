'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

interface Card {
  reviewId: string;
  reps: number;
  wordAr: string;
  transliteration: string;
  english: string;
  wordType: string;
  quranicRef: string | null;
}

const TYPE_LABEL: Record<string, string> = { ism: 'Ism · Noun', feel: "Fi'l · Verb", harf: 'Harf · Particle' };

export default function WordReviewPage() {
  const { user, isLoading, setShowLoginModal } = useAuthStore();
  const [cards, setCards] = useState<Card[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [xp, setXp] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch('/api/review/due')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d?.cards) setCards(d.cards); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [user]);

  const grade = useCallback(async (g: 'again' | 'good' | 'easy') => {
    const card = cards[idx];
    if (!card || sending) return;
    setSending(true);
    try {
      const res = await fetch('/api/review/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId: card.reviewId, grade: g }),
      });
      const d = await res.json().catch(() => ({}));
      if (d.xpEarned) setXp((x) => x + d.xpEarned);
    } catch { /* keep going — scheduling is best-effort */ }
    setAnswered((a) => a + 1);
    setRevealed(false);
    setIdx((i) => i + 1);
    setSending(false);
  }, [cards, idx, sending]);

  if (!isLoading && !user) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <p className="text-text-secondary mb-4">Sign in to review your words</p>
        <button onClick={() => setShowLoginModal(true)} className="px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-primary)', color: '#1a1206' }}>Sign in</button>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const done = idx >= cards.length;
  const card = cards[idx];

  // ── Empty / complete states ─────────────────────────────
  if (cards.length === 0 || done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
          <span className="text-7xl block mb-5">{cards.length === 0 ? '✨' : '🎉'}</span>
        </motion.div>
        <h1 className="text-2xl font-heading mb-2" style={{ color: 'var(--color-ivory)' }}>
          {cards.length === 0 ? 'All caught up!' : 'Review complete!'}
        </h1>
        <p className="text-sm text-text-secondary mb-2">
          {cards.length === 0
            ? 'No words due right now. Complete lessons to grow your deck.'
            : `${answered} words reviewed${xp > 0 ? ` · +${xp} XP earned` : ''}`}
        </p>
        <p className="text-xs text-text-tertiary mb-8">Spaced repetition brings words back right before you'd forget them.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-primary)', color: '#1a1206' }}>Dashboard</Link>
          <Link href="/learn/path" className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border-light)' }}>Learn more words</Link>
        </div>
      </div>
    );
  }

  const progress = cards.length ? (idx / cards.length) * 100 : 0;

  return (
    <div className="max-w-lg mx-auto py-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" aria-label="Exit review" className="text-text-tertiary hover:text-text transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </Link>
        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
          <motion.div className="h-full rounded-full" style={{ background: 'var(--color-primary)' }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4, ease: 'easeOut' }} />
        </div>
        <span className="text-xs font-bold text-text-tertiary tabular-nums">{idx + 1}/{cards.length}</span>
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.button
          key={card.reviewId}
          initial={{ x: 60, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -60, opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={() => setRevealed(true)}
          disabled={revealed}
          className="w-full rounded-3xl px-6 py-14 text-center cursor-pointer select-none"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-light)',
            boxShadow: 'var(--shadow-raised)',
            minHeight: 320,
          }}
        >
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8" style={{ color: 'var(--color-primary)' }}>
            {TYPE_LABEL[card.wordType] ?? card.wordType}
          </p>
          <p dir="rtl" className="font-arabic leading-relaxed mb-6" style={{ fontSize: 64, color: 'var(--color-ivory)', textShadow: '0 0 40px rgba(212,162,70,0.25)' }}>
            {card.wordAr}
          </p>
          {revealed ? (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-sm text-text-tertiary mb-1">{card.transliteration}</p>
              <p className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>{card.english}</p>
              {card.quranicRef && <p className="text-xs text-text-tertiary mt-3">📖 {card.quranicRef}</p>}
            </motion.div>
          ) : (
            <p className="text-sm text-text-tertiary animate-pulse">Tap to reveal</p>
          )}
        </motion.button>
      </AnimatePresence>

      {/* Grade buttons */}
      <div className="mt-6 min-h-[76px]">
        {revealed ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-3 gap-3">
            {([
              ['again', '😅 Again', 'var(--color-wrong)', 'rgba(220,80,80,0.12)'],
              ['good', '👍 Good', 'var(--color-primary)', 'rgba(212,162,70,0.12)'],
              ['easy', '⚡ Easy', 'var(--color-correct)', 'rgba(95,181,122,0.12)'],
            ] as const).map(([g, label, color, bg]) => (
              <button
                key={g}
                onClick={() => grade(g)}
                disabled={sending}
                className="py-3.5 rounded-2xl text-sm font-bold transition-transform active:scale-95 disabled:opacity-50"
                style={{ background: bg, color, border: `1px solid ${color}40` }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        ) : (
          <p className="text-center text-xs text-text-tertiary pt-6">Do you remember this word? Tap the card to check.</p>
        )}
      </div>

      {xp > 0 && (
        <p className="text-center text-xs font-bold mt-4" style={{ color: 'var(--color-primary)' }}>+{xp} XP this session</p>
      )}
    </div>
  );
}
