import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Auto-start the data watcher in dev so verbsData.json changes
// instantly regenerate index.json + roots/*.json without any manual step.
if (process.env.NODE_ENV === 'development') {
  const watcher = spawn('node', [join(__dirname, 'scripts/watch-data.mjs')], {
    stdio: 'inherit',
    detached: false,
  });
  watcher.on('error', (e) => console.error('[watch-data] failed to start:', e.message));
  process.on('exit', () => watcher.kill());
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  experimental: {
    esmExternals: 'loose',
  },
};

export default nextConfig;
