/**
 * dtw.ts — Lightweight Dynamic Time Warping for comparing pitch contours.
 *
 * DTW handles tempo differences between the qari's recitation and the user's
 * attempt. The user might recite faster or slower but still hit the right notes.
 */

/**
 * Compute the DTW distance between two sequences.
 * Returns a normalized distance (lower = more similar).
 *
 * @param seq1 Reference sequence (qari pitch contour in MIDI)
 * @param seq2 User sequence (user pitch contour in MIDI)
 * @param distFn Distance function between two values (default: absolute difference)
 * @returns Normalized DTW distance (0 = identical, higher = worse)
 */
export function dtwDistance(
  seq1: number[],
  seq2: number[],
  distFn: (a: number, b: number) => number = (a, b) => Math.abs(a - b)
): number {
  const n = seq1.length;
  const m = seq2.length;

  if (n === 0 || m === 0) return Infinity;

  // Use a band constraint to limit computation (Sakoe–Chiba band)
  const band = Math.max(10, Math.floor(Math.max(n, m) * 0.3));

  // DP matrix — use two rows for memory efficiency
  const prev = new Float32Array(m + 1).fill(Infinity);
  const curr = new Float32Array(m + 1).fill(Infinity);
  prev[0] = 0;

  for (let i = 1; i <= n; i++) {
    curr.fill(Infinity);
    const jStart = Math.max(1, i - band);
    const jEnd = Math.min(m, i + band);

    for (let j = jStart; j <= jEnd; j++) {
      const cost = distFn(seq1[i - 1], seq2[j - 1]);
      curr[j] = cost + Math.min(
        prev[j],     // insertion
        curr[j - 1], // deletion
        prev[j - 1]  // match
      );
    }

    // Swap rows
    prev.set(curr);
  }

  // Normalize by path length
  return prev[m] / (n + m);
}

/**
 * Compute pitch contour similarity as a 0–100 score.
 *
 * @param qariMidi Array of qari's fractional MIDI values (nulls filtered out)
 * @param userMidi Array of user's fractional MIDI values (nulls filtered out)
 * @returns Score 0–100 (100 = perfect match)
 */
export function pitchContourSimilarity(
  qariMidi: number[],
  userMidi: number[]
): number {
  if (qariMidi.length < 3 || userMidi.length < 3) return 0;

  // Use cents-based distance: 100 cents = 1 semitone
  const dist = dtwDistance(
    qariMidi,
    userMidi,
    (a, b) => Math.abs(a - b) * 100 // convert semitone diff to cents
  );

  // Map distance to score:
  // 0 cents avg distance → 100 score
  // 50 cents avg distance → 50 score
  // 100+ cents avg distance → 0 score
  return Math.max(0, Math.min(100, Math.round(100 - dist)));
}

/**
 * Align two contours and return per-point similarity.
 * Used for coloring the user's contour green/yellow/red.
 *
 * @returns Array of similarity values (0–100) for each point in userMidi
 */
export function alignedSimilarity(
  qariMidi: number[],
  userMidi: number[]
): number[] {
  if (qariMidi.length === 0 || userMidi.length === 0) {
    return new Array(userMidi.length).fill(0);
  }

  // Simple linear interpolation of qari to match user length
  const result: number[] = [];
  for (let i = 0; i < userMidi.length; i++) {
    const qariIdx = (i / userMidi.length) * qariMidi.length;
    const lo = Math.floor(qariIdx);
    const hi = Math.min(lo + 1, qariMidi.length - 1);
    const frac = qariIdx - lo;
    const interpolated = qariMidi[lo] * (1 - frac) + qariMidi[hi] * frac;

    const centsDiff = Math.abs(userMidi[i] - interpolated) * 100;
    result.push(Math.max(0, Math.min(100, Math.round(100 - centsDiff))));
  }

  return result;
}
