import type { Metadata } from 'next';
import { GiftChooser } from '@/components/gift/GiftChooser';

export const metadata: Metadata = {
  title: 'Give someone their salah',
  description: 'Gift the 30-day path to understanding every word of salah to someone you love, or sponsor a free place for someone who can’t afford it.',
  alternates: { canonical: 'https://quroots.com/gift' },
  openGraph: { title: 'Give someone their salah', description: 'Every word of Al-Fatiha and the short surahs, as a gift. One payment, theirs for life.', url: 'https://quroots.com/gift', siteName: 'QuRoots' },
};

export default function GiftPage() {
  return <GiftChooser />;
}
