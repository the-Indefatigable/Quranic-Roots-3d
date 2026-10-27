/**
 * Build the 30-day "Understand your salah" path from the database.
 *
 * Al-Fatiha plus the short surahs most people recite in prayer (Al-Asr and 105–114).
 * Roots are introduced in the order they are first met while reciting, so Al-Fatiha
 * is fully understood by day 6 and celebrated on day 7. Every ayah becomes "unlocked"
 * on the day its last root is learned. Read-only: writes src/data/salahPath.json.
 *
 * Roots and counts come from the Quranic Arabic Corpus (scripts/data/qac-salah.json, made by
 * scripts/extract-qac-salah.py); the database supplies the text, glosses and root meanings.
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
// Each day is named for what it lets you understand, checked against the lines it unlocks.
const TITLES = {
  1: 'Bismillah: In the name of Allah', 2: 'All praise to the Lord of the worlds', 3: 'Master of the Day of Judgment',
  4: 'You alone we worship', 5: 'Guide us to the straight path', 6: 'The path of those You blessed',
  7: 'All of Al-Fatiha, word by word', 8: 'Al-Ikhlas: Say, He is Allah, One', 9: 'Al-Ikhlas ends, Al-Falaq begins',
  10: 'Al-Falaq: the evil of the dark', 11: 'Al-Falaq ends, An-Nas begins', 12: 'An-Nas: the whisperer who withdraws',
  13: 'Al-Kawthar: pray and sacrifice', 14: 'Al-Asr: by time', 15: 'Al-Asr: truth and patience',
  16: "An-Nasr: when Allah's help comes", 17: 'An-Nasr: people entering in crowds', 18: 'An-Nasr ends, Al-Kafirun begins',
  19: 'Al-Masad: the hands of Abu Lahab', 20: 'Al-Masad: his wealth did not help him', 21: 'Al-Masad: the carrier of firewood',
  22: "Al-Masad ends, Al-Ma'un begins", 23: "Al-Ma'un: the orphan and the needy", 24: "Al-Ma'un ends, Quraysh begins",
  25: 'Quraysh: the winter and summer journeys', 26: 'Quraysh: safe from hunger and fear', 27: 'Al-Fil: the people of the elephant',
  28: 'Al-Fil: birds in flocks', 29: 'Al-Fil: like eaten straw', 30: 'Your whole salah',
};
// Meanings for roots the roots table has no (or no suitable) meaning for, keyed by normalised root.
const MEANINGS = {
  'اله': 'Allah, God (the root of Allah and ilāh)', 'ربب': 'Lord; to nurture and sustain', 'سمو': 'name; to be high',
  'يوم': 'day', 'صرط': 'path, way', 'احد': 'one, single', 'فوج': 'group, crowd', 'ذات': 'possessor of, having',
  'مرا': 'person; woman, wife', 'وال': 'woe, ruin', 'ويل': 'woe, ruin', 'فيل': 'elephant', 'كيف': 'how',
  'قرش': 'Quraysh, the tribe', 'شنا': 'to hate, to bear hatred', 'ايي': 'which; O (in calling out)', 'يدي': 'hand',
  'ابو': 'father', 'مول': 'wealth, property', 'نور': 'light; fire',
};
// One root spelling for matching the corpus with the database (hamza seats differ between them).
const norm = (r) => r.replace(/\s+/g, '').replace(/[أإآ]/g, 'ا').replace(/[ؤئ]/g, 'ء');
const QAC = JSON.parse(fs.readFileSync('scripts/data/qac-salah.json', 'utf8'));

const sql = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
try {
  await sql`set default_transaction_read_only = on`;
  const raw = await sql`
    select surah_number, ayah_number, position, text_uthmani, translation, root_arabic
    from quran_words where char_type = 'word' and surah_number = any(${SURAHS})
    order by surah_number, ayah_number, position`;
  const rootRows = await sql`select root, meaning, total_freq from roots`;
  const meta = new Map(rootRows.map((r) => [norm(r.root), r]));
  // The corpus decides each word's root; its count is what corpus.quran.com shows.
  const counts = new Map(Object.entries(QAC.counts).map(([r, n]) => [norm(r), n]));
  const words = raw.map((w) => {
    const q = QAC.words[`${w.surah_number}:${w.ayah_number}:${w.position}`];
    const key = q ? norm(q) : w.root_arabic ? norm(w.root_arabic) : null;
    return { ...w, root_arabic: key ? [...key].join(' ') : null };
  });
  const occ = counts;

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
      return { root: m.root ?? r.key, letters: r.spaced, meaning: MEANINGS[r.key] || m.meaning || '',
        quranCount: occ.get(r.key) || m.total_freq || 0, firstIn: SURAH_NAMES[r.surah], words: wordsByRoot.get(r.key) };
    });
    const learned = new Set(order.filter((r) => (dayOf.get(r.key) ?? 99) <= d).map((r) => r.key));
    const understood = words.filter((w) => w.root_arabic && learned.has(w.root_arabic.replace(/\s+/g, ''))).length;
    const unlocked = lines.filter((l) => l.unlockDay === d).map((l) => `${l.surah}:${l.ayah}`);
    const title = TITLES[d];
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
