'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';

// --- Scroll-reveal via IntersectionObserver ---
function useScrollReveal() {
  useEffect(() => {
    const groups = document.querySelectorAll('[data-reveal-group]');
    const observers: IntersectionObserver[] = [];

    groups.forEach((group) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            group.querySelectorAll<HTMLElement>('.reveal').forEach((el) => {
              el.classList.add('revealed');
            });
            observer.disconnect();
          }
        },
        { rootMargin: '-60px 0px', threshold: 0 }
      );
      observer.observe(group);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);
}

// --- Animated counter ---
function useCounter(end: number, duration = 2000) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let startTime: number;
    let frame: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [started, end, duration]);

  return { count, start: () => setStarted(true) };
}

// --- Verse of the Day ---
const FEATURED_VERSES = [
  {
    arabic: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    translation: 'Indeed, with hardship comes ease.',
    reference: 'Surah Ash-Sharh · 94:6',
    surahLink: '/quran/94',
  },
  {
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُ',
    translation: 'Whoever relies upon Allah — then He is sufficient for him.',
    reference: 'Surah At-Talaq · 65:3',
    surahLink: '/quran/65',
  },
  {
    arabic: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ',
    translation: 'Remember Me; I will remember you.',
    reference: 'Surah Al-Baqarah · 2:152',
    surahLink: '/quran/2',
  },
  {
    arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰٓ',
    translation: 'Your Lord is going to give you, and you will be satisfied.',
    reference: 'Surah Ad-Duha · 93:5',
    surahLink: '/quran/93',
  },
  {
    arabic: 'رَبِّ زِدْنِى عِلْمًا',
    translation: 'My Lord, increase me in knowledge.',
    reference: 'Surah Ta-Ha · 20:114',
    surahLink: '/quran/20',
  },
];

// --- Sample roots for preview ---
const SAMPLE_ROOTS = [
  { root: 'ع ل م', meaning: 'to know', freq: 854 },
  { root: 'ك ت ب', meaning: 'to write', freq: 319 },
  { root: 'ق و ل', meaning: 'to say', freq: 1722 },
  { root: 'أ م ن', meaning: 'to believe', freq: 879 },
  { root: 'ج ع ل', meaning: 'to make', freq: 346 },
  { root: 'ر ح م', meaning: 'to have mercy', freq: 339 },
];

