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

export async function initData() {
  const res = await fetch(`/data/verbsData.json?t=${Date.now()}`);
  const jsonData = await res.json();
  const roots = jsonData.roots as VerbRoot[];

  // Calculate total occurrences to determine frequency order
  roots.forEach(r => {
    let freq = 0;
    r.babs.forEach(b => {
      b.tenses.forEach(t => {
        freq += t.occurrences;
      });
    });
    r.totalFreq = freq;
  });

  // Sort strictly by frequency (most frequent first)
  roots.sort((a, b) => (b.totalFreq || 0) - (a.totalFreq || 0));

  verbRoots.push(...roots);
  
  // Rebuild the search index now that data is populated
  rebuildSearchIndex();
}

// ─── Legacy sample (kept for reference) ─────────────────────────────────────────
// @ts-nocheck — below is unused sample data
const _unused_sample_start = null;
// ─── كتب (k-t-b) ────────────────────────────────────────────────────────────────

const ktb_I_madi: Tense = {
  id: 'ktb_I_madi',
  type: 'madi',
  arabicName: 'مَاضِي',
  englishName: 'Past',
  color: TENSE_COLORS.madi,
  occurrences: 12,
  references: ['2:282', '3:75', '21:105'],
  conjugation: [
    { person: '3ms', arabic: 'كَتَبَ',      transliteration: 'kataba',     english: 'he wrote' },
    { person: '3fs', arabic: 'كَتَبَتْ',    transliteration: 'katabat',    english: 'she wrote' },
    { person: '2ms', arabic: 'كَتَبْتَ',    transliteration: 'katabta',    english: 'you (m.sg) wrote' },
    { person: '2fs', arabic: 'كَتَبْتِ',    transliteration: 'katabti',    english: 'you (f.sg) wrote' },
    { person: '1s',  arabic: 'كَتَبْتُ',    transliteration: 'katabtu',    english: 'I wrote' },
    { person: '3mp', arabic: 'كَتَبُوا',    transliteration: 'katabū',     english: 'they (m) wrote' },
    { person: '3fp', arabic: 'كَتَبْنَ',    transliteration: 'katabna',    english: 'they (f) wrote' },
    { person: '2mp', arabic: 'كَتَبْتُمْ',  transliteration: 'katabtum',   english: 'you (m.pl) wrote' },
    { person: '2fp', arabic: 'كَتَبْتُنَّ', transliteration: 'katabtunna', english: 'you (f.pl) wrote' },
    { person: '1p',  arabic: 'كَتَبْنَا',   transliteration: 'katabnā',    english: 'we wrote' },
  ],
};

const ktb_I_mudari: Tense = {
  id: 'ktb_I_mudari',
  type: 'mudari',
  arabicName: 'مُضَارِع',
  englishName: 'Present',
  color: TENSE_COLORS.mudari,
  occurrences: 8,
  references: ['2:44', '9:121'],
  conjugation: [
    { person: '3ms', arabic: 'يَكْتُبُ',    transliteration: 'yaktubu',    english: 'he writes' },
    { person: '3fs', arabic: 'تَكْتُبُ',    transliteration: 'taktubu',    english: 'she writes' },
    { person: '2ms', arabic: 'تَكْتُبُ',    transliteration: 'taktubu',    english: 'you (m) write' },
    { person: '2fs', arabic: 'تَكْتُبِينَ', transliteration: 'taktubīna',  english: 'you (f) write' },
    { person: '1s',  arabic: 'أَكْتُبُ',    transliteration: 'aktubu',     english: 'I write' },
    { person: '3mp', arabic: 'يَكْتُبُونَ', transliteration: 'yaktubūna',  english: 'they (m) write' },
    { person: '3fp', arabic: 'يَكْتُبْنَ',  transliteration: 'yaktubna',   english: 'they (f) write' },
    { person: '2mp', arabic: 'تَكْتُبُونَ', transliteration: 'taktubūna',  english: 'you (m.pl) write' },
    { person: '2fp', arabic: 'تَكْتُبْنَ',  transliteration: 'taktubna',   english: 'you (f.pl) write' },
    { person: '1p',  arabic: 'نَكْتُبُ',    transliteration: 'naktubu',    english: 'we write' },
  ],
};

