/**
 * phraseScorer.ts — Per-phrase scoring engine for Quran recitation practice.
 *
 * Evaluates each ayah/phrase as a unit with breakdown:
 * - Pitch accuracy (50%): DTW-based contour comparison
 * - Rhythm/timing (30%): Word-onset alignment
 * - Sustain accuracy (20%): Madd duration comparison
 *
 * Returns letter grades with specific feedback.
 */

import { pitchContourSimilarity } from './dtw';

// ─── Types ───

export type LetterGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface PhraseScore {
  /** Overall score 0–100 */
  overall: number;
  /** Letter grade */
  grade: LetterGrade;
  /** Sub-scores */
  pitch: number;
  rhythm: number;
  sustain: number;
  /** Specific feedback messages */
  feedback: string[];
  /** Ayah number this score is for */
  ayahNumber: number;
}

export interface SustainSegment {
  /** Start index in pitch array */
  startIndex: number;
  /** End index in pitch array */
  endIndex: number;
  /** Average MIDI pitch during sustain */
  avgPitch: number;
  /** Duration in frames */
  durationFrames: number;
}

// ─── Scoring weights ───

const WEIGHT_PITCH = 0.50;
const WEIGHT_RHYTHM = 0.30;
const WEIGHT_SUSTAIN = 0.20;

// ─── Grade thresholds ───

