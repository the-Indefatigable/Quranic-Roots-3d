/**
 * PART B — Stage 8: INNA & KANA AND THEIR SISTERS — Units 25–28.
 *   25 كان وأخواتها (raises subject, naṣbs predicate)
 *   26 إنّ وأخواتها (naṣbs subject, raises predicate — the mirror)
 *   27 ظنّ وأخواتها (verbs of the heart — two objects)
 *   28 كاد وأخواتها (verbs of nearness/beginning) — checkpoint_after
 * Idempotent; existing step engine. Run: DATABASE_URL=... node scripts/seed-stage-8.mjs
 */
import postgres from 'postgres';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

const U25_L1 = { steps: [
  { type: 'teach', content: { title: 'كَانَ changes the sentence', explanation: 'A nominal sentence (mubtada + khabar, both raf‘) can be entered by **كَانَ** ("was"). It keeps the subject in **raf‘** (now called *ism kāna*) but pushes the predicate into **naṣb** (*khabar kāna*):\n\nاللّٰهُ غَفُورٌ → **كَانَ اللّٰهُ غَفُورًا**', arabic: 'كَانَ اللّٰهُ غَفُورًا رَحِيمًا', transliteration: 'kaanallaahu ghafooran raheeman', examples: [ { ar: 'اللّٰهُ (ism kāna)', tr: 'raf‘', en: 'subject stays ḍamma' }, { ar: 'غَفُورًا (khabar kāna)', tr: 'naṣb', en: 'predicate → fatḥa' } ], fun_fact: 'كَانَ is called a "deficient verb" — it adds time but needs a subject AND a predicate to complete its meaning.' } },
  { type: 'mcq', content: { question: 'In كَانَ اللّٰهُ غَفُورًا, why is غَفُورًا in naṣb (fatḥa)?', options: [ { text: 'It is the khabar of كَانَ (predicate → naṣb)', correct: true }, { text: 'It is the object of a verb', correct: false }, { text: 'It follows a preposition', correct: false } ], explanation: 'كَانَ raises the subject and naṣbs the predicate. غَفُورًا = khabar kāna.' } },
  { type: 'classify', content: { instruction: 'After كَانَ: subject (raf‘) or predicate (naṣb)?', categories: ['ism kāna — raf‘', 'khabar kāna — naṣb'], items: [ { text: 'اللّٰهُ (in كَانَ اللّٰهُ عَلِيمًا)', category: 'ism kāna — raf‘' }, { text: 'عَلِيمًا', category: 'khabar kāna — naṣb' }, { text: 'حَكِيمًا', category: 'khabar kāna — naṣb' } ], explanation: 'Subject keeps its ḍamma; the predicate takes fatḥa.' } },
  { type: 'fill_blank', content: { sentence: 'كَانَ keeps the subject in raf‘ but puts the predicate into ___.', correct_answer: 'naṣb', options: ['naṣb', 'raf‘', 'jarr'], explanation: 'ism kāna = raf‘, khabar kāna = naṣb.' } },
  { type: 'teach', content: { title: 'كَانَ, understood', explanation: 'Raises the subject, naṣbs the predicate. Next: كَانَ’s sisters of being and becoming.', arabic: null, transliteration: null } },
]};
const U25_L2 = { steps: [
  { type: 'teach', content: { title: 'The sisters of becoming', explanation: 'كَانَ has a family that works identically (raise subject, naṣb predicate):\n\n**أَصْبَحَ** (became / in the morning) · **أَمْسَىٰ** (became / in the evening) · **صَارَ** (became) · **ظَلَّ** (kept on) · **بَاتَ** (spent the night)', arabic: 'أَصْبَحَ · صَارَ · ظَلَّ', transliteration: 'aṣbaḥa · ṣaara · ẓalla', examples: [ { ar: 'فَأَصْبَحُوا خَاسِرِينَ', tr: 'fa-aṣbaḥoo khaasireen', en: 'they became losers' }, { ar: 'ظَلَّ وَجْهُهُ مُسْوَدًّا', tr: 'ẓalla wajhuhu muswaddan', en: 'his face stayed darkened' } ], fun_fact: 'خَاسِرِينَ ends in ينَ — the sound-plural naṣb sign — because it is a khabar of أَصْبَحَ.' } },
  { type: 'mcq', content: { question: 'صَارَ means...', options: [ { text: 'became', correct: true }, { text: 'said', correct: false }, { text: 'created', correct: false } ], explanation: 'صَارَ ("became") is a sister of كَانَ — same grammar.' } },
  { type: 'match', content: { instruction: 'Match the sister of كَانَ to its meaning', pairs: [ { left: 'أَصْبَحَ', right: 'became (morning)' }, { left: 'صَارَ', right: 'became' }, { left: 'ظَلَّ', right: 'kept on' }, { left: 'بَاتَ', right: 'spent the night' } ] } },
  { type: 'classify', content: { instruction: 'Is it a sister of كَانَ (raises + naṣbs) or an ordinary verb?', categories: ['Sister of كَانَ', 'Ordinary verb'], items: [ { text: 'أَصْبَحَ', category: 'Sister of كَانَ' }, { text: 'صَارَ', category: 'Sister of كَانَ' }, { text: 'خَلَقَ', category: 'Ordinary verb' }, { text: 'ظَلَّ', category: 'Sister of كَانَ' } ], explanation: 'The sisters describe a state of being/becoming; ordinary verbs describe an action on an object.' } },
  { type: 'teach', content: { title: 'The becoming-family', explanation: 'أصبح، أمسى، صار، ظلّ، بات — all like كَانَ. Next: negation and "still/as long as".', arabic: null, transliteration: null } },
]};
const U25_L3 = { steps: [
  { type: 'teach', content: { title: 'لَيْسَ and the "still" sisters', explanation: '**لَيْسَ** = "is not" — the negating sister:\n\nلَيْسَ كَمِثْلِهِ شَيْءٌ — "there is nothing like Him."\n\nAlso **مَا زَالَ** (still is) and **مَا دَامَ** (as long as) work the same way.', arabic: 'لَيْسَ كَمِثْلِهِ شَيْءٌ', transliteration: 'laysa kamithlihi shay’', examples: [ { ar: 'لَيْسَ', tr: 'laysa', en: 'is not' }, { ar: 'مَا دَامَ', tr: 'maa daama', en: 'as long as [he] remains' } ], fun_fact: 'لَيْسَ negates the present: "is/are not". It still raises a subject and naṣbs a predicate.' } },
  { type: 'mcq', content: { question: 'لَيْسَ means...', options: [ { text: 'is not / are not', correct: true }, { text: 'became', correct: false }, { text: 'as long as', correct: false } ], explanation: 'لَيْسَ is the negating sister of كَانَ — "is not".' } },
  { type: 'fill_blank', content: { sentence: 'لَيْسَ كَمِثْلِهِ شَيْءٌ — "There is ___ like Him" (Ash-Shura 42:11).', correct_answer: 'nothing', options: ['nothing', 'someone', 'everything'], explanation: 'لَيْسَ negates: "nothing is like Him". شَيْءٌ (raf‘) is the ism of لَيْسَ.' } },
  { type: 'classify', content: { instruction: 'Sort the كَانَ family by meaning', categories: ['Being/becoming', 'Negation (is not)', 'Continuation (still/as long as)'], items: [ { text: 'صَارَ', category: 'Being/becoming' }, { text: 'لَيْسَ', category: 'Negation (is not)' }, { text: 'مَا زَالَ', category: 'Continuation (still/as long as)' }, { text: 'أَصْبَحَ', category: 'Being/becoming' } ], explanation: 'All raise the subject and naṣb the predicate; they differ only in meaning.' } },
  { type: 'teach', content: { title: 'The whole كَانَ family', explanation: 'Being, becoming, negating, continuing — one grammar. Next: read كَانَ in the Quran.', arabic: null, transliteration: null } },
]};
const U25_L4 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — كَانَ اللّٰهُ...', explanation: '**وَكَانَ اللّٰهُ غَفُورًا رَحِيمًا** — "And Allah is ever Forgiving, Merciful." (An-Nisa 4:96)', arabic: 'وَكَانَ اللّٰهُ غَفُورًا رَحِيمًا', transliteration: 'wa kaanallaahu ghafooran raheeman', quran_ref: 'An-Nisa 4:96' } },
  { type: 'classify', content: { instruction: 'Tag the roles after كَانَ', categories: ['ism kāna — raf‘', 'khabar kāna — naṣb'], items: [ { text: 'اللّٰهُ', category: 'ism kāna — raf‘' }, { text: 'غَفُورًا', category: 'khabar kāna — naṣb' }, { text: 'رَحِيمًا', category: 'khabar kāna — naṣb' } ], explanation: 'Allah (ḍamma) is the subject; the two Names (fatḥa) are the predicate of كَانَ.' } },
  { type: 'mcq', content: { question: 'وَكَانَ رَبُّكَ قَدِيرًا — قَدِيرًا is fatḥa because...', options: [ { text: 'it is the khabar of كَانَ', correct: true }, { text: 'it is the object', correct: false } ], explanation: 'khabar kāna → naṣb → fatḥa.' } },
  { type: 'fill_blank', content: { sentence: 'إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا — كِتَابًا is the khabar of كَانَتْ, so it is in ___.', correct_answer: 'naṣb', options: ['naṣb', 'raf‘', 'jarr'], explanation: 'Even with كَانَتْ (she was), the predicate كِتَابًا takes naṣb.' } },
  { type: 'teach', content: { title: '🎉 Unit 25 complete!', explanation: 'كَانَ and her sisters bend a sentence’s cases. Next: their mirror image — إِنَّ and HER sisters.', arabic: null, transliteration: null } },
]};

