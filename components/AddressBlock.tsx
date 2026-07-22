'use client';

import { useTranslations } from 'next-intl';

/* Address + email pair used on the homepage footer and kontakt page:
   the studio address is set at body-copy size and letter-distributed to
   span exactly the email's width (designer layout 2026-07-14), above the
   big bold email. On mobile the pair fills the content width. */
function Distributed({ text }: { text: string }) {
  return text.split('').map((ch, i) => (
    <span key={i}>{ch === ' ' ? ' ' : ch}</span>
  ));
}

export default function AddressBlock() {
  const t = useTranslations('footer');
  const address = t('address');
  const email = t('email');

  return (
    <div className="inline-flex flex-col w-full md:w-auto">
      <a
        href="https://maps.app.goo.gl/f3nJEyLJXxKStLvPA"
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 items-center justify-between w-full font-[400] uppercase text-dark hover:opacity-70 transition-opacity text-[clamp(15px,1.5vw,20px)]"
      >
        <Distributed text={address} />
      </a>
      {/* Mobile: letters distribute so the line is exactly full width, like
          the address; from md up it renders as normal right-aligned text */}
      <a
        href="mailto:hello@koolstudio.pl"
        data-analytics-position="footer"
        className="flex min-h-11 items-center justify-between w-full font-[700] uppercase text-dark hover:opacity-70 transition-opacity text-[clamp(18px,6.2vw,55px)] md:block md:whitespace-nowrap md:text-right md:text-[clamp(32px,4.2vw,55px)]"
      >
        <Distributed text={email} />
      </a>
    </div>
  );
}
