'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import FilterTabs from './FilterTabs';
import ProjectCard from './ProjectCard';
import { projects } from '@/data/projects';

const categories = ['wszystkie', 'mieszkalne', 'komercyjne', 'hotele', 'gastronomia'];

export default function ProjectsGrid() {
  const [activeCategory, setActiveCategory] = useState('wszystkie');
  const t = useTranslations('projects');

  const filteredProjects = activeCategory === 'wszystkie'
    ? projects
    : projects.filter((p) => p.category === activeCategory);

  return (
    <section id="projekty" className="py-24 md:py-32 px-6">
      <div className="max-w-content mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <span className="text-coral font-bold text-sm uppercase tracking-[0.2em] mb-6 block">
            {t('title')}
          </span>
          <FilterTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}
