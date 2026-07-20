/**
 * PART B — Stage 10: DERIVED NOUNS (ṣarf II, al-mushtaqqāt) — Units 33–36.
 *   33 al-Maṣdar (the verbal noun)
 *   34 ism al-Fāʿil & ism al-Mafʿūl (doer & receiver nouns)
 *   35 al-Ṣifa al-Mushabbaha & ism al-Tafḍīl (qualities & comparatives)
 *   36 ism al-Zamān/Makān/Āla + al-Nisba — checkpoint_after
 * Run: DATABASE_URL=... node scripts/seed-stage-10.mjs
 */
import postgres from 'postgres';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

const U33_L1 = { steps: [
  { type: 'teach', content: { title: 'The maṣdar — a verb as a noun', explanation: 'A **maṣdar** (مَصْدَر) is the "source" noun of a verb — the action named as a thing:\n\nعَلِمَ (knew) → **عِلْم** (knowledge)\nعَبَدَ (worshipped) → **عِبَادَة** (worship)\nشَكَرَ (thanked) → **شُكْر** (gratitude)', arabic: 'عِلْم · عِبَادَة', transliteration: '‘ilm · ‘ibaadah', examples: [ { ar: 'الْحَمْد', tr: 'al-ḥamd', en: 'praise (from ḥamida)' }, { ar: 'الصَّبْر', tr: 'aṣ-ṣabr', en: 'patience (from ṣabara)' } ], fun_fact: 'The maṣdar is the "source" (maṣdar literally = "place of issuing") from which the verb and other derived nouns flow.' } },
  { type: 'mcq', content: { question: 'A maṣdar is...', options: [ { text: 'the action named as a noun (e.g. عِلْم = knowledge)', correct: true }, { text: 'a command', correct: false }, { text: 'a plural', correct: false } ], explanation: 'The verbal noun — the "-ing" / "-ance" idea of the verb.' } },
  { type: 'match', content: { instruction: 'Match the verb to its maṣdar', pairs: [ { left: 'عَلِمَ (knew)', right: 'عِلْم (knowledge)' }, { left: 'عَبَدَ (worshipped)', right: 'عِبَادَة (worship)' }, { left: 'شَكَرَ (thanked)', right: 'شُكْر (gratitude)' } ] } },
  { type: 'fill_blank', content: { sentence: 'الْحَمْدُ لِلَّهِ — الْحَمْد ("praise") is the ___ of the verb حَمِدَ.', correct_answer: 'maṣdar', options: ['maṣdar', 'fāʿil', 'plural'], explanation: 'The action "praising" named as a noun.' } },
  { type: 'teach', content: { title: 'The source noun', explanation: 'Every verb has a maṣdar. Next: the maṣdar patterns of the derived forms.', arabic: null, transliteration: null } },
]};
const U33_L2 = { steps: [
  { type: 'teach', content: { title: 'Maṣdar patterns of the forms', explanation: 'Each verb form (II–X) has its own maṣdar shape:\n\nForm II فَعَّلَ → **تَفْعِيل** (تَنْزِيل sending-down)\nForm IV أَفْعَلَ → **إِفْعَال** (إِنْزَال sending-down, إِنْفَاق spending)\nForm X اِسْتَفْعَلَ → **اِسْتِفْعَال** (اِسْتِغْفَار seeking-forgiveness)', arabic: 'تَفْعِيل · إِفْعَال · اِسْتِفْعَال', transliteration: 'taf‘eel · if‘aal · istif‘aal', examples: [ { ar: 'تَنْزِيل', tr: 'tanzeel', en: 'revelation (II)' }, { ar: 'اِسْتِغْفَار', tr: 'istighfaar', en: 'seeking forgiveness (X)' } ], fun_fact: 'تَنْزِيلٌ مِنْ رَبِّ الْعَالَمِينَ — "a revelation (tanzīl) from the Lord of the worlds". The maṣdar of Form II.' } },
  { type: 'mcq', content: { question: 'The maṣdar of a Form X verb (اِسْتَفْعَلَ) looks like...', options: [ { text: 'اِسْتِفْعَال (e.g. اِسْتِغْفَار)', correct: true }, { text: 'تَفْعِيل', correct: false } ], explanation: 'Form X → اِسْتِفْعَال. اِسْتَغْفَرَ → اِسْتِغْفَار.' } },
  { type: 'classify', content: { instruction: 'Which form does the maṣdar belong to?', categories: ['Form II (تَفْعِيل)', 'Form IV (إِفْعَال)', 'Form X (اِسْتِفْعَال)'], items: [ { text: 'تَنْزِيل', category: 'Form II (تَفْعِيل)' }, { text: 'إِنْزَال', category: 'Form IV (إِفْعَال)' }, { text: 'اِسْتِغْفَار', category: 'Form X (اِسْتِفْعَال)' } ], explanation: 'The maṣdar shape reveals the verb form it came from.' } },
  { type: 'fill_blank', content: { sentence: 'اِسْتِغْفَار (seeking forgiveness) is the maṣdar of the Form ___ verb اِسْتَغْفَرَ.', correct_answer: 'X', options: ['X', 'II', 'IV'], explanation: 'اِسْتِفْعَال = the Form-X maṣdar.' } },
  { type: 'teach', content: { title: 'Maṣdar patterns', explanation: 'Each form has a maṣdar shape. Next: a whole clause packaged as a maṣdar.', arabic: null, transliteration: null } },
]};
const U33_L3 = { steps: [
  { type: 'teach', content: { title: 'The "moulded" maṣdar', explanation: 'Arabic can turn a whole clause into a maṣdar using **أَنْ + a verb** (or أَنَّ + a sentence). This is the *maṣdar mu’awwal*:\n\n**أَنْ تَصُومُوا** خَيْرٌ لَّكُمْ = "**that you fast** (i.e. your fasting) is better for you."', arabic: 'أَنْ تَصُومُوا', transliteration: 'an taṣoomoo', examples: [ { ar: 'أَنْ تَصُومُوا خَيْرٌ لَّكُمْ', tr: '…khayrun lakum', en: 'your fasting is better for you' } ], fun_fact: '"أَنْ + verb" = "the act of ___ing". أَنْ تَصُومُوا ≈ الصِّيَام ("fasting").' } },
  { type: 'mcq', content: { question: '"أَنْ + a verb" behaves grammatically like...', options: [ { text: 'a single noun (a maṣdar)', correct: true }, { text: 'a command', correct: false } ], explanation: 'The maṣdar mu’awwal — a clause acting as one noun.' } },
  { type: 'fill_blank', content: { sentence: 'أَنْ تَصُومُوا means "___ fast" and works as a noun ("your fasting").', correct_answer: 'that you', options: ['that you', 'do not', 'they'], explanation: 'أَنْ + verb = the "moulded" maṣdar.' } },
  { type: 'mcq', content: { question: 'وَأَنْ تَصُومُوا خَيْرٌ لَّكُمْ — the whole "أَنْ تَصُومُوا" is the sentence’s...', options: [ { text: 'subject (mubtada), = "your fasting"', correct: true }, { text: 'object', correct: false } ], explanation: 'The moulded maṣdar is the subject; خَيْرٌ is the predicate.' } },
  { type: 'teach', content: { title: 'Clause-as-noun', explanation: 'أَنْ + verb folds a clause into a maṣdar. Next: read maṣdar-rich ayat.', arabic: null, transliteration: null } },
]};
const U33_L4 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — maṣdars in worship', explanation: '**وَإِقَامِ الصَّلَاةِ وَإِيتَاءِ الزَّكَاةِ** — "and the establishing of prayer and the giving of zakah." (Al-Anbiya 21:73)', arabic: 'وَإِقَامِ الصَّلَاةِ وَإِيتَاءِ الزَّكَاةِ', transliteration: 'wa iqaamiṣ-ṣalaati wa eetaa’iz-zakaah', quran_ref: 'Al-Anbiya 21:73' } },
  { type: 'classify', content: { instruction: 'Maṣdar (the action as a noun) or not?', categories: ['Maṣdar', 'Not a maṣdar'], items: [ { text: 'إِقَام (establishing)', category: 'Maṣdar' }, { text: 'إِيتَاء (giving)', category: 'Maṣdar' }, { text: 'الصَّلَاة (the prayer)', category: 'Not a maṣdar' }, { text: 'عِبَادَة (worship)', category: 'Maṣdar' } ], explanation: 'إِقَام and إِيتَاء name the ACTION; الصَّلَاة is the thing itself.' } },
  { type: 'mcq', content: { question: 'إِقَامِ الصَّلَاةِ ("establishing of prayer") is what kind of structure?', options: [ { text: 'a maṣdar + its object in iḍāfa', correct: true }, { text: 'a verb sentence', correct: false } ], explanation: 'A maṣdar can head an iḍāfa: "the establishing OF the prayer".' } },
  { type: 'fill_blank', content: { sentence: 'إِيتَاء ("giving") is the ___ of the verb آتَىٰ (he gave).', correct_answer: 'maṣdar', options: ['maṣdar', 'command', 'passive'], explanation: 'The verbal noun of Form IV آتَىٰ.' } },
  { type: 'teach', content: { title: '🎉 Unit 33 complete!', explanation: 'The maṣdar — the source of a verb — is yours. Next: the DOER and RECEIVER nouns.', arabic: null, transliteration: null } },
]};

