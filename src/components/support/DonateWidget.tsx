'use client';

import { useState } from 'react';

const PRESETS = [5, 10, 25, 50]; // dollars
const GOLD = '#D4A246';

/**
 * Self-contained donation control: preset amounts + a custom field, then a
 * button that creates a Stripe Checkout Session and redirects. Works whether or
 * not the visitor is signed in (anonymous gifts are allowed).
 */
export function DonateWidget({ defaultAmount = 10 }: { defaultAmount?: number }) {
  const [preset, setPreset] = useState<number>(defaultAmount);
  const [custom, setCustom] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = custom.trim() ? Number(custom) : preset;

  async function donate() {
    if (!Number.isFinite(amount) || amount < 1) {
      setError('Please enter an amount of at least $1.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Could not start checkout.');
        setLoading(false);
      }
    } catch {
      setError('Could not start checkout.');
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {PRESETS.map((amt) => {
          const active = !custom.trim() && preset === amt;
          return (
            <button
              key={amt}
              onClick={() => { setPreset(amt); setCustom(''); setError(null); }}
              className="py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
              style={active
                ? { background: 'rgba(212,162,70,0.16)', color: GOLD, border: `1px solid ${GOLD}` }
                : { background: 'rgba(255,255,255,0.04)', color: '#D6CDBB', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              ${amt}
            </button>
          );
        })}
      </div>

      <div
        className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${custom.trim() ? GOLD : 'rgba(255,255,255,0.08)'}` }}
      >
        <span className="text-sm" style={{ color: '#78716C' }}>$</span>
        <input
          type="number" min={1} inputMode="decimal" placeholder="Other amount"
          value={custom}
          onChange={(e) => { setCustom(e.target.value); setError(null); }}
          className="flex-1 bg-transparent text-sm outline-none"
          style={{ color: '#F0E4CA' }}
        />
      </div>

      <button
        onClick={donate}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
        style={{ background: GOLD, color: '#1A1712' }}
      >
        {loading ? 'Redirecting…' : `Donate $${Number.isFinite(amount) && amount > 0 ? amount : ''}`}
        {!loading && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        )}
      </button>
      {error && <p className="text-xs mt-2 text-center" style={{ color: '#E08A8A' }}>{error}</p>}
    </div>
  );
}
