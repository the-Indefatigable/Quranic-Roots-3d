import { notFound } from 'next/navigation';
import { db, dbQuery } from '@/db';
import { ayahs, translationEntries, translations, surahs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Metadata } from 'next';
import Link from 'next/link';

interface Props {
  params: { surah: string; ayah: string };
}

async function getData(s: number, a: number) {
  const [surahRow] = await dbQuery(() =>
    db.select({ englishName: surahs.englishName, arabicName: surahs.arabicName })
      .from(surahs).where(eq(surahs.number, s)).limit(1)
  );

  const [ayahRow] = await dbQuery(() =>
    db.select({ textUthmani: ayahs.textUthmani })
      .from(ayahs)
      .where(and(eq(ayahs.surahNumber, s), eq(ayahs.ayahNumber, a)))
      .limit(1)
  );

  const [t] = await dbQuery(() =>
    db.select({ id: translations.id }).from(translations).limit(1)
  );
  const [transRow] = t
    ? await dbQuery(() =>
        db.select({ text: translationEntries.text })
          .from(translationEntries)
          .where(and(
            eq(translationEntries.translationId, t.id),
            eq(translationEntries.surahNumber, s),
            eq(translationEntries.ayahNumber, a)
          ))
          .limit(1)
      )
    : [];

  return { surahRow, ayahRow, translation: transRow?.text ?? '' };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = parseInt(params.surah);
  const a = parseInt(params.ayah);
  if (isNaN(s) || isNaN(a)) return {};

  const { surahRow, translation } = await getData(s, a);

  const title = `${surahRow?.englishName ?? `Surah ${s}`} ${s}:${a} — QuRoots`;
  const description = translation
    ? translation.slice(0, 160)
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

export default async function SharePage({ params }: Props) {
  const s = parseInt(params.surah);
  const a = parseInt(params.ayah);
  if (isNaN(s) || isNaN(a) || s < 1 || s > 114) notFound();

  const { surahRow, ayahRow, translation } = await getData(s, a);
  if (!ayahRow) notFound();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-16">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gold/[0.08] rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-2xl w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <Link href="/" className="text-lg font-light tracking-tight text-white">
            Qu<span className="text-gold">Roots</span>
          </Link>
        </div>

        {/* Verse card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-3xl p-8 sm:p-12 text-center">
          {/* Reference */}
          <p className="text-xs text-gold/60 tracking-widest uppercase mb-8">
            {surahRow?.englishName} · {s}:{a}
          </p>

          {/* Arabic */}
          <p className="font-arabic text-3xl sm:text-4xl text-white leading-[2] mb-8" dir="rtl">
            {ayahRow.textUthmani}
          </p>

          {/* Divider */}
          <div className="w-12 h-px bg-gold/20 mx-auto mb-8" />

          {/* Translation */}
          {translation && (
            <p className="text-base sm:text-lg text-white/55 italic leading-relaxed mb-10">
              &ldquo;{translation}&rdquo;
            </p>
          )}

          {/* CTA */}
          <Link
            href={`/quran/${s}`}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-gold to-gold-light text-black px-8 py-3.5 rounded-xl text-sm font-semibold hover:brightness-110 transition-all hover:shadow-[0_0_40px_rgba(212,165,116,0.3)]"
          >
            Read full Surah {surahRow?.englishName}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {/* Explore link */}
        <p className="text-center mt-6 text-xs text-white/20">
          Learn the Arabic roots behind every word at{' '}
          <Link href="/" className="text-white/40 hover:text-white transition-colors">
            quroots.com
          </Link>
        </p>
      </div>
    </div>
  );
}
