'use client';

import { useTranslations } from 'next-intl';

type FilterValue = 'wszystkie' | 'mieszkalne' | 'komercyjne';

interface FilterTabsProps {
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
}

const filters: FilterValue[] = ['wszystkie', 'mieszkalne', 'komercyjne'];

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const t = useTranslations('projects');

  return (
    <div className="flex items-center gap-4">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`text-[15px] lowercase tracking-wide transition-all duration-200 px-4 py-1.5 rounded-full ${
            activeFilter === filter
              ? 'font-bold text-beige bg-coral'
              : 'font-normal text-coral hover:opacity-70'
          }`}
        >
          {t(filter)}
        </button>
      ))}
    </div>
  );
}
