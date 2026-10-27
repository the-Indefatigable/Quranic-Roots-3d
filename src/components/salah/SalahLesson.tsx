'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalahProgress, startPathCheckout } from './useSalahProgress';
import { unpack } from '@/lib/wire';
import { track } from '@/lib/track';
import { ChatRoom } from '@/components/community/ChatRoom';

const GOLD = '#D4A246';

type Word = { ar: string; en: string | null; root: string | null };
type Line = { surah: number; surahName: string; ayah: number; words: Word[] };
type Root = { root: string; letters: string; meaning: string; quranCount: number; firstIn: string; words: { ar: string; en: string | null; ref: string }[] };
type Day = { day: number; free: boolean; title: string; roots: Root[]; pctSalah: number };
type Payload = { day: Day; lines: Line[]; earlierMeanings: string[] };
type Step = { kind: 'root'; i: number } | { kind: 'quiz'; i: number } | { kind: 'lines' } | { kind: 'done' };

function shuffle<T>(xs: T[]): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

export function SalahLesson({ day }: { day: number }) {
  const { login, user } = useAuthStore();
  const { done, complete } = useSalahProgress();
  const [data, setData] = useState<Payload | null>(null);
  const [locked, setLocked] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>({ kind: 'root', i: 0 });
  // Linked from the lounge as /salah/N#discuss: show the thread without finishing the lesson.
  const [discussOpen, setDiscussOpen] = useState(false);
  useEffect(() => { setDiscussOpen(window.location.hash === '#discuss'); }, []);
  useEffect(() => { track('day_open', { day }); }, [day]);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetch(`/api/salah/day/${day}`).then(async (r) => {
      const d = await unpack(r).catch(() => ({}));
      if (r.status === 402) setLocked(d.title || '');
      else if (!r.ok) setError(d.error || 'Could not load this day.');
      else { setData(d); setStep(d.day.roots.length ? { kind: 'root', i: 0 } : { kind: 'lines' }); }
    }).catch(() => setError('Could not load this day. Check your connection.'));
  }, [day]);

  const known = useMemo(() => {
    // roots learned on this day: highlight them inside the lines
    return new Set((data?.day.roots ?? []).map((r) => r.root));
  }, [data]);

  const quiz = useMemo(() => (data?.day.roots ?? []).map((r) => {
    const pool = shuffle([...new Set([...data!.earlierMeanings, ...data!.day.roots.map((x) => x.meaning)])].filter((m) => m && m !== r.meaning));
    return { root: r, options: shuffle([r.meaning, ...pool.slice(0, 3)]) };
  }), [data]);

  if (locked !== null) {
    return <Paywall day={day} title={locked} onBuy={() => startPathCheckout(login, !!user).then((e) => e && setError(e))} error={error} signedIn={!!user} />;
  }
  if (error) return <Centered><p style={{ color: '#A09F9B' }}>{error}</p><Link href="/salah" className="btn-primary mt-6 inline-block">Back to the path</Link></Centered>;
  if (!data) return <Centered><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></Centered>;

  const { roots } = data.day;
  const totalSteps = roots.length * 2 + 2;
  const stepIndex = step.kind === 'root' ? step.i : step.kind === 'quiz' ? roots.length + step.i : step.kind === 'lines' ? roots.length * 2 : totalSteps - 1;

  const finish = () => { complete(day); setStep({ kind: 'done' }); };

  return (
    <div className="max-w-2xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between text-sm mb-3" style={{ color: '#9A9893' }}>
        <Link href="/salah" className="hover:text-[#D4A246]">← Your salah</Link>
        <span>Day {day} of 30</span>
      </div>
      <div className="h-1 rounded-full mb-10 overflow-hidden" style={{ background: 'rgba(255,255,255,.07)' }}>
        <div className="h-full transition-all duration-500" style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%`, background: GOLD }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={JSON.stringify(step)} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          {step.kind === 'root' && (() => {
            const r = roots[step.i];
            return (
              <div>
                <p className="text-sm mb-2" style={{ color: '#9A9893' }}>New root {step.i + 1} of {roots.length} · first met in {r.firstIn}</p>
                <p className="font-arabic text-center my-8" style={{ fontSize: 'clamp(4rem, 14vw, 6.5rem)', color: GOLD, lineHeight: 1.1 }} dir="rtl" lang="ar">{r.letters}</p>
                <p className="font-heading text-3xl text-center mb-1" style={{ color: '#F0E8D8' }}>{r.meaning}</p>
                <p className="text-center text-sm mb-10" style={{ color: '#9A9893' }}>{r.quranCount.toLocaleString()} words across the Quran grow from this root</p>
                <p className="text-sm mb-3" style={{ color: '#A09F9B' }}>In your prayer</p>
                <div className="grid gap-2 mb-10">
                  {r.words.slice(0, 5).map((w) => (
                    <div key={w.ar + w.ref} className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                      <span style={{ color: '#D8D4CC' }}>{w.en}<span className="text-xs ml-2" style={{ color: '#6E6B66' }}>{w.ref}</span></span>
                      <span className="font-arabic text-2xl" style={{ color: '#F0E8D8' }} dir="rtl" lang="ar">{w.ar}</span>
                    </div>
                  ))}
                </div>
                <button className="btn-primary w-full" onClick={() => setStep(step.i + 1 < roots.length ? { kind: 'root', i: step.i + 1 } : { kind: 'quiz', i: 0 })}>Next</button>
              </div>
            );
          })()}

          {step.kind === 'quiz' && (() => {
            const q = quiz[step.i];
            const choose = (opt: string) => {
              if (picked) return;
              setPicked(opt);
              if (opt === q.root.meaning) setScore((s) => s + 1);
              setTimeout(() => { setPicked(null); setStep(step.i + 1 < quiz.length ? { kind: 'quiz', i: step.i + 1 } : { kind: 'lines' }); }, 1000);
            };
            return (
              <div>
                <p className="text-sm mb-2" style={{ color: '#9A9893' }}>Check yourself · {step.i + 1} of {quiz.length}</p>
                <p className="font-arabic text-center my-10" style={{ fontSize: 'clamp(3.5rem, 12vw, 5.5rem)', color: GOLD }} dir="rtl" lang="ar">{q.root.letters}</p>
                <div className="grid gap-3">
                  {q.options.map((opt) => {
                    const state = !picked ? {} : opt === q.root.meaning ? { borderColor: '#10B981', background: 'rgba(16,185,129,.1)' } : opt === picked ? { borderColor: '#F87171', background: 'rgba(248,113,113,.1)' } : { opacity: 0.45 };
                    return (
                      <button key={opt} onClick={() => choose(opt)} disabled={!!picked} className="text-left px-5 py-4 rounded-xl border transition-all"
                        style={{ borderColor: 'rgba(255,255,255,.1)', background: 'rgba(255,255,255,.03)', color: '#EDEDEC', ...state }}>{opt}</button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {step.kind === 'lines' && (
            <div>
              <p className="text-sm mb-2" style={{ color: '#9A9893' }}>{day === 7 ? 'All of Al-Fatiha' : day === 30 ? 'Everything you pray with' : 'Lines you can now understand'}</p>
              <h2 className="font-heading text-3xl mb-8" style={{ color: '#F0E8D8' }}>
                {day === 7 ? 'Every word of Al-Fatiha.' : day === 30 ? 'Your whole salah.' : data.lines.length ? 'Read them, word by word.' : 'Today builds toward the next lines.'}
              </h2>
              <div className="grid gap-5 mb-10">
                {data.lines.map((l) => (
                  <div key={`${l.surah}:${l.ayah}`} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
                    <p className="text-xs mb-3" style={{ color: '#6E6B66' }}>{l.surahName} {l.surah}:{l.ayah}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-3 justify-start" dir="rtl">
                      {l.words.map((w, i) => (
                        <span key={i} className="flex flex-col items-center text-center" style={{ maxWidth: 120 }}>
                          <span className="font-arabic text-2xl leading-snug" lang="ar" style={{ color: w.root && known.has(w.root) ? GOLD : '#F0E8D8' }}>{w.ar}</span>
                          <span className="text-[12px] leading-tight mt-1" dir="ltr" style={{ color: '#9A9893' }}>{w.en}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button className="btn-primary w-full" onClick={finish}>Finish day {day}</button>
            </div>
          )}

          {step.kind === 'done' && (
            <Done day={day} pct={data.day.pctSalah} score={score} quizLen={quiz.length} completedBefore={done.includes(day)} />
          )}
        </motion.div>
      </AnimatePresence>

      {(step.kind === 'done' || discussOpen) && (
        <section id="discuss" className="mt-14">
          <h2 className="font-heading text-[24px] mb-1" style={{ color: 'var(--color-ivory)' }}>Talk about day {day}</h2>
          <p className="text-[15px] text-text-tertiary mb-4">Ask about a word, or share what clicked for you.</p>
          <ChatRoom room={`salah-day-${day}`} height="420px" empty={{ title: 'Start the conversation', body: `Be the first to say what you learned on day ${day}.` }} placeholder="Ask or share something about this day" />
        </section>
      )}
    </div>
  );
}

function Done({ day, pct, score, quizLen }: { day: number; pct: number; score: number; quizLen: number; completedBefore: boolean }) {
  const text = day === 7
    ? 'I now understand every word of Al-Fatiha. Learning the roots of my salah on QuRoots:'
    : `Day ${day} of 30: I now understand ${pct}% of the root words in my salah. Learning on QuRoots:`;
  const url = 'https://quroots.com/salah';
  const share = async () => {
    track('share', { day });
    if (navigator.share) { try { await navigator.share({ text, url }); return; } catch { /* cancelled */ } }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank');
  };
  return (
    <div className="text-center py-6">
      <p className="font-arabic text-4xl mb-4" style={{ color: GOLD }} dir="rtl" lang="ar">مَا شَاءَ ٱللَّهُ</p>
      <h2 className="font-heading text-4xl mb-3" style={{ color: '#F0E8D8' }}>{day === 7 ? 'You understand Al-Fatiha.' : `Day ${day} done.`}</h2>
      <p className="mb-2" style={{ color: '#B5B2AC' }}>You now understand <b style={{ color: '#F0E8D8' }}>{pct}%</b> of the root words in your salah.</p>
      {quizLen > 0 && <p className="text-sm mb-8" style={{ color: '#9A9893' }}>{score} of {quizLen} right in today&rsquo;s check.</p>}
      <div className="flex gap-3 justify-center flex-wrap mt-6">
        {day < 30 && <Link href={`/salah/${day + 1}`} className="btn-primary">Day {day + 1}</Link>}
        <button onClick={share} className="px-5 py-2.5 rounded-xl border transition-colors hover:bg-white/5" style={{ borderColor: 'rgba(212,162,70,.35)', color: GOLD }}>Share with a friend</button>
        <Link href="/salah" className="px-5 py-2.5 rounded-xl" style={{ color: '#A09F9B' }}>Back to the path</Link>
      </div>
    </div>
  );
}

function Paywall({ day, title, onBuy, error, signedIn }: { day: number; title: string; onBuy: () => void; error: string | null; signedIn: boolean }) {
  return (
    <Centered>
      <p className="text-sm mb-2" style={{ color: '#9A9893' }}>Day {day} · {title}</p>
      <h2 className="font-heading text-3xl mb-3" style={{ color: '#F0E8D8' }}>This day is part of the full path.</h2>
      <p className="mb-8 max-w-md mx-auto" style={{ color: '#A09F9B' }}>The first week, all of Al-Fatiha, is free. Unlock days 8 to 30 once, at the founding price, and keep them for life.</p>
      <button onClick={onBuy} className="btn-primary">{signedIn ? 'Unlock the full path' : 'Sign in to unlock'}</button>
      {error && <p className="mt-4 text-sm" style={{ color: '#F87171' }}>{error}</p>}
      <div className="mt-6"><Link href="/salah" className="text-sm" style={{ color: '#9A9893' }}>← Back to the path</Link></div>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-5">{children}</div>;
}
