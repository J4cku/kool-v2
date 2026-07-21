'use client';

import { useTranslations } from 'next-intl';
import ColumnImage from '@/components/ColumnImage';
import RevealHeading from '@/components/RevealHeading';

function ManifestoText({ heading, text }: { heading: string; text: string }) {
  return (
    <div className="w-full md:w-1/2 p-6 md:p-10 lg:p-14 xl:p-20">
      <div className="flex h-full items-center">
        <div>
          <RevealHeading
            text={heading}
            className="uppercase text-dark font-[700] leading-[1.02] mb-6 md:mb-8"
            style={{ fontSize: 'clamp(28px, 4.2vw, 60px)' }}
          />
          <p
            className="text-dark/80 font-[400] leading-[1.5]"
            style={{ fontSize: 'clamp(15px, 1.5vw, 20px)' }}
          >
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function ManifestoImage({ src, alt }: { src: string; alt: string }) {
  return (
    <ColumnImage
      src={src}
      alt={alt}
      deferUntilVisible
      valign="center"
      className="w-full md:w-1/2 p-6 md:p-10"
    />
  );
}

export default function ManifestoSection() {
  const t = useTranslations('home');
  const tFooter = useTranslations('footer');

  return (
    <>
      {/* Section 1: text left, image right — project-page 50/50 row */}
      <section className="mt-[60px] md:mt-[80px]">
        <div className="flex flex-col md:flex-row">
          <ManifestoText heading={t('section1Heading')} text={t('section1Text')} />
          <ManifestoImage src="/images/home/kool_main_01.webp" alt="Material moodboard" />
        </div>
      </section>

      {/* Marquee */}
      <div className="overflow-hidden whitespace-nowrap py-16 md:py-24 bg-white">
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

      {/* Section 2: image left, text right — project-page 50/50 row */}
      <section className="mb-[80px] md:mb-[120px]">
        <div className="flex flex-col md:flex-row">
          <ManifestoImage src="/images/home/kool_main_02.webp" alt="Interior photography" />
          <ManifestoText heading={t('section2Heading')} text={t('section2Text')} />
        </div>
      </section>
    </>
  );
}