const U26_L1 = { steps: [
  { type: 'teach', content: { title: 'إِنَّ — the mirror of كَانَ', explanation: 'Where كَانَ raises the subject and naṣbs the predicate, **إِنَّ does the OPPOSITE**: it naṣbs the subject (*ism inna*) and raises the predicate (*khabar inna*):\n\n**إِنَّ اللّٰهَ غَفُورٌ رَحِيمٌ** — اللّٰهَ (naṣb) · غَفُورٌ (raf‘).', arabic: 'إِنَّ اللّٰهَ غَفُورٌ', transliteration: 'innallaaha ghafoorun', examples: [ { ar: 'اللّٰهَ (ism inna)', tr: 'naṣb', en: 'subject → fatḥa' }, { ar: 'غَفُورٌ (khabar inna)', tr: 'raf‘', en: 'predicate → ḍamma' } ], fun_fact: 'كَانَ: raise→naṣb. إِنَّ: naṣb→raise. Perfect mirrors — learn one and you know the other backwards.' } },
  { type: 'mcq', content: { question: 'How does إِنَّ treat the subject and predicate?', options: [ { text: 'Subject → naṣb, predicate → raf‘', correct: true }, { text: 'Subject → raf‘, predicate → naṣb (like كَانَ)', correct: false }, { text: 'Both → jarr', correct: false } ], explanation: 'إِنَّ is the mirror of كَانَ: it naṣbs the subject, raises the predicate.' } },
  { type: 'classify', content: { instruction: 'After إِنَّ: subject (naṣb) or predicate (raf‘)?', categories: ['ism inna — naṣb', 'khabar inna — raf‘'], items: [ { text: 'اللّٰهَ (in إِنَّ اللّٰهَ عَلِيمٌ)', category: 'ism inna — naṣb' }, { text: 'عَلِيمٌ', category: 'khabar inna — raf‘' }, { text: 'الْإِنْسَانَ (in إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ)', category: 'ism inna — naṣb' } ], explanation: 'إِنَّ + subject(fatḥa) + predicate(ḍamma).' } },
  { type: 'fill_blank', content: { sentence: 'إِنَّ makes its subject take a ___ and its predicate stay in raf‘.', correct_answer: 'naṣb', options: ['naṣb', 'jazm', 'sukūn'], explanation: 'The exact opposite of كَانَ.' } },
  { type: 'teach', content: { title: 'The mirror, seen', explanation: 'إِنَّ naṣbs the subject. Next: أَنَّ and the "moulded maṣdar".', arabic: null, transliteration: null } },
]};
const U26_L2 = { steps: [
  { type: 'teach', content: { title: 'إِنَّ vs أَنَّ', explanation: '**إِنَّ** opens a sentence ("Indeed…"). **أَنَّ** sits mid-sentence and means "that":\n\nأَشْهَدُ **أَنَّ** مُحَمَّدًا رَسُولُ اللّٰهِ — "I bear witness **that** Muhammad is the Messenger of Allah."\n\n"أَنَّ + a sentence" acts as one big noun — a *maṣdar mu’awwal* (moulded verbal noun).', arabic: 'أَنَّ', transliteration: 'anna (that)', examples: [ { ar: 'أَنَّ اللّٰهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', tr: 'anna-llaaha…qadeer', en: 'that Allah is capable of everything' } ], fun_fact: '"أَنْ + verb" and "أَنَّ + sentence" both fold a whole clause into a single noun-like unit.' } },
  { type: 'mcq', content: { question: 'أَنَّ (mid-sentence) means...', options: [ { text: 'that', correct: true }, { text: 'indeed (sentence opener)', correct: false }, { text: 'if', correct: false } ], explanation: 'إِنَّ = "indeed" (opener); أَنَّ = "that" (mid-sentence). Both naṣb their subject.' } },
  { type: 'classify', content: { instruction: 'Sentence-opener or mid-sentence "that"?', categories: ['إِنَّ (Indeed…)', 'أَنَّ (…that…)'], items: [ { text: 'إِنَّ اللّٰهَ غَفُورٌ', category: 'إِنَّ (Indeed…)' }, { text: 'أَشْهَدُ أَنَّ اللّٰهَ…', category: 'أَنَّ (…that…)' }, { text: 'أَعْلَمُ أَنَّكَ صَادِقٌ', category: 'أَنَّ (…that…)' } ], explanation: 'إِنَّ starts the sentence; أَنَّ links a clause inside it.' } },
  { type: 'fill_blank', content: { sentence: '"أَنَّ + a full sentence" behaves like a single noun called a ___ mu’awwal.', correct_answer: 'maṣdar', options: ['maṣdar', 'fā‘il', 'khabar'], explanation: 'The "moulded maṣdar" — a clause packaged as one noun.' } },
  { type: 'teach', content: { title: 'إِنَّ / أَنَّ sorted', explanation: 'Opener vs "that". Next: the rest of the sisters — كأنّ، لكنّ، ليت، لعلّ.', arabic: null, transliteration: null } },
]};
const U26_L3 = { steps: [
  { type: 'teach', content: { title: 'The sisters of إِنَّ', explanation: 'Four more, all naṣb the subject & raise the predicate:\n\n**كَأَنَّ** (as if) · **لَٰكِنَّ** (but) · **لَيْتَ** (if only / would that) · **لَعَلَّ** (perhaps / so that)', arabic: 'كَأَنَّ · لَٰكِنَّ · لَيْتَ · لَعَلَّ', transliteration: 'ka’anna · laakinna · layta · la‘alla', examples: [ { ar: 'لَعَلَّكُمْ تَتَّقُونَ', tr: 'la‘allakum tattaqoon', en: 'so that you may become God-conscious' }, { ar: 'كَأَنَّهُمْ', tr: 'ka’annahum', en: 'as if they…' } ], fun_fact: 'لَعَلَّكُمْ تَتَّقُونَ closes many ayat — "perhaps you will be mindful". لَعَلَّ + كُمْ (ism, naṣb) + a verb-predicate.' } },
  { type: 'mcq', content: { question: 'لَعَلَّ means...', options: [ { text: 'perhaps / so that', correct: true }, { text: 'as if', correct: false }, { text: 'but', correct: false } ], explanation: 'لَعَلَّ = hope/purpose. كَأَنَّ = likeness. لَٰكِنَّ = but. لَيْتَ = wishing.' } },
  { type: 'match', content: { instruction: 'Match the sister of إِنَّ', pairs: [ { left: 'كَأَنَّ', right: 'as if' }, { left: 'لَٰكِنَّ', right: 'but' }, { left: 'لَيْتَ', right: 'if only' }, { left: 'لَعَلَّ', right: 'perhaps' } ] } },
  { type: 'fill_blank', content: { sentence: 'لَعَلَّ__ تَتَّقُونَ — "so that YOU may be mindful". The كُمْ is the ism of لَعَلَّ (naṣb role).', correct_answer: 'كُمْ', options: ['كُمْ', 'هُ', 'نَا'], explanation: 'لَعَلَّكُمْ — the attached pronoun is the ism of لَعَلَّ.' } },
  { type: 'teach', content: { title: 'All the sisters of إِنَّ', explanation: 'كأنّ، لكنّ، ليت، لعلّ — likeness, contrast, wish, hope. Next: read them in the Quran.', arabic: null, transliteration: null } },
]};
const U26_L4 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — with hardship, ease', explanation: '**إِنَّ مَعَ الْعُسْرِ يُسْرًا** — "Indeed, with hardship comes ease." (Ash-Sharh 94:6)', arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', transliteration: 'inna ma‘al-‘usri yusraa', quran_ref: 'Ash-Sharh 94:6' } },
  { type: 'mcq', content: { question: 'In إِنَّ مَعَ الْعُسْرِ يُسْرًا, يُسْرًا ("ease") is naṣb because...', options: [ { text: 'it is the ism of إِنَّ (delayed after the khabar مَعَ الْعُسْرِ)', correct: true }, { text: 'it is the object of a verb', correct: false } ], explanation: 'مَعَ الْعُسْرِ is the fronted khabar; يُسْرًا is the ism of إِنَّ in naṣb.' } },
  { type: 'classify', content: { instruction: 'Tag these ism-inna words (all naṣb)', categories: ['ism inna — naṣb', 'khabar / other'], items: [ { text: 'اللّٰهَ (إِنَّ اللّٰهَ…)', category: 'ism inna — naṣb' }, { text: 'يُسْرًا (إِنَّ مَعَ الْعُسْرِ يُسْرًا)', category: 'ism inna — naṣb' }, { text: 'غَفُورٌ (khabar)', category: 'khabar / other' } ], explanation: 'The ism of إِنَّ carries fatḥa; the khabar stays raf‘.' } },
  { type: 'fill_blank', content: { sentence: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ — إِنَّا = إِنَّ + ___ ("We"), the ism of inna.', correct_answer: 'نَا', options: ['نَا', 'كَ', 'هُ'], explanation: 'إِنَّا = "Indeed We". The نَا is the ism of إِنَّ.' } },
  { type: 'teach', content: { title: '🎉 Unit 26 complete!', explanation: 'إِنَّ and her sisters — the mirror of كَانَ — are yours. Next: verbs of the heart that take TWO objects.', arabic: null, transliteration: null } },
]};

