// Navigation must be a client component: it uses useState for the mobile
// hamburger toggle and usePathname for active-link detection — both are
// runtime-only hooks unavailable in server components.
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { locales, navItems, type Locale, type SubNavItem } from '@/lib/content';

type Props = {
  lang: Locale;
  // Section links per nav item href (from subNavItems in lib/content.ts).
  // On desktop they open as a dropdown on hover/focus; in the hamburger menu
  // they are listed below their page.
  subNav: Record<string, SubNavItem[]>;
};

// Receives the active locale from the server layout so it doesn't need to
// parse the URL itself — the parent already did that work.
export default function Navigation({ lang, subNav }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Matches exact page or any child route (e.g. /en/news/some-slug is still
  // considered active for the News nav item).
  function isActive(href: string) {
    const full = `/${lang}${href}`;
    return pathname === full || pathname.startsWith(`${full}/`);
  }

  // Remove the locale prefix to get the route-relative path (e.g. /the-project).
  // This is used to build the equivalent URL in the other language without
  // hard-coding any routes — switching from /en/team to /de/team just works.
  const rawRoute = pathname.slice(`/${lang}`.length);

  return (
    <>
      {/* Three bare <span> elements are the hamburger bars. Their open/close
          animation is handled entirely in CSS via .nav-toggle.open rules
          in globals.css — no JS transforms needed. */}
      <button
        className={`nav-toggle${open ? ' open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle navigation"
        aria-expanded={open}
      >
        <span />
        <span />
        <span />
      </button>

      {/* The nav list is always in the DOM; visibility is toggled via CSS
          opacity + pointer-events rather than conditional rendering, so
          transitions work correctly. */}
      <ul className={`nav-list${open ? ' open' : ''}`}>
        {navItems.map((item) => {
          const sections = subNav[item.href] ?? [];
          return (
            <li key={item.href} className={isActive(item.href) ? 'active' : ''}>
              <Link href={`/${lang}${item.href}`} onClick={() => setOpen(false)}>
                {item.label[lang]}
              </Link>
              {sections.length > 0 && (
                <ul className="sub-nav">
                  {sections.map((section) => (
                    <li key={section.anchor}>
                      <Link href={`/${lang}${item.href}#${section.anchor}`} onClick={() => setOpen(false)}>
                        {section.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}

        {/* Language switcher — links to the same page in the other locale.
            Both links are always rendered so the active one can be bolded via
            .lang-active without JS needing to know which is "current". */}
        <li className="lang-switcher">
          {locales.map((l) => (
            <Link
              key={l}
              href={`/${l}${rawRoute}`}
              className={`lang-link${lang === l ? ' lang-active' : ''}`}
              onClick={() => setOpen(false)}
            >
              {l.toUpperCase()}
            </Link>
          ))}
        </li>
      </ul>
    </>
  );
}
