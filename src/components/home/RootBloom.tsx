'use client';

/**
 * RootBloom — the homepage signature animation.
 *
 * A 3-letter Arabic root (ع ل م) sits at the center. When the section
 * scrolls into view, 6 derivatives unfurl outward along curved gold
 * "ink lines" with staggered easing — like a manuscript illumination
 * being drawn live. One signature moment, not scattered micro-interactions.
 */

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';

interface Derivative {
  arabic: string;
  english: string;
  transliteration: string;
}

const ROOT = {
  letters: 'ع ل م',
  meaning: 'to know',
};

const DERIVATIVES: Derivative[] = [
  { arabic: 'عِلْم',     english: 'knowledge',  transliteration: 'ʿilm' },
  { arabic: 'عَالِم',    english: 'scholar',    transliteration: 'ʿālim' },
  { arabic: 'عَلَّمَ',   english: 'He taught',  transliteration: 'ʿallama' },
  { arabic: 'مُعَلِّم',  english: 'teacher',    transliteration: 'muʿallim' },
  { arabic: 'عَلِيم',    english: 'All-Knowing', transliteration: 'ʿalīm' },
  { arabic: 'عَالَم',    english: 'world',      transliteration: 'ʿālam' },
];

// SVG geometry
const VB = 720;          // viewBox size
const CX = VB / 2;
const CY = VB / 2;
const R  = 250;          // distance from center to derivative anchors
// Start derivatives at 12 o'clock (-90°) and walk clockwise
const ANGLE_OFFSET = -Math.PI / 2;

export function RootBloom() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px -15% 0px' });
  const prefersReduced = useReducedMotion();

  return (
    <div
      ref={ref}
      className="relative mx-auto"
      style={{
        width: '100%',
        maxWidth: 640,
        aspectRatio: '1 / 1',
      }}
      aria-label="Animated illustration: the Arabic root ع ل م growing into 6 related Quranic words"
    >
      {/* Ambient gold halo behind everything */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(212,162,70,0.10) 0%, rgba(212,162,70,0.04) 28%, transparent 60%)',
        }}
      />

      {/* Faint manuscript ruling rings */}
      <svg
        viewBox={`0 0 ${VB} ${VB}`}
        className="absolute inset-0 w-full h-full"
        aria-hidden
      >
        <defs>
          <radialGradient id="bloomGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"  stopColor="#D4A246" stopOpacity="0.55" />
            <stop offset="60%" stopColor="#D4A246" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#D4A246" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="bloomLine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#D4A246" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#D4A246" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* Concentric guide rings — drawn slowly */}
        {[110, 175, 245].map((r, i) => (
          <motion.circle
            key={r}
            cx={CX}
            cy={CY}
            r={r}
            fill="none"
            stroke="rgba(212,162,70,0.10)"
            strokeWidth={1}
            strokeDasharray="2 6"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={inView || prefersReduced ? { pathLength: 1, opacity: 1 } : {}}
            transition={{
              duration: prefersReduced ? 0 : 1.6,
              delay: prefersReduced ? 0 : 0.1 + i * 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}

        {/* Center halo */}
        <motion.circle
          cx={CX}
          cy={CY}
          r={95}
          fill="url(#bloomGlow)"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={inView || prefersReduced ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: `${CX}px ${CY}px` }}
        />

        {/* Ink lines: center → each derivative anchor */}
        {DERIVATIVES.map((_, i) => {
          const a  = ANGLE_OFFSET + (i * 2 * Math.PI) / DERIVATIVES.length;
          const x2 = CX + R * Math.cos(a);
          const y2 = CY + R * Math.sin(a);
          // Start the line just outside the center root for a clean break
          const startR = 70;
          const x1 = CX + startR * Math.cos(a);
          const y1 = CY + startR * Math.sin(a);
          // End the line a touch before the derivative label
          const endR = R - 50;
          const xe = CX + endR * Math.cos(a);
          const ye = CY + endR * Math.sin(a);
          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={xe}
              y2={ye}
              stroke="url(#bloomLine)"
              strokeWidth={1.25}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView || prefersReduced ? { pathLength: 1, opacity: 1 } : {}}
              transition={{
                duration: prefersReduced ? 0 : 0.85,
                delay: prefersReduced ? 0 : 0.6 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            />
          );
        })}
      </svg>

      {/* Center root word */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        initial={{ opacity: 0, scale: 0.7, filter: 'blur(8px)' }}
        animate={
          inView || prefersReduced
            ? { opacity: 1, scale: 1, filter: 'blur(0px)' }
            : {}
        }
        transition={{
          duration: prefersReduced ? 0 : 1.1,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <span
          className="font-arabic leading-none"
          style={{
            color: '#F0E8D8',
            fontSize: 'clamp(2.6rem, 7vw, 4rem)',
            textShadow:
              '0 0 32px rgba(212,162,70,0.55), 0 0 12px rgba(212,162,70,0.35)',
            letterSpacing: '0.08em',
          }}
          dir="rtl"
        >
          {ROOT.letters}
        </span>
        <span
          className="mt-2 text-[10px] font-bold uppercase tracking-[0.3em]"
          style={{ color: '#D4A246', opacity: 0.85 }}
        >
          {ROOT.meaning}
        </span>
      </motion.div>

      {/* Derivative chips — positioned absolutely around the ring */}
      {DERIVATIVES.map((d, i) => {
        const a = ANGLE_OFFSET + (i * 2 * Math.PI) / DERIVATIVES.length;
        // Convert SVG coords to %-based positioning so it scales fluidly
        const xPct = ((CX + R * Math.cos(a)) / VB) * 100;
        const yPct = ((CY + R * Math.sin(a)) / VB) * 100;
        return (
          <motion.div
            key={d.arabic}
            className="absolute flex flex-col items-center text-center pointer-events-auto"
            style={{
              left: `${xPct}%`,
              top: `${yPct}%`,
              transform: 'translate(-50%, -50%)',
              width: 'clamp(78px, 14vw, 120px)',
            }}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={
              inView || prefersReduced ? { opacity: 1, scale: 1 } : {}
            }
            transition={{
              duration: prefersReduced ? 0 : 0.7,
              delay: prefersReduced ? 0 : 1.25 + i * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div
              className="px-2.5 py-2 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-[1.04]"
              style={{
                background: 'rgba(212,162,70,0.06)',
                border: '1px solid rgba(212,162,70,0.20)',
                boxShadow:
                  '0 4px 18px rgba(0,0,0,0.35), inset 0 0.5px 0 rgba(255,255,255,0.06)',
              }}
            >
              <p
                className="font-arabic leading-none mb-1"
                style={{
                  color: '#F0E8D8',
                  fontSize: 'clamp(1.05rem, 2.3vw, 1.4rem)',
                }}
                dir="rtl"
              >
                {d.arabic}
              </p>
              <p
                className="text-[9px] italic leading-tight"
                style={{ color: '#D4A246', opacity: 0.85 }}
              >
                {d.transliteration}
              </p>
              <p
                className="text-[9px] leading-tight mt-0.5"
                style={{ color: '#A09F9B' }}
              >
                {d.english}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
