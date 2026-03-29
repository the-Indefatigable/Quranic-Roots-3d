/**
 * Qirat & Maqam Curriculum Data
 *
 * Structured as:
 * Unit 1 — Explain ALL maqams: what they are, their melodies, cultural context
 * Unit 2 — Explore each maqam one-by-one, with melody matching (70-90% gate)
 * Unit 3 — Recite ayahs maqam-by-maqam, scored against qari reference
 *
 * Step types:
 * - 'teach'           — Text/visual explanation (reuses existing TeachStep)
 * - 'mcq'             — Multiple choice quiz (reuses existing MCQStep)
 * - 'listen_identify'  — Play audio, user picks the maqam/jins
 * - 'pitch_match'      — Sing target notes, must hit 70-90% to pass
 * - 'recite_score'     — Full ayah recitation scored against qari
 *
 * Sources:
 * - Maqam intervals from standard Arabic musicology (Habib Hassan Touma, "The Music of the Arabs")
 * - Recitation audio from everyayah.com (Al-Afasy, Al-Husary, Abdul Basit)
 * - Jins definitions follow the "bottom-up" tetrachord approach used in Egyptian/Levantine tradition
 */

// ─── Types ───

export interface QiratUnit {
  id: string;
  title: string;
  arabic: string;
  description: string;
  color: string;
  lessons: QiratLesson[];
}

export interface QiratLesson {
  id: string;
  title: string;
  xpReward: number;
  steps: QiratStep[];
}

export type QiratStep =
  | { type: 'teach'; content: TeachContent }
  | { type: 'mcq'; content: MCQContent }
  | { type: 'listen_identify'; content: ListenIdentifyContent }
  | { type: 'pitch_match'; content: PitchMatchContent }
  | { type: 'recite_score'; content: ReciteScoreContent };

interface TeachContent {
  title: string;
  body: string;
  arabicExample?: string;
  /** Visual type: 'intervals' shows jins intervals on a number line */
  visual?: 'intervals';
  visualData?: number[];
  jinsName?: string;
}