const U27_L1 = { steps: [
  { type: 'teach', content: { title: 'Verbs of the heart — two objects', explanation: 'A special group of verbs about *thinking/knowing* takes **TWO manṣūb objects** (they turn a whole nominal sentence into two objects):\n\n**ظَنَّ** (to think) · **حَسِبَ** (to reckon) · **وَجَدَ** (to find) · **عَلِمَ** (to know) · **رَأَىٰ** (to see/consider)', arabic: 'ظَنَّ · حَسِبَ · وَجَدَ', transliteration: 'ẓanna · ḥasiba · wajada', examples: [ { ar: 'حَسِبْتَهُمْ أَيْقَاظًا', tr: 'ḥasibtahum ayqaaẓan', en: 'you would think them awake' } ], fun_fact: 'حَسِبْتَهُمْ أَيْقَاظًا (Al-Kahf 18:18) — هُمْ (object 1) + أَيْقَاظًا (object 2), both in the naṣb position.' } },
  { type: 'mcq', content: { question: 'How many objects do "verbs of the heart" like ظَنَّ take?', options: [ { text: 'Two (both manṣūb)', correct: true }, { text: 'One', correct: false }, { text: 'None', correct: false } ], explanation: 'They take two objects because they report a whole thought (subject + predicate).' } },
  { type: 'match', content: { instruction: 'Match the heart-verb to its meaning', pairs: [ { left: 'ظَنَّ', right: 'to think' }, { left: 'حَسِبَ', right: 'to reckon' }, { left: 'وَجَدَ', right: 'to find' }, { left: 'عَلِمَ', right: 'to know' } ] } },
  { type: 'fill_blank', content: { sentence: 'حَسِبْتَهُمْ أَيْقَاظًا — هُمْ is the first object and أَيْقَاظًا is the ___ object.', correct_answer: 'second', options: ['second', 'only', 'subject'], explanation: 'Two objects: "you-reckoned them awake".' } },
  { type: 'teach', content: { title: 'Two-object verbs', explanation: 'The heart-verbs report a thought as two objects. Next: how the Quran uses them.', arabic: null, transliteration: null } },
]};
const U27_L2 = { steps: [
  { type: 'teach', content: { title: 'Certainty and doubt', explanation: 'Some heart-verbs express **certainty** (عَلِمَ know, رَأَىٰ see-that), others **doubt/opinion** (ظَنَّ، حَسِبَ). Both still take two objects.', arabic: 'أَحَسِبَ النَّاسُ', transliteration: 'a-ḥasiban-naas', examples: [ { ar: 'أَحَسِبَ النَّاسُ أَنْ يُتْرَكُوا', tr: 'a-ḥasiban-naasu an yutrakoo', en: 'do the people think they will be left [untested]?' } ], fun_fact: 'Here the two "objects" are packed into "أَنْ + verb" — a moulded maṣdar (Unit 26).' } },
  { type: 'mcq', content: { question: 'عَلِمَ (as a heart-verb) expresses...', options: [ { text: 'certainty ("to know that…")', correct: true }, { text: 'doubt only', correct: false } ], explanation: 'عَلِمَ/رَأَىٰ = certainty; ظَنَّ/حَسِبَ = opinion/doubt.' } },
  { type: 'classify', content: { instruction: 'Certainty or doubt?', categories: ['Certainty', 'Doubt / opinion'], items: [ { text: 'عَلِمَ (to know)', category: 'Certainty' }, { text: 'ظَنَّ (to think)', category: 'Doubt / opinion' }, { text: 'رَأَىٰ (to see that)', category: 'Certainty' }, { text: 'حَسِبَ (to reckon)', category: 'Doubt / opinion' } ], explanation: 'They split by how sure the thought is.' } },
  { type: 'fill_blank', content: { sentence: 'أَحَسِبَ النَّاسُ أَنْ يُتْرَكُوا — النَّاسُ is the ___ (doer) of حَسِبَ.', correct_answer: 'fā‘il', options: ['fā‘il', 'maf‘ūl', 'khabar'], explanation: 'The doer is raf‘ (النَّاسُ); the two objects follow.' } },
  { type: 'teach', content: { title: 'Heart-verbs in the Quran', explanation: 'Certainty and doubt, each with two objects. Next: a full ayah.', arabic: null, transliteration: null } },
]};
const U27_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — do not think…', explanation: '**وَلَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا فِي سَبِيلِ اللّٰهِ أَمْوَاتًا** — "And never think of those killed in the way of Allah as dead." (Aal Imran 3:169)', arabic: 'لَا تَحْسَبَنَّ الَّذِينَ قُتِلُوا … أَمْوَاتًا', transliteration: 'laa taḥsabanna…amwaatan', quran_ref: 'Aal Imran 3:169' } },
  { type: 'mcq', content: { question: 'In this ayah, the two objects of تَحْسَبَنَّ are الَّذِينَ قُتِلُوا and...', options: [ { text: 'أَمْوَاتًا ("dead" — object 2, naṣb)', correct: true }, { text: 'سَبِيلِ (the way)', correct: false } ], explanation: '"Do not reckon [those killed] [as dead]" — two objects, the second أَمْوَاتًا in naṣb.' } },
  { type: 'classify', content: { instruction: 'Tag the two objects', categories: ['Object 1 (who)', 'Object 2 (what you think of them)'], items: [ { text: 'الَّذِينَ قُتِلُوا', category: 'Object 1 (who)' }, { text: 'أَمْوَاتًا', category: 'Object 2 (what you think of them)' } ], explanation: 'The heart-verb links "them" with "being dead" — and negates it.' } },
  { type: 'fill_blank', content: { sentence: 'تَحْسَبَنَّ ends in a heavy نّ — the "nūn of ___" that adds force.', correct_answer: 'emphasis', options: ['emphasis', 'plural', 'negation'], explanation: 'The nūn of emphasis (nūn al-tawkīd): "never EVER think…". More on it in Stage 13.' } },
  { type: 'teach', content: { title: '🎉 Unit 27 complete!', explanation: 'Verbs of the heart and their two objects — done. Next: verbs of nearness and beginning.', arabic: null, transliteration: null } },
]};

