import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title:
    'Arifa vs Alima vs Fahima — 3 Arabic Verbs of Knowledge Compared Across Verb Forms',
  description:
    'A side-by-side comparison of عَرَفَ (to recognize), عَلِمَ (to know), and فَهِمَ (to understand) across the 10 Arabic verb forms (awzaan). Includes Quranic examples, morphological breakdowns, and usage notes for each bab.',
  keywords: [
    'Arabic verbs of knowledge',
    'arifa vs alima',
    'fahima Arabic',
    'Quranic Arabic verbs',
    'Arabic verb forms',
    'awzaan',
    'bab Arabic grammar',
    'عرف علم فهم',
    'Arabic morphology',
    'Quran word study',
  ],
  openGraph: {
    title: 'Arifa vs Alima vs Fahima — 3 Verbs of Knowledge Compared | QuRoots',
    description:
      'Master the subtle differences between عَرَفَ, عَلِمَ, and فَهِمَ across all 10 Arabic verb forms with Quranic examples.',
    url: 'https://quroots.com/learn/arifa-vs-alima-vs-fahima',
    type: 'article',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Arifa vs Alima vs Fahima — Arabic Verbs of Knowledge',
    description:
      'Side-by-side comparison of 3 Quranic Arabic knowledge verbs across all 10 verb forms.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://quroots.com/learn/arifa-vs-alima-vs-fahima',
  },
};

/* ─── Verb data ──────────────────────────────────────────────────────── */

interface VerbEntry {
  form: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  quranic?: string;
  ref?: string;
  refMeaning?: string;
}

interface VerbRoot {
  root: string;
  rootLetters: string;
  baseMeaning: string;
  color: string;
  entries: VerbEntry[];
}

const ARIFA: VerbRoot = {
  root: 'عَرَفَ',
  rootLetters: 'ع ر ف',
  baseMeaning: 'to recognize, to be familiar with',
  color: '#D4A246',
  entries: [
    {
      form: 'I',
      arabic: 'عَرَفَ',
      transliteration: 'ʿarafa',
      meaning: 'he recognized / knew (by acquaintance)',
      quranic: 'يَعْرِفُونَهُ كَمَا يَعْرِفُونَ أَبْنَاءَهُمْ',
      ref: 'Al-Baqarah 2:146',
      refMeaning: 'They recognize him as they recognize their own sons',
    },
    {
      form: 'II',
      arabic: 'عَرَّفَ',
      transliteration: 'ʿarrafa',
      meaning: 'he made known, introduced, defined',
      quranic: 'عَرَّفَ بَعْضَهُ وَأَعْرَضَ عَن بَعْضٍ',
      ref: 'At-Tahrim 66:3',
      refMeaning: 'He made known part of it and ignored part',
    },
    {
      form: 'IV',
      arabic: 'أَعْرَفَ',
      transliteration: 'aʿrafa',
      meaning: 'he informed, notified (rare in Quran)',
    },
    {
      form: 'V',
      arabic: 'تَعَرَّفَ',
      transliteration: 'taʿarrafa',
      meaning: 'he became acquainted with, got to know',
    },
    {
      form: 'VI',
      arabic: 'تَعَارَفَ',
      transliteration: 'taʿārafa',
      meaning: 'they got to know one another',
      quranic: 'لِتَعَارَفُوا',
      ref: 'Al-Hujurat 49:13',
      refMeaning: 'So that you may get to know one another',
    },
    {
      form: 'X',
      arabic: 'اِسْتَعْرَفَ',
      transliteration: 'istaʿrafa',
      meaning: 'he sought to be recognized / introduced himself',
    },
  ],
};

