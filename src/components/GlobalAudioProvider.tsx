'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGlobalAudioStore } from '@/store/useGlobalAudioStore';

// Mini player only renders once audio is active — defer it out of the initial
// shell bundle that loads on every route.
const PersistentMiniPlayer = dynamic(
  () => import('@/components/quran/PersistentMiniPlayer').then((m) => ({ default: m.PersistentMiniPlayer })),
  { ssr: false }
);

export function GlobalAudioProvider({ children }: { children: React.ReactNode }) {
  const setAudioEl = useGlobalAudioStore((s) => s.setAudioEl);

  useEffect(() => {
    const el = new Audio();
    el.crossOrigin = 'anonymous';
    setAudioEl(el);
    return () => {
      el.pause();
      el.src = '';
    };
  }, [setAudioEl]);

  return (
    <>
      {children}
      <PersistentMiniPlayer />
    </>
  );
}
