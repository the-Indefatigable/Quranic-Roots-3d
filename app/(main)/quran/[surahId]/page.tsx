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

export const revalidate = false;

export function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ surahId: String(i + 1) }));
}

export async function generateMetadata({ params }: Props) {
  const surahNumber = parseInt(params.surahId);
  const surah = await dbQuery(() =>
    db.select().from(surahs).where(eq(surahs.number, surahNumber)).limit(1)
  );

  if (!surah[0]) return {};
  const s = surah[0];
  const url = `https://quroots.com/quran/${s.number}`;
  const title = `Surah ${s.englishName} (${s.arabicName}) — Read Word-by-Word with Translation`;
  const description = `Read Surah ${s.englishName} (${s.arabicName}), the ${ordinal(s.number)} chapter of the Quran. ${s.versesCount} ayahs with word-by-word Arabic analysis, English translation, and root-level study tools.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [
      `Surah ${s.englishName}`,
      `${s.englishName} translation`,
      `${s.arabicName}`,
      `Quran chapter ${s.number}`,
      'word by word Quran',
      'Quranic Arabic',
      'Quran with translation',
    ],
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      siteName: 'QuRoots',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const SURAH_TYPES: Record<string, string> = {
  makkah: 'Meccan',
  madinah: 'Medinan',
};

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

  // Check if tafsir exists for this surah
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
    ? (await db.select({ number: surahs.number, englishName: surahs.englishName, arabicName: surahs.arabicName }).from(surahs).where(eq(surahs.number, surahNumber - 1)).limit(1))[0]
    : null;
  const nextSurah = surahNumber < 114
    ? (await db.select({ number: surahs.number, englishName: surahs.englishName, arabicName: surahs.arabicName }).from(surahs).where(eq(surahs.number, surahNumber + 1)).limit(1))[0]
    : null;

  // Serialize for client
  const ayahData = ayahRows.map((a) => ({
    number: a.ayahNumber,
    textUthmani: a.textUthmani,
    translation: translationMap[a.ayahNumber] || '',
    words: wordsByAyah[a.ayahNumber] || [],
  }));

  const revelationType = surah.revelationType ? SURAH_TYPES[surah.revelationType] ?? surah.revelationType : null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Chapter',
        '@id': `https://quroots.com/quran/${surahNumber}#chapter`,
        'name': `Surah ${surah.englishName}`,
        'alternateName': surah.arabicName,
        'position': surahNumber,
        'url': `https://quroots.com/quran/${surahNumber}`,
        'isPartOf': {
          '@type': 'Book',
          'name': 'The Holy Quran',
          'inLanguage': 'ar',
        },
        'inLanguage': ['ar', 'en'],
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://quroots.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Quran', 'item': 'https://quroots.com/quran' },
          { '@type': 'ListItem', 'position': 3, 'name': `Surah ${surah.englishName}`, 'item': `https://quroots.com/quran/${surahNumber}` },
        ],
      },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Surah Header */}
      <div className="relative text-center mb-10 pt-2 pb-8">
        {/* Ambient glow behind Arabic name */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 60% 80px at 50% 40%, rgba(212,162,70,0.07) 0%, transparent 70%)',
          }}
        />

        {/* Surah number badge */}
        <div className="flex justify-center mb-4">
          <span
            className="text-[10px] font-bold uppercase tracking-[0.25em] px-3 py-1 rounded-full"
            style={{
              background: 'rgba(212,162,70,0.1)',
              color: '#D4A246',
              border: '1px solid rgba(212,162,70,0.2)',
            }}
          >
            Surah {surahNumber}
            {revelationType && <> &middot; {revelationType}</>}
          </span>
        </div>

        {/* Prev / Arabic name / Next */}
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          {prevSurah ? (
            <Link
              href={`/quran/${prevSurah.number}`}
              className="flex flex-col items-center gap-1 group p-2 -m-2"
              title={prevSurah.englishName}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#78716C',
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </div>
              <span className="hidden sm:block text-[10px]" style={{ color: '#57534E' }}>{prevSurah.arabicName}</span>
            </Link>
          ) : <div className="w-10" />}

          <div className="flex-1 max-w-xs">
            {/* Arabic name — large and glowing */}
            <p
              className="font-arabic mb-2 leading-none"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                color: '#D4A246',
                textShadow: '0 0 40px rgba(212,162,70,0.35), 0 0 80px rgba(212,162,70,0.15)',
              }}
            >
              {surah.arabicName}
            </p>
            {/* Diamond ornament */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="h-px flex-1" style={{ background: 'linear-gradient(to right, transparent, rgba(212,162,70,0.3))' }} />
              <span style={{ color: '#D4A246', fontSize: '8px', opacity: 0.6 }}>◆</span>
              <span className="h-px flex-1" style={{ background: 'linear-gradient(to left, transparent, rgba(212,162,70,0.3))' }} />
            </div>
            <h1 className="font-heading text-xl sm:text-2xl font-light" style={{ color: '#EDEDEC' }}>
              {surah.englishName}
            </h1>
            <p className="text-sm mt-1" style={{ color: '#57534E' }}>
              {surah.versesCount} Ayahs
            </p>
          </div>

          {nextSurah ? (
            <Link
              href={`/quran/${nextSurah.number}`}
              className="flex flex-col items-center gap-1 group p-2 -m-2"
              title={nextSurah.englishName}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#78716C',
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
              <span className="hidden sm:block text-[10px]" style={{ color: '#57534E' }}>{nextSurah.arabicName}</span>
            </Link>
          ) : <div className="w-10" />}
        </div>

        {/* Bismillah */}
        {surahNumber !== 9 && surahNumber !== 1 && (
          <div className="mt-8">
            <p
              className="font-arabic"
              style={{
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                color: '#78716C',
                letterSpacing: '0.02em',
              }}
            >
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </p>
          </div>
        )}
      </div>

      {/* Reader */}
      <SurahReaderClient
        ayahs={ayahData}
        surahNumber={surahNumber}
        surahName={surah.englishName}
        surahArabicName={surah.arabicName}
        hasWords={hasWords}
        hasTafsir={hasTafsir}
      />

      {/* Bottom navigation */}
      <div
        className="flex items-center justify-between mt-16 pt-8"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {prevSurah ? (
          <Link
            href={`/quran/${prevSurah.number}`}
            className="flex items-center gap-3 group"
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#57534E',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: '#57534E' }}>Previous</p>
              <p className="text-sm font-medium" style={{ color: '#EDEDEC' }}>{prevSurah.englishName}</p>
            </div>
          </Link>
        ) : <div />}

        {nextSurah ? (
          <Link
            href={`/quran/${nextSurah.number}`}
            className="flex items-center gap-3 group text-right"
          >
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: '#57534E' }}>Next</p>
              <p className="text-sm font-medium" style={{ color: '#EDEDEC' }}>{nextSurah.englishName}</p>
            </div>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 group-hover:scale-110"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#57534E',
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}
