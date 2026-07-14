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
    /* Sliding row: scrolls horizontally when the labels don't fit, bleeding
       to the viewport edge on mobile (parent has px-5) so nothing gets cut */
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`text-[14px] uppercase tracking-[0.08em] transition-all duration-200 px-3 py-1 rounded-full whitespace-nowrap shrink-0 ${
            activeFilter === filter
              ? 'text-dark font-[700] border border-dark'
              : 'text-dark font-[500] hover:opacity-60'
          }`}
        >
          {t(filter)}
        </button>
      ))}
    </div>
  );
}
