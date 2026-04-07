'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { create } from 'zustand';

// Keep only UI state in Zustand (modal visibility)
const useAuthUIStore = create<{ showLoginModal: boolean; setShowLoginModal: (v: boolean) => void }>((set) => ({
  showLoginModal: false,
  setShowLoginModal: (show) => set({ showLoginModal: show }),
}));

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  streakDays: number | null;
  lastActive: string | null;
  // Backward compat alias
  avatarUrl?: string | null;
}

export function useAuthStore() {
  const { data: session, status } = useSession();
  const { showLoginModal, setShowLoginModal } = useAuthUIStore();

  const user = session?.user
    ? ({
        id: session.user.id,
        email: session.user.email!,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        avatarUrl: session.user.image ?? null, // backward compat
        role: session.user.role ?? 'student',
        streakDays: session.user.streakDays ?? 0,
        lastActive: session.user.lastActive ?? null,
      } as AuthUser)
    : null;

  return {
    user,
    isLoading: status === 'loading',
    showLoginModal,
    setShowLoginModal,
    login: () => signIn('google', { callbackUrl: '/' }),
    logout: () => signOut({ callbackUrl: '/' }),
  };
}
