import { QuranSurahList } from './QuranSurahList';

export const metadata = {
  title: 'Read the Quran — All 114 Surahs with Word-by-Word Analysis',
  description:
    'Browse all 114 surahs of the Quran with word-by-word Arabic analysis, English translation, and root connections. Read, study, and understand every ayah.',
  openGraph: {
    title: 'Read the Quran — All 114 Surahs | QuRoots',
    description: 'Browse all 114 surahs with word-by-word analysis, translation, and root connections.',
    url: 'https://quroots.com/quran',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image' as const,
    title: 'Read the Quran — All 114 Surahs | QuRoots',
    description: 'Browse all 114 surahs with word-by-word analysis and translation.',
    images: ['/og-image.png'],
  },
};

export default function QuranPage() {
  return <QuranSurahList />;
}
