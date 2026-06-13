// Runs on the Edge runtime before every request that matches the config below.
// Its sole job is i18n routing: the App Router doesn't support the `i18n` key
// in next.config.ts (that's Pages Router only), so we handle locale prefixing
// here instead.
//
// Renamed from middleware.ts → proxy.ts in Next.js 16 (the "middleware"
// file convention was deprecated; "proxy" is the new name).

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, type Locale } from '@/lib/content';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bare root → default locale. All real content lives under /en or /de.
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/en', request.url));
  }

  // Already has a valid locale prefix — nothing to do.
  const hasLocale = locales.some((l) => pathname.startsWith(`/${l}`));
  if (hasLocale) return NextResponse.next();

  // Path has no locale prefix (e.g. a direct deep link or a misconfigured
  // external link). Do a best-effort sniff of the browser's preferred language;
  // fall back to English. This is intentionally simple — full locale
  // negotiation can be added here later if needed.
  const preferredLocale: Locale =
    (request.headers.get('accept-language')?.slice(0, 2) as Locale | undefined) === 'de'
      ? 'de'
      : 'en';

  return NextResponse.redirect(new URL(`/${preferredLocale}${pathname}`, request.url));
}

export const config = {
  // Run on all paths except Next.js internals, favicon, static assets,
  // and the embedded Sanity Studio (which manages its own routing internally).
  matcher: ['/((?!_next|favicon.ico|studio|.*\\..*).*)'],
};
