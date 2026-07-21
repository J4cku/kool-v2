import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BASE_URL } from '@/lib/site';
import { localeAlternates, ogLocale } from '@/lib/metadata';
import Navbar from '@/components/Navbar';
import ImageStrip from '@/components/ImageStrip';
import ManifestoSection from '@/components/ManifestoSection';
import FooterBanner from '@/components/FooterBanner';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  const socialImage = {
    url: '/images/social/home-walecznych.jpg',
    width: 1200,
    height: 630,
    alt: t('home.ogImageAlt'),
  };

  return {
    title: { absolute: t('home.title') },
    description: t('home.description'),
    openGraph: {
      title: t('home.title'),
      description: t('home.ogDescription'),
      type: 'website',
      locale: ogLocale(locale),
      alternateLocale: locale === 'en' ? 'pl_PL' : 'en_US',
      siteName: 'Kool Studio',
      url: `${BASE_URL}/${locale}`,
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('home.title'),
      description: t('home.ogDescription'),
      images: [socialImage],
    },
    alternates: localeAlternates(locale, ''),
  };
}

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-[160px] md:pt-[93px]">
        <ImageStrip />
        <ManifestoSection />
      </main>
      <FooterBanner showAddress showMarquee={false} />
    </>
  );
}
