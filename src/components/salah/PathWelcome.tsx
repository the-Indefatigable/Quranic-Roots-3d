'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useSalahProgress } from './useSalahProgress';

const GOLD = '#D4A246';

/**
 * Where Stripe sends a buyer back. Confirms the payment (which unlocks this browser at once),
 * then, for someone who paid without an account, emails a sign-in link to the address they paid
 * with so the path is theirs on every device.
 */
export function PathWelcome() {
  const params = useSearchParams();
  const { done } = useSalahProgress();
  const [state, setState] = useState<'checking' | 'paid' | 'pending' | 'error'>('checking');
  const [email, setEmail] = useState<string | null>(null);
  const [linkSent, setLinkSent] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const id = params.get('session_id');
    if (!id) { setState('error'); return; }
    let tries = 0, stop = false;
    const check = async () => {
      const r = await fetch(`/api/checkout/salah/confirm?session_id=${encodeURIComponent(id)}`).catch(() => null);
      const d = r ? await r.json().catch(() => ({})) : {};
      if (stop) return;
      if (r?.ok && d.paid) {
        setEmail(d.email); setSignedIn(!!d.signedIn); setState('paid');
        const key = `qr:welcome-link:${id}`;
        if (!d.signedIn && d.email && !sessionStorage.getItem(key)) {
          sessionStorage.setItem(key, '1');
          const res = await signIn('resend', { email: d.email, redirect: false, callbackUrl: '/salah' }).catch(() => null);
          setLinkSent(!!res && !res.error);
        }
      } else if (r?.status === 202 && tries++ < 10) { setState('pending'); setTimeout(check, 2000); }
      else setState('error');
    };
    check();
    return () => { stop = true; };
  }, [params]);

  const nextDay = Math.max(8, ...done.map((d) => d + 1).filter((d) => d <= 30));

  return (
    <div className="max-w-xl mx-auto px-5 py-16 text-center">
      {state === 'paid' ? (
        <>
          <p className="font-arabic text-4xl mb-4" style={{ color: GOLD }} dir="rtl" lang="ar">جَزَاكُمُ ٱللَّهُ خَيْرًا</p>
          <h1 className="font-heading text-4xl mb-3" style={{ color: '#F0E8D8' }}>All 30 days are yours.</h1>
          <p className="text-[16px] leading-relaxed mb-8" style={{ color: '#B5B2AC' }}>
            The rest of your salah is unlocked on this device now. May Allah put barakah in every word you learn.
          </p>
          <Link href={`/salah/${nextDay}`} className="btn-primary inline-block px-8">Continue to day {nextDay}</Link>
          {!signedIn && email && (
            <div className="mt-10 rounded-2xl p-5 text-left" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
              <p className="text-[15px] leading-relaxed" style={{ color: '#D8D4CC' }}>
                <b style={{ color: '#F0E8D8' }}>Keep it on every device.</b>{' '}
                {linkSent ? <>We&rsquo;ve emailed a sign-in link to <b>{email}</b>. Open it on any phone or computer and your path is there.</>
                  : <>Your purchase is saved to <b>{email}</b>. Sign in with that email on any device to open it.</>}
              </p>
            </div>
          )}
          <p className="mt-8 text-[13px]" style={{ color: '#8F8C86' }}>A receipt is on its way from Stripe. If anything looks wrong, email salam@quroots.com.</p>
        </>
      ) : state === 'error' ? (
        <>
          <h1 className="font-heading text-3xl mb-3" style={{ color: '#F0E8D8' }}>We couldn&rsquo;t confirm the payment yet.</h1>
          <p className="text-[16px] mb-8" style={{ color: '#B5B2AC' }}>If you were charged, it will unlock within a few minutes. Refresh this page, or email salam@quroots.com and we&rsquo;ll sort it out.</p>
          <Link href="/salah" className="btn-primary inline-block px-8">Back to your salah</Link>
        </>
      ) : (
        <>
          <div className="w-8 h-8 mx-auto mb-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p style={{ color: '#B5B2AC' }}>Confirming your payment…</p>
        </>
      )}
    </div>
  );
}
