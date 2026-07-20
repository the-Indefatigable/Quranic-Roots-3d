/**
 * PART B — Stage 11: THE ACCUSATIVE FAMILY IN FULL — Units 37–40.
 *   37 The Five Mafʿūls (muṭlaq, li-ajlih, fīh/ẓarf, maʿah)
 *   38 al-Ḥāl (the circumstance)
 *   39 al-Tamyīz (the specifier)
 *   40 al-Istithnāʾ & al-Munādā (exception & vocative) — checkpoint_after
 * Run: DATABASE_URL=... node scripts/seed-stage-11.mjs
 */
import postgres from 'postgres';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

const U37_L1 = { steps: [
  { type: 'teach', content: { title: 'Beyond the object: five mafʿūls', explanation: 'You know the **maf‘ūl bihi** (the direct object). But naṣb has more members. The first is the **maf‘ūl muṭlaq** — a maṣdar added for emphasis:\n\nوَكَلَّمَ اللّٰهُ مُوسَىٰ **تَكْلِيمًا** — "And Allah spoke to Moses a [true] speaking."', arabic: 'المَفْعُول المُطْلَق', transliteration: 'al-maf‘ool al-muṭlaq', examples: [ { ar: 'تَكْلِيمًا', tr: 'takleeman', en: 'a [real] speaking (emphasis)' } ], fun_fact: 'تَكْلِيمًا is the maṣdar of كَلَّمَ, repeated to stress that the speech was direct and real — "spoke a true speech".' } },
  { type: 'mcq', content: { question: 'A maf‘ūl muṭlaq is a maṣdar added mainly to...', options: [ { text: 'emphasize or describe the verb', correct: true }, { text: 'name the doer', correct: false } ], explanation: 'It reinforces the action itself — always in naṣb.' } },
  { type: 'fill_blank', content: { sentence: 'وَكَلَّمَ اللّٰهُ مُوسَىٰ تَكْلِيمًا — تَكْلِيمًا is a maf‘ūl ___ (emphasis).', correct_answer: 'muṭlaq', options: ['muṭlaq', 'bihi', 'fīh'], explanation: 'A cognate maṣdar in naṣb, emphasizing "spoke".' } },
  { type: 'classify', content: { instruction: 'Direct object (bihi) or emphasis-maṣdar (muṭlaq)?', categories: ['maf‘ūl bihi', 'maf‘ūl muṭlaq'], items: [ { text: 'الْأَرْضَ (created the earth)', category: 'maf‘ūl bihi' }, { text: 'تَكْلِيمًا (spoke a speaking)', category: 'maf‘ūl muṭlaq' } ], explanation: 'bihi = the thing acted on; muṭlaq = the action re-named for stress.' } },
  { type: 'teach', content: { title: 'The emphasis object', explanation: 'maf‘ūl muṭlaq stresses the verb. Next: the object of PURPOSE.', arabic: null, transliteration: null } },
]};
const U37_L2 = { steps: [
  { type: 'teach', content: { title: 'The object of purpose (li-ajlih)', explanation: 'The **maf‘ūl li-ajlih** gives the REASON for an action — "out of / because of". It is a maṣdar in naṣb:\n\nيَجْعَلُونَ أَصَابِعَهُمْ فِي آذَانِهِم مِّنَ الصَّوَاعِقِ **حَذَرَ الْمَوْتِ** — "…out of FEAR of death."', arabic: 'حَذَرَ الْمَوْتِ', transliteration: 'ḥadhara-l-mawt', examples: [ { ar: 'حَذَرَ', tr: 'ḥadhara', en: 'out of fear (reason)' }, { ar: 'اِبْتِغَاءَ', tr: 'ibtighaa’a', en: 'seeking / for the sake of' } ], fun_fact: 'اِبْتِغَاءَ مَرْضَاتِ اللّٰهِ — "seeking the pleasure of Allah" (Al-Baqarah 2:207). A maf‘ūl li-ajlih: WHY they act.' } },
  { type: 'mcq', content: { question: 'The maf‘ūl li-ajlih answers which question?', options: [ { text: 'WHY the action was done', correct: true }, { text: 'WHO did it', correct: false }, { text: 'WHERE it happened', correct: false } ], explanation: 'It gives the reason/purpose — in naṣb.' } },
  { type: 'fill_blank', content: { sentence: 'اِبْتِغَاءَ مَرْضَاتِ اللّٰهِ = "___ the pleasure of Allah" (the reason).', correct_answer: 'seeking', options: ['seeking', 'in', 'from'], explanation: 'A maf‘ūl li-ajlih naming the motive.' } },
  { type: 'classify', content: { instruction: 'Emphasis (muṭlaq) or purpose (li-ajlih)?', categories: ['muṭlaq (emphasis)', 'li-ajlih (purpose)'], items: [ { text: 'تَكْلِيمًا (a speaking)', category: 'muṭlaq (emphasis)' }, { text: 'حَذَرَ الْمَوْتِ (fear of death)', category: 'li-ajlih (purpose)' }, { text: 'اِبْتِغَاءَ (seeking)', category: 'li-ajlih (purpose)' } ], explanation: 'muṭlaq stresses the verb; li-ajlih explains WHY.' } },
  { type: 'teach', content: { title: 'The reason-object', explanation: 'li-ajlih = the motive. Next: the object of TIME and PLACE.', arabic: null, transliteration: null } },
]};
const U37_L3 = { steps: [
  { type: 'teach', content: { title: 'The adverb of time & place (ẓarf)', explanation: 'The **maf‘ūl fīh** — also called the *ẓarf* — names WHEN or WHERE, in naṣb:\n\n**يَوْمَ** (on the day) · **حِينَ** (at the time) · **عِنْدَ** (with/at) · **فَوْقَ** (above) · **تَحْتَ** (below)', arabic: 'يَوْمَ · عِنْدَ · فَوْقَ', transliteration: 'yawma · ‘inda · fawqa', examples: [ { ar: 'يَوْمَ الْقِيَامَةِ', tr: 'yawmal-qiyaamah', en: 'on the Day of Resurrection' }, { ar: 'عِنْدَ رَبِّهِمْ', tr: '‘inda rabbihim', en: 'with their Lord' } ], fun_fact: 'These "container" words (ẓarf = container) hold the action in time or space — always manṣūb.' } },
  { type: 'mcq', content: { question: 'يَوْمَ الْقِيَامَةِ ("on the Day of Resurrection") — يَوْمَ is a ẓarf of...', options: [ { text: 'time (when)', correct: true }, { text: 'place (where)', correct: false } ], explanation: 'يَوْمَ = time; فَوْقَ/تَحْتَ = place. Both are manṣūb.' } },
  { type: 'classify', content: { instruction: 'Ẓarf of time or place?', categories: ['Time (when)', 'Place (where)'], items: [ { text: 'يَوْمَ', category: 'Time (when)' }, { text: 'فَوْقَ', category: 'Place (where)' }, { text: 'حِينَ', category: 'Time (when)' }, { text: 'تَحْتَ', category: 'Place (where)' } ], explanation: 'يَوْمَ/حِينَ = time; فَوْقَ/تَحْتَ = place.' } },
  { type: 'fill_blank', content: { sentence: 'عِنْدَ رَبِّهِمْ — عِنْدَ is a ẓarf, so it is in the ___ case.', correct_answer: 'naṣb', options: ['naṣb', 'raf‘', 'jarr'], explanation: 'The maf‘ūl fīh (ẓarf) is manṣūb.' } },
  { type: 'teach', content: { title: 'When & where', explanation: 'The ẓarf holds the action in time/place. Also exists a maf‘ūl ma‘ah ("along with", after wāw). Next: read the maf‘ūls together.', arabic: null, transliteration: null } },
]};
const U37_L4 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — the mafʿūls at work', explanation: 'A single ayah can stack several manṣūb roles. Practice spotting them across real fragments.', arabic: 'وَكَلَّمَ اللّٰهُ مُوسَىٰ تَكْلِيمًا', transliteration: 'wa kallamallaahu moosaa takleeman', quran_ref: 'An-Nisa 4:164' } },
  { type: 'classify', content: { instruction: 'Which kind of manṣūb role?', categories: ['Direct object (bihi)', 'Emphasis (muṭlaq)', 'Time/place (ẓarf)', 'Purpose (li-ajlih)'], items: [ { text: 'مُوسَىٰ (spoke TO Moses)', category: 'Direct object (bihi)' }, { text: 'تَكْلِيمًا (a speaking)', category: 'Emphasis (muṭlaq)' }, { text: 'يَوْمَ الْقِيَامَةِ (on the Day)', category: 'Time/place (ẓarf)' }, { text: 'حَذَرَ الْمَوْتِ (out of fear)', category: 'Purpose (li-ajlih)' } ], explanation: 'Four flavors of naṣb — object, emphasis, adverb, and reason.' } },
  { type: 'mcq', content: { question: 'All five mafʿūls share which case?', options: [ { text: 'naṣb (fatḥa)', correct: true }, { text: 'raf‘', correct: false }, { text: 'jarr', correct: false } ], explanation: 'They are all members of the manṣūbāt.' } },
  { type: 'fill_blank', content: { sentence: 'The ẓarf يَوْمَ, the object مُوسَىٰ, and the emphasis تَكْلِيمًا are all in ___.', correct_answer: 'naṣb', options: ['naṣb', 'raf‘', 'jarr'], explanation: 'All manṣūb — the fatḥa family.' } },
  { type: 'teach', content: { title: '🎉 Unit 37 complete!', explanation: 'Five kinds of object, all manṣūb. Next: describing HOW the action happened — the ḥāl.', arabic: null, transliteration: null } },
]};

