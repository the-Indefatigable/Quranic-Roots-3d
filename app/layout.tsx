import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#050510',
};

export const metadata: Metadata = {
  title: 'Quranic Verb Roots — Interactive 3D Arabic Verb Explorer',
  description: 'Explore 943 Quranic Arabic verb roots in an interactive 3D space. Study Arabic verb conjugations, morphology (sarf), and meanings from the Quran. Learn Quranic vocabulary with full conjugation tables for all verb forms.',
  keywords: ['Quranic Arabic', 'Arabic verb roots', 'learn Quran Arabic', 'Arabic conjugation', 'Arabic morphology', 'sarf', 'Arabic verb forms', 'Quranic vocabulary', 'Arabic grammar', 'verb conjugation tables', 'Islamic Arabic', 'Quran study'],
  authors: [{ name: 'Quranic Roots Explorer' }],
  metadataBase: new URL('https://quroots.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://quroots.com/',
    siteName: 'Quranic Roots Explorer',
    title: 'Quranic Verb Roots — Interactive 3D Arabic Verb Explorer',
    description: 'Explore 943 Quranic Arabic verb roots in an interactive 3D space. Study verb conjugations, morphology, and meanings directly from the Quran.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quranic Verb Roots — Interactive 3D Arabic Verb Explorer',
    description: 'Explore 943 Quranic Arabic verb roots in an interactive 3D space. Study verb conjugations, morphology, and meanings directly from the Quran.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
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
    title: 'Quranic Verbs',
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
        'name': 'Quranic Roots Explorer',
        'description': 'Explore 943 Quranic Arabic verb roots in an interactive 3D space.',
        'publisher': {
          '@type': 'Organization',
          'name': 'Quranic Roots Explorer',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://quroots.com/icon-512.png'
          }
        }
      },
      {
        '@type': 'SoftwareApplication',
        '@id': 'https://quroots.com/#application',
        'name': 'Quranic Verb Roots — Interactive 3D Arabic Verb Explorer',
        'applicationCategory': 'EducationalApplication',
        'operatingSystem': 'Any',
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD'
        },
        'description': 'Interactive 3D visualization of Quranic Arabic verb roots, studying Arabic verb conjugations, morphology (sarf), and meanings from the Quran.'
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
