import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mufrad, Muthanna & Jam\' — Singular, Dual & Plural in Arabic',
  description:
    'Learn the Arabic number system: mufrad (singular), muthanna (dual), and jam\' (plural) — including sound masculine/feminine plurals and broken plurals with Quranic examples.',
  openGraph: {
    title: 'Singular, Dual & Plural in Arabic | QuRoots',
    description: 'Master mufrad, muthanna, and jam\' with Quranic examples.',
    url: 'https://quroots.com/blog/mufrad-muthanna-jam',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function MufradPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Mufrad, Muthanna & Jam\' — Singular, Dual & Plural in Arabic',
    'url': 'https://quroots.com/blog/mufrad-muthanna-jam',
    'publisher': { '@type': 'Organization', 'name': 'QuRoots' },
    'educationalLevel': 'Beginner',
    'inLanguage': ['en', 'ar'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-12">
        <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
          <Link href="/learn" className="hover:text-white/60 transition-colors">Learn</Link>
          <span>/</span>
          <span className="text-white/50">Mufrad, Muthanna & Jam&apos;</span>
        </nav>

        <p className="text-4xl font-arabic text-primary/70 mb-3">مفرد · مثنى · جمع</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Singular, Dual & Plural
        </h1>
        <p className="text-white/50 text-lg leading-relaxed mb-10">
          Unlike English (which only has singular and plural), Arabic has three number forms: one thing (<em>mufrad</em>), exactly two things (<em>muthanna</em>), and three or more (<em>jam&apos;</em>). This distinction appears throughout the Quran.
        </p>

        {/* Mufrad */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Mufrad (مُفْرَد) — Singular</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            The base form of any noun. Most Arabic vocabulary you learn starts as mufrad.
          </p>
          <div className="rounded-xl border border-border-light bg-surface p-5">
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { ar: 'كِتَابٌ', en: 'a book' },
                { ar: 'رَجُلٌ', en: 'a man' },
                { ar: 'مُسْلِمَةٌ', en: 'a Muslim woman' },
              ].map((w) => (
                <div key={w.ar}>
                  <p className="font-arabic text-xl text-white/70 mb-1" dir="rtl">{w.ar}</p>
                  <p className="text-xs text-white/30">{w.en}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Muthanna */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Muthanna (مُثَنَّى) — Dual</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            For exactly two of something, Arabic adds a special suffix instead of using the number &quot;two.&quot; The dual suffix changes based on i&apos;rab:
          </p>
          <div className="rounded-xl border border-border-light bg-surface p-5 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-2">In Raf&apos; (nominative)</p>
                <p className="font-arabic text-xl text-white/70 text-right" dir="rtl">كِتَابَانِ</p>
                <p className="text-xs text-white/30 mt-1">two books — suffix: <strong className="text-correct/70">ـَانِ</strong></p>
              </div>
              <div>
                <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-2">In Nasb / Jarr</p>
                <p className="font-arabic text-xl text-white/70 text-right" dir="rtl">كِتَابَيْنِ</p>
                <p className="text-xs text-white/30 mt-1">two books — suffix: <strong className="text-blue-400/70">ـَيْنِ</strong></p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-border-light bg-surface p-6">
            <p className="text-sm text-white/30 uppercase tracking-wider font-semibold mb-3">Quranic Example — Surah Ar-Rahman (55:46)</p>
            <p className="text-2xl font-arabic text-white/80 text-right leading-loose mb-3" dir="rtl">
              وَلِمَنْ خَافَ مَقَامَ رَبِّهِ جَنَّتَانِ
            </p>
            <p className="text-sm text-white/50 leading-relaxed">
              <strong className="text-white/70">جَنَّتَانِ</strong> (jannatani) — &quot;two gardens,&quot; dual form of جَنَّة (garden), in raf&apos; with the ـَانِ suffix.
            </p>
          </div>
        </section>

        {/* Jam' */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Jam&apos; (جَمْع) — Plural</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            For three or more, Arabic has three types of plural:
          </p>

          <div className="space-y-4">
            {/* Sound Masculine Plural */}
            <div className="rounded-xl border border-border-light bg-surface p-5">
              <h3 className="text-sm font-bold text-correct mb-2">Jam&apos; Mudhakkar Salim — Sound Masculine Plural</h3>
              <p className="text-sm text-white/45 mb-3">Add <strong className="text-white/60">ـُونَ</strong> (raf&apos;) or <strong className="text-white/60">ـِينَ</strong> (nasb/jarr) to the singular.</p>
              <div className="flex gap-6 items-center">
                <div className="text-center">
                  <p className="font-arabic text-lg text-white/50" dir="rtl">مُسْلِمٌ</p>
                  <p className="text-[10px] text-white/25">singular</p>
                </div>
                <span className="text-white/20">&rarr;</span>
                <div className="text-center">
                  <p className="font-arabic text-lg text-white/70" dir="rtl">مُسْلِمُونَ</p>
                  <p className="text-[10px] text-white/25">plural (raf&apos;)</p>
                </div>
                <span className="text-white/20">/</span>
                <div className="text-center">
                  <p className="font-arabic text-lg text-white/70" dir="rtl">مُسْلِمِينَ</p>
                  <p className="text-[10px] text-white/25">plural (nasb/jarr)</p>
                </div>
              </div>
            </div>

            {/* Sound Feminine Plural */}
            <div className="rounded-xl border border-border-light bg-surface p-5">
              <h3 className="text-sm font-bold text-pink-400 mb-2">Jam&apos; Mu&apos;annath Salim — Sound Feminine Plural</h3>
              <p className="text-sm text-white/45 mb-3">Replace the ta&apos; marbuta with <strong className="text-white/60">ـَاتٌ</strong>.</p>
              <div className="flex gap-6 items-center">
                <div className="text-center">
                  <p className="font-arabic text-lg text-white/50" dir="rtl">مُسْلِمَةٌ</p>
                  <p className="text-[10px] text-white/25">singular</p>
                </div>
                <span className="text-white/20">&rarr;</span>
                <div className="text-center">
                  <p className="font-arabic text-lg text-white/70" dir="rtl">مُسْلِمَاتٌ</p>
                  <p className="text-[10px] text-white/25">plural</p>
                </div>
              </div>
            </div>

            {/* Broken Plural */}
            <div className="rounded-xl border border-border-light bg-surface p-5">
              <h3 className="text-sm font-bold text-amber-400 mb-2">Jam&apos; Taksir — Broken Plural</h3>
              <p className="text-sm text-white/45 mb-3">The internal structure of the word changes. There is no single rule — these must be memorized. Broken plurals are extremely common in the Quran.</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[
                  { sg: 'كِتَابٌ', pl: 'كُتُبٌ', en: 'books' },
                  { sg: 'رَجُلٌ', pl: 'رِجَالٌ', en: 'men' },
                  { sg: 'نَفْسٌ', pl: 'أَنْفُسٌ', en: 'souls' },
                ].map((w) => (
                  <div key={w.sg}>
                    <p className="font-arabic text-white/40 mb-0.5" dir="rtl">{w.sg}</p>
                    <p className="text-white/15 text-xs">&darr;</p>
                    <p className="font-arabic text-lg text-white/70" dir="rtl">{w.pl}</p>
                    <p className="text-[10px] text-white/25">{w.en}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Key Takeaways */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Key Takeaways</h2>
          <ul className="space-y-2 text-sm text-white/45 leading-relaxed">
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">1.</span> Arabic has three numbers: singular (مفرد), dual (مثنى), and plural (جمع).</li>
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">2.</span> Dual uses ـَانِ in raf&apos; and ـَيْنِ in nasb/jarr.</li>
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">3.</span> Sound plurals add a suffix; broken plurals change the word&apos;s internal pattern.</li>
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">4.</span> Broken plurals are the most common plural type in the Quran — learn them as you encounter each root.</li>
          </ul>
        </section>

        <div className="flex items-center justify-between pt-8 border-t border-border-light">
          <Link href="/blog/irab" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            &larr; I&apos;rab
          </Link>
          <Link href="/blog/murakkab" className="text-sm text-primary/70 hover:text-primary transition-colors">
            Next: Compound Phrases &rarr;
          </Link>
        </div>
      </article>
    </>
  );
}
