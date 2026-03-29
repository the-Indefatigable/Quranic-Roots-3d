/**
 * pitchEngine.ts — YIN-based pitch detection with fractional MIDI and quarter-tone awareness.
 *
 * Key improvements over the old autocorrelation:
 * 1. Uses the YIN algorithm (cumulative mean normalized difference) for better accuracy
 * 2. Returns fractional MIDI values (69.47 not 69) to preserve quarter-tones
 * 3. Includes a confidence score to reject unreliable detections
 * 4. Quarter-tone-aware cents deviation (24-TET grid)
 */

// ─── YIN Pitch Detection ───

const YIN_THRESHOLD = 0.15;

export interface PitchResult {
  /** Detected frequency in Hz */
  frequency: number;
  /** Fractional MIDI note number (A4=440Hz → 69.0) */
  midi: number;
  /** Confidence 0–1 (lower YIN value = higher confidence) */
  confidence: number;
}

/**
 * YIN pitch detection algorithm.
 * Returns null if no confident pitch is found or signal is too quiet.
 */
export function detectPitchYIN(buffer: Float32Array, sampleRate: number): PitchResult | null {
  const SIZE = buffer.length;

  // Gate on RMS — skip silence
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return null;

  const halfSize = Math.floor(SIZE / 2);

  // Step 1: Difference function
  const diff = new Float32Array(halfSize);
  for (let tau = 0; tau < halfSize; tau++) {
    let sum = 0;
    for (let i = 0; i < halfSize; i++) {
      const delta = buffer[i] - buffer[i + tau];
      sum += delta * delta;
    }
    diff[tau] = sum;
  }

  // Step 2: Cumulative mean normalized difference function (CMND)
  const cmnd = new Float32Array(halfSize);
  cmnd[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < halfSize; tau++) {
    runningSum += diff[tau];
    cmnd[tau] = diff[tau] * tau / runningSum;
  }

  // Step 3: Absolute threshold — find the first dip below threshold
  // Search range: 60 Hz to 800 Hz (human vocal range for Quran recitation)
  const minLag = Math.floor(sampleRate / 800);
  const maxLag = Math.min(Math.floor(sampleRate / 60), halfSize - 1);

  let bestTau = -1;
  for (let tau = minLag; tau < maxLag; tau++) {
    if (cmnd[tau] < YIN_THRESHOLD) {
      // Find the local minimum in this dip
      while (tau + 1 < maxLag && cmnd[tau + 1] < cmnd[tau]) {
        tau++;
      }
      bestTau = tau;
      break;
    }
  }

  if (bestTau === -1) return null;

  // Step 4: Parabolic interpolation for sub-sample accuracy
  const s0 = cmnd[bestTau - 1] ?? cmnd[bestTau];
  const s1 = cmnd[bestTau];
  const s2 = cmnd[bestTau + 1] ?? cmnd[bestTau];
  const betterTau = bestTau + (s0 - s2) / (2 * (s0 - 2 * s1 + s2) || 1);

  const frequency = sampleRate / betterTau;
  const midi = freqToMidi(frequency);
  const confidence = 1 - cmnd[bestTau]; // Lower CMND = higher confidence

  return { frequency, midi, confidence };
}

// ─── Music theory helpers (all preserve fractional values) ───

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;

// Quarter-tone note names for display
const QUARTER_TONE_NAMES = [
  'C', 'C+', 'C#', 'C#+', 'D', 'D+', 'D#', 'D#+',
  'E', 'E+', 'F', 'F+', 'F#', 'F#+', 'G', 'G+',
  'G#', 'G#+', 'A', 'A+', 'A#', 'A#+', 'B', 'B+',
] as const;

/** Convert frequency to fractional MIDI note number. */
export function freqToMidi(freq: number): number {
  return 12 * Math.log2(freq / 440) + 69;
}

/** Convert MIDI note number to frequency. */
export function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

/** Get the Western note name (C, C#, D, etc.) from frequency. */
export function freqToNoteName(freq: number): string {
  const midi = Math.round(freqToMidi(freq));
  return NOTE_NAMES[((midi % 12) + 12) % 12];
}

/** Get full note with octave, e.g. "A4". */
export function freqToNoteLabel(freq: number): string {
  const midi = Math.round(freqToMidi(freq));
  const name = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

/** Get quarter-tone note name for maqam-aware display. */
export function freqToQuarterToneName(freq: number): string {
  const midi = freqToMidi(freq);
  // 24-TET: each quarter-tone is 0.5 semitones
  const quarterToneIndex = Math.round(midi * 2) % 24;
  return QUARTER_TONE_NAMES[((quarterToneIndex) + 24) % 24];
}

/**
 * Cents deviation from nearest semitone.
 * Returns -50 to +50.
 */
export function freqToCents(freq: number): number {
  const midi = freqToMidi(freq);
  return Math.round((midi - Math.round(midi)) * 100);
}

/**
 * Cents deviation from nearest quarter-tone (24-TET grid).
 * Returns -25 to +25.
 * Quarter-tones are essential for maqam — Bayati's 2nd degree is exactly a quarter-tone.
 */
export function freqToQuarterToneCents(freq: number): number {
  const midi = freqToMidi(freq);
  // Nearest quarter-tone in MIDI
  const nearestQuarterTone = Math.round(midi * 2) / 2;
  return Math.round((midi - nearestQuarterTone) * 100);
}

/** Calculate RMS amplitude of a buffer. */
export function detectRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i];
  return Math.sqrt(sum / buffer.length);
}

/** Frequency to Y coordinate on a canvas (log scale). */
export function freqToY(freq: number, height: number): number {
  const logMin = Math.log2(70);
  const logMax = Math.log2(700);
  const logFreq = Math.log2(Math.max(70, Math.min(700, freq)));
  return height - ((logFreq - logMin) / (logMax - logMin)) * height * 0.85 - height * 0.05;
}
