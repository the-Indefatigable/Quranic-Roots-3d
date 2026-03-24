/**
 * Quiz question generator
 * Generates adaptive questions based on learning items (roots, nouns, particles)
 */

import type { InferSelectModel } from 'drizzle-orm';
import type { roots, forms, tenses, nouns, particles } from '@/db/schema';

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
  correctAnswer: string | Record<string, any>;
  validAnswers?: string[]; // For flexible matching
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

  // MCQ variant
  return {
    id: `mcq-conj-${root.id}-${form.id}-${tense.id}`,
    type: 'mcq_conjugation',
    itemType: 'root',
    itemId: root.id,
    prompt: {
      text: `What does this mean? ${randomConj.arabic} (Form ${form.formNumber})`,
      arabicText: randomConj.arabic,
      options: generateConjugationMCQOptions(randomConj.person, tense.englishName, root.meaning),
    },
    correctAnswer: randomConj.arabic,
  };
}

/**
 * Generate question from a noun
 */
export function generateNounQuestion(noun: Noun, rootMeaning?: string): QuizQuestion {
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

  // MCQ variant
  return {
    id: `mcq-noun-${noun.id}`,
    type: 'mcq_noun',
    itemType: 'noun',
    itemId: noun.id,
    prompt: {
      text: `What does this word mean? ${noun.lemma}`,
      arabicText: noun.lemma,
      options: generateNounMCQOptions(nounMeaning),
    },
    correctAnswer: nounMeaning,
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

function generateConjugationOptions(
  correctPerson: string,
  correctTense: string
): QuizQuestion['prompt']['options'] {
  const persons = ['1s', '2ms', '3ms', '1p', '3mp'];
  const tenses = ['Past', 'Present', 'Imperative'];

  const correct = { id: 'correct', label: `${correctPerson} - ${correctTense}` };
  const options = [correct];

  // Add distractors
  while (options.length < 4) {
    const person = persons[Math.floor(Math.random() * persons.length)];
    const tense = tenses[Math.floor(Math.random() * tenses.length)];

    if (person !== correctPerson || tense !== correctTense) {
      options.push({
        id: `distractor-${options.length}`,
        label: `${person} - ${tense}`,
      });
    }
  }

  // Shuffle
  return options.sort(() => Math.random() - 0.5);
}

function generateConjugationMCQOptions(
  correctPerson: string,
  correctTense: string,
  rootMeaning: string
): QuizQuestion['prompt']['options'] {
  const personLabels: Record<string, string> = {
    '1s': 'I',
    '2ms': 'you',
    '3ms': 'he',
    '3fs': 'she',
    '1p': 'we',
    '3mp': 'they',
  };

  const person = personLabels[correctPerson] || correctPerson;
  const correct = {
    id: 'correct',
    label: `${person} ${correctTense.toLowerCase()} (${rootMeaning})`,
  };
  const options = [correct];

  // Add distractors (different persons/tenses)
  const distractors = [
    `${person} will ${rootMeaning}`,
    `He ${correctTense.toLowerCase()} (${rootMeaning})`,
    `She ${correctTense.toLowerCase()} (${rootMeaning})`,
  ];

  for (const distractor of distractors) {
    if (options.length >= 4) break;
    if (distractor !== correct.label) {
      options.push({
        id: `distractor-${options.length}`,
        label: distractor,
      });
    }
  }

  return options;
}

function generateNounMCQOptions(correctMeaning: string): QuizQuestion['prompt']['options'] {
  const correct = { id: 'correct', label: correctMeaning };
  const options = [correct];

  // Add plausible distractors (similar semantic field)
  const distractors = [
    'knowledge',
    'book',
    'writing',
    'student',
    'teacher',
    'school',
    'learned',
  ].filter((d) => d !== correctMeaning);

  for (let i = 0; i < Math.min(3, distractors.length); i++) {
    options.push({
      id: `distractor-${i}`,
      label: distractors[i],
    });
  }

  return options.sort(() => Math.random() - 0.5);
}
