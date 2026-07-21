'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { ArchiveFilter } from '@/lib/portfolio-motion';

interface FilterTabsProps {
  activeFilter: ArchiveFilter;
  onFilterChange: (filter: ArchiveFilter) => void;
  reducedMotion: boolean;
}

const filters: ArchiveFilter[] = ['wszystkie', 'mieszkalne', 'komercyjne'];

export default function FilterTabs({
  activeFilter,
  onFilterChange,
  reducedMotion,
}: FilterTabsProps) {
  const t = useTranslations('projects');

  return (
    <div className="grid w-full grid-cols-3 items-stretch gap-px bg-dark md:mx-auto md:flex md:w-fit">
      {filters.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onFilterChange(filter)}
          aria-pressed={activeFilter === filter}
          className={`relative min-h-11 min-w-0 whitespace-nowrap bg-beige px-1.5 text-[11px] uppercase tracking-[0.04em] transition-opacity duration-200 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-coral motion-reduce:transition-none sm:px-3 md:px-3.5 md:text-[12px] md:tracking-[0.08em] ${
            activeFilter === filter
              ? 'font-[700] text-dark'
              : 'font-[500] text-dark hover:opacity-60'
          }`}
        >
          <span className="relative z-10">{t(filter)}</span>
          {activeFilter === filter && (
            <motion.span
              aria-hidden="true"
              layoutId={reducedMotion ? undefined : 'archive-filter-underline'}
              className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-dark"
              initial={false}
              transition={
                reducedMotion
                  ? { duration: 0 }
                  : { duration: 0.42, ease: [0.22, 1, 0.36, 1] }
              }
            />
          )}
        </button>
      ))}
    </div>
  );
}
