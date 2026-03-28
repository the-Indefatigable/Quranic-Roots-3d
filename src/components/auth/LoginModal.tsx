'use client';

import { useAuthStore } from '@/store/useAuthStore';

export function LoginModal() {
  const { showLoginModal, setShowLoginModal, login } = useAuthStore();

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => setShowLoginModal(false)}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-surface border border-border-light rounded-2xl p-8 shadow-modal">
        {/* Close */}
        <button
          onClick={() => setShowLoginModal(false)}
          className="absolute top-4 right-4 text-text-tertiary hover:text-text-secondary transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <p className="text-lg font-bold tracking-tight text-text mb-1">
          Qu<span className="text-primary">Roots</span>
        </p>

        <h2 className="text-xl font-bold text-text mb-1.5">Welcome</h2>
        <p className="text-sm text-text-secondary mb-6 leading-relaxed">
          Sign in to sync your progress, bookmarks, and streak across devices.
        </p>

        <button
          onClick={() => login()}
          className="btn-primary w-full py-3.5 flex items-center justify-center gap-3"
        >
          {/* Google Icon SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="currentColor"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="currentColor"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="currentColor"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="currentColor"
            />
          </svg>
          Sign in with Google
        </button>

        <p className="text-[11px] text-text-tertiary mt-4 text-center leading-relaxed">
          We'll never post on your behalf.
        </p>
      </div>
    </div>
  );
}
