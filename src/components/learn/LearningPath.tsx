'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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

// Zigzag offsets for nodes — alternating left/center/right
const ZIGZAG_OFFSETS = [0, 60, 0, -60, 0, 60, 0, -60];

export function LearningPath({ units }: LearningPathProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // Scroll to current active lesson on mount
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // Flatten units + lessons into a single node list for the path
  const nodes: { type: 'unit-header' | 'lesson' | 'checkpoint'; unit: PathUnit; lesson?: PathLesson; globalIndex: number }[] = [];
  let globalIdx = 0;

  for (const unit of units) {
    nodes.push({ type: 'unit-header', unit, globalIndex: globalIdx++ });
    for (const lesson of unit.lessons) {
      if (lesson.lessonType === 'checkpoint') {
        nodes.push({ type: 'checkpoint', unit, lesson, globalIndex: globalIdx++ });
      } else {
        nodes.push({ type: 'lesson', unit, lesson, globalIndex: globalIdx++ });
      }
    }
  }

  return (
    <div ref={scrollRef} className="relative w-full max-w-md mx-auto py-8 px-4">
      {/* Dotted path line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 border-l-2 border-dashed border-white/10 -translate-x-1/2 z-0" />

      <div className="relative z-10 flex flex-col items-center gap-1">
        {nodes.map((node, i) => {
          const offset = ZIGZAG_OFFSETS[i % ZIGZAG_OFFSETS.length];
          const isActive = node.lesson?.progress.status === 'available' || node.lesson?.progress.status === 'in_progress';

          if (node.type === 'unit-header') {
            return (
              <motion.div
                key={`unit-${node.unit.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="w-full mb-2 mt-6"
              >
                <UnitHeader unit={node.unit} />
              </motion.div>
            );
          }

          return (
            <motion.div
              key={node.lesson!.id}
              ref={isActive ? activeRef : undefined}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, type: 'spring', stiffness: 300, damping: 25 }}
              style={{ transform: `translateX(${offset}px)` }}
              className="my-2"
            >
              <PathNode
                lesson={node.lesson!}
                unit={node.unit}
                isCheckpoint={node.type === 'checkpoint'}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
