import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title:
    'How Arabic Verb Forms Change Meaning — عَرَفَ, عَلِمَ, فَهِمَ in the Quran',
  description:
    'Discover how the Arabic verb form system (awzaan) transforms three roots of knowledge — ʿarafa, ʿalima, and fahima — into dozens of Quranic words. See Form II causatives, Form V reflexives, and Form X requestatives in action.',
  keywords: [
    'Arabic verb form system',
    'awzaan Quran',
    'Form II Arabic',
    'Form V Arabic',
    'tafaʿʿala',
    'istafʿala',
    'Quranic morphology',
    'Arabic word patterns',
    'learn Arabic verbs',
    'عرف علم فهم أوزان',
  ],
  openGraph: {
    title: 'How Verb Forms Change Meaning in the Quran | QuRoots',
    description:
      'See how one Arabic root generates dozens of words through the verb form system — with real Quranic examples.',
    url: 'https://quroots.com/learn/verb-forms-meaning-change',
    type: 'article',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How Arabic Verb Forms Change Meaning in the Quran',
    description:
      'From عَلِمَ (to know) to عَلَّمَ (to teach) to تَعَلَّمَ (to learn) — see the pattern in action.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://quroots.com/learn/verb-forms-meaning-change',
  },
};

/* ─── Data ────────────────────────────────────────────────────────────── */

interface Transformation {
  fromForm: string;
  fromArabic: string;
  fromTranslit: string;
  fromMeaning: string;
  toForm: string;
  toArabic: string;
  toTranslit: string;
  toMeaning: string;
  howItWorks: string;
  quranic?: string;
  ref?: string;
  refMeaning?: string;
  rootColor: string;
}

const TRANSFORMATIONS: Transformation[] = [
  // ع ل م chain
  {
    fromForm: 'I',
    fromArabic: 'عَلِمَ',
    fromTranslit: 'ʿalima',
    fromMeaning: 'he knew',
    toForm: 'II',
    toArabic: 'عَلَّمَ',
    toTranslit: 'ʿallama',
    toMeaning: 'he taught',
    howItWorks:
      'Form II doubles the middle letter, creating a causative: "to make someone know" → "to teach."',
    quranic: 'عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ',
    ref: 'Al-Alaq 96:5',
    refMeaning: 'He taught man what he did not know',
    rootColor: '#5AB8A8',
  },
  {
    fromForm: 'II',
    fromArabic: 'عَلَّمَ',
    fromTranslit: 'ʿallama',
    fromMeaning: 'he taught',
    toForm: 'V',
    toArabic: 'تَعَلَّمَ',
    toTranslit: 'taʿallama',
    toMeaning: 'he learned',
    howItWorks:
      'Form V adds تَ before Form II, making it reflexive: "to teach oneself" → "to learn."',
    quranic: 'وَيَتَعَلَّمُونَ مَا يَضُرُّهُمْ وَلَا يَنفَعُهُمْ',
    ref: 'Al-Baqarah 2:102',
    refMeaning: 'And they learn what harms them and does not benefit them',
    rootColor: '#5AB8A8',
  },

  // ع ر ف chain
  {
    fromForm: 'I',
    fromArabic: 'عَرَفَ',
    fromTranslit: 'ʿarafa',
    fromMeaning: 'he recognized',
    toForm: 'II',
    toArabic: 'عَرَّفَ',
    toTranslit: 'ʿarrafa',
    toMeaning: 'he made known / defined',
    howItWorks:
      'Form II causative: "to make someone recognize" → "to define, to introduce."',
    quranic: 'عَرَّفَ بَعْضَهُ وَأَعْرَضَ عَن بَعْضٍ',
    ref: 'At-Tahrim 66:3',
    refMeaning: 'He made known part of it and ignored part',
    rootColor: '#D4A246',
  },
  {
    fromForm: 'I',
    fromArabic: 'عَرَفَ',
    fromTranslit: 'ʿarafa',
    fromMeaning: 'he recognized',
    toForm: 'VI',
    toArabic: 'تَعَارَفَ',
    toTranslit: 'taʿārafa',
    toMeaning: 'they got to know one another',
    howItWorks:
      'Form VI makes the action mutual: "to recognize each other" → "to become acquainted mutually."',
    quranic: 'وَجَعَلْنَاكُمْ شُعُوبًا وَقَبَائِلَ لِتَعَارَفُوا',
    ref: 'Al-Hujurat 49:13',
    refMeaning: 'We made you into nations and tribes so that you may know one another',
    rootColor: '#D4A246',
  },

  // ف ه م chain
  {
    fromForm: 'I',
    fromArabic: 'فَهِمَ',
    fromTranslit: 'fahima',
    fromMeaning: 'he understood',
    toForm: 'II',
    toArabic: 'فَهَّمَ',
    toTranslit: 'fahhama',
    toMeaning: 'he made someone understand',
    howItWorks:
      'Form II causative: "to cause understanding" — when Allah grants special insight.',
    quranic: 'فَفَهَّمْنَاهَا سُلَيْمَانَ',
    ref: 'Al-Anbiya 21:79',
    refMeaning: 'We made Sulayman understand it',
    rootColor: '#A78BFA',
  },
  {
    fromForm: 'I',
    fromArabic: 'فَهِمَ',
    fromTranslit: 'fahima',
    fromMeaning: 'he understood',
    toForm: 'X',
    toArabic: 'اِسْتَفْهَمَ',
    toTranslit: 'istafhama',
    toMeaning: 'he asked for clarification',
    howItWorks:
      'Form X "seeks" the root action: "to seek understanding" → "to inquire, to ask questions."',
    rootColor: '#A78BFA',
  },
];

