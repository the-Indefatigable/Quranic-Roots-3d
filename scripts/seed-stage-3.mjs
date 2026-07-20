/**
 * Seeds STAGE 3 — "Connecting Words (the harf toolkit)" — Units 9–12:
 *   9  Location Words (prepositions 1: فِي، عَلَىٰ، مِنْ، إِلَىٰ)
 *   10 With, For, Like (prepositions 2: بِ، لِ، كَ، عَنْ، مَعَ)
 *   11 And, Then, So (connectors: وَ، فَ، ثُمَّ، أَوْ، أَمْ)
 *   12 No, Not, Never & Questions (لَا، مَا، إِلَّا + question words) — checkpoint_after
 *
 * Same proven mechanics as seed-stage-2.mjs: creates unit rows, upserts lessons
 * on (unit_id, slug), wipes+reinserts vocab per unit, backfills the Unit-9 L1
 * unlock for users who already finished Unit 8. Idempotent.
 *
 * Run: DATABASE_URL=... node scripts/seed-stage-3.mjs
 */
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('ERROR: DATABASE_URL required'); process.exit(1); }
const sql = postgres(DATABASE_URL, { max: 1, connect_timeout: 30 });

// ═══════════════════════════════════════════════════════════════
// UNIT 9 — Location Words (prepositions 1)
// ═══════════════════════════════════════════════════════════════