export function HomepageClient() {
  const { lastRead, streak } = useAppStore();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  useScrollReveal();

  const roots = useCounter(1716, 1800);
  const ayahs = useCounter(6236, 2200);
  const words = useCounter(77429, 2400);

  const statsRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          roots.start();
          ayahs.start();
          words.start();
          observer.disconnect();
        }
      },
      { rootMargin: '-80px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [verse] = useState(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    return FEATURED_VERSES[dayOfYear % FEATURED_VERSES.length];
  });

  const primaryHref = isMounted && lastRead
    ? `/quran/${lastRead.surah}#ayah-${lastRead.ayah}`
    : '/quran/1';
  const primaryLabel = isMounted && lastRead ? 'Continue Reading' : 'Start with Al-Fatiha';

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">

      {/* ===== TOP NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <Link href="/" className="text-base font-semibold tracking-tight text-white">
            Qu<span className="text-gold">Roots</span>
          </Link>
          <div className="hidden sm:flex items-center gap-8">
            {[
              { href: '/quran', label: 'Quran' },
              { href: '/roots', label: 'Roots' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white/45 hover:text-white transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/quran"
            className="text-sm font-semibold text-background bg-gold hover:bg-gold-light px-4 py-2 rounded-lg transition-colors duration-150"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-14 overflow-hidden">

        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Warm radial glow at top-center */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[700px]"
            style={{ background: 'radial-gradient(ellipse at center top, rgba(232,184,109,0.09) 0%, transparent 65%)' }} />
          {/* Subtle cool accent bottom right */}
          <div className="absolute bottom-0 -right-40 w-[600px] h-[500px]"
            style={{ background: 'radial-gradient(ellipse at center, rgba(80,100,200,0.04) 0%, transparent 70%)' }} />
        </div>

        {/* Giant Arabic watermark — ٱقْرَأْ means "Read!" (first word revealed of the Quran) */}
        <div className="hero-bg-word absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span
            className="font-arabic select-none leading-none"
            style={{
              fontSize: 'clamp(200px, 38vw, 520px)',
              color: 'rgba(232, 184, 109, 0.032)',
              transform: 'translateY(-6%)',
            }}
          >
            ٱقْرَأْ
          </span>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto">

          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-gold/20 bg-gold/[0.07] mb-10">
            <span className="w-1.5 h-1.5 rounded-full bg-gold/70 soft-pulse" />
            <span className="text-xs font-semibold text-gold/80 tracking-wide uppercase">
              The language of the Quran
            </span>
          </div>

          {/* Headline — weight contrast is the whole trick */}
          <div className="hero-title mb-8">
            <p className="text-3xl sm:text-4xl lg:text-5xl font-light text-white/40 tracking-tight leading-[1.2] mb-3">
              You&apos;ve been reciting these words
              <br />your whole life.
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]"
              style={{
                background: 'linear-gradient(135deg, #F5CFA0 0%, #E8B86D 55%, #D4956A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Now understand them.
            </h1>
          </div>

          {/* Sub-headline — the concrete promise */}
          <p className="hero-subtitle text-base sm:text-lg text-white/35 max-w-sm mx-auto mb-10 leading-relaxed">
            Learn 300 roots.
            Understand 80% of the Quran.
          </p>

          {/* CTA — single primary action */}
          <div className="hero-cta flex flex-col items-center gap-4">
            <Link href={primaryHref} className="btn-primary">
              {primaryLabel}
              <ArrowRightIcon />
            </Link>
            <p className="text-sm text-white/25">
              or{' '}
              <Link
                href="/roots"
                className="text-white/38 hover:text-white/70 underline underline-offset-4 decoration-white/20 hover:decoration-white/40 transition-all duration-150"
              >
                explore Arabic roots
              </Link>
            </p>
          </div>

          {/* Social proof line */}
          {isMounted && streak.count > 0 && (
            <p className="hero-proof mt-8 text-xs text-white/20 tracking-wide">
              {streak.count} day streak 🔥
            </p>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="hero-scroll absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="animate-scroll-bounce w-[18px] h-7 rounded-full border border-white/[0.12] flex items-start justify-center pt-1.5">
            <div className="w-[3px] h-[6px] rounded-full bg-white/20" />
          </div>
        </div>
      </section>

      {/* ===== STATS — three numbers, minimal and clean ===== */}
      <section ref={statsRef} className="py-16 border-t border-white/[0.04]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: roots.count.toLocaleString(), label: 'Verb Roots' },
              { value: ayahs.count.toLocaleString(), label: 'Ayahs' },
              { value: words.count.toLocaleString() + '+', label: 'Words Analyzed' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl sm:text-5xl font-bold tracking-tight text-white tabular-nums">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-white/30 mt-2 font-medium tracking-wide">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURED VERSE OF THE DAY ===== */}
      <section className="relative py-24 sm:py-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(232,184,109,0.025) 0%, transparent 60%)' }}
        />
        <div data-reveal-group className="max-w-2xl mx-auto px-6 text-center">
          <p
            className="reveal text-xs font-semibold text-gold/40 tracking-[0.18em] uppercase mb-12"
            style={{ '--reveal-delay': '0s' } as React.CSSProperties}
          >
            Verse of the moment
          </p>

          <div className="reveal" style={{ '--reveal-delay': '0.1s' } as React.CSSProperties}>
            <p className="font-arabic text-4xl sm:text-5xl text-white leading-[1.9] mb-8">
              {verse.arabic}
            </p>
            <p className="text-lg sm:text-xl text-white/40 font-light leading-relaxed mb-6 italic">
              &ldquo;{verse.translation}&rdquo;
            </p>
            <Link
              href={verse.surahLink}
              className="inline-flex items-center gap-2 text-sm text-gold/45 hover:text-gold transition-colors duration-150 font-medium"
            >
              {verse.reference}
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FEATURE CARDS ===== */}
      <section className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <div data-reveal-group className="text-center mb-14">
          <p
            className="reveal text-xs font-semibold text-gold/50 tracking-[0.18em] uppercase mb-4"
            style={{ '--reveal-delay': '0s' } as React.CSSProperties}
          >
            Everything you need
          </p>
          <h2
            className="reveal text-3xl sm:text-4xl font-bold tracking-tight text-white"
            style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}
          >
            One platform for Quranic study
          </h2>
        </div>

        <div data-reveal-group className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              href: '/quran',
              title: 'Read the Quran',
              description: 'All 114 surahs with word-by-word analysis. Tap any word to see its root, meaning, and full conjugation.',
              icon: BookOpenIcon,
              accentColor: 'rgba(16, 185, 129, 0.07)',
            },
            {
              href: '/roots',
              title: 'Explore Roots',
              description: 'Browse 1,716 Arabic verb roots with complete conjugation tables across all ten verb forms.',
              icon: RootIcon,
              accentColor: 'rgba(232, 184, 109, 0.07)',
            },
            {
              href: '/review',
              title: 'Save & Review',
              description: 'Bookmark roots, ayahs, and nouns. Review them as flashcards to lock in what you\'ve learned.',
              icon: BookmarkIcon,
              accentColor: 'rgba(100, 120, 240, 0.07)',
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="reveal"
              style={{ '--reveal-delay': `${i * 0.08}s` } as React.CSSProperties}
            >
              <Link
                href={feature.href}
                className="group relative flex flex-col h-full bg-card border border-white/[0.07] rounded-2xl p-7 sm:p-8 card-glow overflow-hidden"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 30% 30%, ${feature.accentColor}, transparent 70%)` }}
                />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center mb-6 border border-white/[0.08]">
                    <feature.icon className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2.5">{feature.title}</h3>
                  <p className="text-sm text-white/45 leading-relaxed">{feature.description}</p>
                  <div className="flex items-center gap-1.5 mt-6 text-xs font-semibold text-gold/50 group-hover:text-gold transition-colors duration-150">
                    <span>Explore</span>
                    <ArrowRightIcon className="w-3 h-3 transition-transform group-hover:translate-x-1 duration-150" />
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-20 sm:py-28 border-y border-white/[0.04]">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(232,184,109,0.015) 0%, transparent 50%)' }}
        />
        <div className="max-w-5xl mx-auto px-6">
          <div data-reveal-group className="text-center mb-16">
            <p
              className="reveal text-xs font-semibold text-gold/50 tracking-[0.18em] uppercase mb-4"
              style={{ '--reveal-delay': '0s' } as React.CSSProperties}
            >
              Simple &amp; powerful
            </p>
            <h2
              className="reveal text-3xl sm:text-4xl font-bold tracking-tight text-white"
              style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}
            >
              How QuRoots works
            </h2>
          </div>

          <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-8">
            {[
              {
                step: '01',
                title: 'Choose a Surah',
                description: 'Browse all 114 surahs. Pick any chapter — start with Al-Fatiha or the one you recite most.',
              },
              {
                step: '02',
                title: 'Tap any word',
                description: 'Every word links to its Arabic root. Instantly see its meaning, verb form, and conjugation pattern.',
              },
              {
                step: '03',
                title: 'Go deeper',
                description: 'Explore the full root: all verb forms, derived nouns, and every place it appears in the Quran.',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="reveal"
                style={{ '--reveal-delay': `${i * 0.1}s` } as React.CSSProperties}
              >
                <span
                  className="block font-extrabold text-white/[0.04] leading-none mb-4"
                  style={{ fontSize: 'clamp(5rem, 10vw, 7rem)' }}
                >
                  {item.step}
                </span>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/42 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POPULAR ROOTS ===== */}
      <section className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <div data-reveal-group>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p
                className="reveal text-xs font-semibold text-gold/50 tracking-[0.18em] uppercase mb-3"
                style={{ '--reveal-delay': '0s' } as React.CSSProperties}
              >
                Most frequent
              </p>
              <h2
                className="reveal text-2xl sm:text-3xl font-bold tracking-tight text-white"
                style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}
              >
                Popular roots in the Quran
              </h2>
            </div>
            <Link
              href="/roots"
              className="reveal hidden sm:flex items-center gap-1 text-sm font-medium text-white/25 hover:text-white transition-colors duration-150"
              style={{ '--reveal-delay': '0.16s' } as React.CSSProperties}
            >
              View all roots
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SAMPLE_ROOTS.map((root, i) => (
              <div
                key={root.root}
                className="reveal"
                style={{ '--reveal-delay': `${0.2 + i * 0.06}s` } as React.CSSProperties}
              >
                <Link
                  href={`/roots/${encodeURIComponent(root.root)}`}
                  prefetch={false}
                  className="group flex flex-col items-center text-center bg-card border border-white/[0.07] rounded-2xl p-5 card-glow"
                >
                  <span className="font-arabic text-2xl text-gold mb-2.5 group-hover:scale-105 transition-transform duration-200">
                    {root.root}
                  </span>
                  <span className="text-xs font-medium text-white/45 mb-1">{root.meaning}</span>
                  <span className="text-[10px] text-white/25 font-medium">{root.freq.toLocaleString()}× in Quran</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-20 sm:py-28">
        <div data-reveal-group className="max-w-2xl mx-auto px-6 text-center">
          <p
            className="reveal font-arabic text-2xl mb-8"
            style={{
              '--reveal-delay': '0s',
              color: 'rgba(232, 184, 109, 0.25)',
            } as React.CSSProperties}
          >
            رَبِّ زِدْنِى عِلْمًا
          </p>
          <h2
            className="reveal text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-5"
            style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}
          >
            Begin your journey
          </h2>
          <p
            className="reveal text-base text-white/35 mb-10 leading-relaxed font-light"
            style={{ '--reveal-delay': '0.16s' } as React.CSSProperties}
          >
            Whether you&apos;re a student of Arabic, a hafiz deepening your understanding,
            or simply curious about the language of the Quran — QuRoots is built for you.
          </p>
          <div
            className="reveal flex flex-col sm:flex-row items-center justify-center gap-4"
            style={{ '--reveal-delay': '0.24s' } as React.CSSProperties}
          >
            <Link href={primaryHref} className="btn-primary text-base px-10 py-4">
              {isMounted && lastRead ? 'Continue Exploring' : 'Start Exploring'}
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.05] py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 sm:gap-8 mb-12">
            <div className="sm:col-span-2">
              <p className="text-base font-semibold tracking-tight text-white mb-3">
                Qu<span className="text-gold">Roots</span>
              </p>
              <p className="text-sm text-white/28 leading-relaxed max-w-sm">
                A Quranic Arabic learning platform. Explore roots, read word-by-word,
                and deepen your understanding of the divine text.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/18 tracking-[0.16em] uppercase mb-4">Navigate</p>
              <div className="flex flex-col gap-3">
                {[
                  { href: '/quran', label: 'Read Quran' },
                  { href: '/roots', label: 'Browse Roots' },
                  { href: '/bookmarks', label: 'Bookmarks' },
                  { href: '/review', label: 'Flashcards' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-white/28 hover:text-white/70 transition-colors duration-150 font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-white/18 tracking-[0.16em] uppercase mb-4">Coming Soon</p>
              <div className="flex flex-col gap-3">
                {['Grammar Courses', 'Tafsir', 'Audio Recitation', 'Daily Lessons'].map((item) => (
                  <span key={item} className="text-sm text-white/20 font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/15 font-medium">
              QuRoots &copy; {new Date().getFullYear()} &middot; Quranic Arabic Learning Platform
            </p>
            <p className="text-xs text-white/15">
              Quran data sourced with respect and accuracy
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- Icons ---

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className ?? 'w-4 h-4'}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2.5}
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
    </svg>
  );
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function RootIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    </svg>
  );
}

function BookmarkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
    </svg>
  );
}
