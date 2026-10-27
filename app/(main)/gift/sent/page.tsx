import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GiftSent } from '@/components/gift/GiftSent';

export const metadata: Metadata = { title: 'Your gift is ready', robots: { index: false } };

export default function GiftSentPage() {
  return <Suspense><GiftSent /></Suspense>;
}
