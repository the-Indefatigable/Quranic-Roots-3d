// Ayah Mini-Lesson generator
// ---------------------------
// Turns the word-by-word data the Quran reader already has into a short,
// interactive practice lesson — no authoring required. Every ayah becomes a
// mini-lesson, which is how we defuse the "finished all the content" cliff:
// the 6,236 ayahs become 6,236 practice sets.
//
// This is a PURE function (no React, no fetch) so it's trivial to unit-test
// and runs instantly client-side from data already in the page.

export interface LessonWord {
  position: number;
  textUthmani: string;
  transliteration?: string | null;
  translation?: string | null;
  rootArabic?: string | null;
  charType?: string | null;
}

export type LessonStep =
  | { kind: 'flashcard'; word: LessonWord }
  | { kind: 'mcq'; word: LessonWord; prompt: string; answer: string; options: string[] }
  | { kind: 'recall'; arabic: string; translation: string };

export interface AyahLesson {
  surahNumber: number;
  ayahNumber: number;
  steps: LessonStep[];
  wordCount: number;
}

// Fallback distractor pool of high-frequency Quranic word meanings, used when a
// single ayah doesn't have enough other words to build 4-option questions.
const FALLBACK_MEANINGS = [
  'the Lord', 'mankind', 'the earth', 'the heavens', 'a book',
  'guidance', 'the truth', 'a mercy', 'the day', 'a sign',
  'light', 'the path', 'knowledge', 'the people', 'a reward',
];

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/^(the|a|an)\s+/i, '').replace(/\s+/g, ' ');
}

/** Meaningful, teachable words: actual words that carry a short English gloss. */
function meaningfulWords(words: LessonWord[]): LessonWord[] {
  const seen = new Set<string>();
  const out: LessonWord[] = [];
  for (const w of words) {
    if ((w.charType ?? 'word') !== 'word') continue;
    const t = (w.translation ?? '').trim();
    if (!t) continue;
    // Skip trivial connectors and over-long glosses that make poor flashcards.
    if (t.length > 34) continue;
    const key = normalize(t);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(w);
  }
  return out;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildOptions(answer: string, pool: string[]): string[] {
  const opts = new Set<string>([answer]);
  for (const cand of shuffle(pool)) {
    if (opts.size >= 4) break;
    if (normalize(cand) !== normalize(answer)) opts.add(cand);
  }
  // Pad from the fallback pool if the ayah was too small.
  for (const cand of shuffle(FALLBACK_MEANINGS)) {
    if (opts.size >= 4) break;
    if (normalize(cand) !== normalize(answer)) opts.add(cand);
  }
  return shuffle([...opts]);
}

/**
 * Build a mini-lesson for one ayah. Caps at `maxWords` teachable words to keep
 * it a 60–90s exercise. Returns null only if there is genuinely nothing to
 * teach (no word-level data), so callers can hide the entry point.
 */
export function generateAyahLesson(
  surahNumber: number,
  ayahNumber: number,
  words: LessonWord[],
  ayahTranslation: string,
  maxWords = 5,
): AyahLesson | null {
  const teachable = meaningfulWords(words);
  const arabic = words
    .filter((w) => (w.charType ?? 'word') === 'word')
    .map((w) => w.textUthmani)
    .join(' ');

  if (teachable.length === 0) return null;

  const chosen = teachable.slice(0, maxWords);
  const allMeanings = teachable.map((w) => (w.translation ?? '').trim()).filter(Boolean);

  const steps: LessonStep[] = [];

  // 1) Study each word first (flashcard), then immediately test it (mcq).
  for (const w of chosen) {
    steps.push({ kind: 'flashcard', word: w });
    const answer = (w.translation ?? '').trim();
    steps.push({
      kind: 'mcq',
      word: w,
      prompt: w.textUthmani,
      answer,
      options: buildOptions(answer, allMeanings),
    });
  }

  // 2) Finish by connecting the words back to the whole ayah's meaning.
  if (ayahTranslation && ayahTranslation.trim()) {
    steps.push({ kind: 'recall', arabic, translation: ayahTranslation.trim() });
  }

  return { surahNumber, ayahNumber, steps, wordCount: chosen.length };
}