interface MCQContent {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ListenIdentifyContent {
  prompt: string;
  audioUrl: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
}

export interface PitchMatchContent {
  /** Target frequencies to match (Hz) */
  targetNotes: number[];
  /** Note labels for display */
  noteLabels: string[];
  /** Jins name for context */
  jinsName: string;
  /** Minimum accuracy % to pass (default 70) */
  passThreshold?: number;
}

export interface ReciteScoreContent {
  surah: number;
  ayah: number;
  reciterId: string;
  /** Minimum score to pass (default 30) */
  passThreshold?: number;
  /** Expected maqam for this ayah */
  expectedMaqam?: string;
}

// ─── Helper to build everyayah.com URLs ───
const qari = (name: string, surah: number, ayah: number) =>
  `https://everyayah.com/data/${name}/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`;

// ─── Maqam Reference Data ───
// Frequencies for Bayati starting on D4 (~293 Hz) — a common tonic for male reciters
const D4 = 293.66;
const toHz = (semitones: number) => D4 * Math.pow(2, semitones / 12);

export const MAQAM_REFERENCE = {
  bayati: {
    name: 'Bayati', arabic: 'بياتي',
    intervals: [0, 1.5, 3, 5, 7, 8, 10],
    jinsLower: [0, 1.5, 3, 5],
    character: 'Warm, contemplative, devotional',
    usage: 'The most common maqam in Quran. Used for daily recitation, especially in the opening and reflective passages.',
    color: '#0D9488',
    frequencies: [0, 1.5, 3, 5].map(toHz),
  },
  rast: {
    name: 'Rast', arabic: 'رست',
    intervals: [0, 2, 3.5, 5, 7, 9, 10.5],
    jinsLower: [0, 2, 3.5, 5],
    character: 'Bright, noble, majestic',
    usage: 'Often used for openings and celebratory passages. The "default" maqam in much of Arabic music.',
    color: '#D97706',
    frequencies: [0, 2, 3.5, 5].map(toHz),
  },
  hijaz: {
    name: 'Hijaz', arabic: 'حجاز',
    intervals: [0, 1, 4, 5, 7, 8, 11],
    jinsLower: [0, 1, 4, 5],
    character: 'Dramatic, intense, invoking awe',
    usage: 'Used for passages about divine power, warnings, and moments of high emotion. The augmented second interval creates instant drama.',
    color: '#DC2626',
    frequencies: [0, 1, 4, 5].map(toHz),
  },
  nahawand: {
    name: 'Nahawand', arabic: 'نهاوند',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    jinsLower: [0, 2, 3, 5],
    character: 'Minor, reflective, tender',
    usage: 'Similar to Western minor scale. Used for emotional, reflective, and supplication passages.',
    color: '#7C3AED',
    frequencies: [0, 2, 3, 5].map(toHz),
  },
  saba: {
    name: 'Saba', arabic: 'صبا',
    intervals: [0, 1.5, 3, 4, 5, 8, 10],
    jinsLower: [0, 1.5, 3, 4],
    character: 'Sorrowful, yearning, deeply emotional',
    usage: 'The most emotionally intense maqam. Used when reciting passages about judgment, loss, and spiritual longing.',
    color: '#1D4ED8',
    frequencies: [0, 1.5, 3, 4].map(toHz),
  },
  ajam: {
    name: 'Ajam', arabic: 'عجم',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    jinsLower: [0, 2, 4, 5],
    character: 'Joyful, triumphant, celebratory',
    usage: 'Equivalent to Western major scale. Used for joyful passages about paradise, blessings, and divine mercy.',
    color: '#059669',
    frequencies: [0, 2, 4, 5].map(toHz),
  },
};

// ─── CURRICULUM ───

export const QIRAT_UNITS: QiratUnit[] = [

  // ═══════════════════════════════════════════
  // UNIT 1: UNDERSTAND ALL MAQAMS
  // ═══════════════════════════════════════════
  {
    id: 'qirat-1',
    title: 'The World of Maqam',
    arabic: 'عالم المقام',
    description: 'Understand what maqam is, learn each of the 6 core maqamat used in Quran, and hear their unique melodies.',
    color: '#0D9488',
    lessons: [
      // Lesson 1.1 — Introduction
      {
        id: 'qirat-1-1',
        title: 'What is Maqam?',
        xpReward: 15,
        steps: [
          {
            type: 'teach',
            content: {
              title: 'The Maqam System',
              body: 'In Arabic music and Quranic recitation, **maqam** (مقام, "station" or "position") is a system of melodic modes — sets of notes with specific intervals that create particular emotional atmospheres.\n\nUnlike Western music which mainly uses major and minor scales, the maqam system includes **quarter-tones** — notes that fall between the keys of a piano. This is what gives Quranic recitation its distinctive, deeply moving sound.\n\nThere are dozens of maqamat in Arabic music, but **6 core maqamat** are primarily used in Quranic recitation:\n\n🎵 **Bayati** — warm, contemplative\n🎵 **Rast** — bright, noble\n🎵 **Hijaz** — dramatic, intense\n🎵 **Nahawand** — minor, reflective\n🎵 **Saba** — sorrowful, yearning\n🎵 **Ajam** — joyful, triumphant',
            },
          },
          {
            type: 'teach',
            content: {
              title: 'Why Maqam Matters',
              body: 'Great Quran reciters like **Mishary Al-Afasy**, **Abdul Basit**, and **Al-Husary** don\'t just read the words — they **choose maqamat** to match the meaning of each passage:\n\n- A verse about **divine mercy** might use Ajam (joyful) or Bayati (warm)\n- A verse about **judgment** might shift to Saba (sorrowful) or Hijaz (dramatic)\n- An **opening** often uses Rast (noble, inviting)\n\nThis matching of melody to meaning is a core part of **Tajweed ul-Quran** — the art of beautiful recitation. Learning maqam helps you:\n\n1. **Understand** why a reciter sounds the way they do\n2. **Appreciate** the emotional depth of professional recitation\n3. **Develop** your own melodic recitation skills',
            },
          },
          {
            type: 'teach',
            content: {
              title: 'The Jins — Building Block',
              body: 'Every maqam is built from smaller groups called **ajnas** (أجناس, singular: jins جنس).\n\nA **jins** is a group of 3-5 notes with specific intervals. Think of it as a melodic DNA:\n\n- **Lower jins** = the first 4 notes (defines the maqam\'s character)\n- **Upper jins** = the next 3-4 notes (adds range and variation)\n- **Full maqam** = lower jins + upper jins = ~7 notes\n\nWe\'ll learn the **lower jins** of each maqam first — this is where the magic happens. If you can identify the lower jins, you can identify the maqam.',
            },
          },
          {
            type: 'mcq',
            content: {
              question: 'What makes maqam different from Western scales?',
              options: [
                'Maqam uses louder dynamics',
                'Maqam uses quarter-tones between standard notes',
                'Maqam only uses 3 notes per scale',
                'Maqam is only used for singing, not instruments',
              ],
              correctIndex: 1,
              explanation: 'Maqamat use quarter-tones (half a semitone) that don\'t exist on a piano. This is what gives Quranic recitation its distinctive Middle Eastern sound.',
            },
          },
          {
            type: 'mcq',
            content: {
              question: 'How many core maqamat are used in Quran recitation?',
              options: ['3', '6', '12', '24'],
              correctIndex: 1,
              explanation: 'While dozens of maqamat exist in Arabic music, 6 core maqamat are primarily used in Quranic recitation: Bayati, Rast, Hijaz, Nahawand, Saba, and Ajam.',
            },
          },
        ],
      },
      // Lesson 1.2 — Meet each maqam
      {
        id: 'qirat-1-2',
        title: 'Meet the 6 Maqamat',
        xpReward: 20,
        steps: [
          {
            type: 'teach',
            content: {
              title: '1. Maqam Bayati — بياتي',
              body: '**Character:** Warm, contemplative, devotional\n**When used:** The most common maqam in Quran — the "home base" of recitation\n\nBayati\'s signature is its **quarter-tone flat** on the second note (1.5 semitones instead of 2). This creates a sound that\'s neither fully Western-minor nor Western-major — it\'s uniquely Middle Eastern.\n\n**Intervals:** Root → 1.5 → 3 → 5 semitones\n\nMost reciters begin and end their recitation in Bayati. If you only learn one maqam, this is the one.',
              visual: 'intervals',
              visualData: [0, 1.5, 3, 5],
              jinsName: 'Bayati',
            },
          },
          {
            type: 'teach',
            content: {
              title: '2. Maqam Rast — رست',
              body: '**Character:** Bright, noble, majestic\n**When used:** Often for opening verses and joyful passages\n\nRast means "straight" or "correct" in Persian. Its third note sits at **3.5 semitones** — between a minor and major third — giving it a brightness that\'s uniquely Arabic.\n\n**Intervals:** Root → 2 → 3.5 → 5 semitones\n\nRast is considered the "king of maqamat" in Arabic music theory.',
              visual: 'intervals',
              visualData: [0, 2, 3.5, 5],
              jinsName: 'Rast',
            },
          },
          {
            type: 'teach',
            content: {
              title: '3. Maqam Hijaz — حجاز',
              body: '**Character:** Dramatic, intense, awe-inspiring\n**When used:** Passages about divine power, warnings, and judgment\n\nHijaz is named after the Hejaz region in western Arabia. Its unmistakable signature is the **augmented second** — a 3-semitone jump between the 2nd and 3rd notes.\n\n**Intervals:** Root → 1 → 4 → 5 semitones\n\nYou can identify Hijaz instantly by that dramatic leap. Many people associate this sound with "Middle Eastern" music.',
              visual: 'intervals',
              visualData: [0, 1, 4, 5],
              jinsName: 'Hijaz',
            },
          },
          {
            type: 'teach',
            content: {
              title: '4. Maqam Nahawand — نهاوند',
              body: '**Character:** Minor, reflective, tender\n**When used:** Emotional passages, supplications, personal reflection\n\nNahawand is named after the city of Nahavand in Iran. It\'s very similar to the Western **natural minor scale**, making it the most "familiar" maqam to Western ears.\n\n**Intervals:** Root → 2 → 3 → 5 semitones\n\nIf something sounds "sad but beautiful," it\'s likely Nahawand.',
              visual: 'intervals',
              visualData: [0, 2, 3, 5],
              jinsName: 'Nahawand',
            },
          },
          {
            type: 'teach',
            content: {
              title: '5. Maqam Saba — صبا',
              body: '**Character:** Deeply sorrowful, yearning, emotionally intense\n**When used:** Passages about death, judgment, and spiritual longing\n\nSaba is considered the most **emotionally powerful** maqam. Its unique feature is the **diminished fourth** (4 semitones between notes 3 and 4), which creates a sense of unresolved tension.\n\n**Intervals:** Root → 1.5 → 3 → 4 semitones\n\nWhen a qari recites Saba, many listeners are moved to tears. It\'s the maqam of the heart.',
              visual: 'intervals',
              visualData: [0, 1.5, 3, 4],
              jinsName: 'Saba',
            },
          },
          {
            type: 'teach',
            content: {
              title: '6. Maqam Ajam — عجم',
              body: '**Character:** Joyful, triumphant, celebratory\n**When used:** Passages about paradise, blessings, good news\n\nAjam is essentially the Western **major scale**. It\'s the brightest and most "happy" sounding maqam, perfect for passages about divine generosity and glad tidings.\n\n**Intervals:** Root → 2 → 4 → 5 semitones\n\nWhen you hear a Quran recitation that sounds uplifting and joyful, it\'s often Ajam.',
              visual: 'intervals',
              visualData: [0, 2, 4, 5],
              jinsName: 'Ajam',
            },
          },
          {
            type: 'mcq',
            content: {
              question: 'Which maqam has the distinctive "augmented second" jump?',
              options: ['Bayati', 'Nahawand', 'Hijaz', 'Rast'],
              correctIndex: 2,
              explanation: 'Hijaz has the augmented second (3-semitone jump between notes 2 and 3). This is what makes it instantly recognizable and gives it dramatic intensity.',
            },
          },
          {
            type: 'mcq',
            content: {
              question: 'Which maqam is most commonly used in Quran recitation?',
              options: ['Rast', 'Hijaz', 'Ajam', 'Bayati'],
              correctIndex: 3,
              explanation: 'Bayati is the most common maqam in Quran. Most reciters begin and end their recitation in Bayati due to its warm, devotional character.',
            },
          },
          {
            type: 'mcq',
            content: {
              question: 'Which maqam sounds like the Western major scale?',
              options: ['Saba', 'Ajam', 'Bayati', 'Nahawand'],
              correctIndex: 1,
              explanation: 'Ajam has intervals of 0-2-4-5, which matches the Western major scale. It\'s used for joyful, celebratory passages.',
            },
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════
  // UNIT 2: EXPLORE EACH MAQAM (Melody Matching)
  // ═══════════════════════════════════════════
  {
    id: 'qirat-2',
    title: 'Master Each Maqam',
    arabic: 'أتقن كل مقام',
    description: 'Explore each maqam one-by-one: hear it, identify it by ear, then match its melody with your voice until you reach 70%+ accuracy.',
    color: '#D97706',
    lessons: [
      // Lesson 2.1 — Bayati deep dive
      {
        id: 'qirat-2-1',
        title: 'Maqam Bayati — Hear & Match',
        xpReward: 25,
        steps: [
          {
            type: 'teach',
            content: {
              title: 'Recognizing Bayati',
              body: 'Now let\'s train your ear. Listen for these Bayati signatures:\n\n1. **Quarter-tone on note 2** — sounds "between" two piano keys\n2. **Warm, settled feeling** — like coming home\n3. **Smooth, flowing melody** — no dramatic jumps\n4. **Common in Al-Fatiha** — most reciters use Bayati here\n\nWhen you hear Bayati, think: *"warm hug" 🤗*',
            },
          },
          {
            type: 'listen_identify',
            content: {
              prompt: 'Listen to Al-Afasy recite Al-Fatiha, Ayah 2. What maqam is this?',
              audioUrl: qari('Alafasy_128kbps', 1, 2),
              correctAnswer: 'Bayati',
              options: ['Bayati', 'Hijaz', 'Rast', 'Nahawand'],
              explanation: 'This is Bayati — warm and contemplative. Notice the gentle quarter-tone that gives it its distinctive Middle Eastern character. Al-Fatiha is almost always recited in Bayati.',
            },
          },
          {
            type: 'listen_identify',
            content: {
              prompt: 'What about this passage? Same or different?',
              audioUrl: qari('Alafasy_128kbps', 1, 5),
              correctAnswer: 'Bayati',
              options: ['Rast', 'Bayati', 'Saba', 'Ajam'],
              explanation: 'Still Bayati! Al-Afasy maintains Bayati through most of Al-Fatiha. The continuity of maqam is what gives a recitation its cohesive feel.',
            },
          },
          {
            type: 'teach',
            content: {
              title: 'Sing the Bayati Jins',
              body: 'Now it\'s your turn! You\'ll see 4 target notes — the Bayati jins starting on D.\n\nSing each note and try to match it. The key is the **second note** — it\'s the quarter-tone that makes Bayati unique.\n\n**Tips:**\n- Start with a gentle hum\n- Don\'t force — let your voice relax into each note\n- The second note should feel "in between" — not sharp, not flat\n- You need **70% accuracy** to pass',
            },
          },
          {
            type: 'pitch_match',
            content: {
              targetNotes: MAQAM_REFERENCE.bayati.frequencies,
              noteLabels: ['D₄', 'E½♭₄', 'F₄', 'G₄'],
              jinsName: 'Bayati',
              passThreshold: 70,
            },
          },
        ],
      },
      // Lesson 2.2 — Rast deep dive
      {
        id: 'qirat-2-2',
        title: 'Maqam Rast — Hear & Match',
        xpReward: 25,
        steps: [
          {
            type: 'teach',
            content: {
              title: 'Recognizing Rast',
              body: 'Rast signatures to listen for:\n\n1. **Bright third note** — sits between minor and major third (3.5 semitones)\n2. **Noble, uplifting feel** — like a royal announcement\n3. **Often used for openings** — sets a majestic tone\n4. **Wider intervals** than Bayati — feels more "open"\n\nWhen you hear Rast, think: *"sunrise 🌅"*',
            },
          },
          {
            type: 'listen_identify',
            content: {
              prompt: 'Listen to this recitation. What maqam is this?',
              audioUrl: qari('Alafasy_128kbps', 2, 255),
              correctAnswer: 'Rast',
              options: ['Bayati', 'Rast', 'Hijaz', 'Nahawand'],
              explanation: 'This is Rast — notice the bright, noble quality. The third note sits between minor and major, giving Rast its unique "Arabic brightness."',
            },
          },
          {
            type: 'pitch_match',
            content: {
              targetNotes: MAQAM_REFERENCE.rast.frequencies,
              noteLabels: ['D₄', 'E₄', 'F½#₄', 'G₄'],
              jinsName: 'Rast',
              passThreshold: 70,
            },
          },
        ],
      },
      // Lesson 2.3 — Hijaz deep dive
      {
        id: 'qirat-2-3',
        title: 'Maqam Hijaz — Hear & Match',
        xpReward: 25,
        steps: [
          {
            type: 'teach',
            content: {
              title: 'Recognizing Hijaz',
              body: 'Hijaz is the easiest maqam to identify:\n\n1. **The big jump** — from note 2 to note 3 (augmented second = 3 semitones)\n2. **Instant drama** — feels like a movie soundtrack moment\n3. **Low → very high → back** — the interval pattern creates tension\n4. **Used for impactful verses** — ayat about divine power and warnings\n\nWhen you hear Hijaz, think: *"thunder ⚡"*',
            },
          },
          {
            type: 'listen_identify',
            content: {
              prompt: 'Can you identify this maqam?',
              audioUrl: qari('Husary_128kbps', 36, 1),
              correctAnswer: 'Hijaz',
              options: ['Bayati', 'Rast', 'Saba', 'Hijaz'],
              explanation: 'This is Hijaz! That dramatic leap between notes 2 and 3 is unmistakable. Al-Husary often uses Hijaz at powerful openings.',
            },
          },
          {
            type: 'pitch_match',
            content: {
              targetNotes: MAQAM_REFERENCE.hijaz.frequencies,
              noteLabels: ['D₄', 'E♭₄', 'F#₄', 'G₄'],
              jinsName: 'Hijaz',
              passThreshold: 70,
            },
          },
        ],
      },
      // Lesson 2.4 — Mixed identification
      {
        id: 'qirat-2-4',
        title: 'Identify the Maqam — Mixed',
        xpReward: 30,
        steps: [
          {
            type: 'teach',
            content: {
              title: 'Mixed Identification Challenge',
              body: 'You\'ve learned 3 maqamat: **Bayati**, **Rast**, and **Hijaz**. Now let\'s test your ear with a mix!\n\nRemember the mnemonics:\n- 🤗 Bayati = warm hug\n- 🌅 Rast = sunrise\n- ⚡ Hijaz = thunder\n\nListen carefully to each clip and identify the maqam.',
            },
          },
          {
            type: 'listen_identify',
            content: {
              prompt: 'What maqam is this? Listen carefully...',
              audioUrl: qari('Alafasy_128kbps', 55, 1),
              correctAnswer: 'Bayati',
              options: ['Bayati', 'Rast', 'Hijaz', 'Nahawand'],
              explanation: 'Bayati — the warm, contemplative opening of Surah Ar-Rahman. Notice no dramatic jumps, just steady, gentle flow.',
            },
          },
          {
            type: 'listen_identify',
            content: {
              prompt: 'And this one?',
              audioUrl: qari('Alafasy_128kbps', 67, 1),
              correctAnswer: 'Rast',
              options: ['Saba', 'Hijaz', 'Rast', 'Bayati'],
              explanation: 'Rast — the bright, noble opening. Notice how the melody feels more "open" and majestic compared to Bayati.',
            },
          },
          {
            type: 'listen_identify',
            content: {
              prompt: 'Last one — can you get all three right?',
              audioUrl: qari('Husary_128kbps', 36, 58),
              correctAnswer: 'Hijaz',
              options: ['Bayati', 'Nahawand', 'Rast', 'Hijaz'],
              explanation: 'Hijaz — the dramatic intensity is unmistakable. That augmented second creates an instant emotional impact.',
            },
          },
        ],
      },
    ],
  },

  // ═══════════════════════════════════════════
  // UNIT 3: RECITE AYAHS BY MAQAM
  // ═══════════════════════════════════════════
  {
    id: 'qirat-3',
    title: 'Recite by Maqam',
    arabic: 'رتِّل بالمقام',
    description: 'Apply what you\'ve learned — recite real Quranic ayahs in specific maqamat, scored against the Qari\'s reference.',
    color: '#7C3AED',
    lessons: [
      // Lesson 3.1 — Recite in Bayati
      {
        id: 'qirat-3-1',
        title: 'Recite in Bayati',
        xpReward: 30,
        steps: [
          {
            type: 'teach',
            content: {
              title: 'Reciting in Maqam Bayati',
              body: 'You\'ve learned to hear Bayati and match its melody. Now it\'s time to **recite actual ayahs** in Bayati.\n\nThe flow:\n1. 🎧 **Listen** — The Qari recites the ayah in Bayati\n2. 🎤 **Your turn** — Recite the same ayah, following the melodic shape\n3. 📊 **Score** — See how closely your melody matched\n\n**Focus on the melodic contour** — the rises and falls — rather than hitting exact notes. A score of 30%+ means you\'re capturing the general shape.',
            },
          },
          {
            type: 'recite_score',
            content: {
              surah: 1,
              ayah: 1,
              reciterId: 'Alafasy_128kbps',
              passThreshold: 30,
              expectedMaqam: 'Bayati',
            },
          },
          {
            type: 'recite_score',
            content: {
              surah: 1,
              ayah: 2,
              reciterId: 'Alafasy_128kbps',
              passThreshold: 30,
              expectedMaqam: 'Bayati',
            },
          },
          {
            type: 'recite_score',
            content: {
              surah: 1,
              ayah: 3,
              reciterId: 'Alafasy_128kbps',
              passThreshold: 30,
              expectedMaqam: 'Bayati',
            },
          },
        ],
      },
      // Lesson 3.2 — Recite in Hijaz
      {
        id: 'qirat-3-2',
        title: 'Recite in Hijaz',
        xpReward: 35,
        steps: [
          {
            type: 'teach',
            content: {
              title: 'Reciting in Maqam Hijaz',
              body: 'Now let\'s recite in **Hijaz** — the dramatic maqam.\n\nHijaz recitation tips:\n- **Emphasize the augmented second** — let that big interval ring\n- **Use chest voice** for the lower notes and head voice for the leap\n- **Slow down on the jump** — let the drama build\n- **Hijaz endings** tend to descend dramatically to the tonic\n\nWe\'ll practice with Surah Ya-Sin, which is often recited with Hijaz passages.',
            },
          },
          {
            type: 'recite_score',
            content: {
              surah: 36,
              ayah: 1,
              reciterId: 'Husary_128kbps',
              passThreshold: 25,
              expectedMaqam: 'Hijaz',
            },
          },
          {
            type: 'recite_score',
            content: {
              surah: 36,
              ayah: 2,
              reciterId: 'Husary_128kbps',
              passThreshold: 25,
              expectedMaqam: 'Hijaz',
            },
          },
        ],
      },
    ],
  },
];

// ─── Helpers ───

export function getAllQiratLessons() {
  return QIRAT_UNITS.flatMap(unit =>
    unit.lessons.map(lesson => ({
      ...lesson,
      unitId: unit.id,
      unitTitle: unit.title,
      unitColor: unit.color,
    }))
  );
}

export function getQiratLessonById(lessonId: string) {
  for (const unit of QIRAT_UNITS) {
    const lesson = unit.lessons.find(l => l.id === lessonId);
    if (lesson) return { lesson, unit };
  }
  return null;
}
