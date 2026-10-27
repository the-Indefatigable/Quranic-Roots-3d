import type { Metadata } from 'next';
import { PATH } from '@/lib/salahPath';
import { GoToSalah } from './GoToSalah';

// A shared progress link: quroots.com/s/7. Link previews show the progress card; people who tap
// it land on the salah path.
type Props = { params: { slug: string } };
const dayOf = (slug: string) => Math.min(30, Math.max(1, parseInt(slug) || 1));

export function generateMetadata({ params }: Props): Metadata {
  const day = dayOf(params.slug);
  const pct = PATH.days.find((d) => d.day === day)?.pctSalah ?? 0;
  const title = `I understand ${pct}% of my salah`;
  const description = 'Learning the Arabic roots of every word I pray, two or three a day. The first week is free.';
  const image = `https://quroots.com/api/og/salah?d=${day}`;
  return {
    title: { absolute: title }, description, robots: { index: false },
    openGraph: { title, description, url: `https://quroots.com/s/${day}`, siteName: 'QuRoots', images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}

export default function SharePage() {
  return (
    <main className="min-h-screen grid place-items-center p-10 text-center">
      <GoToSalah />
      <a href="/salah?src=share" className="text-primary text-lg underline underline-offset-4">Understand every word of your salah →</a>
    </main>
  );
}
