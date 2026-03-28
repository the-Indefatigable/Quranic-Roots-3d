import type { Metadata } from 'next';
import { LearningPathClient } from './LearningPathClient';

export const metadata: Metadata = {
  title: 'Learn Quranic Arabic — Interactive Path | QuRoots',
  description: 'Master Quranic Arabic grammar through interactive Duolingo-style lessons with practice exercises, streaks, and achievements.',
};

export default function LearnPathPage() {
  return <LearningPathClient />;
}
