import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BASE_URL } from '@/lib/site';
import { localeAlternates, ogLocale } from '@/lib/metadata';
import Navbar from '@/components/Navbar';
import ImageStrip from '@/components/ImageStrip';
import { homepageProjectSlugs } from '@/data/homepage-projects';
import ManifestoSection from '@/components/ManifestoSection';
import FooterBanner from '@/components/FooterBanner';

/* The hero order is shuffled per regeneration, not per deploy: a short
   revalidate keeps the page statically cached (stale-while-revalidate) while
   every request kicks off a background rebuild with a fresh order. */
export const revalidate = 1;

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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
  const heroOrder = shuffle([...homepageProjectSlugs]);

  return (
    <>
      <Navbar />
      <main>
        <ImageStrip order={heroOrder} />
        <ManifestoSection />
      </main>
      <FooterBanner showAddress showMarquee={false} />
    </>
  );
}
