'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'quroots.analytics-consent';

type Consent = 'granted' | 'denied' | null;

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

/**
 * Google Analytics, loaded only after the visitor has agreed.
 *
 * Previously the GA scripts were in the root layout and ran on first paint for
 * everyone, with no way to decline — which is the thing GDPR/PECR actually
 * prohibits, since analytics cookies are not strictly necessary.
 *
 * The measurement id comes from NEXT_PUBLIC_GA_ID so staging doesn't report
 * into production analytics; with no id set, nothing loads and no banner shows.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setConsent(readConsent());
    setReady(true);
  }, []);

  const choose = (value: Exclude<Consent, null>) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* storage unavailable — the choice just won't persist */
    }
    setConsent(value);
  };

  if (!gaId) return null;

  return (
    <>
      {consent === 'granted' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {/* Only render the banner once we know there is no stored choice, so it
          doesn't flash for returning visitors who already decided. */}
      {ready && consent === null && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Analytics consent"
          className="fixed z-[70] left-4 right-4 bottom-4 sm:left-6 sm:right-auto sm:max-w-md rounded-2xl border p-4 shadow-xl"
          style={{ background: '#1C1B19', borderColor: 'rgba(212,162,70,0.22)' }}
        >
          <p className="text-sm font-semibold text-text mb-1">Analytics</p>
          <p className="text-xs leading-relaxed text-text-secondary mb-3">
            We&rsquo;d like to use Google Analytics to see which parts of QuRoots are used, so we
            know what to improve. It&rsquo;s entirely optional — the site works the same either
            way.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => choose('granted')}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-primary text-black hover:opacity-90 transition-opacity"
            >
              Allow
            </button>
            <button
              onClick={() => choose('denied')}
              className="px-3.5 py-2 rounded-xl text-xs font-medium text-text-secondary hover:text-text transition-colors"
            >
              No thanks
            </button>
            <a
              href="/privacy"
              className="ml-auto text-[11px] text-text-tertiary hover:text-text-secondary transition-colors"
            >
              Privacy
            </a>
          </div>
        </div>
      )}
    </>
  );
}
