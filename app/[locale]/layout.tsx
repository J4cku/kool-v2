import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';
import '../globals.css';

const poppins = Poppins({
  subsets: ['latin', 'latin-ext'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://koolstudio.pl'),
  title: {
    default: 'Kool Studio | Architektura Wnętrz Wrocław',
    template: '%s | Kool Studio',
  },
  description: 'Kool Studio — wrocławska pracownia architektury wnętrz. Projektujemy autorskie wnętrza mieszkalne i komercyjne z dbałością o detal. Meble, lampy, identyfikacja wizualna.',
  keywords: 'architektura wnętrz, projektowanie wnętrz, Wrocław, Warszawa, interior design, architekt wnętrz, projekt wnętrz, meble na wymiar, design',
  authors: [{ name: 'Kool Studio' }],
  creator: 'Kool Studio',
  openGraph: {
    title: 'Kool Studio | Architektura Wnętrz Wrocław',
    description: 'Autorskie wnętrza, które zostają na dłużej. Projektowanie przestrzeni mieszkalnych i komercyjnych.',
    type: 'website',
    locale: 'pl_PL',
    alternateLocale: 'en_US',
    siteName: 'Kool Studio',
    url: 'https://koolstudio.pl',
  },
  alternates: {
    canonical: 'https://koolstudio.pl',
    languages: {
      'pl': 'https://koolstudio.pl/pl',
      'en': 'https://koolstudio.pl/en',
    },
  },
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

  const messages = await getMessages(locale);

  return (
    <html lang={locale} className={poppins.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ProfessionalService',
              name: 'Kool Studio',
              description: 'Wrocław-based interior architecture practice specializing in residential and commercial interiors, custom furniture, lighting design, and visual identity.',
              url: 'https://koolstudio.pl',
              email: 'hello@koolstudio.pl',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Zaporoska 83/15',
                addressLocality: 'Wrocław',
                addressCountry: 'PL',
              },
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
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