const U38_L1 = { steps: [
  { type: 'teach', content: { title: 'al-Ḥāl — "how / in what state"', explanation: 'The **ḥāl** describes the STATE of the doer or object while the action happens — "he came *running*". It is an indefinite noun in **naṣb**:\n\nادْخُلُوهَا **آمِنِينَ** — "Enter it [in] security / as secure ones."', arabic: 'ادْخُلُوهَا آمِنِينَ', transliteration: 'udkhuloohaa aamineen', examples: [ { ar: 'خَاشِعِينَ', tr: 'khaashi‘een', en: 'humbly (in a state of humility)' }, { ar: 'قَانِتِينَ', tr: 'qaaniteen', en: 'devoutly obedient' } ], fun_fact: 'The ḥāl answers "how?" and is almost always indefinite and manṣūb — a snapshot of the state during the action.' } },
  { type: 'mcq', content: { question: 'The ḥāl tells you...', options: [ { text: 'the STATE/manner during the action ("running", "secure")', correct: true }, { text: 'the doer', correct: false }, { text: 'the time', correct: false } ], explanation: 'ḥāl = circumstance/manner, in naṣb.' } },
  { type: 'fill_blank', content: { sentence: 'ادْخُلُوهَا بِسَلَامٍ ___ — "Enter it in peace, [as] secure ones" (Al-Hijr 15:46).', correct_answer: 'آمِنِينَ', options: ['آمِنِينَ', 'الْأَمْنُ', 'أَمِنَ'], explanation: 'آمِنِينَ (naṣb, indefinite) is the ḥāl — the state of the enterers.' } },
  { type: 'classify', content: { instruction: 'Is the word a ḥāl (state) or something else?', categories: ['Ḥāl (state, naṣb indefinite)', 'Not a ḥāl'], items: [ { text: 'آمِنِينَ (secure)', category: 'Ḥāl (state, naṣb indefinite)' }, { text: 'خَاشِعِينَ (humble)', category: 'Ḥāl (state, naṣb indefinite)' }, { text: 'الْمُؤْمِنُونَ (the believers — subject)', category: 'Not a ḥāl' } ], explanation: 'A ḥāl is indefinite and manṣūb; a definite subject is not a ḥāl.' } },
  { type: 'teach', content: { title: 'The circumstance', explanation: 'ḥāl = the state during the action. Next: when a whole sentence is the ḥāl.', arabic: null, transliteration: null } },
]};
const U38_L2 = { steps: [
  { type: 'teach', content: { title: 'The ḥāl as a sentence', explanation: 'A whole clause can be a ḥāl, usually introduced by **وَ** (wāw al-ḥāl = "while"):\n\nلَا تَقْرَبُوا الصَّلَاةَ **وَأَنتُمْ سُكَارَىٰ** — "do not approach prayer **while you are** intoxicated."', arabic: 'وَأَنتُمْ سُكَارَىٰ', transliteration: 'wa antum sukaaraa', examples: [ { ar: 'وَهُمْ رَاكِعُونَ', tr: 'wa hum raaki‘oon', en: 'while they bow' } ], fun_fact: 'This "while…" وَ is different from the "and" وَ — context and a following nominal sentence reveal it.' } },
  { type: 'mcq', content: { question: 'وَأَنتُمْ سُكَارَىٰ ("while you are intoxicated") is a...', options: [ { text: 'ḥāl sentence (jumla ḥāliyya)', correct: true }, { text: 'an ordinary "and" clause', correct: false } ], explanation: 'The wāw al-ḥāl + a nominal sentence = a circumstantial clause.' } },
  { type: 'fill_blank', content: { sentence: 'A ḥāl-clause often begins with the "___" wāw (wāw al-ḥāl).', correct_answer: 'while', options: ['while', 'from', 'or'], explanation: 'وَ + subject-pronoun + predicate = "while ___".' } },
  { type: 'classify', content: { instruction: 'Single-word ḥāl or ḥāl-sentence?', categories: ['Single-word ḥāl', 'Ḥāl-sentence (وَ…)'], items: [ { text: 'آمِنِينَ', category: 'Single-word ḥāl' }, { text: 'وَهُمْ رَاكِعُونَ', category: 'Ḥāl-sentence (وَ…)' }, { text: 'خَاشِعِينَ', category: 'Single-word ḥāl' } ], explanation: 'A ḥāl can be one word or a وَ-clause.' } },
  { type: 'teach', content: { title: 'Ḥāl clauses', explanation: 'وَ + a state = "while…". Next: read the ḥāl in the Quran.', arabic: null, transliteration: null } },
]};
const U38_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — enter in peace', explanation: '**ادْخُلُوهَا بِسَلَامٍ آمِنِينَ** — "Enter it in peace, secure." (Al-Hijr 15:46)', arabic: 'ادْخُلُوهَا بِسَلَامٍ آمِنِينَ', transliteration: 'udkhuloohaa bisalaamin aamineen', quran_ref: 'Al-Hijr 15:46' } },
  { type: 'mcq', content: { question: 'آمِنِينَ here describes...', options: [ { text: 'the STATE of those entering ("as secure ones") — a ḥāl', correct: true }, { text: 'the place they enter', correct: false } ], explanation: 'A ḥāl: how they enter — secure.' } },
  { type: 'classify', content: { instruction: 'Tag the role', categories: ['Command (verb)', 'Ḥāl (state)', 'Preposition phrase'], items: [ { text: 'ادْخُلُوا (Enter!)', category: 'Command (verb)' }, { text: 'آمِنِينَ (secure)', category: 'Ḥāl (state)' }, { text: 'بِسَلَامٍ (in peace)', category: 'Preposition phrase' } ], explanation: 'Command + ḥāl + prepositional phrase.' } },
  { type: 'fill_blank', content: { sentence: 'آمِنِينَ is indefinite and in ___, the mark of a ḥāl.', correct_answer: 'naṣb', options: ['naṣb', 'raf‘', 'jarr'], explanation: 'ḥāl = indefinite + manṣūb.' } },
  { type: 'teach', content: { title: '🎉 Unit 38 complete!', explanation: 'The ḥāl paints the state of an action. Next: the tamyīz, which removes ambiguity.', arabic: null, transliteration: null } },
]};

