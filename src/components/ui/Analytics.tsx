import Script from 'next/script';

/**
 * Google Analytics.
 *
 * Loads unconditionally — no consent gate. This is a deliberate product
 * decision: the site needs reliable traffic numbers, and a consent banner
 * typically suppresses 30-70% of measurement. The trade-off is that analytics
 * cookies are set before the visitor is asked, which the UK/EU ePrivacy rules
 * treat as requiring prior consent. See /privacy, which describes this
 * accurately.
 *
 * To go back to opt-in, restore the consent-gated version from git history
 * (commit d53ae4d) — it kept the choice in localStorage and only injected the
 * scripts after "Allow".
 *
 * The id comes from NEXT_PUBLIC_GA_ID when set, else the production property.
 * The fallback matters: this component previously returned null with no id
 * configured, which silently switched analytics off entirely.
 */

const FALLBACK_GA_ID = 'G-XFLPNVR8VQ';

export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID || FALLBACK_GA_ID;

  // Keep preview and local builds out of the production property. Note the
  // comparison is deliberately "is it explicitly a non-production Vercel env" —
  // an unset value still loads, so a missing variable can never silently
  // disable tracking again.
  const vercelEnv = process.env.NEXT_PUBLIC_VERCEL_ENV;
  if (vercelEnv === 'preview' || vercelEnv === 'development') return null;

  if (!gaId) return null;

  return (
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
  );
}
