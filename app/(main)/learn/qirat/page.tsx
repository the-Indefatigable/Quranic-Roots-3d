'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { QIRAT_UNITS } from '@/data/qirat-curriculum';

// ── Maqam identity badges ─────────────────────────────────────────
const MAQAM_BADGES = [
  { label: 'Bayati',   arabic: 'بياتي',  color: '#0D9488', tagline: 'Warm · Devotional' },
  { label: 'Rast',     arabic: 'راست',   color: '#D97706', tagline: 'Noble · Bright'    },
  { label: 'Hijaz',    arabic: 'حجاز',   color: '#DC2626', tagline: 'Intense · Awe'     },
  { label: 'Nahawand', arabic: 'نهاوند', color: '#7C3AED', tagline: 'Minor · Tender'    },
  { label: 'Saba',     arabic: 'صبا',    color: '#1D4ED8', tagline: 'Sorrowful · Deep'  },
  { label: 'Ajam',     arabic: 'عجم',    color: '#059669', tagline: 'Joyful · Triumph'  },
];

// Eastern Arabic numerals
const EASTERN = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const toEastern = (n: number) => String(n).split('').map(d => EASTERN[+d]).join('');

// Octagon clip-path
const OCTAGON = 'polygon(29% 0%, 71% 0%, 100% 29%, 100% 71%, 71% 100%, 29% 100%, 0% 71%, 0% 29%)';

// Zigzag offsets — subtle left/center/right shift
const ZIGZAG_X = [-28, 0, 28, 0];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const, delay: i * 0.08 },
  }),
};

function RevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
      {children}
    </motion.div>
  );
}

