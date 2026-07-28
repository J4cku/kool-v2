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
  /* Compute one normalized target and redirect a single time, so e.g.
     /projekty/ collapses straight to /pl/projekty instead of hopping
     /projekty/ → /projekty → /pl/projekty. Two normalizations feed it:

     1. Trailing-slash strip: skipTrailingSlashRedirect in next.config.mjs
        (required by the /dot PostHog proxy, whose endpoints use trailing
        slashes) disables Next's sitewide slash normalization, so we redo
        it here for page routes. /dot/* never reaches this handler (excluded
        in the matcher below). */
  const { pathname } = request.nextUrl;
  let target = pathname !== '/' && pathname.endsWith('/')
    ? pathname.replace(/\/+$/, '')
    : pathname;
  /* 2. Locale prefix: send unprefixed paths to /pl/... ourselves. next-intl's
        built-in unprefixed→locale redirect is a 307 (temporary), and Google
        keeps the source of a temporary redirect as canonical — that made it
        pick the pre-i18n unprefixed URLs over /pl/... (the GSC duplicate-
        canonical issue). A permanent 308 is only safe here because
        localeDetection is false: every visitor gets the same /pl target, so
        there is nothing locale-dependent to keep temporary. The regex needs a
        / or end-of-string after the locale so /plfoo is not mistaken for a
        prefixed path. */
  if (!/^\/(?:pl|en)(?:\/|$)/.test(target)) {
    target = target === '/' ? '/pl' : `/pl${target}`;
  }
  if (target !== pathname) {
    /* plain URL, not nextUrl.clone() — NextURL remembers the original
       trailing slash and re-appends it when serializing the Location */
    const url = new URL(request.url);
    url.pathname = target;
    return NextResponse.redirect(url, 308);
  }
  return intlProxy(request);
}

export const config = {
  // "dot" is the PostHog proxy prefix (next.config.mjs rewrites) — without
  // the exclusion this middleware would locale-redirect analytics requests
  matcher: ['/((?!api|dot|_next|_vercel|.*\\..*).*)']
};
