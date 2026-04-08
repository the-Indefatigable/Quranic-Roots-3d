import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — Quranic Arabic, Grammar & Books | QuRoots',
  description: "Articles on Quranic Arabic grammar, daily fusha vocabulary, beginner book recommendations, verb forms, i'rab and more.",
  alternates: { canonical: 'https://quroots.com/blog' },
  openGraph: {
    title: 'QuRoots Blog — Quranic Arabic, Grammar & Books',
    description: 'Free articles on Arabic grammar, daily fusha vocabulary, and beginner-friendly Islamic books.',
    url: 'https://quroots.com/blog',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

type Topic = {
  href: string;
  title: string;
  arabic: string;
  description: string;
  level: string;
  color: string;
  category: 'Vocabulary' | 'Books' | 'Grammar';
};

const TOPICS: Topic[] = [
  {
    href: '/blog/daily-arabic-words',
    title: 'Daily Arabic — 30 Fusha Words & Sentences to Live With',
    arabic: 'كَلِمَاتٌ يَوْمِيَّة',
    description: 'A handpicked list of 30 everyday classical Arabic words and 12 ready-to-use sentences — fully vowelled, with transliteration, meaning, and Quranic context. Strictly fusha, no dialect.',
    level: 'Beginner',
    color: '#10B981',
    category: 'Vocabulary',
  },
  {
    href: '/blog/beginner-arabic-islamic-books',
    title: 'Beginner-Friendly Arabic & Islamic Books — Free & Cheap',
    arabic: 'كُتُبٌ لِلْمُبْتَدِئِين',
    description: 'A curated reading list: Abul Hasan Ali Nadwi\'s Qasas an-Nabiyyin, Stories of the Prophets, the Madinah Books, Duruus al-Lughah, Al-Arabiyyah Bayna Yadayk and more — with free archive.org links and cheap-buy notes.',
    level: 'Beginner',
    color: '#10B981',
    category: 'Books',
  },
  {
    href: '/blog/irab',
    title: "I'rab — Grammatical Case Endings",
    arabic: 'الإعراب',
    description: 'Understand how Arabic words change their endings based on grammatical function — the foundation of reading the Quran without translation.',
    level: 'Essential',
    color: '#D4A246',
    category: 'Grammar',
  },
  {
    href: '/blog/mufrad-muthanna-jam',
    title: "Mufrad, Muthanna & Jam' — Singular, Dual & Plural",
    arabic: 'مفرد · مثنى · جمع',
    description: 'Learn how Arabic nouns and adjectives change form for one, two, or many — including sound plurals and broken plurals throughout the Quran.',
    level: 'Essential',
    color: '#D4A246',
    category: 'Grammar',
  },
  {
    href: '/blog/murakkab',
    title: 'Murakkab — Compound Phrases',
    arabic: 'المركّب',
    description: 'Explore the three types of Arabic compound phrases: idaafi (possessive), wasfi (descriptive), and mazji (blended) — and how they appear in Quranic verses.',
    level: 'Intermediate',
    color: '#D97706',
    category: 'Grammar',
  },
  {
    href: '/blog/adad',
    title: 'Adad — Numbers in Arabic',
    arabic: 'العدد',
    description: 'Master the complex Arabic number system: cardinal and ordinal numbers, gender agreement rules, and how numbers interact with counted nouns in the Quran.',
    level: 'Intermediate',
    color: '#D97706',
    category: 'Grammar',
  },
  {
    href: '/blog/verb-forms',
    title: "Awzaan al-Fi'l — The 10 Verb Forms",
    arabic: 'أوزان الفعل',
    description: 'A complete guide to Arabic verb forms (I–X): how each pattern modifies meaning, with Quranic examples for every form.',
    level: 'Advanced',
    color: '#7C3AED',
    category: 'Grammar',
  },
  {
    href: '/blog/arifa-vs-alima-vs-fahima',
    title: 'Arifa vs Alima vs Fahima — 3 Verbs of Knowledge',
    arabic: 'عَرَفَ · عَلِمَ · فَهِمَ',
    description: 'Side-by-side comparison of three Arabic verbs meaning "to know" across all 10 verb forms, with Quranic examples and key derivatives.',
    level: 'Intermediate',
    color: '#D97706',
    category: 'Grammar',
  },
  {
    href: '/blog/verb-forms-meaning-change',
    title: 'How Verb Forms Change Meaning',
    arabic: 'تحويل المعنى',
    description: 'See how one Arabic root generates dozens of words through the verb form system — from عَلِمَ (to know) to عَلَّمَ (to teach) to تَعَلَّمَ (to learn).',
    level: 'Intermediate',
    color: '#D97706',
    category: 'Grammar',
  },
];

const LEVEL_STYLE: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: 'rgba(16,185,129,0.14)',  text: '#34D399' },
  Essential:    { bg: 'rgba(212,162,70,0.12)',  text: '#D4A246' },
  Intermediate: { bg: 'rgba(217,119,6,0.12)',   text: '#D4A246' },
  Advanced:     { bg: 'rgba(124,58,237,0.12)',  text: '#A78BFA' },
};

const CATEGORIES: Array<Topic['category']> = ['Vocabulary', 'Books', 'Grammar'];

export default function BlogPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-px w-6" style={{ background: 'rgba(212,162,70,0.5)' }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#D4A246' }}>
            QuRoots Blog
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl mb-3 tracking-tight" style={{ color: '#F0E8D8', letterSpacing: '-0.02em' }}>
          Articles &amp; Reading
        </h1>
        <p className="text-base leading-relaxed" style={{ color: '#636260', maxWidth: '36rem' }}>
          In-depth articles on Quranic Arabic grammar, daily fusha vocabulary, and beginner-friendly Islamic books — with Quranic examples and clear explanations throughout.
        </p>
      </div>

      {/* Grouped by category */}
      {CATEGORIES.map((cat) => {
        const items = TOPICS.filter((t) => t.category === cat);
        if (!items.length) return null;
        return (
          <section key={cat} className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#D4A246' }}>
                {cat}
              </span>
              <span className="h-px flex-1" style={{ background: 'rgba(212,162,70,0.15)' }} />
            </div>

            <div className="space-y-3">
              {items.map((topic) => {
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
                    <div className="shrink-0 pt-0.5">
                      <span
                        className="font-arabic text-2xl leading-none"
                        style={{ color: topic.color, textShadow: `0 0 20px ${topic.color}40` }}
                      >
                        {topic.arabic.split(' · ')[0]}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <h2 className="text-sm font-semibold leading-snug" style={{ color: '#EDEDEC' }}>
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
          </section>
        );
      })}

      {/* Footer ornament */}
      <div className="mt-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#D4A246]/20" />
          <div className="w-1.5 h-1.5 rotate-45" style={{ background: '#D4A246', opacity: 0.3 }} />
          <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#D4A246]/20" />
        </div>
        <p className="text-[#2D2C2A] text-[11px] tracking-wider">
          New articles are being crafted with care
        </p>
      </div>
    </div>
  );
}
