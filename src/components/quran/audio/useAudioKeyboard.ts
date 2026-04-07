'use client';

import { useEffect } from 'react';

interface Args {
  togglePlay: () => void;
  nextAyah: () => void;
  prevAyah: () => void;
  toggleExpanded: () => void;
  isPlaying: boolean;
  currentAyah: number;
}

/**
 * Global keyboard shortcuts for the audio player.
 * Space: play/pause | Shift+ArrowRight/Left: next/prev ayah | F: expand toggle
 * Ignored when focus is in an input/textarea.
 */
export function useAudioKeyboard({
  togglePlay,
  nextAyah,
  prevAyah,
  toggleExpanded,
  isPlaying,
  currentAyah,
}: Args) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.code) {
        case 'Space':      e.preventDefault(); togglePlay(); break;
        case 'ArrowRight': if (e.shiftKey) { nextAyah(); e.preventDefault(); } break;
        case 'ArrowLeft':  if (e.shiftKey) { prevAyah(); e.preventDefault(); } break;
        case 'KeyF':       toggleExpanded(); break;
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentAyah]);
}
