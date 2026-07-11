import { db, dbQuery } from '@/db';
import { learningLessons, learningUnits, userLessonProgress, vocabularyBank, quranWords } from '@/db/schema';
import { and, eq, sql, inArray } from 'drizzle-orm';

// Total word tokens in the Quran corpus (quran_words where char_type='word').
// Verified against the DB by scripts/seed-vocab-roots.mjs — static corpus.
export const TOTAL_QURAN_TOKENS = 77429;

export interface LearnedWord {
  id: string;
  wordAr: string;
  transliteration: string;
  english: string;
  wordType: string;
  rootArabic: string | null;
  tokenCount: number;
  quranicRef: string | null;
}

/**
 * A word counts as "learned" proportionally to unit progress: completing
 * k of a unit's n lessons unlocks the first ceil(k/n × vocabCount) words
 * (stable order). Grows with every completed lesson.
 */
export async function getLearnedWords(userId: string): Promise<LearnedWord[]> {
  const [units, vocab, progress] = await Promise.all([
    dbQuery(() =>
      db.select({
        unitId: learningUnits.id,
        lessonCount: sql<number>`count(${learningLessons.id})::int`,
      })
        .from(learningUnits)
        .leftJoin(learningLessons, eq(learningLessons.unitId, learningUnits.id))
        .groupBy(learningUnits.id)
    ),
    dbQuery(() =>
      db.select({
        id: vocabularyBank.id,
        unitId: vocabularyBank.unitId,
        wordAr: vocabularyBank.wordAr,
        transliteration: vocabularyBank.transliteration,
        english: vocabularyBank.english,
        wordType: vocabularyBank.wordType,
        rootArabic: vocabularyBank.rootArabic,
        tokenCount: vocabularyBank.tokenCount,
        quranicRef: vocabularyBank.quranicRef,
        difficulty: vocabularyBank.difficulty,
        createdAt: vocabularyBank.createdAt,
      }).from(vocabularyBank)
    ),
    dbQuery(() =>
      db.select({
        lessonId: userLessonProgress.lessonId,
        unitId: learningLessons.unitId,
      })
        .from(userLessonProgress)
        .innerJoin(learningLessons, eq(userLessonProgress.lessonId, learningLessons.id))
        .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.status, 'completed')))
    ),
  ]);

  const completedByUnit = new Map<string, number>();
  for (const p of progress) {
    completedByUnit.set(p.unitId, (completedByUnit.get(p.unitId) ?? 0) + 1);
  }

  const lessonCountByUnit = new Map(units.map((u) => [u.unitId, u.lessonCount]));

  // Group vocab by unit in stable order
  const vocabByUnit = new Map<string, typeof vocab>();
  for (const v of vocab) {
    if (!v.unitId) continue;
    const arr = vocabByUnit.get(v.unitId) ?? [];
    arr.push(v);
    vocabByUnit.set(v.unitId, arr);
  }

  const learned: LearnedWord[] = [];
  for (const [unitId, words] of vocabByUnit) {
    const total = lessonCountByUnit.get(unitId) ?? 0;
    const done = completedByUnit.get(unitId) ?? 0;
    if (total === 0 || done === 0) continue;
    words.sort((a, b) =>
      (a.difficulty ?? 1) - (b.difficulty ?? 1) ||
      (a.createdAt && b.createdAt ? a.createdAt.getTime() - b.createdAt.getTime() : 0) ||
      a.wordAr.localeCompare(b.wordAr)
    );
    const unlocked = Math.min(words.length, Math.ceil((done / total) * words.length));
    for (const w of words.slice(0, unlocked)) {
      learned.push({
        id: w.id,
        wordAr: w.wordAr,
        transliteration: w.transliteration,
        english: w.english,
        wordType: w.wordType,
        rootArabic: w.rootArabic,
        tokenCount: w.tokenCount,
        quranicRef: w.quranicRef,
      });
    }
  }
  return learned;
}

export interface Coverage {
  percent: number;        // 0-100, one decimal
  tokensRecognized: number;
  totalTokens: number;
  wordsLearned: number;
  rootsLearned: number;
}

/** % of the Quran's word tokens whose root (or standalone form) the user has studied. */
export async function getCoverage(userId: string): Promise<Coverage> {
  const learned = await getLearnedWords(userId);

  const roots = [...new Set(learned.map((w) => w.rootArabic).filter((r): r is string => !!r))];
  const harfTokens = learned
    .filter((w) => w.wordType === 'harf')
    .reduce((sum, w) => sum + (w.tokenCount ?? 0), 0);

  let rootTokens = 0;
  if (roots.length > 0) {
    const [row] = await dbQuery(() =>
      db.select({ n: sql<number>`count(*)::int` })
        .from(quranWords)
        .where(inArray(quranWords.rootArabic, roots))
    );
    rootTokens = row?.n ?? 0;
  }

  const tokensRecognized = rootTokens + harfTokens;
  return {
    percent: Math.round((tokensRecognized / TOTAL_QURAN_TOKENS) * 1000) / 10,
    tokensRecognized,
    totalTokens: TOTAL_QURAN_TOKENS,
    wordsLearned: learned.length,
    rootsLearned: roots.length,
  };
}
