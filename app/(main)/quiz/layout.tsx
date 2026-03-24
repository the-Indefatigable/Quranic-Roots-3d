import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiz — Test Your Quranic Arabic Knowledge',
  description: 'Test and strengthen your Quranic Arabic vocabulary with spaced-repetition quizzes on roots, nouns, and particles.',
  robots: { index: false },
};

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children;
}
