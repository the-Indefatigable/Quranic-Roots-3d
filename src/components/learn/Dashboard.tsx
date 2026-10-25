'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalahProgress, type Overview } from '@/components/salah/useSalahProgress';
import { FlameIcon, RepeatIcon, TrophyIcon, BookOpenIcon, MailIcon, ArrowRightIcon, LockIcon, CheckIcon } from '@/components/ui/icons';

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

type DailyAyah = { surah: number; ayah: number; surahName: string; translation: string; words: { ar: string }[] };

const GOLD = 'var(--color-primary)';
const card = 'rounded-3xl p-6 sm:p-7';
const cardStyle = { background: 'var(--color-surface)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: 'var(--shadow-card)' };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

/** The salah path: what to do today, and where you are in the 30 days. */
function SalahCard({ overview, done }: { overview: Overview | null; done: number[] }) {
  if (!overview) return <div className={`${card} h-[230px] animate-pulse`} style={cardStyle} />;
  const next = overview.days.find((d) => !done.includes(d.day));
  const last = done.length ? Math.max(...done) : 0;
  const pct = last ? overview.days.find((d) => d.day === last)?.pctSalah ?? 0 : 0;
  const locked = next?.locked;

  return (
    <section
      className={`${card} relative overflow-hidden`}
      style={{ background: 'linear-gradient(150deg, rgba(212,162,70,0.16), var(--color-surface) 60%)', border: '1px solid rgba(212,162,70,0.28)', boxShadow: 'var(--shadow-raised)' }}
    >
      <p className="font-arabic text-[22px] mb-2" style={{ color: GOLD }} dir="rtl" lang="ar">إِيَّاكَ نَعْبُدُ</p>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: GOLD }}>
        Your salah{next ? ` · day ${next.day} of ${overview.days.length}` : ''}
      </p>
      {next ? (
        <>
          <h2 className="font-heading text-[30px] sm:text-[34px] leading-tight mb-1" style={{ color: 'var(--color-ivory)' }}>
            {next.title.charAt(0).toUpperCase() + next.title.slice(1)}
          </h2>
          <p className="text-[15px] text-text-secondary mb-6">
            {next.rootCount} new root{next.rootCount === 1 ? '' : 's'} · about 10 minutes{done.length ? '' : ' · the first week is free'}
          </p>
        </>
      ) : (
        <h2 className="font-heading text-[30px] leading-tight mb-6" style={{ color: 'var(--color-ivory)' }}>You understand every word of your salah.</h2>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.max(pct, 2)}%`, background: 'linear-gradient(90deg, #B8863B, #E8BF62)' }} />
        </div>
        <span className="text-[14px] tabular-nums text-text-secondary shrink-0">{pct}% of your salah</span>
      </div>

      {next && (
        <Link
          href={locked ? '/salah' : `/salah/${next.day}`}
          className="inline-flex items-center gap-2 h-12 px-6 rounded-full font-semibold text-[15px] transition-transform active:scale-[0.98]"
          style={{ background: GOLD, color: '#1a1206' }}
        >
          {locked ? <><LockIcon className="w-4 h-4" /> Unlock days 8 to 30</> : <>{done.length ? `Continue day ${next.day}` : 'Start day 1'} <ArrowRightIcon className="w-4 h-4" /></>}
        </Link>
      )}
    </section>
  );
}

function AyahCard({ ayah }: { ayah: DailyAyah | null }) {
  if (!ayah) return null;
  return (
    <Link href="/daily" className={`${card} block group transition-colors hover:border-[rgba(212,162,70,0.3)]`} style={cardStyle}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-text-tertiary">Today&rsquo;s ayah</p>
        <p className="text-[13px] text-text-tertiary">{ayah.surahName} {ayah.surah}:{ayah.ayah}</p>
      </div>
      <p className="font-arabic text-[26px] sm:text-[30px] leading-[2] text-right mb-3" dir="rtl" lang="ar" style={{ color: 'var(--color-ivory)' }}>
        {ayah.words.map((w) => w.ar).join(' ')}
      </p>
      <p className="text-[15px] leading-relaxed text-text-secondary mb-4">&ldquo;{ayah.translation}&rdquo;</p>
      <span className="inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: GOLD }}>
        Study it word by word <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function Row({ href, icon, title, sub, action, highlight }: { href: string; icon: React.ReactNode; title: string; sub: string; action?: string; highlight?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-4 p-5 rounded-2xl transition-colors hover:bg-white/[0.03]" style={{ ...cardStyle, borderColor: highlight ? 'rgba(212,162,70,0.35)' : 'rgba(255,255,255,0.06)' }}>
      <span className="w-11 h-11 rounded-xl grid place-items-center shrink-0" style={{ background: 'rgba(212,162,70,0.1)', color: GOLD }}>{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[15px] font-semibold text-text truncate">{title}</p>
        <p className="text-[14px] text-text-tertiary truncate">{sub}</p>
      </div>
      {action && <span className="text-[14px] font-semibold px-4 h-9 grid place-items-center rounded-full shrink-0" style={{ background: GOLD, color: '#1a1206' }}>{action}</span>}
    </Link>
  );
}

function StreakCard({ data }: { data: DashboardData }) {
  const goal = data.dailyGoal.targetXp > 0 ? Math.min(100, Math.round((data.dailyGoal.earnedXp / data.dailyGoal.targetXp) * 100)) : 0;
  const C = 2 * Math.PI * 30;
  return (
    <section className={card} style={cardStyle}>
      <div className="flex items-center gap-5">
        <div className="relative w-[76px] h-[76px] shrink-0" style={{ color: GOLD }}>
          <svg viewBox="0 0 72 72" className="w-full h-full -rotate-90">
            <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle cx="36" cy="36" r="30" fill="none" stroke={data.dailyGoal.completed ? 'var(--color-correct)' : '#D4A246'} strokeWidth="6" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - goal / 100)} style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <FlameIcon className="absolute inset-0 m-auto w-7 h-7" />
        </div>
        <div>
          <p className="font-heading text-[30px] leading-none tabular-nums" style={{ color: 'var(--color-ivory)' }}>
            {data.streak.current} <span className="text-[17px] text-text-secondary font-sans">day{data.streak.current === 1 ? '' : 's'}</span>
          </p>
          <p className="text-[14px] text-text-secondary mt-1.5">
            {data.dailyGoal.completed ? 'Today’s goal is done' : `${data.dailyGoal.earnedXp} of ${data.dailyGoal.targetXp} XP today`}
          </p>
          {data.streak.longest > 0 && <p className="text-[13px] text-text-tertiary mt-0.5">Best: {data.streak.longest} days</p>}
        </div>
      </div>
    </section>
  );
}

function CoverageCard({ c }: { c: DashboardData['coverage'] }) {
  return (
    <section className={card} style={cardStyle}>
      <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-text-tertiary mb-3">Your Quran</p>
      {c.tokensRecognized > 0 ? (
        <>
          <p className="font-heading text-[30px] leading-none tabular-nums mb-2" style={{ color: 'var(--color-ivory)' }}>{c.percent}%</p>
          <p className="text-[14px] text-text-secondary mb-4">
            You recognise {c.tokensRecognized.toLocaleString()} of its {c.totalTokens.toLocaleString()} words.
          </p>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.max(c.percent, 1)}%`, background: '#D4A246' }} />
          </div>
          <p className="text-[13px] text-text-tertiary mt-3">{c.wordsLearned} words · {c.rootsLearned} roots learned</p>
        </>
      ) : (
        <p className="text-[15px] leading-relaxed text-text-secondary">
          Every root you learn lights up its words all over the Quran. Your first root opens hundreds of them.
        </p>
      )}
    </section>
  );
}

