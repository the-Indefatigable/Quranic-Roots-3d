/**
 * Seeds PART B (Mastery), first block — I'RAB: THE CASE SYSTEM — Units 20–24.
 * (Master-plan "Stage 7" in docs/CURRICULUM_MASTER.md. Part A's original
 * "Stage 6" was folded into the Unit-19 capstone, so unit sort_order simply
 * continues 20→24 with no gap on the path.)
 *
 *   20 The Four States (al-i'rab: raf'/nasb/jarr/jazm; signs; mabni vs mu'rab)
 *   21 The Nominative Crew (al-marfu'at: mubtada, khabar, fa'il)
 *   22 The Accusative Crew (al-mansubat: maf'ul bihi, object pronouns, ism inna)
 *   23 The Genitive Crew (al-majrurat: jarr by preposition & by idafa; followers)
 *   24 The Special Signs (five nouns, dual/sound plurals, diptotes) — checkpoint_after
 *
 * Uses only the shipped step engine (classify = interactive case-tagging).
 * Same idempotent mechanics as seed-stage-2..5.mjs. Backfills Unit-20 L1 unlock
 * for finishers of Unit 19. Run: DATABASE_URL=... node scripts/seed-stage-7-irab.mjs
 */
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

// ═══════════════════════════════════════════════════════════════
// UNIT 20 — The Four States (al-i'rab)
// ═══════════════════════════════════════════════════════════════

