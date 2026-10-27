import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PathWelcome } from '@/components/salah/PathWelcome';

export const metadata: Metadata = {
  title: 'Your salah path is unlocked',
  robots: { index: false },
};

export default function WelcomePage() {
  return (
    <Suspense>
      <PathWelcome />
    </Suspense>
  );
}
