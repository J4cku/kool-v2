'use client';

import { useTranslations } from 'next-intl';

/* Address + email pair used on the homepage footer and kontakt page:
   the studio address is set at body-copy size and letter-distributed to
   span exactly the email's width (designer layout 2026-07-14), above the
   big bold email. On mobile the pair fills the content width. */
export default function AddressBlock() {
  const t = useTranslations('footer');
  const address = t('address');

  return (
    <div className="inline-flex flex-col w-full md:w-auto">
      <a
        href="https://maps.app.goo.gl/f3nJEyLJXxKStLvPA"
        target="_blank"
        rel="noopener noreferrer"
        aria-label={address}
        className="flex justify-between w-full font-[400] uppercase text-dark hover:opacity-70 transition-opacity text-[clamp(15px,1.5vw,20px)]"
      >
        {address.split('').map((ch, i) => (
          <span key={i} aria-hidden="true">
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </a>
      <a
        href="mailto:hello@koolstudio.pl"
        className="block font-[700] uppercase text-dark hover:opacity-70 transition-opacity w-full whitespace-nowrap text-right text-[clamp(18px,6.2vw,55px)] md:text-[clamp(32px,4.2vw,55px)]"
      >
        {t('email')}
      </a>
    </div>
  );
}
