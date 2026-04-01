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
    color: '#D4A246',
    icon: '⬡',
  },
  {
    href: '/learn/mufrad-muthanna-jam',
    title: "Mufrad, Muthanna & Jam' — Singular, Dual & Plural",
    arabic: 'مفرد · مثنى · جمع',
    description: 'Learn how Arabic nouns and adjectives change form for one, two, or many — including sound plurals and broken plurals throughout the Quran.',
    level: 'Essential',
    color: '#D4A246',
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
  Essential:    { bg: 'rgba(212,162,70,0.12)',   text: '#D4A246' },
  Intermediate: { bg: 'rgba(217,119,6,0.12)',   text: '#D4A246' },
  Advanced:     { bg: 'rgba(124,58,237,0.12)',  text: '#A78BFA' },
};

const COMING_SOON_COURSES = [
  {
    title: 'Learn Qirat & Maqam',
    arabic: 'تعلّم القراءة',
    description: 'Master Quranic recitation with pitch training, ear training, and melodic mode recognition.',
    color: '#7C3AED',
    href: '/learn/qirat',
  },
  {
    title: 'Tafsir & Word-by-Word',
    arabic: 'التفسير',
    description: 'Deep dive into the meaning of every word and verse — with classical and modern tafsir sources.',
    color: '#D97706',
  },
  {
    title: 'Conversational Arabic',
    arabic: 'المحادثة',
    description: 'Practical dialogue skills built on the Quranic vocabulary you already know.',
    color: '#1D4ED8',
  },
];

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

      {/* Topic cards */}
      <div className="space-y-3 mb-16">
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

      {/* ══ COMING SOON ═══════════════════════════════════════════ */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="h-px flex-1" style={{ background: 'rgba(212,162,70,0.15)' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#D4A246' }}>
            Coming Soon
          </span>
          <span className="h-px flex-1" style={{ background: 'rgba(212,162,70,0.15)' }} />
        </div>

        <div className="space-y-3">
          {COMING_SOON_COURSES.map((course) => {
            const inner = (
              <div
                className="relative group flex items-start gap-4 rounded-2xl p-5 overflow-hidden transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                {/* Faded overlay */}
                <div className="absolute inset-0 z-0" style={{ background: `linear-gradient(135deg, ${course.color}06 0%, transparent 60%)` }} />

                {/* Left: Arabic */}
                <div className="relative z-10 shrink-0 pt-0.5">
                  <span
                    className="font-arabic text-2xl leading-none opacity-40"
                    style={{ color: course.color }}
                  >
                    {course.arabic}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10 flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <h3 className="text-sm font-semibold leading-snug" style={{ color: '#A09F9B' }}>
                      {course.title}
                    </h3>
                    <span
                      className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: `${course.color}15`, color: `${course.color}80` }}
                    >
                      Soon
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#3D3C3A' }}>
                    {course.description}
                  </p>
                </div>
              </div>
            );

            if (course.href) {
              return <Link key={course.title} href={course.href}>{inner}</Link>;
            }
            return <div key={course.title}>{inner}</div>;
          })}
        </div>
      </div>

      {/* Footer ornament */}
      <div className="mt-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#D4A246]/20" />
          <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#D4A246', opacity: 0.3 }} />
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#D4A246]/20" />
        </div>
        <p className="text-[#2D2C2A] text-[11px] tracking-wider">
          More courses are being crafted with care
        </p>
      </div>
    </div>
  );
}
