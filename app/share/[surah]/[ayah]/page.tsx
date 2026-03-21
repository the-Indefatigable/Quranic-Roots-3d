import { notFound, redirect } from 'next/navigation';
import { db, dbQuery } from '@/db';
import { ayahs, translationEntries, translations, surahs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Metadata } from 'next';

interface Props {
  params: { surah: string; ayah: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = parseInt(params.surah);
  const a = parseInt(params.ayah);
  if (isNaN(s) || isNaN(a)) return {};

  const [surahRow] = await dbQuery(() =>
    db.select({ englishName: surahs.englishName }).from(surahs).where(eq(surahs.number, s)).limit(1)
  );

  const [transRow] = await dbQuery(async () => {
    const [t] = await db.select({ id: translations.id }).from(translations).limit(1);
    if (!t) return [];
    return db.select({ text: translationEntries.text })
      .from(translationEntries)
      .where(and(
        eq(translationEntries.translationId, t.id),
        eq(translationEntries.surahNumber, s),
        eq(translationEntries.ayahNumber, a)
      ))
      .limit(1);
  });

  const title = `${surahRow?.englishName ?? `Surah ${s}`} ${s}:${a} — QuRoots`;
  const description = transRow?.text
    ? transRow.text.slice(0, 160)
    : `Read Surah ${surahRow?.englishName ?? s}, Ayah ${a} on QuRoots`;

  const ogImageUrl = `/api/og/ayah?s=${s}&a=${a}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

// This page just redirects to the surah reader — it exists only for OG meta tags
export default async function SharePage({ params }: Props) {
  const s = parseInt(params.surah);
  const a = parseInt(params.ayah);
  if (isNaN(s) || isNaN(a) || s < 1 || s > 114) notFound();

  // Verify the ayah exists
  const [ayahRow] = await dbQuery(() =>
    db.select({ ayahNumber: ayahs.ayahNumber })
      .from(ayahs)
      .where(and(eq(ayahs.surahNumber, s), eq(ayahs.ayahNumber, a)))
      .limit(1)
  );

  if (!ayahRow) notFound();

  redirect(`/quran/${s}`);
}
