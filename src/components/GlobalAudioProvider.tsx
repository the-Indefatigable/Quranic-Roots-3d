'use client';

import { useEffect } from 'react';
import { useGlobalAudioStore } from '@/store/useGlobalAudioStore';
import { PersistentMiniPlayer } from '@/components/quran/PersistentMiniPlayer';

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
