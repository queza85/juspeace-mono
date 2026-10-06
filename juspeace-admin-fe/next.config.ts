import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Cursor's browser loads the dev server as 127.0.0.1, which Next treats
  // as a different host from localhost and blocks /_next assets (blank page).
  allowedDevOrigins: ['127.0.0.1'],
};

export default nextConfig;
