'use client';

import { useState } from 'react';
import { projects } from '@/data/projects';
import FilterTabs from '@/components/FilterTabs';
import ProjectGrid from '@/components/ProjectGrid';

type FilterValue = 'wszystkie' | 'mieszkalne' | 'komercyjne';

export default function ProjectsListing() {
  const [activeFilter, setActiveFilter] = useState<FilterValue>('wszystkie');

  const filteredProjects =
    activeFilter === 'wszystkie'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <>
      <div className="mb-12">
        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>
      <ProjectGrid key={activeFilter} projects={filteredProjects} />
    </>
  );
}
