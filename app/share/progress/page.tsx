import type { Metadata } from 'next';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

type SP = { n?: string; lvl?: string; streak?: string; xp?: string; kind?: string };

function ogUrl(sp: SP): string {
  const q = new URLSearchParams();
  if (sp.n) q.set('n', sp.n);
  if (sp.lvl) q.set('lvl', sp.lvl);
  if (sp.streak) q.set('streak', sp.streak);
  if (sp.xp) q.set('xp', sp.xp);
  if (sp.kind) q.set('kind', sp.kind);
  return `/api/og/progress?${q.toString()}`;
}

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const name = (searchParams.n || 'A learner').slice(0, 40);
  const isIjazah = searchParams.kind === 'ijazah';
  const title = isIjazah
    ? `${name} earned the Grammarian’s Ijāzah on QuRoots`
    : `${name} is learning Quranic Arabic on QuRoots`;
  const description = 'Learn to read and understand the Quran in its own language — free, word by word. Join thousands of learners.';
  const image = ogUrl(searchParams);
  return {
    title,
    description,
    alternates: { canonical: '/share/progress' },
    openGraph: { title, description, images: [{ url: image, width: 1200, height: 630 }], type: 'website' },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default function ShareProgressPage({ searchParams }: { searchParams: SP }) {
  const name = (searchParams.n || 'A learner').slice(0, 40);
  const isIjazah = searchParams.kind === 'ijazah';
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16">
      {isIjazah && <div className="text-5xl mb-4">🎓</div>}
      <p className="text-sm uppercase tracking-[0.16em] mb-2" style={{ color: 'var(--color-primary)' }}>QuRoots</p>
      <h1 className="text-3xl sm:text-4xl font-heading leading-tight mb-3" style={{ color: 'var(--color-ivory)' }}>
        {isIjazah ? `${name} earned the Grammarian’s Ijāzah` : `${name} is learning to read the Quran`}
      </h1>
      <p className="text-sm text-text-secondary max-w-md mb-2">
        Level {searchParams.lvl || '1'} · {searchParams.streak || '0'}-day streak 🔥 · {Number(searchParams.xp || 0).toLocaleString()} XP
      </p>
      <p className="text-sm text-text-secondary max-w-md mb-8">
        Learn Quranic Arabic free — the roots, the grammar, and the Quran word by word.
      </p>
      <div className="flex gap-3">
        <Link href="/learn/path" className="px-5 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'var(--color-primary)', color: '#1a1206' }}>
          Start learning free
        </Link>
        <Link href="/" className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-border text-text-secondary">
          Explore QuRoots
        </Link>
      </div>
    </div>
  );
}
