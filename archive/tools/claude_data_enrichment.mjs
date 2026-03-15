/**
 * Claude API Enrichment Script
 *
 * Phase 1: Fill Form I masdar for all existing roots
 * Phase 2: Validate skeleton roots + get meaning + which forms they take
 * Phase 3: Generate skeleton bab structure so generate_conjugations.py can fill them
 *
 * Saves progress after every batch — safe to re-run if interrupted.
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs';

const API_KEY = 'YOUR_ANTHROPIC_API_KEY';
const DATA_PATH = 'public/data/verbsData.json';
const BATCH_SIZE = 25;

const client = new Anthropic({ apiKey: API_KEY });

function normalize(str) {
  return str
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[آأإٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي');
}

function load() {
  return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}

function save(vd) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(vd, null, 2));
}

async function callClaude(prompt) {
  const res = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });
  return res.content[0].text.trim();
}

function extractJSON(text) {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Try to find JSON array/object within the text
    const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) return JSON.parse(match[1]);
    throw new Error('Could not parse JSON from: ' + text.slice(0, 200));
  }
}

// ── PHASE 1: Form I masdar ─────────────────────────────────────────────────────
async function phase1_formIMasdars() {
  console.log('\n═══ PHASE 1: Form I Masdars ═══');
  const vd = load();

  const targets = [];
  for (const root of vd.roots) {
    for (const bab of (root.babs || [])) {
      if (bab.form === 'I' && (bab.masdar === null || bab.masdar === undefined) && !bab.masdarDone) {
        targets.push({ rootId: root.id, root: root.root, meaning: root.meaning, babId: bab.id });
      }
    }
  }

  console.log(`Roots needing Form I masdar: ${targets.length}`);

  let done = 0;
  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    const prompt = `You are an Arabic morphology expert. For each Arabic verb root listed below (Form I / Bab I), provide the correct masdar (verbal noun / مصدر) with full diacritics (harakat).

Rules:
- Include full diacritics on the masdar
- If a root has multiple common masdars, list the most standard/primary one first in "masdar", put others in "alternatives" array
- For roots that don't commonly take Form I (rare), set masdar to null
- Return ONLY a valid JSON array, no other text

Format:
[{"root":"كتب","masdar":"كِتَابَة","alternatives":["كَتْب"]},...]

Roots to process:
${batch.map(t => `${t.root} (meaning: ${t.meaning || 'unknown'})`).join('\n')}`;

    try {
      const text = await callClaude(prompt);
      const results = extractJSON(text);

      // Re-load fresh copy before each write to avoid stale data
      const vd2 = load();
      let updated = 0;
      for (const result of results) {
        if (!result.root || result.masdar === undefined) continue;
        const norm = normalize(result.root);
        const root = vd2.roots.find(r => normalize(r.root) === norm || normalize(r.id) === norm);
        if (!root) continue;
        const bab = root.babs.find(b => b.form === 'I');
        if (!bab) continue;
        bab.masdar = result.masdar;
        bab.masdarAlternatives = result.alternatives || [];
        bab.masdarNeedsApi = false;
        bab.masdarDone = true;
        updated++;
      }
      save(vd2);
      done += batch.length;
      process.stdout.write(`  Phase 1: ${done}/${targets.length} (updated ${updated} in batch)\r`);
    } catch (err) {
      console.error(`\n  Batch ${i} error: ${err.message}`);
    }

    // Small delay to be kind to rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n  Phase 1 complete.`);
}

// ── PHASE 2: Validate skeleton roots + get meaning + forms ────────────────────
async function phase2_skeletonRoots() {
  console.log('\n═══ PHASE 2: Skeleton Roots ═══');
  const vd = load();

  const skeletons = vd.roots.filter(r => r.enriched === false && !r.validationDone);
  console.log(`Skeleton roots to validate: ${skeletons.length}`);

  let done = 0;
  for (let i = 0; i < skeletons.length; i += BATCH_SIZE) {
    const batch = skeletons.slice(i, i + BATCH_SIZE);

    const prompt = `You are an Arabic morphology expert. For each Arabic root below, determine:
1. Is it a valid verb root (can it form Arabic verbs)?
2. If yes: what is its primary English meaning as a verb (e.g. "to strike", "to know")?
3. Which verbal forms (baabs) does it commonly take? List from: I, II, III, IV, V, VI, VII, VIII, IX, X
4. For Form I (if applicable): what is the masdar with full diacritics?
5. For Form I (if applicable): what is the vowel pattern of the past tense 3ms (فَعَلَ / فَعِلَ / فَعُلَ)?

Return ONLY a valid JSON array, no other text.

Format:
[
  {"root":"غضب","isVerb":true,"meaning":"to be angry","forms":["I"],"formIMasdar":"غَضَب","formIVowel":"فَعِلَ"},
  {"root":"على","isVerb":false,"meaning":null,"forms":[],"formIMasdar":null,"formIVowel":null}
]

Roots to evaluate:
${batch.map(r => r.root).join('، ')}`;

    try {
      const text = await callClaude(prompt);
      const results = extractJSON(text);

      const vd2 = load();
      for (const result of results) {
        if (!result.root) continue;
        const norm = normalize(result.root);
        const root = vd2.roots.find(r => normalize(r.root) === norm || normalize(r.id) === norm);
        if (!root) continue;

        root.validationDone = true;

        if (!result.isVerb) {
          root.isVerb = false;
          root.meaning = result.meaning || root.meaning;
          continue;
        }

        root.isVerb = true;
        root.meaning = result.meaning || root.meaning;
        root.enriched = false; // still needs conjugation data

        // Build bab stubs for each confirmed form
        const BAB_COLORS = { I:'#4a9eff',II:'#f97316',III:'#a855f7',IV:'#22c55e',V:'#ec4899',VI:'#14b8a6',VII:'#f59e0b',VIII:'#64748b',IX:'#ef4444',X:'#8b5cf6' };
        const BAB_SEMANTICS = { I:'Base form',II:'Intensification / Causative',III:'Mutual Action',IV:'Causative / Transitive',V:'Reflexive of II',VI:'Mutual / Reciprocal',VII:'Passive / Reflexive',VIII:'Reflexive / Intentional',IX:'Colors / Defects',X:'Seeking / Deeming' };
        const TENSE_COLORS = { madi:'#ffd700',mudari:'#00d4ff',amr:'#ff6b6b',passive_madi:'#c084fc',passive_mudari:'#86efac' };

        const forms = result.forms || ['I'];
        root.babs = forms.map(form => {
          const babId = `${root.id}_${form}`;
          return {
            id: babId,
            form,
            arabicPattern: result.formIVowel && form === 'I' ? result.formIVowel : '',
            romanNumeral: form,
            meaning: BAB_SEMANTICS[form] || '',
            color: BAB_COLORS[form] || '#888',
            masdar: form === 'I' ? (result.formIMasdar || null) : null,
            masdarNeedsApi: form !== 'I',
            faaeil: null,
            faaeilNeedsApi: true,
            mafool: null,
            mafoolNeedsApi: true,
            tenses: ['madi','mudari','amr','passive_madi','passive_mudari'].map(type => ({
              id: `${babId}_${type}`,
              type,
              arabicName: { madi:'مَاضِي',mudari:'مُضَارِع',amr:'أَمْر',passive_madi:'مَاضِي مَجْهُول',passive_mudari:'مُضَارِع مَجْهُول' }[type],
              englishName: { madi:'Past (Māḍī)',mudari:'Present (Muḍāriʿ)',amr:'Imperative (Amr)',passive_madi:'Pass. Past',passive_mudari:'Pass. Present' }[type],
              color: TENSE_COLORS[type],
              occurrences: 0,
              references: [],
              conjugation: [],  // generate_conjugations.py fills this
            })),
          };
        });
      }
      save(vd2);
      done += batch.length;
      process.stdout.write(`  Phase 2: ${done}/${skeletons.length}\r`);
    } catch (err) {
      console.error(`\n  Batch ${i} error: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n  Phase 2 complete.`);
}

// ── PHASE 3: Derivations for enriched roots with weak letters ─────────────────
async function phase3_weakRootDerivations() {
  console.log('\n═══ PHASE 3: Fix Weak Root Derivations ═══');
  const vd = load();

  const targets = [];
  for (const root of vd.roots) {
    for (const bab of (root.babs || [])) {
      if ((bab.faaeilNeedsApi || bab.mafoolNeedsApi) && !bab.derivationDone && bab.form !== 'I') {
        targets.push({ rootId: root.id, root: root.root, meaning: root.meaning, form: bab.form, babId: bab.id });
      }
    }
  }

  console.log(`Babs needing derivation corrections: ${targets.length}`);

  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);

    const prompt = `You are an Arabic morphology expert. For each verb root and form below, provide the correct:
- masdar (verbal noun) with full diacritics
- faaeil (اسم فاعل / active participle) with full diacritics
- mafool (اسم مفعول / passive participle) with full diacritics (null if intransitive)

Return ONLY a valid JSON array, no other text.

Format:
[{"root":"قول","form":"II","masdar":"تَقْوِيل","faaeil":"مُقَوِّل","mafool":"مُقَوَّل"},...]

Babs to process:
${batch.map(t => `${t.root} Form ${t.form} (meaning: ${t.meaning || 'unknown'})`).join('\n')}`;

    try {
      const text = await callClaude(prompt);
      const results = extractJSON(text);

      const vd2 = load();
      for (const result of results) {
        if (!result.root) continue;
        const norm = normalize(result.root);
        const root = vd2.roots.find(r => normalize(r.root) === norm);
        if (!root) continue;
        const bab = root.babs.find(b => b.form === result.form);
        if (!bab) continue;
        if (result.masdar !== undefined) { bab.masdar = result.masdar; bab.masdarNeedsApi = false; }
        if (result.faaeil !== undefined) { bab.faaeil = result.faaeil; bab.faaeilNeedsApi = false; }
        if (result.mafool !== undefined) { bab.mafool = result.mafool; bab.mafoolNeedsApi = false; }
        bab.derivationDone = true;
      }
      save(vd2);
      process.stdout.write(`  Phase 3: ${Math.min(i + BATCH_SIZE, targets.length)}/${targets.length}\r`);
    } catch (err) {
      console.error(`\n  Batch ${i} error: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`\n  Phase 3 complete.`);
}

// ── Main ───────────────────────────────────────────────────────────────────────
const phase = process.argv[2] || 'all';

(async () => {
  console.log('Starting enrichment — phase:', phase);
  try {
    if (phase === '1' || phase === 'all') await phase1_formIMasdars();
    if (phase === '2' || phase === 'all') await phase2_skeletonRoots();
    if (phase === '3' || phase === 'all') await phase3_weakRootDerivations();
    console.log('\n✓ All phases done. Run: python3 generate_conjugations.py to fill conjugations for new roots.');
  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  }
})();
