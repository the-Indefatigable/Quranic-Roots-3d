'use client';

import { useEffect, useState } from 'react';

/**
 * Weekly digest opt-in toggle for the profile page.
 * Friday email: verse of the week, new lessons, community activity.
 */
export function DigestToggle() {
  const [optIn, setOptIn] = useState<boolean | null>(null); // null = loading
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/digest/subscribe')
      .then((r) => (r.ok ? r.json() : { optIn: false }))
      .then((d) => { if (active) setOptIn(!!d.optIn); })
      .catch(() => { if (active) setOptIn(false); });
    return () => { active = false; };
  }, []);

  const toggle = async () => {
    if (optIn === null || saving) return;
    const next = !optIn;
    setSaving(true);
    setOptIn(next); // optimistic
    try {
      const res = await fetch('/api/digest/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optIn: next }),
      });
      if (!res.ok) setOptIn(!next); // revert
    } catch {
      setOptIn(!next);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex items-center gap-4 px-5 py-4 bg-surface rounded-2xl shadow-card">
      <div className="text-primary">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text">Weekly Digest</p>
        <p className="text-xs text-text-tertiary">Verse of the week + new lessons, every Friday</p>
      </div>
      <button
        role="switch"
        aria-checked={!!optIn}
        aria-label="Toggle weekly digest emails"
        onClick={toggle}
        disabled={optIn === null}
        className="relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 disabled:opacity-40"
        style={{ background: optIn ? 'var(--color-primary)' : 'var(--color-border)' }}
      >
        <span
          className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
          style={{ left: optIn ? 22 : 2 }}
        />
      </button>
    </div>
  );
}
