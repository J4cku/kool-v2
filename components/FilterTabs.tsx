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
    <div className="flex items-center gap-8">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`text-[15px] lowercase tracking-wide transition-all duration-200 ${
            activeFilter === filter
              ? 'font-bold text-dark'
              : 'font-normal text-dark hover:opacity-70'
          }`}
        >
          {t(filter)}
        </button>
      ))}
    </div>
  );
}
