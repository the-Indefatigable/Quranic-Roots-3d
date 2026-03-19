/**
 * Populate translations table from quran.com API (Sahih International)
 *
 * Run: node scripts/populate-translations.mjs
 *
 * Fetches Sahih International (resource_id=131) for all 6,236 ayahs.
 * Rate-limited: 500ms between requests.
 */
import postgres from 'postgres';
import fs from 'fs';

// Load .env.local manually (no dotenv dependency)
const envFile = fs.readFileSync('.env.local', 'utf8');
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 2 });

const TRANSLATION_RESOURCE_ID = 20; // Saheeh International
const TRANSLATION_NAME = 'Saheeh International';
const TRANSLATION_AUTHOR = 'Saheeh International';
const RATE_LIMIT_MS = 500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Strip HTML tags from translation text
function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim() || '';
}

async function main() {
  console.log('📝 Populating translations table (Sahih International)...\n');

  // Create tables if not exist
  await sql`
    CREATE TABLE IF NOT EXISTS translations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      author_name TEXT,
      language_code TEXT DEFAULT 'en',
      resource_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS translation_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      translation_id UUID NOT NULL REFERENCES translations(id) ON DELETE CASCADE,
      surah_number INTEGER NOT NULL,
      ayah_number INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(translation_id, surah_number, ayah_number)
    )
  `;

  // Upsert translation record
  let translationRows = await sql`
    SELECT id FROM translations WHERE resource_id = ${TRANSLATION_RESOURCE_ID}
  `;

  let translationId;
  if (translationRows.length > 0) {
    translationId = translationRows[0].id;
    console.log(`  Using existing translation record: ${translationId}`);
  } else {
    const inserted = await sql`
      INSERT INTO translations (name, author_name, language_code, resource_id)
      VALUES (${TRANSLATION_NAME}, ${TRANSLATION_AUTHOR}, 'en', ${TRANSLATION_RESOURCE_ID})
      RETURNING id
    `;
    translationId = inserted[0].id;
    console.log(`  Created translation record: ${translationId}`);
  }

  // Get surah list
  const surahs = await sql`SELECT number, verses_count FROM surahs ORDER BY number`;
  if (surahs.length === 0) {
    console.error('❌ No surahs found! Run populate-surahs.mjs first.');
    process.exit(1);
  }

  let totalInserted = 0;
  const totalAyahs = surahs.reduce((sum, s) => sum + s.verses_count, 0);

  for (const surah of surahs) {
    const surahNum = surah.number;

    try {
      // Fetch all translations for this surah (paginated)
      let allTranslations = [];
      let page = 1;

      while (true) {
        const res = await fetch(
          `https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?language=en&translations=${TRANSLATION_RESOURCE_ID}&per_page=50&page=${page}`
        );

        if (!res.ok) {
          console.error(`\n  ⚠ HTTP ${res.status} for surah ${surahNum} page ${page}`);
          break;
        }

        const data = await res.json();
        const verses = data.verses || [];
        allTranslations = allTranslations.concat(verses);

        if (!data.pagination || page >= data.pagination.total_pages) break;
        page++;
        await sleep(200);
      }

      // Batch insert
      const rows = allTranslations.map((v) => {
        const [s, a] = v.verse_key.split(':');
        const text = v.translations?.[0]?.text || '';
        return {
          translation_id: translationId,
          surah_number: parseInt(s),
          ayah_number: parseInt(a),
          text: stripHtml(text),
        };
      }).filter(r => r.text);

      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i += 100) {
          const chunk = rows.slice(i, i + 100);
          await sql`
            INSERT INTO translation_entries ${sql(chunk, 'translation_id', 'surah_number', 'ayah_number', 'text')}
            ON CONFLICT (translation_id, surah_number, ayah_number) DO UPDATE SET
              text = EXCLUDED.text
          `;
        }
        totalInserted += rows.length;
      }

      const pct = ((totalInserted / totalAyahs) * 100).toFixed(1);
      process.stdout.write(`\r  Surah ${surahNum}/114 — ${totalInserted}/${totalAyahs} translations (${pct}%)`);

      await sleep(RATE_LIMIT_MS);
    } catch (err) {
      console.error(`\n  ⚠ Surah ${surahNum} failed: ${err.message}`);
      await sleep(2000);
    }
  }

  console.log(`\n\n✅ Done! ${totalInserted} translation entries inserted.`);
  await sql.end();
}

main().catch((err) => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
