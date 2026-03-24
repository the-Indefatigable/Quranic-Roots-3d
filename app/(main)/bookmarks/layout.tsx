import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bookmarks — Your Saved Roots & Ayahs',
  description: 'View your bookmarked Quranic roots, ayahs, and study materials.',
  robots: { index: false },
};

export default function BookmarksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