const U28_L1 = { steps: [
  { type: 'teach', content: { title: 'Verbs of nearness & beginning', explanation: 'A small family (أَفْعَال المُقَارَبَة) sets up an *action about to happen or just beginning*. Their predicate is usually a present-tense verb:\n\n**كَادَ** (almost / nearly) · **عَسَىٰ** (perhaps / it may be) · **أَخَذَ / جَعَلَ** (began to)', arabic: 'كَادَ · عَسَىٰ', transliteration: 'kaada · ‘asaa', examples: [ { ar: 'يَكَادُ الْبَرْقُ', tr: 'yakaadul-barq', en: 'the lightning almost…' }, { ar: 'عَسَىٰ رَبُّكُمْ', tr: '‘asaa rabbukum', en: 'perhaps your Lord [will]…' } ], fun_fact: 'They are related to كَانَ (they raise a subject) but their khabar is a verb: "almost DOES", "began to DO".' } },
  { type: 'mcq', content: { question: 'كَادَ means...', options: [ { text: 'almost / nearly (did)', correct: true }, { text: 'became', correct: false }, { text: 'thought', correct: false } ], explanation: 'كَادَ = "almost". يَكَادُ الْبَرْقُ = "the lightning almost [snatches]".' } },
  { type: 'match', content: { instruction: 'Match the verb of nearness/beginning', pairs: [ { left: 'كَادَ', right: 'almost' }, { left: 'عَسَىٰ', right: 'perhaps' }, { left: 'أَخَذَ', right: 'began to' } ] } },
  { type: 'fill_blank', content: { sentence: 'These verbs usually have a ___ verb as their predicate ("almost DOES").', correct_answer: 'present', options: ['present', 'past', 'command'], explanation: 'كَادَ يَفْعَلُ, عَسَىٰ أَنْ يَفْعَلَ — the khabar is a present verb.' } },
  { type: 'teach', content: { title: 'Nearness & beginning', explanation: 'كاد، عسى، أخذ، جعل — "almost", "perhaps", "began to". Next: read them in the Quran.', arabic: null, transliteration: null } },
]};
const U28_L2 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — the lightning', explanation: '**يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ** — "The lightning almost snatches away their sight." (Al-Baqarah 2:20)', arabic: 'يَكَادُ الْبَرْقُ يَخْطَفُ أَبْصَارَهُمْ', transliteration: 'yakaadul-barqu yakhṭafu abṣaarahum', quran_ref: 'Al-Baqarah 2:20' } },
  { type: 'mcq', content: { question: 'In يَكَادُ الْبَرْقُ يَخْطَفُ, what is the khabar of يَكَادُ?', options: [ { text: 'يَخْطَفُ أَبْصَارَهُمْ (the verb phrase "snatches their sight")', correct: true }, { text: 'الْبَرْقُ (the lightning)', correct: false } ], explanation: 'الْبَرْقُ is the raised subject; the present verb يَخْطَفُ is the predicate — "almost snatches".' } },
  { type: 'mcq', content: { question: 'عَسَىٰ رَبُّكُمْ أَنْ يَرْحَمَكُمْ — عَسَىٰ signals...', options: [ { text: 'hope/possibility — "perhaps your Lord will have mercy"', correct: true }, { text: 'certainty', correct: false } ], explanation: 'عَسَىٰ = "perhaps / it may be that" — often a promise of hope from Allah.' } },
  { type: 'fill_blank', content: { sentence: 'أَبْصَارَهُمْ ("their sight") is the object of يَخْطَفُ, so it is in ___.', correct_answer: 'naṣb', options: ['naṣb', 'raf‘', 'jarr'], explanation: 'The object of the inner verb takes naṣb (fatḥa).' } },
  { type: 'teach', content: { title: '🏆 STAGE 8 COMPLETE — the sentence-changers!', explanation: 'You now command the four families that bend a sentence’s cases: **كَانَ** (raise+naṣb), **إِنَّ** (naṣb+raise), **ظَنَّ** (two objects), and **كَادَ** (nearness/beginning).\n\nNext in the mastery track: **the complete verb system** — the 10 forms, the moods, weak verbs, and the passive — powered by the roots engine.', arabic: null, transliteration: null } },
]};

