/**
 * PART B — Stage 14: FULL IʿRĀB MASTERY (capstone) — Units 48–50. Completes Part B.
 *   48 The Parse Engine (guided full-ayah parsing, increasing difficulty)
 *   49 Long-Ayah Parsing (Āyat al-Kursī full iʿrāb [legendary] + a full rukūʿ)
 *   50 The Grammarian's Ijāzah (graded parsing exam [legendary]) — checkpoint_after
 * Supports per-lesson lesson_type. Run: DATABASE_URL=... node scripts/seed-stage-14.mjs
 */
import postgres from 'postgres';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

const U48_L1 = { steps: [
  { type: 'teach', content: { title: 'The Parse Engine 🔧', explanation: 'Time to put EVERYTHING together. For each ayah you will label every word: its **word type** (ism/fiʿl/harf), its **role** (subject/object/…), and its **case** (raf‘/naṣb/jarr).\n\nStart simple: **قُلْ هُوَ اللّٰهُ أَحَدٌ**.', arabic: 'قُلْ هُوَ اللّٰهُ أَحَدٌ', transliteration: 'qul huwa-llaahu ahad', quran_ref: 'Al-Ikhlas 112:1' } },
  { type: 'classify', content: { instruction: 'Word type of each?', categories: ['Verb (fiʿl)', 'Pronoun/Noun (ism)'], items: [ { text: 'قُلْ (Say!)', category: 'Verb (fiʿl)' }, { text: 'هُوَ (He)', category: 'Pronoun/Noun (ism)' }, { text: 'اللّٰهُ', category: 'Pronoun/Noun (ism)' }, { text: 'أَحَدٌ', category: 'Pronoun/Noun (ism)' } ], explanation: 'قُلْ is a command verb; the rest are isms.' } },
  { type: 'classify', content: { instruction: 'Case of each?', categories: ['raf‘ (ḍamma)', 'mabnī (fixed)'], items: [ { text: 'اللّٰهُ', category: 'raf‘ (ḍamma)' }, { text: 'أَحَدٌ', category: 'raf‘ (ḍamma)' }, { text: 'هُوَ', category: 'mabnī (fixed)' }, { text: 'قُلْ', category: 'mabnī (fixed)' } ], explanation: 'اللّٰهُ (khabar) and أَحَدٌ are marfū‘; هُوَ and قُلْ are fixed (mabnī).' } },
  { type: 'mcq', content: { question: 'هُوَ اللّٰهُ أَحَدٌ is what kind of sentence?', options: [ { text: 'nominal (mubtada هُوَ + khabar)', correct: true }, { text: 'verbal', correct: false } ], explanation: 'Two nouns, no verb — a jumla ismiyya.' } },
  { type: 'teach', content: { title: 'First full parse — done', explanation: 'Type, role, case — all three, in one ayah. Next: a verb sentence.', arabic: null, transliteration: null } },
]};
const U48_L2 = { steps: [
  { type: 'teach', content: { title: 'Parse a verb sentence', explanation: '**خَلَقَ اللّٰهُ السَّمَاوَاتِ وَالْأَرْضَ** — parse the verb, its doer, and its objects.', arabic: 'خَلَقَ اللّٰهُ السَّمَاوَاتِ وَالْأَرْضَ', transliteration: 'khalaqa-llaahus-samaawaati wal-arḍ', quran_ref: 'Al-An‘am 6:1' } },
  { type: 'classify', content: { instruction: 'Role of each word', categories: ['Verb (fiʿl)', 'Doer (fāʿil)', 'Object (mafʿūl)'], items: [ { text: 'خَلَقَ', category: 'Verb (fiʿl)' }, { text: 'اللّٰهُ', category: 'Doer (fāʿil)' }, { text: 'السَّمَاوَاتِ', category: 'Object (mafʿūl)' }, { text: 'الْأَرْضَ', category: 'Object (mafʿūl)' } ], explanation: 'خَلَقَ (verb) + اللّٰهُ (fāʿil, raf‘) + السَّمَاوَاتِ / الْأَرْضَ (objects, naṣb).' } },
  { type: 'classify', content: { instruction: 'Case of each', categories: ['raf‘', 'naṣb'], items: [ { text: 'اللّٰهُ', category: 'raf‘' }, { text: 'السَّمَاوَاتِ', category: 'naṣb' }, { text: 'الْأَرْضَ', category: 'naṣb' } ], explanation: 'Doer = raf‘; objects = naṣb (السَّمَاوَاتِ shows naṣb with kasra, being a sound fem plural).' } },
  { type: 'mcq', content: { question: 'Why is وَالْأَرْضَ in naṣb?', options: [ { text: 'ʿaṭf — joined by وَ to the object السَّمَاوَاتِ', correct: true }, { text: 'it follows a preposition', correct: false } ], explanation: 'The maʿṭūf copies the object’s naṣb.' } },
  { type: 'teach', content: { title: 'Verb sentence — parsed', explanation: 'Verb, doer, objects, and a conjunct. Next: a sentence with إِنَّ.', arabic: null, transliteration: null } },
]};
const U48_L3 = { steps: [
  { type: 'teach', content: { title: 'Parse an إِنَّ sentence', explanation: '**إِنَّ اللّٰهَ مَعَ الصَّابِرِينَ** — parse the emphasizer, its subject, and its predicate.', arabic: 'إِنَّ اللّٰهَ مَعَ الصَّابِرِينَ', transliteration: 'innallaaha ma‘aṣ-ṣaabireen', quran_ref: 'Al-Baqarah 2:153' } },
  { type: 'classify', content: { instruction: 'Role of each', categories: ['Emphasizer (ḥarf)', 'ism inna (naṣb)', 'khabar / preposition phrase'], items: [ { text: 'إِنَّ', category: 'Emphasizer (ḥarf)' }, { text: 'اللّٰهَ', category: 'ism inna (naṣb)' }, { text: 'مَعَ الصَّابِرِينَ', category: 'khabar / preposition phrase' } ], explanation: 'إِنَّ + اللّٰهَ (fatḥa) + مَعَ الصَّابِرِينَ (the khabar).' } },
  { type: 'classify', content: { instruction: 'Case of each', categories: ['naṣb (fatḥa)', 'jarr (kasra)'], items: [ { text: 'اللّٰهَ', category: 'naṣb (fatḥa)' }, { text: 'الصَّابِرِينَ', category: 'jarr (kasra)' } ], explanation: 'اللّٰهَ = ism inna (naṣb); الصَّابِرِينَ = jarr after مَعَ (shown by ينَ).' } },
  { type: 'mcq', content: { question: 'الصَّابِرِينَ ends in ينَ. Why jarr, not naṣb?', options: [ { text: 'It follows the adverb/preposition مَعَ → majrūr', correct: true }, { text: 'It is the object', correct: false } ], explanation: 'مَعَ governs jarr; for a sound plural, jarr shows as ينَ.' } },
  { type: 'fill_blank', content: { sentence: 'إِنَّ naṣbs its subject اللّٰهَ and its predicate stays in ___.', correct_answer: 'raf‘', options: ['raf‘', 'jazm', 'jarr'], explanation: 'ism inna = naṣb; khabar inna = raf‘ (here a prepositional phrase serving as khabar).' } },
  { type: 'teach', content: { title: '🎉 Unit 48 complete!', explanation: 'You parse nominal, verbal, and إِنَّ sentences fully. Next: the summit — Āyat al-Kursī, word by word.', arabic: null, transliteration: null } },
]};