const ktb_I_amr: Tense = {
  id: 'ktb_I_amr',
  type: 'amr',
  arabicName: 'أَمْر',
  englishName: 'Imperative',
  color: TENSE_COLORS.amr,
  occurrences: 3,
  references: ['2:282'],
  conjugation: [
    { person: '2ms', arabic: 'اكْتُبْ',   transliteration: 'uktub',   english: 'write! (m)' },
    { person: '2fs', arabic: 'اكْتُبِي',  transliteration: 'uktubī',  english: 'write! (f)' },
    { person: '2mp', arabic: 'اكْتُبُوا', transliteration: 'uktubū',  english: 'write! (m.pl)' },
    { person: '2fp', arabic: 'اكْتُبْنَ', transliteration: 'uktubna', english: 'write! (f.pl)' },
  ],
};

const ktb_I_passive_madi: Tense = {
  id: 'ktb_I_passive_madi',
  type: 'passive_madi',
  arabicName: 'مَجْهُول مَاضِي',
  englishName: 'Passive Past',
  color: TENSE_COLORS.passive_madi,
  occurrences: 5,
  references: ['2:183', '4:24'],
  conjugation: [
    { person: '3ms', arabic: 'كُتِبَ',      transliteration: 'kutiba',     english: 'it was written' },
    { person: '3fs', arabic: 'كُتِبَتْ',    transliteration: 'kutibat',    english: 'it (f) was written' },
    { person: '2ms', arabic: 'كُتِبْتَ',    transliteration: 'kutibta',    english: 'you (m) were written' },
    { person: '2fs', arabic: 'كُتِبْتِ',    transliteration: 'kutibti',    english: 'you (f) were written' },
    { person: '1s',  arabic: 'كُتِبْتُ',    transliteration: 'kutibtu',    english: 'I was written' },
    { person: '3mp', arabic: 'كُتِبُوا',    transliteration: 'kutibū',     english: 'they (m) were written' },
    { person: '3fp', arabic: 'كُتِبْنَ',    transliteration: 'kutibna',    english: 'they (f) were written' },
    { person: '2mp', arabic: 'كُتِبْتُمْ',  transliteration: 'kutibtum',   english: 'you (m.pl) were written' },
    { person: '2fp', arabic: 'كُتِبْتُنَّ', transliteration: 'kutibtunna', english: 'you (f.pl) were written' },
    { person: '1p',  arabic: 'كُتِبْنَا',   transliteration: 'kutibnā',    english: 'we were written' },
  ],
};

const ktb_I_passive_mudari: Tense = {
  id: 'ktb_I_passive_mudari',
  type: 'passive_mudari',
  arabicName: 'مَجْهُول مُضَارِع',
  englishName: 'Passive Present',
  color: TENSE_COLORS.passive_mudari,
  occurrences: 4,
  references: ['2:79', '6:91'],
  conjugation: [
    { person: '3ms', arabic: 'يُكْتَبُ',    transliteration: 'yuktabu',    english: 'it is written' },
    { person: '3fs', arabic: 'تُكْتَبُ',    transliteration: 'tuktabu',    english: 'it (f) is written' },
    { person: '2ms', arabic: 'تُكْتَبُ',    transliteration: 'tuktabu',    english: 'you (m) are written' },
    { person: '2fs', arabic: 'تُكْتَبِينَ', transliteration: 'tuktabīna',  english: 'you (f) are written' },
    { person: '1s',  arabic: 'أُكْتَبُ',    transliteration: 'uktabu',     english: 'I am written' },
    { person: '3mp', arabic: 'يُكْتَبُونَ', transliteration: 'yuktabūna',  english: 'they (m) are written' },
    { person: '3fp', arabic: 'يُكْتَبْنَ',  transliteration: 'yuktabna',   english: 'they (f) are written' },
    { person: '2mp', arabic: 'تُكْتَبُونَ', transliteration: 'tuktabūna',  english: 'you (m.pl) are written' },
    { person: '2fp', arabic: 'تُكْتَبْنَ',  transliteration: 'tuktabna',   english: 'you (f.pl) are written' },
    { person: '1p',  arabic: 'نُكْتَبُ',    transliteration: 'nuktabu',    english: 'we are written' },
  ],
};

