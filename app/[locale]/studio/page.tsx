'use client';

import { useTranslations } from 'next-intl';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';

export default function StudioPage() {
  const t = useTranslations('studio');

  return (
    <>
      <Navbar />
      <main className="pt-[80px]">
        <div className="max-w-[1400px] mx-auto px-5 md:px-10 lg:px-12 min-h-[60vh] flex flex-col items-center justify-center text-center">
          <h1 className="text-red font-[900] text-4xl md:text-6xl uppercase">
            {t('title')}
          </h1>
          <p className="text-gray text-lg mt-4 font-normal">
            {t('comingSoon')}
          </p>
        </div>
      </main>
      <FooterBanner />
    </>
  );
}
