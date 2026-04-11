'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageToggle() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchTo = (newLocale: 'pl' | 'en') => {
    if (newLocale !== locale) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  return (
    <div className="flex items-center gap-1 text-xs font-semibold">
      <button
        onClick={() => switchTo('pl')}
        className={`w-[26px] h-[26px] flex items-center justify-center rounded-full transition-colors ${
          locale === 'pl'
            ? 'bg-coral text-beige'
            : 'bg-transparent text-coral hover:opacity-70'
        }`}
      >
        pl
      </button>
      <button
        onClick={() => switchTo('en')}
        className={`w-[26px] h-[26px] flex items-center justify-center rounded-full transition-colors ${
          locale === 'en'
            ? 'bg-coral text-beige'
            : 'bg-transparent text-coral hover:opacity-70'
        }`}
      >
        en
      </button>
    </div>
  );
}
