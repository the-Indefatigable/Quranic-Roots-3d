import type { Metadata } from 'next';

/** page.tsx is a client component and cannot export metadata itself. */
export const metadata: Metadata = {
  title: 'Community — Learn Quranic Arabic Together | QuRoots',
  description:
    'Ask questions, share what you are learning, and study Quranic Arabic alongside other learners.',
  alternates: { canonical: '/community' },
};

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
