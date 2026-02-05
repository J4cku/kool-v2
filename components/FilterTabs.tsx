'use client';

import { useTranslations } from 'next-intl';

interface FilterTabsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function FilterTabs({ categories, activeCategory, onCategoryChange }: FilterTabsProps) {
  const t = useTranslations('projects');

  return (
    <div className="flex flex-wrap gap-3">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`px-6 py-2.5 rounded-full font-bold text-sm uppercase tracking-wider transition-all duration-300 ${
            activeCategory === category
              ? 'bg-dark text-beige'
              : 'bg-transparent border-2 border-dark/20 text-dark hover:border-dark'
          }`}
        >
          {t(category)}
        </button>
      ))}
    </div>
  );
}
