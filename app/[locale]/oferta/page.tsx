'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import ServiceSection from '@/components/oferta/ServiceSection';
import ProcessSection from '@/components/oferta/ProcessSection';

function FullWidthImage({
  src,
  alt,
  aspect = 'aspect-[8/5]',
}: {
  src: string;
  alt: string;
  aspect?: string;
}) {
  return (
    <div className={`relative w-full ${aspect} overflow-hidden`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="100vw"
      />
    </div>
  );
}

export default function OfertaPage() {
  const t = useTranslations('oferta');
  const [commercialExpanded, setCommercialExpanded] = useState(false);
  const [residentialExpanded, setResidentialExpanded] = useState(false);

  const commercialScope = t.raw('commercial.scopeItems') as string[];
  const residentialScope = t.raw('residential.scopeItems') as string[];
  const processSteps = t.raw('process.steps') as string[];

  const trustedByLogos = [
    { src: '/images/oferta/logos/dehesa.webp', alt: 'DEHESA', width: 2030, height: 709, className: 'h-6 md:h-7' },
    { src: '/images/oferta/logos/piazza.webp', alt: 'PIAZZA', width: 2267, height: 542, className: 'h-6 md:h-7' },
    { src: '/images/oferta/logos/fandom.webp', alt: 'FANDOM', width: 3075, height: 1031, className: 'h-9 md:h-11' },
    { src: '/images/oferta/logos/dobry-material.webp', alt: 'DOBRY MATERIAŁ', width: 1842, height: 838, className: 'h-10 md:h-12' },
    { src: '/images/oferta/logos/belmonte.webp', alt: 'BELMONTE — Hotel Ustronie Morskie', width: 2372, height: 1157, className: 'h-12 md:h-14' },
  ];

  return (
    <>
      <Navbar />
      <main>
        <FullWidthImage
          src="/images/oferta/KOOL_oferta_komercyjne.webp"
          alt="Restaurant interior"
          aspect="aspect-[16/9]"
        />

        <ServiceSection
          label={t('commercial.label')}
          heading={t('commercial.heading')}
          description={t('commercial.description')}
          learnMoreLabel={t('learnMore')}
          portfolioLabel={t('portfolio')}
          portfolioHref="/projekty?filter=komercyjne"
          expanded={commercialExpanded}
          onToggle={() => setCommercialExpanded(!commercialExpanded)}
          scopeTitle={t('scopeTitle')}
          scopeItems={commercialScope}
          scopeImageSrc="/images/oferta/KOOL_oferta_komercyjne_small.webp"
          scopeImageAlt="Restaurant storefront"
          sloganHeading={t('commercial.sloganHeading')}
          sloganText={t('commercial.sloganText')}
          trustedByLabel={t('commercial.trustedBy')}
          trustedByLogos={trustedByLogos}
        />

        <FullWidthImage
          src="/images/oferta/KOOL_oferta_prywatne.webp"
          alt="Living room"
          aspect="aspect-[16/9]"
        />

        <ServiceSection
          label={t('residential.label')}
          heading={t('residential.heading')}
          description={t('residential.description')}
          learnMoreLabel={t('learnMore')}
          portfolioLabel={t('portfolio')}
          portfolioHref="/projekty?filter=mieszkalne"
          expanded={residentialExpanded}
          onToggle={() => setResidentialExpanded(!residentialExpanded)}
          scopeTitle={t('scopeTitle')}
          scopeItems={residentialScope}
          scopeImageSrc="/images/oferta/KOOL_oferta_prywatne_small.webp"
          scopeImageAlt="Kitchen interior"
          sloganHeading={t('residential.sloganHeading')}
          sloganText={t('residential.sloganText')}
        />

        <FullWidthImage
          src="/images/oferta/KOOL_oferta_finish.webp"
          alt="Material selection"
          aspect="aspect-[16/9]"
        />

        <ProcessSection
          label={t('process.label')}
          heading={t('process.heading')}
          steps={processSteps}
          imageSrc="/images/oferta/KOOL_oferta_finish_small.webp"
          imageAlt="Construction supervision"
          bottomHeading={t('process.bottomHeading')}
          bottomText={t('process.bottomText')}
        />
      </main>
      <FooterBanner showMarquee={false} />
    </>
  );
}
