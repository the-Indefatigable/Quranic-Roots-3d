'use client';

import { useAppStore } from '@/store/useAppStore';
import { useState, useCallback } from 'react';
import Link from 'next/link';

type ReviewItem = {
  id: string;
  type: 'root' | 'noun' | 'ayah';
  arabicLabel: string;
  label: string;
};

// ── Flip card ──────────────────────────────────────────────────────────────
function FlipCard({
  item,
  flipped,
  onFlip,
}: {
  item: ReviewItem;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      className="w-full cursor-pointer"
      style={{ perspective: '1200px' }}
      onClick={onFlip}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          position: 'relative',
          height: '320px',
        }}
      >
        {/* Front */}
        <div
          style={{ backfaceVisibility: 'hidden' }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-surface rounded-3xl shadow-card p-8"
        >
          <p className="text-xs text-primary/50 tracking-widest uppercase mb-8">
            {item.type === 'ayah' ? 'Ayah' : item.type === 'root' ? 'Root' : 'Noun'}
          </p>
          <p className="font-arabic text-5xl sm:text-6xl text-white text-center leading-[1.6]" dir="rtl">
            {item.arabicLabel}
          </p>
          <p className="text-xs text-white/20 mt-10 tracking-wide">tap to reveal</p>
        </div>

        {/* Back */}
        <div
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-surface border border-primary/20 rounded-3xl p-8"
        >
          <p className="font-arabic text-2xl text-primary/60 text-center mb-6 leading-[1.8]" dir="rtl">
            {item.arabicLabel}
          </p>
          <div className="w-8 h-px bg-primary/20 mb-6" />
          <p className="text-xl sm:text-2xl font-light text-white text-center leading-snug">
            {item.label}
          </p>
          {item.type === 'root' && (
            <Link
              href={`/roots/${encodeURIComponent(item.id)}`}
              onClick={(e) => e.stopPropagation()}
              className="mt-8 text-xs text-primary/40 hover:text-primary transition-colors"
            >
              View conjugations →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="text-center py-20">
      <p className="text-4xl mb-4">📚</p>
      <p className="text-white/60 mb-2">No items to review</p>
      <p className="text-white/30 text-sm mb-8">
        Bookmark roots and nouns while reading to add them here
      </p>
      <Link
        href="/roots"
        className="inline-flex items-center gap-2 bg-surface border border-border text-white/70 hover:text-white px-6 py-3 rounded-xl text-sm transition-all"
      >
        Browse Roots
      </Link>
    </div>
  );
}

// ── Summary screen ──────────────────────────────────────────────────────────
function Summary({ total, correct, onRestart }: { total: number; correct: number; onRestart: () => void }) {
  const pct = Math.round((correct / total) * 100);
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 rounded-full bg-surface border border-border flex items-center justify-center mx-auto mb-8">
        <span className="text-3xl font-light text-white">{pct}%</span>
      </div>
      <h2 className="text-xl font-light text-white mb-2">Session complete</h2>
      <p className="text-white/40 text-sm mb-10">
        {correct} of {total} correct
      </p>
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={onRestart}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-primary-light text-black px-6 py-3 rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
        >
          Review again
        </button>
        <Link
          href="/bookmarks"
          className="inline-flex items-center gap-2 text-white/40 hover:text-white border border-border hover:border-border px-6 py-3 rounded-xl text-sm transition-all"
        >
          Manage bookmarks
        </Link>
      </div>
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function ReviewPage() {
  const { bookmarks } = useAppStore();

  const reviewable = bookmarks
    .filter((b): b is typeof b & { arabicLabel: string } =>
      !!b.arabicLabel && (b.type === 'root' || b.type === 'noun' || b.type === 'ayah')
    )
    .map((b) => ({ id: b.id, type: b.type, arabicLabel: b.arabicLabel, label: b.label }));

  const [queue, setQueue] = useState<ReviewItem[]>(() => shuffle([...reviewable]));
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const advance = useCallback((knew: boolean) => {
    if (knew) setCorrect((c) => c + 1);
    setFlipped(false);
    setTimeout(() => {
      if (current + 1 >= queue.length) {
        setDone(true);
      } else {
        setCurrent((c) => c + 1);
      }
    }, 200);
  }, [current, queue.length]);

  const restart = useCallback(() => {
    setQueue(shuffle([...reviewable]));
    setCurrent(0);
    setFlipped(false);
    setCorrect(0);
    setDone(false);
  }, [reviewable]);

  if (reviewable.length === 0) return <EmptyState />;
  if (done) return <Summary total={queue.length} correct={correct} onRestart={restart} />;

  const item = queue[current];
  const progress = current / queue.length;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-lg font-light text-white">Review</h1>
          <p className="text-sm text-white/30">{queue.length - current} remaining</p>
        </div>
        <span className="text-xs text-white/30 tabular-nums">{current + 1} / {queue.length}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-px bg-border-light rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary/60 to-primary rounded-full transition-all duration-500"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Card */}
      <FlipCard item={item} flipped={flipped} onFlip={() => setFlipped(true)} />

      {/* Action buttons — only visible after flip */}
      <div
        className="flex gap-3 mt-6 transition-all duration-300"
        style={{ opacity: flipped ? 1 : 0, pointerEvents: flipped ? 'auto' : 'none' }}
      >
        <button
          onClick={() => advance(false)}
          className="flex-1 flex items-center justify-center gap-2 bg-surface border border-border hover:border-border text-white/60 hover:text-white py-3.5 rounded-2xl text-sm transition-all"
        >
          <svg className="w-4 h-4 text-red-400/70" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
          Still learning
        </button>
        <button
          onClick={() => advance(true)}
          className="flex-1 flex items-center justify-center gap-2 bg-correct/10 border border-correct/20 hover:border-correct/40 text-correct hover:brightness-110 py-3.5 rounded-2xl text-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
          Got it
        </button>
      </div>

      <p className="text-center text-xs text-white/15 mt-6">
        Tap the card to reveal · then mark how well you knew it
      </p>
    </div>
  );
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