/* ─── Pattern explanation cards ───────────────────────────────────────── */

const PATTERNS = [
  {
    form: 'II',
    pattern: 'فَعَّلَ',
    effect: 'Causation / Intensification',
    description: 'Doubles the middle root letter. Turns "to know" into "to teach," "to understand" into "to explain."',
    color: '#D4A246',
    examples: [
      { from: 'عَلِمَ → عَلَّمَ', meaning: 'knew → taught' },
      { from: 'فَهِمَ → فَهَّمَ', meaning: 'understood → made understand' },
      { from: 'عَرَفَ → عَرَّفَ', meaning: 'recognized → defined' },
    ],
  },
  {
    form: 'V',
    pattern: 'تَفَعَّلَ',
    effect: 'Reflexive of II',
    description: 'Adds تَ to Form II. The action is done to oneself — "to teach oneself" becomes "to learn."',
    color: '#5AB8A8',
    examples: [
      { from: 'عَلَّمَ → تَعَلَّمَ', meaning: 'taught → learned' },
      { from: 'فَهَّمَ → تَفَهَّمَ', meaning: 'explained → pondered deeply' },
      { from: 'عَرَّفَ → تَعَرَّفَ', meaning: 'defined → got acquainted' },
    ],
  },
  {
    form: 'VI',
    pattern: 'تَفَاعَلَ',
    effect: 'Mutual / Reciprocal',
    description: 'Adds تَ and an alif — the action becomes mutual. Both sides participate in the action.',
    color: '#A78BFA',
    examples: [
      { from: 'عَرَفَ → تَعَارَفَ', meaning: 'recognized → got to know each other' },
      { from: 'فَهِمَ → تَفَاهَمَ', meaning: 'understood → reached mutual understanding' },
    ],
  },
  {
    form: 'X',
    pattern: 'اِسْتَفْعَلَ',
    effect: 'Seeking / Requesting',
    description: 'Adds اِسْتَ prefix. "Seeking" the root action — requesting knowledge, understanding, or recognition.',
    color: '#D97706',
    examples: [
      { from: 'فَهِمَ → اِسْتَفْهَمَ', meaning: 'understood → asked for clarification' },
      { from: 'عَرَفَ → اِسْتَعْرَفَ', meaning: 'recognized → sought recognition' },
    ],
  },
];

/* ─── Page Component ──────────────────────────────────────────────────── */

export default function VerbFormsMeaningChangePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline:
      'How Arabic Verb Forms Change Meaning — عَرَفَ, عَلِمَ, فَهِمَ in the Quran',
    description:
      'Discover how the Arabic verb form system transforms three roots of knowledge into dozens of Quranic words.',
    url: 'https://quroots.com/learn/verb-forms-meaning-change',
    publisher: { '@type': 'Organization', name: 'QuRoots' },
    educationalLevel: 'Intermediate',
    inLanguage: ['en', 'ar'],
    datePublished: '2026-04-06',
    dateModified: '2026-04-06',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-text-tertiary mb-8" aria-label="Breadcrumb">
          <Link href="/learn" className="hover:text-text-secondary transition-colors">
            Learn
          </Link>
          <span>/</span>
          <span className="text-text-secondary">Verb Forms &amp; Meaning</span>
        </nav>

        {/* ── Header ──────────────────────────────────────── */}
        <header className="mb-14">
          {/* Visual chain */}
          <div
            className="flex flex-wrap items-center gap-2 mb-6 p-4 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span className="font-arabic text-2xl" style={{ color: '#5AB8A8' }}>عَلِمَ</span>
            <svg className="w-4 h-4 shrink-0" style={{ color: '#3D3C3A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            <span className="font-arabic text-2xl" style={{ color: '#5AB8A8' }}>عَلَّمَ</span>
            <svg className="w-4 h-4 shrink-0" style={{ color: '#3D3C3A' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
            <span className="font-arabic text-2xl" style={{ color: '#5AB8A8' }}>تَعَلَّمَ</span>
            <span className="text-[10px] ml-2" style={{ color: '#636260' }}>
              knew → taught → learned
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-4">
            How Arabic Verb Forms Change Meaning
          </h1>

          <p className="text-text-secondary text-lg leading-relaxed mb-3 max-w-2xl">
            One root. Ten possible verb forms. Each form shifts the meaning in a predictable way —
            from &ldquo;he knew&rdquo; to &ldquo;he taught&rdquo; to &ldquo;he learned.&rdquo;
            This article shows you exactly how it works, using three of the Quran&apos;s most
            powerful roots of knowledge.
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
              6 min read
            </span>
          </div>
        </header>

        {/* ── The 4 Key Patterns ───────────────────────────── */}
        <section className="mb-14" aria-labelledby="patterns-heading">
          <h2 id="patterns-heading" className="text-xl font-semibold text-text mb-2">
            Four Verb Forms That Unlock Everything
          </h2>
          <p className="text-xs mb-6" style={{ color: '#636260' }}>
            These four forms appear most often when Arabic verbs of knowledge transform meaning. Learn these first.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {PATTERNS.map((p) => (
              <div
                key={p.form}
                className="rounded-2xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-lg"
                    style={{ background: `${p.color}18`, color: p.color }}
                  >
                    Form {p.form}
                  </span>
                  <span className="font-arabic text-base" style={{ color: p.color }}>
                    {p.pattern}
                  </span>
                </div>

                <p className="text-sm font-semibold text-text mb-1">{p.effect}</p>
                <p className="text-xs leading-relaxed mb-4" style={{ color: '#636260' }}>
                  {p.description}
                </p>

                <div className="space-y-1.5">
                  {p.examples.map((ex) => (
                    <div
                      key={ex.from}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                    >
                      <span className="font-arabic text-sm" style={{ color: '#A09F9B' }}>
                        {ex.from}
                      </span>
                      <span className="text-[10px]" style={{ color: '#57534E' }}>
                        {ex.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Transformation Chain ─────────────────────────── */}
        <section className="mb-14" aria-labelledby="chain-heading">
          <h2 id="chain-heading" className="text-xl font-semibold text-text mb-5">
            Transformation Chains — With Quranic Proof
          </h2>
          <p className="text-xs mb-6" style={{ color: '#636260' }}>
            Watch each root transform step by step, with the Quranic verse that proves the usage.
          </p>

          <div className="space-y-5">
            {TRANSFORMATIONS.map((t, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border bg-surface overflow-hidden"
              >
                {/* Top bar */}
                <div
                  className="h-1"
                  style={{
                    background: `linear-gradient(to right, ${t.rootColor}, ${t.rootColor}60)`,
                  }}
                />

                <div className="p-5">
                  {/* From → To */}
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: '#57534E' }}>
                        Form {t.fromForm}
                      </p>
                      <p className="font-arabic text-xl" style={{ color: '#A09F9B' }} dir="rtl">
                        {t.fromArabic}
                      </p>
                      <p className="text-[10px] italic" style={{ color: '#57534E' }}>
                        {t.fromMeaning}
                      </p>
                    </div>

                    <svg
                      className="w-6 h-6 shrink-0"
                      style={{ color: t.rootColor }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>

                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: t.rootColor }}>
                        Form {t.toForm}
                      </p>
                      <p className="font-arabic text-xl" style={{ color: t.rootColor }} dir="rtl">
                        {t.toArabic}
                      </p>
                      <p className="text-[10px] italic" style={{ color: '#A09F9B' }}>
                        {t.toMeaning}
                      </p>
                    </div>
                  </div>

                  {/* How it works */}
                  <p className="text-xs leading-relaxed mb-4" style={{ color: '#636260' }}>
                    {t.howItWorks}
                  </p>

                  {/* Quranic example */}
                  {t.quranic && (
                    <div
                      className="rounded-xl p-4"
                      style={{
                        background: `${t.rootColor}08`,
                        border: `1px solid ${t.rootColor}15`,
                      }}
                    >
                      <p
                        className="font-arabic text-lg leading-loose text-right mb-2"
                        style={{ color: '#F0E8D8' }}
                        dir="rtl"
                      >
                        {t.quranic}
                      </p>
                      <p className="text-xs" style={{ color: '#57534E' }}>
                        <span style={{ color: t.rootColor }}>{t.ref}</span>
                        {t.refMeaning && <> — &ldquo;{t.refMeaning}&rdquo;</>}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why This Matters ─────────────────────────────── */}
        <section className="mb-14" aria-labelledby="why-heading">
          <h2 id="why-heading" className="text-xl font-semibold text-text mb-4">
            Why This Matters for Quran Study
          </h2>
          <div className="rounded-2xl border border-border bg-surface p-6">
            <ul className="space-y-3 text-sm text-text-secondary leading-relaxed">
              <li className="flex gap-3">
                <span className="shrink-0 font-bold" style={{ color: '#D4A246' }}>
                  →
                </span>
                <span>
                  <strong>Vocabulary multiplier:</strong> Learning one root + the form patterns gives you 4–6 words
                  instead of memorizing each one separately.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold" style={{ color: '#5AB8A8' }}>
                  →
                </span>
                <span>
                  <strong>Decode new words instantly:</strong> When you see an unfamiliar word starting with اِسْتَ, you
                  know it&apos;s Form X — someone is <em>seeking</em> the root action.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold" style={{ color: '#A78BFA' }}>
                  →
                </span>
                <span>
                  <strong>Deeper tafsir:</strong> Why did Allah use فَهَّمَ (Form II) instead of أَفْهَمَ (Form IV)
                  for Sulayman? The verb form carries meaning that translations often miss.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="shrink-0 font-bold" style={{ color: '#D97706' }}>
                  →
                </span>
                <span>
                  <strong>Connects to worship:</strong> When you understand that اِسْتَغْفَرَ means &ldquo;seeking
                  forgiveness&rdquo; because of its Form X pattern, your du&apos;a becomes more conscious.
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────── */}
        <section
          className="mb-14 rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(212,162,70,0.06) 0%, rgba(90,184,168,0.04) 100%)',
            border: '1px solid rgba(212,162,70,0.12)',
          }}
        >
          <p className="text-lg font-semibold text-text mb-2">
            Ready to explore every root?
          </p>
          <p className="text-sm mb-6" style={{ color: '#636260' }}>
            The Root Explorer lets you see all verb forms, derivatives, and Quranic occurrences for any of the 1,716
            Arabic roots.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/roots"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #D4A246, #C89535)',
                color: '#0E0D0C',
                boxShadow: '0 2px 12px rgba(212,162,70,0.3)',
              }}
            >
              Open Root Explorer
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/learn/arifa-vs-alima-vs-fahima"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{
                background: 'rgba(255,255,255,0.04)',
                color: '#EDEDEC',
                border: '1px solid rgba(255,255,255,0.12)',
              }}
            >
              Full Comparison Table
            </Link>
          </div>
        </section>

        {/* ── Navigation ───────────────────────────────────── */}
        <div className="flex items-center justify-between pt-8 border-t border-border-light">
          <Link
            href="/learn/arifa-vs-alima-vs-fahima"
            className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
          >
            &larr; Arifa vs Alima vs Fahima
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