const U34_L1 = { steps: [
  { type: 'teach', content: { title: 'ism al-fāʿil — the "doer" noun', explanation: 'The **ism al-fāʿil** names the one who does the action. For Form I it is the pattern **فَاعِل**:\n\nكَتَبَ → **كَاتِب** (writer)\nعَلِمَ → **عَالِم** (a knower/scholar)\nحَمِدَ → **حَامِد** (one who praises)\n\nFor the derived forms it starts with **مُـ**: مُؤْمِن (believer), مُسْلِم (one who submits).', arabic: 'كَاتِب · مُؤْمِن', transliteration: 'kaatib · mu’min', examples: [ { ar: 'مُسْلِم', tr: 'muslim', en: 'one who submits (IV)' }, { ar: 'مُنْذِر', tr: 'mundhir', en: 'a warner (IV)' } ], fun_fact: 'مُؤْمِن ("believer") is the ism al-fāʿil of آمَنَ (Form IV) — "the one who has faith".' } },
  { type: 'mcq', content: { question: 'كَاتِب ("writer") is the ism al-fāʿil — the one who...', options: [ { text: 'does the action (writes)', correct: true }, { text: 'receives the action', correct: false } ], explanation: 'فَاعِل names the doer: كَاتِب = the writer.' } },
  { type: 'classify', content: { instruction: 'Form-I doer (فَاعِل) or derived-form doer (مُـ)?', categories: ['Form I (فَاعِل)', 'Derived (مُـ)'], items: [ { text: 'كَاتِب', category: 'Form I (فَاعِل)' }, { text: 'مُؤْمِن', category: 'Derived (مُـ)' }, { text: 'عَالِم', category: 'Form I (فَاعِل)' }, { text: 'مُسْلِم', category: 'Derived (مُـ)' } ], explanation: 'Form I = فَاعِل; forms II–X start their doer-noun with مُـ.' } },
  { type: 'fill_blank', content: { sentence: 'مُؤْمِن ("believer") is the ___ of آمَنَ.', correct_answer: 'ism al-fāʿil', options: ['ism al-fāʿil', 'maṣdar', 'passive'], explanation: 'The doer-noun: "the one who believes".' } },
  { type: 'teach', content: { title: 'The doer noun', explanation: 'فَاعِل / مُفْعِل = the one who does. Next: the receiver noun.', arabic: null, transliteration: null } },
]};
const U34_L2 = { steps: [
  { type: 'teach', content: { title: 'ism al-mafʿūl — the "receiver" noun', explanation: 'The **ism al-mafʿūl** names the one the action is done TO. For Form I it is **مَفْعُول**:\n\nكَتَبَ → **مَكْتُوب** (written)\nخَلَقَ → **مَخْلُوق** (created / a creature)\nرَحِمَ → **مَرْحُوم** (shown mercy)', arabic: 'مَكْتُوب · مَخْلُوق', transliteration: 'maktoob · makhlooq', examples: [ { ar: 'مَحْمُود', tr: 'maḥmood', en: 'praised (a name of the Prophet ﷺ)' }, { ar: 'مَعْبُود', tr: 'ma‘bood', en: 'the One worshipped' } ], fun_fact: 'مَقَامًا مَّحْمُودًا — "a praised station" (Al-Isra 17:79). مَحْمُود = "praised", the ism al-mafʿūl of ḥamida.' } },
  { type: 'mcq', content: { question: 'مَخْلُوق means...', options: [ { text: 'created / a creature (the receiver of creating)', correct: true }, { text: 'creator', correct: false } ], explanation: 'مَفْعُول names the receiver: مَخْلُوق = "that which was created".' } },
  { type: 'classify', content: { instruction: 'Doer (فَاعِل) or receiver (مَفْعُول)?', categories: ['Doer (فَاعِل)', 'Receiver (مَفْعُول)'], items: [ { text: 'كَاتِب (writer)', category: 'Doer (فَاعِل)' }, { text: 'مَكْتُوب (written)', category: 'Receiver (مَفْعُول)' }, { text: 'خَالِق (Creator)', category: 'Doer (فَاعِل)' }, { text: 'مَخْلُوق (creature)', category: 'Receiver (مَفْعُول)' } ], explanation: 'فَاعِل does; مَفْعُول receives.' } },
  { type: 'fill_blank', content: { sentence: 'خَالِق is the doer ("Creator"); مَخْلُوق is the ___ ("created").', correct_answer: 'receiver', options: ['receiver', 'doer', 'source'], explanation: 'مَفْعُول = the receiver noun.' } },
  { type: 'teach', content: { title: 'Doer vs receiver', explanation: 'كَاتِب writes; مَكْتُوب is written. Next: telling them apart in the Quran.', arabic: null, transliteration: null } },
]};
const U34_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — the Names of creation', explanation: '**هُوَ اللّٰهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ** — "He is Allah, the Creator, the Originator, the Fashioner." (Al-Hashr 59:24)', arabic: 'هُوَ اللّٰهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ', transliteration: 'huwa-llaahul-khaaliqul-baari’ul-muṣawwir', quran_ref: 'Al-Hashr 59:24' } },
  { type: 'classify', content: { instruction: 'Doer-noun or receiver-noun? (Names of Allah vs creation)', categories: ['Doer (fāʿil)', 'Receiver (mafʿūl)'], items: [ { text: 'الْخَالِق (the Creator)', category: 'Doer (fāʿil)' }, { text: 'الْمُصَوِّر (the Fashioner)', category: 'Doer (fāʿil)' }, { text: 'مَخْلُوق (a creature)', category: 'Receiver (mafʿūl)' }, { text: 'مَرْزُوق (one provided for)', category: 'Receiver (mafʿūl)' } ], explanation: 'Allah is the Doer (الخالق، المصوّر); creation is the receiver (مخلوق).' } },
  { type: 'mcq', content: { question: 'الْمُصَوِّر ("the Fashioner") begins with مُـ, so it is...', options: [ { text: 'a derived-form doer noun (ism al-fāʿil of ṣawwara, II)', correct: true }, { text: 'a receiver noun', correct: false } ], explanation: 'مُصَوِّر — the doer noun of the Form-II verb صَوَّرَ ("fashioned").' } },
  { type: 'fill_blank', content: { sentence: 'الْمُؤْمِنُونَ ("the believers") are doer-nouns; الْمَرْزُوقُونَ ("those provided for") are ___-nouns.', correct_answer: 'receiver', options: ['receiver', 'doer', 'source'], explanation: 'مَرْزُوق = one given provision — a receiver noun.' } },
  { type: 'teach', content: { title: '🎉 Unit 34 complete!', explanation: 'Doer and receiver nouns — spotted in the Names of Allah. Next: permanent qualities and comparatives.', arabic: null, transliteration: null } },
]};

