import { create } from 'zustand';
import type { PlayMode, LoopMode } from '@/components/quran/AudioPlayer';

export interface GlobalAudioPlayInfo {
  surahNumber: number;
  surahName: string;
  currentAyah: number;
  totalAyahs: number;
  isPlaying: boolean;
  playMode: PlayMode;
  loopMode: LoopMode;
}

interface GlobalAudioState {
  audioEl: HTMLAudioElement | null;
  playInfo: GlobalAudioPlayInfo | null;
  setAudioEl: (el: HTMLAudioElement) => void;
  setPlayInfo: (info: GlobalAudioPlayInfo | null) => void;
  updatePlayInfo: (partial: Partial<GlobalAudioPlayInfo>) => void;
}

export const useGlobalAudioStore = create<GlobalAudioState>()((set, get) => ({
  audioEl: null,
  playInfo: null,
  setAudioEl: (el) => set({ audioEl: el }),
  setPlayInfo: (info) => set({ playInfo: info }),
  updatePlayInfo: (partial) => {
    const current = get().playInfo;
    if (current) set({ playInfo: { ...current, ...partial } });
  },
}));
