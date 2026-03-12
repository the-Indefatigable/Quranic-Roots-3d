import fs from 'fs';
import translate from 'translate';

// Use a free engine
translate.engine = 'google';

const file = './src/data/verbsData.json';
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

async function translateAll() {
  let count = 0;
  for (let i = 0; i < data.roots.length; i++) {
    const r = data.roots[i];
    const m = r.meaning;
    // Condition to check if it's missing (just Buckwalter)
    if (!m.includes(' ') && !m.startsWith('to ')) {
      try {
        // Translate the Arabic root word directly
        const arabic = r.root;
        const res = await translate(arabic, { from: 'ar', to: 'en' });
        // Format as "to <verb>" or something similar
        r.meaning = res.toLowerCase();
        count++;
        console.log(`Translated [${arabic}] -> ${r.meaning}`);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (err) {
        console.error(`Failed on ${r.root}:`, err.message);
      }
    }
  }

  if (count > 0) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    console.log(`Updated ${count} missing meanings.`);
  } else {
    console.log('No missing meanings found.');
  }
}

translateAll();
