export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db, dbQuery } from '@/db';
import { surahs, ayahs, translationEntries, translations, quranWords } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export const revalidate = 86400;

export async function GET(
  _request: NextRequest,
  { params }: { params: { surahNumber: string } }
) {
  const surahNumber = parseInt(params.surahNumber);
  if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) {
    return NextResponse.json({ error: 'Invalid surah number' }, { status: 400 });
  }

  // Fetch surah info
  const surahRows = await dbQuery(() =>
    db
      .select({
        number: surahs.number,
        arabicName: surahs.arabicName,
        englishName: surahs.englishName,
        versesCount: surahs.versesCount,
        revelationType: surahs.revelationType,
      })
      .from(surahs)
      .where(eq(surahs.number, surahNumber))
      .limit(1)
  );

  if (!surahRows[0]) {
    return NextResponse.json({ error: 'Surah not found' }, { status: 404 });
  }

  // Fetch ayahs
  const ayahRows = await dbQuery(() =>
    db.select().from(ayahs).where(eq(ayahs.surahNumber, surahNumber)).orderBy(asc(ayahs.ayahNumber))
  );

  // Fetch translation
  const translationRow = await dbQuery(() =>
    db.select({ id: translations.id }).from(translations).limit(1)
  );

  let translationMap: Record<number, string> = {};
  if (translationRow[0]) {
    const entries = await db
      .select({ ayahNumber: translationEntries.ayahNumber, text: translationEntries.text })
      .from(translationEntries)
      .where(
        and(
          eq(translationEntries.translationId, translationRow[0].id),
          eq(translationEntries.surahNumber, surahNumber)
        )
      )
      .orderBy(asc(translationEntries.ayahNumber));

    for (const e of entries) {
      translationMap[e.ayahNumber] = e.text;
    }
  }

  // Fetch words
  let wordsByAyah: Record<number, any[]> = {};
  try {
    const wordRows = await db
      .select({
        ayahNumber: quranWords.ayahNumber,
        position: quranWords.position,
        textUthmani: quranWords.textUthmani,
        transliteration: quranWords.transliteration,
        translation: quranWords.translation,
        rootArabic: quranWords.rootArabic,
        charType: quranWords.charType,
      })
      .from(quranWords)
      .where(eq(quranWords.surahNumber, surahNumber))
      .orderBy(asc(quranWords.ayahNumber), asc(quranWords.position));

    for (const w of wordRows) {
      if (!wordsByAyah[w.ayahNumber]) wordsByAyah[w.ayahNumber] = [];
      wordsByAyah[w.ayahNumber].push({
        position: w.position,
        textUthmani: w.textUthmani,
        transliteration: w.transliteration,
        translation: w.translation,
        rootArabic: w.rootArabic,
        charType: w.charType || 'word',
      });
    }
  } catch {
    // Table may not exist yet
  }

  const ayahData = ayahRows.map((a) => ({
    number: a.ayahNumber,
    textUthmani: a.textUthmani,
    translation: translationMap[a.ayahNumber] || '',
    words: wordsByAyah[a.ayahNumber] || [],
  }));

  return NextResponse.json(
    { surah: surahRows[0], ayahs: ayahData },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
}