const U35_L1 = { steps: [
  { type: 'teach', content: { title: 'The permanent quality (ṣifa mushabbaha)', explanation: 'The **ṣifa mushabbaha** names a *lasting, built-in* quality (unlike the ism al-fāʿil, which can be temporary):\n\n**كَرِيم** (noble) · **عَظِيم** (great) · **حَسَن** (good) · **رَحِيم** (merciful)', arabic: 'كَرِيم · عَظِيم · رَحِيم', transliteration: 'kareem · ‘aẓeem · raheem', examples: [ { ar: 'الْعَظِيم', tr: 'al-‘aẓeem', en: 'the Magnificent' }, { ar: 'الرَّحِيم', tr: 'ar-raheem', en: 'the Ever-Merciful' } ], fun_fact: 'الرَّحْمٰن (intense, momentary vastness) vs الرَّحِيم (permanent, constant mercy) — different patterns, different shades.' } },
  { type: 'mcq', content: { question: 'A ṣifa mushabbaha (like كَرِيم) describes a quality that is...', options: [ { text: 'permanent / built-in', correct: true }, { text: 'a one-time action', correct: false } ], explanation: 'It names a stable trait, not a passing act.' } },
  { type: 'match', content: { instruction: 'Match the quality to its meaning', pairs: [ { left: 'كَرِيم', right: 'noble' }, { left: 'عَظِيم', right: 'great' }, { left: 'حَسَن', right: 'good' }, { left: 'رَحِيم', right: 'merciful' } ] } },
  { type: 'fill_blank', content: { sentence: 'رَبٌّ ___ ("a Great Lord") — عَظِيم names a permanent quality.', correct_answer: 'عَظِيم', options: ['عَظِيم', 'يَعْلَمُ', 'كَتَبَ'], explanation: 'A ṣifa mushabbaha: a lasting attribute.' } },
  { type: 'teach', content: { title: 'Permanent qualities', explanation: 'Built-in traits like كريم، عظيم. Next: comparing and topping them all.', arabic: null, transliteration: null } },
]};
const U35_L2 = { steps: [
  { type: 'teach', content: { title: 'Comparatives & superlatives (ism al-tafḍīl)', explanation: 'The **ism al-tafḍīl** compares — pattern **أَفْعَل** ("more/most ___"):\n\nكَبِير → **أَكْبَر** (greater/greatest)\nحَسَن → **أَحْسَن** (better/best)\nعَلِيّ → **أَعْلَىٰ** (higher/highest)', arabic: 'أَكْبَر · أَحْسَن · أَعْلَىٰ', transliteration: 'akbar · aḥsan · a‘laa', examples: [ { ar: 'اللّٰهُ أَكْبَرُ', tr: 'allaahu akbar', en: 'Allah is greater' }, { ar: 'أَحْسَنُ تَقْوِيمٍ', tr: 'aḥsanu taqweem', en: 'the best of forms' } ], fun_fact: 'سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى — "Glorify the name of your Lord, the Most High". الْأَعْلَى = the tafḍīl of عَلِيّ.' } },
  { type: 'mcq', content: { question: 'The pattern أَفْعَل (like أَكْبَر) expresses...', options: [ { text: 'comparison — "more/most"', correct: true }, { text: 'the passive', correct: false } ], explanation: 'ism al-tafḍīl: أَكْبَر = greater/greatest.' } },
  { type: 'classify', content: { instruction: 'Plain quality or comparative (أَفْعَل)?', categories: ['Quality (ṣifa)', 'Comparative (tafḍīl)'], items: [ { text: 'كَبِير (big)', category: 'Quality (ṣifa)' }, { text: 'أَكْبَر (bigger)', category: 'Comparative (tafḍīl)' }, { text: 'حَسَن (good)', category: 'Quality (ṣifa)' }, { text: 'أَحْسَن (better)', category: 'Comparative (tafḍīl)' } ], explanation: 'The أَـ prefix on the أَفْعَل pattern marks the comparative.' } },
  { type: 'fill_blank', content: { sentence: 'خَلَقَ الْإِنْسَانَ فِي ___ تَقْوِيمٍ — "…in the best of forms" (At-Tin 95:4).', correct_answer: 'أَحْسَنِ', options: ['أَحْسَنِ', 'حَسَنٍ', 'يُحْسِنُ'], explanation: 'أَحْسَن = "best" — the ism al-tafḍīl.' } },
  { type: 'teach', content: { title: 'Comparing with أَفْعَل', explanation: 'أكبر، أحسن، أعلى — more and most. Next: read the tafḍīl in the Quran.', arabic: null, transliteration: null } },
]};
const U35_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — the Most Generous', explanation: '**اقْرَأْ وَرَبُّكَ الْأَكْرَمُ** — "Read, and your Lord is the Most Generous." (Al-Alaq 96:3)', arabic: 'اقْرَأْ وَرَبُّكَ الْأَكْرَمُ', transliteration: 'iqra’ wa rabbukal-akram', quran_ref: 'Al-Alaq 96:3' } },
  { type: 'mcq', content: { question: 'الْأَكْرَمُ ("the Most Generous") is...', options: [ { text: 'an ism al-tafḍīl (superlative of كَرِيم)', correct: true }, { text: 'a maṣdar', correct: false } ], explanation: 'أَكْرَم = the superlative "most generous".' } },
  { type: 'classify', content: { instruction: 'Derived-noun type?', categories: ['Quality (ṣifa)', 'Comparative (tafḍīl)', 'Doer (ism fāʿil)'], items: [ { text: 'الْأَكْرَم (Most Generous)', category: 'Comparative (tafḍīl)' }, { text: 'كَرِيم (noble)', category: 'Quality (ṣifa)' }, { text: 'الْخَالِق (Creator)', category: 'Doer (ism fāʿil)' } ], explanation: 'أَفْعَل = tafḍīl; فَعِيل = ṣifa; فَاعِل = doer.' } },
  { type: 'fill_blank', content: { sentence: 'اللّٰهُ أَكْبَرُ — أَكْبَر is a comparative meaning "___".', correct_answer: 'greater', options: ['greater', 'created', 'praise'], explanation: '"Allah is greater [than all]." — the ism al-tafḍīl.' } },
  { type: 'teach', content: { title: '🎉 Unit 35 complete!', explanation: 'Qualities and comparatives — done. Final unit of Stage 10: nouns of place, time, instrument, and belonging.', arabic: null, transliteration: null } },
]};

