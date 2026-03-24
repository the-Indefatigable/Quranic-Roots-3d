import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Search Quranic Arabic — Roots, Ayahs & Translations',
  description:
    'Search the Quran by Arabic text, English translation, or root. Find any ayah, word, or root instantly.',
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
