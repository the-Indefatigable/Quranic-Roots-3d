/**
 * Quiz question generator
 * Generates adaptive questions based on learning items (roots, nouns, particles)
 */

import { randomUUID } from 'crypto';
import type { InferSelectModel } from 'drizzle-orm';
import type { roots, forms, tenses, nouns, particles } from '@/db/schema';

/**
 * Fisher-Yates. `sort(() => Math.random() - 0.5)` is not a valid comparator —
 * it is non-transitive, so it leaves the first element in place far more often
 * than chance. For a quiz that means the correct option lands in a predictable
 * position.
 */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Opaque option id, so the correct choice isn't identifiable from the DOM. */
const optionId = () => randomUUID();

export type Root = InferSelectModel<typeof roots>;
export type Form = InferSelectModel<typeof forms>;
export type Tense = InferSelectModel<typeof tenses>;
export type Noun = InferSelectModel<typeof nouns>;
export type Particle = InferSelectModel<typeof particles>;

export interface Conjugation {
  person: string; // '1s', '2ms', '3ms', '3fs', '1p', '2mp', '2fp', '3mp', '3fp'
  arabic: string;
  transliteration?: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  itemType: 'root' | 'noun' | 'particle';
  itemId: string;
  prompt: QuestionPrompt;
  /**
   * The answer key. For MCQ questions this is the correct option's opaque id.
   * Server-side only — /api/quiz/start strips this (and validAnswers and
   * correctAnswerLabel) before responding.
   */
  correctAnswer: string | Record<string, any>;
  validAnswers?: string[]; // For flexible matching
  /** Human-readable form of the answer, revealed after the user has answered. */
  correctAnswerLabel?: string;
}

/** A shuffled MCQ option set plus the id and label of the correct choice. */
interface MCQOptions {
  options: NonNullable<QuestionPrompt['options']>;
  correctId: string;
  correctLabel: string;
}

export type QuestionType =
  | 'translate_conjugation'
  | 'translate_noun'
  | 'translate_particle'
  | 'identify_conjugation'
  | 'identify_root'
  | 'mcq_conjugation'
  | 'mcq_noun';

export interface QuestionPrompt {
  text: string;
  arabicText?: string;
  options?: Array<{ id: string; label: string; arabicLabel?: string }>;
  context?: string;
}

/**
 * Generate question from a root + form + tense
 * Question types: translate conjugation, identify person/tense, MCQ
 */
export function generateConjugationQuestion(
  root: Root,
  form: Form,
  tense: Tense
): QuizQuestion | null {
  // Parse conjugations from tense.conjugations JSONB
  const conjugations = tense.conjugations as Conjugation[] | undefined;
  if (!conjugations || conjugations.length === 0) return null;

  const questionTypes: QuestionType[] = [
    'translate_conjugation',
    'identify_conjugation',
    'mcq_conjugation',
  ];
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];

  // Pick random conjugation
  const randomConj = conjugations[Math.floor(Math.random() * conjugations.length)];

  if (questionType === 'translate_conjugation') {
    // Show English, user types Arabic
    // Map person to English description
    const personLabels: Record<string, string> = {
      '1s': 'I (masculine)',
      '2ms': 'you (masculine singular)',
      '2fs': 'you (feminine singular)',
      '3ms': 'he',
      '3fs': 'she',
      '1p': 'we',
      '2mp': 'you all (masculine)',
      '2fp': 'you all (feminine)',
      '3mp': 'they (masculine)',
      '3fp': 'they (feminine)',
    };

    const englishDesc = `${personLabels[randomConj.person] || randomConj.person} (${tense.englishName})`;
    const meaning = root.meaning;

    return {
      id: `conj-${root.id}-${form.id}-${tense.id}-${randomConj.person}`,
      type: 'translate_conjugation',
      itemType: 'root',
      itemId: root.id,
      prompt: {
        text: `Translate to Arabic: "${englishDesc}" from "${meaning}" (Form ${form.formNumber})`,
        context: `Root: ${root.root}`,
      },
      correctAnswer: randomConj.arabic,
      validAnswers: [randomConj.arabic],
    };
  }

  if (questionType === 'identify_conjugation') {
    // Show Arabic, user selects person + tense
    return {
      id: `ident-conj-${root.id}-${form.id}-${tense.id}`,
      type: 'identify_conjugation',
      itemType: 'root',
      itemId: root.id,
      prompt: {
        text: `Identify the person and tense of: ${randomConj.arabic}`,
        arabicText: randomConj.arabic,
        options: generateConjugationOptions(randomConj.person, tense.englishName),
      },
      correctAnswer: {
        person: randomConj.person,
        tense: tense.englishName,
        formNumber: form.formNumber,
      },
    };
  }

  // MCQ variant. correctAnswer is the *option id*, because that is what the
  // client submits and what validateMCQ compares against.
  const mcqOptions = generateConjugationMCQOptions(
    randomConj.person,
    tense.englishName,
    root.meaning
  );
  return {
    id: `mcq-conj-${root.id}-${form.id}-${tense.id}`,
    type: 'mcq_conjugation',
    itemType: 'root',
    itemId: root.id,
    prompt: {
      text: `What does this mean? ${randomConj.arabic} (Form ${form.formNumber})`,
      arabicText: randomConj.arabic,
      options: mcqOptions.options,
    },
    correctAnswer: mcqOptions.correctId,
    correctAnswerLabel: mcqOptions.correctLabel,
  };
}

