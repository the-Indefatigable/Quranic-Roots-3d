'use client';

import { motion } from 'framer-motion';

const LOADING_VERSES = [
  { arabic: 'رَبِّ زِدْنِى عِلْمًا', translation: 'My Lord, increase me in knowledge' },
  { arabic: 'فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا', translation: 'For indeed, with hardship comes ease' },
  { arabic: 'وَعَلَّمَكَ مَا لَمْ تَكُن تَعْلَمُ', translation: 'And taught you that which you did not know' },
  { arabic: 'ٱقْرَأْ بِٱسْمِ رَبِّكَ ٱلَّذِى خَلَقَ', translation: 'Read in the name of your Lord who created' },
];

export function LoadingScreen({ message }: { message?: string }) {
  // Pick based on current minute to be stable across renders
  const verse = LOADING_VERSES[new Date().getMinutes() % LOADING_VERSES.length];

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
        className="font-arabic text-xl text-gold/40 mb-3 text-center"
      >
        {verse.arabic}
      </motion.p>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-xs text-white/20 italic text-center"
      >
        {verse.translation}
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
