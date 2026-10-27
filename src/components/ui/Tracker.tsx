'use client';

import { useEffect } from 'react';
import { track } from '@/lib/track';

/** Counts one visit per browser session and fixes the visitor's first-touch source. */
export function Tracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem('qr:visited')) return;
      sessionStorage.setItem('qr:visited', '1');
    } catch { /* storage unavailable: still count it */ }
    track('visit');
  }, []);
  return null;
}
