import type { Metadata } from 'next';
import Link from 'next/link';
import DailyArabicClient from './DailyArabicClient';

export const metadata: Metadata = {
  title: 'Daily Arabic — 30 Fusha Words & Sentences to Live With | QuRoots',
  description: 'A handpicked list of 30 everyday classical Arabic (fusha) words and 12 ready-to-use sentences — vowelled, transliterated, with Quranic context. Strictly fusha, no dialect.',
  alternates: { canonical: 'https://quroots.com/blog/daily-arabic-words' },
  openGraph: {
    title: 'Daily Arabic — 30 Fusha Words & Sentences | QuRoots',
    description: '30 everyday Arabic words + 12 sentences in fusha, with vowels and Quranic examples.',
    url: 'https://quroots.com/blog/daily-arabic-words',
    type: 'article',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Daily Arabic — 30 Fusha Words & Sentences to Live With',
  description: '30 everyday classical Arabic words and 12 sentences, fully vowelled, with Quranic context.',
  url: 'https://quroots.com/blog/daily-arabic-words',
  inLanguage: 'en',
  author: { '@type': 'Organization', name: 'QuRoots' },
  publisher: { '@type': 'Organization', name: 'QuRoots' },
  datePublished: '2026-04-07',
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article className="max-w-2xl mx-auto px-4 py-10">
        {/* Crumb */}
        <div className="mb-6 text-[11px]" style={{ color: '#57534E' }}>
          <Link href="/blog" className="hover:text-[#D4A246] transition-colors">Blog</Link>
          <span className="mx-2">›</span>
          <span style={{ color: '#A09F9B' }}>Daily Arabic</span>
        </div>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-6" style={{ background: 'rgba(16,185,129,0.6)' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#34D399' }}>
              Vocabulary · Beginner
            </span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl mb-4 tracking-tight leading-tight" style={{ color: '#F0E8D8', letterSpacing: '-0.02em' }}>
            Daily Arabic — 30 Fusha Words &amp; Sentences to Live With
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#A09F9B' }}>
            Thirty everyday Arabic words and twelve ready-to-use sentences, fully vowelled, with transliteration, English meaning, and a Quranic context line for each. Tap any card to flip it. Strictly <em>fusha</em> (Modern Standard / classical) — no dialect.
          </p>
          <div className="mt-5 flex items-center gap-2 text-[11px]" style={{ color: '#636260' }}>
            <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399' }}>5 min read</span>
            <span>·</span>
            <span>30 words · 12 sentences</span>
          </div>
        </header>

        <DailyArabicClient />

        {/* Closing */}
        <div className="mt-12 rounded-2xl p-6" style={{ background: 'rgba(212,162,70,0.05)', border: '1px solid rgba(212,162,70,0.15)' }}>
          <h3 className="font-heading text-lg mb-2" style={{ color: '#F0E8D8' }}>
            How to actually retain these
          </h3>
          <ol className="space-y-2 text-sm leading-relaxed list-decimal pl-5" style={{ color: '#A09F9B' }}>
            <li>Pick <strong>3 words a day</strong> — not 30. Read them aloud with the harakāt.</li>
            <li>Use each one in <strong>your own sentence</strong>, even a clumsy one.</li>
            <li>Open the Quran and search for the root — see it in context. Use <Link href="/roots" className="text-[#D4A246] hover:underline">QuRoots</Link>.</li>
            <li>Review yesterday&rsquo;s 3 before learning today&rsquo;s 3.</li>
          </ol>
        </div>

        {/* Next */}
        <div className="mt-8 flex items-center justify-between text-sm">
          <Link href="/blog" className="text-[#57534E] hover:text-[#D4A246] transition-colors">← All articles</Link>
          <Link href="/blog/beginner-arabic-islamic-books" className="text-[#D4A246] hover:underline">
            Next: Beginner books →
          </Link>
        </div>
      </article>
    </>
  );
}