const U25_VOCAB = [ ['كَانَ','kaana','he was / used to be','feel',null,null,'An-Nisa 4:96',1], ['أَصْبَحَ','aṣbaḥa','he became','feel',null,null,'Al-Kahf 18:42',2], ['صَارَ','ṣaara','he became','feel',null,null,null,2], ['لَيْسَ','laysa','is not','feel',null,null,'Ash-Shura 42:11',1], ['مَا زَالَ','maa zaala','still is','feel',null,null,null,2] ];
const U26_VOCAB = [ ['إِنَّ','inna','indeed (naṣbs its subject)','harf',null,null,'Al-Baqarah 2:20',1], ['أَنَّ','anna','that','harf',null,null,'Al-Baqarah 2:29',1], ['كَأَنَّ','ka’anna','as if','harf',null,null,'Al-Qari‘ah 101:5',2], ['لَٰكِنَّ','laakinna','but','harf',null,null,'Al-Baqarah 2:12',2], ['لَعَلَّ','la‘alla','perhaps / so that','harf',null,null,'Al-Baqarah 2:21',1], ['لَيْتَ','layta','if only','harf',null,null,'An-Naba 78:40',2] ];
const U27_VOCAB = [ ['ظَنَّ','ẓanna','he thought','feel',null,null,'Al-Baqarah 2:46',1], ['حَسِبَ','ḥasiba','he reckoned','feel',null,null,'Al-Kahf 18:18',1], ['وَجَدَ','wajada','he found','feel',null,null,'Ad-Duha 93:6',1], ['رَأَىٰ','ra’aa','he saw / considered','feel',null,null,'Al-Alaq 96:7',1] ];
const U28_VOCAB = [ ['كَادَ','kaada','he almost (did)','feel',null,null,'Al-Baqarah 2:20',1], ['عَسَىٰ','‘asaa','perhaps / it may be','feel',null,null,'At-Tahrim 66:5',1], ['أَخَذَ','akhadha','he took / began','feel',null,null,'Al-A‘raf 7:150',1], ['الْبَرْق','al-barq','the lightning','ism','masculine','singular','Al-Baqarah 2:20',2] ];

