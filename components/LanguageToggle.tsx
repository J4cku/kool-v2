'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { track } from '@/lib/analytics';

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (newLocale: 'pl' | 'en') => {
    if (newLocale !== locale) {
      track('language_switch', { to: newLocale });
      router.replace(pathname, { locale: newLocale });
    }
  };

  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      <button
        onClick={() => switchTo('pl')}
        aria-pressed={locale === 'pl'}
        className="w-11 h-11 md:w-[26px] md:h-[26px] flex items-center justify-center"
      >
        <span
          className={`w-[26px] h-[26px] flex items-center justify-center rounded-full transition-colors ${
            locale === 'pl'
              ? 'bg-coral text-beige'
              : 'bg-transparent text-coral hover:opacity-70'
          }`}
        >
          pl
        </span>
      </button>
      <button
        onClick={() => switchTo('en')}
        aria-pressed={locale === 'en'}
        className="w-11 h-11 md:w-[26px] md:h-[26px] flex items-center justify-center"
      >
        <span
          className={`w-[26px] h-[26px] flex items-center justify-center rounded-full transition-colors ${
            locale === 'en'
              ? 'bg-coral text-beige'
              : 'bg-transparent text-coral hover:opacity-70'
          }`}
        >
          en
        </span>
      </button>
    </div>
  );
}
