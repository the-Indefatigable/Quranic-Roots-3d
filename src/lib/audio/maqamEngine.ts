/**
 * maqamEngine.ts — Jins-based maqam detection.
 *
 * Real maqam theory works bottom-up from tetrachords (ajnas), not top-down from scales.
 * A maqam = lower jins + upper jins. We detect the lower jins first from the opening
 * notes of a phrase, then attempt to identify the full maqam from both ajnas.
 *
 * Key improvements:
 * 1. Uses jins (3-5 note groups) instead of full 7-note scale matching
 * 2. Works with fractional MIDI from the YIN detector — preserves quarter-tones
 * 3. Requires a minimum accumulation window before making a call
 * 4. Can detect modulations (jins shifts mid-recitation)
 */

// ─── Jins definitions ───
// Intervals in semitones from the jins root. Quarter-tones use 0.5 increments.

export interface JinsDefinition {
  name: string;
  /** Intervals from root in semitones (including 0 for root) */
  intervals: number[];
  /** Description for UI */
  description: string;
}

export const AJNAS: JinsDefinition[] = [
  { name: 'Bayati',   intervals: [0, 1.5, 3, 5],    description: 'Warm, contemplative — most common in Quran' },
  { name: 'Rast',     intervals: [0, 2, 3.5, 5],     description: 'Bright, noble — often used for openings' },
  { name: 'Nahawand', intervals: [0, 2, 3, 5],       description: 'Minor feel — emotional, reflective' },
  { name: 'Hijaz',    intervals: [0, 1, 4, 5],       description: 'Distinctive augmented 2nd — dramatic' },
  { name: 'Saba',     intervals: [0, 1.5, 3, 4],     description: 'Sorrowful, longing' },
  { name: 'Sikah',    intervals: [0, 1.5, 3.5],      description: 'Quarter-tone start — spiritual' },
  { name: 'Kurd',     intervals: [0, 1, 3, 5],       description: 'Phrygian feel — gentle, flowing' },
  { name: 'Ajam',     intervals: [0, 2, 4, 5],       description: 'Major feel — joyful, triumphant' },
];

// ─── Full maqam definitions (lower jins + upper jins) ───

export interface MaqamDefinition {
  name: string;
  lowerJins: string;
  upperJins: string;
  /** Full scale intervals for reference */
  intervals: number[];
}

export const MAQAMAT: MaqamDefinition[] = [
  { name: 'Bayati',    lowerJins: 'Bayati',   upperJins: 'Nahawand', intervals: [0, 1.5, 3, 5, 7, 8, 10] },
  { name: 'Rast',      lowerJins: 'Rast',     upperJins: 'Rast',     intervals: [0, 2, 3.5, 5, 7, 9, 10.5] },
  { name: 'Nahawand',  lowerJins: 'Nahawand', upperJins: 'Hijaz',    intervals: [0, 2, 3, 5, 7, 8, 11] },
  { name: 'Hijaz',     lowerJins: 'Hijaz',    upperJins: 'Nahawand', intervals: [0, 1, 4, 5, 7, 8, 10] },
  { name: 'Saba',      lowerJins: 'Saba',     upperJins: 'Hijaz',    intervals: [0, 1.5, 3, 4, 5, 8, 10] },
  { name: 'Sikah',     lowerJins: 'Sikah',    upperJins: 'Rast',     intervals: [0, 1.5, 3.5, 5, 7, 8.5, 10.5] },
  { name: 'Kurd',      lowerJins: 'Kurd',     upperJins: 'Nahawand', intervals: [0, 1, 3, 5, 7, 8, 10] },
  { name: 'Ajam',      lowerJins: 'Ajam',     upperJins: 'Ajam',     intervals: [0, 2, 4, 5, 7, 9, 11] },
];

// ─── Detection state ───