const U39_L1 = { steps: [
  { type: 'teach', content: { title: 'al-Tamyīz — the specifier', explanation: 'The **tamyīz** clarifies a vague word — "a specification". It is an indefinite noun in **naṣb**, answering "in what respect?":\n\nوَاشْتَعَلَ الرَّأْسُ **شَيْبًا** — "and the head flared **[with] white hair**." (What flared? In respect of white hair.)', arabic: 'اشْتَعَلَ الرَّأْسُ شَيْبًا', transliteration: 'ishta‘alar-ra’su shayban', examples: [ { ar: 'شَيْبًا', tr: 'shayban', en: 'in white hair (specifier)' } ], fun_fact: 'Instead of "his hair turned white", the Quran says "the head flared up in whiteness" — vivid, and grammatically a tamyīz.' } },
  { type: 'mcq', content: { question: 'The tamyīz answers which question?', options: [ { text: '"In what respect?" (it specifies a vague word)', correct: true }, { text: '"When?"', correct: false }, { text: '"Who?"', correct: false } ], explanation: 'It removes ambiguity — indefinite and manṣūb.' } },
  { type: 'fill_blank', content: { sentence: 'وَاشْتَعَلَ الرَّأْسُ ___ — "the head flared [with] white hair".', correct_answer: 'شَيْبًا', options: ['شَيْبًا', 'الشَّيْبُ', 'شَابَ'], explanation: 'شَيْبًا (naṣb, indefinite) is the tamyīz.' } },
  { type: 'classify', content: { instruction: 'Tamyīz (specification) or not?', categories: ['Tamyīz (naṣb, specifies)', 'Not a tamyīz'], items: [ { text: 'شَيْبًا (in white hair)', category: 'Tamyīz (naṣb, specifies)' }, { text: 'عُيُونًا (in springs)', category: 'Tamyīz (naṣb, specifies)' }, { text: 'الرَّأْسُ (the head — subject)', category: 'Not a tamyīz' } ], explanation: 'The specifier is indefinite + manṣūb.' } },
  { type: 'teach', content: { title: 'The specifier', explanation: 'tamyīz clarifies "in what respect". Next: telling it apart from the ḥāl.', arabic: null, transliteration: null } },
]};
const U39_L2 = { steps: [
  { type: 'teach', content: { title: 'Tamyīz vs Ḥāl', explanation: 'Both are indefinite and manṣūb — but:\n\n**Ḥāl** = the STATE of someone ("he came *running*") — answers "how?"\n**Tamyīz** = a SPECIFICATION of something vague ("overflowed *[in] generosity*") — answers "in what respect?"', arabic: 'حَال ≠ تَمْيِيز', transliteration: 'ḥāl vs tamyīz', examples: [ { ar: 'رَاكِعِينَ (ḥāl)', tr: 'raaki‘een', en: 'bowing (their state)' }, { ar: 'عُيُونًا (tamyīz)', tr: '‘uyoonan', en: '[in] springs (specification)' } ], fun_fact: 'Tip: a ḥāl usually describes a person’s manner; a tamyīz usually clarifies a number, measure, or vague noun.' } },
  { type: 'mcq', content: { question: 'Which one answers "in what respect?"', options: [ { text: 'tamyīz', correct: true }, { text: 'ḥāl', correct: false } ], explanation: 'ḥāl = "how/in what state"; tamyīz = "in what respect".' } },
  { type: 'classify', content: { instruction: 'Ḥāl or tamyīz?', categories: ['Ḥāl (state)', 'Tamyīz (specification)'], items: [ { text: 'آمِنِينَ (secure)', category: 'Ḥāl (state)' }, { text: 'شَيْبًا (in white hair)', category: 'Tamyīz (specification)' }, { text: 'عُيُونًا (in springs)', category: 'Tamyīz (specification)' }, { text: 'خَاشِعِينَ (humbly)', category: 'Ḥāl (state)' } ], explanation: 'People’s manner = ḥāl; clarifying a vague noun/number = tamyīz.' } },
  { type: 'fill_blank', content: { sentence: 'Both ḥāl and tamyīz are indefinite and in the ___ case.', correct_answer: 'naṣb', options: ['naṣb', 'raf‘', 'jarr'], explanation: 'Both belong to the manṣūbāt.' } },
  { type: 'teach', content: { title: 'Two look-alikes sorted', explanation: 'State vs specification. Next: read the tamyīz in the Quran.', arabic: null, transliteration: null } },
]};
const U39_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — the earth burst forth', explanation: '**وَفَجَّرْنَا الْأَرْضَ عُيُونًا** — "and We caused the earth to burst forth [with] springs." (Al-Qamar 54:12)', arabic: 'وَفَجَّرْنَا الْأَرْضَ عُيُونًا', transliteration: 'wa fajjarnal-arḍa ‘uyoonan', quran_ref: 'Al-Qamar 54:12' } },
  { type: 'mcq', content: { question: 'عُيُونًا ("springs") clarifies HOW the earth burst — it is a...', options: [ { text: 'tamyīz (specification)', correct: true }, { text: 'direct object', correct: false } ], explanation: 'الْأَرْضَ is the object; عُيُونًا specifies the manner of bursting → tamyīz.' } },
  { type: 'classify', content: { instruction: 'Tag the naṣb roles', categories: ['Object (bihi)', 'Tamyīz (specification)'], items: [ { text: 'الْأَرْضَ (the earth)', category: 'Object (bihi)' }, { text: 'عُيُونًا (springs)', category: 'Tamyīz (specification)' } ], explanation: 'Object = what was burst; tamyīz = in what respect.' } },
  { type: 'fill_blank', content: { sentence: 'فَجَّرْنَا is the "We"-past of the Form-___ verb فَجَّرَ.', correct_answer: 'II', options: ['II', 'IV', 'X'], explanation: 'Doubled middle letter → Form II (intensive): "burst forth abundantly".' } },
  { type: 'teach', content: { title: '🎉 Unit 39 complete!', explanation: 'The tamyīz sharpens meaning. Next: the exception and the call — istithnāʾ and munādā.', arabic: null, transliteration: null } },
]};

