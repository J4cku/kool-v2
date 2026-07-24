import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { BASE_URL } from '@/lib/site';
import { jsonLdScript, localeAlternates, ogLocale } from '@/lib/metadata';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import CommercialDetails from '@/components/oferta/CommercialDetails';

const HERO_IMAGE = '/images/oferta/KOOL_oferta_komercyjne_hero.webp';

const SOCIAL_IMAGE = '/images/social/offer-commercial.jpg';
const PATH = '/oferta/wnetrza-komercyjne';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t('wnetrzaKomercyjne.title');
  const description = t('wnetrzaKomercyjne.description');
  const socialImage = {
    url: SOCIAL_IMAGE,
    width: 1200,
    height: 630,
    alt: t('wnetrzaKomercyjne.ogImageAlt'),
  };

  return {
    title,
    description,
    openGraph: {
      title: `${title} | kool studio`,
      description,
      type: 'website',
      siteName: 'kool studio',
      locale: ogLocale(locale),
      alternateLocale: locale === 'en' ? 'pl_PL' : 'en_US',
      url: `${BASE_URL}/${locale}${PATH}`,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | kool studio`,
      description,
      images: [socialImage],
    },
    alternates: localeAlternates(locale, PATH),
  };
}

export default async function WnetrzaKomercyjnePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'oferta.commercial.details' });
  const faqItems = t.raw('faqItems') as { q: string; a: string }[];
  const projectHeading = t('projectHeading');

  const pageUrl = `${BASE_URL}/${locale}${PATH}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        inLanguage: locale,
        mainEntity: faqItems.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'kool studio', item: `${BASE_URL}/${locale}` },
          {
            '@type': 'ListItem',
            position: 2,
            name: locale === 'en' ? 'services' : 'oferta',
            item: `${BASE_URL}/${locale}/oferta`,
          },
          { '@type': 'ListItem', position: 3, name: projectHeading, item: pageUrl },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <Navbar />
      {/* overflow-x-clip contains the full-bleed types marquee without the
          100vw+scrollbar horizontal scroll; clip (not hidden) keeps the
          timeline's sticky pin working */}
      <main className="overflow-x-clip">
        {/* Full-viewport hero — the fixed navbar overlays its top, matching
            the project pages' immersive hero height */}
        <div className="relative w-full h-screen">
          <Image
            src={HERO_IMAGE}
            alt={
              locale === 'en'
                ? 'Commercial interior designed by kool studio'
                : 'Wnętrze komercyjne zaprojektowane przez kool studio'
            }
            fill
            priority
            fetchPriority="high"
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="px-5 md:px-10 lg:px-[68px] pt-12 md:pt-20 pb-20 md:pb-28">
          <div className="max-w-[1400px] mx-auto">
            <CommercialDetails />
          </div>
        </div>
        {/* Page ends on the contact CTA (inside CommercialDetails); no marquee */}
        <FooterBanner showMarquee={false} />
      </main>
    </>
  );
}
