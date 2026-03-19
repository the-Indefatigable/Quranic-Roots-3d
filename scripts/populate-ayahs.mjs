/**
 * Populate ayahs table from quran.com API (Uthmani text)
 *
 * Run: node scripts/populate-ayahs.mjs
 *
 * Fetches all 114 surahs, ~6,236 ayahs total.
 * Rate-limited: 500ms between surah requests.
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

const RATE_LIMIT_MS = 500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log('📖 Populating ayahs table...\n');

  // Create table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS ayahs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      surah_number INTEGER NOT NULL,
      ayah_number INTEGER NOT NULL,
      text_uthmani TEXT NOT NULL,
      text_simple TEXT,
      juz_number INTEGER,
      hizb_quarter INTEGER,
      page_number INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(surah_number, ayah_number)
    )
  `;

  // Get surah list for verse counts
  const surahs = await sql`SELECT number, verses_count FROM surahs ORDER BY number`;
  if (surahs.length === 0) {
    console.error('❌ No surahs found! Run populate-surahs.mjs first.');
    process.exit(1);
  }

  let totalInserted = 0;
  let totalAyahs = surahs.reduce((sum, s) => sum + s.verses_count, 0);

  for (const surah of surahs) {
    const surahNum = surah.number;

    try {
      // Fetch Uthmani text
      const uthmaniRes = await fetch(
        `https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahNum}`
      );
      const uthmaniData = await uthmaniRes.json();
      const verses = uthmaniData.verses || [];

      // Fetch simple text + metadata (juz, hizb, page)
      let simpleLookup = {};
      try {
        // Fetch in pages of 50
        let page = 1;
        let allVerses = [];
        while (true) {
          const metaRes = await fetch(
            `https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?language=en&per_page=50&page=${page}&fields=text_imlaei,verse_key`
          );
          const metaData = await metaRes.json();
          allVerses = allVerses.concat(metaData.verses || []);
          if (!metaData.pagination || page >= metaData.pagination.total_pages) break;
          page++;
          await sleep(200);
        }
        for (const v of allVerses) {
          const ayahNum = v.verse_number || parseInt(v.verse_key?.split(':')[1]);
          simpleLookup[ayahNum] = {
            textSimple: v.text_imlaei || null,
            juzNumber: v.juz_number || null,
            hizbQuarter: v.hizb_number || null,
            pageNumber: v.page_number || null,
          };
        }
      } catch (e) {
        // Non-critical — continue without simple text
      }

      // Batch insert
      const rows = verses.map((v) => {
        const ayahNum = parseInt(v.verse_key.split(':')[1]);
        const meta = simpleLookup[ayahNum] || {};
        return {
          surah_number: surahNum,
          ayah_number: ayahNum,
          text_uthmani: v.text_uthmani,
          text_simple: meta.textSimple || null,
          juz_number: meta.juzNumber || null,
          hizb_quarter: meta.hizbQuarter || null,
          page_number: meta.pageNumber || null,
        };
      });

      if (rows.length > 0) {
        // Batch in chunks of 100
        for (let i = 0; i < rows.length; i += 100) {
          const chunk = rows.slice(i, i + 100);
          await sql`
            INSERT INTO ayahs ${sql(chunk, 'surah_number', 'ayah_number', 'text_uthmani', 'text_simple', 'juz_number', 'hizb_quarter', 'page_number')}
            ON CONFLICT (surah_number, ayah_number) DO UPDATE SET
              text_uthmani = EXCLUDED.text_uthmani,
              text_simple = EXCLUDED.text_simple,
              juz_number = EXCLUDED.juz_number,
              hizb_quarter = EXCLUDED.hizb_quarter,
              page_number = EXCLUDED.page_number
          `;
        }
        totalInserted += rows.length;
      }

      const pct = ((totalInserted / totalAyahs) * 100).toFixed(1);
      process.stdout.write(`\r  Surah ${surahNum}/114 — ${totalInserted}/${totalAyahs} ayahs (${pct}%)`);

      await sleep(RATE_LIMIT_MS);
    } catch (err) {
      console.error(`\n  ⚠ Surah ${surahNum} failed: ${err.message}`);
      await sleep(2000); // longer pause on error
    }
  }

  console.log(`\n\n✅ Done! ${totalInserted} ayahs inserted.`);
  await sql.end();
}

main().catch((err) => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