/**
 * Generate question from a noun
 */
export function generateNounQuestion(
  noun: Noun,
  rootMeaning?: string,
  distractorPool: string[] = []
): QuizQuestion {
  const questionTypes: QuestionType[] = ['translate_noun', 'mcq_noun'];
  const questionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  const nounMeaning = noun.meaning || 'word';

  if (questionType === 'translate_noun') {
    return {
      id: `noun-${noun.id}`,
      type: 'translate_noun',
      itemType: 'noun',
      itemId: noun.id,
      prompt: {
        text: `Translate to Arabic: "${nounMeaning}" (${noun.type || 'noun'})`,
        context: rootMeaning ? `Related to: ${rootMeaning}` : undefined,
      },
      correctAnswer: noun.lemma,
      validAnswers: [noun.lemma, noun.lemmaClean],
    };
  }

  // MCQ variant — correctAnswer is the option id (see above).
  const mcqOptions = generateNounMCQOptions(nounMeaning, distractorPool);
  return {
    id: `mcq-noun-${noun.id}`,
    type: 'mcq_noun',
    itemType: 'noun',
    itemId: noun.id,
    prompt: {
      text: `What does this word mean? ${noun.lemma}`,
      arabicText: noun.lemma,
      options: mcqOptions.options,
    },
    correctAnswer: mcqOptions.correctId,
    correctAnswerLabel: mcqOptions.correctLabel,
  };
}

/**
 * Generate question from a particle
 */
export function generateParticleQuestion(particle: Particle): QuizQuestion {
  return {
    id: `particle-${particle.id}`,
    type: 'translate_particle',
    itemType: 'particle',
    itemId: particle.id,
    prompt: {
      text: `What does this particle mean? ${particle.form} (${particle.type || 'particle'})`,
      arabicText: particle.form,
      context: particle.exampleLocation || undefined,
    },
    correctAnswer: particle.meaning || 'unknown',
    validAnswers: particle.meaning ? [particle.meaning] : [],
  };
}

// ── Helper functions for generating multiple choice options ──

/** Build a shuffled option list from one correct label and some distractors. */
function buildOptions(correctLabel: string, distractorLabels: string[]): MCQOptions {
  // Dedupe against the correct label and against each other, so the same
  // choice can't appear twice (which would make the question unanswerable).
  const seen = new Set([correctLabel]);
  const distractors: string[] = [];
  for (const label of distractorLabels) {
    if (seen.has(label)) continue;
    seen.add(label);
    distractors.push(label);
    if (distractors.length === 3) break;
  }

  const correctId = optionId();
  const options = shuffle([
    { id: correctId, label: correctLabel },
    ...distractors.map((label) => ({ id: optionId(), label })),
  ]);

  return { options, correctId, correctLabel };
}

function generateConjugationOptions(
  correctPerson: string,
  correctTense: string
): QuizQuestion['prompt']['options'] {
  const persons = ['1s', '2ms', '3ms', '1p', '3mp'];
  const tenses = ['Past', 'Present', 'Imperative'];

  // Enumerate the grid and shuffle, rather than sampling blindly — the old
  // loop could pick the same person/tense pair twice.
  const pairs = shuffle(
    persons.flatMap((p) => tenses.map((t) => `${p} - ${t}`))
  ).filter((label) => label !== `${correctPerson} - ${correctTense}`);

  return buildOptions(`${correctPerson} - ${correctTense}`, pairs).options;
}

function generateConjugationMCQOptions(
  correctPerson: string,
  correctTense: string,
  rootMeaning: string
): MCQOptions {
  const personLabels: Record<string, string> = {
    '1s': 'I',
    '2ms': 'you',
    '3ms': 'he',
    '3fs': 'she',
    '1p': 'we',
    '3mp': 'they',
  };

  const person = personLabels[correctPerson] || correctPerson;
  const tense = correctTense.toLowerCase();
  const others = Object.values(personLabels).filter((p) => p !== person);

  return buildOptions(`${person} ${tense} (${rootMeaning})`, [
    `${person} will ${rootMeaning}`,
    ...others.map((p) => `${p} ${tense} (${rootMeaning})`),
  ]);
}

/**
 * Distractors for a noun's meaning. `pool` should be other real noun meanings
 * from the same quiz batch; the generic fallback is only used when the caller
 * has nothing better, since a fixed three-word list makes every question
 * guessable after the first.
 */
function generateNounMCQOptions(correctMeaning: string, pool: string[] = []): MCQOptions {
  const fallback = ['knowledge', 'book', 'writing', 'student', 'teacher', 'school', 'mercy', 'light'];
  const distractors = shuffle(pool.length >= 3 ? pool : [...pool, ...fallback])
    .filter((d) => d && d !== correctMeaning);

  return buildOptions(correctMeaning, distractors);
}