const U36_L1 = { steps: [
  { type: 'teach', content: { title: 'Nouns of place & time (mafʿal)', explanation: 'The pattern **مَفْعَل / مَفْعِل** names WHERE or WHEN an action happens:\n\nسَجَدَ (prostrated) → **مَسْجِد** (place of prostration = mosque)\nشَرَقَ (rose) → **مَشْرِق** (place/time of rising = east)\nوَعَدَ (promised) → **مَوْعِد** (appointed time)', arabic: 'مَسْجِد · مَشْرِق', transliteration: 'masjid · mashriq', examples: [ { ar: 'مَشْرِق', tr: 'mashriq', en: 'east (place of sunrise)' }, { ar: 'مَغْرِب', tr: 'maghrib', en: 'west (place of sunset)' } ], fun_fact: 'رَبُّ الْمَشْرِقَيْنِ وَرَبُّ الْمَغْرِبَيْنِ — "Lord of the two easts and two wests" (Ar-Rahman). Place-nouns from ش-ر-ق and غ-ر-ب.' } },
  { type: 'mcq', content: { question: 'مَسْجِد ("mosque") literally means...', options: [ { text: 'the PLACE of prostration (from سَجَدَ)', correct: true }, { text: 'the act of prostrating', correct: false } ], explanation: 'مَفْعَل names a place: masjid = where you prostrate.' } },
  { type: 'match', content: { instruction: 'Match the place/time noun', pairs: [ { left: 'مَسْجِد', right: 'mosque (place of sujūd)' }, { left: 'مَشْرِق', right: 'east (place of rising)' }, { left: 'مَغْرِب', right: 'west (place of setting)' } ] } },
  { type: 'fill_blank', content: { sentence: 'A noun on the pattern مَفْعَل names a ___ or time of an action.', correct_answer: 'place', options: ['place', 'doer', 'quality'], explanation: 'مَسْجِد، مَشْرِق، مَوْعِد — where/when.' } },
  { type: 'teach', content: { title: 'Where & when', explanation: 'مَفْعَل = place/time. Next: instruments and the "belonging" ending.', arabic: null, transliteration: null } },
]};
const U36_L2 = { steps: [
  { type: 'teach', content: { title: 'Instruments & the nisba', explanation: '**Instrument nouns** (مِفْعَال / مِفْعَل) name a tool:\nفَتَحَ (opened) → **مِفْتَاح** (key)\nوَزَنَ (weighed) → **مِيزَان** (scale/balance)\n\n**The nisba (ـِيّ)** makes an adjective of belonging:\nعَرَب → **عَرَبِيّ** (Arabic) · أُمّ → **أُمِّيّ** (unlettered).', arabic: 'مِفْتَاح · عَرَبِيّ', transliteration: 'miftaaḥ · ‘arabiyy', examples: [ { ar: 'مِيزَان', tr: 'meezaan', en: 'balance/scale' }, { ar: 'قُرْآنًا عَرَبِيًّا', tr: 'qur’aanan ‘arabiyyan', en: 'an Arabic Quran' } ], fun_fact: 'وَنَضَعُ الْمَوَازِينَ الْقِسْطَ — "We place the scales of justice" (Al-Anbiya 21:47). مِيزَان is an instrument noun.' } },
  { type: 'mcq', content: { question: 'The ـِيّ ending (as in عَرَبِيّ) makes an adjective of...', options: [ { text: 'belonging / relation ("Arabic")', correct: true }, { text: 'the passive', correct: false } ], explanation: 'The nisba: عَرَبِيّ = "belonging to the Arabs / Arabic".' } },
  { type: 'classify', content: { instruction: 'Instrument (tool) or nisba (belonging)?', categories: ['Instrument (مِفْعَال)', 'Nisba (ـِيّ)'], items: [ { text: 'مِفْتَاح (key)', category: 'Instrument (مِفْعَال)' }, { text: 'عَرَبِيّ (Arabic)', category: 'Nisba (ـِيّ)' }, { text: 'مِيزَان (scale)', category: 'Instrument (مِفْعَال)' }, { text: 'أُمِّيّ (unlettered)', category: 'Nisba (ـِيّ)' } ], explanation: 'مِفْعَال = a tool; ـِيّ = belonging.' } },
  { type: 'fill_blank', content: { sentence: 'قُرْآنًا عَرَبِيًّا — عَرَبِيّ is a ___ adjective ("Arabic").', correct_answer: 'nisba', options: ['nisba', 'maṣdar', 'passive'], explanation: 'The ـِيّ of belonging.' } },
  { type: 'teach', content: { title: 'Tools & belonging', explanation: 'مِفْتَاح، مِيزَان، عَرَبِيّ. Next: read a place/belonging showcase.', arabic: null, transliteration: null } },
]};
const U36_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — an Arabic Quran', explanation: '**إِنَّا جَعَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ** — "Indeed We made it an Arabic Quran, so that you may understand." (Az-Zukhruf 43:3)', arabic: 'إِنَّا جَعَلْنَاهُ قُرْآنًا عَرَبِيًّا', transliteration: 'innaa ja‘alnaahu qur’aanan ‘arabiyyan', quran_ref: 'Az-Zukhruf 43:3' } },
  { type: 'classify', content: { instruction: 'Which derived-noun type?', categories: ['Nisba (belonging)', 'Place noun', 'Instrument'], items: [ { text: 'عَرَبِيّ (Arabic)', category: 'Nisba (belonging)' }, { text: 'مَسْجِد (mosque)', category: 'Place noun' }, { text: 'مِيزَان (scale)', category: 'Instrument' }, { text: 'مَغْرِب (west)', category: 'Place noun' } ], explanation: 'ـِيّ nisba, مَفْعَل place, مِفْعَال instrument.' } },
  { type: 'mcq', content: { question: 'لَّعَلَّكُمْ تَعْقِلُونَ — لَعَلَّ is one of the sisters of...', options: [ { text: 'إِنَّ (naṣbs its subject كُمْ)', correct: true }, { text: 'كَانَ', correct: false } ], explanation: 'Stage 8 returns: لَعَلَّ + كُمْ — "so that you…".' } },
  { type: 'fill_blank', content: { sentence: 'جَعَلْنَاهُ = جَعَلْنَا + هُ. جَعَلْنَا is the "We"-past of جَعَلَ, and هُ is the ___.', correct_answer: 'object', options: ['object', 'subject', 'maṣdar'], explanation: '"We made IT" — هُ is the object.' } },
  { type: 'teach', content: { title: '🏆 STAGE 10 COMPLETE — derived nouns mastered!', explanation: 'From one root you now read the **maṣdar** (action), **ism al-fāʿil** (doer), **ism al-mafʿūl** (receiver), **ṣifa** (quality), **tafḍīl** (comparative), and nouns of **place, time, instrument & belonging**. The whole family tree of a word.\n\nNext: the full **accusative family** — every reason a word can be manṣūb.', arabic: null, transliteration: null } },
]};

