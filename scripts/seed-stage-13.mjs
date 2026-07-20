/**
 * PART B — Stage 13: CONDITIONALS, NUMBERS & RHETORIC — Units 44–47.
 *   44 al-Sharṭ (conditionals: إن/إذا/من/ما + jawāb)
 *   45 al-ʿAdad wa al-Maʿdūd (numbers & the counted)
 *   46 Oaths, Restriction & Fronting (qasam, qaṣr, taqdīm)
 *   47 Style & Emphasis (praise/blame, nūn of emphasis, exclamation) — checkpoint_after
 * Run: DATABASE_URL=... node scripts/seed-stage-13.mjs
 */
import postgres from 'postgres';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

const U44_L1 = { steps: [
  { type: 'teach', content: { title: 'If… then… (al-sharṭ)', explanation: 'A conditional has two halves: the **condition** (sharṭ) and its **answer** (jawāb). The key words:\n\n**إِنْ** (if — hypothetical) · **إِذَا** (when/if — expected) · **مَنْ** (whoever) · **مَا** (whatever)\n\nإِنْ تَنصُرُوا اللّٰهَ يَنصُرْكُمْ — "If you help Allah, He will help you."', arabic: 'إِنْ تَنصُرُوا اللّٰهَ يَنصُرْكُمْ', transliteration: 'in tanṣuru-llaaha yanṣurkum', examples: [ { ar: 'مَنْ يَعْمَلْ سُوءًا يُجْزَ بِهِ', tr: 'man ya‘mal soo’an…', en: 'whoever does evil is recompensed for it' } ], fun_fact: 'With جازِم conditionals (إِنْ، مَنْ، مَا), BOTH verbs are cut to jazm (sukūn): تَنصُرُوا… يَنصُرْ.' } },
  { type: 'mcq', content: { question: 'In إِنْ تَنصُرُوا اللّٰهَ يَنصُرْكُمْ, what state are the two verbs in?', options: [ { text: 'jazm (both cut by the conditional)', correct: true }, { text: 'raf‘', correct: false } ], explanation: 'A jāzim conditional jazms both the condition-verb and the answer-verb.' } },
  { type: 'match', content: { instruction: 'Match the conditional word', pairs: [ { left: 'إِنْ', right: 'if (hypothetical)' }, { left: 'إِذَا', right: 'when (expected)' }, { left: 'مَنْ', right: 'whoever' }, { left: 'مَا', right: 'whatever' } ] } },
  { type: 'fill_blank', content: { sentence: 'A conditional has two parts: the sharṭ (condition) and the ___ (answer).', correct_answer: 'jawāb', options: ['jawāb', 'maṣdar', 'ḥāl'], explanation: 'sharṭ → jawāb: "if X, then Y".' } },
  { type: 'teach', content: { title: 'Condition + answer', explanation: 'إن، إذا، من، ما set up "if… then…". Next: إذا vs إن.', arabic: null, transliteration: null } },
]};
const U44_L2 = { steps: [
  { type: 'teach', content: { title: 'إِذَا vs إِنْ', explanation: '**إِذَا** = "when" — for something *expected/certain* to happen.\n**إِنْ** = "if" — for something *hypothetical/uncertain*.\n\nإِذَا جَاءَ نَصْرُ اللّٰهِ — "**When** the help of Allah comes" (it certainly will).', arabic: 'إِذَا جَاءَ نَصْرُ اللّٰهِ', transliteration: 'idhaa jaa’a naṣru-llaah', examples: [ { ar: 'إِذَا زُلْزِلَتِ الْأَرْضُ', tr: 'idhaa zulzilat…', en: 'when the earth is shaken' } ], fun_fact: 'The Quran uses إِذَا for the Last Day (certain) and إِنْ for testing hypotheticals — a subtle theology in the grammar.' } },
  { type: 'mcq', content: { question: 'إِذَا is used for events that are...', options: [ { text: 'expected / certain ("when")', correct: true }, { text: 'purely hypothetical ("if maybe")', correct: false } ], explanation: 'إِذَا = "when" (certain); إِنْ = "if" (hypothetical).' } },
  { type: 'classify', content: { instruction: 'Certain "when" or hypothetical "if"?', categories: ['إِذَا (when — certain)', 'إِنْ (if — hypothetical)'], items: [ { text: 'إِذَا جَاءَ نَصْرُ اللّٰهِ', category: 'إِذَا (when — certain)' }, { text: 'إِنْ تَنصُرُوا اللّٰهَ', category: 'إِنْ (if — hypothetical)' }, { text: 'إِذَا زُلْزِلَتِ الْأَرْضُ', category: 'إِذَا (when — certain)' } ], explanation: 'إِذَا frames the inevitable; إِنْ frames the possible.' } },
  { type: 'fill_blank', content: { sentence: 'إِذَا جَاءَ نَصْرُ اللّٰهِ — نَصْرُ is the ___ (doer) of جَاءَ.', correct_answer: 'fā‘il', options: ['fā‘il', 'maf‘ūl', 'khabar'], explanation: 'نَصْرُ اللّٰهِ ("the help of Allah") — subject of "came".' } },
  { type: 'teach', content: { title: 'When vs if', explanation: 'Certainty vs hypothesis. Next: read a conditional surah.', arabic: null, transliteration: null } },
]};
const U44_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — Surat an-Naṣr', explanation: '**إِذَا جَاءَ نَصْرُ اللّٰهِ وَالْفَتْحُ • وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللّٰهِ أَفْوَاجًا • فَسَبِّحْ بِحَمْدِ رَبِّكَ** — "When the help of Allah and the conquest come… then glorify your Lord."', arabic: 'إِذَا جَاءَ نَصْرُ اللّٰهِ وَالْفَتْحُ', transliteration: 'idhaa jaa’a naṣru-llaahi wal-fatḥ', quran_ref: 'An-Nasr 110:1–3' } },
  { type: 'classify', content: { instruction: 'Condition or answer?', categories: ['Condition (sharṭ)', 'Answer (jawāb)'], items: [ { text: 'إِذَا جَاءَ نَصْرُ اللّٰهِ', category: 'Condition (sharṭ)' }, { text: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ', category: 'Answer (jawāb)' } ], explanation: 'The whole surah is one "when… then…": condition then the command to glorify.' } },
  { type: 'mcq', content: { question: 'أَفْوَاجًا ("in crowds") in this ayah is a...', options: [ { text: 'ḥāl (their state as they enter)', correct: true }, { text: 'fā‘il', correct: false } ], explanation: 'A ḥāl (Stage 11): "entering the religion IN crowds".' } },
  { type: 'fill_blank', content: { sentence: 'فَسَبِّحْ starts with فَ, marking it as the ___ (answer) of the condition.', correct_answer: 'jawāb', options: ['jawāb', 'sharṭ', 'ḥāl'], explanation: 'The فَ often introduces the jawāb al-sharṭ.' } },
  { type: 'teach', content: { title: '🎉 Unit 44 complete!', explanation: 'Conditionals — the "if/when… then…" of the Quran. Next: the surprising grammar of numbers.', arabic: null, transliteration: null } },
]};

const U45_L1 = { steps: [
  { type: 'teach', content: { title: 'Numbers disagree (3–10)', explanation: 'Arabic numbers 3–10 have a famous quirk: they take the **opposite gender** to the thing counted, and the counted noun is a **plural in jarr**:\n\n**ثَلَاثَةُ أَيَّامٍ** — "three days" (ثَلَاثَة has the feminine ة, though يَوْم is masculine).', arabic: 'ثَلَاثَةُ أَيَّامٍ', transliteration: 'thalaathatu ayyaam', examples: [ { ar: 'سَبْعَ سَمَاوَاتٍ', tr: 'sab‘a samaawaat', en: 'seven heavens' } ], fun_fact: 'The "reverse agreement" of 3–10 trips up even advanced students — but you now know the rule.' } },
  { type: 'mcq', content: { question: 'For numbers 3–10, the number and the counted noun...', options: [ { text: 'take OPPOSITE genders', correct: true }, { text: 'always match gender', correct: false } ], explanation: 'ثَلَاثَة (fem ة) + أَيَّام (masc) — reverse agreement.' } },
  { type: 'fill_blank', content: { sentence: 'وَالسَّمَاوَاتُ … خَلَقَ ___ سَمَاوَاتٍ — "seven heavens".', correct_answer: 'سَبْعَ', options: ['سَبْعَ', 'سَبْعَة', 'سَابِع'], explanation: 'سَبْعَ سَمَاوَاتٍ — "seven heavens", the counted noun in jarr plural.' } },
  { type: 'classify', content: { instruction: 'Number phrase or not?', categories: ['A counted number (3–10)', 'Not a number phrase'], items: [ { text: 'سَبْعَ سَمَاوَاتٍ (seven heavens)', category: 'A counted number (3–10)' }, { text: 'ثَلَاثَةُ أَيَّامٍ (three days)', category: 'A counted number (3–10)' }, { text: 'الْحَمْدُ لِلَّهِ', category: 'Not a number phrase' } ], explanation: 'Number + a plural noun in jarr = a counted phrase.' } },
  { type: 'teach', content: { title: 'The reverse-agreement rule', explanation: '3–10 flip gender. Next: bigger numbers and the number-tamyīz.', arabic: null, transliteration: null } },
]};
const U45_L2 = { steps: [
  { type: 'teach', content: { title: 'Eleven and up: the number-tamyīz', explanation: 'From **11 to 99**, the counted noun becomes a **singular** in **naṣb** — a tamyīz:\n\nأَحَدَ عَشَرَ **كَوْكَبًا** — "eleven stars" (كَوْكَبًا, singular, naṣb).', arabic: 'أَحَدَ عَشَرَ كَوْكَبًا', transliteration: 'aḥada ‘ashara kawkaban', examples: [ { ar: 'أَرْبَعِينَ لَيْلَةً', tr: 'arba‘eena laylatan', en: 'forty nights' } ], fun_fact: 'إِنِّي رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا (Yusuf 12:4) — Yusuf’s dream. The single naṣb noun كَوْكَبًا is a tamyīz specifying the count.' } },
  { type: 'mcq', content: { question: 'With numbers 11–99, the counted noun is...', options: [ { text: 'singular and manṣūb (a tamyīz)', correct: true }, { text: 'plural and majrūr', correct: false } ], explanation: 'أَحَدَ عَشَرَ كَوْكَبًا, أَرْبَعِينَ لَيْلَةً — singular naṣb tamyīz.' } },
  { type: 'classify', content: { instruction: '3–10 (plural jarr) or 11–99 (singular naṣb tamyīz)?', categories: ['3–10 (plural, jarr)', '11–99 (singular, naṣb)'], items: [ { text: 'سَبْعَ سَمَاوَاتٍ', category: '3–10 (plural, jarr)' }, { text: 'أَحَدَ عَشَرَ كَوْكَبًا', category: '11–99 (singular, naṣb)' }, { text: 'أَرْبَعِينَ لَيْلَةً', category: '11–99 (singular, naṣb)' } ], explanation: 'Small numbers → plural jarr; teens–nineties → singular naṣb.' } },
  { type: 'fill_blank', content: { sentence: 'وَوَاعَدْنَا مُوسَىٰ ___ لَيْلَةً — "forty nights" (Al-Baqarah 2:51).', correct_answer: 'أَرْبَعِينَ', options: ['أَرْبَعِينَ', 'أَرْبَعَة', 'رَابِع'], explanation: 'أَرْبَعِينَ لَيْلَةً — 40 + a singular naṣb noun.' } },
  { type: 'teach', content: { title: 'Numbers, tamed', explanation: 'The counted noun changes shape with the number’s size. Next: read numbers in the Quran.', arabic: null, transliteration: null } },
]};
const U45_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — the seven heavens', explanation: '**اللّٰهُ الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ** — "Allah is the One who created seven heavens." (At-Talaq 65:12)', arabic: 'خَلَقَ سَبْعَ سَمَاوَاتٍ', transliteration: 'khalaqa sab‘a samaawaat', quran_ref: 'At-Talaq 65:12' } },
  { type: 'mcq', content: { question: 'سَبْعَ سَمَاوَاتٍ — سَمَاوَاتٍ is a plural in...', options: [ { text: 'jarr (the counted noun after 3–10)', correct: true }, { text: 'raf‘', correct: false } ], explanation: '3–10 → the counted noun is a plural in jarr.' } },
  { type: 'classify', content: { instruction: 'Which number rule applies?', categories: ['3–10 (plural jarr)', '11–99 (singular naṣb)'], items: [ { text: 'سَبْعَ سَمَاوَاتٍ', category: '3–10 (plural jarr)' }, { text: 'أَحَدَ عَشَرَ كَوْكَبًا', category: '11–99 (singular naṣb)' } ], explanation: 'Seven → plural jarr; eleven → singular naṣb.' } },
  { type: 'fill_blank', content: { sentence: 'الَّذِي خَلَقَ — الَّذِي is a ___ ("the One who").', correct_answer: 'relative', options: ['relative', 'command', 'preposition'], explanation: 'Stage-12 relative clause describing Allah.' } },
  { type: 'teach', content: { title: '🎉 Unit 45 complete!', explanation: 'Even numbers obey rules now. Next: the rhetoric that gives the Quran its power — oaths, restriction, fronting.', arabic: null, transliteration: null } },
]};

