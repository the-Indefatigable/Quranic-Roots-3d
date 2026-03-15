/**
 * Noun data layer — mirrors verbs.ts pattern.
 * Loads nounsData.json and provides typed access.
 */

export interface Noun {
  id: string;
  lemma: string;
  lemmaClean: string;
  root: string;
  type: 'noun' | 'active_participle' | 'passive_participle' | 'adjective' | 'masdar' | 'proper_noun';
  typeAr: string;
  baab: string | null;
  meaning: string;
  lookupRef: string;
  references: string[];
  totalFreq?: number;
}

export const NOUN_TYPE_COLORS: Record<string, string> = {
  noun:               '#4a9eff',
  active_participle:  '#f97316',
  passive_participle: '#a855f7',
  adjective:          '#22c55e',
  masdar:             '#ec4899',
  proper_noun:        '#ffd700',
};

export const NOUN_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  noun:               { en: 'Noun',               ar: 'اسم'       },
  active_participle:  { en: 'Active Participle',  ar: 'اسم فاعل'  },
  passive_participle: { en: 'Passive Participle', ar: 'اسم مفعول' },
  adjective:          { en: 'Adjective',          ar: 'صفة'       },
  masdar:             { en: 'Verbal Noun',        ar: 'مصدر'      },
  proper_noun:        { en: 'Proper Noun',        ar: 'اسم علم'   },
};

export const nounsList: Noun[] = [];

// Surah index for nouns: Map<surahNumber, Map<nounId, firstAyah>>
export const nounSurahIndex: Map<number, Map<string, number>> = new Map();

let _onNounDataLoaded: (() => void) | null = null;
export function onNounDataLoaded(cb: () => void) { _onNounDataLoaded = cb; }

export async function initNounData(): Promise<void> {
  const res = await fetch('/data/nounsData.json');
  if (!res.ok) throw new Error(`Failed to load nouns: ${res.status}`);
  const data = await res.json() as { nouns: Noun[] };

  for (const noun of data.nouns) {
    noun.totalFreq = noun.references.length;

    // Build surah index from references
    for (const ref of noun.references) {
      const [surahStr, ayahStr] = ref.split(':');
      const surah = Number(surahStr);
      const ayah = Number(ayahStr);
      if (!nounSurahIndex.has(surah)) nounSurahIndex.set(surah, new Map());
      const surahMap = nounSurahIndex.get(surah)!;
      // Keep the first (earliest) ayah for this noun in this surah
      if (!surahMap.has(noun.id) || ayah < surahMap.get(noun.id)!) {
        surahMap.set(noun.id, ayah);
      }
    }
  }

  // Sort by frequency
  data.nouns.sort((a, b) => (b.totalFreq ?? 0) - (a.totalFreq ?? 0));
  nounsList.push(...data.nouns);

  _onNounDataLoaded?.();
}
