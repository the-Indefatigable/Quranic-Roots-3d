/**
 * Populate surahs table from quran.com API
 *
 * Run: node scripts/populate-surahs.mjs
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

async function main() {
  console.log('🕌 Populating surahs table...\n');

  // Create table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS surahs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      number INTEGER UNIQUE NOT NULL,
      arabic_name TEXT NOT NULL,
      english_name TEXT NOT NULL,
      revelation_type TEXT,
      verses_count INTEGER NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Fetch from quran.com API
  console.log('  Fetching surah metadata from quran.com...');
  const res = await fetch('https://api.quran.com/api/v4/chapters?language=en');
  const data = await res.json();
  const chapters = data.chapters;

  let inserted = 0;
  let skipped = 0;

  for (const ch of chapters) {
    try {
      await sql`
        INSERT INTO surahs (number, arabic_name, english_name, revelation_type, verses_count)
        VALUES (${ch.id}, ${ch.name_arabic}, ${ch.name_simple}, ${ch.revelation_place}, ${ch.verses_count})
        ON CONFLICT (number) DO UPDATE SET
          arabic_name = EXCLUDED.arabic_name,
          english_name = EXCLUDED.english_name,
          revelation_type = EXCLUDED.revelation_type,
          verses_count = EXCLUDED.verses_count
      `;
      inserted++;
      process.stdout.write(`\r  Surahs: ${inserted}/114`);
    } catch (err) {
      skipped++;
      console.error(`\n  ⚠ Surah ${ch.id}: ${err.message}`);
    }
  }

  console.log(`\n\n✅ Done! ${inserted} surahs inserted, ${skipped} skipped.`);
  await sql.end();
}

main().catch((err) => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
