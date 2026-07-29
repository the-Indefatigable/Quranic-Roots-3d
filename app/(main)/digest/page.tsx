import type { Metadata } from 'next';
import { DigestLearnMore } from '@/components/digest/DigestLearnMore';

export const metadata: Metadata = {
  title: 'The QuRoots Weekly Digest — Learn a Little Every Week',
  description:
    'One free email every Friday: a verse to master, the week’s new lessons, and your learning progress. Subscribe to the QuRoots weekly digest.',
  alternates: { canonical: 'https://quroots.com/digest' },
  openGraph: {
    title: 'The QuRoots Weekly Digest',
    description: 'One free email every Friday — a verse to master, new lessons, and your progress.',
    url: 'https://quroots.com/digest',
    siteName: 'QuRoots',
  },
};

export default function DigestPage() {
  return <DigestLearnMore />;
}