const ktb_II_madi: Tense = {
  id: 'ktb_II_madi',
  type: 'madi',
  arabicName: 'مَاضِي',
  englishName: 'Past',
  color: TENSE_COLORS.madi,
  occurrences: 2,
  references: ['57:27'],
  conjugation: [
    { person: '3ms', arabic: 'كَتَّبَ',      transliteration: 'kattaba',     english: 'he made to write' },
    { person: '3fs', arabic: 'كَتَّبَتْ',    transliteration: 'kattabat',    english: 'she made to write' },
    { person: '2ms', arabic: 'كَتَّبْتَ',    transliteration: 'kattabta',    english: 'you (m) made to write' },
    { person: '2fs', arabic: 'كَتَّبْتِ',    transliteration: 'kattabti',    english: 'you (f) made to write' },
    { person: '1s',  arabic: 'كَتَّبْتُ',    transliteration: 'kattabtu',    english: 'I made to write' },
    { person: '3mp', arabic: 'كَتَّبُوا',    transliteration: 'kattabū',     english: 'they (m) made to write' },
    { person: '3fp', arabic: 'كَتَّبْنَ',    transliteration: 'kattabna',    english: 'they (f) made to write' },
    { person: '2mp', arabic: 'كَتَّبْتُمْ',  transliteration: 'kattabtum',   english: 'you (m.pl) made to write' },
    { person: '2fp', arabic: 'كَتَّبْتُنَّ', transliteration: 'kattabtunna', english: 'you (f.pl) made to write' },
    { person: '1p',  arabic: 'كَتَّبْنَا',   transliteration: 'kattabnā',    english: 'we made to write' },
  ],
};

const ktb_II_mudari: Tense = {
  id: 'ktb_II_mudari',
  type: 'mudari',
  arabicName: 'مُضَارِع',
  englishName: 'Present',
  color: TENSE_COLORS.mudari,
  occurrences: 1,
  references: [],
  conjugation: [
    { person: '3ms', arabic: 'يُكَتِّبُ',    transliteration: 'yukattibu',   english: 'he makes to write' },
    { person: '3fs', arabic: 'تُكَتِّبُ',    transliteration: 'tukattibu',   english: 'she makes to write' },
    { person: '2ms', arabic: 'تُكَتِّبُ',    transliteration: 'tukattibu',   english: 'you (m) make to write' },
    { person: '2fs', arabic: 'تُكَتِّبِينَ', transliteration: 'tukattibīna', english: 'you (f) make to write' },
    { person: '1s',  arabic: 'أُكَتِّبُ',    transliteration: 'ukattibu',    english: 'I make to write' },
    { person: '3mp', arabic: 'يُكَتِّبُونَ', transliteration: 'yukattibūna', english: 'they (m) make to write' },
    { person: '3fp', arabic: 'يُكَتِّبْنَ',  transliteration: 'yukattibna',  english: 'they (f) make to write' },
    { person: '2mp', arabic: 'تُكَتِّبُونَ', transliteration: 'tukattibūna', english: 'you (m.pl) make to write' },
    { person: '2fp', arabic: 'تُكَتِّبْنَ',  transliteration: 'tukattibna',  english: 'you (f.pl) make to write' },
    { person: '1p',  arabic: 'نُكَتِّبُ',    transliteration: 'nukattibu',   english: 'we make to write' },
  ],
};

// ─── عَلِمَ (ʿ-l-m) ──────────────────────────────────────────────────────────────

const elm_I_madi: Tense = {
  id: 'elm_I_madi',
  type: 'madi',
  arabicName: 'مَاضِي',
  englishName: 'Past',
  color: TENSE_COLORS.madi,
  occurrences: 35,
  references: ['2:30', '2:216', '3:66', '4:11'],
  conjugation: [
    { person: '3ms', arabic: 'عَلِمَ',      transliteration: 'ʿalima',     english: 'he knew' },
    { person: '3fs', arabic: 'عَلِمَتْ',    transliteration: 'ʿalimat',    english: 'she knew' },
    { person: '2ms', arabic: 'عَلِمْتَ',    transliteration: 'ʿalimta',    english: 'you (m) knew' },
    { person: '2fs', arabic: 'عَلِمْتِ',    transliteration: 'ʿalimti',    english: 'you (f) knew' },
    { person: '1s',  arabic: 'عَلِمْتُ',    transliteration: 'ʿalimtu',    english: 'I knew' },
    { person: '3mp', arabic: 'عَلِمُوا',    transliteration: 'ʿalimū',     english: 'they (m) knew' },
    { person: '3fp', arabic: 'عَلِمْنَ',    transliteration: 'ʿalimna',    english: 'they (f) knew' },
    { person: '2mp', arabic: 'عَلِمْتُمْ',  transliteration: 'ʿalimtum',   english: 'you (m.pl) knew' },
    { person: '2fp', arabic: 'عَلِمْتُنَّ', transliteration: 'ʿalimtunna', english: 'you (f.pl) knew' },
    { person: '1p',  arabic: 'عَلِمْنَا',   transliteration: 'ʿalimnā',    english: 'we knew' },
  ],
};

