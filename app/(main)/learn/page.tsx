import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Learn Quranic Arabic Grammar — Free Lessons & Guides',
  description:
    'Master Quranic Arabic grammar with free, in-depth lessons on i\'rab (case endings), singular/dual/plural, compound phrases, numbers, and verb forms. Built for self-learners.',
  openGraph: {
    title: 'Learn Quranic Arabic Grammar | QuRoots',
    description: 'Free grammar lessons covering i\'rab, noun forms, verb patterns, and more.',
    url: 'https://quroots.com/learn',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn Quranic Arabic Grammar | QuRoots',
    description: 'Free grammar lessons covering i\'rab, noun forms, verb patterns, and more.',
    images: ['/og-image.png'],
  },
};

const topics = [
  {
    href: '/learn/irab',
    title: 'I\'rab — Grammatical Case Endings',
    arabic: 'الإعراب',
    description: 'Understand how Arabic words change their endings based on grammatical function — the foundation of reading the Quran without translation.',
    level: 'Essential',
  },
  {
    href: '/learn/mufrad-muthanna-jam',
    title: 'Mufrad, Muthanna & Jam\' — Singular, Dual & Plural',
    arabic: 'مفرد · مثنى · جمع',
    description: 'Learn how Arabic nouns and adjectives change form for one, two, or many — including sound plurals and broken plurals found throughout the Quran.',
    level: 'Essential',
  },
  {
    href: '/learn/murakkab',
    title: 'Murakkab — Compound Phrases',
    arabic: 'المركّب',
    description: 'Explore the three types of Arabic compound phrases: idaafi (possessive), wasfi (descriptive), and mazji (blended) — and how they appear in Quranic verses.',
    level: 'Intermediate',
  },
  {
    href: '/learn/adad',
    title: 'Adad — Numbers in Arabic',
    arabic: 'العدد',
    description: 'Master the complex Arabic number system: cardinal and ordinal numbers, gender agreement rules, and how numbers interact with counted nouns in the Quran.',
    level: 'Intermediate',
  },
  {
    href: '/learn/verb-forms',
    title: 'Awzaan al-Fi\'l — The 10 Verb Forms',
    arabic: 'أوزان الفعل',
    description: 'A complete guide to Arabic verb forms (I–X): how each pattern modifies meaning, with Quranic examples for every form.',
    level: 'Advanced',
  },
];

export default function LearnPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    'name': 'Learn Quranic Arabic Grammar',
    'description': 'Free grammar lessons for learning Quranic Arabic.',
    'url': 'https://quroots.com/learn',
    'publisher': {
      '@type': 'Organization',
      'name': 'QuRoots',
    },
    'hasPart': topics.map((t) => ({
      '@type': 'Article',
      'name': t.title,
      'url': `https://quroots.com${t.href}`,
      'description': t.description,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
          Free Lessons
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight mb-3">
          Learn Quranic Arabic Grammar
        </h1>
        <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-12 max-w-2xl">
          Structured lessons covering the essential grammar you need to understand the Quran in its original Arabic.
          Each topic includes Quranic examples and clear explanations.
        </p>

        <div className="space-y-4">
          {topics.map((topic) => (
            <Link
              key={topic.href}
              href={topic.href}
              className="block group rounded-2xl border border-border bg-surface hover:bg-surface hover:shadow-card transition-all duration-200 p-6"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <span className="text-2xl font-arabic text-primary leading-none">{topic.arabic}</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${
                  topic.level === 'Essential'
                    ? 'bg-correct/10 text-correct'
                    : topic.level === 'Intermediate'
                    ? 'bg-accent/10 text-accent'
                    : 'bg-info/10 text-info'
                }`}>
                  {topic.level}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-text group-hover:text-primary transition-colors mb-1.5">
                {topic.title}
              </h2>
              <p className="text-sm text-text-tertiary leading-relaxed">
                {topic.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
