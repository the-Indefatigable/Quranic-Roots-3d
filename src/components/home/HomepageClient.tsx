'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// --- Scroll-reveal via IntersectionObserver (no JS on scroll path) ---
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

// --- Animated counter hook ---
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

// --- Verse of the Day data ---
const FEATURED_VERSES = [
  {
    arabic: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    translation: 'Indeed, with hardship comes ease.',
    reference: 'Surah Ash-Sharh 94:6',
    surahLink: '/quran/94',
  },
  {
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى ٱللَّهِ فَهُوَ حَسْبُهُ',
    translation: 'And whoever relies upon Allah — then He is sufficient for him.',
    reference: 'Surah At-Talaq 65:3',
    surahLink: '/quran/65',
  },
  {
    arabic: 'فَٱذْكُرُونِىٓ أَذْكُرْكُمْ',
    translation: 'So remember Me; I will remember you.',
    reference: 'Surah Al-Baqarah 2:152',
    surahLink: '/quran/2',
  },
  {
    arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰٓ',
    translation: 'And your Lord is going to give you, and you will be satisfied.',
    reference: 'Surah Ad-Duha 93:5',
    surahLink: '/quran/93',
  },
  {
    arabic: 'رَبِّ زِدْنِى عِلْمًا',
    translation: 'My Lord, increase me in knowledge.',
    reference: 'Surah Ta-Ha 20:114',
    surahLink: '/quran/20',
  },
];

// --- Sample roots for preview ---
const SAMPLE_ROOTS = [
  { root: 'ع ل م', meaning: 'to know', freq: 854, forms: 6 },
  { root: 'ك ت ب', meaning: 'to write', freq: 319, forms: 4 },
  { root: 'ق و ل', meaning: 'to say', freq: 1722, forms: 3 },
  { root: 'أ م ن', meaning: 'to believe', freq: 879, forms: 5 },
  { root: 'ج ع ل', meaning: 'to make', freq: 346, forms: 2 },
  { root: 'ر ح م', meaning: 'to have mercy', freq: 339, forms: 3 },
];

