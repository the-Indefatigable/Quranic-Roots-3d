import type { Metadata } from 'next';
import { DailyVerbsClient } from '@/components/verbs/DailyVerbsClient';

export const metadata: Metadata = {
  title: 'Daily Arabic Verbs — The Most Useful Verbs for Everyday Speech',
  description:
    'Learn the most-used Arabic verbs for daily life — to want, to go, to love, to accept, to understand — with present tense, transliteration, and example sentences. Search in English or Arabic.',
  alternates: { canonical: 'https://quroots.com/verbs' },
  keywords: [
    'Arabic verbs', 'common Arabic verbs', 'daily Arabic verbs', 'most used Arabic verbs',
    'learn Arabic verbs', 'Arabic verbs with examples', 'speak Arabic', 'Arabic vocabulary',
  ],
  openGraph: {
    title: 'Daily Arabic Verbs — The Most Useful Verbs for Everyday Speech',
    description:
      'The everyday Arabic verbs that let you say most of what you need — with examples. Search in English or Arabic.',
    url: 'https://quroots.com/verbs',
    siteName: 'QuRoots',
  },
};

export default function VerbsPage() {
  return <DailyVerbsClient />;
}
