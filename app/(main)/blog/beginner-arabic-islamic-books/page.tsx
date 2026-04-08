import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Beginner-Friendly Arabic & Islamic Books — Free & Cheap | QuRoots',
  description: "A curated reading list for beginners: Abul Hasan Ali Nadwi's Qasas an-Nabiyyin, Stories of the Prophets, the Madinah Books, Duruus al-Lughah, Al-Arabiyyah Bayna Yadayk and more — with free archive.org links.",
  alternates: { canonical: 'https://quroots.com/blog/beginner-arabic-islamic-books' },
  openGraph: {
    title: 'Beginner-Friendly Arabic & Islamic Books | QuRoots',
    description: 'Curated free + cheap books for beginners learning Arabic and Islamic studies.',
    url: 'https://quroots.com/blog/beginner-arabic-islamic-books',
    type: 'article',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

type Book = {
  title: string;
  arabic: string;
  author: string;
  level: 'Absolute beginner' | 'Beginner' | 'Beginner+';
  why: string;
  format: string[];
  freeUrl?: string;
  buyNote?: string;
  tags: string[];
  accent: string;
};

const BOOKS: Book[] = [
  {
    title: 'Qaṣaṣ an-Nabiyyīn li-l-Aṭfāl',
    arabic: 'قَصَصُ النَّبِيِّينَ لِلْأَطْفَال',
    author: 'Abul Hasan Ali Nadwi (Sayyid Abul Ḥasan ʿAlī al-Nadwī)',
    level: 'Absolute beginner',
    why: "Written by Nadwi for his own nephews to learn Arabic. Five short volumes that retell prophet stories in clear, gentle classical Arabic. Possibly the single best first reader for a Quranic Arabic learner — vocabulary repeats naturally, sentences stay short, and the narrative pulls you forward.",
    format: ['5 volumes', 'Vowelled (mushakkal)', '~150 pages each'],
    freeUrl: 'https://archive.org/details/QasasNabiyyeen',
    buyNote: 'Often $3–6/volume from Islamic bookshops; full set commonly $20–30.',
    tags: ['Arabic reader', 'Sira', 'Vowelled'],
    accent: '#34D399',
  },
  {
    title: 'Stories of the Prophets',
    arabic: 'قَصَصُ الأَنْبِيَاء',
    author: 'Ibn Kathīr (abridged)',
    level: 'Beginner',
    why: "The classic collection of prophet stories drawn from the Quran and authentic hadith. The English abridgements (Darussalam, etc.) are accessible — read them alongside Nadwi's Arabic version to anchor vocabulary in stories you already know.",
    format: ['English abridgement widely available', 'Original Arabic also free'],
    freeUrl: 'https://archive.org/details/StoriesOfTheProphetsIbnKathir',
    buyNote: 'Darussalam paperback ~$10–15.',
    tags: ['Sira', 'English available'],
    accent: '#D4A246',
  },
  {
    title: "Duruus al-Lughah al-ʿArabiyyah (Madīnah Books)",
    arabic: 'دُرُوسُ اللُّغَةِ العَرَبِيَّة',
    author: "Dr. V. Abdur Raheem (Islamic University of Madinah)",
    level: 'Absolute beginner',
    why: 'The de facto Arabic textbook in the English-speaking Muslim world. Three books take you from the alphabet to reading classical texts, using only Quranic vocabulary. Free PDFs, free YouTube playthroughs by many teachers. If you finish Book 1 you already understand huge stretches of the Quran.',
    format: ['3 books', 'Solutions + audio online', 'Vowelled'],
    freeUrl: 'https://archive.org/details/MadinaArabicBooks1To3',
    buyNote: 'Print copies ~$8–12 each.',
    tags: ['Textbook', 'Self-study', 'Vowelled'],
    accent: '#D4A246',
  },
  {
    title: 'Al-ʿArabiyyah Bayna Yadayk',
    arabic: 'العَرَبِيَّةُ بَيْنَ يَدَيْك',
    author: 'Dr. ʿAbd ar-Raḥmān al-Fawzān et al.',
    level: 'Beginner+',
    why: 'A more conversational, modern fusha course used in Saudi institutes. Stronger on speaking and everyday vocabulary than the Madinah books, while still strict fusha. Pair it with the Madinah books for balance: Madinah for Quranic reading skill, Bayna Yadayk for active fluency.',
    format: ['4+ books', 'Audio + workbooks', 'Mostly vowelled'],
    freeUrl: 'https://archive.org/details/al-arabiya-bayna-yadayk',
    buyNote: 'Full set ~$40–60.',
    tags: ['Conversational fusha', 'Course'],
    accent: '#A78BFA',
  },
  {
    title: 'Riyāḍ aṣ-Ṣāliḥīn',
    arabic: 'رِيَاضُ الصَّالِحِين',
    author: 'Imām al-Nawawī',
    level: 'Beginner',
    why: 'A topically organized collection of around 1,900 hadith on character, worship, and daily life. The Arabic is clear and the English translations (Darussalam) sit on the facing page in most editions. Perfect for short daily reading: pick a chapter, read 3 hadith, look up one root.',
    format: ['Bilingual editions common', 'Topical chapters'],
    freeUrl: 'https://archive.org/details/RiyadusSaliheen',
    buyNote: 'Bilingual paperback ~$12–18; 2-volume hardcover ~$25.',
    tags: ['Hadith', 'Bilingual'],
    accent: '#60A5FA',
  },
  {
    title: 'Tafsīr al-Jalālayn (with English translation)',
    arabic: 'تَفْسِيرُ الجَلَالَيْن',
    author: 'al-Maḥallī &amp; al-Suyūṭī',
    level: 'Beginner+',
    why: 'A short tafsir written between the lines of the mushaf — the original training-wheels tafsir. Once your Arabic is at Madinah Book 2 level, reading Jalalayn alongside the Quran is a huge unlock for understanding verses on your own.',
    format: ['Single volume', 'English translations exist (Feras Hamza et al.)'],
    freeUrl: 'https://www.altafsir.com/Tafasir.asp?tMadhNo=0&tTafsirNo=74',
    buyNote: 'English single-vol ~$25.',
    tags: ['Tafsir', 'Quran companion'],
    accent: '#F472B6',
  },
  {
    title: 'Forty Hadith of Imam an-Nawawi',
    arabic: 'الأَرْبَعُونَ النَّوَوِيَّة',
    author: 'Imām al-Nawawī',
    level: 'Absolute beginner',
    why: 'Forty short, foundational hadith — most learners memorize at least a handful of these in their lifetime. Free everywhere, fully translated, perfect first hadith text. Each one is a tiny vocabulary drill with massive spiritual return.',
    format: ['Pocket-sized', 'Bilingual', 'Memorizable'],
    freeUrl: 'https://sunnah.com/nawawi40',
    buyNote: 'Booklet ~$3–6.',
    tags: ['Hadith', 'Memorize'],
    accent: '#34D399',
  },
  {
    title: 'The Sealed Nectar (ar-Raḥīq al-Makhtūm)',
    arabic: 'الرَّحِيقُ المَخْتُوم',
    author: 'Safiur-Rahman al-Mubarakpuri',
    level: 'Beginner',
    why: "A modern, award-winning sira of the Prophet ﷺ. Available free in PDF and very cheap in print. Read the English first to know the story, then read Nadwi's Arabic prophet stories — you'll be amazed how much vocabulary sticks.",
    format: ['English & Arabic', 'Single volume'],
    freeUrl: 'https://archive.org/details/TheSealedNectar',
    buyNote: 'Darussalam paperback ~$12.',
    tags: ['Sira', 'English'],
    accent: '#D4A246',
  },
];

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Beginner-Friendly Arabic & Islamic Books — Free & Cheap',
  description: 'Curated reading list for beginners learning Arabic and Islamic studies, with free PDFs and cheap purchase options.',
  url: 'https://quroots.com/blog/beginner-arabic-islamic-books',
  inLanguage: 'en',
  author: { '@type': 'Organization', name: 'QuRoots' },
  publisher: { '@type': 'Organization', name: 'QuRoots' },
  datePublished: '2026-04-07',
};

