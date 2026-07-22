import type { Metadata } from 'next';
import Link from 'next/link';
import { DonateWidget } from '@/components/support/DonateWidget';

export const metadata: Metadata = {
  title: 'Support QuRoots — Sadaqah Jariyah for Quranic Learning',
  description:
    'QuRoots is free for everyone, forever. Support it with a one-time gift and help keep Quranic Arabic learning open to every Muslim — a sadaqah jariyah that keeps giving.',
  alternates: { canonical: 'https://quroots.com/support' },
  openGraph: {
    title: 'Support QuRoots — Sadaqah Jariyah for Quranic Learning',
    description:
      'QuRoots is free for everyone, forever. Your gift keeps Quranic Arabic learning open to every Muslim.',
    url: 'https://quroots.com/support',
    siteName: 'QuRoots',
  },
};

const GOLD = '#D4A246';

const WHERE_IT_GOES = [
  {
    title: 'Keep it free',
    body: 'No ads, no paywalls, no “premium” tier. Every learner gets everything — your gift is what makes that possible.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0 0V3m9 9H3" />
    ),
  },
  {
    title: 'Grow the lessons',
    body: 'Word-by-word tafsir, new grammar units, more reciters. Donations pay for the hours it takes to build them well.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    ),
  },
  {
    title: 'Reach more learners',
    body: 'Servers, recitation audio, and translations for thousands of Muslims worldwide — and the many more still to come.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    ),
  },
];

export default function SupportPage() {
  return (
    <div className="max-w-2xl mx-auto pb-16">
      {/* ── Hero: the sadaqah jariyah thesis ── */}
      <section className="relative text-center pt-6 pb-12">
        {/* Ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 30%, rgba(212,162,70,0.08) 0%, transparent 70%)' }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span style={{ height: 1, width: 28, background: 'rgba(212,162,70,0.4)' }} />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: GOLD }}>
              Sadaqah Jariyah
            </span>
            <span style={{ height: 1, width: 28, background: 'rgba(212,162,70,0.4)' }} />
          </div>

          <h1
            className="font-heading leading-[1.1] mb-6"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#F0E8D8' }}
          >
            Knowledge that keeps
            <br />giving, long after you give.
          </h1>

          {/* The hadith — the emotional and theological anchor */}
          <div
            className="rounded-2xl px-6 py-7 mb-8 text-center"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,162,70,0.14)' }}
          >
            <p
              className="font-arabic leading-loose mb-4"
              dir="rtl"
              style={{ fontSize: 'clamp(1.3rem, 3.6vw, 1.8rem)', color: '#F0E8D8', textShadow: '0 0 40px rgba(212,162,70,0.15)' }}
            >
              إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ
            </p>
            <p className="text-sm sm:text-base font-heading italic leading-relaxed mb-2" style={{ color: '#A09F9B' }}>
              “When a person dies, their deeds end — except three: an ongoing charity,
              knowledge that benefits, or a righteous child who prays for them.”
            </p>
            <p className="text-[11px] uppercase tracking-widest" style={{ color: '#57534E' }}>
              Ṣaḥīḥ Muslim · 1631
            </p>
          </div>

          <p className="text-base leading-relaxed max-w-lg mx-auto" style={{ color: '#A09F9B' }}>
            QuRoots is free for everyone, forever — no ads, nothing locked. Every gift helps
            another Muslim understand the words they recite. That understanding is yours to give.
          </p>
        </div>
      </section>

      {/* ── The donation card ── */}
      <section className="mb-16">
        <div
          className="rounded-3xl p-6 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(212,162,70,0.1) 0%, rgba(255,255,255,0.02) 100%)',
            border: '1px solid rgba(212,162,70,0.22)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
          }}
        >
          <div className="text-center mb-6">
            <p className="font-arabic text-2xl mb-1" style={{ color: GOLD }} dir="rtl">هَدِيَّة</p>
            <h2 className="font-heading text-xl" style={{ color: '#F0E4CA' }}>Give what you can</h2>
            <p className="text-xs mt-1" style={{ color: '#8A8783' }}>One-time · any amount · secure checkout by Stripe</p>
          </div>
          <div className="max-w-sm mx-auto">
            <DonateWidget />
          </div>
        </div>
      </section>

      {/* ── Where your gift goes ── */}
      <section className="mb-14">
        <p className="text-center text-[10px] uppercase tracking-[0.25em] font-bold mb-6" style={{ color: GOLD }}>
          Where your gift goes
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          {WHERE_IT_GOES.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(212,162,70,0.12)', color: GOLD }}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  {item.icon}
                </svg>
              </div>
              <h3 className="text-sm font-semibold mb-1.5" style={{ color: '#EDEDEC' }}>{item.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: '#8A8783' }}>{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Closing reassurance ── */}
      <section className="text-center">
        <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: '#8A8783' }}>
          Not able to give right now? That&apos;s completely okay — QuRoots stays free for you
          either way. The most valuable thing you can share is a{' '}
          <Link href="/quran" className="underline" style={{ color: GOLD }}>link to a friend</Link>.
        </p>
        <p className="mt-6 font-arabic text-lg" style={{ color: 'rgba(212,162,70,0.4)' }} dir="rtl">جَزَاكُمُ اللّٰهُ خَيْرًا</p>
      </section>
    </div>
  );
}
