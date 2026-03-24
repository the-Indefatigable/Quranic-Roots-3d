/**
 * Answer validation utilities for quiz system
 * Handles Arabic diacritics, whitespace normalization, and flexible matching
 */

/**
 * Remove Arabic diacritics (tashkeel) from text
 * Includes: fatha, damma, kasra, shadda, sukun, tanwin variants, etc.
 */
export function stripDiacritics(text: string): string {
  const diacritics = /[\u064B-\u0652\u0670]/g; // Arabic diacritic range
  return text.replace(diacritics, '');
}

/**
 * Normalize Arabic text: remove diacritics, trim, collapse whitespace
 */
function normalizeText(text: string): string {
  return stripDiacritics(text)
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

/**
 * Validate user answer against correct answers
 * Flexible matching: strips diacritics, normalizes whitespace
 *
 * @param userAnswer - User's typed answer
 * @param correctAnswers - Array of valid answers (with/without diacritics)
 * @returns { isCorrect: boolean, feedback: string }
 */
export function validateAnswer(
  userAnswer: string,
  correctAnswers: string[]
): {
  isCorrect: boolean;
  feedback: string;
  normalizedAnswer: string;
} {
  if (!userAnswer || correctAnswers.length === 0) {
    return {
      isCorrect: false,
      feedback: 'No answer provided',
      normalizedAnswer: '',
    };
  }

  const normalizedUser = normalizeText(userAnswer);
  const normalizedCorrect = correctAnswers.map(normalizeText);

  const isCorrect = normalizedCorrect.includes(normalizedUser);

  return {
    isCorrect,
    feedback: isCorrect
      ? 'Correct! Well done.'
      : `Close! The answer is: ${correctAnswers[0]}`,
    normalizedAnswer: normalizedUser,
  };
}

/**
 * Validate multiple choice answer
 * Simple exact match check
 */
export function validateMCQ(
  userSelection: string,
  correctAnswerId: string
): {
  isCorrect: boolean;
  feedback: string;
} {
  const isCorrect = userSelection === correctAnswerId;
  return {
    isCorrect,
    feedback: isCorrect ? 'Correct!' : 'Incorrect. Try again.',
  };
}

/**
 * Validate structured answer (e.g., {person: "3ms", tense: "past"})
 */
export function validateStructured(
  userAnswer: Record<string, any>,
  correctAnswer: Record<string, any>
): {
  isCorrect: boolean;
  feedback: string;
} {
  const isCorrect = JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
  return {
    isCorrect,
    feedback: isCorrect ? 'Correct!' : 'Incorrect. Try again.',
  };
}
