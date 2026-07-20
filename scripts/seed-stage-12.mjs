/**
 * PART B — Stage 12: THE FOLLOWERS (al-tawābiʿ) — Units 41–43.
 *   41 al-Naʿt & al-Tawkīd (adjective agreement & emphasis)
 *   42 al-ʿAṭf & al-Badal (conjunction & apposition)
 *   43 Relative Clauses in Depth (al-mawṣūl + ṣila + ʿāʾid) — checkpoint_after
 * Run: DATABASE_URL=... node scripts/seed-stage-12.mjs
 */
import postgres from 'postgres';
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

const U41_L1 = { steps: [
  { type: 'teach', content: { title: 'The follower that describes: al-naʿt', explanation: 'A **naʿt** (adjective) FOLLOWS its noun and agrees with it in FOUR ways: **case, number, gender, and definiteness**:\n\nالصِّرَاطَ الْمُسْتَقِيمَ — both naṣb, singular, masculine, definite.', arabic: 'الصِّرَاطَ الْمُسْتَقِيمَ', transliteration: 'aṣ-ṣiraaṭal-mustaqeem', examples: [ { ar: 'رَبٌّ غَفُورٌ', tr: 'rabbun ghafoor', en: 'a forgiving Lord (both indefinite)' } ], fun_fact: 'Four-way agreement is how you know which noun an adjective belongs to, even across a long ayah.' } },
  { type: 'mcq', content: { question: 'A naʿt (adjective) agrees with its noun in how many ways?', options: [ { text: 'Four: case, number, gender, definiteness', correct: true }, { text: 'One: meaning', correct: false } ], explanation: 'Full four-way agreement is the mark of a naʿt.' } },
  { type: 'classify', content: { instruction: 'Does the adjective fully agree with الْكِتَاب (definite, m, sing)?', categories: ['Agrees (valid naʿt)', 'Does not agree'], items: [ { text: 'الْكَرِيمُ (definite, m, sing)', category: 'Agrees (valid naʿt)' }, { text: 'كَرِيمٌ (indefinite)', category: 'Does not agree' }, { text: 'الْكَرِيمَةُ (feminine)', category: 'Does not agree' } ], explanation: 'A naʿt must match definiteness and gender (and number and case).' } },
  { type: 'fill_blank', content: { sentence: 'الرَّحْمٰنِ الرَّحِيمِ — الرَّحِيم is a naʿt of اللّٰهِ, so it copies its ___ (kasra).', correct_answer: 'case', options: ['case', 'root', 'meaning'], explanation: 'It agrees in case (jarr here), plus number, gender, definiteness.' } },
  { type: 'teach', content: { title: 'Four-way agreement', explanation: 'The adjective mirrors its noun completely. Next: the follower that stresses — tawkīd.', arabic: null, transliteration: null } },
]};
const U41_L2 = { steps: [
  { type: 'teach', content: { title: 'al-Tawkīd — emphasis', explanation: 'A **tawkīd** repeats or reinforces a word for emphasis. Common emphasizers: **نَفْس** (self), **عَيْن** (very), **كُلّ** (all), **جَمِيع / أَجْمَعُونَ** (altogether). They copy the case of what they stress:\n\nفَسَجَدَ الْمَلَائِكَةُ **كُلُّهُمْ أَجْمَعُونَ** — "so the angels prostrated, ALL of them, TOGETHER."', arabic: 'كُلُّهُمْ أَجْمَعُونَ', transliteration: 'kulluhum ajma‘oon', examples: [ { ar: 'كُلُّهُمْ', tr: 'kulluhum', en: 'all of them' }, { ar: 'أَجْمَعُونَ', tr: 'ajma‘oon', en: 'all together' } ], fun_fact: 'Double emphasis — كُلُّهُمْ + أَجْمَعُونَ — leaves zero doubt: every single angel prostrated.' } },
  { type: 'mcq', content: { question: 'كُلُّهُمْ أَجْمَعُونَ adds...', options: [ { text: 'emphasis ("all of them, altogether")', correct: true }, { text: 'a new subject', correct: false } ], explanation: 'A tawkīd — reinforcing the totality.' } },
  { type: 'match', content: { instruction: 'Match the emphasizer', pairs: [ { left: 'نَفْس', right: 'self' }, { left: 'كُلّ', right: 'all' }, { left: 'أَجْمَعُونَ', right: 'altogether' } ] } },
  { type: 'fill_blank', content: { sentence: 'A tawkīd copies the ___ of the word it emphasizes.', correct_answer: 'case', options: ['case', 'root', 'length'], explanation: 'Like all followers, it matches the case (كُلُّهُمْ = raf‘, following الْمَلَائِكَةُ).' } },
  { type: 'teach', content: { title: 'Emphasis, doubled', explanation: 'نفس، عين، كلّ، أجمعون drive a point home. Next: read agreement + emphasis together.', arabic: null, transliteration: null } },
]};
const U41_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — all the angels', explanation: '**فَسَجَدَ الْمَلَائِكَةُ كُلُّهُمْ أَجْمَعُونَ** — "So the angels prostrated, all of them together." (Al-Hijr 15:30)', arabic: 'فَسَجَدَ الْمَلَائِكَةُ كُلُّهُمْ أَجْمَعُونَ', transliteration: 'fasajadal-malaa’ikatu kulluhum ajma‘oon', quran_ref: 'Al-Hijr 15:30' } },
  { type: 'classify', content: { instruction: 'Tag the role', categories: ['Doer (fāʿil)', 'Tawkīd (emphasis)'], items: [ { text: 'الْمَلَائِكَةُ (the angels)', category: 'Doer (fāʿil)' }, { text: 'كُلُّهُمْ (all of them)', category: 'Tawkīd (emphasis)' }, { text: 'أَجْمَعُونَ (altogether)', category: 'Tawkīd (emphasis)' } ], explanation: 'الْمَلَائِكَةُ is the fāʿil; the two emphasizers follow it in raf‘.' } },
  { type: 'mcq', content: { question: 'كُلُّهُمْ and أَجْمَعُونَ are both in raf‘ because...', options: [ { text: 'they follow (emphasize) the marfū‘ subject الْمَلَائِكَةُ', correct: true }, { text: 'they are objects', correct: false } ], explanation: 'Followers copy the case — here raf‘.' } },
  { type: 'fill_blank', content: { sentence: 'فَسَجَدَ begins with فَ ("___") — the Stage-3 connector.', correct_answer: 'so', options: ['so', 'not', 'in'], explanation: 'فَ = "so/then": "SO the angels prostrated".' } },
  { type: 'teach', content: { title: '🎉 Unit 41 complete!', explanation: 'Adjectives and emphasizers follow their nouns. Next: joining and substituting — ʿaṭf & badal.', arabic: null, transliteration: null } },
]};

