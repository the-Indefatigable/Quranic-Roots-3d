import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { db, dbQuery } from '@/db';
import { roots, forms, tenses, nouns, quranWords, ayahs, surahs, translationEntries } from '@/db/schema';
import { eq, asc, inArray, and, sql } from 'drizzle-orm';
import { Skeleton } from '@/components/ui/Skeleton';
import { RootDetailClient } from '@/components/roots/RootDetailClient';
import { QuranicOccurrences } from '@/components/roots/QuranicOccurrences';
import Link from 'next/link';

interface Props {
  params: { rootId: string };
}

export const revalidate = false;

export async function generateMetadata({ params }: Props) {
  const rootName = decodeURIComponent(params.rootId).replace(/\s/g, '');
  const rootRow = await db
    .select({ root: roots.root, meaning: roots.meaning, totalFreq: roots.totalFreq })
    .from(roots)
    .where(eq(roots.root, rootName))
    .limit(1);

  if (!rootRow[0]) return { title: 'Root Not Found' };
  const r = rootRow[0];
  const url = `https://quroots.com/roots/${encodeURIComponent(r.root)}`;
  const title = `${r.root} (${r.meaning}) — Quranic Arabic Root, Verb Forms & Occurrences`;
  const description = `Study the Quranic Arabic root ${r.root} meaning "${r.meaning}". ${r.totalFreq} occurrences in the Quran with all 10 verb forms, derived nouns, conjugation tables, and verse-by-verse usage.`;
  return {
    title,
    description,
    alternates: { canonical: url },
    keywords: [
      `${r.root} root`,
      `${r.meaning} Arabic`,
      'Quranic root',
      'Arabic verb forms',
      'Arabic morphology',
      'sarf',
      'Quranic Arabic vocabulary',
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

export default async function RootDetailPage({ params }: Props) {
  const rawName = decodeURIComponent(params.rootId);
  // Support both spaced "ع و ذ" and unspaced "عوذ" formats
  const rootName = rawName.replace(/\s/g, '');

  // Fetch root
  const rootRows = await dbQuery(() =>
    db.select().from(roots).where(eq(roots.root, rootName)).limit(1)
  );

  if (!rootRows[0]) notFound();
  const root = rootRows[0];

  // Fetch forms + tenses (single query with inArray instead of N+1)
  const formRows = await dbQuery(() =>
    db.select().from(forms).where(eq(forms.rootId, root.id)).orderBy(asc(forms.sortOrder))
  );

  const formIds = formRows.map((f) => f.id);
  let allTenses: (typeof tenses.$inferSelect)[] = [];
  if (formIds.length > 0) {
    allTenses = await dbQuery(() =>
      db.select().from(tenses).where(inArray(tenses.formId, formIds))
    );
  }

  // Index tenses by formId
  const tensesByForm = new Map<string, typeof allTenses>();
  for (const t of allTenses) {
    if (!tensesByForm.has(t.formId)) tensesByForm.set(t.formId, []);
    tensesByForm.get(t.formId)!.push(t);
  }

  // Fetch related nouns
  const nounRows = await dbQuery(() =>
    db.select({
      lemma: nouns.lemma,
      type: nouns.type,
      meaning: nouns.meaning,
      totalFreq: nouns.totalFreq,
    }).from(nouns).where(eq(nouns.rootId, root.id)).orderBy(asc(nouns.type))
  );

  // Fetch Quranic occurrences — just get count + first 5 ayahs
  // quran_words stores root as spaced "ع و ذ", roots table stores unspaced "عوذ"
  const rootSpaced = root.root.split('').join(' ');

  // Count total distinct ayahs (lightweight query)
  const countResult = await db
    .select({ count: sql<number>`COUNT(DISTINCT (${quranWords.surahNumber}, ${quranWords.ayahNumber}))` })
    .from(quranWords)
    .where(eq(quranWords.rootArabic, rootSpaced));
  const totalAyahs = Number(countResult[0]?.count) || 0;

  // Fetch only first 5 ayahs worth of words for initial render
  const rootWordRows = totalAyahs > 0 ? await db
    .select({
      surahNumber: quranWords.surahNumber,
      ayahNumber: quranWords.ayahNumber,
      position: quranWords.position,
      textUthmani: quranWords.textUthmani,
    })
    .from(quranWords)
    .where(eq(quranWords.rootArabic, rootSpaced))
    .orderBy(asc(quranWords.surahNumber), asc(quranWords.ayahNumber), asc(quranWords.position))
    .limit(100) // enough to cover ~5 ayahs worth of words
    : [];

  // Get unique ayah keys (cap at 5 for initial load)
  const ayahKeys = new Set<string>();
  const rootPositions = new Map<string, Set<number>>();
  for (const w of rootWordRows) {
    const key = `${w.surahNumber}:${w.ayahNumber}`;
    if (!ayahKeys.has(key) && ayahKeys.size >= 5) continue; // stop at 5 unique ayahs
    ayahKeys.add(key);
    if (!rootPositions.has(key)) rootPositions.set(key, new Set());
    rootPositions.get(key)!.add(w.position);
  }

  const ayahKeyArr = Array.from(ayahKeys);
  const occurrences: {
    surahNumber: number;
    ayahNumber: number;
    surahName: string;
    ayahText: string;
    translation: string;
    words: { text: string; isRoot: boolean }[];
  }[] = [];

  if (ayahKeyArr.length > 0) {
    // Parse keys to build conditions
    const surahAyahPairs = ayahKeyArr.map((k) => {
      const [s, a] = k.split(':');
      return { surah: parseInt(s), ayah: parseInt(a) };
    });

    // Fetch all words for these ayahs to build highlighted text
    const allWordsForAyahs = await db
      .select({
        surahNumber: quranWords.surahNumber,
        ayahNumber: quranWords.ayahNumber,
        position: quranWords.position,
        textUthmani: quranWords.textUthmani,
        charType: quranWords.charType,
      })
      .from(quranWords)
      .where(
        sql`(${quranWords.surahNumber}, ${quranWords.ayahNumber}) IN (${sql.join(
          surahAyahPairs.map((p) => sql`(${p.surah}, ${p.ayah})`),
          sql`, `
        )})`
      )
      .orderBy(asc(quranWords.surahNumber), asc(quranWords.ayahNumber), asc(quranWords.position));

    // Group words by ayah
    const wordsByAyah = new Map<string, typeof allWordsForAyahs>();
    for (const w of allWordsForAyahs) {
      const key = `${w.surahNumber}:${w.ayahNumber}`;
      if (!wordsByAyah.has(key)) wordsByAyah.set(key, []);
      wordsByAyah.get(key)!.push(w);
    }

    // Fetch ayah texts + translations
    const ayahRows = await db
      .select({
        surahNumber: ayahs.surahNumber,
        ayahNumber: ayahs.ayahNumber,
        textUthmani: ayahs.textUthmani,
      })
      .from(ayahs)
      .where(
        sql`(${ayahs.surahNumber}, ${ayahs.ayahNumber}) IN (${sql.join(
          surahAyahPairs.map((p) => sql`(${p.surah}, ${p.ayah})`),
          sql`, `
        )})`
      );

    const ayahTextMap = new Map<string, string>();
    for (const a of ayahRows) {
      ayahTextMap.set(`${a.surahNumber}:${a.ayahNumber}`, a.textUthmani);
    }

    // Fetch translations
    const transRows = await db
      .select({
        surahNumber: translationEntries.surahNumber,
        ayahNumber: translationEntries.ayahNumber,
        text: translationEntries.text,
      })
      .from(translationEntries)
      .where(
        sql`(${translationEntries.surahNumber}, ${translationEntries.ayahNumber}) IN (${sql.join(
          surahAyahPairs.map((p) => sql`(${p.surah}, ${p.ayah})`),
          sql`, `
        )})`
      );

    const transMap = new Map<string, string>();
    for (const t of transRows) {
      transMap.set(`${t.surahNumber}:${t.ayahNumber}`, t.text);
    }

    // Fetch surah names
    const surahNums = [...new Set(surahAyahPairs.map((p) => p.surah))];
    const surahRows = await db
      .select({ number: surahs.number, englishName: surahs.englishName })
      .from(surahs)
      .where(inArray(surahs.number, surahNums));

    const surahNameMap = new Map<number, string>();
    for (const s of surahRows) {
      surahNameMap.set(s.number, s.englishName);
    }

    // Build occurrence data
    for (const key of ayahKeyArr) {
      const [sStr, aStr] = key.split(':');
      const surahNum = parseInt(sStr);
      const ayahNum = parseInt(aStr);
      const positions = rootPositions.get(key) || new Set();
      const ayahWordsList = wordsByAyah.get(key) || [];

      const words = ayahWordsList
        .filter((w) => w.charType === 'word')
        .map((w) => ({
          text: w.textUthmani,
          isRoot: positions.has(w.position),
        }));

      occurrences.push({
        surahNumber: surahNum,
        ayahNumber: ayahNum,
        surahName: surahNameMap.get(surahNum) || `Surah ${surahNum}`,
        ayahText: ayahTextMap.get(key) || '',
        translation: transMap.get(key) || '',
        words,
      });
    }
  }

  // Serialize forms for client
  const formsData = formRows.map((f) => {
    const formTenses = tensesByForm.get(f.id) || [];
    return {
      id: f.id,
      formNumber: f.formNumber,
      arabicPattern: f.arabicPattern,
      meaning: f.meaning || '',
      verbMeaning: f.verbMeaning || '',
      semanticMeaning: f.semanticMeaning || '',
      masdar: f.masdar || '',
      faaeil: f.faaeil || '',
      mafool: f.mafool || '',
      tenses: formTenses.map((t) => ({
        type: t.type,
        arabicName: t.arabicName,
        englishName: t.englishName,
        occurrences: t.occurrences || 0,
        conjugation: (t.conjugations as { person: string; arabic: string; transliteration: string }[]) || [],
      })),
    };
  });

  const nounTypeLabels: Record<string, string> = {
    noun: 'Noun',
    active_participle: 'Active Participle',
    passive_participle: 'Passive Participle',
    adjective: 'Adjective',
    masdar: 'Masdar',
    proper_noun: 'Proper Noun',
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'DefinedTerm',
        '@id': `https://quroots.com/roots/${encodeURIComponent(root.root)}#term`,
        'name': root.root,
        'description': `Quranic Arabic root meaning "${root.meaning}". ${root.totalFreq} occurrences in the Quran.`,
        'inDefinedTermSet': {
          '@type': 'DefinedTermSet',
          'name': 'Quranic Arabic Roots',
          'url': 'https://quroots.com/roots',
        },
        'url': `https://quroots.com/roots/${encodeURIComponent(root.root)}`,
        'inLanguage': 'ar',
      },
      {
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://quroots.com' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Roots', 'item': 'https://quroots.com/roots' },
          { '@type': 'ListItem', 'position': 3, 'name': `${root.root} — ${root.meaning}`, 'item': `https://quroots.com/roots/${encodeURIComponent(root.root)}` },
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
      {/* Back link */}
      <Link href="/roots" className="inline-flex items-center gap-1 text-[14px] text-text-tertiary hover:text-text transition-colors mb-6">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        All Roots
      </Link>

      {/* Hero: the root itself, big, with its letters apart so they read as three letters */}
      <header className="text-center mb-14">
        <p className="font-arabic leading-[1.3] mb-2" dir="rtl" lang="ar" style={{ fontSize: 'clamp(72px, 12vw, 128px)', color: 'var(--color-primary)', textShadow: '0 0 60px rgba(212,162,70,0.35)' }}>
          {root.root.split('').join(' ')}
        </p>
        <h1 className="font-heading text-[30px] sm:text-[38px] leading-tight mb-3" style={{ color: 'var(--color-ivory)' }}>{root.meaning}</h1>
        <p className="text-[16px] text-text-secondary">
          {root.totalFreq ? <>Appears <b className="text-text font-semibold">{Number(root.totalFreq).toLocaleString()}</b> times in the Quran</> : 'A Quranic root'}
          {totalAyahs > 0 && <>, across {totalAyahs.toLocaleString()} ayahs</>}
        </p>
      </header>

      {/* The family: every word this root grows into, most common first */}
      {nounRows.length > 0 && (
        <section className="mb-14">
          <h2 className="font-heading text-[24px] mb-1" style={{ color: 'var(--color-ivory)' }}>The family</h2>
          <p className="text-[15px] text-text-tertiary mb-5">Words that grow from these three letters</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...nounRows].sort((x, y) => (y.totalFreq ?? 0) - (x.totalFreq ?? 0)).map((noun, i) => (
              <div key={i} className="rounded-2xl px-5 py-4" style={{ background: 'var(--color-surface)', border: i === 0 ? '1px solid rgba(212,162,70,0.35)' : '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-arabic text-[34px] leading-[1.5]" dir="rtl" lang="ar" style={{ color: 'var(--color-ivory)' }}>{noun.lemma}</p>
                  {noun.totalFreq ? <span className="text-[13px] tabular-nums text-text-tertiary mt-2 shrink-0">{noun.totalFreq}×</span> : null}
                </div>
                <p className="text-[15px] text-text-secondary leading-snug">{noun.meaning}</p>
                <p className="text-[12px] uppercase tracking-[0.12em] mt-2" style={{ color: 'var(--color-primary)' }}>{nounTypeLabels[noun.type] || noun.type}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Where it appears */}
      {totalAyahs > 0 && (
        <section className="mb-14">
          <h2 className="font-heading text-[24px] mb-1" style={{ color: 'var(--color-ivory)' }}>In the Quran</h2>
          <p className="text-[15px] text-text-tertiary mb-5">The root&rsquo;s words are highlighted in gold</p>
          <Suspense fallback={<div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>}>
            <QuranicOccurrences
              occurrences={occurrences}
              totalAyahs={totalAyahs}
              rootArabic={root.root}
            />
          </Suspense>
        </section>
      )}

      {/* Grammar, for those who want it */}
      {formsData.length > 0 && (
        <section className="mb-12">
          <h2 className="font-heading text-[24px] mb-1" style={{ color: 'var(--color-ivory)' }}>Verb forms</h2>
          <p className="text-[15px] text-text-tertiary mb-5">{formsData.length} form{formsData.length !== 1 ? 's' : ''} with full conjugation tables</p>
          <RootDetailClient forms={formsData} />
        </section>
      )}
    </div>
  );
}
