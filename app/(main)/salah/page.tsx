import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SalahOverview } from '@/components/salah/SalahOverview';

export const metadata: Metadata = {
  title: 'Understand your salah in 30 days | QuRoots',
  description: 'Learn the 85 Arabic roots behind Al-Fatiha and the short surahs you pray with. Ten minutes a day; the first week is free.',
  alternates: { canonical: 'https://quroots.com/salah' },
};

export default function SalahPage() {
  return (
    <Suspense>
      <SalahOverview />
    </Suspense>
  );
}
