'use client';

import { useTranslations } from 'next-intl';
import { INSTAGRAM_URL } from '@/lib/site';
import { openCookieSettings, track } from '@/lib/analytics';
import CookieBanner from './CookieBanner';
import FooterHairline from './FooterHairline';
import LanguageToggle from './LanguageToggle';
import ScrollDot from './ScrollDot';

export default function FooterBar() {
  const t = useTranslations('cookies');

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-transparent pb-[env(safe-area-inset-bottom)]">
      {/* data-footer-line is the landing target the navbar dot measures
          against for the idle drop (components/Navbar.tsx). The h-px box is
          layout only — unchanged, so the measured top is unchanged; the half
          pixel of coral inside it is now drawn by FooterHairline, which can
          bend where the dot strikes it. */}
      <div data-footer-line className="relative h-px w-full">
        <FooterHairline />
        {/* Reading progress rides the same line, on every page. Absolutely
            positioned and painted after the hairline: it adds nothing to this
            box's rect, which the idle drop measures, and it sits above the
            coral half-pixel but still under the nav (z-50), so the falling
            dot passes in front of it. */}
        <ScrollDot />
      </div>
      <div className="flex items-center justify-between px-3 py-2 md:px-5">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          onClick={() => track('instagram_click', { placement: 'footer' })}
          className="group w-11 h-11 md:w-[26px] md:h-[26px] flex items-center justify-center"
        >
          <span className="w-[26px] h-[26px] flex items-center justify-center rounded-full bg-coral text-beige transition-opacity group-hover:opacity-70">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="block"
              aria-hidden="true"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </span>
        </a>
        {/* Not position:relative — the cookie card's mobile max-md:absolute
            anchors to the fixed bar itself, so it can center over the
            whole viewport instead of this right-hand cluster */}
        <div className="flex items-center gap-2 md:gap-3">
          <CookieBanner />
          <button
            onClick={openCookieSettings}
            className="flex min-h-11 md:min-h-[26px] items-center text-[11px] font-[600] lowercase text-coral hover:opacity-70 transition-opacity"
          >
            {t('settings')}
          </button>
          <LanguageToggle />
        </div>
      </div>
    </div>
  );
}
