'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { pressItems } from '@/data/press';
import FooterBanner from '@/components/FooterBanner';
import Navbar from '@/components/Navbar';
import ProjectHero from '@/components/ProjectHero';
import Reveal from '@/components/Reveal';
import RevealHeading from '@/components/RevealHeading';

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
      <ProjectHero
        src="/images/studio/team.webp"
        alt={t('heroImageAlt')}
        imageClassName="object-[60%_center] md:object-center"
      />
      <Navbar />
      <main>
        <div className="relative z-10 bg-beige">
          <section className="overflow-hidden whitespace-nowrap pt-16 pb-8 md:pt-24 md:pb-12">
            <h1 className="animate-marquee inline-block motion-reduce:animate-none">
              <span
                className="font-[400] uppercase text-coral leading-tight mx-8 md:mx-16"
                style={{ fontSize: 'clamp(26px, 4.8vw, 64px)' }}
              >
                {t('manifesto')}
              </span>
              {Array.from({ length: 3 }).map((_, index) => (
                <span
                  key={index}
                  aria-hidden="true"
                  className="font-[400] uppercase text-coral leading-tight mx-8 md:mx-16"
                  style={{ fontSize: 'clamp(26px, 4.8vw, 64px)' }}
                >
                  {t('manifesto')}
                </span>
              ))}
            </h1>
          </section>

          <section className="px-5 pt-10 pb-20 md:px-10 md:pt-14 md:pb-28 lg:px-[68px] lg:pt-20 lg:pb-36">
            <div className="mx-auto grid max-w-content gap-14 md:grid-cols-2 md:items-start md:gap-16 lg:gap-24">
              <p
                className="max-w-[610px] font-[400] leading-[1.5] text-dark/80"
                style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
              >
                {t('intro')}
              </p>
              <div className="flex md:justify-center">
                <Reveal className="relative aspect-[2/3] w-full max-w-[470px]">
                  <Image
                    src="/images/studio/studio-detail.webp"
                    alt={t('detailImageAlt')}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 40vw"
                  />
                </Reveal>
              </div>
            </div>
          </section>

          <section className="px-5 pb-24 md:px-10 md:pb-32 lg:px-[68px] lg:pb-44">
            <div className="mx-auto max-w-content">
              <div className="mb-14 flex flex-col gap-10 md:mb-20 md:flex-row md:items-center md:justify-between">
                <RevealHeading
                  text={t('pressHeading')}
                  className="text-[clamp(42px,5vw,72px)] font-[700] uppercase leading-none tracking-[-0.045em] text-dark"
                />
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
                    <Reveal className="relative aspect-square">
                      <Image
                        src={item.image}
                        alt={t(`press.items.${item.key}.imageAlt`)}
                        fill
                        className="object-cover transition-opacity duration-200 group-hover:opacity-80 group-focus-visible:opacity-80"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </Reveal>
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

          <FooterBanner showMarquee={false} />
        </div>
      </main>
    </>
  );
}
