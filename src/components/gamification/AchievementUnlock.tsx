'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AchievementBadge } from './AchievementBadge';

interface Achievement {
  id: string;
  title: string;
  description: string | null;
  category: string;
  xpBonus: number | null;
}

interface AchievementUnlockProps {
  achievements: Achievement[];
  isVisible: boolean;
  onClose?: () => void;
  autoCloseDuration?: number;
}

export function AchievementUnlock({
  achievements,
  isVisible,
  onClose,
  autoCloseDuration = 5000,
}: AchievementUnlockProps) {
  // Auto-close timer
  const handleClose = () => {
    onClose?.();
  };

  return (
    <AnimatePresence>
      {isVisible && achievements.length > 0 && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          {/* Modal */}
          <motion.div
            className="bg-slate-900/95 border border-primary/20 rounded-3xl p-8 max-w-sm w-full backdrop-blur"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <motion.div
              className="text-center mb-6"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">🎉 Achievement Unlocked</p>
              <h3 className="text-2xl font-heading text-text">New Badge Earned!</h3>
            </motion.div>

            {/* Badges */}
            <div className="flex flex-col gap-6 mb-8">
              {achievements.map((achievement, idx) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0">
                    <AchievementBadge
                      title={achievement.title}
                      category={achievement.category as any}
                      isUnlocked={true}
                      size="sm"
                      animated={false}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text font-semibold text-sm">{achievement.title}</p>
                    {achievement.description && (
                      <p className="text-text-secondary text-xs mt-1">{achievement.description}</p>
                    )}
                    {achievement.xpBonus && achievement.xpBonus > 0 && (
                      <p className="text-primary text-xs font-semibold mt-1">+{achievement.xpBonus} XP Bonus</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Close Button */}
            <motion.button
              className="w-full py-3 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30 text-primary font-semibold text-sm hover:bg-gradient-to-r hover:from-primary/30 hover:to-primary/20 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              Awesome! Continue
            </motion.button>

            {/* Confetti Animation Hint */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-primary rounded-full"
                  initial={{
                    x: Math.random() * 100 - 50,
                    y: 0,
                    opacity: 1,
                  }}
                  animate={{
                    x: Math.random() * 200 - 100,
                    y: 300,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
