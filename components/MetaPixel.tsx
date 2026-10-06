'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
/* next/navigation, deliberately not @/i18n/navigation: the i18n helper
   strips the locale prefix, so switching pl -> en on the same page would
   report an unchanged pathname and no PageView. All this effect wants is a
   raw "the document path changed" signal, prefix included. */
import { usePathname } from 'next/navigation';
import { consentStatus, subscribeConsentStatus } from '@/lib/analytics';
import {
  isMetaPixelLoaded,
  loadMetaPixel,
  metaTrack,
  setMetaConsent,
} from '@/lib/meta-pixel';
import { META_PIXEL_ID } from '@/lib/site';

/* pnpm dev must never reach the live dataset, and NEXT_PUBLIC_META_PIXEL_ID=""
   is the documented kill switch. Note the guard is on 'development' and not
   on !== 'production': vitest runs with NODE_ENV 'test', so the consent-gate
   test still drives the real code path, and Vercel previews build as
   production on purpose so Events Manager Test Events work before a
   production deploy. */
const PIXEL_DISABLED = process.env.NODE_ENV === 'development' || META_PIXEL_ID === '';

/* Meta Pixel lifecycle: consent gate + router-driven PageView. Renders
   nothing; mounted once in app/[locale]/layout.tsx.

   The gate is PostHog's single consent store (lib/analytics.ts) — the same
   "akceptuję" the privacy policy's adsBody promises the ad tooling waits
   for. There is no second banner and no second stored decision.

   Design: docs/superpowers/specs/2026-08-27-meta-pixel-capi-design.md */
export default function MetaPixel() {
  /* Server snapshot is null, so SSR renders inert and the first client
     render agrees with it — the pattern CookieBanner.tsx uses. */
  const status = useSyncExternalStore(
    subscribeConsentStatus,
    () => consentStatus(),
    () => null,
  );
  const pathname = usePathname();

  /* The last path reported to Meta. null means "nothing reported yet", so
     the first path after a grant always produces exactly one PageView —
     including a mid-page accept, where consent changes but the path does
     not. */
  const reportedPathRef = useRef<string | null>(null);
  const revokedRef = useRef(false);

  useEffect(() => {
    if (PIXEL_DISABLED) return;

    if (status === 'granted') {
      loadMetaPixel(META_PIXEL_ID);
      if (revokedRef.current) {
        setMetaConsent(true);
        revokedRef.current = false;
      }
      if (reportedPathRef.current !== pathname) {
        reportedPathRef.current = pathname;
        metaTrack('PageView');
      }
      return;
    }

    /* Consent withdrawn after a grant. The script cannot be taken back out
       of the document, so mute it and forget the reported path — a later
       re-grant then re-reports the page the visitor is on. */
    if (isMetaPixelLoaded() && !revokedRef.current) {
      setMetaConsent(false);
      revokedRef.current = true;
      reportedPathRef.current = null;
    }
  }, [status, pathname]);

  return null;
}
