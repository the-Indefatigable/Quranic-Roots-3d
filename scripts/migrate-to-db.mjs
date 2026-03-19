/**
 * Migration script: reads static JSON files and inserts into PostgreSQL.
 * Reconnects between phases to work around Railway's connection time limits.
 */
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:fksaqftYCfNRapsIoTUHopIpCKZNVGyC@shinkansen.proxy.rlwy.net:34283/railway';

function connect() {
  return postgres(DATABASE_URL, { max: 1, idle_timeout: 5, connect_timeout: 30 });
}

// Load all data upfront
const indexData = JSON.parse(fs.readFileSync('public/data/index.json', 'utf8'));
const rootsData = indexData.roots;
const nounsData = JSON.parse(fs.readFileSync('public/data/nounsData.json', 'utf8'));
const rootsDir = 'public/data/roots';
const detailMap = new Map();
for (const f of fs.readdirSync(rootsDir)) {
  try {
    const detail = JSON.parse(fs.readFileSync(path.join(rootsDir, f), 'utf8'));
    detailMap.set(detail.id, detail);
  } catch { /* skip */ }
}
console.log(`Data: ${rootsData.length} roots, ${nounsData.nouns.length} nouns, ${detailMap.size} details`);

const BATCH = 100; // Larger batches = fewer round trips

// ═══ PHASE 1: ROOTS ═══
async function insertRoots() {
  const sql = connect();
  console.log('\nPhase 1: Inserting roots...');
  const rootIdMap = new Map();

  for (let i = 0; i < rootsData.length; i += BATCH) {
    const batch = rootsData.slice(i, i + BATCH);
    const valParts = [];
    const params = [];
    for (let j = 0; j < batch.length; j++) {
      const root = batch[j];
      const detail = detailMap.get(root.id);
      const base = j * 5;
      valParts.push(`($${base+1}, $${base+2}::text[], $${base+3}, $${base+4}::int, $${base+5}::jsonb)`);
      params.push(root.root, root.rootLetters, root.meaning, root.totalFreq || 0,
        JSON.stringify(detail?.allReferences || []));
    }
    const res = await sql.unsafe(
      `INSERT INTO roots (root, root_letters, meaning, total_freq, all_references)
       VALUES ${valParts.join(', ')}
       ON CONFLICT (root) DO UPDATE SET meaning = EXCLUDED.meaning, total_freq = EXCLUDED.total_freq, all_references = EXCLUDED.all_references
       RETURNING id, root`,
      params
    );
    for (const row of res) rootIdMap.set(row.root, row.id);
    process.stdout.write(`  ${Math.min(i + BATCH, rootsData.length)}/${rootsData.length}\r`);
  }
  console.log(`  Done: ${rootIdMap.size} roots`);
  await sql.end();
  return rootIdMap;
}

// ═══ PHASE 2: FORMS ═══
async function insertForms(rootIdMap) {
  const sql = connect();
  console.log('\nPhase 2: Inserting forms...');
  const formIdMap = new Map();

  const allForms = [];
  for (const root of rootsData) {
    const detail = detailMap.get(root.id);
    const babs = detail?.babs || root.babs || [];
    const rootUuid = rootIdMap.get(root.root);
    if (!rootUuid) continue;
    for (let idx = 0; idx < babs.length; idx++)
      allForms.push({ rootUuid, rootStr: root.root, bab: babs[idx] });
  }

  for (let i = 0; i < allForms.length; i += BATCH) {
    const batch = allForms.slice(i, i + BATCH);
    const valParts = [];
    const params = [];
    for (let j = 0; j < batch.length; j++) {
      const { rootUuid, bab } = batch[j];
      const base = j * 11;
      valParts.push(`($${base+1}::uuid, $${base+2}, $${base+3}, $${base+4}, $${base+5}, $${base+6}, $${base+7}, $${base+8}::text[], $${base+9}, $${base+10}, $${base+11}::jsonb)`);
      params.push(rootUuid, bab.form, bab.arabicPattern,
        bab.meaning || null, bab.semanticMeaning || null, bab.verbMeaning || null,
        bab.masdar || null, bab.masdarAlternatives || null,
        bab.faaeil || null, bab.mafool || null, JSON.stringify(bab.prepositions || []));
    }
    const res = await sql.unsafe(
      `INSERT INTO forms (root_id, form_number, arabic_pattern, meaning, semantic_meaning, verb_meaning, masdar, masdar_alternatives, faaeil, mafool, prepositions)
       VALUES ${valParts.join(', ')}
       ON CONFLICT (root_id, form_number) DO UPDATE SET
         arabic_pattern = EXCLUDED.arabic_pattern, meaning = EXCLUDED.meaning,
         semantic_meaning = EXCLUDED.semantic_meaning, verb_meaning = EXCLUDED.verb_meaning,
         masdar = EXCLUDED.masdar, masdar_alternatives = EXCLUDED.masdar_alternatives,
         faaeil = EXCLUDED.faaeil, mafool = EXCLUDED.mafool, prepositions = EXCLUDED.prepositions
       RETURNING id, root_id, form_number`,
      params
    );
    // Map: the RETURNING order matches VALUES order for upserts
    for (let j = 0; j < res.length; j++) {
      const row = res[j];
      const rootStr = batch[j]?.rootStr;
      if (rootStr) formIdMap.set(`${rootStr}_${row.form_number}`, row.id);
    }
    process.stdout.write(`  ${Math.min(i + BATCH, allForms.length)}/${allForms.length}\r`);
  }
  console.log(`  Done: ${allForms.length} forms`);
  await sql.end();
  return formIdMap;
}

