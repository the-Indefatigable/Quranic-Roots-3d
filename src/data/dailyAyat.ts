// Curated pool of short, high-frequency, well-loved ayat for the Daily Ayah.
// One is chosen deterministically per day. Arabic (word-by-word) is pulled from
// the quran_words table at request time; the translation is kept here so the
// feature never depends on translation-table coverage.

export interface DailyAyahRef {
  surah: number;
  ayah: number;
  surahName: string;
  translation: string;
}

export const DAILY_AYAT: DailyAyahRef[] = [
  { surah: 1, ayah: 5, surahName: 'Al-Fatiha', translation: 'You alone we worship, and You alone we ask for help.' },
  { surah: 2, ayah: 152, surahName: 'Al-Baqarah', translation: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.' },
  { surah: 2, ayah: 286, surahName: 'Al-Baqarah', translation: 'Allah does not burden a soul beyond what it can bear.' },
  { surah: 3, ayah: 8, surahName: 'Aal Imran', translation: 'Our Lord, do not let our hearts deviate after You have guided us.' },
  { surah: 3, ayah: 173, surahName: 'Aal Imran', translation: 'Sufficient for us is Allah, and He is the best Disposer of affairs.' },
  { surah: 13, ayah: 28, surahName: 'Ar-Ra’d', translation: 'Verily, in the remembrance of Allah do hearts find rest.' },
  { surah: 14, ayah: 7, surahName: 'Ibrahim', translation: 'If you are grateful, I will surely increase you [in favor].' },
  { surah: 20, ayah: 114, surahName: 'Ta-Ha', translation: 'My Lord, increase me in knowledge.' },
  { surah: 25, ayah: 74, surahName: 'Al-Furqan', translation: 'Our Lord, grant us from among our spouses and offspring comfort to our eyes.' },
  { surah: 39, ayah: 53, surahName: 'Az-Zumar', translation: 'Do not despair of the mercy of Allah. Indeed, Allah forgives all sins.' },
  { surah: 40, ayah: 60, surahName: 'Ghafir', translation: 'Call upon Me; I will respond to you.' },
  { surah: 65, ayah: 3, surahName: 'At-Talaq', translation: 'And whoever relies upon Allah — then He is sufficient for him.' },
  { surah: 93, ayah: 3, surahName: 'Ad-Duha', translation: 'Your Lord has not forsaken you, nor does He hate [you].' },
  { surah: 94, ayah: 6, surahName: 'Ash-Sharh', translation: 'Indeed, with hardship comes ease.' },
  { surah: 103, ayah: 2, surahName: 'Al-Asr', translation: 'Indeed, mankind is in loss.' },
  { surah: 112, ayah: 1, surahName: 'Al-Ikhlas', translation: 'Say, He is Allah, [who is] One.' },
  { surah: 2, ayah: 255, surahName: 'Al-Baqarah', translation: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of existence.' },
  { surah: 55, ayah: 13, surahName: 'Ar-Rahman', translation: 'So which of the favors of your Lord would you deny?' },
  { surah: 49, ayah: 13, surahName: 'Al-Hujurat', translation: 'Indeed, the most noble of you in the sight of Allah is the most righteous.' },
  { surah: 2, ayah: 201, surahName: 'Al-Baqarah', translation: 'Our Lord, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.' },
];

/** Deterministic day index (UTC) so everyone sees the same ayah/hadith each day. */
export function dayIndex(offset = 0): number {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start;
  return Math.floor(diff / 86_400_000) + offset;
}
