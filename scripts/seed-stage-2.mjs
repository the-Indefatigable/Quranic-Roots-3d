/**
 * Seeds STAGE 2 — "The Ism in Action" — Units 4–8:
 *   4 THE Book (definiteness: al- & tanwin)
 *   5 Who? Me? You! (pronouns, detached + attached)
 *   6 This & That (demonstratives)
 *   7 Belongs To (idafa / possession)
 *   8 Describing Things (adjectives) — checkpoint_after
 *
 * Creates the unit rows (they don't exist yet), upserts lessons on
 * (unit_id, slug), wipes+reinserts vocab per unit, and backfills the Unit-4
 * Lesson-1 unlock for users who already finished Unit 3 (same pattern as
 * seed-units-2-3.mjs — the complete-route only unlocks the next unit's first
 * lesson if it exists at completion time).
 *
 * Idempotent. Run: DATABASE_URL=... node scripts/seed-stage-2.mjs
 */
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

// ═══════════════════════════════════════════════════════════════
// UNIT 4 — THE Book (definiteness)
// ═══════════════════════════════════════════════════════════════

const U4_L1 = { // The ال prefix
  steps: [
    { type: 'teach', content: {
      title: 'Meet ال — "the"',
      explanation: 'Arabic has **one word for "the"**, and it never stands alone — it clings to the front of a word: **ال**.\n\nكِتَاب = *a book*  →  الْكِتَاب = *the book*',
      arabic: 'الْكِتَاب',
      transliteration: 'al-kitaab',
      examples: [
        { ar: 'كِتَاب', tr: 'kitaab', en: 'a book' },
        { ar: 'الْكِتَاب', tr: 'al-kitaab', en: 'the book' },
        { ar: 'الْبَيْت', tr: 'al-bayt', en: 'the house' },
      ],
      fun_fact: 'ال is the most common two letters in the Quran — it opens thousands of words.',
    }},
    { type: 'teach', content: {
      title: 'اللّٰه = "the God"',
      explanation: 'The name **اللّٰه** literally began as الْإِلٰه — "**the** God". The ال of "the one and only" is baked into His name.',
      arabic: 'اللّٰه',
      transliteration: 'Allah',
      examples: [
        { ar: 'إِلٰه', tr: 'ilaah', en: 'a god' },
        { ar: 'اللّٰه', tr: 'Allah', en: 'The God' },
      ],
      fun_fact: 'That is why لَا إِلٰهَ إِلَّا اللّٰه means "there is no god except The God".',
    }},
    { type: 'mcq', content: {
      question: 'How do you turn كِتَاب (a book) into "the book"?',
      options: [
        { text: 'Add ال to the front → الْكِتَاب', correct: true },
        { text: 'Add ة to the end', correct: false },
        { text: 'Add انِ to the end', correct: false },
      ],
      explanation: 'ال is "the" and always attaches to the FRONT of the word.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'To say "the house" you write ___بَيْت.',
      correct_answer: 'ال',
      options: ['ال', 'ة', 'ونَ'],
      explanation: 'الْبَيْت = the house. ال is Arabic’s single word for "the".',
    }},
    { type: 'match', content: {
      instruction: 'Match indefinite (a/an) to definite (the)',
      pairs: [
        { left: 'كِتَاب', right: 'الْكِتَاب' },
        { left: 'بَيْت', right: 'الْبَيْت' },
        { left: 'قَمَر', right: 'الْقَمَر' },
        { left: 'أَرْض', right: 'الْأَرْض' },
      ],
    }},
    { type: 'classify', content: {
      instruction: 'Definite (has "the") or indefinite (a/an)?',
      categories: ['Definite (the)', 'Indefinite (a/an)'],
      items: [
        { text: 'الْكِتَاب', category: 'Definite (the)' },
        { text: 'بَيْت', category: 'Indefinite (a/an)' },
        { text: 'الشَّمْس', category: 'Definite (the)' },
        { text: 'قَمَر', category: 'Indefinite (a/an)' },
        { text: 'النَّار', category: 'Definite (the)' },
        { text: 'رَحْمَة', category: 'Indefinite (a/an)' },
      ],
      explanation: 'If it starts with ال it is "the ___". No ال → "a ___".',
    }},
    { type: 'mcq', content: {
      question: 'الْأَرْض means...',
      options: [
        { text: 'the earth', correct: true },
        { text: 'an earth', correct: false },
        { text: 'two earths', correct: false },
      ],
      explanation: 'ال + أَرْض = الْأَرْض, "the earth" — as in وَالسَّمَاءِ وَالْأَرْض.',
    }},
    { type: 'teach', content: {
      title: 'You unlocked "the" 🔑',
      explanation: 'One little prefix, thousands of words. **See ال → say "the".**\n\nNext: why some ال’s are silent — the sun & moon letters.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U4_L2 = { // Sun & Moon letters
  steps: [
    { type: 'teach', content: {
      title: 'The ل that hides',
      explanation: 'Sometimes you WRITE ال but you don’t PRONOUNCE the ل — the next letter swallows it and doubles up instead.\n\nالشَّمْس is written with ل but read **ash-shams**, not "al-shams".',
      arabic: 'الشَّمْس',
      transliteration: 'ash-shams (the sun)',
      examples: [
        { ar: 'الشَّمْس', tr: 'ash-shams', en: 'the sun (ل hidden)' },
        { ar: 'الْقَمَر', tr: 'al-qamar', en: 'the moon (ل spoken)' },
      ],
      fun_fact: 'These are nicknamed "sun letters" and "moon letters" after شَمْس (sun) and قَمَر (moon) themselves.',
    }},
    { type: 'teach', content: {
      title: 'Sun letters vs moon letters',
      explanation: '**Moon letters** keep the ل clear: الْقَمَر, الْكِتَاب, الْبَيْت.\n\n**Sun letters** swallow the ل and take a shadda ( ّ ): الشَّمْس, الرَّحْمٰن, النَّار, الدِّين.\n\nYou don’t need to memorize the list — your ear learns it fast.',
      arabic: 'الرَّحْمٰن',
      transliteration: 'ar-Rahmaan',
      examples: [
        { ar: 'الرَّحْمٰن', tr: 'ar-Rahmaan', en: 'the Most Merciful' },
        { ar: 'النَّار', tr: 'an-naar', en: 'the Fire' },
        { ar: 'الدِّين', tr: 'ad-deen', en: 'the religion / judgment' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'Why is الشَّمْس read "ash-shams" and not "al-shams"?',
      options: [
        { text: 'ش is a sun letter — it swallows the ل and doubles', correct: true },
        { text: 'It is a spelling mistake', correct: false },
        { text: 'Because شَمْس is feminine', correct: false },
      ],
      explanation: 'Sun letters assimilate the ل: the ل disappears in speech and the next letter takes a shadda.',
    }},
    { type: 'classify', content: {
      instruction: 'Is the ل spoken (moon) or hidden (sun)?',
      categories: ['ل spoken (moon)', 'ل hidden (sun)'],
      items: [
        { text: 'الْقَمَر (al-qamar)', category: 'ل spoken (moon)' },
        { text: 'الشَّمْس (ash-shams)', category: 'ل hidden (sun)' },
        { text: 'الْكِتَاب (al-kitaab)', category: 'ل spoken (moon)' },
        { text: 'الرَّحْمٰن (ar-Rahmaan)', category: 'ل hidden (sun)' },
        { text: 'النَّار (an-naar)', category: 'ل hidden (sun)' },
        { text: 'الْبَيْت (al-bayt)', category: 'ل spoken (moon)' },
      ],
      explanation: 'Hear a doubled first letter (shadda)? That’s a sun letter hiding the ل.',
    }},
    { type: 'mcq', content: {
      question: 'How is الدِّين (the religion) pronounced?',
      options: [
        { text: 'ad-deen — د is a sun letter', correct: true },
        { text: 'al-deen — the ل is spoken', correct: false },
      ],
      explanation: 'د is a sun letter, so ال assimilates: مَالِكِ يَوْمِ **الدِّين**.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'In الرَّحْمٰن the ل is ___ because ر is a sun letter.',
      correct_answer: 'hidden',
      options: ['hidden', 'doubled twice', 'written twice'],
      explanation: 'ر swallows the ل → "ar-Rahmaan". You hear it every time you recite Al-Fatiha.',
    }},
    { type: 'teach', content: {
      title: 'Your tongue knows the rule now',
      explanation: 'Write ال everywhere, but let sun letters swallow it in speech. This is pure tajweed — and you just learned it painlessly.\n\nNext: the OPPOSITE of "the" — the little ن sound that means "a/an".',
      arabic: null, transliteration: null,
    }},
  ],
};

const U4_L3 = { // Tanwin = a/an
  steps: [
    { type: 'teach', content: {
      title: 'Tanwin — the "a/an" sound',
      explanation: 'When a word has NO ال, it often ends in a little **-n** sound called **tanwin**, written as a doubled vowel: ٌ  ً  ٍ.\n\nكِتَابٌ = *a book* (kitaabun)  ·  الْكِتَابُ = *the book* (al-kitaabu)',
      arabic: 'كِتَابٌ',
      transliteration: 'kitaab-un (a book)',
      examples: [
        { ar: 'كِتَابٌ', tr: 'kitaabun', en: 'a book' },
        { ar: 'رَحْمَةٌ', tr: 'rahmatun', en: 'a mercy' },
        { ar: 'هُدًى', tr: 'hudan', en: 'a guidance' },
      ],
      fun_fact: 'Tanwin literally means "adding a ن". You say the n, but you never write a ن letter.',
    }},
    { type: 'teach', content: {
      title: 'ال and tanwin are opposites',
      explanation: 'A word is either **definite** (ال, no tanwin) or **indefinite** (tanwin, no ال) — **never both**.\n\nالْكِتَابُ = the book ✅\nكِتَابٌ = a book ✅\nالْكِتَابٌ = ❌ impossible',
      arabic: null, transliteration: null,
      examples: [
        { ar: 'بَيْتٌ', tr: 'baytun', en: 'a house' },
        { ar: 'الْبَيْتُ', tr: 'al-baytu', en: 'the house' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'What does the tanwin (the -un/-an/-in sound) tell you?',
      options: [
        { text: 'The word is indefinite — "a / an"', correct: true },
        { text: 'The word is definite — "the"', correct: false },
        { text: 'The word is plural', correct: false },
      ],
      explanation: 'Tanwin = indefinite. ال = definite. They are mutually exclusive.',
    }},
    { type: 'classify', content: {
      instruction: '"The ___" or "a ___"?',
      categories: ['The (definite)', 'A/an (indefinite)'],
      items: [
        { text: 'كِتَابٌ', category: 'A/an (indefinite)' },
        { text: 'الْكِتَابُ', category: 'The (definite)' },
        { text: 'رَحْمَةٌ', category: 'A/an (indefinite)' },
        { text: 'الرَّحْمَة', category: 'The (definite)' },
        { text: 'هُدًى', category: 'A/an (indefinite)' },
        { text: 'الْأَرْض', category: 'The (definite)' },
      ],
      explanation: 'Doubled-vowel ending (tanwin) → "a". Front ال → "the".',
    }},
    { type: 'mcq', content: {
      question: 'هُدًى (hudan) means...',
      options: [
        { text: 'a guidance', correct: true },
        { text: 'the guidance', correct: false },
      ],
      explanation: 'The ً is tanwin → indefinite. هُدًى لِّلْمُتَّقِينَ = "a guidance for the God-conscious" (Al-Baqarah 2:2).',
    }},
    { type: 'fill_blank', content: {
      sentence: 'A word can carry ال OR tanwin, but ___ both at once.',
      correct_answer: 'never',
      options: ['never', 'always', 'sometimes'],
      explanation: 'Definite (ال) and indefinite (tanwin) are opposites — a word picks one.',
    }},
    { type: 'teach', content: {
      title: 'Definite radar: complete ✅',
      explanation: '**ال → the.  Tanwin (-n) → a/an.  Never together.**\n\nNow the payoff: the very first ayah of Surah Al-Baqarah is built entirely on what you just learned.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U4_L4 = { // Read the Quran: Al-Baqarah 2
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — Al-Baqarah 2',
      explanation: 'The Quran’s second ayah:\n\n**ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ**\n\n"That is **the Book** about which there is no doubt — **a guidance** for the God-conscious."',
      arabic: 'ذَٰلِكَ الْكِتَابُ ... هُدًى لِّلْمُتَّقِينَ',
      transliteration: 'dhaalikal-kitaab ... hudan lil-muttaqeen',
      quran_ref: 'Al-Baqarah 2:2',
    }},
    { type: 'mcq', content: {
      question: 'الْكِتَابُ in this ayah is...',
      options: [
        { text: 'definite — "THE Book" (it has ال)', correct: true },
        { text: 'indefinite — "a book"', correct: false },
      ],
      explanation: 'ال makes it "the Book" — a specific, known Book: the Quran itself.',
    }},
    { type: 'mcq', content: {
      question: 'هُدًى (with tanwin) is...',
      options: [
        { text: 'indefinite — "a guidance"', correct: true },
        { text: 'definite — "the guidance"', correct: false },
      ],
      explanation: 'The tanwin ً marks it indefinite. The same ayah shows both tools: الْكِتَابُ (the) and هُدًى (a).',
    }},
    { type: 'classify', content: {
      instruction: 'Sort the words of Al-Baqarah 2 by definiteness',
      categories: ['Definite (ال)', 'Indefinite (tanwin)'],
      items: [
        { text: 'الْكِتَابُ (the Book)', category: 'Definite (ال)' },
        { text: 'هُدًى (a guidance)', category: 'Indefinite (tanwin)' },
        { text: 'الْمُتَّقِينَ (the God-conscious)', category: 'Definite (ال)' },
        { text: 'رَيْبَ (doubt)', category: 'Indefinite (tanwin)' },
      ],
      explanation: 'Two carry ال (definite), two are indefinite. You just parsed a real ayah’s grammar.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ — الْحَمْد ("the praise") is definite because it starts with ___.',
      correct_answer: 'ال',
      options: ['ال', 'tanwin', 'ة'],
      explanation: 'الْحَمْد = "THE praise" — all of it. Al-Fatiha opens with a definite word.',
    }},
    { type: 'arrange', content: {
      instruction: 'Rebuild the opening of Al-Baqarah 2',
      reference: '"That is the Book"',
      tiles: ['ذَٰلِكَ', 'الْكِتَابُ'],
      correct_order: ['ذَٰلِكَ', 'الْكِتَابُ'],
      result_transliteration: 'dhaalikal-kitaab',
      explanation: 'ذَٰلِكَ = "that" (you meet it fully in Unit 6); الْكِتَابُ = "the Book".',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 4 complete!',
      explanation: 'You now read **the** vs **a** anywhere in the Quran, and you know why sun letters hide the ل.\n\nNext unit: **pronouns** — هُوَ (He), رَبِّي (MY Lord), رَبَّنَا (OUR Lord). The Quran is full of them.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 5 — Who? Me? You! (pronouns)
// ═══════════════════════════════════════════════════════════════

const U5_L1 = { // He, she, they
  steps: [
    { type: 'teach', content: {
      title: 'He, She, They',
      explanation: 'The standalone pronouns for "the third person":\n\n**هُوَ** = he / it(m)\n**هِيَ** = she / it(f)\n**هُمْ** = they (men / mixed)',
      arabic: 'هُوَ · هِيَ · هُمْ',
      transliteration: 'huwa · hiya · hum',
      examples: [
        { ar: 'هُوَ اللّٰه', tr: 'huwa-llah', en: 'He is Allah' },
        { ar: 'هِيَ', tr: 'hiya', en: 'she' },
        { ar: 'هُمْ', tr: 'hum', en: 'they' },
      ],
      fun_fact: 'هُوَ appears over 480 times in the Quran — often declaring who Allah is: هُوَ الْغَفُورُ الرَّحِيمُ.',
    }},
    { type: 'mcq', content: {
      question: 'Which pronoun means "she"?',
      options: [
        { text: 'هِيَ', correct: true },
        { text: 'هُوَ', correct: false },
        { text: 'هُمْ', correct: false },
      ],
      explanation: 'هِيَ = she. هُوَ = he. هُمْ = they.',
    }},
    { type: 'match', content: {
      instruction: 'Match pronoun to meaning',
      pairs: [
        { left: 'هُوَ', right: 'he' },
        { left: 'هِيَ', right: 'she' },
        { left: 'هُمْ', right: 'they' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'قُلْ ___ اللّٰهُ أَحَدٌ — "Say: HE is Allah, [the] One" (Al-Ikhlas 112:1).',
      correct_answer: 'هُوَ',
      options: ['هُوَ', 'هِيَ', 'هُمْ'],
      explanation: 'هُوَ = He. You just filled in the opening of Surah Al-Ikhlas!',
    }},
    { type: 'mcq', content: {
      question: 'أُولَٰئِكَ هُمُ الْمُفْلِحُونَ — "those are the ones who succeed". هُمْ here means...',
      options: [
        { text: 'they', correct: true },
        { text: 'he', correct: false },
        { text: 'you', correct: false },
      ],
      explanation: 'هُمْ = they. (Al-Baqarah 2:5 — you will meet أُولَٰئِكَ in Unit 6.)',
    }},
    { type: 'classify', content: {
      instruction: 'Who does each pronoun point to?',
      categories: ['One male', 'One female', 'A group'],
      items: [
        { text: 'هُوَ', category: 'One male' },
        { text: 'هِيَ', category: 'One female' },
        { text: 'هُمْ', category: 'A group' },
      ],
      explanation: 'هُوَ he · هِيَ she · هُمْ they.',
    }},
    { type: 'teach', content: {
      title: 'Third person: done',
      explanation: '**هُوَ he · هِيَ she · هُمْ they.**\n\nNext: turning the spotlight on yourself — أَنَا (I) and نَحْنُ (We).',
      arabic: null, transliteration: null,
    }},
  ],
};

const U5_L2 = { // I, we, you
  steps: [
    { type: 'teach', content: {
      title: 'I, We, You',
      explanation: '**أَنَا** = I\n**نَحْنُ** = we\n**أَنْتَ** = you (to a man)\n**أَنْتِ** = you (to a woman)\n**أَنْتُمْ** = you (to a group)',
      arabic: 'أَنَا · نَحْنُ · أَنْتَ',
      transliteration: 'ana · nahnu · anta',
      examples: [
        { ar: 'أَنَا', tr: 'ana', en: 'I' },
        { ar: 'نَحْنُ', tr: 'nahnu', en: 'we' },
        { ar: 'أَنْتَ', tr: 'anta', en: 'you (m)' },
      ],
      fun_fact: 'When the Quran says نَحْنُ ("We") for Allah, it is the royal "We" of majesty — not more than one god.',
    }},
    { type: 'mcq', content: {
      question: 'How do you say "we"?',
      options: [
        { text: 'نَحْنُ', correct: true },
        { text: 'أَنَا', correct: false },
        { text: 'أَنْتُمْ', correct: false },
      ],
      explanation: 'نَحْنُ = we. أَنَا = I. أَنْتُمْ = you (plural).',
    }},
    { type: 'match', content: {
      instruction: 'Match pronoun to meaning',
      pairs: [
        { left: 'أَنَا', right: 'I' },
        { left: 'نَحْنُ', right: 'we' },
        { left: 'أَنْتَ', right: 'you (m)' },
        { left: 'أَنْتُمْ', right: 'you (all)' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ — "Indeed WE sent down the Reminder". نَحْنُ refers to...',
      options: [
        { text: 'Allah (the royal "We")', correct: true },
        { text: 'many gods', correct: false },
        { text: 'the angels only', correct: false },
      ],
      explanation: 'نَحْنُ is majestic plural. Al-Hijr 15:9 — a promise to protect the Quran.',
    }},
    { type: 'classify', content: {
      instruction: 'Talking about myself, or talking TO you?',
      categories: ['Me / us', 'You'],
      items: [
        { text: 'أَنَا', category: 'Me / us' },
        { text: 'أَنْتَ', category: 'You' },
        { text: 'نَحْنُ', category: 'Me / us' },
        { text: 'أَنْتُمْ', category: 'You' },
      ],
      explanation: 'أَنَا/نَحْنُ = the speaker. أَنْتَ/أَنْتُمْ = the one addressed.',
    }},
    { type: 'fill_blank', content: {
      sentence: '"You" spoken to one man is ___.',
      correct_answer: 'أَنْتَ',
      options: ['أَنْتَ', 'أَنَا', 'هُوَ'],
      explanation: 'أَنْتَ = you (m). To a woman it is أَنْتِ; to a group, أَنْتُمْ.',
    }},
    { type: 'teach', content: {
      title: 'The whole cast, standing alone',
      explanation: 'You now have the standalone pronouns. But Arabic loves to **stick** pronouns onto words — رَبّ + ي = "my Lord". That trick is next, and it is everywhere in the Quran.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U5_L3 = { // Attached pronouns 1: my, your, his
  steps: [
    { type: 'teach', content: {
      title: 'Stuck-on pronouns: my, your, his',
      explanation: 'Instead of a separate word, Arabic glues a tiny pronoun to the END of a noun:\n\nرَبّ (Lord) + **ي** = رَبِّي (**my** Lord)\nرَبّ + **كَ** = رَبُّكَ (**your** Lord)\nرَبّ + **هُ** = رَبُّهُ (**his** Lord)',
      arabic: 'رَبِّي · رَبُّكَ · رَبُّهُ',
      transliteration: 'rabbi · rabbuka · rabbuhu',
      examples: [
        { ar: 'ـِي', tr: '-ee', en: 'my' },
        { ar: 'ـكَ', tr: '-ka', en: 'your (m)' },
        { ar: 'ـهُ', tr: '-hu', en: 'his / its' },
      ],
      fun_fact: 'اقْرَأْ بِاسْمِ رَبِّكَ — "Read in the name of YOUR Lord" — the very first words revealed. That كَ is "your".',
    }},
    { type: 'mcq', content: {
      question: 'رَبِّي means...',
      options: [
        { text: 'my Lord', correct: true },
        { text: 'your Lord', correct: false },
        { text: 'his Lord', correct: false },
      ],
      explanation: 'The attached ـِي = "my". رَبِّي = my Lord.',
    }},
    { type: 'match', content: {
      instruction: 'Match the ending to its meaning',
      pairs: [
        { left: 'ـِي', right: 'my' },
        { left: 'ـكَ', right: 'your (m)' },
        { left: 'ـهُ', right: 'his' },
        { left: 'ـهَا', right: 'her' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'رَبّ + كَ = رَبُّ__ ("your Lord").',
      correct_answer: 'كَ',
      options: ['كَ', 'ي', 'هُ'],
      explanation: 'رَبُّكَ = your Lord — the pronoun ـكَ tucks onto the end.',
    }},
    { type: 'classify', content: {
      instruction: 'Whose Lord?',
      categories: ['My', 'Your', 'His'],
      items: [
        { text: 'رَبِّي', category: 'My' },
        { text: 'رَبُّكَ', category: 'Your' },
        { text: 'رَبُّهُ', category: 'His' },
      ],
      explanation: 'ـِي my · ـكَ your · ـهُ his. Same word رَبّ, three owners.',
    }},
    { type: 'mcq', content: {
      question: 'كِتَابُهُ means...',
      options: [
        { text: 'his book', correct: true },
        { text: 'my book', correct: false },
        { text: 'the book', correct: false },
      ],
      explanation: 'كِتَاب + هُ = كِتَابُهُ, "his book". The same ـهُ you saw on رَبُّهُ.',
    }},
    { type: 'teach', content: {
      title: 'Half the family attached',
      explanation: 'my (ـِي) · your (ـكَ) · his (ـهُ) · her (ـهَا). One more set — **our, their, your-all** — and you own every possessive in the Quran.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U5_L4 = { // Attached pronouns 2: our, their, your(pl)
  steps: [
    { type: 'teach', content: {
      title: 'Our, Their, Your-all',
      explanation: 'The plural owners:\n\n**ـنَا** = our  → رَبَّنَا (our Lord)\n**ـهُمْ** = their → رَبُّهُمْ (their Lord), لَهُمْ (for them)\n**ـكُمْ** = your (all) → رَبُّكُمْ, عَلَيْكُمْ (upon you all)',
      arabic: 'رَبَّنَا · رَبُّهُمْ · رَبُّكُمْ',
      transliteration: 'rabbanaa · rabbuhum · rabbukum',
      examples: [
        { ar: 'ـنَا', tr: '-naa', en: 'our / us' },
        { ar: 'ـهُمْ', tr: '-hum', en: 'their / them' },
        { ar: 'ـكُمْ', tr: '-kum', en: 'your (all)' },
      ],
      fun_fact: 'رَبَّنَا ("Our Lord") begins dozens of the Quran’s most beloved duʿās: رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً.',
    }},
    { type: 'mcq', content: {
      question: 'رَبَّنَا means...',
      options: [
        { text: 'our Lord', correct: true },
        { text: 'their Lord', correct: false },
        { text: 'your Lord', correct: false },
      ],
      explanation: 'ـنَا = "our". رَبَّنَا = our Lord — the opener of countless duʿās.',
    }},
    { type: 'match', content: {
      instruction: 'Match the ending to its meaning',
      pairs: [
        { left: 'ـنَا', right: 'our' },
        { left: 'ـهُمْ', right: 'their' },
        { left: 'ـكُمْ', right: 'your (all)' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'لَ + هُمْ = لَ__ ("for them").',
      correct_answer: 'هُمْ',
      options: ['هُمْ', 'نَا', 'كُمْ'],
      explanation: 'لَهُمْ = "for them" — لَ ("for") + هُمْ ("them"). Appears hundreds of times.',
    }},
    { type: 'classify', content: {
      instruction: 'Whose?',
      categories: ['Our', 'Their', 'Your (all)'],
      items: [
        { text: 'رَبَّنَا', category: 'Our' },
        { text: 'رَبُّهُمْ', category: 'Their' },
        { text: 'رَبُّكُمْ', category: 'Your (all)' },
        { text: 'قُلُوبُهُمْ', category: 'Their' },
      ],
      explanation: 'ـنَا our · ـهُمْ their · ـكُمْ your-all. قُلُوبُهُمْ = "their hearts".',
    }},
    { type: 'mcq', content: {
      question: 'عَلَيْكُمْ means...',
      options: [
        { text: 'upon you (all)', correct: true },
        { text: 'upon us', correct: false },
        { text: 'upon them', correct: false },
      ],
      explanation: 'عَلَىٰ ("upon") + كُمْ ("you all") = عَلَيْكُمْ — as in السَّلَامُ عَلَيْكُمْ, "peace be upon you all".',
    }},
    { type: 'teach', content: {
      title: 'Every possessive: unlocked 🔓',
      explanation: 'my · your · his · her · our · their · your-all. You can now read who-owns-what anywhere in the Quran.\n\nNext: the graduation lesson — Surah Al-Ikhlas, fully parsed with pronouns.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U5_L5 = { // Read the Quran: Al-Ikhlas
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — Al-Ikhlas',
      explanation: '**قُلْ هُوَ اللّٰهُ أَحَدٌ**\n"Say: **He** is Allah, [the] One."\n\nEvery tool from this unit is here: قُلْ (a command — Unit 16), هُوَ (He), and أَحَدٌ (One, indefinite — tanwin from Unit 4!).',
      arabic: 'قُلْ هُوَ اللّٰهُ أَحَدٌ',
      transliteration: 'qul huwa-llahu ahad',
      quran_ref: 'Al-Ikhlas 112:1',
    }},
    { type: 'mcq', content: {
      question: 'هُوَ in قُلْ هُوَ اللّٰهُ أَحَدٌ means...',
      options: [
        { text: 'He', correct: true },
        { text: 'they', correct: false },
        { text: 'we', correct: false },
      ],
      explanation: 'هُوَ = He. The ayah declares WHO Allah is.',
    }},
    { type: 'mcq', content: {
      question: 'أَحَدٌ carries tanwin (ٌ). So it is...',
      options: [
        { text: 'indefinite — "One"', correct: true },
        { text: 'definite — "the One"', correct: false },
      ],
      explanation: 'You spotted Unit-4 grammar inside Surah Al-Ikhlas: the tanwin marks it indefinite.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّ__ كُفُوًا أَحَدٌ — "...and there is none comparable to HIM." (Al-Ikhlas 112:4)',
      correct_answer: 'هُ',
      options: ['هُ', 'نَا', 'كُمْ'],
      explanation: 'لَهُ = "to Him" — لَ ("to") + هُ ("Him"). Your attached-pronoun skill, live in the Quran.',
    }},
    { type: 'mcq', content: {
      question: 'إِيَّاكَ نَعْبُدُ (Al-Fatiha 1:5) — the كَ in إِيَّاكَ means...',
      options: [
        { text: 'You', correct: true },
        { text: 'them', correct: false },
        { text: 'us', correct: false },
      ],
      explanation: 'إِيَّاكَ = "You [alone]" — the same كَ ("you") from رَبُّكَ.',
    }},
    { type: 'arrange', content: {
      instruction: 'Rebuild the opening of Al-Ikhlas',
      reference: '"Say: He is Allah, One"',
      tiles: ['قُلْ', 'هُوَ', 'اللّٰهُ', 'أَحَدٌ'],
      correct_order: ['قُلْ', 'هُوَ', 'اللّٰهُ', 'أَحَدٌ'],
      result_transliteration: 'qul huwa-llahu ahad',
      explanation: 'A complete ayah, assembled — and you understand every word.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 5 complete!',
      explanation: 'Pronouns — standalone and attached — are yours. That is a huge share of every ayah.\n\nNext: **pointing words** — هَٰذَا (this) and ذَٰلِكَ (that).',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 6 — This & That (demonstratives)
// ═══════════════════════════════════════════════════════════════

const U6_L1 = { // This
  steps: [
    { type: 'teach', content: {
      title: 'This: هَٰذَا / هَٰذِهِ',
      explanation: 'To point at something near:\n\n**هَٰذَا** = this (for a masculine word)\n**هَٰذِهِ** = this (for a feminine word)\n\nGender agreement again — your Unit 2 radar decides which one.',
      arabic: 'هَٰذَا · هَٰذِهِ',
      transliteration: 'haadhaa · haadhihi',
      examples: [
        { ar: 'هَٰذَا كِتَابٌ', tr: 'haadhaa kitaab', en: 'this is a book' },
        { ar: 'هَٰذِهِ نَارٌ', tr: 'haadhihi naar', en: 'this is a fire' },
      ],
      fun_fact: 'The alif in هَٰذَا is written small (a "dagger alif") — you say a long "aa" but barely see it.',
    }},
    { type: 'mcq', content: {
      question: 'Which "this" goes with a feminine word like نَار (fire)?',
      options: [
        { text: 'هَٰذِهِ', correct: true },
        { text: 'هَٰذَا', correct: false },
      ],
      explanation: 'نَار is feminine → هَٰذِهِ النَّار ("this fire").',
    }},
    { type: 'classify', content: {
      instruction: 'Which "this" fits the word?',
      categories: ['هَٰذَا (m)', 'هَٰذِهِ (f)'],
      items: [
        { text: 'كِتَاب (book, m)', category: 'هَٰذَا (m)' },
        { text: 'جَنَّة (garden, f)', category: 'هَٰذِهِ (f)' },
        { text: 'بَيْت (house, m)', category: 'هَٰذَا (m)' },
        { text: 'أَرْض (earth, f)', category: 'هَٰذِهِ (f)' },
      ],
      explanation: 'Masculine → هَٰذَا. Feminine → هَٰذِهِ.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'إِنَّ ___ الْقُرْآنَ يَهْدِي — "Indeed THIS Quran guides" (Al-Isra 17:9).',
      correct_answer: 'هَٰذَا',
      options: ['هَٰذَا', 'هَٰذِهِ', 'ذَٰلِكَ'],
      explanation: 'قُرْآن is masculine → هَٰذَا الْقُرْآن, "this Quran".',
    }},
    { type: 'match', content: {
      instruction: 'Match to the English',
      pairs: [
        { left: 'هَٰذَا', right: 'this (m)' },
        { left: 'هَٰذِهِ', right: 'this (f)' },
      ],
    }},
    { type: 'teach', content: {
      title: 'Pointing near: done',
      explanation: '**هَٰذَا** for "he" words, **هَٰذِهِ** for "she" words. Next: pointing FAR — ذَٰلِكَ (that).',
      arabic: null, transliteration: null,
    }},
  ],
};

const U6_L2 = { // That
  steps: [
    { type: 'teach', content: {
      title: 'That: ذَٰلِكَ / تِلْكَ',
      explanation: 'To point at something far:\n\n**ذَٰلِكَ** = that (masculine)\n**تِلْكَ** = that (feminine)\n\nRemember Al-Baqarah 2? **ذَٰلِكَ** الْكِتَابُ — "**That** is the Book".',
      arabic: 'ذَٰلِكَ · تِلْكَ',
      transliteration: 'dhaalika · tilka',
      examples: [
        { ar: 'ذَٰلِكَ الْكِتَابُ', tr: 'dhaalikal-kitaab', en: 'that is the Book' },
        { ar: 'تِلْكَ آيَاتُ', tr: 'tilka aayaat', en: 'those are the verses' },
      ],
      fun_fact: 'Using "THAT Book" (far) for the Quran hints at its lofty, exalted status — pointing up at something majestic.',
    }},
    { type: 'mcq', content: {
      question: 'ذَٰلِكَ means...',
      options: [
        { text: 'that (m)', correct: true },
        { text: 'this (m)', correct: false },
        { text: 'these', correct: false },
      ],
      explanation: 'ذَٰلِكَ = that (far). هَٰذَا = this (near).',
    }},
    { type: 'classify', content: {
      instruction: 'Near ("this") or far ("that")?',
      categories: ['This (near)', 'That (far)'],
      items: [
        { text: 'هَٰذَا', category: 'This (near)' },
        { text: 'ذَٰلِكَ', category: 'That (far)' },
        { text: 'هَٰذِهِ', category: 'This (near)' },
        { text: 'تِلْكَ', category: 'That (far)' },
      ],
      explanation: 'هَٰذَا/هَٰذِهِ point near; ذَٰلِكَ/تِلْكَ point far.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ — ذَٰلِكَ means ___.',
      correct_answer: 'that',
      options: ['that', 'this', 'those'],
      explanation: '"That is the Book about which there is no doubt" (Al-Baqarah 2:2).',
    }},
    { type: 'mcq', content: {
      question: 'Which "that" pairs with a feminine word?',
      options: [
        { text: 'تِلْكَ', correct: true },
        { text: 'ذَٰلِكَ', correct: false },
      ],
      explanation: 'تِلْكَ = that (f), as in تِلْكَ آيَاتُ اللّٰهِ, "those are the signs of Allah".',
    }},
    { type: 'teach', content: {
      title: 'Near and far: mastered',
      explanation: 'this (هَٰذَا/هَٰذِهِ) · that (ذَٰلِكَ/تِلْكَ). One set left: **these** and **those** — for groups.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U6_L3 = { // These & those
  steps: [
    { type: 'teach', content: {
      title: 'These & Those',
      explanation: '**هَٰؤُلَاءِ** = these (a group, near)\n**أُولَٰئِكَ** = those (a group, far)\n\nThese two point at people — and the Quran uses them to sort humanity.',
      arabic: 'هَٰؤُلَاءِ · أُولَٰئِكَ',
      transliteration: 'haa’ulaa’i · ulaa’ika',
      examples: [
        { ar: 'أُولَٰئِكَ هُمُ الْمُفْلِحُونَ', tr: 'ulaa’ika humul-muflihoon', en: 'those are the successful' },
        { ar: 'هَٰؤُلَاءِ', tr: 'haa’ulaa’i', en: 'these (people)' },
      ],
      fun_fact: 'أُولَٰئِكَ is spelled with a silent و — you write it but never say it.',
    }},
    { type: 'mcq', content: {
      question: 'أُولَٰئِكَ means...',
      options: [
        { text: 'those (people)', correct: true },
        { text: 'that (one thing)', correct: false },
        { text: 'this', correct: false },
      ],
      explanation: 'أُولَٰئِكَ = those — a far group. هَٰؤُلَاءِ = these — a near group.',
    }},
    { type: 'match', content: {
      instruction: 'Match the demonstrative to its meaning',
      pairs: [
        { left: 'هَٰذَا', right: 'this (m)' },
        { left: 'ذَٰلِكَ', right: 'that (m)' },
        { left: 'هَٰؤُلَاءِ', right: 'these' },
        { left: 'أُولَٰئِكَ', right: 'those' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: '___ هُمُ الْمُفْلِحُونَ — "THOSE are the ones who succeed" (Al-Baqarah 2:5).',
      correct_answer: 'أُولَٰئِكَ',
      options: ['أُولَٰئِكَ', 'هَٰذَا', 'تِلْكَ'],
      explanation: 'أُولَٰئِكَ = those. The ayah honors the believers described just before it.',
    }},
    { type: 'classify', content: {
      instruction: 'One or a group? Near or far?',
      categories: ['One thing', 'A group'],
      items: [
        { text: 'هَٰذَا', category: 'One thing' },
        { text: 'ذَٰلِكَ', category: 'One thing' },
        { text: 'هَٰؤُلَاءِ', category: 'A group' },
        { text: 'أُولَٰئِكَ', category: 'A group' },
      ],
      explanation: 'هَٰذَا/ذَٰلِكَ = one; هَٰؤُلَاءِ/أُولَٰئِكَ = many.',
    }},
    { type: 'teach', content: {
      title: 'All four corners of pointing',
      explanation: 'this · that · these · those — near and far, one and many. Next: the graduation — pointing words inside real ayat.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U6_L4 = { // Read the Quran: demonstratives
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — pointing at guidance',
      explanation: '**هَٰذَا صِرَاطٌ مُّسْتَقِيمٌ**\n"**This** is a straight path."\n\nAppears across the Quran (e.g. Aal Imran 3:51). هَٰذَا (this) + صِرَاطٌ (a path, indefinite) + مُّسْتَقِيمٌ (straight — an adjective, Unit 8!).',
      arabic: 'هَٰذَا صِرَاطٌ مُّسْتَقِيمٌ',
      transliteration: 'haadhaa siraatun mustaqeem',
      quran_ref: 'Aal Imran 3:51',
    }},
    { type: 'mcq', content: {
      question: 'هَٰذَا صِرَاطٌ مُّسْتَقِيمٌ — هَٰذَا means...',
      options: [
        { text: 'This', correct: true },
        { text: 'That', correct: false },
        { text: 'Those', correct: false },
      ],
      explanation: 'هَٰذَا = This. The path is pointed at as near and present.',
    }},
    { type: 'mcq', content: {
      question: 'صِرَاطٌ carries tanwin. It is...',
      options: [
        { text: 'indefinite — "a path"', correct: true },
        { text: 'definite — "the path"', correct: false },
      ],
      explanation: 'Unit-4 grammar again: tanwin → "a path". (In Al-Fatiha it becomes definite: الصِّرَاطَ.)',
    }},
    { type: 'classify', content: {
      instruction: 'Which demonstrative? (from real ayat)',
      categories: ['This / These (near)', 'That / Those (far)'],
      items: [
        { text: 'هَٰذَا صِرَاطٌ (this path)', category: 'This / These (near)' },
        { text: 'ذَٰلِكَ الْكِتَابُ (that Book)', category: 'That / Those (far)' },
        { text: 'أُولَٰئِكَ الْمُفْلِحُونَ (those successful)', category: 'That / Those (far)' },
        { text: 'هَٰؤُلَاءِ (these people)', category: 'This / These (near)' },
      ],
      explanation: 'Near: هَٰذَا, هَٰؤُلَاءِ. Far: ذَٰلِكَ, أُولَٰئِكَ.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'ذَٰلِكَ الْكِتَابُ — pointing at the Quran, the Quran uses ___ ("that"), hinting at its exalted rank.',
      correct_answer: 'ذَٰلِكَ',
      options: ['ذَٰلِكَ', 'هَٰذَا', 'تِلْكَ'],
      explanation: 'Far-pointing ذَٰلِكَ lifts the Book up in honor.',
    }},
    { type: 'arrange', content: {
      instruction: 'Build: "This is a straight path"',
      reference: 'This is a straight path',
      tiles: ['هَٰذَا', 'صِرَاطٌ', 'مُّسْتَقِيمٌ'],
      correct_order: ['هَٰذَا', 'صِرَاطٌ', 'مُّسْتَقِيمٌ'],
      result_transliteration: 'haadhaa siraatun mustaqeem',
      explanation: 'A full ayah fragment — pointing word + noun + adjective.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 6 complete!',
      explanation: 'You point near and far, at one and at many — right inside the Quran.\n\nNext: **iḍāfa** — how كِتَاب + اللّٰه becomes "the Book **of** Allah" with no "of" at all.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 7 — Belongs To (idafa / possession)
// ═══════════════════════════════════════════════════════════════

const U7_L1 = { // Two isms, one meaning
  steps: [
    { type: 'teach', content: {
      title: 'Two nouns snap together',
      explanation: 'Put two nouns back-to-back and Arabic reads them as "**X of Y**" — no word for "of" needed.\n\nرَسُولُ اللّٰهِ = "the Messenger **of** Allah"\nكِتَابُ اللّٰهِ = "the Book **of** Allah"\n\nThis structure is called **iḍāfa**.',
      arabic: 'رَسُولُ اللّٰهِ',
      transliteration: 'rasoolu-llah',
      examples: [
        { ar: 'كِتَابُ اللّٰهِ', tr: 'kitaabu-llah', en: 'the Book of Allah' },
        { ar: 'بَيْتُ اللّٰهِ', tr: 'baytu-llah', en: 'the House of Allah' },
      ],
      fun_fact: 'The two joined nouns act like one team: the first is the "possessed", the second is the "owner".',
    }},
    { type: 'teach', content: {
      title: 'The first noun drops its "the"',
      explanation: 'The **first** noun in an iḍāfa never takes ال and never takes tanwin — the second noun makes it definite.\n\nرَسُولُ اللّٰهِ already means "**THE** Messenger of Allah" — no ال on رَسُول needed. And the second noun ends in **kasra** (اللّٰهِ).',
      arabic: null, transliteration: null,
      examples: [
        { ar: 'رَسُول', tr: 'rasool', en: 'a messenger' },
        { ar: 'رَسُولُ اللّٰهِ', tr: 'rasoolu-llah', en: 'THE messenger of Allah' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'كِتَابُ اللّٰهِ means...',
      options: [
        { text: 'the Book of Allah', correct: true },
        { text: 'a book and Allah', correct: false },
        { text: 'Allah’s books are many', correct: false },
      ],
      explanation: 'Two nouns in iḍāfa = "the Book OF Allah". No "of" word appears.',
    }},
    { type: 'mcq', content: {
      question: 'In رَسُولُ اللّٰهِ, why does رَسُول have NO ال even though it means "THE messenger"?',
      options: [
        { text: 'The second noun (اللّٰهِ) already makes it definite', correct: true },
        { text: 'It is a spelling rule with names', correct: false },
        { text: 'رَسُول is always definite', correct: false },
      ],
      explanation: 'In iḍāfa the first noun is made definite by the second — so it drops ال and tanwin.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'The SECOND noun of an iḍāfa ends in a ___ (the "of" ending).',
      correct_answer: 'kasra',
      options: ['kasra', 'damma', 'sukun'],
      explanation: 'رَسُولُ اللّٰهِ — the ـهِ kasra on اللّٰهِ signals "of Allah". (You will name this "genitive" in Stage 7.)',
    }},
    { type: 'match', content: {
      instruction: 'Match the iḍāfa to its meaning',
      pairs: [
        { left: 'رَسُولُ اللّٰهِ', right: 'the Messenger of Allah' },
        { left: 'كِتَابُ اللّٰهِ', right: 'the Book of Allah' },
        { left: 'بَيْتُ اللّٰهِ', right: 'the House of Allah' },
      ],
    }},
    { type: 'teach', content: {
      title: 'The "of" machine',
      explanation: 'Two nouns → "X of Y". First noun: no ال, no tanwin. Second noun: kasra.\n\nNext: chaining THREE or more — رَبِّ الْعَالَمِينَ and beyond.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U7_L2 = { // Idafa chains
  steps: [
    { type: 'teach', content: {
      title: 'Chaining the "of"s',
      explanation: 'Iḍāfa can link a chain:\n\n**مَالِكِ يَوْمِ الدِّينِ** = "Master **of** the Day **of** Judgment".\n\nEach noun points to the next. Every link after the first ends in kasra.',
      arabic: 'مَالِكِ يَوْمِ الدِّينِ',
      transliteration: 'maaliki yawmid-deen',
      examples: [
        { ar: 'رَبِّ الْعَالَمِينَ', tr: 'rabbil-‘aalameen', en: 'Lord of the worlds' },
        { ar: 'يَوْمِ الدِّينِ', tr: 'yawmid-deen', en: 'the Day of Judgment' },
      ],
      fun_fact: 'Al-Fatiha is almost ALL iḍāfa — that is why it feels so tightly woven.',
    }},
    { type: 'mcq', content: {
      question: 'رَبِّ الْعَالَمِينَ means...',
      options: [
        { text: 'Lord of the worlds', correct: true },
        { text: 'a Lord and worlds', correct: false },
        { text: 'the worlds’ lords', correct: false },
      ],
      explanation: 'رَبّ (Lord) + الْعَالَمِينَ (the worlds) = "Lord of the worlds".',
    }},
    { type: 'mcq', content: {
      question: 'In مَالِكِ يَوْمِ الدِّينِ, how many "of" links are there?',
      options: [
        { text: 'Two — Master OF the Day OF Judgment', correct: true },
        { text: 'None', correct: false },
        { text: 'Three', correct: false },
      ],
      explanation: 'Master → of the Day → of Judgment. A two-link iḍāfa chain.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ — رَبِّ الْعَالَمِينَ means "Lord of the ___".',
      correct_answer: 'worlds',
      options: ['worlds', 'books', 'people'],
      explanation: 'الْعَالَمِينَ = the worlds. Al-Fatiha 1:2.',
    }},
    { type: 'match', content: {
      instruction: 'Match the iḍāfa chain to its meaning',
      pairs: [
        { left: 'رَبِّ الْعَالَمِينَ', right: 'Lord of the worlds' },
        { left: 'يَوْمِ الدِّينِ', right: 'the Day of Judgment' },
        { left: 'مَالِكِ يَوْمِ الدِّينِ', right: 'Master of the Day of Judgment' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'In an iḍāfa chain, which nouns take a kasra ending?',
      options: [
        { text: 'Every noun except the very first', correct: true },
        { text: 'Only the last noun', correct: false },
        { text: 'All of them', correct: false },
      ],
      explanation: 'يَوْمِ and الدِّينِ both take kasra; only the head noun (مَالِكِ here, itself pulled by لِلَّهِ) starts the chain.',
    }},
    { type: 'teach', content: {
      title: 'You can chain "of"s now',
      explanation: 'From one link to many, you read possession like a native.\n\nNext: mixing iḍāfa with the pronouns from Unit 5 — رَبّ + كَ = رَبُّكَ.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U7_L3 = { // Idafa + pronouns
  steps: [
    { type: 'teach', content: {
      title: 'The owner can be a pronoun',
      explanation: 'The "owner" second half of an iḍāfa can be an **attached pronoun** (Unit 5):\n\nرَبّ + كَ = **رَبُّكَ** (your Lord)\nرَبّ + نَا = **رَبَّنَا** (our Lord)\nكِتَاب + هُ = **كِتَابُهُ** (his book)',
      arabic: 'رَبُّكَ · رَبَّنَا',
      transliteration: 'rabbuka · rabbanaa',
      examples: [
        { ar: 'رَبُّهُمْ', tr: 'rabbuhum', en: 'their Lord' },
        { ar: 'قَوْمُهُ', tr: 'qawmuhu', en: 'his people' },
      ],
      fun_fact: 'So رَبُّكَ ("your Lord") is really just iḍāfa: Lord-of-you. Every possessive you learned was iḍāfa in disguise!',
    }},
    { type: 'mcq', content: {
      question: 'رَبُّكَ is an iḍāfa meaning...',
      options: [
        { text: 'your Lord (Lord-of-you)', correct: true },
        { text: 'the Lord', correct: false },
        { text: 'a Lord', correct: false },
      ],
      explanation: 'رَبّ + كَ. The pronoun كَ ("you") is the owner — "your Lord".',
    }},
    { type: 'match', content: {
      instruction: 'Match to meaning',
      pairs: [
        { left: 'رَبِّي', right: 'my Lord' },
        { left: 'رَبُّكَ', right: 'your Lord' },
        { left: 'رَبُّهُ', right: 'his Lord' },
        { left: 'رَبَّنَا', right: 'our Lord' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'اقْرَأْ بِاسْمِ رَبِّ__ الَّذِي خَلَقَ — "Read in the name of YOUR Lord..." (Al-Alaq 96:1)',
      correct_answer: 'كَ',
      options: ['كَ', 'ي', 'نَا'],
      explanation: 'رَبِّكَ = your Lord. اِسْمِ رَبِّكَ is itself an iḍāfa chain: "the name of your Lord".',
    }},
    { type: 'classify', content: {
      instruction: 'Whose Lord? (all iḍāfa with pronouns)',
      categories: ['My', 'Your', 'Our'],
      items: [
        { text: 'رَبِّي', category: 'My' },
        { text: 'رَبُّكَ', category: 'Your' },
        { text: 'رَبَّنَا', category: 'Our' },
      ],
      explanation: 'Same iḍāfa engine, different pronoun-owner.',
    }},
    { type: 'teach', content: {
      title: 'Possession, fully unlocked',
      explanation: 'Noun + noun, or noun + pronoun — you read every "of" and every "my/your/his".\n\nNext: the graduation — Al-Fatiha 1–4, which is iḍāfa top to bottom.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U7_L4 = { // Read the Quran: Al-Fatiha 1-4
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — Al-Fatiha 1–4',
      explanation: 'The opening of the Quran is a masterpiece of iḍāfa:\n\n**الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ • الرَّحْمٰنِ الرَّحِيمِ • مَالِكِ يَوْمِ الدِّينِ**\n\n"All praise is for Allah, **Lord of the worlds**, the Most Merciful, **Master of the Day of Judgment**."',
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: 'al-hamdu lillaahi rabbil-‘aalameen',
      quran_ref: 'Al-Fatiha 1:2–4',
    }},
    { type: 'mcq', content: {
      question: 'رَبِّ الْعَالَمِينَ is...',
      options: [
        { text: 'an iḍāfa — "Lord of the worlds"', correct: true },
        { text: 'a noun + adjective', correct: false },
        { text: 'a verb sentence', correct: false },
      ],
      explanation: 'Two nouns, "Lord of the worlds" — classic iḍāfa.',
    }},
    { type: 'mcq', content: {
      question: 'مَالِكِ يَوْمِ الدِّينِ — how would you translate it?',
      options: [
        { text: 'Master of the Day of Judgment', correct: true },
        { text: 'The Master and the Day', correct: false },
        { text: 'A master of a day', correct: false },
      ],
      explanation: 'A two-link iḍāfa chain: Master → of the Day → of Judgment.',
    }},
    { type: 'classify', content: {
      instruction: 'Iḍāfa or NOT iḍāfa?',
      categories: ['Iḍāfa (X of Y)', 'Not iḍāfa'],
      items: [
        { text: 'رَبِّ الْعَالَمِينَ', category: 'Iḍāfa (X of Y)' },
        { text: 'يَوْمِ الدِّينِ', category: 'Iḍāfa (X of Y)' },
        { text: 'الرَّحْمٰنِ الرَّحِيمِ', category: 'Not iḍāfa' },
        { text: 'رَبُّكَ', category: 'Iḍāfa (X of Y)' },
      ],
      explanation: 'الرَّحْمٰنِ الرَّحِيمِ is noun + adjective (Unit 8) — both have ال. Iḍāfa’s first noun never has ال.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'A quick test for iḍāfa: the first noun has NO ال and NO tanwin, and the second ends in ___.',
      correct_answer: 'kasra',
      options: ['kasra', 'damma', 'ال'],
      explanation: 'رَبِّ الْعَالَمِينَ, يَوْمِ الدِّينِ — the second word carries the "of" kasra.',
    }},
    { type: 'arrange', content: {
      instruction: 'Rebuild: "Lord of the worlds"',
      reference: 'Lord of the worlds',
      tiles: ['رَبِّ', 'الْعَالَمِينَ'],
      correct_order: ['رَبِّ', 'الْعَالَمِينَ'],
      result_transliteration: 'rabbil-‘aalameen',
      explanation: 'You just parsed the grammar of the most-recited ayah on earth.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 7 complete!',
      explanation: 'Iḍāfa is the skeleton of Al-Fatiha — and now you see it clearly.\n\nLast unit of Stage 2: **adjectives** — الرَّحْمٰنِ الرَّحِيمِ and how describing-words agree with what they describe.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 8 — Describing Things (adjectives) — checkpoint after
// ═══════════════════════════════════════════════════════════════

const U8_L1 = { // Adjective follows the noun
  steps: [
    { type: 'teach', content: {
      title: 'The describer comes AFTER',
      explanation: 'In English the adjective comes first: "the generous book". In Arabic it comes **after** the noun:\n\n**الْكِتَابُ الْكَرِيمُ** = "the generous Book" (literally: the-Book the-generous).',
      arabic: 'الْكِتَابُ الْكَرِيمُ',
      transliteration: 'al-kitaabul-kareem',
      examples: [
        { ar: 'كِتَابٌ كَرِيمٌ', tr: 'kitaabun kareem', en: 'a noble book' },
        { ar: 'رَبٌّ عَظِيمٌ', tr: 'rabbun ‘azeem', en: 'a great Lord' },
      ],
      fun_fact: 'The adjective is called a صِفَة (sifah) — a "quality". The noun it describes is the مَوْصُوف.',
    }},
    { type: 'teach', content: {
      title: 'The adjective copies the noun',
      explanation: 'The صِفَة **matches** its noun. If the noun has ال, the adjective takes ال too:\n\nالْكِتَابُ الْكَرِيمُ (both definite)\nكِتَابٌ كَرِيمٌ (both indefinite — both tanwin)',
      arabic: null, transliteration: null,
      examples: [
        { ar: 'الصِّرَاطُ الْمُسْتَقِيمُ', tr: 'as-siraatul-mustaqeem', en: 'the straight path' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'How do you say "the straight path" in Arabic word order?',
      options: [
        { text: 'الصِّرَاطُ الْمُسْتَقِيمُ (the-path the-straight)', correct: true },
        { text: 'الْمُسْتَقِيمُ الصِّرَاطُ (the-straight the-path)', correct: false },
      ],
      explanation: 'Noun first, then adjective: الصِّرَاطُ الْمُسْتَقِيمُ.',
    }},
    { type: 'mcq', content: {
      question: 'In الْكِتَابُ الْكَرِيمُ, why does الْكَرِيم have ال?',
      options: [
        { text: 'To match الْكِتَاب, which is definite', correct: true },
        { text: 'Adjectives always have ال', correct: false },
        { text: 'It is a spelling rule', correct: false },
      ],
      explanation: 'The adjective copies the noun’s definiteness. Definite noun → definite adjective.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'كِتَابٌ ___ ("a noble book") — the adjective copies the tanwin of كِتَابٌ.',
      correct_answer: 'كَرِيمٌ',
      options: ['كَرِيمٌ', 'الْكَرِيمُ', 'كَرِيمَة'],
      explanation: 'Indefinite noun (tanwin) → indefinite adjective (tanwin): كِتَابٌ كَرِيمٌ.',
    }},
    { type: 'teach', content: {
      title: 'Describer basics: done',
      explanation: 'Adjective comes **after** the noun and copies its "the".\n\nNext: full agreement — it also copies **gender**.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U8_L2 = { // Full agreement
  steps: [
    { type: 'teach', content: {
      title: 'The adjective copies gender too',
      explanation: 'A صِفَة matches its noun in **gender** as well. Feminine noun → the adjective takes ة:\n\nرَجُلٌ صَالِحٌ = a righteous man\nاِمْرَأَةٌ صَالِحَةٌ = a righteous woman',
      arabic: 'صَالِحٌ · صَالِحَةٌ',
      transliteration: 'saalih · saalihah',
      examples: [
        { ar: 'النَّفْسُ الْمُطْمَئِنَّةُ', tr: 'an-nafsul-mutma’innah', en: 'the tranquil soul (f)' },
      ],
      fun_fact: 'نَفْس is a hidden feminine (Unit 2!) — so its adjective مُطْمَئِنَّة takes the ة. Grammar layers on grammar.',
    }},
    { type: 'mcq', content: {
      question: 'نَفْس is feminine. So "the tranquil soul" is...',
      options: [
        { text: 'النَّفْسُ الْمُطْمَئِنَّةُ (adjective takes ة)', correct: true },
        { text: 'النَّفْسُ الْمُطْمَئِنُّ (no ة)', correct: false },
      ],
      explanation: 'Feminine noun → feminine adjective. Al-Fajr 89:27: يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ.',
    }},
    { type: 'classify', content: {
      instruction: 'Does the adjective need a ة?',
      categories: ['Adjective takes ة (f)', 'Adjective, no ة (m)'],
      items: [
        { text: 'جَنَّة + wide', category: 'Adjective takes ة (f)' },
        { text: 'كِتَاب + noble', category: 'Adjective, no ة (m)' },
        { text: 'أَرْض + vast', category: 'Adjective takes ة (f)' },
        { text: 'صِرَاط + straight', category: 'Adjective, no ة (m)' },
      ],
      explanation: 'Match gender: feminine nouns (جَنَّة, أَرْض) → adjective with ة.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'An adjective agrees with its noun in definiteness AND ___.',
      correct_answer: 'gender',
      options: ['gender', 'height', 'speed'],
      explanation: '(Later you’ll add number and case too — but "the" + gender already cover most ayat.)',
    }},
    { type: 'mcq', content: {
      question: 'الْبَلَدُ الْأَمِينُ ("the secure city", At-Tin 95:3) — both words are...',
      options: [
        { text: 'definite (both have ال) and masculine', correct: true },
        { text: 'indefinite', correct: false },
      ],
      explanation: 'بَلَد + أَمِين, both with ال, both masculine — full agreement.',
    }},
    { type: 'teach', content: {
      title: 'Agreement mastered',
      explanation: 'The صِفَة copies "the" AND gender. Next: the most beautiful adjectives of all — the Names of Allah.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U8_L3 = { // Allah's Names as adjectives
  steps: [
    { type: 'teach', content: {
      title: 'The Names are adjectives',
      explanation: 'Allah’s beautiful Names often work as adjectives describing Him:\n\n**الرَّحْمٰنِ الرَّحِيمِ** = "the Most Merciful, the Especially Merciful"\n**الْعَزِيزُ الْحَكِيمُ** = "the Almighty, the All-Wise"',
      arabic: 'الْعَزِيزُ الْحَكِيمُ',
      transliteration: 'al-‘azeezul-hakeem',
      examples: [
        { ar: 'الرَّحْمٰن', tr: 'ar-Rahmaan', en: 'the Most Merciful' },
        { ar: 'الرَّحِيم', tr: 'ar-Raheem', en: 'the Especially Merciful' },
        { ar: 'الْحَكِيم', tr: 'al-Hakeem', en: 'the All-Wise' },
      ],
      fun_fact: 'الرَّحْمٰن and الرَّحِيم both come from the root ر-ح-م (mercy) — a root you can explore in /roots.',
    }},
    { type: 'mcq', content: {
      question: 'الْعَزِيزُ الْحَكِيمُ describes Allah as...',
      options: [
        { text: 'the Almighty, the All-Wise', correct: true },
        { text: 'the merciful and the near', correct: false },
        { text: 'the first and the last', correct: false },
      ],
      explanation: 'عَزِيز = Almighty/Mighty; حَكِيم = All-Wise. A pair closing many ayat.',
    }},
    { type: 'match', content: {
      instruction: 'Match the Name to its meaning',
      pairs: [
        { left: 'الرَّحْمٰن', right: 'the Most Merciful' },
        { left: 'الرَّحِيم', right: 'the Especially Merciful' },
        { left: 'الْعَزِيز', right: 'the Almighty' },
        { left: 'الْحَكِيم', right: 'the All-Wise' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ — الرَّحْمٰن and الرَّحِيم are adjectives describing ___.',
      correct_answer: 'Allah',
      options: ['Allah', 'the Book', 'the path'],
      explanation: 'Both Names describe اللّٰه — and both share His kasra ending in agreement.',
    }},
    { type: 'mcq', content: {
      question: 'Both الرَّحْمٰنِ and الرَّحِيمِ end in kasra to match اللّٰهِ. This is...',
      options: [
        { text: 'adjective agreement (they copy the noun)', correct: true },
        { text: 'a coincidence', correct: false },
      ],
      explanation: 'Adjectives copy their noun’s ending too — here the "of" kasra flows from بِسْمِ اللّٰهِ.',
    }},
    { type: 'teach', content: {
      title: 'The most beautiful describers',
      explanation: 'You can now read the Names of Allah as the adjectives they are. Final lesson of Stage 2: **Bismillah**, fully parsed.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U8_L4 = { // Read the Quran: Bismillah
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — Bismillah',
      explanation: 'The most-repeated line in a Muslim’s life:\n\n**بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ**\n"In the name of Allah, the Most Merciful, the Especially Merciful."\n\nInside it: a preposition, an iḍāfa, and two adjectives — everything from Stage 2.',
      arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ',
      transliteration: 'bismillaahir-rahmaanir-raheem',
      quran_ref: 'Al-Fatiha 1:1',
    }},
    { type: 'mcq', content: {
      question: 'اسْمِ اللّٰهِ ("the name of Allah") is a...',
      options: [
        { text: 'an iḍāfa (X of Y)', correct: true },
        { text: 'a noun + adjective', correct: false },
        { text: 'a demonstrative', correct: false },
      ],
      explanation: 'اسْم (name) + اللّٰه = "the name of Allah" — iḍāfa. (بِـ is "in/with", from Unit 10.)',
    }},
    { type: 'mcq', content: {
      question: 'الرَّحْمٰنِ and الرَّحِيمِ in Bismillah are...',
      options: [
        { text: 'adjectives describing Allah', correct: true },
        { text: 'an iḍāfa', correct: false },
        { text: 'verbs', correct: false },
      ],
      explanation: 'Two adjectives (both with ال, both matching اللّٰهِ’s kasra) describing Allah.',
    }},
    { type: 'classify', content: {
      instruction: 'Label each piece of Bismillah',
      categories: ['Iḍāfa (of)', 'Adjective (describer)'],
      items: [
        { text: 'اسْمِ اللّٰهِ (name of Allah)', category: 'Iḍāfa (of)' },
        { text: 'الرَّحْمٰنِ (Most Merciful)', category: 'Adjective (describer)' },
        { text: 'الرَّحِيمِ (Especially Merciful)', category: 'Adjective (describer)' },
      ],
      explanation: 'One iḍāfa + two adjectives = the whole Bismillah, parsed.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'الرَّحْمٰنِ الرَّحِيمِ — an adjective follows its noun and copies its "the" and its ___.',
      correct_answer: 'ending',
      options: ['ending', 'meaning', 'length'],
      explanation: 'Both Names copy the kasra ending, agreeing with اللّٰهِ.',
    }},
    { type: 'arrange', content: {
      instruction: 'Rebuild the Bismillah',
      reference: 'In the name of Allah, the Most Merciful, the Especially Merciful',
      tiles: ['بِسْمِ', 'اللّٰهِ', 'الرَّحْمٰنِ', 'الرَّحِيمِ'],
      correct_order: ['بِسْمِ', 'اللّٰهِ', 'الرَّحْمٰنِ', 'الرَّحِيمِ'],
      result_transliteration: 'bismillaahir-rahmaanir-raheem',
      explanation: 'You assembled — and fully understand — the opening of every surah.',
    }},
    { type: 'teach', content: {
      title: '🏆 STAGE 2 COMPLETE!',
      explanation: 'You now handle **the** vs **a**, all the **pronouns**, **this/that/these/those**, **iḍāfa** ("of"), and **adjectives** — the skeleton of most ayat.\n\nYou can parse Al-Fatiha’s nouns start to finish. Next stage: the little connecting words — **prepositions and connectors** (فِي, مِنْ, وَ, فَ) — the glue of the Quran.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// Vocabulary
// ═══════════════════════════════════════════════════════════════
// [word_ar, translit, english, word_type, gender, number, quranic_ref, difficulty]

const U4_VOCAB = [
  ['الْكِتَاب', 'al-kitaab', 'the book', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:2', 1],
  ['اللّٰه', 'Allah', 'Allah (The God)', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:1', 1],
  ['رَبّ', 'rabb', 'Lord', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:2', 1],
  ['الْحَمْد', 'al-hamd', 'the praise', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:2', 1],
  ['رَيْب', 'rayb', 'doubt', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:2', 2],
  ['هُدًى', 'hudan', 'guidance', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:2', 2],
  ['الدِّين', 'ad-deen', 'the religion / judgment', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:4', 1],
  ['الْعَالَمِين', 'al-‘aalameen', 'the worlds', 'ism', 'masculine', 'plural', 'Al-Fatiha 1:2', 1],
];

const U5_VOCAB = [
  ['هُوَ', 'huwa', 'he', 'ism', 'masculine', 'singular', 'Al-Ikhlas 112:1', 1],
  ['هِيَ', 'hiya', 'she', 'ism', 'feminine', 'singular', null, 1],
  ['هُمْ', 'hum', 'they (m)', 'ism', 'masculine', 'plural', 'Al-Baqarah 2:5', 1],
  ['أَنَا', 'ana', 'I', 'ism', null, 'singular', 'Ya-Sin 36:22', 1],
  ['نَحْنُ', 'nahnu', 'we', 'ism', null, 'plural', 'Al-Hijr 15:9', 1],
  ['أَنْتَ', 'anta', 'you (m)', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:32', 1],
  ['أَنْتُمْ', 'antum', 'you (all)', 'ism', 'masculine', 'plural', 'Al-Baqarah 2:22', 1],
  ['رَبِّي', 'rabbee', 'my Lord', 'ism', 'masculine', 'singular', 'Maryam 19:47', 1],
  ['رَبُّكَ', 'rabbuka', 'your Lord', 'ism', 'masculine', 'singular', 'Al-Alaq 96:1', 1],
  ['رَبَّنَا', 'rabbanaa', 'our Lord', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:127', 1],
  ['لَهُمْ', 'lahum', 'for them', 'harf', null, null, 'Al-Baqarah 2:7', 1],
  ['أَحَد', 'ahad', 'one', 'ism', 'masculine', 'singular', 'Al-Ikhlas 112:1', 1],
];

const U6_VOCAB = [
  ['هَٰذَا', 'haadhaa', 'this (m)', 'ism', 'masculine', 'singular', 'Al-Isra 17:9', 1],
  ['هَٰذِهِ', 'haadhihi', 'this (f)', 'ism', 'feminine', 'singular', null, 1],
  ['ذَٰلِكَ', 'dhaalika', 'that (m)', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:2', 1],
  ['تِلْكَ', 'tilka', 'that (f)', 'ism', 'feminine', 'singular', 'Al-Baqarah 2:253', 1],
  ['هَٰؤُلَاءِ', 'haa’ulaa’i', 'these', 'ism', null, 'plural', 'Al-Baqarah 2:31', 2],
  ['أُولَٰئِكَ', 'ulaa’ika', 'those', 'ism', null, 'plural', 'Al-Baqarah 2:5', 1],
  ['صِرَاط', 'siraat', 'path', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:6', 1],
  ['مُسْتَقِيم', 'mustaqeem', 'straight', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:6', 1],
];

const U7_VOCAB = [
  ['رَسُولُ اللّٰهِ', 'rasoolu-llah', 'the Messenger of Allah', 'ism', 'masculine', 'singular', 'Al-Fath 48:29', 1],
  ['كِتَابُ اللّٰهِ', 'kitaabu-llah', 'the Book of Allah', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:101', 1],
  ['مَالِك', 'maalik', 'master / owner', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:4', 1],
  ['يَوْمِ الدِّينِ', 'yawmid-deen', 'the Day of Judgment', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:4', 1],
  ['قَوْم', 'qawm', 'people / nation', 'ism', 'masculine', 'singular', 'Ya-Sin 36:20', 1],
  ['اسْم', 'ism', 'name', 'ism', 'masculine', 'singular', 'Al-Alaq 96:1', 1],
];

const U8_VOCAB = [
  ['كَرِيم', 'kareem', 'noble / generous', 'ism', 'masculine', 'singular', 'Al-Waqiah 56:77', 1],
  ['عَظِيم', '‘azeem', 'great / mighty', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:255', 1],
  ['عَزِيز', '‘azeez', 'almighty / mighty', 'ism', 'masculine', 'singular', 'Ibrahim 14:1', 1],
  ['حَكِيم', 'hakeem', 'all-wise', 'ism', 'masculine', 'singular', 'Ibrahim 14:1', 1],
  ['الرَّحْمٰن', 'ar-Rahmaan', 'the Most Merciful', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:1', 1],
  ['الرَّحِيم', 'ar-Raheem', 'the Especially Merciful', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:1', 1],
  ['أَمِين', 'ameen', 'secure / trustworthy', 'ism', 'masculine', 'singular', 'At-Tin 95:3', 2],
];

// ═══════════════════════════════════════════════════════════════
// Seeding
// ═══════════════════════════════════════════════════════════════

const UNIT_DEFS = [
  // sort_order, slug, title, title_ar, emoji, color, checkpoint_after, description
  [4, 'al-definite', 'THE Book', 'المَعْرِفَة', '📗', '#D4A246', false, 'Definiteness: the ال prefix, sun & moon letters, and tanwin.'],
  [5, 'pronouns', 'Who? Me? You!', 'الضَّمَائِر', '🧑', '#5FB57A', false, 'Standalone and attached pronouns — He, my Lord, our Lord.'],
  [6, 'demonstratives', 'This & That', 'أَسْمَاء الإِشَارَة', '👉', '#6BA8D4', false, 'Pointing words: this, that, these, those.'],
  [7, 'idafa', 'Belongs To', 'الإِضَافَة', '🔗', '#C77DBB', false, 'Iḍāfa — possession: "the Book of Allah", with no word for "of".'],
  [8, 'adjectives', 'Describing Things', 'الصِّفَة', '🎨', '#E0A94A', true, 'Adjectives that follow the noun and agree with it.'],
];

async function main() {
  // 1) Create/refresh unit rows
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

  // 2) Lessons: [unitSort, slug, title, sortOrder, content, xp]
  const lessons = [
    [4, 'al-prefix', 'The ال Prefix', 1, U4_L1, 15],
    [4, 'sun-moon-letters', 'Sun & Moon Letters', 2, U4_L2, 15],
    [4, 'tanwin', 'Tanwin: A / An', 3, U4_L3, 15],
    [4, 'read-quran-al', 'Read the Quran: The Book', 4, U4_L4, 20],

    [5, 'he-she-they', 'He, She, They', 1, U5_L1, 15],
    [5, 'i-we-you', 'I, We, You', 2, U5_L2, 15],
    [5, 'attached-1', 'My, Your, His', 3, U5_L3, 15],
    [5, 'attached-2', 'Our, Their, Your-All', 4, U5_L4, 15],
    [5, 'read-quran-pronouns', 'Read the Quran: Al-Ikhlas', 5, U5_L5, 20],

    [6, 'this', 'This', 1, U6_L1, 15],
    [6, 'that', 'That', 2, U6_L2, 15],
    [6, 'these-those', 'These & Those', 3, U6_L3, 15],
    [6, 'read-quran-pointing', 'Read the Quran: Pointing', 4, U6_L4, 20],

    [7, 'idafa-basics', 'Two Nouns, One Meaning', 1, U7_L1, 15],
    [7, 'idafa-chains', 'Idafa Chains', 2, U7_L2, 15],
    [7, 'idafa-pronouns', 'Idafa + Pronouns', 3, U7_L3, 15],
    [7, 'read-quran-fatiha', 'Read the Quran: Al-Fatiha', 4, U7_L4, 20],

    [8, 'adjective-order', 'The Describer Comes After', 1, U8_L1, 15],
    [8, 'agreement', 'Full Agreement', 2, U8_L2, 15],
    [8, 'names-of-allah', 'The Names as Adjectives', 3, U8_L3, 15],
    [8, 'read-quran-bismillah', 'Read the Quran: Bismillah', 4, U8_L4, 20],
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

  // 3) Vocabulary — wipe + reinsert per unit
  const vocabByUnit = [[4, U4_VOCAB], [5, U5_VOCAB], [6, U6_VOCAB], [7, U7_VOCAB], [8, U8_VOCAB]];
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

  // 4) Backfill: unlock Unit 4 Lesson 1 for users who finished ALL of Unit 3
  const [firstU4] = await sql`
    SELECT id FROM learning_lessons WHERE unit_id = ${unitIdBySort[4]} ORDER BY sort_order LIMIT 1`;
  const unlocked = await sql`
    WITH unit3 AS (
      SELECT l.id FROM learning_lessons l
      JOIN learning_units u ON u.id = l.unit_id
      WHERE u.sort_order = 3
    ),
    finishers AS (
      SELECT p.user_id FROM user_lesson_progress p
      JOIN unit3 ON unit3.id = p.lesson_id
      WHERE p.status = 'completed'
      GROUP BY p.user_id
      HAVING count(*) = (SELECT count(*) FROM unit3)
    )
    INSERT INTO user_lesson_progress (user_id, lesson_id, status)
    SELECT f.user_id, ${firstU4.id}, 'available' FROM finishers f
    ON CONFLICT (user_id, lesson_id) DO NOTHING
    RETURNING user_id`;
  console.log(`  ✓ Unlocked Unit 4 Lesson 1 for ${unlocked.length} users who had finished Unit 3`);

  // 5) Sanity check
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
