import type { MetadataRoute } from 'next';
import { projects } from '@/data/projects';
import { BASE_URL } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['pl', 'en'];

  const staticPages = ['', '/projekty', '/studio', '/oferta', '/kontakt', '/polityka-prywatnosci'];

  const staticEntries = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: page === '' ? 1.0 : 0.8,
    }))
  );

  const projectEntries = locales.flatMap((locale) =>
    projects.map((project) => ({
      url: `${BASE_URL}/${locale}/projekty/${project.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    }))
  );

  return [...staticEntries, ...projectEntries];
}
