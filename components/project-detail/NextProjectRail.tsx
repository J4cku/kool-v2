'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { useMotionValueEvent, type MotionValue } from 'framer-motion';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  clampRailIndex,
  getRailFrame,
  type ProjectSuccessor,
} from '@/lib/portfolio-motion';

type NextProjectRailProps = {
  projects: ProjectSuccessor[];
  railPosition: MotionValue<number>;
  staticMode: boolean;
  onSelectIndex: (index: number) => void;
};

const emptyFrame = {
  currentIndex: 0,
  nextIndex: 0,
  activeIndex: 0,
  progress: 0,
};

export default function NextProjectRail({
  projects,
  railPosition,
  staticMode,
  onSelectIndex,
}: NextProjectRailProps) {
  const t = useTranslations('projectDetail');
  const tProjects = useTranslations('projects');
  const [railFrame, setRailFrame] = useState(() =>
    projects.length > 0
      ? getRailFrame(railPosition.get(), projects.length)
      : emptyFrame,
  );
  const activeIndexRef = useRef(railFrame.activeIndex);

  const syncRailFrame = useCallback((position: number) => {
    if (projects.length === 0) return;

    const nextFrame = getRailFrame(position, projects.length);
    if (activeIndexRef.current === nextFrame.activeIndex) return;

    activeIndexRef.current = nextFrame.activeIndex;
    setRailFrame(nextFrame);
  }, [projects.length]);

  useEffect(() => {
    if (projects.length === 0) return;

    const frame = window.requestAnimationFrame(() => {
      syncRailFrame(railPosition.get());
    });

    return () => window.cancelAnimationFrame(frame);
  }, [projects, railPosition, syncRailFrame]);

  useMotionValueEvent(railPosition, 'change', (position) => {
    syncRailFrame(position);
  });

  if (projects.length === 0) return null;

  const activeIndex = staticMode
    ? 0
    : Math.min(railFrame.activeIndex, projects.length - 1);
  const activeProject = projects[activeIndex];
  const hasMultipleProjects = !staticMode && projects.length > 1;
  const previousDisabled = activeIndex === 0;
  const nextDisabled = activeIndex === projects.length - 1;

  const selectRelativeProject = (delta: number) => {
    const nextIndex = clampRailIndex(activeIndex, delta, projects.length);
    if (nextIndex !== activeIndex) onSelectIndex(nextIndex);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    let delta = 0;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') delta = -1;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') delta = 1;
    if (delta === 0) return;

    event.preventDefault();
    selectRelativeProject(delta);
  };

  return (
    <section
      className="relative flex min-h-[100svh] w-full shrink-0 flex-col overflow-hidden bg-dark text-beige min-[992px]:h-screen min-[992px]:min-h-0 min-[992px]:w-screen"
      aria-label={t('nextProjectHeading')}
      onKeyDown={handleKeyDown}
    >
      <Link
        href={`/projekty/${activeProject.slug}`}
        className="group grid min-h-0 flex-1 grid-rows-[58svh_1fr] outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-coral min-[992px]:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.55fr)] min-[992px]:grid-rows-1"
        aria-label={`${t('viewProject')}: ${activeProject.title}, ${activeProject.location}`}
      >
        <div className="relative min-h-0 overflow-hidden bg-dark">
          <Image
            src={activeProject.thumbnail}
            alt=""
            fill
            sizes="(max-width: 991px) 100vw, 72vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.015] motion-reduce:transition-none"
          />
        </div>

        <div className="flex min-h-0 flex-col justify-between border-t border-dark/15 bg-beige p-5 text-dark min-[992px]:border-l min-[992px]:border-t-0 min-[992px]:p-8">
          <div>
            <p className="text-[10px] font-[700] uppercase tracking-[0.16em] text-coral">
              {t('nextProjectHeading')}
            </p>
            <h2 className="mt-4 text-[clamp(2rem,4vw,4.75rem)] font-[800] uppercase leading-[0.88] tracking-[-0.055em]">
              {activeProject.title}
            </h2>
            <p className="mt-3 text-[12px] font-[500] uppercase tracking-[0.1em] text-dark/65">
              {activeProject.location}
            </p>
          </div>

          <div className="mt-8 border-t border-dark/15 pt-4">
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[10px] uppercase tracking-[0.1em]">
              <div>
                <dt className="text-dark/50">{t('category')}</dt>
                <dd className="mt-1 font-[700]">{tProjects(activeProject.category)}</dd>
              </div>
              <div>
                <dt className="text-dark/50">{t('rok')}</dt>
                <dd className="mt-1 font-[700] tabular-nums">{activeProject.year}</dd>
              </div>
            </dl>
            <div className="mt-6 flex items-end justify-between gap-4">
              <span className="text-[11px] font-[700] uppercase tracking-[0.12em] text-coral">
                {t('viewProject')} ↗
              </span>
              <span className="text-[10px] font-[600] tabular-nums text-dark/55">
                {String(activeIndex + 1).padStart(2, '0')} /{' '}
                {String(projects.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </Link>

      {hasMultipleProjects && (
        <div className="absolute bottom-14 left-4 z-10 flex gap-2 min-[992px]:bottom-16 min-[992px]:left-6">
          <button
            type="button"
            aria-disabled={previousDisabled}
            onClick={() => selectRelativeProject(-1)}
            className={`inline-flex min-h-11 items-center border border-beige/60 bg-dark/70 px-4 text-[10px] font-[700] uppercase tracking-[0.12em] text-beige backdrop-blur-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral motion-reduce:transition-none ${
              previousDisabled
                ? 'cursor-not-allowed opacity-35'
                : 'hover:bg-beige hover:text-dark'
            }`}
          >
            ← {t('previousProject')}
          </button>
          <button
            type="button"
            aria-disabled={nextDisabled}
            onClick={() => selectRelativeProject(1)}
            className={`inline-flex min-h-11 items-center border border-beige/60 bg-dark/70 px-4 text-[10px] font-[700] uppercase tracking-[0.12em] text-beige backdrop-blur-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coral motion-reduce:transition-none ${
              nextDisabled
                ? 'cursor-not-allowed opacity-35'
                : 'hover:bg-beige hover:text-dark'
            }`}
          >
            {t('nextProject')} →
          </button>
        </div>
      )}
    </section>
  );
}
