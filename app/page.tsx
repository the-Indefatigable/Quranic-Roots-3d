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
};

const HomepageClient = dynamic(
  () => import('@/components/home/HomepageClient').then((m) => ({ default: m.HomepageClient })),
  { loading: () => <div className="min-h-screen bg-canvas" /> }
);

export default function HomePage() {
  return <HomepageClient />;
}