const ALIMA: VerbRoot = {
  root: 'عَلِمَ',
  rootLetters: 'ع ل م',
  baseMeaning: 'to know (a fact), to have knowledge',
  color: '#5AB8A8',
  entries: [
    {
      form: 'I',
      arabic: 'عَلِمَ',
      transliteration: 'ʿalima',
      meaning: 'he knew (a fact or piece of information)',
      quranic: 'وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ',
      ref: 'Al-Baqarah 2:216',
      refMeaning: 'Allah knows and you do not know',
    },
    {
      form: 'II',
      arabic: 'عَلَّمَ',
      transliteration: 'ʿallama',
      meaning: 'he taught (caused someone to know)',
      quranic: 'عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ',
      ref: 'Al-Alaq 96:5',
      refMeaning: 'He taught man what he did not know',
    },
    {
      form: 'IV',
      arabic: 'أَعْلَمَ',
      transliteration: 'aʿlama',
      meaning: 'he informed, notified',
      quranic: 'أَعْلَمُ مِنَ اللَّهِ',
      ref: 'Al-Baqarah 2:140',
      refMeaning: 'More knowing than Allah?',
    },
    {
      form: 'V',
      arabic: 'تَعَلَّمَ',
      transliteration: 'taʿallama',
      meaning: 'he learned (taught himself)',
      quranic: 'وَيَتَعَلَّمُونَ مَا يَضُرُّهُمْ',
      ref: 'Al-Baqarah 2:102',
      refMeaning: 'And they learn what harms them',
    },
    {
      form: 'VI',
      arabic: 'تَعَالَمَ',
      transliteration: 'taʿālama',
      meaning: 'they mutually shared knowledge (rare)',
    },
  ],
};

const FAHIMA: VerbRoot = {
  root: 'فَهِمَ',
  rootLetters: 'ف ه م',
  baseMeaning: 'to understand, to comprehend deeply',
  color: '#A78BFA',
  entries: [
    {
      form: 'I',
      arabic: 'فَهِمَ',
      transliteration: 'fahima',
      meaning: 'he understood, comprehended',
      quranic: 'فَفَهَّمْنَاهَا سُلَيْمَانَ',
      ref: 'Al-Anbiya 21:79',
      refMeaning: 'And We gave understanding of it to Sulayman',
    },
    {
      form: 'II',
      arabic: 'فَهَّمَ',
      transliteration: 'fahhama',
      meaning: 'he made someone understand, explained',
      quranic: 'فَفَهَّمْنَاهَا سُلَيْمَانَ',
      ref: 'Al-Anbiya 21:79',
      refMeaning: 'We made Sulayman understand it (Form II used by Allah)',
    },
    {
      form: 'V',
      arabic: 'تَفَهَّمَ',
      transliteration: 'tafahhama',
      meaning: 'he tried to understand, pondered deeply',
    },
    {
      form: 'VI',
      arabic: 'تَفَاهَمَ',
      transliteration: 'tafāhama',
      meaning: 'they reached mutual understanding',
    },
    {
      form: 'X',
      arabic: 'اِسْتَفْهَمَ',
      transliteration: 'istafhama',
      meaning: 'he asked for clarification, inquired',
    },
  ],
};

const ALL_FORMS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

/* ─── Derivatives / Key nouns ─────────────────────────────────────────── */

const KEY_DERIVATIVES = [
  {
    root: 'ع ر ف',
    color: '#D4A246',
    words: [
      { arabic: 'مَعْرِفَة', transliteration: 'maʿrifa', meaning: 'knowledge (experiential)' },
      { arabic: 'عُرْف', transliteration: 'ʿurf', meaning: 'custom, convention' },
      { arabic: 'مَعْرُوف', transliteration: 'maʿrūf', meaning: 'what is recognized as good' },
      { arabic: 'عَرَفَات', transliteration: 'ʿArafāt', meaning: 'Arafat (where pilgrims "recognize")' },
    ],
  },
  {
    root: 'ع ل م',
    color: '#5AB8A8',
    words: [
      { arabic: 'عِلْم', transliteration: 'ʿilm', meaning: 'knowledge (factual/scholarly)' },
      { arabic: 'عَالِم', transliteration: 'ʿālim', meaning: 'scholar, one who knows' },
      { arabic: 'عَلِيم', transliteration: 'ʿalīm', meaning: 'All-Knowing (Name of Allah)' },
      { arabic: 'مُعَلِّم', transliteration: 'muʿallim', meaning: 'teacher' },
    ],
  },
  {
    root: 'ف ه م',
    color: '#A78BFA',
    words: [
      { arabic: 'فَهْم', transliteration: 'fahm', meaning: 'understanding, comprehension' },
      { arabic: 'تَفَاهُم', transliteration: 'tafāhum', meaning: 'mutual understanding' },
      { arabic: 'اِسْتِفْهام', transliteration: 'istifhām', meaning: 'inquiry, interrogation' },
      { arabic: 'مَفْهُوم', transliteration: 'mafhūm', meaning: 'concept, understood meaning' },
    ],
  },
];

