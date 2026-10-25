'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { create } from 'zustand';

// Keep only UI state in Zustand (modal visibility and why it opened)
const useAuthUIStore = create<{
  showLoginModal: boolean;
  loginReason: string | null;
  setShowLoginModal: (v: boolean, reason?: string) => void;
}>((set) => ({
  showLoginModal: false,
  loginReason: null,
  setShowLoginModal: (show, reason) => set({ showLoginModal: show, loginReason: show ? reason ?? null : null }),
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

// Sign-in returns people to the page they were on, not a fixed dashboard.
const here = () => (typeof window === 'undefined' ? '/dashboard' : window.location.href);

export function useAuthStore() {
  const { data: session, status } = useSession();
  const { showLoginModal, loginReason, setShowLoginModal } = useAuthUIStore();

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
    loginReason,
    setShowLoginModal,
    /** Opens the sign-in sheet; `reason` says what signing in is for. */
    login: (reason?: string) => setShowLoginModal(true, reason),
    signInWithGoogle: () => signIn('google', { callbackUrl: here() }),
    signInWithEmail: (email: string) => signIn('resend', { email, callbackUrl: here(), redirect: false }),
    logout: () => signOut({ callbackUrl: '/' }),
  };
}
