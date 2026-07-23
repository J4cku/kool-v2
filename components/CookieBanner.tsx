'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  acceptCookies,
  consentStatus,
  declineCookies,
  onCookieSettingsOpen,
  subscribeConsentStatus,
} from '@/lib/analytics';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* Consent controls shown while PostHog's on_reject consent is pending, and
   re-openable at any time via openCookieSettings() (FooterBar "cookies"
   link, privacy page). Rendered inside FooterBar's right-hand group: inline
   as a single footer line from md up, and as a compact card floating above
   the bar on mobile (anchored to the group via max-md:absolute). Reuses the
   hero project-folio treatment: translucent beige, backdrop blur. */
export default function CookieBanner() {
  const t = useTranslations('cookies');
  const reduceMotion = useReducedMotion();
  /* Server snapshot is null so SSR renders nothing; after hydration the
     client snapshot reflects posthog's stored consent state and updates on
     accept/decline, cross-tab storage events, and posthog init (see
     subscribeConsentStatus). */
  const status = useSyncExternalStore(
    subscribeConsentStatus,
    () => consentStatus(),
    () => null,
  );
  const [reopened, setReopened] = useState(false);
  /* AnimatePresence keeps the bar interactive during its exit animation —
     ignore clicks once a choice was made so a second click can't silently
     flip the just-recorded consent. */
  const choseRef = useRef(false);

  useEffect(() => onCookieSettingsOpen(() => setReopened(true)), []);

  const visible = reopened || status === 'pending';

  useEffect(() => {
    if (visible) {
      choseRef.current = false;
    }
  }, [visible]);

  const choose = (accepted: boolean) => {
    if (choseRef.current) {
      return;
    }
    choseRef.current = true;
    if (accepted) {
      acceptCookies();
    } else {
      declineCookies();
    }
    setReopened(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          aria-label={t('ariaLabel')}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="max-md:absolute max-md:bottom-full max-md:right-0 max-md:mb-2 max-md:w-[min(330px,calc(100vw-24px))]"
        >
          <div className="bg-beige/40 backdrop-blur-md px-3 py-2 md:py-0 md:flex md:items-center md:gap-3">
            <p className="text-[10px] font-[500] uppercase tracking-[-0.01em] text-dark md:whitespace-nowrap">
              {t('message')}
            </p>
            <div className="flex items-center justify-between gap-4 md:contents">
              <Link
                href="/polityka-prywatnosci"
                className="whitespace-nowrap text-[10px] font-[500] uppercase tracking-[-0.01em] text-dark underline underline-offset-2 hover:opacity-60 transition-opacity"
              >
                {t('privacy')}
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => choose(true)}
                  className="flex min-h-11 md:min-h-[26px] items-center text-[13px] font-[600] text-coral hover:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                >
                  {t('accept')}
                </button>
                <span aria-hidden="true" className="text-coral text-[13px]">
                  ·
                </span>
                <button
                  onClick={() => choose(false)}
                  className="flex min-h-11 md:min-h-[26px] items-center text-[13px] font-[600] text-coral hover:opacity-60 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
                >
                  {t('decline')}
                </button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
