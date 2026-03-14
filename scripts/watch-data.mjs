/**
 * Watches public/data/verbsData.json and re-runs generate-data.mjs on change.
 * Usage: node scripts/watch-data.mjs
 */

import { watch } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const TARGET = join(ROOT, 'public/data/verbsData.json');

console.log('Watching verbsData.json for changes...');

let debounce = null;
watch(TARGET, () => {
  clearTimeout(debounce);
  debounce = setTimeout(() => {
    console.log('\nverbsData.json changed — regenerating...');
    try {
      execSync('node scripts/generate-data.mjs', { cwd: ROOT, stdio: 'inherit' });
      console.log('Done.\n');
    } catch (e) {
      console.error('generate-data failed:', e.message);
    }
  }, 300);
});
