'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DashboardData {
  user: { name: string | null; level: number; totalXP: number };
  hearts: number;
  streak: { current: number; longest: number; freezes: number };
  gems: number;
  dailyGoal: { targetXp: number; earnedXp: number; completed: boolean; lessonsCompleted: number };
  quests: Array<{ id: string; type: string; title: string; target: number; progress: number; gemReward: number; completed: boolean }>;
  coverage: { percent: number; tokensRecognized: number; totalTokens: number; wordsLearned: number; rootsLearned: number };
  review: { due: number; deckSize: number };
  digestOptIn: boolean;
  nextLesson: { lessonId: string; lessonTitle: string; unitTitle: string; unitColor: string; unitEmoji: string } | null;
  league: { tier: number; name: string; rank: number | null; weeklyXp: number } | null;
}

// ── Count-up number animation ─────────────────────────────
function useCountUp(target: number, duration = 1400, decimals = 0) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Number((target * eased).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration, decimals]);
  return value;
}

// ── Hero: Quran Coverage Arc ──────────────────────────────
function CoverageHero({ coverage, name }: { coverage: DashboardData['coverage']; name: string | null }) {
  const pct = useCountUp(coverage.percent, 1600, 1);
  const tokens = useCountUp(coverage.tokensRecognized, 1600);
  const R = 84;
  const CIRC = Math.PI * R; // semicircle
  const firstName = (name ?? 'friend').split(' ')[0];

  const milestone =
    coverage.percent >= 15 ? 'Stage 1 scholar — the foundation is yours 🎓'
    : coverage.percent >= 10 ? 'Double digits soon — keep going!'
    : coverage.percent >= 5 ? 'Every lesson unlocks more of the Quran'
    : coverage.percent > 0 ? 'Your journey into the Quran has begun'
    : 'Complete your first lesson to start unlocking the Quran';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative rounded-3xl px-6 pt-7 pb-6 text-center overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, rgba(212,162,70,0.13) 0%, var(--color-surface) 55%)',
        border: '1px solid rgba(212,162,70,0.3)',
        boxShadow: 'var(--shadow-raised)',
      }}
    >
      <p className="text-sm text-text-secondary mb-1">Salaam, <span className="font-semibold" style={{ color: 'var(--color-ivory)' }}>{firstName}</span> 👋</p>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-4" style={{ color: 'var(--color-primary)' }}>
        Your Quran Coverage
      </p>

      {/* Semicircle gauge */}
      <div className="relative mx-auto" style={{ width: 220, height: 120 }}>
        <svg viewBox="0 0 220 120" className="w-full">
          <defs>
            <linearGradient id="covGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#B8863B" />
              <stop offset="60%" stopColor="#D4A246" />
              <stop offset="100%" stopColor="#F0D48A" />
            </linearGradient>
          </defs>
          <path d={`M 26 110 A ${R} ${R} 0 0 1 194 110`} fill="none" stroke="var(--color-border)" strokeWidth="13" strokeLinecap="round" />
          <motion.path
            d={`M 26 110 A ${R} ${R} 0 0 1 194 110`}
            fill="none"
            stroke="url(#covGrad)"
            strokeWidth="13"
            strokeLinecap="round"
            strokeDasharray={CIRC}
            initial={{ strokeDashoffset: CIRC }}
            animate={{ strokeDashoffset: CIRC * (1 - Math.min(coverage.percent, 100) / 100) }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ filter: 'drop-shadow(0 0 8px rgba(212,162,70,0.5))' }}
          />
        </svg>
        <div className="absolute inset-x-0 bottom-0 pb-1">
          <span className="text-5xl font-heading tabular-nums" style={{ color: 'var(--color-ivory)', textShadow: '0 0 30px rgba(212,162,70,0.4)' }}>
            {pct}%
          </span>
        </div>
      </div>

      <p className="mt-3 text-sm" style={{ color: 'var(--color-text)' }}>
        You recognize <span className="font-bold tabular-nums" style={{ color: 'var(--color-primary)' }}>{tokens.toLocaleString()}</span> of the Quran&rsquo;s {coverage.totalTokens.toLocaleString()} words
      </p>
      <p className="mt-1.5 text-xs text-text-tertiary">{milestone}</p>

      <div className="mt-4 flex items-center justify-center gap-5 text-xs text-text-secondary">
        <span><b style={{ color: 'var(--color-ivory)' }}>{coverage.wordsLearned}</b> words learned</span>
        <span className="opacity-40">·</span>
        <span><b style={{ color: 'var(--color-ivory)' }}>{coverage.rootsLearned}</b> roots</span>
      </div>
    </motion.div>
  );
}

