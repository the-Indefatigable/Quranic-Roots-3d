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
    }),
    {
      name: 'quroots-storage',
      partialize: (state) => ({
        bookmarks: state.bookmarks,
        quranSettings: state.quranSettings,
      }),
    }
  )
);