const elm_I_mudari: Tense = {
  id: 'elm_I_mudari',
  type: 'mudari',
  arabicName: 'مُضَارِع',
  englishName: 'Present',
  color: TENSE_COLORS.mudari,
  occurrences: 47,
  references: ['2:77', '2:197', '2:215', '3:29'],
  conjugation: [
    { person: '3ms', arabic: 'يَعْلَمُ',    transliteration: 'yaʿlamu',    english: 'he knows' },
    { person: '3fs', arabic: 'تَعْلَمُ',    transliteration: 'taʿlamu',    english: 'she knows' },
    { person: '2ms', arabic: 'تَعْلَمُ',    transliteration: 'taʿlamu',    english: 'you (m) know' },
    { person: '2fs', arabic: 'تَعْلَمِينَ', transliteration: 'taʿlamīna',  english: 'you (f) know' },
    { person: '1s',  arabic: 'أَعْلَمُ',    transliteration: 'aʿlamu',     english: 'I know' },
    { person: '3mp', arabic: 'يَعْلَمُونَ', transliteration: 'yaʿlamūna',  english: 'they (m) know' },
    { person: '3fp', arabic: 'يَعْلَمْنَ',  transliteration: 'yaʿlamna',   english: 'they (f) know' },
    { person: '2mp', arabic: 'تَعْلَمُونَ', transliteration: 'taʿlamūna',  english: 'you (m.pl) know' },
    { person: '2fp', arabic: 'تَعْلَمْنَ',  transliteration: 'taʿlamna',   english: 'you (f.pl) know' },
    { person: '1p',  arabic: 'نَعْلَمُ',    transliteration: 'naʿlamu',    english: 'we know' },
  ],
};

const elm_I_amr: Tense = {
  id: 'elm_I_amr',
  type: 'amr',
  arabicName: 'أَمْر',
  englishName: 'Imperative',
  color: TENSE_COLORS.amr,
  occurrences: 7,
  references: ['2:194', '2:203', '3:200', '8:40'],
  conjugation: [
    { person: '2ms', arabic: 'اعْلَمْ',   transliteration: 'iʿlam',   english: 'know! (m)' },
    { person: '2fs', arabic: 'اعْلَمِي',  transliteration: 'iʿlamī',  english: 'know! (f)' },
    { person: '2mp', arabic: 'اعْلَمُوا', transliteration: 'iʿlamū',  english: 'know! (m.pl)' },
    { person: '2fp', arabic: 'اعْلَمْنَ', transliteration: 'iʿlamna', english: 'know! (f.pl)' },
  ],
};

const elm_I_passive_madi: Tense = {
  id: 'elm_I_passive_madi',
  type: 'passive_madi',
  arabicName: 'مَجْهُول مَاضِي',
  englishName: 'Passive Past',
  color: TENSE_COLORS.passive_madi,
  occurrences: 4,
  references: ['2:187'],
  conjugation: [
    { person: '3ms', arabic: 'عُلِمَ',      transliteration: 'ʿulima',     english: 'it was known' },
    { person: '3fs', arabic: 'عُلِمَتْ',    transliteration: 'ʿulimat',    english: 'it (f) was known' },
    { person: '2ms', arabic: 'عُلِمْتَ',    transliteration: 'ʿulimta',    english: 'you (m) were known' },
    { person: '2fs', arabic: 'عُلِمْتِ',    transliteration: 'ʿulimti',    english: 'you (f) were known' },
    { person: '1s',  arabic: 'عُلِمْتُ',    transliteration: 'ʿulimtu',    english: 'I was known' },
    { person: '3mp', arabic: 'عُلِمُوا',    transliteration: 'ʿulimū',     english: 'they (m) were known' },
    { person: '3fp', arabic: 'عُلِمْنَ',    transliteration: 'ʿulimna',    english: 'they (f) were known' },
    { person: '2mp', arabic: 'عُلِمْتُمْ',  transliteration: 'ʿulimtum',   english: 'you (m.pl) were known' },
    { person: '2fp', arabic: 'عُلِمْتُنَّ', transliteration: 'ʿulimtunna', english: 'you (f.pl) were known' },
    { person: '1p',  arabic: 'عُلِمْنَا',   transliteration: 'ʿulimnā',    english: 'we were known' },
  ],
};

