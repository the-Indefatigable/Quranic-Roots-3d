import { NextRequest, NextResponse } from 'next/server';
import { db, dbQuery } from '@/db';
import { ayahs, translationEntries, translations, surahs } from '@/db/schema';
import { eq, and, ilike, sql } from 'drizzle-orm';
import { rateLimit, clientKey, tooManyRequests } from '@/lib/rateLimit';

// Unauthenticated, and each call is a leading-wildcard scan over the whole
// corpus. Typing in the search box fires one of these per keystroke.
const LIMIT = 30;
const WINDOW_MS = 60_000;

function isArabic(text: string) {
  return /[؀-ۿ]/.test(text);
}

function escapeLike(str: string) {
  return str.replace(/[%_\\]/g, '\\$&');
}

/**
 * Arabic normalization, shared by the query and the SQL expression below.
 *
 * Characters are listed explicitly rather than as regex/SQL ranges: range
 * semantics over non-ASCII depend on the server's collation, so a range that
 * strips correctly on one Postgres can silently strip nothing on another.
 *
 * DIACRITICS must stay byte-identical to the expression in
 * db/014_arabic_search_normalization.sql, or the functional index there won't
 * be used (the query still returns correct results, just unindexed).
 */
const DIACRITICS =
  'ًٌٍَُِّْٕٖٓٔٗ٘' +
  'ٰـ' +
  'ۖۗۘۙۚۛۜ۝۞ۣ۟۠ۡۢ' +
  'ۤۥۦۧۨ۩۪ۭ۫۬';

/** Spelling variants folded together: أ إ آ ٱ -> ا, ى -> ي, ة -> ه */
const FOLD_FROM = 'أإآٱىة';
const FOLD_TO = 'اااايه';

/** The JS mirror of the SQL expression — both sides must normalize alike. */
function normalizeArabic(str: string) {
  const stripped = [...str].filter((ch) => !DIACRITICS.includes(ch)).join('');
  return [...stripped]
    .map((ch) => {
      const i = FOLD_FROM.indexOf(ch);
      return i === -1 ? ch : FOLD_TO[i];
    })
    .join('');
}

export async function GET(request: NextRequest) {
  const limited = rateLimit(clientKey(request, 'search'), LIMIT, WINDOW_MS);
  if (!limited.ok) return tooManyRequests(limited);

  const raw = request.nextUrl.searchParams.get('q')?.trim()?.slice(0, 200) ?? '';
  // Two-character minimum: a single character matches most of the corpus, which
  // makes the scan as expensive as it can possibly be for a useless result set.
  if (raw.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const q = escapeLike(raw);
  const arabic = isArabic(raw);

  // Every other route handler has one of these; this was the only one without,
  // so a transient DB error surfaced as an unhandled rejection rather than 500.
  try {
    const [translationRow] = await dbQuery(() =>
      db.select({ id: translations.id }).from(translations).limit(1)
    );
    const translationId = translationRow?.id;

    if (arabic) {
      // Search text_simple (no diacritics) so رحمة matches رَحْمَةً
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
          // Normalize the stored text inline rather than matching text_simple
          // directly: text_simple comes from quran.com's text_imlaei and keeps
          // full tashkeel (بِسْمِ ٱللَّهِ), so a bare-form query never matched it —
          // Arabic search returned zero results for every term.
          //
          // This expression only touches text_simple, which always exists, so
          // the route cannot be broken by a missing migration. db/014 adds a
          // matching functional index; without it this is still correct, just
          // a sequential scan over 6,236 rows.
          .where(
            sql`translate(translate(${ayahs.textSimple}, ${DIACRITICS}, ''), ${FOLD_FROM}, ${FOLD_TO})
                ILIKE ${`%${normalizeArabic(q)}%`}`
          )
          .limit(20)
      );

      return NextResponse.json({ results: rows });
    }

    // English: search translation_entries (now fully populated)
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
  } catch (error) {
    console.error('[search] Error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
