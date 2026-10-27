import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import { NavigationProgress } from '@/components/ui/NavigationProgress';
import { GlobalAudioProvider } from '@/components/GlobalAudioProvider';
import { Atmosphere } from '@/components/ui/Atmosphere';
import { Analytics } from '@/components/ui/Analytics';
import { Tracker } from '@/components/ui/Tracker';
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
  style: ['normal', 'italic'],
  axes: ['SOFT', 'opsz'],
  display: 'swap',
});

const uthmani = localFont({
  src: '../public/fonts/UthmanicHafs1Ver18.woff2',
  variable: '--font-uthmani',
  display: 'swap',
});

// For everyday (non-Quranic) Arabic: the Uthmani font draws punctuation like ، as Quran ornaments.
const scheherazade = localFont({
  src: [
    { path: '../public/fonts/ScheherazadeNew-Regular.ttf', weight: '400' },
    { path: '../public/fonts/ScheherazadeNew-Bold.ttf', weight: '700' },
  ],
  variable: '--font-arabic-text',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: '#0C0A09',
};

export const metadata: Metadata = {
  title: {
    default: 'QuRoots (Quran Roots): Understand the Arabic of the Quran, Root by Root',
    template: '%s | QuRoots',
  },
  description: 'QuRoots (Quran Roots) teaches the Arabic roots behind every word of the Quran: understand your salah in 30 days, read word by word, and explore all 1,716 Quranic roots.',
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
        'alternateName': ['Quran Roots', 'QuranRoots', 'Qu Roots'],
        'description': 'Understand the Arabic of the Quran, root by root.',
        'publisher': { '@id': 'https://quroots.com/#organization' },
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://quroots.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://quroots.com/#organization',
        'name': 'QuRoots',
        'alternateName': ['Quran Roots', 'QuranRoots'],
        'url': 'https://quroots.com/',
        'logo': { '@type': 'ImageObject', 'url': 'https://quroots.com/icon-512.png' },
        'founder': { '@type': 'Person', 'name': 'Mohammad Alam' },
        'sameAs': ['https://www.youtube.com/@Quroots', 'https://www.instagram.com/quroots', 'https://www.tiktok.com/@quroots'],
      },
      {
        '@type': 'Course',
        '@id': 'https://quroots.com/salah#course',
        'name': 'Understand your salah in 30 days',
        'description': 'Learn the Arabic roots behind Al-Fatiha and the short surahs you pray with, two or three a day, until you understand every word of your salah.',
        'url': 'https://quroots.com/salah',
        'provider': { '@id': 'https://quroots.com/#organization' },
        'inLanguage': 'en',
        'isAccessibleForFree': false,
        'offers': { '@type': 'Offer', 'price': '29', 'priceCurrency': 'USD', 'category': 'Paid', 'url': 'https://quroots.com/salah' },
        'hasCourseInstance': { '@type': 'CourseInstance', 'courseMode': 'Online', 'courseWorkload': 'PT5M' },
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
    <html lang="en" className={`dark ${jakarta.variable} ${fraunces.variable} ${uthmani.variable} ${scheherazade.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-canvas font-sans text-text antialiased">
        <Atmosphere />
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <GlobalAudioProvider>
          <div className="relative z-10">{children}</div>
        </GlobalAudioProvider>
        {/* Loads GA only after the visitor opts in — see the component. */}
        <Analytics />
        <Tracker />
      </body>
    </html>
  );
}
