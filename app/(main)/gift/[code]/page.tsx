import type { Metadata } from 'next';
import Link from 'next/link';
import { getStripe } from '@/lib/stripe';
import { giftInfo } from '@/lib/gifts';
import { GiftRedeem } from '@/components/gift/GiftRedeem';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'You’ve been given a gift',
  description: 'A 30-day path to understanding every word of your salah.',
  robots: { index: false },
  openGraph: { title: 'You’ve been given a gift', description: 'A 30-day path to understanding every word of your salah. Tap to open it.', siteName: 'QuRoots', images: [{ url: 'https://quroots.com/api/og/salah?d=30', width: 1200, height: 630 }] },
};

export default async function GiftCodePage({ params }: { params: { code: string } }) {
  const stripe = getStripe();
  const info = stripe && /^(GIFT|SPONSOR)-[A-Z0-9]{6,12}$/i.test(params.code) ? await giftInfo(stripe, params.code).catch(() => null) : null;
  if (!info) {
    return (
      <div className="max-w-xl mx-auto px-5 py-20 text-center">
        <h1 className="font-heading text-3xl mb-3" style={{ color: '#F0E8D8' }}>We couldn&rsquo;t find that gift.</h1>
        <p className="mb-8" style={{ color: '#B5B2AC' }}>Check the link you were sent, or email salam@quroots.com and we&rsquo;ll help.</p>
        <Link href="/salah" className="btn-primary inline-block px-8">See the salah path</Link>
      </div>
    );
  }
  return <GiftRedeem info={info} />;
}
