/**
 * Coverage Meter data prep:
 * 1. Seeds Unit 1 vocabulary (the words its lessons actually teach) — the
 *    original unit shipped without vocabulary_bank rows.
 * 2. Tags ALL vocabulary rows with root_arabic (verified against quran_words —
 *    unverifiable roots stay NULL and simply don't count, keeping the meter honest).
 * 3. For harf entries (no root in corpus), precomputes token_count by matching
 *    diacritic-stripped standalone tokens.
 *
 * Idempotent. Run: DATABASE_URL=... node scripts/seed-vocab-roots.mjs
 */
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL, { max: 1, connect_timeout: 30 });

// Unit 1 vocabulary — words taught in "Meet the Ism/Fe'l/Harf" + Practice Round
const U1_VOCAB = [
  // [word_ar, translit, english, type, gender, number, ref, difficulty, root_guess or TEXT: for harf]
  ['اللّٰه', 'Allah', 'Allah', 'ism', 'masculine', 'singular', 'Al-Fatiha 1:1', 1, 'ا ل ه'],
  ['كِتَاب', 'kitaab', 'book', 'ism', 'masculine', 'singular', 'Al-Baqarah 2:2', 1, 'ك ت ب'],
  ['مَسْجِد', 'masjid', 'mosque', 'ism', 'masculine', 'singular', 'At-Tawbah 9:18', 1, 'س ج د'],
  ['قَلَم', 'qalam', 'pen', 'ism', 'masculine', 'singular', 'Al-Qalam 68:1', 1, 'ق ل م'],
  ['كَتَبَ', 'kataba', 'he wrote', 'feel', null, null, 'Al-Mujadila 58:22', 1, 'ك ت ب'],
  ['قَالَ', 'qaala', 'he said', 'feel', null, null, 'Al-Baqarah 2:30', 1, 'ق و ل'],
  ['قَرَأَ', 'qara’a', 'he read', 'feel', null, null, 'Al-Alaq 96:1', 1, 'ق ر ا'],
  ['مِنْ', 'min', 'from', 'harf', null, null, 'Al-Fatiha 1:7', 1, 'TEXT:من'],
  ['فِي', 'fee', 'in', 'harf', null, null, 'Al-Baqarah 2:2', 1, 'TEXT:فى'],
  ['عَلَىٰ', '‘alaa', 'upon', 'harf', null, null, 'Al-Baqarah 2:5', 1, 'TEXT:على'],
  ['إِلَىٰ', 'ilaa', 'to / towards', 'harf', null, null, 'Al-Fatiha 1:7?', 1, 'TEXT:الى'],
];

// Root guesses for Units 2-3 vocab (by word_ar); verified against corpus below.
const ROOT_MAP = {
  // Unit 2
  'بَيْت': 'ب ي ت', 'بَاب': 'ب و ب', 'قَمَر': 'ق م ر', 'نُور': 'ن و ر',
  'جَنَّة': 'ج ن ن', 'رَحْمَة': 'ر ح م', 'صَلَاة': 'ص ل و', 'مَدِينَة': 'م د ن',
  'شَمْس': 'ش م س', 'أَرْض': 'ا ر ض', 'نَار': 'ن و ر', 'نَفْس': 'ن ف س',
  'يَد': 'ي د ي', 'رِيح': 'ر و ح',
  'مُسْلِم': 'س ل م', 'مُسْلِمَة': 'س ل م', 'مُؤْمِن': 'ا م ن', 'مُؤْمِنَة': 'ا م ن',
  'صَالِح': 'ص ل ح', 'صَالِحَة': 'ص ل ح',
  // Unit 3
  'رَجُل': 'ر ج ل', 'رَجُلَانِ': 'ر ج ل', 'كِتَابَانِ': 'ك ت ب',
  'جَنَّتَانِ': 'ج ن ن', 'عَيْنَانِ': 'ع ي ن',
  'مُسْلِمُونَ': 'س ل م', 'مُسْلِمَات': 'س ل م', 'مُؤْمِنُونَ': 'ا م ن', 'مُؤْمِنَات': 'ا م ن',
  'صَالِحَات': 'ص ل ح', 'كُتُب': 'ك ت ب', 'رَسُول': 'ر س ل', 'رُسُل': 'ر س ل',
  'عَبْد': 'ع ب د', 'عِبَاد': 'ع ب د', 'قَلْب': 'ق ل ب', 'قُلُوب': 'ق ل ب',
  'يَوْم': 'ي و م', 'أَيَّام': 'ي و م',
};

