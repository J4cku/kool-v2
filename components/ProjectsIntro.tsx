'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import type { Project } from '@/data/projects';
import { clampArchiveIntroProgress } from '@/lib/portfolio-motion';

interface ProjectsIntroProps {
  projects: readonly Project[];
}

export default function ProjectsIntro({ projects }: ProjectsIntroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const introProjects = projects.slice(0, 10);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });
  const progress = useTransform(
    scrollYProgress,
    clampArchiveIntroProgress,
  );
  const scale = useTransform(progress, [0, 0.72, 1], [1, 1, 0.72]);
  const y = useTransform(progress, [0, 0.72, 1], ['0vh', '0vh', '-18vh']);
  const opacity = useTransform(progress, [0, 0.72, 1], [1, 1, 0]);

  return (
    <section
      ref={sectionRef}
      aria-hidden="true"
      className="pointer-events-none relative h-[200svh] w-full select-none motion-reduce:hidden"
    >
      <div className="sticky top-0 h-svh overflow-hidden bg-dark">
        <motion.div
          className="grid h-full w-full origin-center grid-cols-2 grid-rows-5 gap-px bg-coral will-change-transform min-[992px]:grid-cols-5 min-[992px]:grid-rows-2"
          style={{ opacity, scale, y }}
        >
          {introProjects.map((project, index) => (
            <div
              key={project.slug}
              className="relative min-h-0 min-w-0 overflow-hidden bg-dark"
            >
              <Image
                src={project.thumbnail}
                alt=""
                fill
                priority={index === 0}
                draggable={false}
                sizes="(min-width: 992px) 20vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
