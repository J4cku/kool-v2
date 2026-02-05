'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('footer');

  return (
    <footer id="kontakt" className="py-20 px-4">
      <div className="max-w-content mx-auto">
        <div className="flex flex-col items-end text-right mb-16">
          <p className="text-coral font-light text-2xl md:text-4xl uppercase tracking-wide">
            {t('studio')}
          </p>
          <p className="text-coral font-light text-2xl md:text-4xl uppercase tracking-wide">
            {t('address')}
          </p>
          <p className="text-coral font-light text-2xl md:text-4xl uppercase tracking-wide">
            {t('city')}
          </p>
          <a
            href="mailto:hello@koolstudio.pl"
            className="text-coral font-medium text-2xl md:text-4xl uppercase tracking-wide hover:opacity-70 transition-opacity mt-2"
          >
            hello@koolstudio.pl
          </a>
        </div>

        <div className="border-t border-coral/20 pt-6">
          <a
            href="https://instagram.com/koolstudio.pl"
            target="_blank"
            rel="noopener noreferrer"
            className="text-coral font-bold text-sm uppercase tracking-wider hover:opacity-70 transition-opacity"
          >
            {t('instagram')}
          </a>
        </div>
      </div>
    </footer>
  );
}
