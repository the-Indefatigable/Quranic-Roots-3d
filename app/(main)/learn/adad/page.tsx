import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Adad (العدد) — Numbers in Arabic Grammar & the Quran',
  description:
    'Learn how Arabic numbers (adad) work: gender agreement, the reverse-gender rule for 3–10, teens, and how numbers appear in the Quran.',
  openGraph: {
    title: 'Adad — Arabic Numbers | QuRoots',
    description: 'Master Arabic number rules with Quranic examples.',
    url: 'https://quroots.com/learn/adad',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

export default function AdadPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'Adad — Numbers in Arabic Grammar',
    'url': 'https://quroots.com/learn/adad',
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
          <span className="text-white/50">Adad</span>
        </nav>

        <p className="text-4xl font-arabic text-gold/70 mb-3">العدد</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          Adad — Numbers in Arabic
        </h1>
        <p className="text-white/50 text-lg leading-relaxed mb-10">
          Arabic numbers are famously complex. The counted noun (<em>ma&apos;dud</em>) interacts with the number (<em>&apos;adad</em>) through gender agreement, case, and grammatical state — and the rules change depending on the range of the number.
        </p>

        {/* 1-2 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Numbers 1 & 2 — Agreement</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            One and two <strong className="text-white/60">agree in gender</strong> with the counted noun. They typically come <em>after</em> the noun as adjectives.
          </p>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="text-sm text-white/30 uppercase tracking-wider font-semibold mb-3">Surah Al-Baqarah (2:163)</p>
            <p className="text-2xl font-arabic text-white/80 text-right leading-loose mb-3" dir="rtl">
              وَإِلَـٰهُكُمْ إِلَـٰهٌ وَاحِدٌ
            </p>
            <p className="text-sm text-white/50">
              <strong className="text-white/70">إِلَـٰهٌ وَاحِدٌ</strong> — &quot;one God&quot; — وَاحِد (masculine) agrees with إله (masculine noun).
            </p>
          </div>
        </section>

        {/* 3-10 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Numbers 3–10 — The Reverse Gender Rule</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            This is the most notorious rule in Arabic grammar. For numbers 3 through 10, the number takes the <strong className="text-white/60">opposite gender</strong> of the counted noun. The counted noun is <strong className="text-white/60">plural and in jarr</strong> (genitive).
          </p>
          <div className="rounded-xl border border-amber-500/10 bg-amber-500/[0.03] p-4 mb-4">
            <p className="text-sm text-amber-400/80">
              <strong>The rule:</strong> If the singular noun is masculine, the number gets a ta&apos; marbuta (looks feminine). If the noun is feminine, the number drops it (looks masculine). Yes, it&apos;s backwards!
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <div className="space-y-4">
              {[
                {
                  ar: 'سَبْعَ سَمَاوَاتٍ',
                  en: 'seven heavens',
                  note: 'سماء is feminine → سبع has no ta\' marbuta (reverse gender)',
                  ref: 'Al-Baqarah 2:29',
                },
                {
                  ar: 'ثَلَاثَةَ أَيَّامٍ',
                  en: 'three days',
                  note: 'يوم is masculine → ثلاثة has ta\' marbuta (reverse gender)',
                  ref: 'Al-Baqarah 2:196',
                },
                {
                  ar: 'خَمْسَةَ أَيَّامٍ',
                  en: 'Not Quranic, but: five days',
                  note: 'يوم masculine → خمسة with ta\' marbuta',
                  ref: '',
                },
              ].map((ex) => (
                <div key={ex.ar}>
                  <p className="font-arabic text-xl text-white/70 text-right mb-1" dir="rtl">{ex.ar}</p>
                  <p className="text-xs text-white/30 mb-0.5">{ex.en} {ex.ref && <span className="text-white/20">({ex.ref})</span>}</p>
                  <p className="text-xs text-white/25">{ex.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 11-19 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Numbers 11–19 — Compound Numbers</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            For 11 and 12, both parts agree with the noun in gender. For 13–19, the first part follows the reverse-gender rule (like 3–10), while the second part (عشر) agrees with the noun. The counted noun is <strong className="text-white/60">singular and in nasb</strong> (accusative).
          </p>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="text-sm text-white/30 uppercase tracking-wider font-semibold mb-3">Surah Yusuf (12:4)</p>
            <p className="text-2xl font-arabic text-white/80 text-right leading-loose mb-3" dir="rtl">
              إِنِّي رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا
            </p>
            <p className="text-sm text-white/50">
              <strong className="text-white/70">أَحَدَ عَشَرَ كَوْكَبًا</strong> — &quot;eleven stars&quot; — both parts masculine (matching كوكب), counted noun is singular accusative (كوكبًا).
            </p>
          </div>
        </section>

        {/* 20-99 */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Numbers 20–99</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            The tens (20, 30, 40, ... 90) are treated as sound masculine plurals and do not change for gender. The counted noun is <strong className="text-white/60">singular and in nasb</strong>.
          </p>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
            <p className="text-sm text-white/30 uppercase tracking-wider font-semibold mb-3">Surah Al-Ankabut (29:14)</p>
            <p className="text-2xl font-arabic text-white/80 text-right leading-loose mb-3" dir="rtl">
              أَلْفَ سَنَةٍ إِلَّا خَمْسِينَ عَامًا
            </p>
            <p className="text-sm text-white/50">
              <strong className="text-white/70">خَمْسِينَ عَامًا</strong> — &quot;fifty years&quot; — خمسين does not change for gender, عامًا is singular accusative.
            </p>
          </div>
        </section>

        {/* Key Takeaways */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Key Takeaways</h2>
          <ul className="space-y-2 text-sm text-white/45 leading-relaxed">
            <li className="flex gap-2"><span className="text-gold/60 shrink-0">1.</span> Numbers 1–2 agree in gender with the noun (simple).</li>
            <li className="flex gap-2"><span className="text-gold/60 shrink-0">2.</span> Numbers 3–10 take the <em>opposite</em> gender (the famous reverse rule). Noun is plural jarr.</li>
            <li className="flex gap-2"><span className="text-gold/60 shrink-0">3.</span> Numbers 11–99 take the counted noun as <em>singular accusative</em> (nasb).</li>
            <li className="flex gap-2"><span className="text-gold/60 shrink-0">4.</span> In the Quran, pay attention to the ta&apos; marbuta on the number — it reveals the gender of the counted noun.</li>
          </ul>
        </section>

        <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
          <Link href="/learn/murakkab" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            &larr; Compound Phrases
          </Link>
          <Link href="/learn/verb-forms" className="text-sm text-gold/70 hover:text-gold transition-colors">
            Next: The 10 Verb Forms &rarr;
          </Link>
        </div>
      </article>
    </>
  );
}
