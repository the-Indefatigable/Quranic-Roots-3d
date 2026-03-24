import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { db, dbQuery } from '@/db';
import { roots, forms, tenses, nouns, quranWords, ayahs, surahs, translationEntries } from '@/db/schema';
import { eq, asc, inArray, and, sql } from 'drizzle-orm';
import { ArabicText } from '@/components/ui/ArabicText';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { RootDetailClient } from '@/components/roots/RootDetailClient';
import { QuranicOccurrences } from '@/components/roots/QuranicOccurrences';
import Link from 'next/link';

interface Props {
  params: { rootId: string };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const rootName = decodeURIComponent(params.rootId).replace(/\s/g, '');
  const rootRow = await db
    .select({ root: roots.root, meaning: roots.meaning, totalFreq: roots.totalFreq })
    .from(roots)
    .where(eq(roots.root, rootName))
    .limit(1);

  if (!rootRow[0]) return { title: 'Root Not Found' };
  const r = rootRow[0];
  const title = `${r.root} — ${r.meaning} | Quranic Root`;
  const description = `Explore the Quranic Arabic root ${r.root} meaning "${r.meaning}". ${r.totalFreq} occurrences in the Quran. View verb forms, derived nouns, and Quranic verses.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://quroots.com/roots/${encodeURIComponent(r.root)}`,
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary',
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

  return (
    <div>
      {/* Back link */}
      <Link href="/roots" className="inline-flex items-center gap-1 text-xs text-muted-more hover:text-white transition-colors mb-6">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        All Roots
      </Link>

      {/* Hero Header */}
      <div className="text-center mb-12">
        <ArabicText size="3xl" className="text-gold block mb-3">
          {root.root}
        </ArabicText>
        <p className="text-lg text-muted mb-3">{root.meaning}</p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Badge variant="gold">{root.totalFreq} occurrences</Badge>
          <Badge>{formsData.length} form{formsData.length !== 1 ? 's' : ''}</Badge>
          {totalAyahs > 0 && <Badge variant="emerald">{totalAyahs} ayahs</Badge>}
          {nounRows.length > 0 && <Badge>{nounRows.length} noun{nounRows.length !== 1 ? 's' : ''}</Badge>}
        </div>
      </div>

      {/* Forms with conjugation grids */}
      {formsData.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm text-muted-more uppercase tracking-widest mb-4">Verb Forms</h2>
          <RootDetailClient forms={formsData} />
        </section>
      )}

      {/* Quranic Occurrences — streamed with Suspense */}
      {totalAyahs > 0 && (
        <section className="mb-12">
          <h2 className="text-sm text-muted-more uppercase tracking-widest mb-4">
            Quranic Occurrences
          </h2>
          <Suspense fallback={<div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>}>
            <QuranicOccurrences
              occurrences={occurrences}
              totalAyahs={totalAyahs}
              rootArabic={root.root}
            />
          </Suspense>
        </section>
      )}

      {/* Derived Nouns */}
      {nounRows.length > 0 && (
        <section className="mb-12">
          <h2 className="text-sm text-muted-more uppercase tracking-widest mb-4">
            Derived Nouns ({nounRows.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nounRows.map((noun, i) => (
              <Card key={i} hover={false} className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ArabicText size="xl" className="text-white">{noun.lemma}</ArabicText>
                    <span className="text-xs text-muted">{noun.meaning}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="gold">{nounTypeLabels[noun.type] || noun.type}</Badge>
                    {noun.totalFreq && noun.totalFreq > 0 && (
                      <span className="text-[10px] text-muted-more">{noun.totalFreq}x</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
