import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Learn Quranic Arabic Grammar — Free Lessons & Guides',
  description: "Master Quranic Arabic grammar with free, in-depth lessons on i'rab, singular/dual/plural, compound phrases, numbers, and verb forms.",
  openGraph: {
    title: 'Learn Quranic Arabic Grammar | QuRoots',
    description: 'Free grammar lessons covering i\'rab, noun forms, verb patterns, and more.',
    url: 'https://quroots.com/learn',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const TOPICS = [
  {
    href: '/learn/irab',
    title: "I'rab — Grammatical Case Endings",
    arabic: 'الإعراب',
    description: 'Understand how Arabic words change their endings based on grammatical function — the foundation of reading the Quran without translation.',
    level: 'Essential',
    color: '#0D9488',
    icon: '⬡',
  },
  {
    href: '/learn/mufrad-muthanna-jam',
    title: "Mufrad, Muthanna & Jam' — Singular, Dual & Plural",
    arabic: 'مفرد · مثنى · جمع',
    description: 'Learn how Arabic nouns and adjectives change form for one, two, or many — including sound plurals and broken plurals throughout the Quran.',
    level: 'Essential',
    color: '#0D9488',
    icon: '◈',
  },
  {
    href: '/learn/murakkab',
    title: 'Murakkab — Compound Phrases',
    arabic: 'المركّب',
    description: 'Explore the three types of Arabic compound phrases: idaafi (possessive), wasfi (descriptive), and mazji (blended) — and how they appear in Quranic verses.',
    level: 'Intermediate',
    color: '#D97706',
    icon: '⬟',
  },
  {
    href: '/learn/adad',
    title: 'Adad — Numbers in Arabic',
    arabic: 'العدد',
    description: 'Master the complex Arabic number system: cardinal and ordinal numbers, gender agreement rules, and how numbers interact with counted nouns in the Quran.',
    level: 'Intermediate',
    color: '#D97706',
    icon: '◇',
  },
  {
    href: '/learn/verb-forms',
    title: "Awzaan al-Fi'l — The 10 Verb Forms",
    arabic: 'أوزان الفعل',
    description: 'A complete guide to Arabic verb forms (I–X): how each pattern modifies meaning, with Quranic examples for every form.',
    level: 'Advanced',
    color: '#7C3AED',
    icon: '⬠',
  },
];

const LEVEL_STYLE: Record<string, { bg: string; text: string }> = {
  Essential:    { bg: 'rgba(13,148,136,0.12)',  text: '#5AB8A8' },
  Intermediate: { bg: 'rgba(217,119,6,0.12)',   text: '#D4A246' },
  Advanced:     { bg: 'rgba(124,58,237,0.12)',  text: '#A78BFA' },
};

export default function LearnPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-px w-6" style={{ background: 'rgba(212,162,70,0.5)' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#D4A246' }}>
            Grammar Lessons
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl mb-3 tracking-tight" style={{ color: '#F0E8D8', letterSpacing: '-0.02em' }}>
          Quranic Arabic Grammar
        </h1>
        <p className="text-base leading-relaxed" style={{ color: '#636260', maxWidth: '36rem' }}>
          Structured lessons covering the essential grammar you need to understand the Quran in its original Arabic. Each topic includes Quranic examples and clear explanations.
        </p>
      </div>

      {/* Also try Qirat */}
      <Link
        href="/learn/qirat"
        className="flex items-center justify-between rounded-2xl p-4 mb-8 group transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(135deg, rgba(124,58,237,0.10) 0%, rgba(13,148,136,0.06) 100%)',
          border: '1px solid rgba(124,58,237,0.2)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(124,58,237,0.15)', color: '#A78BFA' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m9 9 10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V4.103A2.25 2.25 0 0 0 17.77 2.03l-4.046 1.157A2.25 2.25 0 0 0 12.12 5.35v6.2a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 12.12 7.8V5.35" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: '#EDEDEC' }}>Also: Learn Qirat & Maqam</p>
            <p className="text-xs" style={{ color: '#57534E' }}>Master Quranic recitation with pitch training</p>
          </div>
        </div>
        <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" style={{ color: '#A78BFA' }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </Link>

      {/* Topic cards */}
      <div className="space-y-3">
        {TOPICS.map((topic) => {
          const lvl = LEVEL_STYLE[topic.level];
          return (
            <Link
              key={topic.href}
              href={topic.href}
              className="group flex items-start gap-4 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.05] hover:border-white/[0.12]"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {/* Left: Arabic */}
              <div className="shrink-0 pt-0.5">
                <span
                  className="font-arabic text-2xl leading-none"
                  style={{ color: topic.color, textShadow: `0 0 20px ${topic.color}40` }}
                >
                  {topic.arabic.split(' · ')[0]}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h2
                    className="text-sm font-semibold leading-snug transition-colors"
                    style={{ color: '#EDEDEC' }}
                  >
                    {topic.title}
                  </h2>
                  <span
                    className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{ background: lvl.bg, color: lvl.text }}
                  >
                    {topic.level}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#57534E' }}>
                  {topic.description}
                </p>
              </div>

              {/* Arrow */}
              <svg
                className="w-4 h-4 shrink-0 mt-1 transition-transform group-hover:translate-x-0.5"
                style={{ color: '#3D3C3A' }}
                fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
