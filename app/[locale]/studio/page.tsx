'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import FooterBanner from '@/components/FooterBanner';
import Navbar from '@/components/Navbar';

type PressItemKey =
  | 'labelDehesa'
  | 'whitemadDehesa'
  | 'labelGuide'
  | 'plndesignOffice';

type PressItem = {
  key: PressItemKey;
  publication: string;
  href: string;
  image: string;
};

const pressItems: PressItem[] = [
  {
    key: 'labelDehesa',
    publication: 'Label Magazine',
    href: 'https://label-magazine.com/wnetrza/artykuly/delikatesy-iberyjskie-we-wroclawiu-wypelnily-je-kolory-jak-z-filmow-almodovara',
    image: '/images/studio/press-label-dehesa.webp',
  },
  {
    key: 'whitemadDehesa',
    publication: 'WhiteMAD',
    href: 'https://www.whitemad.pl/delikatesy-we-wroclawiu-dehesa/',
    image: '/images/studio/press-whitemad-dehesa.webp',
  },
  {
    key: 'labelGuide',
    publication: 'Label Magazine',
    href: 'https://label-magazine.com/sklep/ksiazki/polska-miejski-przewodnik',
    image: '/images/studio/press-label-guide.webp',
  },
  {
    key: 'plndesignOffice',
    publication: 'PLNdesign.pl',
    href: 'https://plndesign.pl/wnetrza/architektki-urzadzily-kancelarie-na-19-m2-we-wroclawiu-zaczely-od-pytania/',
    image: '/images/studio/press-plndesign-kancelaria.webp',
  },
];

const publicationLogos = [
  {
    src: '/images/studio/logo-label.png',
    width: 104,
    height: 54,
    className: 'h-[38px] w-auto md:h-[48px]',
  },
  {
    src: '/images/studio/logo-whitemad.png',
    width: 70,
    height: 66,
    className: 'h-[48px] w-auto md:h-[58px]',
  },
  {
    src: '/images/studio/logo-plndesign.png',
    width: 122,
    height: 14,
    className: 'h-[13px] w-auto md:h-[16px]',
  },
] as const;

export default function StudioPage() {
  const t = useTranslations('studio');

  return (
    <>
      <Navbar />
      <main className="pt-[112px] md:pt-[124px]">
        <section className="px-2 md:px-3">
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src="/images/studio/team.webp"
              alt={t('heroImageAlt')}
              fill
              priority
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        </section>

        <section className="px-5 pt-14 md:px-10 md:pt-20 lg:px-[68px]">
          <div className="mx-auto max-w-content">
            <h1 className="text-[clamp(34px,4.15vw,64px)] font-[400] uppercase leading-[1.08] tracking-[-0.035em] text-coral">
              {t('manifesto')}
            </h1>
          </div>
        </section>

        <section className="px-5 py-20 md:px-10 md:py-28 lg:px-[68px] lg:py-36">
          <div className="mx-auto grid max-w-content gap-14 md:grid-cols-2 md:items-start md:gap-16 lg:gap-24">
            <p className="max-w-[610px] text-[18px] font-[400] leading-[1.35] tracking-[-0.025em] text-dark md:text-[23px] lg:text-[27px]">
              {t('intro')}
            </p>
            <div className="flex md:justify-center">
              <div className="relative aspect-[2/3] w-full max-w-[470px] overflow-hidden">
                <Image
                  src="/images/studio/studio-detail.webp"
                  alt={t('detailImageAlt')}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 md:px-10 md:pb-32 lg:px-[68px] lg:pb-44">
          <div className="mx-auto max-w-content">
            <div className="mb-14 flex flex-col gap-10 md:mb-20 md:flex-row md:items-center md:justify-between">
              <h2 className="text-[clamp(42px,5vw,72px)] font-[900] uppercase leading-none tracking-[-0.045em] text-dark">
                {t('pressHeading')}
              </h2>
              <div className="flex flex-wrap items-center gap-8 md:justify-end md:gap-10 lg:gap-12">
                {publicationLogos.map((logo) => (
                  <Image
                    key={logo.src}
                    src={logo.src}
                    alt=""
                    width={logo.width}
                    height={logo.height}
                    className={logo.className}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {pressItems.map((item) => (
                <a
                  key={item.key}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-coral"
                >
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={item.image}
                      alt={t(`press.items.${item.key}.imageAlt`)}
                      fill
                      className="object-cover transition-opacity duration-200 group-hover:opacity-80 group-focus-visible:opacity-80"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <h3 className="mt-4 text-[16px] font-[900] uppercase leading-[1.1] text-dark md:text-[18px]">
                    {item.publication}
                  </h3>
                  <p className="mt-1 max-w-[410px] text-[14px] font-[400] leading-[1.25] text-dark md:text-[16px]">
                    {t(`press.items.${item.key}.title`)}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>
      <FooterBanner showMarquee={false} />
    </>
  );
}
