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
  // Derived nominal forms
  masdar?: string | null;    // verbal noun — null means irregular (Form I), needs Claude API
  faaeil?: string | null;    // active participle (فاعل pattern)
  mafool?: string | null;    // passive participle (مفعول pattern) — null for intransitive forms
  masdarNeedsApi?: boolean;  // true when derivation may be irregular (weak root, doubled, Form I)
  faaeilNeedsApi?: boolean;
  mafoolNeedsApi?: boolean;
}

export interface VerbRoot {
  id: string;
  root: string;
  rootLetters: string[];
  meaning: string;
  babs: Bab[];
  totalFreq?: number;
  allReferences?: string[];  // complete surah:ayah list from quranRoots (all tenses combined)
  enriched?: boolean;
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

// Cache of fully-loaded root details (fetched on demand)
const detailCache = new Map<string, VerbRoot>();
// Track in-flight requests to avoid duplicate fetches
const inFlight = new Map<string, Promise<VerbRoot | null>>();

export async function initData(): Promise<void> {
  // Load lightweight index only (~490KB vs 28MB full file)
  const res = await fetch('/data/index.json');
  if (!res.ok) throw new Error(`Failed to load index: ${res.status} ${res.statusText}`);
  const jsonData = await res.json() as { roots: VerbRoot[] };
  const roots = jsonData.roots;

  // Sort by pre-computed frequency (already set in index)
  roots.sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0));

  verbRoots.push(...roots);
  rebuildSearchIndex();
}

/** Fetch and cache the full detail for a single root (conjugations, references, etc.) */
export async function loadRootDetail(rootId: string): Promise<VerbRoot | null> {
  // Return cached if available
  const cached = detailCache.get(rootId);
  if (cached) return cached;

  // Deduplicate concurrent requests for the same root
  const existing = inFlight.get(rootId);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const url = `/data/roots/${encodeURIComponent(rootId)}.json`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const detail = await res.json() as VerbRoot;
      detailCache.set(rootId, detail);
      // Patch the verbRoots entry so components using verbRoots get updated data
      const idx = verbRoots.findIndex(r => r.id === rootId);
      if (idx !== -1) verbRoots[idx] = detail;
      return detail;
    } catch {
      return null;
    } finally {
      inFlight.delete(rootId);
    }
  })();

  inFlight.set(rootId, promise);
  return promise;
}

/** Pre-fetch a list of roots in the background (e.g. for quiz) */
export function prefetchRoots(rootIds: string[]): void {
  for (const id of rootIds) {
    if (!detailCache.has(id)) loadRootDetail(id);
  }
}

/**
 * Background preloader — downloads every root file after the app is ready.
 * Runs in idle time, 5 files per batch, so it never blocks the UI.
 * After completion, the app works fully offline as a PWA.
 * Skips roots already in the service worker cache.
 */
export async function preloadAllRootsInBackground(): Promise<void> {
  if (!navigator.onLine) return;

  // Check if already fully preloaded (stored flag in sessionStorage)
  if (sessionStorage.getItem('rootsPreloaded') === 'done') return;

  // Wait a bit so the initial render and first interactions are not affected
  await new Promise(r => setTimeout(r, 5000));

  const BATCH = 5;
  const DELAY = 100; // ms between batches

  const toFetch = verbRoots.filter(r => !detailCache.has(r.id));
  let downloaded = 0;

  const run = async () => {
    for (let i = 0; i < toFetch.length; i += BATCH) {
      if (!navigator.onLine) break;

      const batch = toFetch.slice(i, i + BATCH);
      await Promise.allSettled(batch.map(r => loadRootDetail(r.id)));
      downloaded += batch.length;

      // Yield to the browser between batches
      await new Promise(r => setTimeout(r, DELAY));
    }

    if (downloaded >= toFetch.length) {
      sessionStorage.setItem('rootsPreloaded', 'done');
      console.log('[PWA] All root files cached for offline use.');
    }
  };

  // Use requestIdleCallback if available, otherwise just run after delay
  if ('requestIdleCallback' in window) {
    (window as Window & { requestIdleCallback: (cb: () => void) => void })
      .requestIdleCallback(run);
  } else {
    run();
  }
}