/* ─── Page Component ──────────────────────────────────────────────────── */

export default function ArifaVsAlimaVsFahimaPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline:
      'Arifa vs Alima vs Fahima — Three Arabic Verbs of Knowledge Compared Across All Verb Forms',
    description:
      'A comprehensive side-by-side comparison of three Quranic Arabic verbs meaning "to know" — showing how each transforms through the 10 verb forms (awzaan) with examples from the Quran.',
    url: 'https://quroots.com/learn/arifa-vs-alima-vs-fahima',
    publisher: { '@type': 'Organization', name: 'QuRoots' },
    educationalLevel: 'Intermediate',
    inLanguage: ['en', 'ar'],
    datePublished: '2026-04-06',
    dateModified: '2026-04-06',
    keywords: [
      'Arabic verbs',
      'arifa',
      'alima',
      'fahima',
      'Quranic Arabic',
      'verb forms',
      'awzaan',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-text-tertiary mb-8" aria-label="Breadcrumb">
          <Link href="/learn" className="hover:text-text-secondary transition-colors">
            Learn
          </Link>
          <span>/</span>
          <span className="text-text-secondary">Arifa vs Alima vs Fahima</span>
        </nav>

        {/* ── Header ──────────────────────────────────────────── */}
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-5">
            <span
              className="font-arabic text-4xl leading-none"
              style={{ color: '#D4A246', textShadow: '0 0 28px rgba(212,162,70,0.25)' }}
            >
              عَرَفَ
            </span>
            <span className="text-2xl font-light" style={{ color: '#3D3C3A' }}>
              ·
            </span>
            <span
              className="font-arabic text-4xl leading-none"
              style={{ color: '#5AB8A8', textShadow: '0 0 28px rgba(90,184,168,0.25)' }}
            >
              عَلِمَ
            </span>
            <span className="text-2xl font-light" style={{ color: '#3D3C3A' }}>
              ·
            </span>
            <span
              className="font-arabic text-4xl leading-none"
              style={{ color: '#A78BFA', textShadow: '0 0 28px rgba(167,139,250,0.25)' }}
            >
              فَهِمَ
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-4">
            Three Arabic Verbs of Knowledge — Compared Across Every Verb Form
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed mb-3 max-w-2xl">
            Arabic doesn&apos;t have one word for &ldquo;to know.&rdquo; It has at least three — each
            capturing a different shade of knowing. Understanding when to use{' '}
            <strong className="font-arabic" style={{ color: '#D4A246' }}>عَرَفَ</strong>,{' '}
            <strong className="font-arabic" style={{ color: '#5AB8A8' }}>عَلِمَ</strong>, or{' '}
            <strong className="font-arabic" style={{ color: '#A78BFA' }}>فَهِمَ</strong> unlocks a deeper
            layer of Quranic meaning.
          </p>

          <div className="flex flex-wrap gap-2 mt-6">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ background: 'rgba(212,162,70,0.12)', color: '#D4A246' }}
            >
              Intermediate
            </span>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#636260' }}
            >
              5 min read
            </span>
          </div>
        </header>

        {/* ── Quick Overview Cards ────────────────────────────── */}
        <section className="mb-14" aria-labelledby="overview-heading">
          <h2 id="overview-heading" className="text-xl font-semibold text-text mb-5">
            At a Glance
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[ARIFA, ALIMA, FAHIMA].map((verb) => (
              <div
                key={verb.rootLetters}
                className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: `${verb.color}08`,
                  border: `1px solid ${verb.color}20`,
                }}
              >
                <p
                  className="font-arabic text-3xl leading-none mb-3"
                  style={{ color: verb.color }}
                  dir="rtl"
                >
                  {verb.root}
                </p>
                <p className="text-xs font-mono mb-2" style={{ color: '#636260' }}>
                  {verb.rootLetters}
                </p>
                <p className="text-sm font-semibold text-text mb-1">{verb.baseMeaning}</p>
                <p className="text-xs" style={{ color: '#636260' }}>
                  {verb.entries.length} active verb forms in Arabic
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── The Core Difference ─────────────────────────────── */}
        <section className="mb-14" aria-labelledby="difference-heading">
          <h2 id="difference-heading" className="text-xl font-semibold text-text mb-5">
            The Core Difference
          </h2>
          <div
            className="rounded-2xl border border-border bg-surface p-6 space-y-4"
          >
            <div className="flex gap-4 items-start">
              <span
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: 'rgba(212,162,70,0.15)', color: '#D4A246' }}
              >
                ع
              </span>
              <div>
                <p className="font-semibold text-text text-sm mb-1">عَرَفَ — Recognition &amp; Familiarity</p>
                <p className="text-xs leading-relaxed" style={{ color: '#636260' }}>
                  Knowing something by <em>experience</em>, personal acquaintance, or recognition. When the Quran says
                  the People of the Book &ldquo;recognize&rdquo; the Prophet ﷺ, it uses عَرَفَ — they <em>know</em> him
                  like they know their own children. It&apos;s personal, not abstract.
                </p>
              </div>
            </div>

            <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

            <div className="flex gap-4 items-start">
              <span
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: 'rgba(90,184,168,0.15)', color: '#5AB8A8' }}
              >
                ع
              </span>
              <div>
                <p className="font-semibold text-text text-sm mb-1">عَلِمَ — Factual Knowledge</p>
                <p className="text-xs leading-relaxed" style={{ color: '#636260' }}>
                  The most common &ldquo;to know&rdquo; in the Quran (854+ occurrences). عِلْم is knowledge as
                  <em> information</em> — facts, certainty, scholarly understanding. When Allah is called العَلِيم, it
                  means He possesses absolute factual knowledge of everything. This is the &ldquo;head&rdquo; knowledge.
                </p>
              </div>
            </div>

            <div className="h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />

            <div className="flex gap-4 items-start">
              <span
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: 'rgba(167,139,250,0.15)', color: '#A78BFA' }}
              >
                ف
              </span>
              <div>
                <p className="font-semibold text-text text-sm mb-1">فَهِمَ — Deep Comprehension</p>
                <p className="text-xs leading-relaxed" style={{ color: '#636260' }}>
                  Understanding at a <em>deeper</em> level — grasping the meaning, the why, the implications. When
                  Allah says He gave <em>fahm</em> to Prophet Sulayman (عليه السلام), it means a special insight beyond
                  mere facts. This is &ldquo;heart&rdquo; knowledge — penetrating comprehension.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Side-by-Side Verb Form Comparison ───────────────── */}
        <section className="mb-14" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-xl font-semibold text-text mb-2">
            Side-by-Side: All 10 Verb Forms (أبواب)
          </h2>
          <p className="text-xs mb-6" style={{ color: '#636260' }}>
            Not every root is used in every form. Empty cells mean that form is not commonly attested for that root.
          </p>

          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th
                    className="text-left text-[10px] uppercase tracking-wider font-bold px-4 py-3 border-b border-border"
                    style={{ color: '#636260', width: 56 }}
                  >
                    Bab
                  </th>
                  <th
                    className="text-center px-4 py-3 border-b border-border"
                    style={{ color: '#D4A246' }}
                  >
                    <span className="font-arabic text-base">عَرَفَ</span>
                    <span className="block text-[9px] mt-0.5 font-normal opacity-70">recognize</span>
                  </th>
                  <th
                    className="text-center px-4 py-3 border-b border-border"
                    style={{ color: '#5AB8A8' }}
                  >
                    <span className="font-arabic text-base">عَلِمَ</span>
                    <span className="block text-[9px] mt-0.5 font-normal opacity-70">know</span>
                  </th>
                  <th
                    className="text-center px-4 py-3 border-b border-border"
                    style={{ color: '#A78BFA' }}
                  >
                    <span className="font-arabic text-base">فَهِمَ</span>
                    <span className="block text-[9px] mt-0.5 font-normal opacity-70">understand</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {ALL_FORMS.map((form) => {
                  const a = ARIFA.entries.find((e) => e.form === form);
                  const b = ALIMA.entries.find((e) => e.form === form);
                  const c = FAHIMA.entries.find((e) => e.form === form);
                  const hasAny = a || b || c;
                  if (!hasAny) return null;
                  return (
                    <tr
                      key={form}
                      className="transition-colors hover:bg-white/[0.02]"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-bold" style={{ color: '#A09F9B' }}>
                          {form}
                        </span>
                      </td>
                      {[
                        { entry: a, color: '#D4A246' },
                        { entry: b, color: '#5AB8A8' },
                        { entry: c, color: '#A78BFA' },
                      ].map(({ entry, color }, i) => (
                        <td key={i} className="px-4 py-3.5 text-center">
                          {entry ? (
                            <div>
                              <p className="font-arabic text-base leading-none mb-1" style={{ color }} dir="rtl">
                                {entry.arabic}
                              </p>
                              <p className="text-[10px] italic mb-0.5" style={{ color: '#A09F9B' }}>
                                {entry.transliteration}
                              </p>
                              <p className="text-[10px]" style={{ color: '#636260' }}>
                                {entry.meaning}
                              </p>
                            </div>
                          ) : (
                            <span className="text-[10px]" style={{ color: '#2D2C2A' }}>
                              —
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards per form */}
          <div className="sm:hidden space-y-4">
            {ALL_FORMS.map((form) => {
              const entries = [
                { entry: ARIFA.entries.find((e) => e.form === form), color: '#D4A246', label: 'عَرَفَ' },
                { entry: ALIMA.entries.find((e) => e.form === form), color: '#5AB8A8', label: 'عَلِمَ' },
                { entry: FAHIMA.entries.find((e) => e.form === form), color: '#A78BFA', label: 'فَهِمَ' },
              ].filter((x) => x.entry);
              if (entries.length === 0) return null;
              return (
                <div
                  key={form}
                  className="rounded-2xl border border-border bg-surface p-4"
                >
                  <p className="text-xs font-bold mb-3" style={{ color: '#A09F9B' }}>
                    Form {form}
                  </p>
                  <div className="space-y-3">
                    {entries.map(({ entry, color, label }) => (
                      <div
                        key={label}
                        className="flex gap-3 items-start rounded-xl p-3"
                        style={{ background: `${color}08`, border: `1px solid ${color}15` }}
                      >
                        <span className="font-arabic text-lg shrink-0" style={{ color }} dir="rtl">
                          {entry!.arabic}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[10px] italic" style={{ color: '#A09F9B' }}>
                            {entry!.transliteration}
                          </p>
                          <p className="text-xs" style={{ color: '#636260' }}>
                            {entry!.meaning}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Quranic Examples Highlight ──────────────────────── */}
        <section className="mb-14" aria-labelledby="quranic-heading">
          <h2 id="quranic-heading" className="text-xl font-semibold text-text mb-5">
            Quranic Examples
          </h2>
          <div className="space-y-4">
            {[ARIFA, ALIMA, FAHIMA].flatMap((verb) =>
              verb.entries
                .filter((e) => e.quranic)
                .map((e) => (
                  <div
                    key={`${verb.rootLetters}-${e.form}`}
                    className="rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      background: `${verb.color}06`,
                      border: `1px solid ${verb.color}15`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{ background: `${verb.color}18`, color: verb.color }}
                      >
                        {verb.rootLetters} · Form {e.form}
                      </span>
                      <span className="text-[10px]" style={{ color: '#57534E' }}>
                        {e.ref}
                      </span>
                    </div>
                    <p
                      className="font-arabic text-xl leading-loose text-right mb-2"
                      style={{ color: '#F0E8D8' }}
                      dir="rtl"
                    >
                      {e.quranic}
                    </p>
                    <p className="text-sm italic" style={{ color: '#A09F9B' }}>
                      &ldquo;{e.refMeaning}&rdquo;
                    </p>
                  </div>
                ))
            )}
          </div>
        </section>

        {/* ── Key Derivatives ─────────────────────────────────── */}
        <section className="mb-14" aria-labelledby="derivatives-heading">
          <h2 id="derivatives-heading" className="text-xl font-semibold text-text mb-5">
            Key Derivatives &amp; Nouns
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {KEY_DERIVATIVES.map((group) => (
              <div
                key={group.root}
                className="rounded-2xl border border-border bg-surface p-5"
              >
                <p className="font-arabic text-lg mb-3" style={{ color: group.color }}>
                  {group.root}
                </p>
                <div className="space-y-2.5">
                  {group.words.map((w) => (
                    <div key={w.arabic} className="flex items-center gap-2">
                      <span className="font-arabic text-base shrink-0" style={{ color: group.color }}>
                        {w.arabic}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] italic text-text-tertiary">{w.transliteration}</p>
                        <p className="text-xs text-text-secondary">{w.meaning}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Summary ─────────────────────────────────────────── */}
        <section className="mb-14" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="text-xl font-semibold text-text mb-4">
            Key Takeaways
          </h2>
          <div className="rounded-2xl border border-border bg-surface p-6">
            <ul className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <li className="flex gap-3">
                <span className="shrink-0 font-bold" style={{ color: '#D4A246' }}>1.</span>
                <span>
                  Arabic has three distinct roots for &ldquo;knowing&rdquo; — each with its own nuance. Don&apos;t
                  translate them all as just &ldquo;to know.&rdquo;
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold" style={{ color: '#5AB8A8' }}>2.</span>
                <span>
                  <strong>عَرَفَ</strong> is personal, experiential knowledge — &ldquo;I <em>know</em> this person.&rdquo;
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold" style={{ color: '#A78BFA' }}>3.</span>
                <span>
                  <strong>عَلِمَ</strong> is factual, certain knowledge — &ldquo;I <em>know</em> this fact.&rdquo;
                  It&apos;s by far the most frequent in the Quran.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold" style={{ color: '#D4A246' }}>4.</span>
                <span>
                  <strong>فَهِمَ</strong> is deep comprehension — &ldquo;I <em>understand</em> the meaning.&rdquo;
                  It implies insight beyond surface-level facts.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold" style={{ color: '#5AB8A8' }}>5.</span>
                <span>
                  Each root generates a family of related words through the verb form system (awzaan). Mastering
                  these patterns lets you decode unfamiliar Quranic vocabulary instantly.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── Related Articles / Navigation ───────────────────── */}
        <div className="flex items-center justify-between pt-8 border-t border-border-light">
          <Link
            href="/learn/verb-forms"
            className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
          >
            &larr; The 10 Verb Forms
          </Link>
          <Link
            href="/learn"
            className="text-sm text-primary hover:text-primary transition-colors"
          >
            All Lessons &rarr;
          </Link>
        </div>
      </article>
    </>
  );
}
