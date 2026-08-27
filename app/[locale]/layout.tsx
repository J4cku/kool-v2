import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';
import { BASE_URL, INSTAGRAM_URL } from '@/lib/site';
import { jsonLdScript } from '@/lib/metadata';
import { getProjectSearchIndex } from '@/lib/projects/project-search-index.server';
import PageTransition from '@/components/PageTransition';
import WebMcpProvider from '@/components/WebMcpProvider';
import '../globals.css';

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: 'normal',
  preload: false,
  variable: '--font-poppins',
});

export const viewport: Viewport = {
  themeColor: '#E5DDD0',
  viewportFit: 'cover',
};

const isVercelDeployment = process.env.VERCEL === '1';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'kool studio',
    template: '%s | kool studio',
  },
  keywords: 'architektura wnętrz, projektowanie wnętrz, Wrocław, Warszawa, interior design, architekt wnętrz, projekt wnętrz, meble na wymiar, design',
  authors: [{ name: 'kool studio' }],
  creator: 'kool studio',
  robots: {
    index: true,
    follow: true,
  },
};

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

  const validatedLocale = locale as Locale;
  const messages = await getMessages(validatedLocale);
  const tMeta = await getTranslations({ locale: validatedLocale, namespace: 'meta' });
  const projectIndex = getProjectSearchIndex(validatedLocale);

  return (
    <html lang={validatedLocale} className={poppins.variable}>
      <head>
        {process.env.WEBMCP_ORIGIN_TRIAL_TOKEN && (
          <meta
            httpEquiv="origin-trial"
            content={process.env.WEBMCP_ORIGIN_TRIAL_TOKEN}
          />
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              '@id': `${BASE_URL}/#studio`,
              name: 'kool studio',
              description: tMeta('schemaDescription'),
              url: BASE_URL,
              email: 'hello@koolstudio.pl',
              image: `${BASE_URL}/images/studio/team.webp`,
              logo: `${BASE_URL}/logo.svg`,
              sameAs: [
                INSTAGRAM_URL,
                'https://www.facebook.com/its.kool.studio',
                'https://maps.google.com/?cid=12276542814275745116',
              ],
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
        <NextIntlClientProvider locale={validatedLocale} messages={messages}>
          <WebMcpProvider locale={validatedLocale} projectIndex={projectIndex} />
          <PageTransition>{children}</PageTransition>
        </NextIntlClientProvider>
        {isVercelDeployment && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
      </body>
    </html>
  );
}
