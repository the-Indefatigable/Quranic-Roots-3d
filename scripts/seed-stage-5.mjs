/**
 * Seeds STAGE 5 — "Building Sentences" — Units 17–19 (finishes Part A):
 *   17 Sentences Without "Is" (jumla ismiyya: mubtada + khabar, inna)
 *   18 Verb Sentences (jumla fi'liyya: fa'il, maf'ul bihi, relative clauses)
 *   19 Read Like a Scholar (capstone full-surah parses; ends legendary) — checkpoint_after
 *
 * Same mechanics as seed-stage-2..4.mjs, plus per-lesson lesson_type (the final
 * Ayat al-Kursi lesson is 'legendary', 40 XP). Backfills Unit-17 L1 unlock for
 * finishers of Unit 16. Idempotent. Run: DATABASE_URL=... node scripts/seed-stage-5.mjs
 */
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

// ═══════════════════════════════════════════════════════════════
// UNIT 17 — Sentences Without "Is" (jumla ismiyya)
// ═══════════════════════════════════════════════════════════════

const U17_L1 = { // Arabic has no "is"
  steps: [
    { type: 'teach', content: {
      title: 'Arabic has no "is"',
      explanation: 'To say "Allah is greater", Arabic just places two words side by side — **no word for "is"** needed:\n\n**اللّٰهُ أَكْبَرُ** = "Allah [is] greater."\n\nThe reader supplies "is" in their mind.',
      arabic: 'اللّٰهُ أَكْبَرُ',
      transliteration: 'allaahu akbar',
      examples: [
        { ar: 'اللّٰهُ أَكْبَرُ', tr: 'allaahu akbar', en: 'Allah [is] greater' },
        { ar: 'الْحَمْدُ لِلَّهِ', tr: 'al-hamdu lillah', en: 'praise [is] for Allah' },
      ],
      fun_fact: 'A sentence that STARTS with a noun is a "nominal sentence" — jumla ismiyya. It’s the calm, describing kind of sentence.',
    }},
    { type: 'teach', content: {
      title: 'Two parts: mubtada + khabar',
      explanation: 'A nominal sentence has two pieces:\n\n**mubtada** (المُبْتَدَأ) = the starting subject\n**khabar** (الخَبَر) = the news about it\n\nاللّٰهُ (mubtada) · أَكْبَرُ (khabar). Both are marfū‘ (ḍamma ending) — your Stage-7 preview.',
      arabic: 'مُبْتَدَأ + خَبَر',
      transliteration: 'mubtada’ + khabar',
      examples: [
        { ar: 'اللّٰهُ رَبُّنَا', tr: 'allaahu rabbunaa', en: 'Allah [is] our Lord' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'Why is there no word between اللّٰهُ and أَكْبَرُ?',
      options: [
        { text: 'Arabic has no word for "is" — it’s understood', correct: true },
        { text: 'A word was left out by mistake', correct: false },
        { text: 'أَكْبَرُ contains "is"', correct: false },
      ],
      explanation: 'Nominal sentences drop "is/are". The reader supplies it: "Allah [is] greater".',
    }},
    { type: 'fill_blank', content: {
      sentence: 'In الْحَمْدُ لِلَّهِ, the starting subject الْحَمْد is called the ___.',
      correct_answer: 'mubtada',
      options: ['mubtada', 'khabar', 'fa‘il'],
      explanation: 'الْحَمْد = mubtada (the subject); لِلَّهِ = khabar (the news). "Praise [is] for Allah."',
    }},
    { type: 'classify', content: {
      instruction: 'Subject (mubtada) or news (khabar)?',
      categories: ['Mubtada (subject)', 'Khabar (news)'],
      items: [
        { text: 'اللّٰهُ (in اللّٰهُ أَكْبَرُ)', category: 'Mubtada (subject)' },
        { text: 'أَكْبَرُ (in اللّٰهُ أَكْبَرُ)', category: 'Khabar (news)' },
        { text: 'الْحَمْدُ (in الْحَمْدُ لِلَّهِ)', category: 'Mubtada (subject)' },
        { text: 'لِلَّهِ (in الْحَمْدُ لِلَّهِ)', category: 'Khabar (news)' },
      ],
      explanation: 'The first noun is the mubtada; what tells you about it is the khabar.',
    }},
    { type: 'teach', content: {
      title: 'You can read Arabic sentences now',
      explanation: 'Two nouns, an invisible "is". **mubtada + khabar.** Next: when a pronoun is the subject — هُوَ الْغَفُورُ.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U17_L2 = { // Pronoun sentences
  steps: [
    { type: 'teach', content: {
      title: 'When "He" is the subject',
      explanation: 'A pronoun can be the mubtada:\n\n**هُوَ الْغَفُورُ الرَّحِيمُ** = "He [is] the Forgiving, the Merciful."\n**هُوَ اللّٰهُ أَحَدٌ** = "He [is] Allah, One."',
      arabic: 'هُوَ الْغَفُورُ الرَّحِيمُ',
      transliteration: 'huwal-ghafoorur-raheem',
      examples: [
        { ar: 'هُوَ الْعَلِيمُ', tr: 'huwal-‘aleem', en: 'He [is] the All-Knowing' },
        { ar: 'أَنْتَ الْوَهَّابُ', tr: 'antal-wahhaab', en: 'You [are] the Bestower' },
      ],
      fun_fact: 'هُوَ (He) as a subject + a Name of Allah as the khabar = a whole declaration of who Allah is, in two words.',
    }},
    { type: 'mcq', content: {
      question: 'هُوَ الْغَفُورُ means...',
      options: [
        { text: 'He [is] the Forgiving', correct: true },
        { text: 'the forgiving He', correct: false },
        { text: 'they are forgiving', correct: false },
      ],
      explanation: 'هُوَ (mubtada) + الْغَفُور (khabar), with an understood "is".',
    }},
    { type: 'fill_blank', content: {
      sentence: 'قُلْ هُوَ اللّٰهُ أَحَدٌ — the subject (mubtada) is ___.',
      correct_answer: 'هُوَ',
      options: ['هُوَ', 'اللّٰهُ', 'أَحَدٌ'],
      explanation: 'هُوَ ("He") is the mubtada; اللّٰهُ أَحَدٌ tells us about Him.',
    }},
    { type: 'classify', content: {
      instruction: 'Subject pronoun or the news about Him?',
      categories: ['Subject (mubtada)', 'News (khabar)'],
      items: [
        { text: 'هُوَ', category: 'Subject (mubtada)' },
        { text: 'الْغَفُورُ', category: 'News (khabar)' },
        { text: 'الرَّحِيمُ', category: 'News (khabar)' },
      ],
      explanation: 'هُوَ is the subject; the Names are the news about Him.',
    }},
    { type: 'match', content: {
      instruction: 'Match the two-word sentence to its meaning',
      pairs: [
        { left: 'هُوَ الْعَلِيمُ', right: 'He is the All-Knowing' },
        { left: 'هُوَ الْغَفُورُ', right: 'He is the Forgiving' },
        { left: 'أَنْتَ الْحَكِيمُ', right: 'You are the All-Wise' },
      ],
    }},
    { type: 'teach', content: {
      title: 'Pronoun sentences: done',
      explanation: 'هُوَ + a Name = a complete truth. Next: the word that adds power to these sentences — إِنَّ.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U17_L3 = { // inna the emphasizer
  steps: [
    { type: 'teach', content: {
      title: 'إِنَّ — "Indeed / Truly"',
      explanation: 'Put **إِنَّ** at the front of a nominal sentence to emphasize it:\n\n**إِنَّ اللّٰهَ غَفُورٌ رَحِيمٌ** = "**Indeed** Allah is Forgiving, Merciful."\n\nإِنَّ makes the subject take a **fatḥa** (اللّٰهَ, not اللّٰهُ); the khabar stays marfū‘ (رَحِيمٌ).',
      arabic: 'إِنَّ اللّٰهَ غَفُورٌ رَحِيمٌ',
      transliteration: 'innallaaha ghafoorun raheem',
      examples: [
        { ar: 'إِنَّ اللّٰهَ عَلِيمٌ', tr: 'innallaaha ‘aleem', en: 'indeed Allah is All-Knowing' },
        { ar: 'إِنَّكَ أَنْتَ', tr: 'innaka anta', en: 'indeed You [are]…' },
      ],
      fun_fact: 'You met إِنَّ back in Stage 1 (إِنَّ الْمُسْلِمِينَ). It’s the head of a whole family — "inna & her sisters" — a full topic in the mastery track.',
    }},
    { type: 'mcq', content: {
      question: 'What does إِنَّ add to a sentence?',
      options: [
        { text: 'Emphasis — "indeed / truly"', correct: true },
        { text: 'A question', correct: false },
        { text: 'Negation', correct: false },
      ],
      explanation: 'إِنَّ stresses the statement: "Indeed…".',
    }},
    { type: 'mcq', content: {
      question: 'In إِنَّ اللّٰهَ غَفُورٌ, why is it اللّٰهَ (fatḥa) not اللّٰهُ (ḍamma)?',
      options: [
        { text: 'إِنَّ makes its subject take a fatḥa (naṣb)', correct: true },
        { text: 'It’s a spelling error', correct: false },
        { text: 'Allah’s name always has fatḥa', correct: false },
      ],
      explanation: 'إِنَّ pulls its noun into naṣb (fatḥa). The predicate غَفُورٌ stays marfū‘.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'إِنَّ اللّٰهَ ___ الصَّابِرِينَ — "Indeed Allah is WITH the patient" (Al-Baqarah 2:153).',
      correct_answer: 'مَعَ',
      options: ['مَعَ', 'فِي', 'مِنْ'],
      explanation: 'Your Stage-3 preposition مَعَ ("with") is the khabar here. إِنَّ + Allah (subject) + مَعَ الصابرين (news).',
    }},
    { type: 'classify', content: {
      instruction: 'After إِنَّ: which is the subject (naṣb) and which is the news (marfū‘)?',
      categories: ['Subject of inna (fatḥa)', 'Khabar (ḍamma)'],
      items: [
        { text: 'اللّٰهَ', category: 'Subject of inna (fatḥa)' },
        { text: 'غَفُورٌ', category: 'Khabar (ḍamma)' },
        { text: 'رَحِيمٌ', category: 'Khabar (ḍamma)' },
      ],
      explanation: 'إِنَّ اللّٰهَ (fatḥa) غَفُورٌ رَحِيمٌ (ḍamma). This flip is the heart of "inna".',
    }},
    { type: 'teach', content: {
      title: 'Emphasis unlocked',
      explanation: 'إِنَّ turns a statement into a solemn "indeed". Next: the graduation — a full parse of Surah Al-Ikhlas.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U17_L4 = { // Read the Quran: inna + Al-Ikhlas
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — Al-Ikhlas, fully',
      explanation: 'You now know every word of Surah Al-Ikhlas as a set of nominal sentences:\n\n**قُلْ هُوَ اللّٰهُ أَحَدٌ • اللّٰهُ الصَّمَدُ • لَمْ يَلِدْ وَلَمْ يُولَدْ • وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ**',
      arabic: 'قُلْ هُوَ اللّٰهُ أَحَدٌ',
      transliteration: 'qul huwa-llaahu ahad',
      quran_ref: 'Al-Ikhlas 112:1–4',
    }},
    { type: 'mcq', content: {
      question: 'اللّٰهُ الصَّمَدُ ("Allah, the Eternal Refuge") is what kind of sentence?',
      options: [
        { text: 'nominal (mubtada + khabar, no verb)', correct: true },
        { text: 'a verb sentence', correct: false },
        { text: 'a command', correct: false },
      ],
      explanation: 'اللّٰهُ (mubtada) + الصَّمَدُ (khabar), with an understood "is".',
    }},
    { type: 'mcq', content: {
      question: 'لَمْ يَلِدْ ("He begets not") — what makes this a VERB sentence, not nominal?',
      options: [
        { text: 'It contains a verb (يَلِدْ) negated by لَمْ', correct: true },
        { text: 'It has no subject', correct: false },
      ],
      explanation: 'Your Stage-4 negation: لَمْ + present verb. A sentence can switch from nominal to verbal.',
    }},
    { type: 'classify', content: {
      instruction: 'Nominal (no verb) or verbal (has a verb)?',
      categories: ['Nominal sentence', 'Verbal sentence'],
      items: [
        { text: 'هُوَ اللّٰهُ أَحَدٌ', category: 'Nominal sentence' },
        { text: 'اللّٰهُ الصَّمَدُ', category: 'Nominal sentence' },
        { text: 'لَمْ يَلِدْ', category: 'Verbal sentence' },
        { text: 'لَمْ يُولَدْ', category: 'Verbal sentence' },
      ],
      explanation: 'First two: two nouns, no verb. Last two: a verb (يَلِد/يُولَد).',
    }},
    { type: 'fill_blank', content: {
      sentence: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ — لَهُ is لَ ("to") + ___ ("Him").',
      correct_answer: 'هُ',
      options: ['هُ', 'كَ', 'نَا'],
      explanation: '"…there is none comparable TO HIM." Every layer of Stage 1–4 is inside this surah.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 17 complete!',
      explanation: 'You read whole nominal sentences and the emphasizer إِنَّ. Next: **verb sentences** — finding the doer (fā‘il) and the object (maf‘ūl).',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 18 — Verb Sentences (jumla fi'liyya)
// ═══════════════════════════════════════════════════════════════

const U18_L1 = { // Verb comes first
  steps: [
    { type: 'teach', content: {
      title: 'The verb goes first',
      explanation: 'A **verb sentence** (jumla fi‘liyya) usually starts with the verb, then the doer, then the object:\n\n**خَلَقَ اللّٰهُ السَّمَاوَاتِ** = "Created — Allah — the heavens."\n\nEnglish says "Allah created…"; Arabic often says "Created Allah…".',
      arabic: 'خَلَقَ اللّٰهُ السَّمَاوَاتِ',
      transliteration: 'khalaqa-llaahus-samaawaat',
      examples: [
        { ar: 'قَالَ رَبُّكَ', tr: 'qaala rabbuka', en: 'your Lord said' },
        { ar: 'جَاءَ الْحَقُّ', tr: 'jaa’al-haqq', en: 'the truth came' },
      ],
      fun_fact: 'Verb-first word order (VSO) gives Quranic narration its momentum: قَالَ… خَلَقَ… جَعَلَ…',
    }},
    { type: 'mcq', content: {
      question: 'In خَلَقَ اللّٰهُ السَّمَاوَاتِ, which word comes FIRST?',
      options: [
        { text: 'the verb خَلَقَ (created)', correct: true },
        { text: 'the subject اللّٰهُ', correct: false },
        { text: 'the object السَّمَاوَاتِ', correct: false },
      ],
      explanation: 'Verb sentences lead with the verb: "Created Allah the heavens".',
    }},
    { type: 'classify', content: {
      instruction: 'Does the sentence start with a verb or a noun?',
      categories: ['Verb-first (fi‘liyya)', 'Noun-first (ismiyya)'],
      items: [
        { text: 'خَلَقَ اللّٰهُ…', category: 'Verb-first (fi‘liyya)' },
        { text: 'اللّٰهُ أَكْبَرُ', category: 'Noun-first (ismiyya)' },
        { text: 'قَالَ رَبُّكَ…', category: 'Verb-first (fi‘liyya)' },
        { text: 'الْحَمْدُ لِلَّهِ', category: 'Noun-first (ismiyya)' },
      ],
      explanation: 'Starts with a verb → fi‘liyya. Starts with a noun → ismiyya.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'A sentence that begins with a verb is a jumla ___.',
      correct_answer: 'fi‘liyya',
      options: ['fi‘liyya', 'ismiyya', 'idafa'],
      explanation: 'fi‘liyya = verbal sentence (from fi‘l, verb). ismiyya = nominal (from ism, noun).',
    }},
    { type: 'teach', content: {
      title: 'Verb-first order: got it',
      explanation: 'Verb → doer → object. Next: pinning down the **doer** — the fā‘il.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U18_L2 = { // Finding the doer (fa'il)
  steps: [
    { type: 'teach', content: {
      title: 'The doer — al-fā‘il',
      explanation: 'The **fā‘il** (الفَاعِل) is *who did the verb*. It comes right after the verb and is **marfū‘** (ḍamma ending):\n\nخَلَقَ **اللّٰهُ** — the fā‘il is اللّٰهُ ("Allah did the creating").',
      arabic: 'الفَاعِل = the doer',
      transliteration: 'al-faa‘il',
      examples: [
        { ar: 'قَالَ اللّٰهُ', tr: 'qaala-llah', en: 'Allah said (fā‘il = Allah)' },
        { ar: 'جَاءَ نَصْرُ اللّٰهِ', tr: 'jaa’a nasrullah', en: 'the help of Allah came' },
      ],
      fun_fact: 'Spot the fā‘il by asking "who did it?" — and it will carry a ḍamma (the marfū‘ sign).',
    }},
    { type: 'mcq', content: {
      question: 'In قَالَ رَبُّكَ لِلْمَلَائِكَةِ, who is the fā‘il (the doer of "said")?',
      options: [
        { text: 'رَبُّكَ (your Lord)', correct: true },
        { text: 'الْمَلَائِكَةِ (the angels)', correct: false },
        { text: 'قَالَ (said)', correct: false },
      ],
      explanation: 'رَبُّكَ did the saying → it’s the fā‘il (and takes ḍamma: رَبُّكَ).',
    }},
    { type: 'fill_blank', content: {
      sentence: 'The doer of the verb is called the ___ and takes a ḍamma.',
      correct_answer: 'fā‘il',
      options: ['fā‘il', 'maf‘ūl', 'khabar'],
      explanation: 'fā‘il = the doer, always marfū‘ (ḍamma). Next you meet the maf‘ūl — the receiver.',
    }},
    { type: 'classify', content: {
      instruction: 'Find the fā‘il (doer) in each',
      categories: ['This word is the fā‘il', 'This word is NOT the fā‘il'],
      items: [
        { text: 'اللّٰهُ (in خَلَقَ اللّٰهُ)', category: 'This word is the fā‘il' },
        { text: 'خَلَقَ (in خَلَقَ اللّٰهُ)', category: 'This word is NOT the fā‘il' },
        { text: 'رَبُّكَ (in قَالَ رَبُّكَ)', category: 'This word is the fā‘il' },
        { text: 'الْحَقُّ (in جَاءَ الْحَقُّ)', category: 'This word is the fā‘il' },
      ],
      explanation: 'The fā‘il is the doer (marfū‘), not the verb itself.',
    }},
    { type: 'teach', content: {
      title: 'You can find the doer',
      explanation: 'fā‘il = who did it, marked with ḍamma. Next: the thing it was done TO — the maf‘ūl.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U18_L3 = { // The receiver (maf'ul bihi)
  steps: [
    { type: 'teach', content: {
      title: 'The receiver — al-maf‘ūl bihi',
      explanation: 'The **maf‘ūl bihi** (المَفْعُول بِهِ) is *what the verb was done to* — the object. It takes a **fatḥa** (naṣb ending):\n\nخَلَقَ اللّٰهُ **السَّمَاوَاتِ** — the maf‘ūl is "the heavens" (what was created).',
      arabic: 'المَفْعُول = the receiver',
      transliteration: 'al-maf‘ool bihi',
      examples: [
        { ar: 'أَنْزَلَ الْكِتَابَ', tr: 'anzalal-kitaab', en: 'He sent down the Book (maf‘ūl)' },
        { ar: 'يُقِيمُونَ الصَّلَاةَ', tr: 'yuqeemoonas-salaah', en: 'they establish prayer (maf‘ūl)' },
      ],
      fun_fact: 'fā‘il wears ḍamma, maf‘ūl wears fatḥa. The endings tell you who did what — even if word order moves!',
    }},
    { type: 'teach', content: {
      title: 'The object can hide in the verb',
      explanation: 'An attached pronoun on a verb is a maf‘ūl:\n\nخَلَقَ**هُ** = "He created **him**"\nأَنْزَلْنَا**هُ** = "We sent **it** down"\n\nThe ـهُ is the object riding on the verb.',
      arabic: 'خَلَقَهُ · أَنْزَلْنَاهُ',
      transliteration: 'khalaqahu · anzalnaahu',
      examples: [
        { ar: 'هَدَانَا', tr: 'hadaanaa', en: 'He guided us (نَا = object)' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'In خَلَقَ اللّٰهُ الْإِنْسَانَ, which word is the maf‘ūl (the receiver)?',
      options: [
        { text: 'الْإِنْسَانَ (mankind — with a fatḥa)', correct: true },
        { text: 'اللّٰهُ (Allah)', correct: false },
        { text: 'خَلَقَ (created)', correct: false },
      ],
      explanation: 'Allah (ḍamma) is the doer; الْإِنْسَانَ (fatḥa) is what was created — the maf‘ūl.',
    }},
    { type: 'classify', content: {
      instruction: 'Doer (fā‘il, ḍamma) or receiver (maf‘ūl, fatḥa)?',
      categories: ['fā‘il (doer)', 'maf‘ūl (receiver)'],
      items: [
        { text: 'اللّٰهُ (in خَلَقَ اللّٰهُ السَّمَاوَاتِ)', category: 'fā‘il (doer)' },
        { text: 'السَّمَاوَاتِ (same sentence)', category: 'maf‘ūl (receiver)' },
        { text: 'الْكِتَابَ (in أَنْزَلَ الْكِتَابَ)', category: 'maf‘ūl (receiver)' },
        { text: 'الصَّلَاةَ (in يُقِيمُونَ الصَّلَاةَ)', category: 'maf‘ūl (receiver)' },
      ],
      explanation: 'ḍamma → doer; fatḥa → receiver. The vowels are the key.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'أَنْزَلْنَاهُ = "We sent ___ down". The هُ is the maf‘ūl (object).',
      correct_answer: 'it',
      options: ['it', 'you', 'us'],
      explanation: 'أَنْزَلْنَا (we sent down) + هُ (it) — the object is the Quran. Al-Qadr 97:1.',
    }},
    { type: 'teach', content: {
      title: 'Doer + receiver: mastered',
      explanation: 'fā‘il does, maf‘ūl receives — spotted by ḍamma vs fatḥa. Next: the little word that links whole clauses — الَّذِي.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U18_L4 = { // Who's who — relative clauses
  steps: [
    { type: 'teach', content: {
      title: '"The one who…" — al-ladhī',
      explanation: '**الَّذِي** = "the one who / which" (for one masculine)\n**الَّذِينَ** = "those who" (for a masculine group)\n\nThey introduce a clause describing someone:\n\nالَّذِينَ آمَنُوا = "those who believed".',
      arabic: 'الَّذِي · الَّذِينَ',
      transliteration: 'alladhee · alladheena',
      examples: [
        { ar: 'الَّذِي خَلَقَ', tr: 'alladhee khalaq', en: 'the One who created' },
        { ar: 'الَّذِينَ آمَنُوا', tr: 'alladheena aamanoo', en: 'those who believed' },
      ],
      fun_fact: 'الَّذِينَ آمَنُوا ("those who believed") appears over 250 times — the Quran’s name for the believers.',
    }},
    { type: 'mcq', content: {
      question: 'الَّذِينَ آمَنُوا means...',
      options: [
        { text: 'those who believed', correct: true },
        { text: 'the one who believed', correct: false },
        { text: 'he believes', correct: false },
      ],
      explanation: 'الَّذِينَ = "those who" (plural). آمَنُوا = "they believed".',
    }},
    { type: 'fill_blank', content: {
      sentence: 'اقْرَأْ بِاسْمِ رَبِّكَ ___ خَلَقَ — "Read in the name of your Lord WHO created" (Al-Alaq 96:1).',
      correct_answer: 'الَّذِي',
      options: ['الَّذِي', 'الَّذِينَ', 'هُوَ'],
      explanation: 'الَّذِي = "who" (one). "…your Lord, the One who created."',
    }},
    { type: 'match', content: {
      instruction: 'Match the relative word to its use',
      pairs: [
        { left: 'الَّذِي', right: 'the one who (m, singular)' },
        { left: 'الَّذِينَ', right: 'those who (m, plural)' },
        { left: 'الَّتِي', right: 'the one who (f, singular)' },
      ],
    }},
    { type: 'classify', content: {
      instruction: 'One person, or a group?',
      categories: ['One (الَّذِي)', 'A group (الَّذِينَ)'],
      items: [
        { text: 'الَّذِي خَلَقَ', category: 'One (الَّذِي)' },
        { text: 'الَّذِينَ آمَنُوا', category: 'A group (الَّذِينَ)' },
        { text: 'الَّذِينَ كَفَرُوا', category: 'A group (الَّذِينَ)' },
      ],
      explanation: 'الَّذِي = one; الَّذِينَ = many.',
    }},
    { type: 'teach', content: {
      title: 'Clauses connected',
      explanation: 'الَّذِي / الَّذِينَ stitch descriptions onto nouns. Next: the graduation — a full verb-sentence ayah from Al-Baqarah.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U18_L5 = { // Read the Quran: Al-Baqarah 3
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — Al-Baqarah 3',
      explanation: '**الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ**\n"Those who believe in the unseen and establish the prayer."',
      arabic: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ',
      transliteration: 'alladheena yu’minoona bil-ghaybi wa yuqeemoonas-salaah',
      quran_ref: 'Al-Baqarah 2:3',
    }},
    { type: 'mcq', content: {
      question: 'الَّذِينَ يُؤْمِنُونَ means...',
      options: [
        { text: 'those who believe', correct: true },
        { text: 'the one who believes', correct: false },
        { text: 'they believed (past)', correct: false },
      ],
      explanation: 'الَّذِينَ (those who) + يُؤْمِنُونَ (they believe — present). A relative clause.',
    }},
    { type: 'mcq', content: {
      question: 'In وَيُقِيمُونَ الصَّلَاةَ, what is الصَّلَاةَ (with a fatḥa)?',
      options: [
        { text: 'the maf‘ūl — what they establish (the prayer)', correct: true },
        { text: 'the fā‘il — the doer', correct: false },
        { text: 'a preposition', correct: false },
      ],
      explanation: 'الصَّلَاةَ takes a fatḥa → it’s the object (maf‘ūl) of "establish".',
    }},
    { type: 'classify', content: {
      instruction: 'Label each piece of the ayah',
      categories: ['Relative word', 'Verb (they…)', 'Object (maf‘ūl)', 'Preposition phrase'],
      items: [
        { text: 'الَّذِينَ (those who)', category: 'Relative word' },
        { text: 'يُؤْمِنُونَ (they believe)', category: 'Verb (they…)' },
        { text: 'بِالْغَيْبِ (in the unseen)', category: 'Preposition phrase' },
        { text: 'الصَّلَاةَ (the prayer)', category: 'Object (maf‘ūl)' },
      ],
      explanation: 'You just parsed a real ayah into its grammatical roles — relative, verb, object, and prepositional phrase.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'يُؤْمِنُونَ and يُقِيمُونَ both end in ـُونَ, marking them as ___ present verbs.',
      correct_answer: 'plural',
      options: ['plural', 'past', 'singular'],
      explanation: 'Your Stage-4 present plural: "they believe", "they establish".',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 18 complete!',
      explanation: 'You find the verb, the doer (fā‘il), the object (maf‘ūl), and relative clauses in real ayat.\n\nFinal unit of Part A: **Read Like a Scholar** — full parses of the surahs you know by heart.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 19 — Read Like a Scholar (capstone) — checkpoint after
// ═══════════════════════════════════════════════════════════════

const U19_L1 = { // Al-Fatiha full parse
  steps: [
    { type: 'teach', content: {
      title: 'Parse Al-Fatiha like a scholar 📖',
      explanation: 'You now know every tool in Al-Fatiha: definiteness, iḍāfa, adjectives, pronouns, prepositions, verbs, and sentence structure. Let’s parse it.',
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: 'al-hamdu lillaahi rabbil-‘aalameen',
      quran_ref: 'Al-Fatiha 1:1–7',
    }},
    { type: 'classify', content: {
      instruction: 'Label these pieces of Al-Fatiha',
      categories: ['Iḍāfa (of)', 'Adjective', 'Verb', 'Preposition phrase'],
      items: [
        { text: 'رَبِّ الْعَالَمِينَ (Lord of the worlds)', category: 'Iḍāfa (of)' },
        { text: 'الرَّحْمٰنِ الرَّحِيمِ (Most/Especially Merciful)', category: 'Adjective' },
        { text: 'نَعْبُدُ (we worship)', category: 'Verb' },
        { text: 'صِرَاطَ الَّذِينَ (path of those…)', category: 'Iḍāfa (of)' },
      ],
      explanation: 'Every structure you learned, in the surah you recite most.',
    }},
    { type: 'mcq', content: {
      question: 'إِيَّاكَ نَعْبُدُ — نَعْبُدُ is which kind of verb?',
      options: [
        { text: 'present, "we" (نَـ prefix)', correct: true },
        { text: 'past, "they"', correct: false },
        { text: 'a command', correct: false },
      ],
      explanation: 'نَعْبُدُ = "we worship" — present tense, نَـ = we.',
    }},
    { type: 'mcq', content: {
      question: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ — اهْدِنَا is...',
      options: [
        { text: 'a command + object: "Guide us!"', correct: true },
        { text: 'a nominal sentence', correct: false },
      ],
      explanation: 'اهْدِ (Guide!) + نَا (us) = "Guide us". الصِّرَاطَ الْمُسْتَقِيمَ (the straight path) is the maf‘ūl.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'مَالِكِ يَوْمِ الدِّينِ is an iḍāfa chain meaning "Master of the Day of ___".',
      correct_answer: 'Judgment',
      options: ['Judgment', 'the worlds', 'mercy'],
      explanation: 'الدِّين here = "the Judgment / Recompense".',
    }},
    { type: 'teach', content: {
      title: 'Al-Fatiha — fully understood',
      explanation: 'You can now parse the Opening of the Book. Next: three short surahs, top to bottom.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U19_L2 = { // Al-Ikhlas + Al-Kawthar + Al-Asr
  steps: [
    { type: 'teach', content: {
      title: 'Three surahs, fully parsed 📖',
      explanation: 'Al-Ikhlas (oneness), Al-Kawthar (abundance), Al-Asr (time) — short, mighty, and now transparent to you.',
      arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
      transliteration: 'innaa a‘taynaakal-kawthar',
      quran_ref: 'Al-Kawthar 108:1',
    }},
    { type: 'mcq', content: {
      question: 'إِنَّا أَعْطَيْنَاكَ = إِنَّا + أَعْطَيْنَا + كَ. What is the كَ?',
      options: [
        { text: 'the object "you" — "We gave YOU"', correct: true },
        { text: 'the doer', correct: false },
        { text: '"your"', correct: false },
      ],
      explanation: 'أَعْطَيْنَا (We gave) + كَ (you) = "We gave you". الْكَوْثَرَ is the second object.',
    }},
    { type: 'mcq', content: {
      question: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ — فَصَلِّ begins with فَ. It means...',
      options: [
        { text: 'so pray (فَ = "so" + command "pray")', correct: true },
        { text: 'he prayed', correct: false },
      ],
      explanation: 'Your Stage-3 فَ ("so") + the command صَلِّ ("pray"): "So pray to your Lord."',
    }},
    { type: 'classify', content: {
      instruction: 'Verb sentence or nominal sentence?',
      categories: ['Verb sentence', 'Nominal sentence'],
      items: [
        { text: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', category: 'Verb sentence' },
        { text: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ', category: 'Nominal sentence' },
        { text: 'فَصَلِّ لِرَبِّكَ', category: 'Verb sentence' },
      ],
      explanation: 'أَعْطَيْنَا and صَلِّ are verbs; إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ is a nominal sentence (inna + noun + khabar).',
    }},
    { type: 'fill_blank', content: {
      sentence: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ — إِنَّ makes الْإِنْسَان take a ___.',
      correct_answer: 'fatḥa',
      options: ['fatḥa', 'ḍamma', 'kasra'],
      explanation: 'الْإِنْسَانَ (fatḥa) is the subject of إِنَّ — the flip you learned in Unit 17.',
    }},
    { type: 'teach', content: {
      title: 'Three surahs — transparent',
      explanation: 'Oneness, abundance, and time — parsed. Next: the two surahs of protection.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U19_L3 = { // An-Nas + Al-Falaq
  steps: [
    { type: 'teach', content: {
      title: 'The surahs of refuge 📖',
      explanation: 'Al-Falaq and An-Nas — recited for protection every night. You now understand every word.',
      arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
      transliteration: 'qul a‘oodhu birabbin-naas',
      quran_ref: 'An-Nas 114:1',
    }},
    { type: 'mcq', content: {
      question: 'قُلْ أَعُوذُ — قُلْ is a command and أَعُوذُ is...',
      options: [
        { text: 'present "I" — "I seek refuge" (أَ prefix)', correct: true },
        { text: 'past "he sought"', correct: false },
        { text: 'a command', correct: false },
      ],
      explanation: 'أَعُوذُ = "I seek refuge" — the أَ prefix marks "I".',
    }},
    { type: 'classify', content: {
      instruction: 'Label the pieces of An-Nas / Al-Falaq',
      categories: ['Command', 'Preposition phrase', 'Iḍāfa'],
      items: [
        { text: 'قُلْ (Say!)', category: 'Command' },
        { text: 'بِرَبِّ النَّاسِ (with the Lord of mankind)', category: 'Iḍāfa' },
        { text: 'مِنْ شَرِّ (from the evil of)', category: 'Preposition phrase' },
        { text: 'مَلِكِ النَّاسِ (King of mankind)', category: 'Iḍāfa' },
      ],
      explanation: 'رَبِّ النَّاسِ, مَلِكِ النَّاسِ, إِلَٰهِ النَّاسِ — three iḍāfas naming Allah.',
    }},
    { type: 'mcq', content: {
      question: 'مِنَ الْجِنَّةِ وَالنَّاسِ — the وَ here means...',
      options: [
        { text: 'and — "the jinn AND mankind"', correct: true },
        { text: 'by (oath)', correct: false },
      ],
      explanation: 'Mid-sentence وَ = "and". Your Stage-3 connector.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ — الَّذِي means "the one ___".',
      correct_answer: 'who',
      options: ['who', 'that time', 'from'],
      explanation: 'الَّذِي (who) + يُوَسْوِسُ (whispers) — a relative clause describing the whisperer.',
    }},
    { type: 'teach', content: {
      title: 'The protective surahs — understood',
      explanation: 'You recite them with full meaning now. Next: the summit — Āyat al-Kursī.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U19_L4 = { // Ayat al-Kursi part 1
  steps: [
    { type: 'teach', content: {
      title: 'The greatest ayah — part 1 📖',
      explanation: 'Āyat al-Kursī (Al-Baqarah 2:255), the greatest verse in the Quran. Piece by piece:\n\n**اللّٰهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ**\n"Allah — there is no god except Him — the Ever-Living, the Sustainer."',
      arabic: 'اللّٰهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
      transliteration: 'allaahu laa ilaaha illaa huwal-hayyul-qayyoom',
      quran_ref: 'Al-Baqarah 2:255',
    }},
    { type: 'mcq', content: {
      question: 'لَا إِلَٰهَ إِلَّا هُوَ means...',
      options: [
        { text: 'there is no god except Him', correct: true },
        { text: 'He is the only god they worship', correct: false },
      ],
      explanation: 'Your Stage-3 pattern: لَا (no) + إِلَٰهَ (god) + إِلَّا (except) + هُوَ (Him).',
    }},
    { type: 'mcq', content: {
      question: 'الْحَيُّ الْقَيُّومُ ("the Ever-Living, the Sustainer") are...',
      options: [
        { text: 'adjectives / Names describing Allah', correct: true },
        { text: 'verbs', correct: false },
        { text: 'an iḍāfa', correct: false },
      ],
      explanation: 'Two of Allah’s Names as khabar/adjectives — both definite (ال) and marfū‘.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ — لَهُ means "to ___ belongs".',
      correct_answer: 'Him',
      options: ['Him', 'them', 'us'],
      explanation: 'لَ (to) + هُ (Him) = "To Him belongs whatever is in the heavens and the earth."',
    }},
    { type: 'classify', content: {
      instruction: 'Label the grammar in Āyat al-Kursī',
      categories: ['Negation + exception', 'Name/adjective', 'Preposition phrase'],
      items: [
        { text: 'لَا إِلَٰهَ إِلَّا هُوَ', category: 'Negation + exception' },
        { text: 'الْحَيُّ الْقَيُّومُ', category: 'Name/adjective' },
        { text: 'فِي السَّمَاوَاتِ', category: 'Preposition phrase' },
      ],
      explanation: 'The greatest ayah, resolving into structures you know.',
    }},
    { type: 'teach', content: {
      title: 'Almost there',
      explanation: 'You’ve parsed the opening of Āyat al-Kursī. The final lesson — a legendary challenge — takes on the whole verse.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U19_L5 = { // Legendary: Ayat al-Kursi complete
  steps: [
    { type: 'teach', content: {
      title: '⭐ Legendary: Āyat al-Kursī, complete',
      explanation: 'The summit of Part A. Everything you’ve learned, applied to the greatest verse in the Quran — start to finish.',
      arabic: 'وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ',
      transliteration: 'wasi‘a kursiyyuhus-samaawaati wal-ard',
      quran_ref: 'Al-Baqarah 2:255',
    }},
    { type: 'mcq', content: {
      question: 'لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ — "Neither drowsiness nor sleep OVERTAKES Him." تَأْخُذُهُ is...',
      options: [
        { text: 'present verb + object هُ ("takes Him")', correct: true },
        { text: 'a noun', correct: false },
        { text: 'a command', correct: false },
      ],
      explanation: 'تَأْخُذُ (takes) + هُ (Him). لَا negates it: "does not overtake Him."',
    }},
    { type: 'mcq', content: {
      question: 'وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ — which is the maf‘ūl (what His Throne encompasses)?',
      options: [
        { text: 'السَّمَاوَاتِ وَالْأَرْضَ (the heavens and the earth)', correct: true },
        { text: 'كُرْسِيُّهُ (His Throne)', correct: false },
      ],
      explanation: 'كُرْسِيُّهُ (His Throne) is the fā‘il (ḍamma); السَّمَاوَاتِ وَالْأَرْضَ is the maf‘ūl (fatḥa).',
    }},
    { type: 'mcq', content: {
      question: 'مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ — مَنْ here means...',
      options: [
        { text: 'who? (a question)', correct: true },
        { text: 'from', correct: false },
      ],
      explanation: 'مَنْ = "who" — "WHO is it that can intercede with Him except by His permission?"',
    }},
    { type: 'classify', content: {
      instruction: 'Final parse — label these pieces',
      categories: ['Verb + object', 'Name/adjective', 'Negation', 'Iḍāfa / possessive'],
      items: [
        { text: 'تَأْخُذُهُ (overtakes Him)', category: 'Verb + object' },
        { text: 'الْحَيُّ الْقَيُّومُ (Ever-Living, Sustainer)', category: 'Name/adjective' },
        { text: 'لَا سِنَةٌ وَلَا نَوْمٌ (no drowsiness, no sleep)', category: 'Negation' },
        { text: 'كُرْسِيُّهُ (His Throne)', category: 'Iḍāfa / possessive' },
      ],
      explanation: 'The greatest ayah, fully resolved into the grammar of Part A.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'وَهُوَ الْعَلِيُّ الْعَظِيمُ — "And He is the Most High, the ___."',
      correct_answer: 'Most Great',
      options: ['Most Great', 'Most Merciful', 'the Book'],
      explanation: 'الْعَظِيم = the Most Great — a nominal sentence closing the ayah: هُوَ (He) + two Names.',
    }},
    { type: 'teach', content: {
      title: '🏆 PART A COMPLETE — You read the Quran’s grammar!',
      explanation: 'From "what is an ism?" to parsing Āyat al-Kursī. You now recognize a huge share of Quranic words and can find the subject, verb, object, and description in real ayat.\n\nThis is exactly where a classical student stands before deep study. **Part B — the mastery track — awaits: full i‘rāb, inna & kāna & their sisters, the 10 verb forms, and more.** May Allah make you of the people of the Quran.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// Vocabulary
// ═══════════════════════════════════════════════════════════════

const U17_VOCAB = [
  ['أَكْبَر', 'akbar', 'greater / greatest', 'ism', 'masculine', 'singular', 'Al-Ankabut 29:45', 1],
  ['غَفُور', 'ghafoor', 'Forgiving', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:173', 1],
  ['الصَّمَد', 'as-samad', 'the Eternal Refuge', 'ism', 'masculine', 'singular', 'Al-Ikhlas 112:2', 1],
  ['الصَّابِرِين', 'as-saabireen', 'the patient ones', 'ism', 'masculine', 'plural', 'Al-Baqarah 2:153', 1],
  ['إِنَّ', 'inna', 'indeed / truly', 'harf', null, null, 'Al-Baqarah 2:20', 1],
];

const U18_VOCAB = [
  ['الَّذِي', 'alladhee', 'the one who (m)', 'ism', 'masculine', 'singular', 'Al-Alaq 96:1', 1],
  ['الَّذِينَ', 'alladheena', 'those who (m pl)', 'ism', 'masculine', 'plural', 'Al-Baqarah 2:3', 1],
  ['الَّتِي', 'allatee', 'the one who (f)', 'ism', 'feminine', 'singular', 'Al-Baqarah 2:24', 2],
  ['الْغَيْب', 'al-ghayb', 'the unseen', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:3', 1],
  ['يُقِيمُونَ', 'yuqeemoon', 'they establish', 'feel', null, null, 'Al-Baqarah 2:3', 1],
  ['جَاءَ', 'jaa’a', 'he/it came', 'feel', null, null, 'An-Nasr 110:1', 1],
];

const U19_VOCAB = [
  ['الْحَيّ', 'al-hayy', 'the Ever-Living', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:255', 1],
  ['الْقَيُّوم', 'al-qayyoom', 'the Sustainer', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:255', 1],
  ['كُرْسِيّ', 'kursiyy', 'throne / footstool', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:255', 2],
  ['الْكَوْثَر', 'al-kawthar', 'abundance (a river in Paradise)', 'ism', 'masculine', 'singular', 'Al-Kawthar 108:1', 2],
  ['الْعَلِيّ', 'al-‘aliyy', 'the Most High', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:255', 1],
  ['أَعُوذُ', 'a‘oodhu', 'I seek refuge', 'feel', null, null, 'An-Nas 114:1', 1],
];

// ═══════════════════════════════════════════════════════════════
// Seeding
// ═══════════════════════════════════════════════════════════════

const UNIT_DEFS = [
  [17, 'jumla-ismiyya', 'Sentences Without "Is"', 'الجُمْلَة الاِسْمِيَّة', '🟰', '#5FB57A', false, 'Nominal sentences: mubtada + khabar, and the emphasizer إِنَّ.'],
  [18, 'jumla-filiyya', 'Verb Sentences',          'الجُمْلَة الفِعْلِيَّة', '🎬', '#6BA8D4', false, 'Verb sentences: the doer (fā‘il), the object (maf‘ūl), and relative clauses.'],
  [19, 'read-like-scholar', 'Read Like a Scholar',  'القِرَاءَة', '🎓', '#D4A246', true, 'Capstone: full word-by-word parses, ending with Āyat al-Kursī.'],
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

  // [unitSort, slug, title, sortOrder, content, xp, lessonType]
  const lessons = [
    [17, 'no-is', 'Arabic Has No "Is"', 1, U17_L1, 15, 'standard'],
    [17, 'pronoun-sentences', 'Pronoun Sentences', 2, U17_L2, 15, 'standard'],
    [17, 'inna', 'إِنَّ the Emphasizer', 3, U17_L3, 15, 'standard'],
    [17, 'read-quran-ikhlas-full', 'Read the Quran: Al-Ikhlas', 4, U17_L4, 20, 'standard'],

    [18, 'verb-first', 'The Verb Goes First', 1, U18_L1, 15, 'standard'],
    [18, 'the-doer', 'Finding the Doer (fā‘il)', 2, U18_L2, 15, 'standard'],
    [18, 'the-object', 'The Object (maf‘ūl)', 3, U18_L3, 15, 'standard'],
    [18, 'relative-clauses', "Who's Who — الَّذِي", 4, U18_L4, 15, 'standard'],
    [18, 'read-quran-baqarah3', 'Read the Quran: Al-Baqarah 3', 5, U18_L5, 20, 'standard'],

    [19, 'parse-fatiha', 'Parse Al-Fatiha', 1, U19_L1, 20, 'standard'],
    [19, 'parse-short-surahs', 'Three Surahs, Parsed', 2, U19_L2, 20, 'standard'],
    [19, 'parse-protection', 'The Surahs of Refuge', 3, U19_L3, 20, 'standard'],
    [19, 'ayat-al-kursi-1', 'Āyat al-Kursī (Part 1)', 4, U19_L4, 20, 'standard'],
    [19, 'ayat-al-kursi-legendary', 'Āyat al-Kursī — Complete', 5, U19_L5, 40, 'legendary'],
  ];

  for (const [unitSort, slug, title, sortOrder, content, xp, lessonType] of lessons) {
    const unitId = unitIdBySort[unitSort];
    await sql`
      INSERT INTO learning_lessons (unit_id, slug, title, sort_order, lesson_type, content, xp_reward)
      VALUES (${unitId}, ${slug}, ${title}, ${sortOrder}, ${lessonType}, ${sql.json(content)}, ${xp})
      ON CONFLICT (unit_id, slug) DO UPDATE SET
        title = EXCLUDED.title, sort_order = EXCLUDED.sort_order, lesson_type = EXCLUDED.lesson_type,
        content = EXCLUDED.content, xp_reward = EXCLUDED.xp_reward`;
    console.log(`  ✓ U${unitSort} ${title} (${content.steps.length} steps, ${xp} XP${lessonType !== 'standard' ? ', ' + lessonType : ''})`);
  }

  const vocabByUnit = [[17, U17_VOCAB], [18, U18_VOCAB], [19, U19_VOCAB]];
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

  // Backfill: unlock Unit 17 L1 for users who finished ALL of Unit 16
  const [firstU17] = await sql`
    SELECT id FROM learning_lessons WHERE unit_id = ${unitIdBySort[17]} ORDER BY sort_order LIMIT 1`;
  const unlocked = await sql`
    WITH unit16 AS (
      SELECT l.id FROM learning_lessons l
      JOIN learning_units u ON u.id = l.unit_id
      WHERE u.sort_order = 16
    ),
    finishers AS (
      SELECT p.user_id FROM user_lesson_progress p
      JOIN unit16 ON unit16.id = p.lesson_id
      WHERE p.status = 'completed'
      GROUP BY p.user_id
      HAVING count(*) = (SELECT count(*) FROM unit16)
    )
    INSERT INTO user_lesson_progress (user_id, lesson_id, status)
    SELECT f.user_id, ${firstU17.id}, 'available' FROM finishers f
    ON CONFLICT (user_id, lesson_id) DO NOTHING
    RETURNING user_id`;
  console.log(`  ✓ Unlocked Unit 17 Lesson 1 for ${unlocked.length} users who had finished Unit 16`);

  const check = await sql`
    SELECT u.sort_order, u.title, count(l.id)::int AS lessons
    FROM learning_units u LEFT JOIN learning_lessons l ON l.unit_id = u.id
    GROUP BY u.sort_order, u.title ORDER BY u.sort_order`;
  console.log('\nFinal state:');
  for (const c of check) console.log(`  #${c.sort_order} ${c.title}: ${c.lessons} lessons`);
  const [tot] = await sql`SELECT count(*)::int u FROM learning_units`;
  const [tl] = await sql`SELECT count(*)::int l FROM learning_lessons`;
  console.log(`\nTOTAL: ${tot.u} units, ${tl.l} lessons — Part A complete.`);
}

main()
  .then(() => sql.end())
  .catch(async (e) => { console.error('SEED FAILED:', e.message); await sql.end(); process.exit(1); });
