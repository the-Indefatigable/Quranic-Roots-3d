import { NextRequest, NextResponse } from 'next/server';
import { db, dbQuery } from '@/db';
import { ayahs, translationEntries, translations, surahs } from '@/db/schema';
import { eq, and, ilike } from 'drizzle-orm';
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
 * Apply the same normalization to the query that ayahs.text_search stores:
 * strip diacritics and fold alef/ya/ta-marbuta variants. Both sides must be
 * normalized identically or nothing matches.
 *
 * Must stay in sync with the generated column in db/014.
 */
function normalizeArabic(str: string) {
  return str
    .replace(/[ً-ٰۖ-ۭـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا') // أ إ آ ٱ -> ا
    .replace(/ى/g, 'ي')                      // ى -> ي
    .replace(/ة/g, 'ه');                     // ة -> ه
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
          // text_search, not text_simple: the latter still carries full tashkeel
          // (it comes from quran.com's text_imlaei), so bare Arabic never matched.
          .where(ilike(ayahs.textSearch, `%${normalizeArabic(q)}%`))
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
