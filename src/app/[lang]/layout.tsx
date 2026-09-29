// Root layout for the public site — renders the HTML shell plus the site chrome
// (fixed header + footer) around every page under /en/* and /de/*. The [lang]
// segment is the i18n routing mechanism: all content pages nest inside this
// folder so they automatically inherit the locale without needing to read it
// themselves from the URL.
//
// This is a root layout (it renders <html>) rather than nesting inside
// app/layout.tsx, because only here do we know the locale for <html lang>.
// The embedded Studio has its own root layout in app/studio/layout.tsx.
// Note: navigating between the two root layouts triggers a full page load.

import type { Metadata } from 'next';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { locales, type Locale } from '@/lib/content';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Kaspar 2028',
  description:
    "A radical reimagining of Peter Handke's Kaspar at Residenztheater München — integrating AI into live performance.",
  manifest: '/site.webmanifest',
};

type Props = {
  children: React.ReactNode;
  // In Next.js 15+ the params prop is a Promise — always await it.
  params: Promise<{ lang: string }>;
};

// Tells Next.js which locale values to pre-render at build time.
// Without this, static generation wouldn't know to produce /en and /de variants.
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: Props) {
  const { lang } = await params;
  // Guard against any unexpected locale value arriving via the URL; fall back
  // to English rather than crashing or serving empty content.
  const locale: Locale = lang === 'de' ? 'de' : 'en';

  return (
    <html lang={locale}>
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
      <body>
        {/* Header is position:fixed (see globals.css .site-header). Pages handle
            their own top-padding via .page-title-header or the teaser height. */}
        <header className="site-header">
          <nav className="main-navigation">
            <div className="logo">
              <Link href={`/${locale}`}>Kaspar 2028</Link>
            </div>
            {/* Navigation is a client component — needs useState for the hamburger
                and usePathname for active-link detection. */}
            <Navigation lang={locale} />
          </nav>
        </header>

        {/* Pages render their own full-bleed teaser or page-title-header before
            their <main> — the layout doesn't add any wrapper around children. */}
        {children}

        <footer className="site-footer">
          <div className="main-footer">
            <span className="footer-copyright">
              &copy; {new Date().getFullYear()} Kaspar 2028 |
              <Link href={`/${locale}/impressum`} className="footer-link">
                {locale === 'de' ? ' Impressum' : ' Imprint'}
              </Link>
            </span>

          </div>
        </footer>
      </body>
    </html>
  );
}
