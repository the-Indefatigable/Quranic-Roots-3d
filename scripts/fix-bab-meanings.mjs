import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../src/data/verbsData.json');
const API_KEY = process.argv[2] || process.env.ANTHROPIC_API_KEY;

if (!API_KEY) { console.error('Usage: node fix-bab-meanings.mjs <api-key>'); process.exit(1); }

const client = new Anthropic({ apiKey: API_KEY });
const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));

// Flatten all root+bab pairs
const pairs = [];
data.roots.forEach(root => {
  root.babs.forEach(bab => {
    // Get first valid Arabic conjugation
    let sampleArabic = '-';
    for (const tense of bab.tenses || []) {
      const c = tense.conjugation?.find(c => c.arabic && c.arabic !== '-' && !c.arabic.includes('_') && !c.arabic.includes('#'));
      if (c) { sampleArabic = c.arabic; break; }
    }
    pairs.push({ rootId: root.id, rootArabic: root.root, rootMeaning: root.meaning, babId: bab.id, form: bab.romanNumeral, sampleArabic });
  });
});

const BATCH = 50;
const total = pairs.length;
let done = 0, low = [];

async function fixBatch(batch) {
  const prompt = `You are an expert in Classical Arabic and Quranic linguistics.
For each Arabic verb root + form combination, give the specific English meaning for THAT form of THAT root as used in the Quran.

Rules:
- Use "to X" infinitive form
- Be specific to this root+form (not generic like "causative" or "base form")
- Form II = intensive/causative of root, Form IV = causative, Form V = reflexive of II, Form VIII = reflexive, Form X = to seek/consider
- 2-6 words max
- Confidence: "high" or "medium"

${batch.map((p, i) => `${i+1}. root=${p.rootArabic} (${p.rootMeaning}) | Form ${p.form} | sample: ${p.sampleArabic}`).join('\n')}

Respond ONLY with a JSON array in same order:
[{"id":"babId","verbMeaning":"to X","confidence":"high|medium"}, ...]

Use these babIds: ${batch.map(p => p.babId).join(', ')}`;

  const res = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const match = res.content[0].text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('No JSON in response');
  return JSON.parse(match[0]);
}

// Build lookup map for quick bab access
const babMap = new Map();
data.roots.forEach(root => root.babs.forEach(bab => babMap.set(bab.id, bab)));

for (let i = 0; i < total; i += BATCH) {
  const batch = pairs.slice(i, i + BATCH);
  const batchNum = Math.floor(i / BATCH) + 1;
  const totalBatches = Math.ceil(total / BATCH);
  process.stdout.write(`[${batchNum}/${totalBatches}] `);

  try {
    const results = await fixBatch(batch);
    results.forEach(r => {
      const bab = babMap.get(r.id);
      if (bab) {
        bab.verbMeaning = r.verbMeaning;
        done++;
        if (r.confidence !== 'high') low.push({ id: r.id, verbMeaning: r.verbMeaning });
      }
    });
    process.stdout.write(`✓ ${results.length}\n`);
  } catch (e) {
    process.stdout.write(`✗ ${e.message.slice(0, 40)}\n`);
  }

  if (i + BATCH < total) await new Promise(r => setTimeout(r, 300));
}

writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
console.log(`\nDone: ${done}/${total} babs updated, ${low.length} medium-confidence flagged.`);
if (low.length) {
  writeFileSync(join(__dirname, 'bab-meanings-review.json'), JSON.stringify(low, null, 2));
  console.log('Review list → scripts/bab-meanings-review.json');
}
