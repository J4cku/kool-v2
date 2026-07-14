'use client';

import { useTranslations } from 'next-intl';
import type { Project } from '@/data/projects';

interface ProjectMetaProps {
  project: Project;
}

export default function ProjectMeta({ project }: ProjectMetaProps) {
  const t = useTranslations('projectDetail');

  const rows = [
    { label: t('projekt'), value: project.meta?.title ?? project.title },
    { label: t('lokalizacja'), value: project.meta?.location ?? project.location },
    { label: t('powierzchnia'), value: project.area },
    { label: t('rok'), value: String(project.year) },
    { label: t('zakres'), value: project.scope.join(', ') },
    ...(project.meta?.collaboration
      ? [{ label: t('wspolpraca'), value: project.meta.collaboration }]
      : []),
    ...(project.meta?.visualizations
      ? [{ label: t('wizualizacje'), value: project.meta.visualizations }]
      : []),
    ...(project.photoCredit
      ? [{ label: t('zdjecia'), value: project.photoCredit }]
      : []),
  ];

  return (
    <div className="w-full py-10 md:py-14">
      {rows.map((row, index) => (
        <div key={index}>
          {/* Hairline: 1px scaled to half — iOS Safari paints a raw 0.5px
              div across two device-pixel rows, which reads as doubled */}
          {index > 0 && (
            <div className="w-full bg-dark h-px origin-top [transform:scaleY(0.5)]" />
          )}
          <div className="flex items-baseline py-2.5 gap-8 px-5 md:px-10 lg:px-12">
            <span className="text-[12px] md:text-[13px] font-[600] uppercase tracking-[0.15em] text-dark w-[180px] shrink-0">
              {row.label}
            </span>
            <span className="text-[14px] md:text-[15px] font-[400] text-dark">
              {row.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
