'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import type { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.4 }}
      className="group cursor-pointer"
    >
      <div className="grid grid-cols-3 gap-1 mb-4">
        {project.images.map((image, index) => (
          <div key={index} className="relative aspect-square overflow-hidden">
            <Image
              src={image}
              alt={`${project.title} - ${index + 1}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>

      <div className="flex items-baseline gap-3 flex-wrap">
        <h3 className="font-bold text-dark text-lg">{project.title}</h3>
        <span className="text-coral italic text-sm">{project.status}</span>
      </div>
    </motion.article>
  );
}
