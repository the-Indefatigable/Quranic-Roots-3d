import { NextRequest, NextResponse } from 'next/server';
import { db, dbQuery } from '@/db';
import { quranWords, surahs, translationEntries } from '@/db/schema';
import { eq, asc, sql, inArray } from 'drizzle-orm';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const rootUnspaced = decodeURIComponent(params.id).replace(/\s/g, '');
  const rootSpaced = rootUnspaced.split('').join(' ');

  const url = new URL(req.url);
  const offset = Math.max(parseInt(url.searchParams.get('offset') || '0') || 0, 0);
  const limit = Math.min(Math.max(parseInt(url.searchParams.get('limit') || '10') || 10, 1), 50);

  try {
    // Get distinct ayahs with this root, paginated
    const distinctAyahs = await db
      .select({
        surahNumber: quranWords.surahNumber,
        ayahNumber: quranWords.ayahNumber,
      })
      .from(quranWords)
      .where(eq(quranWords.rootArabic, rootSpaced))
      .groupBy(quranWords.surahNumber, quranWords.ayahNumber)
      .orderBy(asc(quranWords.surahNumber), asc(quranWords.ayahNumber))
      .offset(offset)
      .limit(limit);

    if (distinctAyahs.length === 0) {
      return NextResponse.json({ occurrences: [] });
    }

    const pairs = distinctAyahs.map((a) => ({ surah: a.surahNumber, ayah: a.ayahNumber }));
    const pairSql = sql`(${sql.join(pairs.map((p) => sql`(${p.surah}, ${p.ayah})`), sql`, `)})`;

    // Fetch words, translations, and surah names in parallel
    const surahNums = [...new Set(pairs.map((p) => p.surah))];
    const [allWords, transRows, surahRows] = await Promise.all([
      db
        .select({
          surahNumber: quranWords.surahNumber,
          ayahNumber: quranWords.ayahNumber,
          position: quranWords.position,
          textUthmani: quranWords.textUthmani,
          charType: quranWords.charType,
          rootArabic: quranWords.rootArabic,
        })
        .from(quranWords)
        .where(sql`(${quranWords.surahNumber}, ${quranWords.ayahNumber}) IN ${pairSql}`)
        .orderBy(asc(quranWords.surahNumber), asc(quranWords.ayahNumber), asc(quranWords.position)),
      db
        .select({
          surahNumber: translationEntries.surahNumber,
          ayahNumber: translationEntries.ayahNumber,
          text: translationEntries.text,
        })
        .from(translationEntries)
        .where(sql`(${translationEntries.surahNumber}, ${translationEntries.ayahNumber}) IN ${pairSql}`),
      db
        .select({ number: surahs.number, englishName: surahs.englishName })
        .from(surahs)
        .where(inArray(surahs.number, surahNums)),
    ]);

    const transMap = new Map<string, string>();
    for (const t of transRows) {
      transMap.set(`${t.surahNumber}:${t.ayahNumber}`, t.text);
    }

    const surahNameMap = new Map<number, string>();
    for (const s of surahRows) {
      surahNameMap.set(s.number, s.englishName);
    }

    // Group words by ayah
    const wordsByAyah = new Map<string, typeof allWords>();
    for (const w of allWords) {
      const key = `${w.surahNumber}:${w.ayahNumber}`;
      if (!wordsByAyah.has(key)) wordsByAyah.set(key, []);
      wordsByAyah.get(key)!.push(w);
    }

    // Build response
    const occurrences = pairs.map((p) => {
      const key = `${p.surah}:${p.ayah}`;
      const words = (wordsByAyah.get(key) || [])
        .filter((w) => w.charType === 'word')
        .map((w) => ({
          text: w.textUthmani,
          isRoot: w.rootArabic === rootSpaced,
        }));

      return {
        surahNumber: p.surah,
        ayahNumber: p.ayah,
        surahName: surahNameMap.get(p.surah) || `Surah ${p.surah}`,
        ayahText: '',
        translation: transMap.get(key) || '',
        words,
      };
    });

    return NextResponse.json({ occurrences }, {
      headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' },
    });
  } catch (err) {
    console.error('[/api/roots/occurrences] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch occurrences' }, { status: 503 });
  }
}
