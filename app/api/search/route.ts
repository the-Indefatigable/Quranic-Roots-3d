import { NextRequest, NextResponse } from 'next/server';
import { db, dbQuery } from '@/db';
import { ayahs, translationEntries, translations, surahs } from '@/db/schema';
import { eq, and, ilike } from 'drizzle-orm';

function isArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

// Escape ILIKE special chars in user input
function escapeLike(str: string) {
  return str.replace(/[%_\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (raw.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const q = escapeLike(raw);
  const arabic = isArabic(raw);

  const translationRow = await dbQuery(() =>
    db.select({ id: translations.id }).from(translations).limit(1)
  );
  const translationId = translationRow[0]?.id;

  if (arabic) {
    const rows = await dbQuery(() =>
      db
        .select({
          surahNumber: ayahs.surahNumber,
          ayahNumber: ayahs.ayahNumber,
          textUthmani: ayahs.textUthmani,
          translation: translationEntries.text,
          surahEnglishName: surahs.englishName,
          surahArabicName: surahs.arabicName,
        })
        .from(ayahs)
        .innerJoin(surahs, eq(surahs.number, ayahs.surahNumber))
        .leftJoin(
          translationEntries,
          translationId
            ? and(
                eq(translationEntries.surahNumber, ayahs.surahNumber),
                eq(translationEntries.ayahNumber, ayahs.ayahNumber),
                eq(translationEntries.translationId, translationId)
              )
            : and(
                eq(translationEntries.surahNumber, ayahs.surahNumber),
                eq(translationEntries.ayahNumber, ayahs.ayahNumber)
              )
        )
        .where(ilike(ayahs.textUthmani, `%${q}%`))
        .limit(20)
    );

    return NextResponse.json({ results: rows });
  }

  // English search
  if (!translationId) return NextResponse.json({ results: [] });

  const rows = await dbQuery(() =>
    db
      .select({
        surahNumber: translationEntries.surahNumber,
        ayahNumber: translationEntries.ayahNumber,
        translation: translationEntries.text,
        textUthmani: ayahs.textUthmani,
        surahEnglishName: surahs.englishName,
        surahArabicName: surahs.arabicName,
      })
      .from(translationEntries)
      .innerJoin(surahs, eq(surahs.number, translationEntries.surahNumber))
      .innerJoin(
        ayahs,
        and(
          eq(ayahs.surahNumber, translationEntries.surahNumber),
          eq(ayahs.ayahNumber, translationEntries.ayahNumber)
        )
      )
      .where(
        and(
          eq(translationEntries.translationId, translationId),
          ilike(translationEntries.text, `%${q}%`)
        )
      )
      .limit(20)
  );

  return NextResponse.json({ results: rows });
}
