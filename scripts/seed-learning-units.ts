/**
 * Seed script: Inserts Unit 1 (The 3 Word Types) with 4 lessons into the learning system.
 * Run: npx tsx scripts/seed-learning-units.ts
 */
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL required. Run: DATABASE_URL=... npx tsx scripts/seed-learning-units.ts');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

async function seed() {
  console.log('🌱 Seeding learning units + lessons...\n');

  // ── Unit 1: The 3 Word Types ─────────────────────────
  const [unit1] = await sql`
    INSERT INTO learning_units (slug, title, title_ar, description, icon_emoji, color, sort_order, checkpoint_after)
    VALUES ('kalimah', 'The 3 Word Types', 'الكلمة', 'Arabic has only 3 types of words. Learn to identify them.', '🔤', '#58CC02', 1, false)
    ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
    RETURNING id
  `;
  console.log('✅ Unit 1: The 3 Word Types (id:', unit1.id, ')');

  // ── Unit 2: Boy or Girl? ─────────────────────────────
  const [unit2] = await sql`
    INSERT INTO learning_units (slug, title, title_ar, description, icon_emoji, color, sort_order, checkpoint_after)
    VALUES ('jins', 'Boy or Girl?', 'الجنس', 'Every Ism is either Masculine or Feminine.', '♂️', '#1CB0F6', 2, false)
    ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
    RETURNING id
  `;
  console.log('✅ Unit 2: Boy or Girl? (id:', unit2.id, ')');

  // ── Unit 3: How Many? ────────────────────────────────
  const [unit3] = await sql`
    INSERT INTO learning_units (slug, title, title_ar, description, icon_emoji, color, sort_order, checkpoint_after)
    VALUES ('adad', 'How Many?', 'العدد', 'Singular, Dual, and Plural forms of Arabic words.', '🔢', '#FFC800', 3, true)
    ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title
    RETURNING id
  `;
  console.log('✅ Unit 3: How Many? (id:', unit3.id, ')');

  // ── Lessons for Unit 1 ───────────────────────────────

  // Lesson 1.1: Meet the Ism
  await sql`
    INSERT INTO learning_lessons (unit_id, slug, title, sort_order, lesson_type, content, xp_reward)
    VALUES (${unit1.id}, 'meet-the-ism', 'Meet the Ism', 1, 'standard', ${JSON.stringify({
      steps: [
        {
          type: 'teach',
          content: {
            title: 'What is an Ism?',
            explanation: 'An Ism is a Noun — any person, place, thing, or idea. Unlike verbs and particles, an Ism makes sense on its own!',
            arabic: 'اسم',
            transliteration: 'Ism',
            examples: [
              { ar: 'كتاب', tr: 'Kitaab', en: 'Book' },
              { ar: 'زيد', tr: 'Zayd', en: 'Zayd (a name)' },
              { ar: 'مسجد', tr: 'Masjid', en: 'Mosque' },
            ],
            fun_fact: 'Over 70% of Quranic words are Isms!',
          },
        },
        {
          type: 'teach',
          content: {
            title: 'How to spot an Ism',
            explanation: 'An Ism has meaning on its own. If you say "book" or "mosque" — people understand. That\'s the key sign of an Ism.',
            arabic: null,
            transliteration: null,
            examples: [
              { ar: 'قلم', tr: 'Qalam', en: 'Pen' },
              { ar: 'مدينة', tr: 'Madeenah', en: 'City' },
              { ar: 'رسول', tr: 'Rasool', en: 'Messenger' },
            ],
          },
        },
        {
          type: 'mcq',
          content: {
            question: 'What type of word is كتاب (Kitaab)?',
            options: [
              { text: 'Ism (Noun)', correct: true },
              { text: "Fe'l (Verb)", correct: false },
              { text: 'Harf (Particle)', correct: false },
            ],
            explanation: 'Kitaab = Book — it\'s a thing you can point to, so it\'s an Ism!',
          },
        },
        {
          type: 'mcq',
          content: {
            question: 'Which of these is an Ism?',
            options: [
              { text: 'مسجد (Masjid)', correct: true },
              { text: 'من (Min)', correct: false },
              { text: 'كتب (Kataba)', correct: false },
            ],
            explanation: 'Masjid = Mosque. It\'s a place — that makes it an Ism.',
          },
        },
        {
          type: 'teach',
          content: {
            title: 'Isms are everywhere in the Quran',
            explanation: 'The very first word of the Quran after Bismillah is an Ism:',
            arabic: 'الْحَمْدُ',
            transliteration: 'Al-Hamdu',
            examples: [
              { ar: 'الْحَمْدُ لِلَّهِ', tr: 'Al-hamdu lillahi', en: 'All praise is for Allah' },
            ],
            quran_ref: '1:2',
          },
        },
        {
          type: 'fill_blank',
          content: {
            sentence: 'An Ism is a ___ in Arabic.',
            correct_answer: 'Noun',
            options: ['Verb', 'Noun', 'Particle', 'Sentence'],
            explanation: 'An Ism = Noun. It names a person, place, thing, or idea.',
          },
        },
        {
          type: 'match',
          content: {
            instruction: 'Match each Arabic word with its English meaning',
            pairs: [
              { left: 'كتاب (Kitaab)', right: 'Book' },
              { left: 'مسجد (Masjid)', right: 'Mosque' },
              { left: 'قلم (Qalam)', right: 'Pen' },
              { left: 'رسول (Rasool)', right: 'Messenger' },
            ],
          },
        },
        {
          type: 'mcq',
          content: {
            question: 'What makes an Ism special?',
            options: [
              { text: 'It has meaning on its own', correct: true },
              { text: 'It shows an action', correct: false },
              { text: 'It has no meaning alone', correct: false },
              { text: 'It connects two words', correct: false },
            ],
            explanation: 'An Ism (Noun) has meaning on its own — unlike verbs and particles which need context.',
          },
        },
      ],
    })}::jsonb, 15)
    ON CONFLICT (unit_id, slug) DO UPDATE SET content = EXCLUDED.content
  `;
  console.log('  📝 Lesson 1.1: Meet the Ism');

  // Lesson 1.2: Meet the Fe'l
  await sql`
    INSERT INTO learning_lessons (unit_id, slug, title, sort_order, lesson_type, content, xp_reward)
    VALUES (${unit1.id}, 'meet-the-feel', 'Meet the Fe''l', 2, 'standard', ${JSON.stringify({
      steps: [
        {
          type: 'teach',
          content: {
            title: "What is a Fe'l?",
            explanation: "A Fe'l is a Verb — an action word that also tells you WHEN the action happened. Past, present, or command.",
            arabic: 'فعل',
            transliteration: "Fe'l",
            examples: [
              { ar: 'كَتَبَ', tr: 'Kataba', en: 'He wrote (past)' },
              { ar: 'يَكْتُبُ', tr: 'Yaktubu', en: 'He writes (present)' },
              { ar: 'اُكْتُبْ', tr: 'Uktub', en: 'Write! (command)' },
            ],
          },
        },
        {
          type: 'teach',
          content: {
            title: "A Fe'l needs friends",
            explanation: "Unlike an Ism, a Fe'l only gives full meaning when combined with other words. 'Wrote' alone is incomplete — wrote what? who wrote?",
          },
        },
        {
          type: 'mcq',
          content: {
            question: "Which of these is a Fe'l (verb)?",
            options: [
              { text: 'كَتَبَ (Kataba) — He wrote', correct: true },
              { text: 'كتاب (Kitaab) — Book', correct: false },
              { text: 'من (Min) — From', correct: false },
            ],
            explanation: "Kataba = 'He wrote' — it shows an action in the past, so it's a Fe'l.",
          },
        },
        {
          type: 'mcq',
          content: {
            question: "How is a Fe'l different from an Ism?",
            options: [
              { text: "A Fe'l shows action AND time", correct: true },
              { text: "A Fe'l names a thing", correct: false },
              { text: "A Fe'l has no meaning", correct: false },
            ],
            explanation: "The key difference: a Fe'l = action + time (past/present/future). An Ism just names something.",
          },
        },
        {
          type: 'classify',
          content: {
            instruction: "Sort: Ism or Fe'l?",
            categories: ['Ism (Noun)', "Fe'l (Verb)"],
            items: [
              { text: 'كتاب (Kitaab) — Book', category: 'Ism (Noun)' },
              { text: 'كَتَبَ (Kataba) — He wrote', category: "Fe'l (Verb)" },
              { text: 'مسجد (Masjid) — Mosque', category: 'Ism (Noun)' },
              { text: 'يَذْهَبُ (Yadhhabu) — He goes', category: "Fe'l (Verb)" },
            ],
          },
        },
        {
          type: 'fill_blank',
          content: {
            sentence: 'كَتَبَ (Kataba) is a ___ because it shows an action.',
            correct_answer: "Fe'l",
            options: ['Ism', "Fe'l", 'Harf'],
            explanation: "Kataba = 'He wrote' — action + past time = Fe'l.",
          },
        },
        {
          type: 'mcq',
          content: {
            question: "يَكْتُبُ (Yaktubu) means 'He writes'. What tense is it?",
            options: [
              { text: 'Present', correct: true },
              { text: 'Past', correct: false },
              { text: 'Command', correct: false },
            ],
            explanation: "Yaktubu = 'He writes/is writing' — it's happening now, so it's present tense (Mudaari').",
          },
        },
      ],
    })}::jsonb, 15)
    ON CONFLICT (unit_id, slug) DO UPDATE SET content = EXCLUDED.content
  `;
  console.log("  📝 Lesson 1.2: Meet the Fe'l");

  // Lesson 1.3: Meet the Harf
  await sql`
    INSERT INTO learning_lessons (unit_id, slug, title, sort_order, lesson_type, content, xp_reward)
    VALUES (${unit1.id}, 'meet-the-harf', 'Meet the Harf', 3, 'standard', ${JSON.stringify({
      steps: [
        {
          type: 'teach',
          content: {
            title: 'What is a Harf?',
            explanation: "A Harf is a Particle — a small word that has NO meaning on its own. It only makes sense when connecting other words.",
            arabic: 'حرف',
            transliteration: 'Harf',
            examples: [
              { ar: 'مِنْ', tr: 'Min', en: 'From' },
              { ar: 'إِلَى', tr: 'Ila', en: 'To/Towards' },
              { ar: 'فِي', tr: 'Fee', en: 'In' },
            ],
            fun_fact: "If you say 'from' by itself, nobody understands what you mean. That's how you know it's a Harf!",
          },
        },
        {
          type: 'teach',
          content: {
            title: 'Huruf in the Quran',
            explanation: 'Huruf (particles) are the glue of Arabic sentences. بسم الله starts with the Harf بـ (Bi = with/in the name of).',
            arabic: 'بِسْمِ اللَّهِ',
            transliteration: 'Bismillah',
            examples: [
              { ar: 'بـ', tr: 'Bi', en: 'With/In (Harf)' },
              { ar: 'اسم', tr: 'Ism', en: 'Name (Ism)' },
              { ar: 'الله', tr: 'Allah', en: 'God (Ism)' },
            ],
            quran_ref: '1:1',
          },
        },
        {
          type: 'mcq',
          content: {
            question: 'Which of these is a Harf (particle)?',
            options: [
              { text: 'مِنْ (Min) — From', correct: true },
              { text: 'كتاب (Kitaab) — Book', correct: false },
              { text: 'كَتَبَ (Kataba) — He wrote', correct: false },
            ],
            explanation: "'Min' = 'From' — it has no meaning on its own, so it's a Harf.",
          },
        },
        {
          type: 'classify',
          content: {
            instruction: 'Sort into all 3 types!',
            categories: ['Ism', "Fe'l", 'Harf'],
            items: [
              { text: 'كتاب — Book', category: 'Ism' },
              { text: 'كَتَبَ — He wrote', category: "Fe'l" },
              { text: 'مِنْ — From', category: 'Harf' },
              { text: 'مسجد — Mosque', category: 'Ism' },
              { text: 'فِي — In', category: 'Harf' },
              { text: 'يَذْهَبُ — He goes', category: "Fe'l" },
            ],
          },
        },
        {
          type: 'match',
          content: {
            instruction: 'Match each word to its type',
            pairs: [
              { left: 'كتاب (Kitaab)', right: 'Ism (Noun)' },
              { left: 'كَتَبَ (Kataba)', right: "Fe'l (Verb)" },
              { left: 'مِنْ (Min)', right: 'Harf (Particle)' },
            ],
          },
        },
        {
          type: 'mcq',
          content: {
            question: 'A Harf has ___ on its own.',
            options: [
              { text: 'No meaning', correct: true },
              { text: 'Full meaning', correct: false },
              { text: 'Action meaning', correct: false },
            ],
            explanation: 'A Harf (particle) only makes sense when connecting other words. By itself, it means nothing.',
          },
        },
        {
          type: 'fill_blank',
          content: {
            sentence: 'Arabic has exactly ___ types of words.',
            correct_answer: '3',
            options: ['2', '3', '4', '5'],
            explanation: "Every Arabic word is either an Ism (noun), Fe'l (verb), or Harf (particle). That's it — just 3!",
          },
        },
      ],
    })}::jsonb, 15)
    ON CONFLICT (unit_id, slug) DO UPDATE SET content = EXCLUDED.content
  `;
  console.log('  📝 Lesson 1.3: Meet the Harf');

  // Lesson 1.4: Practice Round
  await sql`
    INSERT INTO learning_lessons (unit_id, slug, title, sort_order, lesson_type, content, xp_reward)
    VALUES (${unit1.id}, 'word-types-practice', 'Practice Round', 4, 'standard', ${JSON.stringify({
      steps: [
        {
          type: 'teach',
          content: {
            title: "Let's review!",
            explanation: "You've learned all 3 word types. Time to prove it! Remember:\n• Ism = Noun (person/place/thing)\n• Fe'l = Verb (action + time)\n• Harf = Particle (no meaning alone)",
          },
        },
        {
          type: 'mcq',
          content: {
            question: 'الله (Allah) is which type of word?',
            options: [
              { text: 'Ism (Noun)', correct: true },
              { text: "Fe'l (Verb)", correct: false },
              { text: 'Harf (Particle)', correct: false },
            ],
            explanation: "Allah is a proper noun — the name of God. All names are Isms!",
          },
        },
        {
          type: 'mcq',
          content: {
            question: 'عَلِمَ (Alima) means "He knew". What type?',
            options: [
              { text: "Fe'l (Verb)", correct: true },
              { text: 'Ism (Noun)', correct: false },
              { text: 'Harf (Particle)', correct: false },
            ],
            explanation: "'He knew' — it shows an action in the past = Fe'l!",
          },
        },
        {
          type: 'classify',
          content: {
            instruction: 'Final challenge! Sort all these Quranic words:',
            categories: ['Ism', "Fe'l", 'Harf'],
            items: [
              { text: 'الله — Allah', category: 'Ism' },
              { text: 'الرحمن — The Most Merciful', category: 'Ism' },
              { text: 'خَلَقَ — He created', category: "Fe'l" },
              { text: 'فِي — In', category: 'Harf' },
              { text: 'الأرض — The Earth', category: 'Ism' },
              { text: 'عَلَى — Upon', category: 'Harf' },
            ],
          },
        },
        {
          type: 'match',
          content: {
            instruction: 'Match the concept to its definition',
            pairs: [
              { left: 'Ism', right: 'A noun — has meaning on its own' },
              { left: "Fe'l", right: 'A verb — shows action + time' },
              { left: 'Harf', right: 'A particle — no meaning alone' },
            ],
          },
        },
        {
          type: 'fill_blank',
          content: {
            sentence: 'بـ (Bi) in بسم الله is a ___ because it means nothing alone.',
            correct_answer: 'Harf',
            options: ['Ism', "Fe'l", 'Harf'],
            explanation: 'Bi = "with/by" — a connecting word with no standalone meaning. Classic Harf!',
          },
        },
        {
          type: 'mcq',
          content: {
            question: 'In the Quran, which word type appears most?',
            options: [
              { text: 'Ism (Noun) — over 70%', correct: true },
              { text: "Fe'l (Verb) — over 70%", correct: false },
              { text: 'Harf (Particle) — over 70%', correct: false },
            ],
            explanation: 'Isms make up over 70% of Quranic words. Mastering nouns is the key to understanding the Quran!',
          },
        },
        {
          type: 'translate',
          content: {
            instruction: 'Arrange these words to say "In the name of Allah"',
            sentence: 'In the name of Allah',
            tiles: ['اللَّهِ', 'بِسْمِ'],
            correct_order: ['بِسْمِ', 'اللَّهِ'],
            explanation: 'Bismillahi — the opening of every Surah!',
          },
        },
      ],
    })}::jsonb, 20)
    ON CONFLICT (unit_id, slug) DO UPDATE SET content = EXCLUDED.content
  `;
  console.log('  📝 Lesson 1.4: Practice Round');

  // ── Seed vocabulary bank for Unit 1 ──────────────────
  const vocabWords = [
    { word_ar: 'كتاب', transliteration: 'Kitaab', english: 'Book', word_type: 'ism', gender: 'masculine' },
    { word_ar: 'مسجد', transliteration: 'Masjid', english: 'Mosque', word_type: 'ism', gender: 'masculine' },
    { word_ar: 'قلم', transliteration: 'Qalam', english: 'Pen', word_type: 'ism', gender: 'masculine' },
    { word_ar: 'رسول', transliteration: 'Rasool', english: 'Messenger', word_type: 'ism', gender: 'masculine' },
    { word_ar: 'مدينة', transliteration: 'Madeenah', english: 'City', word_type: 'ism', gender: 'feminine' },
    { word_ar: 'الله', transliteration: 'Allah', english: 'God', word_type: 'ism', gender: null },
    { word_ar: 'الأرض', transliteration: 'Al-Ard', english: 'The Earth', word_type: 'ism', gender: 'feminine' },
    { word_ar: 'الرحمن', transliteration: 'Ar-Rahmaan', english: 'The Most Merciful', word_type: 'ism', gender: 'masculine' },
    { word_ar: 'كَتَبَ', transliteration: 'Kataba', english: 'He wrote', word_type: 'feel', gender: null },
    { word_ar: 'يَكْتُبُ', transliteration: 'Yaktubu', english: 'He writes', word_type: 'feel', gender: null },
    { word_ar: 'خَلَقَ', transliteration: 'Khalaqa', english: 'He created', word_type: 'feel', gender: null },
    { word_ar: 'عَلِمَ', transliteration: 'Alima', english: 'He knew', word_type: 'feel', gender: null },
    { word_ar: 'يَذْهَبُ', transliteration: 'Yadhhabu', english: 'He goes', word_type: 'feel', gender: null },
    { word_ar: 'مِنْ', transliteration: 'Min', english: 'From', word_type: 'harf', gender: null },
    { word_ar: 'إِلَى', transliteration: 'Ila', english: 'To/Towards', word_type: 'harf', gender: null },
    { word_ar: 'فِي', transliteration: 'Fee', english: 'In', word_type: 'harf', gender: null },
    { word_ar: 'عَلَى', transliteration: 'Ala', english: 'Upon/On', word_type: 'harf', gender: null },
    { word_ar: 'بـ', transliteration: 'Bi', english: 'With/By', word_type: 'harf', gender: null },
  ];

  for (const w of vocabWords) {
    await sql`
      INSERT INTO vocabulary_bank (word_ar, transliteration, english, word_type, gender, unit_id)
      VALUES (${w.word_ar}, ${w.transliteration}, ${w.english}, ${w.word_type}, ${w.gender}, ${unit1.id})
      ON CONFLICT DO NOTHING
    `;
  }
  console.log(`  📚 ${vocabWords.length} vocabulary words seeded`);

  console.log('\n✅ Done! Unit 1 is ready to play at /learn/path');
  await sql.end();
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
