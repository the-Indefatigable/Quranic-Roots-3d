/**
 * Seeds STAGE 4 — "The Fi'l (verbs)" — Units 13–16:
 *   13 It Happened (past tense: he/she/they)
 *   14 I Did, You Did, We Did (past tense: rest of the family)
 *   15 It's Happening (present tense + negation)
 *   16 Do It! (imperative & prohibition) — checkpoint_after
 *
 * Same mechanics as seed-stage-2/3.mjs. Verbs use word_type 'feel'
 * (gender/number null). Backfills Unit-13 L1 unlock for finishers of Unit 12.
 * Idempotent. Run: DATABASE_URL=... node scripts/seed-stage-4.mjs
 */
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

// ═══════════════════════════════════════════════════════════════
// UNIT 13 — It Happened (past tense: he / she / they)
// ═══════════════════════════════════════════════════════════════

const U13_L1 = { // The 3-letter DNA
  steps: [
    { type: 'teach', content: {
      title: 'Every verb has a 3-letter DNA',
      explanation: 'Almost every Arabic word grows from a **3-letter root**. The root ك-ت-ب carries the idea of *writing*:\n\nك-ت-ب → **كَتَبَ** ("he wrote")\n\nChange the vowels and add letters, and one root becomes a whole family of words. This is the engine behind QuRoots — explore any root in the **/roots** section.',
      arabic: 'ك ت ب ← كَتَبَ',
      transliteration: 'k-t-b → kataba',
      examples: [
        { ar: 'كَتَبَ', tr: 'kataba', en: 'he wrote' },
        { ar: 'كِتَاب', tr: 'kitaab', en: 'a book (from the same root!)' },
        { ar: 'مَكْتُوب', tr: 'maktoob', en: 'written' },
      ],
      fun_fact: 'كِتَاب (book), كَاتِب (writer), مَكْتَب (office/desk), مَكْتُوب (written) — all from ك-ت-ب.',
    }},
    { type: 'teach', content: {
      title: 'فَعَلَ — the measuring stick',
      explanation: 'Grammarians measure every verb against the pattern **فَعَلَ** (fa‘ala, "he did"), using the letters ف-ع-ل as stand-ins.\n\nSo "he wrote" كَتَبَ follows the shape فَعَلَ. Learn one pattern, unlock thousands of verbs.',
      arabic: 'فَعَلَ',
      transliteration: 'fa‘ala (he did)',
      examples: [
        { ar: 'فَعَلَ', tr: 'fa‘ala', en: 'he did (the template)' },
        { ar: 'خَلَقَ', tr: 'khalaqa', en: 'he created' },
        { ar: 'نَصَرَ', tr: 'nasara', en: 'he helped' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'What is a "root" in Arabic?',
      options: [
        { text: 'The 3 core letters a word family grows from', correct: true },
        { text: 'The first letter of a word', correct: false },
        { text: 'A type of sentence', correct: false },
      ],
      explanation: 'Three consonants carry the core meaning; vowels and extra letters shape it.',
    }},
    { type: 'mcq', content: {
      question: 'كِتَاب (book) and كَتَبَ (he wrote) are related because...',
      options: [
        { text: 'they share the root ك-ت-ب (writing)', correct: true },
        { text: 'they just sound similar', correct: false },
      ],
      explanation: 'Same 3-letter DNA → same core meaning. Recognizing roots multiplies your vocabulary.',
    }},
    { type: 'match', content: {
      instruction: 'Match the past-tense verb to its meaning',
      pairs: [
        { left: 'كَتَبَ', right: 'he wrote' },
        { left: 'خَلَقَ', right: 'he created' },
        { left: 'فَعَلَ', right: 'he did' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'Grammarians measure verbs against the template ___ ("he did").',
      correct_answer: 'فَعَلَ',
      options: ['فَعَلَ', 'كِتَاب', 'الَّذِي'],
      explanation: 'فَعَلَ (ف-ع-ل) is the measuring stick for every verb’s shape.',
    }},
    { type: 'teach', content: {
      title: 'You found the DNA',
      explanation: 'Roots + the فَعَلَ template = the key to Arabic verbs. Next: how a verb tells you it was **he** or **she** who did it.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U13_L2 = { // He did / she did
  steps: [
    { type: 'teach', content: {
      title: 'He did vs She did',
      explanation: 'The bare past verb already means "**he** did it":\n\n**قَالَ** = he said\n\nAdd **ـَتْ** for "**she**":\n\n**قَالَتْ** = she said',
      arabic: 'قَالَ · قَالَتْ',
      transliteration: 'qaala · qaalat',
      examples: [
        { ar: 'خَلَقَ', tr: 'khalaqa', en: 'he created' },
        { ar: 'خَلَقَتْ', tr: 'khalaqat', en: 'she created' },
        { ar: 'قَالَتْ', tr: 'qaalat', en: 'she said' },
      ],
      fun_fact: 'قَالَ ("he said") is the most common verb in the Quran — over 1,600 times. The Quran is full of speech!',
    }},
    { type: 'mcq', content: {
      question: 'قَالَتْ means...',
      options: [
        { text: 'she said', correct: true },
        { text: 'he said', correct: false },
        { text: 'they said', correct: false },
      ],
      explanation: 'The ـتْ ending marks "she". قَالَ = he said; قَالَتْ = she said.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'To turn قَالَ ("he said") into "she said", add ___.',
      correct_answer: 'ـتْ',
      options: ['ـتْ', 'ـوا', 'ـنَا'],
      explanation: 'قَالَ + تْ = قَالَتْ. The تْ is the feminine "she" marker on a past verb.',
    }},
    { type: 'classify', content: {
      instruction: 'He or she?',
      categories: ['He (فَعَلَ)', 'She (فَعَلَتْ)'],
      items: [
        { text: 'قَالَ', category: 'He (فَعَلَ)' },
        { text: 'قَالَتْ', category: 'She (فَعَلَتْ)' },
        { text: 'خَلَقَ', category: 'He (فَعَلَ)' },
        { text: 'خَلَقَتْ', category: 'She (فَعَلَتْ)' },
      ],
      explanation: 'The ـتْ tail = she. No tail = he.',
    }},
    { type: 'mcq', content: {
      question: 'قَالَتِ امْرَأَتُ عِمْرَانَ — "The wife of Imran SAID..." (Aal Imran 3:35). Which form is قَالَتْ?',
      options: [
        { text: '"she said" — feminine past', correct: true },
        { text: '"he said"', correct: false },
      ],
      explanation: 'The subject is a woman, so the verb takes ـتْ: قَالَتْ.',
    }},
    { type: 'match', content: {
      instruction: 'Match verb to meaning',
      pairs: [
        { left: 'قَالَ', right: 'he said' },
        { left: 'قَالَتْ', right: 'she said' },
        { left: 'خَلَقَ', right: 'he created' },
      ],
    }},
    { type: 'teach', content: {
      title: 'He and she: done',
      explanation: '**Bare verb = he.  Add ـتْ = she.**\n\nNext: how a verb says **they** did it — the ـُوا ending with its silent alif.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U13_L3 = { // They did
  steps: [
    { type: 'teach', content: {
      title: 'They did — the ـُوا ending',
      explanation: 'For "**they** (men/a group) did it", add **ـُوا**:\n\nقَالَ → **قَالُوا** (they said)\nكَانَ → **كَانُوا** (they were)\nآمَنَ → **آمَنُوا** (they believed)',
      arabic: 'قَالُوا · كَانُوا',
      transliteration: 'qaaloo · kaanoo',
      examples: [
        { ar: 'آمَنُوا', tr: 'aamanoo', en: 'they believed' },
        { ar: 'عَمِلُوا', tr: '‘amiloo', en: 'they did / worked' },
        { ar: 'كَفَرُوا', tr: 'kafaroo', en: 'they disbelieved' },
      ],
      fun_fact: 'The alif after ـُوا is SILENT — written but never pronounced. قَالُوا is said "qaaloo", not "qaalooa".',
    }},
    { type: 'mcq', content: {
      question: 'قَالُوا means...',
      options: [
        { text: 'they said', correct: true },
        { text: 'he said', correct: false },
        { text: 'she said', correct: false },
      ],
      explanation: 'The ـُوا ending = "they". قَالَ he · قَالَتْ she · قَالُوا they.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'الَّذِينَ ___ ("those who believed") — the verb for "they believed".',
      correct_answer: 'آمَنُوا',
      options: ['آمَنُوا', 'آمَنَ', 'آمَنَتْ'],
      explanation: 'الَّذِينَ آمَنُوا appears 250+ times — "those who believed". ـُوا = they.',
    }},
    { type: 'classify', content: {
      instruction: 'He, she, or they?',
      categories: ['He', 'She', 'They'],
      items: [
        { text: 'خَلَقَ', category: 'He' },
        { text: 'خَلَقَتْ', category: 'She' },
        { text: 'كَانُوا', category: 'They' },
        { text: 'قَالُوا', category: 'They' },
        { text: 'قَالَتْ', category: 'She' },
        { text: 'قَالَ', category: 'He' },
      ],
      explanation: 'No tail = he · ـتْ = she · ـُوا = they.',
    }},
    { type: 'mcq', content: {
      question: 'The famous phrase الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ means...',
      options: [
        { text: 'those who believed and did righteous deeds', correct: true },
        { text: 'he believes and works', correct: false },
      ],
      explanation: 'آمَنُوا (they believed) + عَمِلُوا (they did) — both "they" past verbs.',
    }},
    { type: 'arrange', content: {
      instruction: 'Build: "they believed and they did"',
      reference: 'they believed and they did',
      tiles: ['آمَنُوا', 'وَ', 'عَمِلُوا'],
      correct_order: ['آمَنُوا', 'وَ', 'عَمِلُوا'],
      result_transliteration: 'aamanoo wa ‘amiloo',
      explanation: 'The Quran’s signature pairing of faith and action.',
    }},
    { type: 'teach', content: {
      title: 'He, she, they — mastered',
      explanation: 'You now read the "third person" past: قَالَ، قَالَتْ، قَالُوا. Next: the star verbs the Quran repeats most.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U13_L4 = { // Star verbs
  steps: [
    { type: 'teach', content: {
      title: 'The star verbs',
      explanation: 'A handful of past verbs power huge parts of the Quran:\n\n**كَانَ** (he was)  ·  **جَعَلَ** (he made/placed)  ·  **خَلَقَ** (he created)  ·  **أَنْزَلَ** (he sent down)',
      arabic: 'خَلَقَ · جَعَلَ · أَنْزَلَ',
      transliteration: 'khalaqa · ja‘ala · anzala',
      examples: [
        { ar: 'خَلَقَ', tr: 'khalaqa', en: 'he created' },
        { ar: 'جَعَلَ', tr: 'ja‘ala', en: 'he made / placed' },
        { ar: 'أَنْزَلَ', tr: 'anzala', en: 'he sent down' },
      ],
      fun_fact: 'خَلَقَ (created) describes Allah’s act again and again: خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ.',
    }},
    { type: 'mcq', content: {
      question: 'خَلَقَ means...',
      options: [
        { text: 'he created', correct: true },
        { text: 'he said', correct: false },
        { text: 'he sent down', correct: false },
      ],
      explanation: 'خَلَقَ = he created. The root خ-ل-ق is the DNA of creation.',
    }},
    { type: 'match', content: {
      instruction: 'Match the star verb to its meaning',
      pairs: [
        { left: 'كَانَ', right: 'he was' },
        { left: 'جَعَلَ', right: 'he made / placed' },
        { left: 'خَلَقَ', right: 'he created' },
        { left: 'أَنْزَلَ', right: 'he sent down' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'الَّذِي ___ السَّمَاوَاتِ وَالْأَرْضَ — "the One who CREATED the heavens and the earth".',
      correct_answer: 'خَلَقَ',
      options: ['خَلَقَ', 'قَالَ', 'كَانَ'],
      explanation: 'خَلَقَ = created. A refrain describing Allah’s power throughout the Quran.',
    }},
    { type: 'classify', content: {
      instruction: 'What did each verb do?',
      categories: ['create', 'send down', 'make/place'],
      items: [
        { text: 'خَلَقَ', category: 'create' },
        { text: 'أَنْزَلَ', category: 'send down' },
        { text: 'جَعَلَ', category: 'make/place' },
      ],
      explanation: 'خَلَقَ create · أَنْزَلَ send down · جَعَلَ make/place.',
    }},
    { type: 'teach', content: {
      title: 'Star verbs in your pocket',
      explanation: 'كَانَ، جَعَلَ، خَلَقَ، أَنْزَلَ — high-frequency and high-power. Next: the graduation — a real ayah of speech from Al-Baqarah.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U13_L5 = { // Read the Quran: Al-Baqarah 30
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — Al-Baqarah 30',
      explanation: '**وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً**\n"And when your Lord SAID to the angels: I am placing on the earth a successor..."',
      arabic: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ',
      transliteration: 'wa idh qaala rabbuka lil-malaa’ikah',
      quran_ref: 'Al-Baqarah 2:30',
    }},
    { type: 'mcq', content: {
      question: 'قَالَ رَبُّكَ — قَالَ is...',
      options: [
        { text: '"said" — a past verb (he said)', correct: true },
        { text: 'a noun', correct: false },
        { text: 'a preposition', correct: false },
      ],
      explanation: 'قَالَ = "he said". The subject رَبُّكَ ("your Lord") follows it.',
    }},
    { type: 'mcq', content: {
      question: 'رَبُّكَ ("your Lord") is the ONE who said it. What is رَبُّكَ called?',
      options: [
        { text: 'the doer of the verb (you’ll name it "fā‘il" in Stage 5)', correct: true },
        { text: 'the object', correct: false },
      ],
      explanation: 'The doer of a verb is coming up as a formal concept next stage. Here: Lord did the saying.',
    }},
    { type: 'classify', content: {
      instruction: 'Verb or not a verb?',
      categories: ['Verb (fi‘l)', 'Not a verb'],
      items: [
        { text: 'قَالَ (said)', category: 'Verb (fi‘l)' },
        { text: 'رَبُّكَ (your Lord)', category: 'Not a verb' },
        { text: 'الْمَلَائِكَةِ (the angels)', category: 'Not a verb' },
        { text: 'خَلَقَ (created)', category: 'Verb (fi‘l)' },
      ],
      explanation: 'قَالَ and خَلَقَ are actions (verbs); the rest are isms.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'لِلْمَلَائِكَةِ = لِ ("to") + الْمَلَائِكَة ("the angels"). The لِ is a ___.',
      correct_answer: 'preposition',
      options: ['preposition', 'verb', 'pronoun'],
      explanation: 'Your Stage-3 preposition لِ ("to/for") — "He said TO the angels".',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 13 complete!',
      explanation: 'You read the past tense — he, she, they — inside real revelation.\n\nNext: the rest of the family — **I did, you did, we did** (including Allah’s majestic "We").',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 14 — I Did, You Did, We Did
// ═══════════════════════════════════════════════════════════════

const U14_L1 = { // I and we
  steps: [
    { type: 'teach', content: {
      title: 'I did & We did',
      explanation: 'Add endings for the speaker:\n\n**ـتُ** = I did → فَعَلْتُ\n**ـنَا** = we did → فَعَلْنَا\n\nخَلَقْتُ (I created) · خَلَقْنَا (We created)',
      arabic: 'خَلَقْتُ · خَلَقْنَا',
      transliteration: 'khalaqtu · khalaqnaa',
      examples: [
        { ar: 'أَنْزَلْنَا', tr: 'anzalnaa', en: 'We sent down' },
        { ar: 'جَعَلْنَا', tr: 'ja‘alnaa', en: 'We made' },
        { ar: 'خَلَقْنَا', tr: 'khalaqnaa', en: 'We created' },
      ],
      fun_fact: 'The Quran often uses "We" (نَا) for Allah — the royal "We" of majesty: إِنَّا أَنْزَلْنَاهُ.',
    }},
    { type: 'mcq', content: {
      question: 'خَلَقْنَا means...',
      options: [
        { text: 'We created', correct: true },
        { text: 'he created', correct: false },
        { text: 'they created', correct: false },
      ],
      explanation: 'The ـنَا ending = "we". خَلَقْنَا = We created.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'To say "We did", add ___ to the verb.',
      correct_answer: 'ـنَا',
      options: ['ـنَا', 'ـتُ', 'ـوا'],
      explanation: 'ـنَا = we. ـتُ = I. فَعَلْنَا = we did.',
    }},
    { type: 'match', content: {
      instruction: 'Match to meaning',
      pairs: [
        { left: 'خَلَقْتُ', right: 'I created' },
        { left: 'خَلَقْنَا', right: 'We created' },
        { left: 'أَنْزَلْنَا', right: 'We sent down' },
      ],
    }},
    { type: 'classify', content: {
      instruction: 'Who did it?',
      categories: ['I (ـتُ)', 'We (ـنَا)'],
      items: [
        { text: 'خَلَقْتُ', category: 'I (ـتُ)' },
        { text: 'خَلَقْنَا', category: 'We (ـنَا)' },
        { text: 'أَنْزَلْنَا', category: 'We (ـنَا)' },
        { text: 'جَعَلْتُ', category: 'I (ـتُ)' },
      ],
      explanation: 'ـتُ = I · ـنَا = we.',
    }},
    { type: 'teach', content: {
      title: 'The speaker forms',
      explanation: 'I (ـتُ) and We (ـنَا). Next: turning to the listener — you did.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U14_L2 = { // You did
  steps: [
    { type: 'teach', content: {
      title: 'You did (m / f / plural)',
      explanation: '**ـتَ** = you (m) → فَعَلْتَ\n**ـتِ** = you (f) → فَعَلْتِ\n**ـتُمْ** = you all → فَعَلْتُمْ\n\nNotice: these all use ت, like the "she" ـتْ — context and the final vowel tell them apart.',
      arabic: 'فَعَلْتَ · فَعَلْتِ · فَعَلْتُمْ',
      transliteration: 'fa‘alta · fa‘alti · fa‘altum',
      examples: [
        { ar: 'أَنْعَمْتَ', tr: 'an‘amta', en: 'You (m) blessed' },
        { ar: 'خَلَقْتَ', tr: 'khalaqta', en: 'You (m) created' },
      ],
      fun_fact: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ — "the path of those You have blessed" (Al-Fatiha). أَنْعَمْتَ = "You blessed".',
    }},
    { type: 'mcq', content: {
      question: 'أَنْعَمْتَ (in Al-Fatiha) means...',
      options: [
        { text: 'You (have) blessed', correct: true },
        { text: 'they blessed', correct: false },
        { text: 'we blessed', correct: false },
      ],
      explanation: 'ـتَ = "you (m)". أَنْعَمْتَ = "You blessed" — addressed to Allah.',
    }},
    { type: 'match', content: {
      instruction: 'Match ending to meaning',
      pairs: [
        { left: 'ـتَ', right: 'you (m)' },
        { left: 'ـتِ', right: 'you (f)' },
        { left: 'ـتُمْ', right: 'you all' },
        { left: 'ـتُ', right: 'I' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'صِرَاطَ الَّذِينَ أَنْعَمْ___ عَلَيْهِمْ — "...those YOU have blessed" (Al-Fatiha 1:7).',
      correct_answer: 'تَ',
      options: ['تَ', 'نَا', 'وا'],
      explanation: 'أَنْعَمْتَ = "You blessed". The ـتَ addresses Allah directly.',
    }},
    { type: 'classify', content: {
      instruction: 'Speaker (I/we) or listener (you)?',
      categories: ['Speaker (I/we)', 'Listener (you)'],
      items: [
        { text: 'خَلَقْتُ (I created)', category: 'Speaker (I/we)' },
        { text: 'خَلَقْتَ (you created)', category: 'Listener (you)' },
        { text: 'خَلَقْنَا (we created)', category: 'Speaker (I/we)' },
        { text: 'أَنْعَمْتَ (you blessed)', category: 'Listener (you)' },
      ],
      explanation: 'ـتُ/ـنَا = the speaker; ـتَ/ـتِ/ـتُمْ = the one addressed.',
    }},
    { type: 'teach', content: {
      title: 'The listener forms',
      explanation: 'you-m (ـتَ), you-f (ـتِ), you-all (ـتُمْ). Next: see the WHOLE past-tense table on one root.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U14_L3 = { // The full past table
  steps: [
    { type: 'teach', content: {
      title: 'One root, the whole family',
      explanation: 'Watch فَعَلَ take every person:\n\nHe فَعَلَ · She فَعَلَتْ · They فَعَلُوا\nI فَعَلْتُ · We فَعَلْنَا\nYou(m) فَعَلْتَ · You(f) فَعَلْتِ · You(all) فَعَلْتُمْ\n\nThe root stays; only the tail changes.',
      arabic: 'فَعَلَ · فَعَلْتُ · فَعَلْنَا',
      transliteration: 'fa‘ala · fa‘altu · fa‘alnaa',
      examples: [
        { ar: 'كَتَبْتُ', tr: 'katabtu', en: 'I wrote' },
        { ar: 'كَتَبْنَا', tr: 'katabnaa', en: 'we wrote' },
        { ar: 'كَتَبُوا', tr: 'kataboo', en: 'they wrote' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'In the past tense, what changes from person to person?',
      options: [
        { text: 'The ending (tail) — the root stays the same', correct: true },
        { text: 'The whole word is different each time', correct: false },
      ],
      explanation: 'Learn the endings once and every root conjugates the same way.',
    }},
    { type: 'match', content: {
      instruction: 'Match the ending to the person',
      pairs: [
        { left: 'ـَ (bare)', right: 'he' },
        { left: 'ـتْ', right: 'she' },
        { left: 'ـُوا', right: 'they' },
        { left: 'ـنَا', right: 'we' },
      ],
    }},
    { type: 'classify', content: {
      instruction: 'Who did the writing?',
      categories: ['I', 'We', 'They', 'She'],
      items: [
        { text: 'كَتَبْتُ', category: 'I' },
        { text: 'كَتَبْنَا', category: 'We' },
        { text: 'كَتَبُوا', category: 'They' },
        { text: 'كَتَبَتْ', category: 'She' },
      ],
      explanation: 'ـتُ I · ـنَا we · ـُوا they · ـتْ she. Same root ك-ت-ب throughout.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'كَتَبَ رَبُّكُمْ عَلَىٰ نَفْسِهِ الرَّحْمَةَ — "Your Lord has DECREED mercy upon Himself" (Al-An‘am 6:54). كَتَبَ here = "he decreed/wrote", which person?',
      correct_answer: 'he',
      options: ['he', 'they', 'we'],
      explanation: 'Bare كَتَبَ = "he". The subject is رَبُّكُمْ ("your Lord").',
    }},
    { type: 'teach', content: {
      title: 'The full past table — yours',
      explanation: 'Eight persons, one set of endings. Next: the graduation — Surah Al-Qadr’s majestic "We".',
      arabic: null, transliteration: null,
    }},
  ],
};

const U14_L4 = { // Read the Quran: Al-Qadr
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — Al-Qadr 1',
      explanation: '**إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ**\n"Indeed, WE sent it down in the Night of Decree."',
      arabic: 'إِنَّا أَنْزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ',
      transliteration: 'innaa anzalnaahu fee laylatil-qadr',
      quran_ref: 'Al-Qadr 97:1',
    }},
    { type: 'mcq', content: {
      question: 'أَنْزَلْنَا means...',
      options: [
        { text: 'We sent down', correct: true },
        { text: 'he sent down', correct: false },
        { text: 'they sent down', correct: false },
      ],
      explanation: 'The ـنَا ending = "We" — the royal "We" of Allah. أَنْزَلْنَا = We sent down.',
    }},
    { type: 'mcq', content: {
      question: 'أَنْزَلْنَاهُ = أَنْزَلْنَا + هُ. What does the هُ add?',
      options: [
        { text: '"it" — We sent IT down (the Quran)', correct: true },
        { text: '"you"', correct: false },
        { text: 'nothing', correct: false },
      ],
      explanation: 'Your Unit-5 attached pronoun هُ ("it/him") rides on the verb: "We sent it down".',
    }},
    { type: 'fill_blank', content: {
      sentence: 'لَيْلَةِ الْقَدْرِ ("the Night of Decree") is an ___ — two nouns, "night OF decree".',
      correct_answer: 'idafa',
      options: ['idafa', 'adjective', 'verb'],
      explanation: 'Your Stage-2 iḍāfa: لَيْلَة + الْقَدْر. Everything is connecting.',
    }},
    { type: 'classify', content: {
      instruction: 'Label each word of the ayah',
      categories: ['Verb (fi‘l)', 'Preposition (harf)', 'Noun (ism)'],
      items: [
        { text: 'أَنْزَلْنَا (We sent down)', category: 'Verb (fi‘l)' },
        { text: 'فِي (in)', category: 'Preposition (harf)' },
        { text: 'لَيْلَةِ (night)', category: 'Noun (ism)' },
      ],
      explanation: 'You can now sort verb, harf, and ism in a real ayah — all three word types.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 14 complete!',
      explanation: 'The entire past tense is yours. Next: the **present tense** — actions happening now, marked by prefixes like يَـ.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 15 — It's Happening (present tense)
// ═══════════════════════════════════════════════════════════════

const U15_L1 = { // the ya prefix
  steps: [
    { type: 'teach', content: {
      title: 'The present tense: prefixes, not suffixes',
      explanation: 'Past tense adds **endings**. Present tense adds a **prefix** at the FRONT.\n\n**يَـ** = he (is/does) → يَفْعَلُ\n\nيَعْلَمُ (he knows) · يَقُولُ (he says) · يَخْلُقُ (he creates)',
      arabic: 'يَفْعَلُ',
      transliteration: 'yaf‘alu (he does/is doing)',
      examples: [
        { ar: 'يَعْلَمُ', tr: 'ya‘lamu', en: 'he knows' },
        { ar: 'يَقُولُ', tr: 'yaqoolu', en: 'he says' },
        { ar: 'يَعْبُدُ', tr: 'ya‘budu', en: 'he worships' },
      ],
      fun_fact: 'قَالَ (he said, past) vs يَقُولُ (he says, present) — same root ق-و-ل, different time.',
    }},
    { type: 'mcq', content: {
      question: 'يَعْلَمُ means...',
      options: [
        { text: 'he knows (present)', correct: true },
        { text: 'he knew (past)', correct: false },
        { text: 'know! (command)', correct: false },
      ],
      explanation: 'The يَـ prefix = present tense "he". يَعْلَمُ = he knows.',
    }},
    { type: 'classify', content: {
      instruction: 'Past (he did) or present (he does)?',
      categories: ['Past (فَعَلَ)', 'Present (يَفْعَلُ)'],
      items: [
        { text: 'قَالَ', category: 'Past (فَعَلَ)' },
        { text: 'يَقُولُ', category: 'Present (يَفْعَلُ)' },
        { text: 'خَلَقَ', category: 'Past (فَعَلَ)' },
        { text: 'يَعْلَمُ', category: 'Present (يَفْعَلُ)' },
      ],
      explanation: 'A يَـ at the front = present. A bare form = past.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'The past قَالَ ("he said") becomes the present ___ ("he says").',
      correct_answer: 'يَقُولُ',
      options: ['يَقُولُ', 'قَالُوا', 'قُلْ'],
      explanation: 'Add the يَـ prefix: يَقُولُ = "he says / is saying".',
    }},
    { type: 'match', content: {
      instruction: 'Match present verb to meaning',
      pairs: [
        { left: 'يَعْلَمُ', right: 'he knows' },
        { left: 'يَقُولُ', right: 'he says' },
        { left: 'يَعْبُدُ', right: 'he worships' },
      ],
    }},
    { type: 'teach', content: {
      title: 'Present tense begins',
      explanation: 'يَـ marks "he does" — happening now or ongoing. Next: the full set of prefixes for I, we, you, she.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U15_L2 = { // full present prefixes
  steps: [
    { type: 'teach', content: {
      title: 'The four prefixes — أَنَيْتَ',
      explanation: 'Present tense uses four front-letters:\n\n**أَ** = I → أَفْعَلُ\n**نَـ** = we → نَفْعَلُ\n**تَـ** = you / she → تَفْعَلُ\n**يَـ** = he / they → يَفْعَلُ\n\nMemory trick: the letters spell **أَنَيْتَ** (a-n-y-t).',
      arabic: 'أَ · نَـ · تَـ · يَـ',
      transliteration: 'a · na · ta · ya',
      examples: [
        { ar: 'أَعْبُدُ', tr: 'a‘budu', en: 'I worship' },
        { ar: 'نَعْبُدُ', tr: 'na‘budu', en: 'we worship' },
        { ar: 'تَعْلَمُونَ', tr: 'ta‘lamoon', en: 'you (all) know' },
      ],
      fun_fact: 'إِيَّاكَ نَعْبُدُ — "You alone WE worship" (Al-Fatiha). نَـ = we.',
    }},
    { type: 'mcq', content: {
      question: 'نَعْبُدُ means...',
      options: [
        { text: 'we worship', correct: true },
        { text: 'I worship', correct: false },
        { text: 'he worships', correct: false },
      ],
      explanation: 'The نَـ prefix = "we". نَعْبُدُ = we worship (إِيَّاكَ نَعْبُدُ).',
    }},
    { type: 'match', content: {
      instruction: 'Match the prefix to the person',
      pairs: [
        { left: 'أَ', right: 'I' },
        { left: 'نَـ', right: 'we' },
        { left: 'تَـ', right: 'you / she' },
        { left: 'يَـ', right: 'he / they' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'إِيَّاكَ ___عْبُدُ وَإِيَّاكَ ___سْتَعِينُ — "You alone WE worship, You alone WE ask for help" (Al-Fatiha 1:5).',
      correct_answer: 'نَ',
      options: ['نَ', 'أَ', 'يَ'],
      explanation: 'نَعْبُدُ, نَسْتَعِينُ — both begin with نَـ ("we").',
    }},
    { type: 'classify', content: {
      instruction: 'Who is doing it (present)?',
      categories: ['I (أَ)', 'We (نَـ)', 'You/She (تَـ)', 'He/They (يَـ)'],
      items: [
        { text: 'أَعْلَمُ', category: 'I (أَ)' },
        { text: 'نَعْلَمُ', category: 'We (نَـ)' },
        { text: 'تَعْلَمُ', category: 'You/She (تَـ)' },
        { text: 'يَعْلَمُ', category: 'He/They (يَـ)' },
      ],
      explanation: 'The front letter tells you who: أَ I · نَـ we · تَـ you/she · يَـ he/they.',
    }},
    { type: 'teach', content: {
      title: 'All four prefixes: أَنَيْتَ',
      explanation: 'I، we، you/she، he/they — read off the front letter. Next: how the present marks a plural "they/you all".',
      arabic: null, transliteration: null,
    }},
  ],
};

const U15_L3 = { // present plural
  steps: [
    { type: 'teach', content: {
      title: 'Present plural — the ـُونَ ending',
      explanation: 'For "they / you all" in the present, keep the prefix AND add **ـُونَ**:\n\nيَعْلَمُونَ = they know\nتَعْلَمُونَ = you (all) know\nيَعْمَلُونَ = they do',
      arabic: 'يَعْلَمُونَ · تَعْلَمُونَ',
      transliteration: 'ya‘lamoon · ta‘lamoon',
      examples: [
        { ar: 'يُؤْمِنُونَ', tr: 'yu’minoon', en: 'they believe' },
        { ar: 'يَعْمَلُونَ', tr: 'ya‘maloon', en: 'they do / work' },
        { ar: 'تَعْقِلُونَ', tr: 'ta‘qiloon', en: 'you (all) reason' },
      ],
      fun_fact: 'يَـ + ـُونَ = "they"; تَـ + ـُونَ = "you all". The prefix picks the person, the ـُونَ makes it plural.',
    }},
    { type: 'mcq', content: {
      question: 'يَعْلَمُونَ means...',
      options: [
        { text: 'they know', correct: true },
        { text: 'he knows', correct: false },
        { text: 'we know', correct: false },
      ],
      explanation: 'يَـ (he/they) + ـُونَ (plural) = "they know".',
    }},
    { type: 'classify', content: {
      instruction: 'They, or you-all?',
      categories: ['They (يَـ…ـُونَ)', 'You all (تَـ…ـُونَ)'],
      items: [
        { text: 'يَعْلَمُونَ', category: 'They (يَـ…ـُونَ)' },
        { text: 'تَعْلَمُونَ', category: 'You all (تَـ…ـُونَ)' },
        { text: 'يُؤْمِنُونَ', category: 'They (يَـ…ـُونَ)' },
        { text: 'تَعْمَلُونَ', category: 'You all (تَـ…ـُونَ)' },
      ],
      explanation: 'Front يَـ = they; front تَـ = you all. Both end in ـُونَ.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ — "those who BELIEVE in the unseen" (Al-Baqarah 2:3). يُؤْمِنُونَ = ___.',
      correct_answer: 'they believe',
      options: ['they believe', 'he believes', 'we believe'],
      explanation: 'يُؤْمِنُونَ = "they believe" — present plural.',
    }},
    { type: 'teach', content: {
      title: 'Present plural: unlocked',
      explanation: 'يَعْلَمُونَ، تَعْلَمُونَ — the ـُونَ crowd. One more present-tense skill: saying a verb did NOT / does NOT happen.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U15_L4 = { // negating verbs
  steps: [
    { type: 'teach', content: {
      title: 'Negating verbs',
      explanation: 'Your Stage-3 negators now attack verbs:\n\n**لَا** + present = does not: لَا يَعْلَمُونَ (they do not know)\n**مَا** + past = did not: مَا كَانَ (he was not)\n**لَمْ** + present = did not (past meaning): لَمْ يَلِدْ (he did not beget)\n**لَنْ** + present = will never: لَنْ نُؤْمِنَ (we will never believe)',
      arabic: 'لَا يَعْلَمُونَ',
      transliteration: 'laa ya‘lamoon',
      examples: [
        { ar: 'لَمْ يَلِدْ', tr: 'lam yalid', en: 'He did not beget' },
        { ar: 'لَنْ', tr: 'lan', en: 'will never' },
        { ar: 'مَا كَانَ', tr: 'maa kaana', en: 'he was not' },
      ],
      fun_fact: 'لَمْ يَلِدْ وَلَمْ يُولَدْ — "He begets not, nor is He begotten" (Al-Ikhlas). لَمْ flips a present verb to a past denial.',
    }},
    { type: 'mcq', content: {
      question: 'لَا يَعْلَمُونَ means...',
      options: [
        { text: 'they do not know', correct: true },
        { text: 'they know', correct: false },
        { text: 'do not know! (command)', correct: false },
      ],
      explanation: 'لَا + present verb = "do not". لَا يَعْلَمُونَ = they do not know.',
    }},
    { type: 'match', content: {
      instruction: 'Match the negator to its job',
      pairs: [
        { left: 'لَا + present', right: 'does not' },
        { left: 'لَمْ + present', right: 'did not' },
        { left: 'لَنْ + present', right: 'will never' },
        { left: 'مَا + past', right: 'did not' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'لَمْ يَلِدْ وَ___ يُولَدْ — "He begets not, NOR is He begotten" (Al-Ikhlas 112:3).',
      correct_answer: 'لَمْ',
      options: ['لَمْ', 'لَنْ', 'مَا'],
      explanation: 'لَمْ يُولَدْ = "He was not begotten". لَمْ turns a present verb into a past negation.',
    }},
    { type: 'mcq', content: {
      question: 'لَنْ نُؤْمِنَ means...',
      options: [
        { text: 'we will never believe', correct: true },
        { text: 'we do not believe now', correct: false },
      ],
      explanation: 'لَنْ = emphatic future negation ("will never"). لَنْ نُؤْمِنَ = we will never believe.',
    }},
    { type: 'teach', content: {
      title: 'You can negate any verb',
      explanation: 'لَا، مَا، لَمْ، لَنْ — past, present, and future denials. Next: the graduation — a famous refrain of knowing and not-knowing.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U15_L5 = { // Read the Quran: wallahu ya'lamu
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — He knows, you do not',
      explanation: '**وَاللّٰهُ يَعْلَمُ وَأَنْتُمْ لَا تَعْلَمُونَ**\n"And Allah KNOWS while you do NOT know." (Al-Baqarah 2:216)',
      arabic: 'وَاللّٰهُ يَعْلَمُ وَأَنْتُمْ لَا تَعْلَمُونَ',
      transliteration: 'wallaahu ya‘lamu wa antum laa ta‘lamoon',
      quran_ref: 'Al-Baqarah 2:216',
    }},
    { type: 'mcq', content: {
      question: 'يَعْلَمُ means...',
      options: [
        { text: 'He knows (present, he)', correct: true },
        { text: 'they know', correct: false },
        { text: 'He knew', correct: false },
      ],
      explanation: 'يَـ prefix, singular → "He knows". Subject: اللّٰه.',
    }},
    { type: 'mcq', content: {
      question: 'لَا تَعْلَمُونَ means...',
      options: [
        { text: 'you (all) do not know', correct: true },
        { text: 'they do not know', correct: false },
        { text: 'we do not know', correct: false },
      ],
      explanation: 'تَـ (you) + ـُونَ (plural) + لَا (not) = "you all do not know".',
    }},
    { type: 'classify', content: {
      instruction: 'Present verb: who, and is it negated?',
      categories: ['He knows', 'You (all) do NOT know'],
      items: [
        { text: 'يَعْلَمُ', category: 'He knows' },
        { text: 'لَا تَعْلَمُونَ', category: 'You (all) do NOT know' },
      ],
      explanation: 'Same root ع-ل-م: يَعْلَمُ (He knows) vs لَا تَعْلَمُونَ (you all don’t).',
    }},
    { type: 'fill_blank', content: {
      sentence: 'وَأَنْتُمْ لَا تَعْلَمُونَ — أَنْتُمْ is the pronoun ___.',
      correct_answer: 'you (all)',
      options: ['you (all)', 'they', 'we'],
      explanation: 'Your Unit-5 pronoun أَنْتُمْ ("you all"), reinforcing the verb تَعْلَمُونَ.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 15 complete!',
      explanation: 'Past AND present are yours — with negation in every tense.\n\nOne unit of Stage 4 left: **commands** — اقْرَأْ (Read!), قُلْ (Say!), and "do not".',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 16 — Do It! (imperative & prohibition) — checkpoint after
// ═══════════════════════════════════════════════════════════════

const U16_L1 = { // the command form
  steps: [
    { type: 'teach', content: {
      title: 'Commands — "Do it!"',
      explanation: 'A command (imperative) tells someone to act. Two you already half-know:\n\n**اقْرَأْ** = Read!  (the very first word revealed)\n**قُلْ** = Say!  (opens many surahs — 300+ times)',
      arabic: 'اقْرَأْ · قُلْ',
      transliteration: 'iqra’ · qul',
      examples: [
        { ar: 'قُلْ', tr: 'qul', en: 'Say!' },
        { ar: 'اقْرَأْ', tr: 'iqra’', en: 'Read!' },
        { ar: 'اسْجُدْ', tr: 'usjud', en: 'Prostrate!' },
      ],
      fun_fact: 'قُلْ هُوَ اللّٰهُ أَحَدٌ — "SAY: He is Allah, One." The command قُلْ opens Al-Ikhlas, Al-Falaq, An-Nas and more.',
    }},
    { type: 'mcq', content: {
      question: 'قُلْ means...',
      options: [
        { text: 'Say! (a command)', correct: true },
        { text: 'he said', correct: false },
        { text: 'they say', correct: false },
      ],
      explanation: 'قُلْ is the imperative "Say!" — from the root ق-و-ل (قَالَ, يَقُولُ, قُلْ).',
    }},
    { type: 'classify', content: {
      instruction: 'Statement or command?',
      categories: ['Command (Do it!)', 'Statement (he/they did)'],
      items: [
        { text: 'قُلْ (Say!)', category: 'Command (Do it!)' },
        { text: 'قَالَ (he said)', category: 'Statement (he/they did)' },
        { text: 'اقْرَأْ (Read!)', category: 'Command (Do it!)' },
        { text: 'يَقُولُ (he says)', category: 'Statement (he/they did)' },
      ],
      explanation: 'Commands tell you to act now; قَالَ/يَقُولُ just report.',
    }},
    { type: 'fill_blank', content: {
      sentence: '___ هُوَ اللّٰهُ أَحَدٌ — "SAY: He is Allah, One" (Al-Ikhlas 112:1).',
      correct_answer: 'قُلْ',
      options: ['قُلْ', 'قَالَ', 'يَقُولُ'],
      explanation: 'قُلْ = "Say!" — the command that opens Al-Ikhlas.',
    }},
    { type: 'match', content: {
      instruction: 'Match the command to its meaning',
      pairs: [
        { left: 'قُلْ', right: 'Say!' },
        { left: 'اقْرَأْ', right: 'Read!' },
        { left: 'اسْجُدْ', right: 'Prostrate!' },
      ],
    }},
    { type: 'teach', content: {
      title: 'You can give commands',
      explanation: 'قُلْ، اقْرَأْ — the Quran’s directives. Next: the plural commands aimed at all of us.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U16_L2 = { // common plural commands
  steps: [
    { type: 'teach', content: {
      title: 'Commands to everyone (ـُوا)',
      explanation: 'A command to a GROUP ends in **ـُوا** (like the past "they", but here it’s "you all, do it!"):\n\n**اعْبُدُوا** = Worship! (you all)\n**اتَّقُوا** = Be conscious of / fear (Allah)!\n**آمِنُوا** = Believe!',
      arabic: 'اعْبُدُوا · اتَّقُوا · آمِنُوا',
      transliteration: 'u‘budoo · ittaqoo · aaminoo',
      examples: [
        { ar: 'اعْبُدُوا', tr: 'u‘budoo', en: 'Worship! (you all)' },
        { ar: 'اتَّقُوا', tr: 'ittaqoo', en: 'Fear / be mindful! (you all)' },
        { ar: 'اذْكُرُوا', tr: 'udhkuroo', en: 'Remember! (you all)' },
      ],
      fun_fact: 'يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ — "O mankind, WORSHIP your Lord!" (Al-Baqarah 2:21).',
    }},
    { type: 'mcq', content: {
      question: 'اعْبُدُوا means...',
      options: [
        { text: 'Worship! (addressed to a group)', correct: true },
        { text: 'they worshipped', correct: false },
        { text: 'he worships', correct: false },
      ],
      explanation: 'A plural command ends in ـُوا: اعْبُدُوا = "worship, all of you!"',
    }},
    { type: 'classify', content: {
      instruction: 'Command to a group, or past "they did"?',
      categories: ['Command (you all, do it!)', 'Past (they did)'],
      items: [
        { text: 'اعْبُدُوا (Worship!)', category: 'Command (you all, do it!)' },
        { text: 'عَبَدُوا (they worshipped)', category: 'Past (they did)' },
        { text: 'آمِنُوا (Believe!)', category: 'Command (you all, do it!)' },
        { text: 'آمَنُوا (they believed)', category: 'Past (they did)' },
      ],
      explanation: 'Commands often start with a helping alif (ا) and have no يَـ/تَـ. Compare آمِنُوا (believe!) vs آمَنُوا (they believed).',
    }},
    { type: 'fill_blank', content: {
      sentence: 'يَا أَيُّهَا النَّاسُ ___ رَبَّكُمُ — "O mankind, WORSHIP your Lord!" (Al-Baqarah 2:21).',
      correct_answer: 'اعْبُدُوا',
      options: ['اعْبُدُوا', 'عَبَدُوا', 'يَعْبُدُونَ'],
      explanation: 'A direct call to action → the command اعْبُدُوا.',
    }},
    { type: 'teach', content: {
      title: 'Plural commands: on',
      explanation: 'اعْبُدُوا، اتَّقُوا، آمِنُوا — the Quran’s calls to all of us. Next: the opposite — telling someone NOT to do something.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U16_L3 = { // don't!
  steps: [
    { type: 'teach', content: {
      title: '"Don’t!" — لَا + present',
      explanation: 'To forbid, put **لَا** before a present verb (shortened):\n\n**لَا تَخَفْ** = Do not fear\n**لَا تَحْزَنْ** = Do not grieve\n**لَا تَيْأَسُوا** = Do not despair',
      arabic: 'لَا تَخَفْ · لَا تَحْزَنْ',
      transliteration: 'laa takhaf · laa tahzan',
      examples: [
        { ar: 'لَا تَخَفْ', tr: 'laa takhaf', en: 'do not fear' },
        { ar: 'لَا تَحْزَنْ', tr: 'laa tahzan', en: 'do not grieve' },
        { ar: 'لَا تَقْنَطُوا', tr: 'laa taqnatoo', en: 'do not lose hope' },
      ],
      fun_fact: 'لَا تَحْزَنْ إِنَّ اللّٰهَ مَعَنَا — "Do not grieve; indeed Allah is WITH us" (At-Tawbah 9:40).',
    }},
    { type: 'mcq', content: {
      question: 'لَا تَحْزَنْ means...',
      options: [
        { text: 'do not grieve', correct: true },
        { text: 'he does not grieve', correct: false },
        { text: 'they did not grieve', correct: false },
      ],
      explanation: 'لَا + present verb (command form) = "do not ___". لَا تَحْزَنْ = do not grieve.',
    }},
    { type: 'classify', content: {
      instruction: 'A "do it!" or a "don’t!"?',
      categories: ['Do it! (command)', 'Don’t! (prohibition)'],
      items: [
        { text: 'اعْبُدُوا (Worship!)', category: 'Do it! (command)' },
        { text: 'لَا تَخَفْ (Don’t fear)', category: 'Don’t! (prohibition)' },
        { text: 'اقْرَأْ (Read!)', category: 'Do it! (command)' },
        { text: 'لَا تَحْزَنْ (Don’t grieve)', category: 'Don’t! (prohibition)' },
      ],
      explanation: 'لَا before a present verb = prohibition; a bare imperative = a positive command.',
    }},
    { type: 'fill_blank', content: {
      sentence: '___ تَحْزَنْ إِنَّ اللّٰهَ مَعَنَا — "Do NOT grieve; indeed Allah is with us."',
      correct_answer: 'لَا',
      options: ['لَا', 'قُلْ', 'مَا'],
      explanation: 'لَا تَحْزَنْ — the Prophet ﷺ comforting Abu Bakr in the cave.',
    }},
    { type: 'teach', content: {
      title: 'Commands & prohibitions: complete',
      explanation: 'Do it (اعْبُدُوا) and don’t (لَا تَخَفْ). Final lesson of Stage 4: the graduation — the first revelation, اقْرَأْ.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U16_L4 = { // Read the Quran: Al-Alaq 1
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — The First Revelation',
      explanation: 'The very first words revealed to the Prophet ﷺ:\n\n**اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ**\n"READ in the name of your Lord who CREATED."',
      arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
      transliteration: 'iqra’ bismi rabbika-lladhee khalaq',
      quran_ref: 'Al-Alaq 96:1',
    }},
    { type: 'mcq', content: {
      question: 'اقْرَأْ is...',
      options: [
        { text: 'a command — "Read!"', correct: true },
        { text: 'a past verb — "he read"', correct: false },
        { text: 'a noun', correct: false },
      ],
      explanation: 'اقْرَأْ = "Read!" — the imperative that began the Revelation.',
    }},
    { type: 'mcq', content: {
      question: 'خَلَقَ at the end is...',
      options: [
        { text: 'a past verb — "created"', correct: true },
        { text: 'a command', correct: false },
        { text: 'a present verb', correct: false },
      ],
      explanation: 'خَلَقَ = "he created" — your Unit-13 star verb. "...your Lord who created."',
    }},
    { type: 'classify', content: {
      instruction: 'Label every word of the ayah',
      categories: ['Command', 'Preposition', 'Noun + pronoun', 'Past verb'],
      items: [
        { text: 'اقْرَأْ (Read!)', category: 'Command' },
        { text: 'بِـ (in/with)', category: 'Preposition' },
        { text: 'رَبِّكَ (your Lord)', category: 'Noun + pronoun' },
        { text: 'خَلَقَ (created)', category: 'Past verb' },
      ],
      explanation: 'A command, a preposition, an iḍāfa-with-pronoun, and a past verb — you parsed the first ayah ever revealed.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'بِاسْمِ رَبِّكَ = "in the name of your Lord". رَبِّكَ = رَبّ + ___ ("your").',
      correct_answer: 'كَ',
      options: ['كَ', 'هُ', 'نَا'],
      explanation: 'Your Unit-5 attached pronoun كَ ("your"), inside the very first revelation.',
    }},
    { type: 'arrange', content: {
      instruction: 'Rebuild the first revelation',
      reference: 'Read in the name of your Lord who created',
      tiles: ['اقْرَأْ', 'بِاسْمِ', 'رَبِّكَ', 'الَّذِي', 'خَلَقَ'],
      correct_order: ['اقْرَأْ', 'بِاسْمِ', 'رَبِّكَ', 'الَّذِي', 'خَلَقَ'],
      result_transliteration: 'iqra’ bismi rabbika-lladhee khalaq',
      explanation: 'الَّذِي = "who" (a relative word — you meet it fully in Stage 5).',
    }},
    { type: 'teach', content: {
      title: '🏆 STAGE 4 COMPLETE!',
      explanation: 'You now read Arabic **verbs** — past, present, and command, across every person, with negation and prohibition. Powered by the root system that names this whole app.\n\nWith Stages 1–4, you recognize a huge share of Quranic words. Next stage: **building sentences** — finding the doer (fā‘il), the object (maf‘ūl), and reading a full ayah as a scholar does.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// Vocabulary  [word_ar, translit, english, word_type, gender, number, ref, difficulty]
// verbs → word_type 'feel', gender/number null
// ═══════════════════════════════════════════════════════════════

const U13_VOCAB = [
  ['قَالَ', 'qaala', 'he said', 'feel', null, null, 'Al-Baqarah 2:30', 1],
  ['قَالَتْ', 'qaalat', 'she said', 'feel', null, null, 'Aal Imran 3:35', 1],
  ['قَالُوا', 'qaaloo', 'they said', 'feel', null, null, 'Al-Baqarah 2:32', 1],
  ['خَلَقَ', 'khalaqa', 'he created', 'feel', null, null, 'Al-Alaq 96:1', 1],
  ['كَانَ', 'kaana', 'he was', 'feel', null, null, 'An-Nisa 4:1', 1],
  ['كَانُوا', 'kaanoo', 'they were', 'feel', null, null, 'Al-Baqarah 2:59', 1],
  ['جَعَلَ', 'ja‘ala', 'he made / placed', 'feel', null, null, 'Al-Baqarah 2:22', 1],
  ['أَنْزَلَ', 'anzala', 'he sent down', 'feel', null, null, 'Al-Baqarah 2:4', 1],
  ['آمَنُوا', 'aamanoo', 'they believed', 'feel', null, null, 'Al-Baqarah 2:25', 1],
  ['عَمِلُوا', '‘amiloo', 'they did / worked', 'feel', null, null, 'Al-Baqarah 2:25', 1],
];

const U14_VOCAB = [
  ['خَلَقْنَا', 'khalaqnaa', 'We created', 'feel', null, null, 'Al-Mu’minun 23:12', 1],
  ['أَنْزَلْنَا', 'anzalnaa', 'We sent down', 'feel', null, null, 'Al-Qadr 97:1', 1],
  ['أَنْزَلْنَاهُ', 'anzalnaahu', 'We sent it down', 'feel', null, null, 'Al-Qadr 97:1', 2],
  ['جَعَلْنَا', 'ja‘alnaa', 'We made', 'feel', null, null, 'Al-Anbiya 21:30', 1],
  ['أَنْعَمْتَ', 'an‘amta', 'You (m) blessed', 'feel', null, null, 'Al-Fatiha 1:7', 1],
  ['كَتَبَ', 'kataba', 'he wrote / decreed', 'feel', null, null, 'Al-An‘am 6:54', 1],
];

const U15_VOCAB = [
  ['يَعْلَمُ', 'ya‘lamu', 'he knows', 'feel', null, null, 'Al-Baqarah 2:216', 1],
  ['يَقُولُ', 'yaqoolu', 'he says', 'feel', null, null, 'Al-Baqarah 2:8', 1],
  ['يَعْلَمُونَ', 'ya‘lamoon', 'they know', 'feel', null, null, 'Al-Baqarah 2:13', 1],
  ['تَعْلَمُونَ', 'ta‘lamoon', 'you (all) know', 'feel', null, null, 'Al-Baqarah 2:22', 1],
  ['نَعْبُدُ', 'na‘budu', 'we worship', 'feel', null, null, 'Al-Fatiha 1:5', 1],
  ['يُؤْمِنُونَ', 'yu’minoon', 'they believe', 'feel', null, null, 'Al-Baqarah 2:3', 1],
  ['يَعْمَلُونَ', 'ya‘maloon', 'they do / work', 'feel', null, null, 'Al-Baqarah 2:74', 1],
  ['لَمْ', 'lam', 'did not', 'harf', null, null, 'Al-Ikhlas 112:3', 1],
  ['لَنْ', 'lan', 'will never', 'harf', null, null, 'Al-Baqarah 2:80', 2],
];

const U16_VOCAB = [
  ['قُلْ', 'qul', 'Say! (command)', 'feel', null, null, 'Al-Ikhlas 112:1', 1],
  ['اقْرَأْ', 'iqra’', 'Read! (command)', 'feel', null, null, 'Al-Alaq 96:1', 1],
  ['اعْبُدُوا', 'u‘budoo', 'Worship! (you all)', 'feel', null, null, 'Al-Baqarah 2:21', 1],
  ['اتَّقُوا', 'ittaqoo', 'Fear / be mindful! (you all)', 'feel', null, null, 'Al-Baqarah 2:24', 1],
  ['آمِنُوا', 'aaminoo', 'Believe! (you all)', 'feel', null, null, 'An-Nisa 4:136', 1],
  ['لَا تَخَفْ', 'laa takhaf', 'do not fear', 'feel', null, null, 'Ta-Ha 20:68', 1],
  ['لَا تَحْزَنْ', 'laa tahzan', 'do not grieve', 'feel', null, null, 'At-Tawbah 9:40', 1],
];

// ═══════════════════════════════════════════════════════════════
// Seeding
// ═══════════════════════════════════════════════════════════════

const UNIT_DEFS = [
  [13, 'past-tense-3rd', 'It Happened',        'الفِعْل المَاضِي', '⏳', '#5FB57A', false, 'The past tense: he, she, they did — powered by the root system.'],
  [14, 'past-tense-full', 'I, You, We Did',    'المَاضِي', '🗣️', '#6BA8D4', false, 'The rest of the past tense: I, you, and the majestic "We".'],
  [15, 'present-tense', "It's Happening",       'الفِعْل المُضَارِع', '⚡', '#D4A246', false, 'The present tense with its prefixes — and negating verbs.'],
  [16, 'imperative', 'Do It!',                  'فِعْل الأَمْر', '📢', '#C77DBB', true, 'Commands and prohibitions: Read! Say! Do not fear.'],
];

async function main() {
  const unitIdBySort = {};
  for (const [sortOrder, slug, title, titleAr, emoji, color, checkpoint, description] of UNIT_DEFS) {
    const [row] = await sql`
      INSERT INTO learning_units (slug, title, title_ar, description, icon_emoji, color, sort_order, checkpoint_after)
      VALUES (${slug}, ${title}, ${titleAr}, ${description}, ${emoji}, ${color}, ${sortOrder}, ${checkpoint})
      ON CONFLICT (slug) DO UPDATE SET
        title = EXCLUDED.title, title_ar = EXCLUDED.title_ar, description = EXCLUDED.description,
        icon_emoji = EXCLUDED.icon_emoji, color = EXCLUDED.color, sort_order = EXCLUDED.sort_order,
        checkpoint_after = EXCLUDED.checkpoint_after
      RETURNING id, sort_order`;
    unitIdBySort[sortOrder] = row.id;
    console.log(`Unit ${sortOrder} [${slug}] → ${row.id}`);
  }

  const lessons = [
    [13, 'root-dna', 'The 3-Letter DNA', 1, U13_L1, 15],
    [13, 'he-she-did', 'He Did, She Did', 2, U13_L2, 15],
    [13, 'they-did', 'They Did', 3, U13_L3, 15],
    [13, 'star-verbs', 'Star Verbs', 4, U13_L4, 15],
    [13, 'read-quran-said', 'Read the Quran: And He Said', 5, U13_L5, 20],

    [14, 'i-we-did', 'I Did & We Did', 1, U14_L1, 15],
    [14, 'you-did', 'You Did', 2, U14_L2, 15],
    [14, 'full-past-table', 'The Full Past Table', 3, U14_L3, 15],
    [14, 'read-quran-qadr', 'Read the Quran: Al-Qadr', 4, U14_L4, 20],

    [15, 'ya-prefix', 'The يَـ Prefix', 1, U15_L1, 15],
    [15, 'present-prefixes', 'The Four Prefixes', 2, U15_L2, 15],
    [15, 'present-plural', 'Present Plural', 3, U15_L3, 15],
    [15, 'negating-verbs', 'Negating Verbs', 4, U15_L4, 15],
    [15, 'read-quran-yalamu', 'Read the Quran: He Knows', 5, U15_L5, 20],

    [16, 'commands', 'Say! Read!', 1, U16_L1, 15],
    [16, 'plural-commands', 'Commands to Everyone', 2, U16_L2, 15],
    [16, 'prohibition', "Don't!", 3, U16_L3, 15],
    [16, 'read-quran-alaq', 'Read the Quran: The First Revelation', 4, U16_L4, 20],
  ];

  for (const [unitSort, slug, title, sortOrder, content, xp] of lessons) {
    const unitId = unitIdBySort[unitSort];
    await sql`
      INSERT INTO learning_lessons (unit_id, slug, title, sort_order, lesson_type, content, xp_reward)
      VALUES (${unitId}, ${slug}, ${title}, ${sortOrder}, 'standard', ${sql.json(content)}, ${xp})
      ON CONFLICT (unit_id, slug) DO UPDATE SET
        title = EXCLUDED.title, sort_order = EXCLUDED.sort_order,
        content = EXCLUDED.content, xp_reward = EXCLUDED.xp_reward`;
    console.log(`  ✓ U${unitSort} ${title} (${content.steps.length} steps, ${xp} XP)`);
  }

  const vocabByUnit = [[13, U13_VOCAB], [14, U14_VOCAB], [15, U15_VOCAB], [16, U16_VOCAB]];
  for (const [unitSort, vocab] of vocabByUnit) {
    const unitId = unitIdBySort[unitSort];
    await sql`DELETE FROM vocabulary_bank WHERE unit_id = ${unitId}`;
    for (const [ar, tr, en, type, gender, number, ref, diff] of vocab) {
      await sql`
        INSERT INTO vocabulary_bank (word_ar, transliteration, english, word_type, gender, number, unit_id, quranic_ref, difficulty)
        VALUES (${ar}, ${tr}, ${en}, ${type}, ${gender}, ${number}, ${unitId}, ${ref}, ${diff})`;
    }
    console.log(`  ✓ ${vocab.length} vocab words for Unit ${unitSort}`);
  }

  // Backfill: unlock Unit 13 L1 for users who finished ALL of Unit 12
  const [firstU13] = await sql`
    SELECT id FROM learning_lessons WHERE unit_id = ${unitIdBySort[13]} ORDER BY sort_order LIMIT 1`;
  const unlocked = await sql`
    WITH unit12 AS (
      SELECT l.id FROM learning_lessons l
      JOIN learning_units u ON u.id = l.unit_id
      WHERE u.sort_order = 12
    ),
    finishers AS (
      SELECT p.user_id FROM user_lesson_progress p
      JOIN unit12 ON unit12.id = p.lesson_id
      WHERE p.status = 'completed'
      GROUP BY p.user_id
      HAVING count(*) = (SELECT count(*) FROM unit12)
    )
    INSERT INTO user_lesson_progress (user_id, lesson_id, status)
    SELECT f.user_id, ${firstU13.id}, 'available' FROM finishers f
    ON CONFLICT (user_id, lesson_id) DO NOTHING
    RETURNING user_id`;
  console.log(`  ✓ Unlocked Unit 13 Lesson 1 for ${unlocked.length} users who had finished Unit 12`);

  const check = await sql`
    SELECT u.sort_order, u.title, count(l.id)::int AS lessons
    FROM learning_units u LEFT JOIN learning_lessons l ON l.unit_id = u.id
    GROUP BY u.sort_order, u.title ORDER BY u.sort_order`;
  console.log('\nFinal state:');
  for (const c of check) console.log(`  #${c.sort_order} ${c.title}: ${c.lessons} lessons`);
}

main()
  .then(() => sql.end())
  .catch(async (e) => { console.error('SEED FAILED:', e.message); await sql.end(); process.exit(1); });
