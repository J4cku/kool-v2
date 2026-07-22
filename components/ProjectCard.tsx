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

      <div className="mt-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4">
          <p className="min-w-0 text-[14px] font-[700] uppercase leading-[1.15] tracking-[-0.02em] text-dark md:text-[15px]">
            {project.title}
          </p>
          <p className="max-w-[12rem] text-right text-[10px] font-[500] uppercase leading-[1.3] tracking-[0.08em] text-muted md:text-[11px]">
            {project.location}
          </p>
        </div>
        <div className="mt-1.5 flex items-end justify-between gap-4">
          <p className="text-[10px] font-[500] uppercase leading-none tracking-[0.08em] text-muted md:text-[11px]">
            {t(project.category)} / {project.year}
          </p>
          {project.status === 'in_progress' && (
            <p className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-[700] uppercase leading-none tracking-[0.08em] text-coral md:text-[11px]">
              <span className="size-[6px] rounded-full bg-coral" aria-hidden />
              {t('inProgress')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
