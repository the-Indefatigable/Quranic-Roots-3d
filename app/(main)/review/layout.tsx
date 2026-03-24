import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Review — Flashcard Study Session',
  description: 'Review your learned Quranic Arabic roots and vocabulary with interactive flashcards.',
  robots: { index: false },
};

export default function ReviewLayout({ children }: { children: React.ReactNode }) {
  return children;
}
