'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LearningPath, type PathUnit } from '@/components/learn/LearningPath';

export function LearningPathClient() {
  const [units, setUnits] = useState<PathUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/learn/path')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setUnits(data.path || []);
        }
      })
      .catch((err) => {
        console.error('[LearningPath] fetch error:', err);
        setError(`Failed to load learning path: ${err.message}`);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-[#57534E] text-sm">Loading your learning path...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-wrong mb-2">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary text-sm py-2 px-4"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-sm">
          <span className="text-5xl mb-4 block">📚</span>
          <h2 className="text-xl font-heading font-bold mb-2" style={{ color: '#F0E4CA' }}>
            Lessons Coming Soon!
          </h2>
          <p className="text-[#57534E] text-sm">
            We&apos;re building interactive Quranic Arabic lessons. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 relative">
      {/* ══ HERO ═══════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="text-center mb-12 pt-4"
      >
        <div className="flex items-center justify-center gap-3 mb-5">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-[#D4A246]/40" />
          <span className="text-[#D4A246]/60 text-[10px] tracking-[0.3em] uppercase">
            The Path of Knowledge
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
          تعلّم العربية
        </h1>

        <p className="text-[#A09F9B] text-base font-light tracking-wide mb-1.5">
          Master Quranic Arabic Grammar
        </p>
        <p className="text-[#57534E] text-sm">
          {units.length} units · step-by-step lessons · from basics to mastery
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

      {/* ══ PATH ═══════════════════════════════════════════════ */}
      <LearningPath units={units} />

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
  );
}
