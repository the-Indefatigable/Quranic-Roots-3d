'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DonateWidget } from '@/components/support/DonateWidget';

/**
 * Donation card on /profile.
 *  - Already donated → a gratitude badge.
 *  - Otherwise, if donations are configured → a compact donate widget.
 *  - If not configured, renders nothing (profile degrades gracefully).
 */
export function SupporterCard() {
  const [hasDonated, setHasDonated] = useState<boolean | null>(null);
  const [checkoutEnabled, setCheckoutEnabled] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch('/api/supporter')
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setHasDonated(!!d.isSupporter);
        setCheckoutEnabled(!!d.checkoutEnabled);
      })
      .catch(() => { if (alive) setHasDonated(false); });
    return () => { alive = false; };
  }, []);

  if (hasDonated === null) return null;
  if (!hasDonated && !checkoutEnabled) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.35 }}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-text-tertiary mb-3 px-1">Support QuRoots</h2>

      {hasDonated ? (
        <div
          className="rounded-2xl p-5 flex items-center gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(212,162,70,0.14), rgba(212,162,70,0.04))', border: '1px solid rgba(212,162,70,0.3)' }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl" style={{ background: 'rgba(212,162,70,0.18)' }}>🌱</div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold" style={{ color: '#F0E4CA' }}>Thank you for supporting QuRoots</p>
            <p className="text-xs" style={{ color: '#A8946A' }}>Your gift keeps it free for learners everywhere. جزاك الله خيرًا</p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-5" style={{ background: 'linear-gradient(135deg, rgba(212,162,70,0.1), rgba(255,255,255,0.02))', border: '1px solid rgba(212,162,70,0.22)' }}>
          <p className="text-xs leading-relaxed mb-4" style={{ color: '#A8946A' }}>
            QuRoots is free and always will be — nothing is locked. If it&apos;s helped you,
            a one-time gift of any size keeps it growing.
          </p>
          <DonateWidget />
        </div>
      )}
    </motion.div>
  );
}