const U42_L1 = { steps: [
  { type: 'teach', content: { title: 'al-ʿAṭf — joining with a connector', explanation: 'A word joined by a connector (وَ، فَ، أَوْ، ثُمَّ) is a follower: the *maʿṭūf* copies the case of the word before it:\n\nخَلَقَ السَّمَاوَاتِ **وَالْأَرْضَ** — both objects, both naṣb.', arabic: 'السَّمَاوَاتِ وَالْأَرْضَ', transliteration: 'as-samaawaati wal-arḍ', examples: [ { ar: 'الْجِنَّةِ وَالنَّاسِ', tr: 'al-jinnati wan-naas', en: 'the jinn and mankind (both jarr)' } ], fun_fact: 'This is why a long list joined by وَ shares one ending — each item follows the case of the first.' } },
  { type: 'mcq', content: { question: 'In خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ, why is الْأَرْضَ in naṣb?', options: [ { text: 'It is joined by وَ to the object السَّمَاوَاتِ (ʿaṭf copies case)', correct: true }, { text: 'It follows a preposition', correct: false } ], explanation: 'The maʿṭūf copies the case of what it is joined to.' } },
  { type: 'classify', content: { instruction: 'Do the two joined words share a case?', categories: ['Share case (ʿaṭf)', 'Different roles'], items: [ { text: 'السَّمَاوَاتِ وَالْأَرْضَ (both naṣb)', category: 'Share case (ʿaṭf)' }, { text: 'الْجِنَّةِ وَالنَّاسِ (both jarr)', category: 'Share case (ʿaṭf)' }, { text: 'اللّٰهُ … الْأَرْضَ (doer vs object)', category: 'Different roles' } ], explanation: 'A maʿṭūf mirrors the case of its partner.' } },
  { type: 'fill_blank', content: { sentence: 'A word joined by وَ copies the ___ of the word before it.', correct_answer: 'case', options: ['case', 'gender only', 'meaning'], explanation: 'ʿaṭf is a tābiʿ — it follows the case.' } },
  { type: 'teach', content: { title: 'Joining', explanation: 'The connector passes the case along. Next: substitution — badal.', arabic: null, transliteration: null } },
]};
const U42_L2 = { steps: [
  { type: 'teach', content: { title: 'al-Badal — the substitute', explanation: 'A **badal** re-identifies the word before it (an apposition) and copies its case:\n\nاهْدِنَا **الصِّرَاطَ** الْمُسْتَقِيمَ • **صِرَاطَ** الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ — the second صِرَاطَ restates and specifies the first (both naṣb).', arabic: 'الصِّرَاطَ … صِرَاطَ الَّذِينَ', transliteration: 'aṣ-ṣiraaṭa … ṣiraaṭal-ladheena', examples: [ { ar: 'صِرَاطَ الَّذِينَ', tr: 'ṣiraaṭal-ladheena', en: 'the path of those… (badal)' } ], fun_fact: 'The badal answers "which one exactly?" — here, WHICH straight path: the path of the blessed.' } },
  { type: 'mcq', content: { question: 'In Al-Fatiha, صِرَاطَ الَّذِينَ… restates الصِّرَاطَ الْمُسْتَقِيمَ. This is a...', options: [ { text: 'badal (apposition/substitution)', correct: true }, { text: 'a new object', correct: false } ], explanation: 'The second phrase re-identifies the first — a badal, copying its naṣb.' } },
  { type: 'classify', content: { instruction: 'ʿAṭf (joined by a connector) or badal (restatement)?', categories: ['ʿAṭf (وَ, فَ…)', 'Badal (restatement)'], items: [ { text: 'السَّمَاوَاتِ وَالْأَرْضَ', category: 'ʿAṭf (وَ, فَ…)' }, { text: 'الصِّرَاطَ … صِرَاطَ الَّذِينَ', category: 'Badal (restatement)' } ], explanation: 'ʿaṭf uses a connector; badal has no connector — it simply restates.' } },
  { type: 'fill_blank', content: { sentence: 'A badal copies the ___ of the noun it restates.', correct_answer: 'case', options: ['case', 'root', 'sound'], explanation: 'Both صِرَاطَ words are naṣb.' } },
  { type: 'teach', content: { title: 'Substitution', explanation: 'The badal pins down "which one". Next: read ʿaṭf & badal in Al-Fatiha.', arabic: null, transliteration: null } },
]};
const U42_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — Al-Fatiha 6–7', explanation: '**اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ • صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ** — "Guide us to the straight path — the path of those You have blessed."', arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ • صِرَاطَ الَّذِينَ', transliteration: 'ihdinaṣ-ṣiraaṭal-mustaqeem • ṣiraaṭal-ladheena', quran_ref: 'Al-Fatiha 1:6–7' } },
  { type: 'classify', content: { instruction: 'Tag the follower type', categories: ['Naʿt (adjective)', 'Badal (restatement)'], items: [ { text: 'الْمُسْتَقِيمَ (the straight)', category: 'Naʿt (adjective)' }, { text: 'صِرَاطَ الَّذِينَ (path of those…)', category: 'Badal (restatement)' } ], explanation: 'الْمُسْتَقِيمَ describes; صِرَاطَ الَّذِينَ restates.' } },
  { type: 'mcq', content: { question: 'Both الصِّرَاطَ and the badal صِرَاطَ are naṣb because...', options: [ { text: 'they are the object of اهْدِنَا, and the badal follows the object', correct: true }, { text: 'they follow a preposition', correct: false } ], explanation: 'اهْدِنَا الصِّرَاطَ — object (naṣb); the badal copies it.' } },
  { type: 'fill_blank', content: { sentence: 'أَنْعَمْتَ عَلَيْهِمْ — أَنْعَمْتَ is the "You"-past ("You ___").', correct_answer: 'blessed', options: ['blessed', 'created', 'said'], explanation: 'Stage-4 verb: "those You have blessed".' } },
  { type: 'teach', content: { title: '🎉 Unit 42 complete!', explanation: 'Joining and restating — the glue of long ayat. Final unit of Stage 12: relative clauses in depth.', arabic: null, transliteration: null } },
]};