// ═══ PHASE 3: TENSES (in sub-batches with reconnect) ═══
async function insertTenses(formIdMap) {
  console.log('\nPhase 3: Inserting tenses...');
  const allTenses = [];
  for (const root of rootsData) {
    const detail = detailMap.get(root.id);
    const babs = detail?.babs || root.babs || [];
    for (const bab of babs) {
      const formUuid = formIdMap.get(`${root.root}_${bab.form}`);
      if (!formUuid) continue;
      for (const tense of (bab.tenses || []))
        allTenses.push({ formUuid, tense });
    }
  }

  // Insert in chunks, each with a fresh connection. Use COPY-like approach with
  // a single large query per chunk to minimize round trips.
  const CHUNK = 500;
  for (let c = 0; c < allTenses.length; c += CHUNK) {
    const sql = connect();
    const chunk = allTenses.slice(c, c + CHUNK);
    const valParts = [];
    const params = [];
    for (let j = 0; j < chunk.length; j++) {
      const { formUuid, tense } = chunk[j];
      const base = j * 7;
      valParts.push(`($${base+1}::uuid, $${base+2}, $${base+3}, $${base+4}, $${base+5}::int, $${base+6}::jsonb, $${base+7}::jsonb)`);
      params.push(formUuid, tense.type, tense.arabicName, tense.englishName,
        tense.occurrences || 0, JSON.stringify(tense.references || []),
        JSON.stringify(tense.conjugation || []));
    }
    await sql.unsafe(
      `INSERT INTO tenses (form_id, type, arabic_name, english_name, occurrences, "references", conjugations)
       VALUES ${valParts.join(', ')}
       ON CONFLICT (form_id, type) DO UPDATE SET
         arabic_name = EXCLUDED.arabic_name, english_name = EXCLUDED.english_name,
         occurrences = EXCLUDED.occurrences, "references" = EXCLUDED."references",
         conjugations = EXCLUDED.conjugations`,
      params
    );
    process.stdout.write(`  ${Math.min(c + CHUNK, allTenses.length)}/${allTenses.length}\r`);
    await sql.end();
    // Brief pause to avoid Railway connection rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`  Done: ${allTenses.length} tenses`);
}

// ═══ PHASE 4: NOUNS ═══
async function insertNouns(rootIdMap) {
  console.log('\nPhase 4: Inserting nouns...');
  { const sql = connect(); await sql`DELETE FROM nouns`; await sql.end(); }

  const CHUNK = 500;
  for (let i = 0; i < nounsData.nouns.length; i += CHUNK) {
    const sql = connect();
    const chunk = nounsData.nouns.slice(i, i + CHUNK);
    const valParts = [];
    const params = [];
    for (let j = 0; j < chunk.length; j++) {
      const noun = chunk[j];
      const base = j * 9;
      valParts.push(`($${base+1}::uuid, $${base+2}, $${base+3}, $${base+4}, $${base+5}, $${base+6}, $${base+7}, $${base+8}::int, $${base+9}::jsonb)`);
      params.push(rootIdMap.get(noun.root) || null, noun.lemma,
        noun.lemmaClean || noun.lemma, noun.type, noun.typeAr || null,
        noun.baab || null, noun.meaning || null,
        noun.references?.length || 0, JSON.stringify(noun.references || []));
    }
    await sql.unsafe(
      `INSERT INTO nouns (root_id, lemma, lemma_clean, type, type_ar, baab, meaning, total_freq, "references")
       VALUES ${valParts.join(', ')}`,
      params
    );
    process.stdout.write(`  ${Math.min(i + CHUNK, nounsData.nouns.length)}/${nounsData.nouns.length}\r`);
    await sql.end();
  }
  console.log(`  Done: ${nounsData.nouns.length} nouns`);
}

// ═══ VERIFY ═══
async function verify() {
  const sql = connect();
  const [counts] = await sql`
    SELECT (SELECT count(*) FROM roots) as roots,
           (SELECT count(*) FROM forms) as forms,
           (SELECT count(*) FROM tenses) as tenses,
           (SELECT count(*) FROM nouns) as nouns
  `;
  console.log('\n✓ Final counts:', counts);
  await sql.end();
}

async function main() {
  const rootIdMap = await insertRoots();
  const formIdMap = await insertForms(rootIdMap);
  await insertTenses(formIdMap);
  await insertNouns(rootIdMap);
  await verify();
  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); });
