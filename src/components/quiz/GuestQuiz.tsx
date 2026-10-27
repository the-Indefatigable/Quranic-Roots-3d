'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

type Question = { root: string; occurrences: number; options: string[]; answer: string };

// Five questions anyone can take before signing in. Signing in is offered at the end,
// to keep the score and get questions chosen for you.
const SALAH_ROOTS = 110;

export function GuestQuiz() {
  const { login } = useAuthStore();
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const load = () => {
    setQuestions(null); setError(null); setI(0); setPicked(null); setScore(0);
    fetch('/api/quiz/sample')
      .then((r) => r.status === 429
        ? setError('Too many quizzes in a minute. Wait a moment and try again.')
        : r.json().then((d) => (r.ok ? setQuestions(d.questions) : setError(d.error || 'Could not load a quiz.'))))
      .catch(() => setError('Could not load a quiz. Check your connection and try again.'));
  };
  useEffect(load, []);

  if (error) {
    return (
      <div className="text-center max-w-sm mx-auto py-16">
        <p className="text-text-secondary mb-6">{error}</p>
        <button onClick={load} className="btn-primary">Try again</button>
      </div>
    );
  }
  if (!questions) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const done = i >= questions.length;
  if (done) {
    return (
      <motion.div className="text-center max-w-md mx-auto py-14" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-sm text-text-tertiary mb-2">Your score</p>
        <p className="font-heading text-6xl text-text mb-3">{score} / {questions.length}</p>
        <p className="text-text-secondary mb-8">
          These five roots alone appear {questions.reduce((s, q) => s + q.occurrences, 0).toLocaleString()} times in the Quran.
          The best place to start is your own prayer: Al-Fatiha and the short surahs grow from {SALAH_ROOTS} roots, and the first week is free.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/salah" className="btn-primary">Understand your salah, free</Link>
          <button onClick={load} className="px-5 py-2.5 rounded-xl border border-border text-text hover:bg-surface transition-colors">Try five more</button>
        </div>
        <button onClick={() => login('Save your quiz progress')} className="mt-5 text-sm text-text-tertiary underline underline-offset-4">Sign in to save your score</button>
      </motion.div>
    );
  }

  const q = questions[i];
  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === q.answer) setScore((s) => s + 1);
    setTimeout(() => { setPicked(null); setI((n) => n + 1); }, 1100);
  };

  return (
    <div className="max-w-xl mx-auto py-10">
      <div className="flex items-center justify-between text-sm text-text-tertiary mb-8">
        <span>Question {i + 1} of {questions.length}</span>
        <span>No sign-in needed</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={q.root} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
          <p className="text-text-secondary mb-3">What does this root mean?</p>
          <p className="font-arabic text-7xl text-primary text-center my-10" dir="rtl" lang="ar">{[...q.root.replace(/\s+/g, '')].join(' ')}</p>
          <p className="text-center text-sm text-text-tertiary mb-8">appears {q.occurrences.toLocaleString()} times in the Quran</p>
          <div className="grid gap-3">
            {q.options.map((opt) => {
              // Inline so the answer colours can't lose to the base border and background classes.
              const state = !picked ? undefined : opt === q.answer ? { borderColor: '#10B981', background: 'rgba(16,185,129,.12)' }
                : opt === picked ? { borderColor: '#F87171', background: 'rgba(248,113,113,.1)' } : { opacity: 0.5 };
              return (
                <button key={opt} onClick={() => choose(opt)} disabled={!!picked} style={state}
                  className="text-left px-5 py-4 rounded-xl border border-border bg-surface hover:border-primary/50 transition-all">
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