const U9_L1 = { // فِي and عَلَىٰ
  steps: [
    { type: 'teach', content: {
      title: 'The little words that place things',
      explanation: 'A **harf** (particle) is a tiny word that glues meaning together. The first two point to *location*:\n\n**فِي** = in / inside\n**عَلَىٰ** = on / upon',
      arabic: 'فِي · عَلَىٰ',
      transliteration: 'fee · ‘alaa',
      examples: [
        { ar: 'فِي الْأَرْضِ', tr: 'fil-ard', en: 'in the earth' },
        { ar: 'عَلَى الْعَرْشِ', tr: '‘alal-‘arsh', en: 'upon the Throne' },
      ],
      fun_fact: 'A harf never changes its own shape — but it makes the word AFTER it end in a kasra.',
    }},
    { type: 'teach', content: {
      title: 'The kasra clue',
      explanation: 'Any noun right after a preposition takes a **kasra** ending — the "of/in/on" sound you met in iḍāfa.\n\nالْأَرْض → فِي الْأَرْض**ِ**  ·  الْعَرْش → عَلَى الْعَرْش**ِ**',
      arabic: null, transliteration: null,
      examples: [
        { ar: 'فِي الْبَيْتِ', tr: 'fil-bayt', en: 'in the house' },
        { ar: 'عَلَى الْمَاءِ', tr: '‘alal-maa’', en: 'upon the water' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'فِي means...',
      options: [
        { text: 'in / inside', correct: true },
        { text: 'on top of', correct: false },
        { text: 'from', correct: false },
      ],
      explanation: 'فِي = in. عَلَىٰ = on/upon.',
    }},
    { type: 'match', content: {
      instruction: 'Match the preposition to its meaning',
      pairs: [
        { left: 'فِي', right: 'in' },
        { left: 'عَلَىٰ', right: 'on / upon' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'وَهُوَ الَّذِي خَلَقَ ... وَكَانَ عَرْشُهُ عَلَى الْمَاءِ — "...and His Throne was ___ the water" (Hud 11:7).',
      correct_answer: 'upon',
      options: ['upon', 'in', 'from'],
      explanation: 'عَلَى الْمَاءِ = "upon the water". عَلَىٰ = on/upon.',
    }},
    { type: 'classify', content: {
      instruction: '"in" or "on"?',
      categories: ['فِي (in)', 'عَلَىٰ (on)'],
      items: [
        { text: 'فِي الْأَرْضِ (___ the earth)', category: 'فِي (in)' },
        { text: 'عَلَى الْعَرْشِ (___ the Throne)', category: 'عَلَىٰ (on)' },
        { text: 'فِي الْجَنَّةِ (___ Paradise)', category: 'فِي (in)' },
        { text: 'عَلَى الْأَرْضِ (___ the earth)', category: 'عَلَىٰ (on)' },
      ],
      explanation: 'فِي puts you inside; عَلَىٰ puts you on top.',
    }},
    { type: 'teach', content: {
      title: 'Two down',
      explanation: '**فِي in · عَلَىٰ on.** And every noun after them wears a kasra.\n\nNext: the two most common motion words — from and to.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U9_L2 = { // مِنْ and إِلَىٰ
  steps: [
    { type: 'teach', content: {
      title: 'From and To',
      explanation: '**مِنْ** = from (a starting point)\n**إِلَىٰ** = to / toward (a destination)\n\nمِنْ is the **most common harf in the whole Quran** — over 3,000 times.',
      arabic: 'مِنْ · إِلَىٰ',
      transliteration: 'min · ilaa',
      examples: [
        { ar: 'مِنَ النَّاسِ', tr: 'minan-naas', en: 'from the people' },
        { ar: 'إِلَى اللّٰهِ', tr: 'ilallaah', en: 'to Allah' },
      ],
      fun_fact: 'إِنَّا لِلّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ — "to Him we return". That إِلَيْهِ is إِلَىٰ + هِ.',
    }},
    { type: 'mcq', content: {
      question: 'إِلَىٰ means...',
      options: [
        { text: 'to / toward', correct: true },
        { text: 'from', correct: false },
        { text: 'in', correct: false },
      ],
      explanation: 'إِلَىٰ = to. مِنْ = from.',
    }},
    { type: 'match', content: {
      instruction: 'Match to meaning',
      pairs: [
        { left: 'مِنْ', right: 'from' },
        { left: 'إِلَىٰ', right: 'to' },
        { left: 'فِي', right: 'in' },
        { left: 'عَلَىٰ', right: 'on' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ... ___ شَرِّ الْوَسْوَاسِ — "...___ the evil of the whisperer" (An-Nas 114:4).',
      correct_answer: 'مِنْ',
      options: ['مِنْ', 'إِلَىٰ', 'فِي'],
      explanation: 'مِنْ شَرِّ = "from the evil of". مِنْ = from.',
    }},
    { type: 'classify', content: {
      instruction: 'Starting point (from) or destination (to)?',
      categories: ['مِنْ (from)', 'إِلَىٰ (to)'],
      items: [
        { text: 'مِنَ النَّاسِ', category: 'مِنْ (from)' },
        { text: 'إِلَى اللّٰهِ', category: 'إِلَىٰ (to)' },
        { text: 'مِنَ الْجِنَّةِ', category: 'مِنْ (from)' },
        { text: 'إِلَى رَبِّكَ', category: 'إِلَىٰ (to)' },
      ],
      explanation: 'مِنْ marks where you start; إِلَىٰ marks where you head.',
    }},
    { type: 'mcq', content: {
      question: 'Why does مِنْ often appear as مِنَ (with a fatha) before "the"?',
      options: [
        { text: 'To flow smoothly into the next word — مِنَ النَّاسِ', correct: true },
        { text: 'It changes meaning to "to"', correct: false },
      ],
      explanation: 'It is just easier to say: مِنَ النَّاسِ instead of "min-n-naas". Meaning stays "from".',
    }},
    { type: 'teach', content: {
      title: 'Four prepositions, unlocked',
      explanation: 'in · on · from · to. You can now place and move things through the Quran.\n\nNext: what happens when a pronoun sticks onto a preposition — فِيهِ, عَلَيْهِمْ.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U9_L3 = { // Prepositions + attached pronouns
  steps: [
    { type: 'teach', content: {
      title: 'Preposition + pronoun',
      explanation: 'The attached pronouns from Unit 5 stick onto prepositions too:\n\nفِي + هِ = **فِيهِ** (in it/him)\nمِنْ + هُ = **مِنْهُ** (from it/him)\nعَلَىٰ + هِمْ = **عَلَيْهِمْ** (upon them)\nإِلَىٰ + كَ = **إِلَيْكَ** (to you)',
      arabic: 'فِيهِ · مِنْهُ · عَلَيْهِمْ',
      transliteration: 'feehi · minhu · ‘alayhim',
      examples: [
        { ar: 'فِيهِ', tr: 'feehi', en: 'in it' },
        { ar: 'إِلَيْكَ', tr: 'ilayka', en: 'to you' },
        { ar: 'مِنْهُمْ', tr: 'minhum', en: 'from them' },
      ],
      fun_fact: 'عَلَىٰ and إِلَىٰ reshape their tail before a pronoun: the ىٰ becomes يْ → عَلَيْ..., إِلَيْ...',
    }},
    { type: 'mcq', content: {
      question: 'فِيهِ means...',
      options: [
        { text: 'in it / in him', correct: true },
        { text: 'from it', correct: false },
        { text: 'to them', correct: false },
      ],
      explanation: 'فِي (in) + هِ (it/him) = فِيهِ. لَا رَيْبَ فِيهِ = "no doubt in it" (Al-Baqarah 2:2).',
    }},
    { type: 'match', content: {
      instruction: 'Match the fused form to its meaning',
      pairs: [
        { left: 'فِيهِ', right: 'in it' },
        { left: 'مِنْهُ', right: 'from it' },
        { left: 'عَلَيْهِمْ', right: 'upon them' },
        { left: 'إِلَيْكَ', right: 'to you' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْ___ — "the path of those You have blessed" (Al-Fatiha 1:7). عَلَيْهِمْ = "upon them".',
      correct_answer: 'هِمْ',
      options: ['هِمْ', 'كَ', 'نَا'],
      explanation: 'عَلَىٰ + هِمْ = عَلَيْهِمْ ("upon them"). You just parsed the last ayah of Al-Fatiha.',
    }},
    { type: 'classify', content: {
      instruction: 'Which preposition is hiding inside?',
      categories: ['فِي (in)', 'مِنْ (from)', 'عَلَىٰ / إِلَىٰ'],
      items: [
        { text: 'فِيهِ', category: 'فِي (in)' },
        { text: 'مِنْهُمْ', category: 'مِنْ (from)' },
        { text: 'عَلَيْهِ', category: 'عَلَىٰ / إِلَىٰ' },
        { text: 'إِلَيْكَ', category: 'عَلَىٰ / إِلَىٰ' },
      ],
      explanation: 'Spot the root preposition before the pronoun tail.',
    }},
    { type: 'teach', content: {
      title: 'Fused and ready',
      explanation: 'Prepositions swallow pronouns everywhere in the Quran. Next: the graduation — Surah An-Nas, a preposition showcase.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U9_L4 = { // Read the Quran: An-Nas
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — An-Nas',
      explanation: 'The last surah of the Quran leans on prepositions:\n\n**قُلْ أَعُوذُ بِرَبِّ النَّاسِ ... مِنْ شَرِّ الْوَسْوَاسِ ... الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ... مِنَ الْجِنَّةِ وَالنَّاسِ**',
      arabic: 'مِنْ شَرِّ الْوَسْوَاسِ',
      transliteration: 'min sharril-waswaas',
      quran_ref: 'An-Nas 114:1–6',
    }},
    { type: 'mcq', content: {
      question: 'فِي صُدُورِ النَّاسِ — فِي means...',
      options: [
        { text: 'in', correct: true },
        { text: 'from', correct: false },
        { text: 'upon', correct: false },
      ],
      explanation: '"...who whispers IN the chests of people." فِي = in.',
    }},
    { type: 'mcq', content: {
      question: 'مِنَ الْجِنَّةِ وَالنَّاسِ — مِنَ (مِنْ) means...',
      options: [
        { text: 'from', correct: true },
        { text: 'to', correct: false },
        { text: 'in', correct: false },
      ],
      explanation: '"...FROM among the jinn and mankind." مِنْ = from.',
    }},
    { type: 'classify', content: {
      instruction: 'Find each preposition’s meaning (all from An-Nas)',
      categories: ['from', 'in', 'with / by'],
      items: [
        { text: 'مِنْ شَرِّ', category: 'from' },
        { text: 'فِي صُدُورِ', category: 'in' },
        { text: 'بِرَبِّ النَّاسِ', category: 'with / by' },
        { text: 'مِنَ الْجِنَّةِ', category: 'from' },
      ],
      explanation: 'مِنْ from · فِي in · بِ with/by (Unit 10 next). Three prepositions in six short ayat.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'أَعُوذُ ___ رَبِّ النَّاسِ — "I seek refuge WITH the Lord of mankind."',
      correct_answer: 'بِ',
      options: ['بِ', 'مِنْ', 'فِي'],
      explanation: 'بِرَبِّ = بِ ("with/by") + رَبّ. You meet بِ properly in the very next unit.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 9 complete!',
      explanation: 'in · on · from · to — placed and fused with pronouns, live in An-Nas.\n\nNext: the "attached" prepositions بِ and لِ, plus كَ, عَنْ, مَعَ.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 10 — With, For, Like (prepositions 2)
// ═══════════════════════════════════════════════════════════════

const U10_L1 = { // بِ and لِ
  steps: [
    { type: 'teach', content: {
      title: 'The stuck-on prepositions',
      explanation: 'Some prepositions are single letters that **attach** to the front of a word:\n\n**بِ** = with / by / in\n**لِ** = for / to / belonging to\n\nبِاللّٰهِ = "by Allah"  ·  لِلّٰهِ = "for Allah / to Allah"',
      arabic: 'بِ · لِ',
      transliteration: 'bi · li',
      examples: [
        { ar: 'بِاسْمِ اللّٰهِ', tr: 'bismillaah', en: 'in the name of Allah' },
        { ar: 'لِلّٰهِ', tr: 'lillaah', en: 'for Allah' },
        { ar: 'بِالْحَقِّ', tr: 'bil-haqq', en: 'with the truth' },
      ],
      fun_fact: 'بِسْمِ (in Bismillah) is just بِ + اسْم — you have been reading a preposition since Stage 2!',
    }},
    { type: 'mcq', content: {
      question: 'لِ means...',
      options: [
        { text: 'for / to / belonging to', correct: true },
        { text: 'from', correct: false },
        { text: 'on', correct: false },
      ],
      explanation: 'لِ = for/belonging to. لِلّٰهِ = "for Allah".',
    }},
    { type: 'match', content: {
      instruction: 'Match to meaning',
      pairs: [
        { left: 'بِ', right: 'with / by' },
        { left: 'لِ', right: 'for' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'الْحَمْدُ ___لّٰهِ رَبِّ الْعَالَمِينَ — "All praise is FOR Allah" (Al-Fatiha 1:2).',
      correct_answer: 'لِ',
      options: ['لِ', 'بِ', 'مِنْ'],
      explanation: 'لِلّٰهِ = لِ ("for") + اللّٰه. Praise belongs to Allah.',
    }},
    { type: 'classify', content: {
      instruction: '"with/by" or "for"?',
      categories: ['بِ (with/by)', 'لِ (for)'],
      items: [
        { text: 'بِاللّٰهِ (___ Allah)', category: 'بِ (with/by)' },
        { text: 'لِلّٰهِ (___ Allah)', category: 'لِ (for)' },
        { text: 'بِالْحَقِّ (___ the truth)', category: 'بِ (with/by)' },
        { text: 'لِلنَّاسِ (___ the people)', category: 'لِ (for)' },
      ],
      explanation: 'بِ = with/by; لِ = for/belonging to.',
    }},
    { type: 'teach', content: {
      title: 'Attached prepositions: on',
      explanation: 'بِ with/by · لِ for. They glue to the next word. Next: three more — like, about, and with-together.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U10_L2 = { // كَ, عَنْ, مَعَ
  steps: [
    { type: 'teach', content: {
      title: 'Like, About, With',
      explanation: '**كَ** = like / as (attaches)\n**عَنْ** = about / away from\n**مَعَ** = with / together with',
      arabic: 'كَ · عَنْ · مَعَ',
      transliteration: 'ka · ‘an · ma‘a',
      examples: [
        { ar: 'كَمَثَلِ', tr: 'ka-mathal', en: 'like the example of' },
        { ar: 'عَنِ النَّاسِ', tr: '‘anin-naas', en: 'about / from the people' },
        { ar: 'مَعَ الصَّابِرِينَ', tr: 'ma‘as-saabireen', en: 'with the patient' },
      ],
      fun_fact: 'إِنَّ اللّٰهَ مَعَ الصَّابِرِينَ — "Indeed Allah is WITH the patient" (Al-Baqarah 2:153).',
    }},
    { type: 'mcq', content: {
      question: 'مَعَ means...',
      options: [
        { text: 'with / together with', correct: true },
        { text: 'like', correct: false },
        { text: 'about', correct: false },
      ],
      explanation: 'مَعَ = with. إِنَّ مَعَ الْعُسْرِ يُسْرًا — "with hardship comes ease" (Ash-Sharh 94:6).',
    }},
    { type: 'match', content: {
      instruction: 'Match to meaning',
      pairs: [
        { left: 'كَ', right: 'like / as' },
        { left: 'عَنْ', right: 'about / away from' },
        { left: 'مَعَ', right: 'with' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'إِنَّ اللّٰهَ ___ الصَّابِرِينَ — "Indeed Allah is WITH the patient."',
      correct_answer: 'مَعَ',
      options: ['مَعَ', 'كَ', 'عَنْ'],
      explanation: 'مَعَ الصَّابِرِينَ = "with the patient". A promise repeated across the Quran.',
    }},
    { type: 'classify', content: {
      instruction: 'Sort the prepositions',
      categories: ['like', 'about', 'with'],
      items: [
        { text: 'كَمَثَلِ', category: 'like' },
        { text: 'عَنِ الصَّلَاةِ', category: 'about' },
        { text: 'مَعَ الصَّابِرِينَ', category: 'with' },
      ],
      explanation: 'كَ like · عَنْ about · مَعَ with.',
    }},
    { type: 'teach', content: {
      title: 'Seven prepositions strong',
      explanation: 'فِي، عَلَىٰ، مِنْ، إِلَىٰ، بِ، لِ، كَ، عَنْ، مَعَ — you own the core toolkit. Next: the fused forms the Quran repeats endlessly — لَهُ، بِهِ.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U10_L3 = { // Fused forms
  steps: [
    { type: 'teach', content: {
      title: 'The forms you will see a thousand times',
      explanation: 'بِ and لِ fuse with pronouns constantly:\n\nلَ + هُ = **لَهُ** (for him / to him)\nلَ + هُمْ = **لَهُمْ** (for them)\nبِ + هِ = **بِهِ** (with it / by it)\nبِ + هِمْ = **بِهِمْ** (with them)',
      arabic: 'لَهُ · لَهُمْ · بِهِ',
      transliteration: 'lahu · lahum · bihi',
      examples: [
        { ar: 'لَهُ', tr: 'lahu', en: 'for him / his' },
        { ar: 'لَهُمْ', tr: 'lahum', en: 'for them' },
        { ar: 'بِهِ', tr: 'bihi', en: 'with it / by it' },
      ],
      fun_fact: 'لِ becomes لَ (with a fatha) before most pronouns: لِ + هُ → لَهُ.',
    }},
    { type: 'mcq', content: {
      question: 'لَهُمْ means...',
      options: [
        { text: 'for them', correct: true },
        { text: 'with him', correct: false },
        { text: 'from them', correct: false },
      ],
      explanation: 'لَ ("for") + هُمْ ("them") = لَهُمْ. لَهُمْ أَجْرٌ = "for them is a reward".',
    }},
    { type: 'match', content: {
      instruction: 'Match the fused form to its meaning',
      pairs: [
        { left: 'لَهُ', right: 'for him' },
        { left: 'لَهُمْ', right: 'for them' },
        { left: 'بِهِ', right: 'with it' },
        { left: 'بِهِمْ', right: 'with them' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: 'لَ__ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ — "To HIM belongs whatever is in the heavens and earth."',
      correct_answer: 'هُ',
      options: ['هُ', 'هُمْ', 'كَ'],
      explanation: 'لَهُ = "to Him / His". A refrain of ownership across the Quran.',
    }},
    { type: 'classify', content: {
      instruction: 'Which preposition is fused inside?',
      categories: ['لِ (for)', 'بِ (with/by)'],
      items: [
        { text: 'لَهُ', category: 'لِ (for)' },
        { text: 'بِهِ', category: 'بِ (with/by)' },
        { text: 'لَهُمْ', category: 'لِ (for)' },
        { text: 'بِهِمْ', category: 'بِ (with/by)' },
      ],
      explanation: 'لَـ hides لِ ("for"); بِـ hides بِ ("with/by").',
    }},
    { type: 'teach', content: {
      title: 'Fused prepositions mastered',
      explanation: 'لَهُ، لَهُمْ، بِهِ — instant recognition now. Next: the graduation — لَهُ مَا فِي السَّمَاوَاتِ, a whole ayah of prepositions.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U10_L4 = { // Read the Quran: lahu ma fis-samawat
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — All belongs to Him',
      explanation: '**لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ**\n"To Him belongs whatever is in the heavens and whatever is in the earth." (Al-Baqarah 2:255)\n\nCount the prepositions: لَهُ (to Him), فِي (in) ×2.',
      arabic: 'لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
      transliteration: 'lahu maa fis-samaawaati wa maa fil-ard',
      quran_ref: 'Al-Baqarah 2:255',
    }},
    { type: 'mcq', content: {
      question: 'لَهُ at the start means...',
      options: [
        { text: 'To Him (belongs)', correct: true },
        { text: 'With them', correct: false },
        { text: 'From it', correct: false },
      ],
      explanation: 'لَ ("to/for") + هُ ("Him") = لَهُ. Fronting it stresses that EVERYTHING is His.',
    }},
    { type: 'mcq', content: {
      question: 'فِي السَّمَاوَاتِ means...',
      options: [
        { text: 'in the heavens', correct: true },
        { text: 'on the heavens', correct: false },
        { text: 'from the heavens', correct: false },
      ],
      explanation: 'فِي = in. السَّمَاوَات = the heavens.',
    }},
    { type: 'classify', content: {
      instruction: 'Label the prepositions in the ayah',
      categories: ['for / to (لِ)', 'in (فِي)'],
      items: [
        { text: 'لَهُ', category: 'for / to (لِ)' },
        { text: 'فِي السَّمَاوَاتِ', category: 'in (فِي)' },
        { text: 'فِي الْأَرْضِ', category: 'in (فِي)' },
      ],
      explanation: 'One لَهُ + two فِي = the whole ayah’s glue.',
    }},
    { type: 'arrange', content: {
      instruction: 'Build: "To Him belongs what is in the heavens"',
      reference: 'To Him belongs what is in the heavens',
      tiles: ['لَهُ', 'مَا', 'فِي', 'السَّمَاوَاتِ'],
      correct_order: ['لَهُ', 'مَا', 'فِي', 'السَّمَاوَاتِ'],
      result_transliteration: 'lahu maa fis-samaawaat',
      explanation: 'مَا here = "what / whatever" (you meet it fully in Unit 12).',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 10 complete!',
      explanation: 'Nine prepositions, fused forms and all. Next: the connectors that string ayat together — وَ، فَ، ثُمَّ.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 11 — And, Then, So (connectors)
// ═══════════════════════════════════════════════════════════════

const U11_L1 = { // wa the workhorse
  steps: [
    { type: 'teach', content: {
      title: 'وَ — the workhorse',
      explanation: 'The single most common word in the Quran is **وَ** — "and". It attaches to the front of the next word.\n\nالسَّمَاوَاتِ **وَ**الْأَرْضِ = "the heavens **and** the earth".',
      arabic: 'وَ',
      transliteration: 'wa (and)',
      examples: [
        { ar: 'السَّمَاءُ وَالْأَرْضُ', tr: 'as-samaa’u wal-ard', en: 'the sky and the earth' },
        { ar: 'الْجِنَّةِ وَالنَّاسِ', tr: 'al-jinnati wan-naas', en: 'the jinn and mankind' },
      ],
      fun_fact: 'وَ appears over 9,000 times — reading long وَ...وَ...وَ chains is a core Quran skill.',
    }},
    { type: 'mcq', content: {
      question: 'وَ means...',
      options: [
        { text: 'and', correct: true },
        { text: 'or', correct: false },
        { text: 'then', correct: false },
      ],
      explanation: 'وَ = and — the Quran’s most frequent word.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'مِنَ الْجِنَّةِ ___النَّاسِ — "from the jinn AND mankind" (An-Nas 114:6).',
      correct_answer: 'وَ',
      options: ['وَ', 'أَوْ', 'فَ'],
      explanation: 'وَالنَّاسِ = "and mankind". وَ glues the two together.',
    }},
    { type: 'match', content: {
      instruction: 'Match to meaning',
      pairs: [
        { left: 'وَ', right: 'and' },
        { left: 'فِي', right: 'in' },
        { left: 'مِنْ', right: 'from' },
      ],
    }},
    { type: 'mcq', content: {
      question: 'وَالْعَصْرِ (Al-Asr 1) opens with وَ. Here it is a special "oath" وَ meaning...',
      options: [
        { text: '"By..." (an oath) — "By the time!"', correct: true },
        { text: '"and"', correct: false },
      ],
      explanation: 'At the start of a surah, وَ often means "By ___!" — a solemn oath. (You will study oaths in the mastery track.)',
    }},
    { type: 'teach', content: {
      title: 'The great connector',
      explanation: 'وَ = and (and sometimes "by" in oaths). Next: two connectors that add ORDER — فَ (so, right away) and ثُمَّ (then, later).',
      arabic: null, transliteration: null,
    }},
  ],
};

const U11_L2 = { // fa and thumma
  steps: [
    { type: 'teach', content: {
      title: 'So & Then',
      explanation: '**فَ** = so / then (immediately, as a result) — attaches to the front\n**ثُمَّ** = then (after a pause / later) — a separate word',
      arabic: 'فَ · ثُمَّ',
      transliteration: 'fa · thumma',
      examples: [
        { ar: 'فَصَلِّ', tr: 'fa-salli', en: 'so pray' },
        { ar: 'ثُمَّ', tr: 'thumma', en: 'then (later)' },
      ],
      fun_fact: 'فَ is instant cause-and-effect; ثُمَّ leaves a gap in time. The Quran chooses between them with precision.',
    }},
    { type: 'mcq', content: {
      question: 'What is the difference between فَ and ثُمَّ?',
      options: [
        { text: 'فَ = right away; ثُمَّ = after a delay', correct: true },
        { text: 'They are identical', correct: false },
        { text: 'فَ = and; ثُمَّ = or', correct: false },
      ],
      explanation: 'فَ = immediate "so/then"; ثُمَّ = "then" with a time gap.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ — "SO pray to your Lord and sacrifice" (Al-Kawthar 108:2).',
      correct_answer: 'so',
      options: ['so', 'or', 'from'],
      explanation: 'فَ = "so" — a result: We gave you abundance, SO pray.',
    }},
    { type: 'classify', content: {
      instruction: 'Immediate or delayed?',
      categories: ['فَ (right away)', 'ثُمَّ (later)'],
      items: [
        { text: 'فَصَلِّ (so pray)', category: 'فَ (right away)' },
        { text: 'ثُمَّ اسْتَوَىٰ (then He rose)', category: 'ثُمَّ (later)' },
        { text: 'فَوَيْلٌ (so woe)', category: 'فَ (right away)' },
        { text: 'ثُمَّ أَمَاتَهُ (then He caused him to die)', category: 'ثُمَّ (later)' },
      ],
      explanation: 'فَ = instant consequence; ثُمَّ = a later stage.',
    }},
    { type: 'teach', content: {
      title: 'Sequencing unlocked',
      explanation: 'وَ and · فَ so/then · ثُمَّ then-later. You can now follow the flow of a story. Next: the two kinds of "or".',
      arabic: null, transliteration: null,
    }},
  ],
};

const U11_L3 = { // aw and am
  steps: [
    { type: 'teach', content: {
      title: 'Two kinds of "or"',
      explanation: '**أَوْ** = or (in a statement)\n**أَمْ** = or (inside a question — "...or...?")',
      arabic: 'أَوْ · أَمْ',
      transliteration: 'aw · am',
      examples: [
        { ar: 'قَلِيلًا أَوْ كَثِيرًا', tr: 'qaleelan aw katheeran', en: 'a little or a lot' },
        { ar: 'أَأَنْتُمْ أَشَدُّ أَمِ السَّمَاءُ', tr: 'a-antum ashaddu amis-samaa’', en: 'are you harder [to create], or the sky?' },
      ],
      fun_fact: 'أَمْ almost always lives inside a question, weighing two options against each other.',
    }},
    { type: 'mcq', content: {
      question: 'Which "or" belongs inside a question?',
      options: [
        { text: 'أَمْ', correct: true },
        { text: 'أَوْ', correct: false },
      ],
      explanation: 'أَمْ = or (in questions). أَوْ = or (in statements).',
    }},
    { type: 'match', content: {
      instruction: 'Match every connector you now know',
      pairs: [
        { left: 'وَ', right: 'and' },
        { left: 'فَ', right: 'so / then' },
        { left: 'ثُمَّ', right: 'then (later)' },
        { left: 'أَوْ', right: 'or' },
      ],
    }},
    { type: 'classify', content: {
      instruction: 'Statement "or" or question "or"?',
      categories: ['أَوْ (statement)', 'أَمْ (question)'],
      items: [
        { text: 'قَلِيلًا أَوْ كَثِيرًا', category: 'أَوْ (statement)' },
        { text: 'أَمِ السَّمَاءُ؟', category: 'أَمْ (question)' },
      ],
      explanation: 'أَوْ joins choices in a statement; أَمْ weighs options in a question.',
    }},
    { type: 'teach', content: {
      title: 'All the connectors, yours',
      explanation: 'and · so · then · or. You can now string ayat like beads. Next: the graduation — Surah Al-Asr.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U11_L4 = { // Read the Quran: Al-Asr
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — Al-Asr',
      explanation: 'A tiny surah Imam Shafi’i said would suffice humanity if they pondered it:\n\n**وَالْعَصْرِ • إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ**\n"By the time — indeed mankind is in loss."',
      arabic: 'وَالْعَصْرِ • إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ',
      transliteration: 'wal-‘asr • innal-insaana lafee khusr',
      quran_ref: 'Al-Asr 103:1–2',
    }},
    { type: 'mcq', content: {
      question: 'وَالْعَصْرِ — this opening وَ is...',
      options: [
        { text: 'an oath: "By the time!"', correct: true },
        { text: 'just "and"', correct: false },
      ],
      explanation: 'At a surah’s opening, وَ swears an oath: "By the time."',
    }},
    { type: 'mcq', content: {
      question: 'لَفِي خُسْرٍ contains which preposition?',
      options: [
        { text: 'فِي (in) — "in loss"', correct: true },
        { text: 'مِنْ (from)', correct: false },
        { text: 'عَلَىٰ (on)', correct: false },
      ],
      explanation: 'لَفِي = لَ (emphatic "surely") + فِي ("in"). "...surely IN loss."',
    }},
    { type: 'fill_blank', content: {
      sentence: 'إِلَّا الَّذِينَ آمَنُوا ___عَمِلُوا الصَّالِحَاتِ — "...except those who believe AND do righteous deeds" (Al-Asr 103:3).',
      correct_answer: 'وَ',
      options: ['وَ', 'أَوْ', 'ثُمَّ'],
      explanation: 'وَعَمِلُوا = "and they did". وَ links belief with action.',
    }},
    { type: 'classify', content: {
      instruction: 'Label the connective/preposition',
      categories: ['وَ (and/by)', 'فِي (in)', 'إِلَّا (except)'],
      items: [
        { text: 'وَالْعَصْرِ', category: 'وَ (and/by)' },
        { text: 'لَفِي خُسْرٍ', category: 'فِي (in)' },
        { text: 'إِلَّا الَّذِينَ', category: 'إِلَّا (except)' },
      ],
      explanation: 'إِلَّا ("except") is your next unit — the great exception in لَا إِلَٰهَ إِلَّا اللّٰه.',
    }},
    { type: 'teach', content: {
      title: '🎉 Unit 11 complete!',
      explanation: 'You connect and sequence ideas across ayat. One unit of Stage 3 left — negation and questions: لَا، مَا، and the shahada itself.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// UNIT 12 — No, Not, Never & Questions — checkpoint after
// ═══════════════════════════════════════════════════════════════

const U12_L1 = { // la and ma
  steps: [
    { type: 'teach', content: {
      title: 'Saying "no" and "not"',
      explanation: '**لَا** = no / not (negates)\n**مَا** = not / what (negates a verb, or asks "what?")\n\nلَا رَيْبَ = "no doubt"  ·  مَا كَانَ = "he was not"',
      arabic: 'لَا · مَا',
      transliteration: 'laa · maa',
      examples: [
        { ar: 'لَا رَيْبَ فِيهِ', tr: 'laa rayba feeh', en: 'no doubt in it' },
        { ar: 'مَا كَانَ', tr: 'maa kaana', en: 'he was not' },
      ],
      fun_fact: 'مَا wears two hats: "not" (negating) and "what" (asking). Context tells you which.',
    }},
    { type: 'mcq', content: {
      question: 'لَا means...',
      options: [
        { text: 'no / not', correct: true },
        { text: 'and', correct: false },
        { text: 'from', correct: false },
      ],
      explanation: 'لَا = no/not. لَا رَيْبَ فِيهِ = "there is NO doubt in it" (Al-Baqarah 2:2).',
    }},
    { type: 'teach', content: {
      title: 'Deconstructing the Shahada',
      explanation: 'The greatest sentence in Islam is built from words you now know:\n\n**لَا** (no) **إِلَٰهَ** (god) **إِلَّا** (except) **اللّٰهُ** (Allah)\n\n"There is **no** god **except** Allah."',
      arabic: 'لَا إِلَٰهَ إِلَّا اللّٰهُ',
      transliteration: 'laa ilaaha illallaah',
      quran_ref: 'As-Saffat 37:35',
    }},
    { type: 'fill_blank', content: {
      sentence: '___ إِلَٰهَ إِلَّا اللّٰهُ — "There is NO god except Allah."',
      correct_answer: 'لَا',
      options: ['لَا', 'مَا', 'هَلْ'],
      explanation: 'لَا = "no". The shahada opens by negating every false god.',
    }},
    { type: 'mcq', content: {
      question: 'In مَا خَلَقْنَا السَّمَاءَ ("We did NOT create the sky [in vain]"), مَا means...',
      options: [
        { text: 'not (negating the verb)', correct: true },
        { text: 'what', correct: false },
      ],
      explanation: 'Before a verb, مَا usually = "not". Here it negates "created".',
    }},
    { type: 'teach', content: {
      title: 'Negation unlocked',
      explanation: 'لَا no · مَا not/what. Next: the tiny word that carves out an exception — إِلَّا.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U12_L2 = { // illa
  steps: [
    { type: 'teach', content: {
      title: '"Except" — إِلَّا',
      explanation: '**إِلَّا** = except / but. It carves ONE thing out of a total negation.\n\nلَا إِلَٰهَ **إِلَّا** اللّٰهُ — negate ALL gods, then make the single exception: Allah.',
      arabic: 'إِلَّا',
      transliteration: 'illaa (except)',
      examples: [
        { ar: 'لَا إِلَٰهَ إِلَّا اللّٰهُ', tr: 'laa ilaaha illallaah', en: 'no god except Allah' },
        { ar: 'إِلَّا الَّذِينَ آمَنُوا', tr: 'illal-ladheena aamanoo', en: 'except those who believe' },
      ],
      fun_fact: 'This "لَا ... إِلَّا" pattern is called restriction — it is the most powerful sentence shape in the Quran.',
    }},
    { type: 'mcq', content: {
      question: 'إِلَّا means...',
      options: [
        { text: 'except / but', correct: true },
        { text: 'and', correct: false },
        { text: 'in', correct: false },
      ],
      explanation: 'إِلَّا = except. It rescues one item from a blanket "no".',
    }},
    { type: 'fill_blank', content: {
      sentence: 'إِنَّ الْإِنْسَانَ لَفِي خُسْرٍ ۝ ___ الَّذِينَ آمَنُوا — "...EXCEPT those who believe" (Al-Asr 103:2–3).',
      correct_answer: 'إِلَّا',
      options: ['إِلَّا', 'وَ', 'مَا'],
      explanation: 'إِلَّا carves the believers out of the loss.',
    }},
    { type: 'arrange', content: {
      instruction: 'Build the Shahada',
      reference: 'There is no god except Allah',
      tiles: ['لَا', 'إِلَٰهَ', 'إِلَّا', 'اللّٰهُ'],
      correct_order: ['لَا', 'إِلَٰهَ', 'إِلَّا', 'اللّٰهُ'],
      result_transliteration: 'laa ilaaha illallaah',
      explanation: 'No (لَا) + god (إِلَٰهَ) + except (إِلَّا) + Allah (اللّٰهُ). You built the testimony of faith.',
    }},
    { type: 'mcq', content: {
      question: 'The pattern لَا ... إِلَّا works by...',
      options: [
        { text: 'negating everything, then allowing ONE exception', correct: true },
        { text: 'asking a question', correct: false },
      ],
      explanation: 'Total negation + single exception = restriction. "None... except this one."',
    }},
    { type: 'teach', content: {
      title: 'The exception, mastered',
      explanation: 'You can now read the deepest sentence in Islam, word by word. Next: asking questions — هَلْ، مَنْ، مَا، كَيْفَ.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U12_L3 = { // question words
  steps: [
    { type: 'teach', content: {
      title: 'Asking questions',
      explanation: 'The Quran asks a lot of questions. The key words:\n\n**هَلْ** = (yes/no question)\n**مَنْ** = who?  ·  **مَا** = what?\n**أَيْنَ** = where?  ·  **كَيْفَ** = how?  ·  **مَتَىٰ** = when?',
      arabic: 'هَلْ · مَنْ · مَا · كَيْفَ',
      transliteration: 'hal · man · maa · kayfa',
      examples: [
        { ar: 'مَنْ رَبُّكَ', tr: 'man rabbuka', en: 'who is your Lord?' },
        { ar: 'كَيْفَ', tr: 'kayfa', en: 'how?' },
        { ar: 'أَيْنَ', tr: 'ayna', en: 'where?' },
      ],
      fun_fact: 'هَلْ turns a statement into a yes/no question — like a spoken question mark at the front.',
    }},
    { type: 'mcq', content: {
      question: 'كَيْفَ means...',
      options: [
        { text: 'how', correct: true },
        { text: 'who', correct: false },
        { text: 'where', correct: false },
      ],
      explanation: 'كَيْفَ = how. كَيْفَ تَكْفُرُونَ بِاللّٰهِ — "HOW can you disbelieve in Allah?" (Al-Baqarah 2:28).',
    }},
    { type: 'match', content: {
      instruction: 'Match each question word',
      pairs: [
        { left: 'مَنْ', right: 'who' },
        { left: 'مَا', right: 'what' },
        { left: 'أَيْنَ', right: 'where' },
        { left: 'كَيْفَ', right: 'how' },
      ],
    }},
    { type: 'fill_blank', content: {
      sentence: '___ أَتَاكَ حَدِيثُ الْغَاشِيَةِ — "HAS there come to you the report of the Overwhelming?" (Al-Ghashiyah 88:1).',
      correct_answer: 'هَلْ',
      options: ['هَلْ', 'مَنْ', 'أَيْنَ'],
      explanation: 'هَلْ opens a yes/no question — a gentle, arresting way to begin.',
    }},
    { type: 'classify', content: {
      instruction: 'What is each question asking about?',
      categories: ['a person (who)', 'a thing (what)', 'a manner (how)'],
      items: [
        { text: 'مَنْ خَلَقَ؟ (___ created?)', category: 'a person (who)' },
        { text: 'مَا هَذَا؟ (___ is this?)', category: 'a thing (what)' },
        { text: 'كَيْفَ تَكْفُرُونَ؟ (___ do you disbelieve?)', category: 'a manner (how)' },
      ],
      explanation: 'مَنْ who · مَا what · كَيْفَ how.',
    }},
    { type: 'teach', content: {
      title: 'You can ask in Arabic',
      explanation: 'هَلْ، مَنْ، مَا، أَيْنَ، كَيْفَ، مَتَىٰ — the Quran’s questions open up to you. Final lesson: the graduation, and the end of Stage 3.',
      arabic: null, transliteration: null,
    }},
  ],
};

const U12_L4 = { // Read the Quran: Al-Ghashiyah + negation
  steps: [
    { type: 'teach', content: {
      title: 'Read the Quran 📖 — a question & a denial',
      explanation: '**هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ**\n"Has the report of the Overwhelming reached you?" (Al-Ghashiyah 88:1)\n\nAnd the shahada’s denial:\n**لَا إِلَٰهَ إِلَّا اللّٰهُ**',
      arabic: 'هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ',
      transliteration: 'hal ataaka hadeethul-ghaashiyah',
      quran_ref: 'Al-Ghashiyah 88:1',
    }},
    { type: 'mcq', content: {
      question: 'هَلْ tells you the sentence is...',
      options: [
        { text: 'a yes/no question', correct: true },
        { text: 'a negation', correct: false },
        { text: 'a command', correct: false },
      ],
      explanation: 'هَلْ = the front-loaded question mark. "HAS there come to you...?"',
    }},
    { type: 'mcq', content: {
      question: 'أَتَاكَ ("came to you") ends in كَ. That كَ means...',
      options: [
        { text: 'you', correct: true },
        { text: 'them', correct: false },
        { text: 'me', correct: false },
      ],
      explanation: 'The attached ـكَ = "you" — your Unit-5 skill, still working.',
    }},
    { type: 'classify', content: {
      instruction: 'Question, negation, or exception?',
      categories: ['Question (هَلْ/مَا)', 'Negation (لَا/مَا)', 'Exception (إِلَّا)'],
      items: [
        { text: 'هَلْ أَتَاكَ', category: 'Question (هَلْ/مَا)' },
        { text: 'لَا إِلَٰهَ', category: 'Negation (لَا/مَا)' },
        { text: 'إِلَّا اللّٰهُ', category: 'Exception (إِلَّا)' },
      ],
      explanation: 'هَلْ asks · لَا denies · إِلَّا excepts — the three moves of this unit.',
    }},
    { type: 'fill_blank', content: {
      sentence: 'The shahada carves one truth out of total denial: لَا إِلَٰهَ ___ اللّٰهُ.',
      correct_answer: 'إِلَّا',
      options: ['إِلَّا', 'وَ', 'فِي'],
      explanation: 'إِلَّا = except. No god… except Allah.',
    }},
    { type: 'arrange', content: {
      instruction: 'Rebuild the opening question of Al-Ghashiyah',
      reference: 'Has the report of the Overwhelming reached you?',
      tiles: ['هَلْ', 'أَتَاكَ', 'حَدِيثُ', 'الْغَاشِيَةِ'],
      correct_order: ['هَلْ', 'أَتَاكَ', 'حَدِيثُ', 'الْغَاشِيَةِ'],
      result_transliteration: 'hal ataaka hadeethul-ghaashiyah',
      explanation: 'حَدِيثُ الْغَاشِيَةِ is an iḍāfa — "the report OF the Overwhelming". Everything is connecting now.',
    }},
    { type: 'teach', content: {
      title: '🏆 STAGE 3 COMPLETE!',
      explanation: 'The little words no longer confuse you: **prepositions** (in, on, from, to, with, for), **connectors** (and, so, then, or), **negation** (no, not, except), and **questions** (who, what, how).\n\nCombined with Stages 1–2, you can now read the glue of almost any ayah. Next stage: **the Fi’l — verbs** — powered by the root engine that gives QuRoots its name.',
      arabic: null, transliteration: null,
    }},
  ],
};

// ═══════════════════════════════════════════════════════════════
// Vocabulary  [word_ar, translit, english, word_type, gender, number, ref, difficulty]
// ═══════════════════════════════════════════════════════════════

const U9_VOCAB = [
  ['فِي', 'fee', 'in / inside', 'harf', null, null, 'Al-Baqarah 2:2', 1],
  ['عَلَىٰ', '‘alaa', 'on / upon', 'harf', null, null, 'Al-Baqarah 2:7', 1],
  ['مِنْ', 'min', 'from', 'harf', null, null, 'An-Nas 114:4', 1],
  ['إِلَىٰ', 'ilaa', 'to / toward', 'harf', null, null, 'Al-Baqarah 2:14', 1],
  ['الْعَرْش', 'al-‘arsh', 'the Throne', 'ism', 'masculine', 'singular', 'Al-A’raf 7:54', 2],
  ['النَّاس', 'an-naas', 'the people / mankind', 'ism', 'masculine', 'plural', 'An-Nas 114:1', 1],
  ['شَرّ', 'sharr', 'evil', 'ism', 'masculine', 'singular', 'An-Nas 114:4', 1],
];

const U10_VOCAB = [
  ['بِ', 'bi', 'with / by / in', 'harf', null, null, 'Al-Fatiha 1:1', 1],
  ['لِ', 'li', 'for / to / belonging to', 'harf', null, null, 'Al-Fatiha 1:2', 1],
  ['كَ', 'ka', 'like / as', 'harf', null, null, 'Ash-Shura 42:11', 2],
  ['عَنْ', '‘an', 'about / away from', 'harf', null, null, 'Al-Ma’un 107:5', 2],
  ['مَعَ', 'ma‘a', 'with / together with', 'harf', null, null, 'Al-Baqarah 2:153', 1],
  ['السَّمَاوَات', 'as-samaawaat', 'the heavens', 'ism', 'feminine', 'plural', 'Al-Baqarah 2:255', 1],
  ['لَهُ', 'lahu', 'for him / to him', 'harf', null, null, 'Al-Baqarah 2:255', 1],
];

const U11_VOCAB = [
  ['وَ', 'wa', 'and', 'harf', null, null, 'An-Nas 114:6', 1],
  ['فَ', 'fa', 'so / then (at once)', 'harf', null, null, 'Al-Kawthar 108:2', 1],
  ['ثُمَّ', 'thumma', 'then (later)', 'harf', null, null, 'Al-Balad 90:17', 1],
  ['أَوْ', 'aw', 'or (statement)', 'harf', null, null, 'Al-Muzzammil 73:3', 2],
  ['أَمْ', 'am', 'or (question)', 'harf', null, null, 'An-Nazi’at 79:27', 2],
  ['الْعَصْر', 'al-‘asr', 'the time / late afternoon', 'ism', 'masculine', 'singular', 'Al-Asr 103:1', 1],
  ['خُسْر', 'khusr', 'loss', 'ism', 'masculine', 'singular', 'Al-Asr 103:2', 1],
  ['الْإِنْسَان', 'al-insaan', 'mankind / the human', 'ism', 'masculine', 'singular', 'Al-Asr 103:2', 1],
];

const U12_VOCAB = [
  ['لَا', 'laa', 'no / not', 'harf', null, null, 'Al-Baqarah 2:2', 1],
  ['مَا', 'maa', 'not / what', 'harf', null, null, 'Al-Baqarah 2:255', 1],
  ['إِلَّا', 'illaa', 'except / but', 'harf', null, null, 'As-Saffat 37:35', 1],
  ['هَلْ', 'hal', '(yes/no question)', 'harf', null, null, 'Al-Ghashiyah 88:1', 1],
  ['مَنْ', 'man', 'who', 'harf', null, null, 'Al-Baqarah 2:255', 1],
  ['كَيْفَ', 'kayfa', 'how', 'harf', null, null, 'Al-Baqarah 2:28', 1],
  ['أَيْنَ', 'ayna', 'where', 'harf', null, null, 'Al-Qiyamah 75:10', 2],
  ['إِلَٰه', 'ilaah', 'a god / deity', 'ism', 'masculine', 'singular', 'As-Saffat 37:35', 1],
  ['حَدِيث', 'hadeeth', 'speech / account', 'ism', 'masculine', 'singular', 'Al-Ghashiyah 88:1', 1],
];

// ═══════════════════════════════════════════════════════════════
// Seeding
// ═══════════════════════════════════════════════════════════════

const UNIT_DEFS = [
  [9,  'prepositions-1', 'Location Words',     'حُرُوف الجَرّ', '📍', '#5FB57A', false, 'Prepositions of place & motion: in, on, from, to.'],
  [10, 'prepositions-2', 'With, For, Like',    'حُرُوف الجَرّ', '🤝', '#6BA8D4', false, 'More prepositions: with, for, like, about — and their fused forms.'],
  [11, 'connectors',     'And, Then, So',      'حُرُوف العَطْف', '🔗', '#D4A246', false, 'Connectors that string ayat together: and, so, then, or.'],
  [12, 'negation-questions', 'No, Not & Questions', 'النَّفْي وَالاسْتِفْهَام', '❓', '#C77DBB', true, 'Negation (no, not, except) and question words.'],
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
    [9, 'fi-ala', 'In & On', 1, U9_L1, 15],
    [9, 'min-ila', 'From & To', 2, U9_L2, 15],
    [9, 'prep-pronouns', 'Preposition + Pronoun', 3, U9_L3, 15],
    [9, 'read-quran-nas', 'Read the Quran: An-Nas', 4, U9_L4, 20],

    [10, 'bi-li', 'With & For', 1, U10_L1, 15],
    [10, 'ka-an-maa', 'Like, About, With', 2, U10_L2, 15],
    [10, 'fused-forms', 'Lahu, Lahum, Bihi', 3, U10_L3, 15],
    [10, 'read-quran-lahu', 'Read the Quran: All Belongs to Him', 4, U10_L4, 20],

    [11, 'wa', 'And — the Workhorse', 1, U11_L1, 15],
    [11, 'fa-thumma', 'So & Then', 2, U11_L2, 15],
    [11, 'aw-am', 'Two Kinds of Or', 3, U11_L3, 15],
    [11, 'read-quran-asr', 'Read the Quran: Al-Asr', 4, U11_L4, 20],

    [12, 'la-ma', 'No & Not', 1, U12_L1, 15],
    [12, 'illa', 'Except', 2, U12_L2, 15],
    [12, 'question-words', 'Question Words', 3, U12_L3, 15],
    [12, 'read-quran-ghashiyah', 'Read the Quran: A Question', 4, U12_L4, 20],
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

  const vocabByUnit = [[9, U9_VOCAB], [10, U10_VOCAB], [11, U11_VOCAB], [12, U12_VOCAB]];
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

  // Backfill: unlock Unit 9 L1 for users who finished ALL of Unit 8
  const [firstU9] = await sql`
    SELECT id FROM learning_lessons WHERE unit_id = ${unitIdBySort[9]} ORDER BY sort_order LIMIT 1`;
  const unlocked = await sql`
    WITH unit8 AS (
      SELECT l.id FROM learning_lessons l
      JOIN learning_units u ON u.id = l.unit_id
      WHERE u.sort_order = 8
    ),
    finishers AS (
      SELECT p.user_id FROM user_lesson_progress p
      JOIN unit8 ON unit8.id = p.lesson_id
      WHERE p.status = 'completed'
      GROUP BY p.user_id
      HAVING count(*) = (SELECT count(*) FROM unit8)
    )
    INSERT INTO user_lesson_progress (user_id, lesson_id, status)
    SELECT f.user_id, ${firstU9.id}, 'available' FROM finishers f
    ON CONFLICT (user_id, lesson_id) DO NOTHING
    RETURNING user_id`;
  console.log(`  ✓ Unlocked Unit 9 Lesson 1 for ${unlocked.length} users who had finished Unit 8`);

  const check = await sql`
    SELECT u.sort_order, u.title, count(l.id)::int AS lessons
    FROM learning_units u LEFT JOIN learning_lessons l ON l.unit_id = u.id
    GROUP BY u.sort_order, u.title ORDER BY u.sort_order`;
  console.log('\nFinal state:');
  for (const c of check) console.log(`  #${c.sort_order} ${c.title}: ${c.lessons} lessons`);
}

main()
  .then(() => sql.end())
  .catch(async (e) => { console.error('SEED FAILED:', e.message); await sql.end(); process.exit(1); });
