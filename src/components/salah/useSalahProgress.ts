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
  offer: { priceCents: number; paidDays: number; paidRoots: number; paidSurahs: string[]; freePct: number };
  totals: { roots: number; words: number; rootedWords: number; freeDays: number; days: number };
  days: { day: number; title: string; free: boolean; pctSalah: number; rootCount: number; lineCount: number; locked: boolean }[];
};

/** Opens Stripe Checkout for the full path. No sign-in needed; Stripe asks for the email. */
export async function startPathCheckout(returnTo = '/salah'): Promise<string | null> {
  track('checkout_start');
  const r = await fetch('/api/checkout/salah', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...(touch() ?? {}), returnTo }) });
  const d = await r.json().catch(() => ({}));
  if (r.ok && d.url) { window.location.href = d.url; return null; }
  return d.error || 'Could not open checkout. Please try again.';
}
