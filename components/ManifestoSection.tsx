'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function ManifestoSection() {
  const t = useTranslations('home');
  const tFooter = useTranslations('footer');

  return (
    <>
      {/* Section 1: text left, tilted image right */}
      <section className="mt-[100px] md:mt-[140px]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-12">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
            <div className="md:w-[50%]">
              <h2
                className="uppercase text-dark font-[900] leading-[1.05] mb-6"
                style={{ fontSize: 'clamp(28px, 4.5vw, 48px)' }}
              >
                {t('section1Heading')}
              </h2>
              <p className="text-dark/70 font-[400] text-[14px] md:text-[15px] leading-[1.6]">
                {t('section1Text')}
              </p>
            </div>

            <div className="md:w-[45%] md:ml-auto flex justify-end">
              <div className="relative w-[80%] md:w-full aspect-[3/4] rotate-[6deg] overflow-hidden">
                <Image
                  src="/images/oferta/residential-04.jpg"
                  alt="Material moodboard"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 60vw, 35vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden whitespace-nowrap py-16 md:py-24">
        <div className="animate-marquee inline-block">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="font-[400] uppercase text-coral leading-tight mx-8 md:mx-16"
              style={{ fontSize: 'clamp(26px, 4.8vw, 64px)' }}
            >
              {tFooter('banner')}
            </span>
          ))}
        </div>
      </div>

      {/* Section 2: image left, text right */}
      <section className="mb-[80px] md:mb-[120px]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-12">
          <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-start">
            <div className="md:w-[40%]">
              <div className="relative w-full aspect-[3/4] overflow-hidden">
                <Image
                  src="/images/oferta/commercial-02.jpg"
                  alt="Interior photography"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 35vw"
                />
              </div>
            </div>

            <div className="md:w-[50%] md:ml-auto md:pt-8">
              <h2
                className="uppercase text-dark font-[900] leading-[1.05] mb-6"
                style={{ fontSize: 'clamp(28px, 4.5vw, 48px)' }}
              >
                {t('section2Heading')}
              </h2>
              <p className="text-dark/70 font-[400] text-[14px] md:text-[15px] leading-[1.6]">
                {t('section2Text')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
