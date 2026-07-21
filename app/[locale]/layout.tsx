import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';
import { BASE_URL, INSTAGRAM_URL } from '@/lib/site';
import { jsonLdScript, localeAlternates, ogLocale } from '@/lib/metadata';
import PageTransition from '@/components/PageTransition';
import '../globals.css';

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
});

export const viewport: Viewport = {
  themeColor: '#E5DDD0',
  viewportFit: 'cover',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: t('home.title'),
      template: '%s | kool studio',
    },
    description: t('home.description'),
    keywords: 'architektura wnętrz, projektowanie wnętrz, Wrocław, Warszawa, interior design, architekt wnętrz, projekt wnętrz, meble na wymiar, design',
    authors: [{ name: 'Kool Studio' }],
    creator: 'Kool Studio',
    openGraph: {
      title: t('home.title'),
      description: t('home.ogDescription'),
      type: 'website',
      locale: ogLocale(locale),
      alternateLocale: locale === 'en' ? 'pl_PL' : 'en_US',
      siteName: 'Kool Studio',
      url: `${BASE_URL}/${locale}`,
    },
    alternates: localeAlternates(locale, ''),
    robots: {
      index: true,
      follow: true,
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

async function getMessages(locale: string) {
  try {
    return (await import(`../../messages/${locale}.json`)).default;
  } catch {
    return (await import(`../../messages/pl.json`)).default;
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages(locale);
  const tMeta = await getTranslations({ locale, namespace: 'meta' });

  return (
    <html lang={locale} className={poppins.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              '@id': `${BASE_URL}/#studio`,
              name: 'Kool Studio',
              description: tMeta('schemaDescription'),
              url: BASE_URL,
              email: 'hello@koolstudio.pl',
              image: `${BASE_URL}/images/studio/team.webp`,
              logo: `${BASE_URL}/logo.svg`,
              sameAs: [INSTAGRAM_URL],
              founder: [
                { '@type': 'Person', name: 'Ola Kilińska' },
                { '@type': 'Person', name: 'Ola Leszczyńska' },
              ],
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Zaporoska 83/15',
                postalCode: '53-415',
                addressLocality: 'Wrocław',
                addressRegion: 'Dolnośląskie',
                addressCountry: 'PL',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 51.09168,
                longitude: 17.01557,
              },
              hasMap: 'https://maps.app.goo.gl/f3nJEyLJXxKStLvPA',
              areaServed: [
                { '@type': 'City', name: 'Wrocław' },
                { '@type': 'City', name: 'Warszawa' },
                { '@type': 'Country', name: 'Poland' },
              ],
              serviceType: [
                'Interior Architecture',
                'Interior Design',
                'Custom Furniture Design',
                'Lighting Design',
                'Visual Identity Design',
              ],
              knowsLanguage: ['pl', 'en'],
            }),
          }}
        />
      </head>
      <body className="font-sans bg-beige text-dark antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PageTransition>{children}</PageTransition>
        </NextIntlClientProvider>
        {/* Cookieless visit counting — needs Web Analytics enabled in the
            Vercel dashboard to start collecting */}
        <Analytics />
      </body>
    </html>
  );
}
