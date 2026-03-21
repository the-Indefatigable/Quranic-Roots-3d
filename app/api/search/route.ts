import { NextRequest, NextResponse } from 'next/server';
import { db, dbQuery } from '@/db';
import { ayahs, surahs } from '@/db/schema';
import { eq, ilike, sql } from 'drizzle-orm';

function isArabic(text: string) {
  return /[\u0600-\u06FF]/.test(text);
}

function escapeLike(str: string) {
  return str.replace(/[%_\\]/g, '\\$&');
}

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (raw.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const q = escapeLike(raw);
  const arabic = isArabic(raw);

  if (arabic) {
    // Search text_simple (no diacritics) so رحمة matches رَحْمَةً
    const rows = await dbQuery(() =>
      db
        .select({
          surahNumber: ayahs.surahNumber,
          ayahNumber: ayahs.ayahNumber,
          textUthmani: ayahs.textUthmani,
          surahEnglishName: surahs.englishName,
          surahArabicName: surahs.arabicName,
        })
        .from(ayahs)
        .innerJoin(surahs, eq(surahs.number, ayahs.surahNumber))
        .where(ilike(ayahs.textSimple, `%${q}%`))
        .limit(20)
    );

    return NextResponse.json({ results: rows.map(r => ({ ...r, translation: null })) });
  }

  // English: find distinct ayahs where any word translation matches
  const rows = await dbQuery(() =>
    db.execute(sql`
      SELECT DISTINCT ON (qw.surah_number, qw.ayah_number)
        qw.surah_number   AS "surahNumber",
        qw.ayah_number    AS "ayahNumber",
        a.text_uthmani    AS "textUthmani",
        s.english_name    AS "surahEnglishName",
        s.arabic_name     AS "surahArabicName",
        qw.translation    AS translation
      FROM quran_words qw
      JOIN ayahs  a ON a.surah_number = qw.surah_number AND a.ayah_number = qw.ayah_number
      JOIN surahs s ON s.number = qw.surah_number
      WHERE qw.char_type = 'word'
        AND qw.translation ILIKE ${`%${q}%`}
      ORDER BY qw.surah_number, qw.ayah_number
      LIMIT 20
    `)
  );

  return NextResponse.json({ results: rows });
}
