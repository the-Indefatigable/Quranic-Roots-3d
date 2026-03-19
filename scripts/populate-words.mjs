/**
 * Populate quran_words table from quran.com API (word-by-word data)
 *
 * Run: node scripts/populate-words.mjs
 *
 * Fetches all ~77,000 words across 6,236 ayahs.
 * Rate-limited: 400ms between surah requests.
 * Estimated time: ~10-15 minutes.
 */
import fs from 'fs';
import postgres from 'postgres';

// Load .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 2 });

const RATE_LIMIT_MS = 400;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log('📝 Populating quran_words table...\n');

  // Create table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS quran_words (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      surah_number INTEGER NOT NULL,
      ayah_number INTEGER NOT NULL,
      position INTEGER NOT NULL,
      text_uthmani TEXT NOT NULL,
      text_simple TEXT,
      transliteration TEXT,
      translation TEXT,
      root_arabic TEXT,
      char_type TEXT DEFAULT 'word',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(surah_number, ayah_number, position)
    )
  `;

  // Get surah list
  const surahs = await sql`SELECT number, verses_count FROM surahs ORDER BY number`;
  if (surahs.length === 0) {
    console.error('❌ No surahs found! Run populate-surahs.mjs first.');
    process.exit(1);
  }

  // Check how many words already exist (for resuming)
  const existingCount = await sql`SELECT COUNT(*) as count FROM quran_words`;
  if (existingCount[0].count > 0) {
    console.log(`  Found ${existingCount[0].count} existing words. Will skip already-populated ayahs.\n`);
  }

  let totalInserted = 0;
  let totalSkipped = 0;
  const totalAyahs = surahs.reduce((sum, s) => sum + s.verses_count, 0);
  let ayahsProcessed = 0;

  for (const surah of surahs) {
    const surahNum = surah.number;

    // Check if surah already populated
    const existing = await sql`
      SELECT COUNT(DISTINCT ayah_number) as count FROM quran_words WHERE surah_number = ${surahNum}
    `;
    if (existing[0].count >= surah.verses_count) {
      ayahsProcessed += surah.verses_count;
      totalSkipped += surah.verses_count;
      const pct = ((ayahsProcessed / totalAyahs) * 100).toFixed(1);
      process.stdout.write(`\r  Surah ${surahNum}/114 — skipped (already done) — ${pct}%`);
      continue;
    }

    try {
      // Fetch verses with word data — paginate through
      let page = 1;
      let allVerses = [];

      while (true) {
        const url = `https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?language=en&words=true&word_fields=text_uthmani,text_indopak&per_page=50&page=${page}`;
        const res = await fetch(url);

        if (!res.ok) {
          console.error(`\n  ⚠ HTTP ${res.status} for surah ${surahNum} page ${page}`);
          break;
        }

        const data = await res.json();
        allVerses = allVerses.concat(data.verses || []);

        if (!data.pagination || page >= data.pagination.total_pages) break;
        page++;
        await sleep(200);
      }

      // Process all verses and extract words
      const rows = [];
      for (const verse of allVerses) {
        const [s, a] = verse.verse_key.split(':').map(Number);
        const words = verse.words || [];

        for (const word of words) {
          // Build root string in spaced format to match our roots table
          let rootArabic = null;
          if (word.root && word.root.arabic) {
            // API sometimes gives root as object
            rootArabic = word.root.arabic;
          }

          // Try to extract transliteration and translation
          const transliteration = word.transliteration?.text || null;
          const translation = word.translation?.text || null;
          const charType = word.char_type_name || 'word';

          // Only store actual words and end markers
          if (charType === 'word' || charType === 'end') {
            rows.push({
              surah_number: s,
              ayah_number: a,
              position: word.position,
              text_uthmani: word.text_uthmani || word.text || '',
              text_simple: word.text_indopak || null,
              transliteration,
              translation,
              root_arabic: rootArabic,
              char_type: charType,
            });
          }
        }
      }

      // Batch insert in chunks of 200
      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i += 200) {
          const chunk = rows.slice(i, i + 200);
          await sql`
            INSERT INTO quran_words ${sql(chunk, 'surah_number', 'ayah_number', 'position', 'text_uthmani', 'text_simple', 'transliteration', 'translation', 'root_arabic', 'char_type')}
            ON CONFLICT (surah_number, ayah_number, position) DO UPDATE SET
              text_uthmani = EXCLUDED.text_uthmani,
              transliteration = EXCLUDED.transliteration,
              translation = EXCLUDED.translation,
              root_arabic = EXCLUDED.root_arabic,
              char_type = EXCLUDED.char_type
          `;
        }
        totalInserted += rows.length;
      }

      ayahsProcessed += surah.verses_count;
      const pct = ((ayahsProcessed / totalAyahs) * 100).toFixed(1);
      process.stdout.write(`\r  Surah ${surahNum}/114 — ${totalInserted} words — ${pct}%      `);

      await sleep(RATE_LIMIT_MS);
    } catch (err) {
      console.error(`\n  ⚠ Surah ${surahNum} failed: ${err.message}`);
      ayahsProcessed += surah.verses_count;
      await sleep(2000);
    }
  }

  console.log(`\n\n✅ Done! ${totalInserted} words inserted, ${totalSkipped} ayahs skipped (already existed).`);

  // Quick stats
  const stats = await sql`
    SELECT
      COUNT(*) as total_words,
      COUNT(DISTINCT (surah_number, ayah_number)) as total_ayahs,
      COUNT(root_arabic) as words_with_roots
    FROM quran_words
    WHERE char_type = 'word'
  `;
  console.log(`\n  📊 Stats: ${stats[0].total_words} words across ${stats[0].total_ayahs} ayahs, ${stats[0].words_with_roots} have root data`);

  await sql.end();
}

main().catch((err) => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
