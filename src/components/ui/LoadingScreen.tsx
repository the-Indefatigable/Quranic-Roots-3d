'use client';

import { motion } from 'framer-motion';

const VERSE = {
  arabic: 'يَٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ ٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ إِنَّ ٱللَّهَ مَعَ ٱلصَّٰبِرِينَ',
  translation: 'Seek help through patience and prayer. Indeed, Allah is with the patient.',
  reference: 'Al-Baqarah 2:153',
};

export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-32">
      {/* Animated dots */}
      <div className="flex items-center gap-1.5 mb-10">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-gold/60"
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.1, 0.8] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Verse */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="font-arabic text-2xl sm:text-3xl text-gold/60 mb-3 text-center leading-[2] px-4"
      >
        {VERSE.arabic}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-sm text-white/30 italic text-center mb-2"
      >
        &ldquo;{VERSE.translation}&rdquo;
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="text-xs text-white/15 tracking-widest"
      >
        {VERSE.reference}
      </motion.p>

      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xs text-white/15 mt-6"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