const elm_II_madi: Tense = {
  id: 'elm_II_madi',
  type: 'madi',
  arabicName: 'مَاضِي',
  englishName: 'Past',
  color: TENSE_COLORS.madi,
  occurrences: 18,
  references: ['2:31', '2:32', '96:5'],
  conjugation: [
    { person: '3ms', arabic: 'عَلَّمَ',      transliteration: 'ʿallama',     english: 'he taught' },
    { person: '3fs', arabic: 'عَلَّمَتْ',    transliteration: 'ʿallamat',    english: 'she taught' },
    { person: '2ms', arabic: 'عَلَّمْتَ',    transliteration: 'ʿallamta',    english: 'you (m) taught' },
    { person: '2fs', arabic: 'عَلَّمْتِ',    transliteration: 'ʿallamti',    english: 'you (f) taught' },
    { person: '1s',  arabic: 'عَلَّمْتُ',    transliteration: 'ʿallamtu',    english: 'I taught' },
    { person: '3mp', arabic: 'عَلَّمُوا',    transliteration: 'ʿallamū',     english: 'they (m) taught' },
    { person: '3fp', arabic: 'عَلَّمْنَ',    transliteration: 'ʿallamna',    english: 'they (f) taught' },
    { person: '2mp', arabic: 'عَلَّمْتُمْ',  transliteration: 'ʿallamtum',   english: 'you (m.pl) taught' },
    { person: '2fp', arabic: 'عَلَّمْتُنَّ', transliteration: 'ʿallamtunna', english: 'you (f.pl) taught' },
    { person: '1p',  arabic: 'عَلَّمْنَا',   transliteration: 'ʿallamnā',    english: 'we taught' },
  ],
};

const elm_II_mudari: Tense = {
  id: 'elm_II_mudari',
  type: 'mudari',
  arabicName: 'مُضَارِع',
  englishName: 'Present',
  color: TENSE_COLORS.mudari,
  occurrences: 10,
  references: ['2:31', '9:122'],
  conjugation: [
    { person: '3ms', arabic: 'يُعَلِّمُ',    transliteration: 'yuʿallimu',   english: 'he teaches' },
    { person: '3fs', arabic: 'تُعَلِّمُ',    transliteration: 'tuʿallimu',   english: 'she teaches' },
    { person: '2ms', arabic: 'تُعَلِّمُ',    transliteration: 'tuʿallimu',   english: 'you (m) teach' },
    { person: '2fs', arabic: 'تُعَلِّمِينَ', transliteration: 'tuʿallimīna', english: 'you (f) teach' },
    { person: '1s',  arabic: 'أُعَلِّمُ',    transliteration: 'uʿallimu',    english: 'I teach' },
    { person: '3mp', arabic: 'يُعَلِّمُونَ', transliteration: 'yuʿallimūna', english: 'they (m) teach' },
    { person: '3fp', arabic: 'يُعَلِّمْنَ',  transliteration: 'yuʿallimna',  english: 'they (f) teach' },
    { person: '2mp', arabic: 'تُعَلِّمُونَ', transliteration: 'tuʿallimūna', english: 'you (m.pl) teach' },
    { person: '2fp', arabic: 'تُعَلِّمْنَ',  transliteration: 'tuʿallimna',  english: 'you (f.pl) teach' },
    { person: '1p',  arabic: 'نُعَلِّمُ',    transliteration: 'nuʿallimu',   english: 'we teach' },
  ],
};

