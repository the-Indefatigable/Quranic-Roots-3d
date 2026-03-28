'use client';

import { motion } from 'framer-motion';

interface TeachContent {
  title?: string;
  explanation?: string;
  arabic?: string;
  transliteration?: string;
  examples?: Array<{ ar: string; tr: string; en: string }>;
  quran_ref?: string | null;
  fun_fact?: string | null;
}

interface TeachStepProps {
  content: Record<string, unknown>;
  onContinue: () => void;
}

export function TeachStep({ content, onContinue }: TeachStepProps) {
  const data = content as unknown as TeachContent;

  return (
    <div className="flex flex-col items-center text-center gap-6">
      {data.title && (
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white"
        >
          {data.title}
        </motion.h2>
      )}

      {data.explanation && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-base text-white/70 leading-relaxed max-w-md"
        >
          {data.explanation}
        </motion.p>
      )}

      {data.arabic && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, type: 'spring' }}
          className="py-6"
        >
          <p className="text-5xl font-arabic text-[#58CC02] mb-2">{data.arabic}</p>
          {data.transliteration && (
            <p className="text-lg text-white/50 italic">{data.transliteration}</p>
          )}
        </motion.div>
      )}

      {data.examples && data.examples.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full space-y-3"
        >
          {data.examples.map((ex, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-5 py-3 rounded-xl bg-surface border border-border"
            >
              <div className="text-left">
                <span className="text-sm text-white/50">{ex.en}</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-arabic text-white">{ex.ar}</span>
                <span className="text-sm text-white/40 italic ml-2">{ex.tr}</span>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {data.quran_ref && (
        <p className="text-xs text-[#1CB0F6]">📖 Quran {data.quran_ref}</p>
      )}

      {data.fun_fact && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="px-4 py-3 rounded-xl bg-[#FFC800]/10 border border-[#FFC800]/20 text-sm text-[#FFC800]"
        >
          💡 {data.fun_fact}
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        onClick={onContinue}
        className="w-full max-w-xs py-4 rounded-2xl bg-[#58CC02] text-white font-bold text-lg shadow-[0_4px_0_#46a302] hover:shadow-[0_2px_0_#46a302] hover:translate-y-[2px] active:shadow-none active:translate-y-[4px] transition-all"
      >
        Got it!
      </motion.button>
    </div>
  );
}
