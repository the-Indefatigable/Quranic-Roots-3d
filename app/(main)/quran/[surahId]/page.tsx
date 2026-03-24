import { notFound } from 'next/navigation';
import { db, dbQuery } from '@/db';
import { surahs, ayahs, translationEntries, translations, quranWords, tafsirEntries } from '@/db/schema';
import { eq, and, asc } from 'drizzle-orm';
import Link from 'next/link';
import { SurahReaderClient } from '@/components/quran/SurahReaderClient';
import type { WordData } from '@/components/quran/WordPopover';

interface Props {
  params: { surahId: string };
}

// Render on-demand and cache indefinitely — avoids 114 concurrent DB connections at build time
export const dynamic = 'force-dynamic';
export const revalidate = false;

export async function generateMetadata({ params }: Props) {
  const surahNumber = parseInt(params.surahId);
  const surah = await dbQuery(() =>
    db.select().from(surahs).where(eq(surahs.number, surahNumber)).limit(1)
  );

  if (!surah[0]) return {};
  const s = surah[0];
  const title = `Surah ${s.englishName} (${s.arabicName}) — ${s.versesCount} Ayahs`;
  const description = `Read Surah ${s.englishName} (${s.arabicName}), Surah ${s.number} of the Quran — ${s.versesCount} ayahs with word-by-word analysis and English translation.`;
  return {
    title,
    description,
    openGraph: {
      title: `${title} | QuRoots`,
      description,
      url: `https://quroots.com/quran/${s.number}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | QuRoots`,
      description,
      images: ['/og-image.png'],
    },
  };
}

export default async function SurahPage({ params }: Props) {
  const surahNumber = parseInt(params.surahId);
  if (isNaN(surahNumber) || surahNumber < 1 || surahNumber > 114) notFound();

  // Fetch surah info
  const surahRows = await dbQuery(() =>
    db.select().from(surahs).where(eq(surahs.number, surahNumber)).limit(1)
  );

  if (!surahRows[0]) notFound();
  const surah = surahRows[0];

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
      .select({
        ayahNumber: translationEntries.ayahNumber,
        text: translationEntries.text,
      })
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

  // Fetch word-by-word data
  let wordsByAyah: Record<number, WordData[]> = {};
  let hasWords = false;
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
    hasWords = wordRows.length > 0;
  } catch {
    // Table may not exist yet — gracefully degrade
  }

  // Check if tafsir exists for this surah (lightweight count query)
  let hasTafsir = false;
  try {
    const [tafsirCount] = await db
      .select({ count: tafsirEntries.id })
      .from(tafsirEntries)
      .where(eq(tafsirEntries.surahNumber, surahNumber))
      .limit(1);
    hasTafsir = !!tafsirCount;
  } catch {
    // Table may not exist yet
  }

  // Prev/next surah info
  const prevSurah = surahNumber > 1
    ? (await db.select({ number: surahs.number, englishName: surahs.englishName }).from(surahs).where(eq(surahs.number, surahNumber - 1)).limit(1))[0]
    : null;
  const nextSurah = surahNumber < 114
    ? (await db.select({ number: surahs.number, englishName: surahs.englishName }).from(surahs).where(eq(surahs.number, surahNumber + 1)).limit(1))[0]
    : null;

  // Serialize for client
  const ayahData = ayahRows.map((a) => ({
    number: a.ayahNumber,
    textUthmani: a.textUthmani,
    translation: translationMap[a.ayahNumber] || '',
    words: wordsByAyah[a.ayahNumber] || [],
  }));

  return (
    <div>
      {/* Surah Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
          {prevSurah ? (
            <Link
              href={`/quran/${prevSurah.number}`}
              className="flex items-center gap-1.5 text-muted-more hover:text-white transition-colors text-sm p-2 -m-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
              <span className="hidden sm:inline">{prevSurah.englishName}</span>
            </Link>
          ) : <div className="w-16" />}

          <div>
            <p className="font-arabic text-2xl sm:text-3xl text-gold mb-1">{surah.arabicName}</p>
            <h1 className="text-lg sm:text-xl font-light text-white">{surah.englishName}</h1>
            <p className="text-sm text-muted mt-1">
              {surah.versesCount} Ayahs
              {surah.revelationType && (
                <span className="text-muted-more"> &middot; {surah.revelationType === 'makkah' ? 'Meccan' : 'Medinan'}</span>
              )}
            </p>
          </div>

          {nextSurah ? (
            <Link
              href={`/quran/${nextSurah.number}`}
              className="flex items-center gap-1.5 text-muted-more hover:text-white transition-colors text-sm p-2 -m-2"
            >
              <span className="hidden sm:inline">{nextSurah.englishName}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          ) : <div className="w-16" />}
        </div>

        {surahNumber !== 9 && surahNumber !== 1 && (
          <p className="font-arabic text-xl text-muted/60 mb-6">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
        )}
      </div>

      {/* Reader */}
      <SurahReaderClient ayahs={ayahData} surahNumber={surahNumber} surahName={surah.englishName} hasWords={hasWords} hasTafsir={hasTafsir} />

      {/* Bottom navigation */}
      <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
        {prevSurah ? (
          <Link href={`/quran/${prevSurah.number}`} className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            {prevSurah.englishName}
          </Link>
        ) : <div />}
        {nextSurah ? (
          <Link href={`/quran/${nextSurah.number}`} className="flex items-center gap-2 text-sm text-muted hover:text-white transition-colors">
            {nextSurah.englishName}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
