import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Murakkab (المركّب) — Compound Phrases in Arabic Grammar',
  description:
    'Learn the three types of Arabic compound phrases: idaafi (possessive), wasfi (descriptive), and mazji (blended). Includes Quranic examples and breakdown.',
  openGraph: {
    title: 'Murakkab — Arabic Compound Phrases | QuRoots',
    description: 'Master idaafi, wasfi, and mazji compounds with Quranic examples.',
    url: 'https://quroots.com/learn/murakkab',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function MurakkabPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Murakkab — Compound Phrases in Arabic Grammar',
    'url': 'https://quroots.com/learn/murakkab',
    'publisher': { '@type': 'Organization', 'name': 'QuRoots' },
    'educationalLevel': 'Intermediate',
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
          <span className="text-white/50">Murakkab</span>
        </nav>

        <p className="text-4xl font-arabic text-gold/70 mb-3">المركّب</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Murakkab — Compound Phrases
        </h1>
        <p className="text-white/50 text-lg leading-relaxed mb-10">
          A <em>murakkab</em> is a phrase made of two or more words that together form a single meaning unit. Arabic has three main types, and understanding them is essential for parsing Quranic sentences correctly.
        </p>

        {/* Idaafi */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">1. Murakkab Idaafi (المركّب الإضافي) — Possessive Compound</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            The most common type in the Quran. Two nouns are placed together where the second noun &quot;possesses&quot; or specifies the first. The first noun (<em>mudaf</em>) loses its tanwin, and the second noun (<em>mudaf ilayhi</em>) is always in the <em>jarr</em> case.
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 mb-4">
            <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-3">Rule</p>
            <p className="text-sm text-white/50">
              <strong className="text-white/70">Mudaf</strong> (مُضاف) — no &quot;al&quot;, no tanwin &nbsp;+&nbsp; <strong className="text-white/70">Mudaf Ilayhi</strong> (مُضاف إليه) — always majrur (jarr case)
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="text-sm text-white/30 uppercase tracking-wider font-semibold mb-3">Quranic Examples</p>
            <div className="space-y-4">
              {[
                { ar: 'بِسْمِ اللَّهِ', tr: 'bismi-llahi', en: 'In the name of Allah', note: 'اسم is mudaf (no tanwin), الله is mudaf ilayhi (jarr)' },
                { ar: 'كِتَابُ اللَّهِ', tr: 'kitabu-llahi', en: 'The book of Allah', note: 'كتاب has no tanwin (it\'s mudaf), الله is in jarr' },
                { ar: 'يَوْمِ الدِّينِ', tr: 'yawmi-d-dini', en: 'Day of Judgment', note: 'يوم (mudaf) + الدين (mudaf ilayhi, jarr)' },
              ].map((ex) => (
                <div key={ex.ar}>
                  <p className="font-arabic text-xl text-white/70 text-right mb-1" dir="rtl">{ex.ar}</p>
                  <p className="text-xs text-white/30 mb-1"><em>{ex.tr}</em> — {ex.en}</p>
                  <p className="text-xs text-white/25">{ex.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Wasfi */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">2. Murakkab Wasfi (المركّب الوصفي) — Descriptive Compound</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            A noun followed by an adjective (or participle) that describes it. In Arabic, the adjective <strong className="text-white/60">must match</strong> the noun in four things: gender, number, definiteness, and case (i&apos;rab).
          </p>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="text-sm text-white/30 uppercase tracking-wider font-semibold mb-3">Quranic Examples</p>
            <div className="space-y-4">
              {[
                { ar: 'صِرَاطٍ مُّسْتَقِيمٍ', en: 'a straight path', note: 'Both are indefinite (tanwin), both in jarr — agreement!' },
                { ar: 'الرَّحْمَنِ الرَّحِيمِ', en: 'The Most Gracious, The Most Merciful', note: 'Both definite (al-), both in jarr — two adjectives describing Allah' },
                { ar: 'عَذَابٌ عَظِيمٌ', en: 'a great punishment', note: 'Both indefinite, both in raf\' — full agreement' },
              ].map((ex) => (
                <div key={ex.ar}>
                  <p className="font-arabic text-xl text-white/70 text-right mb-1" dir="rtl">{ex.ar}</p>
                  <p className="text-xs text-white/30 mb-1">{ex.en}</p>
                  <p className="text-xs text-white/25">{ex.note}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-4 mt-4">
            <p className="text-sm text-amber-400/80">
              <strong>How to tell idaafi from wasfi:</strong> In idaafi, the first word has no &quot;al&quot; and no tanwin. In wasfi, both words agree in definiteness — both have &quot;al&quot; or both have tanwin.
            </p>
          </div>
        </section>

        {/* Mazji */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">3. Murakkab Mazji (المركّب المزجي) — Blended Compound</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            Two words fused into a single proper noun. This is rare in Quranic Arabic but appears in some proper names. The two parts lose their individual i&apos;rab and are treated as one indeclinable (mabni) word.
          </p>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <p className="text-sm text-white/45">
              Examples from classical Arabic: <strong className="font-arabic text-white/60">بَعْلَبَكّ</strong> (Baalbek), <strong className="font-arabic text-white/60">حَضْرَمَوْت</strong> (Hadramawt). These compound names function as single nouns.
            </p>
          </div>
        </section>

        {/* Key Takeaways */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Key Takeaways</h2>
          <ul className="space-y-2 text-sm text-white/45 leading-relaxed">
            <li className="flex gap-2"><span className="text-gold/60 shrink-0">1.</span> Idaafi (possessive) is the most important compound type — the second noun is always in jarr.</li>
            <li className="flex gap-2"><span className="text-gold/60 shrink-0">2.</span> Wasfi (descriptive) requires the adjective to match the noun in gender, number, definiteness, and case.</li>
            <li className="flex gap-2"><span className="text-gold/60 shrink-0">3.</span> The key test: if the first word has no &quot;al&quot; and no tanwin, it&apos;s probably idaafi.</li>
          </ul>
        </section>

        <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
          <Link href="/learn/mufrad-muthanna-jam" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            &larr; Singular, Dual & Plural
          </Link>
          <Link href="/learn/adad" className="text-sm text-gold/70 hover:text-gold transition-colors">
            Next: Numbers in Arabic &rarr;
          </Link>
        </div>
      </article>
    </>
  );
}
