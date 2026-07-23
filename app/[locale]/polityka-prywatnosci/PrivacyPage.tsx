'use client';

import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import FooterBar from '@/components/FooterBar';
import { openCookieSettings } from '@/lib/analytics';

const sections = [
  ['contactLabel', 'contactBody'],
  ['analyticsLabel', 'analyticsBody'],
  ['adsLabel', 'adsBody'],
  ['rightsLabel', 'rightsBody'],
] as const;

export default function PrivacyPage() {
  const t = useTranslations('privacy');

  return (
    <>
      <Navbar />
      <main className="min-h-dvh pt-[80px]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-12 pb-[calc(8rem+env(safe-area-inset-bottom))]">
          <h1
            className="pt-[14vh] text-dark font-[700] uppercase leading-tight"
            style={{ fontSize: 'clamp(28px, 4.5vw, 48px)' }}
          >
            {t('title')}
          </h1>

          <div className="mt-10 max-w-[680px] flex flex-col gap-10">
            <p className="text-[15px] leading-relaxed text-dark">{t('intro')}</p>

            {sections.map(([label, body]) => (
              <section key={label}>
                <h2 className="text-[11px] font-[600] uppercase tracking-[0.06em] text-coral">
                  {t(label)}
                </h2>
                <p className="mt-2 text-[15px] leading-relaxed text-dark">{t(body)}</p>
              </section>
            ))}

            <section>
              <h2 className="text-[11px] font-[600] uppercase tracking-[0.06em] text-coral">
                {t('cookiesLabel')}
              </h2>
              <p className="mt-2 text-[15px] leading-relaxed text-dark">{t('cookiesBody')}</p>
              <button
                onClick={openCookieSettings}
                className="mt-3 flex min-h-11 items-center text-[15px] font-[600] lowercase text-coral hover:opacity-60 transition-opacity"
              >
                {t('cookiesButton')}
              </button>
            </section>
          </div>
        </div>
      </main>
      <FooterBar />
    </>
  );
}
