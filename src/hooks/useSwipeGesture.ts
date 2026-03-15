import { useEffect, useRef, RefObject } from 'react';

interface SwipeHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

/**
 * Detects swipe gestures on a target element (or document if no ref provided).
 * Passing an elementRef scopes the listener so multiple swipe handlers don't conflict.
 */
export function useSwipeGesture(
  handlers: SwipeHandlers,
  threshold = 60,
  elementRef?: RefObject<HTMLElement | null>,
) {
  const startX = useRef(0);
  const startY = useRef(0);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const target = elementRef?.current ?? document;

    const onTouchStart = (e: Event) => {
      const te = e as TouchEvent;
      startX.current = te.touches[0].clientX;
      startY.current = te.touches[0].clientY;
    };

    const onTouchEnd = (e: Event) => {
      const te = e as TouchEvent;
      const dx = te.changedTouches[0].clientX - startX.current;
      const dy = te.changedTouches[0].clientY - startY.current;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);
      if (Math.max(absDx, absDy) < threshold) return;
      const h = handlersRef.current;
      if (absDx > absDy * 1.5) {
        if (dx > 0) h.onSwipeRight?.();
        else h.onSwipeLeft?.();
      } else {
        if (dy > 0) h.onSwipeDown?.();
        else h.onSwipeUp?.();
      }
    };

    target.addEventListener('touchstart', onTouchStart, { passive: true });
    target.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      target.removeEventListener('touchstart', onTouchStart);
      target.removeEventListener('touchend', onTouchEnd);
    };
  }, [threshold, elementRef]);
}