const U43_L1 = { steps: [
  { type: 'teach', content: { title: 'The relative needs a clause', explanation: 'A relative word (**الَّذِي، الَّتِي، الَّذِينَ**) is incomplete alone — it needs a following **ṣila** (clause) that contains a pronoun pointing back (the **ʿāʾid**):\n\nالَّذِينَ آمَنُ**وا** — "those who — [they] believed". The وا is the ʿāʾid ("they") linking back.', arabic: 'الَّذِينَ آمَنُوا', transliteration: 'alladheena aamanoo', examples: [ { ar: 'الَّذِي خَلَقَ', tr: 'alladhee khalaq', en: 'the One who created' } ], fun_fact: 'Without the returning pronoun the clause would float free. The ʿāʾid ties the ṣila back to the relative word.' } },
  { type: 'mcq', content: { question: 'A relative word like الَّذِينَ must be followed by...', options: [ { text: 'a ṣila (clause) with a returning pronoun', correct: true }, { text: 'a preposition only', correct: false } ], explanation: 'الَّذِينَ + آمَنُوا (ṣila) with وا (the ʿāʾid).' } },
  { type: 'fill_blank', content: { sentence: 'In الَّذِينَ يُؤْمِنُونَ, the pointing-back pronoun (ʿāʾid) is the "___" hidden in يُؤْمِنُونَ.', correct_answer: 'they', options: ['they', 'I', 'you'], explanation: 'يُؤْمِنُونَ = "they believe" — the "they" refers back to الَّذِينَ.' } },
  { type: 'classify', content: { instruction: 'Relative word (needs a clause) or not?', categories: ['Relative (mawṣūl)', 'Not relative'], items: [ { text: 'الَّذِي', category: 'Relative (mawṣūl)' }, { text: 'الَّتِي', category: 'Relative (mawṣūl)' }, { text: 'هَٰذَا', category: 'Not relative' }, { text: 'الَّذِينَ', category: 'Relative (mawṣūl)' } ], explanation: 'الَّذِي/الَّتِي/الَّذِينَ are relatives; هَٰذَا is a demonstrative.' } },
  { type: 'teach', content: { title: 'Relative + clause', explanation: 'The mawṣūl needs a ṣila with an ʿāʾid. Next: مَنْ and مَا as relatives.', arabic: null, transliteration: null } },
]};
const U43_L2 = { steps: [
  { type: 'teach', content: { title: 'مَنْ and مَا as relatives', explanation: 'Besides "who?" and "what?", **مَنْ** ("the one who") and **مَا** ("that which") also act as relatives:\n\nلَهُ **مَا** فِي السَّمَاوَاتِ — "to Him belongs **whatever** is in the heavens."', arabic: 'لَهُ مَا فِي السَّمَاوَاتِ', transliteration: 'lahu maa fis-samaawaat', examples: [ { ar: 'مَنْ آمَنَ', tr: 'man aamana', en: 'whoever believed' }, { ar: 'مَا تُنفِقُوا', tr: 'maa tunfiqoo', en: 'whatever you spend' } ], fun_fact: 'مَنْ for people ("whoever"), مَا for things ("whatever") — the same words that ask questions can also link clauses.' } },
  { type: 'mcq', content: { question: 'In لَهُ مَا فِي السَّمَاوَاتِ, مَا means...', options: [ { text: 'whatever / that which', correct: true }, { text: 'not', correct: false }, { text: 'what? (a question)', correct: false } ], explanation: 'Here مَا is a relative: "whatever is in the heavens".' } },
  { type: 'classify', content: { instruction: 'Is مَنْ / مَا asking a question or linking a clause?', categories: ['Relative (the one who / that which)', 'Question (who? / what?)'], items: [ { text: 'مَنْ آمَنَ (whoever believed)', category: 'Relative (the one who / that which)' }, { text: 'مَا فِي السَّمَاوَاتِ (whatever is…)', category: 'Relative (the one who / that which)' }, { text: 'مَنْ رَبُّكَ؟ (who is your Lord?)', category: 'Question (who? / what?)' } ], explanation: 'Context decides: a following clause → relative; a question mark → interrogative.' } },
  { type: 'fill_blank', content: { sentence: 'مَنْ points to ___; مَا points to things.', correct_answer: 'people', options: ['people', 'places', 'times'], explanation: 'مَنْ (whoever) for people; مَا (whatever) for things.' } },
  { type: 'teach', content: { title: 'مَنْ & مَا relatives', explanation: 'Whoever / whatever. Next: read a rich relative clause in the Quran.', arabic: null, transliteration: null } },
]};
const U43_L3 = { steps: [
  { type: 'teach', content: { title: 'Read the Quran 📖 — the believers described', explanation: '**الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ وَمِمَّا رَزَقْنَاهُمْ يُنفِقُونَ** — "who believe in the unseen, establish prayer, and spend from what We have provided them." (Al-Baqarah 2:3)', arabic: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ', transliteration: 'alladheena yu’minoona bil-ghayb', quran_ref: 'Al-Baqarah 2:3' } },
  { type: 'classify', content: { instruction: 'Tag each part of the relative clause', categories: ['Relative word', 'Ṣila verb (returning "they")', 'Object (maf‘ūl)'], items: [ { text: 'الَّذِينَ (those who)', category: 'Relative word' }, { text: 'يُؤْمِنُونَ (they believe)', category: 'Ṣila verb (returning "they")' }, { text: 'الصَّلَاةَ (the prayer)', category: 'Object (maf‘ūl)' } ], explanation: 'الَّذِينَ + a chain of "they…" verbs (the ṣila), each with the returning pronoun.' } },
  { type: 'mcq', content: { question: 'مِمَّا رَزَقْنَاهُمْ = مِنْ + مَا. The مَا here is...', options: [ { text: 'a relative ("that which We provided them")', correct: true }, { text: 'a negation', correct: false } ], explanation: 'مِمَّا = "from that which" — a relative مَا with its own ṣila (رَزَقْنَاهُمْ).' } },
  { type: 'fill_blank', content: { sentence: 'رَزَقْنَاهُمْ = رَزَقْنَا + هُمْ. The هُمْ is the ___ ("them").', correct_answer: 'object', options: ['object', 'subject', 'maṣdar'], explanation: '"We provided THEM" — هُمْ is the object.' } },
  { type: 'teach', content: { title: '🏆 STAGE 12 COMPLETE — the followers!', explanation: 'You now chain phrases like a scholar: **naʿt** (describe), **tawkīd** (emphasize), **ʿaṭf** (join), **badal** (restate), and full **relative clauses** with their returning pronouns.\n\nNext: conditionals, numbers, and the rhetoric of the Quran — oaths, restriction, and fronting.', arabic: null, transliteration: null } },
]};

const U41_VOCAB = [ ['نَعْت','na‘t','an adjective (follower)','ism','masculine','singular',null,2], ['كُلّ','kull','all / each','ism','masculine','singular','Al-Baqarah 2:20',1], ['أَجْمَعُونَ','ajma‘oon','altogether (emphasis)','ism','masculine','plural','Al-Hijr 15:30',2], ['نَفْس','nafs','self (emphasis)','ism','feminine','singular','Aal Imran 3:185',1] ];
const U42_VOCAB = [ ['بَدَل','badal','apposition / substitute','ism','masculine','singular',null,2], ['عَطْف','‘aṭf','conjunction (joining)','ism','masculine','singular',null,2] ];
const U43_VOCAB = [ ['الَّتِي','allatee','the one who (f)','ism','feminine','singular','Al-Baqarah 2:24',1], ['صِلَة','ṣila','the relative clause','ism','feminine','singular',null,2], ['الْغَيْب','al-ghayb','the unseen','ism','masculine','singular','Al-Baqarah 2:3',1], ['يُنفِقُونَ','yunfiqoon','they spend','feel',null,null,'Al-Baqarah 2:3',1] ];

const UNIT_DEFS = [
  [41,'nat-tawkid','Description & Emphasis','النَّعْت وَالتَّوْكِيد','🔗','#8B7BD8',false,'al-naʿt (four-way adjective agreement) and al-tawkīd (emphasis).'],
  [42,'atf-badal','Joining & Substituting','العَطْف وَالبَدَل','➕','#5FB57A',false,'al-ʿaṭf (conjunction) and al-badal (apposition).'],
  [43,'relative-clauses','Relative Clauses','الاِسْم المَوْصُول','🪢','#6BA8D4',true,'الَّذِي/الَّتِي/مَنْ/مَا + the ṣila and its returning pronoun.'],
];
const LESSONS = [
  [41,'nat','The Describing Follower',1,U41_L1,15],[41,'tawkid','Emphasis',2,U41_L2,15],[41,'read-quran-tawkid','Read the Quran: All the Angels',3,U41_L3,20],
  [42,'atf','Joining (ʿAṭf)',1,U42_L1,15],[42,'badal','Substituting (Badal)',2,U42_L2,15],[42,'read-quran-badal','Read the Quran: Al-Fatiha 6–7',3,U42_L3,20],
  [43,'mawsul','The Relative Needs a Clause',1,U43_L1,15],[43,'man-ma','Man & Ma as Relatives',2,U43_L2,15],[43,'read-quran-relative','Read the Quran: The Believers',3,U43_L3,20],
];
const VOCAB = [[41,U41_VOCAB],[42,U42_VOCAB],[43,U43_VOCAB]];

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
  const [f] = await sql`SELECT id FROM learning_lessons WHERE unit_id=${id[41]} ORDER BY sort_order LIMIT 1`;
  const un = await sql`WITH prev AS (SELECT l.id FROM learning_lessons l JOIN learning_units u ON u.id=l.unit_id WHERE u.sort_order=40), fin AS (SELECT p.user_id FROM user_lesson_progress p JOIN prev ON prev.id=p.lesson_id WHERE p.status='completed' GROUP BY p.user_id HAVING count(*)=(SELECT count(*) FROM prev)) INSERT INTO user_lesson_progress (user_id,lesson_id,status) SELECT fin.user_id,${f.id},'available' FROM fin ON CONFLICT (user_id,lesson_id) DO NOTHING RETURNING user_id`;
  console.log(`  ✓ Unlocked U41 L1 for ${un.length} finishers of U40`);
  const [t]=await sql`SELECT count(*)::int u FROM learning_units`,[tl]=await sql`SELECT count(*)::int l FROM learning_lessons`;
  console.log(`TOTAL: ${t.u} units, ${tl.l} lessons.`);
}
main().then(()=>sql.end()).catch(async e=>{console.error('FAIL:',e.message);await sql.end();process.exit(1);});
