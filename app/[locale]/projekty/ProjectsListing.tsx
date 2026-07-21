'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import { localizeProject, projects, type ProjectFilter } from '@/data/projects';
import FilterTabs from '@/components/FilterTabs';
import ProjectGrid from '@/components/ProjectGrid';

export default function ProjectsListing({ initialFilter }: { initialFilter: ProjectFilter }) {
  const locale = useLocale();
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>(initialFilter);

  const handleFilterChange = (filter: ProjectFilter) => {
    setActiveFilter(filter);
    // Shallow history update keeps the filter shareable in the URL without
    // a server round-trip (window.location keeps the locale prefix)
    const query = filter === 'wszystkie' ? '' : `?filter=${filter}`;
    window.history.replaceState(null, '', `${window.location.pathname}${query}`);
  };

  const filteredProjects = (
    activeFilter === 'wszystkie'
      ? projects
      : projects.filter((p) => p.category === activeFilter)
  ).map((p) => localizeProject(p, locale));

  return (
    <>
      <div className="mb-4">
        <FilterTabs activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      </div>
      <ProjectGrid projects={filteredProjects} />
    </>
  );
}
