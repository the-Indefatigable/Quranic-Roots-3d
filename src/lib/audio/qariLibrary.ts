/**
 * qariLibrary.ts — Reference qari catalog with audio URL builders.
 *
 * Supports both everyayah.com (per-ayah mp3s) and quran.com API (word-level timing).
 */

export interface QariInfo {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Arabic name (for the Qari tab header) */
  nameArabic?: string;
  /** Recitation style */
  style: 'murattal' | 'mujawwad' | 'muallim';
  /** Human-readable style label */
  styleLabel: string;
  /** everyayah.com folder name for per-ayah audio */
  everyayahFolder: string;
  /** quran.com API recitation ID for word-level timing */
  quranComRecitationId: number;
  /** Short description for UI (legacy — used in qari menu) */
  description: string;
  // ── Profile fields for the Qari tab ──────────────────────────────────────
  /** Country of origin */
  country?: string;
  /** Lifespan or era, e.g. "1917–1980" or "born 1976" */
  era?: string;
  /** Riwāyah (transmission of Quranic reading), e.g. "Hafs ʿan ʿĀṣim" */
  riwayah?: string;
  /** Maqāmāt the qari is most associated with */
  maqamSpecialty?: string[];
  /** Pace of typical recitation */
  tempo?: 'slow' | 'medium' | 'fast';
  /** Short tags shown as chips, e.g. ["contemplative","beginner-friendly"] */
  tags?: string[];
  /** One-paragraph bio (3–4 sentences max) */
  bio?: string;
  /** "Known for" — one sentence about the qari's signature */
  signature?: string;
  /** Recommended audience */
  recommendedFor?: string;
}

