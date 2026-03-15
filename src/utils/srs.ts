/**
 * Spaced-Repetition System (SRS) — standalone module.
 * Manages mastery levels, review scheduling, and queue ordering.
 */
import type { VerbRoot } from '../data/verbs';

const SRS_KEY = 'quranic_srs_v1';

export interface SRSRecord {
  mastery: number;      // 0–5
  nextReview: number;   // epoch ms
}

export type SRSData = Record<string, SRSRecord>;

// Intervals in ms by mastery level
const SRS_INTERVALS = [
  0,                  // 0 — immediate / unseen
  1  * 86_400_000,    // 1 — 1 day
  3  * 86_400_000,    // 2 — 3 days
  7  * 86_400_000,    // 3 — 1 week
  14 * 86_400_000,    // 4 — 2 weeks
  30 * 86_400_000,    // 5 — 1 month
];

export function loadSRS(): SRSData {
  try {
    const raw = localStorage.getItem(SRS_KEY);
    if (raw) return JSON.parse(raw) as SRSData;
  } catch { /* ignore */ }
  return {};
}

export function saveSRS(data: SRSData) {
  try { localStorage.setItem(SRS_KEY, JSON.stringify(data)); } catch { /* ignore */ }
}

export function updateSRS(data: SRSData, rootId: string, correct: number, total: number): SRSData {
  const rec = data[rootId] ?? { mastery: 0, nextReview: 0 };
  const ratio = correct / Math.max(total, 1);
  let newMastery: number;
  let intervalMultiplier: number;

  if (ratio === 1) {
    newMastery = Math.min(5, rec.mastery + 1);
    intervalMultiplier = 1;
  } else if (ratio >= 0.5) {
    newMastery = rec.mastery;
    intervalMultiplier = 0.5;
  } else {
    newMastery = Math.max(0, rec.mastery - 1);
    intervalMultiplier = 0; // 1-hour retry
  }

  const interval = newMastery === 0 && intervalMultiplier === 0
    ? 3_600_000
    : Math.round(SRS_INTERVALS[newMastery] * intervalMultiplier || SRS_INTERVALS[newMastery]);

  return {
    ...data,
    [rootId]: { mastery: newMastery, nextReview: Date.now() + interval },
  };
}

/** Sort roots by SRS priority: overdue → new → upcoming */
export function buildSRSQueue(srsData: SRSData, roots: VerbRoot[]): VerbRoot[] {
  const now = Date.now();
  const overdue: VerbRoot[] = [];
  const unseen:  VerbRoot[] = [];
  const upcoming: VerbRoot[] = [];

  for (const root of roots) {
    const rec = srsData[root.id];
    if (!rec) {
      unseen.push(root);
    } else if (rec.nextReview <= now) {
      overdue.push(root);
    } else {
      upcoming.push(root);
    }
  }

  overdue.sort((a, b) => (srsData[a.id]?.nextReview ?? 0) - (srsData[b.id]?.nextReview ?? 0));
  upcoming.sort((a, b) => (srsData[a.id]?.nextReview ?? 0) - (srsData[b.id]?.nextReview ?? 0));

  // Shuffle unseen so new roots appear in random order
  const shuffled = [...unseen];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return [...overdue, ...shuffled, ...upcoming];
}

/** Get a human-readable due label for a root's SRS record */
export function getDueLabel(rec: SRSRecord | undefined): string {
  if (!rec) return 'New';
  const diff = rec.nextReview - Date.now();
  if (diff <= 0) return 'Due';
  if (diff < 86_400_000) return 'Due today';
  return `Due in ${Math.ceil(diff / 86_400_000)}d`;
}
