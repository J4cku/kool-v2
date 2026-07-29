import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { localizeProject, projects } from '@/data/projects';
import PrzelotMount, { type PrzelotItem } from '@/components/przelot/PrzelotMount';
import StaticFallback from '@/components/przelot/StaticFallback';

/* Unlisted lab route: noindex overrides the layout's blanket robots, and
   deliberately no canonical, hreflang or OG image — pageMetadata() would
   force all three plus a social JPEG via the closed MetaPageKey union. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'przelot' });
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  };
}

export default async function PrzelotPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'przelot' });
  const items: PrzelotItem[] = projects.map((project) => {
    const localized = localizeProject(project, locale);
    return {
      slug: project.slug,
      title: localized.title,
      location: localized.location,
      thumbnail: project.thumbnail,
    };
  });

  return (
    <main>
      <h1 className="sr-only">{t('title')}</h1>
      <PrzelotMount
        items={items}
        fallback={<StaticFallback locale={locale} items={items} />}
        hiddenList={<StaticFallback locale={locale} items={items} srOnly />}
      />
    </main>
  );
}
