'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import { Link } from '@/i18n/navigation';

type Principle = {
  title: string;
  text: string;
};

type StudioDetail = {
  label: string;
  value: string;
};

function StudioImage({
  src,
  alt,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  className: string;
  sizes: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-dark/5 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes={sizes}
        priority={src.includes('residential-04')}
      />
    </div>
  );
}

function Eyebrow({ children }: { children: string }) {
  return (
    <span className="mb-4 block text-[11px] font-[700] uppercase tracking-[0.14em] text-dark/50">
      {children}
    </span>
  );
}

export default function StudioPage() {
  const t = useTranslations('studio');
  const heroLines = t.raw('heroLines') as string[];
  const details = t.raw('details') as StudioDetail[];
  const principles = t.raw('principles') as Principle[];

  return (
    <>
      <Navbar />
      <main className="pt-[112px] md:pt-[148px]">
        <section className="px-5 pb-16 md:px-10 md:pb-24 lg:px-[68px]">
          <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[minmax(0,0.98fr)_minmax(360px,0.62fr)] lg:items-end">
            <div>
              <Eyebrow>{t('label')}</Eyebrow>
              <h1 className="max-w-[880px] text-[46px] font-[900] uppercase leading-[0.92] text-dark md:text-[86px] lg:text-[112px]">
                {heroLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="mt-8 max-w-[720px] text-[15px] font-[400] leading-[1.7] text-dark/70 md:text-[17px]">
                {t('heroBody')}
              </p>
            </div>

            <div className="grid gap-[3px]">
              <StudioImage
                src="/images/oferta/residential-04.jpg"
                alt={t('heroImageAlt')}
                className="aspect-[4/5]"
                sizes="(max-width: 1024px) 100vw, 38vw"
              />
              <div className="grid grid-cols-2 gap-[3px]">
                <StudioImage
                  src="/images/dehesa/kool_dehesa_04.webp"
                  alt={t('detailImageAlt')}
                  className="aspect-square"
                  sizes="(max-width: 1024px) 50vw, 19vw"
                />
                <StudioImage
                  src="/images/dobrzykowice/KOOL_dd_10.webp"
                  alt={t('colorImageAlt')}
                  className="aspect-square"
                  sizes="(max-width: 1024px) 50vw, 19vw"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-coral/35 px-5 py-14 md:px-10 md:py-20 lg:px-[68px]">
          <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[0.72fr_1fr] md:items-start">
            <div>
              <Eyebrow>{t('statementLabel')}</Eyebrow>
              <h2 className="max-w-[560px] text-[32px] font-[900] uppercase leading-[1.02] text-dark md:text-[54px]">
                {t('statementHeading')}
              </h2>
            </div>
            <div>
              <p className="max-w-[760px] text-[15px] font-[400] leading-[1.75] text-dark/75 md:text-[18px]">
                {t('statementText')}
              </p>
              <dl className="mt-10 grid gap-6 border-t border-dark/20 pt-6 sm:grid-cols-3">
                {details.map((detail) => (
                  <div key={detail.label}>
                    <dt className="text-[11px] font-[700] uppercase tracking-[0.12em] text-dark/45">
                      {detail.label}
                    </dt>
                    <dd className="mt-2 text-[14px] font-[700] uppercase text-dark">
                      {detail.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="px-5 py-16 md:px-10 md:py-24 lg:px-[68px]">
          <div className="mx-auto max-w-[1400px]">
            <div className="mb-12 max-w-[760px] md:mb-16">
              <Eyebrow>{t('principlesLabel')}</Eyebrow>
              <h2 className="text-[32px] font-[900] uppercase leading-[1.04] text-dark md:text-[58px]">
                {t('principlesHeading')}
              </h2>
            </div>

            <div className="divide-y divide-dark/20 border-y border-dark/20">
              {principles.map((principle, index) => (
                <article
                  key={principle.title}
                  className="grid gap-5 py-7 md:grid-cols-[120px_minmax(220px,0.52fr)_1fr] md:gap-8 md:py-9"
                >
                  <span className="text-[13px] font-[900] tabular-nums text-coral">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="text-[22px] font-[900] uppercase leading-[1.05] text-dark md:text-[30px]">
                    {principle.title}
                  </h3>
                  <p className="max-w-[620px] text-[14px] font-[400] leading-[1.65] text-dark/70 md:text-[15px]">
                    {principle.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-16 md:px-10 md:pb-24 lg:px-[68px]">
          <div className="mx-auto grid max-w-[1400px] gap-10 md:grid-cols-[minmax(220px,0.42fr)_1fr] md:gap-16 md:items-start">
            <StudioImage
              src="/images/oferta/residential-03.jpg"
              alt={t('processImageAlt')}
              className="aspect-[3/4]"
              sizes="(max-width: 768px) 100vw, 36vw"
            />
            <div className="md:pt-8">
              <Eyebrow>{t('processLabel')}</Eyebrow>
              <h2 className="max-w-[760px] text-[32px] font-[900] uppercase leading-[1.04] text-dark md:text-[58px]">
                {t('processHeading')}
              </h2>
              <p className="mt-8 max-w-[720px] text-[15px] font-[400] leading-[1.75] text-dark/70 md:text-[17px]">
                {t('processText')}
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden border-t border-coral/35 px-5 py-14 md:px-10 md:py-20 lg:px-[68px]">
          <div className="mx-auto max-w-[1400px]">
            <p className="mb-8 text-[44px] font-[900] uppercase leading-[0.88] text-coral md:text-[108px] lg:text-[148px]">
              KOOL
            </p>
            <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
              <h2 className="max-w-[780px] text-[30px] font-[900] uppercase leading-[1.05] text-dark md:text-[52px]">
                {t('closingHeading')}
              </h2>
              <Link
                href="/kontakt"
                className="text-[12px] font-[800] uppercase tracking-[0.12em] text-dark transition-opacity hover:opacity-50"
              >
                [ {t('contactLabel')} ]
              </Link>
            </div>
          </div>
        </section>
      </main>
      <FooterBanner showMarquee={false} />
    </>
  );
}
