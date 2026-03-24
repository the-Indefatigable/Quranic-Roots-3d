import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Awzaan al-Fi\'l — The 10 Arabic Verb Forms Explained with Quranic Examples',
  description:
    'A complete guide to Arabic verb forms (I–X). Learn how each wazn (pattern) modifies the root meaning, with side-by-side Quranic examples for every form.',
  openGraph: {
    title: 'The 10 Arabic Verb Forms | QuRoots',
    description: 'Master Arabic verb patterns (awzaan) with Quranic examples for Forms I–X.',
    url: 'https://quroots.com/learn/verb-forms',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const forms = [
  {
    num: 'I',
    pattern: 'فَعَلَ',
    patternLatin: "fa'ala",
    meaning: 'Base meaning — the root meaning itself',
    example: 'كَتَبَ',
    exampleMeaning: 'he wrote',
    root: 'ك ت ب',
    quranic: 'كَتَبَ عَلَيْكُمُ الصِّيَامَ',
    ref: 'Al-Baqarah 2:183',
    refMeaning: 'Fasting has been prescribed for you',
  },
  {
    num: 'II',
    pattern: 'فَعَّلَ',
    patternLatin: "fa''ala",
    meaning: 'Intensification, causation, or making someone do something',
    example: 'عَلَّمَ',
    exampleMeaning: 'he taught (caused to know)',
    root: 'ع ل م',
    quranic: 'عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ',
    ref: 'Al-Alaq 96:5',
    refMeaning: 'He taught man what he did not know',
  },
  {
    num: 'III',
    pattern: 'فَاعَلَ',
    patternLatin: "faa'ala",
    meaning: 'Doing the action with/to someone (mutual or directed)',
    example: 'قَاتَلَ',
    exampleMeaning: 'he fought (with someone)',
    root: 'ق ت ل',
    quranic: 'وَقَاتِلُوا فِي سَبِيلِ اللَّهِ',
    ref: 'Al-Baqarah 2:190',
    refMeaning: 'And fight in the way of Allah',
  },
  {
    num: 'IV',
    pattern: 'أَفْعَلَ',
    patternLatin: "af'ala",
    meaning: 'Causative — making something happen or entering a state',
    example: 'أَسْلَمَ',
    exampleMeaning: 'he submitted (entered Islam)',
    root: 'س ل م',
    quranic: 'إِذْ قَالَ لَهُ رَبُّهُ أَسْلِمْ',
    ref: 'Al-Baqarah 2:131',
    refMeaning: 'When his Lord said to him: Submit!',
  },
  {
    num: 'V',
    pattern: 'تَفَعَّلَ',
    patternLatin: "tafa''ala",
    meaning: 'Reflexive of Form II — doing the action to oneself, gradual process',
    example: 'تَعَلَّمَ',
    exampleMeaning: 'he learned (taught himself)',
    root: 'ع ل م',
    quranic: 'وَيَتَعَلَّمُونَ مَا يَضُرُّهُمْ',
    ref: 'Al-Baqarah 2:102',
    refMeaning: 'And they learn what harms them',
  },
  {
    num: 'VI',
    pattern: 'تَفَاعَلَ',
    patternLatin: "tafaa'ala",
    meaning: 'Mutual/reciprocal action, or pretending to do something',
    example: 'تَسَاءَلَ',
    exampleMeaning: 'they questioned one another',
    root: 'س أ ل',
    quranic: 'عَمَّ يَتَسَاءَلُونَ',
    ref: 'An-Naba 78:1',
    refMeaning: 'About what are they asking one another?',
  },
  {
    num: 'VII',
    pattern: 'اِنْفَعَلَ',
    patternLatin: "infa'ala",
    meaning: 'Passive/reflexive — something happening to the subject',
    example: 'اِنْكَسَرَ',
    exampleMeaning: 'it broke (was broken)',
    root: 'ك س ر',
    quranic: 'إِذَا السَّمَاءُ انفَطَرَتْ',
    ref: 'Al-Infitar 82:1',
    refMeaning: 'When the sky breaks apart',
  },
  {
    num: 'VIII',
    pattern: 'اِفْتَعَلَ',
    patternLatin: "ifta'ala",
    meaning: 'Reflexive with effort — doing something for oneself',
    example: 'اِكْتَسَبَ',
    exampleMeaning: 'he earned (for himself)',
    root: 'ك س ب',
    quranic: 'لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ',
    ref: 'Al-Baqarah 2:286',
    refMeaning: 'It (the soul) gets what it earns, and bears what it earns',
  },
  {
    num: 'IX',
    pattern: 'اِفْعَلَّ',
    patternLatin: "if'alla",
    meaning: 'Colors and physical defects (rare)',
    example: 'اِحْمَرَّ',
    exampleMeaning: 'it became red',
    root: 'ح م ر',
    quranic: 'وَمِنَ الْجِبَالِ جُدَدٌ بِيضٌ وَحُمْرٌ',
    ref: 'Fatir 35:27',
    refMeaning: 'And among the mountains are tracts, white and red',
  },
  {
    num: 'X',
    pattern: 'اِسْتَفْعَلَ',
    patternLatin: "istaf'ala",
    meaning: 'Seeking or requesting the root action, or considering',
    example: 'اِسْتَغْفَرَ',
    exampleMeaning: 'he sought forgiveness',
    root: 'غ ف ر',
    quranic: 'فَاسْتَغْفِرُوا لِذُنُوبِهِمْ',
    ref: 'Aal Imran 3:135',
    refMeaning: 'And they sought forgiveness for their sins',
  },
];

export default function VerbFormsPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': 'The 10 Arabic Verb Forms — A Complete Guide with Quranic Examples',
    'url': 'https://quroots.com/learn/verb-forms',
    'publisher': { '@type': 'Organization', 'name': 'QuRoots' },
    'educationalLevel': 'Advanced',
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
          <span className="text-white/50">Verb Forms</span>
        </nav>

        <p className="text-4xl font-arabic text-gold/70 mb-3">أوزان الفعل</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
          The 10 Arabic Verb Forms
        </h1>
        <p className="text-white/50 text-lg leading-relaxed mb-4">
          Arabic verbs follow patterns called <em>awzaan</em> (أوزان, singular: <em>wazn</em>). Each three-letter root can be plugged into up to 10 different verb forms, each modifying the base meaning in a predictable way. Mastering these patterns lets you decode unfamiliar words instantly.
        </p>
        <p className="text-white/45 text-base leading-relaxed mb-10">
          The template uses the letters <strong className="font-arabic text-white/60">ف ع ل</strong> (fa-&apos;ain-lam) as placeholders. Form I is <strong className="font-arabic text-white/60">فَعَلَ</strong>, and each subsequent form adds prefixes, doubles letters, or inserts vowels according to its pattern.
        </p>

        {/* Forms Grid */}
        <div className="space-y-4 mb-12">
          {forms.map((f) => (
            <div key={f.num} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <span className="text-xs font-bold text-gold/50 uppercase tracking-wider">Form {f.num}</span>
                  <div className="flex items-baseline gap-3 mt-1">
                    <span className="font-arabic text-2xl text-white/80" dir="rtl">{f.pattern}</span>
                    <span className="text-sm text-white/25">{f.patternLatin}</span>
                  </div>
                </div>
                <span className="text-xs text-white/20 font-mono shrink-0">{f.root}</span>
              </div>

              <p className="text-sm text-white/50 mb-4">{f.meaning}</p>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-center">
                  <p className="font-arabic text-lg text-white/70" dir="rtl">{f.example}</p>
                  <p className="text-[10px] text-white/25">{f.exampleMeaning}</p>
                </div>
              </div>

              <div className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-4">
                <p className="font-arabic text-lg text-white/70 text-right leading-loose mb-2" dir="rtl">{f.quranic}</p>
                <p className="text-xs text-white/30">
                  <span className="text-white/20">{f.ref}</span> — {f.refMeaning}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Pattern Recognition Tips */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">How to Recognize Forms Quickly</h2>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
            <ul className="space-y-2 text-sm text-white/45 leading-relaxed">
              <li><strong className="text-white/60">Doubled middle letter?</strong> → Form II</li>
              <li><strong className="text-white/60">Alif after first root letter?</strong> → Form III</li>
              <li><strong className="text-white/60">Hamza prefix (أَ)?</strong> → Form IV</li>
              <li><strong className="text-white/60">تَ prefix + doubled middle?</strong> → Form V</li>
              <li><strong className="text-white/60">تَ prefix + alif after first root?</strong> → Form VI</li>
              <li><strong className="text-white/60">اِنْ prefix?</strong> → Form VII</li>
              <li><strong className="text-white/60">تَ inserted after first root letter?</strong> → Form VIII</li>
              <li><strong className="text-white/60">Doubled final letter?</strong> → Form IX</li>
              <li><strong className="text-white/60">اِسْتَ prefix?</strong> → Form X</li>
            </ul>
          </div>
        </section>

        {/* Key Takeaways */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-white mb-4">Key Takeaways</h2>
          <ul className="space-y-2 text-sm text-white/45 leading-relaxed">
            <li className="flex gap-2"><span className="text-gold/60 shrink-0">1.</span> Arabic has 10 verb forms, each modifying the root meaning in a predictable way.</li>
            <li className="flex gap-2"><span className="text-gold/60 shrink-0">2.</span> Forms I–IV are the most common in the Quran. Forms V–X appear less frequently but are still important.</li>
            <li className="flex gap-2"><span className="text-gold/60 shrink-0">3.</span> Learning the patterns lets you decode new words — if you know the root and the form, you can guess the meaning.</li>
            <li className="flex gap-2"><span className="text-gold/60 shrink-0">4.</span> Use the <Link href="/roots" className="text-gold/70 hover:text-gold underline">Roots Browser</Link> on QuRoots to explore all verb forms for any root.</li>
          </ul>
        </section>

        <div className="flex items-center justify-between pt-8 border-t border-white/[0.06]">
          <Link href="/learn/adad" className="text-sm text-white/30 hover:text-white/60 transition-colors">
            &larr; Numbers in Arabic
          </Link>
          <Link href="/learn" className="text-sm text-gold/70 hover:text-gold transition-colors">
            All Lessons &rarr;
          </Link>
        </div>
      </article>
    </>
  );
}
