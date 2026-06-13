// Root layout — wraps every page with the HTML shell.
// Fonts and global CSS live here so they're loaded once for the whole app.

import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Kaspar 2028',
  description:
    "A radical reimagining of Peter Handke's Kaspar at Residenztheater München — integrating AI into live performance.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // lang is hardcoded here because the <html> element must be in the root
    // layout, which doesn't have access to the [lang] route segment. The actual
    // locale is handled by the [lang] folder and passed through the component
    // tree. If proper lang attributes matter for accessibility/SEO, a middleware
    // approach setting a response header can be used to infer it here.
    <html lang="en">
      <head>
        {/* Google Fonts via <link> rather than next/font because Libre Caslon
            Display is not available in the next/font/google package. Inter could
            be migrated to next/font for self-hosting and zero layout shift, but
            keeping both in one stylesheet request is simpler for now. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Inter:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
