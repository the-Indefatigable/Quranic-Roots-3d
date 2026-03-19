/**
 * Backfill root_arabic on quran_words using verbsData.json references
 *
 * Two-phase approach to handle Railway connection limits:
 * Phase 1: Fetch ALL words from DB in one query, do matching in memory
 * Phase 2: Write updates in single bulk SQL per batch
 *
 * Run: node scripts/backfill-word-roots.mjs
 */
import fs from 'fs';
import postgres from 'postgres';

const envFile = fs.readFileSync('.env.local', 'utf8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim();
}

const DB_URL = process.env.DATABASE_URL;

// Strip Arabic diacritics (tashkeel) and non-letter marks
function stripDiacritics(text) {
  return text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g, '');
}

// Normalize Arabic letters (alef variants, teh marbuta, etc.)
function normalizeArabic(text) {
  return text
    .replace(/[إأآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

function getConsonants(word) {
  const stripped = stripDiacritics(word);
  const normalized = normalizeArabic(stripped);
  return normalized.replace(/[^\u0621-\u064A]/g, '');
}

function wordMatchesRoot(word, rootLetters) {
  const consonants = getConsonants(word);
  const normalizedRoot = rootLetters.map(l => normalizeArabic(l));
  let pos = 0;
  for (const letter of normalizedRoot) {
    const found = consonants.indexOf(letter, pos);
    if (found === -1) return false;
    pos = found + 1;
  }
  return true;
}

async function main() {
  console.log('🔗 Backfilling word roots from verbsData.json...\n');

  // ── Load reference data ──
  const verbsData = JSON.parse(fs.readFileSync('data/verbsData.json', 'utf8'));
  const roots = verbsData.roots;
  console.log(`  Loaded ${roots.length} roots from verbsData.json`);

  let nounRefs = new Map();
  try {
    const nounsData = JSON.parse(fs.readFileSync('data/nounsData.json', 'utf8'));
    const nouns = nounsData.nouns || nounsData;
    if (Array.isArray(nouns)) {
      for (const noun of nouns) {
        if (noun.root && noun.references) {
          for (const ref of noun.references) {
            if (!nounRefs.has(ref)) nounRefs.set(ref, new Set());
            nounRefs.get(ref).add(noun.root);
          }
        }
      }
      console.log(`  Loaded noun references for ${nounRefs.size} ayahs`);
    }
  } catch (e) {
    console.log('  No nounsData.json found, skipping noun roots');
  }

  // Build map: "surah:ayah" -> [{ rootSpaced, rootLetters }]
  const ayahRootMap = new Map();
  for (const root of roots) {
    if (!root.allReferences || !root.rootLetters) continue;
    const rootLetters = root.rootLetters;
    const rootSpaced = rootLetters.join(' ');
    for (const ref of root.allReferences) {
      if (!ayahRootMap.has(ref)) ayahRootMap.set(ref, []);
      ayahRootMap.get(ref).push({ rootSpaced, rootLetters });
    }
  }
  console.log(`  Built reference map: ${ayahRootMap.size} unique ayahs have root data\n`);

  // ── Phase 1: Fetch ALL words in one go ──
  console.log('  Phase 1: Fetching all words from DB (single query)...');
  let allWords;
  {
    const sql = postgres(DB_URL, { prepare: false, max: 1, connect_timeout: 30 });
    try {
      allWords = await sql`
        SELECT id, surah_number, ayah_number, text_uthmani, root_arabic
        FROM quran_words
        WHERE char_type = 'word'
        ORDER BY surah_number, ayah_number, position
      `;
      console.log(`  Fetched ${allWords.length} words\n`);
    } finally {
      await sql.end({ timeout: 5 }).catch(() => {});
    }
  }

  // ── Phase 2: Match roots in memory ──
  console.log('  Phase 2: Matching words to roots (in memory)...');
  const updates = []; // { id, rootArabic }
  let alreadyHad = 0;

  // Group by ayah for matching
  const wordsByAyah = new Map();
  for (const w of allWords) {
    const key = `${w.surah_number}:${w.ayah_number}`;
    if (!wordsByAyah.has(key)) wordsByAyah.set(key, []);
    wordsByAyah.get(key).push(w);
  }

  for (const [ayahKey, ayahWords] of wordsByAyah) {
    const possibleRoots = ayahRootMap.get(ayahKey) || [];

    for (const word of ayahWords) {
      if (word.root_arabic) {
        alreadyHad++;
        continue;
      }

      let bestMatch = null;

      // Check verb roots
      for (const { rootSpaced, rootLetters } of possibleRoots) {
        if (wordMatchesRoot(word.text_uthmani, rootLetters)) {
          bestMatch = rootSpaced;
          break;
        }
      }

      // Check noun roots if no verb match
      if (!bestMatch && nounRefs.has(ayahKey)) {
        for (const nounRoot of nounRefs.get(ayahKey)) {
          const letters = nounRoot.includes(' ')
            ? nounRoot.split(' ')
            : [...stripDiacritics(nounRoot)].filter(c => c.match(/[\u0621-\u064A]/));
          if (letters.length >= 2 && wordMatchesRoot(word.text_uthmani, letters)) {
            bestMatch = letters.join(' ');
            break;
          }
        }
      }

      if (bestMatch) {
        updates.push({ id: word.id, rootArabic: bestMatch });
      }
    }
  }

  console.log(`  ${alreadyHad} words already had roots`);
  console.log(`  ${updates.length} new words matched to roots\n`);

  if (updates.length === 0) {
    console.log('✅ Nothing to update!');
    return;
  }

  // ── Phase 3: Write updates in bulk batches ──
  // Use UPDATE FROM (VALUES ...) to update many rows in one query
  console.log('  Phase 3: Writing updates to DB in bulk batches...');
  const BATCH_SIZE = 500;
  let written = 0;

  for (let i = 0; i < updates.length; i += BATCH_SIZE) {
    const batch = updates.slice(i, i + BATCH_SIZE);

    // Build VALUES clause: ('id1', 'root1'), ('id2', 'root2'), ...
    const values = batch.map(u =>
      `('${u.id.replace(/'/g, "''")}', '${u.rootArabic.replace(/'/g, "''")}')`
    ).join(',\n');

    const updateSQL = `
      UPDATE quran_words AS w
      SET root_arabic = v.root
      FROM (VALUES ${values}) AS v(id, root)
      WHERE w.id = v.id::uuid
    `;

    // Fresh connection per batch
    const sql = postgres(DB_URL, { prepare: false, max: 1, connect_timeout: 30 });
    let attempt = 0;
    while (attempt < 3) {
      attempt++;
      try {
        await sql.unsafe(updateSQL);
        written += batch.length;
        break;
      } catch (err) {
        if (attempt < 3) {
          console.log(`\n  ⚠ Batch ${Math.floor(i/BATCH_SIZE)+1} attempt ${attempt} failed (${err.code || 'unknown'}), retrying in ${attempt * 3}s...`);
          await new Promise(r => setTimeout(r, attempt * 3000));
        } else {
          console.log(`\n  ❌ Batch ${Math.floor(i/BATCH_SIZE)+1} failed after 3 attempts, skipping ${batch.length} updates`);
        }
      }
    }
    await sql.end({ timeout: 5 }).catch(() => {});

    const pct = ((Math.min(i + BATCH_SIZE, updates.length) / updates.length) * 100).toFixed(1);
    process.stdout.write(`\r  Written ${written}/${updates.length} (${pct}%)      `);

    // Small pause between batches
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n\n✅ Done! Updated ${written} words with root data.`);

  // Final stats
  const sql = postgres(DB_URL, { prepare: false, max: 1, connect_timeout: 30 });
  try {
    const stats = await sql`
      SELECT COUNT(*) as total, COUNT(root_arabic) as with_root
      FROM quran_words WHERE char_type = 'word'
    `;
    const pct = ((stats[0].with_root / stats[0].total) * 100).toFixed(1);
    console.log(`  📊 ${stats[0].with_root}/${stats[0].total} words have roots (${pct}%)`);
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {});
  }
}

main().catch((err) => {
  console.error('❌ Fatal:', err);
  process.exit(1);
});
