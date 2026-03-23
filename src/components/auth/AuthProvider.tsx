'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { LoginModal } from './LoginModal';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const fetchUser = useAuthStore((s) => s.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      {children}
      <LoginModal />
    </>
  );
}