export interface MaqamDetectionState {
  /** Accumulated fractional MIDI pitch values (raw, not quantized) */
  pitchHistory: number[];
  /** Timestamps in ms for when each pitch was recorded */
  timestamps: number[];
  /** Detected lower jins (if any) */
  lowerJins: JinsMatch | null;
  /** Detected full maqam (if any — requires upper jins confirmation) */
  maqam: MaqamMatch | null;
  /** Jins modulations detected during the recitation */
  modulations: JinsModulation[];
}

export interface JinsMatch {
  jins: JinsDefinition;
  root: number; // MIDI note of the jins root
  confidence: number; // 0–1
}

export interface MaqamMatch {
  maqam: MaqamDefinition;
  root: number;
  confidence: number;
}

export interface JinsModulation {
  fromJins: string;
  toJins: string;
  atTimestamp: number;
}

/** Minimum accumulation time in ms before showing maqam detection */
const MIN_ACCUMULATION_MS = 10000; // 10 seconds
/** Minimum number of distinct pitches needed */
const MIN_PITCH_COUNT = 20;
/** Tolerance for interval matching in semitones (generous for quarter-tone wiggle) */
const INTERVAL_TOLERANCE = 0.6;

// ─── Core detection ───

export function createMaqamDetectionState(): MaqamDetectionState {
  return {
    pitchHistory: [],
    timestamps: [],
    lowerJins: null,
    maqam: null,
    modulations: [],
  };
}

/**
 * Add a new pitch observation and update detection.
 * Call this on every frame where pitch is detected.
 */
export function updateMaqamDetection(
  state: MaqamDetectionState,
  midiPitch: number,
  timestampMs: number
): MaqamDetectionState {
  const newState = { ...state };
  newState.pitchHistory = [...state.pitchHistory, midiPitch];
  newState.timestamps = [...state.timestamps, timestampMs];

  // Check if we have enough data
  const elapsed = newState.timestamps.length > 0
    ? timestampMs - newState.timestamps[0]
    : 0;

  if (newState.pitchHistory.length < MIN_PITCH_COUNT || elapsed < MIN_ACCUMULATION_MS) {
    return newState;
  }

  // Step 1: Find the likely tonic (most frequently visited pitch class)
  const tonic = findTonic(newState.pitchHistory);

  // Step 2: Extract intervals relative to tonic
  const intervals = extractIntervals(newState.pitchHistory, tonic);

  // Step 3: Match lower jins (first 4-5 notes)
  const lowerJins = matchJins(intervals);
  newState.lowerJins = lowerJins;

  // Step 4: If we have a lower jins, try to identify the full maqam
  if (lowerJins) {
    // Check upper register intervals (5th and above)
    const upperIntervals = intervals.filter(i => i >= 4.5);
    const upJins = matchJinsFromIntervals(upperIntervals.map(i => i - 5)); // normalize to upper jins root

    if (upJins) {
      // Find matching maqam
      const matchingMaqam = MAQAMAT.find(
        m => m.lowerJins === lowerJins.jins.name && m.upperJins === upJins.jins.name
      );
      if (matchingMaqam) {
        newState.maqam = {
          maqam: matchingMaqam,
          root: tonic,
          confidence: (lowerJins.confidence + upJins.confidence) / 2,
        };
      }
    }

    // Fallback: if no upper jins but lower jins is strong, name the maqam from lower jins alone
    if (!newState.maqam && lowerJins.confidence > 0.7) {
      const fallbackMaqam = MAQAMAT.find(m => m.lowerJins === lowerJins.jins.name);
      if (fallbackMaqam) {
        newState.maqam = {
          maqam: fallbackMaqam,
          root: tonic,
          confidence: lowerJins.confidence * 0.8, // reduce confidence for single-jins identification
        };
      }
    }

    // Detect modulations: check last 5 seconds of data for jins shift
    if (newState.timestamps.length > 30) {
      const recentCutoff = timestampMs - 5000;
      const recentPitches = newState.pitchHistory.filter(
        (_, i) => newState.timestamps[i] >= recentCutoff
      );
      if (recentPitches.length >= 8) {
        const recentIntervals = extractIntervals(recentPitches, tonic);
        const recentJins = matchJins(recentIntervals);
        if (recentJins && lowerJins && recentJins.jins.name !== lowerJins.jins.name && recentJins.confidence > 0.6) {
          // Check if this modulation is already recorded
          const lastMod = newState.modulations[newState.modulations.length - 1];
          if (!lastMod || lastMod.toJins !== recentJins.jins.name) {
            newState.modulations = [...newState.modulations, {
              fromJins: lowerJins.jins.name,
              toJins: recentJins.jins.name,
              atTimestamp: timestampMs,
            }];
          }
        }
      }
    }
  }

  return newState;
}