const UNIT_DEFS = [
  [25,'kana-sisters','Kāna & Her Sisters','كَانَ وَأَخَوَاتُهَا','🔄','#8B7BD8',false,'Verbs that raise the subject and naṣb the predicate: كَانَ, صَارَ, لَيْسَ…'],
  [26,'inna-sisters','Inna & Her Sisters','إِنَّ وَأَخَوَاتُهَا','🪞','#5FB57A',false,'The mirror of kāna: naṣb the subject, raise the predicate — إِنَّ, أَنَّ, لَعَلَّ…'],
  [27,'dhanna-sisters','Verbs of the Heart','ظَنَّ وَأَخَوَاتُهَا','🧠','#6BA8D4',false,'Verbs like ظَنَّ that take two objects.'],
  [28,'kada-sisters','Nearness & Beginning','كَادَ وَأَخَوَاتُهَا','⏱️','#C77DBB',true,'Verbs of almost/perhaps/began — كَادَ, عَسَىٰ.'],
];

const LESSONS = [
  [25,'kana-raises','Kāna Raises & Naṣbs',1,U25_L1,15],[25,'kana-becoming','The Sisters of Becoming',2,U25_L2,15],[25,'laysa','Laysa & "Still"',3,U25_L3,15],[25,'read-quran-kana','Read the Quran: Kāna',4,U25_L4,20],
  [26,'inna-mirror','Inna — the Mirror',1,U26_L1,15],[26,'inna-anna','Inna vs Anna',2,U26_L2,15],[26,'inna-sisters','The Sisters of Inna',3,U26_L3,15],[26,'read-quran-inna','Read the Quran: With Hardship, Ease',4,U26_L4,20],
  [27,'two-objects','Two-Object Verbs',1,U27_L1,15],[27,'certainty-doubt','Certainty & Doubt',2,U27_L2,15],[27,'read-quran-dhanna','Read the Quran: Do Not Think',3,U27_L3,20],
  [28,'muqaraba','Almost & Perhaps',1,U28_L1,15],[28,'read-quran-kada','Read the Quran: The Lightning',2,U28_L2,20],
];
const VOCAB = [[25,U25_VOCAB],[26,U26_VOCAB],[27,U27_VOCAB],[28,U28_VOCAB]];

