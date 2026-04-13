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

  return (
    <>
      <Navbar />
      <main>
        <FullWidthImage
          src="/images/oferta/commercial-01.jpg"
          alt="Restaurant interior"
          aspect="aspect-[8/5]"
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
          scopeImageSrc="/images/oferta/commercial-03.jpg"
          scopeImageAlt="Restaurant storefront"
          sloganHeading={t('commercial.sloganHeading')}
          sloganText={t('commercial.sloganText')}
          trustedByLabel={t('commercial.trustedBy')}
          trustedByNames={['DEHESA', 'DOBRY MATERIAŁ', 'BELMONTE', 'PIAZZA', 'PIAZZA']}
        />

        <FullWidthImage
          src="/images/oferta/residential-01.jpg"
          alt="Living room"
          aspect="aspect-[8/5]"
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
          scopeImageSrc="/images/oferta/residential-02.jpg"
          scopeImageAlt="Kitchen interior"
          sloganHeading={t('residential.sloganHeading')}
          sloganText={t('residential.sloganText')}
        />

        <FullWidthImage
          src="/images/oferta/residential-04.jpg"
          alt="Material selection"
          aspect="aspect-[8/5]"
        />

        <ProcessSection
          label={t('process.label')}
          heading={t('process.heading')}
          steps={processSteps}
          imageSrc="/images/oferta/residential-03.jpg"
          imageAlt="Construction supervision"
          bottomHeading={t('process.bottomHeading')}
          bottomText={t('process.bottomText')}
        />
      </main>
      <FooterBanner showMarquee={false} />
    </>
  );
}
