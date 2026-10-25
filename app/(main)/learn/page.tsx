import type { Metadata } from 'next';
import Link from 'next/link';

const QIRAT_UNLOCKED = process.env.NEXT_PUBLIC_UNLOCK_QIRAT === 'true';

export const metadata: Metadata = {
  title: 'Learn Arabic — Interactive Quranic Arabic Courses | QuRoots',
  description: 'Structured, interactive courses to learn Quranic Arabic from scratch — vocabulary, grammar, recitation and qirat, with progress tracking.',
  alternates: { canonical: 'https://quroots.com/learn' },
  openGraph: {
    title: 'Learn Arabic — Quranic Arabic Courses | QuRoots',
    description: 'Interactive Quranic Arabic courses with progress tracking.',
    url: 'https://quroots.com/learn',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

const COURSES = [
  {
    href: '/salah',
    title: 'Understand your salah in 30 days',
    arabic: 'إِيَّاكَ نَعْبُدُ',
    description: 'Every word of Al-Fātiḥa and the short surahs you pray with, two or three roots a day. The first week is free.',
    badge: 'Start here',
    badgeColor: '#D4A246',
    color: '#D4A246',
    locked: false,
  },
  {
    href: '/learn/path',
    title: 'Arabic from scratch',
    arabic: 'مسار التعلّم',
    description: 'Step-by-step lessons covering vocabulary, grammar, and reading skills. Built around Quranic Arabic, with exercises, streaks, and progress tracking.',
    badge: 'Active',
    badgeColor: '#C9B48A',
    color: '#D4A246',
    locked: false,
  },
  {
    href: '/learn/qirat',
    title: 'Learn Qirat &amp; Maqam',
    arabic: 'تعلّم القراءة',
    description: 'Master Quranic recitation with pitch training, ear training, and melodic mode (maqam) recognition.',
    badge: QIRAT_UNLOCKED ? 'New' : 'Soon',
    badgeColor: QIRAT_UNLOCKED ? '#10B981' : '#7C3AED',
    color: '#7C3AED',
    locked: !QIRAT_UNLOCKED,
  },
];

export default function LearnHubPage() {
  return (
    <div className="max-w-4xl py-4">

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="h-px w-6" style={{ background: 'rgba(212,162,70,0.5)' }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: '#D4A246' }}>
            Courses
          </span>
        </div>
        <h1 className="font-heading text-[36px] sm:text-[42px] mb-3 tracking-tight" style={{ color: '#F0E8D8', letterSpacing: '-0.02em' }}>
          Learn Quranic Arabic
        </h1>
        <p className="text-[16px] leading-relaxed text-text-secondary" style={{ maxWidth: '36rem' }}>
          Interactive, structured courses that take you from your first Arabic letter to reading the Quran with comprehension. Choose a course below to begin.
        </p>
      </div>

      {/* Courses */}
      <div className="grid gap-4 sm:grid-cols-2 mb-12">
        {COURSES.filter((c) => !c.locked).map((course) => (
          <Link
            key={course.href}
            href={course.href}
            className="group flex flex-col gap-4 rounded-3xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.05]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              opacity: course.locked ? 0.7 : 1,
            }}
          >
            <div className="shrink-0 pt-0.5">
              <span
                className="font-arabic text-[30px] leading-none"
                style={{ color: course.color, textShadow: `0 0 20px ${course.color}40` }}
              >
                {course.arabic}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-1.5">
                <h2
                  className="text-[18px] font-semibold leading-snug"
                  style={{ color: '#EDEDEC' }}
                  dangerouslySetInnerHTML={{ __html: course.title }}
                />
                <span
                  className="shrink-0 text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ background: `${course.badgeColor}22`, color: course.badgeColor }}
                >
                  {course.badge}
                </span>
              </div>
              <p className="text-[15px] leading-relaxed text-text-secondary">
                {course.description}
              </p>
            </div>

            <svg
              className="w-4 h-4 shrink-0 self-end mt-auto transition-transform group-hover:translate-x-0.5"
              style={{ color: '#7A7874' }}
              fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Pointer to blog */}
      <Link
        href="/blog"
        className="block rounded-2xl p-5 transition-all hover:-translate-y-0.5"
        style={{
          background: 'rgba(212,162,70,0.05)',
          border: '1px solid rgba(212,162,70,0.15)',
        }}
      >
        <div className="flex items-center gap-3 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: '#D4A246' }}>
            Also explore
          </span>
          <span className="h-px flex-1" style={{ background: 'rgba(212,162,70,0.15)' }} />
        </div>
        <h3 className="text-[16px] font-semibold mb-1" style={{ color: '#EDEDEC' }}>
          Read the QuRoots Blog →
        </h3>
        <p className="text-[15px] leading-relaxed text-text-secondary">
          In-depth articles on grammar (i&rsquo;rab, verb forms, plurals), daily fusha vocabulary, and beginner-friendly Islamic books.
        </p>
      </Link>
    </div>
  );
}
