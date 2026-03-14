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
  metadataBase: new URL('https://quranicroots.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://quranicroots.com/',
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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Quranic Verbs',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap" rel="stylesheet" />
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
