import dynamic from 'next/dynamic';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QuRoots — Learn Quranic Arabic Roots, Understand Every Word',
  description:
    'Master Quranic Arabic through root analysis. Explore 1,716 verb roots, read the Quran word-by-word with translation, study verb conjugations, and track your learning progress.',
  openGraph: {
    title: 'QuRoots — Learn Quranic Arabic Roots, Understand Every Word',
    description:
      'Master Quranic Arabic through root analysis. Explore 1,716 verb roots, read the Quran word-by-word, and study Arabic morphology.',
    url: 'https://quroots.com/',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuRoots — Learn Quranic Arabic Roots',
    description:
      'Explore 1,716 Quranic Arabic roots, read the Quran word-by-word, and master Arabic verb conjugations.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: '/' },
};

const HomepageClient = dynamic(
  () => import('@/components/home/HomepageClient').then((m) => ({ default: m.HomepageClient })),
  { ssr: false, loading: () => <div className="min-h-screen bg-canvas" /> }
);

// AEO: FAQ + Course structured data so answer engines (Google rich results,
// Bing, Perplexity, ChatGPT search) can extract and cite QuRoots directly.
const FAQ = [
  ['What is QuRoots?', 'QuRoots is a free platform for learning Quranic Arabic. It teaches the language of the Quran from beginner to the ability to fully parse (iʿrāb) any verse, using a gamified 50-unit grammar course, a word-by-word Quran reader, and an explorer of Arabic verb roots and morphology.'],
  ['Is QuRoots free?', 'Yes. QuRoots is free to use — the full grammar course, the word-by-word Quran, the roots explorer, and the daily ayah are all available at no cost.'],
  ['Do I need to know Arabic to start?', 'No. QuRoots is designed for absolute beginners. The course starts with the three word types (ism, fiʿl, harf) and builds step by step to reading and parsing real Quranic verses.'],
  ['What is an Arabic root?', 'Almost every Arabic word grows from a set of three core letters called a root (for example ك-ت-ب, which carries the idea of writing). Learning roots lets you recognise whole families of related Quranic words at once.'],
  ['What is iʿrāb?', 'Iʿrāb is the grammatical analysis of Arabic — identifying each word’s role and case ending (rafʿ, naṣb, jarr, or jazm). QuRoots teaches iʿrāb so you can explain why every word in an ayah ends the way it does.'],
];

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Course',
        name: 'Quranic Arabic: Zero to Quran',
        description: 'A free, gamified 50-unit course that takes a complete beginner to full grammatical parsing (iʿrāb) of the Quran — covering roots, verb forms, the case system, and sentence analysis.',
        provider: { '@type': 'Organization', name: 'QuRoots', url: 'https://quroots.com' },
        url: 'https://quroots.com/learn/path',
        isAccessibleForFree: true,
        inLanguage: 'en',
        about: ['Quranic Arabic', 'Arabic grammar', 'Naḥw', 'Ṣarf', 'Iʿrāb'],
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', category: 'Free' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ.map(([q, a]) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <HomepageClient />
    </>
  );
}
