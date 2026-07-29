import type { Metadata } from 'next';
import { DailyVerbsClient } from '@/components/verbs/DailyVerbsClient';
import { FaqSection, faqJsonLd, type FaqItem } from '@/components/seo/FaqSection';
import { dailyVerbs } from '@/data/dailyVerbs';

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

const FAQ: FaqItem[] = [
  {
    q: 'What are the most common Arabic verbs?',
    a: 'The highest-frequency everyday verbs include ذَهَبَ (to go), جاءَ (to come), أَرادَ (to want), أَحَبَّ (to love), عَرَفَ (to know), قالَ (to say), and فَعَلَ (to do). Learning a few hundred of these covers most daily speech.',
  },
  {
    q: 'How do you say "to love" in Arabic?',
    a: '“To love” is أَحَبَّ (aḥabba) in the past tense and يُحِبّ (yuḥibb) in the present. For example: أُحِبُّ عائِلَتي — “I love my family.”',
  },
  {
    q: 'How many Arabic verbs do you need to speak?',
    a: 'Roughly 250–500 high-frequency verbs cover the vast majority of everyday conversation. Focus on the common ones first — the present tense (يفعل) is the form you use to say “I do it”.',
  },
  {
    q: 'What is the difference between the past and present tense shown here?',
    a: 'Each verb shows the past tense (the base/dictionary form, e.g. ذَهَبَ “he went”) and the present tense in gold (يَذْهَب “he goes / is going”), which is the form you build “I / you / we do” from.',
  },
];

export default function VerbsPage() {
  const learningResource = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: 'Daily Arabic Verbs',
    url: 'https://quroots.com/verbs',
    inLanguage: ['ar', 'en'],
    learningResourceType: 'Vocabulary list',
    educationalLevel: 'Beginner',
    teaches: 'The most useful everyday Arabic verbs with past & present tense and examples',
    about: { '@type': 'Thing', name: 'Arabic verbs' },
    isPartOf: { '@type': 'WebSite', name: 'QuRoots', url: 'https://quroots.com' },
    numberOfItems: dailyVerbs.length,
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://quroots.com' },
      { '@type': 'ListItem', position: 2, name: 'Daily Verbs', item: 'https://quroots.com/verbs' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResource) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ)) }} />
      <DailyVerbsClient />
      <FaqSection items={FAQ} />
    </>
  );
}
