'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from '@/i18n/navigation';
import { pageTypeFromPath, trackCtaClick, trackEmailClick } from '@/lib/analytics';

// One document-level click delegate, mounted once in the layout ONLY when GA4
// is configured. It lets server components stay server components: they only
// gain inert `data-analytics` attributes, and this client listener reads them.
//
//   cta_click   — any element with data-analytics="cta_click", reading
//                 data-analytics-service, data-analytics-cta-text,
//                 data-analytics-position.
//   email_click — any `a[href^="mailto:"]` (position from data-analytics-position,
//                 default "footer"); skipped when the anchor is inside a
//                 [data-analytics-skip] region (e.g. the brief mailto fallback,
//                 which reports brief_mailto_fallback instead).
//
// page_type is derived centrally from the route, so individual elements never
// need to repeat it. The handler never throws and never calls preventDefault,
// so navigation is untouched.
export default function AnalyticsListener() {
  const pathname = usePathname();
  // Keep the latest path in a ref so the once-attached handler always reads it.
  const pathRef = useRef(pathname);
  useEffect(() => {
    pathRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      try {
        const target = event.target;
        if (!(target instanceof Element)) return;

        // 1) Explicit CTA elements.
        const cta = target.closest('[data-analytics="cta_click"]');
        if (cta instanceof HTMLElement) {
          const data = cta.dataset;
          const rawText = data.analyticsCtaText ?? cta.textContent ?? '';
          const ctaText = rawText.replace(/→/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
          trackCtaClick({
            page_type: pageTypeFromPath(pathRef.current),
            service: data.analyticsService || undefined,
            cta_text: ctaText,
            position: data.analyticsPosition || 'unknown',
          });
          return;
        }

        // 2) Email links — never read the address, only page_type + position.
        const mailto = target.closest('a[href^="mailto:"]');
        if (mailto instanceof HTMLAnchorElement) {
          if (mailto.closest('[data-analytics-skip]')) return;
          trackEmailClick({
            page_type: pageTypeFromPath(pathRef.current),
            position: mailto.dataset.analyticsPosition || 'footer',
          });
        }
      } catch {
        // A listener must never break the page.
      }
    }

    // Capture phase so the event is recorded before a client-side navigation.
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  return null;
}
