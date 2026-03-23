'use client';

import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  streakDays: number | null;
  lastActive: string | null;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  showLoginModal: boolean;

  fetchUser: () => Promise<void>;
  login: (email: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  setShowLoginModal: (show: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  showLoginModal: false,

  fetchUser: async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      set({ user: data.user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  login: async (email: string) => {
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error };
      return { ok: true };
    } catch {
      return { ok: false, error: 'Network error' };
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
    set({ user: null });
    window.location.reload();
  },

  setShowLoginModal: (show) => set({ showLoginModal: show }),
}));
