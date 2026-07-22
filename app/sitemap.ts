import type { MetadataRoute } from 'next';
import { projects } from '@/data/projects';
import { BASE_URL } from '@/lib/site';

// No lastModified: the repo has no real per-URL modification timestamp, and
// stamping new Date() on every build fabricates freshness. changeFrequency is
// likewise omitted — asserting a cadence we can't substantiate. priority is a
// genuine relative-importance hint and is kept.
export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ['pl', 'en'];

  const staticPages = ['', '/projekty', '/studio', '/oferta', '/kontakt'];

  const staticEntries = locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${BASE_URL}/${locale}${page}`,
      priority: page === '' ? 1.0 : 0.8,
    }))
  );

  const projectEntries = locales.flatMap((locale) =>
    projects.map((project) => ({
      url: `${BASE_URL}/${locale}/projekty/${project.slug}`,
      priority: 0.9,
    }))
  );

  return [...staticEntries, ...projectEntries];
}
