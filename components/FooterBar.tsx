'use client';

import LanguageToggle from './LanguageToggle';

export const INSTAGRAM_URL = 'https://www.instagram.com/kool.studio/';

export default function FooterBar() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="px-3 md:px-5 py-2 flex items-center justify-between">
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="w-[26px] h-[26px] flex items-center justify-center rounded-full bg-coral text-beige hover:opacity-70 transition-opacity"
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
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
