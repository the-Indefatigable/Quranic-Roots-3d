/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  staticPageGenerationTimeout: 120,
  webpack: (config, { dev }) => {
    if (dev) {
      // Use in-memory cache to avoid the persistent cache ENOENT bug in Next 14.2
      config.cache = { type: 'memory' };
    }
    return config;
  },
  // Redirect old static JSON paths (pre-DB-migration) so stale browser caches
  // get a clean reload instead of a confusing 404.
  async redirects() {
    return [
      {
        source: '/data/:path*',
        destination: '/',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "media-src 'self' https://everyayah.com https://audio.qurancdn.com https://verses.quran.com https://download.quranicaudio.com",
              "connect-src 'self' https://www.google-analytics.com https://everyayah.com https://api.quran.com https://audio.qurancdn.com",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
