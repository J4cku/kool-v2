import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n/request';

const intlProxy = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
  localeDetection: false
});

export default function proxy(request: NextRequest) {
  /* skipTrailingSlashRedirect in next.config.mjs (required by the /dot
     PostHog proxy, whose endpoints use trailing slashes) disables Next's
     sitewide slash normalization — restore it here for page routes. /dot/*
     never reaches this handler (excluded in the matcher below). */
  const { pathname } = request.nextUrl;
  if (pathname !== '/' && pathname.endsWith('/')) {
    /* plain URL, not nextUrl.clone() — NextURL remembers the original
       trailing slash and re-appends it when serializing the Location */
    const url = new URL(request.url);
    url.pathname = pathname.replace(/\/+$/, '');
    return NextResponse.redirect(url, 308);
  }
  return intlProxy(request);
}

export const config = {
  // "dot" is the PostHog proxy prefix (next.config.mjs rewrites) — without
  // the exclusion this middleware would locale-redirect analytics requests
  matcher: ['/((?!api|dot|_next|_vercel|.*\\..*).*)']
};
