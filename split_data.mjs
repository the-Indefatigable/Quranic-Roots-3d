/**
 * Splits verbsData.json into:
 *   public/data/index.json          — lightweight root metadata (~50-100KB)
 *   public/data/roots/{encoded}.json — full conjugation detail per root
 *
 * Index includes everything except tenses[].conjugation and tenses[].references
 * (those are heavy and only needed in TreeView/Quiz).
 */

import fs from 'fs';
import path from 'path';

const SRC  = 'public/data/verbsData.json';
const ROOTS_DIR = 'public/data/roots';
const INDEX_OUT = 'public/data/index.json';

console.log('Reading verbsData.json…');
const vd = JSON.parse(fs.readFileSync(SRC, 'utf8'));

if (!fs.existsSync(ROOTS_DIR)) fs.mkdirSync(ROOTS_DIR, { recursive: true });

const indexRoots = [];

let written = 0;
for (const root of vd.roots) {
  indexRoots.push({
    id:          root.id,
    root:        root.root,
    rootLetters: root.rootLetters,
    meaning:     root.meaning,
    totalFreq:   root.totalFreq,
    isVerb:      root.isVerb,
    // babs include all metadata EXCEPT conjugation[] and references[] (those are in detail files)
    babs: (root.babs || []).map(b => ({
      id:              b.id,
      form:            b.form,
      color:           b.color,
      arabicPattern:   b.arabicPattern,
      romanNumeral:    b.romanNumeral,
      meaning:         b.meaning,
      semanticMeaning: b.semanticMeaning,
      verbMeaning:     b.verbMeaning,
      prepositions:    b.prepositions,
      masdar:          b.masdar,
      masdarAlternatives: b.masdarAlternatives,
      faaeil:          b.faaeil,
      mafool:          b.mafool,
      // tenses: metadata only, NO conjugation[], NO references[]
      tenses: (b.tenses || []).map(t => ({
        id:          t.id,
        type:        t.type,
        arabicName:  t.arabicName,
        englishName: t.englishName,
        color:       t.color,
        occurrences: t.occurrences,
      })),
    })),
  });

  // ── Detail file: full data for this root ──────────────────────────────────
  const filename = encodeURIComponent(root.id) + '.json';
  fs.writeFileSync(
    path.join(ROOTS_DIR, filename),
    JSON.stringify(root)   // compact, no indentation — saves ~30% space
  );
  written++;
  if (written % 200 === 0) process.stdout.write(`  ${written}/${vd.roots.length}\r`);
}

// Write index — compact to keep it small
fs.writeFileSync(INDEX_OUT, JSON.stringify({ roots: indexRoots }));

const indexSize  = (fs.statSync(INDEX_OUT).size / 1024).toFixed(1);
const sampleFile = path.join(ROOTS_DIR, encodeURIComponent(vd.roots[0].id) + '.json');
const sampleSize = (fs.statSync(sampleFile).size / 1024).toFixed(1);
const totalRootKB = vd.roots.reduce((s, r) => {
  const f = path.join(ROOTS_DIR, encodeURIComponent(r.id) + '.json');
  return s + fs.statSync(f).size;
}, 0);

console.log(`\nDone. ${written} root files written.`);
console.log(`  index.json:          ${indexSize} KB`);
console.log(`  avg per-root file:   ${(totalRootKB / written / 1024).toFixed(1)} KB`);
console.log(`  total roots dir:     ${(totalRootKB / 1024 / 1024).toFixed(1)} MB`);
console.log(`  (index is ${((fs.statSync(INDEX_OUT).size / fs.statSync(SRC).size) * 100).toFixed(1)}% of original file size)`);
