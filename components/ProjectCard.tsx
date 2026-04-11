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
            {project.status === 'in_progress' && (
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-[35deg] whitespace-nowrap py-2"
                  style={{ width: '150%' }}
                >
                  <div className="animate-marquee-diagonal flex gap-8">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <span key={i} className="text-coral text-[13px] font-[700] uppercase tracking-[0.15em] shrink-0">
                        PROJECT IN PROGRESS
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>

      <p className="mt-3 text-[14px] md:text-[15px] font-[500] text-dark text-center uppercase">
        {project.title} / {project.location}
      </p>
    </div>
  );
}
