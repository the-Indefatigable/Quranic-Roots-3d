'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  userId: string;
}

/**
 * Founding Supporter card on /profile.
 *  - Not yet a supporter → a $99 lifetime CTA that opens the LemonSqueezy
 *    checkout with the user id attached as custom data (so the webhook can
 *    attribute the purchase back to this account).
 *  - Already a supporter → a gratitude badge.
 *
 * The checkout URL comes from NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL (a "Buy now"
 * link generated in the LemonSqueezy dashboard). If it isn't configured the
 * card renders nothing, so the profile page degrades gracefully.
 */
export function SupporterCard({ userId }: Props) {
  const [isSupporter, setIsSupporter] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    fetch('/api/supporter')
      .then((r) => r.json())
      .then((d) => { if (alive) setIsSupporter(!!d.isSupporter); })
      .catch(() => { if (alive) setIsSupporter(false); });
    return () => { alive = false; };
  }, []);

  const base = process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL;

  // Still loading, or checkout not configured and not already a supporter → render nothing.
  if (isSupporter === null) return null;
  if (!isSupporter && !base) return null;

  if (isSupporter) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.35 }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3 px-1">Membership</h2>
        <div
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{
            background: 'linear-gradient(135deg, rgba(212,162,70,0.14), rgba(212,162,70,0.04))',
            border: '1px solid rgba(212,162,70,0.3)',
          }}
        >
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl"
            style={{ background: 'rgba(212,162,70,0.18)' }}
          >
            🌱
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#F0E4CA' }}>Founding Supporter</p>
            <p className="text-xs" style={{ color: '#A8946A' }}>
              Thank you for helping QuRoots grow. Your name is written in our روابط.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  // Attach the user id so the webhook can attribute the order. LemonSqueezy
  // reads checkout[custom][*] and echoes it back in meta.custom_data.
  const sep = base!.includes('?') ? '&' : '?';
  const checkoutUrl = `${base}${sep}checkout[custom][user_id]=${encodeURIComponent(userId)}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22, duration: 0.35 }}
    >
      <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3 px-1">Support QuRoots</h2>
      <div
        className="rounded-2xl p-5"
        style={{
          background: 'linear-gradient(135deg, rgba(212,162,70,0.1), rgba(255,255,255,0.02))',
          border: '1px solid rgba(212,162,70,0.22)',
        }}
      >
        <div className="flex items-start gap-4 mb-4">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl"
            style={{ background: 'rgba(212,162,70,0.15)' }}
          >
            🌱
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#F0E4CA' }}>Become a Founding Supporter</p>
            <p className="text-xs leading-relaxed mt-1" style={{ color: '#A8946A' }}>
              A one-time gift that keeps QuRoots free for learners everywhere — and
              unlocks every current and future Pro feature, for life. No subscription.
            </p>
          </div>
        </div>

        <a
          href={checkoutUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: '#D4A246', color: '#1A1712' }}
        >
          Support for $99 — Lifetime
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
          </svg>
        </a>
      </div>
    </motion.div>
  );
}
