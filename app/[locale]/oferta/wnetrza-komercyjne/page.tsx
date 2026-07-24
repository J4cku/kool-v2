import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BASE_URL } from '@/lib/site';
import { jsonLdScript, localeAlternates, ogLocale } from '@/lib/metadata';
import { Link } from '@/i18n/navigation';
import Navbar from '@/components/Navbar';
import FooterBanner from '@/components/FooterBanner';
import CommercialDetails from '@/components/oferta/CommercialDetails';

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
  const crumb =
    locale === 'en'
      ? { parent: 'services', current: 'commercial interiors' }
      : { parent: 'oferta', current: 'wnętrza komercyjne' };

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
      <main className="pt-[200px]">
        <div className="px-5 md:px-10 lg:px-[68px] mb-10 md:mb-14">
          <div className="max-w-[1400px] mx-auto">
            <nav className="text-[11px] md:text-[12px] font-[500] uppercase tracking-[0.08em] text-dark/60">
              <Link href="/oferta" className="hover:opacity-60 transition-opacity">
                {crumb.parent}
              </Link>
              <span aria-hidden="true"> / </span>
              <span>{crumb.current}</span>
            </nav>
          </div>
        </div>
        <div className="px-5 md:px-10 lg:px-[68px]">
          <div className="max-w-[1400px] mx-auto">
            <CommercialDetails />
          </div>
        </div>
        <FooterBanner />
      </main>
    </>
  );
}
