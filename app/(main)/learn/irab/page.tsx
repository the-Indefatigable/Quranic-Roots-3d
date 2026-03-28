import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'I\'rab (الإعراب) — Arabic Grammatical Case Endings Explained',
  description:
    'Learn i\'rab: how Arabic words change endings based on grammatical role. Covers raf\' (nominative), nasb (accusative), jarr (genitive), and jazm (jussive) with Quranic examples.',
  openGraph: {
    title: 'I\'rab — Arabic Case Endings | QuRoots',
    description: 'Master the Arabic case system with Quranic examples.',
    url: 'https://quroots.com/learn/irab',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'I\'rab — Arabic Case Endings | QuRoots',
    description: 'Master the Arabic case system with Quranic examples.',
    images: ['/og-image.png'],
  },
};

export default function IrabPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'I\'rab (الإعراب) — Arabic Grammatical Case Endings Explained',
    'description': 'A comprehensive guide to Arabic case endings (i\'rab) with Quranic examples.',
    'url': 'https://quroots.com/learn/irab',
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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-white/30 mb-8">
          <Link href="/learn" className="hover:text-white/60 transition-colors">Learn</Link>
          <span>/</span>
          <span className="text-white/50">I&apos;rab</span>
        </nav>

        <p className="text-4xl font-arabic text-primary/70 mb-3">الإعراب</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          I&apos;rab — Grammatical Case Endings
        </h1>
        <p className="text-white/50 text-lg leading-relaxed mb-10">
          I&apos;rab is the system of vowel endings that mark a word&apos;s grammatical function in Arabic. It is arguably the most important concept in Arabic grammar — without it, you cannot tell the subject from the object in a sentence.
        </p>

        {/* What is I'rab */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">What is I&apos;rab?</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            In English, word order tells us who did what: &quot;The man hit the ball&quot; has a different meaning from &quot;The ball hit the man.&quot; Arabic works differently. The <strong className="text-white/70">ending of each word</strong> changes to show its role — subject, object, or linked by a preposition.
          </p>
          <p className="text-white/45 leading-relaxed mb-4">
            This means Arabic word order is flexible. The verb can come first, the object can come first, or the subject can come first — and the meaning stays clear because the endings tell you which word plays which role.
          </p>
          <div className="rounded-2xl border border-border-light bg-surface p-6 mb-4">
            <p className="text-sm text-white/30 uppercase tracking-wider font-semibold mb-3">Example from Surah Al-Fatiha (1:2)</p>
            <p className="text-2xl font-arabic text-white/80 text-right leading-loose mb-3" dir="rtl">
              الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ
            </p>
            <p className="text-sm text-white/50 leading-relaxed">
              <strong className="text-white/70">الْحَمْدُ</strong> (al-hamdu) — ends with <em>damma</em> (ُ) because it is the <em>mubtada&apos;</em> (subject), in the <strong className="text-primary/70">raf&apos;</strong> case.
              <br />
              <strong className="text-white/70">لِلَّهِ</strong> (lillahi) — ends with <em>kasra</em> (ِ) because it follows the preposition <em>li</em>, putting it in the <strong className="text-primary/70">jarr</strong> case.
              <br />
              <strong className="text-white/70">رَبِّ</strong> (rabbi) — also in <em>jarr</em> because it is a <em>badal</em> (appositive) following a <em>majrur</em> word.
            </p>
          </div>
        </section>

        {/* The Four Cases */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">The Four Cases of I&apos;rab</h2>

          <div className="grid gap-4 sm:grid-cols-2 mb-6">
            {[
              {
                name: "Raf' (الرَّفْع)",
                marker: 'Damma (ُ)',
                use: 'Subject of a sentence, predicate of nominal sentence',
                example: 'جَاءَ الرَّجُلُ',
                meaning: 'The man came',
                color: 'emerald',
              },
              {
                name: "Nasb (النَّصْب)",
                marker: 'Fatha (َ)',
                use: 'Direct object, after certain particles (إنَّ, أنَّ, etc.)',
                example: 'رَأَيْتُ الرَّجُلَ',
                meaning: 'I saw the man',
                color: 'blue',
              },
              {
                name: "Jarr (الجَرّ)",
                marker: 'Kasra (ِ)',
                use: 'After prepositions, second noun of idaafa',
                example: 'مَرَرْتُ بِالرَّجُلِ',
                meaning: 'I passed by the man',
                color: 'amber',
              },
              {
                name: "Jazm (الجَزْم)",
                marker: 'Sukun (ْ)',
                use: 'Verbs only — after lam al-amr, laa an-naahiya, in conditions',
                example: 'لَمْ يَذْهَبْ',
                meaning: 'He did not go',
                color: 'purple',
              },
            ].map((c) => (
              <div key={c.name} className="rounded-xl border border-border-light bg-surface p-5">
                <h3 className={`text-sm font-bold mb-1 ${
                  c.color === 'emerald' ? 'text-correct' :
                  c.color === 'blue' ? 'text-blue-400' :
                  c.color === 'amber' ? 'text-amber-400' : 'text-purple-400'
                }`}>{c.name}</h3>
                <p className="text-xs text-white/30 mb-2">Marker: {c.marker}</p>
                <p className="text-sm text-white/50 mb-3">{c.use}</p>
                <p className="font-arabic text-lg text-white/70 text-right mb-1" dir="rtl">{c.example}</p>
                <p className="text-xs text-white/30 italic">{c.meaning}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mu'rab vs Mabni */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Mu&apos;rab vs. Mabni — Declinable vs. Indeclinable</h2>
          <p className="text-white/45 leading-relaxed mb-4">
            Not every Arabic word changes its ending. Words are divided into two categories:
          </p>
          <div className="grid gap-4 sm:grid-cols-2 mb-4">
            <div className="rounded-xl border border-border-light bg-surface p-5">
              <h3 className="text-sm font-bold text-primary/70 mb-2">Mu&apos;rab (مُعْرَب)</h3>
              <p className="text-sm text-white/45 leading-relaxed">
                Words whose endings <strong className="text-white/70">do change</strong> based on their grammatical position. Most nouns and present-tense verbs are mu&apos;rab.
              </p>
            </div>
            <div className="rounded-xl border border-border-light bg-surface p-5">
              <h3 className="text-sm font-bold text-primary/70 mb-2">Mabni (مَبْنِي)</h3>
              <p className="text-sm text-white/45 leading-relaxed">
                Words whose endings <strong className="text-white/70">never change</strong> regardless of position. This includes pronouns, demonstratives (هذا, ذلك), past-tense verbs, and most particles.
              </p>
            </div>
          </div>
        </section>

        {/* Quranic Practice */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Practice: I&apos;rab in Surah Al-Ikhlas</h2>
          <div className="rounded-2xl border border-border-light bg-surface p-6">
            <p className="text-2xl font-arabic text-white/80 text-right leading-[2.2] mb-4" dir="rtl">
              قُلْ هُوَ اللَّهُ أَحَدٌ · اللَّهُ الصَّمَدُ · لَمْ يَلِدْ وَلَمْ يُولَدْ · وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ
            </p>
            <div className="space-y-3 text-sm text-white/45 leading-relaxed">
              <p>
                <strong className="text-white/70">اللَّهُ</strong> — Raf&apos; (damma). It is the mubtada&apos; (subject) in a nominal sentence.
              </p>
              <p>
                <strong className="text-white/70">أَحَدٌ</strong> — Raf&apos; (tanwin damma). It is the khabar (predicate).
              </p>
              <p>
                <strong className="text-white/70">الصَّمَدُ</strong> — Raf&apos; (damma). Khabar of the second sentence.
              </p>
              <p>
                <strong className="text-white/70">يَلِدْ / يُولَدْ</strong> — Jazm (sukun). Preceded by لَمْ which puts the mudari&apos; verb into jazm.
              </p>
              <p>
                <strong className="text-white/70">كُفُوًا</strong> — Nasb (tanwin fatha). It is a <em>haal</em> (state descriptor).
              </p>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Key Takeaways</h2>
          <ul className="space-y-2 text-sm text-white/45 leading-relaxed">
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">1.</span> I&apos;rab marks the <em>role</em> a word plays — subject, object, or governed by a preposition.</li>
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">2.</span> The four cases are: raf&apos; (ُ), nasb (َ), jarr (ِ), and jazm (ْ, verbs only).</li>
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">3.</span> Mu&apos;rab words change endings; mabni words do not.</li>
            <li className="flex gap-2"><span className="text-primary/60 shrink-0">4.</span> Learning i&apos;rab is the single biggest unlock for understanding the Quran without translation.</li>
          </ul>
        </section>

        {/* Next topic */}
        <div className="flex items-center justify-between pt-8 border-t border-border-light">
          <Link href="/learn" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            &larr; All Lessons
          </Link>
          <Link href="/learn/mufrad-muthanna-jam" className="text-sm text-primary/70 hover:text-primary transition-colors">
            Next: Singular, Dual & Plural &rarr;
          </Link>
        </div>
      </article>
    </>
  );
}
