import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_PATH = join(__dirname, '../src/data/verbsData.json');

const API_KEY = process.argv[2] || process.env.ANTHROPIC_API_KEY;
if (!API_KEY) { console.error('Usage: node fix-meanings.mjs <api-key>'); process.exit(1); }
const client = new Anthropic({ apiKey: API_KEY });

const data = JSON.parse(readFileSync(DATA_PATH, 'utf8'));
const roots = data.roots;

// Get sample conjugation for a root (first available arabic form that isn't '-')
function getSampleConjugation(root) {
  for (const bab of root.babs) {
    for (const tense of (bab.tenses || [])) {
      for (const conj of (tense.conjugation || [])) {
        if (conj.arabic && conj.arabic !== '-' && !conj.arabic.includes('_') && !conj.arabic.includes('#')) {
          return conj.arabic;
        }
      }
    }
  }
  return null;
}

// Get a few verse references
function getSampleRefs(root) {
  const refs = [];
  for (const bab of root.babs) {
    for (const tense of (bab.tenses || [])) {
      if (tense.references?.length) {
        refs.push(...tense.references.slice(0, 2));
        if (refs.length >= 3) break;
      }
    }
    if (refs.length >= 3) break;
  }
  return refs.slice(0, 3);
}

// Get all forms used
function getForms(root) {
  return root.babs.map(b => `Form ${b.romanNumeral}`).join(', ');
}

async function fixBatch(batch) {
  const items = batch.map(root => {
    const conj = getSampleConjugation(root);
    const refs = getSampleRefs(root);
    return {
      id: root.id,
      root: root.root,
      currentMeaning: root.meaning,
      sampleConjugation: conj || 'N/A',
      forms: getForms(root),
      refs: refs.join(', ') || 'N/A',
    };
  });

  const prompt = `You are an expert in Classical Arabic and Quranic linguistics. For each Arabic verb root below, provide the correct English meaning as used in the Quran.

Rules:
- Use infinitive form: "to X" (e.g. "to say", "to believe", "to go")
- Give the PRIMARY root meaning (Form I base meaning), not a derived form
- Use Quranic/Islamic meaning where it differs from general Arabic
- Be concise: 1-5 words max
- Also give confidence: "high", "medium", or "low"

Roots to fix:
${items.map((item, i) => `${i + 1}. Root: ${item.root} | Current (possibly wrong): "${item.currentMeaning}" | Sample conjugation: ${item.sampleConjugation} | Forms in Quran: ${item.forms} | Verse refs: ${item.refs}`).join('\n')}

Respond with ONLY a JSON array, one object per root, in the same order:
[{"id":"root_id","meaning":"to X","confidence":"high|medium|low"}, ...]`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  // Extract JSON array from response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`No JSON array in response: ${text.slice(0, 200)}`);
  return JSON.parse(jsonMatch[0]);
}

async function main() {
  const BATCH_SIZE = 40;
  const lowConfidence = [];
  let fixed = 0;
  let errors = 0;

  console.log(`Processing ${roots.length} roots in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < roots.length; i += BATCH_SIZE) {
    const batch = roots.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(roots.length / BATCH_SIZE);
    process.stdout.write(`Batch ${batchNum}/${totalBatches}... `);

    try {
      const results = await fixBatch(batch);

      for (const result of results) {
        const root = roots.find(r => r.id === result.id);
        if (!root) continue;

        const oldMeaning = root.meaning;
        root.meaning = result.meaning;
        fixed++;

        if (result.confidence !== 'high') {
          lowConfidence.push({ id: result.id, root: root.root, oldMeaning, newMeaning: result.meaning, confidence: result.confidence });
        }
      }

      console.log(`done (${results.length} roots)`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      errors++;
    }

    // Small delay to avoid rate limiting
    if (i + BATCH_SIZE < roots.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  // Save updated data
  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log(`\nDone! Fixed ${fixed} roots, ${errors} batch errors.`);

  if (lowConfidence.length > 0) {
    console.log(`\n⚠️  ${lowConfidence.length} low/medium confidence entries to review:`);
    lowConfidence.forEach(r => {
      console.log(`  ${r.root} (${r.id}): "${r.oldMeaning}" → "${r.newMeaning}" [${r.confidence}]`);
    });

    // Save review list
    const reviewPath = join(__dirname, 'meanings-to-review.json');
    writeFileSync(reviewPath, JSON.stringify(lowConfidence, null, 2), 'utf8');
    console.log(`\nReview list saved to scripts/meanings-to-review.json`);
  }
}

main().catch(console.error);
