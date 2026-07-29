import type { Metadata } from 'next';
import { DailyWordsClient } from '@/components/words/DailyWordsClient';
import { FaqSection, faqJsonLd, type FaqItem } from '@/components/seo/FaqSection';
import { dailyWords } from '@/data/dailyWords';

export const metadata: Metadata = {
  title: 'Everyday Arabic Words & Expressions — Speak Naturally',
  description:
    'The most useful everyday Arabic words: expressions (honestly, of course), connectors (on the contrary, on the other hand), feelings, and describing words — with transliteration and examples. Search in English or Arabic.',
  alternates: { canonical: 'https://quroots.com/words' },
  keywords: [
    'Arabic words', 'common Arabic words', 'Arabic expressions', 'Arabic connecting words',
    'everyday Arabic', 'Arabic adjectives', 'how to say honestly in Arabic', 'Arabic conversation words',
  ],
  openGraph: {
    title: 'Everyday Arabic Words & Expressions — Speak Naturally',
    description:
      'Expressions, connectors, feelings, and describing words — the glue of real Arabic conversation. Search in English or Arabic.',
    url: 'https://quroots.com/words',
    siteName: 'QuRoots',
  },
};

const FAQ: FaqItem[] = [
  {
    q: 'How do you say "honestly" in Arabic?',
    a: '“Honestly” or “frankly” is بِصَراحة (biṣarāḥa). For example: بِصَراحة، لَمْ يُعْجِبْني الفِلْم — “Honestly, I didn’t like the film.”',
  },
  {
    q: 'What are common Arabic connecting words?',
    a: 'The most useful connectors include لكِنْ (but), لِأَنَّ (because), لِذلِك (therefore), بِالإِضافةِ إِلى (in addition to), على العَكْس (on the contrary), and مِنْ ناحيةٍ أُخْرى (on the other hand).',
  },
  {
    q: 'What are the most common Arabic "m-" words?',
    a: 'Everyday words that start with م include مُهِمّ (important), مُمْتاز (excellent), مُمْكِن (possible), مَمْنوع (forbidden), مَشْغول (busy), مُناسِب (suitable), and مُمْتَنّ (grateful).',
  },
  {
    q: 'How many words do you need to have a basic Arabic conversation?',
    a: 'A few hundred high-frequency words — common verbs, plus everyday expressions, connectors, and describing words like these — cover the vast majority of daily conversation.',
  },
];

export default function WordsPage() {
  const learningResource = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: 'Everyday Arabic Words & Expressions',
    url: 'https://quroots.com/words',
    inLanguage: ['ar', 'en'],
    learningResourceType: 'Vocabulary list',
    educationalLevel: 'Beginner',
    teaches: 'Everyday Arabic expressions, connectors, feelings, and describing words',
    about: { '@type': 'Thing', name: 'Arabic vocabulary' },
    isPartOf: { '@type': 'WebSite', name: 'QuRoots', url: 'https://quroots.com' },
    numberOfItems: dailyWords.length,
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://quroots.com' },
      { '@type': 'ListItem', position: 2, name: 'Everyday Words', item: 'https://quroots.com/words' },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(learningResource) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(FAQ)) }} />
      <DailyWordsClient />
      <FaqSection items={FAQ} />
    </>
  );
}