/** The signed-in home: what to do today first, progress second, nothing promotional on top. */
export function Dashboard() {
  const { user, login } = useAuthStore();
  const { done } = useSalahProgress();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [ayah, setAyah] = useState<DailyAyah | null>(null);
  const [digestHidden, setDigestHidden] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard').then((r) => r.json()).then((d) => { if (!d.error) setData(d); }).catch(() => {}).finally(() => setLoading(false));
    fetch('/api/salah').then((r) => r.json()).then(setOverview).catch(() => {});
    fetch('/api/daily').then((r) => r.json()).then((d) => d.ayah && setAyah(d.ayah)).catch(() => {});
    try { setDigestHidden(localStorage.getItem('digestNudgeDismissed') === '1'); } catch { /* storage unavailable */ }
  }, []);

  if (!loading && !data && !user) {
    return (
      <div className="max-w-md mx-auto text-center py-20">
        <h1 className="font-heading text-[34px] mb-3" style={{ color: 'var(--color-ivory)' }}>Your day with the Quran</h1>
        <p className="text-[16px] text-text-secondary mb-8">Sign in to see today&rsquo;s lesson, your streak and the words due for review.</p>
        <button onClick={() => login('Sign in to see your day')} className="h-12 px-7 rounded-full font-semibold" style={{ background: GOLD, color: '#1a1206' }}>Sign in</button>
      </div>
    );
  }

  const firstName = (data?.user.name ?? user?.name ?? '').split(' ')[0];
  const enableDigest = async () => {
    setData((d) => (d ? { ...d, digestOptIn: true } : d));
    await fetch('/api/digest/subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ optIn: true }) }).catch(() => {});
  };
  const hideDigest = () => { try { localStorage.setItem('digestNudgeDismissed', '1'); } catch { /* storage unavailable */ } setDigestHidden(true); };

  return (
    <div>
      <header className="mb-8">
        <p className="text-[15px] text-text-tertiary mb-1">{greeting()}{firstName ? `, ${firstName}` : ''}</p>
        <h1 className="font-heading text-[36px] sm:text-[42px] leading-tight" style={{ color: 'var(--color-ivory)' }}>Your day with the Quran</h1>
      </header>

      <div className="grid gap-5 grid-cols-[minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_340px] items-start">
        <div className="space-y-5">
          <SalahCard overview={overview} done={done} />
          {data && data.review.due > 0 && (
            <Row href="/review/words" icon={<RepeatIcon className="w-5 h-5" />} highlight title={`${data.review.due} word${data.review.due === 1 ? '' : 's'} to review`} sub="Review them now, before they fade" action="Review" />
          )}
          <AyahCard ayah={ayah} />
          {data?.nextLesson ? (
            <Row href={`/lesson/${data.nextLesson.lessonId}`} icon={<BookOpenIcon className="w-5 h-5" />} title={data.nextLesson.lessonTitle} sub={`Arabic course · ${data.nextLesson.unitTitle}`} action="Continue" />
          ) : (
            <Row href="/learn/path" icon={<BookOpenIcon className="w-5 h-5" />} title="The Arabic course" sub="Grammar and reading, step by step" />
          )}
        </div>

        <aside className="space-y-5">
          {data ? <StreakCard data={data} /> : <div className={`${card} h-[124px] animate-pulse`} style={cardStyle} />}
          {data && <CoverageCard c={data.coverage} />}
          {data && data.review.due === 0 && data.review.deckSize > 0 && (
            <Row href="/review/words" icon={<CheckIcon className="w-5 h-5" />} title="Reviews done" sub={`${data.review.deckSize} words in your deck`} />
          )}
          {data?.league && (
            <Row href="/leaderboard" icon={<TrophyIcon className="w-5 h-5" />} title={`${data.league.name} league`} sub={`${data.league.rank ? `#${data.league.rank}` : 'Unranked'} · ${data.league.weeklyXp} XP this week`} />
          )}
          {data && !data.digestOptIn && !digestHidden && (
            <section className="flex items-start gap-3 p-5 rounded-2xl" style={{ ...cardStyle, borderStyle: 'dashed', borderColor: 'rgba(212,162,70,0.3)' }}>
              <MailIcon className="w-5 h-5 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-[15px] font-semibold text-text">The Friday email</p>
                <p className="text-[14px] text-text-tertiary mb-3">One ayah and what&rsquo;s new, once a week.</p>
                <div className="flex gap-2">
                  <button onClick={enableDigest} className="h-9 px-4 rounded-full text-[14px] font-semibold" style={{ background: GOLD, color: '#1a1206' }}>Subscribe</button>
                  <button onClick={hideDigest} className="h-9 px-3 text-[14px] text-text-tertiary">Not now</button>
                </div>
              </div>
            </section>
          )}
          <Link href="/support" className="block text-center text-[14px] text-text-tertiary hover:text-text-secondary py-2">
            QuRoots is free and ad-free. Support it →
          </Link>
        </aside>
      </div>
    </div>
  );
}
