import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BASE_URL } from '@/lib/site';
import { jsonLdScript, localeAlternates, ogLocale } from '@/lib/metadata';
import Navbar from '@/components/Navbar';
import ProjectHero from '@/components/ProjectHero';
import FooterBanner from '@/components/FooterBanner';
import ResidentialDetails from '@/components/oferta/ResidentialDetails';

const HERO_IMAGE = '/images/oferta/KOOL_oferta_domy_hero.webp';

const SOCIAL_IMAGE = '/images/social/offer-houses.jpg';
const PATH = '/oferta/projekt-wnetrz-domu';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t('projektWnetrzDomu.title');
  const description = t('projektWnetrzDomu.description');
  const socialImage = {
    url: SOCIAL_IMAGE,
    width: 1200,
    height: 630,
    alt: t('projektWnetrzDomu.ogImageAlt'),
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

export default async function ProjektWnetrzDomuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'oferta.residential.houses' });
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
      {/* Shared hero: 16:9 image below the nav on mobile, full-height parallax
          on desktop — matches the studio / project pages' heroes */}
      <ProjectHero
        src={HERO_IMAGE}
        alt={
          locale === 'en'
            ? 'Single-family house interior designed by kool studio'
            : 'Wnętrze domu jednorodzinnego zaprojektowane przez kool studio'
        }
      />
      <Navbar />
      {/* overflow-x-clip keeps the pinned stages timeline's sticky positioning
          working (clip, not hidden) without adding horizontal page scroll */}
      <main className="overflow-x-clip">
        {/* relative z-10 bg-beige scrolls the content up over the fixed hero */}
        <div className="relative z-10 bg-beige">
          <div className="px-5 md:px-10 lg:px-[68px] pt-12 md:pt-20 pb-20 md:pb-28">
            <div className="max-w-[1400px] mx-auto">
              <ResidentialDetails variant="houses" />
            </div>
          </div>
          {/* Page ends on the contact CTA (inside ResidentialDetails); no marquee */}
          <FooterBanner showMarquee={false} />
        </div>
      </main>
    </>
  );
}
