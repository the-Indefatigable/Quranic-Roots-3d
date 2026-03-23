'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

type ModalState = 'input' | 'sent' | 'error';

export function LoginModal() {
  const { showLoginModal, setShowLoginModal, login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<ModalState>('input');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!showLoginModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setError('');

    const result = await login(email);
    setLoading(false);

    if (result.ok) {
      setState('sent');
    } else {
      setError(result.error || 'Something went wrong');
      setState('error');
    }
  };

  const handleClose = () => {
    setShowLoginModal(false);
    setState('input');
    setEmail('');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-card border border-white/[0.08] rounded-2xl p-8 shadow-2xl">
        {/* Close */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/25 hover:text-white/60 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Logo */}
        <p className="text-lg font-bold tracking-tight text-white mb-1">
          Qu<span className="text-gold">Roots</span>
        </p>

        {state === 'input' && (
          <>
            <h2 className="text-xl font-bold text-white mb-1.5">Welcome</h2>
            <p className="text-sm text-white/35 mb-6 leading-relaxed">
              Sign in to sync your progress, bookmarks, and streak across devices.
            </p>

            <form onSubmit={handleSubmit}>
              <label className="block text-xs font-semibold text-white/40 mb-2 tracking-wide">
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoFocus
                required
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-gold/40 focus:ring-1 focus:ring-gold/20 transition-all mb-4"
              />
              <button
                type="submit"
                disabled={loading || !email}
                className="btn-primary w-full py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  'Send magic link'
                )}
              </button>
            </form>

            <p className="text-[11px] text-white/18 mt-4 text-center leading-relaxed">
              No password needed. We&apos;ll email you a sign-in link.
            </p>
          </>
        )}

        {state === 'sent' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-gold" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-sm text-white/40 leading-relaxed mb-1">
              We sent a sign-in link to
            </p>
            <p className="text-sm font-semibold text-gold mb-6">{email}</p>
            <button
              onClick={handleClose}
              className="text-sm text-white/30 hover:text-white/60 transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {state === 'error' && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-white/40 mb-6">{error}</p>
            <button
              onClick={() => { setState('input'); setError(''); }}
              className="btn-primary px-6 py-2.5 text-sm"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