// ─── Internal helpers ───

/** Find the tonic = most frequently visited pitch class (in fractional MIDI mod 12). */
function findTonic(pitches: number[]): number {
  // Quantize to quarter-tones (0.5 semitone bins) to find the most common pitch class
  const bins = new Map<number, number>();
  for (const p of pitches) {
    const bin = Math.round((p % 12) * 2) / 2; // quarter-tone resolution
    bins.set(bin, (bins.get(bin) ?? 0) + 1);
  }

  let maxCount = 0;
  let tonic = 0;
  bins.forEach((count, bin) => {
    if (count > maxCount) {
      maxCount = count;
      tonic = bin;
    }
  });

  // Find the actual MIDI note closest to this pitch class in the lowest octave observed
  const lowestOctave = Math.min(...pitches.map(p => Math.floor(p / 12)));
  return lowestOctave * 12 + tonic;
}

/** Extract unique intervals (in semitones) relative to tonic, at quarter-tone resolution. */
function extractIntervals(pitches: number[], tonic: number): number[] {
  const intervalSet = new Set<number>();
  for (const p of pitches) {
    const interval = ((p - tonic) % 12 + 12) % 12;
    // Quantize to quarter-tone
    const quantized = Math.round(interval * 2) / 2;
    intervalSet.add(quantized);
  }
  return [...intervalSet].sort((a, b) => a - b);
}

/** Match a set of intervals against known ajnas, return the best match. */
function matchJins(allIntervals: number[]): JinsMatch | null {
  // Focus on lower register (0 to ~5 semitones)
  const lowerIntervals = allIntervals.filter(i => i <= 5.5);
  return matchJinsFromIntervals(lowerIntervals);
}

function matchJinsFromIntervals(intervals: number[]): JinsMatch | null {
  if (intervals.length < 3) return null;

  let best: JinsMatch | null = null;

  for (const jins of AJNAS) {
    let matches = 0;
    for (const jinsInterval of jins.intervals) {
      if (intervals.some(i => Math.abs(i - jinsInterval) <= INTERVAL_TOLERANCE)) {
        matches++;
      }
    }
    const confidence = matches / jins.intervals.length;

    if (confidence > 0.6 && (!best || confidence > best.confidence)) {
      best = {
        jins,
        root: 0, // filled in by caller
        confidence,
      };
    }
  }

  return best;
}

/** Format maqam detection result for display. */
export function formatMaqamDisplay(state: MaqamDetectionState): {
  label: string;
  sublabel: string;
  confidence: number;
} | null {
  if (state.maqam) {
    const jinsDesc = state.lowerJins?.jins.description ?? '';
    const modCount = state.modulations.length;
    const sublabel = modCount > 0
      ? `${jinsDesc} · ${modCount} modulation${modCount > 1 ? 's' : ''}`
      : jinsDesc;
    return {
      label: `Maqam ${state.maqam.maqam.name}`,
      sublabel,
      confidence: Math.round(state.maqam.confidence * 100),
    };
  }

  if (state.lowerJins) {
    return {
      label: `${state.lowerJins.jins.name} jins`,
      sublabel: state.lowerJins.jins.description,
      confidence: Math.round(state.lowerJins.confidence * 100),
    };
  }

  return null;
}
