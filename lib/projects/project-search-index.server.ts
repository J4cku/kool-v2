import 'server-only';
import { localizeProject, projects } from '@/data/projects';
import type { Locale } from '@/i18n/request';
import { projectSearchIndexFromLocalizedProjects } from '@/lib/projects/project-search-index';
import type { ProjectIndexEntry } from '@/lib/projects/project-search-types';
import { BASE_URL } from '@/lib/site';

export function getProjectSearchIndex(locale: Locale): ProjectIndexEntry[] {
  const localizedProjects = projects.map((project) => localizeProject(project, locale));
  return projectSearchIndexFromLocalizedProjects(localizedProjects, locale, BASE_URL);
}