// ── Duolingo-style 3D button card ─────────────────────────
function ContinueCard({ lesson }: { lesson: NonNullable<DashboardData['nextLesson']> }) {
  return (
    <Link href={`/lesson/${lesson.lessonId}`} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.45 }}
        whileTap={{ scale: 0.98 }}
        className="relative rounded-3xl p-5 transition-transform duration-150 group-hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(135deg, #D4A246 0%, #B8863B 100%)',
          boxShadow: '0 5px 0 #8a6526, 0 10px 26px rgba(212,162,70,0.3)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: 'rgba(20,14,4,0.22)' }}>
            {lesson.unitEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-0.5" style={{ color: 'rgba(26,18,6,0.65)' }}>
              Continue · {lesson.unitTitle}
            </p>
            <p className="text-lg font-heading font-bold truncate" style={{ color: '#1a1206' }}>{lesson.lessonTitle}</p>
          </div>
          <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-transform duration-150 group-hover:scale-110" style={{ background: '#1a1206' }}>
            <svg className="w-5 h-5 ml-0.5" fill="#D4A246" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

// ── Review card ───────────────────────────────────────────
function ReviewCard({ review }: { review: DashboardData['review'] }) {
  const hasDue = review.due > 0;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18, duration: 0.45 }}>
      <Link
        href="/review/words"
        className="flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 block"
        style={{
          background: 'var(--color-surface)',
          border: hasDue ? '1px solid rgba(212,162,70,0.4)' : '1px solid var(--color-border-light)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: 'rgba(212,162,70,0.12)' }}>
          🔁
          {hasDue && (
            <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: 'var(--color-wrong)', color: '#fff' }}>
              {review.due}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {hasDue ? `${review.due} word${review.due === 1 ? '' : 's'} due for review` : 'All caught up ✨'}
          </p>
          <p className="text-xs text-text-tertiary">
            {hasDue ? 'Review now before they fade' : `${review.deckSize} words in your deck — reviews return as you'd forget them`}
          </p>
        </div>
        {hasDue && (
          <span className="text-xs font-bold px-3.5 py-2 rounded-xl shrink-0" style={{ background: 'var(--color-primary)', color: '#1a1206' }}>
            Review
          </span>
        )}
      </Link>
    </motion.div>
  );
}

