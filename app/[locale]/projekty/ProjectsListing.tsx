'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { projects } from '@/data/projects';
import FilterTabs from '@/components/FilterTabs';
import ProjectGrid from '@/components/ProjectGrid';

type FilterValue = 'wszystkie' | 'mieszkalne' | 'komercyjne';
const validFilters: FilterValue[] = ['wszystkie', 'mieszkalne', 'komercyjne'];

export default function ProjectsListing() {
  const searchParams = useSearchParams();
  const paramFilter = searchParams.get('filter') as FilterValue | null;
  const initialFilter = paramFilter && validFilters.includes(paramFilter) ? paramFilter : 'wszystkie';
  const [activeFilter, setActiveFilter] = useState<FilterValue>(initialFilter);

  const filteredProjects =
    activeFilter === 'wszystkie'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <>
      <div className="mb-4">
        <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      </div>
      <ProjectGrid key={activeFilter} projects={filteredProjects} />
    </>
  );
}