function scoreToGrade(score: number): LetterGrade {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// ─── Core scoring ───

/**
 * Score a single phrase (ayah) by comparing user's recording to the qari's.
 *
 * @param qariPitches Qari's fractional MIDI pitch array (nulls = silence)
 * @param userPitches User's fractional MIDI pitch array (nulls = silence)
 * @param qariWordOnsets Frame indices where each word starts in the qari's audio
 * @param userWordOnsets Frame indices where each word starts in the user's audio (if detected)
 * @param ayahNumber The ayah number for reference
 * @param fps Frames per second of the pitch detection (typically ~60)
 */
export function scorePhrase(
  qariPitches: (number | null)[],
  userPitches: (number | null)[],
  qariWordOnsets: number[],
  userWordOnsets: number[],
  ayahNumber: number,
  fps: number = 60
): PhraseScore {
  const feedback: string[] = [];

  // ── 1. Pitch accuracy ──
  const qariMidi = qariPitches.filter((p): p is number => p !== null);
  const userMidi = userPitches.filter((p): p is number => p !== null);

  let pitchScore = 0;
  if (qariMidi.length >= 3 && userMidi.length >= 3) {
    pitchScore = pitchContourSimilarity(qariMidi, userMidi);
  }

  // Generate pitch feedback
  if (pitchScore < 50) {
    // Check if user was consistently sharp or flat
    const avgQari = average(qariMidi);
    const avgUser = average(userMidi);
    const centsDiff = (avgUser - avgQari) * 100;
    if (Math.abs(centsDiff) > 30) {
      feedback.push(
        centsDiff > 0
          ? `Overall pitch was ~${Math.round(centsDiff)} cents sharp`
          : `Overall pitch was ~${Math.round(Math.abs(centsDiff))} cents flat`
      );
    } else {
      feedback.push('Pitch contour didn\'t match the qari\'s melody');
    }
  } else if (pitchScore < 75) {
    // Identify the worst section
    const sectionSize = Math.floor(qariMidi.length / 3);
    if (sectionSize > 2) {
      const sections = ['opening', 'middle', 'ending'];
      let worstScore = 100;
      let worstSection = 0;
      for (let s = 0; s < 3; s++) {
        const start = s * sectionSize;
        const end = s === 2 ? qariMidi.length : (s + 1) * sectionSize;
        const secScore = pitchContourSimilarity(
          qariMidi.slice(start, end),
          userMidi.slice(
            Math.floor(start * userMidi.length / qariMidi.length),
            Math.floor(end * userMidi.length / qariMidi.length)
          )
        );
        if (secScore < worstScore) {
          worstScore = secScore;
          worstSection = s;
        }
      }
      feedback.push(`The ${sections[worstSection]} of the phrase needs work — pitch was off`);
    }
  }

  // ── 2. Rhythm / timing ──
  let rhythmScore = 0;
  if (qariWordOnsets.length > 1 && userWordOnsets.length > 1) {
    rhythmScore = scoreRhythm(qariWordOnsets, userWordOnsets, qariPitches.length, userPitches.length);
  } else {
    // No word onset data — give a reasonable default based on duration match
    const durationRatio = userPitches.length / Math.max(1, qariPitches.length);
    rhythmScore = durationRatio > 0.5 && durationRatio < 2.0
      ? Math.round(70 + 30 * (1 - Math.abs(1 - durationRatio)))
      : 30;
  }

  if (rhythmScore < 60) {
    const durationRatio = userPitches.length / Math.max(1, qariPitches.length);
    if (durationRatio < 0.7) {
      feedback.push('You recited too quickly — try slowing down');
    } else if (durationRatio > 1.5) {
      feedback.push('Your pace was slower than the qari');
    } else {
      feedback.push('Word timing didn\'t align well — listen to the qari\'s rhythm');
    }
  }

  // ── 3. Sustain / madd accuracy ──
  const qariSustains = detectSustains(qariPitches, fps);
  const userSustains = detectSustains(userPitches, fps);
  let sustainScore = 100; // default if no madd detected

  if (qariSustains.length > 0) {
    sustainScore = scoreSustains(qariSustains, userSustains, fps);

    if (sustainScore < 60 && qariSustains.length > 0) {
      // Find the madd with the biggest difference
      const qariMaxMadd = qariSustains.reduce((a, b) =>
        a.durationFrames > b.durationFrames ? a : b
      );
      const expectedBeats = qariMaxMadd.durationFrames / (fps / 2); // rough beats

      // Find corresponding user sustain
      const matchingUser = userSustains.find(
        u => Math.abs(u.avgPitch - qariMaxMadd.avgPitch) < 2 // within 2 semitones
      );

      if (matchingUser) {
        const userBeats = matchingUser.durationFrames / (fps / 2);
        const diff = expectedBeats - userBeats;
        if (diff > 0.5) {
          feedback.push(`Your madd was ~${diff.toFixed(1)} beats short`);
        } else if (diff < -0.5) {
          feedback.push(`Your madd was ~${Math.abs(diff).toFixed(1)} beats too long`);
        }
      } else {
        feedback.push('Missed a madd (elongation) that the qari held');
      }
    }
  }

  // ── Combine scores ──
  const overall = Math.round(
    pitchScore * WEIGHT_PITCH +
    rhythmScore * WEIGHT_RHYTHM +
    sustainScore * WEIGHT_SUSTAIN
  );

  // Add positive feedback for good scores
  if (overall >= 90) {
    feedback.unshift('Excellent! Nearly perfect match 🌟');
  } else if (overall >= 80) {
    feedback.unshift('Great job! Very close to the qari');
  } else if (overall >= 70) {
    feedback.unshift('Good effort — keep practicing');
  }

  return {
    overall,
    grade: scoreToGrade(overall),
    pitch: Math.round(pitchScore),
    rhythm: Math.round(rhythmScore),
    sustain: Math.round(sustainScore),
    feedback,
    ayahNumber,
  };
}

// ─── Internal helpers ───

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/**
 * Score rhythm by comparing relative word onset positions.
 * Normalizes both to [0, 1] range so absolute tempo doesn't matter.
 */
function scoreRhythm(
  qariOnsets: number[],
  userOnsets: number[],
  qariLen: number,
  userLen: number
): number {
  // Normalize onsets to [0, 1]
  const qariNorm = qariOnsets.map(o => o / Math.max(1, qariLen));
  const userNorm = userOnsets.map(o => o / Math.max(1, userLen));

  // Compare each word onset
  const matchCount = Math.min(qariNorm.length, userNorm.length);
  let totalDiff = 0;

  for (let i = 0; i < matchCount; i++) {
    const diff = Math.abs(qariNorm[i] - userNorm[i]);
    totalDiff += diff;
  }

  // Penalty for missing/extra words
  const wordCountDiff = Math.abs(qariNorm.length - userNorm.length);

  const avgDiff = matchCount > 0 ? totalDiff / matchCount : 1;
  // 0.0 diff → 100, 0.15 diff → 50, 0.3+ diff → 0
  const baseScore = Math.max(0, Math.round(100 - avgDiff * 333));
  const penalty = wordCountDiff * 10;

  return Math.max(0, baseScore - penalty);
}

/**
 * Detect sustained note segments (madd/elongation).
 * A sustain = consecutive frames at nearly the same pitch.
 */
function detectSustains(
  pitches: (number | null)[],
  fps: number,
  minDurationSec: number = 0.3
): SustainSegment[] {
  const minFrames = Math.floor(minDurationSec * fps);
  const segments: SustainSegment[] = [];

  let start = -1;
  let totalPitch = 0;
  let count = 0;

  for (let i = 1; i < pitches.length; i++) {
    const curr = pitches[i];
    const prev = pitches[i - 1];

    const isSame = curr !== null && prev !== null
      && Math.abs(curr - prev) < 0.5; // within half a semitone = same note

    if (isSame) {
      if (start === -1) {
        start = i - 1;
        totalPitch = prev!;
        count = 1;
      }
      totalPitch += curr!;
      count++;
    } else {
      if (start !== -1 && count >= minFrames) {
        segments.push({
          startIndex: start,
          endIndex: i - 1,
          avgPitch: totalPitch / count,
          durationFrames: count,
        });
      }
      start = -1;
      totalPitch = 0;
      count = 0;
    }
  }

  // Check final segment
  if (start !== -1 && count >= minFrames) {
    segments.push({
      startIndex: start,
      endIndex: pitches.length - 1,
      avgPitch: totalPitch / count,
      durationFrames: count,
    });
  }

  return segments;
}

/**
 * Compare user's sustain segments against qari's.
 * Score based on duration match of corresponding sustains.
 */
function scoreSustains(
  qariSustains: SustainSegment[],
  userSustains: SustainSegment[],
  _fps: number
): number {
  if (qariSustains.length === 0) return 100;

  let totalScore = 0;

  for (const qSus of qariSustains) {
    // Find the user sustain closest in pitch
    const matching = userSustains.find(
      u => Math.abs(u.avgPitch - qSus.avgPitch) < 2
    );

    if (!matching) {
      totalScore += 0; // Missed this sustain entirely
    } else {
      // Score based on duration ratio (1.0 = perfect)
      const ratio = matching.durationFrames / qSus.durationFrames;
      // 1.0 → 100, 0.5 or 1.5 → 50, <0.25 or >2.0 → 0
      const durationScore = Math.max(0, 100 - Math.abs(1 - ratio) * 100);
      totalScore += durationScore;
    }
  }

  return Math.round(totalScore / qariSustains.length);
}

// ─── Session tracking ───

export interface SessionStats {
  /** All scores from this session */
  scores: PhraseScore[];
  /** Average overall score */
  averageScore: number;
  /** Best score */
  bestScore: number;
  /** Average per category */
  averagePitch: number;
  averageRhythm: number;
  averageSustain: number;
}

export function computeSessionStats(scores: PhraseScore[]): SessionStats {
  if (scores.length === 0) {
    return {
      scores: [],
      averageScore: 0,
      bestScore: 0,
      averagePitch: 0,
      averageRhythm: 0,
      averageSustain: 0,
    };
  }

  return {
    scores,
    averageScore: Math.round(average(scores.map(s => s.overall))),
    bestScore: Math.max(...scores.map(s => s.overall)),
    averagePitch: Math.round(average(scores.map(s => s.pitch))),
    averageRhythm: Math.round(average(scores.map(s => s.rhythm))),
    averageSustain: Math.round(average(scores.map(s => s.sustain))),
  };
}
