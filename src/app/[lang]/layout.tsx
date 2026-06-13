// Locale layout — renders the site chrome (fixed header + footer) around every
// page under /en/* and /de/*. The [lang] segment is the i18n routing mechanism:
// all content pages nest inside this folder so they automatically inherit the
// locale without needing to read it themselves from the URL.

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { locales, type Locale } from '@/lib/content';

type Props = {
  children: React.ReactNode;
  // In Next.js 15 the params prop is a Promise — always await it.
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
    <>
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
    </>
  );
}