const elm_II_passive_madi: Tense = {
  id: 'elm_II_passive_madi',
  type: 'passive_madi',
  arabicName: 'مَجْهُول مَاضِي',
  englishName: 'Passive Past',
  color: TENSE_COLORS.passive_madi,
  occurrences: 5,
  references: ['2:239'],
  conjugation: [
    { person: '3ms', arabic: 'عُلِّمَ',      transliteration: 'ʿullima',     english: 'he was taught' },
    { person: '3fs', arabic: 'عُلِّمَتْ',    transliteration: 'ʿullimat',    english: 'she was taught' },
    { person: '2ms', arabic: 'عُلِّمْتَ',    transliteration: 'ʿullimta',    english: 'you (m) were taught' },
    { person: '2fs', arabic: 'عُلِّمْتِ',    transliteration: 'ʿullimti',    english: 'you (f) were taught' },
    { person: '1s',  arabic: 'عُلِّمْتُ',    transliteration: 'ʿullimtu',    english: 'I was taught' },
    { person: '3mp', arabic: 'عُلِّمُوا',    transliteration: 'ʿullimū',     english: 'they (m) were taught' },
    { person: '3fp', arabic: 'عُلِّمْنَ',    transliteration: 'ʿullimna',    english: 'they (f) were taught' },
    { person: '2mp', arabic: 'عُلِّمْتُمْ',  transliteration: 'ʿullimtum',   english: 'you (m.pl) were taught' },
    { person: '2fp', arabic: 'عُلِّمْتُنَّ', transliteration: 'ʿullimtunna', english: 'you (f.pl) were taught' },
    { person: '1p',  arabic: 'عُلِّمْنَا',   transliteration: 'ʿullimnā',    english: 'we were taught' },
  ],
};

const elm_X_madi: Tense = {
  id: 'elm_X_madi',
  type: 'madi',
  arabicName: 'مَاضِي',
  englishName: 'Past',
  color: TENSE_COLORS.madi,
  occurrences: 3,
  references: ['2:187'],
  conjugation: [
    { person: '3ms', arabic: 'اِسْتَعْلَمَ',     transliteration: 'istaʿlama',     english: 'he sought to know' },
    { person: '3fs', arabic: 'اِسْتَعْلَمَتْ',   transliteration: 'istaʿlamat',    english: 'she sought to know' },
    { person: '2ms', arabic: 'اِسْتَعْلَمْتَ',   transliteration: 'istaʿlamta',    english: 'you (m) sought to know' },
    { person: '2fs', arabic: 'اِسْتَعْلَمْتِ',   transliteration: 'istaʿlamti',    english: 'you (f) sought to know' },
    { person: '1s',  arabic: 'اِسْتَعْلَمْتُ',   transliteration: 'istaʿlamtu',    english: 'I sought to know' },
    { person: '3mp', arabic: 'اِسْتَعْلَمُوا',   transliteration: 'istaʿlamū',     english: 'they (m) sought to know' },
    { person: '3fp', arabic: 'اِسْتَعْلَمْنَ',   transliteration: 'istaʿlamna',    english: 'they (f) sought to know' },
    { person: '2mp', arabic: 'اِسْتَعْلَمْتُمْ', transliteration: 'istaʿlamtum',   english: 'you (m.pl) sought to know' },
    { person: '2fp', arabic: 'اِسْتَعْلَمْتُنَّ',transliteration: 'istaʿlamtunna', english: 'you (f.pl) sought to know' },
    { person: '1p',  arabic: 'اِسْتَعْلَمْنَا',  transliteration: 'istaʿlamnā',    english: 'we sought to know' },
  ],
};

