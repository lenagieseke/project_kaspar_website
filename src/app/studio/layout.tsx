// Root layout for the embedded Sanity Studio at /studio. Kept separate from the
// public site's layout (app/[lang]/layout.tsx) so the Studio doesn't load the
// site's global CSS, fonts, header or footer.

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kaspar 2028 — Studio',
  robots: { index: false },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
