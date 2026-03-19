import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import localFont from 'next/font/local';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const scheherazade = localFont({
  src: '../public/fonts/ScheherazadeNew-Regular.ttf',
  variable: '--font-scheherazade',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#000000',
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
  alternates: { canonical: '/' },
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
    <html lang="en" className={`${inter.variable} ${scheherazade.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
