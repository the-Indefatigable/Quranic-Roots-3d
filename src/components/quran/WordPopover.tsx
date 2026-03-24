'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingFocusManager,
  useTransitionStyles,
} from '@floating-ui/react';

export interface WordData {
  position: number;
  textUthmani: string;
  transliteration: string | null;
  translation: string | null;
  rootArabic: string | null;
  charType: string;
}

interface Props {
  word: WordData | null;
  anchorElement: HTMLElement | null;
  onClose: () => void;
}

export function WordPopover({ word, anchorElement, onClose }: Props) {
  const { refs, floatingStyles, context } = useFloating({
    open: !!word,
    onOpenChange: (open) => !open && onClose(),
    elements: {
      reference: anchorElement,
    },
    placement: 'top',
    middleware: [
      offset(10),
      flip({ padding: 12 }),
      shift({ padding: 12 }),
    ],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context);
  const role = useRole(context);
  const { getFloatingProps } = useInteractions([dismiss, role]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 200,
    initial: { opacity: 0, transform: 'translateY(10px) scale(0.95)' },
    open: { opacity: 1, transform: 'translateY(0) scale(1)' },
    close: { opacity: 0, transform: 'translateY(10px) scale(0.95)' },
  });

  if (!isMounted || !word) return null;

  return (
    <FloatingPortal>
      {/* Backdrop (invisible but handles outside clicks via useDismiss) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px]"
        aria-hidden="true"
      />

      <FloatingFocusManager context={context} modal>
        <div
          ref={refs.setFloating}
          style={{ ...floatingStyles, ...transitionStyles, zIndex: 101 }}
          {...getFloatingProps()}
          className="focus:outline-none"
        >
          <div
            className="bg-card glass-strong border border-white/[0.1] rounded-2xl p-5 shadow-2xl w-56 sm:w-64 md:w-72"
            style={{
              maxHeight: 'calc(100vh - 32px)',
              overflowY: 'auto'
            }}
          >
              {/* Word */}
              <div className="text-center sm:text-right mb-4">
                <p className="font-arabic text-4xl text-gold leading-relaxed" dir="rtl">
                  {word.textUthmani}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-2.5">
                {word.transliteration && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-more uppercase tracking-wider">Transliteration</span>
                    <span className="text-sm text-slate-300 italic">{word.transliteration}</span>
                  </div>
                )}

                {word.translation && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-more uppercase tracking-wider">Meaning</span>
                    <span className="text-sm text-slate-200">{word.translation}</span>
                  </div>
                )}

                {word.rootArabic && (
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-more uppercase tracking-wider">Root</span>
                    <span className="font-arabic text-lg text-gold">{word.rootArabic}</span>
                  </div>
                )}
              </div>

              {/* Root link or particle indicator */}
              {word.rootArabic ? (
                <Link
                  href={`/roots/${encodeURIComponent(word.rootArabic.replace(/\s/g, ''))}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 mt-4 bg-gold-dim text-gold text-xs font-medium px-4 py-2.5 rounded-xl hover:bg-gold/20 transition-colors"
                >
                  View full root
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              ) : (
                <div className="mt-4 text-center text-[10px] text-muted-more uppercase tracking-wider">
                  Particle / Function word
                </div>
              )}

              {/* Close on mobile */}
              <button
                onClick={onClose}
                className="sm:hidden w-full mt-3 text-xs text-muted-more py-2"
              >
                Close
              </button>
            </div>
        </div>
      </FloatingFocusManager>
    </FloatingPortal>
  );
}
