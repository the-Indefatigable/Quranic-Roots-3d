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
};

export default nextConfig;
