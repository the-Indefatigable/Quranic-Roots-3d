import type { Metadata } from 'next';

/**
 * page.tsx is a client component, so it cannot export metadata. This wrapper
 * supplies it — without it the page inherited the root layout's generic title
 * and description, despite being in the sitemap at priority 0.8.
 */
export const metadata: Metadata = {
  title: 'Daily Ayah & Hadith — A Verse a Day | QuRoots',
  description:
    'A fresh Quranic verse and prophetic hadith every day, with word-by-word meaning and a short quiz. Build a daily habit and keep your streak alive.',
  openGraph: {
    title: 'Daily Ayah & Hadith — A Verse a Day | QuRoots',
    description:
      'A fresh Quranic verse and hadith each day, with word-by-word meaning and a short quiz.',
    url: 'https://quroots.com/daily',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Ayah & Hadith | QuRoots',
    description: 'A fresh Quranic verse and hadith each day, with word-by-word meaning.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: '/daily' },
};

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
