/**
 * Seeds Units 2 ("Boy or Girl?") and 3 ("How Many?") with full lessons +
 * vocabulary, and backfills lesson unlocks for users who already completed
 * Unit 1 (they were left with no available lesson because these units were
 * empty when they finished).
 *
 * Idempotent: lessons upsert on (unit_id, slug); vocab is wiped per-unit and
 * re-inserted; unlock backfill uses ON CONFLICT DO NOTHING.
 *
 * Run: DATABASE_URL=... node scripts/seed-units-2-3.mjs
 */
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL required');
  process.exit(1);
}
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

// ─────────────────────────────────────────────────────────────
// UNIT 2 — Boy or Girl? (gender)
// ─────────────────────────────────────────────────────────────

const U2_L1 = { // Every Word Picks a Side
  steps: [
    { type: 'teach', content: {
      title: 'Every Ism picks a side',
      explanation: 'In Arabic, **every single Ism** is either masculine (مُذَكَّر) or feminine (مُؤَنَّث). There is no "it"!\n\nA book, a door, the moon — each one is a "he" or a "she" in Arabic.',
      arabic: 'مُذَكَّر وَمُؤَنَّث',
      transliteration: 'mudhakkar wa mu’annath',
      examples: [
        { ar: 'كِتَاب', tr: 'kitaab', en: 'book — he' },
        { ar: 'جَنَّة', tr: 'jannah', en: 'garden — she' },
        { ar: 'قَمَر', tr: 'qamar', en: 'moon — he' },
      ],
      fun_fact: 'Even the sun and moon have genders: the sun (شَمْس) is a she, the moon (قَمَر) is a he!',
    }},
    { type: 'teach', content: {
      title: 'Masculine is the default',
      explanation: 'Here’s the good news: an Ism is **masculine unless something marks it feminine**.\n\nNo marker? It’s a "he". So you only need to learn the feminine signs.',
      arabic: null,
      transliteration: null,
      examples: [
        { ar: 'بَيْت', tr: 'bayt', en: 'house' },
        { ar: 'بَاب', tr: 'baab', en: 'door' },
        { ar: 'نُور', tr: 'noor', en: 'light' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'How many genders can an Arabic Ism have?',
      options: [
        { text: 'Two — masculine or feminine', correct: true },
        { text: 'Three — masculine, feminine, or neutral "it"', correct: false },
        { text: 'None — Arabic has no gender', correct: false },
      ],
      explanation: 'Exactly two. Arabic has no neutral "it" — every ism is a he or a she.',
    }},
    { type: 'teach', content: {
      title: 'Meet the ة — the feminine flag',
      explanation: 'This little round letter at the END of a word is called **Ta Marbutah** (the "tied ta").\n\nSee a ة at the end? The word is almost always **feminine**.',
      arabic: 'ة',
      transliteration: 'ta marbutah',
      examples: [
        { ar: 'رَحْمَة', tr: 'rahmah', en: 'mercy' },
        { ar: 'صَلَاة', tr: 'salaah', en: 'prayer' },
        { ar: 'مَدِينَة', tr: 'madeenah', en: 'city' },
      ],
      fun_fact: 'It’s called the "tied ta" because it looks like a ت tied into a knot.',
    }},
    { type: 'mcq', content: {
      question: 'Which of these words is feminine?',
      options: [
        { text: 'جَنَّة (jannah)', correct: true },
        { text: 'كِتَاب (kitaab)', correct: false },
        { text: 'بَاب (baab)', correct: false },
      ],
      explanation: 'جَنَّة ends in ة — the feminine flag. The others have no marker, so they stay masculine.',
    }},
    { type: 'classify', content: {
      instruction: 'Sort each word by its gender',
      categories: ['Masculine', 'Feminine'],
      items: [
        { text: 'كِتَاب (book)', category: 'Masculine' },
        { text: 'جَنَّة (garden)', category: 'Feminine' },
        { text: 'بَيْت (house)', category: 'Masculine' },
        { text: 'رَحْمَة (mercy)', category: 'Feminine' },
        { text: 'قَمَر (moon)', category: 'Masculine' },
        { text: 'مَدِينَة (city)', category: 'Feminine' },
      ],
      explanation: 'The ة gives the feminine ones away: جَنَّة، رَحْمَة، مَدِينَة.',
    }},
    { type: 'match', content: {
      instruction: 'Match the Arabic word to its meaning',
      pairs: [
        { left: 'جَنَّة', right: 'garden / paradise' },
        { left: 'رَحْمَة', right: 'mercy' },
        { left: 'بَيْت', right: 'house' },
        { left: 'قَمَر', right: 'moon' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'A word ending in ة is almost always ___.',
      correct_answer: 'feminine',
      options: ['feminine', 'masculine', 'plural'],
      explanation: 'ة = the feminine flag. (You’ll meet a few sneaky exceptions later!)',
    }},
    { type: 'mcq', content: {
      question: 'صَلَاة (salaah — prayer): masculine or feminine?',
      options: [
        { text: 'Feminine — it ends in ة', correct: true },
        { text: 'Masculine — prayers are things', correct: false },
      ],
      explanation: 'صَلَاة ends in ة, so it’s feminine — that’s why the Quran says الصَّلَاةَ الْوُسْطَىٰ with a feminine adjective.',
    }},
    { type: 'mcq', content: {
      question: 'بَاب (baab — door): masculine or feminine?',
      options: [
        { text: 'Masculine — no feminine marker', correct: true },
        { text: 'Feminine — doors are graceful', correct: false },
      ],
      explanation: 'No ة, no marker → masculine by default.',
    }},
    { type: 'mcq', content: {
      question: 'Final check: which word is MASCULINE?',
      options: [
        { text: 'نُور (light)', correct: true },
        { text: 'مَدِينَة (city)', correct: false },
        { text: 'صَلَاة (prayer)', correct: false },
      ],
      explanation: 'نُور has no feminine marker. The other two carry the ة flag.',
    }},
    { type: 'teach', content: {
      title: 'You have gender radar now! 🎯',
      explanation: 'Rule of thumb:\n\n**No marker → masculine.**\n**Ends in ة → feminine.**\n\nNext lesson: the famous words that are feminine *without* the ة — the hidden feminines.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U2_L2 = { // The Hidden Feminines
  steps: [
    { type: 'teach', content: {
      title: 'Feminine without the flag',
      explanation: 'Some words are feminine with **no ة at all**. Arabs simply always treated them as "she".\n\nThe Quran uses these words constantly — so let’s meet the famous ones.',
      arabic: null, transliteration: null,
      examples: [
        { ar: 'شَمْس', tr: 'shams', en: 'sun — she!' },
        { ar: 'أَرْض', tr: 'ard', en: 'earth — she!' },
        { ar: 'نَار', tr: 'naar', en: 'fire — she!' },
      ],
      fun_fact: 'The sun (شَمْس) is feminine but the moon (قَمَر) is masculine — the exact opposite of French!',
    }},
    { type: 'teach', content: {
      title: 'The must-know hidden feminines',
      explanation: 'Memorize this small club — they appear across the whole Quran:\n\nشَمْس (sun) · أَرْض (earth) · نَار (fire) · نَفْس (soul) · يَد (hand) · رِيح (wind)',
      arabic: null, transliteration: null,
      examples: [
        { ar: 'نَفْس', tr: 'nafs', en: 'soul / self' },
        { ar: 'يَد', tr: 'yad', en: 'hand' },
        { ar: 'رِيح', tr: 'reeh', en: 'wind' },
      ],
      fun_fact: 'Body parts that come in pairs — hands, eyes, ears, feet — are usually feminine in Arabic.',
    }},
    { type: 'mcq', content: {
      question: 'شَمْس (sun) has no ة. What’s its gender?',
      options: [
        { text: 'Feminine — it’s a famous hidden feminine', correct: true },
        { text: 'Masculine — no marker means masculine', correct: false },
      ],
      explanation: 'شَمْس is the most famous hidden feminine. "No marker → masculine" is the default, but this club is the exception.',
    }},
    { type: 'classify', content: {
      instruction: 'Hidden feminine or regular masculine?',
      categories: ['Feminine (hidden)', 'Masculine'],
      items: [
        { text: 'شَمْس (sun)', category: 'Feminine (hidden)' },
        { text: 'أَرْض (earth)', category: 'Feminine (hidden)' },
        { text: 'قَمَر (moon)', category: 'Masculine' },
        { text: 'نَار (fire)', category: 'Feminine (hidden)' },
        { text: 'بَاب (door)', category: 'Masculine' },
        { text: 'نَفْس (soul)', category: 'Feminine (hidden)' },
      ],
      explanation: 'شَمْس، أَرْض، نَار، نَفْس — all feminine with no ة. قَمَر and بَاب stay masculine.',
    }},
    { type: 'mcq', content: {
      question: 'Surah Ash-Shams opens: وَالشَّمْسِ وَضُحَاهَا — "By the sun and HER morning light". Why "her"?',
      options: [
        { text: 'Because شَمْس is feminine', correct: true },
        { text: 'It’s a translation mistake', correct: false },
        { text: 'The Quran treats all nature as feminine', correct: false },
      ],
      explanation: 'ضُحَاهَا ends in هَا ("her") — the Quran itself confirms شَمْس is feminine. You just read real Quranic grammar!',
    }},
    { type: 'match', content: {
      instruction: 'Match the hidden feminines to their meanings',
      pairs: [
        { left: 'أَرْض', right: 'earth' },
        { left: 'نَار', right: 'fire' },
        { left: 'نَفْس', right: 'soul' },
        { left: 'يَد', right: 'hand' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'شَمْس، أَرْض، and نَار are all ___ even though they have no ة.',
      correct_answer: 'feminine',
      options: ['feminine', 'masculine', 'dual'],
      explanation: 'They’re in the hidden-feminine club — the Quran always treats them as "she".',
    }},
    { type: 'mcq', content: {
      question: 'Which pair is BOTH feminine?',
      options: [
        { text: 'شَمْس + جَنَّة', correct: true },
        { text: 'قَمَر + كِتَاب', correct: false },
        { text: 'بَيْت + بَاب', correct: false },
      ],
      explanation: 'شَمْس (hidden feminine) + جَنَّة (ة flag). The other pairs are all masculine.',
    }},
    { type: 'mcq', content: {
      question: 'يَد (hand) — masculine or feminine?',
      options: [
        { text: 'Feminine — paired body parts are usually feminine', correct: true },
        { text: 'Masculine — no ة', correct: false },
      ],
      explanation: 'Hands come in pairs → feminine. Same for عَيْن (eye) and أُذُن (ear).',
    }},
    { type: 'teach', content: {
      title: 'Your feminine radar is complete',
      explanation: '**Feminine if:** it ends in ة, OR it’s in the hidden club (شَمْس، أَرْض، نَار، نَفْس، يَد، رِيح), OR it’s a paired body part.\n\n**Otherwise: masculine.**\n\nNext: how to *make* words feminine — and why one tiny letter changes who you’re talking about.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U2_L3 = { // Gender Pairs
  steps: [
    { type: 'teach', content: {
      title: 'Add ة, change the person',
      explanation: 'Here’s where gender gets powerful: add ة to a person-word and it switches from **him** to **her**.\n\nمُسْلِم (a Muslim man) + ة = مُسْلِمَة (a Muslim woman)',
      arabic: 'مُسْلِم ← مُسْلِمَة',
      transliteration: 'muslim → muslimah',
      examples: [
        { ar: 'مُؤْمِن', tr: 'mu’min', en: 'believing man' },
        { ar: 'مُؤْمِنَة', tr: 'mu’minah', en: 'believing woman' },
        { ar: 'صَالِحَة', tr: 'saalihah', en: 'righteous woman' },
      ],
      fun_fact: 'This tiny ة is one of the most meaning-changing letters in the entire language.',
    }},
    { type: 'mcq', content: {
      question: 'How do you say "a believing woman"?',
      options: [
        { text: 'مُؤْمِنَة (mu’minah)', correct: true },
        { text: 'مُؤْمِن (mu’min)', correct: false },
        { text: 'إِيمَان (eemaan)', correct: false },
      ],
      explanation: 'مُؤْمِن (believing man) + ة = مُؤْمِنَة (believing woman).',
    }},
    { type: 'match', content: {
      instruction: 'Match each masculine word to its feminine pair',
      pairs: [
        { left: 'مُسْلِم', right: 'مُسْلِمَة' },
        { left: 'مُؤْمِن', right: 'مُؤْمِنَة' },
        { left: 'صَالِح', right: 'صَالِحَة' },
        { left: 'كَافِر', right: 'كَافِرَة' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'مُسْلِم + ة = ___',
      correct_answer: 'مُسْلِمَة',
      options: ['مُسْلِمَة', 'مُسْلِمُونَ', 'مُسْلِمَانِ'],
      explanation: 'Add the ة and the Muslim man becomes a Muslim woman: مُسْلِمَة.',
    }},
    { type: 'teach', content: {
      title: 'The Quran honors both',
      explanation: 'Surah Al-Ahzab lists the pairs side by side:\n\n**الْمُسْلِمِينَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ**\n\n"The Muslim men and Muslim women, the believing men and believing women..." — ten pairs in one majestic ayah.',
      arabic: 'إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ',
      transliteration: 'innal-muslimeena wal-muslimaat',
      quran_ref: 'Al-Ahzab 33:35',
      fun_fact: 'Those endings ـِينَ and ـَات are plurals — you’ll master them in the very next unit!',
    }},
    { type: 'mcq', content: {
      question: 'صَالِحَة describes...',
      options: [
        { text: 'a righteous woman', correct: true },
        { text: 'a righteous man', correct: false },
        { text: 'many righteous people', correct: false },
      ],
      explanation: 'صَالِح (righteous man) + ة = صَالِحَة (righteous woman).',
    }},
    { type: 'arrange', content: {
      instruction: 'Build: "a believing man and a believing woman"',
      reference: 'a believing man and a believing woman',
      tiles: ['مُؤْمِن', 'وَ', 'مُؤْمِنَة'],
      correct_order: ['مُؤْمِن', 'وَ', 'مُؤْمِنَة'],
      result_transliteration: 'mu’min wa mu’minah',
      explanation: 'وَ means "and" — the single most common word in the Quran.',
    }},
    { type: 'classify', content: {
      instruction: 'Who are we talking about?',
      categories: ['A man', 'A woman'],
      items: [
        { text: 'مُسْلِمَة', category: 'A woman' },
        { text: 'كَافِر', category: 'A man' },
        { text: 'مُؤْمِنَة', category: 'A woman' },
        { text: 'صَالِح', category: 'A man' },
      ],
      explanation: 'Spot the ة: مُسْلِمَة and مُؤْمِنَة are women; كَافِر and صَالِح are men.',
    }},
    { type: 'mcq', content: {
      question: 'Maryam is described as صَالِحَة. How would you describe a righteous man like Zakariyya?',
      options: [
        { text: 'صَالِح', correct: true },
        { text: 'صَالِحَة', correct: false },
        { text: 'صَلَاة', correct: false },
      ],
      explanation: 'Drop the ة for the masculine: صَالِح. (صَلَاة is "prayer" — a different word entirely!)',
    }},
    { type: 'teach', content: {
      title: 'One letter, a world of meaning',
      explanation: 'You can now flip any person-word between masculine and feminine — and you’ve already read a fragment of Al-Ahzab 35.\n\nNext lesson: the graduation — parsing gender in **real ayat**, start to finish.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U2_L4 = { // Read the Quran: Gender
  steps: [
    { type: 'teach', content: {
      title: 'Time to read REAL Quran 📖',
      explanation: 'Everything in this lesson is straight from the mushaf. You’ll use your gender radar on actual ayat — the same words you’ll hear in taraweeh.',
      arabic: null, transliteration: null,
    }},
    { type: 'teach', content: {
      title: 'A Garden whose width...',
      explanation: 'Aal Imran describes Paradise:\n\n**جَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ**\n\n"...a Garden whose width is the heavens and the earth."\n\nLook closely: عَرْضُ**هَا** — "**her** width". The Quran says "her" because جَنَّة is feminine!',
      arabic: 'جَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ',
      transliteration: 'jannatin ‘arduhas-samaawaatu wal-ard',
      quran_ref: 'Aal Imran 3:133',
    }},
    { type: 'mcq', content: {
      question: 'Why does the ayah say عَرْضُهَا ("her width") and not عَرْضُهُ ("his width")?',
      options: [
        { text: 'Because جَنَّة is feminine', correct: true },
        { text: 'Because gardens belong to people', correct: false },
        { text: 'The two forms mean the same thing', correct: false },
      ],
      explanation: 'جَنَّة carries the ة flag → feminine → "her width". Grammar you learned is written into the Quran itself.',
    }},
    { type: 'mcq', content: {
      question: 'وَالشَّمْسِ وَضُحَاهَا — "By the sun and her morning light" (Ash-Shams 91:1). What does ضُحَاهَا confirm?',
      options: [
        { text: 'شَمْس is feminine (a hidden feminine)', correct: true },
        { text: 'شَمْس is masculine', correct: false },
        { text: 'The sun owns the morning', correct: false },
      ],
      explanation: 'The هَا in ضُحَاهَا means "her" — the sun is feminine even without a ة.',
    }},
    { type: 'classify', content: {
      instruction: 'Sort these Quranic words by gender',
      categories: ['Masculine', 'Feminine'],
      items: [
        { text: 'الْجَنَّة (the Garden)', category: 'Feminine' },
        { text: 'النَّار (the Fire)', category: 'Feminine' },
        { text: 'الْكِتَاب (the Book)', category: 'Masculine' },
        { text: 'الْأَرْض (the earth)', category: 'Feminine' },
        { text: 'الْقَمَر (the moon)', category: 'Masculine' },
        { text: 'الرَّحْمَة (the mercy)', category: 'Feminine' },
      ],
      explanation: 'النَّار and الْأَرْض are hidden feminines; الْجَنَّة and الرَّحْمَة wear the ة flag.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'In يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ("O soul at peace", Al-Fajr 89:27), the adjective ends in ة because نَفْس is ___.',
      correct_answer: 'feminine',
      options: ['feminine', 'masculine', 'plural'],
      explanation: 'نَفْس is a hidden feminine — so its adjective مُطْمَئِنَّة takes the ة to agree. Adjective agreement: a preview of Stage 2!',
    }},
    { type: 'mcq', content: {
      question: 'Surah 54 is سُورَةُ الْقَمَرِ (The Moon). Is الْقَمَر treated as "he" or "she" in Arabic?',
      options: [
        { text: 'He — masculine', correct: true },
        { text: 'She — feminine', correct: false },
      ],
      explanation: 'قَمَر has no feminine marker and isn’t in the hidden club → masculine. (Remember: sun = she, moon = he.)',
    }},
    { type: 'translate', content: {
      instruction: 'Translate into Arabic',
      sentence: 'a garden and a fire',
      tiles: ['جَنَّة', 'وَ', 'نَار'],
      correct_order: ['جَنَّة', 'وَ', 'نَار'],
      explanation: 'جَنَّة وَنَار — both feminine, as you now know!',
    }},
    { type: 'teach', content: {
      title: '🎉 You parsed real Quran!',
      explanation: 'You just read fragments of **Aal Imran, Ash-Shams, and Al-Fajr** — and understood *why* each word behaves the way it does.\n\nUp next: **How Many?** — Arabic’s secret third number that English doesn’t even have.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ─────────────────────────────────────────────────────────────
// UNIT 3 — How Many? (number)
// ─────────────────────────────────────────────────────────────

const U3_L1 = { // One, Two, Many
  steps: [
    { type: 'teach', content: {
      title: 'Arabic counts differently',
      explanation: 'English has two numbers: one book, many books.\n\nArabic has **three**:\n\n**مُفْرَد** (singular) — one\n**مُثَنَّى** (dual) — exactly two\n**جَمْع** (plural) — three or more',
      arabic: 'مُفْرَد · مُثَنَّى · جَمْع',
      transliteration: 'mufrad · muthanna · jam’',
      examples: [
        { ar: 'كِتَاب', tr: 'kitaab', en: 'one book' },
        { ar: 'كِتَابَانِ', tr: 'kitaabaan', en: 'two books' },
        { ar: 'كُتُب', tr: 'kutub', en: 'books (3+)' },
      ],
      fun_fact: 'Arabic gives "two" its own grammar because pairs matter — two hands, two eyes, two gardens...',
    }},
    { type: 'teach', content: {
      title: 'The dual: just add انِ',
      explanation: 'To say **exactly two**, add **انِ** to the end:\n\nرَجُل (a man) → رَجُلَانِ (two men)\n\nFor ة words, the ة opens up into a ت first:\nجَنَّة → جَنَّتَانِ (two gardens)',
      arabic: 'جَنَّتَانِ',
      transliteration: 'jannataan',
      examples: [
        { ar: 'رَجُلَانِ', tr: 'rajulaan', en: 'two men' },
        { ar: 'عَيْنَانِ', tr: '‘aynaan', en: 'two springs' },
        { ar: 'جَنَّتَانِ', tr: 'jannataan', en: 'two gardens' },
      ],
      fun_fact: 'Surah Ar-Rahman promises the righteous جَنَّتَانِ — TWO gardens — and the surah is full of duals.',
    }},
    { type: 'mcq', content: {
      question: 'جَنَّتَانِ means...',
      options: [
        { text: 'two gardens', correct: true },
        { text: 'one garden', correct: false },
        { text: 'many gardens', correct: false },
      ],
      explanation: 'The انِ ending = exactly two. وَلِمَنْ خَافَ مَقَامَ رَبِّهِ جَنَّتَانِ (Ar-Rahman 55:46).',
    }},
    { type: 'mcq', content: {
      question: 'How many men is رَجُلَانِ?',
      options: [
        { text: 'Exactly two', correct: true },
        { text: 'One', correct: false },
        { text: 'Two or more', correct: false },
      ],
      explanation: 'The dual is precise: انِ always means exactly two — never "a couple-ish".',
    }},
    { type: 'classify', content: {
      instruction: 'Singular, dual, or plural?',
      categories: ['Singular', 'Dual', 'Plural'],
      items: [
        { text: 'كِتَاب', category: 'Singular' },
        { text: 'كِتَابَانِ', category: 'Dual' },
        { text: 'كُتُب', category: 'Plural' },
        { text: 'رَجُلَانِ', category: 'Dual' },
        { text: 'جَنَّة', category: 'Singular' },
        { text: 'مُسْلِمُونَ', category: 'Plural' },
      ],
      explanation: 'Spot the انِ for duals. كُتُب and مُسْلِمُونَ are plurals — next two lessons explain both kinds!',
    }},
    { type: 'fill_blank', content: {
      sentence: 'To say exactly TWO of something, Arabic adds ___ to the word.',
      correct_answer: 'انِ',
      options: ['انِ', 'ة', 'ونَ'],
      explanation: 'انِ is the dual ending: كِتَابَانِ، رَجُلَانِ، جَنَّتَانِ.',
    }},
    { type: 'match', content: {
      instruction: 'Match Arabic to English',
      pairs: [
        { left: 'كِتَاب', right: 'one book' },
        { left: 'كِتَابَانِ', right: 'two books' },
        { left: 'رَجُل', right: 'a man' },
        { left: 'رَجُلَانِ', right: 'two men' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'فِيهِمَا عَيْنَانِ تَجْرِيَانِ (Ar-Rahman 55:50) — how many flowing springs?',
      options: [
        { text: 'Exactly two', correct: true },
        { text: 'Many', correct: false },
        { text: 'One', correct: false },
      ],
      explanation: 'عَيْنَانِ = two springs. Even the verb تَجْرِيَانِ ("they both flow") is dual — Arabic is thorough!',
    }},
    { type: 'teach', content: {
      title: 'The pair is honored',
      explanation: 'You now own the dual — a number English doesn’t even have.\n\n**See انِ → exactly two.**\n\nNext: the plurals — starting with the friendly kind.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U3_L2 = { // Sound Plurals
  steps: [
    { type: 'teach', content: {
      title: 'The sound plural: safe and sound',
      explanation: 'The friendliest plural keeps the word intact and adds an ending.\n\nFor **men and groups of people (masculine)**: add **ونَ**\n\nمُسْلِم → مُسْلِمُونَ (Muslims)',
      arabic: 'مُسْلِمُونَ',
      transliteration: 'muslimoon',
      examples: [
        { ar: 'مُؤْمِنُونَ', tr: 'mu’minoon', en: 'believers' },
        { ar: 'صَالِحُونَ', tr: 'saalihoon', en: 'righteous ones' },
        { ar: 'كَافِرُونَ', tr: 'kaafiroon', en: 'disbelievers' },
      ],
      fun_fact: 'It’s called the SOUND plural because the original word stays "safe and sound" — nothing inside it changes.',
    }},
    { type: 'teach', content: {
      title: 'The feminine version: ات',
      explanation: 'For groups of women: drop the ة, add **ات**\n\nمُسْلِمَة → مُسْلِمَات (Muslim women)\nمُؤْمِنَة → مُؤْمِنَات (believing women)',
      arabic: 'مُؤْمِنَات',
      transliteration: 'mu’minaat',
      examples: [
        { ar: 'مُسْلِمَات', tr: 'muslimaat', en: 'Muslim women' },
        { ar: 'مُؤْمِنَات', tr: 'mu’minaat', en: 'believing women' },
        { ar: 'صَالِحَات', tr: 'saalihaat', en: 'righteous women / good deeds' },
      ],
      fun_fact: 'صَالِحَات can mean "righteous women" OR "good deeds" — context decides. الْبَاقِيَاتُ الصَّالِحَاتُ = "the lasting good deeds".',
    }},
    { type: 'mcq', content: {
      question: 'What is the plural of مُؤْمِن (a believer)?',
      options: [
        { text: 'مُؤْمِنُونَ', correct: true },
        { text: 'مُؤْمِنَانِ', correct: false },
        { text: 'مُؤْمِنَة', correct: false },
      ],
      explanation: 'Add ونَ for the masculine sound plural. (مُؤْمِنَانِ would be exactly two believers!)',
    }},
    { type: 'fill_blank', content: {
      sentence: 'مُسْلِمَة → مُسْلِمَ___ (Muslim women)',
      correct_answer: 'ات',
      options: ['ات', 'ونَ', 'انِ'],
      explanation: 'Feminine sound plural: drop ة, add ات → مُسْلِمَات.',
    }},
    { type: 'match', content: {
      instruction: 'Match singular to plural',
      pairs: [
        { left: 'مُسْلِم', right: 'مُسْلِمُونَ' },
        { left: 'مُؤْمِنَة', right: 'مُؤْمِنَات' },
        { left: 'صَالِح', right: 'صَالِحُونَ' },
        { left: 'مُسْلِمَة', right: 'مُسْلِمَات' },
      ],
    }},
    { type: 'classify', content: {
      instruction: 'Masculine plural or feminine plural?',
      categories: ['Masculine plural', 'Feminine plural'],
      items: [
        { text: 'مُؤْمِنُونَ', category: 'Masculine plural' },
        { text: 'صَالِحَات', category: 'Feminine plural' },
        { text: 'مُسْلِمُونَ', category: 'Masculine plural' },
        { text: 'مُؤْمِنَات', category: 'Feminine plural' },
      ],
      explanation: 'ونَ = masculine crowd, ات = feminine crowd.',
    }},
    { type: 'teach', content: {
      title: 'Hear it in the Quran',
      explanation: 'Surah Al-Mu’minun opens with a masculine sound plural:\n\n**قَدْ أَفْلَحَ الْمُؤْمِنُونَ**\n\n"Successful indeed are the believers."\n\n(Sometimes you’ll see the same word as مُؤْمِنِينَ with ينَ — same plural, different position in the sentence. That story comes in Stage 5!)',
      arabic: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ',
      transliteration: 'qad aflahal-mu’minoon',
      quran_ref: 'Al-Mu’minun 23:1',
    }},
    { type: 'arrange', content: {
      instruction: 'Rebuild the opening of Surah Al-Mu’minun',
      reference: '"Successful indeed are the believers"',
      tiles: ['قَدْ', 'أَفْلَحَ', 'الْمُؤْمِنُونَ'],
      correct_order: ['قَدْ', 'أَفْلَحَ', 'الْمُؤْمِنُونَ'],
      result_transliteration: 'qad aflahal-mu’minoon',
      explanation: 'You just assembled a real ayah — and you know exactly why الْمُؤْمِنُونَ ends in ونَ.',
    }},
    { type: 'mcq', content: {
      question: 'صَالِحَات is...',
      options: [
        { text: 'a feminine sound plural', correct: true },
        { text: 'a dual', correct: false },
        { text: 'a singular feminine word', correct: false },
      ],
      explanation: 'The ات ending marks the feminine sound plural.',
    }},
    { type: 'mcq', content: {
      question: 'Final check: which is a group of MEN (or mixed group)?',
      options: [
        { text: 'مُسْلِمُونَ', correct: true },
        { text: 'مُسْلِمَات', correct: false },
        { text: 'مُسْلِمَة', correct: false },
      ],
      explanation: 'ونَ = masculine plural. مُسْلِمَات = the women, مُسْلِمَة = one woman.',
    }},
    { type: 'teach', content: {
      title: 'Two plurals down...',
      explanation: '**ونَ** for the men, **ات** for the women — the word itself stays safe.\n\nBut Arabic has one more trick: plurals that **break** the word from the inside. That’s next!',
      arabic: null, transliteration: null,
    }},
  ],
};

const U3_L3 = { // Broken Plurals
  steps: [
    { type: 'teach', content: {
      title: 'Arabic loves to BREAK words',
      explanation: 'The third plural doesn’t add an ending — it **rearranges the inside** of the word:\n\nكِتَاب (book) → كُتُب (books)\n\nLike English *mouse → mice*, except Arabic does it constantly.',
      arabic: 'كِتَاب ← كُتُب',
      transliteration: 'kitaab → kutub',
      examples: [
        { ar: 'كُتُب', tr: 'kutub', en: 'books' },
        { ar: 'رُسُل', tr: 'rusul', en: 'messengers' },
        { ar: 'قُلُوب', tr: 'quloob', en: 'hearts' },
      ],
      fun_fact: 'There are 30+ broken-plural patterns. Even native speakers learn them word by word — you only need the Quran’s favorites.',
    }},
    { type: 'teach', content: {
      title: 'The Quran’s favorite broken plurals',
      explanation: 'These four appear hundreds of times:\n\nرَسُول → **رُسُل** (messengers)\nعَبْد → **عِبَاد** (servants)\nقَلْب → **قُلُوب** (hearts)\nيَوْم → **أَيَّام** (days)',
      arabic: null, transliteration: null,
      examples: [
        { ar: 'عِبَاد', tr: '‘ibaad', en: 'servants' },
        { ar: 'أَيَّام', tr: 'ayyaam', en: 'days' },
        { ar: 'قُلُوب', tr: 'quloob', en: 'hearts' },
      ],
      fun_fact: 'عِبَادُ الرَّحْمَٰنِ "the servants of the Most Merciful" (Al-Furqan 25:63) uses one — describing the humble believers.',
    }},
    { type: 'match', content: {
      instruction: 'Match each singular to its broken plural',
      pairs: [
        { left: 'كِتَاب', right: 'كُتُب' },
        { left: 'رَسُول', right: 'رُسُل' },
        { left: 'قَلْب', right: 'قُلُوب' },
        { left: 'يَوْم', right: 'أَيَّام' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'عِبَاد is the plural of...',
      options: [
        { text: 'عَبْد (servant)', correct: true },
        { text: 'عَيْن (spring)', correct: false },
        { text: 'أَبَد (forever)', correct: false },
      ],
      explanation: 'عَبْد → عِبَاد. The word broke and rearranged — no ending added.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'فِي قُلُوبِهِم مَّرَضٌ (Al-Baqarah 2:10) — "in their ___ is a disease"',
      correct_answer: 'hearts',
      options: ['hearts', 'books', 'days'],
      explanation: 'قُلُوب = hearts (broken plural of قَلْب). You just read Al-Baqarah!',
    }},
    { type: 'classify', content: {
      instruction: 'Sound plural or broken plural?',
      categories: ['Sound plural', 'Broken plural'],
      items: [
        { text: 'مُسْلِمُونَ', category: 'Sound plural' },
        { text: 'كُتُب', category: 'Broken plural' },
        { text: 'مُؤْمِنَات', category: 'Sound plural' },
        { text: 'رُسُل', category: 'Broken plural' },
        { text: 'قُلُوب', category: 'Broken plural' },
        { text: 'صَالِحُونَ', category: 'Sound plural' },
      ],
      explanation: 'Sound plurals keep the word + add ونَ/ات. Broken plurals reshape the word itself.',
    }},
    { type: 'mcq', content: {
      question: 'أَيَّام means...',
      options: [
        { text: 'days', correct: true },
        { text: 'mothers', correct: false },
        { text: 'signs', correct: false },
      ],
      explanation: 'يَوْم (day) → أَيَّام (days), as in أَيَّامًا مَّعْدُودَاتٍ "a limited number of days" (Al-Baqarah 2:184).',
    }},
    { type: 'mcq', content: {
      question: 'تِلْكَ الرُّسُلُ (Al-Baqarah 2:253) — "Those ___..."',
      options: [
        { text: 'messengers', correct: true },
        { text: 'books', correct: false },
        { text: 'hearts', correct: false },
      ],
      explanation: 'رُسُل = messengers, broken plural of رَسُول.',
    }},
    { type: 'teach', content: {
      title: 'All three plurals — unlocked',
      explanation: '**ونَ** the men’s crowd · **ات** the women’s crowd · **broken** the reshaped word.\n\nOne lesson left in Stage 1: the graduation — real ayat with **everything** you’ve learned.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U3_L4 = { // Read the Quran: How Many?
  steps: [
    { type: 'teach', content: {
      title: 'The graduation ayah 🎓',
      explanation: 'Surah Al-Ahzab 35 — the ayah of the pairs:\n\n**إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ...**\n\n"Indeed the Muslim men and Muslim women, the believing men and believing women..."\n\nYou can now parse the **type, gender, AND number** of every word in it.',
      arabic: 'إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ',
      transliteration: 'innal-muslimeena wal-muslimaat',
      quran_ref: 'Al-Ahzab 33:35',
    }},
    { type: 'mcq', content: {
      question: 'الْمُسْلِمَاتِ is...',
      options: [
        { text: 'feminine plural — the Muslim women', correct: true },
        { text: 'masculine plural — the Muslim men', correct: false },
        { text: 'dual — two Muslims', correct: false },
      ],
      explanation: 'The ات ending = feminine sound plural.',
    }},
    { type: 'mcq', content: {
      question: 'الْمُؤْمِنِينَ is...',
      options: [
        { text: 'masculine plural — ينَ is the other face of ونَ', correct: true },
        { text: 'a dual', correct: false },
        { text: 'a broken plural', correct: false },
      ],
      explanation: 'مُؤْمِنُونَ and مُؤْمِنِينَ are the SAME masculine plural — the ending shifts with sentence position (Stage 5 tells that story).',
    }},
    { type: 'classify', content: {
      instruction: 'Parse these Quranic words by number',
      categories: ['Singular', 'Dual', 'Plural'],
      items: [
        { text: 'جَنَّتَانِ (Ar-Rahman)', category: 'Dual' },
        { text: 'قُلُوب', category: 'Plural' },
        { text: 'كِتَاب', category: 'Singular' },
        { text: 'عَيْنَانِ (Ar-Rahman)', category: 'Dual' },
        { text: 'عِبَاد', category: 'Plural' },
        { text: 'يَوْم', category: 'Singular' },
      ],
      explanation: 'انِ = dual. قُلُوب and عِبَاد are broken plurals.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'وَلِمَنْ خَافَ مَقَامَ رَبِّهِ ___ — "And for whoever fears standing before his Lord are TWO GARDENS" (Ar-Rahman 55:46)',
      correct_answer: 'جَنَّتَانِ',
      options: ['جَنَّتَانِ', 'جَنَّات', 'جَنَّة'],
      explanation: 'Two gardens = the dual جَنَّتَانِ. جَنَّات would be 3+, جَنَّة just one.',
    }},
    { type: 'translate', content: {
      instruction: 'Translate into Arabic',
      sentence: 'two gardens and two springs',
      tiles: ['جَنَّتَانِ', 'وَ', 'عَيْنَانِ'],
      correct_order: ['جَنَّتَانِ', 'وَ', 'عَيْنَانِ'],
      explanation: 'Straight out of Surah Ar-Rahman — the surah of duals.',
    }},
    { type: 'mcq', content: {
      question: 'عِبَادُ الرَّحْمَٰنِ "the servants of the Most Merciful" (Al-Furqan 25:63) — عِبَاد is a...',
      options: [
        { text: 'broken plural of عَبْد', correct: true },
        { text: 'sound plural of عَبْد', correct: false },
        { text: 'dual of عَبْد', correct: false },
      ],
      explanation: 'عَبْد reshaped into عِبَاد — no ونَ/ات ending, so it’s broken.',
    }},
    { type: 'mcq', content: {
      question: 'Last question of Stage 1! In الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ, the word الْعَالَمِينَ ("the worlds") ends in ينَ. It is...',
      options: [
        { text: 'a plural', correct: true },
        { text: 'a dual', correct: false },
        { text: 'a singular', correct: false },
      ],
      explanation: 'ينَ marks a masculine plural — "all the worlds". You’ve been reciting plurals in Al-Fatiha your whole life!',
    }},
    { type: 'teach', content: {
      title: '🏆 STAGE 1 COMPLETE!',
      explanation: 'You can now take ANY Quranic word and classify its **type** (ism/fi’l/harf), **gender** (he/she), and **number** (one/two/many).\n\nThat’s the exact foundation every classical student of the Quran starts with.\n\n**Next stage: THE Book** — the mighty ال, pronouns like رَبِّي (MY Lord), and how two words snap together to mean "the Messenger of Allah".',
      arabic: null, transliteration: null,
    }},
  ],
};

// ─────────────────────────────────────────────────────────────
// Vocabulary bank rows
// ─────────────────────────────────────────────────────────────

const U2_VOCAB = [
  ['بَيْت', 'bayt', 'house', 'ism', 'masculine', 'singular', null, 1],
  ['بَاب', 'baab', 'door', 'ism', 'masculine', 'singular', null, 1],
  ['قَمَر', 'qamar', 'moon', 'ism', 'masculine', 'singular', 'Al-Qamar 54:1', 1],
  ['نُور', 'noor', 'light', 'ism', 'masculine', 'singular', 'An-Nur 24:35', 1],
  ['جَنَّة', 'jannah', 'garden / paradise', 'ism', 'feminine', 'singular', 'Aal Imran 3:133', 1],
  ['رَحْمَة', 'rahmah', 'mercy', 'ism', 'feminine', 'singular', 'Al-A’raf 7:156', 1],
  ['صَلَاة', 'salaah', 'prayer', 'ism', 'feminine', 'singular', 'Al-Baqarah 2:3', 1],
  ['مَدِينَة', 'madeenah', 'city', 'ism', 'feminine', 'singular', 'Ya-Sin 36:20', 1],
  ['شَمْس', 'shams', 'sun', 'ism', 'feminine', 'singular', 'Ash-Shams 91:1', 2],
  ['أَرْض', 'ard', 'earth', 'ism', 'feminine', 'singular', 'Al-Baqarah 2:22', 2],
  ['نَار', 'naar', 'fire', 'ism', 'feminine', 'singular', 'Al-Baqarah 2:24', 2],
  ['نَفْس', 'nafs', 'soul / self', 'ism', 'feminine', 'singular', 'Al-Fajr 89:27', 2],
  ['يَد', 'yad', 'hand', 'ism', 'feminine', 'singular', 'Al-Fath 48:10', 2],
  ['رِيح', 'reeh', 'wind', 'ism', 'feminine', 'singular', 'Adh-Dhariyat 51:41', 2],
  ['مُسْلِم', 'muslim', 'Muslim man', 'ism', 'masculine', 'singular', 'Al-Ahzab 33:35', 1],
  ['مُسْلِمَة', 'muslimah', 'Muslim woman', 'ism', 'feminine', 'singular', 'Al-Ahzab 33:35', 1],
  ['مُؤْمِن', 'mu’min', 'believing man', 'ism', 'masculine', 'singular', 'Al-Ahzab 33:35', 1],
  ['مُؤْمِنَة', 'mu’minah', 'believing woman', 'ism', 'feminine', 'singular', 'Al-Ahzab 33:35', 1],
  ['صَالِح', 'saalih', 'righteous man', 'ism', 'masculine', 'singular', 'Al-Anbiya 21:75', 1],
  ['صَالِحَة', 'saalihah', 'righteous woman', 'ism', 'feminine', 'singular', 'An-Nisa 4:34', 1],
];

const U3_VOCAB = [
  ['رَجُل', 'rajul', 'man', 'ism', 'masculine', 'singular', 'Ya-Sin 36:20', 1],
  ['رَجُلَانِ', 'rajulaan', 'two men', 'ism', 'masculine', 'dual', 'Al-Ma’idah 5:23', 2],
  ['كِتَابَانِ', 'kitaabaan', 'two books', 'ism', 'masculine', 'dual', null, 2],
  ['جَنَّتَانِ', 'jannataan', 'two gardens', 'ism', 'feminine', 'dual', 'Ar-Rahman 55:46', 2],
  ['عَيْنَانِ', '‘aynaan', 'two springs', 'ism', 'feminine', 'dual', 'Ar-Rahman 55:50', 2],
  ['مُسْلِمُونَ', 'muslimoon', 'Muslims (m. pl.)', 'ism', 'masculine', 'plural', 'Al-Ahzab 33:35', 1],
  ['مُسْلِمَات', 'muslimaat', 'Muslim women', 'ism', 'feminine', 'plural', 'Al-Ahzab 33:35', 1],
  ['مُؤْمِنُونَ', 'mu’minoon', 'believers (m. pl.)', 'ism', 'masculine', 'plural', 'Al-Mu’minun 23:1', 1],
  ['مُؤْمِنَات', 'mu’minaat', 'believing women', 'ism', 'feminine', 'plural', 'Al-Ahzab 33:35', 1],
  ['صَالِحَات', 'saalihaat', 'righteous women / good deeds', 'ism', 'feminine', 'plural', 'Al-Kahf 18:46', 2],
  ['كُتُب', 'kutub', 'books', 'ism', 'masculine', 'plural', 'Al-Bayyinah 98:3', 2],
  ['رَسُول', 'rasool', 'messenger', 'ism', 'masculine', 'singular', 'Aal Imran 3:144', 1],
  ['رُسُل', 'rusul', 'messengers', 'ism', 'masculine', 'plural', 'Al-Baqarah 2:253', 2],
  ['عَبْد', '‘abd', 'servant', 'ism', 'masculine', 'singular', 'Al-Alaq 96:10', 1],
  ['عِبَاد', '‘ibaad', 'servants', 'ism', 'masculine', 'plural', 'Al-Furqan 25:63', 2],
  ['قَلْب', 'qalb', 'heart', 'ism', 'masculine', 'singular', 'Ash-Shu’ara 26:89', 1],
  ['قُلُوب', 'quloob', 'hearts', 'ism', 'masculine', 'plural', 'Al-Baqarah 2:10', 2],
  ['يَوْم', 'yawm', 'day', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:4', 1],
  ['أَيَّام', 'ayyaam', 'days', 'ism', 'masculine', 'plural', 'Al-Baqarah 2:184', 2],
];

// ─────────────────────────────────────────────────────────────
// Seeding
// ─────────────────────────────────────────────────────────────

async function main() {
  const units = await sql`SELECT id, title, sort_order FROM learning_units ORDER BY sort_order`;
  const unit2 = units.find((u) => u.sort_order === 2);
  const unit3 = units.find((u) => u.sort_order === 3);
  if (!unit2 || !unit3) throw new Error('Units 2/3 not found — expected existing shells');
  console.log(`Unit 2: ${unit2.title} (${unit2.id})`);
  console.log(`Unit 3: ${unit3.title} (${unit3.id})`);

  const lessons = [
    [unit2.id, 'gender-basics', 'Every Word Picks a Side', 1, U2_L1, 15],
    [unit2.id, 'hidden-feminines', 'The Hidden Feminines', 2, U2_L2, 15],
    [unit2.id, 'gender-pairs', 'Gender Pairs', 3, U2_L3, 15],
    [unit2.id, 'read-quran-gender', 'Read the Quran: Gender', 4, U2_L4, 20],
    [unit3.id, 'one-two-many', 'One, Two, Many', 1, U3_L1, 15],
    [unit3.id, 'sound-plurals', 'Sound Plurals', 2, U3_L2, 15],
    [unit3.id, 'broken-plurals', 'Broken Plurals', 3, U3_L3, 15],
    [unit3.id, 'read-quran-number', 'Read the Quran: How Many?', 4, U3_L4, 20],
  ];

  for (const [unitId, slug, title, sortOrder, content, xp] of lessons) {
    const stepCount = content.steps.length;
    await sql`
      INSERT INTO learning_lessons (unit_id, slug, title, sort_order, lesson_type, content, xp_reward)
      VALUES (${unitId}, ${slug}, ${title}, ${sortOrder}, 'standard', ${sql.json(content)}, ${xp})
      ON CONFLICT (unit_id, slug)
      DO UPDATE SET title = EXCLUDED.title, sort_order = EXCLUDED.sort_order,
                    content = EXCLUDED.content, xp_reward = EXCLUDED.xp_reward`;
    console.log(`  ✓ ${title} (${stepCount} steps, ${xp} XP)`);
  }

  // Vocabulary: wipe + re-insert per unit (no unique key on the table)
  for (const [unitId, vocab] of [[unit2.id, U2_VOCAB], [unit3.id, U3_VOCAB]]) {
    await sql`DELETE FROM vocabulary_bank WHERE unit_id = ${unitId}`;
    for (const [ar, tr, en, type, gender, number, ref, diff] of vocab) {
      await sql`
        INSERT INTO vocabulary_bank (word_ar, transliteration, english, word_type, gender, number, unit_id, quranic_ref, difficulty)
        VALUES (${ar}, ${tr}, ${en}, ${type}, ${gender}, ${number}, ${unitId}, ${ref}, ${diff})`;
    }
    console.log(`  ✓ ${vocab.length} vocab words for unit ${unitId.slice(0, 8)}…`);
  }

  // Backfill: users who completed ALL Unit-1 lessons but have no progress row
  // for Unit 2 Lesson 1 (they finished before these lessons existed).
  const [firstU2Lesson] = await sql`
    SELECT id FROM learning_lessons WHERE unit_id = ${unit2.id} ORDER BY sort_order LIMIT 1`;
  const unlocked = await sql`
    WITH unit1 AS (
      SELECT l.id FROM learning_lessons l
      JOIN learning_units u ON u.id = l.unit_id
      WHERE u.sort_order = 1
    ),
    finishers AS (
      SELECT p.user_id
      FROM user_lesson_progress p
      JOIN unit1 ON unit1.id = p.lesson_id
      WHERE p.status = 'completed'
      GROUP BY p.user_id
      HAVING count(*) = (SELECT count(*) FROM unit1)
    )
    INSERT INTO user_lesson_progress (user_id, lesson_id, status)
    SELECT f.user_id, ${firstU2Lesson.id}, 'available' FROM finishers f
    ON CONFLICT (user_id, lesson_id) DO NOTHING
    RETURNING user_id`;
  console.log(`  ✓ Unlocked Unit 2 Lesson 1 for ${unlocked.length} users who had finished Unit 1`);

  // Sanity check
  const check = await sql`
    SELECT u.title AS unit, count(l.id)::int AS lessons
    FROM learning_units u LEFT JOIN learning_lessons l ON l.unit_id = u.id
    GROUP BY u.title, u.sort_order ORDER BY u.sort_order`;
  console.log('\nFinal state:');
  for (const c of check) console.log(`  ${c.unit}: ${c.lessons} lessons`);
}

main()
  .then(() => sql.end())
  .catch(async (e) => {
    console.error('SEED FAILED:', e.message);
    await sql.end();
    process.exit(1);
  });