const U33_VOCAB = [ ['عِلْم','‘ilm','knowledge (maṣdar)','ism','masculine','singular','Al-Baqarah 2:32',1], ['عِبَادَة','‘ibaadah','worship (maṣdar)','ism','feminine','singular','Maryam 19:65',1], ['تَنْزِيل','tanzeel','revelation (maṣdar II)','ism','masculine','singular','Ya-Sin 36:5',2], ['اِسْتِغْفَار','istighfaar','seeking forgiveness (maṣdar X)','ism','masculine','singular','Al-Anfal 8:33',2] ];
const U34_VOCAB = [ ['كَاتِب','kaatib','writer (ism fāʿil)','ism','masculine','singular','Al-Baqarah 2:282',1], ['مُؤْمِن','mu’min','believer (ism fāʿil)','ism','masculine','singular','Al-Baqarah 2:8',1], ['مَخْلُوق','makhlooq','created / creature (ism mafʿūl)','ism','masculine','singular',null,2], ['الْخَالِق','al-khaaliq','the Creator','ism','masculine','singular','Al-Hashr 59:24',1] ];
const U35_VOCAB = [ ['كَرِيم','kareem','noble (ṣifa)','ism','masculine','singular','Al-Infitar 82:6',1], ['أَكْبَر','akbar','greater/greatest (tafḍīl)','ism','masculine','singular','Al-Ankabut 29:45',1], ['أَحْسَن','aḥsan','better/best (tafḍīl)','ism','masculine','singular','At-Tin 95:4',1], ['الْأَعْلَىٰ','al-a‘laa','the Most High (tafḍīl)','ism','masculine','singular','Al-A‘la 87:1',1] ];
const U36_VOCAB = [ ['مَسْجِد','masjid','mosque (place noun)','ism','masculine','singular','Al-Baqarah 2:114',1], ['مَشْرِق','mashriq','east (place noun)','ism','masculine','singular','Al-Baqarah 2:115',1], ['مِفْتَاح','miftaaḥ','key (instrument)','ism','masculine','singular','Al-An‘am 6:59',2], ['عَرَبِيّ','‘arabiyy','Arabic (nisba)','ism','masculine','singular','Az-Zukhruf 43:3',1] ];

