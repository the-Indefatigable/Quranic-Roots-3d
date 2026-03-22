/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
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
};

export default nextConfig;
