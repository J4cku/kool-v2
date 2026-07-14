'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { Project } from '@/data/projects';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: Project[];
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function ProjectGrid({ projects }: ProjectGridProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-12 md:gap-x-5 md:gap-y-16"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* popLayout lets surviving cards FLIP into place while filtered-out
          cards fade away, instead of remounting the whole grid */}
      <AnimatePresence mode="popLayout">
        {projects.map((project) => (
          <motion.div
            key={project.id}
            layout={!reduceMotion}
            variants={itemVariants}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25, ease: 'easeIn' } }}
            transition={{ layout: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
          >
            <ProjectCard project={project} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