const UNIT_DEFS = [
  [33,'masdar','The Verbal Noun','المَصْدَر','🌱','#8B7BD8',false,'The maṣdar — a verb named as a noun — and the "moulded" maṣdar (أَنْ + verb).'],
  [34,'fail-maful-nouns','Doer & Receiver Nouns','اِسْم الفَاعِل وَالمَفْعُول','👤','#5FB57A',false,'ism al-fāʿil (كاتب، مؤمن) and ism al-mafʿūl (مكتوب، مخلوق).'],
  [35,'sifa-tafdil','Qualities & Comparatives','الصِّفَة وَالتَّفْضِيل','⭐','#6BA8D4',false,'ṣifa mushabbaha (كريم، عظيم) and ism al-tafḍīl (أكبر، أحسن).'],
  [36,'place-time-nisba','Place, Time & Belonging','اِسْم المَكَان وَالنِّسْبَة','🧭','#C77DBB',true,'Nouns of place/time (مسجد، مشرق), instrument (مفتاح), and the nisba (عربيّ).'],
];
const LESSONS = [
  [33,'what-is-masdar','The Source Noun',1,U33_L1,15],[33,'masdar-patterns','Maṣdar Patterns',2,U33_L2,15],[33,'masdar-muawwal','The Moulded Maṣdar',3,U33_L3,15],[33,'read-quran-masdar','Read the Quran: Maṣdars',4,U33_L4,20],
  [34,'ism-fail','The Doer Noun',1,U34_L1,15],[34,'ism-maful','The Receiver Noun',2,U34_L2,15],[34,'read-quran-fail-maful','Read the Quran: Creator & Creation',3,U34_L3,20],
  [35,'sifa','Permanent Qualities',1,U35_L1,15],[35,'tafdil','Comparatives & Superlatives',2,U35_L2,15],[35,'read-quran-tafdil','Read the Quran: The Most Generous',3,U35_L3,20],
  [36,'place-time','Place & Time Nouns',1,U36_L1,15],[36,'instrument-nisba','Instruments & the Nisba',2,U36_L2,15],[36,'read-quran-nisba','Read the Quran: An Arabic Quran',3,U36_L3,20],
];
const VOCAB = [[33,U33_VOCAB],[34,U34_VOCAB],[35,U35_VOCAB],[36,U36_VOCAB]];

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
  const [f] = await sql`SELECT id FROM learning_lessons WHERE unit_id=${id[33]} ORDER BY sort_order LIMIT 1`;
  const un = await sql`WITH prev AS (SELECT l.id FROM learning_lessons l JOIN learning_units u ON u.id=l.unit_id WHERE u.sort_order=32), fin AS (SELECT p.user_id FROM user_lesson_progress p JOIN prev ON prev.id=p.lesson_id WHERE p.status='completed' GROUP BY p.user_id HAVING count(*)=(SELECT count(*) FROM prev)) INSERT INTO user_lesson_progress (user_id,lesson_id,status) SELECT fin.user_id,${f.id},'available' FROM fin ON CONFLICT (user_id,lesson_id) DO NOTHING RETURNING user_id`;
  console.log(`  ✓ Unlocked U33 L1 for ${un.length} finishers of U32`);
  const [t]=await sql`SELECT count(*)::int u FROM learning_units`,[tl]=await sql`SELECT count(*)::int l FROM learning_lessons`;
  console.log(`TOTAL: ${t.u} units, ${tl.l} lessons.`);
}
main().then(()=>sql.end()).catch(async e=>{console.error('FAIL:',e.message);await sql.end();process.exit(1);});
