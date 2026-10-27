'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const GOLD = '#D4A246';

/** After paying for a gift or a sponsored place: the link to send, ready to share. */
export function GiftSent() {
  const params = useSearchParams();
  const [d, setD] = useState<{ kind: 'gift' | 'sponsor'; code: string; url: string; from: string } | null>(null);
  const [state, setState] = useState<'checking' | 'ready' | 'error'>('checking');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const id = params.get('session_id');
    if (!id) { setState('error'); return; }
    let tries = 0;
    const check = async () => {
      const r = await fetch(`/api/gift/sent?session_id=${encodeURIComponent(id)}`).catch(() => null);
      const j = r ? await r.json().catch(() => ({})) : {};
      if (r?.ok && j.paid) { setD(j); setState('ready'); }
      else if (r?.status === 202 && tries++ < 10) setTimeout(check, 2000);
      else setState('error');
    };
    check();
  }, [params]);

  if (state === 'checking') return <div className="py-24 text-center" style={{ color: '#B5B2AC' }}>Confirming your payment…</div>;
  if (state === 'error' || !d) return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <h1 className="font-heading text-3xl mb-3" style={{ color: '#F0E8D8' }}>We couldn&rsquo;t confirm the payment yet.</h1>
      <p className="mb-8" style={{ color: '#B5B2AC' }}>If you were charged, your gift link is on its way by email. Refresh this page, or email salam@quroots.com.</p>
    </div>
  );

  const text = `I got you something: a 30-day path to understand every word of your salah, root by root. Open it here: ${d.url}`;
  const copy = async () => { try { await navigator.clipboard.writeText(d.url); setCopied(true); } catch { /* select instead */ } };

  return (
    <div className="max-w-xl mx-auto px-5 py-16 text-center">
      <p className="font-arabic text-4xl mb-4" style={{ color: GOLD }} dir="rtl" lang="ar">جَزَاكُمُ ٱللَّهُ خَيْرًا</p>
      {d.kind === 'gift' ? (
        <>
          <h1 className="font-heading text-4xl mb-3" style={{ color: '#F0E8D8' }}>Your gift is ready.</h1>
          <p className="text-[16px] leading-relaxed mb-8" style={{ color: '#B5B2AC' }}>Send this link to the person it&rsquo;s for. When they open it, all 30 days are theirs. It works once.</p>
          <div className="rounded-2xl p-4 mb-4 text-[15px] break-all select-all" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(212,162,70,.3)', color: '#F0E8D8' }}>{d.url}</div>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="btn-primary px-6">Send on WhatsApp</a>
            <button onClick={copy} className="px-6 py-2.5 rounded-xl border" style={{ borderColor: 'rgba(212,162,70,.35)', color: GOLD }}>{copied ? 'Copied' : 'Copy link'}</button>
          </div>
          <p className="mt-6 text-[13px]" style={{ color: '#8F8C86' }}>We&rsquo;ve emailed you the link too. Gift code {d.code}.</p>
        </>
      ) : (
        <>
          <h1 className="font-heading text-4xl mb-3" style={{ color: '#F0E8D8' }}>You&rsquo;ve given someone their salah.</h1>
          <p className="text-[16px] leading-relaxed mb-8" style={{ color: '#B5B2AC' }}>The next person who writes to us saying they can&rsquo;t afford the path will get your place. May Allah reward you for every word they come to understand.</p>
          <Link href="/salah" className="btn-primary inline-block px-8">Back to QuRoots</Link>
        </>
      )}
    </div>
  );
}
