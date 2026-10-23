/**
 * Build the 30-day "Understand your salah" path from the database.
 *
 * Al-Fatiha plus the short surahs most people recite in prayer (Al-Asr and 105–114).
 * Roots are introduced in the order they are first met while reciting, so Al-Fatiha
 * is fully understood by day 6 and celebrated on day 7. Every ayah becomes "unlocked"
 * on the day its last root is learned. Read-only: writes src/data/salahPath.json.
 *
 * Run: node scripts/build-salah-path.mjs
 */
import fs from 'fs';
import postgres from 'postgres';

const envFile = fs.readFileSync('.env.local', 'utf8');
for (const line of envFile.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
}

// Recitation order: Al-Fatiha first, then the short surahs from shortest-known outward.
const SURAHS = [1, 112, 113, 114, 108, 103, 110, 109, 111, 107, 106, 105];
const SURAH_NAMES = {
  1: 'Al-Fatiha', 103: 'Al-Asr', 105: 'Al-Fil', 106: 'Quraysh', 107: "Al-Ma'un", 108: 'Al-Kawthar',
  109: 'Al-Kafirun', 110: 'An-Nasr', 111: 'Al-Masad', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas',
};
const DAYS = 30, FREE_DAYS = 7;
// Noun roots that have no verb meaning in the roots table.
const MEANINGS = {
  'اله': 'god, deity (the root of Allah)', 'يوم': 'day', 'صرط': 'path, way', 'احد': 'one, single',
  'فوج': 'group, crowd', 'ذات': 'possessor of, having', 'مرا': 'person; woman, wife', 'وئل': 'woe, ruin',
  'ويل': 'woe, ruin', 'فيل': 'elephant',
};

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
try {
  await sql`set default_transaction_read_only = on`;
  const words = await sql`
    select surah_number, ayah_number, position, text_uthmani, translation, root_arabic
    from quran_words where char_type = 'word' and surah_number = any(${SURAHS})
    order by surah_number, ayah_number, position`;
  const keys = [...new Set(words.filter((w) => w.root_arabic).map((w) => w.root_arabic.replace(/\s+/g, '')))];
  const rootRows = await sql`select root, meaning, total_freq from roots where root = any(${keys})`;
  const quranCounts = await sql`
    select replace(root_arabic, ' ', '') as k, count(*)::int as n from quran_words
    where char_type = 'word' and root_arabic is not null and replace(root_arabic, ' ', '') = any(${keys}) group by 1`;
  const meta = new Map(rootRows.map((r) => [r.root, r]));
  const occ = new Map(quranCounts.map((r) => [r.k, r.n]));

  // order of first appearance while reciting
  const order = [], seen = new Set(), wordsByRoot = new Map();
  const bySurah = (s) => words.filter((w) => w.surah_number === s);
  for (const s of SURAHS) for (const w of bySurah(s)) {
    if (!w.root_arabic) continue;
    const k = w.root_arabic.replace(/\s+/g, '');
    if (!seen.has(k)) { seen.add(k); order.push({ key: k, spaced: w.root_arabic, surah: s }); }
    const list = wordsByRoot.get(k) ?? [];
    if (!list.some((x) => x.ar === w.text_uthmani)) list.push({ ar: w.text_uthmani, en: w.translation, ref: `${w.surah_number}:${w.ayah_number}` });
    wordsByRoot.set(k, list);
  }

  // spread: Fatiha roots over days 1–6, day 7 is the Fatiha milestone, the rest over days 8–29, day 30 is review
  const fatiha = order.filter((r) => r.surah === 1), rest = order.filter((r) => r.surah !== 1);
  const spread = (items, firstDay, lastDay) => {
    const days = lastDay - firstDay + 1, out = new Map();
    items.forEach((it, i) => { const d = firstDay + Math.floor((i * days) / items.length); out.set(it.key, d); });
    return out;
  };
  const dayOf = new Map([...spread(fatiha, 1, 6), ...spread(rest, 8, 29)]);

  // ayah lines and the day each becomes fully understood
  const lines = [];
  for (const s of SURAHS) {
    const ayahs = [...new Set(bySurah(s).map((w) => w.ayah_number))];
    for (const a of ayahs) {
      const ws = bySurah(s).filter((w) => w.ayah_number === a);
      const days = ws.filter((w) => w.root_arabic).map((w) => dayOf.get(w.root_arabic.replace(/\s+/g, '')));
      // a line with no rooted words opens with the first root taught from its surah
      const surahFirst = Math.min(...order.filter((r) => r.surah === s).map((r) => dayOf.get(r.key)));
      lines.push({
        surah: s, surahName: SURAH_NAMES[s], ayah: a, unlockDay: days.length ? Math.max(...days) : surahFirst,
        words: ws.map((w) => ({ ar: w.text_uthmani, en: w.translation, root: w.root_arabic ? w.root_arabic.replace(/\s+/g, '') : null })),
      });
    }
  }
  const totalTokens = words.length,
    rootedTokens = words.filter((w) => w.root_arabic).length;

  const days = [];
  for (let d = 1; d <= DAYS; d++) {
    const roots = order.filter((r) => dayOf.get(r.key) === d).map((r) => {
      const m = meta.get(r.key) ?? {};
      return { root: r.key, letters: r.spaced, meaning: m.meaning || MEANINGS[r.key] || '', quranCount: occ.get(r.key) ?? 0, firstIn: SURAH_NAMES[r.surah], words: wordsByRoot.get(r.key) };
    });
    const learned = new Set(order.filter((r) => (dayOf.get(r.key) ?? 99) <= d).map((r) => r.key));
    const understood = words.filter((w) => w.root_arabic && learned.has(w.root_arabic.replace(/\s+/g, ''))).length;
    const unlocked = lines.filter((l) => l.unlockDay === d).map((l) => `${l.surah}:${l.ayah}`);
    const title = d === 7 ? 'Al-Fatiha, every word' : d === 30 ? 'Your whole salah' : roots.length ? `${roots.map((r) => r.meaning.split(/[,;/]/)[0].trim()).filter(Boolean).slice(0, 2).join(' · ')}` : 'Review';
    days.push({ day: d, free: d <= FREE_DAYS, title, roots, unlocked, pctSalah: Math.round((100 * understood) / rootedTokens) });
  }

  const out = {
    generated: new Date().toISOString().slice(0, 10),
    surahs: SURAHS.map((s) => ({ number: s, name: SURAH_NAMES[s] })),
    totals: { roots: order.length, words: totalTokens, rootedWords: rootedTokens, freeDays: FREE_DAYS, days: DAYS },
    days, lines,
  };
  fs.mkdirSync('src/data', { recursive: true });
  fs.writeFileSync('src/data/salahPath.json', JSON.stringify(out, null, 1));
  console.log(`roots ${order.length} (Fatiha ${fatiha.length}), words ${totalTokens}, lines ${lines.length}`);
  for (const d of days) console.log(String(d.day).padStart(2), d.free ? 'free' : 'paid', String(d.roots.length).padStart(2), 'roots', String(d.pctSalah).padStart(3) + '%', d.unlocked.length, 'lines', '|', d.title);
} finally {
  await sql.end();
}
