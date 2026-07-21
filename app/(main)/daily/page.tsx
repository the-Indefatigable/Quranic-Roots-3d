'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { DailyQuiz } from '@/components/daily/DailyQuiz';

interface Word { position: number; ar: string; translit: string | null; translation: string | null; root: string | null }
interface Ayah { surah: number; ayah: number; surahName: string; translation: string; words: Word[] }
interface Hadith { number: number; title: string | null; arabic: string; english: string; narrator: string | null; grade: string | null }
interface DailyData { ayah: Ayah; hadith: Hadith | null; reviewed: { ayah: boolean; hadith: boolean; quiz: boolean }; loggedIn: boolean }

export default function DailyPage() {
  const { user, setShowLoginModal } = useAuthStore();
  const [data, setData] = useState<DailyData | null>(null);
  const [openWord, setOpenWord] = useState<number | null>(null);
  const [reviewed, setReviewed] = useState({ ayah: false, hadith: false, quiz: false });
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch('/api/daily');
    if (res.ok) {
      const d: DailyData = await res.json();
      setData(d);
      setReviewed(d.reviewed);
    }
  }, []);

  useEffect(() => { load(); }, [load, user]);

  const markReviewed = async (kind: 'ayah' | 'hadith' | 'quiz') => {
    if (!user) { setShowLoginModal(true); return; }
    if (reviewed[kind]) return;
    setReviewed((r) => ({ ...r, [kind]: true }));
    try {
      const res = await fetch('/api/daily/complete', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind }),
      });
      const j = await res.json();
      if (j.xpEarned > 0) {
        setToast(`+${j.xpEarned} XP · ${j.currentStreak} day streak 🔥`);
        setTimeout(() => setToast(null), 2600);
      }
    } catch {
      setReviewed((r) => ({ ...r, [kind]: false }));
    }
  };

  return (
    <div>
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg"
          style={{ background: 'var(--color-primary)', color: '#1a1206' }}>
          {toast}
        </div>
      )}

      <div className="mb-6">
        <div className="text-[10px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'var(--color-primary)' }}>Every day</div>
        <h1 className="text-3xl sm:text-4xl font-heading tracking-tight leading-[1.05]" style={{ color: 'var(--color-ivory)' }}>Daily Ayah &amp; Hadith</h1>
        <p className="mt-2 text-sm text-text-secondary max-w-xl">A fresh verse and prophetic saying each day. Tap any word to reveal its meaning — and earn XP for showing up.</p>
      </div>

      {!data && <div className="py-16 text-center"><div className="w-7 h-7 mx-auto border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}

      {data && (
        <div className="space-y-5">
          {/* Daily Ayah */}
          <section className="rounded-2xl border border-border p-5 sm:p-6" style={{ background: 'var(--color-surface)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">📖 Daily Ayah</span>
              <span className="text-xs text-text-tertiary">{data.ayah.surahName} · {data.ayah.surah}:{data.ayah.ayah}</span>
            </div>

            <div className="flex flex-wrap gap-x-3 gap-y-4 justify-center mb-4" dir="rtl">
              {data.ayah.words.map((w) => (
                <button
                  key={w.position}
                  onClick={() => setOpenWord(openWord === w.position ? null : w.position)}
                  className="group flex flex-col items-center gap-1 rounded-lg px-1.5 py-1 transition-colors"
                  style={{ background: openWord === w.position ? 'rgba(212,162,70,0.12)' : 'transparent' }}
                >
                  <span className="font-arabic text-2xl sm:text-3xl leading-tight" style={{ color: 'var(--color-text)' }}>{w.ar}</span>
                  {openWord === w.position && (
                    <span className="text-[10px] leading-tight text-center max-w-[120px]" dir="ltr">
                      <span className="block text-primary font-medium">{w.translit || ''}</span>
                      <span className="block text-text-secondary">{w.translation || ''}</span>
                      {w.root && <span className="block text-text-tertiary font-arabic mt-0.5" dir="rtl">{w.root}</span>}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <p className="text-sm text-text-secondary text-center italic mb-4">“{data.ayah.translation}”</p>

            <ReviewButton done={reviewed.ayah} onClick={() => markReviewed('ayah')} loggedIn={!!user} />
          </section>

          {/* Self-quiz — generated from the ayah's authentic word data */}
          <DailyQuiz words={data.ayah.words} done={reviewed.quiz} onComplete={() => markReviewed('quiz')} />

          {/* Daily Hadith */}
          {data.hadith && (
            <section className="rounded-2xl border border-border p-5 sm:p-6" style={{ background: 'var(--color-surface)' }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">🕌 Daily Hadith</span>
                <span className="text-xs text-text-tertiary">Nawawi #{data.hadith.number}</span>
              </div>
              <p className="font-arabic text-2xl sm:text-[28px] leading-[1.9] text-right mb-4" dir="rtl" style={{ color: 'var(--color-text)' }}>
                {data.hadith.arabic}
              </p>
              <p className="text-sm text-text-secondary mb-1">“{data.hadith.english}”</p>
              <p className="text-xs text-text-tertiary mb-4">
                {data.hadith.narrator && <>Narrated by {data.hadith.narrator} · </>}{data.hadith.grade}
              </p>
              <ReviewButton done={reviewed.hadith} onClick={() => markReviewed('hadith')} loggedIn={!!user} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function ReviewButton({ done, onClick, loggedIn }: { done: boolean; onClick: () => void; loggedIn: boolean }) {
  if (done) {
    return (
      <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2"
        style={{ background: 'rgba(95,181,122,0.12)', color: 'var(--color-correct, #5FB57A)' }}>
        ✓ Done today
      </div>
    );
  }
  return (
    <button onClick={onClick} className="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors"
      style={{ background: 'var(--color-primary)', color: '#1a1206' }}>
      {loggedIn ? 'I read & reflected  ·  +10 XP' : 'Sign in to earn XP'}
    </button>
  );
}