// ── Main dashboard ────────────────────────────────────────
export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [digestNudgeGone, setDigestNudgeGone] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => { if (!d.error) setData(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
    setDigestNudgeGone(typeof window !== 'undefined' && localStorage.getItem('digestNudgeDismissed') === '1');
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary mb-4">Sign in to see your dashboard</p>
        <Link href="/learn/path" className="text-primary font-medium">Browse lessons</Link>
      </div>
    );
  }

  const goalPercent = data.dailyGoal.targetXp > 0
    ? Math.min(100, Math.round((data.dailyGoal.earnedXp / data.dailyGoal.targetXp) * 100))
    : 0;

  const enableDigest = async () => {
    setData((d) => (d ? { ...d, digestOptIn: true } : d));
    await fetch('/api/digest/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ optIn: true }),
    }).catch(() => {});
  };
  const dismissNudge = () => {
    localStorage.setItem('digestNudgeDismissed', '1');
    setDigestNudgeGone(true);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-5 space-y-5">
      {/* ── Stat pills ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {[
            { icon: '🔥', value: data.streak.current, color: '#E8833A', pulse: data.streak.current > 0 },
            { icon: '💎', value: data.gems, color: '#5CA8DE', pulse: false },
            { icon: '❤️', value: data.hearts, color: '#DC6464', pulse: false },
          ].map((s) => (
            <div
              key={s.icon}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}
            >
              <span className={`text-base leading-none ${s.pulse ? 'animate-pulse' : ''}`}>{s.icon}</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
        <div className="px-3 py-1.5 rounded-full" style={{ background: 'rgba(212,162,70,0.12)', border: '1px solid rgba(212,162,70,0.35)' }}>
          <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>Lv {data.user.level}</span>
        </div>
      </motion.div>

      {/* ── Coverage hero ──────────────────────────── */}
      <CoverageHero coverage={data.coverage} name={data.user.name} />

      {/* ── Continue learning ──────────────────────── */}
      {data.nextLesson ? (
        <ContinueCard lesson={data.nextLesson} />
      ) : (
        <Link href="/learn/path" className="block p-5 rounded-2xl text-center bg-surface shadow-card border border-border hover:shadow-raised transition-shadow">
          <span className="text-3xl mb-2 block">📚</span>
          <p className="font-heading font-bold text-text">Start Learning</p>
          <p className="text-sm text-text-secondary">Begin your Quranic Arabic journey</p>
        </Link>
      )}

      {/* ── Review queue ───────────────────────────── */}
      <ReviewCard review={data.review} />

      {/* ── Daily goal ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.45 }}
        className="flex items-center gap-5 p-5 rounded-2xl"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)', boxShadow: 'var(--shadow-card)' }}
      >
        <div className="relative w-[76px] h-[76px] shrink-0">
          <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
            <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-border)" strokeWidth="7" />
            <motion.circle
              cx="40" cy="40" r="34" fill="none"
              stroke={data.dailyGoal.completed ? 'var(--color-correct)' : 'var(--color-primary)'}
              strokeWidth="7" strokeLinecap="round"
              strokeDasharray={214}
              initial={{ strokeDashoffset: 214 }}
              animate={{ strokeDashoffset: 214 - (214 * goalPercent) / 100 }}
              transition={{ duration: 1.1, ease: 'easeOut', delay: 0.3 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-base font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{goalPercent}%</span>
          </div>
        </div>
        <div>
          <p className="font-heading font-bold" style={{ color: 'var(--color-text)' }}>
            {data.dailyGoal.completed ? '🎯 Goal complete!' : 'Daily Goal'}
          </p>
          <p className="text-sm text-text-secondary">{data.dailyGoal.earnedXp} / {data.dailyGoal.targetXp} XP</p>
          <p className="text-xs text-text-tertiary mt-0.5">
            {data.dailyGoal.completed
              ? 'Come back tomorrow to keep the streak alive'
              : data.dailyGoal.lessonsCompleted > 0
                ? `${data.dailyGoal.lessonsCompleted} lesson${data.dailyGoal.lessonsCompleted === 1 ? '' : 's'} today — almost there`
                : 'One lesson gets you most of the way'}
          </p>
        </div>
      </motion.div>

      {/* ── Digest nudge (until subscribed) ────────── */}
      {!data.digestOptIn && !digestNudgeGone && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="flex items-center gap-3 p-4 rounded-2xl"
          style={{ background: 'var(--color-surface)', border: '1px dashed rgba(212,162,70,0.4)' }}
        >
          <span className="text-xl">📬</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Get the Friday digest</p>
            <p className="text-xs text-text-tertiary">Verse of the week + what&rsquo;s new, once a week</p>
          </div>
          <button onClick={enableDigest} className="text-xs font-bold px-3 py-2 rounded-xl shrink-0" style={{ background: 'var(--color-primary)', color: '#1a1206' }}>
            Subscribe
          </button>
          <button onClick={dismissNudge} aria-label="Dismiss" className="text-text-tertiary p-1 shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
          </button>
        </motion.div>
      )}

      {/* ── League ─────────────────────────────────── */}
      {data.league && (
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-surface shadow-card border border-border-light">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(212,162,70,0.1)' }}>
            <span className="text-xl">🏆</span>
          </div>
          <div>
            <p className="font-heading font-bold text-text">{data.league.name} League</p>
            <p className="text-sm text-text-secondary">{data.league.rank ? `#${data.league.rank}` : 'Unranked'} · {data.league.weeklyXp} XP this week</p>
          </div>
        </div>
      )}

      {/* ── Quick stats ────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.45 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { value: data.user.totalXP.toLocaleString(), label: 'Total XP' },
          { value: String(data.streak.longest), label: 'Best streak' },
          { value: String(data.coverage.wordsLearned), label: 'Words' },
          { value: String(data.coverage.rootsLearned), label: 'Roots' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-3.5 rounded-2xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border-light)' }}>
            <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--color-ivory)' }}>{stat.value}</p>
            <p className="text-[11px] text-text-tertiary">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <Link href="/learn/path" className="block text-center py-3 text-primary font-medium hover:underline text-sm">
        View full learning path →
      </Link>
    </div>
  );
}
