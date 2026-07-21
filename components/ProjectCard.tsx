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
    <article className="h-full bg-beige">
      <Link
        href={`/projekty/${project.slug}`}
        className="group flex h-full flex-col bg-beige focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-coral"
      >
        <div className="relative aspect-square overflow-hidden">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
            sizes="(max-width: 1023px) 100vw, 33vw"
          />
        </div>

        <div className="flex min-h-[104px] flex-1 flex-col border-t border-coral bg-beige px-3.5 py-3 md:px-4 md:py-3.5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4">
            <h2 className="min-w-0 text-[14px] font-[700] uppercase leading-[1.15] tracking-[-0.02em] text-dark md:text-[15px]">
              {project.title}
            </h2>
            <p className="max-w-[12rem] text-right text-[10px] font-[500] uppercase leading-[1.3] tracking-[0.08em] text-muted md:text-[11px]">
              {project.location}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-4 pt-5">
            <p className="text-[10px] font-[500] uppercase leading-none tracking-[0.08em] text-muted md:text-[11px]">
              {t(project.category)} / {project.year}
            </p>
            {project.status === 'in_progress' && (
              <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-[700] uppercase leading-none tracking-[0.08em] text-coral md:text-[11px]">
                <span aria-hidden="true" className="size-1.5 shrink-0 bg-coral" />
                {t('inProgress')}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