const LEVEL_BADGE: Record<Book['level'], string> = {
  'Absolute beginner': 'rgba(16,185,129,0.14)',
  'Beginner':          'rgba(212,162,70,0.14)',
  'Beginner+':         'rgba(167,139,250,0.14)',
};
const LEVEL_TEXT: Record<Book['level'], string> = {
  'Absolute beginner': '#34D399',
  'Beginner':          '#D4A246',
  'Beginner+':         '#A78BFA',
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
          <span style={{ color: '#A09F9B' }}>Beginner Books</span>
        </div>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="h-px w-6" style={{ background: 'rgba(16,185,129,0.6)' }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: '#34D399' }}>
              Books · Beginner
            </span>
          </div>
          <h1 className="font-heading text-3xl sm:text-4xl mb-4 tracking-tight leading-tight" style={{ color: '#F0E8D8', letterSpacing: '-0.02em' }}>
            Beginner-Friendly Arabic &amp; Islamic Books
          </h1>
          <p className="text-base leading-relaxed" style={{ color: '#A09F9B' }}>
            A short, opinionated list of books a complete beginner can actually finish. Every entry has a free legal PDF link (archive.org / sunnah.com / altafsir.com) and a rough price for a paper copy. No affiliate links — these are simply the books that have worked for generations of students.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-[11px]" style={{ color: '#636260' }}>
            <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399' }}>{BOOKS.length} books</span>
            <span>·</span>
            <span>Free PDFs included</span>
            <span>·</span>
            <span>~7 min read</span>
          </div>
        </header>

        {/* Reading order callout */}
        <div className="mb-10 rounded-2xl p-5" style={{ background: 'rgba(212,162,70,0.05)', border: '1px solid rgba(212,162,70,0.18)' }}>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#D4A246' }}>
            Suggested order
          </h2>
          <ol className="space-y-1.5 text-sm" style={{ color: '#A09F9B' }}>
            <li><span className="font-mono text-[#D4A246]">1.</span> 40 Hadith Nawawi <em>(2 weeks)</em></li>
            <li><span className="font-mono text-[#D4A246]">2.</span> Madinah Book 1 + Nadwi&rsquo;s Qasas Vol. 1 <em>(in parallel)</em></li>
            <li><span className="font-mono text-[#D4A246]">3.</span> Stories of the Prophets (English) for the storyline</li>
            <li><span className="font-mono text-[#D4A246]">4.</span> Riyad as-Salihin — daily 3 hadith</li>
            <li><span className="font-mono text-[#D4A246]">5.</span> Madinah Books 2–3, then Jalalayn alongside the Quran</li>
          </ol>
        </div>

        {/* Books */}
        <div className="space-y-5">
          {BOOKS.map((book, i) => (
            <div
              key={book.title}
              className="rounded-2xl p-6 transition-all hover:-translate-y-0.5"
              style={{
                background: `linear-gradient(165deg, ${book.accent}08 0%, rgba(255,255,255,0.03) 60%)`,
                border: `1px solid ${book.accent}25`,
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              }}
            >
              {/* Header row */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-mono text-sm font-bold"
                  style={{ background: `${book.accent}15`, color: book.accent, border: `1px solid ${book.accent}40` }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 mb-1">
                    <h3 className="font-heading text-lg leading-tight" style={{ color: '#F0E8D8' }}
                        dangerouslySetInnerHTML={{ __html: book.title }} />
                    <span
                      className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ background: LEVEL_BADGE[book.level], color: LEVEL_TEXT[book.level] }}
                    >
                      {book.level}
                    </span>
                  </div>
                  <p className="font-arabic text-xl leading-none mb-1" style={{ color: book.accent, textShadow: `0 0 18px ${book.accent}40` }}>
                    {book.arabic}
                  </p>
                  <p className="text-[11px]" style={{ color: '#636260' }}>
                    {book.author}
                  </p>
                </div>
              </div>

              {/* Why */}
              <p className="text-sm leading-relaxed mb-4" style={{ color: '#B8B6B0' }}>
                {book.why}
              </p>

              {/* Format pills */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {book.format.map((f) => (
                  <span
                    key={f}
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#A09F9B', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-4" style={{ borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
                {book.freeUrl && (
                  <a
                    href={book.freeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all hover:scale-[1.02]"
                    style={{ background: `${book.accent}18`, color: book.accent, border: `1px solid ${book.accent}40` }}
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Read free PDF
                  </a>
                )}
                {book.buyNote && (
                  <span className="text-[11px]" style={{ color: '#636260' }}>
                    · {book.buyNote}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Closing */}
        <div className="mt-12 rounded-2xl p-6" style={{ background: 'rgba(212,162,70,0.05)', border: '1px solid rgba(212,162,70,0.15)' }}>
          <h3 className="font-heading text-lg mb-2" style={{ color: '#F0E8D8' }}>
            One book is enough
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#A09F9B' }}>
            The most common mistake is collecting books instead of finishing one. Pick <strong>Madinah Book 1</strong> and <strong>Nadwi&rsquo;s Qasas Volume 1</strong> — that&rsquo;s it. Read 2 pages a day. In a year you&rsquo;ll be reading the Quran in a way you didn&rsquo;t think possible.
          </p>
        </div>

        {/* Next */}
        <div className="mt-8 flex items-center justify-between text-sm">
          <Link href="/blog/daily-arabic-words" className="text-[#57534E] hover:text-[#D4A246] transition-colors">← Daily Arabic words</Link>
          <Link href="/blog" className="text-[#D4A246] hover:underline">All articles →</Link>
        </div>
      </article>
    </>
  );
}
