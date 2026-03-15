/**
 * Watches data/verbsData.json and re-runs generate-data.mjs on change.
 * Auto-started by next.config.mjs in dev mode — no manual step needed.
 */

import { watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TARGET = join(ROOT, 'data/verbsData.json');

function generate() {
  try {
    execSync('node scripts/generate-data.mjs', { cwd: ROOT, stdio: 'inherit' });
  } catch (e) {
    console.error('[watch-data] generate-data failed:', e.message);
  }
}

// Run once immediately so derived files are always fresh on dev start
console.log('[watch-data] initial generate...');
generate();
console.log('[watch-data] watching verbsData.json for changes...');

let debounce = null;
watch(TARGET, () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    console.log('[watch-data] verbsData.json changed — regenerating...');
    generate();
  }, 300);
});
