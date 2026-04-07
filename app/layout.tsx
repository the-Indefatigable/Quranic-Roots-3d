import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import localFont from 'next/font/local';
import Script from 'next/script';
import { Suspense } from 'react';
import { NavigationProgress } from '@/components/ui/NavigationProgress';
import { GlobalAudioProvider } from '@/components/GlobalAudioProvider';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// Fraunces — variable display serif with optical sizing & ink traps.
// SOFT=0 (sharper terminals), opsz auto-adapts at large sizes.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-dm-serif',
  weight: ['400', '500', '600', '700', '900'],
  style: ['normal', 'italic'],
  axes: ['SOFT', 'opsz'],
  display: 'swap',
});

const uthmani = localFont({
  src: '../public/fonts/UthmanicHafs1Ver18.woff2',
  variable: '--font-uthmani',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0C0A09',
};

export const metadata: Metadata = {
  title: {
    default: 'QuRoots — Quranic Arabic Learning Platform',
    template: '%s | QuRoots',
  },
  description: 'Explore Quranic Arabic roots, read the Quran word-by-word, and study verb conjugations and morphology. A comprehensive platform for learning Quranic Arabic.',
  keywords: ['Quranic Arabic', 'Arabic verb roots', 'learn Quran Arabic', 'Arabic conjugation', 'Arabic morphology', 'sarf', 'Quran reader', 'word by word Quran', 'Quranic vocabulary'],
  authors: [{ name: 'QuRoots' }],
  metadataBase: new URL('https://quroots.com'),
  openGraph: {
    type: 'website',
    url: 'https://quroots.com/',
    siteName: 'QuRoots',
    title: 'QuRoots — Quranic Arabic Learning Platform',
    description: 'Explore Quranic Arabic roots, read the Quran word-by-word, and study verb conjugations and morphology.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QuRoots — Quranic Arabic Learning Platform',
    description: 'Explore Quranic Arabic roots, read the Quran word-by-word, and study verb conjugations and morphology.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'QuRoots',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://quroots.com/#website',
        'url': 'https://quroots.com/',
        'name': 'QuRoots',
        'description': 'Explore Quranic Arabic roots, read the Quran, and study verb conjugations.',
        'publisher': {
          '@type': 'Organization',
          'name': 'QuRoots',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://quroots.com/icon-512.png',
          },
        },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://quroots.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://quroots.com/#application',
        'name': 'QuRoots — Quranic Arabic Learning Platform',
        'applicationCategory': 'EducationalApplication',
        'operatingSystem': 'Any',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
        'description': 'A comprehensive platform for learning Quranic Arabic through root exploration, word-by-word Quran reading, and verb conjugation study.',
      },
    ],
  };

  return (
    <html lang="en" className={`dark ${jakarta.variable} ${fraunces.variable} ${uthmani.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-canvas font-sans text-text antialiased">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <GlobalAudioProvider>
          {children}
        </GlobalAudioProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XFLPNVR8VQ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XFLPNVR8VQ');
          `}
        </Script>
      </body>
    </html>
  );
}
