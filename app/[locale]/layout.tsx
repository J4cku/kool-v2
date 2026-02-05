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
  title: 'Kool Studio | Architektura Wnętrz Wrocław',
  description: 'Kool Studio - pracownia architektury wnętrz. Projektowanie przestrzeni mieszkalnych, komercyjnych i hotelowych we Wrocławiu.',
  keywords: 'architektura wnętrz, projektowanie wnętrz, Wrocław, design, interior design',
  openGraph: {
    title: 'Kool Studio | Architektura Wnętrz Wrocław',
    description: 'Pracownia architektury wnętrz. Projektowanie przestrzeni mieszkalnych, komercyjnych i hotelowych.',
    type: 'website',
    locale: 'pl_PL',
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
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages(locale);

  return (
    <html lang={locale} className={poppins.variable}>
      <body className="font-sans bg-beige text-dark antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