const U49_L1 = { steps: [
  { type: 'teach', content: { title: '⭐ Legendary: Āyat al-Kursī — full iʿrāb', explanation: 'The greatest ayah, parsed to the last word. **اللّٰهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ**.', arabic: 'اللّٰهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', transliteration: 'allaahu laa ilaaha illaa huwal-ḥayyul-qayyoom', quran_ref: 'Al-Baqarah 2:255' } },
  { type: 'classify', content: { instruction: 'Parse the opening', categories: ['mubtada (raf‘)', 'khabar / Name (raf‘)', 'negation + exception'], items: [ { text: 'اللّٰهُ', category: 'mubtada (raf‘)' }, { text: 'الْحَيُّ', category: 'khabar / Name (raf‘)' }, { text: 'الْقَيُّومُ', category: 'khabar / Name (raf‘)' }, { text: 'لَا إِلَٰهَ إِلَّا هُوَ', category: 'negation + exception' } ], explanation: 'اللّٰهُ (subject); the Names are khabar (raf‘); "no god except Him" is a nominal aside.' } },
  { type: 'classify', content: { instruction: 'Parse: لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ', categories: ['Verb + object', 'Doer (fāʿil, raf‘)'], items: [ { text: 'تَأْخُذُهُ (overtakes Him)', category: 'Verb + object' }, { text: 'سِنَةٌ (drowsiness)', category: 'Doer (fāʿil, raf‘)' }, { text: 'نَوْمٌ (sleep)', category: 'Doer (fāʿil, raf‘)' } ], explanation: 'سِنَةٌ is the fāʿil of تَأْخُذُ (raf‘); هُ is the object; نَوْمٌ is joined by وَ.' } },
  { type: 'classify', content: { instruction: 'Parse: لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ', categories: ['Preposition + pronoun', 'Relative (mā)', 'Preposition phrase'], items: [ { text: 'لَهُ (to Him)', category: 'Preposition + pronoun' }, { text: 'مَا (whatever)', category: 'Relative (mā)' }, { text: 'فِي السَّمَاوَاتِ', category: 'Preposition phrase' } ], explanation: 'لَهُ (fronted khabar) + مَا (relative subject) + فِي السَّمَاوَاتِ (jarr).' } },
  { type: 'mcq', content: { question: 'مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ — مَنْ is...', options: [ { text: 'an interrogative "who?" (rhetorical)', correct: true }, { text: 'a conditional', correct: false } ], explanation: '"WHO can intercede with Him except by His permission?" — a rhetorical question.' } },
  { type: 'classify', content: { instruction: 'Parse: وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ', categories: ['Doer (fāʿil, raf‘)', 'Object (mafʿūl, naṣb)'], items: [ { text: 'كُرْسِيُّهُ (His Throne)', category: 'Doer (fāʿil, raf‘)' }, { text: 'السَّمَاوَاتِ (the heavens)', category: 'Object (mafʿūl, naṣb)' }, { text: 'الْأَرْضَ (the earth)', category: 'Object (mafʿūl, naṣb)' } ], explanation: 'His Throne (doer) encompasses the heavens and earth (objects).' } },
  { type: 'fill_blank', content: { sentence: 'وَهُوَ الْعَلِيُّ الْعَظِيمُ — a nominal sentence: هُوَ (subject) + two Names as ___.', correct_answer: 'khabar', options: ['khabar', 'objects', 'verbs'], explanation: 'الْعَلِيُّ الْعَظِيمُ — the predicate, both raf‘.' } },
  { type: 'teach', content: { title: '🏔️ You parsed Āyat al-Kursī!', explanation: 'The greatest verse, resolved into every structure you have learned. Next: a full rukūʿ.', arabic: null, transliteration: null } },
]};
const U49_L2 = { steps: [
  { type: 'teach', content: { title: 'A full rukūʿ — Al-Baqarah 1–5', explanation: 'Parse the opening passage of Al-Baqarah — five ayat that describe the God-conscious.', arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ', transliteration: 'dhaalikal-kitaabu laa rayba feehi hudan lil-muttaqeen', quran_ref: 'Al-Baqarah 2:2–5' } },
  { type: 'classify', content: { instruction: 'Parse Al-Baqarah 2', categories: ['Demonstrative + subject', 'Negation', 'Indefinite (naṣb/khabar)', 'Preposition phrase'], items: [ { text: 'ذَٰلِكَ الْكِتَابُ', category: 'Demonstrative + subject' }, { text: 'لَا رَيْبَ', category: 'Negation' }, { text: 'هُدًى (a guidance)', category: 'Indefinite (naṣb/khabar)' }, { text: 'لِّلْمُتَّقِينَ (for the God-conscious)', category: 'Preposition phrase' } ], explanation: 'ذَٰلِكَ (mubtada) الْكِتَابُ (khabar/badal); لَا رَيْبَ (negation); هُدًى; لِلْمُتَّقِينَ (jarr).' } },
  { type: 'classify', content: { instruction: 'Parse: الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ', categories: ['Relative', 'Verb (they…)', 'Object (naṣb)'], items: [ { text: 'الَّذِينَ', category: 'Relative' }, { text: 'يُؤْمِنُونَ', category: 'Verb (they…)' }, { text: 'الصَّلَاةَ', category: 'Object (naṣb)' } ], explanation: 'A relative clause: الَّذِينَ + a chain of "they…" verbs + objects.' } },
  { type: 'mcq', content: { question: 'أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ وَأُولَٰئِكَ هُمُ الْمُفْلِحُونَ — الْمُفْلِحُونَ is...', options: [ { text: 'khabar (raf‘) — "the successful ones"', correct: true }, { text: 'an object', correct: false } ], explanation: 'أُولَٰئِكَ هُمُ الْمُفْلِحُونَ — a nominal sentence; الْمُفْلِحُونَ is the marfū‘ predicate.' } },
  { type: 'fill_blank', content: { sentence: 'مِمَّا رَزَقْنَاهُمْ يُنفِقُونَ — مِمَّا = مِنْ + ___ ("from that which").', correct_answer: 'مَا', options: ['مَا', 'مَنْ', 'مَاذَا'], explanation: 'A relative مَا: "…spend from that which We provided them".' } },
  { type: 'teach', content: { title: '🎉 Unit 49 complete!', explanation: 'You parsed a complete passage — the way a scholar reads. One unit remains: your Ijāzah.', arabic: null, transliteration: null } },
]};

const U50_L1 = { steps: [
  { type: 'teach', content: { title: '⭐ The Grammarian’s Ijāzah', explanation: 'A final examination. Parse each ayah cold — no hints. Pass, and you have earned the title of one who reads the Quran with understanding.', arabic: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ', transliteration: 'wa maa khalaqtul-jinna wal-insa illaa liya‘budoon', quran_ref: 'Adh-Dhariyat 51:56' } },
  { type: 'classify', content: { instruction: 'Exam Q1 — parse this ayah', categories: ['Negation', 'Verb + doer-ending', 'Object (naṣb)', 'Purpose (naṣb verb after لِـ)'], items: [ { text: 'مَا (not)', category: 'Negation' }, { text: 'خَلَقْتُ (I created)', category: 'Verb + doer-ending' }, { text: 'الْجِنَّ وَالْإِنسَ', category: 'Object (naṣb)' }, { text: 'لِيَعْبُدُونِ (to worship Me)', category: 'Purpose (naṣb verb after لِـ)' } ], explanation: '"I did not create jinn and mankind EXCEPT to worship Me." لِـ + verb → naṣb.' } },
  { type: 'classify', content: { instruction: 'Exam Q2 — إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', categories: ['Emphasizer + ism inna', 'Verb + doer + object pronoun', 'Second object (naṣb)'], items: [ { text: 'إِنَّا (Indeed We)', category: 'Emphasizer + ism inna' }, { text: 'أَعْطَيْنَاكَ (We gave you)', category: 'Verb + doer + object pronoun' }, { text: 'الْكَوْثَرَ', category: 'Second object (naṣb)' } ], explanation: 'أَعْطَىٰ takes two objects: كَ (you) and الْكَوْثَرَ (naṣb).' } },
  { type: 'mcq', content: { question: 'Exam Q3 — لَمْ يَلِدْ. What is the state of يَلِدْ?', options: [ { text: 'majzūm (sukūn) — cut by لَمْ', correct: true }, { text: 'marfū‘', correct: false } ], explanation: 'لَمْ jazms the present verb: يَلِدْ (sukūn).' } },
  { type: 'classify', content: { instruction: 'Exam Q4 — يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللّٰهَ', categories: ['Call (munādā)', 'Relative clause', 'Command', 'Object (naṣb)'], items: [ { text: 'يَا أَيُّهَا', category: 'Call (munādā)' }, { text: 'الَّذِينَ آمَنُوا', category: 'Relative clause' }, { text: 'اتَّقُوا (be mindful!)', category: 'Command' }, { text: 'اللّٰهَ', category: 'Object (naṣb)' } ], explanation: 'A vocative + relative + command + object — four structures in one line.' } },
  { type: 'fill_blank', content: { sentence: 'Exam Q5 — اللّٰهُ أَكْبَرُ: both words are in ___ (mubtada + khabar).', correct_answer: 'raf‘', options: ['raf‘', 'naṣb', 'jarr'], explanation: 'A nominal sentence: both marfū‘.' } },
  { type: 'teach', content: { title: '🏆🎓 IJĀZAH GRANTED — PART B COMPLETE!', explanation: 'You have finished the entire mastery track. You now parse the Quran the way scholars do — word type, grammatical role, and case, for any ayah.\n\nFrom "what is an ism?" to a full iʿrāb of Āyat al-Kursī: **you can now read the Book of Allah with understanding.** May Allah accept it and make you of the people of the Quran. 🤲', arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ', transliteration: 'wa laqad yassarnal-qur’aana lidh-dhikr', quran_ref: 'Al-Qamar 54:17' } },
]};

const U48_VOCAB = [ ['إِعْرَاب','i‘raab','full grammatical parsing','ism','masculine','singular',null,2] ];
const U49_VOCAB = [ ['كُرْسِيّ','kursiyy','throne / footstool','ism','masculine','singular','Al-Baqarah 2:255',2], ['الْمُفْلِحُونَ','al-mufliḥoon','the successful ones','ism','masculine','plural','Al-Baqarah 2:5',1] ];
const U50_VOCAB = [ ['الْكَوْثَر','al-kawthar','abundance (river of Paradise)','ism','masculine','singular','Al-Kawthar 108:1',2], ['يَسَّرَ','yassara','he made easy','feel',null,null,'Al-Qamar 54:17',2] ];

const UNIT_DEFS = [
  [48,'parse-engine','The Parse Engine','التَّحْلِيل','🔧','#8B7BD8',false,'Guided full parsing: word type, role, and case for whole ayat.'],
  [49,'long-ayah','Long-Ayah Parsing','إِعْرَاب الآيَة','🏔️','#5FB57A',false,'Full iʿrāb of Āyat al-Kursī and a complete rukūʿ.'],
  [50,'ijazah','The Grammarian’s Ijāzah','الإِجَازَة','🎓','#D4A246',true,'The final parsing exam — earn your Ijāzah.'],
];
// [unitSort, slug, title, sortOrder, content, xp, lessonType]
const LESSONS = [
  [48,'parse-nominal','Parse a Nominal Sentence',1,U48_L1,20,'standard'],[48,'parse-verbal','Parse a Verb Sentence',2,U48_L2,20,'standard'],[48,'parse-inna','Parse an إِنَّ Sentence',3,U48_L3,20,'standard'],
  [49,'ayat-al-kursi-irab','Āyat al-Kursī — Full Iʿrāb',1,U49_L1,40,'legendary'],[49,'full-ruku','A Full Rukūʿ',2,U49_L2,25,'standard'],
  [50,'the-exam','The Grammarian’s Ijāzah',1,U50_L1,50,'legendary'],
];
const VOCAB = [[48,U48_VOCAB],[49,U49_VOCAB],[50,U50_VOCAB]];

async function main() {
  const id = {};
  for (const [so,slug,title,titleAr,emoji,color,cp,desc] of UNIT_DEFS) {
    const [r] = await sql`INSERT INTO learning_units (slug,title,title_ar,description,icon_emoji,color,sort_order,checkpoint_after)
      VALUES (${slug},${title},${titleAr},${desc},${emoji},${color},${so},${cp})
      ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title,title_ar=EXCLUDED.title_ar,description=EXCLUDED.description,icon_emoji=EXCLUDED.icon_emoji,color=EXCLUDED.color,sort_order=EXCLUDED.sort_order,checkpoint_after=EXCLUDED.checkpoint_after
      RETURNING id,sort_order`;
    id[so]=r.id; console.log(`Unit ${so} [${slug}] → ${r.id}`);
  }
  for (const [us,slug,title,so,content,xp,lt] of LESSONS) {
    await sql`INSERT INTO learning_lessons (unit_id,slug,title,sort_order,lesson_type,content,xp_reward)
      VALUES (${id[us]},${slug},${title},${so},${lt},${sql.json(content)},${xp})
      ON CONFLICT (unit_id,slug) DO UPDATE SET title=EXCLUDED.title,sort_order=EXCLUDED.sort_order,lesson_type=EXCLUDED.lesson_type,content=EXCLUDED.content,xp_reward=EXCLUDED.xp_reward`;
    console.log(`  ✓ U${us} ${title} (${content.steps.length} steps, ${xp} XP${lt!=='standard'?', '+lt:''})`);
  }
  for (const [us,vocab] of VOCAB) {
    await sql`DELETE FROM vocabulary_bank WHERE unit_id=${id[us]}`;
    for (const [ar,tr,en,type,g,n,ref,d] of vocab)
      await sql`INSERT INTO vocabulary_bank (word_ar,transliteration,english,word_type,gender,number,unit_id,quranic_ref,difficulty) VALUES (${ar},${tr},${en},${type},${g},${n},${id[us]},${ref},${d})`;
    console.log(`  ✓ ${vocab.length} vocab for U${us}`);
  }
  const [f] = await sql`SELECT id FROM learning_lessons WHERE unit_id=${id[48]} ORDER BY sort_order LIMIT 1`;
  const un = await sql`WITH prev AS (SELECT l.id FROM learning_lessons l JOIN learning_units u ON u.id=l.unit_id WHERE u.sort_order=47), fin AS (SELECT p.user_id FROM user_lesson_progress p JOIN prev ON prev.id=p.lesson_id WHERE p.status='completed' GROUP BY p.user_id HAVING count(*)=(SELECT count(*) FROM prev)) INSERT INTO user_lesson_progress (user_id,lesson_id,status) SELECT fin.user_id,${f.id},'available' FROM fin ON CONFLICT (user_id,lesson_id) DO NOTHING RETURNING user_id`;
  console.log(`  ✓ Unlocked U48 L1 for ${un.length} finishers of U47`);
  const [t]=await sql`SELECT count(*)::int u FROM learning_units`,[tl]=await sql`SELECT count(*)::int l FROM learning_lessons`;
  console.log(`TOTAL: ${t.u} units, ${tl.l} lessons — PART B COMPLETE.`);
}
main().then(()=>sql.end()).catch(async e=>{console.error('FAIL:',e.message);await sql.end();process.exit(1);});
