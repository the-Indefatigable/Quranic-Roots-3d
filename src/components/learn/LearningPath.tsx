'use client';

import { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { PathNode } from './PathNode';
import { UnitHeader } from './UnitHeader';

export interface LessonProgress {
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  score: number | null;
  bestScore: number | null;
  attempts: number;
}

export interface PathLesson {
  id: string;
  slug: string;
  title: string;
  sortOrder: number;
  lessonType: 'standard' | 'legendary' | 'checkpoint';
  xpReward: number;
  progress: LessonProgress;
}

export interface UnitProgress {
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  crownLevel: number; // 0-4
  lessonsCompleted: number;
}

export interface PathUnit {
  id: string;
  slug: string;
  title: string;
  titleAr: string | null;
  description: string | null;
  iconEmoji: string;
  color: string;
  sortOrder: number;
  checkpointAfter: boolean;
  lessons: PathLesson[];
  progress: UnitProgress;
}

interface LearningPathProps {
  units: PathUnit[];
}

// Zigzag offsets — subtle left/center/right shift
const ZIGZAG_X = [-28, 0, 28, 0];

function RevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={inView ? 'visible' : 'hidden'}>
      {children}
    </motion.div>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const, delay: i * 0.06 },
  }),
};

export function LearningPath({ units }: LearningPathProps) {
  const activeRef = useRef<HTMLDivElement>(null);

  // Scroll to current active lesson on mount
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  return (
    <div className="relative w-full max-w-xl mx-auto px-4">
      <div className="space-y-20">
        {units.map((unit, unitIdx) => (
          <RevealSection key={unit.id}>
            {/* Unit banner */}
            <UnitHeader unit={unit} unitIndex={unitIdx} />

            {/* Lesson path nodes */}
            <div className="relative flex flex-col items-center mt-10">
              {/* Background connector line */}
              <div
                className="absolute top-8 bottom-8 w-px"
                style={{
                  background: `linear-gradient(to bottom, transparent 0%, ${unit.color}25 15%, ${unit.color}25 85%, transparent 100%)`,
                }}
              />

              {unit.lessons.map((lesson, lessonIdx) => {
                const xShift = ZIGZAG_X[lessonIdx % ZIGZAG_X.length];
                const isActive = lesson.progress.status === 'available' || lesson.progress.status === 'in_progress';

                return (
                  <motion.div
                    key={lesson.id}
                    custom={lessonIdx}
                    variants={fadeUp}
                    ref={isActive ? activeRef : undefined}
                    className="flex flex-col items-center w-full relative z-10"
                  >
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

                    {/* Node */}
                    <div style={{ transform: `translateX(${xShift}px)` }}>
                      <PathNode
                        lesson={lesson}
                        unit={unit}
                        lessonIndex={lessonIdx}
                        isCheckpoint={lesson.lessonType === 'checkpoint'}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </RevealSection>
        ))}
      </div>
    </div>
  );
}
