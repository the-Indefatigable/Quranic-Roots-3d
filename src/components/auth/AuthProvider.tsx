'use client';

import { SessionProvider } from 'next-auth/react';
import { LoginModal } from './LoginModal';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <LoginModal />
    </SessionProvider>
  );
}