const elm_X_mudari: Tense = {
  id: 'elm_X_mudari',
  type: 'mudari',
  arabicName: 'مُضَارِع',
  englishName: 'Present',
  color: TENSE_COLORS.mudari,
  occurrences: 2,
  references: [],
  conjugation: [
    { person: '3ms', arabic: 'يَسْتَعْلِمُ',    transliteration: 'yastaʿlimu',   english: 'he seeks to know' },
    { person: '3fs', arabic: 'تَسْتَعْلِمُ',    transliteration: 'tastaʿlimu',   english: 'she seeks to know' },
    { person: '2ms', arabic: 'تَسْتَعْلِمُ',    transliteration: 'tastaʿlimu',   english: 'you (m) seek to know' },
    { person: '2fs', arabic: 'تَسْتَعْلِمِينَ', transliteration: 'tastaʿlimīna', english: 'you (f) seek to know' },
    { person: '1s',  arabic: 'أَسْتَعْلِمُ',    transliteration: 'astaʿlimu',    english: 'I seek to know' },
    { person: '3mp', arabic: 'يَسْتَعْلِمُونَ', transliteration: 'yastaʿlimūna', english: 'they (m) seek to know' },
    { person: '3fp', arabic: 'يَسْتَعْلِمْنَ',  transliteration: 'yastaʿlimna',  english: 'they (f) seek to know' },
    { person: '2mp', arabic: 'تَسْتَعْلِمُونَ', transliteration: 'tastaʿlimūna', english: 'you (m.pl) seek to know' },
    { person: '2fp', arabic: 'تَسْتَعْلِمْنَ',  transliteration: 'tastaʿlimna',  english: 'you (f.pl) seek to know' },
    { person: '1p',  arabic: 'نَسْتَعْلِمُ',    transliteration: 'nastaʿlimu',   english: 'we seek to know' },
  ],
};

// ─── ذَهَبَ (dh-h-b) ─────────────────────────────────────────────────────────────

const dhb_I_madi: Tense = {
  id: 'dhb_I_madi',
  type: 'madi',
  arabicName: 'مَاضِي',
  englishName: 'Past',
  color: TENSE_COLORS.madi,
  occurrences: 6,
  references: ['3:167', '7:150', '11:74'],
  conjugation: [
    { person: '3ms', arabic: 'ذَهَبَ',      transliteration: 'dhahaba',     english: 'he went' },
    { person: '3fs', arabic: 'ذَهَبَتْ',    transliteration: 'dhahabat',    english: 'she went' },
    { person: '2ms', arabic: 'ذَهَبْتَ',    transliteration: 'dhahabta',    english: 'you (m) went' },
    { person: '2fs', arabic: 'ذَهَبْتِ',    transliteration: 'dhahabti',    english: 'you (f) went' },
    { person: '1s',  arabic: 'ذَهَبْتُ',    transliteration: 'dhahabtu',    english: 'I went' },
    { person: '3mp', arabic: 'ذَهَبُوا',    transliteration: 'dhahabū',     english: 'they (m) went' },
    { person: '3fp', arabic: 'ذَهَبْنَ',    transliteration: 'dhahabna',    english: 'they (f) went' },
    { person: '2mp', arabic: 'ذَهَبْتُمْ',  transliteration: 'dhahabtum',   english: 'you (m.pl) went' },
    { person: '2fp', arabic: 'ذَهَبْتُنَّ', transliteration: 'dhahabtunna', english: 'you (f.pl) went' },
    { person: '1p',  arabic: 'ذَهَبْنَا',   transliteration: 'dhahabnā',    english: 'we went' },
  ],
};

const dhb_I_mudari: Tense = {
  id: 'dhb_I_mudari',
  type: 'mudari',
  arabicName: 'مُضَارِع',
  englishName: 'Present',
  color: TENSE_COLORS.mudari,
  occurrences: 5,
  references: ['4:100', '14:9'],
  conjugation: [
    { person: '3ms', arabic: 'يَذْهَبُ',    transliteration: 'yadhhabu',    english: 'he goes' },
    { person: '3fs', arabic: 'تَذْهَبُ',    transliteration: 'tadhhabu',    english: 'she goes' },
    { person: '2ms', arabic: 'تَذْهَبُ',    transliteration: 'tadhhabu',    english: 'you (m) go' },
    { person: '2fs', arabic: 'تَذْهَبِينَ', transliteration: 'tadhhebīna',  english: 'you (f) go' },
    { person: '1s',  arabic: 'أَذْهَبُ',    transliteration: 'adhhabu',     english: 'I go' },
    { person: '3mp', arabic: 'يَذْهَبُونَ', transliteration: 'yadhhabūna',  english: 'they (m) go' },
    { person: '3fp', arabic: 'يَذْهَبْنَ',  transliteration: 'yadhhabna',   english: 'they (f) go' },
    { person: '2mp', arabic: 'تَذْهَبُونَ', transliteration: 'tadhhabūna',  english: 'you (m.pl) go' },
    { person: '2fp', arabic: 'تَذْهَبْنَ',  transliteration: 'tadhhabna',   english: 'you (f.pl) go' },
    { person: '1p',  arabic: 'نَذْهَبُ',    transliteration: 'nadhhabu',    english: 'we go' },
  ],
};

