/**
 * Single source of truth: data/verbsData.json (NOT in public/ — never served directly)
 *
 * This script generates:
 *   public/data/index.json          — lightweight index (no conjugations)
 *   public/data/roots/[id].json     — full per-root data loaded on demand
 *
 * Usage: node scripts/generate-data.mjs
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const SOURCE = join(ROOT, 'data/verbsData.json');
const INDEX_OUT = join(ROOT, 'public/data/index.json');
const ROOTS_DIR = join(ROOT, 'public/data/roots');

// ── Load source ──────────────────────────────────────────────────────────────
const data = JSON.parse(readFileSync(SOURCE, 'utf8'));
const roots = data.roots;
console.log(`Loaded ${roots.length} roots from verbsData.json`);

// ── Generate index.json (strip conjugation + per-tense references) ───────────
const indexRoots = roots.map(root => ({
  id: root.id,
  root: root.root,
  rootLetters: root.rootLetters,
  meaning: root.meaning,
  totalFreq: root.totalFreq,
  babs: (root.babs ?? []).map(bab => ({
    id: bab.id,
    form: bab.form,
    color: bab.color,
    arabicPattern: bab.arabicPattern,
    romanNumeral: bab.romanNumeral,
    meaning: bab.meaning,
    semanticMeaning: bab.semanticMeaning,
    verbMeaning: bab.verbMeaning,
    prepositions: bab.prepositions,
    masdar: bab.masdar,
    masdarAlternatives: bab.masdarAlternatives,
    faaeil: bab.faaeil,
    mafool: bab.mafool,
    // Tenses without conjugation data
    tenses: (bab.tenses ?? []).map(tense => ({
      id: tense.id,
      type: tense.type,
      arabicName: tense.arabicName,
      englishName: tense.englishName,
      color: tense.color,
      occurrences: tense.occurrences,
    })),
  })),
}));

writeFileSync(INDEX_OUT, JSON.stringify({ roots: indexRoots }, null, 0), 'utf8');
console.log(`✓ index.json written (${indexRoots.length} roots)`);

// ── Generate roots/[id].json ─────────────────────────────────────────────────
mkdirSync(ROOTS_DIR, { recursive: true });
let written = 0;

for (const root of roots) {
  const filename = `${encodeURIComponent(root.id)}.json`;
  const outPath = join(ROOTS_DIR, filename);
  writeFileSync(outPath, JSON.stringify(root, null, 0), 'utf8');
  written++;
}

console.log(`✓ ${written} root files written to public/data/roots/`);
console.log('\nDone. Edit verbsData.json then re-run this script.');