export function HomepageClient() {
  useScrollReveal();

  const roots = useCounter(1716);
  const ayahs = useCounter(6236);
  const words = useCounter(77429);

  // Stats section ref — trigger counters via IntersectionObserver too
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

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* ===== TOP NAV ===== */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-6">
          <Link href="/" className="text-lg font-light tracking-tight text-white">
            Qu<span className="text-gold">Roots</span>
          </Link>
          <div className="hidden sm:flex items-center gap-8">
            {[
              { href: '/quran', label: 'Quran' },
              { href: '/roots', label: 'Roots' },
              { href: '/nouns', label: 'Nouns' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <Link
            href="/quran"
            className="bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Open App
          </Link>
        </div>
      </nav>

      {/* ===== HERO — Framer Motion runs once on load, not scroll-driven ===== */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 text-center pt-14">
        {/* Ambient background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-gold/[0.04] rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/[0.02] rounded-full blur-[100px]" />
        </div>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-16 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent mb-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-arabic text-2xl sm:text-3xl text-gold/50 mb-8 leading-relaxed"
        >
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-5xl sm:text-7xl font-extralight tracking-[-0.04em] text-white mb-6"
        >
          Qu<span className="text-gold">Roots</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-base sm:text-lg text-white/50 max-w-lg mb-4 leading-relaxed"
        >
          A comprehensive platform to explore the linguistic roots of the Quran.
          Read, study, and understand every word.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-xs text-white/25 tracking-widest uppercase mb-10"
        >
          Read &middot; Explore &middot; Understand
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <Link
            href="/quran"
            className="inline-flex items-center gap-2 bg-gold text-black px-8 py-3.5 rounded-xl text-sm font-semibold hover:bg-gold-light transition-all hover:shadow-[0_0_30px_rgba(212,165,116,0.2)]"
          >
            Start Reading
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <Link
            href="/roots"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white px-6 py-3.5 rounded-xl text-sm transition-colors"
          >
            Explore Roots
          </Link>
        </motion.div>

        {/* Scroll indicator — pure CSS animation, no JS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="animate-scroll-bounce w-5 h-8 rounded-full border border-white/10 flex items-start justify-center p-1.5">
            <div className="w-1 h-1.5 rounded-full bg-white/30" />
          </div>
        </motion.div>
      </section>

      {/* ===== STATS ===== */}
      <section
        ref={statsRef}
        className="relative border-y border-white/[0.04] py-16 sm:py-20"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-2 sm:gap-4 px-6">
          {[
            { value: roots.count.toLocaleString(), label: 'Quranic Roots', suffix: '' },
            { value: ayahs.count.toLocaleString(), label: 'Ayahs', suffix: '' },
            { value: words.count.toLocaleString(), label: 'Words Analyzed', suffix: '+' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl sm:text-5xl font-extralight tracking-tight text-white tabular-nums">
                {stat.value}{stat.suffix}
              </p>
              <p className="text-xs sm:text-sm text-white/35 mt-2 tracking-wide">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURE CARDS ===== */}
      <section className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <div data-reveal-group className="text-center mb-14">
          <p className="reveal text-xs text-gold tracking-widest uppercase mb-3" style={{ '--reveal-delay': '0s' } as React.CSSProperties}>
            Everything you need
          </p>
          <h2 className="reveal text-3xl sm:text-4xl font-extralight tracking-tight text-white" style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}>
            One platform for Quranic study
          </h2>
        </div>

        <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              href: '/quran',
              title: 'Read the Quran',
              description: 'Read all 114 surahs with word-by-word analysis, translation, and direct links to root meanings for every word.',
              icon: BookOpenIcon,
              accent: 'from-emerald-500/10 to-transparent',
            },
            {
              href: '/roots',
              title: 'Explore Roots',
              description: 'Browse 1,716 Arabic verb roots with complete conjugation tables across all ten verb forms and tense patterns.',
              icon: RootIcon,
              accent: 'from-gold/10 to-transparent',
            },
            {
              href: '/nouns',
              title: 'Study Nouns',
              description: 'Discover derived nouns, active and passive participles, masdars, and adjectives — all linked to their root verbs.',
              icon: NounIcon,
              accent: 'from-purple-500/10 to-transparent',
            },
            {
              href: '/bookmarks',
              title: 'Save & Review',
              description: 'Bookmark roots, ayahs, and nouns to build your personal study collection. Everything saved locally on your device.',
              icon: BookmarkIcon,
              accent: 'from-blue-500/10 to-transparent',
            },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="reveal"
              style={{ '--reveal-delay': `${i * 0.08}s` } as React.CSSProperties}
            >
              <Link
                href={feature.href}
                className="group relative flex flex-col h-full bg-white/[0.02] border border-white/[0.04] rounded-2xl p-7 sm:p-8 transition-all duration-300 hover:border-white/[0.08] hover:bg-white/[0.03]"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-5">
                    <feature.icon className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="text-base font-medium text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/40 leading-relaxed">{feature.description}</p>
                  <div className="flex items-center gap-1 mt-5 text-xs text-gold/60 group-hover:text-gold transition-colors">
                    <span>Explore</span>
                    <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== VERSE OF THE DAY ===== */}
      <section className="relative py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gold/[0.02] to-transparent pointer-events-none" />
        <div data-reveal-group className="max-w-3xl mx-auto px-6 text-center">
          <p className="reveal text-xs text-gold/50 tracking-widest uppercase mb-10" style={{ '--reveal-delay': '0s' } as React.CSSProperties}>
            Verse of the moment
          </p>

          <div className="reveal" style={{ '--reveal-delay': '0.1s' } as React.CSSProperties}>
            <div className="relative">
              <span className="absolute -top-4 left-0 text-5xl text-gold/10 font-serif leading-none select-none">&ldquo;</span>
              <span className="absolute -bottom-6 right-0 text-5xl text-gold/10 font-serif leading-none select-none">&rdquo;</span>

              <p className="font-arabic text-3xl sm:text-4xl text-white leading-[1.8] mb-6 px-8">
                {verse.arabic}
              </p>
              <p className="text-base sm:text-lg text-white/50 italic mb-4 leading-relaxed">
                &ldquo;{verse.translation}&rdquo;
              </p>
              <Link
                href={verse.surahLink}
                className="inline-flex items-center gap-1.5 text-xs text-gold/50 hover:text-gold transition-colors"
              >
                {verse.reference}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== POPULAR ROOTS PREVIEW ===== */}
      <section className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
        <div data-reveal-group>
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="reveal text-xs text-gold tracking-widest uppercase mb-3" style={{ '--reveal-delay': '0s' } as React.CSSProperties}>
                Most frequent
              </p>
              <h2 className="reveal text-2xl sm:text-3xl font-extralight tracking-tight text-white" style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}>
                Popular roots in the Quran
              </h2>
            </div>
            <Link href="/roots" className="reveal text-xs text-white/30 hover:text-white transition-colors hidden sm:block" style={{ '--reveal-delay': '0.16s' } as React.CSSProperties}>
              View all roots &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {SAMPLE_ROOTS.map((root, i) => (
              <div
                key={root.root}
                className="reveal"
                style={{ '--reveal-delay': `${0.24 + i * 0.06}s` } as React.CSSProperties}
              >
                <Link
                  href={`/roots/${encodeURIComponent(root.root)}`}
                  prefetch={false}
                  className="group flex flex-col items-center text-center bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 transition-all duration-300 hover:border-gold/20 hover:bg-gold/[0.03]"
                >
                  <span className="font-arabic text-2xl text-gold mb-2 group-hover:scale-105 transition-transform">
                    {root.root}
                  </span>
                  <span className="text-xs text-white/50 mb-1">{root.meaning}</span>
                  <span className="text-[10px] text-white/20">{root.freq}x in Quran</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="relative py-20 sm:py-28 border-y border-white/[0.04]">
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6">
          <div data-reveal-group className="text-center mb-14">
            <p className="reveal text-xs text-gold tracking-widest uppercase mb-3" style={{ '--reveal-delay': '0s' } as React.CSSProperties}>
              Simple &amp; powerful
            </p>
            <h2 className="reveal text-3xl sm:text-4xl font-extralight tracking-tight text-white" style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}>
              How QuRoots works
            </h2>
          </div>

          <div data-reveal-group className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
            {[
              {
                step: '01',
                title: 'Choose a Surah',
                description: 'Browse the full Quran organized by surah. Select any chapter to begin reading.',
              },
              {
                step: '02',
                title: 'Tap any word',
                description: 'Every word is linked to its Arabic root. Tap to see the meaning, verb form, and conjugation pattern.',
              },
              {
                step: '03',
                title: 'Go deeper',
                description: 'Explore the full root page with all verb forms, derived nouns, and every Quranic occurrence.',
              },
            ].map((item, i) => (
              <div
                key={item.step}
                className="reveal relative text-center sm:text-left"
                style={{ '--reveal-delay': `${i * 0.1}s` } as React.CSSProperties}
              >
                <span className="text-4xl sm:text-5xl font-extralight text-gold/10 mb-3 block">
                  {item.step}
                </span>
                <h3 className="text-base font-medium text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/35 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 sm:py-28">
        <div data-reveal-group className="max-w-2xl mx-auto px-6 text-center">
          <p className="reveal font-arabic text-xl text-gold/30 mb-6" style={{ '--reveal-delay': '0s' } as React.CSSProperties}>
            رَبِّ زِدْنِى عِلْمًا
          </p>
          <h2 className="reveal text-3xl sm:text-4xl font-extralight tracking-tight text-white mb-4" style={{ '--reveal-delay': '0.08s' } as React.CSSProperties}>
            Begin your journey
          </h2>
          <p className="reveal text-white/40 mb-10 leading-relaxed" style={{ '--reveal-delay': '0.16s' } as React.CSSProperties}>
            Whether you are a student of Arabic, a hafiz deepening your understanding,
            or simply curious about the language of the Quran — QuRoots is built for you.
          </p>
          <div className="reveal" style={{ '--reveal-delay': '0.24s' } as React.CSSProperties}>
            <Link
              href="/quran"
              className="inline-flex items-center gap-2 bg-gold text-black px-10 py-4 rounded-xl text-sm font-semibold hover:bg-gold-light transition-all hover:shadow-[0_0_40px_rgba(212,165,116,0.15)]"
            >
              Start Exploring
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/[0.04] py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 sm:gap-8 mb-12">
            <div className="sm:col-span-2">
              <p className="text-lg font-light tracking-tight text-white mb-3">
                Qu<span className="text-gold">Roots</span>
              </p>
              <p className="text-sm text-white/30 leading-relaxed max-w-sm">
                An open-source Quranic Arabic learning platform. Explore roots, read word-by-word,
                and deepen your understanding of the divine text.
              </p>
            </div>

            <div>
              <p className="text-xs text-white/20 tracking-widest uppercase mb-4">Navigate</p>
              <div className="flex flex-col gap-2.5">
                {[
                  { href: '/quran', label: 'Read Quran' },
                  { href: '/roots', label: 'Browse Roots' },
                  { href: '/nouns', label: 'Study Nouns' },
                  { href: '/bookmarks', label: 'Bookmarks' },
                ].map((link) => (
                  <Link key={link.href} href={link.href} className="text-sm text-white/30 hover:text-white transition-colors">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-white/20 tracking-widest uppercase mb-4">Resources</p>
              <div className="flex flex-col gap-2.5">
                <span className="text-sm text-white/30">Grammar Courses <span className="text-[10px] text-gold/40 ml-1">Soon</span></span>
                <span className="text-sm text-white/30">Tafsir <span className="text-[10px] text-gold/40 ml-1">Soon</span></span>
                <span className="text-sm text-white/30">Audio Recitation <span className="text-[10px] text-gold/40 ml-1">Soon</span></span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/[0.04] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/15">
              QuRoots &copy; {new Date().getFullYear()} &middot; A Quranic Arabic Learning Platform
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

function NounIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
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
