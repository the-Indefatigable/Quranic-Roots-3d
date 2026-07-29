/**
 * Seed roots / forms / tenses from archive/verbs_raw.json.
 *
 * The production roots data is built from the Quranic morphology corpus, which
 * isn't distributed with the repo. archive/verbs_raw.json carries the verb
 * subset (943 roots with their forms, tenses and full conjugation tables) and
 * is enough to bring up a local instance with real content — used for the
 * marketing screenshots so they don't depend on hitting production.
 *
 * Nouns and particles are NOT covered; those need the corpus file.
 *
 * Run: DATABASE_URL=... node scripts/seed-roots-from-archive.mjs
 */
import postgres from 'postgres';
import fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL required');
  process.exit(1);
}
if (/quroots\.com|neon\.tech|supabase|amazonaws/.test(DATABASE_URL)) {
  console.error('ERROR: refusing to run against what looks like a remote database');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 4 });

const TENSE_SORT = { madi: 0, mudari: 1, amr: 2, majhul: 3, nahi: 4 };

async function main() {
  const raw = JSON.parse(fs.readFileSync('archive/verbs_raw.json', 'utf8'));
  const roots = raw.roots;
  console.log(`Seeding ${roots.length} roots from archive/verbs_raw.json\n`);

  await sql`DELETE FROM tenses`;
  await sql`DELETE FROM forms`;
  await sql`DELETE FROM roots`;

  let nRoots = 0, nForms = 0, nTenses = 0;

  for (const r of roots) {
    const babs = r.babs ?? [];

    // Root frequency is the sum of every tense occurrence beneath it, and its
    // reference list is the union of those tenses' references.
    let totalFreq = 0;
    const refs = new Set();
    for (const bab of babs) {
      for (const t of bab.tenses ?? []) {
        totalFreq += t.occurrences ?? 0;
        for (const ref of t.references ?? []) refs.add(ref);
      }
    }

    const letters = r.rootLetters?.length ? r.rootLetters : Array.from(r.root ?? '');
    if (!r.root || !r.meaning) continue;

    const [row] = await sql`
      INSERT INTO roots (root, root_letters, meaning, total_freq, all_references)
      VALUES (${r.root}, ${letters}, ${r.meaning}, ${totalFreq},
              ${JSON.stringify([...refs])}::jsonb)
      ON CONFLICT (root) DO UPDATE SET meaning = EXCLUDED.meaning
      RETURNING id
    `;
    nRoots++;

    for (let i = 0; i < babs.length; i++) {
      const bab = babs[i];
      const [form] = await sql`
        INSERT INTO forms (root_id, form_number, arabic_pattern, meaning, sort_order)
        VALUES (${row.id}, ${bab.form ?? bab.romanNumeral ?? String(i + 1)},
                ${bab.arabicPattern ?? ''}, ${bab.meaning ?? null}, ${i})
        ON CONFLICT (root_id, form_number) DO UPDATE SET arabic_pattern = EXCLUDED.arabic_pattern
        RETURNING id
      `;
      nForms++;

      const seen = new Set();
      for (const t of bab.tenses ?? []) {
        if (!t.type || seen.has(t.type)) continue; // schema is unique on (form, type)
        seen.add(t.type);
        await sql`
          INSERT INTO tenses (form_id, type, arabic_name, english_name, occurrences,
                              "references", conjugations)
          VALUES (${form.id}, ${t.type}, ${t.arabicName ?? t.type}, ${t.englishName ?? t.type},
                  ${t.occurrences ?? 0}, ${JSON.stringify(t.references ?? [])}::jsonb,
                  ${JSON.stringify(t.conjugation ?? [])}::jsonb)
          ON CONFLICT (form_id, type) DO NOTHING
        `;
        nTenses++;
      }
    }

    if (nRoots % 100 === 0) process.stdout.write(`  ${nRoots}/${roots.length}\r`);
  }

  console.log(`\n\n  roots   ${nRoots}`);
  console.log(`  forms   ${nForms}`);
  console.log(`  tenses  ${nTenses}`);
  await sql.end();
}

main().catch(async (e) => {
  console.error(e);
  await sql.end();
  process.exit(1);
});