const U46_L1 = { steps: [
  { type: 'teach', content: { title: 'The oath (al-qasam)', explanation: 'The Quran swears by great things using **وَ** ("By…"), **تَـ**, or **بِـ**. The oath (qasam) is followed by its answer (jawāb al-qasam), often stressed with **لَـ** or **إِنَّ**:\n\n**وَالْعَصْرِ • إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ** — "By time — indeed man is in loss."', arabic: 'وَالْعَصْرِ', transliteration: 'wal-‘aṣr', examples: [ { ar: 'وَالشَّمْسِ', tr: 'wash-shams', en: 'By the sun' }, { ar: 'وَالضُّحَىٰ', tr: 'waḍ-ḍuḥaa', en: 'By the morning light' } ], fun_fact: 'After an oath-وَ, the noun is majrūr (kasra): الْعَصْرِ, الشَّمْسِ — as if led by a hidden "I swear BY".' } },
  { type: 'mcq', content: { question: 'وَالْعَصْرِ at a surah’s start means...', options: [ { text: 'By time! (an oath)', correct: true }, { text: 'and the time', correct: false } ], explanation: 'The oath-وَ: "By ___!". Its answer follows (إِنَّ الْإِنْسَانَ…).' } },
  { type: 'fill_blank', content: { sentence: 'After the oath, the answer often carries لَـ or ___ for emphasis.', correct_answer: 'إِنَّ', options: ['إِنَّ', 'لَا', 'هَلْ'], explanation: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ — the emphasized jawāb al-qasam.' } },
  { type: 'classify', content: { instruction: 'Oath or its answer?', categories: ['Oath (qasam)', 'Answer (jawāb)'], items: [ { text: 'وَالْعَصْرِ', category: 'Oath (qasam)' }, { text: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ', category: 'Answer (jawāb)' }, { text: 'وَالضُّحَىٰ', category: 'Oath (qasam)' } ], explanation: 'وَ + a noble thing = the oath; the statement after = its answer.' } },
  { type: 'teach', content: { title: 'The oath', explanation: 'By time, by the sun… + an emphasized answer. Next: restriction — "only".', arabic: null, transliteration: null } },
]};
const U46_L2 = { steps: [
  { type: 'teach', content: { title: 'Restriction (al-qaṣr): "only"', explanation: 'To say "only / none but", Arabic uses **إِنَّمَا** or the **لَا … إِلَّا** pattern:\n\n**إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ** — "The believers are but brothers (only brothers)."\n**لَا إِلَٰهَ إِلَّا اللّٰهُ** — "no god except Allah".', arabic: 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ', transliteration: 'innamal-mu’minoona ikhwah', examples: [ { ar: 'إِنَّمَا', tr: 'innamaa', en: 'only / but' } ], fun_fact: 'إِنَّمَا = إِنَّ + مَا — the مَا "locks" the meaning to "nothing but".' } },
  { type: 'mcq', content: { question: 'إِنَّمَا expresses...', options: [ { text: 'restriction — "only / nothing but"', correct: true }, { text: 'a question', correct: false } ], explanation: 'إِنَّمَا الْمُؤْمِنُونَ إِخْوَةٌ = "the believers are ONLY brothers".' } },
  { type: 'match', content: { instruction: 'Match the restriction structure', pairs: [ { left: 'إِنَّمَا', right: 'only / but' }, { left: 'لَا … إِلَّا', right: 'none… except' } ] } },
  { type: 'fill_blank', content: { sentence: 'The pattern لَا إِلَٰهَ إِلَّا اللّٰهُ restricts worship to Allah — a form of ___.', correct_answer: 'restriction', options: ['restriction', 'negation only', 'a question'], explanation: 'Total negation + one exception = restriction (qaṣr).' } },
  { type: 'teach', content: { title: 'Only…', explanation: 'إنّما and لا…إلا lock meaning down. Next: moving words for emphasis — fronting.', arabic: null, transliteration: null } },
]};
const U46_L3 = { steps: [
  { type: 'teach', content: { title: 'Fronting (al-taqdīm wa al-taʾkhīr)', explanation: 'Arabic can MOVE a word to the front to stress it. Fronting the object often means "…and no one else":\n\n**إِيَّاكَ نَعْبُدُ** — literally "**You alone** we worship" (the object إِيَّاكَ is fronted before the verb).', arabic: 'إِيَّاكَ نَعْبُدُ', transliteration: 'iyyaaka na‘bud', examples: [ { ar: 'لِلَّهِ مُلْكُ السَّمَاوَاتِ', tr: 'lillaahi mulku…', en: 'to Allah [alone] belongs the dominion' } ], fun_fact: 'Word order in Arabic is meaning: إِيَّاكَ نَعْبُدُ stresses exclusivity — You, and only You, do we worship.' } },
  { type: 'mcq', content: { question: 'Fronting the object (إِيَّاكَ before نَعْبُدُ) adds a sense of...', options: [ { text: 'exclusivity ("You ALONE")', correct: true }, { text: 'doubt', correct: false } ], explanation: 'Taqdīm of the object = emphasis/restriction.' } },
  { type: 'classify', content: { instruction: 'Normal order or fronted for emphasis?', categories: ['Fronted (emphasis)', 'Normal order'], items: [ { text: 'إِيَّاكَ نَعْبُدُ (You alone we worship)', category: 'Fronted (emphasis)' }, { text: 'لِلَّهِ مُلْكُ السَّمَاوَاتِ (to Allah belongs…)', category: 'Fronted (emphasis)' }, { text: 'خَلَقَ اللّٰهُ السَّمَاوَاتِ (created Allah the heavens)', category: 'Normal order' } ], explanation: 'Moving a word forward highlights it.' } },
  { type: 'fill_blank', content: { sentence: 'Al-ʿAṣr closes: وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ — the repetition emphasizes ___.', correct_answer: 'both', options: ['both', 'neither', 'doubt'], explanation: 'Repetition (a rhetorical device) stresses both truth AND patience.' } },
  { type: 'teach', content: { title: 'Word order = meaning', explanation: 'Oaths, restriction, and fronting — the Quran’s rhetoric. Next: a final look at style and emphasis.', arabic: null, transliteration: null } },
]};
const U46_L4 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — Surat al-ʿAṣr, complete', explanation: '**وَالْعَصْرِ • إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ • إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ**', arabic: 'وَالْعَصْرِ • إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ', transliteration: 'wal-‘aṣr • innal-insaana lafee khusr', quran_ref: 'Al-Asr 103:1–3' } },
  { type: 'classify', content: { instruction: 'Tag the rhetoric', categories: ['Oath (qasam)', 'Emphasized answer', 'Exception (restriction)'], items: [ { text: 'وَالْعَصْرِ', category: 'Oath (qasam)' }, { text: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ', category: 'Emphasized answer' }, { text: 'إِلَّا الَّذِينَ آمَنُوا', category: 'Exception (restriction)' } ], explanation: 'Oath → emphasized loss → the excepted believers. A complete rhetorical arc.' } },
  { type: 'mcq', content: { question: 'لَفِي خُسْرٍ — the لَـ here is...', options: [ { text: 'the emphatic لَـ of the oath’s answer ("surely in loss")', correct: true }, { text: 'the preposition "for"', correct: false } ], explanation: 'لَـ + فِي = "surely in" — stressing the jawāb al-qasam.' } },
  { type: 'fill_blank', content: { sentence: 'إِلَّا carves the believers out of the loss — an ___ (exception).', correct_answer: 'istithnāʾ', options: ['istithnāʾ', 'iḍāfa', 'ḥāl'], explanation: 'Stage-11 exception: "…except those who believe".' } },
  { type: 'teach', content: { title: '🎉 Unit 46 complete!', explanation: 'Oaths, restriction, fronting — the Quran’s persuasive power laid bare. One short unit of Stage 13 left: praise, blame, and emphatic style.', arabic: null, transliteration: null } },
]};

const U47_L1 = { steps: [
  { type: 'teach', content: { title: 'Praise, blame & the nūn of emphasis', explanation: 'Two quick style tools:\n\n**نِعْمَ** (how excellent!) and **بِئْسَ** (how wretched!) — frozen verbs of praise and blame.\n**Nūn of emphasis (نّ)** — added to a verb for force: لَيُسْجَنَنَّ ("he will SURELY be imprisoned").', arabic: 'نِعْمَ · بِئْسَ · ـنَّ', transliteration: 'ni‘ma · bi’sa · -nna', examples: [ { ar: 'نِعْمَ الْمَوْلَىٰ', tr: 'ni‘mal-mawlaa', en: 'how excellent a Protector!' }, { ar: 'لَيُسْجَنَنَّ', tr: 'layusjananna', en: 'he will surely be imprisoned' } ], fun_fact: 'نِعْمَ and بِئْسَ never change form — they are "frozen" verbs used only to praise or condemn.' } },
  { type: 'mcq', content: { question: 'نِعْمَ expresses...', options: [ { text: 'praise ("how excellent!")', correct: true }, { text: 'blame', correct: false }, { text: 'a question', correct: false } ], explanation: 'نِعْمَ = praise; بِئْسَ = blame.' } },
  { type: 'match', content: { instruction: 'Match the style word', pairs: [ { left: 'نِعْمَ', right: 'how excellent!' }, { left: 'بِئْسَ', right: 'how wretched!' }, { left: 'ـنَّ', right: 'surely (emphasis)' } ] } },
  { type: 'fill_blank', content: { sentence: 'The heavy نّ added to a verb (as in لَيُسْجَنَنَّ) is the nūn of ___.', correct_answer: 'emphasis', options: ['emphasis', 'plural', 'the feminine'], explanation: 'Nūn al-tawkīd: "he will SURELY…".' } },
  { type: 'teach', content: { title: 'Praise & emphasis', explanation: 'نعم، بئس, and the emphatic نّ. Next: exclamation and a final read.', arabic: null, transliteration: null } },
]};
const U47_L2 = { steps: [
  { type: 'teach', content: { title: 'Exclamation (al-taʿajjub) + wrap-up', explanation: 'To exclaim wonder, Arabic uses **مَا أَفْعَلَهُ**: "How ___ he is!"\n\nقُتِلَ الْإِنْسَانُ مَا أَكْفَرَهُ — "…how ungrateful he is!" A frozen exclamation on the أَفْعَلَ pattern.', arabic: 'مَا أَكْفَرَهُ', transliteration: 'maa akfarah', examples: [ { ar: 'مَا أَحْسَنَهُ', tr: 'maa aḥsanah', en: 'how good he is!' } ], fun_fact: 'مَا أَكْفَرَهُ (Abasa 80:17) is an exclamation of astonishment at ingratitude — grammar carrying deep emotion.' } },
  { type: 'mcq', content: { question: 'مَا أَكْفَرَهُ means...', options: [ { text: 'how ungrateful he is! (an exclamation)', correct: true }, { text: 'he did not disbelieve', correct: false } ], explanation: 'مَا أَفْعَلَهُ = "how ___ he is!" — an exclamation, not a negation here.' } },
  { type: 'classify', content: { instruction: 'Praise, blame, or exclamation?', categories: ['Praise (نِعْمَ)', 'Blame (بِئْسَ)', 'Exclamation (مَا أَفْعَلَهُ)'], items: [ { text: 'نِعْمَ الْمَوْلَىٰ', category: 'Praise (نِعْمَ)' }, { text: 'بِئْسَ الشَّرَابُ', category: 'Blame (بِئْسَ)' }, { text: 'مَا أَكْفَرَهُ', category: 'Exclamation (مَا أَفْعَلَهُ)' } ], explanation: 'Three flavours of emotional style.' } },
  { type: 'fill_blank', content: { sentence: 'The exclamation pattern is مَا أَفْعَلَ + ___ ("how ___ he is!").', correct_answer: 'هُ', options: ['هُ', 'نَا', 'كَ'], explanation: 'مَا أَحْسَنَهُ, مَا أَكْفَرَهُ — the هُ closes the exclamation.' } },
  { type: 'teach', content: { title: '🏆 STAGE 13 COMPLETE — the Quran’s rhetoric!', explanation: 'You now read **conditionals** (if/when… then), **numbers** (3–10 and 11–99), and the persuasive style of the Quran — **oaths, restriction, fronting, praise/blame, emphasis, and exclamation**.\n\nOne stage remains: **Full Iʿrāb Mastery** — parsing complete ayat end to end, up to the Grammarian’s Ijāzah.', arabic: null, transliteration: null } },
]};

const U44_VOCAB = [ ['إِنْ','in','if (hypothetical)','harf',null,null,'Muhammad 47:7',1], ['إِذَا','idhaa','when (expected)','harf',null,null,'An-Nasr 110:1',1], ['نَصْر','naṣr','help / victory','ism','masculine','singular','An-Nasr 110:1',1], ['الْفَتْح','al-fatḥ','the conquest / opening','ism','masculine','singular','An-Nasr 110:1',1] ];
const U45_VOCAB = [ ['سَبْعَ','sab‘a','seven','ism','feminine','singular','At-Talaq 65:12',1], ['ثَلَاثَة','thalaathah','three','ism','feminine','singular','Al-Baqarah 2:196',1], ['أَرْبَعِينَ','arba‘een','forty','ism','masculine','plural','Al-Baqarah 2:51',1], ['كَوْكَب','kawkab','star / planet','ism','masculine','singular','Yusuf 12:4',2] ];
const U46_VOCAB = [ ['إِنَّمَا','innamaa','only / but','harf',null,null,'Al-Hujurat 49:10',1], ['وَالْعَصْر','wal-‘aṣr','by time (oath)','ism','masculine','singular','Al-Asr 103:1',1], ['خُسْر','khusr','loss','ism','masculine','singular','Al-Asr 103:2',1], ['إِخْوَة','ikhwah','brothers','ism','masculine','plural','Al-Hujurat 49:10',1] ];
const U47_VOCAB = [ ['نِعْمَ','ni‘ma','how excellent!','feel',null,null,'Al-Anfal 8:40',2], ['بِئْسَ','bi’sa','how wretched!','feel',null,null,'Al-Baqarah 2:90',2] ];

const UNIT_DEFS = [
  [44,'shart','Conditionals','الشَّرْط','🔀','#8B7BD8',false,'If/when… then… — إِنْ, إِذَا, مَنْ, مَا and the jawāb al-sharṭ.'],
  [45,'adad-madud','Numbers & the Counted','العَدَد وَالمَعْدُود','🧮','#5FB57A',false,'The reverse-agreement of 3–10 and the number-tamyīz of 11–99.'],
  [46,'rhetoric','Oaths, Only & Fronting','القَسَم وَالقَصْر','⚡','#6BA8D4',false,'al-qasam (oaths), al-qaṣr (restriction), and taqdīm (fronting).'],
  [47,'style','Praise, Blame & Wonder','المَدْح وَالذَّمّ','🎭','#C77DBB',true,'نِعْمَ / بِئْسَ, the nūn of emphasis, and exclamation (مَا أَفْعَلَهُ).'],
];
const LESSONS = [
  [44,'if-then','If… Then…',1,U44_L1,15],[44,'idha-in','When vs If',2,U44_L2,15],[44,'read-quran-nasr','Read the Quran: Surat an-Naṣr',3,U44_L3,20],
  [45,'numbers-3-10','Numbers Disagree (3–10)',1,U45_L1,15],[45,'numbers-11-99','Eleven and Up',2,U45_L2,15],[45,'read-quran-numbers','Read the Quran: Seven Heavens',3,U45_L3,20],
  [46,'qasam','The Oath',1,U46_L1,15],[46,'qasr','Only (Restriction)',2,U46_L2,15],[46,'taqdim','Fronting for Emphasis',3,U46_L3,15],[46,'read-quran-asr-full','Read the Quran: Al-ʿAṣr Complete',4,U46_L4,20],
  [47,'praise-blame','Praise, Blame & Emphasis',1,U47_L1,15],[47,'taajjub','Exclamation & Wrap-Up',2,U47_L2,20],
];
const VOCAB = [[44,U44_VOCAB],[45,U45_VOCAB],[46,U46_VOCAB],[47,U47_VOCAB]];

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
  const [f] = await sql`SELECT id FROM learning_lessons WHERE unit_id=${id[44]} ORDER BY sort_order LIMIT 1`;
  const un = await sql`WITH prev AS (SELECT l.id FROM learning_lessons l JOIN learning_units u ON u.id=l.unit_id WHERE u.sort_order=43), fin AS (SELECT p.user_id FROM user_lesson_progress p JOIN prev ON prev.id=p.lesson_id WHERE p.status='completed' GROUP BY p.user_id HAVING count(*)=(SELECT count(*) FROM prev)) INSERT INTO user_lesson_progress (user_id,lesson_id,status) SELECT fin.user_id,${f.id},'available' FROM fin ON CONFLICT (user_id,lesson_id) DO NOTHING RETURNING user_id`;
  console.log(`  ✓ Unlocked U44 L1 for ${un.length} finishers of U43`);
  const [t]=await sql`SELECT count(*)::int u FROM learning_units`,[tl]=await sql`SELECT count(*)::int l FROM learning_lessons`;
  console.log(`TOTAL: ${t.u} units, ${tl.l} lessons.`);
}
main().then(()=>sql.end()).catch(async e=>{console.error('FAIL:',e.message);await sql.end();process.exit(1);});
