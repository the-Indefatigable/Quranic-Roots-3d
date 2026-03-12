export interface ConjugationForm {
  person: string; // '3ms', '3fs', '2ms', '2fs', '1s', '3mp', '3fp', '2mp', '2fp', '1p'
  arabic: string;
  transliteration: string;
  english: string;
}

export interface Tense {
  id: string;
  type: 'madi' | 'mudari' | 'amr' | 'passive_madi' | 'passive_mudari';
  arabicName: string;
  englishName: string;
  color: string;
  occurrences: number;
  references: string[];
  conjugation: ConjugationForm[];
}

export interface Bab {
  id: string;
  form: string; // 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'
  arabicPattern: string;
  romanNumeral: string;
  meaning: string;
  semanticMeaning?: string;
  verbMeaning?: string; // specific meaning of this root in this form, e.g. "to teach" for Form II of علم
  prepositions?: { preposition: string; meaning: string }[];
  color: string;
  tenses: Tense[];
}

export interface VerbRoot {
  id: string;
  root: string;
  rootLetters: string[];
  meaning: string;
  babs: Bab[];
  totalFreq?: number;
}

// ── Color maps ──────────────────────────────────────────────────────────────────

export const TENSE_COLORS: Record<string, string> = {
  madi: '#ffd700',
  mudari: '#00d4ff',
  amr: '#ff6b6b',
  passive_madi: '#c084fc',
  passive_mudari: '#86efac',
};

export const BAB_COLORS: Record<string, string> = {
  I: '#4a9eff',
  II: '#f97316',
  III: '#a855f7',
  IV: '#22c55e',
  V: '#ec4899',
  VI: '#14b8a6',
  VII: '#f59e0b',
  VIII: '#64748b',
  IX: '#ef4444',
  X: '#8b5cf6',
};

// ─── Real data loaded from parsed Quranic corpus ────────────────────────────────
import { rebuildSearchIndex } from '../store/useStore';

export const verbRoots: VerbRoot[] = [];

export async function initData(): Promise<void> {
  const res = await fetch('/data/verbsData.json');
  if (!res.ok) throw new Error(`Failed to load verb data: ${res.status} ${res.statusText}`);
  const jsonData = await res.json() as { roots: VerbRoot[] };
  const roots = jsonData.roots;

  // Calculate total occurrences to determine frequency order
  roots.forEach(r => {
    let freq = 0;
    r.babs.forEach(b => b.tenses.forEach(t => { freq += t.occurrences; }));
    r.totalFreq = freq;
  });

  // Sort strictly by frequency (most frequent first)
  roots.sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0));

  verbRoots.push(...roots);

  // Rebuild the search index now that data is populated
  rebuildSearchIndex();
}
