import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // next/image may fetch and resize images from Sanity's CDN (team photos,
    // logos). The resized images are served from this site's own domain.
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' }],
  },
  // Reserves the rights to text and data mining (W3C TDM Reservation Protocol)
  // on every response: a machine-readable version of the "no AI training"
  // note in the footer and imprint. See also src/app/robots.ts.
  async headers() {
    return [{ source: '/:path*', headers: [{ key: 'tdm-reservation', value: '1' }] }];
  },
};

export default nextConfig;