const U40_L1 = { steps: [
  { type: 'teach', content: { title: 'al-Istithnāʾ — the exception', explanation: 'You met **إِلَّا** ("except") in Part A. Formally, the word after إِلَّا (the *mustathnā*) is usually **manṣūb**:\n\nفَشَرِبُوا مِنْهُ **إِلَّا قَلِيلًا** — "they drank from it except a few."\n\nOther exception words: **غَيْر** and **سِوَىٰ** (put the next word in jarr).', arabic: 'إِلَّا قَلِيلًا', transliteration: 'illaa qaleelan', examples: [ { ar: 'إِلَّا قَلِيلًا', tr: 'illaa qaleelan', en: 'except a few (naṣb)' }, { ar: 'غَيْرَ', tr: 'ghayra', en: 'other than' } ], fun_fact: 'In لَا إِلَٰهَ إِلَّا اللّٰهُ the exception اللّٰهُ is raf‘ (a special "positive after total negation" case) — but a normal exception is manṣūb.' } },
  { type: 'mcq', content: { question: 'In فَشَرِبُوا مِنْهُ إِلَّا قَلِيلًا, قَلِيلًا (the exception) is in...', options: [ { text: 'naṣb (fatḥa)', correct: true }, { text: 'raf‘', correct: false } ], explanation: 'The mustathnā after إِلَّا in an affirmative sentence is manṣūb.' } },
  { type: 'match', content: { instruction: 'Match the exception word', pairs: [ { left: 'إِلَّا', right: 'except' }, { left: 'غَيْر', right: 'other than' }, { left: 'سِوَىٰ', right: 'apart from' } ] } },
  { type: 'fill_blank', content: { sentence: 'The word excepted by إِلَّا (the mustathnā) is normally in ___.', correct_answer: 'naṣb', options: ['naṣb', 'jarr', 'jazm'], explanation: 'Manṣūb — a member of the accusative family.' } },
  { type: 'teach', content: { title: 'The exception', explanation: 'إلّا، غير، سوى carve one thing out. Next: calling out — the vocative.', arabic: null, transliteration: null } },
]};
const U40_L2 = { steps: [
  { type: 'teach', content: { title: 'al-Munādā — the call', explanation: 'To call/address someone, Arabic uses **يَا** ("O"). The one called (the *munādā*) is often manṣūb when it heads an iḍāfa, and takes a plain ḍamma when a single definite word:\n\n**يَا أَيُّهَا الَّذِينَ آمَنُوا** — "O you who believe!"\n**رَبَّنَا** — "O our Lord!" (naṣb, iḍāfa)', arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا', transliteration: 'yaa ayyuhal-ladheena aamanoo', examples: [ { ar: 'رَبَّنَا', tr: 'rabbanaa', en: 'O our Lord (naṣb)' }, { ar: 'يَا بُنَيَّ', tr: 'yaa bunayya', en: 'O my dear son' } ], fun_fact: 'رَبَّنَا ("O our Lord") drops the يَا but is still a call — the naṣb fatḥa signals it.' } },
  { type: 'mcq', content: { question: 'يَا أَيُّهَا الَّذِينَ آمَنُوا means...', options: [ { text: 'O you who believe!', correct: true }, { text: 'those who believed left', correct: false } ], explanation: 'يَا = "O"; a call to the believers — the munādā.' } },
  { type: 'fill_blank', content: { sentence: 'رَبَّنَا ("O our Lord") is a munādā in ___ because it heads an iḍāfa.', correct_answer: 'naṣb', options: ['naṣb', 'raf‘', 'jarr'], explanation: 'A called word in iḍāfa takes the naṣb fatḥa.' } },
  { type: 'classify', content: { instruction: 'Is it a call (munādā) or not?', categories: ['Munādā (a call)', 'Not a call'], items: [ { text: 'يَا أَيُّهَا النَّاسُ', category: 'Munādā (a call)' }, { text: 'رَبَّنَا', category: 'Munādā (a call)' }, { text: 'اللّٰهُ أَكْبَرُ', category: 'Not a call' } ], explanation: 'يَا or a dropped-يَا vocative = munādā.' } },
  { type: 'teach', content: { title: 'The vocative', explanation: 'يَا calls; رَبَّنَا pleads. Next: read the exception and the call together.', arabic: null, transliteration: null } },
]};
const U40_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — the testimony & the call', explanation: '**لَا إِلَٰهَ إِلَّا اللّٰهُ** (the exception) and **يَا أَيُّهَا الَّذِينَ آمَنُوا** (the call) — two structures you now fully parse.', arabic: 'لَا إِلَٰهَ إِلَّا اللّٰهُ', transliteration: 'laa ilaaha illallaah', quran_ref: 'As-Saffat 37:35' } },
  { type: 'classify', content: { instruction: 'Exception or call?', categories: ['Istithnāʾ (exception)', 'Munādā (call)'], items: [ { text: 'إِلَّا اللّٰهُ', category: 'Istithnāʾ (exception)' }, { text: 'يَا أَيُّهَا النَّاسُ', category: 'Munādā (call)' }, { text: 'إِلَّا قَلِيلًا', category: 'Istithnāʾ (exception)' }, { text: 'رَبَّنَا', category: 'Munādā (call)' } ], explanation: 'إِلَّا/غَيْر = exception; يَا / رَبَّنَا = call.' } },
  { type: 'mcq', content: { question: 'Why is اللّٰهُ in لَا إِلَٰهَ إِلَّا اللّٰهُ in raf‘, not naṣb?', options: [ { text: 'It is the special "positive after total negation" — it takes the case of the omitted subject', correct: true }, { text: 'Allah’s name is always raf‘', correct: false } ], explanation: 'A subtlety: when there is no affirmed thing, the exception is raised as the real subject.' } },
  { type: 'fill_blank', content: { sentence: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللّٰهَ — اتَّقُوا is a plural ___ ("be mindful!").', correct_answer: 'command', options: ['command', 'past verb', 'noun'], explanation: 'A call (munādā) is usually followed by a command.' } },
  { type: 'teach', content: { title: '🏆 STAGE 11 COMPLETE — the accusative family!', explanation: 'You now recognise every reason a word takes naṣb: the **five mafʿūls**, the **ḥāl**, the **tamyīz**, the **istithnāʾ**, and the **munādā** — plus the ism of إِنَّ and the khabar of كَانَ from Stage 8.\n\nNext: the **followers** — how phrases chain through description, joining, emphasis, and substitution.', arabic: null, transliteration: null } },
]};

const U37_VOCAB = [ ['حَذَر','ḥadhar','out of fear (maf‘ūl li-ajlih)','ism','masculine','singular','Al-Baqarah 2:19',2], ['يَوْمَ','yawma','on the day (ẓarf)','ism','masculine','singular','Al-Fatiha 1:4',1], ['عِنْدَ','‘inda','with / at (ẓarf)','ism','masculine','singular','Aal Imran 3:19',1], ['تَكْلِيمًا','takleeman','a [true] speaking (muṭlaq)','ism','masculine','singular','An-Nisa 4:164',2] ];
const U38_VOCAB = [ ['آمِنِينَ','aamineen','secure (ḥāl)','ism','masculine','plural','Al-Hijr 15:46',1], ['خَاشِعِينَ','khaashi‘een','humble (ḥāl)','ism','masculine','plural','Al-Anbiya 21:90',2], ['رَاكِعِينَ','raaki‘een','bowing (ḥāl)','ism','masculine','plural','Al-Baqarah 2:43',2] ];
const U39_VOCAB = [ ['شَيْبًا','shayban','[in] white hair (tamyīz)','ism','masculine','singular','Maryam 19:4',2], ['عُيُونًا','‘uyoonan','[in] springs (tamyīz)','ism','feminine','plural','Al-Qamar 54:12',2] ];
const U40_VOCAB = [ ['إِلَّا','illaa','except','harf',null,null,'As-Saffat 37:35',1], ['غَيْر','ghayr','other than','ism','masculine','singular','Al-Fatiha 1:7',1], ['يَا','yaa','O (vocative)','harf',null,null,'Al-Baqarah 2:21',1], ['رَبَّنَا','rabbanaa','O our Lord (munādā)','ism','masculine','singular','Al-Baqarah 2:127',1] ];

const UNIT_DEFS = [
  [37,'five-mafuls','The Five Objects','المَفَاعِيل','🎯','#8B7BD8',false,'maf‘ūl muṭlaq, li-ajlih, fīh (ẓarf), and ma‘ah — the accusative objects.'],
  [38,'hal','The Circumstance','الحَال','🏃','#5FB57A',false,'al-ḥāl — the state during an action ("he came running").'],
  [39,'tamyiz','The Specifier','التَّمْيِيز','🔍','#6BA8D4',false,'al-tamyīz — clarifying a vague word ("in what respect").'],
  [40,'istithna-munada','Exception & Call','الاِسْتِثْنَاء وَالنِّدَاء','📣','#C77DBB',true,'al-istithnāʾ (إِلَّا, غَيْر) and al-munādā (يَا, رَبَّنَا).'],
];
const LESSONS = [
  [37,'maful-mutlaq','The Emphasis Object',1,U37_L1,15],[37,'maful-liajlih','The Object of Purpose',2,U37_L2,15],[37,'zarf','Time & Place (Ẓarf)',3,U37_L3,15],[37,'read-quran-mafuls','Read the Quran: The Objects',4,U37_L4,20],
  [38,'hal-basics','How & In What State',1,U38_L1,15],[38,'hal-sentence','The Ḥāl as a Sentence',2,U38_L2,15],[38,'read-quran-hal','Read the Quran: Enter in Peace',3,U38_L3,20],
  [39,'tamyiz-basics','The Specifier',1,U39_L1,15],[39,'tamyiz-vs-hal','Tamyīz vs Ḥāl',2,U39_L2,15],[39,'read-quran-tamyiz','Read the Quran: Springs',3,U39_L3,20],
  [40,'istithna','The Exception',1,U40_L1,15],[40,'munada','The Call',2,U40_L2,15],[40,'read-quran-istithna','Read the Quran: Testimony & Call',3,U40_L3,20],
];
const VOCAB = [[37,U37_VOCAB],[38,U38_VOCAB],[39,U39_VOCAB],[40,U40_VOCAB]];

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
  const [f] = await sql`SELECT id FROM learning_lessons WHERE unit_id=${id[37]} ORDER BY sort_order LIMIT 1`;
  const un = await sql`WITH prev AS (SELECT l.id FROM learning_lessons l JOIN learning_units u ON u.id=l.unit_id WHERE u.sort_order=36), fin AS (SELECT p.user_id FROM user_lesson_progress p JOIN prev ON prev.id=p.lesson_id WHERE p.status='completed' GROUP BY p.user_id HAVING count(*)=(SELECT count(*) FROM prev)) INSERT INTO user_lesson_progress (user_id,lesson_id,status) SELECT fin.user_id,${f.id},'available' FROM fin ON CONFLICT (user_id,lesson_id) DO NOTHING RETURNING user_id`;
  console.log(`  ✓ Unlocked U37 L1 for ${un.length} finishers of U36`);
  const [t]=await sql`SELECT count(*)::int u FROM learning_units`,[tl]=await sql`SELECT count(*)::int l FROM learning_lessons`;
  console.log(`TOTAL: ${t.u} units, ${tl.l} lessons.`);
}
main().then(()=>sql.end()).catch(async e=>{console.error('FAIL:',e.message);await sql.end();process.exit(1);});
