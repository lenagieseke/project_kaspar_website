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
import { Inter, Libre_Caslon_Display } from 'next/font/google';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackToTop from '@/components/BackToTop';
import Navigation from '@/components/Navigation';
import { getContent, isLocale, locales, subNavItems } from '@/lib/content';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Kaspar 2028',
  description:
    "A radical reimagining of Peter Handke's Kaspar at Residenztheater München — integrating AI into live performance.",
  manifest: '/site.webmanifest',
};

// Fonts are downloaded at build time and served from this site (next/font),
// so visitors' browsers never contact Google — no IP address is passed to a
// third party (relevant under GDPR). The CSS variables are used in globals.css
// and by the teaser canvas.
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  // Real italics for emphasis in the rich text (otherwise the browser
  // slants the upright font artificially).
  style: ['normal', 'italic'],
  variable: '--font-body',
});
const caslon = Libre_Caslon_Display({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
});

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
  // Only /en and /de exist — anything else (e.g. /english, /fr) is a 404
  // rather than silently rendering English content under a wrong URL.
  if (!isLocale(lang)) notFound();
  const locale = lang;
  // Section submenus in the navigation. Same (cached) query as the pages use.
  const subNav = subNavItems(await getContent(locale));

  return (
    <html lang={locale} className={`${inter.variable} ${caslon.variable}`}>
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
            <Navigation lang={locale} subNav={subNav} />
          </nav>
        </header>

        {/* Pages render their own full-bleed teaser or page-title-header before
            their <main> — the layout doesn't add any wrapper around children. */}
        {children}

        {/* data-teaser-obstacle: on the home page, the footer acts as the floor
            of the teaser's physics world (ignored on all other pages). */}
        <footer className="site-footer" data-teaser-obstacle>
          <div className="main-footer">
            <span className="footer-copyright">
              &copy; {new Date().getFullYear()} Kaspar 2028 |
              <Link href={`/${locale}/impressum`} className="footer-link">
                {locale === 'de' ? ' Impressum & Datenschutz' : ' Imprint & Privacy'}
              </Link> | 
              {locale === 'de'
                ? ' Scraping oder Nutzung für KI-Training untersagt.'
                : ' Scraping or use in AI training prohibited.'}
            </span>
          </div>
        </footer>

        <BackToTop lang={locale} />
      </body>
    </html>
  );
}
