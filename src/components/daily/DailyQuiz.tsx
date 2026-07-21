'use client';

import { useMemo, useState } from 'react';

// A self-quiz generated ENTIRELY from the day's authentic quran_words data
// (word, meaning, root — sourced from quran.com/Tanzil in the DB). No content
// is invented: every question and answer is a real fact from the ayah.

interface Word { ar: string; translit: string | null; translation: string | null; root: string | null }

interface Question {
  prompt: string;
  promptArabic?: string;
  options: { text: string; correct: boolean; arabic?: boolean }[];
  explain: string;
}

// Common Quranic roots used only as extra distractors when the ayah lacks enough.
const FALLBACK_ROOTS = ['ك ت ب', 'ع ل م', 'ر ح م', 'ق و ل', 'خ ل ق', 'ع ب د', 'س م ع', 'ن ص ر'];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isContentWord(w: Word): boolean {
  if (!w.translation) return false;
  // Skip end-of-verse numbers like "(152)" and pure-digit tokens.
  if (/^\(?\d/.test(w.translation.trim())) return false;
  if (/^[٠-٩۰-۹\s]+$/.test(w.ar)) return false;
  return w.translation.trim().length > 0 && w.translation.trim().length < 42;
}

function buildQuiz(words: Word[]): Question[] {
  const content = words.filter(isContentWord);
  const rooted = content.filter((w) => w.root);
  const qs: Question[] = [];

  // Q1 — meaning → word
  if (content.length >= 3) {
    const target = content[0];
    const distractors = shuffle(content.filter((w) => w.ar !== target.ar)).slice(0, 3);
    qs.push({
      prompt: `Which word means “${target.translation}”?`,
      options: shuffle([
        { text: target.ar, correct: true, arabic: true },
        ...distractors.map((d) => ({ text: d.ar, correct: false, arabic: true })),
      ]),
      explain: `${target.ar} = “${target.translation}”.`,
    });
  }

  // Q2 — word → meaning
  if (content.length >= 3) {
    const target = content[content.length > 1 ? 1 : 0];
    const distractors = shuffle(content.filter((w) => w.translation !== target.translation)).slice(0, 3);
    qs.push({
      prompt: 'What does this word mean?',
      promptArabic: target.ar,
      options: shuffle([
        { text: target.translation!, correct: true },
        ...distractors.map((d) => ({ text: d.translation!, correct: false })),
      ]),
      explain: `${target.ar} = “${target.translation}”.`,
    });
  }

  // Q3 — root recognition (only if the ayah gives us a rooted word)
  if (rooted.length >= 1) {
    const target = rooted[0];
    const otherRoots = Array.from(new Set(rooted.filter((w) => w.root !== target.root).map((w) => w.root!)));
    const pool = [...otherRoots, ...FALLBACK_ROOTS.filter((r) => r !== target.root)];
    const distractors = shuffle(pool).slice(0, 3);
    qs.push({
      prompt: 'Which root does this word come from?',
      promptArabic: target.ar,
      options: shuffle([
        { text: target.root!, correct: true, arabic: true },
        ...distractors.map((d) => ({ text: d, correct: false, arabic: true })),
      ]),
      explain: `${target.ar} comes from the root ${target.root}.`,
    });
  }

  return qs;
}

export function DailyQuiz({ words, done, onComplete }: { words: Word[]; done: boolean; onComplete: () => void }) {
  const questions = useMemo(() => buildQuiz(words), [words]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(done);

  if (questions.length === 0) return null;

  if (finished || done) {
    return (
      <section className="rounded-2xl border border-border p-5 sm:p-6" style={{ background: 'var(--color-surface)' }}>
        <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">🧠 Test Yourself</span>
        <div className="mt-3 py-2.5 rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2"
          style={{ background: 'rgba(95,181,122,0.12)', color: 'var(--color-correct, #5FB57A)' }}>
          ✓ Quiz done today
        </div>
      </section>
    );
  }

  const q = questions[idx];
  const answered = picked !== null;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (q.options[i].correct) setCorrectCount((c) => c + 1);
  };

  const next = () => {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setPicked(null);
    } else {
      setFinished(true);
      onComplete();
    }
  };

  return (
    <section className="rounded-2xl border border-border p-5 sm:p-6" style={{ background: 'var(--color-surface)' }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">🧠 Test Yourself</span>
        <span className="text-xs text-text-tertiary">{idx + 1} / {questions.length}</span>
      </div>

      <p className="text-sm text-text mb-2">{q.prompt}</p>
      {q.promptArabic && (
        <p className="font-arabic text-3xl text-center my-3" dir="rtl" style={{ color: 'var(--color-primary)' }}>{q.promptArabic}</p>
      )}

      <div className="space-y-2 mt-3">
        {q.options.map((o, i) => {
          const isPicked = picked === i;
          let bg = 'var(--color-canvas)', border = 'var(--color-border-light)', color = 'var(--color-text)';
          if (answered) {
            if (o.correct) { bg = 'rgba(95,181,122,0.14)'; border = '#5FB57A'; }
            else if (isPicked) { bg = 'rgba(224,90,90,0.12)'; border = '#E05A5A'; }
          }
          return (
            <button
              key={i}
              onClick={() => choose(i)}
              disabled={answered}
              className={`w-full text-left px-4 py-2.5 rounded-xl border transition-colors ${o.arabic ? 'font-arabic text-xl text-right' : 'text-sm'}`}
              dir={o.arabic ? 'rtl' : 'ltr'}
              style={{ background: bg, borderColor: border, color }}
            >
              {o.text}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="mt-3">
          <p className="text-xs text-text-secondary mb-3">{q.explain}</p>
          <button onClick={next} className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-primary)', color: '#1a1206' }}>
            {idx + 1 < questions.length ? 'Next question →' : `Finish · ${correctCount}/${questions.length} correct · +10 XP`}
          </button>
        </div>
      )}
    </section>
  );
}
