'use client';

import { useState } from 'react';

// Lightweight share: uses the native share sheet on mobile, falls back to
// copying the text + link on desktop. A cheap virality lever.
export function ShareButton({ text, className, label = 'Share' }: { text: string; className?: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const onShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.origin : 'https://quroots.com';
    const shareData = { title: 'QuRoots', text, url };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch {
      /* user cancelled — fall through to copy */
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={onShare}
      className={className ?? 'px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors'}
      style={{ background: 'rgba(212,162,70,0.14)', color: 'var(--color-primary)', border: '1px solid rgba(212,162,70,0.35)' }}
    >
      {copied ? '✓ Copied!' : `↗ ${label}`}
    </button>
  );
}