const U20_L1 = { // Words wear endings
  steps: [
    { type: 'teach', content: {
      title: 'Welcome to the Mastery Track 🏔️',
      explanation: 'In Part A you learned to *recognise* words. Now you learn to *parse* them — to explain **why** each word ends the way it does. This skill is called **i‘rāb**, and it is what separates a reader from a scholar.',
      arabic: 'الإِعْرَاب',
      transliteration: 'al-i‘raab',
      examples: [
        { ar: 'اللّٰهُ', tr: 'allaahu', en: 'Allah (ends in ḍamma)' },
        { ar: 'اللّٰهَ', tr: 'allaaha', en: 'Allah (ends in fatḥa)' },
        { ar: 'اللّٰهِ', tr: 'allaahi', en: 'Allah (ends in kasra)' },
      ],
      fun_fact: 'The same word اللّٰه can end three different ways — the ending shows its JOB in the sentence, not a change in meaning.',
    }},
    { type: 'teach', content: {
      title: 'A word’s ending = its job',
      explanation: 'Most Arabic words shift their final vowel to signal their role. There are **four states** (حَالَات):\n\n**raf‘** (رَفْع) — the ḍamma state ( ُ )\n**naṣb** (نَصْب) — the fatḥa state ( َ )\n**jarr** (جَرّ) — the kasra state ( ِ )\n**jazm** (جَزْم) — the sukūn state ( ْ ), for verbs only',
      arabic: 'رَفْع · نَصْب · جَرّ · جَزْم',
      transliteration: 'raf‘ · naṣb · jarr · jazm',
      examples: [
        { ar: 'ـُ raf‘', tr: 'ḍamma', en: 'e.g. subjects & doers' },
        { ar: 'ـَ naṣb', tr: 'fatḥa', en: 'e.g. objects' },
        { ar: 'ـِ jarr', tr: 'kasra', en: 'e.g. after prepositions' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'What does a word’s final vowel (ending) tell you?',
      options: [
        { text: 'Its grammatical job in the sentence', correct: true },
        { text: 'Whether it is masculine or feminine', correct: false },
        { text: 'How to spell its root', correct: false },
      ],
      explanation: 'The ending marks the word’s ROLE — subject, object, after a preposition, etc.',
    }},
    { type: 'match', content: {
      instruction: 'Match each state to its sign',
      pairs: [
        { left: 'raf‘', right: 'ḍamma ( ُ )' },
        { left: 'naṣb', right: 'fatḥa ( َ )' },
        { left: 'jarr', right: 'kasra ( ِ )' },
        { left: 'jazm', right: 'sukūn ( ْ )' },
      ],
    }},
    { type: 'classify', content: {
      instruction: 'Which state is each ending of اللّٰه?',
      categories: ['raf‘ (ḍamma)', 'naṣb (fatḥa)', 'jarr (kasra)'],
      items: [
        { text: 'اللّٰهُ', category: 'raf‘ (ḍamma)' },
        { text: 'اللّٰهَ', category: 'naṣb (fatḥa)' },
        { text: 'اللّٰهِ', category: 'jarr (kasra)' },
      ],
      explanation: 'ـُ raf‘ · ـَ naṣb · ـِ jarr. One word, three jobs.',
    }},
    { type: 'teach', content: {
      title: 'The four states — met',
      explanation: 'raf‘, naṣb, jarr, jazm. Learn who takes which and you can parse anything. Next: the exact signs, including the indefinite (tanwīn) versions.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U20_L2 = { // The default signs
  steps: [
    { type: 'teach', content: {
      title: 'The default signs',
      explanation: 'For a normal singular noun, the signs are simple:\n\nraf‘ → ḍamma **ـُ** (or tanwīn **ـٌ**)\nnaṣb → fatḥa **ـَ** (or tanwīn **ـً**)\njarr → kasra **ـِ** (or tanwīn **ـٍ**)',
      arabic: 'ـٌ ـً ـٍ',
      transliteration: 'un · an · in',
      examples: [
        { ar: 'كِتَابٌ', tr: 'kitaabun', en: 'a book (raf‘)' },
        { ar: 'كِتَابًا', tr: 'kitaaban', en: 'a book (naṣb)' },
        { ar: 'كِتَابٍ', tr: 'kitaabin', en: 'a book (jarr)' },
      ],
      fun_fact: 'Definite words (with ال) take single vowels ( ـُ ـَ ـِ ); indefinite words double them into tanwīn ( ـٌ ـً ـٍ ).',
    }},
    { type: 'mcq', content: {
      question: 'كِتَابًا (kitaaban) is in which state?',
      options: [
        { text: 'naṣb (the fatḥa/tanwīn-an state)', correct: true },
        { text: 'raf‘', correct: false },
        { text: 'jarr', correct: false },
      ],
      explanation: 'The ً (an) is the indefinite naṣb sign. كِتَابًا = "a book" as an object.',
    }},
    { type: 'classify', content: {
      instruction: 'Sort by state (definite AND indefinite forms)',
      categories: ['raf‘ (-u / -un)', 'naṣb (-a / -an)', 'jarr (-i / -in)'],
      items: [
        { text: 'الْبَيْتُ', category: 'raf‘ (-u / -un)' },
        { text: 'بَيْتًا', category: 'naṣb (-a / -an)' },
        { text: 'الْبَيْتِ', category: 'jarr (-i / -in)' },
        { text: 'هُدًى', category: 'naṣb (-a / -an)' },
        { text: 'كِتَابٌ', category: 'raf‘ (-u / -un)' },
        { text: 'رَجُلٍ', category: 'jarr (-i / -in)' },
      ],
      explanation: 'ـُ/ـٌ = raf‘ · ـَ/ـً = naṣb · ـِ/ـٍ = jarr. (هُدًى carries the fatḥa-tanwīn.)',
    }},
    { type: 'fill_blank', content: {
      sentence: 'A definite word uses single vowels; an indefinite word doubles them into ___.',
      correct_answer: 'tanwīn',
      options: ['tanwīn', 'a shadda', 'a sukūn'],
      explanation: 'Tanwīn ( ـٌ ـً ـٍ ) is the indefinite version of the three case signs.',
    }},
    { type: 'mcq', content: {
      question: 'الْكِتَابُ ("the book") ends in a plain ḍamma. It is...',
      options: [
        { text: 'definite and in raf‘', correct: true },
        { text: 'indefinite and in naṣb', correct: false },
      ],
      explanation: 'ال (definite) + ـُ (raf‘). No tanwīn because it is definite.',
    }},
    { type: 'teach', content: {
      title: 'You can read the signs',
      explanation: 'Single vowels for definite, tanwīn for indefinite — same three states. Next: some words never change at all.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U20_L3 = { // Mabni vs mu'rab
  steps: [
    { type: 'teach', content: {
      title: 'Fixed words vs flexible words',
      explanation: 'Not every word changes its ending. Two families:\n\n**Mu‘rab** (مُعْرَب) = *flexible* — the ending shifts with the job (most isms, the present verb).\n**Mabnī** (مَبْنِيّ) = *fixed* — the ending never changes, whatever the job.',
      arabic: 'مُعْرَب · مَبْنِيّ',
      transliteration: 'mu‘rab · mabniyy',
      examples: [
        { ar: 'كِتَاب (mu‘rab)', tr: 'kitaab', en: 'changes: -u / -a / -i' },
        { ar: 'هُوَ (mabnī)', tr: 'huwa', en: 'never changes' },
      ],
      fun_fact: 'You already know the fixed ones: pronouns (هُوَ، أَنْتَ), demonstratives (هَٰذَا)، most particles، and the PAST verb (قَالَ) are all mabnī.',
    }},
    { type: 'teach', content: {
      title: 'Who is fixed?',
      explanation: '**Mabnī (fixed):** pronouns، demonstratives (هَٰذَا، ذَٰلِكَ)، relative words (الَّذِي)، most ḥurūf، the past verb (فَعَلَ)، and the command verb (اُفْعُلْ).\n\n**Mu‘rab (flexible):** most nouns، and the present verb (يَفْعَلُ).',
      arabic: null, transliteration: null,
      examples: [
        { ar: 'قَالَ', tr: 'qaala', en: 'past verb — fixed (mabnī)' },
        { ar: 'يَقُولُ', tr: 'yaqoolu', en: 'present verb — flexible (mu‘rab)' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'Which word NEVER changes its ending (mabnī)?',
      options: [
        { text: 'هُوَ (he)', correct: true },
        { text: 'كِتَاب (book)', correct: false },
        { text: 'مُسْلِم (Muslim)', correct: false },
      ],
      explanation: 'Pronouns like هُوَ are mabnī — fixed. Nouns like كِتَاب are mu‘rab — they flex.',
    }},
    { type: 'classify', content: {
      instruction: 'Fixed (mabnī) or flexible (mu‘rab)?',
      categories: ['Mabnī (fixed)', 'Mu‘rab (flexible)'],
      items: [
        { text: 'هَٰذَا (this)', category: 'Mabnī (fixed)' },
        { text: 'كِتَاب (book)', category: 'Mu‘rab (flexible)' },
        { text: 'قَالَ (he said)', category: 'Mabnī (fixed)' },
        { text: 'يَقُولُ (he says)', category: 'Mu‘rab (flexible)' },
        { text: 'الَّذِي (who)', category: 'Mabnī (fixed)' },
        { text: 'مُؤْمِن (believer)', category: 'Mu‘rab (flexible)' },
      ],
      explanation: 'Pronouns, demonstratives, relatives, and the past verb are fixed; nouns and the present verb flex.',
    }},
    { type: 'mcq', content: {
      question: 'Why don’t we mark i‘rāb (raf‘/naṣb…) on هُوَ or قَالَ?',
      options: [
        { text: 'They are mabnī — their ending is fixed', correct: true },
        { text: 'They have no meaning', correct: false },
      ],
      explanation: 'We only track case changes on mu‘rab (flexible) words.',
    }},
    { type: 'teach', content: {
      title: 'Fixed vs flexible: clear',
      explanation: 'Track cases on the flexible words; leave the fixed ones alone. Next: the graduation — colour every ending in Al-Fatiha.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U20_L4 = { // Read the Quran: tag Al-Fatiha
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — parse Al-Fatiha’s endings',
      explanation: 'You know every word of Al-Fatiha. Now tag WHY each ends the way it does.\n\n**الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ** — الْحَمْدُ is raf‘ (ḍamma, the subject); لِلَّهِ, رَبِّ, الْعَالَمِينَ are all jarr (kasra).',
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: 'al-hamdu lillaahi rabbil-‘aalameen',
      quran_ref: 'Al-Fatiha 1:2',
    }},
    { type: 'mcq', content: {
      question: 'الْحَمْدُ ends in a ḍamma. Its state is...',
      options: [
        { text: 'raf‘ (it is the mubtada, the subject)', correct: true },
        { text: 'naṣb', correct: false },
        { text: 'jarr', correct: false },
      ],
      explanation: 'الْحَمْدُ is the subject of the sentence → raf‘ → ḍamma.',
    }},
    { type: 'classify', content: {
      instruction: 'Tag each word’s state in Al-Fatiha 1:2',
      categories: ['raf‘ (ḍamma)', 'jarr (kasra)'],
      items: [
        { text: 'الْحَمْدُ (the praise)', category: 'raf‘ (ḍamma)' },
        { text: 'لِلَّهِ (for Allah)', category: 'jarr (kasra)' },
        { text: 'رَبِّ (Lord)', category: 'jarr (kasra)' },
        { text: 'الْعَالَمِينَ (the worlds)', category: 'jarr (kasra)' },
      ],
      explanation: 'The subject الْحَمْدُ is raf‘; the rest are dragged into jarr by لِ and by iḍāfa.',
    }},
    { type: 'mcq', content: {
      question: 'إِيَّاكَ نَعْبُدُ — نَعْبُدُ ("we worship") ends in a ḍamma. Why?',
      options: [
        { text: 'It is a present verb in its default raf‘ state', correct: true },
        { text: 'It is a noun subject', correct: false },
      ],
      explanation: 'The present verb يَفْعَلُ/نَفْعَلُ is mu‘rab and its default state is raf‘ (ḍamma).',
    }},
    { type: 'classify', content: {
      instruction: 'Tag these Al-Fatiha words',
      categories: ['raf‘ (ḍamma)', 'naṣb (fatḥa)', 'jarr (kasra)'],
      items: [
        { text: 'نَعْبُدُ (we worship)', category: 'raf‘ (ḍamma)' },
        { text: 'الصِّرَاطَ (the path)', category: 'naṣb (fatḥa)' },
        { text: 'الْمُسْتَقِيمَ (the straight)', category: 'naṣb (fatḥa)' },
        { text: 'الدِّينِ (the Judgment)', category: 'jarr (kasra)' },
      ],
      explanation: 'الصِّرَاطَ is the object (naṣb) and its adjective الْمُسْتَقِيمَ follows it into naṣb; الدِّينِ is jarr by iḍāfa.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 20 complete!',
      explanation: 'You can now read the *grammar* of every ending in Al-Fatiha. Next: the **raf‘ crew** — everyone who wears the ḍamma, and why.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 21 — The Nominative Crew (al-marfu'at)
// ═══════════════════════════════════════════════════════════════

const U21_L1 = { // mubtada & khabar
  steps: [
    { type: 'teach', content: {
      title: 'The raf‘ crew: subjects',
      explanation: 'Several roles always take **raf‘** (ḍamma). The first two you met in Part A:\n\n**mubtada** (the subject of a nominal sentence)\n**khabar** (its predicate)\n\nBoth are marfū‘ — both wear the ḍamma.',
      arabic: 'اللّٰهُ رَبُّنَا',
      transliteration: 'allaahu rabbunaa',
      examples: [
        { ar: 'اللّٰهُ', tr: 'allaahu', en: 'mubtada — raf‘' },
        { ar: 'رَبُّنَا', tr: 'rabbunaa', en: 'khabar — raf‘' },
      ],
      fun_fact: 'اللّٰهُ رَبُّنَا — "Allah is our Lord". Both words end in ḍamma because both are marfū‘.',
    }},
    { type: 'mcq', content: {
      question: 'In اللّٰهُ أَكْبَرُ, why do BOTH words end in a ḍamma?',
      options: [
        { text: 'Both are marfū‘ (mubtada + khabar)', correct: true },
        { text: 'It just sounds nicer', correct: false },
        { text: 'They are objects', correct: false },
      ],
      explanation: 'اللّٰهُ (mubtada) and أَكْبَرُ (khabar) are both in raf‘ → both take ḍamma.',
    }},
    { type: 'classify', content: {
      instruction: 'Is the word raf‘ here, or not?',
      categories: ['raf‘ (marfū‘)', 'Not raf‘'],
      items: [
        { text: 'اللّٰهُ (in اللّٰهُ أَكْبَرُ)', category: 'raf‘ (marfū‘)' },
        { text: 'أَكْبَرُ (in اللّٰهُ أَكْبَرُ)', category: 'raf‘ (marfū‘)' },
        { text: 'اللّٰهِ (in بِسْمِ اللّٰهِ)', category: 'Not raf‘' },
        { text: 'الرَّحِيمَ (an object)', category: 'Not raf‘' },
      ],
      explanation: 'Mubtada and khabar are raf‘ (ḍamma); words after prepositions/objects are not.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'The subject and predicate of a nominal sentence are both in ___.',
      correct_answer: 'raf‘',
      options: ['raf‘', 'naṣb', 'jarr'],
      explanation: 'mubtada + khabar = both marfū‘ (raf‘, ḍamma).',
    }},
    { type: 'teach', content: {
      title: 'Subjects wear the ḍamma',
      explanation: 'mubtada and khabar → raf‘. Next: the doer of a verb joins the raf‘ crew.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U21_L2 = { // al-fa'il
  steps: [
    { type: 'teach', content: {
      title: 'The doer is marfū‘',
      explanation: 'The **fā‘il** (the doer of a verb) always takes **raf‘**:\n\nخَلَقَ **اللّٰهُ** — Allah did the creating → اللّٰهُ has a ḍamma.\n\nSo whenever you find "who did it?", expect a ḍamma.',
      arabic: 'خَلَقَ اللّٰهُ',
      transliteration: 'khalaqa-llaahu',
      examples: [
        { ar: 'قَالَ اللّٰهُ', tr: 'qaala-llaahu', en: 'Allah said (fā‘il, raf‘)' },
        { ar: 'جَاءَ الْحَقُّ', tr: 'jaa’al-haqqu', en: 'the truth came (fā‘il, raf‘)' },
      ],
      fun_fact: 'Even though the fā‘il comes AFTER the verb in Arabic, it is the doer — and it wears the raf‘ ḍamma.',
    }},
    { type: 'mcq', content: {
      question: 'In جَاءَ نَصْرُ اللّٰهِ ("the help of Allah came"), which word is the marfū‘ fā‘il?',
      options: [
        { text: 'نَصْرُ (help) — it did the coming', correct: true },
        { text: 'اللّٰهِ (Allah) — it is jarr here', correct: false },
        { text: 'جَاءَ (came)', correct: false },
      ],
      explanation: 'نَصْرُ (ḍamma) is the fā‘il; اللّٰهِ (kasra) is jarr by iḍāfa ("help OF Allah").',
    }},
    { type: 'classify', content: {
      instruction: 'Doer (fā‘il, raf‘) or object (maf‘ūl, naṣb)?',
      categories: ['fā‘il — raf‘ (ḍamma)', 'maf‘ūl — naṣb (fatḥa)'],
      items: [
        { text: 'اللّٰهُ (in خَلَقَ اللّٰهُ السَّمَاوَاتِ)', category: 'fā‘il — raf‘ (ḍamma)' },
        { text: 'الْأَرْضَ (in خَلَقَ اللّٰهُ الْأَرْضَ)', category: 'maf‘ūl — naṣb (fatḥa)' },
        { text: 'رَبُّكَ (in قَالَ رَبُّكَ)', category: 'fā‘il — raf‘ (ḍamma)' },
        { text: 'الْكِتَابَ (in أَنْزَلَ الْكِتَابَ)', category: 'maf‘ūl — naṣb (fatḥa)' },
      ],
      explanation: 'ḍamma → the doer; fatḥa → the receiver. The vowels reveal the roles.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'The fā‘il (doer) is always in the ___ state.',
      correct_answer: 'raf‘',
      options: ['raf‘', 'naṣb', 'jarr'],
      explanation: 'Doer = marfū‘ = ḍamma. Object = manṣūb = fatḥa.',
    }},
    { type: 'teach', content: {
      title: 'The doer joins the crew',
      explanation: 'mubtada, khabar, fā‘il — all raf‘. Next: recognising the raf‘ crew across a whole ayah.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U21_L3 = { // recognizing raf' in context
  steps: [
    { type: 'teach', content: {
      title: 'Spot the ḍamma crew',
      explanation: 'Three roles wear raf‘:\n\n① mubtada (subject)  ② khabar (predicate)  ③ fā‘il (doer)\n\nIn any sentence, these carry the ḍamma. Everything else is doing a different job.',
      arabic: 'الْمَرْفُوعَات',
      transliteration: 'al-marfoo‘aat (the raf‘ crew)',
      examples: [
        { ar: 'وَاللّٰهُ يَعْلَمُ', tr: 'wallaahu ya‘lam', en: 'and Allah knows (اللّٰهُ = mubtada, raf‘)' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'In وَاللّٰهُ يَعْلَمُ وَأَنْتُمْ لَا تَعْلَمُونَ, which word is a marfū‘ subject?',
      options: [
        { text: 'اللّٰهُ (ḍamma — the subject)', correct: true },
        { text: 'تَعْلَمُونَ', correct: false },
        { text: 'لَا', correct: false },
      ],
      explanation: 'اللّٰهُ (ḍamma) is the mubtada; يَعْلَمُ is its khabar (a verb sentence as predicate).',
    }},
    { type: 'classify', content: {
      instruction: 'Which words are in the raf‘ crew (ḍamma)?',
      categories: ['raf‘ (ḍamma)', 'Not raf‘'],
      items: [
        { text: 'الْحَقُّ (the truth, a subject)', category: 'raf‘ (ḍamma)' },
        { text: 'نَصْرُ (help, a doer)', category: 'raf‘ (ḍamma)' },
        { text: 'الْأَرْضَ (an object)', category: 'Not raf‘' },
        { text: 'الْبَيْتِ (after a preposition)', category: 'Not raf‘' },
      ],
      explanation: 'Subjects and doers = raf‘; objects and post-preposition nouns are not.',
    }},
    { type: 'mcq', content: {
      question: 'A word ends in a plain ḍamma. Which role is it most likely doing?',
      options: [
        { text: 'A subject or a doer (marfū‘)', correct: true },
        { text: 'An object (manṣūb)', correct: false },
        { text: 'After a preposition (majrūr)', correct: false },
      ],
      explanation: 'ḍamma points to the raf‘ crew: mubtada, khabar, or fā‘il.',
    }},
    { type: 'teach', content: {
      title: 'The raf‘ crew — recognised',
      explanation: 'ḍamma = subject / predicate / doer. Next: the crew that wears the fatḥa — the objects.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U21_L4 = { // Read the Quran: marfu' hunt
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — hunt the ḍamma',
      explanation: 'Across real ayat, find who wears raf‘. Each ḍamma marks a subject, predicate, or doer.',
      arabic: 'قُلْ هُوَ اللّٰهُ أَحَدٌ',
      transliteration: 'qul huwa-llaahu ahad',
      quran_ref: 'Al-Ikhlas 112:1',
    }},
    { type: 'classify', content: {
      instruction: 'Tag the state of each word',
      categories: ['raf‘ (ḍamma)', 'Not raf‘'],
      items: [
        { text: 'اللّٰهُ (in هُوَ اللّٰهُ أَحَدٌ)', category: 'raf‘ (ḍamma)' },
        { text: 'أَحَدٌ (in هُوَ اللّٰهُ أَحَدٌ)', category: 'raf‘ (ḍamma)' },
        { text: 'اللّٰهِ (in بِسْمِ اللّٰهِ)', category: 'Not raf‘' },
        { text: 'الصَّلَاةَ (they establish prayer)', category: 'Not raf‘' },
      ],
      explanation: 'اللّٰهُ and أَحَدٌ are marfū‘ (predicates of هُوَ); the others are jarr and naṣb.',
    }},
    { type: 'mcq', content: {
      question: 'اللّٰهُ الصَّمَدُ — both words are marfū‘ because...',
      options: [
        { text: 'they are mubtada + khabar', correct: true },
        { text: 'they follow a preposition', correct: false },
      ],
      explanation: 'اللّٰهُ (mubtada) + الصَّمَدُ (khabar) → both raf‘, both ḍamma.',
    }},
    { type: 'classify', content: {
      instruction: 'Marfū‘ or not? (mixed ayat)',
      categories: ['raf‘', 'Not raf‘'],
      items: [
        { text: 'نَصْرُ اللّٰهِ (the help… came)', category: 'raf‘' },
        { text: 'رَبُّكَ (…your Lord said)', category: 'raf‘' },
        { text: 'يَوْمِ الدِّينِ', category: 'Not raf‘' },
        { text: 'السَّمَاوَاتِ (…created the heavens)', category: 'Not raf‘' },
      ],
      explanation: 'Doers/subjects (نَصْرُ، رَبُّكَ) = raf‘; jarr and objects are not.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 21 complete!',
      explanation: 'You spot the ḍamma crew — subjects, predicates, doers — in real revelation. Next: the fatḥa crew, the **objects**.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 22 — The Accusative Crew (al-mansubat)
// ═══════════════════════════════════════════════════════════════

const U22_L1 = { // maf'ul bihi is mansub
  steps: [
    { type: 'teach', content: {
      title: 'The fatḥa crew: objects',
      explanation: 'The **maf‘ūl bihi** (the object — what the verb was done to) takes **naṣb** (fatḥa):\n\nخَلَقَ اللّٰهُ **الْأَرْضَ** — "the earth" received the creating → fatḥa.',
      arabic: 'خَلَقَ اللّٰهُ الْأَرْضَ',
      transliteration: 'khalaqa-llaahul-ard',
      examples: [
        { ar: 'أَنْزَلَ الْكِتَابَ', tr: 'anzalal-kitaab', en: 'He sent down the Book (naṣb)' },
        { ar: 'يُقِيمُونَ الصَّلَاةَ', tr: 'yuqeemoonas-salaah', en: 'they establish prayer (naṣb)' },
      ],
      fun_fact: 'Doer = ḍamma (raf‘). Object = fatḥa (naṣb). Two vowels tell the whole story of who did what.',
    }},
    { type: 'mcq', content: {
      question: 'الصَّلَاةَ in يُقِيمُونَ الصَّلَاةَ ends in a fatḥa. It is...',
      options: [
        { text: 'the maf‘ūl (object) — manṣūb', correct: true },
        { text: 'the fā‘il (doer) — marfū‘', correct: false },
        { text: 'jarr after a preposition', correct: false },
      ],
      explanation: 'The prayer is what they establish → object → naṣb → fatḥa.',
    }},
    { type: 'classify', content: {
      instruction: 'Doer (raf‘) or object (naṣb)?',
      categories: ['fā‘il — raf‘', 'maf‘ūl — naṣb'],
      items: [
        { text: 'اللّٰهُ (created…)', category: 'fā‘il — raf‘' },
        { text: 'السَّمَاوَاتِ (…the heavens)', category: 'maf‘ūl — naṣb' },
        { text: 'الْكِتَابَ (…the Book)', category: 'maf‘ūl — naṣb' },
        { text: 'رَبُّكَ (…said)', category: 'fā‘il — raf‘' },
      ],
      explanation: 'ḍamma → doer; fatḥa → object.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'The maf‘ūl bihi (object) is always in the ___ state (fatḥa).',
      correct_answer: 'naṣb',
      options: ['naṣb', 'raf‘', 'jarr'],
      explanation: 'Object = manṣūb = fatḥa.',
    }},
    { type: 'teach', content: {
      title: 'Objects wear the fatḥa',
      explanation: 'maf‘ūl bihi → naṣb. Next: when the object is a pronoun stuck to the verb.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U22_L2 = { // object pronouns
  steps: [
    { type: 'teach', content: {
      title: 'Objects that ride the verb',
      explanation: 'An attached pronoun on a verb is a maf‘ūl (object) — in the naṣb position, even though pronouns are mabnī (fixed) so you don’t see a fatḥa:\n\nخَلَقَ**هُ** = "He created **him**"\nهَدَا**نَا** = "He guided **us**"',
      arabic: 'خَلَقَهُ · هَدَانَا',
      transliteration: 'khalaqahu · hadaanaa',
      examples: [
        { ar: 'أَنْزَلْنَاهُ', tr: 'anzalnaahu', en: 'We sent it down (هُ = object)' },
        { ar: 'يَرْزُقُهُمْ', tr: 'yarzuquhum', en: 'He provides for them' },
      ],
      fun_fact: 'The attached pronoun is fixed (mabnī), so it sits "in the place of naṣb" — grammarians say fī maḥall naṣb.',
    }},
    { type: 'mcq', content: {
      question: 'In أَنْزَلْنَاهُ, the هُ ("it") is playing the role of...',
      options: [
        { text: 'the object (maf‘ūl)', correct: true },
        { text: 'the doer (fā‘il)', correct: false },
        { text: 'a preposition', correct: false },
      ],
      explanation: 'أَنْزَلْنَا (We sent down) + هُ (it) — the pronoun is the object.',
    }},
    { type: 'classify', content: {
      instruction: 'Is the attached pronoun a DOER-ending or an OBJECT?',
      categories: ['Object (maf‘ūl)', 'Doer-ending (part of the verb)'],
      items: [
        { text: 'ـهُ in خَلَقَهُ (created him)', category: 'Object (maf‘ūl)' },
        { text: 'ـنَا in خَلَقْنَا (we created)', category: 'Doer-ending (part of the verb)' },
        { text: 'ـهُمْ in يَرْزُقُهُمْ (provides for them)', category: 'Object (maf‘ūl)' },
        { text: 'ـتُ in خَلَقْتُ (I created)', category: 'Doer-ending (part of the verb)' },
      ],
      explanation: 'ـنَا/ـتُ built into the verb = the doer; ـهُ/ـهُمْ hanging on the end = the object.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'إِيَّاكَ نَعْبُدُ — the إِيَّاكَ is a fronted ___ ("You alone we worship").',
      correct_answer: 'object',
      options: ['object', 'subject', 'preposition'],
      explanation: 'إِيَّاكَ is the object of نَعْبُدُ, pulled to the front for emphasis — a naṣb role.',
    }},
    { type: 'teach', content: {
      title: 'Pronoun objects: clear',
      explanation: 'Attached ـهُ/ـهُمْ = the object. Next: the OTHER big source of naṣb — the word إِنَّ.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U22_L3 = { // ism inna is mansub
  steps: [
    { type: 'teach', content: {
      title: 'إِنَّ makes its subject naṣb',
      explanation: 'You saw this in Part A — now name it. **إِنَّ** puts its subject (called *ism inna*) into **naṣb** (fatḥa), while the predicate (*khabar inna*) stays raf‘:\n\nإِنَّ **اللّٰهَ** (naṣb) غَفُورٌ (raf‘).',
      arabic: 'إِنَّ اللّٰهَ غَفُورٌ',
      transliteration: 'innallaaha ghafoorun',
      examples: [
        { ar: 'إِنَّ اللّٰهَ عَلِيمٌ', tr: 'innallaaha ‘aleem', en: 'ism inna = اللّٰهَ (naṣb)' },
        { ar: 'إِنَّ الْإِنْسَانَ', tr: 'innal-insaan', en: 'the human (naṣb after inna)' },
      ],
      fun_fact: 'إِنَّ is the head of a whole family — "inna & her sisters" (أَنَّ، كَأَنَّ، لَٰكِنَّ، لَيْتَ، لَعَلَّ) — the next block of the mastery track.',
    }},
    { type: 'mcq', content: {
      question: 'Why is it إِنَّ اللّٰهَ (fatḥa), not إِنَّ اللّٰهُ (ḍamma)?',
      options: [
        { text: 'إِنَّ puts its subject into naṣb (fatḥa)', correct: true },
        { text: 'Allah’s name always takes fatḥa', correct: false },
        { text: 'It is a misprint', correct: false },
      ],
      explanation: 'The ism of إِنَّ is manṣūb → fatḥa. The khabar stays marfū‘.',
    }},
    { type: 'classify', content: {
      instruction: 'After إِنَّ: subject (naṣb) or predicate (raf‘)?',
      categories: ['ism inna — naṣb (fatḥa)', 'khabar inna — raf‘ (ḍamma)'],
      items: [
        { text: 'اللّٰهَ (in إِنَّ اللّٰهَ غَفُورٌ)', category: 'ism inna — naṣb (fatḥa)' },
        { text: 'غَفُورٌ (in إِنَّ اللّٰهَ غَفُورٌ)', category: 'khabar inna — raf‘ (ḍamma)' },
        { text: 'الْإِنْسَانَ (in إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ)', category: 'ism inna — naṣb (fatḥa)' },
      ],
      explanation: 'إِنَّ flips the subject to naṣb but leaves the predicate marfū‘.',
    }},
    { type: 'mcq', content: {
      question: 'So the naṣb (fatḥa) crew includes...',
      options: [
        { text: 'the object AND the subject of إِنَّ', correct: true },
        { text: 'only the doer', correct: false },
      ],
      explanation: 'maf‘ūl bihi and ism inna both take naṣb — plus more roles you meet later (ḥāl, tamyīz…).',
    }},
    { type: 'teach', content: {
      title: 'The naṣb crew grows',
      explanation: 'objects + the subject of إِنَّ = naṣb. Next: the graduation — tag the naṣb words in real ayat.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U22_L4 = { // Read the Quran: mansub hunt
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — hunt the fatḥa',
      explanation: 'Find the naṣb crew: objects and the subjects of إِنَّ. Each fatḥa marks one of these roles.',
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      transliteration: 'iyyaaka na‘budu wa iyyaaka nasta‘een',
      quran_ref: 'Al-Fatiha 1:5',
    }},
    { type: 'mcq', content: {
      question: 'إِيَّاكَ نَعْبُدُ — إِيَّاكَ is...',
      options: [
        { text: 'a fronted object (naṣb role) — "You alone we worship"', correct: true },
        { text: 'the doer', correct: false },
      ],
      explanation: 'إِيَّاكَ is the object of نَعْبُدُ, fronted for emphasis (restriction).',
    }},
    { type: 'classify', content: {
      instruction: 'Tag the naṣb crew (objects & ism inna)',
      categories: ['naṣb (fatḥa role)', 'Not naṣb'],
      items: [
        { text: 'الصِّرَاطَ (…guide us to the path)', category: 'naṣb (fatḥa role)' },
        { text: 'اللّٰهَ (in إِنَّ اللّٰهَ…)', category: 'naṣb (fatḥa role)' },
        { text: 'اللّٰهُ (…created — the doer)', category: 'Not naṣb' },
        { text: 'اللّٰهِ (in بِسْمِ اللّٰهِ)', category: 'Not naṣb' },
      ],
      explanation: 'Objects and the ism of inna = naṣb; doers (ḍamma) and post-preposition nouns (kasra) are not.',
    }},
    { type: 'mcq', content: {
      question: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ — why is الْمُسْتَقِيمَ also fatḥa?',
      options: [
        { text: 'It is an adjective following its naṣb noun الصِّرَاطَ', correct: true },
        { text: 'It is the doer', correct: false },
      ],
      explanation: 'A following adjective copies its noun’s case — الصِّرَاطَ is naṣb, so الْمُسْتَقِيمَ is too.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 22 complete!',
      explanation: 'The fatḥa crew — objects and ism inna — is yours. Next: the kasra crew, the **majrūrāt**.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 23 — The Genitive Crew (al-majrurat)
// ═══════════════════════════════════════════════════════════════

const U23_L1 = { // jarr by preposition
  steps: [
    { type: 'teach', content: {
      title: 'The kasra crew: after prepositions',
      explanation: 'Any noun right after a **preposition** (ḥarf jarr) is **majrūr** — it takes **jarr** (kasra):\n\nفِي الْأَرْض**ِ** · مِنَ النَّاس**ِ** · بِاللّٰه**ِ** · عَلَى الْعَرْش**ِ**',
      arabic: 'فِي الْأَرْضِ',
      transliteration: 'fil-ardi',
      examples: [
        { ar: 'مِنَ النَّاسِ', tr: 'minan-naasi', en: 'from the people (jarr)' },
        { ar: 'بِاللّٰهِ', tr: 'billaahi', en: 'by Allah (jarr)' },
        { ar: 'عَلَى الْعَرْشِ', tr: '‘alal-‘arshi', en: 'upon the Throne (jarr)' },
      ],
      fun_fact: 'The prepositions are even called ḥurūf al-jarr — "the letters that cause jarr".',
    }},
    { type: 'mcq', content: {
      question: 'Why does الْأَرْضِ end in a kasra in فِي الْأَرْضِ?',
      options: [
        { text: 'It follows the preposition فِي → majrūr', correct: true },
        { text: 'It is the object of a verb', correct: false },
        { text: 'It is the subject', correct: false },
      ],
      explanation: 'A noun after a preposition is majrūr → kasra.',
    }},
    { type: 'classify', content: {
      instruction: 'Is the noun majrūr (after a preposition) or not?',
      categories: ['majrūr — jarr (kasra)', 'Not jarr'],
      items: [
        { text: 'النَّاسِ (in مِنَ النَّاسِ)', category: 'majrūr — jarr (kasra)' },
        { text: 'اللّٰهِ (in بِاللّٰهِ)', category: 'majrūr — jarr (kasra)' },
        { text: 'اللّٰهُ (…created — doer)', category: 'Not jarr' },
        { text: 'الْأَرْضَ (…created the earth)', category: 'Not jarr' },
      ],
      explanation: 'After a preposition → jarr (kasra). Doers and objects are not.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'A noun after a preposition is always in the ___ state.',
      correct_answer: 'jarr',
      options: ['jarr', 'raf‘', 'naṣb'],
      explanation: 'ḥarf jarr → the next noun is majrūr (kasra).',
    }},
    { type: 'teach', content: {
      title: 'Prepositions cause kasra',
      explanation: 'After a harf jarr → jarr. There is one more cause of jarr: iḍāfa.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U23_L2 = { // jarr by idafa
  steps: [
    { type: 'teach', content: {
      title: 'The second cause of jarr: iḍāfa',
      explanation: 'The SECOND noun of an iḍāfa ("X of Y") is also **majrūr** — the "of" kasra:\n\nرَسُولُ اللّٰه**ِ** · رَبِّ الْعَالَمِين**َ**… (the ين here is the plural jarr sign) · يَوْمِ الدِّين**ِ**',
      arabic: 'رَسُولُ اللّٰهِ',
      transliteration: 'rasoolu-llaahi',
      examples: [
        { ar: 'كِتَابُ اللّٰهِ', tr: 'kitaabu-llaahi', en: 'the Book of Allah (اللّٰهِ jarr)' },
        { ar: 'يَوْمِ الدِّينِ', tr: 'yawmid-deeni', en: 'the Day of Judgment' },
      ],
      fun_fact: 'So jarr has exactly two causes: a preposition, or being the second half of an iḍāfa.',
    }},
    { type: 'mcq', content: {
      question: 'In رَسُولُ اللّٰهِ, why is اللّٰهِ in jarr (kasra)?',
      options: [
        { text: 'It is the second noun of an iḍāfa ("of Allah")', correct: true },
        { text: 'It follows a preposition', correct: false },
        { text: 'It is the object', correct: false },
      ],
      explanation: 'iḍāfa drags the second noun into jarr — the "of" kasra.',
    }},
    { type: 'classify', content: {
      instruction: 'What put this word in jarr — a preposition or iḍāfa?',
      categories: ['Preposition', 'Iḍāfa (of)'],
      items: [
        { text: 'النَّاسِ (in مِنَ النَّاسِ)', category: 'Preposition' },
        { text: 'اللّٰهِ (in كِتَابُ اللّٰهِ)', category: 'Iḍāfa (of)' },
        { text: 'الْأَرْضِ (in فِي الْأَرْضِ)', category: 'Preposition' },
        { text: 'الدِّينِ (in يَوْمِ الدِّينِ)', category: 'Iḍāfa (of)' },
      ],
      explanation: 'Both cause jarr; the source is either a preposition or an iḍāfa chain.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'Jarr has two causes: a preposition, OR being the second noun of an ___.',
      correct_answer: 'iḍāfa',
      options: ['iḍāfa', 'adjective', 'inna'],
      explanation: 'Preposition or iḍāfa — those are the only two paths to jarr.',
    }},
    { type: 'teach', content: {
      title: 'Both causes of jarr: mastered',
      explanation: 'Preposition or iḍāfa → kasra. Next: how a following word copies whatever case comes before it.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U23_L3 = { // the followers
  steps: [
    { type: 'teach', content: {
      title: 'The followers copy the case',
      explanation: 'A **follower** (tābi‘) — an adjective, or a word joined by وَ — copies the case of the word before it:\n\nالرَّحْمٰن**ِ** الرَّحِيم**ِ** — both jarr (following بِسْمِ اللّٰه**ِ**).',
      arabic: 'الرَّحْمٰنِ الرَّحِيمِ',
      transliteration: 'ar-rahmaanir-raheem',
      examples: [
        { ar: 'الصِّرَاطَ الْمُسْتَقِيمَ', tr: 'as-siraatal-mustaqeem', en: 'both naṣb (object + adjective)' },
        { ar: 'السَّمَاوَاتِ وَالْأَرْضَ', tr: '…', en: 'joined by وَ, sharing naṣb' },
      ],
      fun_fact: 'This is why long strings of Names all share one ending — they all follow اللّٰه.',
    }},
    { type: 'mcq', content: {
      question: 'In بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ, why are the two Names in kasra?',
      options: [
        { text: 'They are adjectives following اللّٰهِ (which is jarr)', correct: true },
        { text: 'They each follow a preposition', correct: false },
      ],
      explanation: 'Adjectives copy their noun’s case; اللّٰهِ is jarr, so the Names are too.',
    }},
    { type: 'classify', content: {
      instruction: 'Does the follower match its noun’s case?',
      categories: ['Matches (follower)', 'Different role'],
      items: [
        { text: 'الرَّحِيمِ following اللّٰهِ (jarr)', category: 'Matches (follower)' },
        { text: 'الْمُسْتَقِيمَ following الصِّرَاطَ (naṣb)', category: 'Matches (follower)' },
        { text: 'اللّٰهُ the doer (raf‘)', category: 'Different role' },
      ],
      explanation: 'Followers copy the case; a doer has its own raf‘ role.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'An adjective takes the ___ case as the noun it describes.',
      correct_answer: 'same',
      options: ['same', 'opposite', 'raf‘'],
      explanation: 'Followers (adjectives, conjuncts) copy the case of what they follow.',
    }},
    { type: 'teach', content: {
      title: 'Followers fall in line',
      explanation: 'Adjectives and conjuncts copy the case ahead of them. Next: the graduation — trace the kasra through the Bismillah.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U23_L4 = { // Read the Quran: trace kasra through Bismillah
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — the kasra of Bismillah',
      explanation: 'Watch the jarr flow through the whole opening:\n\n**بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ**\nبِـ (preposition) → اسْمِ (jarr) → اللّٰهِ (jarr, iḍāfa) → الرَّحْمٰنِ الرَّحِيمِ (jarr, followers).',
      arabic: 'بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ',
      transliteration: 'bismillaahir-rahmaanir-raheem',
      quran_ref: 'Al-Fatiha 1:1',
    }},
    { type: 'classify', content: {
      instruction: 'Everything here is jarr — but WHY? Tag the cause.',
      categories: ['jarr by preposition', 'jarr by iḍāfa', 'jarr by following (adjective)'],
      items: [
        { text: 'اسْمِ (after بِـ)', category: 'jarr by preposition' },
        { text: 'اللّٰهِ (name OF Allah)', category: 'jarr by iḍāfa' },
        { text: 'الرَّحْمٰنِ (adjective of Allah)', category: 'jarr by following (adjective)' },
        { text: 'الرَّحِيمِ (adjective of Allah)', category: 'jarr by following (adjective)' },
      ],
      explanation: 'One preposition, one iḍāfa, two followers — all producing the same kasra.',
    }},
    { type: 'mcq', content: {
      question: 'The whole Bismillah is in kasra. Is that a coincidence?',
      options: [
        { text: 'No — a preposition, an iḍāfa, and two adjectives all cause jarr', correct: true },
        { text: 'Yes, it just happens to rhyme', correct: false },
      ],
      explanation: 'Each word has a grammatical reason for its kasra. That is i‘rāb.',
    }},
    { type: 'classify', content: {
      instruction: 'Across ayat: raf‘, naṣb, or jarr?',
      categories: ['raf‘ (ḍamma)', 'naṣb (fatḥa)', 'jarr (kasra)'],
      items: [
        { text: 'اللّٰهُ (…created — doer)', category: 'raf‘ (ḍamma)' },
        { text: 'الْأَرْضَ (…the earth — object)', category: 'naṣb (fatḥa)' },
        { text: 'اللّٰهِ (bismillaah)', category: 'jarr (kasra)' },
      ],
      explanation: 'The full three-way system: doer, object, and after preposition/iḍāfa.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 23 complete!',
      explanation: 'raf‘, naṣb, jarr — you now explain every normal ending. Final unit: the words with SPECIAL signs that break the default rules.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 24 — The Special Signs — checkpoint after
// ═══════════════════════════════════════════════════════════════

const U24_L1 = { // the five nouns
  steps: [
    { type: 'teach', content: {
      title: 'The Five Nouns (al-asmā’ al-khamsa)',
      explanation: 'Five special nouns show their case with a WHOLE LETTER instead of a vowel, when in iḍāfa:\n\n**أَبٌ** (father), **أَخٌ** (brother), **حَمٌ** (father-in-law), **فو** (mouth), **ذو** (possessor of)\n\nraf‘ → **و** (أَبُو) · naṣb → **ا** (أَبَا) · jarr → **ي** (أَبِي)',
      arabic: 'أَبُو · أَبَا · أَبِي',
      transliteration: 'aboo · abaa · abee',
      examples: [
        { ar: 'أَبُوكَ', tr: 'abooka', en: 'your father (raf‘, و)' },
        { ar: 'أَخُوهُ', tr: 'akhoohu', en: 'his brother (raf‘, و)' },
        { ar: 'ذُو الْعَرْشِ', tr: 'dhul-‘arsh', en: 'Owner of the Throne (raf‘, و)' },
      ],
      fun_fact: 'تَبَّتْ يَدَا أَبِي لَهَبٍ (Al-Masad 111:1) — أَبِي is jarr, shown with ي. The five nouns are all over the Quran.',
    }},
    { type: 'mcq', content: {
      question: 'In تَبَّتْ يَدَا أَبِي لَهَبٍ, the ي in أَبِي shows it is in...',
      options: [
        { text: 'jarr (the "ي" is the jarr sign for the five nouns)', correct: true },
        { text: 'raf‘', correct: false },
        { text: 'naṣb', correct: false },
      ],
      explanation: 'For the five nouns: و = raf‘, ا = naṣb, ي = jarr. أَبِي = jarr.',
    }},
    { type: 'classify', content: {
      instruction: 'Which case does the special letter show?',
      categories: ['raf‘ (و)', 'naṣb (ا)', 'jarr (ي)'],
      items: [
        { text: 'أَبُوكَ (your father)', category: 'raf‘ (و)' },
        { text: 'أَبَاكَ (your father — object)', category: 'naṣb (ا)' },
        { text: 'أَبِيكَ (of your father)', category: 'jarr (ي)' },
        { text: 'ذُو الْعَرْشِ (Owner of the Throne)', category: 'raf‘ (و)' },
      ],
      explanation: 'و raf‘ · ا naṣb · ي jarr — whole letters instead of vowels.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'The five nouns show raf‘ with و, naṣb with ا, and jarr with ___.',
      correct_answer: 'ي',
      options: ['ي', 'ة', 'ن'],
      explanation: 'أَبُو (raf‘) · أَبَا (naṣb) · أَبِي (jarr).',
    }},
    { type: 'teach', content: {
      title: 'Five special nouns: learned',
      explanation: 'أَب، أَخ، حَم، فو، ذو — cases shown by letters. Next: how duals and sound plurals mark their cases.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U24_L2 = { // duals & sound masc plurals
  steps: [
    { type: 'teach', content: {
      title: 'Duals & sound masculine plurals',
      explanation: 'These also use LETTERS, not vowels:\n\n**Dual:** raf‘ → **انِ** (مُسْلِمَانِ) · naṣb & jarr → **يْنِ** (مُسْلِمَيْنِ)\n**Sound masc. plural:** raf‘ → **ونَ** (مُسْلِمُونَ) · naṣb & jarr → **ينَ** (مُسْلِمِينَ)',
      arabic: 'مُسْلِمُونَ · مُسْلِمِينَ',
      transliteration: 'muslimoon · muslimeen',
      examples: [
        { ar: 'مُؤْمِنُونَ', tr: 'mu’minoon', en: 'believers (raf‘, ونَ)' },
        { ar: 'مُؤْمِنِينَ', tr: 'mu’mineen', en: 'believers (naṣb/jarr, ينَ)' },
      ],
      fun_fact: 'This is the secret behind مُؤْمِنُونَ vs مُؤْمِنِينَ (Part A promised you this!): same word, different CASE — not different meaning.',
    }},
    { type: 'mcq', content: {
      question: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ — الْمُؤْمِنُونَ ends in ونَ because it is the...',
      options: [
        { text: 'fā‘il (subject) — raf‘, so ونَ', correct: true },
        { text: 'object — naṣb', correct: false },
      ],
      explanation: 'The believers "succeeded" → they are the doers → raf‘ → ونَ.',
    }},
    { type: 'classify', content: {
      instruction: 'raf‘ (ونَ / انِ) or naṣb/jarr (ينَ / يْنِ)?',
      categories: ['raf‘ (ونَ / انِ)', 'naṣb or jarr (ينَ / يْنِ)'],
      items: [
        { text: 'الْمُؤْمِنُونَ', category: 'raf‘ (ونَ / انِ)' },
        { text: 'الْمُؤْمِنِينَ', category: 'naṣb or jarr (ينَ / يْنِ)' },
        { text: 'مُسْلِمَانِ (two Muslims)', category: 'raf‘ (ونَ / انِ)' },
        { text: 'مُسْلِمَيْنِ (two Muslims)', category: 'naṣb or jarr (ينَ / يْنِ)' },
      ],
      explanation: 'ونَ/انِ = raf‘; ينَ/يْنِ = naṣb & jarr.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'الْعَالَمِينَ (in رَبِّ الْعَالَمِينَ) ends in ينَ because iḍāfa put it in ___.',
      correct_answer: 'jarr',
      options: ['jarr', 'raf‘', 'naṣb'],
      explanation: 'The second noun of an iḍāfa is jarr; for a sound plural that shows as ينَ.',
    }},
    { type: 'teach', content: {
      title: 'Plurals mark their case too',
      explanation: 'ونَ/ينَ and انِ/يْنِ tell you the case. Next: the feminine plural and the "diptotes" that refuse tanwīn.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U24_L3 = { // fem plurals & diptotes
  steps: [
    { type: 'teach', content: {
      title: 'Feminine plurals & diptotes',
      explanation: 'Two more twists:\n\n**Sound fem. plural (ـات):** raf‘ → ـاتٌ · **naṣb → ـاتٍ** (a kasra, NOT a fatḥa!) · jarr → ـاتٍ\n\n**Diptotes (mamnū‘ min al-ṣarf):** special words that take NO tanwīn, and use a **fatḥa for jarr** instead of a kasra (e.g. مَسَاجِدَ، أَحْمَدَ).',
      arabic: 'الْمُسْلِمَاتِ',
      transliteration: 'al-muslimaat',
      examples: [
        { ar: 'الْمُسْلِمَاتِ', tr: 'al-muslimaati', en: 'the Muslim women (naṣb/jarr, kasra)' },
        { ar: 'مَسَاجِدَ', tr: 'masaajida', en: 'mosques (diptote — jarr with fatḥa)' },
      ],
      fun_fact: 'إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ (Al-Ahzab 35): both are naṣb after إِنَّ — shown by ينَ and by the ـاتِ kasra.',
    }},
    { type: 'mcq', content: {
      question: 'A sound feminine plural (ـات) in naṣb takes which sign?',
      options: [
        { text: 'a kasra (ـاتٍ / ـاتِ) — not a fatḥa', correct: true },
        { text: 'a fatḥa like normal nouns', correct: false },
      ],
      explanation: 'The ـات plural is special: its naṣb sign is a kasra, not a fatḥa.',
    }},
    { type: 'mcq', content: {
      question: 'A diptote (mamnū‘ min al-ṣarf) like مَسَاجِد shows jarr with...',
      options: [
        { text: 'a fatḥa (مَسَاجِدَ) and takes no tanwīn', correct: true },
        { text: 'a normal kasra with tanwīn', correct: false },
      ],
      explanation: 'Diptotes refuse tanwīn and borrow the fatḥa for their jarr.',
    }},
    { type: 'classify', content: {
      instruction: 'Normal noun or special (diptote / ـات plural)?',
      categories: ['Normal (kasra for jarr)', 'Special sign'],
      items: [
        { text: 'الْبَيْتِ (jarr, kasra)', category: 'Normal (kasra for jarr)' },
        { text: 'مَسَاجِدَ (jarr, fatḥa — diptote)', category: 'Special sign' },
        { text: 'الْمُسْلِمَاتِ (naṣb, kasra — fem plural)', category: 'Special sign' },
        { text: 'الْكِتَابِ (jarr, kasra)', category: 'Normal (kasra for jarr)' },
      ],
      explanation: 'Diptotes and ـات plurals break the default vowel rules.',
    }},
    { type: 'teach', content: {
      title: 'The special signs: complete',
      explanation: 'Five nouns, duals, sound plurals, fem plurals, diptotes — you now read the tricky endings too. Final lesson: put it all together on a famous ayah.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U24_L4 = { // Read the Quran: special-sign showcase + checkpoint framing
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — the special-sign showcase',
      explanation: '**إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ وَالْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ...**\n"Indeed the Muslim men and Muslim women, the believing men and believing women..." (Al-Ahzab 33:35)\n\nEvery word here shows its case with a special sign.',
      arabic: 'إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ',
      transliteration: 'innal-muslimeena wal-muslimaat',
      quran_ref: 'Al-Ahzab 33:35',
    }},
    { type: 'mcq', content: {
      question: 'Why is it الْمُسْلِمِينَ (ينَ) and not الْمُسْلِمُونَ (ونَ) here?',
      options: [
        { text: 'إِنَّ makes it naṣb, and a sound plural shows naṣb with ينَ', correct: true },
        { text: 'It is the subject (raf‘)', correct: false },
      ],
      explanation: 'ism inna = naṣb; for a sound masc. plural, naṣb is written ينَ.',
    }},
    { type: 'classify', content: {
      instruction: 'How does each word show its case?',
      categories: ['Sound masc. plural (ينَ = naṣb)', 'Fem. ـات plural (ـاتِ = naṣb)'],
      items: [
        { text: 'الْمُسْلِمِينَ', category: 'Sound masc. plural (ينَ = naṣb)' },
        { text: 'الْمُؤْمِنِينَ', category: 'Sound masc. plural (ينَ = naṣb)' },
        { text: 'الْمُسْلِمَاتِ', category: 'Fem. ـات plural (ـاتِ = naṣb)' },
        { text: 'الْمُؤْمِنَاتِ', category: 'Fem. ـات plural (ـاتِ = naṣb)' },
      ],
      explanation: 'All four are naṣb (ism inna) — the men via ينَ, the women via the ـاتِ kasra.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'وَالْمُسْلِمَاتِ — the وَ joins it to الْمُسْلِمِينَ, so it copies the ___ case.',
      correct_answer: 'naṣb',
      options: ['naṣb', 'raf‘', 'jarr'],
      explanation: 'A conjunct (وَ…) is a follower — it copies the case of what precedes it.',
    }},
    { type: 'teach', content: {
      title: '🏆 I‘RĀB MASTERED — the case system is yours!',
      explanation: 'You can now explain WHY any Quranic word ends the way it does: the four states (raf‘، naṣb، jarr، jazm), who takes each, and the special signs (five nouns، duals، plurals، diptotes).\n\nThis is real parsing — the scholar’s skill. Next in the mastery track: **Inna & Kāna and their sisters** — the words that flip a whole sentence’s cases.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// Vocabulary — grammar terms + a few Quranic words
// ═══════════════════════════════════════════════════════════════

const U20_VOCAB = [
  ['إِعْرَاب', 'i‘raab', 'case parsing (grammatical analysis)', 'ism', 'masculine', 'singular', null, 2],
  ['رَفْع', 'raf‘', 'nominative (the ḍamma state)', 'ism', 'masculine', 'singular', null, 2],
  ['نَصْب', 'naṣb', 'accusative (the fatḥa state)', 'ism', 'masculine', 'singular', null, 2],
  ['جَرّ', 'jarr', 'genitive (the kasra state)', 'ism', 'masculine', 'singular', null, 2],
];

const U21_VOCAB = [
  ['فَاعِل', 'faa‘il', 'the doer (subject of a verb)', 'ism', 'masculine', 'singular', null, 2],
  ['مُبْتَدَأ', 'mubtada’', 'the subject of a nominal sentence', 'ism', 'masculine', 'singular', null, 2],
  ['خَبَر', 'khabar', 'the predicate', 'ism', 'masculine', 'singular', null, 2],
  ['الْحَقّ', 'al-haqq', 'the truth', 'ism', 'masculine', 'singular', 'Al-Isra 17:81', 1],
];

const U22_VOCAB = [
  ['مَفْعُول', 'maf‘ool', 'the object (receiver)', 'ism', 'masculine', 'singular', null, 2],
  ['إِيَّاكَ', 'iyyaaka', 'You (alone) — object pronoun', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:5', 1],
];

const U23_VOCAB = [
  ['حَرْف الجَرّ', 'harf al-jarr', 'a preposition (jarr-letter)', 'harf', null, null, null, 2],
  ['الْعَرْش', 'al-‘arsh', 'the Throne', 'ism', 'masculine', 'singular', 'Al-A‘raf 7:54', 1],
];

const U24_VOCAB = [
  ['أَب', 'ab', 'father (a "five noun")', 'ism', 'masculine', 'singular', 'Al-Masad 111:1', 1],
  ['أَخ', 'akh', 'brother (a "five noun")', 'ism', 'masculine', 'singular', 'Ta-Ha 20:30', 1],
  ['ذُو', 'dhoo', 'possessor of (a "five noun")', 'ism', 'masculine', 'singular', 'Al-Buruj 85:15', 2],
  ['مَسْجِد', 'masjid', 'mosque (plural مَسَاجِد is a diptote)', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:114', 1],
];

// ═══════════════════════════════════════════════════════════════
// Seeding
// ═══════════════════════════════════════════════════════════════

const UNIT_DEFS = [
  [20, 'irab-four-states', 'The Four States',     'الإِعْرَاب', '🎯', '#8B7BD8', false, 'I‘rāb: raf‘, naṣb, jarr, jazm — why endings change, and the mabnī/mu‘rab split.'],
  [21, 'marfuat', 'The Nominative Crew',          'المَرْفُوعَات', '⬆️', '#5FB57A', false, 'Everyone who wears the ḍamma: mubtada, khabar, and the doer (fā‘il).'],
  [22, 'mansubat', 'The Accusative Crew',         'المَنْصُوبَات', '➡️', '#6BA8D4', false, 'The fatḥa crew: the object (maf‘ūl) and the subject of إِنَّ.'],
  [23, 'majrurat', 'The Genitive Crew',           'المَجْرُورَات', '⬇️', '#D4A246', false, 'The kasra crew: jarr by preposition and by iḍāfa, plus the followers.'],
  [24, 'special-signs', 'The Special Signs',       'عَلَامَات الإِعْرَاب', '💎', '#C77DBB', true, 'The five nouns, duals, sound plurals, and diptotes that break the default signs.'],
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
    [20, 'words-wear-endings', 'Words Wear Endings', 1, U20_L1, 15],
    [20, 'the-signs', 'The Default Signs', 2, U20_L2, 15],
    [20, 'mabni-murab', 'Fixed vs Flexible', 3, U20_L3, 15],
    [20, 'read-quran-parse-fatiha', 'Read the Quran: Parse Al-Fatiha', 4, U20_L4, 20],

    [21, 'mubtada-khabar-raf', 'Subjects Wear the Ḍamma', 1, U21_L1, 15],
    [21, 'fail-raf', 'The Doer is Marfū‘', 2, U21_L2, 15],
    [21, 'spot-raf', 'Spot the Raf‘ Crew', 3, U21_L3, 15],
    [21, 'read-quran-marfu', 'Read the Quran: Hunt the Ḍamma', 4, U21_L4, 20],

    [22, 'maful-nasb', 'Objects Wear the Fatḥa', 1, U22_L1, 15],
    [22, 'object-pronouns-nasb', 'Objects on the Verb', 2, U22_L2, 15],
    [22, 'ism-inna-nasb', 'إِنَّ and Naṣb', 3, U22_L3, 15],
    [22, 'read-quran-mansub', 'Read the Quran: Hunt the Fatḥa', 4, U22_L4, 20],

    [23, 'jarr-preposition', 'After a Preposition', 1, U23_L1, 15],
    [23, 'jarr-idafa', 'Jarr by Iḍāfa', 2, U23_L2, 15],
    [23, 'the-followers', 'The Followers', 3, U23_L3, 15],
    [23, 'read-quran-bismillah-jarr', 'Read the Quran: The Kasra of Bismillah', 4, U23_L4, 20],

    [24, 'five-nouns', 'The Five Nouns', 1, U24_L1, 15],
    [24, 'duals-plurals', 'Duals & Sound Plurals', 2, U24_L2, 15],
    [24, 'fem-plurals-diptotes', 'Feminine Plurals & Diptotes', 3, U24_L3, 15],
    [24, 'read-quran-special-signs', 'Read the Quran: Special Signs', 4, U24_L4, 20],
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

  const vocabByUnit = [[20, U20_VOCAB], [21, U21_VOCAB], [22, U22_VOCAB], [23, U23_VOCAB], [24, U24_VOCAB]];
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

  // Backfill: unlock Unit 20 L1 for users who finished ALL of Unit 19
  const [firstU20] = await sql`
    SELECT id FROM learning_lessons WHERE unit_id = ${unitIdBySort[20]} ORDER BY sort_order LIMIT 1`;
  const unlocked = await sql`
    WITH unit19 AS (
      SELECT l.id FROM learning_lessons l
      JOIN learning_units u ON u.id = l.unit_id
      WHERE u.sort_order = 19
    ),
    finishers AS (
      SELECT p.user_id FROM user_lesson_progress p
      JOIN unit19 ON unit19.id = p.lesson_id
      WHERE p.status = 'completed'
      GROUP BY p.user_id
      HAVING count(*) = (SELECT count(*) FROM unit19)
    )
    INSERT INTO user_lesson_progress (user_id, lesson_id, status)
    SELECT f.user_id, ${firstU20.id}, 'available' FROM finishers f
    ON CONFLICT (user_id, lesson_id) DO NOTHING
    RETURNING user_id`;
  console.log(`  ✓ Unlocked Unit 20 Lesson 1 for ${unlocked.length} users who had finished Unit 19`);

  const check = await sql`
    SELECT u.sort_order, u.title, count(l.id)::int AS lessons
    FROM learning_units u LEFT JOIN learning_lessons l ON l.unit_id = u.id
    GROUP BY u.sort_order, u.title ORDER BY u.sort_order`;
  console.log('\nFinal state:');
  for (const c of check) console.log(`  #${c.sort_order} ${c.title}: ${c.lessons} lessons`);
  const [tot] = await sql`SELECT count(*)::int u FROM learning_units`;
  const [tl] = await sql`SELECT count(*)::int l FROM learning_lessons`;
  console.log(`\nTOTAL: ${tot.u} units, ${tl.l} lessons.`);
}

main()
  .then(() => sql.end())
  .catch(async (e) => { console.error('SEED FAILED:', e.message); await sql.end(); process.exit(1); });
