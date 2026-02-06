'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/data/projects';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations('projects');

  return (
    <div>
      <Link href={`/projekty/${project.slug}`} className="block group">
        <div className="overflow-hidden">
          <div className="relative aspect-square">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.04]"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </div>
        </div>
      </Link>

      <p className="mt-3 text-[13px] md:text-[14px] font-[300] text-dark text-center">
        {project.title} / {project.location}
        {project.status === 'in_progress' && (
          <span className="text-coral"> / {t('inProgress')}</span>
        )}
      </p>
    </div>
  );
}