export default function QiratPage() {
  return (
    <div className="relative min-h-screen" style={{ background: '#0E0D0C' }}>

      {/* Dot-grid background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(212,162,70,0.09) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />

      {/* Ambient glow blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-8%] left-[5%] w-[480px] h-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,162,70,0.07) 0%, transparent 70%)' }} />
        <div className="absolute top-[45%] right-[-8%] w-[360px] h-[360px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(13,148,136,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 max-w-xl mx-auto px-4 py-12 pb-28">

        {/* ══ HERO ═══════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4A246]/40" />
            <span className="text-[#D4A246]/60 text-[10px] tracking-[0.3em] uppercase">
              The Path of Recitation
            </span>
            <span className="h-px w-10 bg-gradient-to-l from-transparent to-[#D4A246]/40" />
          </div>

          <h1
            className="font-arabic leading-none mb-3"
            style={{
              fontSize: 'clamp(3.2rem, 11vw, 5.5rem)',
              color: '#F0E4CA',
              textShadow: '0 0 80px rgba(212,162,70,0.22)',
              letterSpacing: '0.03em',
            }}
          >
            تعلّم القراءة
          </h1>

          <p className="text-[#A09F9B] text-base font-light tracking-wide mb-1.5">
            Master Quranic Recitation through Maqam
          </p>
          <p className="text-[#57534E] text-sm">
            6 melodic modes · pitch training · from zero to Qari
          </p>

          {/* Diamond ornament row */}
          <div className="flex items-center justify-center mt-5 gap-2">
            {[false, false, true, false, false].map((big, i) => (
              <div
                key={i}
                className="rotate-45 transition-all"
                style={{
                  width: big ? 8 : 4,
                  height: big ? 8 : 4,
                  background: big ? '#D4A246' : '#3D3C3A',
                  boxShadow: big ? '0 0 10px rgba(212,162,70,0.6)' : 'none',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* ══ MAQAM BADGES ═══════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14"
        >
          <p className="text-[#57534E] text-[10px] uppercase tracking-[0.25em] text-center mb-3">
            The Six Maqamat
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            {MAQAM_BADGES.map((m, i) => (
              <motion.div
                key={m.label}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="flex-shrink-0 flex flex-col items-center gap-1.5 px-3.5 py-3 rounded-xl cursor-default"
                style={{
                  background: `linear-gradient(160deg, ${m.color}12 0%, ${m.color}06 100%)`,
                  border: `1px solid ${m.color}22`,
                  minWidth: '88px',
                }}
              >
                <span
                  className="font-arabic text-xl leading-none"
                  style={{ color: m.color, textShadow: `0 0 16px ${m.color}55` }}
                >
                  {m.arabic}
                </span>
                <span className="text-[11px] font-semibold" style={{ color: m.color }}>
                  {m.label}
                </span>
                <span className="text-[9px] text-[#57534E] text-center leading-tight">
                  {m.tagline}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ══ UNIT PATHS ═════════════════════════════════════════ */}
        <div className="space-y-20">
          {QIRAT_UNITS.map((unit, unitIdx) => (
            <RevealSection key={unit.id}>
              {/* Unit banner */}
              <motion.div
                custom={0}
                variants={fadeUp}
                className="relative mb-10 rounded-2xl overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${unit.color}10 0%, ${unit.color}05 100%)`,
                  border: `1px solid ${unit.color}18`,
                }}
              >
                {/* Left accent bar */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
                  style={{ background: `linear-gradient(to bottom, ${unit.color}, ${unit.color}30)` }}
                />
                <div className="flex items-center justify-between px-6 py-5 pl-9">
                  <div className="flex-1 pr-3 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className="text-[10px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-full"
                        style={{ background: `${unit.color}18`, color: unit.color }}
                      >
                        Unit {toEastern(unitIdx + 1)}
                      </span>
                      <span className="text-[#3D3C3A] text-[10px]">
                        {unit.lessons.length} lessons
                      </span>
                    </div>
                    <h2 className="text-[#EDEDEC] font-semibold text-base leading-snug mb-1">
                      {unit.title}
                    </h2>
                    <p className="text-[#57534E] text-[11px] leading-relaxed line-clamp-2">
                      {unit.description}
                    </p>
                  </div>
                  <div
                    className="font-arabic text-[2.2rem] leading-none flex-shrink-0 opacity-70"
                    style={{ color: unit.color, textShadow: `0 0 24px ${unit.color}45` }}
                  >
                    {unit.arabic}
                  </div>
                </div>
              </motion.div>

              {/* ── Lesson path nodes ─────────────────────────── */}
              <div className="relative flex flex-col items-center">

                {/* Background connector line */}
                <div
                  className="absolute top-8 bottom-8 w-px"
                  style={{
                    background: `linear-gradient(to bottom, transparent 0%, ${unit.color}25 15%, ${unit.color}25 85%, transparent 100%)`,
                  }}
                />

                {unit.lessons.map((lesson, lessonIdx) => {
                  const xShift = ZIGZAG_X[lessonIdx % ZIGZAG_X.length];

                  return (
                    <div key={lesson.id} className="flex flex-col items-center w-full relative z-10">

                      {/* Inter-lesson ornament connector */}
                      {lessonIdx > 0 && (
                        <div className="flex flex-col items-center py-0.5">
                          <div className="w-px h-4" style={{ background: `${unit.color}20` }} />
                          <div
                            className="w-1.5 h-1.5 rotate-45"
                            style={{ background: `${unit.color}25`, border: `1px solid ${unit.color}35` }}
                          />
                          <div className="w-px h-4" style={{ background: `${unit.color}20` }} />
                        </div>
                      )}

                      {/* Node + label */}
                      <Link
                        href={`/lesson/${lesson.id}`}
                        className="group flex flex-col items-center gap-2.5 py-1 focus:outline-none"
                        style={{ transform: `translateX(${xShift}px)` }}
                      >
                        {/* Octagonal node */}
                        <div className="relative">
                          {/* Outer ambient pulse ring */}
                          <motion.div
                            className="absolute inset-[-14px] z-0"
                            style={{ clipPath: OCTAGON, background: `radial-gradient(circle, ${unit.color}18 0%, transparent 65%)` }}
                            animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
                            transition={{ duration: 3 + lessonIdx * 0.4, repeat: Infinity, ease: 'easeInOut' }}
                          />

                          {/* Node face */}
                          <motion.div
                            className="relative z-10 w-[68px] h-[68px] flex items-center justify-center transition-all duration-300"
                            style={{
                              clipPath: OCTAGON,
                              background: `linear-gradient(145deg, ${unit.color}22 0%, ${unit.color}0d 100%)`,
                            }}
                            whileHover={{ scale: 1.08 }}
                            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
                          >
                            {/* Thin octagon border via pseudo via inner div */}
                            <div
                              className="absolute inset-[2px]"
                              style={{
                                clipPath: OCTAGON,
                                background: 'transparent',
                                boxShadow: `inset 0 0 0 1px ${unit.color}35`,
                              }}
                            />
                            {/* Inner smaller octagon accent */}
                            <div
                              className="w-8 h-8 flex items-center justify-center"
                              style={{ clipPath: OCTAGON, background: `${unit.color}15` }}
                            >
                              <span
                                className="font-arabic text-lg font-bold leading-none select-none"
                                style={{
                                  color: unit.color,
                                  textShadow: `0 0 10px ${unit.color}90`,
                                }}
                              >
                                {toEastern(lessonIdx + 1)}
                              </span>
                            </div>
                          </motion.div>
                        </div>

                        {/* Lesson label */}
                        <div className="text-center" style={{ maxWidth: '160px' }}>
                          <p className="text-[#CCCBC8] text-[13px] font-medium leading-snug mb-0.5 group-hover:text-white transition-colors">
                            {lesson.title}
                          </p>
                          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#3D3C3A]">
                            <span>{lesson.steps.length} steps</span>
                            <span>·</span>
                            <span style={{ color: `${unit.color}70` }}>{lesson.xpReward} XP</span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  );
                })}
              </div>
            </RevealSection>
          ))}
        </div>

        {/* ══ FOOTER ORNAMENT ════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#D4A246]/25" />
            <div className="w-2 h-2 rotate-45" style={{ background: '#D4A246', opacity: 0.35, boxShadow: '0 0 8px rgba(212,162,70,0.5)' }} />
            <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#D4A246]/25" />
          </div>
          <p className="font-arabic text-[#2D2C2A] text-sm tracking-wider">
            بسم الله الرحمن الرحيم
          </p>
        </motion.div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