export const QARI_LIBRARY: QariInfo[] = [
  {
    id: 'alafasy',
    name: 'Mishary Al-Afasy',
    nameArabic: 'مشاري راشد العفاسي',
    style: 'murattal',
    styleLabel: 'Murattal',
    everyayahFolder: 'Alafasy_128kbps',
    quranComRecitationId: 7,
    description: 'Clear and melodic — great for general listening',
    country: 'Kuwait',
    era: 'born 1976',
    riwayah: 'Hafs ʿan ʿĀṣim',
    maqamSpecialty: ['Bayātī', 'Rāst', 'Ḥijāz'],
    tempo: 'medium',
    tags: ['melodic', 'beginner-friendly', 'modern'],
    bio: 'A Kuwaiti imam, qāriʾ, and singer whose warm, lyrical recitation has made him one of the most recognized voices of the modern Quranic era. He leads taraweeh prayers at the Grand Mosque of Kuwait and has recorded the entire Quran in Hafs.',
    signature: 'A flowing, song-like melody that lingers on madd letters and gives the listener room to breathe.',
    recommendedFor: 'Anyone starting out — the clear pace and gentle melody make it easy to follow along.',
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    nameArabic: 'محمود خليل الحصري',
    style: 'murattal',
    styleLabel: 'Murattal',
    everyayahFolder: 'Husary_128kbps',
    quranComRecitationId: 8,
    description: 'Precise tajweed — excellent for learning',
    country: 'Egypt',
    era: '1917–1980',
    riwayah: 'Hafs ʿan ʿĀṣim',
    maqamSpecialty: ['Bayātī', 'Ṣabā'],
    tempo: 'medium',
    tags: ['precise', 'classical', 'tajwīd-textbook'],
    bio: 'The first qāriʾ to record the entire Quran. A founding figure of modern Quranic recitation whose mastery of tajwīd became the standard against which others are measured. Long-serving reciter at Masjid al-Husayn in Cairo.',
    signature: 'Textbook-perfect tajwīd with deliberate, unhurried articulation — every ḥarakah and madd is exactly the prescribed length.',
    recommendedFor: 'Students who want to learn the rules of recitation by ear.',
  },
  {
    id: 'husary-muallim',
    name: 'Al-Husary (Muallim)',
    nameArabic: 'الحصري — معلم',
    style: 'muallim',
    styleLabel: 'Teaching',
    everyayahFolder: 'Husary_Muallim_128kbps',
    quranComRecitationId: 9,
    description: 'Teaching mode — recites then pauses for you to repeat',
    country: 'Egypt',
    era: '1917–1980',
    riwayah: 'Hafs ʿan ʿĀṣim',
    maqamSpecialty: ['Bayātī'],
    tempo: 'slow',
    tags: ['teaching', 'call-and-response', 'memorization'],
    bio: 'Husary\'s "muallim" (teacher) recordings, in which he recites a verse and pauses to let the student repeat after him. Designed specifically for memorization and learning correct articulation.',
    signature: 'Recite-and-pause format with extra-slow pacing and crystalline pronunciation.',
    recommendedFor: 'Memorization (ḥifẓ) and beginners learning makhārij.',
  },
  {
    id: 'abdulbasit-mujawwad',
    name: 'Abdul Basit (Mujawwad)',
    nameArabic: 'عبد الباسط عبد الصمد',
    style: 'mujawwad',
    styleLabel: 'Mujawwad',
    everyayahFolder: 'Abdul_Basit_Mujawwad_128kbps',
    quranComRecitationId: 1,
    description: 'Melodic, elaborate recitation style',
    country: 'Egypt',
    era: '1927–1988',
    riwayah: 'Hafs ʿan ʿĀṣim',
    maqamSpecialty: ['Bayātī', 'Ṣabā', 'Ḥijāz', 'Nahawand'],
    tempo: 'slow',
    tags: ['mujawwad', 'maqām-master', 'emotional', 'advanced'],
    bio: 'Widely considered the greatest qāriʾ of the 20th century. His mujawwad recitations — full melodic, elaborate renderings — earned him the title "the Voice of Heaven". The first qāriʾ to be elected president of the Reciters\' Union of Egypt.',
    signature: 'Vast melodic range, long sustained notes, and the ability to modulate between maqāmāt within a single verse.',
    recommendedFor: 'Listeners who want to feel the emotional weight of the Quran and hear what classical mujawwad sounds like at its peak.',
  },
  {
    id: 'sudais',
    name: 'Abdurrahman As-Sudais',
    nameArabic: 'عبد الرحمن السديس',
    style: 'murattal',
    styleLabel: 'Murattal',
    everyayahFolder: 'Abdurrahmaan_As-Sudais_192kbps',
    quranComRecitationId: 5,
    description: 'Imam of Masjid al-Haram — powerful and clear',
    country: 'Saudi Arabia',
    era: 'born 1960',
    riwayah: 'Hafs ʿan ʿĀṣim',
    maqamSpecialty: ['Rāst', 'Bayātī'],
    tempo: 'medium',
    tags: ['powerful', 'haram-imam', 'iconic'],
    bio: 'Chief imam of the Grand Mosque in Mecca. His recitations from Masjid al-Haram, especially during Ramadan taraweeh, are heard by tens of millions of pilgrims and are among the most-listened-to Quranic recordings in the world.',
    signature: 'Powerful, resonant delivery with a steady tempo and the unmistakable acoustic of Masjid al-Haram.',
    recommendedFor: 'Listeners who want the sound of pilgrimage and large-congregation recitation.',
  },
  {
    id: 'minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    nameArabic: 'محمد صديق المنشاوي',
    style: 'murattal',
    styleLabel: 'Murattal',
    everyayahFolder: 'Minshawy_Murattal_128kbps',
    quranComRecitationId: 6,
    description: 'Beautiful tone — classic Egyptian recitation',
    country: 'Egypt',
    era: '1920–1969',
    riwayah: 'Hafs ʿan ʿĀṣim',
    maqamSpecialty: ['Bayātī', 'Ṣabā', 'Ḥijāz'],
    tempo: 'slow',
    tags: ['warm', 'classical', 'contemplative'],
    bio: 'One of the great Egyptian masters alongside Abdul Basit and Husary. Known for the warm, almost mournful timbre of his voice and his ability to evoke deep contemplation through subtle melodic shifts.',
    signature: 'A soft, warm timbre that turns even short verses into moments of stillness.',
    recommendedFor: 'Late-night listening and verses that call for reflection.',
  },
];

/** Get the default qari (Al-Afasy). */
export function getDefaultQari(): QariInfo {
  return QARI_LIBRARY[0];
}

/** Find a qari by ID. */
export function getQariById(id: string): QariInfo | undefined {
  return QARI_LIBRARY.find(q => q.id === id);
}

/**
 * Build the per-ayah audio URL for a given qari, surah, and ayah.
 * Uses everyayah.com format: {folder}/{surah3}{ayah3}.mp3
 */
export function buildAyahAudioUrl(qari: QariInfo, surahNumber: number, ayahNumber: number): string {
  return `https://everyayah.com/data/${qari.everyayahFolder}/${String(surahNumber).padStart(3, '0')}${String(ayahNumber).padStart(3, '0')}.mp3`;
}
