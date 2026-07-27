import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import type { Project } from '@/data/projects';

interface WorksGridProps {
  works: Project[];
  /** Per-slug blurb override; falls back to the localized project.description. */
  blurbs?: Record<string, string>;
  workLinkLabel: string;
  portfolioLabel: string;
  portfolioHref: string;
}

/* Selected-works card grid + the "see the whole portfolio" link. Shared by the
   commercial and residential offer subpages so both render the cards identically. */
export default function WorksGrid({
  works,
  blurbs,
  workLinkLabel,
  portfolioLabel,
  portfolioHref,
}: WorksGridProps) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-x-6 lg:gap-x-8 gap-y-12 items-stretch">
        {works.map((project) => (
          <div key={project.slug} className="flex flex-col">
            <Link href={`/projekty/${project.slug}`} className="block group">
              <div className="relative aspect-square overflow-hidden">
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-[600ms] group-hover:scale-[1.04]"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                />
              </div>
            </Link>
            <p className="mt-4 text-[14px] md:text-[15px] font-[700] uppercase leading-[1.15] tracking-[-0.02em] text-dark">
              {project.title} / {project.location}
            </p>
            <p className="mt-1.5 text-[10px] md:text-[11px] font-[500] uppercase tracking-[0.08em] text-muted">
              {project.area} · {project.year}
            </p>
            <p
              className="mt-3 text-dark/80 font-[400] leading-[1.5]"
              style={{ fontSize: 'clamp(14px, 1.2vw, 16px)' }}
            >
              {blurbs?.[project.slug] ?? project.description}
            </p>
            <Link
              href={`/projekty/${project.slug}`}
              className="mt-auto pt-4 text-coral font-[700] uppercase text-[12px] md:text-[13px] tracking-[0.06em] hover:opacity-60 transition-opacity"
            >
              {workLinkLabel} <span aria-hidden="true">→</span>
            </Link>
          </div>
        ))}
      </div>
      <Link
        href={portfolioHref as '/projekty'}
        className="mt-8 md:mt-10 inline-flex items-center gap-3 md:gap-4 text-coral font-[600] uppercase hover:opacity-60 transition-opacity"
        style={{ fontSize: 'clamp(15px, 1.6vw, 22px)' }}
      >
        {portfolioLabel} <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}
