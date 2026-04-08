/**
 * Replace translations table with Kanzul Iman (Imam Ahmad Raza Khan).
 * English rendering by Prof. Shah Farid-ul-Haque.
 *
 * Source: alquran.cloud, edition `en.ahmedraza` (one bulk fetch).
 *
 * Run: node scripts/populate-kanzul-iman.mjs
 *
 * Behavior: deletes ALL existing rows in translations + translation_entries
 * (cascade), then inserts a single new translation with all 6,236 ayahs.
 */
import postgres from 'postgres';
import fs from 'fs';

// Load .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 2 });

const NAME = 'Kanzul Iman';
const AUTHOR = 'Imam Ahmad Raza Khan (Eng. tr. Prof. Shah Farid-ul-Haque)';
const SOURCE_URL = 'https://api.alquran.cloud/v1/quran/en.ahmedraza';

function stripHtml(html) {
  return (html || '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

async function main() {
  console.log('📖 Replacing translations with Kanzul Iman...\n');

  // 1. Fetch entire translation in one call
  console.log(`  Fetching ${SOURCE_URL} ...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching Kanzul Iman`);
  const data = await res.json();
  const surahsData = data?.data?.surahs;
  if (!Array.isArray(surahsData)) throw new Error('Unexpected API shape');

  // Flatten to rows
  const rows = [];
  for (const s of surahsData) {
    for (const a of s.ayahs || []) {
      const text = stripHtml(a.text);
      if (text) {
        rows.push({
          surah_number: s.number,
          ayah_number: a.numberInSurah,
          text,
        });
      }
    }
  }
  console.log(`  Fetched ${rows.length} ayahs across ${surahsData.length} surahs.\n`);

  // 2. Wipe existing translations
  console.log('  Deleting existing translations...');
  const before = await sql`SELECT COUNT(*)::int AS n FROM translation_entries`;
  await sql`DELETE FROM translations`; // cascades to translation_entries
  console.log(`  Deleted ${before[0].n} existing translation entries.\n`);

  // 3. Insert new translation record
  const inserted = await sql`
    INSERT INTO translations (name, author_name, language_code)
    VALUES (${NAME}, ${AUTHOR}, 'en')
    RETURNING id
  `;
  const translationId = inserted[0].id;
  console.log(`  Created translation: ${translationId}\n`);

  // 4. Bulk insert entries
  console.log('  Inserting Kanzul Iman entries...');
  const withId = rows.map((r) => ({ translation_id: translationId, ...r }));
  for (let i = 0; i < withId.length; i += 500) {
    const chunk = withId.slice(i, i + 500);
    await sql`
      INSERT INTO translation_entries ${sql(chunk, 'translation_id', 'surah_number', 'ayah_number', 'text')}
    `;
    process.stdout.write(`\r    ${Math.min(i + 500, withId.length)}/${withId.length}`);
  }
  console.log('\n');

  // 5. Verify
  const [{ n: finalCount }] = await sql`SELECT COUNT(*)::int AS n FROM translation_entries`;
  console.log(`✅ Done! ${finalCount} Kanzul Iman entries in database.`);
  await sql.end();
}

main().catch((err) => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