const dhb_I_amr: Tense = {
  id: 'dhb_I_amr',
  type: 'amr',
  arabicName: 'أَمْر',
  englishName: 'Imperative',
  color: TENSE_COLORS.amr,
  occurrences: 9,
  references: ['2:61', '5:24', '7:105', '20:42', '20:47'],
  conjugation: [
    { person: '2ms', arabic: 'اذْهَبْ',   transliteration: 'idhhab',   english: 'go! (m)' },
    { person: '2fs', arabic: 'اذْهَبِي',  transliteration: 'idhhabī',  english: 'go! (f)' },
    { person: '2mp', arabic: 'اذْهَبُوا', transliteration: 'idhhabū',  english: 'go! (m.pl)' },
    { person: '2fp', arabic: 'اذْهَبْنَ', transliteration: 'idhhabna', english: 'go! (f.pl)' },
  ],
};

const dhb_IV_madi: Tense = {
  id: 'dhb_IV_madi',
  type: 'madi',
  arabicName: 'مَاضِي',
  englishName: 'Past',
  color: TENSE_COLORS.madi,
  occurrences: 4,
  references: ['11:57', '14:19'],
  conjugation: [
    { person: '3ms', arabic: 'أَذْهَبَ',    transliteration: 'adhaba',    english: 'he took away' },
    { person: '3fs', arabic: 'أَذْهَبَتْ',  transliteration: 'adhabat',   english: 'she took away' },
    { person: '2ms', arabic: 'أَذْهَبْتَ',  transliteration: 'adhabta',   english: 'you (m) took away' },
    { person: '2fs', arabic: 'أَذْهَبْتِ',  transliteration: 'adhabti',   english: 'you (f) took away' },
    { person: '1s',  arabic: 'أَذْهَبْتُ',  transliteration: 'adhabtu',   english: 'I took away' },
    { person: '3mp', arabic: 'أَذْهَبُوا',  transliteration: 'adhabū',    english: 'they (m) took away' },
    { person: '3fp', arabic: 'أَذْهَبْنَ',  transliteration: 'adhabna',   english: 'they (f) took away' },
    { person: '2mp', arabic: 'أَذْهَبْتُمْ',transliteration: 'adhabtum',  english: 'you (m.pl) took away' },
    { person: '2fp', arabic: 'أَذْهَبْتُنَّ',transliteration:'adhabtunna',english: 'you (f.pl) took away' },
    { person: '1p',  arabic: 'أَذْهَبْنَا', transliteration: 'adhabnā',   english: 'we took away' },
  ],
};

const dhb_IV_mudari: Tense = {
  id: 'dhb_IV_mudari',
  type: 'mudari',
  arabicName: 'مُضَارِع',
  englishName: 'Present',
  color: TENSE_COLORS.mudari,
  occurrences: 3,
  references: ['14:19'],
  conjugation: [
    { person: '3ms', arabic: 'يُذْهِبُ',    transliteration: 'yudhibu',    english: 'he takes away' },
    { person: '3fs', arabic: 'تُذْهِبُ',    transliteration: 'tudhibu',    english: 'she takes away' },
    { person: '2ms', arabic: 'تُذْهِبُ',    transliteration: 'tudhibu',    english: 'you (m) take away' },
    { person: '2fs', arabic: 'تُذْهِبِينَ', transliteration: 'tudhbīna',   english: 'you (f) take away' },
    { person: '1s',  arabic: 'أُذْهِبُ',    transliteration: 'udhibu',     english: 'I take away' },
    { person: '3mp', arabic: 'يُذْهِبُونَ', transliteration: 'yudhbūna',   english: 'they (m) take away' },
    { person: '3fp', arabic: 'يُذْهِبْنَ',  transliteration: 'yudhbna',    english: 'they (f) take away' },
    { person: '2mp', arabic: 'تُذْهِبُونَ', transliteration: 'tudhbūna',   english: 'you (m.pl) take away' },
    { person: '2fp', arabic: 'تُذْهِبْنَ',  transliteration: 'tudhbna',    english: 'you (f.pl) take away' },
    { person: '1p',  arabic: 'نُذْهِبُ',    transliteration: 'nudhibu',    english: 'we take away' },
  ],
};

