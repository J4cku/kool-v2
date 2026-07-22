import type { Metadata, Viewport } from 'next';
import { Poppins } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';
import { BASE_URL } from '@/lib/site';
import { jsonLdScript } from '@/lib/metadata';
import { siteGraph } from '@/lib/schema';
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

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Kool Studio',
    template: '%s | kool studio',
  },
  keywords: 'architektura wnętrz, projektowanie wnętrz, Wrocław, Warszawa, interior design, architekt wnętrz, projekt wnętrz, meble na wymiar, design',
  authors: [{ name: 'Kool Studio' }],
  creator: 'Kool Studio',
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
  const tMeta = await getTranslations({ locale, namespace: 'meta' });

  return (
    <html lang={locale} className={poppins.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: jsonLdScript(siteGraph(locale, tMeta('schemaDescription'))),
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
        <SpeedInsights />
      </body>
    </html>
  );
}
