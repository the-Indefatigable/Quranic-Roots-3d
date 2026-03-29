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
  /** Recitation style */
  style: 'murattal' | 'mujawwad' | 'muallim';
  /** Human-readable style label */
  styleLabel: string;
  /** everyayah.com folder name for per-ayah audio */
  everyayahFolder: string;
  /** quran.com API recitation ID for word-level timing */
  quranComRecitationId: number;
  /** Short description for UI */
  description: string;
}

export const QARI_LIBRARY: QariInfo[] = [
  {
    id: 'alafasy',
    name: 'Mishary Al-Afasy',
    style: 'murattal',
    styleLabel: 'Murattal',
    everyayahFolder: 'Alafasy_128kbps',
    quranComRecitationId: 7,
    description: 'Clear and melodic — great for general listening',
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    style: 'murattal',
    styleLabel: 'Murattal',
    everyayahFolder: 'Husary_128kbps',
    quranComRecitationId: 8,
    description: 'Precise tajweed — excellent for learning',
  },
  {
    id: 'husary-muallim',
    name: 'Al-Husary (Muallim)',
    style: 'muallim',
    styleLabel: 'Teaching',
    everyayahFolder: 'Husary_Muallim_128kbps',
    quranComRecitationId: 9,
    description: 'Teaching mode — recites then pauses for you to repeat',
  },
  {
    id: 'abdulbasit-mujawwad',
    name: 'Abdul Basit (Mujawwad)',
    style: 'mujawwad',
    styleLabel: 'Mujawwad',
    everyayahFolder: 'Abdul_Basit_Mujawwad_128kbps',
    quranComRecitationId: 1,
    description: 'Melodic, elaborate recitation style',
  },
  {
    id: 'sudais',
    name: 'Abdurrahman As-Sudais',
    style: 'murattal',
    styleLabel: 'Murattal',
    everyayahFolder: 'Abdurrahmaan_As-Sudais_192kbps',
    quranComRecitationId: 5,
    description: 'Imam of Masjid al-Haram — powerful and clear',
  },
  {
    id: 'minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    style: 'murattal',
    styleLabel: 'Murattal',
    everyayahFolder: 'Minshawy_Murattal_128kbps',
    quranComRecitationId: 6,
    description: 'Beautiful tone — classic Egyptian recitation',
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
