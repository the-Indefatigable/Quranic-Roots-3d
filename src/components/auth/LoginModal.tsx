'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';

const PERKS = [
  'Your streak and progress, on every device',
  'Words you learn come back for review before you forget them',
  'Your place in the Learners’ Lounge and on the leaderboard',
];

/**
 * The one sign-in sheet. Every "Sign in" button opens it (with a reason when the
 * caller has one), so nobody is thrown to Google without knowing why.
 */
export function LoginModal() {
  const { showLoginModal, loginReason, setShowLoginModal, signInWithGoogle, signInWithEmail } = useAuthStore();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  // Google refuses to sign people in inside Instagram's, Facebook's or TikTok's own browser.
  const [inApp, setInApp] = useState(false);
  useEffect(() => { setInApp(/Instagram|FBAN|FBAV|FB_IAB|BytedanceWebview|musical_ly|TikTok|Snapchat/i.test(navigator.userAgent)); }, []);
  const close = () => setShowLoginModal(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showLoginModal) { setState('idle'); return; }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    panel.current?.querySelector<HTMLElement>('button[data-primary]')?.focus();
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showLoginModal]);

  if (!showLoginModal) return null;

  const sendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return;
    setState('sending');
    const res = await signInWithEmail(email.trim()).catch(() => null);
    setState(res && !res.error ? 'sent' : 'error');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        className="relative w-full sm:max-w-[400px] rounded-t-3xl sm:rounded-3xl px-6 pt-7 pb-[calc(env(safe-area-inset-bottom)+24px)] sm:pb-7"
        style={{ background: '#17160F', border: '1px solid rgba(212,162,70,0.22)', boxShadow: 'var(--shadow-modal)' }}
      >
        <button onClick={close} aria-label="Close" className="absolute top-4 right-4 w-9 h-9 grid place-items-center rounded-full text-text-tertiary hover:text-text">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
        </button>

        <p className="font-arabic text-2xl mb-3 text-left" style={{ color: 'var(--color-primary)' }} dir="rtl" lang="ar">بِسْمِ ٱللَّهِ</p>
        <h2 id="login-title" className="font-heading text-[28px] leading-tight mb-2" style={{ color: 'var(--color-ivory)' }}>
          {loginReason ?? 'Keep your progress'}
        </h2>
        <p className="text-[15px] text-text-secondary mb-5">An account is free and takes a few seconds.</p>

        <ul className="space-y-2 mb-6">
          {PERKS.map((p) => (
            <li key={p} className="flex gap-2.5 text-sm text-text-secondary">
              <svg className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--color-primary)' }} fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
              {p}
            </li>
          ))}
        </ul>

        {inApp ? (
          <p className="text-[13px] leading-relaxed mb-4 px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--color-text-secondary)' }}>
            Google sign-in doesn&rsquo;t work inside this app&rsquo;s browser. Use your email below, or open quroots.com in Safari or Chrome.
          </p>
        ) : (
          <>
            <button data-primary onClick={() => signInWithGoogle()} className="w-full h-12 rounded-full flex items-center justify-center gap-3 font-semibold text-[15px] transition-transform active:scale-[0.98]" style={{ background: '#F5F1E8', color: '#1a1206' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4 text-xs text-text-tertiary">
              <span className="h-px flex-1 bg-white/10" />or<span className="h-px flex-1 bg-white/10" />
            </div>
          </>
        )}

        {state === 'sent' ? (
          <p className="text-sm text-center py-3 rounded-2xl" style={{ background: 'rgba(212,162,70,0.08)', color: 'var(--color-ivory)' }}>
            Check <b>{email}</b> for your sign-in link.
          </p>
        ) : (
          <form onSubmit={sendLink} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
              className="flex-1 min-w-0 h-12 px-4 rounded-full text-[15px] bg-white/[0.04] border border-white/10 focus:border-[rgba(212,162,70,0.5)] outline-none text-text placeholder:text-text-tertiary"
            />
            <button type="submit" disabled={state === 'sending'} className="h-12 px-5 rounded-full text-sm font-semibold border border-white/15 text-text hover:border-[rgba(212,162,70,0.5)] disabled:opacity-60">
              {state === 'sending' ? 'Sending…' : 'Email me a link'}
            </button>
          </form>
        )}
        {state === 'error' && <p className="text-xs mt-2" style={{ color: 'var(--color-wrong)' }}>Could not send the link. Try again, or use Google.</p>}

        <p className="text-xs text-text-tertiary mt-5 text-center">We never post anything or share your email.</p>
      </div>
    </div>
  );
}
