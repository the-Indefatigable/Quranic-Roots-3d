'use client';

import { useCallback, useEffect, useState } from 'react';
import { track, touch } from '@/lib/track';

// Completed days live in the browser, so the path works before anyone signs in.
const KEY = 'qr:salah:done';

export function useSalahProgress() {
  const [done, setDone] = useState<number[]>([]);
  useEffect(() => {
    try { setDone(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch { /* storage unavailable */ }
  }, []);
  const complete = useCallback((day: number) => {
    track('day_complete', { day });
    setDone((prev) => {
      const next = [...new Set([...prev, day])].sort((a, b) => a - b);
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage unavailable */ }
      return next;
    });
  }, []);
  return { done, complete };
}

export type Overview = {
  access: boolean; signedIn: boolean; checkoutEnabled: boolean; priceCents: number;
  totals: { roots: number; words: number; rootedWords: number; freeDays: number; days: number };
  days: { day: number; title: string; free: boolean; pctSalah: number; rootCount: number; lineCount: number; locked: boolean }[];
};

export async function startPathCheckout(login: (reason?: string) => void, signedIn: boolean): Promise<string | null> {
  track('checkout_start');
  if (!signedIn) { login('Sign in to unlock the full path'); return null; }
  const r = await fetch('/api/checkout/salah', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(touch() ?? {}) });
  const d = await r.json().catch(() => ({}));
  if (r.ok && d.url) { window.location.href = d.url; return null; }
  return d.error || 'Could not start checkout. Please try again.';
}
