'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/useAuthStore';

const DISMISS_KEY = 'digest-banner-dismissed';

/**
 * A friendly, one-click "subscribe to the digest" banner for signed-in users
 * who haven't opted in yet — shown on the dashboard so new accounts can turn it
 * on the moment they land. Dismissible; hidden once subscribed.
 */
export function DigestSubscribeBanner() {
  const { user } = useAuthStore();
  const [optIn, setOptIn] = useState<boolean | null>(null); // null = loading/unknown
  const [dismissed, setDismissed] = useState(true);
  const [saving, setSaving] = useState(false);
  const [justSubscribed, setJustSubscribed] = useState(false);

  useEffect(() => {
    setDismissed(typeof window !== 'undefined' && localStorage.getItem(DISMISS_KEY) === '1');
  }, []);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetch('/api/digest/subscribe')
      .then((r) => (r.ok ? r.json() : { optIn: false }))
      .then((d) => { if (alive) setOptIn(!!d.optIn); })
      .catch(() => { if (alive) setOptIn(false); });
    return () => { alive = false; };
  }, [user]);

  async function subscribe() {
    if (saving) return;
    setSaving(true);
    setOptIn(true); // optimistic
    try {
      const res = await fetch('/api/digest/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optIn: true }),
      });
      if (res.ok) setJustSubscribed(true);
      else setOptIn(false);
    } catch {
      setOptIn(false);
    } finally {
      setSaving(false);
    }
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }

  // Only show to signed-in users who aren't subscribed and haven't dismissed.
  if (!user || dismissed || optIn === null || (optIn && !justSubscribed)) return null;

  if (justSubscribed) {
    return (
      <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'linear-gradient(135deg, rgba(212,162,70,0.14), rgba(212,162,70,0.04))', border: '1px solid rgba(212,162,70,0.3)' }}>
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(212,162,70,0.18)', color: '#D4A246' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
        </span>
        <p className="text-sm font-medium flex-1" style={{ color: '#F0E4CA' }}>You&apos;re subscribed — your first digest arrives this Friday.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl p-4 sm:p-5" style={{ background: 'linear-gradient(135deg, rgba(212,162,70,0.1), rgba(255,255,255,0.02))', border: '1px solid rgba(212,162,70,0.22)' }}>
      <div className="flex items-start gap-4">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(212,162,70,0.14)', color: '#D4A246' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold" style={{ color: '#F0E4CA' }}>Get the weekly digest</p>
          <p className="text-xs leading-relaxed mt-0.5" style={{ color: '#A8946A' }}>
            One email every Friday — a new ayah, the week&apos;s new lessons, and what the community&apos;s learning.{' '}
            <Link href="/digest" className="underline" style={{ color: '#D4A246' }}>Learn more</Link>
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={subscribe}
              disabled={saving}
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: '#D4A246', color: '#1A1712' }}
            >
              {saving ? 'Subscribing…' : 'Subscribe'}
            </button>
            <button onClick={dismiss} className="text-xs font-medium px-3 py-2 rounded-xl" style={{ color: '#78716C' }}>
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
