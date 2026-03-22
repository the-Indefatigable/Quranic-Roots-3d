'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Bookmark {
  id: string;
  type: 'root' | 'noun' | 'ayah';
  label: string;
  arabicLabel?: string;
  createdAt: number;
}

interface QuranSettings {
  fontSize: number;
  showTranslation: boolean;
  readingMode: 'ayah' | 'word';
}

interface AppState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  selectedRoot: string | null;
  setSelectedRoot: (id: string | null) => void;


  bookmarks: Bookmark[];
  addBookmark: (bookmark: Omit<Bookmark, 'createdAt'>) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;

  quranSettings: QuranSettings;
  updateQuranSettings: (settings: Partial<QuranSettings>) => void;

  lastRead: { surah: number; ayah: number; timestamp: number } | null;
  setLastRead: (surah: number, ayah: number) => void;

  streak: { count: number; lastActiveDate: string | null };
  updateStreak: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      selectedRoot: null,
      setSelectedRoot: (id) => set({ selectedRoot: id }),


      bookmarks: [],
      addBookmark: (bookmark) =>
        set((state) => ({
          bookmarks: [...state.bookmarks, { ...bookmark, createdAt: Date.now() }],
        })),
      removeBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        })),
      isBookmarked: (id) => get().bookmarks.some((b) => b.id === id),

      quranSettings: {
        fontSize: 28,
        showTranslation: true,
        readingMode: 'ayah',
      },
      updateQuranSettings: (settings) =>
        set((state) => ({
          quranSettings: { ...state.quranSettings, ...settings },
        })),

      lastRead: null,
      setLastRead: (surah, ayah) => set({ lastRead: { surah, ayah, timestamp: Date.now() } }),

      streak: { count: 0, lastActiveDate: null },
      updateStreak: () => {
        set((state) => {
          const today = new Date().toISOString().split('T')[0];
          const lastDate = state.streak.lastActiveDate;
          
          if (lastDate === today) return state; // Already active today

          if (!lastDate) {
            return { streak: { count: 1, lastActiveDate: today } };
          }

          const lastDateObj = new Date(lastDate);
          const todayObj = new Date(today);
          const diffDays = Math.floor((todayObj.getTime() - lastDateObj.getTime()) / (1000 * 60 * 60 * 24));

          if (diffDays === 1) {
            // Consecutive day
            return { streak: { count: state.streak.count + 1, lastActiveDate: today } };
          } else if (diffDays > 1) {
            // Streak broken
            return { streak: { count: 1, lastActiveDate: today } };
          }

          return state;
        });
      },
    }),
    {
      name: 'quroots-storage',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        quranSettings: state.quranSettings,
        lastRead: state.lastRead,
        streak: state.streak,
      }),
    }
  )
);
