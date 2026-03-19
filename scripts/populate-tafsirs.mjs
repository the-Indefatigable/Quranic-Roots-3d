/**
 * Populate tafsir tables from quran.com API (Ibn Kathir Abridged)
 *
 * Run: node scripts/populate-tafsirs.mjs
 *
 * Fetches Ibn Kathir (resource_id=169) for all 114 surahs using bulk by-chapter endpoint.
 * Rate-limited: 600ms between requests.
 */
import postgres from 'postgres';
import fs from 'fs';

// Load .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
for (const line of envFile.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 2, connect_timeout: 30 });

const TAFSIR_RESOURCE_ID = 169;
const TAFSIR_NAME = 'Ibn Kathir (Abridged)';
const TAFSIR_AUTHOR = 'Hafiz Ibn Kathir';
const TAFSIR_SLUG = 'en-tafisr-ibn-kathir';
const RATE_LIMIT_MS = 600;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Strip HTML tags but keep paragraph structure
function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<h[1-6][^>]*>/gi, '\n\n### ')
    .replace(/<\/h[1-6]>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function fetchWithRetry(url, retries = 3) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        console.warn(`\n  Rate limited, waiting 5s...`);
        await sleep(5000);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (i === retries) throw err;
      console.warn(`\n  Retry ${i + 1}/${retries}: ${err.message}`);
      await sleep(2000 * (i + 1));
    }
  }
}

async function main() {
  console.log('Populating tafsir tables (Ibn Kathir Abridged)...\n');

  // Create tables
  await sql`
    CREATE TABLE IF NOT EXISTS tafsirs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      author_name TEXT,
      language_code TEXT DEFAULT 'en',
      resource_id INTEGER,
      slug TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS tafsir_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tafsir_id UUID NOT NULL REFERENCES tafsirs(id) ON DELETE CASCADE,
      surah_number INTEGER NOT NULL,
      ayah_number INTEGER NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(tafsir_id, surah_number, ayah_number)
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS tafsir_entries_surah_idx ON tafsir_entries (surah_number)`;

  // Upsert tafsir record
  let tafsirRows = await sql`
    SELECT id FROM tafsirs WHERE resource_id = ${TAFSIR_RESOURCE_ID}
  `;

  let tafsirId;
  if (tafsirRows.length > 0) {
    tafsirId = tafsirRows[0].id;
    console.log(`  Using existing tafsir record: ${tafsirId}`);
  } else {
    const inserted = await sql`
      INSERT INTO tafsirs (name, author_name, language_code, resource_id, slug)
      VALUES (${TAFSIR_NAME}, ${TAFSIR_AUTHOR}, 'en', ${TAFSIR_RESOURCE_ID}, ${TAFSIR_SLUG})
      RETURNING id
    `;
    tafsirId = inserted[0].id;
    console.log(`  Created tafsir record: ${tafsirId}`);
  }

  // Check how many entries we already have (for resume support)
  const [existing] = await sql`SELECT count(*) as c FROM tafsir_entries WHERE tafsir_id = ${tafsirId}`;
  const existingCount = parseInt(existing.c);
  if (existingCount > 0) {
    console.log(`  Found ${existingCount} existing entries — will skip completed surahs`);
  }

  let totalInserted = existingCount;
  let totalExpected = 6236;

  for (let surahNum = 1; surahNum <= 114; surahNum++) {
    // Check if surah already populated
    const [surahCount] = await sql`
      SELECT count(*) as c FROM tafsir_entries
      WHERE tafsir_id = ${tafsirId} AND surah_number = ${surahNum}
    `;
    if (parseInt(surahCount.c) > 0) {
      process.stdout.write(`\r  Surah ${surahNum}/114 — skipped (already populated)`);
      continue;
    }

    try {
      // Fetch all tafsir entries for this surah (paginated)
      let allEntries = [];
      let page = 1;

      while (true) {
        const data = await fetchWithRetry(
          `https://api.quran.com/api/v4/tafsirs/${TAFSIR_RESOURCE_ID}/by_chapter/${surahNum}?per_page=50&page=${page}`
        );

        const entries = data.tafsirs || [];
        allEntries = allEntries.concat(entries);

        if (!data.pagination || page >= data.pagination.total_pages) break;
        page++;
        await sleep(300);
      }

      // Batch insert
      const rows = allEntries.map((t) => {
        const [s, a] = t.verse_key.split(':');
        return {
          tafsir_id: tafsirId,
          surah_number: parseInt(s),
          ayah_number: parseInt(a),
          text: stripHtml(t.text),
        };
      }).filter(r => r.text);

      if (rows.length > 0) {
        // Insert in chunks of 50 (tafsir text can be large)
        for (let i = 0; i < rows.length; i += 50) {
          const chunk = rows.slice(i, i + 50);
          await sql`
            INSERT INTO tafsir_entries ${sql(chunk, 'tafsir_id', 'surah_number', 'ayah_number', 'text')}
            ON CONFLICT (tafsir_id, surah_number, ayah_number) DO UPDATE SET
              text = EXCLUDED.text
          `;
        }
        totalInserted += rows.length;
      }

      const pct = ((totalInserted / totalExpected) * 100).toFixed(1);
      process.stdout.write(`\r  Surah ${surahNum}/114 — ${totalInserted} entries (${pct}%)          `);

      await sleep(RATE_LIMIT_MS);
    } catch (err) {
      console.error(`\n  Surah ${surahNum} failed: ${err.message}`);
      await sleep(3000);
    }
  }

  // Final count
  const [finalCount] = await sql`SELECT count(*) as c FROM tafsir_entries WHERE tafsir_id = ${tafsirId}`;
  console.log(`\n\nDone! ${finalCount.c} tafsir entries in database.`);
  await sql.end();
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