async function main() {
  const id = {};
  for (const [so,slug,title,titleAr,emoji,color,cp,desc] of UNIT_DEFS) {
    const [r] = await sql`INSERT INTO learning_units (slug,title,title_ar,description,icon_emoji,color,sort_order,checkpoint_after)
      VALUES (${slug},${title},${titleAr},${desc},${emoji},${color},${so},${cp})
      ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title,title_ar=EXCLUDED.title_ar,description=EXCLUDED.description,icon_emoji=EXCLUDED.icon_emoji,color=EXCLUDED.color,sort_order=EXCLUDED.sort_order,checkpoint_after=EXCLUDED.checkpoint_after
      RETURNING id,sort_order`;
    id[so]=r.id; console.log(`Unit ${so} [${slug}] → ${r.id}`);
  }
  for (const [us,slug,title,so,content,xp] of LESSONS) {
    await sql`INSERT INTO learning_lessons (unit_id,slug,title,sort_order,lesson_type,content,xp_reward)
      VALUES (${id[us]},${slug},${title},${so},'standard',${sql.json(content)},${xp})
      ON CONFLICT (unit_id,slug) DO UPDATE SET title=EXCLUDED.title,sort_order=EXCLUDED.sort_order,content=EXCLUDED.content,xp_reward=EXCLUDED.xp_reward`;
    console.log(`  ✓ U${us} ${title} (${content.steps.length} steps)`);
  }
  for (const [us,vocab] of VOCAB) {
    await sql`DELETE FROM vocabulary_bank WHERE unit_id=${id[us]}`;
    for (const [ar,tr,en,type,g,n,ref,d] of vocab)
      await sql`INSERT INTO vocabulary_bank (word_ar,transliteration,english,word_type,gender,number,unit_id,quranic_ref,difficulty) VALUES (${ar},${tr},${en},${type},${g},${n},${id[us]},${ref},${d})`;
    console.log(`  ✓ ${vocab.length} vocab for U${us}`);
  }
  const [f] = await sql`SELECT id FROM learning_lessons WHERE unit_id=${id[25]} ORDER BY sort_order LIMIT 1`;
  const un = await sql`WITH prev AS (SELECT l.id FROM learning_lessons l JOIN learning_units u ON u.id=l.unit_id WHERE u.sort_order=24), fin AS (SELECT p.user_id FROM user_lesson_progress p JOIN prev ON prev.id=p.lesson_id WHERE p.status='completed' GROUP BY p.user_id HAVING count(*)=(SELECT count(*) FROM prev)) INSERT INTO user_lesson_progress (user_id,lesson_id,status) SELECT fin.user_id,${f.id},'available' FROM fin ON CONFLICT (user_id,lesson_id) DO NOTHING RETURNING user_id`;
  console.log(`  ✓ Unlocked U25 L1 for ${un.length} finishers of U24`);
  const [t]=await sql`SELECT count(*)::int u FROM learning_units`,[tl]=await sql`SELECT count(*)::int l FROM learning_lessons`;
  console.log(`TOTAL: ${t.u} units, ${tl.l} lessons.`);
}
main().then(()=>sql.end()).catch(async e=>{console.error('FAIL:',e.message);await sql.end();process.exit(1);});