// Strip Arabic diacritics + Quranic annotation marks for text matching
const STRIP = /[ً-ٰٟۖ-ۭـ]/g;

async function rootTokens(root) {
  const [r] = await sql`SELECT count(*)::int AS n FROM quran_words WHERE root_arabic = ${root}`;
  return r.n;
}

async function textTokens(stripped) {
  // Match standalone tokens whose diacritic-stripped form equals the particle.
  // Also normalize alif maqsura/ya variance (فى vs في).
  const [r] = await sql`
    SELECT count(*)::int AS n FROM quran_words
    WHERE translate(regexp_replace(text_simple, '[ً-ٰٟۖ-ۭـ]', '', 'g'), 'ىي', 'يي')
        = translate(${stripped}, 'ىي', 'يي')`;
  return r.n;
}

async function main() {
  const units = await sql`SELECT id, title, sort_order FROM learning_units ORDER BY sort_order`;
  const unit1 = units.find((u) => u.sort_order === 1);
  if (!unit1) throw new Error('Unit 1 not found');

  // 1. Seed Unit 1 vocab (wipe + insert for idempotency)
  await sql`DELETE FROM vocabulary_bank WHERE unit_id = ${unit1.id}`;
  for (const [ar, tr, en, type, gender, number, ref, diff, rootOrText] of U1_VOCAB) {
    let root = null, tokens = 0;
    if (rootOrText.startsWith('TEXT:')) {
      tokens = await textTokens(rootOrText.slice(5));
    } else {
      const n = await rootTokens(rootOrText);
      if (n > 0) root = rootOrText;
      tokens = 0; // root entries counted at query time (dedup by root)
      if (n === 0) console.warn(`  ⚠ root not in corpus: ${ar} (${rootOrText})`);
    }
    await sql`
      INSERT INTO vocabulary_bank (word_ar, transliteration, english, word_type, gender, number, unit_id, quranic_ref, difficulty, root_arabic, token_count)
      VALUES (${ar}, ${tr}, ${en}, ${type}, ${gender}, ${number}, ${unit1.id}, ${ref}, ${diff}, ${root}, ${tokens})`;
  }
  console.log(`✓ Unit 1: ${U1_VOCAB.length} vocab rows seeded`);

  // 2. Tag Units 2-3 vocab with verified roots
  const rows = await sql`SELECT id, word_ar FROM vocabulary_bank WHERE unit_id != ${unit1.id}`;
  let tagged = 0, missing = 0;
  for (const row of rows) {
    const guess = ROOT_MAP[row.word_ar];
    if (!guess) { console.warn(`  ⚠ no root mapping for ${row.word_ar}`); missing++; continue; }
    const n = await rootTokens(guess);
    if (n > 0) {
      await sql`UPDATE vocabulary_bank SET root_arabic = ${guess} WHERE id = ${row.id}`;
      tagged++;
    } else {
      console.warn(`  ⚠ root not in corpus (word stays uncounted): ${row.word_ar} → ${guess}`);
      missing++;
    }
  }
  console.log(`✓ Units 2-3: ${tagged} tagged, ${missing} unmatched`);

  // 3. Report: what coverage does a Stage-1 completer get?
  const [tot] = await sql`SELECT count(*)::int AS n FROM quran_words WHERE char_type='word' OR char_type IS NULL`;
  const distinctRoots = await sql`SELECT DISTINCT root_arabic FROM vocabulary_bank WHERE root_arabic IS NOT NULL`;
  const rootsArr = distinctRoots.map((r) => r.root_arabic);
  const [rt] = await sql`SELECT count(*)::int AS n FROM quran_words WHERE root_arabic = ANY(${rootsArr})`;
  const [ht] = await sql`SELECT coalesce(sum(token_count),0)::int AS n FROM vocabulary_bank WHERE word_type='harf'`;
  const pct = ((rt.n + ht.n) / tot.n) * 100;
  console.log(`\nFull Stage-1 coverage: ${rootsArr.length} roots → ${rt.n} tokens + ${ht.n} harf tokens = ${(rt.n+ht.n).toLocaleString()} / ${tot.n.toLocaleString()} (${pct.toFixed(1)}%)`);
}

main().then(() => sql.end()).catch(async (e) => { console.error('FAILED:', e.message); await sql.end(); process.exit(1); });
