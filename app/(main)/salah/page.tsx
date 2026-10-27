import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SalahOverview } from '@/components/salah/SalahOverview';

export const metadata: Metadata = {
  title: 'Understand your salah in 30 days',
  description: 'Learn the 110 Arabic roots behind Al-Fatiha and the short surahs you pray with, two or three a day. In 30 days you understand every word of your salah. The first week is free.',
  openGraph: {
    title: 'Understand every word of your salah in 30 days',
    description: 'Al-Fatiha and the short surahs you pray with, word by word, two or three roots a day. The first week is free.',
    url: 'https://quroots.com/salah',
    siteName: 'QuRoots',
  },
  alternates: { canonical: 'https://quroots.com/salah' },
};

export default function SalahPage() {
  return (
    <Suspense>
      <SalahOverview />
    </Suspense>
  );
}
