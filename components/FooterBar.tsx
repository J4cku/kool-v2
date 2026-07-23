'use client';

import { useTranslations } from 'next-intl';
import { INSTAGRAM_URL } from '@/lib/site';
import { openCookieSettings, track } from '@/lib/analytics';
import CookieBanner from './CookieBanner';
import LanguageToggle from './LanguageToggle';

export default function FooterBar() {
  const t = useTranslations('cookies');

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-transparent pb-[env(safe-area-inset-bottom)]">
      <div className="h-px w-full origin-top bg-coral [transform:scaleY(0.5)]" />
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
        <div className="relative flex items-center gap-2 md:gap-3">
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
