'use client';

import { INSTAGRAM_URL } from '@/lib/site';
import LanguageToggle from './LanguageToggle';

export default function FooterBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-beige pb-[env(safe-area-inset-bottom)]">
      <div className="h-px w-full origin-top bg-coral [transform:scaleY(0.5)]" />
      <div className="flex items-center justify-between px-3 py-2 md:px-5">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="w-[26px] h-[26px] flex items-center justify-center rounded-full bg-coral text-beige hover:opacity-70 transition-opacity"
        >
          <svg
            /* 16px inside the 26px circle = whole-pixel 5px margins all
               around; fractional margins render off-center at mobile DPRs */
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
        </a>
        <LanguageToggle />
      </div>
    </div>
  );
}
