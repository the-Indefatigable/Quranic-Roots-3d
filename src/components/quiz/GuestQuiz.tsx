'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';

type Question = { root: string; occurrences: number; options: string[]; answer: string };

// Five questions anyone can take before signing in. Signing in is offered at the end,
// to keep the score and get questions chosen for you.
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
          Sign in to keep your score and get quizzes chosen for the words you are learning.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => login('Save your quiz progress')} className="btn-primary">Sign in to save progress</button>
          <button onClick={load} className="px-5 py-2.5 rounded-xl border border-border text-text hover:bg-surface transition-colors">Try five more</button>
        </div>
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
          <p className="font-arabic text-7xl text-primary text-center my-10" dir="rtl" lang="ar">{q.root}</p>
          <p className="text-center text-sm text-text-tertiary mb-8">appears {q.occurrences.toLocaleString()} times in the Quran</p>
          <div className="grid gap-3">
            {q.options.map((opt) => {
              const state = !picked ? '' : opt === q.answer ? 'border-correct bg-correct-light' : opt === picked ? 'border-wrong bg-wrong-light' : 'opacity-50';
              return (
                <button key={opt} onClick={() => choose(opt)} disabled={!!picked}
                  className={`text-left px-5 py-4 rounded-xl border border-border bg-surface hover:border-primary/50 transition-all ${state}`}>
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
