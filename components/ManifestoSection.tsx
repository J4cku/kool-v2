'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import Reveal from '@/components/Reveal';
import RevealHeading from '@/components/RevealHeading';

interface ManifestoTextProps {
  label: string;
  heading: string;
  text: string;
  className?: string;
}

function ManifestoText({ label, heading, text, className = '' }: ManifestoTextProps) {
  return (
    <div
      className={`flex flex-col justify-between py-10 md:min-h-[560px] md:py-14 lg:min-h-[680px] lg:py-20 ${className}`}
    >
      <div className="flex items-center gap-3 text-coral">
        <span className="text-[11px] font-[700] uppercase tracking-[0.18em]">{label}</span>
        <span className="h-px w-9 bg-coral" />
      </div>

      <div className="mt-16 md:mt-24">
        <RevealHeading
          text={heading}
          className="max-w-[12ch] whitespace-pre-line text-[clamp(38px,4.8vw,72px)] font-[700] uppercase leading-[0.96] tracking-[-0.045em] text-dark"
        />
        <p className="mt-8 max-w-[600px] text-[clamp(15px,1.25vw,19px)] font-[400] leading-[1.65] text-dark/80 md:mt-10">
          {text}
        </p>
      </div>
    </div>
  );
}

interface ManifestoImageProps {
  src: string;
  alt: string;
  className?: string;
}

function ManifestoImage({ src, alt, className = '' }: ManifestoImageProps) {
  return (
    <div className={`flex py-10 md:py-14 lg:py-20 ${className}`}>
      <Reveal className="relative aspect-[2/3] w-full max-w-[460px]">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 767px) calc(100vw - 40px), (max-width: 1439px) 42vw, 460px"
        />
      </Reveal>
    </div>
  );
}

export default function ManifestoSection() {
  const t = useTranslations('home');

  return (
    <section className="bg-beige px-5 py-20 md:px-10 md:py-28 lg:px-12 lg:py-36">
      <div className="mx-auto max-w-content">
        <article className="grid border-t border-dark/20 md:grid-cols-2">
          <ManifestoText
            label={t('section1Label')}
            heading={t('section1Heading')}
            text={t('section1Text')}
            className="md:pr-12 lg:pr-20"
          />
          <ManifestoImage
            src="/images/home/kool_main_01.webp"
            alt={t('section1ImageAlt')}
            className="justify-end border-t border-dark/20 md:border-t-0 md:border-l md:pl-12 lg:pl-20"
          />
        </article>

        <article className="grid border-y border-dark/20 md:grid-cols-2">
          <ManifestoText
            label={t('section2Label')}
            heading={t('section2Heading')}
            text={t('section2Text')}
            className="md:order-2 md:border-l md:pl-12 lg:pl-20"
          />
          <ManifestoImage
            src="/images/home/kool_main_02.webp"
            alt={t('section2ImageAlt')}
            className="justify-start border-t border-dark/20 md:order-1 md:border-t-0 md:pr-12 lg:pr-20"
          />
        </article>
      </div>
    </section>
  );
}
