// Server-only metadata helpers (imports next-intl/server)
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { BASE_URL } from './site';

export function ogLocale(locale: string) {
  return locale === 'en' ? 'en_US' : 'pl_PL';
}

export function localeAlternates(
  locale: string,
  path: string,
): Metadata['alternates'] {
  return {
    canonical: `${BASE_URL}/${locale}${path}`,
    languages: {
      pl: `${BASE_URL}/pl${path}`,
      en: `${BASE_URL}/en${path}`,
      'x-default': `${BASE_URL}/pl${path}`,
    },
  };
}

type MetaPageKey = 'projekty' | 'studio' | 'oferta' | 'kontakt';

export async function pageMetadata(
  locale: string,
  key: MetaPageKey,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  const title = t(`${key}.title`);
  const description = t(`${key}.description`);
  const path = `/${key}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | kool studio`,
      description,
      type: 'website',
      siteName: 'Kool Studio',
      locale: ogLocale(locale),
      alternateLocale: locale === 'en' ? 'pl_PL' : 'en_US',
      url: `${BASE_URL}/${locale}${path}`,
    },
    alternates: localeAlternates(locale, path),
  };
}

export function makePageMetadata(key: MetaPageKey) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }): Promise<Metadata> {
    const { locale } = await params;
    return pageMetadata(locale, key);
  };
}

export function jsonLdScript(data: object): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
