/**
 * Parses Quranic corpus for rootless words (particles, pronouns, etc.)
 * and inserts them into the particles table.
 * Run: DATABASE_URL=... node scripts/populate-particles.mjs
 */
import fs from 'fs';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) { console.error('DATABASE_URL required'); process.exit(1); }

const bwMap = {
  "'": 'ء', 'A': 'ا', 'b': 'ب', 't': 'ت', 'v': 'ث', 'j': 'ج', 'H': 'ح', 'x': 'خ',
  'd': 'د', '*': 'ذ', 'r': 'ر', 'z': 'ز', 's': 'س', '$': 'ش', 'S': 'ص', 'D': 'ض',
  'T': 'ط', 'Z': 'ظ', 'E': 'ع', 'g': 'غ', 'f': 'ف', 'q': 'ق', 'k': 'ك', 'l': 'ل',
  'm': 'م', 'n': 'ن', 'h': 'ه', 'w': 'و', 'y': 'ي',
  '{': 'ا', '|': 'آ', '>': 'أ', '&': 'ؤ', '<': 'إ', '}': 'ئ',
  '~': 'ّ', 'p': 'ة', 'o': '', '_': '', 'a': 'َ', 'u': 'ُ', 'i': 'ِ',
  'F': 'ً', 'N': 'ٌ', 'K': 'ٍ', '`': 'ٰ', '^': '', '#': '', '+': '', ',': '',
  '@': '', '.': '', '"': '',
};

function bwToAr(s) {
  return s.split('').map(c => bwMap[c] !== undefined ? bwMap[c] : '').join('');
}

// Meanings for common particles
const meanings = {
  'bi': 'by, with', 'li': 'for, to', 'ka': 'like, as', 'min': 'from', 'mino': 'from',
  'mina': 'from', 'fiY': 'in', 'fiy': 'in', 'EalaY': 'upon, on', 'Ealayo': 'upon',
  '<ilaY': 'to, towards', '<ilayo': 'to, towards', 'Ean': 'about, from', 'Eano': 'about, from',
  'HatoY`': 'until', 'laA': 'not, no', 'maA': 'not / what', 'lamo': 'did not',
  'lano': 'will not', '{l~a*iyna': 'those who', '{l~a*iY': 'the one who (m)',
  '{l~atiY': 'the one who (f)', 'man': 'who, whoever', 'huwa': 'he', 'hiya': 'she',
  'humo': 'they (m)', 'hun~a': 'they (f)', '>antum': 'you (m.pl)',
  '>anta': 'you (m.sg)', '>anti': 'you (f.sg)', 'naHonu': 'we',
  '*a`lika': 'that', 'ha`*aA': 'this', 'ha`*ihi': 'this (f)',
  '>uw@la`^}ika': 'those', 'tiloka': 'that (f)',
  '<in~a': 'indeed', '>an~a': 'that indeed', '<in~amaA': 'only, indeed',
  'la`kin~a': 'but indeed', 'laEal~a': 'perhaps',
  '<in': 'if', '<i*aA': 'when', 'law': 'if (hypothetical)', 'lawolA^': 'if not',
  'vum~a': 'then', '>awo': 'or', '>amo': 'or rather', 'bal': 'rather, but',
  '>an': 'that, to', '<il~aA': 'except', 'qado': 'certainly, already',
  'kayofa': 'how', 'hal': 'do/is (question)', 'maA*aA': 'what',
  'bayona': 'between', 'Einda': 'at, with', 'fawoka': 'above',
  'taHota': 'below', 'sa': 'will (future)',
};

// Parse corpus
const lines = fs.readFileSync('quranic-corpus-morphology-0.4.txt', 'utf8').split('\n');
const particles = new Map();

for (const line of lines) {
  if (line.startsWith('#') || !line.trim()) continue;
  const parts = line.split('\t');
  if (parts.length < 4) continue;
  if (parts[3].startsWith('PREFIX') || parts[3].startsWith('SUFFIX')) continue;
  if (/ROOT:/.test(parts[3])) continue;

  const formBw = parts[1];
  const posMatch = parts[3].match(/POS:(\w+)/);
  const type = posMatch ? posMatch[1] : parts[2];
  const loc = parts[0];
  const formAr = bwToAr(formBw);
  const key = formBw + '|' + type;

  if (!particles.has(key)) {
    particles.set(key, {
      form: formAr,
      formBw: formBw,
      type,
      freq: 0,
      loc,
      meaning: meanings[formBw] || null,
    });
  }
  particles.get(key).freq++;
}

console.log('Unique particles parsed (by buckwalter):', particles.size);

// Deduplicate by Arabic form + type (multiple BW forms can map to same Arabic)
const deduped = new Map();
for (const p of particles.values()) {
  const key = p.form + '|' + p.type;
  if (!deduped.has(key)) {
    deduped.set(key, { ...p });
  } else {
    const existing = deduped.get(key);
    existing.freq += p.freq;
    if (!existing.meaning && p.meaning) existing.meaning = p.meaning;
  }
}
console.log('Unique particles (by Arabic form + type):', deduped.size);

// Insert
async function main() {
  const delSql = postgres(DATABASE_URL, { max: 1 });
  await delSql`DELETE FROM particles`;
  await delSql.end();

  const all = [...deduped.values()].sort((a, b) => b.freq - a.freq);
  const BATCH = 100;

  for (let i = 0; i < all.length; i += BATCH) {
    const s = postgres(DATABASE_URL, { max: 1 });
    const batch = all.slice(i, i + BATCH);
    const valParts = [];
    const params = [];
    for (let j = 0; j < batch.length; j++) {
      const p = batch[j];
      const base = j * 6;
      valParts.push(`($${base+1}, $${base+2}, $${base+3}, $${base+4}, $${base+5}::int, $${base+6})`);
      params.push(p.form, p.formBw, p.type, p.meaning, p.freq, p.loc);
    }
    await s.unsafe(
      `INSERT INTO particles (form, form_buckwalter, type, meaning, frequency, example_location)
       VALUES ${valParts.join(', ')}
       ON CONFLICT (form, type) DO UPDATE SET
         frequency = EXCLUDED.frequency,
         meaning = COALESCE(EXCLUDED.meaning, particles.meaning)`,
      params
    );
    await s.end();
    process.stdout.write(`  ${Math.min(i + BATCH, all.length)}/${all.length}\r`);
  }

  const s2 = postgres(DATABASE_URL, { max: 1 });
  const [count] = await s2`SELECT count(*) FROM particles`;
  console.log(`\n✓ Inserted ${count.count} particles`);

  const top = await s2`SELECT form, type, meaning, frequency FROM particles ORDER BY frequency DESC LIMIT 20`;
  console.log('\nTop 20 particles:');
  for (const r of top) {
    console.log(`  ${r.form.padEnd(15)} ${r.type.padEnd(6)} freq=${String(r.frequency).padEnd(6)} ${r.meaning || ''}`);
  }
  await s2.end();
}

main().catch(e => { console.error(e); process.exit(1); });
