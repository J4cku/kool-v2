'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

export default function ManifestoSection() {
  const t = useTranslations('home');

  return (
    <section className="mt-[100px] md:mt-[140px]">
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-12">
        <div className="flex flex-col md:flex-row gap-12 md:gap-16">
          <div className="md:w-[55%]">
            <h2 className="uppercase text-coral font-[700] leading-[1.15] mb-6" style={{ fontSize: 'clamp(32px, 5vw, 54px)' }}>
              {t('tagline')}
            </h2>
            <p className="uppercase text-coral/60 font-[400] text-[18px] md:text-[20px] leading-[1.5]">
              {t('manifesto')}
            </p>
          </div>

          <div className="md:w-[40%] md:ml-auto">
            <div className="relative aspect-[2/3] w-full">
              <Image
                src="/images/kancelaria.jpg"
                alt="Interior design"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
