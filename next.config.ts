import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // next/image may fetch and resize images from Sanity's CDN (team photos,
    // logos). The resized images are served from this site's own domain.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' }],
  },
};

export default nextConfig;
