'use client';

import { useState } from 'react';
import { LayoutGroup } from 'framer-motion';
import { useLocale } from 'next-intl';
import { localizeProject, projects } from '@/data/projects';
import {
  shouldShowArchiveIntro,
  type ArchiveFilter,
} from '@/lib/portfolio-motion';
import { usePrefersReducedMotion } from '@/lib/reduced-motion';
import FilterTabs from '@/components/FilterTabs';
import ProjectGrid from '@/components/ProjectGrid';
import ProjectsIntro from '@/components/ProjectsIntro';

interface ProjectsListingProps {
  initialFilter: ArchiveFilter;
  hasNonDefaultFilterQuery: boolean;
}

export default function ProjectsListing({
  initialFilter,
  hasNonDefaultFilterQuery,
}: ProjectsListingProps) {
  const locale = useLocale();
  const reducedMotion = usePrefersReducedMotion();
  const [activeFilter, setActiveFilter] = useState<ArchiveFilter>(initialFilter);

  const handleFilterChange = (filter: ArchiveFilter) => {
    setActiveFilter(filter);
    const query = filter === 'wszystkie' ? '' : `?filter=${filter}`;
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${query}`,
    );
  };

  const filteredProjects = (
    activeFilter === 'wszystkie'
      ? projects
      : projects.filter((project) => project.category === activeFilter)
  ).map((project) => localizeProject(project, locale));
  const showIntro = shouldShowArchiveIntro(
    activeFilter,
    hasNonDefaultFilterQuery,
    reducedMotion,
  );

  return (
    <>
      {showIntro && <ProjectsIntro projects={projects} />}

      <div className="px-5 pb-32 pt-[200px] md:px-10 md:pb-48 lg:px-12">
        <LayoutGroup id="projects-archive">
          <div className="mb-4">
            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              reducedMotion={reducedMotion}
            />
          </div>
          <ProjectGrid
            projects={filteredProjects}
            reducedMotion={reducedMotion}
          />
        </LayoutGroup>
      </div>
    </>
  );
}
