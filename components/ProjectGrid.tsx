'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Project } from '@/data/projects';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: readonly Project[];
  reducedMotion: boolean;
}

export default function ProjectGrid({
  projects,
  reducedMotion,
}: ProjectGridProps) {
  return (
    <div className="grid grid-cols-1 gap-px bg-coral lg:grid-cols-3">
      <AnimatePresence initial={false} mode="popLayout">
        {projects.map((project) => (
          <motion.div
            key={project.slug}
            className="min-w-0 bg-beige"
            layout={reducedMotion ? false : 'position'}
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={reducedMotion ? undefined : { opacity: 1 }}
            exit={reducedMotion ? undefined : { opacity: 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    opacity: { duration: 0.22, ease: 'easeOut' },
                    layout: { duration: 0.48, ease: [0.22, 1, 0.36, 1] },
                  }
            }
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
