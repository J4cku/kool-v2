import type { Project } from '@/data/projects';
import type { Locale } from '@/i18n/request';
import type { ProjectIndexEntry } from '@/lib/projects/project-search-types';

export function projectSearchIndexFromLocalizedProjects(
  localizedProjects: readonly Project[],
  locale: Locale,
  baseUrl: string,
): ProjectIndexEntry[] {
  return localizedProjects.map((project, catalogOrder) => ({
    catalogOrder,
    slug: project.slug,
    title: project.title,
    location: project.location,
    category: project.category === 'mieszkalne' ? 'residential' : 'commercial',
    projectType: project.projectType,
    areaM2: project.areaM2,
    objectiveFeatures: [...project.objectiveFeatures],
    url: `${baseUrl}/${locale}/projekty/${project.slug}`,
  }));
}
