'use client';

import { useTranslations } from 'next-intl';

/* Address + email pair used on the homepage footer and kontakt page. On
   mobile both lines size with the viewport so each stays a single
   full-width line; from md up the original clamp sizing applies. */
export default function AddressBlock() {
  const t = useTranslations('footer');

  return (
    <div className="inline-flex flex-col w-full md:w-auto">
      <a
        href="https://maps.app.goo.gl/f3nJEyLJXxKStLvPA"
        target="_blank"
        rel="noopener noreferrer"
        className="block font-[400] uppercase text-dark hover:opacity-70 transition-opacity w-full whitespace-nowrap text-[clamp(16px,5.2vw,45px)] md:text-[clamp(28px,3.5vw,45px)]"
        style={{ textAlign: 'justify', textAlignLast: 'justify' } as React.CSSProperties}
      >
        {t('address')}
      </a>
      <a
        href="mailto:hello@koolstudio.pl"
        className="block font-[700] uppercase text-dark hover:opacity-70 transition-opacity w-full whitespace-nowrap text-[clamp(18px,6.2vw,55px)] md:text-[clamp(32px,4.2vw,55px)]"
      >
        {t('email')}
      </a>
    </div>
  );
}
