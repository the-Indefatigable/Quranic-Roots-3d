'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState, useCallback } from 'react';

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const creepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevPathRef = useRef(pathname + searchParams.toString());

  const cleanup = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    if (creepRef.current !== null) clearInterval(creepRef.current);
  }, []);

  useEffect(() => {
    const currentPath = pathname + searchParams.toString();

    // Skip the initial mount
    if (prevPathRef.current === currentPath) return;
    prevPathRef.current = currentPath;

    // Navigation completed — snap to 100% and fade out
    cleanup();
    setProgress(100);
    setVisible(true);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      // Reset after fade-out transition completes
      timerRef.current = setTimeout(() => setProgress(0), 300);
    }, 200);

    return cleanup;
  }, [pathname, searchParams, cleanup]);

  // Listen for click events on links to start the progress bar
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;
      if (anchor.target === '_blank') return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const currentPath = pathname + searchParams.toString();
      // Normalize the href for comparison
      const url = new URL(href, window.location.origin);
      const targetPath = url.pathname + url.search;

      if (targetPath === currentPath) return;

      // Start loading animation
      cleanup();
      setProgress(0);
      setVisible(true);

      // Quick jump to ~30%, then creep toward 80%
      requestAnimationFrame(() => {
        setProgress(30);
      });

      creepRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          // Slow down as we approach 90%
          const increment = Math.max(0.5, (90 - prev) * 0.05);
          return Math.min(90, prev + increment);
        });
      }, 200);
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [pathname, searchParams, cleanup]);

  if (progress === 0 && !visible) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 pointer-events-none"
      style={{ height: '2px' }}
    >
      <div
        className="h-full bg-primary"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          transition: progress === 100
            ? 'width 150ms ease-out, opacity 300ms ease-out'
            : progress === 30
              ? 'width 300ms ease-out, opacity 100ms ease-in'
              : 'width 200ms linear, opacity 100ms ease-in',
        }}
      />
    </div>
  );
}
